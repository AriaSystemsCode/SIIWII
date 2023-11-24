import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { AccountsServiceProxy, AppEntitiesServiceProxy, SycAttachmentCategoriesServiceProxy, AppEntityAttachmentDto, TreeNodeOfBranchForViewDto, ContactDto, LookupLabelDto, BranchForViewDto, SycIdentifierDefinitionsServiceProxy, SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ViewChild, Component, EventEmitter, Injector, Output } from '@angular/core';
import { SelectBranchModalComponent } from '../../../../select-branch/select-branch-modal/select-branch-modal.component';
import { NgForm } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { ImageUploadComponentOutput } from '@app/shared/common/image-upload/image-upload.component';
import { UpdateLogoService } from '@shared/utils/update-logo.service';

@Component({
    selector: 'app-create-or-edit-member',
    templateUrl: './create-or-edit-member.component.html',
    styleUrls: ['./create-or-edit-member.component.scss'],
    animations:[appModuleAnimation()]
})
export class CreateOrEditMemberComponent extends AppComponentBase {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('selectBranchModal', { static: true }) selectBranchModal: SelectBranchModalComponent;
    @ViewChild('memberForm', { static : true })  memberForm : NgForm
    @Output() createOrEditDone = new EventEmitter<{memberId:number,userId:number}>();
    memberDto: ContactDto;

    branches: TreeNodeOfBranchForViewDto[];


    logoId: number;
    bannerId: number;
    ProfileImg: any;
    coverPhoto: any;
    canCreate: boolean = false
    canEdit: boolean = false

    allPhoneTypes: LookupLabelDto[];
    allLanguages: LookupLabelDto[];
    phonelist: Object[] = [];
    countryFlag = 'eg'
    active = false;
    phonesLoaded : boolean = false
    entityObjectType:string ="MANUALACCOUNTCONTACT";

    constructor(injector: Injector,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _SycAttachmentCategoriesServiceProxy: SycAttachmentCategoriesServiceProxy,
        private _BsModalService: BsModalService,
        private _AccountsServiceProxy: AccountsServiceProxy,
        private _sycIdentifierDefinitionsServiceProxy: SycIdentifierDefinitionsServiceProxy,
        private updateLogoService:UpdateLogoService
        ) {
        super(injector);
    }

    // public const string Pages_Accounts_Members = "Pages.Accounts.Members";
    // public const string Pages_Accounts_Members_List = "Pages.Accounts.Members.List";
    // public const string Pages_Accounts_Member_Create = "Pages.Accounts.Member.Create";
    // public const string Pages_Accounts_Member_Edit = "Pages.Accounts.Member.Edit";
    // public const string Pages_Accounts_Member_Delete = "Pages.Accounts.Member.Delete";
    isManualOrExternalContact : boolean = true
    sycAttachmentCategoryLogo :SycAttachmentCategoryDto
    sycAttachmentCategoryBanner :SycAttachmentCategoryDto

    async show(memberId?: number, accId?: number,isManualOrExternalContact?:boolean) {
        this.showMainSpinner()
        if(!this.uploader) this.initUploaders()
        this.isManualOrExternalContact = isManualOrExternalContact

        await this.getAttachmentCategories()

        this.getLanguages();
        this.getPhoneTypes();

        if (memberId != undefined) { // edit logic
            this.canEdit = this.permission.isGranted('Pages.Accounts.Member.Edit')
            if (!this.canEdit) return this.notify.error("You don't have permission to edit")
            await this.getContactDataForView(memberId)
        }
        else { // create logic
            this.canCreate = this.permission.isGranted('Pages.Accounts.Member.Create')
            if (!this.canCreate) return this.notify.error("You don't have permission to edit")
            this.memberDto = new ContactDto()
            this.memberDto.accountId = accId;
        }
        this.hideMainSpinner()

        this.phonelist.push(new Object(),new Object(),new Object());
        if (!this.memberDto.entityAttachments) {
            this.memberDto.entityAttachments = []
        }

        this.active = true;
    }
    setDefaultPublicFieldsToTrue(){
        this.memberDto.phone1IsPublic = this.memberDto.phone1Number || this.memberDto.phone1Ext || this.memberDto.phone1TypeId ? true : false;
        this.memberDto.phone2IsPublic = this.memberDto.phone2Number || this.memberDto.phone2Ext || this.memberDto.phone2TypeId ? true : false;
        this.memberDto.phone3IsPublic = this.memberDto.phone3Number || this.memberDto.phone3Ext || this.memberDto.phone3TypeId ? true : false;
        this.memberDto.joinDateIsPublic = this.memberDto.joinDate ? true : false;
        this.memberDto.languageIsPublic = this.memberDto.languageId || this.memberDto.languageName ? true : false;
        this.memberDto.emailAddressIsPublic = this.memberDto.eMailAddress ? true : false;
    }
    getLanguages(): void {
        this._AppEntitiesServiceProxy.getAllLanguageForTableDropdown().subscribe(result => {
            const lookupLabelDto : LookupLabelDto = new LookupLabelDto()
            lookupLabelDto.label = "None"
            lookupLabelDto.value = undefined
            this.allLanguages = [];
            this.allLanguages.push(lookupLabelDto,...result)
        });
    }
    getPhoneTypes(): void {
        this._AppEntitiesServiceProxy.getAllPhoneTypeForTableDropdown().subscribe(result => {
            const lookupLabelDto : LookupLabelDto = new LookupLabelDto()
            lookupLabelDto.label = "None"
            lookupLabelDto.value = undefined
            this.allPhoneTypes = [];
            this.allPhoneTypes.push(lookupLabelDto,...result)
            this.phonesLoaded = true
        });
    }
    async getAttachmentCategories(){
        this.getSycAttachmentCategoriesByCodes(['LOGO',"BANNER"]).subscribe((result)=>{
            this.sycAttachmentCategoryLogo = result[0]
            this.sycAttachmentCategoryBanner = result[1]
        })
    }
    getAttachmentCategory(code:string){
        return this._SycAttachmentCategoriesServiceProxy.getAll(
            undefined,
            code,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            0,
            1,
        )
        .toPromise();
    }

    async getContactDataForView(memberId){
        const result = await this._AccountsServiceProxy.getContactForView(memberId).toPromise()
        if(result) this.memberDto = result.contact
        if(result?.coverUrl) this.coverPhoto = this.attachmentBaseUrl + '/' + result?.coverUrl
        if(result?.imageUrl) this.ProfileImg = this.attachmentBaseUrl + '/' + result?.imageUrl
        this.selectedBranchName =  result?.branchName &&  result?.branchName!='' ?  result?.branchName:'';
        this.selectedBranchName+=  result?.addressLine1 &&  result?.addressLine1!='' ?   (  this.selectedBranchName !='' ? ' - ' +result?.addressLine1 : result?.addressLine1) :'';
        this.selectedBranchName+=  result?.addressLine2 &&  result?.addressLine2!='' ?   (  this.selectedBranchName !='' ?  ' , ' +result?.addressLine2 : result?.addressLine2) :'';
        this.selectedBranchName+=  result?.city &&  result?.city!='' ?   (  this.selectedBranchName !='' ?  ' , ' +result?.city : result?.city) :'';
        this.selectedBranchName+=  result?.state &&  result?.state!='' ?   (  this.selectedBranchName !='' ?  ' , ' +result?.state : result?.state) :'';
        this.selectedBranchName+=  result?.zipCode  &&  result?.zipCode !='' ?   (  this.selectedBranchName !='' ?  ' , ' +result?.zipCode  : result?.zipCode ) :'';
        this.selectedBranchName+=  result?.countryName &&  result?.countryName!='' ?   (  this.selectedBranchName !='' ?  ' , ' +result?.countryName : result?.countryName) :'';
        this.selectedBranchId = result.contact.parentId;
    }

    getAccountBranches() {
        this._AccountsServiceProxy.getBranchForEdit(this.memberDto.accountId).subscribe((rootBranchData)=>{
            const rootBranch : TreeNodeOfBranchForViewDto = new  TreeNodeOfBranchForViewDto()
            rootBranch.expanded = false
            rootBranch.children = undefined
            rootBranch.leaf = false
            rootBranch.label = rootBranchData.name
            rootBranch.data = new BranchForViewDto()
            rootBranch.data.branch = rootBranchData
            rootBranch.data.id = rootBranchData.id
            this.branches = [rootBranch]
            if (this.branches?.length > 0) {
                this.selectBranchModal.show(this.branches);
            }
            else {
                this.message.info("No Branches Found");
            }
        })
    }


    preventFileBrowse($event) {
        $event.stopPropagation();
        let labelElement = $event.target.parentElement
        labelElement.onclick = (e) => e.preventDefault()
        setTimeout(() => labelElement.onclick = () => { }, 0)
    }

    removeImage($event, t:SycAttachmentCategoryDto, index) {
        // this.formTouched = true;
        let exidtedIndex: number = -1;
        exidtedIndex = this.memberDto.entityAttachments.findIndex(x => x.attachmentCategoryId == t.id );
        this.memberDto.entityAttachments.splice(exidtedIndex, 1)

        if (index == -1) {
            this.logoId = 0
            this.ProfileImg = undefined
        }
        else if (index == -2) {
            this.bannerId = 0
            this.coverPhoto = undefined
        }
    }
    imageBrowseDone($event:ImageUploadComponentOutput,sycAttachmentCategory:SycAttachmentCategoryDto){
        let exidtedIndex:number=-1;
        let att: AppEntityAttachmentDto
        let guid = this.guid();


        exidtedIndex = this.memberDto.entityAttachments.findIndex(x => x.attachmentCategoryId == sycAttachmentCategory.id);

        if (exidtedIndex > -1) {
            att = this.memberDto.entityAttachments[exidtedIndex]
        } else {
            att = new AppEntityAttachmentDto();
        }
        att.fileName = $event.file.name;
        att.attachmentCategoryId = sycAttachmentCategory.id;
        att.guid = guid;

        if (this.sycAttachmentCategoryLogo.id == att.attachmentCategoryId) {
            this.ProfileImg = $event.image
        }
        else if (this.sycAttachmentCategoryBanner.id == att.attachmentCategoryId) {
            this.coverPhoto = $event.image
        }

        if (exidtedIndex == -1) {
            this.memberDto.entityAttachments.push(att);
        }

        this.uploader.addToQueue([$event.file]);

        this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
            form.append('guid', guid);
        };

        this.uploader.uploadAll()

        if (this.memberDto.entityAttachments == null || this.memberDto.entityAttachments == undefined) {
            this.memberDto.entityAttachments = [];
        }
    }

    //#region photo handling

    //#endregion
    //Branch Methods [Start]
    selectedBranchId: number
    selectedBranchName: string
    currBranchNode
    selectBranch() {
        this.getAccountBranches();
    }

    branchSelected(Branch) {
       // this.selectedBranchName = Branch.name;
        this.selectedBranchName =  Branch?.contactAddresses[0]?.name ?  Branch?.contactAddresses[0]?.name :'';
        this.selectedBranchName+=  Branch?.contactAddresses[0]?.addressLine1 ?   (  this.selectedBranchName !='' ? ' - ' +Branch?.contactAddresses[0]?.addressLine1 : Branch?.contactAddresses[0]?.addressLine1) :'';
        this.selectedBranchName+=  Branch?.contactAddresses[0]?.addressLine2 ?   (  this.selectedBranchName !='' ?  ' , ' +Branch?.contactAddresses[0]?.addressLine2 : Branch?.contactAddresses[0]?.addressLine2) :'';
        this.selectedBranchName+=  Branch?.contactAddresses[0]?.city  ?   (  this.selectedBranchName !='' ?  ' , ' +Branch?.contactAddresses[0]?.city : Branch?.contactAddresses[0]?.city) :'';
        this.selectedBranchName+=  Branch?.contactAddresses[0]?.state  ?   (  this.selectedBranchName !='' ?  ' , ' +Branch?.contactAddresses[0]?.state : Branch?.contactAddresses[0]?.state) :'';
        this.selectedBranchName+=  Branch?.contactAddresses[0]?.zipCode  ?   (  this.selectedBranchName !='' ?  ' , ' +Branch?.contactAddresses[0]?.zipCode  : Branch?.contactAddresses[0]?.zipCode ) :'';
        this.selectedBranchName+=  Branch?.contactAddresses[0]?.countryName  ?   (  this.selectedBranchName !='' ?  ' , ' +Branch?.contactAddresses[0]?.countryName : Branch?.contactAddresses[0]?.countryName) :'';
        this.selectedBranchId = Branch.id;
        this.memberDto.parentId = Branch.id;
    }
    branchSelectionCanceled() {
        this.selectBranchModal.close();
    }

    //Branch Methods [End]


    async  SaveMember() {
        if ( this.uploader.isUploading ) {
            return this.notify.error(this.l("PleaseWait,SomeAttachmentsAreStillUploading"));
        }
        if (this.isManualOrExternalContact) this.setDefaultPublicFieldsToTrue()
        this.showMainSpinner()
        if(!this.memberDto.code){
        let  sequance="";
        let tenancyName = this.appSession.tenancyName;

        const getNextEntityCodeRes = await this._sycIdentifierDefinitionsServiceProxy.getNextEntityCode(this.entityObjectType).toPromise()
        if(getNextEntityCodeRes)
            sequance=getNextEntityCodeRes;

       this.memberDto.code= tenancyName+"-C"+sequance;
          }
        this._AccountsServiceProxy.createOrEditContact(this.memberDto)
        .pipe(finalize(()=>this.hideMainSpinner()))
        .subscribe(result => {
            const userId = this.memberDto?.userId || result.userId
            const memberId = this.memberDto?.id || result.id
            const isMyProfile = this.appSession?.user?.memberId == this.memberDto?.id
            if(isMyProfile){
                const profileImage = this.memberDto?.entityAttachments?.filter(item=>item.attachmentCategoryId == this.sycAttachmentCategoryLogo.id )[0]
                if(profileImage?.guid) {
                    this.updateLogoService.updateProfilePicture()
                }
            }
            this.createOrEditDone.emit({userId:userId,memberId:memberId});
        });
    }

    AddPhoneToList() {
        this.phonelist.push(new Object());
    }

    removePhoneFromList(i: number) {
        this.phonelist.splice(i,1)
        this.memberDto[`phone${i+1}Ext`] = undefined
        this.memberDto[`phone${i+1}IsPublic`] = undefined
        this.memberDto[`phone${i+1}CountryKey`] = undefined
        this.memberDto[`phone${i+1}Number`]= undefined
        this.memberDto[`phone${i+1}TypeId`] = undefined
        this.memberDto[`phone${i+1}TypeName`] = undefined
    }

    hasErrorphoneNumber(e, i: number) {
    }

    getNumberphoneNumber(e, i: number) {

    }

    onExtentionChange(value, i) {
        this.memberDto[`phone${i+1}Ext`] = value
    }

    onPhoneTypeChange($event:{value: number, originalEvent}, i: number) {
        const label = $event?.originalEvent?.target?.innerText
        // this.memberDto[`phone${i+1}TypeId`] = $event.value
        this.memberDto[`phone${i+1}TypeName`] = label
    }

    onPhoneNumberChange(value, i) {
        this.memberDto[`phone${i+1}Number`] = value
    }

    onIsPublicChange(value, i) {
        this.memberDto[`phone${i+1}IsPublic`] = value
    }

    telInputObjectphoneNumber(obj, i: number) {
        const key = `phone${i+1}CountryKey`
        if (!isNaN(i) && !this.memberDto[key]) {
            this.memberDto[key] = 'us'
            obj.setCountry(this.memberDto[key]);
        }
    }
    onCountryChangephoneNumber(e, i: number) {
        this.memberDto[`phone${i+1}CountryKey`] = e.iso2
    }

    hide(){
        this.active = false
        this.memberDto = undefined
        this.memberForm?.reset()
        this.phonelist = []
        this.allLanguages = []
        this.allPhoneTypes = []
        this.selectedBranchId = undefined
        this.selectedBranchName = undefined
        this.branches = []
        this.ProfileImg = undefined
        this.coverPhoto = undefined
        this.logoId = undefined

    }
}

