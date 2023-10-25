import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, ElementRef} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SycIdentifierDefinitionsServiceProxy, CreateOrEditSycIdentifierDefinitionDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';




@Component({
    selector: 'createOrEditSycIdentifierDefinitionModal',
    templateUrl: './create-or-edit-sycIdentifierDefinition-modal.component.html'
})
export class CreateOrEditSycIdentifierDefinitionModalComponent extends AppComponentBase implements OnInit{
   
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    sycIdentifierDefinition: CreateOrEditSycIdentifierDefinitionDto = new CreateOrEditSycIdentifierDefinitionDto();




    constructor(
        injector: Injector,
        private _sycIdentifierDefinitionsServiceProxy: SycIdentifierDefinitionsServiceProxy
    ) {
        super(injector);
    }
    
    show(sycIdentifierDefinitionId?: number): void {
    

        if (!sycIdentifierDefinitionId) {
            this.sycIdentifierDefinition = new CreateOrEditSycIdentifierDefinitionDto();
            this.sycIdentifierDefinition.id = sycIdentifierDefinitionId;


            this.active = true;
            this.modal.show();
        } else {
            this._sycIdentifierDefinitionsServiceProxy.getSycIdentifierDefinitionForEdit(sycIdentifierDefinitionId).subscribe(result => {
                this.sycIdentifierDefinition = result.sycIdentifierDefinition;



                this.active = true;
                this.modal.show();
            });
        }
        
        
    }

    save(): void {
            this.saving = true;
            
			
			
            this._sycIdentifierDefinitionsServiceProxy.createOrEdit(this.sycIdentifierDefinition)
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
