import { Component, ViewChild, Injector, Output, EventEmitter, OnInit} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AppFeaturesServiceProxy, CreateOrEditAppFeatureDto, SycEntityObjectStatusLookupTableDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import {Observable} from "@node_modules/rxjs";





@Component({
    templateUrl: './create-or-edit-appFeature.component.html',
    animations: [appModuleAnimation()]
})
export class CreateOrEditAppFeatureComponent extends AppComponentBase implements OnInit {
    active = false;
    saving = false;
    featureStatusList: SycEntityObjectStatusLookupTableDto[];
    appFeature: CreateOrEditAppFeatureDto = new CreateOrEditAppFeatureDto();
    selectedItem:"";





    constructor(
        injector: Injector,
        private _activatedRoute: ActivatedRoute,        
        private _appFeaturesServiceProxy: AppFeaturesServiceProxy,
        private _router: Router
    ) {
        super(injector);
        
    }

    ngOnInit(): void {
        this.show(this._activatedRoute.snapshot.queryParams['id']);
        this._appFeaturesServiceProxy.getFeatureStatusList()
        .subscribe((res: any) => {
            this.featureStatusList = res;
        });
    }

    show(appFeatureId?: number): void {

        if (!appFeatureId) {
            this.appFeature = new CreateOrEditAppFeatureDto();
            this.appFeature.id = appFeatureId;


            this.active = true;
        } else {
            this._appFeaturesServiceProxy.getAppFeatureForEdit(appFeatureId).subscribe(result => {
                this.appFeature = result.appFeature;



                this.active = true;
            });
        }
        
         
    }
    
    save(): void {
        this.saving = true;
        
        this._appFeaturesServiceProxy.createOrEdit(this.appFeature)
            .pipe(finalize(() => {
                this.saving = false;
            }))
            .subscribe(x => {
                 this.saving = false;               
                 this.notify.info(this.l('SavedSuccessfully'));
                 this._router.navigate( ['/app/admin/appSubScriptionPlan/appFeatures']);
            })
    }
    
    saveAndNew(): void {
        this.saving = true;
        
        this._appFeaturesServiceProxy.createOrEdit(this.appFeature)
            .pipe(finalize(() => {
                this.saving = false;
            }))
            .subscribe(x => {
                this.saving = false;               
                this.notify.info(this.l('SavedSuccessfully'));
                this.appFeature = new CreateOrEditAppFeatureDto();
            });
    }













}
