import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, ElementRef} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SycSegmentIdentifierDefinitionsServiceProxy, CreateOrEditSycSegmentIdentifierDefinitionDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';

import { SycSegmentIdentifierDefinitionSycIdentifierDefinitionLookupTableModalComponent } from './sycSegmentIdentifierDefinition-sycIdentifierDefinition-lookup-table-modal.component';



@Component({
    selector: 'createOrEditSycSegmentIdentifierDefinitionModal',
    templateUrl: './create-or-edit-sycSegmentIdentifierDefinition-modal.component.html'
})
export class CreateOrEditSycSegmentIdentifierDefinitionModalComponent extends AppComponentBase implements OnInit{
   
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('sycSegmentIdentifierDefinitionSycIdentifierDefinitionLookupTableModal', { static: true }) sycSegmentIdentifierDefinitionSycIdentifierDefinitionLookupTableModal: SycSegmentIdentifierDefinitionSycIdentifierDefinitionLookupTableModalComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    sycSegmentIdentifierDefinition: CreateOrEditSycSegmentIdentifierDefinitionDto = new CreateOrEditSycSegmentIdentifierDefinitionDto();

    sycIdentifierDefinitionCode = '';



    constructor(
        injector: Injector,
        private _sycSegmentIdentifierDefinitionsServiceProxy: SycSegmentIdentifierDefinitionsServiceProxy
    ) {
        super(injector);
    }
    
    show(sycSegmentIdentifierDefinitionId?: number): void {
    

        if (!sycSegmentIdentifierDefinitionId) {
            this.sycSegmentIdentifierDefinition = new CreateOrEditSycSegmentIdentifierDefinitionDto();
            this.sycSegmentIdentifierDefinition.id = sycSegmentIdentifierDefinitionId;
            this.sycIdentifierDefinitionCode = '';


            this.active = true;
            this.modal.show();
        } else {
            this._sycSegmentIdentifierDefinitionsServiceProxy.getSycSegmentIdentifierDefinitionForEdit(sycSegmentIdentifierDefinitionId).subscribe(result => {
                this.sycSegmentIdentifierDefinition = result.sycSegmentIdentifierDefinition;

                this.sycIdentifierDefinitionCode = result.sycIdentifierDefinitionCode;


                this.active = true;
                this.modal.show();
            });
        }
        
        
    }

    save(): void {
            this.saving = true;
            
			
			
            this._sycSegmentIdentifierDefinitionsServiceProxy.createOrEdit(this.sycSegmentIdentifierDefinition)
             .pipe(finalize(() => { this.saving = false;}))
             .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
             });
    }

    openSelectSycIdentifierDefinitionModal() {
        this.sycSegmentIdentifierDefinitionSycIdentifierDefinitionLookupTableModal.id = this.sycSegmentIdentifierDefinition.sycIdentifierDefinitionId;
        this.sycSegmentIdentifierDefinitionSycIdentifierDefinitionLookupTableModal.displayName = this.sycIdentifierDefinitionCode;
        this.sycSegmentIdentifierDefinitionSycIdentifierDefinitionLookupTableModal.show();
    }


    setSycIdentifierDefinitionIdNull() {
        this.sycSegmentIdentifierDefinition.sycIdentifierDefinitionId = null;
        this.sycIdentifierDefinitionCode = '';
    }


    getNewSycIdentifierDefinitionId() {
        this.sycSegmentIdentifierDefinition.sycIdentifierDefinitionId = this.sycSegmentIdentifierDefinitionSycIdentifierDefinitionLookupTableModal.id;
        this.sycIdentifierDefinitionCode = this.sycSegmentIdentifierDefinitionSycIdentifierDefinitionLookupTableModal.displayName;
    }








    close(): void {
        this.active = false;
        this.modal.hide();
    }
    
     ngOnInit(): void {
        
     }    
}
