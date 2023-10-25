import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, ElementRef} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SycCountersServiceProxy, CreateOrEditSycCounterDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';

import { SycCounterSycSegmentIdentifierDefinitionLookupTableModalComponent } from './sycCounter-sycSegmentIdentifierDefinition-lookup-table-modal.component';



@Component({
    selector: 'createOrEditSycCounterModal',
    templateUrl: './create-or-edit-sycCounter-modal.component.html'
})
export class CreateOrEditSycCounterModalComponent extends AppComponentBase implements OnInit{
   
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('sycCounterSycSegmentIdentifierDefinitionLookupTableModal', { static: true }) sycCounterSycSegmentIdentifierDefinitionLookupTableModal: SycCounterSycSegmentIdentifierDefinitionLookupTableModalComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    sycCounter: CreateOrEditSycCounterDto = new CreateOrEditSycCounterDto();

    sycSegmentIdentifierDefinitionName = '';



    constructor(
        injector: Injector,
        private _sycCountersServiceProxy: SycCountersServiceProxy
    ) {
        super(injector);
    }
    
    show(sycCounterId?: number): void {
    

        if (!sycCounterId) {
            this.sycCounter = new CreateOrEditSycCounterDto();
            this.sycCounter.id = sycCounterId;
            this.sycSegmentIdentifierDefinitionName = '';


            this.active = true;
            this.modal.show();
        } else {
            this._sycCountersServiceProxy.getSycCounterForEdit(sycCounterId).subscribe(result => {
                this.sycCounter = result.sycCounter;

                this.sycSegmentIdentifierDefinitionName = result.sycSegmentIdentifierDefinitionName;


                this.active = true;
                this.modal.show();
            });
        }
        
        
    }

    save(): void {
            this.saving = true;
            
			
			
            this._sycCountersServiceProxy.createOrEdit(this.sycCounter)
             .pipe(finalize(() => { this.saving = false;}))
             .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
             });
    }

    openSelectSycSegmentIdentifierDefinitionModal() {
        this.sycCounterSycSegmentIdentifierDefinitionLookupTableModal.id = this.sycCounter.sycSegmentIdentifierDefinitionId;
        this.sycCounterSycSegmentIdentifierDefinitionLookupTableModal.displayName = this.sycSegmentIdentifierDefinitionName;
        this.sycCounterSycSegmentIdentifierDefinitionLookupTableModal.show();
    }


    setSycSegmentIdentifierDefinitionIdNull() {
        this.sycCounter.sycSegmentIdentifierDefinitionId = null;
        this.sycSegmentIdentifierDefinitionName = '';
    }


    getNewSycSegmentIdentifierDefinitionId() {
        this.sycCounter.sycSegmentIdentifierDefinitionId = this.sycCounterSycSegmentIdentifierDefinitionLookupTableModal.id;
        this.sycSegmentIdentifierDefinitionName = this.sycCounterSycSegmentIdentifierDefinitionLookupTableModal.displayName;
    }








    close(): void {
        this.active = false;
        this.modal.hide();
    }
    
     ngOnInit(): void {
        
     }    
}
