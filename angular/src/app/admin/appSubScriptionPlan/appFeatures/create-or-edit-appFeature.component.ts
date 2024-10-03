import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, HostListener, ElementRef} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AppEntitiesServiceProxy, AppEntityCategoryDto, AppFeaturesServiceProxy, CreateOrEditAppFeatureDto, LookupLabelDto, SycEntityObjectStatusLookupTableDto } from '@shared/service-proxies/service-proxies';
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
    unitOfMeasurementList: LookupLabelDto[];
    featureCategoryList: LookupLabelDto[];
    appFeature: CreateOrEditAppFeatureDto = new CreateOrEditAppFeatureDto();
    value: string = '';
    
    selectedItem:"";
    options: { label: string, value: string }[] = [
        { label: this.l("Absolute"), value: this.l("Absolute") },
        { label: this.l("Monthly"), value: this.l("Monthly") },
        { label: this.l('Yearly'), value: this.l('Yearly')}
      ];



    constructor(
        injector: Injector,
        private _activatedRoute: ActivatedRoute,        
        private _appFeaturesServiceProxy: AppFeaturesServiceProxy,
        private _appEntitiesServiceProxy:AppEntitiesServiceProxy,
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

 this._appEntitiesServiceProxy.getAllUOMForTableDropdown()
.subscribe((resuom: any) => {
    this.unitOfMeasurementList = resuom;
});
 this._appEntitiesServiceProxy.getAllFeatureCategoryForTableDropdown()
.subscribe((resuom: any) => {
    this.featureCategoryList = resuom;
});
this.appFeature.entityCategories=[];

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
                 this.message.info(this.l("AppFeature")+" "+this.appFeature.code+" "+this.l('SavedSuccessfully'), this.l("AppFeature"));
                 //this.notify.info(this.l('SavedSuccessfully'));
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

    onInputChange(event: any) {
        let input = event.target.value;
        // Remove invalid characters and limit to two decimal places
        input = input.replace(/[^0-9.]/g, '');
        const decimalSplit = input.split('.');
        
        if (decimalSplit[1] && decimalSplit[1].length > 2) {
          input = `${decimalSplit[0]}.${decimalSplit[1].substring(0, 2)}`;
        }
    
        this.value = input;
      }
      old_price =0;
      currencyCheck() : boolean
      {
        let pattern = /^\d+\.?\d{0,2}$/;
        let result = pattern.test(this.appFeature.unitPrice.toString());
        if (!result) 
          this.appFeature.unitPrice = this.old_price;
        else 
          this.old_price = this.appFeature.unitPrice;
        return result;
      }
    











}
