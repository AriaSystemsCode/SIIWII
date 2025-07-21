import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { AccountsServiceProxy, ContactDto, ContactForEditDto, SycAttachmentCategoryDto, CreateOrEditAccountInfoDto, TreeNodeOfBranchForViewDto, BranchForViewDto, UserEditDto, GetAllEntityObjectTypeOutput, SycEntityObjectTypesServiceProxy } from '@shared/service-proxies/service-proxies';
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
    newEditMemberInfo: ContactDto;
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
    constructor(injector: Injector, private _AccountsServiceProxy: AccountsServiceProxy,        private _sycEntityObjectTypesServiceProxy: SycEntityObjectTypesServiceProxy,) {
        super(injector);
        this.accountInfoTemp = new CreateOrEditAccountInfoDto();

    }
    ngOnInit() {
        this.getAppItemTypeExtraAttributesById()
        this.getAllAttachmentCategories()

    }
    editInfo = true;
    NoteditInfo = false;
    editMember() {
        this.Editting=true;
        if (this.adminContact) {
            this.editInfo = false;
            this.NoteditInfo = true;
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
        } else {
            const memberId: number = this.memberData?.contact?.id;
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

    show(input: ViewMemberProfileComponentInputsI) {
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

            }))
            .subscribe((result) => {
                console.log(result,'coooooooooon')
                this.memberData = result;
                this.adminContact =   this.memberData?.name.includes("admin");
                // const firstName = this.memberData.contact.firstName
                // const lastName = this.memberData.contact.lastName
                // this.contactDisplayName = firstName ? firstName : ""
                // this.contactDisplayName += lastName ? " " + lastName : ""
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
       this.createOrEditUserModal.user.name= this.memberData?.firstName;
       this.createOrEditUserModal.user.surname=this.memberData?.lastName;
       this.createOrEditUserModal.fromTeamMember=true;
       this.createOrEditUserModal.show()
    }
    editjobTitleValue: string = '';
    editBranchValue: string = '';
    oldEditBranchValue:string="";
    Save_editMember() {
        
        this.newEditMemberInfo = this.memberData.contact;
        this.newEditMemberInfo.jobTitle = this.editjobTitleValue;
        this.newEditMemberInfo.branchName = this.editBranchValue;
        this.newEditMemberInfo.parentId = this.selectedBranchid;

            this.editInfo = true;
            this.NoteditInfo = false;
            this._AccountsServiceProxy.createOrEditContact(this.newEditMemberInfo)
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
        this._AccountsServiceProxy.getBranchForEdit(this.memberData.contact.accountId).subscribe((rootBranchData) => {
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
            this._sycEntityObjectTypesServiceProxy.getAllWithExtraAttributes(21)
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
          
        
}
