import {
  Component,
  EventEmitter,
  Injector,
  Output,
  ViewChild
} from '@angular/core';

import {
  AccountLevelEnum,
  AccountsServiceProxy,
  AppEntityAttachmentDto,
  CreateOrEditAccountInfoDto,
  GetAccountForViewDto,
  GetAccountInfoForEditOutput,
  SycAttachmentCategoryDto,
  SycIdentifierDefinitionsServiceProxy
} from '@shared/service-proxies/service-proxies';

import {
  IAjaxResponse,
  TokenService
} from 'abp-ng2-module';

import {
  FileUploader,
  FileUploaderOptions
} from 'ng2-file-upload';

import {
  forkJoin,
  Observable,
  of
} from 'rxjs';

import {
  finalize,
  map
} from 'rxjs/operators';

import {
  AppComponentBase
} from '@shared/common/app-component-base';

import {
  GenericEntityNode
} from '@app/shared/entity-shell/models/generic-entity.model';

import {
  EntityWindowManagerService
} from '@app/shared/entity-shell/services/entity-window-manager.service';

import {
  BranchGenericComponent
} from '@app/select-branch/branch-generic/branch-generic.component';

import {
  ContactGenericComponent
} from '../contact-generic/contact-generic.component';

import {
  AccountSectionsComponent
} from '../account-sections/account-sections.component';
import { AppConsts } from '@shared/AppConsts';


export type AccountEntityMode =
  'create' |
  'view' |
  'edit';


interface UploadedAttachmentResult {

  attachment:
  AppEntityAttachmentDto;

  attachmentType:
  'LOGO' |
  'BANNER' |
  'IMAGE';

  index?: number;
}


@Component({
  selector: 'app-account-entity',
  templateUrl: './account-entity.component.html',
  styleUrls: ['./account-entity.component.scss']
})
export class AccountEntityComponent
  extends AppComponentBase {

  @Output() saved = new EventEmitter<any>();
  @Output() deleted = new EventEmitter<number>();
  @Output() closed = new EventEmitter<void>();
  @Output() minimized = new EventEmitter<number>();

  @ViewChild(AccountSectionsComponent) accountSectionsComponent: AccountSectionsComponent;

  visible = false;
  mode: AccountEntityMode = 'view';
  accountId: number | null = null;
  isLoadingAccount = false;
  saving = false;
  uploadingImages = false;


  accountData: GetAccountForViewDto | any = null;
  accountDto = new CreateOrEditAccountInfoDto();
  private originalAccountDto: any = null;
  private accountViewBackup: any = null;

  // ============================================================
  // GENERIC SHELL
  // ============================================================

  accountTypes = [
    {
      label: 'Business',
      value: 19
    },

    {
      label: 'Personal',
      value: 21
    }
  ];


  statuses = [
    {
      label: 'Active',
      value: true
    },

    {
      label: 'Inactive',
      value: false
    }
  ];


  accountBasicInfoFields = [

    {
      key: 'status',
      label: 'Status',
      type: 'dropdown',
      valuePath: 'account.status',
      options: this.statuses,
      optionLabel: 'label',
      optionValue: 'value'
    },

    {
      key: 'accountType',
      label: 'Account Type',
      type: 'dropdown',
      valuePath:
        'account.accountTypeId',
      options:
        this.accountTypes,
      optionLabel:
        'label',
      optionValue:
        'value'
    },

    {
      key: 'name',
      label: 'Name',
      type: 'text',
      valuePath:
        'account.name'
    },

    {
      key: 'code',
      label: 'Code',
      type: 'text',
      valuePath:
        'account.code'
    },

    {
      key: 'ssin',
      label: 'SSIN',
      type: 'text',
      valuePath:
        'account.ssin',
      readonly: true
    }

  ];


  // ============================================================
  // LEFT PANEL
  // ============================================================

  leftPanelSections:
    Array<{
      key: string;
      title: string;
      type?: 'tree' | 'list';
      canAdd?: boolean;
      items: GenericEntityNode[];
    }> =
    [];

  logoAttachmentCategory: SycAttachmentCategoryDto;
  bannerAttachmentCategory: SycAttachmentCategoryDto;
  imageAttachmentCategory: SycAttachmentCategoryDto;
  loadingAttachmentCategories = false;

  private pendingLogoFile: File | null = null;
  private pendingBackgroundFile: File | null = null;
  private pendingImageFiles:
    Array<File | null> = [
      null,
      null,
      null,
      null
    ];

  private entityObjectType = 'BUSINESS';


  constructor(
    injector: Injector,
    private _accountsServiceProxy: AccountsServiceProxy,
    private _tokenService: TokenService,
    private _sycIdentifierDefinitionsServiceProxy: SycIdentifierDefinitionsServiceProxy,
    private entityWindowManager: EntityWindowManagerService
  ) {

    super(injector);
  }

  createManual(): void {

    if (
      this.saving ||
      this.uploadingImages
    ) {
      return;
    }

    this.resetState();
    this.loadAttachmentCategories();
    this.accountId = null;
    this.mode = 'create';
    this.accountDto = this.createEmptyAccountDto();
    this.buildAccountData();


    this.originalAccountDto =
      this.cloneValue(
        this.accountDto.toJSON()
      );


    this.clearPendingFiles();
    this.visible = true;
    this.setManualAccCode();
  }

  view(
    accountId: number
  ): void {

    if (
      !accountId ||
      this.isLoadingAccount
    ) {
      return;
    }


    this.loadAttachmentCategories();
    this.accountId = Number(accountId);
    this.mode = 'view';

    if (
      this.accountData
        ?.account
        ?.id ===
      this.accountId
    ) {

      this.accountViewBackup = this.cloneValue(this.accountData);
      this.visible = true;
      return;
    }
    this.loadAccountForView(this.accountId);
  }

  edit(
    accountId: number
  ): void {

    if (
      !accountId ||
      this.saving
    ) {
      return;
    }


    this.resetState();
    this.loadAttachmentCategories();
    this.accountId = Number(accountId);
    this.mode = 'edit';
    this.visible = true;
    this.loadAccountForEdit(this.accountId);
  }

  get title(): string {
    const name =
      this.accountData
        ?.account
        ?.name ??
      '';


    if (this.mode === 'create') {
      return this.l('AddManualAccount');
    }
    const prefix = this.mode === 'edit' ? 'Edit ' : 'View ';

    const manual =
      this.accountData
        ?.account
        ?.isManual
        ? ' (Manual Account)'
        : '';


    return (
      prefix +
      name +
      manual
    );
  }


  get breadcrumbItems():
    any[] {

    const name =
      this.accountData
        ?.account
        ?.name;


    if (!name) {
      return [];
    }


    return [
      {
        label: name
      }
    ];
  }


  private loadAccountForView(accountId: number): void {
    this.isLoadingAccount = true;
    this.showMainSpinner();


    this._accountsServiceProxy.getAccountForView(accountId, 5)
      .pipe(finalize(() => {
        this.isLoadingAccount = false;
        this.hideMainSpinner();
      })
      )
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
          this.buildAccountLeftPanel();
        },
        error: () => {
          this.visible = false;
        }

      });
  }

  enableEditMode(): void {

    if (
      !this.accountId ||
      this.saving
    ) {
      return;
    }


    this.accountViewBackup = this.cloneValue(this.accountData);
    this.showMainSpinner();
    this._accountsServiceProxy
      .getAccountForEdit(
        this.accountId
      )
      .pipe(
        finalize(() => {
          this.hideMainSpinner();
        })

      )
      .subscribe({

        next: (
          result:
            GetAccountInfoForEditOutput
        ) => {

          const editDto =
            CreateOrEditAccountInfoDto
              .fromJS(
                result.accountInfo
              );


          this.initializeDtoArrays(editDto);
          this.accountData = {
            ...this.accountData,
            entityExtraData:

              editDto.entityExtraData ??

              this.accountData
                ?.entityExtraData ??

              [],


            account: {

              ...this.accountData?.account,
              ...editDto,
              isManual: this.accountData?.account?.isManual,
              isConnected: this.accountData?.account?.isConnected,
              logoUrl: this.accountData?.account?.logoUrl,
              coverUrl: this.accountData?.account?.coverUrl,
              imagesUrls: this.accountData?.account?.imagesUrls,
              entityCategories: editDto.entityCategories ?? [],
              entityClassifications: editDto.entityClassifications ?? [],
              entityAttachments: editDto.entityAttachments ?? [],
              entityExtraData: editDto.entityExtraData ?? []
            }
          };
          this.accountDto = editDto;
          this.originalAccountDto = this.cloneValue(editDto.toJSON());
          this.mode = 'edit';

        }

      });
  }


  private loadAccountForEdit(
    accountId: number
  ): void {

    this.showMainSpinner();


    this._accountsServiceProxy
      .getAccountForEdit(
        accountId
      )
      .pipe(

        finalize(() => {

          this.hideMainSpinner();

        })

      )
      .subscribe({

        next: result => {
          this.accountDto =
            CreateOrEditAccountInfoDto
              .fromJS(
                result.accountInfo
              );
          this.initializeDtoArrays(this.accountDto);
          this.buildAccountData();
          this.originalAccountDto =
            this.cloneValue(
              this.accountDto
                .toJSON()
            );


          this.mode = 'edit';
          this.visible = true;
        },


        error: () => {

          this.visible = false;
        }

      });
  }


  private createEmptyAccountDto(): CreateOrEditAccountInfoDto {

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

  private buildAccountData(): void {

    this.initializeDtoArrays(
      this.accountDto
    );


    this.accountData = {

      account:
        this.accountDto,

      entityExtraData:
        this.accountDto
          .entityExtraData,


      connectionsInfo:
        this.accountData
          ?.connectionsInfo ??
        []

    };
  }


  private initializeDtoArrays(
    dto:
      CreateOrEditAccountInfoDto =
      this.accountDto
  ): void {

    dto.entityAttachments ??=
      [];


    dto.entityCategories ??=
      [];


    dto.entityClassifications ??=
      [];


    dto.entityExtraData ??=
      [];


    dto.contactAddresses ??=
      [];


    dto.contactPaymentMethods ??=
      [];


    dto.branches ??=
      [];
  }


  onAccountChanged(
    data: any
  ): void {

    if (!data?.account) {
      return;
    }


    this.accountData = data;


    this.accountDto =
      CreateOrEditAccountInfoDto
        .fromJS(
          data.account
        );


    this.initializeDtoArrays(this.accountDto);
    this.accountDto.entityExtraData =

      data.entityExtraData ??

      this.accountDto
        .entityExtraData ??

      [];


    this.accountData.account = this.accountDto;
    this.accountData.entityExtraData = this.accountDto.entityExtraData;
  }


  saveAccount(): void {

    if (
      this.saving ||
      this.uploadingImages ||
      this.mode === 'view'
    ) {
      return;
    }


    this.prepareDtoBeforeSave();


    if (
      !this.validateAccount()
    ) {
      return;
    }
    this.saving =    true;
    this.uploadingImages =  this.hasPendingUploads();
    this.showMainSpinner();
    this.uploadPendingAttachments()
      .subscribe({
        next: attachments => {
          this.applyUploadedAttachments(attachments);
          this.saveAccountDto();

        },
        error: () => {
          this.saving = false;
          this.uploadingImages =   false;
          this.hideMainSpinner();
          this.notify.error(
            this.l(
              'UploadFailed'
            )
          );

        }

      });
  }


private saveAccountDto(): void {

  this._accountsServiceProxy
    .createOrEditAccount(
      this.accountDto
    )
    .pipe(
      finalize(() => {
        this.saving = false;
        this.uploadingImages = false;
        this.hideMainSpinner();
      })
    )
    .subscribe({
      next: result => {
        this.notify.success(
          this.l(
            'SavedSuccessfully'
          )
        );


        const savedAccount =
          result?.accountInfo ??
          result?.account ??
          result;


        const savedId =
          savedAccount?.id ??
          savedAccount?.accountId ??
          this.accountDto?.id ??
          this.accountDto?.accountId;


        this.clearPendingFiles();


        this.saved.emit(
          savedAccount
        );

        if (
          this.mode === 'create'
        ) {

          if (!savedId) {
            this.visible =   false;
            return;
          }
          this.accountId =  Number(savedId);
          this.loadAccountForView(this.accountId);
          return;
        }

        if (
          this.mode === 'edit' &&
          this.accountId
        ) {

          this.loadAccountForView(
            this.accountId
          );

          return;
        }

      }

    });
}

  private prepareDtoBeforeSave(): void {

    if (!this.accountData?.account) {
      return;
    }


    this.accountDto =
      CreateOrEditAccountInfoDto.fromJS(
        this.accountData.account
      );

    this.initializeDtoArrays(
      this.accountDto
    );


    const entityId =
      this.mode === 'create'
        ? 0
        : (
          this.accountDto.id ??
          this.accountId ??
          0
        );


    this.accountDto
      .entityExtraData
      .forEach(
        (item: any) => {

          if (
            item.entityid === null ||
            item.entityid === undefined
          ) {

            item.entityid =
              entityId;
          }


          if (
            Array.isArray(
              item.attributeValue
            )
          ) {

            item.attributeValue =
              item.attributeValue
                .map(
                  value => {

                    if (
                      typeof value ===
                      'object'
                    ) {

                      return (
                        value?.value ??
                        value?.label ??
                        ''
                      );
                    }

                    return value;
                  }
                )
                .filter(Boolean)
                .join('-');
          }
        }
      );


    if (
      this.mode === 'edit' &&
      this.accountId
    ) {

      this.accountDto.id =
        this.accountDto.id ??
        this.accountId;
    }

    if (
      this.mode === 'create'
    ) {

      this.accountDto.id =  undefined;
      this.accountDto.accountId = undefined;
    }
    this.accountDto.returnId =  true;
    this.accountData.account =  this.accountDto;
  }


  private validateAccount():
    boolean {

    if (
      !this.accountDto
        .name
        ?.trim()
    ) {

      this.notify.warn(
        this.l(
          'NameIsRequired'
        )
      );


      return false;
    }


    if (
      !this.accountDto
        .accountTypeId
    ) {

      this.notify.warn(
        this.l(
          'AccountTypeIsRequired'
        )
      );


      return false;
    }


    return true;
  }

  cancel(): void {

    if (
      this.saving ||
      this.uploadingImages
    ) {
      return;
    }

    if (
      this.mode ===
      'create'
    ) {

      this.close();

      return;
    }

    if (
      this.accountViewBackup
    ) {

      this.accountData =
        this.cloneValue(
          this.accountViewBackup
        );


      this.mode = 'view';
      this.clearPendingFiles();
      this.buildAccountLeftPanel();
      return;
    }

    if (
      this.originalAccountDto
    ) {

      this.accountDto =
        CreateOrEditAccountInfoDto
          .fromJS(
            this.cloneValue(
              this.originalAccountDto
            )
          );


      this.initializeDtoArrays(this.accountDto);
      this.buildAccountData();
    }
    this.close();
  }

  close(): void {

    if (
      this.saving ||
      this.uploadingImages
    ) {
      return;
    }


    this.visible = false;
    this.closed.emit();
    this.resetState(false);
  }

  deleteAccount(): void {

    const id =
      this.accountData
        ?.account
        ?.id;


    if (!id) {
      return;
    }


    const confirmation =
      this.askToConfirm(
        'AreYouSureYouWantToDeleteThisAccount?',
        'AreYouSure'
      );


    confirmation
      .subscribe(
        confirmed => {

          if (!confirmed) {
            return;
          }


          this.showMainSpinner();


          this._accountsServiceProxy
            .delete(
              id
            )
            .pipe(

              finalize(() => {

                this.hideMainSpinner();

              })

            )
            .subscribe(() => {

              this.notify.success(
                this.l(
                  'SuccessfullyDeleted'
                )
              );


              this.deleted.emit(
                id
              );


              this.close();

            });

        }
      );
  }

  minimizeAccount(): void {

    const account = this.accountData?.account;
    if (!account?.id) {
      return;
    }


    this.entityWindowManager
      .minimize({
        entityType: 'Account',
        entityId: account.id,
        title: account.name || `Account #${account.id}`,
        entity: this.accountData

      });
    this.visible = false;
    this.minimized.emit(account.id);
  }

  onLogoChange(
    event: any
  ): void {

    const file =
      event?.file instanceof File
        ? event.file
        : null;


    this.pendingLogoFile =
      file;
  }


  onBackgroundChange(
    event: any
  ): void {

    const file =
      event?.file instanceof File
        ? event.file
        : null;


    this.pendingBackgroundFile =
      file;
  }


  onImagesChange(
    event: any
  ): void {

    const file =
      event?.file instanceof File
        ? event.file
        : null;


    const index =
      Number(
        event?.index
      );


    if (
      Number.isNaN(index) ||
      index < 0 ||
      index > 3
    ) {
      return;
    }


    this.pendingImageFiles[
      index
    ] =
      file;


    this.pendingImageFiles = [
      ...this.pendingImageFiles
    ];
  }


  onAttachmentRemove(
    event: any
  ): void {

    if (
      !this.accountData
        ?.account
    ) {
      return;
    }


    const account =
      this.accountData.account;


    account.entityAttachments ??=
      [];


    const type =
      event
        ?.attachmentType;


    const index =
      Number(
        event?.index
      );


    const attachment =
      event?.attachment;


    const categoryId =
      this.getAttachmentCategoryId(
        type
      );


    if (
      type === 'LOGO'
    ) {

      this.pendingLogoFile =
        null;


      if (categoryId) {

        account.entityAttachments =
          account
            .entityAttachments
            .filter(
              item =>
                Number(
                  item.attachmentCategoryId
                ) !==
                Number(
                  categoryId
                )
            );

      }


      account.logoUrl = null;
    }


    if (
      type === 'BANNER'
    ) {

      this.pendingBackgroundFile =
        null;


      if (categoryId) {

        account.entityAttachments =
          account
            .entityAttachments
            .filter(
              item =>
                Number(
                  item.attachmentCategoryId
                ) !==
                Number(
                  categoryId
                )
            );
      }
      account.coverUrl = null;
    }


    if (
      type === 'IMAGE'
    ) {

      if (
        !Number.isNaN(
          index
        ) &&
        index >= 0 &&
        index <
        this.pendingImageFiles
          .length
      ) {

        this.pendingImageFiles[
          index
        ] =
          null;

      }


      if (attachment) {

        account.entityAttachments =
          account
            .entityAttachments
            .filter(
              item =>

                item !== attachment &&

                item?.id !==
                attachment?.id &&

                item?.guid !==
                attachment?.guid

            );

      }

    }


    this.accountDto.entityAttachments =
      account.entityAttachments;
  }


  private getAttachmentCategoryId(
    type:
      'LOGO' |
      'BANNER' |
      'IMAGE'
  ): number | null {

    switch (type) {

      case 'LOGO':

        return (
          this.logoAttachmentCategory
            ?.id ??
          null
        );


      case 'BANNER':

        return (
          this.bannerAttachmentCategory
            ?.id ??
          null
        );


      case 'IMAGE':

        return (
          this.imageAttachmentCategory
            ?.id ??
          null
        );


      default:

        return null;
    }
  }

  private hasPendingUploads():
    boolean {

    return !!(

      this.pendingLogoFile ||

      this.pendingBackgroundFile ||

      this.pendingImageFiles
        .some(
          file =>
            !!file
        )

    );
  }


  private uploadPendingAttachments():
    Observable<
      UploadedAttachmentResult[]
    > {

    const uploads:
      Observable<
        UploadedAttachmentResult
      >[] =
      [];


    if (
      this.pendingLogoFile &&
      this.logoAttachmentCategory
        ?.id
    ) {

      uploads.push(

        this.uploadSingleAttachment(

          this.pendingLogoFile,

          this.logoAttachmentCategory.id,

          'LOGO'

        )

      );
    }


    if (
      this.pendingBackgroundFile &&
      this.bannerAttachmentCategory
        ?.id
    ) {

      uploads.push(

        this.uploadSingleAttachment(

          this.pendingBackgroundFile,

          this.bannerAttachmentCategory.id,

          'BANNER'

        )

      );
    }


    this.pendingImageFiles
      .forEach(
        (
          file,
          index
        ) => {

          if (
            file &&
            this.imageAttachmentCategory
              ?.id
          ) {

            uploads.push(

              this.uploadSingleAttachment(

                file,

                this.imageAttachmentCategory.id,

                'IMAGE',

                index

              )

            );

          }

        }
      );


    if (
      !uploads.length
    ) {

      return of([]);

    }


    return forkJoin(
      uploads
    );
  }


  private uploadSingleAttachment(
    file: File,
    attachmentCategoryId: number,
    attachmentType:
      'LOGO' |
      'BANNER' |
      'IMAGE',
    index?: number
  ):
    Observable<
      UploadedAttachmentResult
    > {

    return new Observable(
      observer => {
        const guid = this.createGuid();
        const uploader = this.createAttachmentUploader();


        uploader.onBuildItemForm =
          (
            item,
            form:
              FormData
          ) => {

            form.append(
              'guid',
              guid
            );

          };


        uploader.onSuccessItem =
          (
            item,
            response
          ) => {

            try {

              const parsedResponse =
                JSON.parse(
                  response
                ) as IAjaxResponse;


              if (
                !parsedResponse
                  ?.success
              ) {

                observer.error(
                  parsedResponse
                    ?.error ??
                  new Error(
                    'Upload failed'
                  )
                );


                return;
              }


              const attachment =
                this.createAttachmentDto(

                  file,

                  guid,

                  attachmentCategoryId,

                  parsedResponse.result

                );


              observer.next({

                attachment,

                attachmentType,

                index

              });


              observer.complete();

            } catch (
            error
            ) {

              observer.error(
                error
              );

            }

          };


        uploader.onErrorItem =
          (
            item,
            response,
            status
          ) => {

            observer.error({
              response,
              status
            });

          };


        uploader.addToQueue([
          file
        ]);


        uploader.uploadAll();

      }
    );
  }


  private createAttachmentUploader():
    FileUploader {

    const uploader =
      new FileUploader({

        url:

          AppConsts
            .remoteServiceBaseUrl +

          '/Attachment/UploadFiles'

      });


    uploader.onAfterAddingFile =
      fileItem => {

        fileItem.withCredentials =
          false;

      };


    const options:
      Partial<
        FileUploaderOptions
      > = {

      authToken:

        'Bearer ' +

        this._tokenService
          .getToken(),


      removeAfterUpload:
        true

    };


    uploader.setOptions(
      options as
      FileUploaderOptions
    );


    return uploader;
  }


  private createAttachmentDto(
    file: File,
    guid: string,
    attachmentCategoryId: number,
    uploadResult: any
  ):
    AppEntityAttachmentDto {

    const attachment =
      new AppEntityAttachmentDto();


    const result =
      uploadResult ??
      {};


    attachment.init({

      id:
        undefined,


      guid:

        result.guid ??

        guid,


      fileName:

        result.fileName ??

        file.name,


      url:

        result.url ??

        result.fileName ??

        file.name,


      attachmentCategoryId,


      index:
        undefined

    });


    return attachment;
  }


  private applyUploadedAttachments(
    uploaded:
      UploadedAttachmentResult[]
  ): void {

    this.accountDto
      .entityAttachments ??=
      [];


    uploaded.forEach(
      result => {

        const categoryId =
          result
            .attachment
            .attachmentCategoryId;

        if (
          result.attachmentType ===
          'LOGO' ||

          result.attachmentType ===
          'BANNER'
        ) {

          this.accountDto
            .entityAttachments =

            this.accountDto
              .entityAttachments
              .filter(
                item =>

                  Number(
                    item
                      .attachmentCategoryId
                  ) !==

                  Number(
                    categoryId
                  )
              );

        }


        if (
          result.attachmentType ===
          'IMAGE' &&

          result.index !==
          undefined
        ) {

          const images =

            this.accountDto
              .entityAttachments
              .filter(
                item =>

                  Number(
                    item
                      .attachmentCategoryId
                  ) ===

                  Number(
                    this
                      .imageAttachmentCategory
                      ?.id
                  )
              );


          const currentImage =
            images[
            result.index
            ];


          if (
            currentImage
          ) {

            this.accountDto
              .entityAttachments =

              this.accountDto
                .entityAttachments
                .filter(
                  item =>
                    item !==
                    currentImage
                );

          }

        }


        this.accountDto
          .entityAttachments
          .push(
            result.attachment
          );

      }
    );


    this.accountData.account =
      this.accountDto;
  }


  private clearPendingFiles():
    void {

    this.pendingLogoFile =
      null;


    this.pendingBackgroundFile =
      null;


    this.pendingImageFiles = [
      null,
      null,
      null,
      null
    ];
  }


  private loadAttachmentCategories():
    void {

    if (
      this.loadingAttachmentCategories
    ) {
      return;
    }


    if (
      this.logoAttachmentCategory &&
      this.bannerAttachmentCategory &&
      this.imageAttachmentCategory
    ) {
      return;
    }


    this.loadingAttachmentCategories =
      true;


    this.getSycAttachmentCategoriesByCodes([
      'LOGO',
      'BANNER',
      'IMAGE'
    ])
      .pipe(

        finalize(() => {

          this.loadingAttachmentCategories =
            false;

        })

      )
      .subscribe({

        next: result => {

          const categories =
            result ??
            [];


          this.logoAttachmentCategory =
            categories.find(
              item =>
                item.code ===
                'LOGO'
            );


          this.bannerAttachmentCategory =
            categories.find(
              item =>
                item.code ===
                'BANNER'
            );


          this.imageAttachmentCategory =
            categories.find(
              item =>
                item.code ===
                'IMAGE'
            );

        }

      });
  }


  private setManualAccCode():
    void {

    if (
      this.accountDto.code
    ) {
      return;
    }


    this._sycIdentifierDefinitionsServiceProxy
      .getNextEntityCode(

        this.entityObjectType,

        this.appSession
          .tenantId

      )
      .subscribe({

        next: code => {

          if (!code) {
            return;
          }


          this.accountDto.code =
            `M${code}`;


          this.accountData = {

            ...this.accountData,

            account:
              this.accountDto

          };

        }

      });
  }

  private loadContactsForAccount(
    accountId: number
  ):
    Observable<any[]> {

    return this
      ._accountsServiceProxy
      .getAllMembers(

        undefined,

        accountId,

        1,

        undefined,

        0,

        100

      )
      .pipe(

        map(
          result =>
            result?.items ??
            []
        )

      );
  }


  private buildAccountLeftPanel(): void {

    const account =
      this.accountData?.account;

    if (!account?.id) {
      this.leftPanelSections = [];
      return;
    }


    const accountNode:
      GenericEntityNode = {

      id:
        account.id,

      label:
        account.name,

      entityType:
        'ACCOUNT',

      icon:
        'fa fa-building',

      data:
        this.accountData,

      component:
        undefined,

      expanded:
        true,

      children:
        []
    };


    const branches =
      account.branches ?? [];


    const accountContacts$:
      Observable<any[]> =
      this.loadContactsForAccount(
        account.id
      );


    const branchContactRequests:
      Observable<{
        branchNode: any;
        contacts: any[];
      }>[] =
      branches.map(
        branchNode => {

          const branch =
            branchNode
              ?.data
              ?.branch;


          if (!branch?.id) {

            return of({
              branchNode,
              contacts: [] as any[]
            });

          }


          return this
            .loadContactsForAccount(
              branch.id
            )
            .pipe(
              map(
                contacts => ({
                  branchNode,
                  contacts
                })
              )
            );
        }
      );

    const branches$:
      Observable<
        Array<{
          branchNode: any;
          contacts: any[];
        }>
      > =
      branchContactRequests.length

        ? forkJoin(
          branchContactRequests
        )

        : of([]);


    forkJoin({

      accountContacts:
        accountContacts$,

      branches:
        branches$

    })
      .subscribe({

        next: result => {
          const accountContactNodes =
            this.buildContactNodes(

              result.accountContacts,
              account.id,
              account.id,
              account.tenantId

            );


          const addAccountContactNode:
            GenericEntityNode = {

            id:
              `new-contact-account-${account.id}`,

            label:
              this.l(
                'AddContact'
              ),

            entityType:
              'CONTACT',

            icon:
              'fa fa-plus',

            parentId:
              account.id,

            component:
              ContactGenericComponent,

            data:
              null,

            context: {

              create:
                true,

              accountId:
                account.id,

              parentId:
                account.id,

              branchId:
                null,

              tenantId:
                account.tenantId,

              accountName:
                account.name,

              branchNode:
                null

            },

            expanded:
              false,

            children:
              []
          };


          const branchNodes:
            GenericEntityNode[] =

            result.branches
              .map(
                item => {

                  const branch =
                    item
                      ?.branchNode
                      ?.data
                      ?.branch;


                  if (!branch?.id) {
                    return null;
                  }


                  const branchContactNodes =
                    this.buildContactNodes(

                      item.contacts,

                      branch.id,

                      account.id,

                      account.tenantId

                    );


                  const addBranchContactNode:
                    GenericEntityNode = {

                    id:
                      `new-contact-branch-${branch.id}`,

                    label:
                      this.l(
                        'AddContact'
                      ),

                    entityType:
                      'CONTACT',

                    icon:
                      'fa fa-plus',

                    parentId:
                      branch.id,

                    component:
                      ContactGenericComponent,

                    data:
                      null,

                    context: {

                      create:
                        true,

                      accountId:
                        account.id,

                      parentId:
                        branch.id,

                      branchId:
                        branch.id,

                      tenantId:
                        account.tenantId,

                      accountName:
                        account.name,

                      branchName:
                        branch.name,

                      branchNode:
                        item.branchNode

                    },

                    expanded:
                      false,

                    children:
                      []
                  };


                  const treeBranchNode:
                    GenericEntityNode = {

                    id:
                      branch.id,

                    label:
                      branch.name ||
                      item
                        ?.branchNode
                        ?.label ||
                      this.l(
                        'Branch'
                      ),

                    entityType:
                      'BRANCH',

                    icon:
                      'fa fa-code-branch',

                    parentId:
                      account.id,

                    component:
                      BranchGenericComponent,

                    data: {
                      branch
                    },

                    context: {

                      accountId:
                        account.id,

                      accountName:
                        account.name,

                      tenantId:
                        account.tenantId,

                      branchId:
                        branch.id,

                      branchName:
                        branch.name,

                      branchNode:
                        item.branchNode

                    },

                    expanded:
                      false,

                    children: [

                      addBranchContactNode,

                      ...branchContactNodes

                    ]
                  };


                  return treeBranchNode;
                }
              )
              .filter(
                (
                  node
                ): node is GenericEntityNode =>
                  !!node
              );


          accountNode.children = [

            addAccountContactNode,

            ...branchNodes,

            ...accountContactNodes

          ];


          this.leftPanelSections = [

            {

              key:
                'profile',

              title:
                this.l(
                  'MyProfile'
                ),

              type:
                'tree',

              canAdd:
                true,

              items: [
                accountNode
              ]

            }

          ];
        }

      });
  }


  private buildContactNodes(
    contacts: any[],
    parentId: number,
    accountId: number,
    tenantId?: number
  ):
    GenericEntityNode[] {

    return (
      contacts ??
      []
    )
      .filter(
        contact =>
          !!contact?.id
      )
      .map(
        contact => {

          const fullName =
            [

              contact.firstName,

              contact.surName

            ]
              .filter(Boolean)
              .join(' ');


          return {

            id:
              contact.id,


            label:

              fullName ||

              contact.accountName ||

              this.l(
                'Contact'
              ),


            entityType:
              'CONTACT',


            icon:
              'fa fa-user',


            imageUrl:
              contact.imageUrl,


            parentId,


            component:
              ContactGenericComponent,


            data: {

              contact

            },


            context: {

              create:
                false,


              accountId,


              parentId,


              tenantId,


              accountName:
                contact.accountName

            },


            expanded:
              false,


            children:
              []

          } as GenericEntityNode;

        }
      );
  }


  onDynamicEntitySaved(
    event: any
  ): void {

    const type =
      String(

        event?.node
          ?.entityType ??

        ''

      )
        .toUpperCase();


    if (
      type === 'BRANCH' ||
      type === 'CONTACT'
    ) {

      this.reloadAccountTree();

    }
  }


  private reloadAccountTree():
    void {

    if (
      !this.accountId
    ) {
      return;
    }


    this._accountsServiceProxy
      .getAccountForView(
        this.accountId,
        5
      )
      .subscribe(
        result => {

          this.accountData =
            result;


          this.buildAccountLeftPanel();

        }
      );
  }


  private resetState(
    resetVisible = true
  ): void {

    if (
      resetVisible
    ) {

      this.visible =   false;

    }


    this.accountId =
      null;


    this.mode =
      'view';


    this.accountData =
      null;


    this.accountDto =
      new CreateOrEditAccountInfoDto();


    this.originalAccountDto =
      null;


    this.accountViewBackup =
      null;


    this.leftPanelSections =
      [];


    this.clearPendingFiles();


    this.uploadingImages =
      false;


    this.saving =
      false;


    this.isLoadingAccount =
      false;
  }


  private createGuid():
    string {

    return (
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    )
      .replace(
        /[xy]/g,
        character => {

          const random =
            Math.random() *
            16 |
            0;


          const value =

            character === 'x'

              ? random

              : (
                random &
                0x3
              ) |
              0x8;


          return value
            .toString(
              16
            );

        }
      );
  }


  private cloneValue(
    value: any
  ): any {

    if (
      value === null ||
      value === undefined
    ) {
      return value;
    }


    return JSON.parse(
      JSON.stringify(
        value
      )
    );
  }
}