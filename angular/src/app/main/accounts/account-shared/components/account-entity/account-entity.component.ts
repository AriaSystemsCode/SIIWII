import { Component, EventEmitter, Injector, Output } from '@angular/core';
import { Router } from '@angular/router';
import { IAjaxResponse, TokenService } from 'abp-ng2-module';
import { FileUploader } from 'ng2-file-upload';
import { forkJoin, Observable, of } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
  AccountLevelEnum,
  AccountsServiceProxy,
  AppEntityAttachmentDto,
  CreateOrEditAccountInfoDto,
  GetAccountInfoForEditOutput,
  SycAttachmentCategoryDto,
  SycIdentifierDefinitionsServiceProxy
} from '@shared/service-proxies/service-proxies';

import { GenericEntityNode } from '@app/shared/entity-shell/models/generic-entity.model';
import { EntityWindowManagerService } from '@app/shared/entity-shell/services/entity-window-manager.service';
import { BranchGenericComponent } from '@app/select-branch/branch-generic/branch-generic.component';
import { ContactGenericComponent } from '../contact-generic/contact-generic.component';

export type AccountEntityMode = 'create' | 'view' | 'edit';
type AttachmentType = 'LOGO' | 'BANNER' | 'IMAGE';

interface UploadedAttachmentResult {
  attachment: AppEntityAttachmentDto;
  attachmentType: AttachmentType;
  index?: number;
}

const IMAGE_SLOTS = 4;

@Component({
  selector: 'app-account-entity',
  templateUrl: './account-entity.component.html',
  styleUrls: ['./account-entity.component.scss']
})
export class AccountEntityComponent extends AppComponentBase {

  @Output() saved = new EventEmitter<any>();
  @Output() deleted = new EventEmitter<number>();
  @Output() closed = new EventEmitter<void>();
  @Output() minimized = new EventEmitter<number>();

  // ---------- State ----------
  visible = false;
  mode: AccountEntityMode = 'view';
  accountId: number | null = null;
  isLoadingAccount = false;
  saving = false;
  uploadingImages = false;

  accountData: any = null;
  accountDto = new CreateOrEditAccountInfoDto();

  logoAttachmentCategory: SycAttachmentCategoryDto;
  bannerAttachmentCategory: SycAttachmentCategoryDto;
  imageAttachmentCategory: SycAttachmentCategoryDto;

  leftPanelSections: Array<{
    key: string;
    title: string;
    type?: 'tree' | 'list';
    canAdd?: boolean;
    items: GenericEntityNode[];
  }> = [];

  // ---------- Basic info config ----------
  accountTypes = [
    { label: 'Business', value: 19 },
    { label: 'Personal', value: 21 }
  ];

  statuses = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  accountBasicInfoFields = [
    {
      key: 'status', label: 'Status', type: 'dropdown', valuePath: 'account.status',
      options: this.statuses, optionLabel: 'label', optionValue: 'value'
    },
    {
      key: 'accountType', label: 'Account Type', type: 'dropdown', valuePath: 'account.accountTypeId',
      options: this.accountTypes, optionLabel: 'label', optionValue: 'value'
    },
    { key: 'name', label: 'Name', type: 'text', valuePath: 'account.name' },
    { key: 'code', label: 'Code', type: 'text', valuePath: 'account.code' },
    { key: 'ssin', label: 'SSIN', type: 'text', valuePath: 'account.ssin', readonly: true }
  ];

  // ---------- Private ----------
  private accountViewBackup: any = null;
  private loadingAttachmentCategories = false;
  private pendingLogoFile: File | null = null;
  private pendingBackgroundFile: File | null = null;
  private pendingImageFiles: Array<File | null> = this.emptyImageFiles();
  private readonly entityObjectType = 'BUSINESS';

  constructor(
    injector: Injector,
    private _accountsServiceProxy: AccountsServiceProxy,
    private _tokenService: TokenService,
    private _sycIdentifierDefinitionsServiceProxy: SycIdentifierDefinitionsServiceProxy,
    private entityWindowManager: EntityWindowManagerService,
    private router: Router
  ) {
    super(injector);
  }

  // ================= Getters =================

  private get busy(): boolean {
    return this.saving || this.uploadingImages;
  }

  get title(): string {
    if (this.mode === 'create') {
      return this.l('AddManualAccount');
    }
    const account = this.accountData?.account;
    const prefix = this.mode === 'edit' ? 'Edit ' : 'View ';
    const manual = account?.isManual ? ' (Manual Account)' : '';
    return `${prefix}${account?.name ?? ''}${manual}`;
  }

  get breadcrumbItems(): any[] {
    const account = this.accountData?.account;
    if (!account?.name) {
      return [];
    }
    return [
      { label: this.l('MyConnections'), isBrowsePage: true },
      { label: account.name, entityType: 'ACCOUNT', entityId: account.id }
    ];
  }

  // ================= Open (public API) =================

  createManual(): void {
    if (this.busy) {
      return;
    }

    this.resetState();
    this.loadAttachmentCategories();
    this.mode = 'create';
    this.accountDto = this.createEmptyDto();
    this.buildAccountData();
    this.visible = true;
    this.setManualCode();
  }

  view(accountId: number): void {
    if (!accountId || this.isLoadingAccount) {
      return;
    }

    this.loadAttachmentCategories();
    this.accountId = Number(accountId);
    this.mode = 'view';

    if (this.accountData?.account?.id === this.accountId) {
      this.accountViewBackup = this.cloneValue(this.accountData);
      this.visible = true;
      return;
    }
    this.loadForView(this.accountId);
  }

  edit(accountId: number): void {
    if (!accountId || this.saving) {
      return;
    }

    this.resetState();
    this.loadAttachmentCategories();
    this.accountId = Number(accountId);
    this.mode = 'edit';
    this.visible = true;
    this.loadForEdit(this.accountId);
  }

  // ================= Load =================

  private loadForView(accountId: number): void {
    this.isLoadingAccount = true;
    this.showMainSpinner();

    this._accountsServiceProxy.getAccountForView(accountId, 5)
      .pipe(finalize(() => {
        this.isLoadingAccount = false;
        this.hideMainSpinner();
      }))
      .subscribe({
        next: result => {
          if (!result?.account) {
            this.visible = false;
            return;
          }
          this.accountData = result;
          this.accountId = result.account.id;
          this.accountViewBackup = this.cloneValue(result);
          this.mode = 'view';
          this.visible = true;
          this.buildLeftPanel();
        },
        error: () => (this.visible = false)
      });
  }

  private loadForEdit(accountId: number): void {
    this.showMainSpinner();

    this._accountsServiceProxy.getAccountForEdit(accountId)
      .pipe(finalize(() => this.hideMainSpinner()))
      .subscribe({
        next: result => {
          this.accountDto = CreateOrEditAccountInfoDto.fromJS(result.accountInfo);
          this.buildAccountData();
          this.mode = 'edit';
          this.visible = true;
        },
        error: () => (this.visible = false)
      });
  }

  /** Switch from view to edit (the Edit button). */
  startEdit(): void {
    if (!this.accountId || this.saving) {
      return;
    }

    this.accountViewBackup = this.cloneValue(this.accountData);
    this.showMainSpinner();

    this._accountsServiceProxy.getAccountForEdit(this.accountId)
      .pipe(finalize(() => this.hideMainSpinner()))
      .subscribe((result: GetAccountInfoForEditOutput) => {
        const editDto = CreateOrEditAccountInfoDto.fromJS(result.accountInfo);
        this.initializeDtoArrays(editDto);

        const oldAccount = this.accountData?.account;
        this.accountData = {
          ...this.accountData,
          entityExtraData: editDto.entityExtraData,
          account: {
            ...oldAccount,
            ...editDto,
            isManual: oldAccount?.isManual,
            isConnected: oldAccount?.isConnected,
            logoUrl: oldAccount?.logoUrl,
            coverUrl: oldAccount?.coverUrl,
            imagesUrls: oldAccount?.imagesUrls
          }
        };
        this.accountDto = editDto;
        this.mode = 'edit';
      });
  }

  // ================= Build data =================

  private createEmptyDto(): CreateOrEditAccountInfoDto {
    const dto = new CreateOrEditAccountInfoDto();
    dto.id = undefined;
    dto.accountId = undefined;
    dto.name = '';
    dto.code = '';
    dto.tradeName = '';
    dto.website = '';
    dto.eMailAddress = '';
    dto.accountTypeId = 19;
    dto.accountType = 'Business';
    dto.accountLevel = AccountLevelEnum.Manual;
    dto.status = true;
    dto.languageId = undefined;
    dto.currencyId = undefined;

    dto.phone1TypeId = undefined;
    dto.phone1Number = '';
    dto.phone1Ex = '';
    dto.phone2TypeId = undefined;
    dto.phone2Number = '';
    dto.phone2Ex = '';
    dto.phone3TypeId = undefined;
    dto.phone3Number = '';
    dto.phone3Ex = '';

    dto.entityAttachments = [];
    dto.entityCategories = [];
    dto.entityClassifications = [];
    dto.entityExtraData = [];
    dto.branches = [];
    dto.contactAddresses = [];
    dto.contactPaymentMethods = [];
    dto.returnId = true;
    dto.useDTOTenant = false;
    return dto;
  }

  private initializeDtoArrays(dto: CreateOrEditAccountInfoDto = this.accountDto): void {
    dto.entityAttachments ??= [];
    dto.entityCategories ??= [];
    dto.entityClassifications ??= [];
    dto.entityExtraData ??= [];
    dto.contactAddresses ??= [];
    dto.contactPaymentMethods ??= [];
    dto.branches ??= [];
  }

  private buildAccountData(): void {
    this.initializeDtoArrays(this.accountDto);
    this.accountData = {
      account: this.accountDto,
      entityExtraData: this.accountDto.entityExtraData,
      connectionsInfo: this.accountData?.connectionsInfo ?? []
    };
  }

  private setManualCode(): void {
    if (this.accountDto.code) {
      return;
    }

    this._sycIdentifierDefinitionsServiceProxy
      .getNextEntityCode(this.entityObjectType, this.appSession.tenantId)
      .subscribe(code => {
        if (!code) {
          return;
        }
        this.accountDto.code = `M${code}`;
        this.accountData = { ...this.accountData, account: this.accountDto };
      });
  }

  // ================= Shell events =================

  onAccountChange(data: any): void {
    if (!data?.account) {
      return;
    }

    this.accountData = data;
    this.accountDto = CreateOrEditAccountInfoDto.fromJS(data.account);
    this.initializeDtoArrays(this.accountDto);
    this.accountDto.entityExtraData = data.entityExtraData ?? this.accountDto.entityExtraData;

    this.accountData.account = this.accountDto;
    this.accountData.entityExtraData = this.accountDto.entityExtraData;
  }

  onDynamicEntitySaved(event: any): void {
    const type = String(event?.node?.entityType ?? '').toUpperCase();
    if (type === 'BRANCH' || type === 'CONTACT') {
      this.reloadTree();
    }
  }

  onBreadcrumbBrowse(): void {
    this.close();
    this.router.navigate(['/app/main/accounts']);
  }

  // ================= Save =================

  save(): void {
    if (this.busy || this.mode === 'view') {
      return;
    }

    this.prepareDto();
    if (!this.isValid()) {
      return;
    }

    this.saving = true;
    this.uploadingImages = this.hasPendingFiles();
    this.showMainSpinner();

    this.uploadPendingFiles().subscribe({
      next: uploaded => {
        this.mergeUploaded(uploaded);
        this.saveDto();
      },
      error: () => {
        this.saving = false;
        this.uploadingImages = false;
        this.hideMainSpinner();
        this.notify.error(this.l('UploadFailed'));
      }
    });
  }

  private saveDto(): void {
    this._accountsServiceProxy.createOrEditAccount(this.accountDto)
      .pipe(finalize(() => {
        this.saving = false;
        this.uploadingImages = false;
        this.hideMainSpinner();
      }))
      .subscribe((result: any) => {
        this.notify.success(this.l('SavedSuccessfully'));

        const savedAccount = result?.accountInfo ?? result?.account ?? result;
        this.clearPendingFiles();
        this.saved.emit(savedAccount);

        const id = this.mode === 'create'
          ? savedAccount?.id ?? savedAccount?.accountId ?? this.accountDto?.id ?? this.accountDto?.accountId
          : this.accountId;

        if (!id) {
          this.visible = false;
          return;
        }
        this.accountId = Number(id);
        this.loadForView(this.accountId);
      });
  }

  private prepareDto(): void {
    if (!this.accountData?.account) {
      return;
    }

    this.accountDto = CreateOrEditAccountInfoDto.fromJS(this.accountData.account);
    this.initializeDtoArrays(this.accountDto);

    const isCreate = this.mode === 'create';
    const entityId = isCreate ? 0 : (this.accountDto.id ?? this.accountId ?? 0);

    this.accountDto.entityExtraData.forEach((item: any) => {
      item.entityid ??= entityId;

      if (Array.isArray(item.attributeValue)) {
        item.attributeValue = item.attributeValue
          .map(value => typeof value === 'object' ? (value?.value ?? value?.label ?? '') : value)
          .filter(Boolean)
          .join('-');
      }
    });

    if (isCreate) {
      this.accountDto.id = undefined;
      this.accountDto.accountId = undefined;
    } else if (this.accountId) {
      this.accountDto.id ??= this.accountId;
    }

    this.accountDto.returnId = true;
    this.accountData.account = this.accountDto;
  }

  private isValid(): boolean {
    if (!this.accountDto.name?.trim()) {
      this.notify.warn(this.l('NameIsRequired'));
      return false;
    }
    if (!this.accountDto.accountTypeId) {
      this.notify.warn(this.l('AccountTypeIsRequired'));
      return false;
    }
    return true;
  }

  // ================= Cancel / close / delete / minimize =================

  cancel(): void {
    if (this.busy) {
      return;
    }

    // Nothing to go back to (create mode, or opened directly in edit mode).
    if (this.mode === 'create' || !this.accountViewBackup) {
      this.close();
      return;
    }

    this.accountData = this.cloneValue(this.accountViewBackup);
    this.mode = 'view';
    this.clearPendingFiles();
    this.buildLeftPanel();
  }

  close(): void {
    if (this.busy) {
      return;
    }

    this.visible = false;
    this.closed.emit();
    this.resetState(false);
  }

  confirmDelete(): void {
    const id = this.accountData?.account?.id;
    if (!id) {
      return;
    }

    this.askToConfirm('AreYouSureYouWantToDeleteThisAccount?', 'AreYouSure')
      .subscribe(confirmed => {
        if (!confirmed) {
          return;
        }

        this.showMainSpinner();
        this._accountsServiceProxy.delete(id)
          .pipe(finalize(() => this.hideMainSpinner()))
          .subscribe(() => {
            this.notify.success(this.l('SuccessfullyDeleted'));
            this.deleted.emit(id);
            this.close();
          });
      });
  }

  minimizeAccount(): void {
    const account = this.accountData?.account;
    if (!account?.id) {
      return;
    }

    this.entityWindowManager.minimize({
      entityType: 'Account',
      entityId: account.id,
      title: account.name || `Account #${account.id}`,
      entity: this.accountData
    });
    this.visible = false;
    this.minimized.emit(account.id);
  }

  // ================= Image events from the shell =================

  onLogoChange(event: any): void {
    this.pendingLogoFile = this.fileOf(event);
  }

  onBackgroundChange(event: any): void {
    this.pendingBackgroundFile = this.fileOf(event);
  }

  onImageChange(event: any): void {
    const index = Number(event?.index);
    if (!this.isValidIndex(index)) {
      return;
    }
    this.pendingImageFiles[index] = this.fileOf(event);
    this.pendingImageFiles = [...this.pendingImageFiles];
  }

  onAttachmentRemove(event: any): void {
    const account = this.accountData?.account;
    if (!account) {
      return;
    }

    account.entityAttachments ??= [];
    const type: AttachmentType = event?.attachmentType;

    if (type === 'LOGO' || type === 'BANNER') {
      const categoryId = this.categoryIdOf(type);

      if (type === 'LOGO') {
        this.pendingLogoFile = null;
        account.logoUrl = null;
      } else {
        this.pendingBackgroundFile = null;
        account.coverUrl = null;
      }

      if (categoryId) {
        account.entityAttachments = account.entityAttachments
          .filter(item => !this.isCategory(item, categoryId));
      }
    }

    if (type === 'IMAGE') {
      const index = Number(event?.index);
      const attachment = event?.attachment;

      if (this.isValidIndex(index)) {
        this.pendingImageFiles[index] = null;
      }

      if (attachment) {
        account.entityAttachments = account.entityAttachments.filter(item =>
          item !== attachment &&
          item?.id !== attachment?.id &&
          item?.guid !== attachment?.guid
        );
      }
    }

    this.accountDto.entityAttachments = account.entityAttachments;
  }

  // ================= Attachments: categories =================

  private loadAttachmentCategories(): void {
    const allLoaded =
      this.logoAttachmentCategory &&
      this.bannerAttachmentCategory &&
      this.imageAttachmentCategory;

    if (this.loadingAttachmentCategories || allLoaded) {
      return;
    }

    this.loadingAttachmentCategories = true;

    this.getSycAttachmentCategoriesByCodes(['LOGO', 'BANNER', 'IMAGE'])
      .pipe(finalize(() => (this.loadingAttachmentCategories = false)))
      .subscribe(result => {
        const categories = result ?? [];
        const byCode = (code: string) => categories.find(item => item.code === code);

        this.logoAttachmentCategory = byCode('LOGO');
        this.bannerAttachmentCategory = byCode('BANNER');
        this.imageAttachmentCategory = byCode('IMAGE');
      });
  }

  private categoryIdOf(type: AttachmentType): number | null {
    const category = {
      LOGO: this.logoAttachmentCategory,
      BANNER: this.bannerAttachmentCategory,
      IMAGE: this.imageAttachmentCategory
    }[type];
    return category?.id ?? null;
  }

  private isCategory(attachment: any, categoryId: number): boolean {
    return Number(attachment?.attachmentCategoryId) === Number(categoryId);
  }

  // ================= Attachments: upload =================

  private hasPendingFiles(): boolean {
    return !!(
      this.pendingLogoFile ||
      this.pendingBackgroundFile ||
      this.pendingImageFiles.some(file => !!file)
    );
  }

  private uploadPendingFiles(): Observable<UploadedAttachmentResult[]> {
    const jobs: Array<{ file: File | null; categoryId: number; type: AttachmentType; index?: number }> = [
      { file: this.pendingLogoFile, categoryId: this.logoAttachmentCategory?.id, type: 'LOGO' },
      { file: this.pendingBackgroundFile, categoryId: this.bannerAttachmentCategory?.id, type: 'BANNER' },
      ...this.pendingImageFiles.map((file, index) => ({
        file, categoryId: this.imageAttachmentCategory?.id, type: 'IMAGE' as AttachmentType, index
      }))
    ];

    const uploads = jobs
      .filter(job => job.file && job.categoryId)
      .map(job => this.uploadFile(job.file, job.categoryId, job.type, job.index));

    return uploads.length ? forkJoin(uploads) : of([]);
  }

  private uploadFile(
    file: File,
    attachmentCategoryId: number,
    attachmentType: AttachmentType,
    index?: number
  ): Observable<UploadedAttachmentResult> {
    return new Observable(observer => {
      const guid = this.createGuid();
      const uploader = this.createAttachmentUploader();

      uploader.onBuildItemForm = (_item, form: FormData) => form.append('guid', guid);

      uploader.onSuccessItem = (_item, response) => {
        try {
          const parsed = JSON.parse(response) as IAjaxResponse;

          if (!parsed?.success) {
            observer.error(parsed?.error ?? new Error('Upload failed'));
            return;
          }

          observer.next({
            attachment: this.createAttachmentDto(file, guid, attachmentCategoryId, parsed.result),
            attachmentType,
            index
          });
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      };

      uploader.onErrorItem = (_item, response, status) => observer.error({ response, status });

      uploader.addToQueue([file]);
      uploader.uploadAll();
    });
  }

  private createAttachmentUploader(): FileUploader {
  const uploader = new FileUploader({
    url: AppConsts.remoteServiceBaseUrl + '/Attachment/UploadFiles',
    authToken: 'Bearer ' + this._tokenService.getToken(),
    removeAfterUpload: true
  });

  uploader.onAfterAddingFile = fileItem => {
    fileItem.withCredentials = false;
  };

  return uploader;
}

  private createAttachmentDto(
    file: File,
    guid: string,
    attachmentCategoryId: number,
    uploadResult: any
  ): AppEntityAttachmentDto {
    const result = uploadResult ?? {};
    const attachment = new AppEntityAttachmentDto();

    attachment.init({
      guid: result.guid ?? guid,
      fileName: result.fileName ?? file.name,
      url: result.url ?? result.fileName ?? file.name,
      attachmentCategoryId
    });
    return attachment;
  }

  /** Puts uploaded files into the DTO, replacing the old logo / banner / image. */
  private mergeUploaded(uploaded: UploadedAttachmentResult[]): void {
    this.accountDto.entityAttachments ??= [];

    uploaded.forEach(({ attachment, attachmentType, index }) => {
      let list = this.accountDto.entityAttachments;

      if (attachmentType !== 'IMAGE') {
        list = list.filter(item => !this.isCategory(item, attachment.attachmentCategoryId));
      } else if (index !== undefined) {
        const replaced = list.filter(item => this.isCategory(item, this.imageAttachmentCategory?.id))[index];
        list = list.filter(item => item !== replaced);
      }

      this.accountDto.entityAttachments = [...list, attachment];
    });

    this.accountData.account = this.accountDto;
  }

  private clearPendingFiles(): void {
    this.pendingLogoFile = null;
    this.pendingBackgroundFile = null;
    this.pendingImageFiles = this.emptyImageFiles();
  }

  // ================= Left panel (tree) =================

  private loadContacts(parentId: number): Observable<any[]> {
    return this._accountsServiceProxy
      .getAllMembers(undefined, parentId, 1, undefined, 0, 100)
      .pipe(map(result => result?.items ?? []));
  }

  private buildLeftPanel(): void {
  const account = this.accountData?.account;
  if (!account?.id) {
    this.leftPanelSections = [];
    return;
  }

  // Only branches that have an id get their contacts loaded.
  const branchRequests: Observable<BranchWithContacts>[] = (account.branches ?? [])
    .filter((branchNode: any) => branchNode?.data?.branch?.id)
    .map((branchNode: any) =>
      this.loadContacts(branchNode.data.branch.id)
        .pipe(map(contacts => ({ branchNode, contacts })))
    );

  const branches$: Observable<BranchWithContacts[]> =
    branchRequests.length ? forkJoin(branchRequests) : of([]);

  forkJoin({
    accountContacts: this.loadContacts(account.id),
    branches: branches$
  }).subscribe(({ accountContacts, branches }) => {

    const branchNodes = branches.map(({ branchNode, contacts }) =>
      this.createBranchNode(account, branchNode, contacts)
    );

    const accountNode: GenericEntityNode = {
      id: account.id,
      label: account.name,
      entityType: 'ACCOUNT',
      icon: 'fa fa-building',
      data: this.accountData,
      component: undefined,
      expanded: true,
      children: [
        this.createAddContactNode(account),
        ...branchNodes,
        ...this.createContactNodes(accountContacts, account.id, account.id, account.tenantId)
      ]
    };

    this.leftPanelSections = [{
      key: 'profile',
      title: this.l('MyProfile'),
      type: 'tree',
      canAdd: true,
      items: [accountNode]
    }];
  });
}
  private createBranchNode(account: any, branchNode: any, contacts: any[]): GenericEntityNode {
    const branch = branchNode.data.branch;

    return {
      id: branch.id,
      label: branch.name || branchNode.label || this.l('Branch'),
      entityType: 'BRANCH',
      icon: 'fa fa-code-branch',
      parentId: account.id,
      component: BranchGenericComponent,
      data: { branch },
      context: {
        accountId: account.id,
        accountName: account.name,
        tenantId: account.tenantId,
        branchId: branch.id,
        branchName: branch.name,
        branchNode
      },
      expanded: false,
      children: [
        this.createAddContactNode(account, branch, branchNode),
        ...this.createContactNodes(contacts, branch.id, account.id, account.tenantId)
      ]
    };
  }

  /** "Add contact" node. Belongs to the branch when one is given, otherwise to the account. */
  private createAddContactNode(account: any, branch?: any, branchNode?: any): GenericEntityNode {
    const parentId = branch?.id ?? account.id;

    return {
      id: branch ? `new-contact-branch-${branch.id}` : `new-contact-account-${account.id}`,
      label: this.l('AddContact'),
      entityType: 'CONTACT',
      icon: 'fa fa-plus',
      parentId,
      component: ContactGenericComponent,
      data: null,
      context: {
        create: true,
        accountId: account.id,
        parentId,
        branchId: branch?.id ?? null,
        tenantId: account.tenantId,
        accountName: account.name,
        ...(branch ? { branchName: branch.name } : {}),
        branchNode: branchNode ?? null
      },
      expanded: false,
      children: []
    };
  }

  private createContactNodes(
    contacts: any[],
    parentId: number,
    accountId: number,
    tenantId?: number
  ): GenericEntityNode[] {
    return (contacts ?? [])
      .filter(contact => !!contact?.id)
      .map(contact => ({
        id: contact.id,
        label:
          [contact.firstName, contact.surName].filter(Boolean).join(' ') ||
          contact.accountName ||
          this.l('Contact'),
        entityType: 'CONTACT',
        icon: 'fa fa-user',
        imageUrl: contact.imageUrl,
        parentId,
        component: ContactGenericComponent,
        data: { contact },
        context: {
          create: false,
          accountId,
          parentId,
          tenantId,
          accountName: contact.accountName
        },
        expanded: false,
        children: []
      } as GenericEntityNode));
  }

  private reloadTree(): void {
    if (!this.accountId) {
      return;
    }

    this._accountsServiceProxy.getAccountForView(this.accountId, 5)
      .subscribe(result => {
        this.accountData = result;
        this.buildLeftPanel();
      });
  }

  // ================= Helpers =================

  private resetState(resetVisible = true): void {
    if (resetVisible) {
      this.visible = false;
    }

    this.accountId = null;
    this.mode = 'view';
    this.accountData = null;
    this.accountDto = new CreateOrEditAccountInfoDto();
    this.accountViewBackup = null;
    this.leftPanelSections = [];
    this.clearPendingFiles();
    this.uploadingImages = false;
    this.saving = false;
    this.isLoadingAccount = false;
  }

  private emptyImageFiles(): Array<File | null> {
    return Array.from({ length: IMAGE_SLOTS }, () => null);
  }

  private isValidIndex(index: number): boolean {
    return Number.isInteger(index) && index >= 0 && index < IMAGE_SLOTS;
  }

  private fileOf(event: any): File | null {
    return event?.file instanceof File ? event.file : null;
  }

  private cloneValue(value: any): any {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  private createGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
      const random = (Math.random() * 16) | 0;
      return (char === 'x' ? random : (random & 0x3) | 0x8).toString(16);
    });
  }
}

interface BranchWithContacts {
  branchNode: any;
  contacts: any[];
}