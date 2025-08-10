import { Component, ViewChild, Injector, Output, EventEmitter, OnInit} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { ValidationRulesServiceProxy, CreateOrEditValidationRuleDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';




@Component({
    selector: 'createOrEditValidationRuleModal',
    templateUrl: './create-or-edit-validationRule-modal.component.html'
})
export class CreateOrEditValidationRuleModalComponent extends AppComponentBase implements OnInit{
   
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    validationRule: CreateOrEditValidationRuleDto = new CreateOrEditValidationRuleDto();




    constructor(
        injector: Injector,
        private _validationRulesServiceProxy: ValidationRulesServiceProxy
    ) {
        super(injector);
    }
    
    show(validationRuleId?: number): void {
    

        if (!validationRuleId) {
            this.validationRule = new CreateOrEditValidationRuleDto();
            this.validationRule.id = validationRuleId;


            this.active = true;
            this.modal.show();
        } else {
            this._validationRulesServiceProxy.getValidationRuleForEdit(validationRuleId).subscribe(result => {
                this.validationRule = result.validationRule;



                this.active = true;
                this.modal.show();
            });
        }
        
        
    }

    save(): void {
            this.saving = true;
            
			
			
            this._validationRulesServiceProxy.createOrEdit(this.validationRule)
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
