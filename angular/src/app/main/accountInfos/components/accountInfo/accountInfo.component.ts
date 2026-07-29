import { Component, Injector, ViewEncapsulation, OnInit, Input, ViewChild, ChangeDetectorRef, } from '@angular/core';
import { CurrencyInfoDto, AccountsServiceProxy, CreateOrEditAccountInfoDto, AppEntitiesServiceProxy, LookupLabelDto, AppEntityClassificationDto, AppEntityCategoryDto, SycAttachmentCategoriesServiceProxy, SycAttachmentCategorySycAttachmentCategoryLookupTableDto, GetSycAttachmentCategoryForViewDto, AppEntityAttachmentDto, BranchDto, AppContactAddressDto, TreeNodeOfGetSycEntityObjectCategoryForViewDto, TreeNodeOfGetSycEntityObjectClassificationForViewDto, AccountLevelEnum, GetAccountInfoForEditOutput, GetAccountForViewDto, AccountDto, SessionServiceProxy, ContactDto, MemberFilterTypeEnum, SycEntityObjectClassificationDto, SycIdentifierDefinitionsServiceProxy, SycAttachmentCategoryDto, MarketplaceAccountsServiceProxy, AppEntityExtraDataDto, ConnectionInfo, AppTransactionServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { ActivatedRoute } from '@angular/router';
import { AbpSessionService, IAjaxResponse, TokenService } from 'abp-ng2-module';
import { AppConsts } from '@shared/AppConsts';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { ImageCropperComponent } from '@app/shared/common/image-cropper/image-cropper.component';
import { SelectCategoriesDynamicModalComponent } from '@app/categories/select-categories-dynamic-modal.component';
import { SelectClassificationDynamicModalComponent } from '@app/classification/select-classification-dynamic-modal.component';
import { Router } from '@angular/router';
import { UpdateLogoService } from '@shared/utils/update-logo.service';
import { LazyLoadEvent, SelectItem } from 'primeng/api';
import { AccountInfoPageTabs } from '../../models/Account-info-page-tabs.enum';
import { MembersListComponentInputsI } from '@app/main/members-list/models/member-list-component-interface';
import { ViewMemberProfileComponent } from '@app/main/teamMembers/components/view-member-profile/view-member-profile.component';
import { NgForm } from '@angular/forms';
import { CreateOrEditMemberComponent } from '@app/main/teamMembers/components/create-or-edit-member/create-or-edit-member.component';
import { ViewMemberProfileComponentInputsI } from '@app/main/teamMembers/models/view-member-profile-model';
import { MembersListComponent } from '@app/main/members-list/components/members-list/members-list.component';
import { ImageUploadComponentOutput } from '@app/shared/common/image-upload/image-upload.component';
import { Paginator } from 'primeng/paginator';
import { Location } from '@angular/common';
@Component({
    selector: 'app-account-info',
    templateUrl: './accountInfo.component.html',
    styleUrls: ['./accountInfo.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()],
    providers: [MarketplaceAccountsServiceProxy]
})
export class AccountInfoComponent extends AppComponentBase implements OnInit {

    @Input('accountLevel') accountLevel: AccountLevelEnum = AccountLevelEnum.Profile
    @ViewChild('createOrEditMember', { static: true }) createOrEditMember: CreateOrEditMemberComponent
    @ViewChild('viewMemberProfile', { static: true }) viewMemberProfile: ViewMemberProfileComponent
    @ViewChild('memberListComponent', { static: true }) memberListComponent: MembersListComponent
    @ViewChild('paginatorClass') paginatorClass: Paginator
    @ViewChild('paginatorCateg') paginatorCateg: Paginator
    @ViewChild('accountInfoForm', { static: true }) accountInfoForm: NgForm

    @Input('viewMode') viewMode: boolean = false
    @Input('accountId') accountId: number = this.appSession?.user?.accountId
    @Input('AccountInfo') accountInfoTemp: CreateOrEditAccountInfoDto = new CreateOrEditAccountInfoDto()
    @Input('fromMarketplace') fromMarketplace: boolean = false;
    @Input('fromManualAcc') fromManualAcc: boolean;

    primengTableHelperClass = new PrimengTableHelper();
    primengTableHelperCateg = new PrimengTableHelper();

    accountLevelEnum = AccountLevelEnum
    accountInfoPageTabsEnum = AccountInfoPageTabs

    attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
    public uploader: FileUploader;

    phone1TypeIdName = '';
    phone2TypeIdName = '';
    phone3TypeIdName = '';
    currencyIdName = '';
    languageIdName = '';
    isHost: boolean



    categoriesIds: number[] = [];
    classificationsIds: number[] = [];

    allPhoneTypes: LookupLabelDto[];
    allCurrencies: CurrencyInfoDto[];
    allLanguages: LookupLabelDto[];
    allPriceLevel: SelectItem[] = [];
    accountTypes: SelectItem[] = [];
    allShipVia: LookupLabelDto[];
    allPaymentTerms: LookupLabelDto[];

    logoId: number;
    bannerId: number;
    Image1Id: number;
    Image2Id: number;
    Image3Id: number;
    Image4Id: number;

    companyLogo: any;
    coverPhoto: any;
    OtherImages1: any;
    OtherImages2: any;
    OtherImages3: any;
    OtherImages4: any;
    websiteValidation: boolean = false;
    loading: boolean = true;


    accountInfoLoded: any;
    phoneTypesLoaded: any;

    canPublish: boolean = false;
    displaySaveAccount: boolean = false;
    displayDeleteClassification: boolean = false;
    displayDeleteProductCategories: boolean = false;
    displayDeleteSubBranch: boolean = false;
    recordIdSubBranch: any;
    currentTab: AccountInfoPageTabs
    saving = false;


    sycAttachmentCategoryLogo: SycAttachmentCategoryDto
    sycAttachmentCategoryBanner: SycAttachmentCategoryDto
    sycAttachmentCategoryImage: SycAttachmentCategoryDto

    paymentTermsId;
    shipViaId;

    selectedMember: { memberId?: number, userId?: number } = {}

    accountDataForView: AccountDto
    accountContactForView: any
    entityExtraData: any
    isPublished: boolean;
    isSync: boolean;
    connectionCount: number;
    firstLoad: boolean = true

    entityObjectType: string = "";
    accountInfoOldCurrencyId = 0;
    changeCurrency: boolean = false;



    getForEditResult: GetAccountInfoForEditOutput
    touched: boolean = false
    isRecordOwner: boolean


    imgCropperModalRef: BsModalRef
    accData: GetAccountForViewDto
    editedContactPerData: any
    relationId: number = 0;
    roles: any
    selectedRoles!: any[];
    roleSeller: boolean = false;
    connectionsInfo :ConnectionInfo [] =[];
    availableConnectionsInfo :ConnectionInfo [] =[];

    availableConnections: any[] = [];
    selectedConnection: any = null;
    showConnectionPopup = false;
    previousSelectedRoles: string[] = [];
    isRestoringRoles = false;
    constructor(
        injector: Injector,
        private _route: ActivatedRoute,
        private _AccountsServiceProxy: AccountsServiceProxy,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _tokenService: TokenService,
        private _BsModalService: BsModalService,
        private _router: Router,
        private _abpSessionService: AbpSessionService,
        private updateLogoService: UpdateLogoService,
        private _activatedRoute: ActivatedRoute,
        private _sycIdentifierDefinitionsServiceProxy: SycIdentifierDefinitionsServiceProxy,
        private _marketplaceAccountsServiceProxy: MarketplaceAccountsServiceProxy,
         private AppTransactionServiceProxy:AppTransactionServiceProxy
        


    ) {
        super(injector);

        this.accountInfoTemp = new CreateOrEditAccountInfoDto();
        this.accountInfoTemp.entityClassifications = [];
        this.accountInfoTemp.entityCategories = [];

    }



    async ngOnInit() {

        this.roles = [
            { name: 'Buyer' },
            { name: 'Seller' },
            { name: 'Sales Rep' },
            { name: 'Buying Office' },

        ];

        if (this.accountLevel == null) {
            this.accountLevel = AccountLevelEnum.Profile
        }

        await this.handleComponentMode();
        this.getLoginAccountDataForView()
        this.isHost = !this._abpSessionService.tenantId;
        this.handleRoutingChange();
        this.initUploaders();
        this.GetContactDefaults();
        this.getRelationshipRoles(this._abpSessionService.tenantId, this.accountDataForView.ssin).subscribe(roles => {
            this.roleSeller = (roles || []).some(r =>
                (r.requesterMarketplaceRole || '').toLowerCase().includes('seller') ||
                (r.recipientMarketplaceRole || '').toLowerCase().includes('seller')
            );

        });
    }

    get isExternalAccount(): boolean { return this.accountLevel == AccountLevelEnum.External && !this.viewMode }
    get isExternalAccountCreate(): boolean { return this.isExternalAccount && !Boolean(this.accountId) }
    get isExternalAccountEdit(): boolean { return this.isExternalAccount && Boolean(this.accountId) }

    get isManualAccount(): boolean { return this.accountLevel == AccountLevelEnum.Manual && !this.viewMode }
    get isManualAccountCreate(): boolean { return this.isManualAccount && !Boolean(this.accountId) }
    get isManualAccountEdit(): boolean { return this.isManualAccount && Boolean(this.accountId) }

    get isMyAccount(): boolean { return this.accountLevel == AccountLevelEnum.Profile && !this.viewMode }
    get isMyAccountCreate(): boolean { return this.isMyAccount && !Boolean(this.accountId) }
    get isMyAccountEdit(): boolean { return this.isMyAccount && Boolean(this.accountId) }

    get otherAccount(): boolean { return this.viewMode }

    GetContactDefaults() {
        this._AccountsServiceProxy.getContactDefaults()
            .subscribe((res) => {
                this.paymentTermsId = res.paymentTermsId;
                this.shipViaId = res.shipViaId;
            });
    }
    handleRoutingChange() {
        this._route.queryParamMap.subscribe(paramsObj => {
            const params = paramsObj['params']
            const currentTab: string = params['tab']
            this.selectedMember = {
                userId: params['userId'],
                memberId: params['memberId']
            }

            if (this.firstLoad)
                this.firstLoad = false
            else {
                if (Object.keys(params).length === 0) return
            }
            const noSelectedTabs: boolean = isNaN(AccountInfoPageTabs[currentTab])
            const isCreateMode = this.isMyAccountCreate || this.isExternalAccountCreate || this.isManualAccountCreate
            this.currentTab = AccountInfoPageTabs[currentTab]

            if (noSelectedTabs) {
                if (this.isMyAccountEdit || this.isExternalAccountEdit || this.isManualAccountEdit || this.otherAccount) return this.changeTab(AccountInfoPageTabs.ProfileView)
                if (isCreateMode) return this.changeTab(AccountInfoPageTabs.ProfileCreateOrEdit)
            }

            this.currentTab = AccountInfoPageTabs[currentTab]
            switch (currentTab) {
                case this.accountInfoPageTabsEnum[AccountInfoPageTabs.ViewMember] || this.accountInfoPageTabsEnum[AccountInfoPageTabs.ViewContact]:
                    this.openViewMemberProfile()
                    break;
                case this.accountInfoPageTabsEnum[AccountInfoPageTabs.MembersList] || this.accountInfoPageTabsEnum[AccountInfoPageTabs.ContactsList]:
                    this.openMembersList()
                    break;
                case this.accountInfoPageTabsEnum[AccountInfoPageTabs.CreateOrEditMember] || this.accountInfoPageTabsEnum[AccountInfoPageTabs.CreateOrEditContact]:
                    this.openCreateOrEditMember()
                    break;
                case this.accountInfoPageTabsEnum[AccountInfoPageTabs.ProfileCreateOrEdit]:
                    if (this.isMyAccount) this.getMyAccountDataForEdit()
                    else if (this.isManualAccountEdit || this.isExternalAccountEdit || this.accountDataForView?.isConnected) this.getAccountDataForEdit()
                    break;
                default:
                    break;
            }

        });
    }


    initUploaders(): void {
        this.uploader = this.createUploader(
            '/Attachment/UploadFiles',
            result => {
            }
        );

    }

    createUploader(url: string, success?: (result: any) => void): FileUploader {
        const uploader = new FileUploader({ url: AppConsts.remoteServiceBaseUrl + url });

        uploader.onAfterAddingFile = (file) => {
            file.withCredentials = false;
        };

        uploader.onSuccessItem = (item, response, status) => {
            const ajaxResponse = <IAjaxResponse>JSON.parse(response);
            if (ajaxResponse?.success) {
                this.notify.info(this.l('UploadSuccessfully'));
                if (success) {
                    success(ajaxResponse.result);
                }
            } else {
                this.message.error(ajaxResponse.error.message);
            }
        };

        const uploaderOptions: Partial<FileUploaderOptions> = {};
        uploaderOptions.authToken = 'Bearer ' + this._tokenService.getToken();
        uploaderOptions.removeAfterUpload = true;
        uploader.setOptions(uploaderOptions as FileUploaderOptions);
        return uploader;
    }

    guid(): string {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    getPhoneTypes() {
        this._AppEntitiesServiceProxy.getAllPhoneTypeForTableDropdown().subscribe(result => {
            this.allPhoneTypes = result;
            this.phoneTypesLoaded = true;
            this.setDefaultPhoneTypes();

        });
    }

    getLanguages() {
        this._AppEntitiesServiceProxy.getAllLanguageForTableDropdown().subscribe(result => {
            this.allLanguages = result;
        });
    }

    getCurrencies() {
        this._AppEntitiesServiceProxy.getAllCurrencyForTableDropdown().subscribe(result => {
            this.allCurrencies = result;
        });
    }



    async handleComponentMode() {

        if (this.isExternalAccount || this.isManualAccount) { // EditManualOrExternal Account
            this.accountInfoTemp.accountLevel = this.accountLevel
            if (this.accountId) {
                await this.getAccountDataForView()
            }
            else { // create ManualOrExternal Account
                this.loadInitData()
                this.setProfileData()
            }
        }

        // MyAccount Account
        if (this.isMyAccount) {
            this.accountId = this.appSession.user.accountId
            if (this.accountId) { // edit
                await this.getMyAccountDataForView()
            } else { // create
                this.loadInitData()
                this.setProfileData()
            }
        }

        // ViewOthers Account
        if (this.otherAccount) {
            return this.getAccountDataForView()
        }

    }

    loadInitData() {
        if (this.accountInfoTemp)
            this.accountInfoTemp.currencyId = this.tenantDefaultCurrency.value;

        this.getLanguages();
        this.getCurrencies();
        this.getPhoneTypes();
        this.allPriceLevel = this.getPriceLevel();
        this.getShipVia();
        this.getPaymentTerms();
        this.getAccountTypes();
    }

    getShipVia() {
        this._AppEntitiesServiceProxy.getAllEntitiesByTypeCode('SHIPVIA')
            .subscribe((res) => {
                this.allShipVia = res;
            });
    }

    getPaymentTerms() {
        this._AppEntitiesServiceProxy.getAllEntitiesByTypeCode('PAYMENT-TERMS')
            .subscribe((res) => {
                this.allPaymentTerms = res;
            });
    }

    getAccountTypes() {
        this._AppEntitiesServiceProxy.getAllAccountTypesForTableDropdown()
            .subscribe(result => {
                const list = result ?? [];

                // const business = list.find(x => x.label === 'Business'); // x is scoped here
                // this.accountTypes = business ? [business] : [];

                this.accountTypes = list.filter(x =>
                    x?.code === 'BUSINESS' || x?.code === 'PERSONAL'
                );



            });
        // pick the id field your DTO actually uses:
        this.accountInfoTemp.accountTypeId = 19;
        this.accountInfoTemp.accountType = 'Business';

    }



    getAccountDataForEdit(): void {

        this.loadInitData()
        this.showMainSpinner()
        this._AccountsServiceProxy.getAccountForEdit(this.accountId)
            .pipe(
                finalize(
                    () => this.hideMainSpinner()
                )
            )
            .subscribe((res) => {
                this.getForEditResult = res
                this.setProfileData(res)
                this.setSelectedMarketplaceRoles();

            })
    }

    async getMyAccountDataForEdit() {

        this.loadInitData()
        const result = await this._AccountsServiceProxy.getMyAccountForEdit().toPromise()
        if (result) {
            this.getForEditResult = result
            this.accountInfoOldCurrencyId = this.getForEditResult?.accountInfo?.currencyId;
            this.setProfileData(result)
            this.setSelectedMarketplaceRoles();
            if (!result.accountInfo.id) {
                this.accountInfoTemp.name = this.appSession?.tenant?.name
                this.accountInfoTemp.tradeName = this.appSession?.tenant?.name
            }


            this.accountInfoTemp.paymentTermsId = !result?.accountInfo?.id ? this.paymentTermsId :
                result.accountInfo?.paymentTermsId ? result.accountInfo?.paymentTermsId : this.paymentTermsId;
            this.accountInfoTemp.shipViaId =
                !result?.accountInfo?.id ? this.shipViaId :
                    result.accountInfo?.shipViaId ? result.accountInfo?.shipViaId : this.shipViaId;

      


        }
    }
    resetFormData() {
        this.touched = false
        this.accountInfoTemp = new CreateOrEditAccountInfoDto()
        this.accountInfoForm.resetForm()
        this.setProfileData(this.getForEditResult)
        this.accountInfoForm.form.patchValue(this.accountInfoTemp.toJSON())
        this.companyLogo = this.accountDataForView?.logoUrl ? `${this.attachmentBaseUrl}/${this.accountDataForView?.logoUrl}` : undefined;
        this.coverPhoto = this.accountDataForView?.coverUrl ? `${this.attachmentBaseUrl}/${this.accountDataForView?.coverUrl}` : undefined;
        !this.accountInfoTemp?.id && !this.accountId ? this._router.navigate(['/app/main/accounts']) :   this.changeTab(this.accountInfoPageTabsEnum.ProfileView)
    
    }
    async getAccountDataForView() {

        this.showMainSpinner();
        let result;
        if (!this.fromMarketplace) {
            result = await this._AccountsServiceProxy.getAccountForView(this.accountId, 5)
                .toPromise()
                .finally(
                    () => {
                        this.hideMainSpinner()
                    }
                )
            this.accData = JSON.parse(JSON.stringify(result));
            this.relationId = result.relationId ? result.relationId : 0
            this.connectionsInfo = result.connectionsInfo ? result.connectionsInfo : []
            this.availableConnectionsInfo = result.availableConnections ? result.availableConnections : []
            this.entityExtraData = result ? result.entityExtraData : undefined

        }

        else {
            result = await this._marketplaceAccountsServiceProxy.getAccountForView(this.accountId, undefined, 5)
                .toPromise()
                .finally(
                    () => {
                        this.hideMainSpinner()
                    }
                )
        }


        this.isPublished = result ? result.isPublished : false;
        this.isSync = result ? result.isSync : false;
        this.connectionCount = result ? result.connectionCount : 0;
        this.accountDataForView = result ? result.account : undefined
        this.accountContactForView = result ? result.contact : undefined
        this.isRecordOwner = this.accountDataForView?.id == this.appSession.user?.accountId ? true : false
        if (this.accountDataForView?.logoUrl) this.companyLogo = `${this.attachmentBaseUrl}/${this.accountDataForView.logoUrl}`;
        if (this.accountDataForView?.coverUrl) this.coverPhoto = `${this.attachmentBaseUrl}/${this.accountDataForView.coverUrl}`;
    }

    async getMyAccountDataForView(hideSppiner:boolean = false) {
        let id = this.appSession.user.accountId
        if (!id) return
        if(!hideSppiner){
        this.showMainSpinner()

        }
        const result = await this._AccountsServiceProxy.getAccountForView(id, 5)
            .toPromise()
            .finally(
                () => this.hideMainSpinner()
            )
        this.isPublished = result ? result.isPublished : false;
        this.isSync = result ? result.isSync : false;
        this.connectionCount = result ? result.connectionCount : 0;
        this.accountDataForView = result ? result.account : undefined
        this.entityExtraData = result ? result.entityExtraData : undefined
        this.relationId = result.relationId ? result.relationId : 0
        this.connectionsInfo = result.connectionsInfo ? result.connectionsInfo : []
      
        this.accountContactForView = result ? result.contact : undefined
        this.isRecordOwner = this.accountDataForView?.id == this.appSession.user?.accountId ? true : false
        if (this.accountDataForView.logoUrl) this.companyLogo = `${this.attachmentBaseUrl}/${this.accountDataForView.logoUrl}`;
        if (this.accountDataForView.coverUrl) this.coverPhoto = `${this.attachmentBaseUrl}/${this.accountDataForView.coverUrl}`;
    }

    private hasRequestedCode = false;
    setProfileData(result: GetAccountInfoForEditOutput = undefined) {
        if (result) {
            this.accountInfoTemp = CreateOrEditAccountInfoDto.fromJS(result.accountInfo);
            this.canPublish = true;
            this.phone1TypeIdName = result.phone1TypeName;
            this.phone2TypeIdName = result.phone2TypeName;
            this.phone3TypeIdName = result.phone3TypeName;
            this.currencyIdName = result.currencyName;
            this.languageIdName = result.languageName;
        }
        if (this.isManualAccountCreate) {
            this.setManualAccCode()
        }

        if (!this.accountInfoTemp.entityAttachments) this.accountInfoTemp.entityAttachments = [];
        if (!this.accountInfoTemp.entityCategories) this.accountInfoTemp.entityCategories = [];
        if (!this.accountInfoTemp.entityClassifications) this.accountInfoTemp.entityClassifications = [];
        if (!this.accountInfoTemp.accountType) this.accountInfoTemp.accountType = '';
        if (!this.accountInfoTemp.accountTypeId) this.accountInfoTemp.accountTypeId = 0;

        if (!this.accountInfoTemp.contactAddresses) this.accountInfoTemp.contactAddresses = [];
        if (!this.accountInfoTemp.contactPaymentMethods) this.accountInfoTemp.contactPaymentMethods = [];
        if (!this.accountInfoTemp.branches) this.accountInfoTemp.branches = [];


        if (!this.accountInfoTemp.id && this.isMyAccount) {


            if (!this.accountInfoTemp.languageId && !this.hasRequestedCode) {
                this.hasRequestedCode = true;

                this._AccountsServiceProxy.getMyAccountForEdit().subscribe(async myResult => {
                    if (!myResult) {
                        return;
                    }


                    if (!this.accountInfoTemp.code) {
                        let sequance = '';

                        const typeCode =
                            myResult?.accountInfo?.accountTypeId == 19
                                ? 'BUSINESS'
                                : myResult?.accountInfo?.accountTypeId == 21
                                    ? 'PERSONAL'
                                    : 'GROUP';
                        this.entityObjectType = typeCode
                        const getNextEntityCodeRes = await this._sycIdentifierDefinitionsServiceProxy
                            .getNextEntityCode(typeCode, this.appSession.tenantId)
                            .toPromise();

                        if (getNextEntityCodeRes) {

                            sequance = getNextEntityCodeRes;
                            this.accountInfoTemp.code = 'M' + sequance;
                        }
                    }

                    // Default language
                    if (!this.accountInfoTemp.languageId) {
                        this.languageIdName = myResult.languageName;
                        this.accountInfoTemp.languageId = myResult.accountInfo.languageId;
                    }

                    // Default payment terms / ship via
                    this.accountInfoTemp.paymentTermsId = !myResult?.accountInfo?.id
                        ? this.paymentTermsId
                        : (myResult.accountInfo?.paymentTermsId ?? this.paymentTermsId);

                    this.accountInfoTemp.shipViaId = !myResult?.accountInfo?.id
                        ? this.shipViaId
                        : (myResult.accountInfo?.shipViaId ?? this.shipViaId);
                });
            }

        } else {

            this.accountInfoTemp.paymentTermsId = !this.accountInfoTemp?.id
                ? this.paymentTermsId
                : (result?.accountInfo?.paymentTermsId ?? this.paymentTermsId);

            this.accountInfoTemp.shipViaId = !this.accountInfoTemp?.id
                ? this.shipViaId
                : (result?.accountInfo?.shipViaId ?? this.shipViaId);
        }


        this.getAllForAccountInfo();
        this.accountInfoLoded = true;


        this.categoriesIds = [];
        this.accountInfoTemp.entityCategories.forEach(element => {
            this.categoriesIds.push(element.entityObjectCategoryId);
        });

        this.classificationsIds = [];
        this.accountInfoTemp.entityClassifications.forEach(element => {
            this.classificationsIds.push(element.entityObjectClassificationId);
        });

        setTimeout(() => {
            this.getCategories(undefined);
            this.getClassifications(undefined);
        }, 500);
    }



    getAllForAccountInfo() {
        this.getSycAttachmentCategoriesByCodes(['LOGO', "BANNER", "IMAGE"]).subscribe((result) => {
            result.forEach(item => {
                if (item.code == "LOGO") this.sycAttachmentCategoryLogo = item
                else if (item.code == "BANNER") this.sycAttachmentCategoryBanner = item
                else if (item.code == "IMAGE") this.sycAttachmentCategoryImage = item
            })
            if (!this.accountInfoTemp.entityAttachments) this.accountInfoTemp.entityAttachments = []
            if (this.accountInfoLoded && this.accountInfoTemp.entityAttachments != null && this.accountInfoTemp.entityAttachments != undefined && this.accountInfoTemp.entityAttachments.length > 0) {
                let logoIndex = this.accountInfoTemp.entityAttachments.findIndex(x => x.attachmentCategoryId == this.sycAttachmentCategoryLogo.id)
                let coverPhotoIndex = this.accountInfoTemp.entityAttachments.findIndex(x => x.attachmentCategoryId == this.sycAttachmentCategoryBanner.id)

                let OtherImages1Index: AppEntityAttachmentDto;
                let OtherImages2Index: AppEntityAttachmentDto;
                let OtherImages3Index: AppEntityAttachmentDto;
                let OtherImages4Index: AppEntityAttachmentDto;
                let arr = this.accountInfoTemp.entityAttachments.filter(x => x.attachmentCategoryId == this.sycAttachmentCategoryImage.id)
                if (arr.length > 0) {
                    OtherImages1Index = arr[0]
                    arr[0].index = 1
                }
                if (arr.length > 1) {
                    OtherImages2Index = arr[1]
                    arr[1].index = 2
                }
                if (arr.length > 2) {
                    OtherImages3Index = arr[2]
                    arr[2].index = 3
                }
                if (arr.length > 3) {
                    OtherImages4Index = arr[3]
                    arr[3].index = 4
                }

                if (logoIndex > -1) {
                    this.companyLogo = `${this.attachmentBaseUrl}/${this.accountInfoTemp.entityAttachments[logoIndex].url}`
                    this.logoId = this.accountInfoTemp.entityAttachments[logoIndex].id
                }
                if (coverPhotoIndex > -1) {
                    this.coverPhoto = `${this.attachmentBaseUrl}/${this.accountInfoTemp.entityAttachments[coverPhotoIndex].url}`
                }
                if (OtherImages1Index) {
                    this.OtherImages1 = `${this.attachmentBaseUrl}/${OtherImages1Index.url}`
                    this.Image1Id = OtherImages1Index.id
                }
                if (OtherImages2Index) {
                    this.OtherImages2 = `${this.attachmentBaseUrl}/${OtherImages2Index.url}`
                    this.Image2Id = OtherImages2Index.id
                }
                if (OtherImages3Index) {
                    this.OtherImages3 = `${this.attachmentBaseUrl}/${OtherImages3Index.url}`
                    this.Image3Id = OtherImages3Index.id
                }
                if (OtherImages4Index) {
                    this.OtherImages4 = `${this.attachmentBaseUrl}/${OtherImages4Index.url}`
                    this.Image4Id = OtherImages4Index.id
                }
            }
        })

    }

    changeTab(number: AccountInfoPageTabs, params?: { [key: string]: any }) {
        if (!this.firstLoad) {
            const isCreateMode = this.isMyAccountCreate || this.isExternalAccountCreate || this.isManualAccountCreate
            let prevCurrentTab: AccountInfoPageTabs = this.currentTab
            if (isCreateMode) {
                if (this.currentTab != undefined && this.currentTab !== this.accountInfoPageTabsEnum.ProfileCreateOrEdit && this.currentTab !== this.accountInfoPageTabsEnum.Branches)
                    this.notify.warn(this.l("PleaseCompleteAndSaveYourDataFirst"))
                number = AccountInfoPageTabs.ProfileCreateOrEdit
            }
            switch (prevCurrentTab) {
                case AccountInfoPageTabs.ContactsList:
                    this.memberListComponent.hide()
                    break;
                case AccountInfoPageTabs.MembersList:
                    this.memberListComponent.hide()
                    break;
                case AccountInfoPageTabs.ViewMember:
                    this.viewMemberProfile.hide()
                    break;
                case AccountInfoPageTabs.CreateOrEditContact:
                    this.createOrEditMember.hide()
                    break;
                case AccountInfoPageTabs.CreateOrEditMember:
                    this.createOrEditMember.hide()
                    break;
                default:
                    break;
            }
        }

        let currentTabName: string
        currentTabName = this.accountInfoPageTabsEnum[number]
        if (!params) params = {}
        params.tab = currentTabName
        const existedParams = { ...this._route.snapshot.queryParams }
        const existedParamsKeys: string[] = existedParams ? Object.keys(this._route.snapshot.queryParams) : []
        const newParamsKeys: string[] = params ? Object.keys(params) : []
        const existedParamsKeysToBeRemoved: string[] = existedParamsKeys.filter(oldKey => !newParamsKeys.includes(oldKey))
        existedParamsKeysToBeRemoved.forEach(param => {
            params[param] = null
        })



        this.__router.navigate(
            [],
            {
                relativeTo: this._activatedRoute,
                queryParams: params,
                queryParamsHandling: 'merge', // remove to replace all query params by provided
            }
        );

    }
    triggerProfile($event?) {
        if ($event) $event.stopPropagation() //prevent event bubbling
        if (this.currentTab == AccountInfoPageTabs.ProfileCreateOrEdit) {
            this.changeTab(AccountInfoPageTabs.ProfileView)
        } else {
            this.changeTab(AccountInfoPageTabs.ProfileCreateOrEdit)
        }
        if (!this.accountDataForView) this.getMyAccountDataForView()
    }
    getCotactData(event) {
        this.editedContactPerData = event



    }
    savePerData(event) {


        this.accountInfoTemp = event
        if (!this.accountInfoTemp.entityExtraData) {
            this.accountInfoTemp.entityExtraData = [];
        }
        this.accountInfoTemp.entityAttachments = this.editedContactPerData?.entityAttachments
        // Ensure attributes exist
        this.ensureAttribute(701); // first name
        this.ensureAttribute(702); // last name
        this.ensureAttribute(705); // title id
        this.ensureAttribute(707); // join date > date
        this.ensureAttribute(706); // jobTitle
        this.ensureAttribute(713); // join date is public > boolean
        this.ensureAttribute(708); // lang is public >> boolean
        this.ensureAttribute(710); // phone1IsPublic
        this.ensureAttribute(715); // user id
        this.ensureAttribute(711); // phone2IsPublic
        this.ensureAttribute(712); // phone3IsPublic
        this.ensureAttribute(709); // emailAddressIsPublic
        this.ensureAttribute(703); // username
        this.ensureAttribute(714); // username is public > public
        this.ensureAttribute(610); // username is public > public



        // Set values using helper functions
        if (event?.firstName != null) {
            this.setStringValue(701, event?.firstName);
        }

        if (event?.lastName != null) {
            this.setStringValue(702, event?.lastName);
        }

        if (this.editedContactPerData?.titleId != null) {
            this.setStringValue(705, this.editedContactPerData?.titleId);
        }
        if (this.editedContactPerData?.joinDate?._i != null) {
            this.setStringValue(707, this.editedContactPerData?.joinDate?._i);
        }

        if (event?.jobTitle != null) {
            this.setStringValue(706, event?.jobTitle);
        }
        if (this.editedContactPerData?.joinDateIsPublic != null) {


            this.setBooleanValue(713, true);
        }

        if (this.editedContactPerData?.languageIsPublic != null) {
            this.setBooleanValue(708, this.editedContactPerData?.languageIsPublic);
        }


        if (event?.phone1IsPublic != null) {
            this.setBooleanValue(710, event.phone1IsPublic); // boolean
        }
        if (this.editedContactPerData?.userId != null) {
            this.setStringValue(715, this.editedContactPerData?.userId);
        }
        if (event?.phone2IsPublic != null) {
            this.setBooleanValue(711, event.phone2IsPublic); // boolean
        }
        if (this.editedContactPerData?.phone3IsPublic != null) {
            this.setBooleanValue(712, this.editedContactPerData.phone3IsPublic); // boolean
        }
        if (event?.emailAddressIsPublic != null) {
            this.setBooleanValue(709, event.emailAddressIsPublic); // boolean
        }

        if (this.editedContactPerData?.userName != null) {
            this.setStringValue(703, this.editedContactPerData?.userName);
        }
        if (this.editedContactPerData?.userNameIsPublic != null) {
            this.setBooleanValue(714, this.editedContactPerData.userNameIsPublic); // boolean
        }

        if (event?.entityExtraData?.length) {
            const marketplaceRole = event.entityExtraData.find(x => x.attributeId === 610);

            if (marketplaceRole) {
                this.setStringValue(610, marketplaceRole.attributeValue);
            }
        }

        this.saveMyAccount();

    }

    private ensureAttribute(attrId: number): void {
        const exists = this.accountInfoTemp.entityExtraData?.some(attr => attr.attributeId === attrId);
        if (!exists) {
            const newAttr = new AppEntityExtraDataDto();
            newAttr.init({
                attributeId: attrId,
                attributeValue: '',
                entityId: 0,
                entityObjectTypeId: 0,
                entityObjectTypeCode: '',
                entityObjectTypeName: '',
                attributeValueId: 0,
                attributeValueFkName: '',
                attributeValueFkCode: '',
                attributeCode: '',
                id: 0
            });
            this.accountInfoTemp.entityExtraData.push(newAttr);
        }
    }

    changeTouchState(bool: boolean = true) {
        this.touched = bool
    }
    prevetFileBrowse($event) {
        $event.stopPropagation();
        let labelElement = $event.target.parentElement
        labelElement.onclick = (e) => e.preventDefault()
        setTimeout(() => labelElement.onclick = () => { }, 0)
    }
    removeImage($event, t: SycAttachmentCategoryDto, index: number) {
        this.touched = true

        let att: AppEntityAttachmentDto = new AppEntityAttachmentDto();
        let exidtedIndex: number = -1;
        if (t.code == "IMAGE") {
            exidtedIndex = this.accountInfoTemp.entityAttachments.findIndex(x => x.attachmentCategoryId == t.id && x.index == index);
        }
        else {
            exidtedIndex = this.accountInfoTemp.entityAttachments.findIndex(x => x.attachmentCategoryId == t.id);
        }
        this.accountInfoTemp.entityAttachments.splice(exidtedIndex, 1)

        if (index == 1) {
            this.Image1Id = 0
            this.OtherImages1 = undefined
        }
        else if (index == 2) {
            this.Image2Id = 0
            this.OtherImages2 = undefined
        }
        else if (index == 3) {
            this.Image3Id = 0
            this.OtherImages3 = undefined
        }
        else if (index == 4) {
            this.Image4Id = 0
            this.OtherImages4 = undefined
        }
        else if (index == -1) {
            this.logoId = 0
            this.companyLogo = undefined
        }
        else if (index == -2) {
            this.bannerId = 0
            this.coverPhoto = undefined
        }
    }



storeRolesBeforeChange(): void {
  this.previousSelectedRoles = [...(this.selectedRoles || [])];
}

onRolesChange(event?: any): void {
  if (this.isRestoringRoles) return;

  const oldRoles = this.previousSelectedRoles || [];
  const newRoles = event?.value || this.selectedRoles || [];

  const removedRoles = oldRoles.filter(role => !newRoles.includes(role));

  if (!removedRoles.length) {
    this.previousSelectedRoles = [...newRoles];
    this.selectedRoles = [...newRoles];
    this.changeTouchState();
    return;
  }

  this.selectedRoles = [...newRoles];
  this.validateRemovedRoles(removedRoles);
}

private validateRemovedRoles(removedRoles: string[]): void {
  const accountSSIN = this.accountDataForView?.ssin || this.accountInfoTemp?.ssin;

  if (!accountSSIN) {
    this.restoreRemovedRoles(removedRoles);
    return;
  }

  removedRoles.forEach(role => {
    this._AccountsServiceProxy
      .roleCanbeRemoved(accountSSIN, role)
      .subscribe((canRemove: boolean) => {
        if (!canRemove) {
          this.restoreRemovedRoles([role]);

          this.notify.warn(
            this.l('This role cannot be removed because it is used in an existing relationship.')
          );

          return;
        }

        this.previousSelectedRoles = [...(this.selectedRoles || [])];
        this.changeTouchState();
      });
  });
}

private restoreRemovedRoles(rolesToRestore: string[]): void {
  this.isRestoringRoles = true;

  this.selectedRoles = [
    ...new Set([
      ...(this.selectedRoles || []),
      ...rolesToRestore
    ])
  ];

  setTimeout(() => {
    this.isRestoringRoles = false;
    this.previousSelectedRoles = [...(this.selectedRoles || [])];
  });
}
    saveMyAccount() {
        this.accountInfoTemp.entityExtraData ??= [];

        if (!this.accountInfoTemp.id) {
            const mustHave = [701, 702, 703, 706, 707, 708, 709, 710, 711, 712, 713, 714, 715];
            mustHave.forEach(id => this.ensureAttribute(id));

            this.setStringValue(701, this.accountInfoTemp.entityExtraData[0].attributeValue);
            this.setStringValue(702, this.accountInfoTemp.entityExtraData[1].attributeValue);
            this.setStringValue(707, '');
            this.setStringValue(706, '');
            this.setBooleanValue(713, true);
            this.setBooleanValue(708, true);
            this.setBooleanValue(710, true);
            this.setStringValue(715, '');
            this.setBooleanValue(711, true);
            this.setBooleanValue(712, true);
            this.setBooleanValue(709, true);
            this.setStringValue(703, '');
            this.setBooleanValue(714, true);
        }

        this.updateMarketplaceRolesExtraData();
        this.accountInfoTemp.accountLevel = 0;
        this.saving = true;

        this._AccountsServiceProxy.createOrEditMyAccount(this.accountInfoTemp)
            .pipe(finalize(() => {
                this.saving = false;
            }))
            .subscribe(async result => {
                if (!result) return;
                await this.tenantRoleService.loadRoles();
                this.accountId = result?.accountInfo?.id;

                if (this.appSession?.user) {
                    this.appSession.user.accountId = this.accountId;
                }

                this.touched = false;
                this.notify.success(this.l('SavedSuccessfully'));

                this.appSession.tenant.currencyInfoDto =
                    this.allCurrencies.find(e => e.value == this.accountInfoTemp.currencyId);
                this.tenantDefaultCurrency = this.appSession.tenant.currencyInfoDto;
                this.displaySaveAccount = true;
                this.canPublish = true;
                this.getForEditResult.lastChangesIsPublished = false;

                this.updateLogoService.updateLogo();

                await this.getMyAccountDataForView(); // one refresh only

                this._router.navigate(['/app/main/account'], {
                    queryParams: { tab: 'ProfileView' }
                });

                this.changeTab(this.accountInfoPageTabsEnum.ProfileView);
            }, _ => {
                this.touched = true;
            });
    }


    async saveExternalOrManualAccount(): Promise<void> {
        this.updateMarketplaceRolesExtraData();
if( !this.accountInfoTemp?.id){


        this._AccountsServiceProxy
            .getAvailableConnections(this.selectedRoles?.join('-')?.toLowerCase())
            .subscribe((connections: any[]) => {

                this.availableConnections = connections || [];

                if (this.availableConnections.length === 0) {
                    this.saveAccountAfterConnectionSelected();
                    return;
                }

                if (this.availableConnections.length === 1) {
                    this.selectedConnection = this.availableConnections[0];
                    this.setSelectedRelationshipId();
                    this.saveAccountAfterConnectionSelected();
                    return;
                }

                this.selectedConnection = this.availableConnections[0];
                this.showConnectionPopup = true;

            }, err => {
                this.touched = true;
            });
        }else {
                 this.saveAccountAfterConnectionSelected();
        }
    }

    confirmSelectedConnection(): void {
        if (!this.selectedConnection) return;

        this.setSelectedRelationshipId();
        this.showConnectionPopup = false;
        this.saveAccountAfterConnectionSelected();
    }

    cancelConnectionPopup(): void {
        this.showConnectionPopup = false;
        this.selectedConnection = null;
        this.saving = false;

    }

    private setSelectedRelationshipId(): void {

        this.accountInfoTemp.relationshipId = this.selectedConnection?.connectionEntityId;
    }

    private saveAccountAfterConnectionSelected(): void {
        this.saving = true;

        this._AccountsServiceProxy.createOrEditAccount(this.accountInfoTemp)
            .pipe(finalize(() => {
                this.saving = false;
            }))
            .subscribe(result => {
                this.notify.info(this.l('SavedSuccessfully'));

                if (!this.accountInfoTemp.id) {
                    // return this._router.navigate(['app/main/accounts']);
                            this.accountId = result.accountInfo.id;
                    this.accountInfoTemp.id = result.accountInfo.id;

                    // this.viewMode = true;

                    this._router.navigate(
                        [`/app/main/account/view/${this.accountId}`],
                        {
                            queryParams: { tab: 'ProfileView' }
                        }
                    );

                    return;

                }

                this.touched = false;

                if (this.accountLevel === this.accountLevelEnum.External) {
                    this.displaySaveAccount = true;
                    this.getForEditResult.lastChangesIsPublished = false;
                    this.handleComponentMode();
                } else {
                    this._router.navigate([`/app/main/account/view/${this.accountInfoTemp.id}`]);
                    this.changeTab(AccountInfoPageTabs.ProfileView);
                    this.getAccountDataForView();
                }
            }, err => {
                this.touched = true;
            });
    }

    save(): void {
        if (this.uploader.isUploading) {
            this.notify.info(this.l('WaitUntilUploadingImagesIsCompleted'));
            return
        }
        this.saving = true;
        if (this.accountLevel === AccountLevelEnum.Profile && (this.isRecordOwner || !this.accountInfoTemp.id)) {

            if (this.accountInfoOldCurrencyId && this.accountInfoTemp.currencyId != this.accountInfoOldCurrencyId) {
                this.message.confirm(
                    '',
                    this.l('Are you sure you want to change the default currency? , The pricing you assign to all of the products may change as a result of the change in your default currency. Do you have to make this change now?'),
                    (isConfirmed) => {
                        if (!isConfirmed) {
                            this.accountInfoTemp.currencyId = this.accountInfoOldCurrencyId;
                            this.changeCurrency = false;
                            this.saving = false;
                        }
                        else {
                            this.changeCurrency = true;
                            this.saveMyAccount()
                        }
                    }
                );
            }
            else {
                this.saveMyAccount()

            }

        } else {

            this.saveExternalOrManualAccount()
        }
    }



    onWebsiteChange() {
        var expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
        var regex = new RegExp(expression);
        if (this.accountInfoTemp.website.match(regex)) {
            this.websiteValidation = false;
        } else {
            this.websiteValidation = true;
        }
    }



    setDefaultPhoneTypes(): void {

        if (!this.accountInfoLoded || !this.phoneTypesLoaded) return;

        //set default phone types tobe displayed
        if (this.accountInfoTemp.phone1TypeId == 0 || this.accountInfoTemp.phone1TypeId == null) {
            this.accountInfoTemp.phone1TypeId = this.allPhoneTypes.length > 0 ? this.allPhoneTypes[0].value : this.accountInfoTemp.phone1TypeId;
            this.accountInfoTemp.phone2TypeId = this.allPhoneTypes.length > 1 ? this.allPhoneTypes[1].value : this.accountInfoTemp.phone2TypeId;
            this.accountInfoTemp.phone3TypeId = this.allPhoneTypes.length > 2 ? this.allPhoneTypes[2].value : this.accountInfoTemp.phone3TypeId;
        }
    }


    openImageCropper(event, aspectRatio?: number, noOptions?: boolean): { onCropDone: Observable<any>, data: ImageCropperComponent } {

        if (event.target.files.length === 0) return; // there are no files selected
        let config: ModalOptions = new ModalOptions()
        // data to be shared to the modal
        config.initialState = {
            title: "Edit image:",
            originalFileChangeEvent: event,
        }
        if (noOptions != undefined) config.initialState['noOptions'] = noOptions // open modal with crop only without any other functionalities
        if (isNaN(aspectRatio)) config.initialState['aspectRatio'] = aspectRatio
        config.class = 'right-modal'
        let mgCropperModalRef = this._BsModalService.show(ImageCropperComponent, config)
        return { onCropDone: this._BsModalService.onHide, data: mgCropperModalRef.content }
    }

    imageBrowseDone($event: ImageUploadComponentOutput, sycAttachmentCategory: SycAttachmentCategoryDto, index?: number) {
        let exidtedIndex: number = -1;
        let att: AppEntityAttachmentDto
        let guid = this.guid();
        this.touched = true

        if (sycAttachmentCategory.code == "IMAGE") {
            exidtedIndex = this.accountInfoTemp.entityAttachments.findIndex(x => x.attachmentCategoryId == sycAttachmentCategory.id && x.index == index);
        }
        else {
            exidtedIndex = this.accountInfoTemp.entityAttachments.findIndex(x => x.attachmentCategoryId == sycAttachmentCategory.id);
        }

        if (exidtedIndex > -1) {
            att = this.accountInfoTemp.entityAttachments[exidtedIndex]
        } else {
            att = new AppEntityAttachmentDto();
        }
        att.fileName = $event.file.name;
        att.attachmentCategoryId = sycAttachmentCategory.id;
        att.guid = guid;

        if (this.sycAttachmentCategoryLogo.id == att.attachmentCategoryId) {
            this.companyLogo = $event.image
        }
        else if (this.sycAttachmentCategoryBanner.id == att.attachmentCategoryId) {
            this.coverPhoto = $event.image
        }
        else if (this.sycAttachmentCategoryImage.id == att.attachmentCategoryId && index == 1) {
            this.OtherImages1 = $event.image
        }
        else if (this.sycAttachmentCategoryImage.id == att.attachmentCategoryId && index == 2) {
            this.OtherImages2 = $event.image
        }
        else if (this.sycAttachmentCategoryImage.id == att.attachmentCategoryId && index == 3) {
            this.OtherImages3 = $event.image
        }
        else if (this.sycAttachmentCategoryImage.id == att.attachmentCategoryId && index == 4) {
            this.OtherImages4 = $event.image
        }

        if (exidtedIndex == -1) {
            att.index = index
            this.accountInfoTemp.entityAttachments.push(att);
        }

        this.uploader.addToQueue([$event.file]);

        this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
            form.append('guid', guid);
        };

        this.uploader.uploadAll()

        if (this.accountInfoTemp.entityAttachments == null || this.accountInfoTemp.entityAttachments == undefined) {
            this.accountInfoTemp.entityAttachments = [];
        }
    }



    // Categories
    openSelectCategoriesModal() {
        this.touched = true
        let config: ModalOptions = new ModalOptions()
        config.class = 'right-modal slide-right-in'
        let modalDefaultData: Partial<SelectCategoriesDynamicModalComponent> = {
            savedIds: this.categoriesIds,
            showAddAction: false,
            showActions: false,
            entityObjectName: "Product",
            entityObjectDisplayName: "Departments",
            isDepartment: true,
            entityId: this.accountInfoTemp.entityId || undefined
        }
        config.initialState = modalDefaultData
        let modalRef: BsModalRef = this._BsModalService.show(SelectCategoriesDynamicModalComponent, config)
        let subs: Subscription = this._BsModalService.onHidden.subscribe(() => {
            this.selectCategoriesHandler(modalRef)
            subs.unsubscribe()
        })
    }
    askToPublish(trueOrFalse) {
        if (!trueOrFalse || this.accountLevel == AccountLevelEnum.Manual) return
        this.canPublish = true;
        this.displaySaveAccount = true
        this.saving = false;
    }

    removeCategory(i: number) {
        this.touched = true
        var isConfirmed: Observable<boolean>;
        isConfirmed = this.askToConfirm("", "AreYouSureYouWantToRemoveThisDepartment?", {
            confirmButtonText: this.l("Yes,Remove"),
            cancelButtonText: this.l("Cancel")
        });

        isConfirmed.subscribe((res) => {
            if (res) {
                this.accountInfoTemp.entityCategories.splice(i, 1)
                this.categoriesIds.splice(i, 1)
                this.primengTableHelperCateg.records.splice(i, 1)
                this.primengTableHelperCateg.totalRecordsCount = this.accountInfoTemp.entityCategories.length
            }
        }
        );
    }

    selectCategoriesHandler(modalRef) {
        let data: SelectCategoriesDynamicModalComponent = modalRef.content
        if (data.selectionDone && Array.isArray(data.selectedRecords) && data.selectedRecords.length) { // add or edit done
            this.addSelectedCategories(data.selectedRecords)
        }
    }

    addSelectedCategories(selected: TreeNodeOfGetSycEntityObjectCategoryForViewDto[]): void {
        let selectedCategories: AppEntityCategoryDto[] = [];
        selected.forEach(element => {
            let newCategory: AppEntityCategoryDto = new AppEntityCategoryDto({
                id: 0,
                entityObjectCategoryId: element.data.sycEntityObjectCategory.id,
                entityObjectCategoryCode: element.data.sycEntityObjectCategory.code,
                entityObjectCategoryName: element.data.sycEntityObjectCategory.name
            });
            selectedCategories.push(newCategory);
            this.categoriesIds.push(element.data.sycEntityObjectCategory.id);
        });
        this.accountInfoTemp.entityCategories.push(...selectedCategories);
        this.getCategories(undefined)
    }

    // classification methods
    openSelectClassificationsModal() {
        this.touched = true
        let config: ModalOptions = new ModalOptions()
        config.class = 'right-modal slide-right-in'
        let modalDefaultData: Partial<SelectClassificationDynamicModalComponent> = {
            savedIds: this.classificationsIds,
            showAddAction: false,
            showActions: false,
            entityObjectName: "Contact",
            entityObjectDisplayName: "Business Classifications",
            entityId: this.accountInfoTemp.entityId || undefined
        }
        config.initialState = modalDefaultData
        let modalRef: BsModalRef = this._BsModalService.show(SelectClassificationDynamicModalComponent, config)
        let subs: Subscription = this._BsModalService.onHidden.subscribe(() => {
            this.selectClassificationsHandler(modalRef)
            subs.unsubscribe()
        })
    }


    removeClassification(i: number) {
        this.touched = true
        var isConfirmed: Observable<boolean>;
        isConfirmed = this.askToConfirm("AreYouSureTouWantToRemoveThisClassification?", "", {
            confirmButtonText: this.l("Yes,Remove"),
            cancelButtonText: this.l("Cancel")
        });

        isConfirmed.subscribe((res) => {
            if (res) {
                this.accountInfoTemp.entityClassifications.splice(i, 1)
                this.classificationsIds.splice(i, 1)
                this.primengTableHelperClass.records.splice(i, 1)
                this.primengTableHelperClass.totalRecordsCount = this.accountInfoTemp.entityClassifications.length
            }
        }
        );

    }

    selectClassificationsHandler(modalRef) {
        let data: SelectClassificationDynamicModalComponent = modalRef.content
        if (data.selectionDone && Array.isArray(data.selectedRecords) && data.selectedRecords.length) { // add or edit done
            this.addSelectedClassifications(data.selectedRecords)
        }
    }

    addSelectedClassifications(selected: TreeNodeOfGetSycEntityObjectClassificationForViewDto[]): void {
        this.touched = true
        let selectedClassifications: AppEntityClassificationDto[] = [];
        selected.forEach(element => {
            let newClassification: AppEntityClassificationDto = new AppEntityClassificationDto();
            newClassification.entityObjectClassificationId = element.data.sycEntityObjectClassification.id;
            newClassification.entityObjectClassificationCode = element.data.sycEntityObjectClassification.code;
            newClassification.entityObjectClassificationName = element.data.sycEntityObjectClassification.name;
            selectedClassifications.push(newClassification);
            this.classificationsIds.push(element.data.sycEntityObjectClassification.id);
        });
        this.accountInfoTemp.entityClassifications.push(...selectedClassifications);
        this.getClassifications(undefined)
    }

    connect(): void {
        this._AccountsServiceProxy.connectContactsProfiles(this.accountDataForView.partnerId, null, null)
            .subscribe(() => {
                this.notify.success(this.l('SuccessfullyConnected'));
                this.accountDataForView.status = true
            });
    }

    disConnect(): void {
        this._AccountsServiceProxy.disconnect(this.accountDataForView.id, undefined)
            .subscribe(() => {
                this.notify.success(this.l('SuccessfullyDisconnected'));
                this.accountDataForView.status = false
            });
    }

    askToConfirmDeleteAccount(): void {
        var isConfirmed: Observable<boolean>;
        isConfirmed = this.askToConfirm(this.l('AreYouSureYouWantToDeleteThisAccount?'), this.l("AreYouSure"));

        isConfirmed.subscribe((res) => {
            if (res) {
                this.showMainSpinner()
                this._AccountsServiceProxy.delete(this.accountInfoTemp.id || this.accountDataForView.id)
                    .pipe(finalize(() => {
                        this.hideMainSpinner()
                    }))
                    .subscribe(() => {
                        this.notify.success(this.l('SuccessfullyDeleted'));
                        this._router.navigate(['/app/main/accounts'])
                    });
            }
        });
    }

    // View member component methods
    onDeleteMemberHandler(id: number) {
        this.showMainSpinner()
        this._AccountsServiceProxy.deleteContact(id)
            .pipe(finalize(() => {
                this.hideMainSpinner()
            }))
            .subscribe(() => {
                this.notify.success(this.l('SuccessfullyDeleted'));
                this.changeTab(AccountInfoPageTabs.MembersList)
            });
    }


    viewMemberHandler({ memberId, userId }: { memberId: number, userId?: number }) {
        this.selectedMember = {
            memberId,
            userId
        }
        this.changeTab(AccountInfoPageTabs.ViewMember, this.selectedMember)
    }
    openViewMemberProfile() {
        const memberId: number = this.selectedMember?.memberId
        const userId: any = this.selectedMember?.userId
        const isExternalAccount: boolean = this.accountLevel == AccountLevelEnum.External
        const isManualAccount: boolean = this.accountLevel == AccountLevelEnum.Manual
        const isMyAccount: boolean = !this.viewMode && this.accountLevel == AccountLevelEnum.Profile
        const isConnectedWithAccount: boolean = this.viewMode && this.accountDataForView.status
        const isNotConnectedWithAccount: boolean = this.viewMode && !this.accountDataForView.status

        const isManualContact: boolean = (!userId || userId == "0") && (isConnectedWithAccount || isManualAccount)
        const isExternalContact: boolean = (!userId || userId == "0") && isExternalAccount
        const isMyTeamMember: boolean = isMyAccount

        const canDelete: boolean = (isManualContact || isExternalContact) && !isNotConnectedWithAccount
        const canEdit: boolean = (isExternalContact || isManualContact || isMyTeamMember) && !isNotConnectedWithAccount
        // permission to delete and edit
        const input: ViewMemberProfileComponentInputsI = {
            id: memberId,
            title: "MemberProfile",
            canDelete: canDelete,
            canEdit: canEdit
        }

        this.viewMemberProfile.show(input, isManualContact || isExternalContact);
        this.selectedMember = undefined
    }


    createOrEditMemberHandler(memberId?: number, userId?: number) {
        this.selectedMember = {
            memberId,
            userId
        }
        this.changeTab(this.accountInfoPageTabsEnum.CreateOrEditMember, this.selectedMember)
    }


    // Create or edit member component methods
    openCreateOrEditMember() {
        const memberId: number = this.selectedMember?.memberId
        const userId: any = this.selectedMember?.userId
        const isExternalAccount: boolean = this.accountLevel == AccountLevelEnum.External
        const isManualAccount: boolean = this.accountLevel == AccountLevelEnum.Manual
        const isConnectedWithAccount: boolean = this.viewMode && this.accountDataForView.status

        const isManualContact: boolean = (!userId || userId == "0") && (isConnectedWithAccount || isManualAccount)
        const isExternalContact: boolean = (!userId || userId == "0") && isExternalAccount
        const isMyTeamMember: boolean = !this.viewMode && this.accountLevel == AccountLevelEnum.Profile

        const canAdd: boolean = isManualContact || isExternalContact
        const canEdit: boolean = isExternalContact || isManualContact || isMyTeamMember
        if (!memberId && !canAdd) return this.changeTab(AccountInfoPageTabs.MembersList)
        if (memberId && !canEdit) return this.changeTab(AccountInfoPageTabs.MembersList)
        this.createOrEditMember.show(memberId, this.accountDataForView.id || this.accountId, isManualContact || isExternalContact);
        this.selectedMember = undefined
    }

    onCreateOrEditDoneHandler($event: { memberId: number, userId: number }) {
        const isManualOrExternalContact: boolean = !$event.userId
        if (isManualOrExternalContact) {
            this.selectedMember = {
                memberId: $event.memberId,
                userId: $event.userId,
            }
            this.changeTab(this.accountInfoPageTabsEnum.ViewMember, this.selectedMember)
        } else {
            this.changeTab(this.accountInfoPageTabsEnum.MembersList)
        }
        this.notify.success(this.l('SuccessfullySaved'));
    }

    // Member List component methods
    openMembersList() {
        const memberId: number = this.selectedMember?.memberId
        const userId: any = this.selectedMember?.userId
        const isExternalAccount: boolean = this.accountLevel == AccountLevelEnum.External
        const isManualAccount: boolean = this.accountLevel == AccountLevelEnum.Manual
        const isConnectedWithAccount: boolean = this.viewMode && this.accountDataForView.status
        const isNotConnectedWithAccount: boolean = this.viewMode && !this.accountDataForView.status

        const isManualContact: boolean = (!userId || userId == "0") && (isConnectedWithAccount || isManualAccount)
        const isExternalContact: boolean = (!userId || userId == "0") && isExternalAccount
        const isMyTeamMember: boolean = !this.viewMode && this.accountLevel == AccountLevelEnum.Profile

        const canAdd: boolean = isManualContact || isExternalContact
        const canView: boolean = true

        let defaultMainFilter: MemberFilterTypeEnum
        let pageMainFilters: SelectItem[]
        if (isMyTeamMember) {
            defaultMainFilter = MemberFilterTypeEnum.Profile
            pageMainFilters = [{ label: 'MyMembers', value: MemberFilterTypeEnum.Profile }]
        } else if (isExternalContact || isManualContact || isConnectedWithAccount || isNotConnectedWithAccount) {
            defaultMainFilter = MemberFilterTypeEnum.View
            pageMainFilters = [{ label: 'Contacts', value: MemberFilterTypeEnum.View }]
        }

        const showMainFiltersOptions: boolean = true
        const accountId: number = this?.accountDataForView?.id || this.accountId
        const title = "TeamMembers"
        const memberListComponentInputs: MembersListComponentInputsI = {
            showMainFiltersOptions,
            canAdd,
            canView,
            defaultMainFilter,
            pageMainFilters,
            accountId,
            title
        }

        this.memberListComponent.show(memberListComponentInputs)
    }

    getClassifications(event: LazyLoadEvent) {
        if (this.primengTableHelperClass.shouldResetPaging(event)) {
            setTimeout(() => {
                this.paginatorClass?.changePage(0);
            }, 500);
            return;
        }
        const skipCount = this.primengTableHelperClass.getSkipCount(this.paginatorClass, event)
        const maxResultCount = this.primengTableHelperClass.getMaxResultCount(this.paginatorClass, event)
        this.primengTableHelperClass.records = this.accountInfoTemp.entityClassifications.slice(
            skipCount,
            maxResultCount + skipCount
        )
    }
    getCategories(event: LazyLoadEvent) {
        if (this.primengTableHelperCateg.shouldResetPaging(event)) {
            setTimeout(() => {
                this.paginatorCateg?.changePage(0);
            }, 500);
            return;
        }
        const skipCount = this.primengTableHelperCateg.getSkipCount(this.paginatorCateg, event)
        const maxResultCount = this.primengTableHelperCateg.getMaxResultCount(this.paginatorCateg, event)
        this.primengTableHelperCateg.records = this.accountInfoTemp.entityCategories.slice(
            skipCount,
            maxResultCount + skipCount
        )
    }
    getCodeValue(code: string) {
        this.accountInfoTemp.code = code;
    }

    get accountTypeDisplayValue(): string {
        const map: Record<string, string> = {
            'PERSONAL': 'Personal',
            'PEOPLE': 'Personal',     // fallback if old enum is used
            'GROUP': 'Group',
            'BUSINESS': 'Business'
        };

        return map[this.accountInfoTemp?.accountType?.toUpperCase()] || this.accountInfoTemp?.accountType || '';
    }


    getSrtingValue(attrId: number): string {
        const attr = this.accountInfoTemp?.extraDataAttributes?.find(x => x.extraAttributeId === attrId);
        const lastValue = attr?.selectedValues?.[attr.selectedValues.length - 1]?.value;
        return lastValue;
    }
    setStringValue(attrId: number, value: string): void {
        const attr = this.accountInfoTemp?.extraDataAttributes?.find(x => x.extraAttributeId === attrId);
        if (attr?.selectedValues?.length > 0) {
            attr.selectedValues[attr.selectedValues.length - 1].value = value;
        }
        const attri = this.accountInfoTemp?.entityExtraData?.find(x => x.attributeId === attrId);
        attri.attributeValue = value


    }
    getBooleanValue(attrId: number): boolean {
        const attr = this.accountInfoTemp?.extraDataAttributes?.find(x => x.extraAttributeId === attrId);
        return attr?.selectedValues?.[0]?.value?.toLowerCase() === 'true';
    }

    setBooleanValue(attrId: number, checked: boolean): void {
        const attr = this.accountInfoTemp?.extraDataAttributes?.find(x => x.extraAttributeId === attrId);
        if (attr?.selectedValues?.length > 0) {
            attr.selectedValues[0].value = checked.toString();
        }
        const attri = this.accountInfoTemp?.entityExtraData?.find(x => x.attributeId === attrId);
        attri.attributeValue = checked.toString()


    }

    // getFormattedConnectionName(): string | null {
    //     let raw: string | undefined;
    //     raw = this.accData?.disConnectLabel?.trim();
    //     if (!raw) return null;
    //     if (raw.startsWith('MPAction')) {
    //         const label = raw.replace('MPAction', '');
    //         return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
    //     }
    //     return null;
    // }


    setManualAccCode(): void {
        this.entityObjectType = 'BUSINESS';

        if (this.accountInfoTemp.code) {
            return;
        }

        this._sycIdentifierDefinitionsServiceProxy
            .getNextEntityCode(this.entityObjectType, this.appSession.tenantId)
            .subscribe(code => {
                if (code) {
                    this.accountInfoTemp.code = 'M' + code;
                }
            });
    }

    refreshPublish(event){
        if(event){
            this.getMyAccountDataForView() 
        }
    }

    get jobTitle(): string {
        return (
          this.accountInfoTemp?.entityExtraData?.find(x => x.attributeId === 706)
            ?.attributeValue || ''
        );
      }
      
      set jobTitle(value: string) {
        this.ensureAttribute(706);
        const attr = this.accountInfoTemp.entityExtraData.find(x => x.attributeId === 706);
        attr.attributeValue = value;
      }
      private normalizePhone(v?: string): string | undefined {
        if (!v) return undefined;
        const trimmed = v.trim();
        return trimmed.length ? trimmed : undefined;
      }
 

    buildMarketplaceRolesExtraData(): AppEntityExtraDataDto[] {
        if (!this.selectedRoles?.length) {
            return [];
        }

        const uniqueRoles = [...new Set(this.selectedRoles)].filter(Boolean);
        const joinedRoles = uniqueRoles.join('-');

        const dto = new AppEntityExtraDataDto();
        dto.entityId = this.accountInfoTemp?.id || 0;
        dto.entityObjectTypeId = 610;
        dto.entityObjectTypeCode = 'PROD-RAWM-TRIM-POMP'; // keep your actual backend value
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
        if (!this.accountInfoTemp) {
            return;
        }

        this.accountInfoTemp.entityExtraData = [
            ...(this.accountInfoTemp.entityExtraData || []).filter(
                item => item.attributeCode !== 'MARKETPLACE-ROLE'
            ),
            ...this.buildMarketplaceRolesExtraData()
        ];
    }


    // setSelectedMarketplaceRoles(): void {
    //     const marketplaceRole = this.accountInfoTemp?.entityExtraData?.find(
    //         x => x.attributeCode === 'MARKETPLACE-ROLE'
    //     );

    //     this.selectedRoles = marketplaceRole?.attributeValue
    //         ? marketplaceRole.attributeValue.split('-').filter(x => x)
    //         : [];
    // }
    setSelectedMarketplaceRoles(): void {
  const marketplaceRole = this.accountInfoTemp?.entityExtraData?.find(
    x => x.attributeCode === 'MARKETPLACE-ROLE'
  );

  this.selectedRoles = marketplaceRole?.attributeValue
    ? marketplaceRole.attributeValue.split('-').filter(x => x)
    : [];

  this.previousSelectedRoles = [...this.selectedRoles];
}

loginTenaneSsin
createRelation(relation: any): void {
  if (!relation?.connectionEntityId || !this.accountId) return;

  this.showMainSpinner();

  forkJoin({
    recipientRoles: this.AppTransactionServiceProxy.getAccountMarketplaceRoles(
      this.accountDataForView?.ssin // or recipient account ssin
    ),
    loggedTenantRoles: this.AppTransactionServiceProxy.getAccountMarketplaceRoles(
      this.loginTenaneSsin
    )
  })
    // .pipe(finalize(() => this.hideMainSpinner()))
    .subscribe(({ recipientRoles, loggedTenantRoles }: any) => {
      const recipientHasRoles = this.hasMarketplaceRoles(recipientRoles);
      const loggedTenantHasRoles = this.hasMarketplaceRoles(loggedTenantRoles);

      if (!recipientHasRoles || !loggedTenantHasRoles) {
        this.hideMainSpinner()
        this.message.info(
         this.l('Cannot connect, you need to update the marketplace role of your account / the recipient account marketplace role in order to build relationship together')  ,
          ''
        );
        return;
      }

      this.applyRelation(relation);
    });
}
private hasMarketplaceRoles(response: any): boolean {
  const roles = response?.result ?? response;
  return Array.isArray(roles) && roles.length > 0;
}

private applyRelation(relation: any): void {
  this.showMainSpinner();

  this._AccountsServiceProxy
    .applyRelationOnProfile(
      this.accountId,
      undefined,
      relation.defaultVisibility === 'Public',
      relation.connectionEntityId
    )
    .pipe(
      finalize(() => {
        this.hideMainSpinner();
        this.getAccountDataForView();
      })
    )
    .subscribe();
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
  disconnect(relation): void {
    this.showMainSpinner();
    this._AccountsServiceProxy
      .disconnect(this.accountDataForView.id,relation.relationEntityId)
      .pipe(
        finalize(() => {
          this.hideMainSpinner();
          this.getAccountDataForView();
        })
      )
      .subscribe((res) => {
        this.notify.success(this.l("SuccessfullyDisconnected"));
     
      });
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

showConnectionsDialog = false;

openConnectionsDialog(): void {
  this.showConnectionsDialog = true;
}
    getLoginAccountDataForView() {
        let id = this.appSession.user.accountId
        if (!id) return

      this._AccountsServiceProxy.getAccountForView(id, 5).pipe(
  
    ).subscribe((res) => {
      this.loginTenaneSsin = res?.account?.ssin
    })

    }

}
