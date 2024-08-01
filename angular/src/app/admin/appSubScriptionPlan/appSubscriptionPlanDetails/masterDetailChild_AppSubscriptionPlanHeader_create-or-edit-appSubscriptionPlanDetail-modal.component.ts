import { Component, ViewChild, Injector, Output, EventEmitter, OnInit} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AppSubscriptionPlanDetailsServiceProxy, CreateOrEditAppSubscriptionPlanDetailDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';




@Component({
    selector: 'masterDetailChild_AppSubscriptionPlanHeader_createOrEditAppSubscriptionPlanDetailModal',
    templateUrl: './masterDetailChild_AppSubscriptionPlanHeader_create-or-edit-appSubscriptionPlanDetail-modal.component.html'
})
export class MasterDetailChild_AppSubscriptionPlanHeader_CreateOrEditAppSubscriptionPlanDetailModalComponent extends AppComponentBase implements OnInit{
   
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    appSubscriptionPlanDetail: CreateOrEditAppSubscriptionPlanDetailDto = new CreateOrEditAppSubscriptionPlanDetailDto();




    constructor(
        injector: Injector,
        private _appSubscriptionPlanDetailsServiceProxy: AppSubscriptionPlanDetailsServiceProxy
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
        
     }    
}
