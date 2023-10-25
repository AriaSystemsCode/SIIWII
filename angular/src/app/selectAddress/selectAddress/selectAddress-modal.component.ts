import { Component, ViewChild, Injector, Output, EventEmitter} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SycEntityObjectCategoriesServiceProxy, CreateOrEditSycEntityObjectCategoryDto ,SycEntityObjectCategorySydObjectLookupTableDto
					,SycEntityObjectCategorySycEntityObjectCategoryLookupTableDto,
                    BranchDto,
                    AccountsServiceProxy,
                    LookupLabelDto,
                    AppEntitiesServiceProxy,
                    AppContactAddressDto,
                    AppAddressDto
					} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'selectAddressModal',
    styleUrls: ['./selectAddress-modal.component.css'],
    templateUrl: './selectAddress-modal.component.html'
})
export class SelectAddressModalComponent extends AppComponentBase {

    @ViewChild('selectAddressModal', { static: true }) modal: ModalDirective;

    @Output() addressSelected: EventEmitter<any> = new EventEmitter<any>();
    @Output() addNewAddress: EventEmitter<any> = new EventEmitter<any>();
    @Output() editAddress: EventEmitter<any> = new EventEmitter<any>();
    @Output() addressSelectionCanceled: EventEmitter<any> = new EventEmitter<any>();

    addresses:AppAddressDto[];
    filteredAddresses:AppAddressDto[];
    selectedAddress:AppAddressDto;

    active = false;
    saving = false;
    addressUsageCount:number
    displayConfirmModal:boolean=false;
    selectedAddressId = 0;
    busy=true;
    confirmModalIcons={
        edit:"fas fa-4x text-danger fa-pencil",
        delete: "assets/profile/DeleteAddress.svg"
    }
    constructor(
        injector: Injector,
        private _accountsServiceProxy: AccountsServiceProxy,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy
    ) {

        super(injector);
        this.busy=true;

    }
    branchId :number
    show(branch:any,accountId:number): void {
        this.branchId = branch?.node?.data?.branch?.id
        this.spinnerService.show();

            this._accountsServiceProxy.getAllAccountAddresses(accountId).subscribe(result => {
                this.addresses = result;
                this.filteredAddresses=this.addresses;

                this.spinnerService.hide();
                this.active = true;
                this.modal.show();
            });

    }

    filterItems(arr, query) {

        return arr.filter(function(el) {
            if(el.name !=null)
            return el.name.toLowerCase().indexOf(query.toLowerCase()) !== -1
        })
      }

    onChangeSearch(e){

        if(e.target.value)
        this.filteredAddresses = this.filterItems( this.addresses,e.target.value)
        else
        this.filteredAddresses = this.addresses
    }

    onEmitButtonSaveYes(event){
        if(event.value == 'yes' && event.type =='deleteUsedAddress'){
            this.deleteAddress(this.selectedAddress.id)
        } else if(event.value == 'yes' && event.type =='deleteNotUsedAddress'){
            this.deleteAddress(this.selectedAddress.id)
        } else if(event.value == 'yes' && event.type =='editAddress'){
            this.edit(this.selectedAddress.id)
        }
        this.hideConfirmModal()
    }
    addressChecked(e){
        // if(e.target.checked)
        // this.isCheckedAddress = e.target.checked;
        // else
        // this.isCheckedAddress = false;
    }

    selectAddress(): void {
        if(this.selectedAddress!=undefined){
            this.addressSelected.emit(this.selectedAddress);
            this.spinnerService.hide();
        }
        this.close()
        this.spinnerService.hide();
    }

    addNew(): void {
        this.addNewAddress.emit();
    }

    edit(addressId:number) {
        this.editAddress.emit(addressId);
    }

    addressAdded(address:AppAddressDto){

        this.active = true;
        this.modal.show();

        let x:AppAddressDto=new AppAddressDto();

        x.id=address.id;
        x.code=address.code;
        x.name=address.name;
        x.addressLine1=address.addressLine1;
        x.addressLine2=address.addressLine2;
        x.city=address.city;
        x.state=address.state;
        x.postalCode=address.postalCode;
        x.countryId=address.countryId;
        x.countryIdName=address.countryIdName;

        this.addresses.push(x);
    }

    addressUpdated(address:AppAddressDto){

        this.active = true;
        this.modal.show();

        let x = this.addresses.find(x=>x.id==address.id)

        x.id=address.id;
        x.code=address.code;
        x.name=address.name;
        x.addressLine1=address.addressLine1;
        x.addressLine2=address.addressLine2;
        x.city=address.city;
        x.state=address.state;
        x.postalCode=address.postalCode;
        x.countryId=address.countryId;
        x.countryIdName=address.countryIdName;

    }

    checkAddresUsageCount(address:AppAddressDto, branchId:number){
        return new Promise((resolve,reject)=>{
            this.selectedAddress = address
            const addressId = this.selectedAddress.id
            return this._accountsServiceProxy.isAddressUsedByOtherBranch(addressId,this.branchId)
            .subscribe((isUsed)=>{

                resolve(Number(isUsed) )
            },(err)=>{

            })
        })
    }
    confirmModalOptions:{title,message,type,buttonYes,buttonNo,icon,iconIsText}
    adjustConfirmOptions(title,message,type,buttonYes,buttonNo,icon,iconIsText=false){
        this.confirmModalOptions = {
            title,
            message,
            type,
            buttonYes,
            buttonNo,
            icon,
            iconIsText
        }
    }
    deleteAddress(addressId:number){
        this._accountsServiceProxy.deleteAddress(addressId)
        .subscribe((item)=>{
            const index = this.addresses.findIndex(item=>item.id === addressId)
            this.addresses.splice(index,1)
            this.notify.success(this.l("DeletedSuccessfully"))
        },(err:HttpErrorResponse)=>{
            this.notify.error(err.message)
        })
    }
    async askToConfirmDelete(address){
        const addressUsageCount =  await this.checkAddresUsageCount(address,this.branchId)
        let modalType,message;
        if(addressUsageCount){
            modalType = 'deleteUsedAddress'
            message = this.l('Address is used before on many branches, Are you sure to remove this address from your Addresses list?')
        } else {
            modalType = 'deleteNotUsedAddress'
            message = this.l('Are you sure to remove this address from your Addresses list?')
        }

        this.adjustConfirmOptions(this.l('Delete Address'),message,modalType,this.l('Remove now'),this.l('Cancel'),this.confirmModalIcons.delete)
        this.showConfirmModal()
    }

    async askToConfirmEdit(address:AppAddressDto){
        const addressUsageCount = await this.checkAddresUsageCount(address,this.branchId)
        const message = this.l("This address is being used by ") + `[${addressUsageCount}]` + this.l(" branches. Updating the changes will affect the address of these branches. Are you sure you want to save the changes?")
        if(addressUsageCount){
            this.adjustConfirmOptions(this.l('Edit Address'),message,"editAddress",this.l('Edit'),this.l('Cancel'),this.confirmModalIcons.edit,true)
            this.showConfirmModal()
        } else {
            this.edit(address.id);
        }
    }

    hideConfirmModal(){
        this.displayConfirmModal = false;
    }

    showConfirmModal(){
        this.displayConfirmModal = true;
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
    cancel(){
        this.addressSelectionCanceled.emit()
        this.close()
    }
}
