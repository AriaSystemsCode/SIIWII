import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, Input, ViewEncapsulation } from '@angular/core';
import {
  AccountsServiceProxy, SycAttachmentCategoryDto, CreateOrEditAccountInfoDto, UserEditDto,
  UserServiceProxy, UserListDto, AppEntityExtraDataDto, SycEntityObjectTypesServiceProxy
} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { ViewMemberProfileComponentInputsI } from '../../models/view-member-profile-model';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { CreateOrEditUserModalComponent } from '@app/admin/users/create-or-edit-user-modal.component';
import Swal from 'sweetalert2';
import { UpdateLogoService } from '@shared/utils/update-logo.service';
import {
  RELATION_ATTR, RELATION_DEFINITION_CODE, RELATION_ENTITY_TYPE,
  extractRelationAttributes, buildRelationInputs, collectRelationChanges,
  clearRelationChange, applyRelationChanges
} from '../../models/relation-settings.helper';


@Component({
  selector: 'app-view-member-profile',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './view-member-profile.component.html',
  styleUrls: ['./view-member-profile.component.scss'],
  animations: [appModuleAnimation()]
})
export class ViewMemberProfileComponent extends AppComponentBase implements OnInit {

  @ViewChild('createOrEditUserModal', { static: true }) createOrEditUserModal: CreateOrEditUserModalComponent;

  // kept so existing parent bindings keep compiling
  @Input('accountInfoTemp') accountInfoTemp: CreateOrEditAccountInfoDto = new CreateOrEditAccountInfoDto();
  @Input('fromManualAcc') fromManualAcc: boolean;

  @Output() edit = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();

  memberData: CreateOrEditAccountInfoDto;
  canEdit: boolean;
  canDelete: boolean;

  attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
  logoPhoto: string;
  coverPhoto: string;
  title: string;
  contactDisplayName: string;
  active = false;
  phones: { typeName: string; number: string; ext: string }[] = [];

  logoDefaultImage = '../../../assets/common/images/default-profile-picture.png';
  coverDefaultImage = '../../../assets/placeholders/_default_cover.jpg';
  sycAttachmentCategoryLogo: SycAttachmentCategoryDto;
  sycAttachmentCategoryBanner: SycAttachmentCategoryDto;

  /** true => only Relationship Settings are being edited inline */
  Editting = false;
  isManualOrExternalContact = true;
  filteredUsers: UserListDto[] = [];

  // Relationship settings
  relationAttributes: any[] = [];
  relationAttributeObject: any = null;
  relationEntityObjectTypeId: number;
  relationInputsDto: any = null;
  private relationChanges = new Map<number, any>();

  private lastInputId: number;

  constructor(
    injector: Injector,
    private _AccountsServiceProxy: AccountsServiceProxy,
    private _userService: UserServiceProxy,
    private _updateLogoService: UpdateLogoService,
    private _sycEntityObjectTypesServiceProxy: SycEntityObjectTypesServiceProxy
  ) {
    super(injector);
  }

  ngOnInit() {
    this.getAllAttachmentCategories();
  }

  // ---------------------------------------------------------------- permissions

  /** Manual / external contact, or the contact belongs to the current tenant => full edit page. */
  get canFullEditMember(): boolean {
    if (!this.memberData) {
      return false;
    }

    return (
      this.fromManualAcc === true ||
      (
        this.appSession.tenantId != null &&
        this.memberData.tenantOwner != null &&
        Number(this.appSession.tenantId) ===
        Number(this.memberData.tenantOwner)
      )
    );
  }

  get canShowEditButton(): boolean {
    return !!this.canEdit || this.canFullEditMember;
  }

  get canEditSettings(): boolean {
    return !!this.canEdit && !this.canFullEditMember;
  }

  get canDeleteMember(): boolean {
    if (!this.memberData) {
      return false;
    }

    // Manual Account => Delete allowed
    // Other contacts => use existing delete permission
    return this.fromManualAcc === true || !!this.canDelete;
  }



  // ---------------------------------------------------------------- show / hide

  show(
    input: ViewMemberProfileComponentInputsI,
    isManualOrExternalContact?: boolean
  ): void {

    this.lastInputId = input.id;

    this.isManualOrExternalContact =
      isManualOrExternalContact === true;

    this.canEdit = input.canEdit;
    this.canDelete = input.canDelete;

    this.title = input.title;
    this.resetEditState();

    this.showMainSpinner();

    this._AccountsServiceProxy
      .getAppContactForView(input.id)
      .pipe(finalize(() => {
        this.hideMainSpinner();
        this.active = true;
      }))
      .subscribe(result => {

        this.memberData = result;

        console.log('Manual Account:', this.fromManualAcc);
        console.log('Tenant Owner:', result?.tenantOwner);
        console.log('Can Full Edit:', this.canFullEditMember);
        console.log('Can Delete:', this.canDeleteMember);

        // Keep all existing code here:
        this.loadRelationAttributes();
        this.loadUsers();

        this.contactDisplayName = [
          this.getStringValue(701),
          this.getStringValue(702)
        ].filter(x => !!x).join(' ');

        this.logoPhoto = this.getAttachmentUrl(1);
        this.coverPhoto = this.getAttachmentUrl(2);

        this.phones = [1, 2, 3]
          .map(i => ({
            typeName: result[`phone${i}TypeName`],
            number: result[`phone${i}Number`],
            ext: result[`phone${i}Ex`]
          }))
          .filter((p, index) => index === 0 || !!p.number);
      });
  }

  hide() {
    this.active = false;
    this.memberData = undefined;
    this.canDelete = undefined;
    this.canEdit = undefined;
    this.resetEditState();
  }

  refresh(event: boolean) {
    if (event && this.lastInputId) {
      this.show(
        { id: this.lastInputId, canEdit: this.canEdit, canDelete: this.canDelete, title: this.title },
        this.isManualOrExternalContact
      );
    }
  }

  private getAttachmentUrl(categoryId: number): string | undefined {
    const url = this.memberData?.entityAttachments?.find(a => a.attachmentCategoryId === categoryId && !!a.url)?.url;
    return url ? `${this.attachmentBaseUrl}/${url}` : undefined;
  }

  getAllAttachmentCategories() {
    this.getSycAttachmentCategoriesByCodes(['LOGO', 'BANNER']).subscribe(result => {
      result.forEach(item => {
        if (item.code == 'LOGO') this.sycAttachmentCategoryLogo = item;
        else if (item.code == 'BANNER') this.sycAttachmentCategoryBanner = item;
      });
    });
  }

  // ---------------------------------------------------------------- edit / delete

  editMember(): void {

    if (!this.memberData?.id || !this.canShowEditButton) {
      return;
    }

    const memberId = this.memberData.id;

    if (this.canFullEditMember) {

      console.log('Opening full edit:', memberId);

      this.edit.emit(memberId);
      return;
    }

    // Different tenant => Relationship Settings only
    this.Editting = true;
    this.prepareRelationInputs();
  }

  cancel(): void {
    this.resetEditState();
  }

  deleteMember(): void {

    if (!this.canDeleteMember || !this.memberData?.id) {
      return;
    }

    const memberId = this.memberData.id;

    this.askToConfirm(
      'AreYouSureYouWantToDeleteThisContact?',
      'AreYouSure'
    ).subscribe(confirmed => {

      if (confirmed) {
        this.delete.emit(memberId);
      }

    });
  }

  saveRelationSettings(): void {
    if (!this.canEditSettings || !this.Editting) return;

    const payload = CreateOrEditAccountInfoDto.fromJS(this.memberData.toJSON());
    applyRelationChanges(payload, this.relationChanges, this.relationEntityObjectTypeId);

    this.showMainSpinner();
    this._AccountsServiceProxy
      .createOrUpdateContact(payload)
      .pipe(finalize(() => this.hideMainSpinner()))
      .subscribe(() => {
        this.notify.success(this.l('SuccessfullySaved'));
        this.refresh(true); // show() resets edit state
      });
  }

  private resetEditState(): void {
    this.Editting = false;
    this.relationChanges.clear();
    this.relationAttributeObject = null;
    this.relationInputsDto = null;
  }

  // ---------------------------------------------------------------- user link

  CreateUserName() {
    this.createOrEditUserModal.user = new UserEditDto();
    this.createOrEditUserModal.teamMemberId = this.memberData?.id;
    this.createOrEditUserModal.user.name = this.getStringValue(701);
    this.createOrEditUserModal.user.surname = this.getStringValue(702);
    this.createOrEditUserModal.fromTeamMember = true;
    this.createOrEditUserModal.show();
  }

  EditUserName() {
    const rawId = this.getUserIdValue();
    if (!rawId) {
      this.message.warn(this.l('ThisMemberIsNotLinkedToUser'));
      return;
    }

    const userId = Number(rawId);
    if (Number.isNaN(userId) || userId <= 0) {
      this.CreateUserName();
      return;
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
        const u = userResult?.user;
        if (u) {
          const target = this.createOrEditUserModal.user;
          target.name = u.name;
          target.surname = u.surname;
          target.userName = u.userName;
          target.emailAddress = u.emailAddress;
          target.phoneNumber = u.phoneNumber;
        }
        this.createOrEditUserModal.show(userId);
      });
  }

  getUserIdValue(): string | null {
    return this.getAttributeStringFromDto(this.memberData, 715) || null;
  }

  loadUsers(query: string = ''): void {
    this._userService
      .getUsers(query || '', undefined, undefined, undefined, undefined, undefined, 0)
      .subscribe(users => {
        const linkedUserId = this.memberData?.entityExtraData?.find(x => x.attributeId === 715)?.attributeValue;
        this.filteredUsers = users.items.filter(u => u.id.toString() !== linkedUserId && !u.memberId);
      });
  }

  linkToUser(user: UserListDto, index: number) {
    this.showMainSpinner();

    if (user.memberId) {
      this._AccountsServiceProxy.getAppContactForView(user.memberId)
        .pipe(finalize(() => this.hideMainSpinner()))
        .subscribe(result => {
          Swal.fire({
            title: '',
            text: `User already linked to team member '${result.name}'`,
            icon: 'info',
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

    if (!this.memberData.entityExtraData) this.memberData.entityExtraData = [];
    const extraData = this.memberData.entityExtraData;
    const linked = extraData.find(x => x.attributeId === 715);

    if (linked) {
      linked.attributeValue = user.id.toString();
    } else {
      const dto = new AppEntityExtraDataDto();
      dto.attributeId = 715;
      dto.attributeValue = user.id.toString();
      extraData.push(dto);
    }

    this._AccountsServiceProxy.createOrUpdateContact(this.memberData)
      .pipe(finalize(() => {
        this.filteredUsers.splice(index, 1);
        this.hideMainSpinner();
      }))
      .subscribe(() => {
        this._updateLogoService.updateProfilePicture();
        this.refresh(true);
      });
  }

  // ---------------------------------------------------------------- attribute helpers

  getStringValue(attrId: number): string {
    return this.getAttributeStringFromDto(this.memberData, attrId);
  }

  /** Join date (707) value, or null when empty. */
  getJoinDate(): string | null {
    return this.getStringValue(RELATION_ATTR.JOIN_DATE) || null;
  }

  /** Join date visibility flag (713). */
  getJoinDateIsPublic(): boolean {
    return this.getStringValue(713).toLowerCase() === 'true';
  }

  /** Join date is shown in view mode only when it has a value and is public. */
  get showJoinDate(): boolean {
    return !!this.getJoinDate() && this.getJoinDateIsPublic();
  }

  private getAttributeStringFromDto(dto: CreateOrEditAccountInfoDto | undefined, attrId: number): string {
    if (!dto) return '';

    const selected = dto.extraDataAttributes?.find(a => a.extraAttributeId === attrId)?.selectedValues;
    const extraVal = selected?.length ? selected[selected.length - 1].value : null;
    if (extraVal && extraVal.toString().trim() !== '') return extraVal.toString();

    const entityVal = dto.entityExtraData?.find(e => e.attributeId === attrId)?.attributeValue;
    return entityVal && entityVal.toString().trim() !== '' ? entityVal.toString() : '';
  }

  // ---------------------------------------------------------------- relationship settings

  loadRelationAttributes(): void {
    this.relationAttributeObject = null;
    this.relationAttributes = [];

    this._sycEntityObjectTypesServiceProxy
      .getAllWithExtraAttributesByCode(RELATION_DEFINITION_CODE, RELATION_ENTITY_TYPE)
      .subscribe(result => {
        const { entityObjectTypeId, attributes } = extractRelationAttributes(result);
        this.relationEntityObjectTypeId = entityObjectTypeId;
        this.relationAttributes = attributes;
      });
  }

 private prepareRelationInputs(): void {
    this.relationChanges.clear();

    const branchId =
        this.memberData?.parentId ??
        this.getStringValue(718);

    const { relationInputsDto, relationAttributeObject } =
        buildRelationInputs(
            this.relationAttributes,
            id => {
                if (id === RELATION_ATTR.BRANCH) {
                    return branchId != null
                        ? String(branchId)
                        : '';
                }

                return this.getStringValue(id);
            }
        );

    this.relationInputsDto = relationInputsDto;
    this.relationAttributeObject = relationAttributeObject;
}

  onRelationSettingsChanged(changes: any[]): void {
    collectRelationChanges(this.relationChanges, changes);
  }

  onRelationSettingCleared(attributeId: number): void {
    clearRelationChange(this.relationChanges, attributeId);
  }
}