import {AppConsts} from "@shared/AppConsts";
import { Component, ViewChild, Injector, Output, EventEmitter, OnInit } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
//import { AppTenantSubscriptionPlansServiceProxy, GetAppTenantSubscriptionPlanForViewDto, AppTenantSubscriptionPlanDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ActivatedRoute } from '@angular/router';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppTenantSubscriptionPlanDto, AppTenantSubscriptionPlansServiceProxy, GetAppTenantSubscriptionPlanForViewDto } from "@shared/service-proxies/service-proxies";

@Component({
    templateUrl: './view-appTenantSubscriptionPlan.component.html',
    animations: [appModuleAnimation()]
})
export class ViewAppTenantSubscriptionPlanComponent extends AppComponentBase implements OnInit {

    active = false;
    saving = false;

    item: GetAppTenantSubscriptionPlanForViewDto;


    constructor(
        injector: Injector,
        private _activatedRoute: ActivatedRoute,
         private _appTenantSubscriptionPlansServiceProxy: AppTenantSubscriptionPlansServiceProxy
    ) {
        super(injector);
        this.item = new GetAppTenantSubscriptionPlanForViewDto();
        this.item.appTenantSubscriptionPlan = new AppTenantSubscriptionPlanDto();        
    }

    ngOnInit(): void {
        this.show(this._activatedRoute.snapshot.queryParams['id']);
    }

    show(appTenantSubscriptionPlanId: number): void {
      this._appTenantSubscriptionPlansServiceProxy.getAppTenantSubscriptionPlanForView(appTenantSubscriptionPlanId).subscribe(result => {      
                 this.item = result;
                this.active = true;
            });       
    }
    
    
}
