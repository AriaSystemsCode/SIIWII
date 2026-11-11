import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { AccountsServiceProxy, SycAttachmentCategoryDto, CreateOrEditAccountInfoDto, TreeNodeOfBranchForViewDto, BranchForViewDto, UserEditDto,  UserServiceProxy, UserListDto, AppEntityExtraDataDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { NgImageSliderComponent } from 'ng-image-slider';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { ViewMemberProfileComponentInputsI } from '../../models/view-member-profile-model';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Observable } from 'rxjs';
import { SelectBranchModalComponent } from '@app/select-branch/select-branch-modal/select-branch-modal.component';
import { CreateOrEditUserModalComponent } from '@app/admin/users/create-or-edit-user-modal.component';
import { ActivatedRoute } from '@node_modules/@angular/router';
import Swal from 'sweetalert2';
import { UpdateLogoService } from '@shared/utils/update-logo.service';

@Component({
  selector: 'app-view-member-profile',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './view-member-profile.component.html',
  styleUrls: ['./view-member-profile.component.scss'],
  animations: [appModuleAnimation()]
})
export class ViewMemberProfileComponent extends AppComponentBase implements OnInit {

  @ViewChild('selectBranchModal', { static: true }) selectBranchModal: SelectBranchModalComponent;
  @ViewChild("createOrEditUserModal", { static: true }) createOrEditUserModal: CreateOrEditUserModalComponent;

  @Input('accountInfoTemp') accountInfoTemp: CreateOrEditAccountInfoDto = new CreateOrEditAccountInfoDto()
  @Input('fromManualAcc') fromManualAcc: boolean

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

  Editting: boolean = false;
  adminContact: boolean = false;
  isManualOrExternalContact: boolean = true

  editInfo = true;
  NoteditInfo = false;
  userAdminId :number
  userSearchQuery: string = '';
  filteredUsers: UserListDto[] = [];
  originalFilteredUsers: UserListDto[] = [];
  memberIslink: boolean = false;
  showUserList: boolean = false;

  constructor(injector: Injector, private _AccountsServiceProxy: AccountsServiceProxy,  private _userService: UserServiceProxy,private route: ActivatedRoute,private  UpdateLogoService:UpdateLogoService) {
    super(injector);
    this.accountInfoTemp = new CreateOrEditAccountInfoDto();

  }

  ngOnInit() {

    this.getAllAttachmentCategories()

  }
  private buildBranchDisplay(member: CreateOrEditAccountInfoDto | undefined): string {
    if (!member) {
      return '';
    }
  
    const parts: string[] = [];
  
    if (member.branchName) {
      // Branch name followed by " - "
      parts.push(member.branchName + ' -');
    }
  
    if (member.addressLine1) {
      parts.push(member.addressLine1);
    }
    if (member.addressLine2) {
      parts.push(member.addressLine2);
    }
    if (member.city) {
      parts.push(member.city);
    }
    if (member.state) {
      parts.push(member.state);
    }
    if (member.zipCode) {
      parts.push(member.zipCode);
    }
    if (member.countryName) {
      parts.push(member.countryName);
    }
  
   
    return parts.join(', ');
  }
  
  editMember() {
    this.Editting = true;
    this.userAdminId = Number(this.route.snapshot.queryParamMap.get('userId'));
    this.userAdminId != 0 ? this.adminContact = true : this.adminContact = false;
  
    if (!this.fromManualAcc) {
      this.editInfo = false;
      this.NoteditInfo = true;
  
    
      this.editjobTitleValue = this.getStringValue(706);
  
      this.editBranchValue = this.buildBranchDisplay(this.memberData);
    this.oldEditBranchValue = this.editBranchValue;
    } else {
      const memberId: number = this.memberData?.id;
      if (isNaN(memberId)) return;
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
  
    this.canDelete = input.canDelete;
    this.canEdit = input.canEdit;
    this.title = input.title;
  
    this.editInfo = true;
    this.NoteditInfo = false;
    this.Editting = false;
  
    this.showMainSpinner();
  
    this._AccountsServiceProxy
      .getAppContactForView(input.id)
      .pipe(
        finalize(() => {
          this.hideMainSpinner();
          this.active = true;
        })
      )
      .subscribe(result => {
        this.memberData = result;
        this.memberData.accountId = this.memberData.accountId; // keeps current behavior
  

        this.showUserList = false;
        this.userSearchQuery = '';
  
        this._userService
          .getUsers('', undefined, undefined, undefined, undefined, undefined, 0)
          .subscribe(users => {
            const entityExtraData = this.memberData?.entityExtraData || [];
            const indx = entityExtraData.findIndex(x => x.attributeId === 715);
  
            if (indx >= 0) {
              this.memberIslink = true;
              const linkedUserId = entityExtraData[indx].attributeValue;
              this.filteredUsers = users.items.filter(
                user => user.id.toString() !== linkedUserId && !user.memberId
              );
            } else {
              this.memberIslink = false;
              this.filteredUsers = users.items.filter(user => !user.memberId);
            }
  
            this.originalFilteredUsers = [...this.filteredUsers];
          });
  
          const firstName = this.getAttributeStringFromDto(result, 701);
          const lastName  = this.getAttributeStringFromDto(result, 702);
  
        this.contactDisplayName = firstName ? firstName : '';
        this.contactDisplayName += lastName ? ' ' + lastName : '';
  
     
        const attachments = this.memberData?.entityAttachments || [];
  
        const logoAttachment = attachments.find(
          att => att.attachmentCategoryId === 1 && !!att.url
        );
        if (logoAttachment?.url) {
          this.logoPhoto = `${this.attachmentBaseUrl}/${logoAttachment.url}`;
        } else {
          this.logoPhoto = undefined;
        }
  
        const coverAttachment = attachments.find(
          att => att.attachmentCategoryId === 2 && !!att.url
        );

        if (coverAttachment?.url) {
          this.coverPhoto = `${this.attachmentBaseUrl}/${coverAttachment.url}`;
        } else {
          this.coverPhoto = undefined;
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
    this.createOrEditUserModal.teamMemberId = this.memberData?.id
    this.createOrEditUserModal.user.name = this.memberData?.extraDataAttributes[0]?.selectedValues?.[this.memberData.extraDataAttributes[0].selectedValues.length - 1]?.value
    this.createOrEditUserModal.user.surname = this.memberData?.extraDataAttributes[1]?.selectedValues?.[this.memberData.extraDataAttributes[1].selectedValues.length - 1]?.value
    this.createOrEditUserModal.fromTeamMember = true;
    this.createOrEditUserModal.show()
  }

  EditUserName() {
  
    const rawId = this.getUserIdValue();

    if (!rawId) {
      this.message.warn(this.l('ThisMemberIsNotLinkedToUser')); // or your preferred message
      return;
    }

    const userId = Number(rawId);

    if (Number.isNaN(userId) || userId <= 0) {
      // this.message.error('Invalid linked user id: ' + rawId);
      // return;
      this.CreateUserName()
    }

    this.createOrEditUserModal.user = new UserEditDto();
    this.createOrEditUserModal.user.id = userId;
    this.createOrEditUserModal.teamMemberId = this.memberData?.id;
    this.createOrEditUserModal.fromTeamMember = true;
  
    this.showMainSpinner();
  
    this._userService
      .getUserForEdit(userId)
      .pipe(finalize(() => this.hideMainSpinner()))
      .subscribe(userResult => {
        if (userResult) {
          this.createOrEditUserModal.user.name        = userResult.user?.name;
          this.createOrEditUserModal.user.surname     = userResult.user?.surname;
          this.createOrEditUserModal.user.userName    = userResult.user?.userName;
          this.createOrEditUserModal.user.emailAddress= userResult.user?.emailAddress;
          this.createOrEditUserModal.user.phoneNumber = userResult.user?.phoneNumber;
        }
  
        this.createOrEditUserModal.show(userId);
      });
  }
  
  editjobTitleValue: string = '';
  editBranchValue: string = '';
  oldEditBranchValue: string = "";
  Save_editMember() {

    const attr = this.memberData?.entityExtraData?.find(attr => attr.attributeId === 706);
    if (attr) {
      attr.attributeValue = this.editjobTitleValue
    }
    this.newEditMemberInfo = this.memberData;
    this.newEditMemberInfo.branchName = this.editBranchValue;
    this.newEditMemberInfo.parentId = this.selectedBranchid;

    this.editInfo = true;
    this.NoteditInfo = false;
    this._AccountsServiceProxy.createOrUpdateContact(this.newEditMemberInfo)
      .pipe(finalize(() => {
        this.hideMainSpinner();
        this.Editting = false;
        this.refresh(true);
      }))
      .subscribe(result => {
        this.notify.success(this.l('SuccessfullySaved'));
      });


  }

  selectBranch() {
    if (!this.memberData?.accountId) return; // silent no-op (no warning)
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
    console.log(Branch, 'BranchBranchBranchBranchBranch')
    this.editBranchValue = Branch?.name ? Branch?.name : '';
    this.editBranchValue += Branch?.contactAddresses[0]?.addressLine1 ? (this.editBranchValue != '' ? ' - ' + Branch?.contactAddresses[0]?.addressLine1 : Branch?.contactAddresses[0]?.addressLine1) : '';
    this.editBranchValue += Branch?.contactAddresses[0]?.addressLine2 ? (this.editBranchValue != '' ? ' , ' + Branch?.contactAddresses[0]?.addressLine2 : Branch?.contactAddresses[0]?.addressLine2) : '';
    this.editBranchValue += Branch?.contactAddresses[0]?.city ? (this.editBranchValue != '' ? ' , ' + Branch?.contactAddresses[0]?.city : Branch?.contactAddresses[0]?.city) : '';
    this.editBranchValue += Branch?.contactAddresses[0]?.state ? (this.editBranchValue != '' ? ' , ' + Branch?.contactAddresses[0]?.state : Branch?.contactAddresses[0]?.state) : '';
    this.editBranchValue += Branch?.contactAddresses[0]?.zipCode ? (this.editBranchValue != '' ? ' , ' + Branch?.contactAddresses[0]?.zipCode : Branch?.contactAddresses[0]?.zipCode) : '';
    this.editBranchValue += Branch?.contactAddresses[0]?.countryName ? (this.editBranchValue != '' ? ' , ' + Branch?.contactAddresses[0]?.countryName : Branch?.contactAddresses[0]?.countryName) : '';
    this.selectedBranchid = Branch.id;

  }

  branchSelectionCanceled() {
    this.selectBranchModal.close();
  }
  cancel() {
    this.editjobTitleValue = this.memberData?.contact?.jobTitle;
    this.editBranchValue =
      (this.memberData?.branchName ? (this.memberData?.branchName + ' ' + " - ") : '') +
      (this.memberData?.addressLine1 ? (this.memberData?.addressLine1 + ', ') : '') +
      (this.memberData?.addressLine2 ? this.memberData?.addressLine2 + ', ' : '') +
      (this.memberData?.city ? (this.memberData?.city + ', ') : '') +
      (this.memberData?.state ? (this.memberData?.state + ', ') : '') +
      (this.memberData?.zipCode ? (this.memberData?.zipCode + ', ') : '') +
      (this.memberData?.countryName ? (this.memberData?.countryName) : '');

    this.oldEditBranchValue = this.editBranchValue;
  }



  getUserIdValue(): string | null {

    const userAttr = this.memberData?.extraDataAttributes
      ?.find(attr => attr.extraAttributeId === 715);
  
    const extraVal = userAttr?.selectedValues?.length
      ? userAttr.selectedValues[userAttr.selectedValues.length - 1].value
      : null;
  
    let val = extraVal;
  

    if (!val || !val.toString().trim()) {
      const entityAttr = this.memberData?.entityExtraData
        ?.find(e => e.attributeId === 715);
      val = entityAttr?.attributeValue ?? null;
    }
  
    return val && val.toString().trim() !== '' ? val.toString() : null;
  }
  

  getJoinDate(): string | null {
    const joinDateAttr = this.memberData?.extraDataAttributes?.find(attr => attr.extraAttributeId === 707);
    const val = joinDateAttr?.selectedValues?.[joinDateAttr.selectedValues.length - 1]?.value;
    return val && val.trim() !== '' ? val : null;
  }

  getJoinDateIsPublic(): boolean {
    const isPublicAttr = this.memberData?.extraDataAttributes?.find(attr => attr.extraAttributeId === 713);
    const val = isPublicAttr?.selectedValues?.[isPublicAttr.selectedValues.length - 1]?.value;
    return val === 'true';
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


  getStringValue(attrId: number): string {
    return this.getAttributeStringFromDto(this.memberData, attrId);
  }
  


  toggleUserList() {
    this.showUserList = !this.showUserList;
    this.filteredUsers = [...this.originalFilteredUsers];
    this.userSearchQuery = '';
    this.loadUsers(this.userSearchQuery);
  }
  
  filterUsers(query: string): void {
    this.loadUsers(query);
  }
  
  loadUsers(query: string) {
    this._userService
      .getUsers(query || '', undefined, undefined, undefined, undefined, undefined, 0)
      .subscribe(users => {
        const linkedIndex = this.memberData.entityExtraData.findIndex(x => x.attributeId === 715);
  
        if (linkedIndex >= 0) {
          const linkedUserId = this.memberData.entityExtraData[linkedIndex].attributeValue;
          this.filteredUsers = users.items.filter(user => user.id.toString() !== linkedUserId && !user.memberId);
        } else {
          this.filteredUsers = users.items.filter(user => !user.memberId);
        }
        });
      }
  
  linkToUser(user: UserListDto, i: number) {
    this.showMainSpinner();
  
    if (user.memberId) {
      // User already linked
      this._AccountsServiceProxy.getAppContactForView(user.memberId)
        .pipe(finalize(() => {this.hideMainSpinner();}))
        .subscribe(result => {
          Swal.fire({
            title: "",
            text: `User already linked to team member '${result.name}'`,
            icon: "info",
            customClass: {
              popup: 'popup-class',
              icon: 'icon-class',
              content: 'content-class',
              actions: 'actions-class',
              confirmButton: 'confirm-button-class',
            },
          });
        });
      return;
    }
  
    // Link user
    const linkedIndex = this.memberData.entityExtraData.findIndex(x => x.attributeId === 715);
  
    if (linkedIndex >= 0) {
      this.memberData.entityExtraData[linkedIndex].attributeValue = user.id.toString();
    } else {
      const extraData: AppEntityExtraDataDto = new AppEntityExtraDataDto();
      extraData.attributeId = 715;
      extraData.attributeValue = user.id.toString();
      this.memberData.entityExtraData.push(extraData);
    }
  
    this._AccountsServiceProxy.createOrUpdateContact(this.memberData)
      .pipe(finalize(() => {
        this.filteredUsers.splice(i, 1);
        this.showUserList = false;
        this.memberIslink = true;
        this.hideMainSpinner();
      }))
      .subscribe({
        next: () => {
          this.UpdateLogoService.updateProfilePicture();
          this.refresh(true);
  
        },
        
      });
  }
  private getAttributeStringFromDto(
    dto: CreateOrEditAccountInfoDto | undefined,
    attrId: number
  ): string {
    if (!dto) {
      return '';
    }
  
    
    const extraAttr = dto.extraDataAttributes
      ?.find(a => a.extraAttributeId === attrId);
  
    const extraVal = extraAttr?.selectedValues?.length
      ? extraAttr.selectedValues[extraAttr.selectedValues.length - 1].value
      : null;
  
    if (extraVal && extraVal.toString().trim() !== '') {
      return extraVal.toString();
    }
  

    const entityAttr = dto.entityExtraData
      ?.find(e => e.attributeId === attrId);
  
    const entityVal = entityAttr?.attributeValue;
  
    return entityVal && entityVal.toString().trim() !== ''
      ? entityVal.toString()
      : '';
  }
  
  
}
