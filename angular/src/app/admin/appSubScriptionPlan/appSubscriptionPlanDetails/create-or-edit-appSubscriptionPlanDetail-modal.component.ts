import { Component, ViewChild, Injector, Output, EventEmitter, OnInit} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AppEntitiesServiceProxy, AppFeaturesServiceProxy, AppSubscriptionPlanDetailsServiceProxy, CreateOrEditAppSubscriptionPlanDetailDto, LookupLabelDto, SycEntityObjectStatusDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
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
    options: { label: string, value: string }[] = [
        { label: this.l("Absolute"), value: this.l("Absolute") },
        { label: this.l("Monthly"), value: this.l("Monthly") },
        { label: this.l('Yearly'), value: this.l('Yearly')}
      ];
    avalailbilityList: { label: string, value: string }[] = [
        { label: this.l('Unlimited'), value: this.l('Unlimited')},
        { label: this.l('Limited'), value: this.l('Limited')}];
    appSubscriptionPlanDetail: CreateOrEditAppSubscriptionPlanDetailDto = new CreateOrEditAppSubscriptionPlanDetailDto();

    appSubscriptionPlanHeader = '';
    appFeatureDescription = '';
    featureStatusList: SycEntityObjectStatusDto[];
    featureCategoryList:LookupLabelDto[];

    constructor(
        injector: Injector,
        private _appEntitiesServiceProxy:AppEntitiesServiceProxy,
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
      
        this._appFeatureProxy.getAppFeatureForView(this.appSubscriptionPlanDetail.appFeatureId)
          .subscribe(result => {
            const feature = result.appFeature;
      
            this.appSubscriptionPlanDetail.featureCode = feature.code;
            this.appSubscriptionPlanDetail.unitPrice = feature.unitPrice;
            this.appSubscriptionPlanDetail.featureBillingCode = feature.billingCode;
            this.appSubscriptionPlanDetail.featureCategory = feature.category;
            this.appSubscriptionPlanDetail.featurePeriodLimit = feature.featurePeriodLimit;
            this.appSubscriptionPlanDetail.isFeatureBillable = feature.billable;
            this.appSubscriptionPlanDetail.unitOfMeasurmentCode = feature.unitOfMeasurementCode;
            this.appSubscriptionPlanDetail.unitOfMeasurementName = feature.unitOfMeasurementName;
            this.appSubscriptionPlanDetail.trackactivity = feature.trackActivity;
            this.appSubscriptionPlanDetail.featureDescription = feature.description;
            this.appSubscriptionPlanDetail.featureName = feature.name;
            this.appSubscriptionPlanDetail.featureStatus = feature.featureStatus;
            this.appSubscriptionPlanDetail.notes = feature.notes;
      
            this.appSubscriptionPlanDetail.availability ??= 'Unlimited';
      
            setTimeout(() => {
              this.modal.show(); 
            }, 0);
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
}
