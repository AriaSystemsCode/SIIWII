import {AppConsts} from "@shared/AppConsts";
import { Component, ViewChild, Injector, Output, EventEmitter, OnInit } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppTenantActivitiesLogServiceProxy, GetAppTenantActivityLogForViewDto, AppTenantActivityLogDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ActivatedRoute } from '@angular/router';
import { appModuleAnimation } from '@shared/animations/routerTransition';

@Component({
    templateUrl: './view-appTenantActivityLog.component.html',
    animations: [appModuleAnimation()]
})
export class ViewAppTenantActivityLogComponent extends AppComponentBase implements OnInit {

    active = false;
    saving = false;

    item: GetAppTenantActivityLogForViewDto;


    constructor(
        injector: Injector,
        private _activatedRoute: ActivatedRoute,
         private _appTenantActivitiesLogServiceProxy: AppTenantActivitiesLogServiceProxy
    ) {
        super(injector);
        this.item = new GetAppTenantActivityLogForViewDto();
        this.item.appTenantActivityLog = new AppTenantActivityLogDto();        
    }

    ngOnInit(): void {
        this.show(this._activatedRoute.snapshot.queryParams['id']);
    }

    show(appTenantActivityLogId: number): void {
      this._appTenantActivitiesLogServiceProxy.getAppTenantActivityLogForView(appTenantActivityLogId).subscribe(result => {      
                 this.item = result;
                this.active = true;
            });       
    }
    
    
}
