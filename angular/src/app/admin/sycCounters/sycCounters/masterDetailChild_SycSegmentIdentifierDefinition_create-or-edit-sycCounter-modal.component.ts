import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, ElementRef} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SycCountersServiceProxy, CreateOrEditSycCounterDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';




@Component({
    selector: 'masterDetailChild_SycSegmentIdentifierDefinition_createOrEditSycCounterModal',
    templateUrl: './masterDetailChild_SycSegmentIdentifierDefinition_create-or-edit-sycCounter-modal.component.html'
})
export class MasterDetailChild_SycSegmentIdentifierDefinition_CreateOrEditSycCounterModalComponent extends AppComponentBase implements OnInit{
   
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    sycCounter: CreateOrEditSycCounterDto = new CreateOrEditSycCounterDto();




    constructor(
        injector: Injector,
        private _sycCountersServiceProxy: SycCountersServiceProxy
    ) {
        super(injector);
    }
    
                 sycSegmentIdentifierDefinitionId: any;
             
    show(
                 sycSegmentIdentifierDefinitionId: any,
             sycCounterId?: number): void {
    
                 this.sycSegmentIdentifierDefinitionId = sycSegmentIdentifierDefinitionId;
             

        if (!sycCounterId) {
            this.sycCounter = new CreateOrEditSycCounterDto();
            this.sycCounter.id = sycCounterId;


            this.active = true;
            this.modal.show();
        } else {
            this._sycCountersServiceProxy.getSycCounterForEdit(sycCounterId).subscribe(result => {
                this.sycCounter = result.sycCounter;



                this.active = true;
                this.modal.show();
            });
        }
        
        
    }

    save(): void {
            this.saving = true;
            
			
			
                this.sycCounter.sycSegmentIdentifierDefinitionId = this.sycSegmentIdentifierDefinitionId;
            
            this._sycCountersServiceProxy.createOrEdit(this.sycCounter)
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
