import {AppConsts} from "@shared/AppConsts";
import { Component, ViewChild, Injector, Output, EventEmitter, OnInit } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppAdvertisementsServiceProxy, GetAppAdvertisementForViewDto, AppAdvertisementDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ActivatedRoute } from '@angular/router';
import { appModuleAnimation } from '@shared/animations/routerTransition';

@Component({
    templateUrl: './view-appAdvertisement.component.html',
    animations: [appModuleAnimation()]
})
export class ViewAppAdvertisementComponent extends AppComponentBase implements OnInit {

    active = false;
    saving = false;

    item: GetAppAdvertisementForViewDto;


    constructor(
        injector: Injector,
        private _activatedRoute: ActivatedRoute,
         private _appAdvertisementsServiceProxy: AppAdvertisementsServiceProxy
    ) {
        super(injector);
        this.item = new GetAppAdvertisementForViewDto();
        this.item.appAdvertisement = new AppAdvertisementDto();        
    }

    ngOnInit(): void {
        this.show(this._activatedRoute.snapshot.queryParams['id']);
    }

    show(appAdvertisementId: number): void {
      this._appAdvertisementsServiceProxy.getAppAdvertisementForView(appAdvertisementId).subscribe(result => {      
                 this.item = result;
                this.active = true;
            });       
    }
    
    
}
