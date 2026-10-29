import { Component, Injector, ViewEncapsulation, OnInit, Input, ViewChild } from '@angular/core';
import {
    CurrencyInfoDto, AccountsServiceProxy, CreateOrEditAccountInfoDto, AppEntitiesServiceProxy, LookupLabelDto,
    AppEntityClassificationDto, AppEntityCategoryDto, AppEntityAttachmentDto,
    TreeNodeOfGetSycEntityObjectCategoryForViewDto, TreeNodeOfGetSycEntityObjectClassificationForViewDto,
    AccountLevelEnum, GetAccountInfoForEditOutput, AccountDto, MemberFilterTypeEnum,
    SycIdentifierDefinitionsServiceProxy, SycAttachmentCategoryDto, MarketplaceAccountsServiceProxy,
    AppEntityExtraDataDto, ConnectionInfo, AppTransactionServiceProxy, SycEntityObjectTypesServiceProxy
} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { ActivatedRoute, Router } from '@angular/router';
import { AbpSessionService, IAjaxResponse, TokenService } from 'abp-ng2-module';
import { AppConsts } from '@shared/AppConsts';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { finalize, map, switchMap } from 'rxjs/operators';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { SelectCategoriesDynamicModalComponent } from '@app/categories/select-categories-dynamic-modal.component';
import { SelectClassificationDynamicModalComponent } from '@app/classification/select-classification-dynamic-modal.component';
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

@Component({
    selector: 'app-account-info',
    templateUrl: './accountInfo.component.html',
    styleUrls: ['./accountInfo.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()],
    providers: [MarketplaceAccountsServiceProxy]
})
export class AccountInfoComponent extends AppComponentBase implements OnInit {

    // ───────────────────────── Inputs / ViewChildren ─────────────────────────
    @Input('accountLevel') accountLevel: AccountLevelEnum = AccountLevelEnum.Profile;
    @Input('viewMode') viewMode: boolean = false;
    @Input('accountId') accountId: number;
    @Input('AccountInfo') accountInfoTemp: CreateOrEditAccountInfoDto = new CreateOrEditAccountInfoDto();
    @Input('fromMarketplace') fromMarketplace: boolean = false;
    @Input('fromManualAcc') fromManualAcc: boolean;

    @ViewChild('createOrEditMember', { static: true }) createOrEditMember: CreateOrEditMemberComponent;
    @ViewChild('viewMemberProfile', { static: true }) viewMemberProfile: ViewMemberProfileComponent;
    @ViewChild('memberListComponent', { static: true }) memberListComponent: MembersListComponent;
    @ViewChild('paginatorClass') paginatorClass: Paginator;
    @ViewChild('paginatorCateg') paginatorCateg: Paginator;
    @ViewChild('accountInfoForm', { static: true }) accountInfoForm: NgForm;

    // ───────────────────────── State ─────────────────────────
    primengTableHelperClass = new PrimengTableHelper();
    primengTableHelperCateg = new PrimengTableHelper();

    accountLevelEnum = AccountLevelEnum;
    accountInfoPageTabsEnum = AccountInfoPageTabs;

    attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
    public uploader: FileUploader;

    isHost: boolean;
    accountTypeResolved = false;
    currentTab: AccountInfoPageTabs;
    saving = false;
    touched = false;
    firstLoad = true;

    // lookups
    allCurrencies: CurrencyInfoDto[];
    allLanguages: LookupLabelDto[];
    accountTypes: SelectItem[] = [];
    allShipVia: LookupLabelDto[];
    allPaymentTerms: LookupLabelDto[];
    paymentTermsId;
    shipViaId;

    // categories / classifications
    categoriesIds: number[] = [];
    classificationsIds: number[] = [];

    // images
    companyLogo: any;
    coverPhoto: any;
    OtherImages1: any;
    OtherImages2: any;
    OtherImages3: any;
    OtherImages4: any;
    sycAttachmentCategoryLogo: SycAttachmentCategoryDto;
    sycAttachmentCategoryBanner: SycAttachmentCategoryDto;
    sycAttachmentCategoryImage: SycAttachmentCategoryDto;
    websiteValidation = false;

    // account data
    accountDataForView: AccountDto;
    accountContactForView: any;
    entityExtraData: any;
    getForEditResult: GetAccountInfoForEditOutput;
    accountInfoOldCurrencyId = 0;
    isRecordOwner: boolean;
    isPublished: boolean;
    isSync: boolean;
    connectionCount: number;
    editedContactPerData: any;
    selectedMember: { memberId?: number, userId?: number } = {};

    // relations / connections
    relationId = 0;
    roleSeller = false;
    connectionsInfo: ConnectionInfo[] = [];
    availableConnectionsInfo: ConnectionInfo[] = [];
    availableConnections: any[] = [];
    selectedConnection: any = null;
    showConnectionPopup = false;
    showConnectionsDialog = false;
    loginTenaneSsin: string;

    // marketplace roles
    roles: any;
    selectedRoles!: any[];
    previousSelectedRoles: string[] = [];
    isRestoringRoles = false;

    private hasRequestedCode = false;

    personalContactTemp: any = {
        firstName: '',
        lastName: '',
        jobTitle: '',
        emailAddressIsPublic: true,
        phone1IsPublic: true
    };

    private readonly ICONS: Record<string, string> = {
        FOLLOW: 'assets/accounts/FOLLOW.png',
        CONNECT: 'assets/accounts/CONNECT.png',
        EMPLOY: 'assets/accounts/CONNECT.png',
        EMPLOYEE: 'assets/accounts/EMPLOYEE.png',
        JOIN: 'assets/accounts/JOIN.png',
    };

    constructor(
        injector: Injector,
        private _route: ActivatedRoute,
        private _router: Router,
        private _AccountsServiceProxy: AccountsServiceProxy,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _tokenService: TokenService,
        private _BsModalService: BsModalService,
        private _abpSessionService: AbpSessionService,
        private updateLogoService: UpdateLogoService,
        private _sycIdentifierDefinitionsServiceProxy: SycIdentifierDefinitionsServiceProxy,
        private _marketplaceAccountsServiceProxy: MarketplaceAccountsServiceProxy,
        private AppTransactionServiceProxy: AppTransactionServiceProxy,
        private _sycEntityObjectTypesServiceProxy: SycEntityObjectTypesServiceProxy,
    ) {
        super(injector);

        this.accountInfoTemp = new CreateOrEditAccountInfoDto();
        this.accountInfoTemp.entityClassifications = [];
        this.accountInfoTemp.entityCategories = [];
    }

    // ───────────────────────── Lifecycle ─────────────────────────
    async ngOnInit() {
        if (this.accountLevel == null) {
            this.accountLevel = AccountLevelEnum.Profile;
        }

        this.getAllForAccountInfo();

        await this.handleComponentMode();

        this.isHost = !this._abpSessionService.tenantId;

        this.handleRoutingChange();
        this.initUploaders();
        this.GetContactDefaults();

        this.getRelationshipRoles(
            this._abpSessionService.tenantId,
            this.accountDataForView?.ssin
        ).subscribe(roles => {
            this.roleSeller = (roles || []).some(r =>
                (r.requesterMarketplaceRole || '').toLowerCase().includes('seller') ||
                (r.recipientMarketplaceRole || '').toLowerCase().includes('seller')
            );
        });
    }

    // ───────────────────────── Mode getters ─────────────────────────
    get isExternalAccount(): boolean { return this.accountLevel == AccountLevelEnum.External && !this.viewMode; }
    get isExternalAccountCreate(): boolean { return this.isExternalAccount && !Boolean(this.accountId); }
    get isExternalAccountEdit(): boolean { return this.isExternalAccount && Boolean(this.accountId); }

    get isManualAccount(): boolean { return this.accountLevel == AccountLevelEnum.Manual && !this.viewMode; }
    get isManualAccountCreate(): boolean { return this.isManualAccount && !Boolean(this.accountId); }
    get isManualAccountEdit(): boolean { return this.isManualAccount && Boolean(this.accountId); }

    get isMyAccount(): boolean { return this.accountLevel == AccountLevelEnum.Profile && !this.viewMode; }
    get isMyAccountCreate(): boolean { return this.isMyAccount && !Boolean(this.accountId); }
    get isMyAccountEdit(): boolean { return this.isMyAccount && Boolean(this.accountId); }

    get otherAccount(): boolean { return this.viewMode; }

    get isPersonalAccount(): boolean {
        return this.currentAccountTypeId === 21;
    }

    get currentAccountTypeId(): number | null {
        const editType = this.accountInfoTemp?.accountTypeId;
        const viewType = this.accountDataForView?.accountTypeId;

        if (this.accountId) {
            return editType || viewType || null;
        }
        return editType || null;
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

    get personalProfileAccountData(): any {
        return this.accountDataForView || this.accountInfoTemp;
    }

    get personalProfileContactData(): any {
        return this.accountContactForView || this.personalContactTemp;
    }

    // ───────────────────────── Routing / tabs ─────────────────────────
    handleRoutingChange() {
        this._route.queryParamMap.subscribe(paramsObj => {
            const params = paramsObj['params'];
            const currentTab: string = params['tab'];

            this.selectedMember = {
                userId: params['userId'],
                memberId: params['memberId']
            };

            if (this.firstLoad) {
                this.firstLoad = false;
            } else if (Object.keys(params).length === 0) {
                return;
            }

            const noSelectedTabs: boolean = isNaN(AccountInfoPageTabs[currentTab]);

            const isCreateMode =
                this.isMyAccountCreate ||
                this.isExternalAccountCreate ||
                this.isManualAccountCreate;

            this.currentTab = AccountInfoPageTabs[currentTab];

            if (noSelectedTabs) {
                if (
                    this.isMyAccountEdit ||
                    this.isExternalAccountEdit ||
                    this.isManualAccountEdit ||
                    this.otherAccount
                ) {
                    this.changeTab(AccountInfoPageTabs.ProfileView);
                    return;
                }

                if (isCreateMode) {
                    this.changeTab(AccountInfoPageTabs.ProfileCreateOrEdit);
                    return;
                }
            }

            switch (currentTab) {
                case this.accountInfoPageTabsEnum[AccountInfoPageTabs.ViewMember] ||
                    this.accountInfoPageTabsEnum[AccountInfoPageTabs.ViewContact]:
                    this.openViewMemberProfile();
                    break;

                case this.accountInfoPageTabsEnum[AccountInfoPageTabs.MembersList] ||
                    this.accountInfoPageTabsEnum[AccountInfoPageTabs.ContactsList]:
                    this.openMembersList();
                    break;

                case this.accountInfoPageTabsEnum[AccountInfoPageTabs.CreateOrEditMember] ||
                    this.accountInfoPageTabsEnum[AccountInfoPageTabs.CreateOrEditContact]:
                    this.openCreateOrEditMember();
                    break;

                case this.accountInfoPageTabsEnum[AccountInfoPageTabs.ProfileCreateOrEdit]:
                    if (
                        this.accountDataForView?.isManual === true ||
                        this.accountDataForView?.isConnected === true ||
                        this.isManualAccountEdit ||
                        this.isExternalAccountEdit
                    ) {
                        this.getAccountDataForEdit();
                        break;
                    }

                    if (this.isMyAccount) {
                        this.getMyAccountDataForEdit();
                    }
                    break;

                default:
                    break;
            }
        });
    }

    changeTab(number: AccountInfoPageTabs, params?: { [key: string]: any }) {
        if (!this.firstLoad) {
            const isCreateMode = this.isMyAccountCreate || this.isExternalAccountCreate || this.isManualAccountCreate;
            const prevCurrentTab: AccountInfoPageTabs = this.currentTab;

            if (isCreateMode) {
                if (
                    this.currentTab != undefined &&
                    this.currentTab !== this.accountInfoPageTabsEnum.ProfileCreateOrEdit &&
                    this.currentTab !== this.accountInfoPageTabsEnum.Branches
                ) {
                    this.notify.warn(this.l('PleaseCompleteAndSaveYourDataFirst'));
                }
                number = AccountInfoPageTabs.ProfileCreateOrEdit;
            }

            switch (prevCurrentTab) {
                case AccountInfoPageTabs.ContactsList:
                case AccountInfoPageTabs.MembersList:
                    this.memberListComponent.hide();
                    break;
                case AccountInfoPageTabs.ViewMember:
                    this.viewMemberProfile.hide();
                    break;
                case AccountInfoPageTabs.CreateOrEditContact:
                case AccountInfoPageTabs.CreateOrEditMember:
                    this.createOrEditMember.hide();
                    break;
                default:
                    break;
            }
        }

        if (!params) params = {};
        params.tab = this.accountInfoPageTabsEnum[number];

        const existedParamsKeys = Object.keys(this._route.snapshot.queryParams || {});
        const newParamsKeys = Object.keys(params);
        existedParamsKeys
            .filter(oldKey => !newParamsKeys.includes(oldKey))
            .forEach(param => { params[param] = null; });

        this.__router.navigate([], {
            relativeTo: this._route,
            queryParams: params,
            queryParamsHandling: 'merge',
        });
    }

    async openProfileTab(): Promise<void> {
        const isCreateMode = !this.accountInfoTemp?.id && !this.accountId;

        if (isCreateMode) {
            this.changeTab(this.accountInfoPageTabsEnum.ProfileCreateOrEdit);
            return;
        }

        if (this.accountLevel === AccountLevelEnum.Profile && !this.viewMode) {
            await this.getMyAccountDataForView();
        } else {
            await this.getAccountDataForView();
        }

        this.changeTab(this.accountInfoPageTabsEnum.ProfileView);
    }

    triggerProfile($event?: Event): void {
        $event?.stopPropagation();

        if (this.currentTab === AccountInfoPageTabs.ProfileCreateOrEdit) {
            this.changeTab(AccountInfoPageTabs.ProfileView);
            return;
        }

        this.accountId = this.accountId || this.accountDataForView?.id;

        if (!this.accountId) {
            return;
        }

        this.touched = false;
        this.changeTab(AccountInfoPageTabs.ProfileCreateOrEdit);
    }

    openPersonalEditMode(): void {
        this.changeTab(AccountInfoPageTabs.ProfileCreateOrEdit);
    }

    onPersonalEditCancel(): void {
        if (!this.accountId) {
            this.changeTab(AccountInfoPageTabs.ProfileCreateOrEdit);
            return;
        }

        this.changeTab(AccountInfoPageTabs.ProfileView);
        this.getMyAccountDataForView();
    }

    // ───────────────────────── Uploader ─────────────────────────
    initUploaders(): void {
        this.uploader = this.createUploader('/Attachment/UploadFiles');
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
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    // ───────────────────────── Lookups ─────────────────────────
    GetContactDefaults() {
        this._AccountsServiceProxy.getContactDefaults()
            .subscribe((res) => {
                this.paymentTermsId = res.paymentTermsId;
                this.shipViaId = res.shipViaId;
            });
    }

    loadInitData() {
        this.getLanguages();
        this.getCurrencies();
        this.getShipVia();
        this.getPaymentTerms();
        this.getAccountTypes();
    }

    getLanguages(): void {
        this._AppEntitiesServiceProxy.getAllLanguageForTableDropdown()
            .subscribe(result => {
                this.allLanguages = result ?? [];
                this.setCreateAccountDefaults();
            });
    }

    getCurrencies(): void {
        this._AppEntitiesServiceProxy.getAllCurrencyForTableDropdown()
            .subscribe(result => {
                this.allCurrencies = result ?? [];
                this.setCreateAccountDefaults();
            });
    }

    getShipVia() {
        this._AppEntitiesServiceProxy.getAllEntitiesByTypeCode('SHIPVIA')
            .subscribe((res) => { this.allShipVia = res; });
    }

    getPaymentTerms() {
        this._AppEntitiesServiceProxy.getAllEntitiesByTypeCode('PAYMENT-TERMS')
            .subscribe((res) => { this.allPaymentTerms = res; });
    }

    getAccountTypes(): void {
        this._AppEntitiesServiceProxy.getAllAccountTypesForTableDropdown()
            .subscribe(result => {
                this.accountTypes = (result ?? []).filter(
                    x => x?.code === 'BUSINESS' || x?.code === 'PERSONAL'
                );
            });
    }

    getAllForAccountInfo() {
        this.getSycAttachmentCategoriesByCodes(['LOGO', 'BANNER', 'IMAGE']).subscribe((result) => {
            result.forEach(item => {
                if (item.code == 'LOGO') this.sycAttachmentCategoryLogo = item;
                else if (item.code == 'BANNER') this.sycAttachmentCategoryBanner = item;
                else if (item.code == 'IMAGE') this.sycAttachmentCategoryImage = item;
            });
            if (!this.accountInfoTemp.entityAttachments) this.accountInfoTemp.entityAttachments = [];
        });
    }

    private setCreateAccountDefaults(): void {
        const isCreate =
            this.isMyAccountCreate ||
            this.isManualAccountCreate ||
            this.isExternalAccountCreate;

        if (!isCreate) {
            return;
        }

        const usd = this.allCurrencies?.find(x => x?.code?.trim().toUpperCase() === 'USD');
        if (usd) {
            this.accountInfoTemp.currencyId = usd.value;
        }

        const english = this.allLanguages?.find(x => x?.code?.trim().toLowerCase() === 'eng');
        if (english) {
            this.accountInfoTemp.languageId = english.value;
        }
    }

    // ───────────────────────── Component mode / loading ─────────────────────────
    async handleComponentMode(): Promise<void> {
        this.accountTypeResolved = false;
        this.spinnerService.show();

        try {
            // Manual / External account
            if (this.isExternalAccount || this.isManualAccount) {
                this.accountInfoTemp.accountLevel = this.accountLevel;

                if (this.accountId) {
                    await this.getAccountDataForView();
                } else {
                    this.resetNewAccountState();
                    this.loadInitData();
                    this.setProfileData();
                }
                return;
            }

            // My account
            if (this.isMyAccount) {
                this.accountId = this.appSession?.user?.accountId;

                if (this.accountId) {
                    await this.getMyAccountDataForView();
                } else {
                    this.resetNewAccountState();
                    await this.getMyAccountDataForEdit();
                }
                return;
            }

            // Other account
            if (this.otherAccount) {
                await this.getAccountDataForView();
            }
        } finally {
            this.accountTypeResolved = true;
            setTimeout(() => this.spinnerService.hide(), 0);
        }
    }

    private resetNewAccountState(): void {
        this.accountDataForView = undefined;
        this.accountContactForView = undefined;
        this.getForEditResult = undefined;
        this.entityExtraData = undefined;

        this.accountInfoTemp = new CreateOrEditAccountInfoDto();
        this.accountInfoTemp.accountLevel = this.accountLevel;
        this.accountInfoTemp.entityAttachments = [];
        this.accountInfoTemp.entityCategories = [];
        this.accountInfoTemp.entityClassifications = [];
        this.accountInfoTemp.entityExtraData = [];

        this.selectedRoles = [];
        this.previousSelectedRoles = [];
        this.availableConnections = [];
        this.connectionsInfo = [];
        this.availableConnectionsInfo = [];

        this.touched = false;
        this.saving = false;

        this.companyLogo = undefined;
        this.coverPhoto = undefined;
    }

    getAccountDataForEdit(): void {
        this.accountTypeResolved = false;

        this.loadInitData();
        this.showMainSpinner();

        this._AccountsServiceProxy
            .getAccountForEdit(this.accountId)
            .pipe(
                finalize(() => {
                    this.accountTypeResolved = true;
                    this.hideMainSpinner();
                })
            )
            .subscribe({
                next: (res) => {
                    this.getForEditResult = res;

                    this.setProfileData(res);
                    this.setSelectedMarketplaceRoles();
                    this.getExtrAttributes();

                    this.touched = false;
                },
                error: (err) => {
                    console.error('Failed to load account for edit', err);
                }
            });
    }

    async getMyAccountDataForEdit(): Promise<void> {
        this.accountTypeResolved = false;
        this.loadInitData();

        try {
            const result = await this._AccountsServiceProxy.getMyAccountForEdit().toPromise();

            if (!result) {
                return;
            }

            this.getForEditResult = result;
            this.accountInfoOldCurrencyId = result?.accountInfo?.currencyId;

            this.setProfileData(result);
            this.getExtrAttributes();
            this.setSelectedMarketplaceRoles();

            // Personal account
            if (result?.accountInfo?.accountTypeId === 21) {
                this.personalContactTemp = {
                    firstName:
                        this.getPersonalExtraDataValue(701) || this.accountContactForView?.firstName || '',
                    lastName:
                        this.getPersonalExtraDataValue(702) || this.accountContactForView?.lastName || '',
                    jobTitle:
                        this.getPersonalExtraDataValue(706) || this.accountContactForView?.jobTitle || '',
                    emailAddressIsPublic: this.getPersonalBooleanExtraDataValue(709),
                    phone1IsPublic: this.getPersonalBooleanExtraDataValue(710)
                };
            }

            // Create defaults
            if (!result.accountInfo.id) {
                this.accountInfoTemp.name = result.accountInfo.name || this.appSession?.tenant?.name;
                this.accountInfoTemp.tradeName = result.accountInfo.tradeName || this.appSession?.tenant?.name;
            }

            this.accountInfoTemp.paymentTermsId = !result?.accountInfo?.id
                ? this.paymentTermsId
                : result.accountInfo?.paymentTermsId ?? this.paymentTermsId;

            this.accountInfoTemp.shipViaId = !result?.accountInfo?.id
                ? this.shipViaId
                : result.accountInfo?.shipViaId ?? this.shipViaId;
        } finally {
            this.accountTypeResolved = true;
        }
    }

    async getAccountDataForView() {
        this.showMainSpinner();

        let result;

        if (!this.fromMarketplace) {
            result = await this._AccountsServiceProxy
                .getAccountForView(this.accountId, 5)
                .toPromise()
                .finally(() => this.hideMainSpinner());

            this.relationId = result?.relationId ? result.relationId : 0;
            this.connectionsInfo = result?.connectionsInfo ? result.connectionsInfo : [];
            this.availableConnectionsInfo = result?.availableConnections ? result.availableConnections : [];
            this.entityExtraData = result ? result.entityExtraData : undefined;
        } else {
            result = await this._marketplaceAccountsServiceProxy
                .getAccountForView(this.accountId, undefined, 5)
                .toPromise()
                .finally(() => this.hideMainSpinner());
        }

        this.applyAccountViewResult(result);

        if (this.accountDataForView) {
            if (this.accountDataForView.isManual === true) {
                this.accountLevel = AccountLevelEnum.Manual;
            } else if (this.accountDataForView.isConnected === true) {
                this.accountLevel = AccountLevelEnum.External;
            } else {
                this.accountLevel = AccountLevelEnum.Profile;
            }
        }
    }

    async getMyAccountDataForView() {
        this.showMainSpinner();
        const id = this.appSession.user.accountId;
        if (!id) return;

        const result = await this._AccountsServiceProxy.getAccountForView(id, 5)
            .toPromise()
            .finally(() => this.hideMainSpinner());

        this.entityExtraData = result ? result.entityExtraData : undefined;
        this.relationId = result.relationId ? result.relationId : 0;
        this.connectionsInfo = result.connectionsInfo ? result.connectionsInfo : [];

        this.applyAccountViewResult(result);
    }

    /** Shared by getAccountDataForView / getMyAccountDataForView */
    private applyAccountViewResult(result: any): void {
        this.isPublished = result ? result.isPublished : false;
        this.isSync = result ? result.isSync : false;
        this.connectionCount = result ? result.connectionCount : 0;
        this.accountDataForView = result ? result.account : undefined;
        this.accountContactForView = result ? result.contact : undefined;

        if (this.accountDataForView?.accountTypeId === 21) {
            this.setPersonalContactTemp();
        }

        this.isRecordOwner = this.accountDataForView?.id == this.appSession.user?.accountId;

        if (this.accountDataForView?.logoUrl) {
            this.companyLogo = `${this.attachmentBaseUrl}/${this.accountDataForView.logoUrl}`;
        }
        if (this.accountDataForView?.coverUrl) {
            this.coverPhoto = `${this.attachmentBaseUrl}/${this.accountDataForView.coverUrl}`;
        }
    }

    setProfileData(result: GetAccountInfoForEditOutput = undefined) {
        if (result) {
            this.accountInfoTemp = CreateOrEditAccountInfoDto.fromJS(result.accountInfo);
        }
        if (this.isManualAccountCreate) {
            this.setManualAccCode();
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
                        const typeCode =
                            myResult?.accountInfo?.accountTypeId == 19
                                ? 'BUSINESS'
                                : myResult?.accountInfo?.accountTypeId == 21
                                    ? 'PERSONAL'
                                    : 'GROUP';

                        const nextCode = await this._sycIdentifierDefinitionsServiceProxy
                            .getNextEntityCode(typeCode, this.appSession.tenantId)
                            .toPromise();

                        if (nextCode) {
                            this.accountInfoTemp.code = 'M' + nextCode;
                        }
                    }

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

        if (
            this.isMyAccountCreate ||
            this.isManualAccountCreate ||
            this.isExternalAccountCreate
        ) {
            this.setCreateAccountDefaults();
        }

        this.categoriesIds = this.accountInfoTemp.entityCategories.map(x => x.entityObjectCategoryId);
        this.classificationsIds = this.accountInfoTemp.entityClassifications.map(x => x.entityObjectClassificationId);

        setTimeout(() => {
            this.getCategories(undefined);
            this.getClassifications(undefined);
        }, 500);
    }

    setManualAccCode(): void {
        if (this.accountInfoTemp.code) {
            return;
        }

        this._sycIdentifierDefinitionsServiceProxy
            .getNextEntityCode('BUSINESS', this.appSession.tenantId)
            .subscribe(code => {
                if (code) {
                    this.accountInfoTemp.code = 'M' + code;
                }
            });
    }

    resetFormData(): void {
        // Create manual account → cancel returns to accounts list
        if (this.isManualAccountCreate) {
            this.touched = false;
            this.accountInfoForm?.resetForm();
            this._router.navigate(['/app/main/accounts']);
            return;
        }

        // Edit → restore data and return to view
        this.touched = false;
        this.accountInfoTemp = new CreateOrEditAccountInfoDto();
        this.accountInfoForm?.resetForm();

        this.setProfileData(this.getForEditResult);

        this.accountInfoForm?.form.patchValue(this.accountInfoTemp.toJSON());

        this.companyLogo = this.accountDataForView?.logoUrl
            ? `${this.attachmentBaseUrl}/${this.accountDataForView.logoUrl}`
            : undefined;

        this.coverPhoto = this.accountDataForView?.coverUrl
            ? `${this.attachmentBaseUrl}/${this.accountDataForView.coverUrl}`
            : undefined;

        if (this.accountInfoTemp?.id || this.accountId) {
            this.changeTab(this.accountInfoPageTabsEnum.ProfileView);
            return;
        }

        this.changeTab(this.accountInfoPageTabsEnum.ProfileCreateOrEdit);
    }

    // ───────────────────────── Personal account helpers ─────────────────────────
    private setPersonalContactTemp(): void {
        this.personalContactTemp = {
            firstName: this.accountContactForView?.firstName ?? '',
            lastName: this.accountContactForView?.lastName ?? '',
            jobTitle: this.accountContactForView?.jobTitle ?? '',
            emailAddressIsPublic: this.accountContactForView?.emailAddressIsPublic ?? true,
            phone1IsPublic: this.accountContactForView?.phone1IsPublic ?? true
        };
    }

    private getPersonalExtraDataValue(attributeId: number): any {
        return this.accountInfoTemp?.entityExtraData?.find(x => x.attributeId === attributeId)?.attributeValue;
    }

    private getPersonalBooleanExtraDataValue(attributeId: number): boolean {
        const value = this.getPersonalExtraDataValue(attributeId);
        return value === true || value === 'true';
    }

    private preparePersonalDataBeforeSave(): void {
        if (this.accountInfoTemp?.accountTypeId !== 21) {
            return;
        }

        this.accountInfoTemp.entityExtraData ??= [];

        [701, 702, 706, 709, 710].forEach(id => this.ensureAttribute(id));

        this.setStringValue(701, this.personalContactTemp.firstName);
        this.setStringValue(702, this.personalContactTemp.lastName);
        this.setStringValue(706, this.personalContactTemp.jobTitle);
        this.setBooleanValue(709, !!this.personalContactTemp.emailAddressIsPublic);
        this.setBooleanValue(710, !!this.personalContactTemp.phone1IsPublic);
    }

    getCotactData(event) {
        this.editedContactPerData = event;
    }

    savePerData(event) {
        const contact = this.editedContactPerData;

        this.accountInfoTemp = event;

        if (!this.accountInfoTemp.entityExtraData) {
            this.accountInfoTemp.entityExtraData = [];
        }

        this.accountInfoTemp.entityAttachments = contact?.entityAttachments;

        [701, 702, 705, 707, 706, 713, 708, 710, 715, 711, 712, 709, 703, 714, 610]
            .forEach(id => this.ensureAttribute(id));

        if (event?.firstName != null) this.setStringValue(701, event.firstName);
        if (event?.lastName != null) this.setStringValue(702, event.lastName);
        if (contact?.titleId != null) this.setStringValue(705, contact.titleId);
        if (contact?.joinDate?._i != null) this.setStringValue(707, contact.joinDate._i);
        if (event?.jobTitle != null) this.setStringValue(706, event.jobTitle);

        if (contact?.notes != null) this.accountInfoTemp.notes = contact.notes;

        if (contact?.joinDateIsPublic != null) this.setBooleanValue(713, true);
        if (contact?.languageIsPublic != null) this.setBooleanValue(708, contact.languageIsPublic);
        if (event?.phone1IsPublic != null) this.setBooleanValue(710, event.phone1IsPublic);
        if (contact?.userId != null) this.setStringValue(715, contact.userId);
        if (event?.phone1IsPublic != null) this.setBooleanValue(711, event.phone1IsPublic);
        if (contact?.phone2IsPublic != null) this.setBooleanValue(712, contact.phone2IsPublic);
        if (event?.emailAddressIsPublic != null) this.setBooleanValue(709, event.emailAddressIsPublic);
        if (contact?.userName != null) this.setStringValue(703, contact.userName);
        if (contact?.userNameIsPublic != null) this.setBooleanValue(714, contact.userNameIsPublic);

        if (event?.entityExtraData?.length) {
            const marketplaceRole = event.entityExtraData.find(x => x.attributeId === 610);
            if (marketplaceRole) {
                this.setStringValue(610, marketplaceRole.attributeValue);
            }
        }

        if (
            this.accountDataForView?.isManual === true ||
            this.accountDataForView?.isConnected === true ||
            this.accountLevel === AccountLevelEnum.Manual ||
            this.accountLevel === AccountLevelEnum.External
        ) {
            this.saveExternalOrManualAccount();
            return;
        }

        this.saveMyAccount();
    }

    // ───────────────────────── Extra-data attribute helpers ─────────────────────────
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

    setStringValue(attrId: number, value: string): void {
        const attr = this.accountInfoTemp?.extraDataAttributes?.find(x => x.extraAttributeId === attrId);
        if (attr?.selectedValues?.length > 0) {
            attr.selectedValues[attr.selectedValues.length - 1].value = value;
        }
        const attri = this.accountInfoTemp?.entityExtraData?.find(x => x.attributeId === attrId);
        attri.attributeValue = value;
    }

    setBooleanValue(attrId: number, checked: boolean): void {
        const attr = this.accountInfoTemp?.extraDataAttributes?.find(x => x.extraAttributeId === attrId);
        if (attr?.selectedValues?.length > 0) {
            attr.selectedValues[0].value = checked.toString();
        }
        const attri = this.accountInfoTemp?.entityExtraData?.find(x => x.attributeId === attrId);
        attri.attributeValue = checked.toString();
    }

    changeTouchState(bool: boolean = true) {
        this.touched = bool;
    }

    // ───────────────────────── Images ─────────────────────────
    removeImage($event, t: SycAttachmentCategoryDto, index: number) {
        this.touched = true;

        const existedIndex = t.code == 'IMAGE'
            ? this.accountInfoTemp.entityAttachments.findIndex(x => x.attachmentCategoryId == t.id && x.index == index)
            : this.accountInfoTemp.entityAttachments.findIndex(x => x.attachmentCategoryId == t.id);

        this.accountInfoTemp.entityAttachments.splice(existedIndex, 1);

        switch (index) {
            case 1: this.OtherImages1 = undefined; break;
            case 2: this.OtherImages2 = undefined; break;
            case 3: this.OtherImages3 = undefined; break;
            case 4: this.OtherImages4 = undefined; break;
            case -1: this.companyLogo = undefined; break;
            case -2: this.coverPhoto = undefined; break;
        }
    }

    imageBrowseDone($event: ImageUploadComponentOutput, sycAttachmentCategory: SycAttachmentCategoryDto, index?: number) {
        const guid = this.guid();
        this.touched = true;

        const existedIndex = sycAttachmentCategory.code == 'IMAGE'
            ? this.accountInfoTemp.entityAttachments.findIndex(x => x.attachmentCategoryId == sycAttachmentCategory.id && x.index == index)
            : this.accountInfoTemp.entityAttachments.findIndex(x => x.attachmentCategoryId == sycAttachmentCategory.id);

        const att: AppEntityAttachmentDto = existedIndex > -1
            ? this.accountInfoTemp.entityAttachments[existedIndex]
            : new AppEntityAttachmentDto();

        att.fileName = $event.file.name;
        att.attachmentCategoryId = sycAttachmentCategory.id;
        att.guid = guid;

        if (this.sycAttachmentCategoryLogo.id == att.attachmentCategoryId) {
            this.companyLogo = $event.image;
        } else if (this.sycAttachmentCategoryBanner.id == att.attachmentCategoryId) {
            this.coverPhoto = $event.image;
        } else if (this.sycAttachmentCategoryImage.id == att.attachmentCategoryId) {
            switch (index) {
                case 1: this.OtherImages1 = $event.image; break;
                case 2: this.OtherImages2 = $event.image; break;
                case 3: this.OtherImages3 = $event.image; break;
                case 4: this.OtherImages4 = $event.image; break;
            }
        }

        if (existedIndex == -1) {
            att.index = index;
            this.accountInfoTemp.entityAttachments.push(att);
        }

        this.uploader.addToQueue([$event.file]);

        this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
            form.append('guid', guid);
        };

        this.uploader.uploadAll();
    }

    onWebsiteChange() {
        const regex = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
        this.websiteValidation = !this.accountInfoTemp.website.match(regex);
    }

    // ───────────────────────── Marketplace roles ─────────────────────────
    storeRolesBeforeChange(): void {
        this.previousSelectedRoles = [...(this.selectedRoles || [])];
    }

    onRolesChange(event?: any): void {
        if (this.isRestoringRoles) return;

        const oldRoles = this.previousSelectedRoles || [];
        const newRoles: string[] = [...(event?.value ?? this.selectedRoles ?? [])];
        const removedRoles = oldRoles.filter(role => !newRoles.includes(role));

        this.selectedRoles = newRoles;

        // Create, or edit with nothing removed: no relationship validation needed
        if (!this.accountInfoTemp?.id || !removedRoles.length) {
            this.previousSelectedRoles = [...newRoles];
            this.updateMarketplaceRolesExtraData();
            this.changeTouchState();
            return;
        }

        // Edit: validate removed roles against existing relationships
        this.validateRemovedRoles(removedRoles);
    }

    private validateRemovedRoles(removedRoles: string[]): void {
        const accountSSIN = this.accountDataForView?.ssin || this.accountInfoTemp?.ssin;

        // Existing account: cannot validate without SSIN
        if (!accountSSIN) {
            this.restoreRemovedRoles(removedRoles);
            return;
        }

        removedRoles.forEach(role => {
            this._AccountsServiceProxy
                .roleCanbeRemoved(accountSSIN, role)
                .subscribe({
                    next: (canRemove: boolean) => {
                        if (!canRemove) {
                            this.restoreRemovedRoles([role]);

                            this.notify.warn(
                                this.l('This role cannot be removed because it is used in an existing relationship.')
                            );
                        } else {
                            this.previousSelectedRoles = [...(this.selectedRoles || [])];
                        }

                        this.updateMarketplaceRolesExtraData();
                        this.changeTouchState();
                    },
                    error: () => {
                        this.restoreRemovedRoles([role]);
                    }
                });
        });
    }

    private restoreRemovedRoles(rolesToRestore: string[]): void {
        this.isRestoringRoles = true;

        this.selectedRoles = [...new Set([...(this.selectedRoles || []), ...rolesToRestore])];

        setTimeout(() => {
            this.isRestoringRoles = false;
            this.previousSelectedRoles = [...(this.selectedRoles || [])];
            this.updateMarketplaceRolesExtraData();
        });
    }

    buildMarketplaceRolesExtraData(): AppEntityExtraDataDto[] {
        if (!this.selectedRoles?.length) {
            return [];
        }

        const joinedRoles = [...new Set(this.selectedRoles)].filter(Boolean).join('-');

        const dto = new AppEntityExtraDataDto();
        dto.entityId = this.accountInfoTemp?.id || 0;
        dto.entityObjectTypeId = 610;
        dto.entityObjectTypeCode = 'PROD-RAWM-TRIM-POMP';
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

    setSelectedMarketplaceRoles(): void {
        const marketplaceRole = this.accountInfoTemp?.entityExtraData?.find(
            x => x.attributeCode === 'MARKETPLACE-ROLE'
        );

        this.selectedRoles = marketplaceRole?.attributeValue
            ? marketplaceRole.attributeValue.split('-').map(role => role.trim()).filter(Boolean)
            : [];

        this.previousSelectedRoles = [...this.selectedRoles];
    }

    getExtrAttributes(): void {
        const accountType = this.accountInfoTemp?.accountType;

        if (!accountType) {
            this.roles = [];
            return;
        }

        this._sycEntityObjectTypesServiceProxy
            .getAllWithExtraAttributesByCode(accountType, '')
            .subscribe(result => {
                const marketplaceRoleAttribute = result?.[0]?.extraAttributes?.extraAttributes
                    ?.find(x => x.code === 'MARKETPLACE-ROLE');

                if (!marketplaceRoleAttribute) {
                    this.roles = [];

                    if (!this.accountInfoTemp?.id) {
                        this.selectedRoles = [];
                    }
                    return;
                }

                // Role options
                this.roles = (marketplaceRoleAttribute.validEntries || '')
                    .split('|')
                    .map(role => role.trim())
                    .filter(Boolean)
                    .map(role => ({ name: role }));

                // Edit: keep roles already saved on the account
                if (this.accountInfoTemp?.id) {
                    this.setSelectedMarketplaceRoles();
                    return;
                }

                // Create: select API default roles
                this.selectedRoles = (marketplaceRoleAttribute.defaultValue || '')
                    .split('|')
                    .map(role => role.trim())
                    .filter(Boolean);

                this.previousSelectedRoles = [...this.selectedRoles];
                this.updateMarketplaceRolesExtraData();
            });
    }

    onAccountTypeChange(event: any): void {
        const accountTypeId = event?.value;

        this.accountInfoTemp.accountTypeId = accountTypeId;

        switch (accountTypeId) {
            case 19: this.accountInfoTemp.accountType = 'BUSINESS'; break;
            case 21: this.accountInfoTemp.accountType = 'PERSONAL'; break;
            default: this.accountInfoTemp.accountType = ''; break;
        }

        if (!this.accountInfoTemp.accountType) {
            this.roles = [];
            this.selectedRoles = [];
            return;
        }

        this.getExtrAttributes();
    }

    // ───────────────────────── Save ─────────────────────────
    save(): void {
        this.preparePersonalDataBeforeSave();

        if (this.uploader.isUploading) {
            this.notify.info(this.l('WaitUntilUploadingImagesIsCompleted'));
            return;
        }

        this.saving = true;

        const isNormalAccount =
            this.isManualAccount ||
            this.isExternalAccount ||
            this.accountDataForView?.isManual === true ||
            this.accountDataForView?.isConnected === true;

        if (isNormalAccount) {
            this.saveExternalOrManualAccount();
            return;
        }

        if (this.isMyAccount) {
            if (
                this.accountInfoOldCurrencyId &&
                this.accountInfoTemp.currencyId !== this.accountInfoOldCurrencyId
            ) {
                this.message.confirm(
                    '',
                    this.l(
                        'Are you sure you want to change the default currency? , The pricing you assign to all of the products may change as a result of the change in your default currency. Do you have to make this change now?'
                    ),
                    (isConfirmed) => {
                        if (!isConfirmed) {
                            this.accountInfoTemp.currencyId = this.accountInfoOldCurrencyId;
                            this.saving = false;
                            return;
                        }

                        this.saveMyAccount();
                    }
                );
                return;
            }

            this.saveMyAccount();
            return;
        }

        this.saveExternalOrManualAccount();
    }

    saveMyAccount(): void {
        this.accountInfoTemp.entityExtraData ??= [];

        if (this.accountInfoTemp?.accountTypeId !== 21) {
            this.updateMarketplaceRolesExtraData();
        }

        this.accountInfoTemp.accountLevel = 0;
        this.saving = true;

        this._AccountsServiceProxy
            .createOrEditMyAccount(this.accountInfoTemp)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe({
                next: async (result) => {
                    if (!result) return;

                    try {
                        this.accountId = result?.accountInfo?.id ?? this.accountId;

                        if (this.appSession?.user && this.accountId) {
                            this.appSession.user.accountId = this.accountId;
                        }

                        await this.getMyAccountDataForView();

                        this.touched = false;
                        this.notify.success(this.l('SavedSuccessfully'));

                        if (this.appSession?.tenant) {
                            this.appSession.tenant.currencyInfoDto =
                                this.allCurrencies?.find(e => e.value === this.accountInfoTemp.currencyId);

                            this.tenantDefaultCurrency = this.appSession.tenant.currencyInfoDto;
                        }

                        if (this.getForEditResult) {
                            this.getForEditResult.lastChangesIsPublished = false;
                        }

                        this.updateLogoService.updateLogo();

                        this.changeTab(AccountInfoPageTabs.ProfileView);

                        // Non-critical operation after refresh
                        try {
                            await this.tenantRoleService.loadRoles();
                        } catch (error) {
                            console.error('Failed to reload roles:', error);
                        }
                    } catch (error) {
                        console.error('Failed to refresh account after save:', error);
                        this.notify.error('Account saved, but refreshing failed');
                    }
                },

                error: (error) => {
                    console.error('Failed to save account:', error);
                    this.touched = true;
                }
            });
    }

    saveExternalOrManualAccount(): void {
        this.updateMarketplaceRolesExtraData();

        if (this.accountInfoTemp?.id) {
            this.saveAccountAfterConnectionSelected();
            return;
        }

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
        if (this.accountInfoTemp.isManual || this.accountInfoTemp.accountLevel == this.accountLevelEnum.Manual) {
            this.accountInfoTemp.accountLevel = this.accountLevelEnum.Manual;
        } else if (this.accountInfoTemp.isConnected || this.accountInfoTemp.accountLevel == this.accountLevelEnum.Connected) {
            this.accountInfoTemp.accountLevel = this.accountLevelEnum.Connected;
        }
        this.saving = true;

        this._AccountsServiceProxy.createOrEditAccount(this.accountInfoTemp)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(result => {
                this.notify.info(this.l('SavedSuccessfully'));

                if (!this.accountInfoTemp.id) {
                    this.accountId = result.accountInfo.id;
                    this.accountInfoTemp.id = result.accountInfo.id;

                    this._router.navigate(
                        [`/app/main/account/view/${this.accountId}`],
                        { queryParams: { tab: 'ProfileView' } }
                    );
                    return;
                }

                this.touched = false;

                if (this.accountLevel === this.accountLevelEnum.External) {
                    this.getForEditResult.lastChangesIsPublished = false;
                    this.getAccountDataForView();
                } else {
                    this._router.navigate([`/app/main/account/view/${this.accountInfoTemp.id}`]);
                    this.changeTab(AccountInfoPageTabs.ProfileView);
                    this.getAccountDataForView();
                }
            }, err => {
                this.touched = true;
            });
    }

    askToPublish(trueOrFalse) {
        if (!trueOrFalse || this.accountLevel == AccountLevelEnum.Manual) return;
        this.saving = false;
    }

    askToConfirmDeleteAccount(): void {
        const isConfirmed: Observable<boolean> =
            this.askToConfirm(this.l('AreYouSureYouWantToDeleteThisAccount?'), this.l('AreYouSure'));

        isConfirmed.subscribe((res) => {
            if (res) {
                this.showMainSpinner();
                this._AccountsServiceProxy.delete(this.accountInfoTemp.id || this.accountDataForView.id)
                    .pipe(finalize(() => this.hideMainSpinner()))
                    .subscribe(() => {
                        this.notify.success(this.l('SuccessfullyDeleted'));
                        this._router.navigate(['/app/main/accounts']);
                    });
            }
        });
    }

    // ───────────────────────── Categories ─────────────────────────
    openSelectCategoriesModal() {
        this.touched = true;
        const config: ModalOptions = new ModalOptions();
        config.class = 'right-modal slide-right-in';
        const modalDefaultData: Partial<SelectCategoriesDynamicModalComponent> = {
            savedIds: this.categoriesIds,
            showAddAction: false,
            showActions: false,
            entityObjectName: 'Product',
            entityObjectDisplayName: 'Departments',
            isDepartment: true,
            entityId: this.accountInfoTemp.entityId || undefined
        };
        config.initialState = modalDefaultData;
        const modalRef: BsModalRef = this._BsModalService.show(SelectCategoriesDynamicModalComponent, config);
        const subs: Subscription = this._BsModalService.onHidden.subscribe(() => {
            this.selectCategoriesHandler(modalRef);
            subs.unsubscribe();
        });
    }

    removeCategory(i: number) {
        this.touched = true;
        const isConfirmed: Observable<boolean> = this.askToConfirm('', 'AreYouSureYouWantToRemoveThisDepartment?', {
            confirmButtonText: this.l('Yes,Remove'),
            cancelButtonText: this.l('Cancel')
        });

        isConfirmed.subscribe((res) => {
            if (res) {
                this.accountInfoTemp.entityCategories.splice(i, 1);
                this.categoriesIds.splice(i, 1);
                this.primengTableHelperCateg.records.splice(i, 1);
                this.primengTableHelperCateg.totalRecordsCount = this.accountInfoTemp.entityCategories.length;
            }
        });
    }

    selectCategoriesHandler(modalRef) {
        const data: SelectCategoriesDynamicModalComponent = modalRef.content;
        if (data.selectionDone && Array.isArray(data.selectedRecords) && data.selectedRecords.length) {
            this.addSelectedCategories(data.selectedRecords);
        }
    }

    addSelectedCategories(selected: TreeNodeOfGetSycEntityObjectCategoryForViewDto[]): void {
        const selectedCategories: AppEntityCategoryDto[] = [];
        selected.forEach(element => {
            selectedCategories.push(new AppEntityCategoryDto({
                id: 0,
                entityObjectCategoryId: element.data.sycEntityObjectCategory.id,
                entityObjectCategoryCode: element.data.sycEntityObjectCategory.code,
                entityObjectCategoryName: element.data.sycEntityObjectCategory.name
            }));
            this.categoriesIds.push(element.data.sycEntityObjectCategory.id);
        });
        this.accountInfoTemp.entityCategories.push(...selectedCategories);
        this.getCategories(undefined);
    }

    getCategories(event: LazyLoadEvent) {
        if (this.primengTableHelperCateg.shouldResetPaging(event)) {
            setTimeout(() => this.paginatorCateg.changePage(0), 500);
            return;
        }
        const skipCount = this.primengTableHelperCateg.getSkipCount(this.paginatorCateg, event);
        const maxResultCount = this.primengTableHelperCateg.getMaxResultCount(this.paginatorCateg, event);
        this.primengTableHelperCateg.records = this.accountInfoTemp.entityCategories.slice(
            skipCount,
            maxResultCount + skipCount
        );
    }

    // ───────────────────────── Classifications ─────────────────────────
    openSelectClassificationsModal() {
        this.touched = true;
        const config: ModalOptions = new ModalOptions();
        config.class = 'right-modal slide-right-in';
        const modalDefaultData: Partial<SelectClassificationDynamicModalComponent> = {
            savedIds: this.classificationsIds,
            showAddAction: false,
            showActions: false,
            entityObjectName: 'Contact',
            entityObjectDisplayName: 'Business Classifications',
            entityId: this.accountInfoTemp.entityId || undefined
        };
        config.initialState = modalDefaultData;
        const modalRef: BsModalRef = this._BsModalService.show(SelectClassificationDynamicModalComponent, config);
        const subs: Subscription = this._BsModalService.onHidden.subscribe(() => {
            this.selectClassificationsHandler(modalRef);
            subs.unsubscribe();
        });
    }

    removeClassification(i: number) {
        this.touched = true;
        const isConfirmed: Observable<boolean> = this.askToConfirm('AreYouSureTouWantToRemoveThisClassification?', '', {
            confirmButtonText: this.l('Yes,Remove'),
            cancelButtonText: this.l('Cancel')
        });

        isConfirmed.subscribe((res) => {
            if (res) {
                this.accountInfoTemp.entityClassifications.splice(i, 1);
                this.classificationsIds.splice(i, 1);
                this.primengTableHelperClass.records.splice(i, 1);
                this.primengTableHelperClass.totalRecordsCount = this.accountInfoTemp.entityClassifications.length;
            }
        });
    }

    selectClassificationsHandler(modalRef) {
        const data: SelectClassificationDynamicModalComponent = modalRef.content;
        if (data.selectionDone && Array.isArray(data.selectedRecords) && data.selectedRecords.length) {
            this.addSelectedClassifications(data.selectedRecords);
        }
    }

    addSelectedClassifications(selected: TreeNodeOfGetSycEntityObjectClassificationForViewDto[]): void {
        this.touched = true;
        const selectedClassifications: AppEntityClassificationDto[] = [];
        selected.forEach(element => {
            const newClassification = new AppEntityClassificationDto();
            newClassification.entityObjectClassificationId = element.data.sycEntityObjectClassification.id;
            newClassification.entityObjectClassificationCode = element.data.sycEntityObjectClassification.code;
            newClassification.entityObjectClassificationName = element.data.sycEntityObjectClassification.name;
            selectedClassifications.push(newClassification);
            this.classificationsIds.push(element.data.sycEntityObjectClassification.id);
        });
        this.accountInfoTemp.entityClassifications.push(...selectedClassifications);
        this.getClassifications(undefined);
    }

    getClassifications(event: LazyLoadEvent) {
        if (this.primengTableHelperClass.shouldResetPaging(event)) {
            setTimeout(() => this.paginatorClass.changePage(0), 500);
            return;
        }
        const skipCount = this.primengTableHelperClass.getSkipCount(this.paginatorClass, event);
        const maxResultCount = this.primengTableHelperClass.getMaxResultCount(this.paginatorClass, event);
        this.primengTableHelperClass.records = this.accountInfoTemp.entityClassifications.slice(
            skipCount,
            maxResultCount + skipCount
        );
    }

    // ───────────────────────── Members (view / create-edit / list) ─────────────────────────
    onDeleteMemberHandler(id: number) {
        this.showMainSpinner();
        this._AccountsServiceProxy.deleteContact(id)
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe(() => {
                this.notify.success(this.l('SuccessfullyDeleted'));
                this.changeTab(AccountInfoPageTabs.MembersList);
            });
    }

    viewMemberHandler({ memberId, userId }: { memberId: number, userId?: number }) {
        this.selectedMember = { memberId, userId };
        this.changeTab(AccountInfoPageTabs.ViewMember, this.selectedMember);
    }

    openViewMemberProfile() {
        const memberId: number = this.selectedMember?.memberId;
        const userId: any = this.selectedMember?.userId;
        const isExternalAccount = this.accountLevel == AccountLevelEnum.External;
        const isManualAccount = this.accountLevel == AccountLevelEnum.Manual;
        const isMyAccount = !this.viewMode && this.accountLevel == AccountLevelEnum.Profile;
        const isConnectedWithAccount = this.viewMode && this.accountDataForView.status;
        const isNotConnectedWithAccount = this.viewMode && !this.accountDataForView.status;

        const isManualContact = (!userId || userId == '0') && (isConnectedWithAccount || isManualAccount);
        const isExternalContact = (!userId || userId == '0') && isExternalAccount;
        const isMyTeamMember = isMyAccount;

        const canDelete = (isManualContact || isExternalContact) && !isNotConnectedWithAccount;
        const canEdit = (isExternalContact || isManualContact || isMyTeamMember) && !isNotConnectedWithAccount;

        const input: ViewMemberProfileComponentInputsI = {
            id: memberId,
            title: 'MemberProfile',
            canDelete: canDelete,
            canEdit: canEdit
        };

        this.viewMemberProfile.show(input, isManualContact || isExternalContact);
        this.selectedMember = undefined;
    }

    createOrEditMemberHandler(memberId?: number, userId?: number) {
        this.selectedMember = { memberId, userId };
        this.changeTab(this.accountInfoPageTabsEnum.CreateOrEditMember, this.selectedMember);
    }

    openCreateOrEditMember() {
        const memberId: number = this.selectedMember?.memberId;
        const userId: any = this.selectedMember?.userId;
        const isExternalAccount = this.accountLevel == AccountLevelEnum.External;
        const isManualAccount = this.accountLevel == AccountLevelEnum.Manual;
        const isConnectedWithAccount = this.viewMode && this.accountDataForView.status;

        const isManualContact = (!userId || userId == '0') && (isConnectedWithAccount || isManualAccount);
        const isExternalContact = (!userId || userId == '0') && isExternalAccount;
        const isMyTeamMember = !this.viewMode && this.accountLevel == AccountLevelEnum.Profile;

        const canAdd = isManualContact || isExternalContact;
        const canEdit = isExternalContact || isManualContact || isMyTeamMember;
        if (!memberId && !canAdd) return this.changeTab(AccountInfoPageTabs.MembersList);
        if (memberId && !canEdit) return this.changeTab(AccountInfoPageTabs.MembersList);
        this.createOrEditMember.show(memberId, this.accountDataForView.id || this.accountId, isManualContact || isExternalContact);
        this.selectedMember = undefined;
    }

    onCreateOrEditDoneHandler($event: { memberId: number, userId: number }) {
        const isManualOrExternalContact: boolean = !$event.userId;
        if (isManualOrExternalContact) {
            this.selectedMember = {
                memberId: $event.memberId,
                userId: $event.userId,
            };
            this.changeTab(this.accountInfoPageTabsEnum.ViewMember, this.selectedMember);
        } else {
            this.changeTab(this.accountInfoPageTabsEnum.MembersList);
        }
        this.notify.success(this.l('SuccessfullySaved'));
    }

    openMembersList() {
        const userId: any = this.selectedMember?.userId;
        const isExternalAccount = this.accountLevel == AccountLevelEnum.External;
        const isManualAccount = this.accountLevel == AccountLevelEnum.Manual;
        const isConnectedWithAccount = this.viewMode && this.accountDataForView.status;
        const isNotConnectedWithAccount = this.viewMode && !this.accountDataForView.status;

        const isManualContact = (!userId || userId == '0') && (isConnectedWithAccount || isManualAccount);
        const isExternalContact = (!userId || userId == '0') && isExternalAccount;
        const isMyTeamMember = !this.viewMode && this.accountLevel == AccountLevelEnum.Profile;

        const canAdd = isManualContact || isExternalContact;
        const canView = true;

        let defaultMainFilter: MemberFilterTypeEnum;
        let pageMainFilters: SelectItem[];
        if (isMyTeamMember) {
            defaultMainFilter = MemberFilterTypeEnum.Profile;
            pageMainFilters = [{ label: 'MyMembers', value: MemberFilterTypeEnum.Profile }];
        } else if (isExternalContact || isManualContact || isConnectedWithAccount || isNotConnectedWithAccount) {
            defaultMainFilter = MemberFilterTypeEnum.View;
            pageMainFilters = [{ label: 'Contacts', value: MemberFilterTypeEnum.View }];
        }

        const memberListComponentInputs: MembersListComponentInputsI = {
            showMainFiltersOptions: true,
            canAdd,
            canView,
            defaultMainFilter,
            pageMainFilters,
            accountId: this?.accountDataForView?.id || this.accountId,
            title: 'TeamMembers'
        };

        this.memberListComponent.show(memberListComponentInputs);
    }

    // ───────────────────────── Relations / connections ─────────────────────────
    createRelation(relation: any): void {
        if (!relation?.connectionEntityId || !this.accountId) {
            return;
        }

        const recipientSsin = this.accountDataForView?.ssin;

        if (!recipientSsin) {
            this.message.warn(this.l('Recipient account SSIN is not available'), '');
            return;
        }

        this.showMainSpinner();

        this.getLoginTenantSsin()
            .pipe(
                switchMap((loginTenantSsin: string) => {
                    if (!loginTenantSsin) {
                        throw new Error('Logged-in tenant SSIN is not available');
                    }

                    this.loginTenaneSsin = loginTenantSsin;

                    return forkJoin({
                        recipientRoles: this.AppTransactionServiceProxy.getAccountMarketplaceRoles(recipientSsin),
                        loggedTenantRoles: this.AppTransactionServiceProxy.getAccountMarketplaceRoles(loginTenantSsin)
                    });
                }),

                switchMap(({ recipientRoles, loggedTenantRoles }) => {
                    if (!this.hasMarketplaceRoles(recipientRoles) || !this.hasMarketplaceRoles(loggedTenantRoles)) {
                        throw new Error('MARKETPLACE_ROLES_MISSING');
                    }

                    return this._AccountsServiceProxy.applyRelationOnProfile(
                        this.accountId,
                        undefined,
                        relation.defaultVisibility === 'Public',
                        relation.connectionEntityId
                    );
                }),

                finalize(() => this.hideMainSpinner())
            )
            .subscribe({
                next: () => {
                    this.notify.success(this.l('SuccessfullyConnected'));
                    this.getAccountDataForView();
                },

                error: error => {
                    if (error?.message === 'MARKETPLACE_ROLES_MISSING') {
                        this.message.info(
                            this.l(
                                'Cannot connect, you need to update the marketplace role of your account / the recipient account marketplace role in order to build relationship together'
                            ),
                            ''
                        );
                        return;
                    }

                    if (error?.message === 'Logged-in tenant SSIN is not available') {
                        this.message.warn(this.l('Logged-in account SSIN is not available'), '');
                        return;
                    }

                    this.message.error(this.l('AnErrorOccurredWhileCreatingRelation'), '');
                }
            });
    }

    private hasMarketplaceRoles(response: any): boolean {
        const roles = response?.result ?? response;
        return Array.isArray(roles) && roles.length > 0;
    }

    private getLoginTenantSsin(): Observable<string> {
        if (this.loginTenaneSsin) {
            return of(this.loginTenaneSsin);
        }

        return this._AccountsServiceProxy
            .getAccountForView(this.appSession.user.accountId, 5)
            .pipe(
                map(result => {
                    this.loginTenaneSsin = result.account?.ssin;
                    return this.loginTenaneSsin;
                })
            );
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
            .disconnect(this.accountDataForView.id, relation.relationEntityId)
            .pipe(
                finalize(() => {
                    this.hideMainSpinner();
                    this.getAccountDataForView();
                })
            )
            .subscribe(() => {
                this.notify.success(this.l('SuccessfullyDisconnected'));
            });
    }

    getConnectionIcon(label?: string): string {
        const t = (label || '').toUpperCase();
        for (const key of Object.keys(this.ICONS)) {
            if (t.includes(key)) return this.ICONS[key];
        }
        return 'assets/accounts/CONNECT.png'; // fallback
    }

    openConnectionsDialog(): void {
        this.showConnectionsDialog = true;
    }
}