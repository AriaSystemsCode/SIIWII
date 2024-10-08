import { Component, ViewChild, Injector, Output, EventEmitter, OnInit} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AppSubscriptionPlanHeadersServiceProxy, CreateOrEditAppSubscriptionPlanHeaderDto, SycEntityObjectStatusDto, SycEntityObjectStatusLookupTableDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';




@Component({
    selector: 'createOrEditAppSubscriptionPlanHeaderModal',
    templateUrl: './create-or-edit-appSubscriptionPlanHeader-modal.component.html'
})
export class CreateOrEditAppSubscriptionPlanHeaderModalComponent extends AppComponentBase implements OnInit{
   
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;
    planStatusList: SycEntityObjectStatusLookupTableDto[];
    appSubscriptionPlanHeader: CreateOrEditAppSubscriptionPlanHeaderDto = new CreateOrEditAppSubscriptionPlanHeaderDto();

    constructor(
        injector: Injector,
        private _appSubscriptionPlanHeadersServiceProxy: AppSubscriptionPlanHeadersServiceProxy
    ) {
        super(injector);
    }
    
    show(appSubscriptionPlanHeaderId?: number): void {
    

        if (!appSubscriptionPlanHeaderId) {
            this.appSubscriptionPlanHeader = new CreateOrEditAppSubscriptionPlanHeaderDto();
            this.appSubscriptionPlanHeader.id = appSubscriptionPlanHeaderId;


            this.active = true;
            this.modal.show();
        } else {
            this._appSubscriptionPlanHeadersServiceProxy.getAppSubscriptionPlanHeaderForEdit(appSubscriptionPlanHeaderId).subscribe(result => {
                this.appSubscriptionPlanHeader = result.appSubscriptionPlanHeader;



                this.active = true;
                this.modal.show();
            });
        }
        
        
    }

    save(): void {
            this.saving = true;
            
			
			
            this._appSubscriptionPlanHeadersServiceProxy.createOrEdit(this.appSubscriptionPlanHeader)
             .pipe(finalize(() => { this.saving = false;}))
             .subscribe(() => {
               // this.notify.info(this.l('SavedSuccessfully'));
               this.message.info(this.l("AppSubscriptionPlanHeader")+" "+this.appSubscriptionPlanHeader.code+" "+this.l('SavedSuccessfully'), this.l("AppSubscriptionPlanHeader"));
                this.close();
                this.modalSave.emit(null);
             });
    }













    close(): void {
        this.active = false;
        this.modal.hide();
    }
    
     ngOnInit(): void {
        this._appSubscriptionPlanHeadersServiceProxy.getPlanStatusList()
        .subscribe((res: any) => {
            this.planStatusList = res;
        });

     }    
}
