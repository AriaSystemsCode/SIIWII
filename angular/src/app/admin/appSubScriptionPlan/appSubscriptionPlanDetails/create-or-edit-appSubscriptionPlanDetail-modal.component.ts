import { Component, ViewChild, Injector, Output, EventEmitter, OnInit} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AppSubscriptionPlanDetailsServiceProxy, CreateOrEditAppSubscriptionPlanDetailDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';

import { AppSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModalComponent } from './appSubscriptionPlanDetail-appSubscriptionPlanHeader-lookup-table-modal.component';



@Component({
    selector: 'createOrEditAppSubscriptionPlanDetailModal',
    templateUrl: './create-or-edit-appSubscriptionPlanDetail-modal.component.html'
})
export class CreateOrEditAppSubscriptionPlanDetailModalComponent extends AppComponentBase implements OnInit{
   
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('appSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModal', { static: true }) appSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModal: AppSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModalComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    appSubscriptionPlanDetail: CreateOrEditAppSubscriptionPlanDetailDto = new CreateOrEditAppSubscriptionPlanDetailDto();

    appSubscriptionPlanHeader = '';



    constructor(
        injector: Injector,
        private _appSubscriptionPlanDetailsServiceProxy: AppSubscriptionPlanDetailsServiceProxy
    ) {
        super(injector);
    }
    
    show(appSubscriptionPlanDetailId?: number): void {
    

        if (!appSubscriptionPlanDetailId) {
            this.appSubscriptionPlanDetail = new CreateOrEditAppSubscriptionPlanDetailDto();
            this.appSubscriptionPlanDetail.id = appSubscriptionPlanDetailId;
            this.appSubscriptionPlanHeader = '';


            this.active = true;
            this.modal.show();
        } else {
            this._appSubscriptionPlanDetailsServiceProxy.getAppSubscriptionPlanDetailForEdit(appSubscriptionPlanDetailId).subscribe(result => {
                this.appSubscriptionPlanDetail = result.appSubscriptionPlanDetail;

                this.appSubscriptionPlanHeader = result.appSubscriptionPlanHeader;


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


    setAppSubscriptionPlanHeaderIdNull() {
        this.appSubscriptionPlanDetail.appSubscriptionPlanHeaderId = null;
        this.appSubscriptionPlanHeader = '';
    }


    getNewAppSubscriptionPlanHeaderId() {
        this.appSubscriptionPlanDetail.appSubscriptionPlanHeaderId = this.appSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModal.id;
        this.appSubscriptionPlanHeader = this.appSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModal.displayName;
    }








    close(): void {
        this.active = false;
        this.modal.hide();
    }
    
     ngOnInit(): void {
        
     }    
}
