import { Component, Injector,OnInit ,Input,ViewChild,ViewChildren} from "@angular/core";
import { AccountsServiceProxy, AppAddressDto, AppEntitiesServiceProxy,  LookupLabelDto,AppTransactionServiceProxy } from "@shared/service-proxies/service-proxies";
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: "app-address",
    templateUrl: "./address.component.html",
    styleUrls: ["./address.component.scss"],
})
export class AddressComponent extends AppComponentBase implements OnInit {
    showAddList:boolean=false;
    addressCode: string;
    addressName: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    postalCode: String;
    selectedCountry: any;
    countries: LookupLabelDto[] = [];
    savedAddressesList:any[]=[];
    refSavedAddressesList:any[]=[];
    openAddNewAddForm:boolean=false;
    address: AppAddressDto = new AppAddressDto();
    selectedAddress:any=null;
    @Input("isCreateOredit") isCreateOredit: boolean; 
    @Input() contactId:number;
    saving:boolean= false;
    addressIdForEdit:number=null;
    AddressTypesList:any=[];

    @ViewChild("addressForm") addressForm: NgForm;

    constructor(injector: Injector,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _accountsServiceProxy: AccountsServiceProxy,
        private _AppTransactionServiceProxy:AppTransactionServiceProxy
        ) {
        super(injector);
        this.getCountries();
        this.getAddressTypes()

    }
    filterAddressList(filterVal){
        this.savedAddressesList=this.refSavedAddressesList.filter(item=>item.name.includes(filterVal));

    }

    getAddressList(companySsin){
        this.showMainSpinner()
        this._AppTransactionServiceProxy.getCompanyAddresses(companySsin,null).subscribe(result => {
            this.savedAddressesList=null;
            this.savedAddressesList=result;
            this.refSavedAddressesList=result;
            if(this.savedAddressesList.length==0){
                this.openAddNewAddForm=true;
                this.showAddList=false;

            }else{
                this.showAddList=true;
            }
            this.hideMainSpinner()

        });
    }
    getAddressTypes(){
        this._AppEntitiesServiceProxy
        .getAllAddressTypeForTableDropdown()
        .subscribe((result) => {
         this.AddressTypesList=result;
        });
    }
    // get countries
    getCountries() {
            this._AppEntitiesServiceProxy.getAllCountryForTableDropdown().subscribe(result => {
                this.countries = result;
            });
    }
    discardAddressForm(){
        this.openAddNewAddForm=false;
        this.addressIdForEdit=null;

    }
    openAddAddressForm(){
        this.openAddNewAddForm=true;
    }
    deleteAddress(addressId:number){
        this._accountsServiceProxy.deleteAddress(addressId)
        .subscribe((item)=>{
            const index = this.savedAddressesList.findIndex(item=>item.id === addressId)
            this.savedAddressesList.splice(index,1)
            this.notify.success(this.l("DeletedSuccessfully"));
            if(this.savedAddressesList.length==0){
                this.openAddAddressForm();
                this.showAddList=false;

            }
        },(err:HttpErrorResponse)=>{
            this.notify.error(err.message)
        })
    }
    saveAddress(addressForm:NgForm) {
        this.saving = true;
        this.address.code=addressForm.value.addressCode;
        this.address.name=addressForm.value.addressName;
        this.address.addressLine1=addressForm.value.address1;
        this.address.addressLine2=addressForm.value.address2;
        this.address.city=addressForm.value.cityAddress;
        this.address.state=addressForm.value.State;
        this.address.postalCode=addressForm.value.postalCode;
        this.address.countryId=addressForm.value.AddressCountry;
        this.address.accountId=this.contactId;
        this.addressIdForEdit?this.address.id=this.addressIdForEdit:null;
        let addNew = this.addressIdForEdit == null || this.addressIdForEdit == undefined || this.addressIdForEdit == 0
        this._accountsServiceProxy.createOrEditAddress(this.address)
        .pipe(finalize(() => { this.saving = false;}))
        .subscribe((value) => {
            this.notify.info(this.l('SavedSuccessfully'));
            addressForm.resetForm();
            this.discardAddressForm();

            if(addNew){
                this.savedAddressesList.push(value);
                this.showAddList=true;

            }
            else{

                const index = this.savedAddressesList.findIndex(item=>item.id === value.id);
                this.savedAddressesList[index]=value;
                this.addressIdForEdit=null;
            }
        });
    }
    editAddress(addressId){
        this.openAddAddressForm();
        this.addressIdForEdit=addressId;
        const currentAddress = this.savedAddressesList.filter(item=>item.id === this.addressIdForEdit);
        this.addressCode=currentAddress[0].code;
        this.addressName=currentAddress[0].name;
        this.address1=currentAddress[0].addressLine1;
        this.address2=currentAddress[0].addressLine2;
        this.city=currentAddress[0].city;
        this.state=currentAddress[0].state;
        this.postalCode=currentAddress[0].postalCode;
        this.selectedCountry=currentAddress[0].countryId;
        this.address.accountId=currentAddress[0].contactId;
    }
selectAddress(addId){
const currentAddress = this.savedAddressesList.filter(item=>item.id === addId);
this.selectedAddress=currentAddress[0];
this.showAddList=false;
}
showAddressList(){
    this.showAddList=true;
}
    ngOnInit(): void {
        this.savedAddressesList=[];
    }
}
