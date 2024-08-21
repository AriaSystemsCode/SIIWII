import { Component, ViewChild, Injector, Output, EventEmitter, OnInit} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AppFeaturesServiceProxy, AppSubscriptionPlanDetailsServiceProxy, CreateOrEditAppSubscriptionPlanDetailDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';

import { AppSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModalComponent } from './appSubscriptionPlanDetail-appSubscriptionPlanHeader-lookup-table-modal.component';
import { AppSubscriptionPlanDetailAppFeatureLookupTableModalComponent } from './appSubscriptionPlanDetail-appFeature-lookup-table-modal.component';



@Component({
    selector: 'createOrEditAppSubscriptionPlanDetailModal',
    templateUrl: './create-or-edit-appSubscriptionPlanDetail-modal.component.html'
})
export class CreateOrEditAppSubscriptionPlanDetailModalComponent extends AppComponentBase implements OnInit{
   
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('appSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModal', { static: true }) appSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModal: AppSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModalComponent;
    @ViewChild('appSubscriptionPlanDetailAppFeatureLookupTableModal', { static: true }) appSubscriptionPlanDetailAppFeatureLookupTableModal: AppSubscriptionPlanDetailAppFeatureLookupTableModalComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    appSubscriptionPlanDetail: CreateOrEditAppSubscriptionPlanDetailDto = new CreateOrEditAppSubscriptionPlanDetailDto();

    appSubscriptionPlanHeader = '';
    appFeatureDescription = '';



    constructor(
        injector: Injector,
        private _appSubscriptionPlanDetailsServiceProxy: AppSubscriptionPlanDetailsServiceProxy,
        private _appFeatureProxy: AppFeaturesServiceProxy
    ) {
        super(injector);
    }
    
    show(appSubscriptionPlanDetailId?: number): void {
    

        if (!appSubscriptionPlanDetailId) {
            this.appSubscriptionPlanDetail = new CreateOrEditAppSubscriptionPlanDetailDto();
            this.appSubscriptionPlanDetail.id = appSubscriptionPlanDetailId;
            this.appSubscriptionPlanHeader = '';
            this.appFeatureDescription = '';


            this.active = true;
            this.modal.show();
        } else {
            this._appSubscriptionPlanDetailsServiceProxy.getAppSubscriptionPlanDetailForEdit(appSubscriptionPlanDetailId).subscribe(result => {
                this.appSubscriptionPlanDetail = result.appSubscriptionPlanDetail;

                this.appSubscriptionPlanHeader = result.appSubscriptionPlanHeader;
                this.appFeatureDescription = result.appFeatureDescription;


                this.active = true;
                this.modal.show();
            });
        }
        
        
    }

    save(): void {
            this.saving = true;
            
			
			
            this._appSubscriptionPlanDetailsServiceProxy.createOrEdit(this.appSubscriptionPlanDetail)
             .pipe(finalize(() => { this.saving = false;}))
             .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
             });
    }

    openSelectAppSubscriptionPlanHeaderModal() {
        this.appSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModal.id = this.appSubscriptionPlanDetail.appSubscriptionPlanHeaderId;
        this.appSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModal.displayName = this.appSubscriptionPlanHeader;
        this.appSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModal.show();
    }
    openSelectAppFeatureModal() {
        this.appSubscriptionPlanDetailAppFeatureLookupTableModal.id = this.appSubscriptionPlanDetail.appFeatureId;
        this.appSubscriptionPlanDetailAppFeatureLookupTableModal.displayName = this.appFeatureDescription;
        this.appSubscriptionPlanDetailAppFeatureLookupTableModal.show();
    }


    setAppSubscriptionPlanHeaderIdNull() {
        this.appSubscriptionPlanDetail.appSubscriptionPlanHeaderId = null;
        this.appSubscriptionPlanHeader = '';
    }
    setAppFeatureIdNull() {
        this.appSubscriptionPlanDetail.appFeatureId = null;
        this.appFeatureDescription = '';
    }


    getNewAppSubscriptionPlanHeaderId() {
        this.appSubscriptionPlanDetail.appSubscriptionPlanHeaderId = this.appSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModal.id;
        this.appSubscriptionPlanHeader = this.appSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModal.displayName;
    }
    getNewAppFeatureId() {
        this.appSubscriptionPlanDetail.appFeatureId = this.appSubscriptionPlanDetailAppFeatureLookupTableModal.id;
        this.appFeatureDescription = this.appSubscriptionPlanDetailAppFeatureLookupTableModal.displayName;
        this._appFeatureProxy.getAppFeatureForView(this.appSubscriptionPlanDetail.appFeatureId )
        .subscribe(result => {
            this.appSubscriptionPlanDetail.featureCode = result.appFeature.code;
            this.appSubscriptionPlanDetail.unitPrice = result.appFeature.unitPrice;
            this.appSubscriptionPlanDetail.featureBillingCode = result.appFeature.billingCode;
            this.appSubscriptionPlanDetail.unitPrice = result.appFeature.unitPrice;
            this.appSubscriptionPlanDetail.featureCategory = result.appFeature.category;
            this.appSubscriptionPlanDetail.featurePeriodLimit= result.appFeature.featurePeriodLimit;
            this.appSubscriptionPlanDetail.isFeatureBillable = result.appFeature.billable;
            this.appSubscriptionPlanDetail.unitOfMeasurementCode = result.appFeature.unitOfMeasurementCode;
            this.appSubscriptionPlanDetail.unitOfMeasurementName = result.appFeature.unitOfMeasurementName;
            this.appSubscriptionPlanDetail.trackactivity = result.appFeature.trackActivity;
            this.appSubscriptionPlanDetail.featureDescription = result.appFeature.description;
            this.appSubscriptionPlanDetail.featureName = result.appFeature.name;
            this.active = true;
            this.modal.show();
        });
       // this.appSubscriptionPlanDetail.availability = this.appSubscriptionPlanDetailAppFeatureLookupTableModal.;
    }








    close(): void {
        this.active = false;
        this.modal.hide();
    }
    
     ngOnInit(): void {
        
     }    
}
