import {
    Component,
    EventEmitter,
    Injector,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { SelectItem } from 'primeng/api';

import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';

import {
    AccountDto,
    AccountLevelEnum,
    AccountsServiceProxy,
    AppEntitiesServiceProxy,
    CreateOrEditAccountInfoDto,
    CurrencyInfoDto,
    GetAccountInfoForEditOutput,
    LookupLabelDto,
    SycIdentifierDefinitionsServiceProxy,
    AppEntityAttachmentDto,
  SycAttachmentCategoryDto,
  AppEntityExtraDataDto
} from '@shared/service-proxies/service-proxies';

import { ImageUploadComponentOutput } from '@app/shared/common/image-upload/image-upload.component';

import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { IAjaxResponse, TokenService } from 'abp-ng2-module';
import { TenantContactMode, TenantContactType } from '@app/main/accountInfos/models/Account-info-page-tabs.enum';
@Component({
    selector: 'app-tenant-contact-create-edit',
    templateUrl: './tenant-contact-create-edit.component.html',
    styleUrls: ['./tenant-contact-create-edit.component.scss'],
})
export class TenantContactCreateEditComponent
    extends AppComponentBase
    implements OnInit
{
    @ViewChild('tenantContactForm', { static: true }) tenantContactForm: NgForm;

    @Input() accountId?: number;
    @Input() contactType: TenantContactType = TenantContactType.Manual;
    @Input() mode: TenantContactMode = TenantContactMode.Create;

    @Output() saved = new EventEmitter<AccountDto>();
    @Output() cancelled = new EventEmitter<void>();

    TenantContactMode = TenantContactMode;
    TenantContactType = TenantContactType;
    accountLevelEnum = AccountLevelEnum;

    attachmentBaseUrl = AppConsts.attachmentBaseUrl;

    accountInfoData: CreateOrEditAccountInfoDto =new CreateOrEditAccountInfoDto();

    accountDataForView?: AccountDto;
    getForEditResult?: GetAccountInfoForEditOutput;

    allPhoneTypes: LookupLabelDto[] = [];
    allCurrencies: CurrencyInfoDto[] = [];
    allLanguages: LookupLabelDto[] = [];
    accountTypes: SelectItem[] = [];


    companyLogo: any;
    coverPhoto: any;
    OtherImages1: any;
    OtherImages2: any;
    OtherImages3: any;
    OtherImages4: any;

    logoId?: number;
    bannerId?: number;
    Image1Id?: number;
    Image2Id?: number;
    Image3Id?: number;
    Image4Id?: number;



    saving = false;
    loading = false;
    touched = false;

    private hasRequestedManualCode = false;
    public uploader: FileUploader;

sycAttachmentCategoryLogo: SycAttachmentCategoryDto;
sycAttachmentCategoryBanner: SycAttachmentCategoryDto;
sycAttachmentCategoryImage: SycAttachmentCategoryDto;

otherImageSlots = [
  { index: 1, preview: undefined },
  { index: 2, preview: undefined },
  { index: 3, preview: undefined },
  { index: 4, preview: undefined }
];

    roles:any
            selectedRoles!: any[];
allStatus:any
           @Input()  accountData
    constructor(
        injector: Injector,
        private _accountsServiceProxy: AccountsServiceProxy,
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _sycIdentifierDefinitionsServiceProxy: SycIdentifierDefinitionsServiceProxy,
        private _tokenService: TokenService
    ) {
        super(injector);
        this.initDto();
    }

    ngOnInit(): void {
                this.roles = [
            { name: 'Buyer' },
            { name: 'Seller' },
            { name: 'Sales Rep' },
            { name: 'Buying Office' },
         
        ];
        this.allStatus = [
                   { name: 'Active' },
            { name: 'Inactive' },
            { name: 'Hold' },
            { name: 'Cancelled' },
        ]

  this.initUploaders();
  this.loadAttachmentCategories();
  this.loadInitData();

  if (this.isEdit && this.accountId) {
    this.getAccountDataForEdit();
  } else {
    this.prepareCreateMode();
  }
}

    get isCreate(): boolean {
        return this.mode === TenantContactMode.Create;
    }

    get isEdit(): boolean {
        return this.mode === TenantContactMode.Edit;
    }

    get isManual(): boolean {
        return this.contactType === TenantContactType.Manual;
    }

    get isConnected(): boolean {
        return this.contactType === TenantContactType.Connected;
    }

    get title(): string {
        if (this.isCreate) return this.l('AddManualAccount');
        if (this.isManual) return this.l('EditManualAccount');
        return this.l('EditConnectedAccount');
    }

    private initDto(): void {
        this.accountInfoData = new CreateOrEditAccountInfoDto();
        this.accountInfoData.entityAttachments = [];
        this.accountInfoData.entityCategories = [];
        this.accountInfoData.entityClassifications = [];
        this.accountInfoData.contactAddresses = [];
        this.accountInfoData.contactPaymentMethods = [];
        this.accountInfoData.branches = [];
    }

    private ensureArrays(): void {
        this.accountInfoData.entityAttachments ??= [];
        this.accountInfoData.entityCategories ??= [];
        this.accountInfoData.entityClassifications ??= [];
        this.accountInfoData.contactAddresses ??= [];
        this.accountInfoData.contactPaymentMethods ??= [];
        this.accountInfoData.branches ??= [];
    }

    private prepareCreateMode(): void {
        this.accountInfoData.accountLevel = AccountLevelEnum.Manual;
        this.accountInfoData.accountTypeId ||= 19;
        this.accountInfoData.accountType ||= 'Business';
        this.accountInfoData.currencyId ||= this.tenantDefaultCurrency?.value;

        this.setManualAccCode();
        this.ensureArrays();
    }



    loadInitData(): void {
        this.accountInfoData.currencyId ||= this.tenantDefaultCurrency?.value;

        this.getLanguages();
        this.getCurrencies();
        this.getPhoneTypes();
        this.getAccountTypes();
    }

    getAccountDataForEdit(): void {
        this.loading = true;
        this.showMainSpinner();

        this._accountsServiceProxy
            .getAccountForEdit(this.accountId)
            .pipe(
                finalize(() => {
                    this.loading = false;
                    this.hideMainSpinner();
                })
            )
            .subscribe((res) => {
                this.getForEditResult = res;
                this.accountInfoData = CreateOrEditAccountInfoDto.fromJS(
                    res.accountInfo
                );

                this.ensureArrays();
                this.setAttachmentPreviewImages();


                this.getAccountDataForView();
            });
    }

    getAccountDataForView(): void {
        if (!this.accountId) return;

        this._accountsServiceProxy
            .getAccountForView(this.accountId, 5)
            .subscribe((result) => {
                this.accountDataForView = result?.account;

                if (this.accountDataForView?.logoUrl) {
                    this.companyLogo = `${this.attachmentBaseUrl}/${this.accountDataForView.logoUrl}`;
                }

                if (this.accountDataForView?.coverUrl) {
                    this.coverPhoto = `${this.attachmentBaseUrl}/${this.accountDataForView.coverUrl}`;
                }
            });
    }

    getPhoneTypes(): void {
        this._appEntitiesServiceProxy
            .getAllPhoneTypeForTableDropdown()
            .subscribe((result) => {
                this.allPhoneTypes = result ?? [];
                this.setDefaultPhoneTypes();
            });
    }

    getLanguages(): void {
        this._appEntitiesServiceProxy
            .getAllLanguageForTableDropdown()
            .subscribe((result) => {
                this.allLanguages = result ?? [];
            });
    }

    getCurrencies(): void {
        this._appEntitiesServiceProxy
            .getAllCurrencyForTableDropdown()
            .subscribe((result) => {
                this.allCurrencies = result ?? [];
            });
    }

    getAccountTypes(): void {
        this._appEntitiesServiceProxy
            .getAllAccountTypesForTableDropdown()
            .subscribe((result) => {
                this.accountTypes = result ?? [];

                if (this.isCreate && !this.accountInfoData.accountTypeId) {
                    this.accountInfoData.accountTypeId = 19;
                    this.accountInfoData.accountType = 'Business';
                }
            });
    }


    private setDefaultPhoneTypes(): void {
        if (!this.allPhoneTypes?.length) return;

        if (!this.accountInfoData.phone1TypeId) {
            this.accountInfoData.phone1TypeId = this.allPhoneTypes[0].value;
        }
    }

    private async setManualAccCode(): Promise<void> {
        if (!this.isCreate || !this.isManual || this.hasRequestedManualCode) {
            return;
        }

        if (this.accountInfoData.code) return;

        this.hasRequestedManualCode = true;

        const accountTypeCode =
            this.accountInfoData.accountTypeId === 21
                ? 'PERSONAL'
                : this.accountInfoData.accountTypeId === 20
                ? 'GROUP'
                : 'BUSINESS';

        const sequence =
            await this._sycIdentifierDefinitionsServiceProxy
                .getNextEntityCode(accountTypeCode, this.appSession.tenantId)
                .toPromise();

        if (sequence && !this.accountInfoData.code) {
            this.accountInfoData.code = 'M' + sequence;
            this.changeTouchState();
        }
    }

    changeTouchState(): void {
        this.touched = true;
    }

    resetFormData(): void {
        this.touched = false;

        if (this.isEdit && this.getForEditResult) {
            this.accountInfoData = CreateOrEditAccountInfoDto.fromJS(
                this.getForEditResult.accountInfo
            );
            this.ensureArrays();
            this.setAttachmentPreviewImages();

            setTimeout(() => {
                this.tenantContactForm?.form?.patchValue(
                    this.accountInfoData.toJSON()
                );
            });

            return;
        }

        this.initDto();
        this.prepareCreateMode();
        this.tenantContactForm?.resetForm(this.accountInfoData);
    }

    cancel(): void {
        this.cancelled.emit();
    }

    save(): void {
  // if (!this.tenantContactForm?.form?.valid) return;

  if (this.uploader?.isUploading) {
    this.notify.info(this.l('WaitUntilUploadingImagesIsCompleted'));
    return;
  }

  this.saving = true;
  this.ensureArrays();

  this.accountInfoData.accountLevel = this.isManual
    ? AccountLevelEnum.Manual
    : AccountLevelEnum.External;

  if (this.isConnected) {
    this.applyConnectedLimitedEdit();
  }

  this._accountsServiceProxy
    .createOrEditAccount(this.accountInfoData)
    .pipe(finalize(() => (this.saving = false)))
    .subscribe((result: any) => {
      this.touched = false;
      this.notify.success(this.l('SavedSuccessfully'));
      this.saved.emit(result?.account || result?.accountInfo || result);
    }, () => {
      this.touched = true;
    });
}

    private applyConnectedLimitedEdit(): void {
        // Keep this method if connected edit uses same component.
        // For manual account it does nothing.
        if (!this.isConnected) return;

        const current = this.accountInfoData as any;

        this.accountInfoData = CreateOrEditAccountInfoDto.fromJS({
            id: current.id,
            code: current.code,
            website: current.website,
            phone1TypeId: current.phone1TypeId,
            phone1Number: current.phone1Number,
            languageId: current.languageId,
            entityAttachments: current.entityAttachments,
            contactAddresses: current.contactAddresses,
            branches: current.branches,
            accountLevel: AccountLevelEnum.External,
        });
    }

  onLogoUpload(event: ImageUploadComponentOutput): void {
  this.companyLogo = event.image;
  // this.logoFile = event.file;
  this.changeTouchState();
}

    removeLogo(): void {
        this.companyLogo = undefined;
        this.removeAttachmentByCategoryCode('LOGO');
        this.changeTouchState();
    }

    onCoverUpload(event: any): void {
        this.coverPhoto = this.getImageUrlFromUploadEvent(event);
        this.upsertAttachmentFromUpload(event, 'BANNER');
        this.changeTouchState();
    }

    removeCover(): void {
        this.coverPhoto = undefined;
        this.removeAttachmentByCategoryCode('BANNER');
        this.changeTouchState();
    }

    onOtherImageUpload(event: any, index: number): void {
        const value = this.getImageUrlFromUploadEvent(event);

        if (index === 1) this.OtherImages1 = value;
        if (index === 2) this.OtherImages2 = value;
        if (index === 3) this.OtherImages3 = value;
        if (index === 4) this.OtherImages4 = value;

        this.upsertAttachmentFromUpload(event, 'IMAGE', index);
        this.changeTouchState();
    }

    removeOtherImage(index: number): void {
        if (index === 1) this.OtherImages1 = undefined;
        if (index === 2) this.OtherImages2 = undefined;
        if (index === 3) this.OtherImages3 = undefined;
        if (index === 4) this.OtherImages4 = undefined;

        this.accountInfoData.entityAttachments =
            this.accountInfoData.entityAttachments?.filter(
                (x: any) => x.index !== index
            ) ?? [];

        this.changeTouchState();
    }

    private getImageUrlFromUploadEvent(event: any): string {
        const url =
            event?.url ||
            event?.fileUrl ||
            event?.result?.url ||
            event?.result?.fileName ||
            event?.fileName ||
            event;

        if (!url) return undefined;

        if (typeof url === 'string' && url.startsWith('http')) {
            return url;
        }

        return `${this.attachmentBaseUrl}/${url}`;
    }

    private upsertAttachmentFromUpload(
        event: any,
        categoryCode: 'LOGO' | 'BANNER' | 'IMAGE',
        index?: number
    ): void {
        this.ensureArrays();

        const url =
            event?.url ||
            event?.fileName ||
            event?.result?.url ||
            event?.result?.fileName ||
            event;

        if (!url) return;

        const attachment: any = {
            url,
            fileName: event?.fileName || event?.result?.fileName || url,
            attachmentCategoryCode: categoryCode,
            index,
        };

        if (categoryCode === 'IMAGE' && index) {
            this.accountInfoData.entityAttachments =
                this.accountInfoData.entityAttachments.filter(
                    (x: any) => x.index !== index
                );
        } else {
            this.removeAttachmentByCategoryCode(categoryCode);
        }

        this.accountInfoData.entityAttachments.push(attachment);
    }

    private removeAttachmentByCategoryCode(
        categoryCode: 'LOGO' | 'BANNER' | 'IMAGE'
    ): void {
        this.accountInfoData.entityAttachments =
            this.accountInfoData.entityAttachments?.filter(
                (x: any) =>
                    x.attachmentCategoryCode !== categoryCode &&
                    x.categoryCode !== categoryCode
            ) ?? [];
    }

  private setAttachmentPreviewImages(): void {
  const attachments: any[] = this.accountInfoData.entityAttachments ?? [];

  const logo = attachments.find(x =>
    x.attachmentCategoryCode === 'LOGO' ||
    x.index === -1 ||
    x.attachmentCategoryId === this.sycAttachmentCategoryLogo?.id
  );

  const banner = attachments.find(x =>
    x.attachmentCategoryCode === 'BANNER' ||
    x.index === -2 ||
    x.attachmentCategoryId === this.sycAttachmentCategoryBanner?.id
  );

  const images = attachments.filter(x =>
    x.attachmentCategoryCode === 'IMAGE' ||
    x.attachmentCategoryId === this.sycAttachmentCategoryImage?.id ||
    x.index > 0
  );

  this.companyLogo = logo?.url ? `${this.attachmentBaseUrl}/${logo.url}` : undefined;
  this.coverPhoto = banner?.url ? `${this.attachmentBaseUrl}/${banner.url}` : undefined;

  this.otherImageSlots.forEach(slot => {
    const found = images.find(x => x.index === slot.index) || images[slot.index - 1];
    slot.preview = found?.url ? `${this.attachmentBaseUrl}/${found.url}` : undefined;
  });

  this.OtherImages1 = this.otherImageSlots[0].preview;
  this.OtherImages2 = this.otherImageSlots[1].preview;
  this.OtherImages3 = this.otherImageSlots[2].preview;
  this.OtherImages4 = this.otherImageSlots[3].preview;
}






    loadAttachmentCategories(): void {
  this.getSycAttachmentCategoriesByCodes(['LOGO', 'BANNER', 'IMAGE'])
    .subscribe((result) => {
      this.sycAttachmentCategoryLogo = result.find(x => x.code === 'LOGO');
      this.sycAttachmentCategoryBanner = result.find(x => x.code === 'BANNER');
      this.sycAttachmentCategoryImage = result.find(x => x.code === 'IMAGE');
    });
}

initUploaders(): void {
  this.uploader = this.createUploader('/Attachment/UploadFiles');
}

createUploader(url: string): FileUploader {
  const uploader = new FileUploader({
    url: AppConsts.remoteServiceBaseUrl + url
  });

  uploader.onAfterAddingFile = (file) => {
    file.withCredentials = false;
  };

  const uploaderOptions: Partial<FileUploaderOptions> = {
    authToken: 'Bearer ' + this._tokenService.getToken(),
    removeAfterUpload: true
  };

  uploader.setOptions(uploaderOptions as FileUploaderOptions);

  return uploader;
}

imageBrowseDone(
  event: ImageUploadComponentOutput,
  type: 'LOGO' | 'BANNER' | 'IMAGE',
  index: number
): void {
  if (!event?.file) return;

  this.ensureArrays();

  const guid = this.guid();
  const category = this.getCategoryByType(type);

  if (!category?.id) {
    this.message.warn(this.l('AttachmentCategoryNotLoaded'));
    return;
  }

  this.setPreview(type, index, event.image);

  this.upsertAttachment({
    attachmentCategoryId: category.id,
    attachmentCategoryCode: type,
    fileName: event.file.name,
    guid,
    index
  } as any);

  this.uploader.addToQueue([event.file]);

  this.uploader.onBuildItemForm = (_fileItem: any, form: any) => {
    form.append('guid', guid);
  };

  this.uploader.onSuccessItem = (_item, response) => {
    const ajaxResponse = JSON.parse(response || '{}') as IAjaxResponse;

    if (!ajaxResponse?.success) {
      this.message.error(ajaxResponse?.error?.message || this.l('UploadFailed'));
      return;
    }

    const uploaded = ajaxResponse.result;
    const current = this.accountInfoData.entityAttachments
      .find((x: any) => x.guid === uploaded?.guid || x.guid === guid) as any;

    if (current) {
      current.id = uploaded?.id || current.id;
      current.url = uploaded?.url || uploaded?.fileName || current.url;
    }

    this.notify.info(this.l('UploadSuccessfully'));
  };

  this.uploader.uploadAll();
  this.changeTouchState();
}

removeImage(type: 'LOGO' | 'BANNER' | 'IMAGE', index: number): void {
  this.setPreview(type, index, undefined);

  this.accountInfoData.entityAttachments =
    this.accountInfoData.entityAttachments?.filter((x: any) => {
      if (type === 'IMAGE') return x.index !== index;
      return x.attachmentCategoryCode !== type && x.index !== index;
    }) ?? [];

  this.changeTouchState();
}

private getCategoryByType(type: 'LOGO' | 'BANNER' | 'IMAGE'): SycAttachmentCategoryDto {
  if (type === 'LOGO') return this.sycAttachmentCategoryLogo;
  if (type === 'BANNER') return this.sycAttachmentCategoryBanner;
  return this.sycAttachmentCategoryImage;
}

private setPreview(type: 'LOGO' | 'BANNER' | 'IMAGE', index: number, image: string): void {
  if (type === 'LOGO') this.companyLogo = image;
  if (type === 'BANNER') this.coverPhoto = image;

  if (type === 'IMAGE') {
    const slot = this.otherImageSlots.find(x => x.index === index);
    if (slot) slot.preview = image;

    if (index === 1) this.OtherImages1 = image;
    if (index === 2) this.OtherImages2 = image;
    if (index === 3) this.OtherImages3 = image;
    if (index === 4) this.OtherImages4 = image;
  }
}

private upsertAttachment(attachment: AppEntityAttachmentDto): void {
  const index = (attachment as any).index;

  this.accountInfoData.entityAttachments =
    this.accountInfoData.entityAttachments?.filter((x: any) => x.index !== index) ?? [];

  this.accountInfoData.entityAttachments.push(attachment);
}


buildMarketplaceRolesExtraData(): AppEntityExtraDataDto[] {
  if (!this.selectedRoles?.length) {
    return [];
  }

  const uniqueRoles = [...new Set(this.selectedRoles)].filter(Boolean);
  const joinedRoles = uniqueRoles.join('-');

  const dto = new AppEntityExtraDataDto();
  dto.entityId = this.accountData?.id || 0;
  dto.entityObjectTypeId = 610;
  dto.entityObjectTypeCode = 'MARKETPLACE-ROLE'; // keep your actual backend value
  dto.entityObjectTypeName = 'Marketplace Role';
  dto.attributeValueId = null;
  dto.attributeValue = joinedRoles;
  dto.attributeId = 610;
  dto.attributeValueFkName = null;
  dto.attributeValueFkCode = null;
  dto.attributeCode = 'MARKETPLACE-ROLE';
  dto.id = 0;

  return [dto];
}

updateMarketplaceRolesExtraData(): void {
  if (!this.accountData) {
    return;
  }

  this.accountData.entityExtraData = [
    ...(this.accountData.entityExtraData || []).filter(
      item => item.attributeCode !== 'MARKETPLACE-ROLE'
    ),
    ...this.buildMarketplaceRolesExtraData()
  ];
}


setSelectedMarketplaceRoles(): void {
  const marketplaceRole = this.accountData?.entityExtraData?.find(
    x => x.attributeCode === 'MARKETPLACE-ROLE'
  );

  this.selectedRoles = marketplaceRole?.attributeValue
    ? marketplaceRole.attributeValue.split('-').filter(x => x)
    : [];
}
}