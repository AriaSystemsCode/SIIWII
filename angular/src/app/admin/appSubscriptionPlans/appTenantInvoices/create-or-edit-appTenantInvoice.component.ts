import { Component, ViewChild, Injector, Output, EventEmitter, OnInit} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AppTenantInvoicesServiceProxy, AppTenantSubscriptionPlansServiceProxy, CreateOrEditAppTenantInvoiceDto, TenantInformation } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import {Observable} from "@node_modules/rxjs";





@Component({
    templateUrl: './create-or-edit-appTenantInvoice.component.html',
    animations: [appModuleAnimation()]
})
export class CreateOrEditAppTenantInvoiceComponent extends AppComponentBase implements OnInit {
    active = false;
    saving = false;
    
    appTenantInvoice: CreateOrEditAppTenantInvoiceDto = new CreateOrEditAppTenantInvoiceDto();
    TenantList: TenantInformation[];
    //private _appTenantSubscriptionPlansServiceProxy: any;





    constructor(
        injector: Injector,
        private _activatedRoute: ActivatedRoute,        
        private _appTenantInvoicesServiceProxy: AppTenantInvoicesServiceProxy,
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
    onChange(op: any){
        const pos = this.TenantList.findIndex(z=>z.id==op.value);
        var tenObj = this.TenantList[pos];
       if (tenObj != undefined)
       {
         this.appTenantInvoice.tenantName = tenObj.name;
        // this.appTenantSubscriptionPlan.tenantId = op.value;
       }
     }
    show(appTenantInvoiceId?: number): void {

        if (!appTenantInvoiceId) {
            this.appTenantInvoice = new CreateOrEditAppTenantInvoiceDto();
            this.appTenantInvoice.id = appTenantInvoiceId;
            this.appTenantInvoice.invoiceDate = moment().startOf('day');
            this.appTenantInvoice.dueDate = moment().startOf('day');
            this.appTenantInvoice.payDate = moment().startOf('day');


            this.active = true;
        } else {
            this._appTenantInvoicesServiceProxy.getAppTenantInvoiceForEdit(appTenantInvoiceId).subscribe(result => {
                this.appTenantInvoice = result.appTenantInvoice;



                this.active = true;
            });
        }
        
         
    }
    
    save(): void {
        this.saving = true;
        
        this._appTenantInvoicesServiceProxy.createOrEdit(this.appTenantInvoice)
            .pipe(finalize(() => {
                this.saving = false;
            }))
            .subscribe(x => {
                 this.saving = false;               
                 this.notify.info(this.l('SavedSuccessfully'));
                 this._router.navigate( ['/app/admin/appSubscriptionPlans/appTenantInvoices']);
            })
    }
    
    saveAndNew(): void {
        this.saving = true;
        
        this._appTenantInvoicesServiceProxy.createOrEdit(this.appTenantInvoice)
            .pipe(finalize(() => {
                this.saving = false;
            }))
            .subscribe(x => {
                this.saving = false;               
                this.notify.info(this.l('SavedSuccessfully'));
                this.appTenantInvoice = new CreateOrEditAppTenantInvoiceDto();
            });
    }













}
