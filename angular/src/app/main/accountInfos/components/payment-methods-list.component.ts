import { Component, EventEmitter, Injector, Input, OnChanges,  OnInit,  Output,  SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountsServiceProxy, AppContactPaymentMethodDto, EntityDto } from '@shared/service-proxies/service-proxies';
import { CreateOrEditpaymentMethodComponent } from './create-or-edit-payment-method.component';
import * as moment from 'moment';
import { appModuleAnimation } from '@shared/animations/routerTransition';

@Component({
  selector: 'app-payment-methods-list',
  templateUrl: './payment-methods-list.component.html',
  styleUrls: ['./payment-methods-list.component.css'],
  animations: [appModuleAnimation()],
  encapsulation:ViewEncapsulation.None
})
export class PaymentMethodsListComponent extends AppComponentBase implements OnInit {
    selectedIndex : number
    selectedItemId : number
    showConfirm = false
    @Input() accountId : number
    @ViewChild('createOrEditPaymentModal') createOrEditPaymentModal : CreateOrEditpaymentMethodComponent
    @Output("changeTouchState") changeTouchState : EventEmitter<boolean> = new EventEmitter<boolean>()
    dataSource : AppContactPaymentMethodDto[]

    constructor(
        injector:Injector,
        private _accountsServiceProxy : AccountsServiceProxy,
        ) {
        super(injector)
    }
    ngOnInit(): void {
        this.getPaymentMethods()
    }
    showCreateOrEditPaymentModal(id?:number,row?): void {
        // this.changeTouchState.emit(true)
        this.createOrEditPaymentModal.show(id,row);
    }

    deletePaymentMethod(id:number,index:number){
        this._accountsServiceProxy.deletePaymentMethod(id)
        .subscribe((res)=>{
            // this.changeTouchState.emit(true)
            this.notify.success(this.l('SuccessfullyDeleted'));
            this.dataSource.splice(index,1)
        },(err)=>{
            this.notify.error(this.l('AnErrorOccured'))
        })
    }

    askToConfirmDelete(id:number,index:number){
        this.selectedIndex = index
        this.selectedItemId = id
        this.showConfirm = true
    }

    onConfirmDelete($event:{type:string,value:string}){
        if($event.value == 'yes') {
            this.deletePaymentMethod(this.selectedItemId,this.selectedIndex)
        }
        this.selectedItemId = undefined
        this.selectedIndex = undefined
        this.showConfirm = false
    }

    addSavedPaymentToList($event:AppContactPaymentMethodDto){
        this.dataSource.push($event)
    }

    updateEditedPaymentOnList($event:AppContactPaymentMethodDto){
        // replace the old payment method row with the updated row
        this.dataSource = this.dataSource.map((row)=>{
            if(row.id == $event.id) row = new AppContactPaymentMethodDto($event)
            return row
        })
    }
    checkExpirationDate(paymentMethod:AppContactPaymentMethodDto){
        let now = {
            month: new Date().getMonth(),
            year: new Date().getFullYear(),
        }
        if(
            now.year == moment.parseTwoDigitYear(paymentMethod.cardExpirationYear) &&
            ( Number(paymentMethod.cardExpirationMonth)  - 1 ) - now.month  < 4
        ) {
            return true
        }
        return false
    }
    setPaymentAsDefault(paymentMethod:AppContactPaymentMethodDto){
        if(paymentMethod.isDefault){
            this.notify.info('It\'s already the default payment ')
        }

        let body :EntityDto = new EntityDto()
        body.id=paymentMethod.id
        this._accountsServiceProxy.setPaymentMethodDefault(body)
        .subscribe((res)=>{
            this.notify.success('success')
            this.dataSource.forEach(element => {
                element.isDefault=false;
            });
            paymentMethod.isDefault=true;
        },(err)=>{
            this.notify.error(err.message)
        })
    }
    getPaymentMethods(){
        this._accountsServiceProxy.getAllPaymentMethods()
        .subscribe((res)=>{
                this.dataSource = res
        })
    }
}
