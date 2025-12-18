import { AfterViewChecked, Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CreateOrUpdateUserInput, OrganizationUnitDto, PasswordComplexitySetting, ProfileServiceProxy, SycIdentifierDefinitionsServiceProxy, UserEditDto, UserListDto, UserRoleDto, UserServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { IOrganizationUnitsTreeComponentData, OrganizationUnitsTreeComponent } from '../shared/organization-unit-tree.component';
import * as _ from 'lodash';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'createOrEditUserModal',
    templateUrl: './create-or-edit-user-modal.component.html',
    styles: [`
        .user-edit-dialog-profile-image {
          margin-bottom: 20px;
        }
    
        .table-wrapper {
          max-height: 350px;
          overflow-y: auto;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: #fff;
        }
    
        .user-table {
          width: 100%;
          border-collapse: collapse;
        }
    
        .user-table thead {
          background: #f3f3f3;
          position: sticky;
          top: 0;
          z-index: 2;
        }
    
        .user-table th {
          padding: 12px;
          font-weight: 600;
          color: #444;
          border-bottom: 1px solid #ddd;
        }
    
        .user-table td {
          padding: 12px;
          border-bottom: 1px solid #eee;
          vertical-align: middle;
        }
    
        .select-col {
          width: 90px;
          text-align: center;
        }
    
        .name-col {
          width: auto;
        }
    
        .user-table tbody tr {
          cursor: pointer;
          transition: 0.2s;
        }
    
        .user-table tbody tr:hover {
          background: #f5f5f5;
        }
    
        .btn.btn-outline-primary.btn-sm {
          width: 32px;
          height: 32px;
          padding: 0;
        }
    
        .no-users {
          padding: 15px;
          text-align: center;
          color: #999;
        }
      `]
    })
export class CreateOrEditUserModalComponent extends AppComponentBase{

    @ViewChild('createOrEditModal', {static: true}) modal: ModalDirective;
    @ViewChild('organizationUnitTree') organizationUnitTree: OrganizationUnitsTreeComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    @Output() refreshData: EventEmitter<any> = new EventEmitter<any>();
    
    active = false;
    saving = false;
    canChangeUserName = true;
    isTwoFactorEnabled: boolean = this.setting.getBoolean('Abp.Zero.UserManagement.TwoFactorLogin.IsEnabled');
    isLockoutEnabled: boolean = this.setting.getBoolean('Abp.Zero.UserManagement.UserLockOut.IsEnabled');
    passwordComplexitySetting: PasswordComplexitySetting = new PasswordComplexitySetting();

    user: UserEditDto = new UserEditDto();
    roles: UserRoleDto[];
    sendActivationEmail = true;
    setRandomPassword = true;
    passwordComplexityInfo = '';
    profilePicture: string;

    allOrganizationUnits: OrganizationUnitDto[];
    memberedOrganizationUnits: string[];
    userPasswordRepeat = '';
    tenancyName:string;
    defaultTenancyName:string="SIIWII.NET"; 
    entityObjectType:string ="TENANTCONTACT";
    fromTeamMember:boolean=false;
    teamMemberId:number;
    showSelectUser:boolean=false;
    userSearchQuery="";
   @Input() filteredUsers=[];
   @Output() _filterUsers = new EventEmitter<any>();
   @Output() _linkToUser = new EventEmitter<{user: UserListDto, index: number}>();
 
   
   constructor(
        injector: Injector,
        private _userService: UserServiceProxy,
        private _profileService: ProfileServiceProxy,
        private _sycIdentifierDefinitionsServiceProxy: SycIdentifierDefinitionsServiceProxy
    ) {
        super(injector);
    }
    show(userId?: number): void {
        if (!userId) {
            this.active = true;
            this.setRandomPassword = true;
            this.sendActivationEmail = true;
        }

        this._userService.getUserForEdit(userId).subscribe(userResult => {
            if(!this.fromTeamMember)
            this.user = userResult.user;
        
            this.roles = userResult.roles;
            this.tenancyName=userResult.tenancyName;
            this.canChangeUserName = this.user.userName !== AppConsts.userManagement.defaultAdminUserName;

            this.allOrganizationUnits = userResult.allOrganizationUnits;
            this.memberedOrganizationUnits = userResult.memberedOrganizationUnits;

            this.getProfilePicture(userResult.profilePictureId);

            if (userId) {
                this.active = true;

                setTimeout(() => {
                    this.setRandomPassword = false;
                }, 0);

                this.sendActivationEmail = false;
            }

            this._profileService.getPasswordComplexitySetting().subscribe(passwordComplexityResult => {
                this.passwordComplexitySetting = passwordComplexityResult.setting;
                this.setPasswordComplexityInfo();
                this.modal.show();
            });
        });
    }

    setPasswordComplexityInfo(): void {

        this.passwordComplexityInfo = '<ul>';

        if (this.passwordComplexitySetting.requireDigit) {
            this.passwordComplexityInfo += '<li>' + this.l('PasswordComplexity_RequireDigit_Hint') + '</li>';
        }

        if (this.passwordComplexitySetting.requireLowercase) {
            this.passwordComplexityInfo += '<li>' + this.l('PasswordComplexity_RequireLowercase_Hint') + '</li>';
        }

        if (this.passwordComplexitySetting.requireUppercase) {
            this.passwordComplexityInfo += '<li>' + this.l('PasswordComplexity_RequireUppercase_Hint') + '</li>';
        }

        if (this.passwordComplexitySetting.requireNonAlphanumeric) {
            this.passwordComplexityInfo += '<li>' + this.l('PasswordComplexity_RequireNonAlphanumeric_Hint') + '</li>';
        }

        if (this.passwordComplexitySetting.requiredLength) {
            this.passwordComplexityInfo += '<li>' + this.l('PasswordComplexity_RequiredLength_Hint', this.passwordComplexitySetting.requiredLength) + '</li>';
        }

        this.passwordComplexityInfo += '</ul>';
    }

    getProfilePicture(profilePictureId: string): void {
        if (!profilePictureId) {
            this.profilePicture = this.appRootUrl() + 'assets/common/images/default-profile-picture.png';
        } else {
            this._profileService.getProfilePictureById(profilePictureId).subscribe(result => {

                if (result && result.profilePicture) {
                    this.profilePicture = 'data:image/jpeg;base64,' + result.profilePicture;
                } else {
                    this.profilePicture = this.appRootUrl() + 'assets/common/images/default-profile-picture.png';
                }
            });
        }
    }

    onShown(): void {
        this.organizationUnitTree.data = <IOrganizationUnitsTreeComponentData>{
            allOrganizationUnits: this.allOrganizationUnits,
            selectedOrganizationUnits: this.memberedOrganizationUnits
        };

        document.getElementById('Name').focus();
    }

    save(): void {
        let input = new CreateOrUpdateUserInput();
        let  sequance="";
        this._sycIdentifierDefinitionsServiceProxy.getNextEntityCode(this.entityObjectType,this.appSession.tenantId).subscribe
        ((res) => { 
            // let tenancyName = this.appSession.tenancyName;
            sequance=res;
        input.code= sequance; 
        input.user = this.user;
        input.setRandomPassword = this.setRandomPassword;
        input.sendActivationEmail = this.sendActivationEmail;
        input.assignedRoleNames =
            _.map(
                _.filter(this.roles, { isAssigned: true, inheritedFromOrganizationUnit: false }), role => role.roleName
            );

        input.organizationUnits = this.organizationUnitTree.getSelectedOrganizations();

        this.saving = true;
        input.contactId = this.teamMemberId
        this._userService.createOrUpdateUser(input)
            .pipe(finalize(() => {
                 this.saving = false; 
                 this.refreshData.emit(true);

                }))
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            });
        });
    }

    close(): void {
        this.active = false;
        this.showSelectUser=false;
        this.userPasswordRepeat = '';
        this.userSearchQuery="";
        this._filterUsers.emit(this.userSearchQuery);
        this.modal.hide();
    }

    getAssignedRoleCount(): number {
        return _.filter(this.roles, { isAssigned: true }).length;
    }

    getCodeValue(code: string) {
       /*  this.user.code= code; */
      } 

      
      filterUsers(userSearchQuery){
        this._filterUsers.emit(userSearchQuery);
      }

  linkToUser(user: UserListDto, index: number) {
    this.refreshData.emit(true);
    this._linkToUser.emit({ user, index });
    this.close();
  }
}
