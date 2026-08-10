import { Component, EventEmitter, Injector, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountLevelEnum, AccountsServiceProxy, AppEntityAttachmentDto, AppEntityCategoryDto, AppEntityClassificationDto, AppEntityExtraDataDto, CreateMarketplaceAccountServiceProxy, CreateOrEditAccountInfoDto, GetAccountForViewDto, GetAccountInfoForEditOutput, SycAttachmentCategoryDto  } from '@shared/service-proxies/service-proxies';
import {
  FileUploader,
  FileUploaderOptions
} from 'ng2-file-upload';

import {
  IAjaxResponse,
  TokenService
} from 'abp-ng2-module';

import {
  forkJoin,
  Observable,
  of
} from 'rxjs';

import {
  map,
  switchMap , finalize
} from 'rxjs/operators';
import { GenericEntityNode, GenericSelectedEntity, PendingUpload } from '@app/shared/entity-shell/models/generic-entity.model';
import { BranchGenericComponent } from '@app/select-branch/branch-generic/branch-generic.component';
import { AccountSectionsComponent } from '../account-sections/account-sections.component';
@Component({
  selector: 'app-account-card',
  templateUrl: './account-card.component.html',
  styleUrls: ['./account-card.component.scss']
})
export class AccountCardComponent extends AppComponentBase implements OnChanges {
  @Input('account') account: GetAccountForViewDto
  @Input('cardsViewMode') cardsViewMode: boolean
  @Input('isHost') isHost: boolean
  @Input('FromLandingPage') FromLandingPage: boolean
  @Output() deleteMe: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Output() disconnectMe: EventEmitter<{ account: GetAccountForViewDto; relation: any }> = new EventEmitter();
  @Input() fromMarketplace;
  @Input() loginTenaneSsin;
  @Output() _createRelation: EventEmitter<any> = new EventEmitter<any>()


  isRecordOwner: boolean
  attachmentBaseUrl: string = AppConsts.attachmentBaseUrl
  currentLang: string
  isArabic: boolean
  isAuthenticated: boolean = false;

  isSmallScreen = false;
  isTouchDevice = false;

  showRelationsDialog = false;
  selectedAccountForRelations: any = null;
  openedRelationMenuId: number | null = null;
  isCreatingRelation = false; 

  accountViewData: GetAccountForViewDto | null = null;
isLoadingAccountView = false;


logoAttachmentCategory: SycAttachmentCategoryDto;
bannerAttachmentCategory: SycAttachmentCategoryDto;
imageAttachmentCategory: SycAttachmentCategoryDto;

isLoadingAttachmentCategories = false;

@ViewChild(AccountSectionsComponent)
accountSectionsComponent:
  AccountSectionsComponent;

leftPanelSections: Array<{
  key: string;
  title: string;
  type?: 'tree' | 'list';
  canAdd?: boolean;
  items: GenericEntityNode[];
}> = [];
  constructor(
    injector: Injector,
    private router: Router,
     private _accountsServiceProxy: AccountsServiceProxy,
    private CreateMarketplaceAccountServiceProxy: CreateMarketplaceAccountServiceProxy,
      private _tokenService:
    TokenService
  ) {
    super(injector);
  }




  ngOnInit() {
    this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
    this.currentLang == 'ar' || this.currentLang == 'ar-EG' ? this.isArabic = true : this.isArabic = false
    this.isAuthenticated = !!this.appSession?.user;

    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize.bind(this));
      this.loadAttachmentCategories();

  }

  private loadAttachmentCategories(): void {
  if (this.isLoadingAttachmentCategories) {
    return;
  }

  if (
    this.logoAttachmentCategory &&
    this.bannerAttachmentCategory &&
    this.imageAttachmentCategory
  ) {
    return;
  }

  this.isLoadingAttachmentCategories = true;

  this.getSycAttachmentCategoriesByCodes([
    'LOGO',
    'BANNER',
    'IMAGE'
  ])
    .pipe(
      finalize(() => {
        this.isLoadingAttachmentCategories = false;
      })
    )
    .subscribe({
      next: result => {
        const categories =
          result ?? [];

        this.logoAttachmentCategory =
          categories.find(
            item => item.code === 'LOGO'
          );

        this.bannerAttachmentCategory =
          categories.find(
            item => item.code === 'BANNER'
          );

        this.imageAttachmentCategory =
          categories.find(
            item => item.code === 'IMAGE'
          );
      },
      error: error => {
        console.error(
          'Failed to load attachment categories:',
          error
        );
      }
    });
}
  checkScreenSize(): void {
    this.isSmallScreen = window.innerWidth <= 1023;
  }
 ngOnChanges(
  changes: SimpleChanges
): void {
  this.isRecordOwner =
    this.account?.account?.partnerId ===
    this.appSession?.user?.accountId;
}

  get id(): number { return this.account.account.id }
  get isManual(): boolean { return this.account.account.isManual }
  deleteAccount() {
    this.deleteMe.emit()
  }



  edit(): void {
    if (!this.id) return
    let editPrefix = this.isHost ? "external" : "manual"
    this.router.navigate([`/app/main/account/edit-${editPrefix}/${this.id}`])
  }
  // viewProfile(): void {
  //   if (!this.fromMarketplace) {
  //     if (!this.id) return
  //     this.router.navigate([`/app/main/account/view/${this.id}`], {
  //       queryParams: { fromMarketplace: this.fromMarketplace }
  //     });
  //   } else {
  //     if (!this.id) return
  //     this.router.navigate([`/app/main/account/view-marketplace-acc/${this.id}`], {
  //       state: {
  //         accountType: this.account.account.accountType,
  //         ssin: this.account.account.ssin
  //       }
  //     });
  //   }

  // }

showGenericEntityModal = false;

selectedAccountId: number;


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
    valuePath: 'account.accountTypeId',
    options: this.accountTypes,
    optionLabel: 'label',
    optionValue: 'value'
  },
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    valuePath: 'account.name'
  },
   {
    key: 'code',
    label: 'code',
    type: 'text',
    valuePath: 'account.code',
  
  },
  {
    key: 'ssin',
    label: 'SSIN',
    type: 'text',
    valuePath: 'account.ssin',
    readonly: true
  },
 
];



entityMode: 'create' | 'edit' | 'view' = 'view';

private accountViewBackup: any = null;
viewProfile(): void {
  if (!this.id || this.isLoadingAccountView) {
    return;
  }

  this.selectedAccountId = this.id;
  this.entityMode = 'view';

  if (
    this.accountViewData?.account?.id ===
    this.selectedAccountId
  ) {
    this.accountViewBackup =
      this.deepClone(this.accountViewData);

    this.showGenericEntityModal = true;
    return;
  }

  this.isLoadingAccountView = true;
  this.showMainSpinner();

  this._accountsServiceProxy
    .getAccountForView(
      this.selectedAccountId,
      5
    )
    .pipe(
      finalize(() => {
        this.isLoadingAccountView = false;
     
        this.hideMainSpinner();
      })
    )
    .subscribe({
      next: result => {
        this.accountViewData = result;
  this.buildAccountLeftPanel();
        this.accountViewBackup =
          this.deepClone(result);

        this.entityMode = 'view';
        this.showGenericEntityModal = true;
      },
      error: error => {
        console.error(
          'Failed to load account profile:',
          error
        );
      }
    });
}



enableEditMode(): void {
  if (
    !this.selectedAccountId ||
    this.saving
  ) {
    return;
  }

  this.accountViewBackup =
    this.deepClone(
      this.accountViewData
    );

  this.showMainSpinner();

  this._accountsServiceProxy
    .getAccountForEdit(
      this.selectedAccountId
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

        this.ensureEditArrays(
          editDto
        );

        /*
         * Keep the outer view object because
         * it contains connections and display data,
         * but replace account editable data with
         * the complete edit DTO.
         */
        this.accountViewData = {
          ...this.accountViewData,

          entityExtraData:
            editDto.entityExtraData ??
            this.accountViewData
              ?.entityExtraData ??
            [],

          account: {
            ...this.accountViewData
              ?.account,

            ...editDto,

            /*
             * Preserve display-only values that
             * are not returned by GetForEdit.
             */
            isManual:
              this.accountViewData
                ?.account
                ?.isManual,

            isConnected:
              this.accountViewData
                ?.account
                ?.isConnected,

            logoUrl:
              this.accountViewData
                ?.account
                ?.logoUrl,

            coverUrl:
              this.accountViewData
                ?.account
                ?.coverUrl,

            imagesUrls:
              this.accountViewData
                ?.account
                ?.imagesUrls,

            entityCategories:
              editDto
                .entityCategories ??
              [],

            entityClassifications:
              editDto
                .entityClassifications ??
              [],

            entityAttachments:
              editDto
                .entityAttachments ??
              [],

            entityExtraData:
              editDto
                .entityExtraData ??
              []
          }
        } as any;

        this.entityMode = 'edit';
      },

      error: error => {
        console.error(
          'Failed to load account edit data:',
          error
        );

        this.notify.error(
          this.l(
            'FailedToLoadAccount'
          )
        );
      }
    });
}

private ensureEditArrays(
  dto: CreateOrEditAccountInfoDto
): void {
  dto.entityCategories ??= [];
  dto.entityClassifications ??= [];
  dto.entityAttachments ??= [];
  dto.entityExtraData ??= [];
  dto.contactAddresses ??= [];
  dto.contactPaymentMethods ??= [];
  dto.branches ??= [];
}

cancelEdit(): void {
  if (this.accountViewBackup) {
    this.accountViewData =
      this.deepClone(this.accountViewBackup);
  }

  this.entityMode = 'view';
}

closeGenericEntityModal(): void {
  this.showGenericEntityModal = false;
  this.entityMode = 'view';
}


  clickCardHandler() {
    // if (this.isManual) {
    //   this.edit()
    // } else {
      this.viewProfile()
    // }
  }

  createRelation(relationType: any) {
  if (this.isCreatingRelation) {
    return;
  }

  this.isCreatingRelation = true;

  this._createRelation.emit({
    account: this.account,
    relation: relationType,
    done: () => {
      this.isCreatingRelation = false;
    }
  });
}
  getFormattedConnectionName(label: string): string {
    if (!label) return '';

    if (label === 'Follow' || label === 'Connect' || label === 'Join' || label === 'Employ') {
      return label;
    }

    if (label.startsWith('MPAction')) {
      const clean = label.replace('MPAction', '');
      return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
    }

    return label;
  }
  removeRelation(account, relation) {
    this.disconnectMe.emit({ account, relation });
  }

  private readonly ICONS: Record<string, string> = {
    FOLLOW: 'assets/accounts/FOLLOW.png',
    CONNECT: 'assets/accounts/CONNECT.png',
    EMPLOY: 'assets/accounts/CONNECT.png',
    EMPLOYEE: 'assets/accounts/EMPLOYEE.png',
    JOIN: 'assets/accounts/JOIN.png',
  };
  getConnectionIcon(label?: string): string {
    const t = (label || '').toUpperCase();
    for (const key of Object.keys(this.ICONS)) {
      if (t.includes(key)) return this.ICONS[key];
    }
    return 'assets/accounts/CONNECT.png'; // fallback
  }

  makeRelationPrivatePublic(relation: any, status: boolean) {
    const accountId = this.account?.account?.ssin;
    if (!accountId || !relation) return;

    this.showMainSpinner();

    this.CreateMarketplaceAccountServiceProxy
      .createOrEditMarketplaceContactRelationship(this.loginTenaneSsin, accountId, false, status, null, relation?.relationEntityId)
      .pipe(
        finalize(() => {
          this.hideMainSpinner();
        })
      )
      .subscribe(() => {
        relation.visibility = relation.visibility === 'Public' ? 'Private' : 'Public';

        relation.visibility === 'Public'
          ? this.notify.success('Account is Shared')
          : this.notify.success('Account is Private');
      });
  }

  getRemainingCategoriesList(categories: string[]): string {
    if (!categories || categories.length <= 3) {
      return '';
    }

    return categories
      .slice(3)
      .map(category => `• ${category}`)
      .join('\n');
  }

  getAccountTypeIcon(type: string): string {
    const accountType = (type || '').toLowerCase();

    if (accountType.includes('business')) {
      return 'fas fa-building';
    }

    if (accountType.includes('group')) {
      return 'fas fa-users';
    }

    if (accountType.includes('personal')) {
      return 'fas fa-user';
    }

    return 'fas fa-tag';
  }

  stopPropagation($event) {
    $event.stopPropagation() // stop click event bubbling
  }

  openRelationsDialog(account: any): void {
    this.selectedAccountForRelations = account;
    this.showRelationsDialog = true;
  }

  removeRelationFromDialog(account: any, relation: any, index: number): void {
    this.removeRelation(account, relation);

    // optional: close dialog if no relations left after UI update
    setTimeout(() => {
      if (!account?.connectionsInfo?.length) {
        this.showRelationsDialog = false;
      }
    });
  }



  toggleRelationMenu(event: MouseEvent, account: any): void {
    event.preventDefault();
    event.stopPropagation();

    const id = account?.account?.id;
    this.openedRelationMenuId = this.openedRelationMenuId === id ? null : id;
  }

  onRelationOptionClick(event: MouseEvent, option: any): void {
    event.preventDefault();
    event.stopPropagation();

    this.createRelation(option);
    this.openedRelationMenuId = null;
  }












  ////////////////////////////////
  accountBasicInfo = {
  status: null,
  type: null,
  name: '',
  code: '',
  logoUrl: null,
  backgroundUrl: null
};

saving = false;


private buildAccountEditDto(): CreateOrEditAccountInfoDto {
  const viewData = this.accountViewData;
  const account = viewData?.account;

  if (!account) {
    return new CreateOrEditAccountInfoDto();
  }

  const rawPayload: any = {
    id: account.id,
    accountId: account.id,

    name: account.name,
    code: account.code,

    tradeName: account.tradeName ?? '',
    website: account.website ?? '',
    eMailAddress: account.eMailAddress ?? '',

    accountTypeId: account.accountTypeId,
    accountType: account.accountType,
    accountLevel: AccountLevelEnum.Manual,

    status: account.status,

    currencyId: account.currencyId ?? null,
    languageId: account.languageId ?? null,

    phone1TypeId: account.phone1TypeId ?? null,
    phone1Number: account.phone1Number ?? '',
    phone1Ex: account.phone1Ex ?? '',

    phone2TypeId: account.phone2TypeId ?? null,
    phone2Number: account.phone2Number ?? '',
    phone2Ex: account.phone2Ex ?? '',

    phone3TypeId: account.phone3TypeId ?? null,
    phone3Number: account.phone3Number ?? '',
    phone3Ex: account.phone3Ex ?? '',

    returnId: true,
    useDTOTenant: false
  };

  const sourceExtraData =
    viewData.entityExtraData ??
    account.entityExtraData ??
    [];

  if (
    sourceExtraData.length > 0 ||
    (viewData as any).__extraDataTouched
  ) {
    rawPayload.entityExtraData =
      sourceExtraData.map(item =>
        this.normalizeExtraDataForSave(
          item,
          account.entityId,
          account.accountTypeId
        )
      );
  }

  /*
   * Include categories only when the user changed them.
   * This prevents unchanged categories from being cleared
   * when getAccountForView() does not return their DTOs.
   */
  rawPayload.entityCategories =
    (
      account.entityCategories ??
      []
    )
      .filter(item =>
        Number(
          item
            .entityObjectCategoryId
        ) > 0
      )
      .map(item =>
        this.toPlainObject(item)
      );

  /*
   * Always preserve existing classifications.
   */
  rawPayload.entityClassifications =
    (
      account.entityClassifications ??
      []
    )
      .filter(item =>
        Number(
          item
            .entityObjectClassificationId
        ) > 0
      )
      .map(item =>
        this.toPlainObject(item)
      );
  /*
   * Include attachments only when changed.
   * Do not send [] when the view API returned only
   * logoUrl, coverUrl and imagesUrls.
   */
if (
  (viewData as any).__attachmentsTouched
) {
  rawPayload.entityAttachments =
    (
      account.entityAttachments ??
      []
    ).map(item => {
      const attachment =
        typeof item?.toJSON ===
        'function'
          ? item.toJSON()
          : { ...item };

      /*
       * UI slot index should not be sent
       * unless supported by backend DTO.
       */
      attachment.index = undefined;

      return attachment;
    });
}

  return CreateOrEditAccountInfoDto.fromJS(
    rawPayload
  );
}

private toPlainObject(item: any): any {
  if (!item) {
    return item;
  }

  return typeof item.toJSON === 'function'
    ? item.toJSON()
    : { ...item };
}
private normalizeExtraDataForSave(
  item: any,
  entityId: number,
  defaultEntityObjectTypeId: number
): any {
  const rawItem: any =
    typeof item?.toJSON === 'function'
      ? item.toJSON()
      : { ...item };

  rawItem.entityId =
    rawItem.entityId ??
    rawItem.entityid ??
    entityId;

  rawItem.entityObjectTypeId =
    rawItem.entityObjectTypeId ??
    defaultEntityObjectTypeId;

  if (
    Array.isArray(
      rawItem.attributeValue
    )
  ) {
    rawItem.attributeValue =
      rawItem.attributeValue
        .map(value =>
          typeof value === 'object'
            ? value?.value ??
              value?.label ??
              ''
            : value
        )
        .filter(Boolean)
        .join('-');
  }

  /*
   * Some multiselect implementations return:
   * [{ value: 'Buyer' }, { value: 'Seller' }]
   */
  if (
    Array.isArray(
      rawItem.selectedValues
    )
  ) {
    rawItem.attributeValue =
      rawItem.selectedValues
        .map(value =>
          typeof value === 'object'
            ? value?.value ??
              value?.label ??
              ''
            : value
        )
        .filter(Boolean)
        .join('-');

    delete rawItem.selectedValues;
  }

  delete rawItem.entityid;

  return rawItem;
}
private validateAccountPayload(
  payload: CreateOrEditAccountInfoDto
): boolean {

  if (!payload.name?.trim()) {
    this.notify.warn(
      this.l('NameIsRequired')
    );

    return false;
  }

  if (!payload.accountTypeId) {
    this.notify.warn(
      this.l('AccountTypeIsRequired')
    );

    return false;
  }

  if (!payload.id) {
    console.error(
      'Cannot update account without ID',
      payload
    );

    this.notify.error(
      this.l('AccountIdIsRequired')
    );

    return false;
  }

  return true;
}

private reloadAccountAfterSave(): void {
  if (!this.selectedAccountId) {
    return;
  }

  this._accountsServiceProxy
    .getAccountForView(
      this.selectedAccountId,
      5
    )
    .subscribe({
      next: result => {
        if (!result?.account) {
          this.notify.error(
            this.l('FailedToLoadAccount')
          );

          return;
        }

        const normalizedResult: any = {
          ...result,

          entityExtraData:
            result.entityExtraData ?? [],

          connectionsInfo:
            result.connectionsInfo ?? [],

          availableConnections:
            result.availableConnections ?? [],

          account: {
            ...result.account,

            categories:
              result.account.categories ?? [],

            classfications:
              result.account.classfications ?? [],

            imagesUrls:
              result.account.imagesUrls ?? [],

            branches:
              result.account.branches ?? [],

            /*
             * These collections are not returned
             * by GetAccountForView, but components
             * must not crash when reading them.
             */
            entityAttachments: [],
            entityCategories: [],
            entityClassifications: [],

            entityExtraData:
              result.entityExtraData ?? []
          }
        };

        this.accountViewData =
          normalizedResult;

        this.accountViewBackup =
          this.deepClone(
            normalizedResult
          );

        this.account =
          normalizedResult;

        this.entityMode = 'view';
      },

      error: error => {
        console.error(
          'Account saved, but view reload failed:',
          error
        );

        this.entityMode = 'view';
      }
    });
}


pendingLogoFile:
  File | null = null;

pendingBackgroundFile:
  File | null = null;

pendingImageFiles:
  Array<File | null> = [
    null,
    null,
    null,
    null
  ];

uploadingImages = false;

onLogoChange(event: any): void {
  const file =
    event?.file instanceof File
      ? event.file
      : null;

  if (!file) {
    console.warn(
      'Logo change did not contain a File:',
      event
    );

    return;
  }

  this.pendingLogoFile = file;
  this.markAttachmentsTouched();
}

onBackgroundChange(event: any): void {
  const file =
    event?.file instanceof File
      ? event.file
      : null;

  if (!file) {
    console.warn(
      'Background change did not contain a File:',
      event
    );

    return;
  }

  this.pendingBackgroundFile = file;
  this.markAttachmentsTouched();
}


onImagesChange(event: any): void {
  const file =
    event?.file instanceof File
      ? event.file
      : null;

  const index =
    Number(event?.index);

  if (
    !file ||
    Number.isNaN(index) ||
    index < 0 ||
    index >= this.pendingImageFiles.length
  ) {
    console.warn(
      'Additional image change is invalid:',
      event
    );

    return;
  }

  this.pendingImageFiles[index] = file;
  this.markAttachmentsTouched();
}
private markAttachmentsTouched(): void {
  if (!this.accountViewData) {
    return;
  }

  (this.accountViewData as any).__attachmentsTouched = true;
}
// saveAccount(): void {
//   if (
//     this.saving ||
//     this.entityMode !== 'edit' ||
//     !this.accountViewData?.account
//   ) {
//     return;
//   }

//   const account = this.accountViewData.account;

//   if (
//     account.isConnected &&
//     !account.isManual
//   ) {
//     return;
//   }

//   this.saving = true;
//   this.uploadingImages =
//     this.hasPendingUploads();

//   this.showMainSpinner();

//   this.uploadPendingAttachments()
//     .pipe(
//       /*
//        * switchMap runs only after
//        * uploadPendingAttachments emits.
//        *
//        * Because uploadPendingAttachments uses forkJoin,
//        * it emits only after every upload completes.
//        */
//       switchMap(uploadedAttachments => {
//         this.applyUploadedAttachments(
//           uploadedAttachments
//         );

//         const payload =
//           this.buildAccountEditDto();

//         console.log(
//           'All uploads completed. Calling CreateOrEditAccount:',
//           payload.toJSON()
//         );

//         return this._accountsServiceProxy
//           .createOrEditAccount(payload);
//       }),

//       finalize(() => {
//         this.saving = false;
//         this.uploadingImages = false;
//         this.hideMainSpinner();
//       })
//     )
//     .subscribe({
//       next: result => {
//         this.notify.success(
//           this.l('SavedSuccessfully')
//         );

//         this.clearPendingUploads();
//         this.reloadAccountAfterSave();
//       },

//       error: error => {
//         console.error(
//           'Upload or account save failed:',
//           error
//         );

//         this.notify.error(
//           this.l('SaveFailed')
//         );
//       }
//     });
// }

saveAccount(): void {

  if (
    this.saving ||
    this.entityMode !== 'edit' ||
    !this.accountViewData?.account
  ) {
    return;
  }


  const account =
    this.accountViewData.account;


  if (
    account.isConnected &&
    !account.isManual
  ) {
    return;
  }


  this.saving = true;

  this.uploadingImages =
    this.hasPendingUploads();


  this.showMainSpinner();


  this.uploadPendingAttachments()
    .pipe(

      /*
       * 1. Wait for image uploads
       */
      switchMap(
        uploadedAttachments => {

          this.applyUploadedAttachments(
            uploadedAttachments
          );


          /*
           * 2. Save Account
           */
          const payload =
            this.buildAccountEditDto();


          console.log(
            'Calling CreateOrEditAccount:',
            payload.toJSON()
          );


          return this._accountsServiceProxy
            .createOrEditAccount(payload);
        }
      ),


      /*
       * 3. AFTER Account is saved,
       * save Relationship settings.
       */
      switchMap(
        accountResult => {

          const relationshipSave$ =
            this.accountSectionsComponent
              ?.saveRelationshipEntity();


          /*
           * AccountSections may not exist,
           * or Relationship was unchanged.
           */
          if (!relationshipSave$) {

            return of({
              accountResult,
              relationshipResult:
                null
            });
          }


          return relationshipSave$
            .pipe(

              map(
                relationshipResult => ({
                  accountResult,
                  relationshipResult
                })
              )

            );
        }
      ),


      finalize(() => {

        this.saving =
          false;

        this.uploadingImages =
          false;

        this.hideMainSpinner();
      })

    )
    .subscribe({

      next: result => {

        console.log(
          'Account + Relationship saved:',
          result
        );


        this.notify.success(
          this.l(
            'SavedSuccessfully'
          )
        );


        this.clearPendingUploads();

        this.reloadAccountAfterSave();
      },


      error: error => {

        console.error(
          'Save failed:',
          error
        );


        this.notify.error(
          this.l(
            'SaveFailed'
          )
        );
      }

    });
}

private hasPendingUploads():
  boolean {

  return !!(
    this.pendingLogoFile ||
    this.pendingBackgroundFile ||
    this.pendingImageFiles
      .some(file => !!file)
  );
}

private uploadPendingAttachments():
  Observable<
    Array<{
      attachment:
        AppEntityAttachmentDto;
      attachmentType:
        'LOGO' |
        'BANNER' |
        'IMAGE';
      index?: number;
    }>
  > {

  const uploads:
    PendingUpload[] = [];

  if (
    this.pendingLogoFile &&
    this.logoAttachmentCategory
      ?.id
  ) {
    uploads.push({
      file:
        this.pendingLogoFile,
      categoryId:
        this.logoAttachmentCategory
          .id,
      attachmentType:
        'LOGO'
    });
  }

  if (
    this.pendingBackgroundFile &&
    this.bannerAttachmentCategory
      ?.id
  ) {
    uploads.push({
      file:
        this.pendingBackgroundFile,
      categoryId:
        this.bannerAttachmentCategory
          .id,
      attachmentType:
        'BANNER'
    });
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
          uploads.push({
            file,
            categoryId:
              this.imageAttachmentCategory
                .id,
            attachmentType:
              'IMAGE',
            index
          });
        }
      }
    );

  if (!uploads.length) {
    return of([]);
  }

  return forkJoin(
    uploads.map(upload =>
      this.uploadOneAttachment(
        upload
      )
    )
  );
}

private uploadOneAttachment(
  pending: PendingUpload
): Observable<{
  attachment: AppEntityAttachmentDto;
  attachmentType: 'LOGO' | 'BANNER' | 'IMAGE';
  index?: number;
}> {
  return new Observable(observer => {
    const guid = this.guid();

    const uploader = new FileUploader({
      url:
        AppConsts.remoteServiceBaseUrl +
        '/Attachment/UploadFiles'
    });

    uploader.setOptions({
      authToken:
        'Bearer ' +
        this._tokenService.getToken(),

      removeAfterUpload: true
    } as FileUploaderOptions);

    uploader.onAfterAddingFile = item => {
      item.withCredentials = false;
    };

    /*
     * Important:
     * Send the same GUID that will be included
     * in the attachment DTO.
     */
    uploader.onBuildItemForm = (
      item,
      form: FormData
    ) => {
      form.append(
        'guid',
        guid
      );
    };

    uploader.onSuccessItem = (
      item,
      response
    ) => {
      try {
        const parsedResponse: IAjaxResponse =
          typeof response === 'string'
            ? JSON.parse(response)
            : response;

        if (!parsedResponse?.success) {
          observer.error(
            parsedResponse?.error ??
            new Error(
              'Attachment upload failed'
            )
          );

          return;
        }

        const result: any =
          parsedResponse.result ?? {};

        const attachment =
          new AppEntityAttachmentDto();

        attachment.init({
          id: undefined,

          guid:
            result.guid ??
            guid,

          fileName:
            result.fileName ??
            pending.file.name,

          url:
            result.url ??
            result.fileName ??
            pending.file.name,

          attachmentCategoryId:
            pending.categoryId,

          /*
           * Do not send the UI slot index
           * unless the backend DTO explicitly
           * requires it.
           */
          index: undefined
        });

        observer.next({
          attachment,

          attachmentType:
            pending.attachmentType,

          index:
            pending.index
        });

        observer.complete();
      } catch (error) {
        console.error(
          'Invalid attachment upload response:',
          response,
          error
        );

        observer.error(error);
      }
    };

    uploader.onErrorItem = (
      item,
      response,
      status
    ) => {
      console.error(
        'Attachment upload request failed:',
        {
          status,
          response,
          fileName:
            pending.file.name
        }
      );

      observer.error({
        status,
        response
      });
    };

    uploader.addToQueue([
      pending.file
    ]);

    uploader.uploadAll();

    return () => {
      uploader.cancelAll();
      uploader.clearQueue();
    };
  });
}
private applyUploadedAttachments(
  uploaded: any[]
): void {

  const account =
    this.accountViewData
      ?.account;

  if (!account) {
    return;
  }

  account.entityAttachments ??=
    [];

  uploaded.forEach(result => {
    const categoryId =
      Number(
        result.attachment
          .attachmentCategoryId
      );

    if (
      result.attachmentType ===
        'LOGO' ||
      result.attachmentType ===
        'BANNER'
    ) {
      account.entityAttachments =
        account
          .entityAttachments
          .filter(
            item =>
              Number(
                item
                  .attachmentCategoryId
              ) !== categoryId
          );
    }

    if (
      result.attachmentType ===
        'IMAGE' &&
      result.index !== undefined
    ) {
      const images =
        account
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

      const oldImage =
        images[
          result.index
        ];

      if (oldImage) {
        account.entityAttachments =
          account
            .entityAttachments
            .filter(
              item =>
                item !== oldImage
            );
      }
    }

    account
      .entityAttachments
      .push(
        result.attachment
      );
  });

  (
    this.accountViewData as any
  ).__attachmentsTouched =
    true;
}

private clearPendingUploads():
  void {

  this.pendingLogoFile = null;
  this.pendingBackgroundFile =
    null;

  this.pendingImageFiles = [
    null,
    null,
    null,
    null
  ];
}


onAttachmentRemove(event: any): void {
  const account =
    this.accountViewData?.account;

  if (!account) {
    return;
  }

  account.entityAttachments ??= [];

  const categoryId = this.getAttachmentCategoryId(
    event?.attachmentType
  );

  if (!categoryId) {
    return;
  }

  if (
    event?.attachmentType === 'LOGO'
  ) {
    this.pendingLogoFile = null;

    account.entityAttachments =
      account.entityAttachments.filter(
        item =>
          Number(item.attachmentCategoryId) !==
          Number(categoryId)
      );

    account.logoUrl = null;
  }

  if (
    event?.attachmentType === 'BANNER'
  ) {
    this.pendingBackgroundFile = null;

    account.entityAttachments =
      account.entityAttachments.filter(
        item =>
          Number(item.attachmentCategoryId) !==
          Number(categoryId)
      );

    account.coverUrl = null;
  }

  if (
    event?.attachmentType === 'IMAGE'
  ) {
    const index = Number(event?.index);

    if (
      !Number.isNaN(index) &&
      index >= 0 &&
      index < this.pendingImageFiles.length
    ) {
      this.pendingImageFiles[index] = null;
    }

    if (event?.attachment) {
      account.entityAttachments =
        account.entityAttachments.filter(
          item =>
            item !== event.attachment &&
            item?.id !== event.attachment?.id &&
            item?.guid !== event.attachment?.guid
        );
    }
  }

  this.markAttachmentsTouched();
}


private getAttachmentCategoryId(
  attachmentType:
    'LOGO' |
    'BANNER' |
    'IMAGE'
): number | null {

  switch (attachmentType) {
    case 'LOGO':
      return this.logoAttachmentCategory?.id ?? null;

    case 'BANNER':
      return this.bannerAttachmentCategory?.id ?? null;

    case 'IMAGE':
      return this.imageAttachmentCategory?.id ?? null;

    default:
      return null;
  }
}



selectedGenericEntity:
  GenericSelectedEntity = {
    type: 'account',
    id: null
  };


  private buildLeftPanelSections(): void {
  const account =
    this.accountViewData?.account;

  if (!account) {
    this.leftPanelSections = [];
    return;
  }

  const branches =
    (account.branches ?? []).map(
      branchNode => {
        const branch =
          branchNode?.data?.branch;

        return {
          id: branch?.id,
          parentId: account.id,
          label:
            branch?.name ??
            branchNode?.label ??
            this.l('Branch'),

          icon: 'fa fa-building',
          type: 'branch',
          data: branch,

          children:
            (
              branch?.contactAddresses ??
              []
            ).map(address => ({
              id:
                address?.id ??
                address?.addressId,

              parentId:
                branch?.id,

              label:
                address?.name ??
                address?.addressLine1 ??
                this.l('Address'),

              icon:
                'fa fa-map-marker-alt',

              type: 'address',
              data: address
            }))
        };
      }
    );


}


private buildAccountLeftPanel(): void {
  const account =
    this.accountViewData?.account;

  if (!account) {
    this.leftPanelSections = [];
    return;
  }

  const accountNode: GenericEntityNode = {
    id: account.id,
    label: account.name,
    entityType: 'ACCOUNT',
    icon: 'fa fa-building',
    data: this.accountViewData,

    /*
     * No component means selecting this node
     * returns to the original projected account UI.
     */
    component: undefined,

    expanded: true,
    children: []
  };

  const branchNodes: GenericEntityNode[] =
    (account.branches ?? [])
      .map(branchNode => {
        const branch =
          branchNode?.data?.branch;

        if (!branch?.id) {
          return null;
        }

        const contactNodes =
          this.buildBranchContactNodes(
            branch
          );

        return {
          id: branch.id,

          label:
            branch.name ||
            branchNode.label ||
            this.l('Branch'),

          entityType: 'BRANCH',

          icon: 'fa fa-code-branch',

          parentId: account.id,

          component:
            BranchGenericComponent,

          /*
           * This data can be displayed until
           * GetBranchForEdit finishes.
           */
          data: {
            branch
          },

          context: {
            accountId: account.id,
            accountName: account.name,
            tenantId: account.tenantId
          },

          expanded: false,

          children: contactNodes
        } as GenericEntityNode;
      })
      .filter(
        (
          node
        ): node is GenericEntityNode =>
          !!node
      );

  this.leftPanelSections = [
    {
      key: 'account',
      title: this.l('Account'),
      type: 'tree',
      canAdd: false,
      items: [accountNode]
    },
    {
      key: 'branches',
      title: this.l('Branches'),
      type: 'tree',
      canAdd: true,
      items: branchNodes
    }
  ];
}


private buildBranchContactNodes(
  branch: any
): GenericEntityNode[] {

  const contacts =
    branch.contacts ??
    branch.branchContacts ??
    [];

  if (!Array.isArray(contacts)) {
    return [];
  }

  return contacts
    .filter(contact => !!contact?.id)
    .map(contact => ({
      id: contact.id,

      label:
        contact.name ||
        `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim() ||
        this.l('Contact'),

      entityType: 'CONTACT',

      icon: 'fa fa-user',

      parentId: branch.id,

      /*
       * Add ContactGenericComponent later.
       * Until then, this node will not open.
       */
      component: undefined,

      data: {
        contact
      },

      context: {
        branchId: branch.id,
        accountId: branch.accountId
      }
    }));
}

onDynamicEntitySaved(event: any): void {
  if (
    event?.node?.entityType ===
    'BRANCH'
  ) {
    this.reloadAccountTree();
  }
}

private reloadAccountTree(): void {
  if (!this.selectedAccountId) {
    return;
  }

  this._accountsServiceProxy
    .getAccountForView(
      this.selectedAccountId,
      5
    )
    .subscribe(result => {
      this.accountViewData = result;
      this.buildAccountLeftPanel();
    });
}

}
