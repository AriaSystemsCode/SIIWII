import { Component, ViewChild, Injector, Output, EventEmitter, OnInit} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AppTenantActivitiesLogServiceProxy, CreateOrEditAppTenantActivityLogDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import {Observable} from "@node_modules/rxjs";





@Component({
    templateUrl: './create-or-edit-appTenantActivityLog.component.html',
    animations: [appModuleAnimation()]
})
export class CreateOrEditAppTenantActivityLogComponent extends AppComponentBase implements OnInit {
    active = false;
    saving = false;
    
    appTenantActivityLog: CreateOrEditAppTenantActivityLogDto = new CreateOrEditAppTenantActivityLogDto();






    constructor(
        injector: Injector,
        private _activatedRoute: ActivatedRoute,        
        private _appTenantActivitiesLogServiceProxy: AppTenantActivitiesLogServiceProxy,
        private _router: Router
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.show(this._activatedRoute.snapshot.queryParams['id']);
        
    }

    show(appTenantActivityLogId?: number): void {

        if (!appTenantActivityLogId) {
            this.appTenantActivityLog = new CreateOrEditAppTenantActivityLogDto();
            this.appTenantActivityLog.id = appTenantActivityLogId;


            this.active = true;
        } else {
            this._appTenantActivitiesLogServiceProxy.getAppTenantActivityLogForEdit(appTenantActivityLogId).subscribe(result => {
                this.appTenantActivityLog = result.appTenantActivityLog;



                this.active = true;
            });
        }
        
         
    }
    
    save(): void {
        this.saving = true;
        
        this._appTenantActivitiesLogServiceProxy.createOrEdit(this.appTenantActivityLog)
            .pipe(finalize(() => {
                this.saving = false;
            }))
            .subscribe(x => {
                 this.saving = false;               
                 this.notify.info(this.l('SavedSuccessfully'));
                 this._router.navigate( ['/app/admin/appSubScriptionPlan/appTenantActivitiesLog']);
            })
    }
    
    saveAndNew(): void {
        this.saving = true;
        
        this._appTenantActivitiesLogServiceProxy.createOrEdit(this.appTenantActivityLog)
            .pipe(finalize(() => {
                this.saving = false;
            }))
            .subscribe(x => {
                this.saving = false;               
                this.notify.info(this.l('SavedSuccessfully'));
                this.appTenantActivityLog = new CreateOrEditAppTenantActivityLogDto();
            });
    }













}
