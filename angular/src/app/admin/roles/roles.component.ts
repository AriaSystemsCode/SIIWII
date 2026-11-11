import { Component, Injector, ViewChild, OnInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { RoleListDto, RoleServiceProxy, PermissionServiceProxy, FlatPermissionDto } from '@shared/service-proxies/service-proxies';
import { Table } from 'primeng/table';
import { CreateOrEditRoleModalComponent } from './create-or-edit-role-modal.component';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import * as _ from 'lodash';
import { finalize } from 'rxjs/operators';
import { PermissionTreeModalComponent } from '../shared/permission-tree-modal.component';
@Component({
    templateUrl: './roles.component.html',
    animations: [appModuleAnimation()],
      styles: [`
    .body-sec {
      background-color: #fff;
      border-radius: 6px;
      min-height: 100vh;
      padding: 17px;
    }

    @media (min-width: 1024px) {
      .addMT {
        margin-top: 140px;
      }
    }

    @media (max-width: 540px) {
      .addMTMob {
        margin-top: 75px;
      }
    }

    .alignStart{
    text-align: start !important ;
    }


    .w-150  {
    width : 150px ;
    }

     .wPX100  {
    width : 100px;
    }


     .w-250  {
    width : 250px ;
    }

       .w-130  {
    width : 130px ;
    }

      .btn-primary {
        background-color: #4A0D4A !important;
        color: #fff !important;
        border: 1px solid #4A0D4A !important;
    }
        .h-100vh {
      min-height: 100vh;
        }
  `]
})
export class RolesComponent extends AppComponentBase implements OnInit {

    @ViewChild('createOrEditRoleModal', { static: true }) createOrEditRoleModal: CreateOrEditRoleModalComponent;
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('permissionFilterTreeModal', { static: true }) permissionFilterTreeModal: PermissionTreeModalComponent;

    _entityTypeFullName = 'onetouch.Authorization.Roles.Role';
    entityHistoryEnabled = false;

            currentLang: string = 'en';
    isArabic: boolean = false;
    constructor(
        injector: Injector,
        private _roleService: RoleServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {
             this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
        this.currentLang == 'ar' || this.currentLang == 'ar-EG'  ? this.isArabic = true : this.isArabic = false
        this.setIsEntityHistoryEnabled();
    }

    private setIsEntityHistoryEnabled(): void {
        let customSettings = (abp as any).custom;
        this.entityHistoryEnabled = customSettings.EntityHistory && customSettings.EntityHistory.isEnabled && _.filter(customSettings.EntityHistory.enabledEntities, entityType => entityType === this._entityTypeFullName).length === 1;
    }

    getRoles(): void {
        this.primengTableHelper.showLoadingIndicator();
        let selectedPermissions = this.permissionFilterTreeModal.getSelectedPermissions();

        this._roleService.getRoles(selectedPermissions)
            .pipe(finalize(() => this.primengTableHelper.hideLoadingIndicator()))
            .subscribe(result => {
                this.primengTableHelper.records = result.items;
                this.primengTableHelper.totalRecordsCount = result.items.length;
                this.primengTableHelper.hideLoadingIndicator();
            });
    }

    createRole(): void {
        this.createOrEditRoleModal.show();
    }

    showHistory(role: RoleListDto): void {
        this.entityTypeHistoryModal.show({
            entityId: role.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: role.displayName
        });
    }

    deleteRole(role: RoleListDto): void {
        let self = this;
        self.message.confirm(
            self.l('RoleDeleteWarningMessage', role.displayName),
            this.l('AreYouSure'),
            isConfirmed => {
                if (isConfirmed) {
                    this._roleService.deleteRole(role.id).subscribe(() => {
                        this.getRoles();
                        abp.notify.success(this.l('SuccessfullyDeleted'));
                    });
                }
            }
        );
    }
}
