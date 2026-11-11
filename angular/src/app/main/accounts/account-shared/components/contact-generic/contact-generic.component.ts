import { Component, EventEmitter, Injector, Output } from '@angular/core';
import { IAjaxResponse, TokenService } from 'abp-ng2-module';
import { FileUploader } from 'ng2-file-upload';
import { forkJoin, Observable, of } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';

import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
  AccountsServiceProxy,
  AppEntityAttachmentDto,
  AppEntityExtraDataDto,
  CreateOrEditAccountInfoDto,
  SycAttachmentCategoryDto,
  SycIdentifierDefinitionsServiceProxy
} from '@shared/service-proxies/service-proxies';

import {
  EntityBasicInfoField,
  EntityMode,
  GenericEntityEditor,
  GenericEntityNode
} from '@app/shared/entity-shell/models/generic-entity.model';

type MediaType = 'LOGO' | 'BANNER';

interface PendingMedia {
  file: File;
  categoryId: number;
  type: MediaType;
}

interface UploadedMedia {
  type: MediaType;
  attachment: AppEntityAttachmentDto;
}

const PERSONAL_ACCOUNT_TYPE_ID = 21;

@Component({
  selector: 'app-contact-generic',
  templateUrl: './contact-generic.component.html',
  styleUrls: ['./contact-generic.component.scss']
})
export class ContactGenericComponent extends AppComponentBase implements GenericEntityEditor {

  // ---------- Used by the shell ----------
  node: GenericEntityNode;
  mode: EntityMode = 'view';
  entity: any = null;
  entityData: any = null;

  loading = false;
  saving = false;
  showMedia = true;
  showAdditionalImages = false;

  logoAttachmentCategory: SycAttachmentCategoryDto;
  bannerAttachmentCategory: SycAttachmentCategoryDto;

  @Output() entityChange = new EventEmitter<any>();
  @Output() saved = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  basicInfoFields: EntityBasicInfoField[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'dropdown',
      valuePath: 'account.status',
      options: [
        { label: 'Active', value: true },
        { label: 'Inactive', value: false }
      ],
      optionLabel: 'label',
      optionValue: 'value',
      editableInCreate: true,
      editableInEdit: true
    },
    {
      key: 'accountType',
      label: 'Account Type',
      type: 'dropdown',
      valuePath: 'account.accountTypeId',
      options: [{ label: 'Personal', value: PERSONAL_ACCOUNT_TYPE_ID }],
      optionLabel: 'label',
      optionValue: 'value',
      readonly: true
    },
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      valuePath: 'account.name',
      editableInCreate: true,
      editableInEdit: true
    },
    {
      key: 'code',
      label: 'Code',
      type: 'text',
      valuePath: 'account.code',
      editableInCreate: true,
      editableInEdit: false
    },
    {
      key: 'ssin',
      label: 'SSIN',
      type: 'text',
      valuePath: 'account.ssin',
      readonly: true
    }
  ];

  // ---------- Private ----------
  private backup: any = null;
  private pendingLogoFile: File | null = null;
  private pendingCoverFile: File | null = null;
  private readonly entityObjectType = 'PERSONAL';

  constructor(
    injector: Injector,
    private _accountsServiceProxy: AccountsServiceProxy,
    private _identifierService: SycIdentifierDefinitionsServiceProxy,
    private _tokenService: TokenService
  ) {
    super(injector);
  }

  // ================= Load =================

  loadEntity(): void {
    if (this.node?.context?.create) {
      this.initializeCreate();
      return;
    }

    const id = Number(this.node?.id);
    if (!id) {
      return;
    }

    this.loading = true;

    this._accountsServiceProxy.getAppContactForView(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((result: any) => {
        this.entity = result?.contact ?? result?.account ?? result;
        this.entity.entityAttachments ??= [];
        this.entity.imagesUrls ??= [];

        this.entityData = {
          account: this.entity,
          contact: this.entity,
          entityExtraData: result?.entityExtraData ?? this.entity.entityExtraData ?? []
        };

        if (this.node) {
          this.node.data = this.entityData;
        }

        this.entityChange.emit(this.entityData);
        this.mode = 'view';
      });
  }

  private initializeCreate(): void {
    const context = this.node?.context ?? {};

    const entity: any = {
      accountTypeId: PERSONAL_ACCOUNT_TYPE_ID,
      name: '',
      code: '',
      notes: '',
      eMailAddress: '',
      currencyId: context.currencyId ?? null,
      languageId: context.languageId ?? null,
      accountId: Number(context.accountId),
      parentId: Number(context.parentId),
      useDTOTenant: true,
      entityAttachments: [],
      entityExtraData: [],
      branches: [],
      logoUrl: null,
      coverUrl: null
    };

    [1, 2, 3].forEach(n => {
      entity[`phone${n}TypeId`] = null;
      entity[`phone${n}Number`] = '';
      entity[`phone${n}Ex`] = '';
    });

    this.entity = entity;
    this.entityData = {
      account: this.entity,
      contact: this.entity,
      entityExtraData: this.entity.entityExtraData
    };

    this.mode = 'create';
    this.clearPendingFiles();
    this.loadNextCode();
  }

  private loadNextCode(): void {
    this._identifierService
      .getNextEntityCode(this.entityObjectType, this.appSession.tenantId)
      .subscribe(code => (this.entity.code = `C${code}`));
  }

  // ================= Edit / cancel =================

  editEntity(): void {
    if (!this.entity) {
      return;
    }
    this.backup = this.cloneEntity(this.entity);
    this.mode = 'edit';
  }

  cancelEntity(): void {
    if (this.backup) {
      this.entity = this.cloneEntity(this.backup);
      this.entityData = { ...this.entityData, account: this.entity, contact: this.entity };
    }

    this.clearPendingFiles();
    this.mode = 'view';
    this.cancelled.emit();
  }

  // ================= Media events from the shell =================

  onLogoChange(event: any): void {
    this.pendingLogoFile = event?.file instanceof File ? event.file : null;
  }

  onBackgroundChange(event: any): void {
    this.pendingCoverFile = event?.file instanceof File ? event.file : null;
  }

  onAttachmentRemove(event: any): void {
    const type = String(event?.attachmentType ?? '').toUpperCase();
    let category: SycAttachmentCategoryDto;

    if (type === 'LOGO') {
      this.pendingLogoFile = null;
      this.entity.logoUrl = null;
      category = this.logoAttachmentCategory;
    } else if (type === 'BANNER') {
      this.pendingCoverFile = null;
      this.entity.coverUrl = null;
      category = this.bannerAttachmentCategory;
    } else {
      return;
    }

    const categoryId = Number(category?.id);
    if (!categoryId) {
      return;
    }

    this.entity.entityAttachments = (this.entity.entityAttachments ?? [])
      .filter(item => Number(item.attachmentCategoryId) !== categoryId);
  }

  // ================= Save =================

  saveEntity(): void {
    if (this.saving || !this.entity) {
      return;
    }

    if (!this.entity.name?.trim()) {
      this.notify.warn(this.l('NameIsRequired'));
      return;
    }
    if (!this.entity.code?.trim()) {
      this.notify.warn(this.l('CodeIsRequired'));
      return;
    }

    this.saving = true;

    this.uploadMedia()
      .pipe(
        switchMap(uploaded => {
          this.mergeUploadedMedia(uploaded);
          return this._accountsServiceProxy.createOrUpdateContact(this.buildPayload());
        }),
        finalize(() => (this.saving = false))
      )
      .subscribe((result: any) => {
        this.notify.success(this.l('SavedSuccessfully'));
        this.clearPendingFiles();

        const savedContact = result?.contact ?? result?.account ?? result;
        const id = Number(savedContact?.id ?? result?.id);

        this.mode = 'view';

        if (id) {
          this.node.id = id;
          if (this.node.context) {
            this.node.context.create = false;
          }
        }

        this.saved.emit({ result, contact: savedContact, id });

        if (id) {
          this.loadEntity();
        }
      });
  }

  private buildPayload(): CreateOrEditAccountInfoDto {
    const source = this.entity;
    const context = this.node?.context ?? {};
    const isCreate = this.mode === 'create';

    const dto = new CreateOrEditAccountInfoDto();
    dto.name = source.name?.trim();
    dto.code = source.code?.trim();
    dto.notes = source.notes ?? '';
    dto.eMailAddress = source.eMailAddress ?? '';
    dto.currencyId = source.currencyId ?? context.currencyId ?? null;
    dto.languageId = source.languageId ?? context.languageId ?? null;
    dto.accountId = source.accountId ?? context.accountId;
    dto.parentId = source.parentId ?? context.parentId;
    dto.useDTOTenant = true;
    dto.entityAttachments = source.entityAttachments ?? [];

    [1, 2, 3].forEach(n => {
      (dto as any)[`phone${n}TypeId`] = source[`phone${n}TypeId`] ?? null;
      (dto as any)[`phone${n}Number`] = source[`phone${n}Number`] ?? '';
      (dto as any)[`phone${n}Ex`] = source[`phone${n}Ex`] ?? '';
    });

    dto.entityExtraData = (this.entityData?.entityExtraData ?? source.entityExtraData ?? [])
      .filter(item => this.hasExtraDataValue(item))
      .map(item => {
        const extra = new AppEntityExtraDataDto();
        extra.attributeId = item.attributeId;
        extra.attributeValue = item.attributeValue ?? undefined;
        extra.attributeValueId = item.attributeValueId ?? undefined;
        return extra;
      });

    dto.branches = isCreate && context.branchNode
      ? [context.branchNode]
      : source.branches ?? [];

    if (!isCreate) {
      dto.id = source.id;
      dto.entityId = source.entityId;
      dto.ssin = source.ssin;
    }

    return dto;
  }

  /** False for rows that are empty or hold the default "off" value, so they are not saved. */
  private hasExtraDataValue(item: any): boolean {
    // Lookup values are always kept.
    if (item.attributeValueId != null) {
      return true;
    }

    const value = item.attributeValue;
    if (value === null || value === undefined || value === '') {
      return false;
    }

    const JOIN_DATE_ID = 707;
    const USER_ID_ID = 715;

    if (item.attributeId === JOIN_DATE_ID && value === '0') {
      return false;
    }
    if (item.attributeId === USER_ID_ID && (value === 'false' || value === '0')) {
      return false;
    }
    return true;
  }

  // ================= Media upload =================

  private uploadMedia(): Observable<UploadedMedia[]> {
    const jobs: Array<{ file: File | null; category: SycAttachmentCategoryDto; type: MediaType }> = [
      { file: this.pendingLogoFile, category: this.logoAttachmentCategory, type: 'LOGO' },
      { file: this.pendingCoverFile, category: this.bannerAttachmentCategory, type: 'BANNER' }
    ];

    const uploads = jobs
      .filter(job => job.file && job.category?.id)
      .map(job => this.uploadFile({ file: job.file, categoryId: job.category.id, type: job.type }));

    return uploads.length ? forkJoin(uploads) : of([]);
  }

  private uploadFile(pending: PendingMedia): Observable<UploadedMedia> {
    return new Observable(observer => {
      const guid = this.guid();

      const uploader = new FileUploader({
        url: AppConsts.remoteServiceBaseUrl + '/Attachment/UploadFiles',
        authToken: 'Bearer ' + this._tokenService.getToken(),
        removeAfterUpload: true
      });

      uploader.onAfterAddingFile = item => {
        item.withCredentials = false;
      };

      uploader.onBuildItemForm = (_item, form: FormData) => form.append('guid', guid);

      uploader.onSuccessItem = (_item, response) => {
        try {
          const parsed: IAjaxResponse = typeof response === 'string' ? JSON.parse(response) : response;

          if (!parsed?.success) {
            observer.error(parsed?.error);
            return;
          }

          const result: any = parsed.result ?? {};
          const attachment = new AppEntityAttachmentDto();
          attachment.init({
            guid: result.guid ?? guid,
            fileName: result.fileName ?? pending.file.name,
            url: result.url ?? result.fileName,
            attachmentCategoryId: pending.categoryId
          });

          observer.next({ type: pending.type, attachment });
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      };

      uploader.onErrorItem = (_item, response, status) => observer.error({ response, status });

      uploader.addToQueue([pending.file]);
      uploader.uploadAll();
    });
  }

  /** Puts uploaded files into the entity, replacing the old file of the same category. */
  private mergeUploadedMedia(uploaded: UploadedMedia[]): void {
    this.entity.entityAttachments ??= [];

    uploaded.forEach(({ type, attachment }) => {
      const categoryId = Number(attachment.attachmentCategoryId);

      this.entity.entityAttachments = [
        ...this.entity.entityAttachments.filter(
          item => Number(item.attachmentCategoryId) !== categoryId
        ),
        attachment
      ];

      if (type === 'LOGO') {
        this.entity.logoUrl = attachment.url;
      } else {
        this.entity.coverUrl = attachment.url;
      }
    });
  }

  // ================= Helpers =================

  private clearPendingFiles(): void {
    this.pendingLogoFile = null;
    this.pendingCoverFile = null;
  }

  private cloneEntity(value: any): any {
    return JSON.parse(JSON.stringify(value));
  }
}