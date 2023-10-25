import { Component, EventEmitter, Injector,  OnChanges,  Output, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountsServiceProxy, AppContactPaymentMethodDto, ILookupLabelDto,  } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { PaymentDataService } from '../services/payment-data.service'
@Component({
  selector: 'createOrEditPaymentMethod',
  templateUrl: './create-or-edit-payment-method.component.html',
  styleUrls: ['./create-or-edit-payment-method.component.scss'],
  providers:[PaymentDataService]
})
export class CreateOrEditpaymentMethodComponent extends AppComponentBase  {
    paymentMethod : AppContactPaymentMethodDto

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() paymentAdded: EventEmitter<any> = new EventEmitter<AppContactPaymentMethodDto>();
    @Output() paymentUpdated: EventEmitter<any> = new EventEmitter<AppContactPaymentMethodDto>();

    saving = false;

    constructor(
        injector: Injector,
        private _accountsServiceProxy : AccountsServiceProxy,
        public paymentDataService : PaymentDataService
    ) {
        super(injector);
    }

    show(paymentMethodId?:number,paymentMethod?:AppContactPaymentMethodDto): void {
        if(!paymentMethodId){
            this.paymentMethod = new AppContactPaymentMethodDto()
            this.paymentMethod.paymentType = 0 // default value for credit card
            this.paymentMethod.cardType = null // backend will auto check the card type & assign it
            this.paymentMethod.isDefault = false // default value either the user has other opinion
            this.modal.show();
        } else {
            this._accountsServiceProxy.getPaymentMethodForEdit(paymentMethodId)
            .subscribe((res)=>{
                this.paymentMethod = new AppContactPaymentMethodDto(paymentMethod)
                this.modal.show();
            },(err)=>{
                this.notify.error(this.l('AnErrorOccured'))
            })
        }
    }

    save(): void {
        this.saving = true;
        this._accountsServiceProxy.createOrEditPaymentMethod(this.paymentMethod)
        .pipe(finalize(() => { this.saving = false;}))
             .subscribe((res) => {

                this.notify.info(this.l('SavedSuccessfully'));
                if (!this.paymentMethod.id) this.paymentAdded.emit(res);
                else  this.paymentUpdated.emit(res)
                this.close();
            });
    }



    close(): void {
        this.modal.hide();
    }

}
