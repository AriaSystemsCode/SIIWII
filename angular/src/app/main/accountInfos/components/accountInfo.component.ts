import { Component, Injector, ViewEncapsulation, OnInit, Input, ViewChild, AfterViewInit, } from '@angular/core';
import { CurrencyInfoDto, AccountsServiceProxy, CreateOrEditAccountInfoDto, AppEntitiesServiceProxy, LookupLabelDto, AppEntityClassificationDto, AppEntityCategoryDto, SycAttachmentCategoriesServiceProxy, SycAttachmentCategorySycAttachmentCategoryLookupTableDto, GetSycAttachmentCategoryForViewDto, AppEntityAttachmentDto, BranchDto, AppContactAddressDto, TreeNodeOfGetSycEntityObjectCategoryForViewDto, TreeNodeOfGetSycEntityObjectClassificationForViewDto, AccountLevelEnum, GetAccountInfoForEditOutput, GetAccountForViewDto, AccountDto, SessionServiceProxy, ContactDto, MemberFilterTypeEnum, SycEntityObjectClassificationDto, SycIdentifierDefinitionsServiceProxy, SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { ActivatedRoute } from '@angular/router';
import { AbpSessionService, IAjaxResponse, TokenService } from 'abp-ng2-module';
import { AppConsts } from '@shared/AppConsts';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { Observable, Subscription } from 'rxjs';
import { ImageCropperComponent } from '@app/shared/common/image-cropper/image-cropper.component';
import { SelectCategoriesDynamicModalComponent } from '@app/categories/select-categories-dynamic-modal.component';
import { SelectClassificationDynamicModalComponent } from '@app/classification/select-classification-dynamic-modal.component';
import { Router } from '@angular/router';
import { UpdateLogoService } from '@shared/utils/update-logo.service';
import { LazyLoadEvent, SelectItem } from 'primeng/api';
import { AccountInfoPageTabs } from '../models/Account-info-page-tabs.enum';
import { MembersListComponentInputsI } from '@app/main/members-list/models/member-list-component-interface';
import { ViewMemberProfileComponent } from '@app/main/teamMembers/components/view-member-profile/view-member-profile.component';
import { NgForm } from '@angular/forms';
import { CreateOrEditMemberComponent } from '@app/main/teamMembers/components/create-or-edit-member/create-or-edit-member.component';
import { ViewMemberProfileComponentInputsI } from '@app/main/teamMembers/models/view-member-profile-model';
import { MembersListComponent } from '@app/main/members-list/components/members-list.component';
import { ImageUploadComponentOutput } from '@app/shared/common/image-upload/image-upload.component';
import { Paginator } from 'primeng/paginator';
import { Console, log } from 'console';
import { AccountBillingComponent } from './accountBilling/AccountBilling/accountbilling.component'; 
@Component({
    selector:'app-account-info',
    templateUrl:'./AccountInfo.component.html',
    styleUrls: ['./AccountInfo.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class AccountInfoComponent extends AppComponentBase implements OnInit, AfterViewInit {
    @Input('viewMode') viewMode :boolean = false
    @Input('accountId') accountId :number = this.appSession?.user?.accountId
    @Input('accountLevel') accountLevel :AccountLevelEnum = AccountLevelEnum.Profile
    @ViewChild('createOrEditMember',{static:true}) createOrEditMember :CreateOrEditMemberComponent
    @ViewChild('viewMemberProfile',{static:true}) viewMemberProfile :ViewMemberProfileComponent
    @ViewChild('memberListComponent',{static:true}) memberListComponent :MembersListComponent
    primengTableHelperClass = new PrimengTableHelper();
    primengTableHelperCateg = new PrimengTableHelper();
    @ViewChild('paginatorClass') paginatorClass:Paginator
    @ViewChild('paginatorCateg') paginatorCateg:Paginator

    accountLevelEnum = AccountLevelEnum
    accountInfoPageTabsEnum = AccountInfoPageTabs

    attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
    public uploader: FileUploader;

   @Input('AccountInfo') accountInfoTemp: CreateOrEditAccountInfoDto = new CreateOrEditAccountInfoDto()
    activeTabIndex: number = 0;
    phone1TypeIdName = '';
    phone2TypeIdName = '';
    phone3TypeIdName = '';
    currencyIdName = '';
    languageIdName = '';
    avatar: string = this.appRootUrl() + 'assets/common/images/default-profile-picture.png';
    isHost : boolean



    categoriesIds: number[] = [];
    classificationsIds: number[] = [];

    allPhoneTypes: LookupLabelDto[];
    allCurrencies: LookupLabelDto[];
    allCurrenciesDto: CurrencyInfoDto[];
    allLanguages: LookupLabelDto[];
    allPriceLevel: SelectItem[] = [];
    accountTypes: SelectItem[] = [];

    logoId:number;
    bannerId:number;
    Image1Id:number;
    Image2Id:number;
    Image3Id:number;
    Image4Id:number;

    companyLogo: any;
    coverPhoto: any;
    OtherImages1: any;
    OtherImages2: any;
    OtherImages3: any;
    OtherImages4: any;
    websiteValidation:boolean=false;
    loadingChilds;
    loading:boolean=true;


    accountInfoLoded: any;
    phoneTypesLoaded: any;
    allAccountTypes : LookupLabelDto[] = [];

    canPublish: boolean = false;
    displaySaveAccount: boolean = false;
    displayDeleteClassification: boolean = false;
    displayDeleteProductCategories: boolean = false;
    displayDeleteSubBranch: boolean = false;
    recordIdClassification: any;
    recordIdProductCategories: any;
    recordIdSubBranch: any;
    currentTab: AccountInfoPageTabs
    saving = false;
    publishing = false;

    dropdownActionmenuhover: string = '';

    @ViewChild( 'accountInfoForm', { static:true } ) accountInfoForm : NgForm
    selectedAccountTypes : number[] = []
    selectedMember : { memberId?:number , userId ?: number } = {}

    accountDataForView : AccountDto
    isPublished:boolean;
    imgCropperModalRef : BsModalRef
    firstLoad:boolean = true

    entityObjectType:string ="TENANTCONTACT";
    accountInfoOldCurrencyId=0;
    changeCurrency:boolean=false;

    constructor(
        injector: Injector,
        private _route: ActivatedRoute,
        private _AccountsServiceProxy: AccountsServiceProxy,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _SycAttachmentCategoriesServiceProxy: SycAttachmentCategoriesServiceProxy,
        private _tokenService: TokenService,
        private _BsModalService :BsModalService,
        private _router:Router,
        private _abpSessionService : AbpSessionService,
        private updateLogoService:UpdateLogoService,
        private _activatedRoute  : ActivatedRoute,
        private _sycIdentifierDefinitionsServiceProxy: SycIdentifierDefinitionsServiceProxy
    ) {
        super(injector);

        this.accountInfoTemp = new CreateOrEditAccountInfoDto();
        this.accountInfoTemp.entityClassifications = [];
        this.accountInfoTemp.entityCategories = [];

    }

    get isExternalAccount() : boolean {  return this.accountLevel == AccountLevelEnum.External && !this.viewMode}
    get isExternalAccountCreate() : boolean {  return this.isExternalAccount && !Boolean(this.accountId) }
    get isExternalAccountEdit() : boolean {  return this.isExternalAccount && Boolean(this.accountId) }

    get isManualAccount() : boolean {  return this.accountLevel == AccountLevelEnum.Manual && !this.viewMode}
    get isManualAccountCreate() : boolean {  return this.isManualAccount && !Boolean(this.accountId) }
    get isManualAccountEdit() : boolean {  return this.isManualAccount && Boolean(this.accountId) }

    get isMyAccount() : boolean {  return this.accountLevel == AccountLevelEnum.Profile && !this.viewMode }
    get isMyAccountCreate() : boolean {  return this.isMyAccount && !Boolean(this.accountId) }
    get isMyAccountEdit() : boolean {  return this.isMyAccount && Boolean(this.accountId) }

    get otherAccount() :boolean { return this.viewMode }
    sycAttachmentCategoryLogo :SycAttachmentCategoryDto
    sycAttachmentCategoryBanner :SycAttachmentCategoryDto
    sycAttachmentCategoryImage :SycAttachmentCategoryDto
    async ngOnInit() {
        await this.handleComponentMode()
        this.isHost = !this._abpSessionService.tenantId;
        this.handleRoutingChange()
        this.initUploaders();
    }
    handleRoutingChange(){
        this._route.queryParamMap.subscribe(paramsObj => {
            const params = paramsObj['params']
            const currentTab :string = params['tab']
            this.selectedMember =  {
                userId:params['userId'],
                memberId:params['memberId']
            }

            if(this.firstLoad)
                this.firstLoad = false
             else {
                if(Object.keys(params).length === 0 ) return
            }
            const noSelectedTabs : boolean = isNaN(AccountInfoPageTabs[currentTab])
            const isCreateMode = this.isMyAccountCreate || this.isExternalAccountCreate || this.isManualAccountCreate
            if ( noSelectedTabs )  {
                if(this.isMyAccountEdit || this.isExternalAccountEdit || this.isManualAccountEdit || this.otherAccount ) return this.changeTab(AccountInfoPageTabs.ProfileView)
                if(isCreateMode) return this.changeTab(AccountInfoPageTabs.ProfileCreateOrEdit)
            }

            this.currentTab = AccountInfoPageTabs[currentTab]
            switch (currentTab) {
                case this.accountInfoPageTabsEnum[AccountInfoPageTabs.ViewMember] || this.accountInfoPageTabsEnum[AccountInfoPageTabs.ViewContact]:
                    this.openViewMemberProfile()
                    break;
                case this.accountInfoPageTabsEnum[AccountInfoPageTabs.MembersList] || this.accountInfoPageTabsEnum[AccountInfoPageTabs.ContactsList] :
                    this.openMembersList()
                    break;
                case this.accountInfoPageTabsEnum[AccountInfoPageTabs.CreateOrEditMember] || this.accountInfoPageTabsEnum[AccountInfoPageTabs.CreateOrEditContact] :
                    this.openCreateOrEditMember()
                    break;
                case this.accountInfoPageTabsEnum[AccountInfoPageTabs.ProfileCreateOrEdit] :
                    if(this.isMyAccount) this.getMyAccountDataForEdit()
                    else if ( this.isManualAccountEdit || this.isExternalAccountEdit) this.getAccountDataForEdit()
                    break;
                default:
                    break;
            }

        });
    }
    ngAfterViewInit(): void {
        // this.accountInfoForm.valueChanges.subscribe((val)=>{
        //     this.accountInfoForm.valid
        // })

    }

    defineAccountTypes(){
        this._AppEntitiesServiceProxy.getAllAccountTypesForTableDropdown()
        .subscribe((res)=>{

            this.allAccountTypes = res
        })
    }

    showDialogSaveAccount() {
         this.save();
    }
    onEmitButtonSaveYes(event) {
        if (event.value == 'yes' && event.type == 'saveAccount') {
            this.publishProfile();
            this.displaySaveAccount = false;
        }
        else {
            this.displaySaveAccount = false;
            this.displayDeleteClassification = false;
            this.displayDeleteProductCategories = false;
            this.displayDeleteSubBranch = false;
        }
    }

    clearAddress(address: AppContactAddressDto) {
        address.code = ''
        address.name = ''
        address.addressLine1 = ''
        address.addressLine2 = ''
        address.city = ''
        address.state = ''
        address.postalCode = ''
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

    getPhoneTypes(){
        this._AppEntitiesServiceProxy.getAllPhoneTypeForTableDropdown().subscribe(result => {
            this.allPhoneTypes = result;
            this.phoneTypesLoaded = true;
            this.setDefaultPhoneTypes();

        });
    }

    getLanguages(){
        this._AppEntitiesServiceProxy.getAllLanguageForTableDropdown().subscribe(result => {
            this.allLanguages = result;
        });
    }

    getCurrencies(){
        this._AppEntitiesServiceProxy.getAllCurrencyForTableDropdown().subscribe(result => {
            this.allCurrencies = result;
        });
    }

    getCurrenciesDto(){
        this._AppEntitiesServiceProxy.getAllCurrencyForTableDropdown().subscribe(result => {
            this.allCurrenciesDto = result;
        });
    }

    getAccountType(){
        this._AccountsServiceProxy.getMyAccountForEdit().subscribe((result) => {
            this.accountInfoTemp.accountType=result.accountInfo.accountType;
        });
    }

    async handleComponentMode() {

        if( this.isExternalAccount || this.isManualAccount   ) { // EditManualOrExternal Account
            this.accountInfoTemp.accountLevel = this.accountLevel
            if(this.accountId){
                await this.getAccountDataForView()
            }
            else { // create ManualOrExternal Account
                this.loadInitData()
                this.setProfileData()
               
            }
        }

        // MyAccount Account
        if(this.isMyAccount){
            this.accountId = this.appSession.user.accountId
            if(this.accountId){ // edit
                await this.getMyAccountDataForView()
            } else { // create
                this.loadInitData()
                this.setProfileData()
                this.getAccountType();
            }
        }

        // ViewOthers Account
        if(this.otherAccount){
            return this.getAccountDataForView()
        }



    }

    loadInitData(){
        this.defineAccountTypes();
        this.getLanguages();
        this.getCurrencies();
        this.getCurrenciesDto();
        this.getPhoneTypes();
       this.allPriceLevel= this.getPriceLevel();
       this.getAccountTypes();
    }

    getAccountTypes(){ 
       this._AppEntitiesServiceProxy.getAllAccountTypesForTableDropdown()
      .subscribe((result) => {
        this.accountTypes=result;
      }); 
      /*  this.accountTypes.push({ label :'Personal' ,value: 'Personal'});
    this.accountTypes.push({ label :'Business' ,value: 'Business'});
    this.accountTypes.push({ label :'Group' ,value: 'Group'});*/
  } 


    getAccountDataForEdit() :void {
        if(!this.initDataLoaded)  {
            this.initDataLoaded = true
            this.loadInitData()
        }
        this.showMainSpinner()
        this._AccountsServiceProxy.getAccountForEdit(this.accountId)
        .pipe(
            finalize(
                ()=>this.hideMainSpinner()
            )
        )
        .subscribe((res)=>{
            this.getForEditResult = res
            this.setProfileData(res)
        })
    }
    initDataLoaded : boolean = false
    getForEditResult : GetAccountInfoForEditOutput
    async getMyAccountDataForEdit() {
        if(!this.initDataLoaded)  {
            this.initDataLoaded = true
            this.loadInitData()
        }
        const result = await this._AccountsServiceProxy.getMyAccountForEdit().toPromise()
        
        if(result){
            this.getForEditResult = result
            this.accountInfoOldCurrencyId= this.getForEditResult.accountInfo.currencyId;
            this.setProfileData(result)
            if(!result.accountInfo.id) {
               this.accountInfoTemp.accountType=result.accountInfo.accountType;
               this.accountInfoTemp.accountTypeId=result.accountInfo.accountTypeId;
                this.accountInfoTemp.name = this.appSession.tenant.name
                this.accountInfoTemp.tradeName = this.appSession.tenant.name
            }
        }
    }
    resetFormData(){
        this.touched = false
        this.accountInfoTemp = new CreateOrEditAccountInfoDto()
        this.accountInfoForm.resetForm()
        this.setProfileData(this.getForEditResult)
        this.accountInfoForm.form.patchValue(this.accountInfoTemp.toJSON())
        this.companyLogo = this.accountDataForView.logoUrl ? `${this.attachmentBaseUrl}/${this.accountDataForView.logoUrl}` : undefined;
        this.coverPhoto = this.accountDataForView.coverUrl ? `${this.attachmentBaseUrl}/${this.accountDataForView.coverUrl}` : undefined;
    }
    async getAccountDataForView() {
        this.showMainSpinner()
        const result = await this._AccountsServiceProxy.getAccountForView(this.accountId,5)
        .toPromise()
        .finally(
            ()=> {
                this.hideMainSpinner()
            }
        )
        this.isPublished= result ? result.isPublished : false;
        this.accountDataForView = result ? result.account : undefined
        this.isRecordOwner = this.accountDataForView?.partnerId == this.appSession.user?.accountId
        if(this.accountDataForView?.logoUrl) this.companyLogo = `${this.attachmentBaseUrl}/${this.accountDataForView.logoUrl}`;
        if(this.accountDataForView?.coverUrl) this.coverPhoto = `${this.attachmentBaseUrl}/${this.accountDataForView.coverUrl}`;
    }

    async getMyAccountDataForView()  {
        let id = this.appSession.user.accountId
        if(!id) return
        this.showMainSpinner()
        const result = await this._AccountsServiceProxy.getAccountForView(id,5)
        .toPromise()
        .finally(
            ()=>this.hideMainSpinner()
        )
        this.isPublished= result ? result.isPublished : false;
        this.accountDataForView = result ? result.account : undefined
        this.isRecordOwner = this.accountDataForView?.partnerId == this.appSession.user?.accountId
        if(this.accountDataForView.logoUrl) this.companyLogo = `${this.attachmentBaseUrl}/${this.accountDataForView.logoUrl}`;
        if(this.accountDataForView.coverUrl) this.coverPhoto = `${this.attachmentBaseUrl}/${this.accountDataForView.coverUrl}`;
    }
    isRecordOwner : boolean
    setProfileData(result:GetAccountInfoForEditOutput = undefined){
        if(result){
            this.accountInfoTemp = CreateOrEditAccountInfoDto.fromJS(result.accountInfo);
            this.canPublish=true;
            this.phone1TypeIdName = result.phone1TypeName;
            this.phone2TypeIdName = result.phone2TypeName;
            this.phone3TypeIdName = result.phone3TypeName;
            this.currencyIdName = result.currencyName;
            this.languageIdName = result.languageName;
        }

        if(!this.accountInfoTemp.entityAttachments) this.accountInfoTemp.entityAttachments = []
        if(!this.accountInfoTemp.entityCategories) this.accountInfoTemp.entityCategories = []
        if(!this.accountInfoTemp.entityClassifications) this.accountInfoTemp.entityClassifications = []
        if(!this.accountInfoTemp.accountType) this.accountInfoTemp.accountType = ""
        if(!this.accountInfoTemp.accountTypeId) this.accountInfoTemp.accountTypeId = 0

        if(!this.accountInfoTemp.contactAddresses) this.accountInfoTemp.contactAddresses = []
        if(!this.accountInfoTemp.contactPaymentMethods) this.accountInfoTemp.contactPaymentMethods = []
        if(!this.accountInfoTemp.branches) this.accountInfoTemp.branches = []

        if(!this.accountInfoTemp.id)  this.changeTab(this.accountInfoPageTabsEnum.ProfileCreateOrEdit)
        this.getAllForAccountInfo();
        this.accountInfoLoded = true;
        this.setDefaultPhoneTypes();

        this.categoriesIds = [];
        this.accountInfoTemp.entityCategories.forEach(element => {
            this.categoriesIds.push(element.entityObjectCategoryId)
        });

        this.classificationsIds = [];
        this.accountInfoTemp.entityClassifications.forEach(element => {
            this.classificationsIds.push(element.entityObjectClassificationId)
        });
        setTimeout(() => {
            this.getCategories(undefined);
            this.getClassifications(undefined);
        }, 1000);

    }

    getAllForAccountInfo() {
        this.getSycAttachmentCategoriesByCodes(['LOGO',"BANNER","IMAGE"]).subscribe((result)=>{
            result.forEach(item=>{
                if(item.code == "LOGO") this.sycAttachmentCategoryLogo = item
                else if(item.code == "BANNER") this.sycAttachmentCategoryBanner = item
                else if(item.code == "IMAGE") this.sycAttachmentCategoryImage = item
            })
            if (!this.accountInfoTemp.entityAttachments) this.accountInfoTemp.entityAttachments = []
            if (this.accountInfoLoded && this.accountInfoTemp.entityAttachments != null && this.accountInfoTemp.entityAttachments != undefined && this.accountInfoTemp.entityAttachments.length > 0) {
                let logoIndex = this.accountInfoTemp.entityAttachments.findIndex(x => x.attachmentCategoryId == this.sycAttachmentCategoryLogo.id)
                let coverPhotoIndex = this.accountInfoTemp.entityAttachments.findIndex(x => x.attachmentCategoryId == this.sycAttachmentCategoryBanner.id)

                let OtherImages1Index:AppEntityAttachmentDto;
                let OtherImages2Index:AppEntityAttachmentDto;
                let OtherImages3Index:AppEntityAttachmentDto;
                let OtherImages4Index:AppEntityAttachmentDto;
                let arr = this.accountInfoTemp.entityAttachments.filter(x=>x.attachmentCategoryId==this.sycAttachmentCategoryImage.id)
                if(arr.length>0){
                    OtherImages1Index=arr[0]
                    arr[0].index=1
                }
                if(arr.length>1){
                    OtherImages2Index=arr[1]
                    arr[1].index=2
                }
                if(arr.length>2){
                    OtherImages3Index=arr[2]
                    arr[2].index=3
                }
                if(arr.length>3){
                    OtherImages4Index=arr[3]
                    arr[3].index=4
                }

                if (logoIndex > -1) {
                    this.companyLogo = `${this.attachmentBaseUrl}/${this.accountInfoTemp.entityAttachments[logoIndex].url}`
                    this.logoId=this.accountInfoTemp.entityAttachments[logoIndex].id
                }
                if (coverPhotoIndex> -1 ) {
                    this.coverPhoto = `${this.attachmentBaseUrl}/${this.accountInfoTemp.entityAttachments[coverPhotoIndex].url}`
                }
                if (OtherImages1Index ) {
                    this.OtherImages1 = `${this.attachmentBaseUrl}/${OtherImages1Index.url}`
                    this.Image1Id=OtherImages1Index.id
                }
                if (OtherImages2Index) {
                    this.OtherImages2 = `${this.attachmentBaseUrl}/${OtherImages2Index.url}`
                    this.Image2Id=OtherImages2Index.id
                }
                if (OtherImages3Index ) {
                    this.OtherImages3 = `${this.attachmentBaseUrl}/${OtherImages3Index.url}`
                    this.Image3Id=OtherImages3Index.id
                }
                if (OtherImages4Index ) {
                    this.OtherImages4 = `${this.attachmentBaseUrl}/${OtherImages4Index.url}`
                    this.Image4Id=OtherImages4Index.id
                }
            }
        })

    }

    changeTab(number:AccountInfoPageTabs,params?:{[key:string]:any}){
        if(!this.firstLoad) {
            const isCreateMode = this.isMyAccountCreate || this.isExternalAccountCreate || this.isManualAccountCreate
            let prevCurrentTab : AccountInfoPageTabs = this.currentTab
            if ( isCreateMode ) {
                if( this.currentTab !== this.accountInfoPageTabsEnum.ProfileCreateOrEdit && this.currentTab !== this.accountInfoPageTabsEnum.Branches )
                this.notify.warn(this.l("PleaseCompleteAndSaveYourDataFirst"))
                number = AccountInfoPageTabs.ProfileCreateOrEdit
            }
            switch (prevCurrentTab) {
                case AccountInfoPageTabs.ContactsList:
                    this.memberListComponent.hide()
                break;
                case AccountInfoPageTabs.MembersList :
                    this.memberListComponent.hide()
                break;
                case AccountInfoPageTabs.ViewMember :
                    this.viewMemberProfile.hide()
                break;
                case AccountInfoPageTabs.CreateOrEditContact  :
                    this.createOrEditMember.hide()
                break;
                case AccountInfoPageTabs.CreateOrEditMember :
                    this.createOrEditMember.hide()
                break;
                default:
                break;
            }
        }
         
        let currentTabName : string
        currentTabName = this.accountInfoPageTabsEnum[number]
        if (!params)  params = {}
        params.tab = currentTabName
        const existedParams  = {...this._route.snapshot.queryParams}
        const existedParamsKeys : string[] = existedParams ? Object.keys(this._route.snapshot.queryParams) : []
        const newParamsKeys : string[] = params ? Object.keys(params) : []
        const existedParamsKeysToBeRemoved : string[] = existedParamsKeys.filter(oldKey=>!newParamsKeys.includes(oldKey))
        existedParamsKeysToBeRemoved.forEach(param=>{
            params[param] = null
        })



        this.__router.navigate(
            [],
            {
              relativeTo: this._activatedRoute,
              queryParams: params ,
              queryParamsHandling: 'merge', // remove to replace all query params by provided
            }
        );
        if(number == this.accountInfoPageTabsEnum.AccountBilling)
        {
           this.__router.navigateByUrl('/accountbilling');
        }
    }
    triggerProfile($event?){
        if($event) $event.stopPropagation() //prevent event bubbling
        if ( this.currentTab == AccountInfoPageTabs.ProfileCreateOrEdit ) {
            this.changeTab(AccountInfoPageTabs.ProfileView)
        } else {
            this.changeTab(AccountInfoPageTabs.ProfileCreateOrEdit)
        }
        if(!this.accountDataForView) this.getMyAccountDataForView()
    }
    changeTouchState(bool:boolean=true){
        this.touched = bool
    }
    prevetFileBrowse($event){
        $event.stopPropagation();
        let labelElement = $event.target.parentElement
        labelElement.onclick = (e)=> e.preventDefault()
        setTimeout( ()=> labelElement.onclick = ()=>{} ,0)
    }
    removeImage($event,t:SycAttachmentCategoryDto,index:number) {
        this.touched = true

        let att: AppEntityAttachmentDto = new AppEntityAttachmentDto();
        let exidtedIndex:number=-1;
        if(t.code=="IMAGE"){
            exidtedIndex = this.accountInfoTemp.entityAttachments.findIndex(x => x.attachmentCategoryId == t.id && x.index==index );
        }
        else{
            exidtedIndex = this.accountInfoTemp.entityAttachments.findIndex(x => x.attachmentCategoryId == t.id);
        }
        this.accountInfoTemp.entityAttachments.splice(exidtedIndex,1)

        if(index==1){
            this.Image1Id=0
            this.OtherImages1=undefined
        }
        else if(index==2){
            this.Image2Id=0
            this.OtherImages2=undefined
        }
        else if(index==3){
            this.Image3Id=0
            this.OtherImages3=undefined
        }
        else if(index==4){
            this.Image4Id=0
            this.OtherImages4=undefined
        }
        else if(index==-1){
            this.logoId=0
            this.companyLogo=undefined
        }
        else if(index==-2){
            this.bannerId=0
            this.coverPhoto=undefined
        }
    }


    saveMyAccount(){
        this._AccountsServiceProxy.createOrEditMyAccount(this.accountInfoTemp)
        .pipe(finalize(() => { this.saving = false;}))
            .subscribe(result => {
               
                this.touched = false
                this.notify.success(this.l('SavedSuccessfully'));
                // call get account of edit and on the subscribe call the 3 following lines
                //if(!this.accountInfoTemp.id || this.changeCurrency) return location.reload();
                this.appSession.tenant.currencyInfoDto = this.allCurrenciesDto.filter(e=> e.value == this.accountInfoTemp.currencyId)[0];
                this.tenantDefaultCurrency =  this.allCurrenciesDto.filter(e=> e.value == this.accountInfoTemp.currencyId)[0];       
                this.displaySaveAccount = true;
                this.canPublish=true;
                this.getForEditResult.lastChangesIsPublished = false
                this.updateLogoService.updateLogo()
                this.handleComponentMode();
                
               

            },err=>this.touched = true);
    }
    touched : boolean = false

    async saveExternalOrManualAccount(){
       if(!this.accountInfoTemp.code){
        let  sequance="";
        let tenancyName = this.appSession.tenancyName;

        const getNextEntityCodeRes = await this._sycIdentifierDefinitionsServiceProxy.getNextEntityCode(this.entityObjectType).toPromise()
        if(getNextEntityCodeRes)
            sequance=getNextEntityCodeRes;

        this.accountInfoTemp.code= tenancyName+"-M"+sequance;
    }

        this._AccountsServiceProxy.createOrEditAccount(this.accountInfoTemp)
            .pipe(finalize(() => { this.saving = false;}))
            .subscribe(result => {
                this.notify.info(this.l('SavedSuccessfully'));
                if( !this.accountInfoTemp.id ){
                    return this._router.navigate(['app/main/accounts'])
                }
                this.touched = false
                if(this.accountLevel === this.accountLevelEnum.External){
                    this.displaySaveAccount = true;
                    this.getForEditResult.lastChangesIsPublished = false
                    this.handleComponentMode();
                } else {
                    return this._router.navigate(['app/main/accounts'])
                }
            },err=>this.touched = true);
    }

    save(): void {
        if(this.uploader.isUploading){
            this.notify.info(this.l('WaitUntilUploadingImagesIsCompleted'));
            return
        }
        this.saving = true;
        if(this.accountLevel === AccountLevelEnum.Profile) {
            
        if( this.accountInfoOldCurrencyId   && this.accountInfoTemp.currencyId !=this.accountInfoOldCurrencyId ){
                        //    this.l('The default currency of all prices that you assign to all products will be affected by this change. Do you need to proceed with this change?'),
            this.message.confirm(
                '',
            this.l('Are you sure you want to change the default currency? , The pricing you assign to all of the products may change as a result of the change in your default currency. Do you have to make this change now?'),
                (isConfirmed) => {
                    if (!isConfirmed) {
                       this.accountInfoTemp.currencyId =this.accountInfoOldCurrencyId ;
                       this.changeCurrency=false;
                       this.saving = false;
                    }
                    else{
                    this.changeCurrency=true;
                    this.saveMyAccount()
                    }
                }
            );
        }
        else
        this.saveMyAccount()
            
        } else {
            this.accountInfoTemp.accountLevel = this.accountLevel
            this.saveExternalOrManualAccount()
        }
    }

    publishProfile(): void {
        if(this.uploader.isUploading){
            this.notify.info(this.l('WaitUntilUploadingImagesIsCompleted'));
            return
        }
        this.publishing=true;
        this._AccountsServiceProxy.publishProfile()
        .pipe(finalize(() => { this.publishing = false;}))
            .subscribe(() => {
                if(this.getForEditResult)
                this.getForEditResult.lastChangesIsPublished = true
                this.notify.info(this.l('ProfilePublishedSuccessfully'));
                this.accountLevel == AccountLevelEnum.Profile? this.getMyAccountDataForView() :  this.getAccountDataForView();
                this.isPublished=true;
            });
    }

    unPublishProfile(): void {
         this._AccountsServiceProxy.unPublishProfile()
        .pipe(finalize(() => { this.publishing = false;}))
            .subscribe(() => {
                this.notify.info(this.l('ProfileUnPublishedSuccessfully'));
                this.accountLevel == AccountLevelEnum.Profile? this.getMyAccountDataForView() :  this.getAccountDataForView();
                this.isPublished=false;
            }); 
    }
    onWebsiteChange() {
        var expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
        var regex = new RegExp(expression);
        if (this.accountInfoTemp.website.match(regex)) {
            this.websiteValidation=false;
        } else {
            this.websiteValidation=true;
        }
    }
    showPublishProfileMsg(): void {
        var isConfirmed: Observable<boolean>;
        isConfirmed   = this.askToConfirm("DoYouWantToPublishYourProfileNow","");

        isConfirmed.subscribe((res)=>{
                if(res){
                    this.publishProfile();
                }
            }
        );
    }
    changeStyleActionButton($event) {
        this.dropdownActionmenuhover = $event.type == 'mouseover' ? 'dropdownActionmenuhover' : '';
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


    openImageCropper(event,aspectRatio?:number,noOptions?:boolean) : {onCropDone:Observable<any>,data:ImageCropperComponent}{

        if (event.target.files.length === 0)  return; // there are no files selected
        let config : ModalOptions = new ModalOptions()
        // data to be shared to the modal
        config.initialState = {
            title:"Edit image:",
            originalFileChangeEvent: event,
        }
        if( noOptions !=  undefined ) config.initialState['noOptions'] = noOptions // open modal with crop only without any other functionalities
        if( isNaN( aspectRatio ) ) config.initialState['aspectRatio'] = aspectRatio
        config.class = 'right-modal'
        let  mgCropperModalRef = this._BsModalService.show(ImageCropperComponent,config)
        return { onCropDone : this._BsModalService.onHide, data:mgCropperModalRef.content}
    }

    imageBrowseDone($event:ImageUploadComponentOutput,sycAttachmentCategory:SycAttachmentCategoryDto,index?:number){
        let exidtedIndex:number=-1;
        let att: AppEntityAttachmentDto
        let guid = this.guid();
        this.touched = true

        if(sycAttachmentCategory.code=="IMAGE"){
            exidtedIndex = this.accountInfoTemp.entityAttachments.findIndex(x => x.attachmentCategoryId == sycAttachmentCategory.id && x.index==index );
        }
        else{
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
            att.index=index
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

    showDialogRemoveSubBranch(branch: BranchDto) {
        this.displayDeleteSubBranch = true;
        this.recordIdSubBranch = branch;
    }

    // Categories
    openSelectCategoriesModal(){
        this.touched = true
        let config : ModalOptions = new ModalOptions()
        config.class = 'right-modal slide-right-in'
        let modalDefaultData :Partial<SelectCategoriesDynamicModalComponent> = {
            savedIds : this.categoriesIds,
            showAddAction : false,
            showActions : false,
            entityObjectName:"Product",
            entityObjectDisplayName:"Departments",
            isDepartment:true,
            entityId : this.accountInfoTemp.entityId || undefined
        }
        config.initialState = modalDefaultData
        let modalRef:BsModalRef = this._BsModalService.show(SelectCategoriesDynamicModalComponent,config)
        let subs : Subscription =  this._BsModalService.onHidden.subscribe(()=>{
            this.selectCategoriesHandler(modalRef)
            subs.unsubscribe()
        })
    }
    askToPublish(trueOrFalse){
        if(!trueOrFalse || this.accountLevel == AccountLevelEnum.Manual) return
        this.canPublish = true;
        this.displaySaveAccount = true
        this.saving = false;
    }

    removeCategory(i:number){
        this.touched = true
        var isConfirmed: Observable<boolean>;
        isConfirmed   = this.askToConfirm("","AreYouSureYouWantToRemoveThisDepartment?",{
            confirmButtonText: this.l("Yes,Remove"),
            cancelButtonText: this.l("Cancel")
        });

       isConfirmed.subscribe((res)=>{
          if(res){
                this.accountInfoTemp.entityCategories.splice(i,1)
                this.categoriesIds.splice(i,1)
                this.primengTableHelperCateg.records.splice(i,1)
                this.primengTableHelperCateg.totalRecordsCount = this.accountInfoTemp.entityCategories.length
            }
            }
        );
    }

    selectCategoriesHandler(modalRef){
        let data : SelectCategoriesDynamicModalComponent = modalRef.content
        if( data.selectionDone && Array.isArray(data.selectedRecords) && data.selectedRecords.length ) { // add or edit done
            this.addSelectedCategories(data.selectedRecords)
        }
    }

    addSelectedCategories(selected: TreeNodeOfGetSycEntityObjectCategoryForViewDto[]): void {
        let selectedCategories: AppEntityCategoryDto[] = [];
        selected.forEach(element => {
            let newCategory: AppEntityCategoryDto = new AppEntityCategoryDto({
                id:0,
                entityObjectCategoryId : element.data.sycEntityObjectCategory.id,
                entityObjectCategoryCode : element.data.sycEntityObjectCategory.code,
                entityObjectCategoryName : element.data.sycEntityObjectCategory.name
            });
            selectedCategories.push(newCategory);
            this.categoriesIds.push(element.data.sycEntityObjectCategory.id);
        });
        this.accountInfoTemp.entityCategories.push(...selectedCategories);
        this.getCategories(undefined)
    }

    // classification methods
    openSelectClassificationsModal(){
        this.touched = true
        let config : ModalOptions = new ModalOptions()
        config.class = 'right-modal slide-right-in'
        let modalDefaultData :Partial<SelectClassificationDynamicModalComponent> = {
            savedIds : this.classificationsIds,
            showAddAction : false,
            showActions : false,
            entityObjectName: "Contact",
            entityObjectDisplayName: "Business Classifications",
            entityId:this.accountInfoTemp.entityId || undefined
        }
        config.initialState = modalDefaultData
        let modalRef:BsModalRef = this._BsModalService.show(SelectClassificationDynamicModalComponent,config)
        let subs : Subscription = this._BsModalService.onHidden.subscribe(()=>{
            this.selectClassificationsHandler(modalRef)
            subs.unsubscribe()
        })
    }


    removeClassification(i:number){
        this.touched = true
        var isConfirmed: Observable<boolean>;
        isConfirmed   = this.askToConfirm("AreYouSureTouWantToRemoveThisClassification?","",{
            confirmButtonText: this.l("Yes,Remove"),
            cancelButtonText: this.l("Cancel")
        });

        isConfirmed.subscribe((res)=>{
            if(res){
                    this.accountInfoTemp.entityClassifications.splice(i,1)
                    this.classificationsIds.splice(i,1)
                    this.primengTableHelperClass.records.splice(i,1)
                    this.primengTableHelperClass.totalRecordsCount = this.accountInfoTemp.entityClassifications.length
                }
            }
        );

    }

    selectClassificationsHandler(modalRef){
        let data : SelectClassificationDynamicModalComponent = modalRef.content
        if( data.selectionDone && Array.isArray(data.selectedRecords) && data.selectedRecords.length ) { // add or edit done
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
        this._AccountsServiceProxy.connect(this.accountDataForView.partnerId)
        .subscribe(() => {
            this.notify.success(this.l('SuccessfullyConnected'));
            this.accountDataForView.status = true
        });
    }

    disConnect(): void {
        this._AccountsServiceProxy.disconnect(this.accountDataForView.id)
        .subscribe(() => {
            this.notify.success(this.l('SuccessfullyDisconnected'));
            this.accountDataForView.status = false
        });
    }

    askToConfirmDeleteAccount(): void {
        var isConfirmed: Observable<boolean>;
        isConfirmed   = this.askToConfirm(this.l('AreYouSureYouWantToDeleteThisAccount?'),this.l("AreYouSure"));

        isConfirmed.subscribe((res)=>{
            if(res){
                this.showMainSpinner()
                this._AccountsServiceProxy.delete(this.accountInfoTemp.id || this.accountDataForView.id)
                .pipe(finalize(()=>{
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
    onDeleteMemberHandler( id : number ){
        this.showMainSpinner()
        this._AccountsServiceProxy.deleteContact(id)
        .pipe(finalize(()=>{
            this.hideMainSpinner()
        }))
        .subscribe(() => {
            this.notify.success(this.l('SuccessfullyDeleted'));
            this.changeTab(AccountInfoPageTabs.MembersList)
        });
    }


    viewMemberHandler({memberId,userId}:{memberId: number,userId?:number}){
        this.selectedMember = {
            memberId,
            userId
        }
        this.changeTab(AccountInfoPageTabs.ViewMember,this.selectedMember)
    }
    openViewMemberProfile(){
        const memberId : number = this.selectedMember?.memberId
        const userId : any = this.selectedMember?.userId
        const isExternalAccount : boolean = this.accountLevel == AccountLevelEnum.External
        const isManualAccount : boolean = this.accountLevel == AccountLevelEnum.Manual
        const isMyAccount : boolean = !this.viewMode && this.accountLevel == AccountLevelEnum.Profile
        const isConnectedWithAccount :boolean = this.viewMode && this.accountDataForView.status
        const isNotConnectedWithAccount :boolean = this.viewMode && !this.accountDataForView.status

        const isManualContact : boolean =(!userId || userId=="0" ) && ( isConnectedWithAccount || isManualAccount )
        const isExternalContact : boolean = (!userId || userId=="0" )  && isExternalAccount
        const isMyTeamMember : boolean = isMyAccount

        const canDelete : boolean = (isManualContact || isExternalContact ) && !isNotConnectedWithAccount
        const canEdit : boolean = (isExternalContact || isManualContact || isMyTeamMember) && !isNotConnectedWithAccount
        // permission to delete and edit
        const input : ViewMemberProfileComponentInputsI = {
            id : memberId,
            title: "MemberProfile",
            canDelete : canDelete,
            canEdit : canEdit
        }

        this.viewMemberProfile.show(input);
        this.selectedMember = undefined
    }


    createOrEditMemberHandler( memberId ?: number, userId? : number ){
        this.selectedMember = {
            memberId,
            userId
        }
        this.changeTab(this.accountInfoPageTabsEnum.CreateOrEditMember,this.selectedMember)
    }


    // Create or edit member component methods
    openCreateOrEditMember( ){
        const memberId : number = this.selectedMember?.memberId
        const userId : any = this.selectedMember?.userId    
        const isExternalAccount : boolean = this.accountLevel == AccountLevelEnum.External
        const isManualAccount : boolean = this.accountLevel == AccountLevelEnum.Manual
        const isConnectedWithAccount :boolean = this.viewMode && this.accountDataForView.status

        const isManualContact : boolean = (!userId || userId=="0" ) && ( isConnectedWithAccount || isManualAccount )
        const isExternalContact : boolean =(!userId || userId=="0" ) && isExternalAccount
        const isMyTeamMember : boolean = !this.viewMode && this.accountLevel == AccountLevelEnum.Profile

        const canAdd : boolean = isManualContact || isExternalContact
        const canEdit : boolean = isExternalContact || isManualContact || isMyTeamMember
        if(!memberId && !canAdd ) return this.changeTab(AccountInfoPageTabs.MembersList)
        if(memberId && !canEdit ) return this.changeTab(AccountInfoPageTabs.MembersList)
        this.createOrEditMember.show( memberId, this.accountDataForView.id || this.accountId , isManualContact || isExternalContact );
        this.selectedMember = undefined
    }

    onCreateOrEditDoneHandler($event:{memberId:number,userId:number}){
        const isManualOrExternalContact : boolean = !$event.userId
        if( isManualOrExternalContact ) {
            this.selectedMember = {
                memberId : $event.memberId,
                userId : $event.userId,
            }
            this.changeTab(this.accountInfoPageTabsEnum.ViewMember,this.selectedMember)
        } else {
            this.changeTab(this.accountInfoPageTabsEnum.MembersList)
        }
        this.notify.success(this.l('SuccessfullySaved'));
    }

    // Member List component methods
    openMembersList(){
        const memberId : number = this.selectedMember?.memberId
        const userId : any = this.selectedMember?.userId
        const isExternalAccount : boolean = this.accountLevel == AccountLevelEnum.External
        const isManualAccount : boolean = this.accountLevel == AccountLevelEnum.Manual
        const isConnectedWithAccount :boolean = this.viewMode && this.accountDataForView.status
        const isNotConnectedWithAccount :boolean = this.viewMode && !this.accountDataForView.status

        const isManualContact : boolean = (!userId || userId=="0" ) && ( isConnectedWithAccount || isManualAccount )
        const isExternalContact : boolean= (!userId || userId=="0" ) && isExternalAccount
        const isMyTeamMember : boolean = !this.viewMode && this.accountLevel == AccountLevelEnum.Profile

        const canAdd : boolean = isManualContact || isExternalContact
        const canView : boolean = true

        let defaultMainFilter : MemberFilterTypeEnum
        let pageMainFilters : SelectItem []
        if( isMyTeamMember ) {
            defaultMainFilter  = MemberFilterTypeEnum.Profile
            pageMainFilters  = [{ label: 'MyMembers', value:MemberFilterTypeEnum.Profile }]
        } else if ( isExternalContact || isManualContact || isConnectedWithAccount || isNotConnectedWithAccount ) {
            defaultMainFilter = MemberFilterTypeEnum.View
            pageMainFilters = [{ label: 'Contacts', value:MemberFilterTypeEnum.View }]
        }

        const showMainFiltersOptions : boolean = true
        // const showAddButton : boolean = this.viewMode || this.accountLevel !== this.accountLevelEnum.Profile
        const accountId : number = this?.accountDataForView?.id || this.accountId
        const title = "TeamMembers"
        const memberListComponentInputs : MembersListComponentInputsI = {
            showMainFiltersOptions ,
            canAdd ,
            canView ,
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
                this.paginatorClass.changePage(0);
            }, 500);
            return;
        }
        const skipCount = this.primengTableHelperClass.getSkipCount(this.paginatorClass, event)
        const maxResultCount = this.primengTableHelperClass.getMaxResultCount(this.paginatorClass, event)
        this.primengTableHelperClass.records =this.accountInfoTemp.entityClassifications.slice(
            skipCount,
            maxResultCount + skipCount
        )
    }
    getCategories(event: LazyLoadEvent) {
        if (this.primengTableHelperCateg.shouldResetPaging(event)) {
            setTimeout(() => {
                this.paginatorCateg.changePage(0);
            }, 500);
            return;
        }
        const skipCount = this.primengTableHelperCateg.getSkipCount(this.paginatorCateg, event)
        const maxResultCount = this.primengTableHelperCateg.getMaxResultCount(this.paginatorCateg, event)
        this.primengTableHelperCateg.records =this.accountInfoTemp.entityCategories.slice(
            skipCount,
            maxResultCount + skipCount
        )
    }
}
