import { Component, ViewChild, Injector, Output, EventEmitter, OnInit} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AppTenantSubscriptionPlansServiceProxy, CreateOrEditAppTenantSubscriptionPlanDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import {Observable} from "@node_modules/rxjs";





@Component({
    templateUrl: './create-or-edit-appTenantSubscriptionPlan.component.html',
    animations: [appModuleAnimation()]
})
export class CreateOrEditAppTenantSubscriptionPlanComponent extends AppComponentBase implements OnInit {
    active = false;
    saving = false;
    
    appTenantSubscriptionPlan: CreateOrEditAppTenantSubscriptionPlanDto = new CreateOrEditAppTenantSubscriptionPlanDto();






    constructor(
        injector: Injector,
        private _activatedRoute: ActivatedRoute,        
        private _appTenantSubscriptionPlansServiceProxy: AppTenantSubscriptionPlansServiceProxy,
        private _router: Router
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.show(this._activatedRoute.snapshot.queryParams['id']);
        
    }

    show(appTenantSubscriptionPlanId?: number): void {

        if (!appTenantSubscriptionPlanId) {
            this.appTenantSubscriptionPlan = new CreateOrEditAppTenantSubscriptionPlanDto();
            this.appTenantSubscriptionPlan.id = appTenantSubscriptionPlanId;
            this.appTenantSubscriptionPlan.currentPeriodStartDate = moment().startOf('day');
            this.appTenantSubscriptionPlan.currentPeriodEndDate = moment().startOf('day');


            this.active = true;
        } else {
            this._appTenantSubscriptionPlansServiceProxy.getAppTenantSubscriptionPlanForEdit(appTenantSubscriptionPlanId).subscribe(result => {
                this.appTenantSubscriptionPlan = result.appTenantSubscriptionPlan;



                this.active = true;
            });
        }
        
         
    }
    
    save(): void {
        this.saving = true;
        
        this._appTenantSubscriptionPlansServiceProxy.createOrEdit(this.appTenantSubscriptionPlan)
            .pipe(finalize(() => {
                this.saving = false;
            }))
            .subscribe(x => {
                 this.saving = false;               
                 this.notify.info(this.l('SavedSuccessfully'));
                 this._router.navigate( ['/app/admin/appSubScriptionPlan/appTenantSubscriptionPlans']);
            })
    }
    
    saveAndNew(): void {
        this.saving = true;
        
        this._appTenantSubscriptionPlansServiceProxy.createOrEdit(this.appTenantSubscriptionPlan)
            .pipe(finalize(() => {
                this.saving = false;
            }))
            .subscribe(x => {
                this.saving = false;               
                this.notify.info(this.l('SavedSuccessfully'));
                this.appTenantSubscriptionPlan = new CreateOrEditAppTenantSubscriptionPlanDto();
            });
    }













}
