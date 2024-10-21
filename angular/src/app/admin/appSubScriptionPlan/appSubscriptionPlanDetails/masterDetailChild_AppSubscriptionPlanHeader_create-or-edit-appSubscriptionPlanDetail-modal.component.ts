import { Component, ViewChild, Injector, Output, EventEmitter, OnInit} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AppEntitiesServiceProxy, AppSubscriptionPlanDetailsServiceProxy, CreateOrEditAppSubscriptionPlanDetailDto, LookupLabelDto, SycEntityObjectStatusDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';
import { AppSubscriptionPlanDetailAppFeatureLookupTableModalComponent } from './appSubscriptionPlanDetail-appFeature-lookup-table-modal.component';
import { AppFeaturesServiceProxy } from '@shared/service-proxies/service-proxies';


@Component({
    selector: 'masterDetailChild_AppSubscriptionPlanHeader_createOrEditAppSubscriptionPlanDetailModal',
    templateUrl: './masterDetailChild_AppSubscriptionPlanHeader_create-or-edit-appSubscriptionPlanDetail-modal.component.html'
})
export class MasterDetailChild_AppSubscriptionPlanHeader_CreateOrEditAppSubscriptionPlanDetailModalComponent extends AppComponentBase implements OnInit{
   
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('appSubscriptionPlanDetailAppFeatureLookupTableModal', { static: true }) appSubscriptionPlanDetailAppFeatureLookupTableModal: AppSubscriptionPlanDetailAppFeatureLookupTableModalComponent;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    featureStatusList: SycEntityObjectStatusDto[];
    active = false;
    saving = false;
    options: { label: string, value: string }[] = [
        { label: this.l("Absolute"), value: this.l("Absolute") },
        { label: this.l("Monthly"), value: this.l("Monthly") },
        { label: this.l('Yearly'), value: this.l('Yearly')}
      ];
    avalailbilityList: { label: string, value: string }[] = [
        { label: this.l('Unlimited'), value: this.l('Unlimited')},
        { label: this.l('Limited'), value: this.l('Limited')}];

    appSubscriptionPlanDetail: CreateOrEditAppSubscriptionPlanDetailDto = new CreateOrEditAppSubscriptionPlanDetailDto();
    featureCategoryList:LookupLabelDto[];
    constructor(
        injector: Injector,
        private _appEntitiesServiceProxy:AppEntitiesServiceProxy,
        private _appSubscriptionPlanDetailsServiceProxy: AppSubscriptionPlanDetailsServiceProxy,
        private _appFeatureProxy:AppFeaturesServiceProxy
    ) {
        super(injector);
    }
    
                 appSubscriptionPlanHeaderId: any;
             
    show(
                 appSubscriptionPlanHeaderId: any,
             appSubscriptionPlanDetailId?: number): void {
    
                 this.appSubscriptionPlanHeaderId = appSubscriptionPlanHeaderId;
             

        if (!appSubscriptionPlanDetailId) {
            this.appSubscriptionPlanDetail = new CreateOrEditAppSubscriptionPlanDetailDto();
            this.appSubscriptionPlanDetail.id = appSubscriptionPlanDetailId;


            this.active = true;
            this.modal.show();
        } else {
            this._appSubscriptionPlanDetailsServiceProxy.getAppSubscriptionPlanDetailForEdit(appSubscriptionPlanDetailId).subscribe(result => {
                this.appSubscriptionPlanDetail = result.appSubscriptionPlanDetail;



                this.active = true;
                this.modal.show();
            });
        }
        
        
    }

    save(): void {
            this.saving = true;
            
			
			
                this.appSubscriptionPlanDetail.appSubscriptionPlanHeaderId = this.appSubscriptionPlanHeaderId;
                //this.appSubscriptionPlanDetail.unitOfMeasurmentCode = 
            this._appSubscriptionPlanDetailsServiceProxy.createOrEdit(this.appSubscriptionPlanDetail)
             .pipe(finalize(() => { this.saving = false;}))
             .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
             });
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
    
     ngOnInit(): void {
        this._appFeatureProxy.getFeatureStatusList()
        .subscribe((res: any) => {
            this.featureStatusList = res;
        });
        this._appEntitiesServiceProxy.getAllFeatureCategoryForTableDropdown()
.subscribe((resuom: any) => {
    this.featureCategoryList = resuom;
});
     }  
     setAppFeatureIdNull(){}
     openSelectAppFeatureModal(){
        this.appSubscriptionPlanDetailAppFeatureLookupTableModal.id = this.appSubscriptionPlanDetail.appFeatureId;
        this.appSubscriptionPlanDetailAppFeatureLookupTableModal.displayName = this.appSubscriptionPlanDetail.featureCode;
        this.appSubscriptionPlanDetailAppFeatureLookupTableModal.show();
     }  
     setAppSubscriptionPlanHeaderIdNull(){}
     openSelectAppSubscriptionPlanHeaderModal(){}
     getNewAppFeatureId(){
        this.appSubscriptionPlanDetail.appFeatureId = this.appSubscriptionPlanDetailAppFeatureLookupTableModal.id;
       // this.appSubscriptionPlanDetail.featureCode  = this.appSubscriptionPlanDetailAppFeatureLookupTableModal;
        this._appFeatureProxy.getAppFeatureForView(this.appSubscriptionPlanDetail.appFeatureId )
        .subscribe(result => {
            this.appSubscriptionPlanDetail.featureCode = result.appFeature.code;
            this.appSubscriptionPlanDetail.unitPrice = result.appFeature.unitPrice;
            this.appSubscriptionPlanDetail.featureBillingCode = result.appFeature.billingCode;
            this.appSubscriptionPlanDetail.unitPrice = result.appFeature.unitPrice;
            this.appSubscriptionPlanDetail.featureCategory = result.appFeature.category;
            this.appSubscriptionPlanDetail.featurePeriodLimit= result.appFeature.featurePeriodLimit;
            this.appSubscriptionPlanDetail.isFeatureBillable = result.appFeature.billable;
            this.appSubscriptionPlanDetail.unitOfMeasurmentCode = result.appFeature.unitOfMeasurementCode;
            this.appSubscriptionPlanDetail.unitOfMeasurementName = result.appFeature.unitOfMeasurementName;
            this.appSubscriptionPlanDetail.trackactivity = result.appFeature.trackActivity;
            this.appSubscriptionPlanDetail.featureDescription = result.appFeature.description;
            this.appSubscriptionPlanDetail.featureName = result.appFeature.name;
            this.appSubscriptionPlanDetail.featureStatus =  result.appFeature.featureStatus;
            this.appSubscriptionPlanDetail.notes = result.appFeature.notes;
            this.active = true;
            this.modal.show();
        });
     }
}
