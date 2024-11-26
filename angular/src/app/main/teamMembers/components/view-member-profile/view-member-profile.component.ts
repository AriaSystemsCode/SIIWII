import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { AccountsServiceProxy, ContactDto, ContactForEditDto, SycAttachmentCategoryDto, CreateOrEditAccountInfoDto, TreeNodeOfBranchForViewDto, BranchForViewDto, UserEditDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { NgImageSliderComponent } from 'ng-image-slider';
import { AppConsts } from '@shared/AppConsts';


import { finalize } from 'rxjs/operators';
import { ViewMemberProfileComponentInputsI } from '../../models/view-member-profile-model';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { SelectBranchModalComponent } from '@app/select-branch/select-branch-modal/select-branch-modal.component';
import { CreateOrEditUserModalComponent } from '@app/admin/users/create-or-edit-user-modal.component';

@Component({
    selector: 'app-view-member-profile',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './view-member-profile.component.html',
    styleUrls: ['./view-member-profile.component.scss'],
    animations: [appModuleAnimation()]
})
export class ViewMemberProfileComponent extends AppComponentBase implements OnInit {

    editMode = false;
    @ViewChild('nav') slider: NgImageSliderComponent;
    memberData: ContactForEditDto;
    newEditMemberInfo: ContactDto;
    @Input('accountInfoTemp') accountInfoTemp: CreateOrEditAccountInfoDto = new CreateOrEditAccountInfoDto()

    @Output() edit: EventEmitter<number> = new EventEmitter<number>()
    @Output() delete: EventEmitter<number> = new EventEmitter<number>()


    canEdit: boolean;
    canDelete: boolean;
    canView: boolean;

    attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
    logoPhoto: string
    coverPhoto: string
    title: string
    contactDisplayName: string
    active = false;

    logoDefaultImage = "../../../assets/placeholders/_logo-placeholder.png"
    coverDefaultImage = "../../../assets/placeholders/_default_cover.jpg"
    sycAttachmentCategoryLogo: SycAttachmentCategoryDto
    sycAttachmentCategoryBanner: SycAttachmentCategoryDto

    @ViewChild('selectBranchModal', { static: true }) selectBranchModal: SelectBranchModalComponent;
    @ViewChild("createOrEditUserModal", { static: true })  createOrEditUserModal: CreateOrEditUserModalComponent;
    Editting:boolean =false;
    adminContact:boolean =false;
    constructor(injector: Injector, private _AccountsServiceProxy: AccountsServiceProxy) {
        super(injector);
        this.accountInfoTemp = new CreateOrEditAccountInfoDto();
        //this.accountInfoTemp.entityClassifications = [];
        //this.accountInfoTemp.entityCategories = [];
    }
    ngOnInit() {
        this.getAllAttachmentCategories()

    }
    editInfo = true;
    NoteditInfo = false;
    editMember() {
        this.Editting=true;
        debugger
        //this.memberData?.contact.eMailAddress
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
        const memberId: number = this.memberData?.contact?.id;
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

        this._AccountsServiceProxy.getContactForView(input.id)
            .pipe(finalize(() => {
                this.hideMainSpinner()
                this.active = true

            }))
            .subscribe((result) => {
                this.memberData = result;
                this.adminContact =   this.memberData?.contact.userName.includes("admin");
                const firstName = this.memberData.contact.firstName
                const lastName = this.memberData.contact.lastName
                this.contactDisplayName = firstName ? firstName : ""
                this.contactDisplayName += lastName ? " " + lastName : ""
                if (this.memberData?.imageUrl) this.logoPhoto = this.attachmentBaseUrl + '/' + this.memberData?.imageUrl;
                if (this.memberData?.coverUrl) this.coverPhoto = this.attachmentBaseUrl + '/' + this.memberData?.coverUrl;
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
       this.createOrEditUserModal.user.name= this.memberData?.contact?.firstName;
       this.createOrEditUserModal.user.surname=this.memberData?.contact?.lastName;
    //    this.createOrEditUserModal.user.emailAddress= this.memberData?.contact?.eMailAddress;
    //    this.createOrEditUserModal.user.phoneNumber=this.memberData?.contact?.phone1Number;
       this.createOrEditUserModal.fromTeamMember=true;
       this.createOrEditUserModal.show()
    }
    editjobTitleValue: string = '';
    editBranchValue: string = '';
    oldEditBranchValue:string="";
    Save_editMember() {
        debugger
        this.newEditMemberInfo = this.memberData.contact;
        this.newEditMemberInfo.jobTitle = this.editjobTitleValue;
        this.newEditMemberInfo.branchName = this.editBranchValue;
        this.newEditMemberInfo.parentId = this.selectedBranchid;

        //accountInfoTemp
        
            this.editInfo = true;
            this.NoteditInfo = false;
            //  this._AccountsServiceProxy.createOrEditContact(this.newEditMemberInfo)

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

}
