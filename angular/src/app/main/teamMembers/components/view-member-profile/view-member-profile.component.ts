import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { AccountsServiceProxy, ContactDto, ContactForEditDto, SycAttachmentCategoryDto, CreateOrEditAccountInfoDto, TreeNodeOfBranchForViewDto, BranchForViewDto, UserEditDto, GetAllEntityObjectTypeOutput, SycEntityObjectTypesServiceProxy, UserServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { NgImageSliderComponent } from 'ng-image-slider';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { ViewMemberProfileComponentInputsI } from '../../models/view-member-profile-model';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Observable } from 'rxjs';
import { SelectBranchModalComponent } from '@app/select-branch/select-branch-modal/select-branch-modal.component';
import { CreateOrEditUserModalComponent } from '@app/admin/users/create-or-edit-user-modal.component';
import { CreateEditAppItemExtraAttribute } from '@app/main/app-items/app-item-shared/models/create-edit-app-item-extra-attribute';
import { EExtraAttributeUsage } from '@app/main/app-items/appItems/models/extra-attribute-usage.enum';

@Component({
    selector: 'app-view-member-profile',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './view-member-profile.component.html',
    styleUrls: ['./view-member-profile.component.scss'],
    animations: [appModuleAnimation()]
})
export class ViewMemberProfileComponent extends AppComponentBase implements OnInit {
    @ViewChild('nav') slider: NgImageSliderComponent;
    @ViewChild('selectBranchModal', { static: true }) selectBranchModal: SelectBranchModalComponent;
    @ViewChild("createOrEditUserModal", { static: true })  createOrEditUserModal: CreateOrEditUserModalComponent;

    @Input('accountInfoTemp') accountInfoTemp: CreateOrEditAccountInfoDto = new CreateOrEditAccountInfoDto()

    @Output() edit: EventEmitter<number> = new EventEmitter<number>()
    @Output() delete: EventEmitter<number> = new EventEmitter<number>()


    
    editMode = false;
    memberData: CreateOrEditAccountInfoDto;
    newEditMemberInfo: CreateOrEditAccountInfoDto;
    canEdit: boolean;
    canDelete: boolean;
    canView: boolean;

    attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
    logoPhoto: string
    coverPhoto: string
    title: string
    contactDisplayName: string
    active = false;

    logoDefaultImage = "../../../assets/common/images/default-profile-picture.png"
    coverDefaultImage = "../../../assets/placeholders/_default_cover.jpg"
    sycAttachmentCategoryLogo: SycAttachmentCategoryDto
    sycAttachmentCategoryBanner: SycAttachmentCategoryDto

    Editting:boolean =false;
    adminContact:boolean =false;
    isManualOrExternalContact: boolean = true
    
        data:any
        allAttributes = []; // flat list from API
        groupedByUsage = {}; // { RECOMMENDED: [], ADDITIONAL: [] }
        usageList: string[] = []; // for sidebar
        selectedUsage: string;
    
    
          selectedTransactionTypeData: GetAllEntityObjectTypeOutput =
            new GetAllEntityObjectTypeOutput();
            selectedTransTypeData:any
          extraAttributes: any;
    
          activeAccordionIndexes: number[] = [0]; // open first tab by default
          appTransactionsForViewDto:any
          hasUnsavedChanges = false;
    constructor(injector: Injector, private _AccountsServiceProxy: AccountsServiceProxy,        private _sycEntityObjectTypesServiceProxy: SycEntityObjectTypesServiceProxy, private _userService: UserServiceProxy,) {
        super(injector);
        this.accountInfoTemp = new CreateOrEditAccountInfoDto();

    }
    ngOnInit() {
        this.getAllAttachmentCategories()

    }
    editInfo = true;
    NoteditInfo = false;
    editMember() {
        this.Editting=true;
        if (!this.adminContact && !this.isManualOrExternalContact) {
            this.editInfo = false;
            this.NoteditInfo = true;
            this.editjobTitleValue = this.jobTitleAttr?.selectedValues[this.jobTitleAttr.selectedValues.length - 1].value;
            this.editBranchValue =
                (this.memberData?.branchName ? (this.memberData?.branchName + ' ' + " - ") : '') +
                (this.memberData?.addressLine1 ? (this.memberData?.addressLine1 + ', ') : '') +
                (this.memberData?.addressLine2 ? this.memberData?.addressLine2 + ', ' : '') +
                (this.memberData?.city ? (this.memberData?.city + ', ') : '') +
                (this.memberData?.state ? (this.memberData?.state + ', ') : '') +
                (this.memberData?.zipCode ? (this.memberData?.zipCode + ', ') : '') +
                (this.memberData?.countryName ? (this.memberData?.countryName) : '');

                this.oldEditBranchValue =this.editBranchValue;
        } else {
            const memberId: number = this.memberData?.id;
            if (isNaN(memberId)) return
            this.edit.emit(memberId);
        }
    }
    deleteMember() {
        const memberId: number = this.memberData?.id;
        if (isNaN(memberId)) return
        var isConfirmed: Observable<boolean>;
        isConfirmed = this.askToConfirm("AreYouSureYouWantToDeleteThisContact?", "AreYouSure");

        isConfirmed.subscribe((res) => {
            if (res) {
                this.delete.emit(memberId)
            }
        }
        );
    }
    private lastInputId: number;
    show(input: ViewMemberProfileComponentInputsI, isManualOrExternalContact?: boolean) {
      this.lastInputId = input.id;
      this.isManualOrExternalContact = isManualOrExternalContact;
  
        this.canDelete = input.canDelete
        this.canEdit = input.canEdit
        this.title = input.title
        this.editInfo = true;
        this.NoteditInfo = false;
        this.Editting=false;
        this.showMainSpinner()

        this._AccountsServiceProxy.getAppContactForView(input.id)
            .pipe(finalize(() => {
                this.hideMainSpinner()
                this.active = true
        this.getAppItemTypeExtraAttributesById()


            }))
            .subscribe((result) => {
             
                this.memberData = result;

                this.adminContact =   this.memberData?.name.includes("admin");
                const firstName = this.memberData?.extraDataAttributes[0]?.selectedValues?.[this.memberData.extraDataAttributes[0].selectedValues.length - 1]?.value
                const lastName = this.memberData?.extraDataAttributes[1]?.selectedValues?.[this.memberData.extraDataAttributes[1].selectedValues.length - 1]?.value
                this.contactDisplayName = firstName ? firstName : ""
                this.contactDisplayName += lastName ? " " + lastName : ""
                // if (this.memberData?.imageUrl) this.logoPhoto = this.attachmentBaseUrl + '/' + this.memberData?.imageUrl;
                // if (this.memberData?.coverUrl) this.coverPhoto = this.attachmentBaseUrl + '/' + this.memberData?.coverUrl;
                const logoAttachment = this.memberData?.entityAttachments?.find(att => att.attachmentCategoryId === 1 && att.url);

                if (logoAttachment) {
                this.logoPhoto = this.attachmentBaseUrl + '/' + logoAttachment.url;
                }

                const coverAttachment = this.memberData?.entityAttachments?.find(att => att.attachmentCategoryId === 2 && att.url);

                if (logoAttachment) {
                this.coverPhoto = this.attachmentBaseUrl + '/' + coverAttachment.url;
                }

            });
    }

    hide() {
        this.active = false
        this.memberData = undefined
        this.canDelete = undefined
        this.canEdit = undefined
        this.canView = undefined
    }

    getAllAttachmentCategories() {
        this.getSycAttachmentCategoriesByCodes(['LOGO', "BANNER"]).subscribe((result) => {
            result.forEach(item => {
                if (item.code == "LOGO") this.sycAttachmentCategoryLogo = item
                else if (item.code == "BANNER") this.sycAttachmentCategoryBanner = item
            })
        })

    }
    CreateUserName() {
       this.createOrEditUserModal.user = new UserEditDto();
       this.createOrEditUserModal.user.name= this.memberData?.extraDataAttributes[0]?.selectedValues?.[this.memberData.extraDataAttributes[0].selectedValues.length - 1]?.value
       this.createOrEditUserModal.user.surname=this.memberData?.extraDataAttributes[1]?.selectedValues?.[this.memberData.extraDataAttributes[1].selectedValues.length - 1]?.value
       this.createOrEditUserModal.fromTeamMember=true;
       this.createOrEditUserModal.show()
    }

    EditUserName(){
 
        this.createOrEditUserModal.user = new UserEditDto();
        this.createOrEditUserModal.user.id = Number(this.userId?.selectedValues[this.userId.selectedValues.length - 1]?.value);
        this._userService.getUserForEdit( this.createOrEditUserModal.user.id).subscribe(userResult => {
          if(userResult){
            // this.createOrEditUserModal.user.name= this.memberData?.extraDataAttributes[0]?.selectedValues?.[this.memberData.extraDataAttributes[0].selectedValues.length - 1]?.value
            // this.createOrEditUserModal.user.surname=this.memberData?.extraDataAttributes[1]?.selectedValues?.[this.memberData.extraDataAttributes[1].selectedValues.length - 1]?.value
            // this.createOrEditUserModal.user.userName=this.memberData?.extraDataAttributes[12]?.selectedValues?.[this.memberData.extraDataAttributes[12].selectedValues.length - 1]?.value
            // this.createOrEditUserModal.user.emailAddress=this.memberData?.eMailAddress
            // this.createOrEditUserModal.user.phoneNumber=this.memberData?.phone1Number
            this.createOrEditUserModal.user.name= userResult?.user?.name
            this.createOrEditUserModal.user.surname=userResult?.user?.surname
            this.createOrEditUserModal.user.userName=userResult?.user?.userName
            this.createOrEditUserModal.user.emailAddress=userResult?.user?.emailAddress
            this.createOrEditUserModal.user.phoneNumber=userResult?.user?.phoneNumber
          }
     
 
          // this.createOrEditUserModal.fromTeamMember=true;
          this.createOrEditUserModal.show(this.createOrEditUserModal.user.id)
       

    
        });
 
    }

    editjobTitleValue: string = '';
    editBranchValue: string = '';
    oldEditBranchValue:string="";
    Save_editMember() {
   
        const attr = this.memberData?.entityExtraData?.find(attr => attr.attributeId === 706);
        if (attr) {
          attr.attributeValue =this.editjobTitleValue
        }
        this.newEditMemberInfo = this.memberData;
        // this.newEditMemberInfo.jobTitle = this.editjobTitleValue;
        this.newEditMemberInfo.branchName = this.editBranchValue;
        this.newEditMemberInfo.parentId = this.selectedBranchid;

            this.editInfo = true;
            this.NoteditInfo = false;
            this._AccountsServiceProxy.createOrUpdateContact(this.newEditMemberInfo)
                .pipe(finalize(() => {
                    this.hideMainSpinner(); 
                    this.Editting=false;
        }))
                .subscribe(result => {
                    this.notify.success(this.l('SuccessfullySaved'));
                });

       
    }

    selectBranch() {
        this.getAccountBranches();
    }

    branches: TreeNodeOfBranchForViewDto[] = [];
    selectedBranchid;
    getAccountBranches() {
        this._AccountsServiceProxy.getBranchForEdit(this.memberData.accountId).subscribe((rootBranchData) => {
            const rootBranch: TreeNodeOfBranchForViewDto = new TreeNodeOfBranchForViewDto()
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


    branchSelected(Branch) {
        console.log(Branch,'BranchBranchBranchBranchBranch')
        this.editBranchValue = Branch?.name ? Branch?.name : '';
        this.editBranchValue += Branch?.contactAddresses[0]?.addressLine1 ? (this.editBranchValue != '' ? ' - ' + Branch?.contactAddresses[0]?.addressLine1 : Branch?.contactAddresses[0]?.addressLine1) : '';
        this.editBranchValue += Branch?.contactAddresses[0]?.addressLine2 ? (this.editBranchValue != '' ? ' , ' + Branch?.contactAddresses[0]?.addressLine2 : Branch?.contactAddresses[0]?.addressLine2) : '';
        this.editBranchValue += Branch?.contactAddresses[0]?.city ? (this.editBranchValue != '' ? ' , ' + Branch?.contactAddresses[0]?.city : Branch?.contactAddresses[0]?.city) : '';
        this.editBranchValue += Branch?.contactAddresses[0]?.state ? (this.editBranchValue != '' ? ' , ' + Branch?.contactAddresses[0]?.state : Branch?.contactAddresses[0]?.state) : '';
        this.editBranchValue += Branch?.contactAddresses[0]?.zipCode ? (this.editBranchValue != '' ? ' , ' + Branch?.contactAddresses[0]?.zipCode : Branch?.contactAddresses[0]?.zipCode) : '';
        this.editBranchValue += Branch?.contactAddresses[0]?.countryName ? (this.editBranchValue != '' ? ' , ' + Branch?.contactAddresses[0]?.countryName : Branch?.contactAddresses[0]?.countryName) : '';
        this.selectedBranchid=  Branch.id;
     
    }

    branchSelectionCanceled() {
        this.selectBranchModal.close();
    }
    cancel(){
        this.editjobTitleValue = this.memberData?.contact?.jobTitle;
        this.editBranchValue =
            (this.memberData?.branchName ? (this.memberData?.branchName + ' ' + " - ") : '') +
            (this.memberData?.addressLine1 ? (this.memberData?.addressLine1 + ', ') : '') +
            (this.memberData?.addressLine2 ? this.memberData?.addressLine2 + ', ' : '') +
            (this.memberData?.city ? (this.memberData?.city + ', ') : '') +
            (this.memberData?.state ? (this.memberData?.state + ', ') : '') +
            (this.memberData?.zipCode ? (this.memberData?.zipCode + ', ') : '') +
            (this.memberData?.countryName ? (this.memberData?.countryName) : '');

            this.oldEditBranchValue =this.editBranchValue;
    }

            
        defineExtraAttributes() {
          this.extraAttributes = {};
        
          const allAttributes = this.selectedTransTypeData?.extraAttributes?.extraAttributes ?? [];
        
          allAttributes.forEach(attr => {
            const usageKey = attr.usage?.replace(/\s+/g, '_').toUpperCase() || 'DEFAULT';
        
            if (!this.extraAttributes[usageKey]) {
              this.extraAttributes[usageKey] = new CreateEditAppItemExtraAttribute({
                header: this.l(attr.usage),
                title: this.l(attr.usage),
                usageEnum: usageKey as unknown as EExtraAttributeUsage,
                orderOfDisplay: 1,
                filteredExtraAttributes: [],
                extraAttributes: []
              });
            }
        
            // ✅ Add this if missing
            if (!attr.paginationSetting) {
              attr.paginationSetting = {
                skipCount: 0,
                maxResultCount: 10,
                totalCount: 0,
                list: []
              };
            }
         
              
              
            this.extraAttributes[usageKey].filteredExtraAttributes.push(attr);
          });
        
        }
        
        getAppItemTypeExtraAttributesById() {
            this._sycEntityObjectTypesServiceProxy.getAllWithExtraAttributes(this.memberData?.accountTypeId)
              .subscribe((res) => {
                if (res?.length > 0) {
                  this.allAttributes = res[0]?.extraAttributes.extraAttributes;
          
                  // Group attributes by `usage`
                  this.groupedByUsage = this.groupAttributesByUsage(this.allAttributes);
                  this.usageList = Object.keys(this.groupedByUsage);
                  this.selectedUsage = this.usageList[0];
          
                  // ✅ Initialize extraAttributes before using it
                  this.selectedTransTypeData = res[0]; // ensure defineExtraAttributes uses correct data
                  this.defineExtraAttributes();
          
                //   this.loadRecommendedAndAdditionalExtraDataLookupLists();
        
                //   setTimeout(() => this.scrollToUsage(this.selectedUsage), 200);
                }
              });
          }









          groupAttributesByUsage(attrs: any[]): any {
            return attrs.reduce((acc, attr) => {
              const usage = attr.usage || 'UNSPECIFIED';
              if (!acc[usage]) acc[usage] = [];
              acc[usage].push(attr);
              return acc;
            }, {});
          }
        
          selectUsage(usage: string): void {
            this.selectedUsage = usage;
          }
          
          getUserIdValue(): string | null {
            const userIdAttr = this.memberData?.extraDataAttributes?.find(attr => attr.extraAttributeId === 715);
            const val = userIdAttr?.selectedValues?.[userIdAttr.selectedValues.length - 1]?.value;
            return val && val.trim() !== '' ? val : null;
          }

          get jobTitleAttr() {
            return this.memberData?.extraDataAttributes?.find(attr => attr.extraAttributeId === 706);
          }
         

          getJoinDate(): string | null {
            const joinDateAttr = this.memberData?.extraDataAttributes?.find(attr => attr.extraAttributeId === 707);
            const val = joinDateAttr?.selectedValues?.[joinDateAttr.selectedValues.length - 1]?.value;
            return val && val.trim() !== '' ? val : null;
          }
          
          getJoinDateIsPublic(): boolean {
            const isPublicAttr = this.memberData?.extraDataAttributes?.find(attr => attr.extraAttributeId === 713);
            const val = isPublicAttr?.selectedValues?.[isPublicAttr.selectedValues.length - 1]?.value;
            return val === 'true' ;
          }
          

          get userId() {
            return this.memberData?.extraDataAttributes?.find(attr => attr.extraAttributeId === 715);
          }
         

          refresh(event: boolean) {
            if (event && this.lastInputId) {
                this.show({ 
                    id: this.lastInputId,
                    canEdit: this.canEdit,
                    canDelete: this.canDelete,
                    title: this.title
                });
            }
        }
        
          

        
}
