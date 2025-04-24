import { Component, ViewChild, Injector, Output, EventEmitter} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AppTransactionsServiceProxy, CreateOrEditAppTransactionDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';


@Component({
    selector: 'createOrEditAppTransactionModal',
    templateUrl: './create-or-edit-appTransaction-modal.component.html'
})
export class CreateOrEditAppTransactionModalComponent extends AppComponentBase {
   
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    appTransaction: CreateOrEditAppTransactionDto = new CreateOrEditAppTransactionDto();



    constructor(
        injector: Injector,
        private _appTransactionsServiceProxy: AppTransactionsServiceProxy
    ) {
        super(injector);
    }
    
    show(appTransactionId?: number): void {
    

        if (!appTransactionId) {
            this.appTransaction = new CreateOrEditAppTransactionDto();
            this.appTransaction.id = appTransactionId;
            this.appTransaction.date = moment().startOf('day');
            this.appTransaction.addDate = moment().startOf('day');
            this.appTransaction.endDate = moment().startOf('day');

            this.active = true;
            this.modal.show();
        } else {
            this._appTransactionsServiceProxy.getAppTransactionForEdit(appTransactionId).subscribe(result => {
                this.appTransaction = result.appTransaction;


                this.active = true;
                this.modal.show();
            });
        }
        
    }

    save(): void {
            this.saving = true;

			
			
            this._appTransactionsServiceProxy.createOrEdit(this.appTransaction)
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
}
