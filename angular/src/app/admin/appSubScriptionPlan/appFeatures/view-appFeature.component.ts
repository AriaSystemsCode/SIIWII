import {AppConsts} from "@shared/AppConsts";
import { Component, ViewChild, Injector, Output, EventEmitter, OnInit } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppFeaturesServiceProxy, GetAppFeatureForViewDto, AppFeatureDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ActivatedRoute } from '@angular/router';
import { appModuleAnimation } from '@shared/animations/routerTransition';

@Component({
    templateUrl: './view-appFeature.component.html',
    animations: [appModuleAnimation()]
})
export class ViewAppFeatureComponent extends AppComponentBase implements OnInit {

    active = false;
    saving = false;

    item: GetAppFeatureForViewDto;


    constructor(
        injector: Injector,
        private _activatedRoute: ActivatedRoute,
         private _appFeaturesServiceProxy: AppFeaturesServiceProxy
    ) {
        super(injector);
        this.item = new GetAppFeatureForViewDto();
        this.item.appFeature = new AppFeatureDto();        
    }

    ngOnInit(): void {
        this.show(this._activatedRoute.snapshot.queryParams['id']);
    }

    show(appFeatureId: number): void {
      this._appFeaturesServiceProxy.getAppFeatureForView(appFeatureId).subscribe(result => {      
                 this.item = result;
                this.active = true;
            });       
    }
    
    
}
