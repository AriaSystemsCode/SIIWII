import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, ElementRef} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AppTenantSubscriptionPlansServiceProxy, CreateOrEditAppTenantSubscriptionPlanDto, TenantInformation } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import {Observable} from "@node_modules/rxjs";
import { AppSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModalComponent } from '../appSubscriptionPlanDetails/appSubscriptionPlanDetail-appSubscriptionPlanHeader-lookup-table-modal.component';
//import { Dropdown } from 'primeng/dropdown';





@Component({
    templateUrl: './create-or-edit-appTenantSubscriptionPlan.component.html',
    animations: [appModuleAnimation()]
})
export class CreateOrEditAppTenantSubscriptionPlanComponent extends AppComponentBase implements OnInit {
    active = false;
    saving = false;
    TenantList: TenantInformation[];
    appTenantSubscriptionPlan: CreateOrEditAppTenantSubscriptionPlanDto = new CreateOrEditAppTenantSubscriptionPlanDto();
    @ViewChild('appSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModal', { static: true }) appSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModal: AppSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModalComponent;
    @ViewChild('tenantName') tenantName!: ElementRef;
    selectedTenant = 0;
    appSubscriptionPlanHeaderCode='';
    constructor(
        injector: Injector,
        element: ElementRef,
        private _activatedRoute: ActivatedRoute,        
        private _appTenantSubscriptionPlansServiceProxy: AppTenantSubscriptionPlansServiceProxy,
        private _router: Router
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.show(this._activatedRoute.snapshot.queryParams['id']);
        this._appTenantSubscriptionPlansServiceProxy.getTenantsList()
        .subscribe((tenantLst: any) => {
            this.TenantList = tenantLst;
        });
        
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
                // this.tenantName.optionValue  = this.appTenantSubscriptionPlan.tenantName;;
                // this.tenantName.value = this.appTenantSubscriptionPlan.tenantId;
                this.appSubscriptionPlanHeaderCode = result.appTenantSubscriptionPlan.subscriptionPlanCode;
                this.active = true; 
            });
        }
        
         
    }
    
    save(): void {
        this.saving = true;
        this.appTenantSubscriptionPlan.tenantId=this.selectedTenant;
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
    appSubscriptionPlanHeader = '';
    onChange(op: any){
         const pos = this.TenantList.findIndex(z=>z.id==op.value);
         var tenObj = this.TenantList[pos];
        if (tenObj != undefined)
        {
          this.appTenantSubscriptionPlan.tenantName = tenObj.name;
          this.selectedTenant = op.value;
         // this.appTenantSubscriptionPlan.tenantId = op.value;
        }
        this._appTenantSubscriptionPlansServiceProxy.getAppTenantSubscriptionPlanByTenantIdForEdit(op.value).subscribe((tenantSubscription: any) => {
            //this.appTenantSubscriptionPlan = tenantSubscription;
            if(tenantSubscription.appSubscriptionPlanHeaderId != 0 )
        {
            this.show(tenantSubscription.appTenantSubscriptionPlan.id);
        }
        });
        
      }
    openSelectAppSubscriptionPlanHeaderModal()
    {
        this.appSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModal.id = this.appTenantSubscriptionPlan.appSubscriptionPlanHeaderId;
        this.appSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModal.displayName = this.appTenantSubscriptionPlan.subscriptionPlanCode;
        this.appSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModal.show();
      

    }
    setAppSubscriptionPlanHeaderIdNull()
    {
        this.appTenantSubscriptionPlan.appSubscriptionPlanHeaderId = null;
        this.appSubscriptionPlanHeader = '';
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
    getNewAppSubscriptionPlanHeaderId()
    {
        this.appTenantSubscriptionPlan.appSubscriptionPlanHeaderId = this.appSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModal.id;
        this.appTenantSubscriptionPlan.subscriptionPlanCode=this.appSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModal.displayName;
        this.appSubscriptionPlanHeader = this.appSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModal.displayName;

    }












}
