import { Component, Injector,OnInit ,Input,ViewChild,Output,EventEmitter, SimpleChanges, OnChanges, AfterViewInit} from "@angular/core";
import { AccountsServiceProxy, AppAddressDto, AppEntitiesServiceProxy,  LookupLabelDto,AppTransactionServiceProxy, GetAppTransactionsForViewDto,ContactRoleEnum, ContactAppAddressDto } from "@shared/service-proxies/service-proxies";
import Swal from 'sweetalert2';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ShoppingCartoccordionTabs } from "../shopping-cart-view-component/ShoppingCartoccordionTabs";

@Component({
    selector: "app-address",
    templateUrl: "./address.component.html",
    styleUrls: ["./address.component.scss"],
})
export class AddressComponent extends AppComponentBase implements OnInit,OnChanges,AfterViewInit {
    @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
    @Input("selectedAddressDetails") selectedAddressDetails;
    @Input("showAddressType") showAddressType:boolean=true;
    @Input("showAddBtn") showAddBtn:boolean=true;
    @Input("showEditDelBtn") showEditDelBtn:boolean=true;
    @Input("fromSalesRep") fromSalesRep:boolean=true;
    @Input("fromSalesRep") fromSalesRep:boolean=true;

    showAddList:boolean=false;
    addressCode: string;
    name: string;
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
    selectedAddress:ContactAppAddressDto;
    @Input("isCreateOredit") isCreateOredit: boolean; 
    @Input() contactId:number;
    saving:boolean= false;
    addressIdForEdit:number=null;
    AddressTypesList:any=[];
    addType:any;
    @Output("updateSelectedAddress") updateSelectedAddress = new EventEmitter<any>();
    @Input("shipInfoIndex") shipInfoIndex: number;
    @Input("billingIndexInfo") billingIndexInfo: number;
    @ViewChild("addressForm") addressForm: NgForm;
    @Input("canChange")  canChange:boolean=true;

    @Input("currentTab") currentTab: number;

    constructor(injector: Injector,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _accountsServiceProxy: AccountsServiceProxy,
        private _AppTransactionServiceProxy:AppTransactionServiceProxy
        ) {
        super(injector);

    }


    ngAfterViewInit() {
      if(this.currentTab == ShoppingCartoccordionTabs.BillingInfo  || this.currentTab == ShoppingCartoccordionTabs.ShippingInfo ){
        this.getCountries();
        this.getAddressTypes()
      }
    }

    ngOnChanges(changes: SimpleChanges) {
        console.log(this.selectedAddressDetails,'this.selectedAddressDetails')
        if(this.currentTab == ShoppingCartoccordionTabs.BillingInfo  || this.currentTab == ShoppingCartoccordionTabs.ShippingInfo ){
        if(this.selectedAddressDetails){
        this.selectedAddressDetails.addressLine1=  this.selectedAddressDetails?.addressLine1 ? this.selectedAddressDetails?.addressLine1 : '' ;
        this.selectedAddressDetails.addressLine2=  this.selectedAddressDetails?.addressLine2 ? this.selectedAddressDetails?.addressLine2 : '' ;
        this.selectedAddressDetails.city=  this.selectedAddressDetails?.city ? this.selectedAddressDetails?.city : '' ;
        this.selectedAddressDetails.state=  this.selectedAddressDetails?.state ? this.selectedAddressDetails?.state : '' ;
        this.selectedAddressDetails.countryName=  this.selectedAddressDetails?.countryName ? this.selectedAddressDetails?.countryName : '' ;
        this.selectedAddressDetails.postalCode=  this.selectedAddressDetails?.postalCode ? this.selectedAddressDetails?.postalCode : '' ;

        if(!this.selectedAddress && this.selectedAddressDetails)
        this.selectedAddress=this.selectedAddressDetails;
  
        }      else {
            // this.selectedAddress = null;
            let role;
        
            if (this.currentTab === ShoppingCartoccordionTabs.ShippingInfo && this.shipInfoIndex === 2) {
                role = 6;
            } else if (this.currentTab === ShoppingCartoccordionTabs.BillingInfo && this.billingIndexInfo === 1) {
                role = 4;
            }
        
            const shIPtOroleContact = this.appTransactionsForViewDto?.appTransactionContacts.find(
                contact => contact?.contactRole === 6
            );
            const apRoleContact = this.appTransactionsForViewDto?.appTransactionContacts.find(
                contact => contact?.contactRole === 4
            );
        
        
        
            if (  role == 6) {
                // Set data for role 6 (Shipping)
                // const generatedId = this.generateNewId();
                this.selectedAddressDetails = {
                    ...shIPtOroleContact.contactAddressDetail,
                    // code: shIPtOroleContact.contactAddressCode,
                    // name: shIPtOroleContact.contactAddressName,
                    // id: generatedId
                };
                // this.refSavedAddressesList[0] = {
                //     ...shIPtOroleContact.contactAddressDetail,
                //     code: shIPtOroleContact.contactAddressCode,
                //     name: shIPtOroleContact.contactAddressName,
                //     // id: generatedId
                // };
                // this.selectedAddress = this.savedAddressesList[0];
            } else if ( role == 4) {
                this.selectedAddressDetails = {
                    ...apRoleContact.contactAddressDetail,
                    // code: shIPtOroleContact.contactAddressCode,
                    // name: shIPtOroleContact.contactAddressName,
                    // id: generatedId
                };
                // Set data for role 4 (Billing) and handle both Shipping and AP
                // const generatedId = this.generateNewId();
                
              
        
                // // Address for role 4 (Billing)
                // if (apRoleContact?.contactAddressDetail?.countryCode) {
                //     const apGeneratedId = this.generateNewId();
                //     this.savedAddressesList[1] = {
                //         ...apRoleContact.contactAddressDetail,
                //         code: apRoleContact.contactAddressCode,
                //         name: apRoleContact.contactAddressName,
                //         id: apGeneratedId
                //     };
                //     this.refSavedAddressesList[1] = {
                //         ...apRoleContact.contactAddressDetail,
                //         code: apRoleContact.contactAddressCode,
                //         name: apRoleContact.contactAddressName,
                //         id: apGeneratedId
                //     };
                //     this.selectedAddress = this.savedAddressesList[1];
                // } else {
                //     this.selectedAddress = null;
                // }
            } 
          
        
            console.log(this.savedAddressesList, 'this.savedAddressesList');
        }
    }
    }
    filterAddressList(filterVal: string) {
        this.savedAddressesList = this.refSavedAddressesList.filter(item => 
            (
                // item.name?.toLowerCase().includes(filterVal.toLowerCase()) || 
                item.addressLine1?.toLowerCase().includes(filterVal.toLowerCase()) || 
             item.addressLine2?.toLowerCase().includes(filterVal.toLowerCase()) ||
             item.city?.toLowerCase().includes(filterVal.toLowerCase()) || 
             item.state?.toLowerCase().includes(filterVal.toLowerCase()) || 
             item.countryCode?.toLowerCase().includes(filterVal.toLowerCase()) || 
             item.postalCode?.toLowerCase().includes(filterVal.toLowerCase()))
        );
    }

    getAddressList(companySsin,branchSsin){
       
        // this.showMainSpinner()
                 if(companySsin) {
                    this._AppTransactionServiceProxy.getCompanyAddresses(companySsin,null).subscribe(result => {
            
                        this.savedAddressesList=null;
                        this.savedAddressesList=result;
                        this.refSavedAddressesList=result;
                        console.log( this.savedAddressesList,' this.savedAddressesList')
                        this._AppTransactionServiceProxy.getCompanyDefaultAddresses(companySsin,branchSsin).subscribe(result => {
                            // console.log(result,'defauulllt')

                            if (result){
                                let role;
                
                                if (this.currentTab === ShoppingCartoccordionTabs.ShippingInfo && this.shipInfoIndex === 2) {
                                    role = 6;
                                } else if (this.currentTab === ShoppingCartoccordionTabs.BillingInfo && this.billingIndexInfo === 1) {
                                    role = 4;
                                }
                            
                                const shIPtOroleContact = this.appTransactionsForViewDto?.appTransactionContacts.find(
                                    contact => contact?.contactRole === 6
                                );
                                const apRoleContact = this.appTransactionsForViewDto?.appTransactionContacts.find(
                                    contact => contact?.contactRole === 4
                                );
                                if (this.currentTab === ShoppingCartoccordionTabs.ShippingInfo) {
                                    // Filter the result to find the address with addressType 'Shipping'
                                    const shippingAddress = result.find(address => address.addressType === 'Shipping');
                                    
                               
                                    
                                    if (shippingAddress) {
                                        // Check if the shipping address exists in the savedAddressesList
                                        const matchedAddress = this.savedAddressesList.find(savedAddress => 
                                            savedAddress.id === shippingAddress.addressId
                                        );
                                        
                                      console.log(matchedAddress,'matchedAddress')
                                        
                                        // If a matching address is found, set it as the selected address
                                        if (matchedAddress) {
                                            this.addAddressDataToDto(2);
                                        
                                            // ✅ Set selectedAddress and selectedAddressDetails properly
                                            this.selectedAddress = matchedAddress;
                                            this.selectedAddressDetails = { ...matchedAddress }; // <-- FIXED!
                                        
                                            this.selectAddress(this.selectedAddress.id);
                                        }
                                        
                                    }
            
                                }   else if (this.currentTab === ShoppingCartoccordionTabs.BillingInfo) {
                                    // Filter the result to find the address with addressType 'Billing'
                                    const billingAddress = result.find(address => address.addressType === 'Billing');
                                    
                                   
                                    
                                    if (billingAddress) {
                                        // Check if the billing address exists in the savedAddressesList
                                        const matchedAddress = this.savedAddressesList.find(savedAddress => 
                                            savedAddress.id === billingAddress.addressId
                                        );
                                        
                                    
                                        
                                        // If a matching address is found, set it as the selected address
                                        if (matchedAddress) {
                                            this.addAddressDataToDto(1);
                                        
                                            // ✅ Update both references
                                            this.selectedAddress = matchedAddress;
                                            this.selectedAddressDetails = { ...matchedAddress };
                                        
                                            this.selectAddress(this.selectedAddress.id);
                                        }
                                        
                                    }
                                }
            
                            }
                           
                        
                         }) 
                         
                        // debugger
                        if(this.savedAddressesList.length==0&&!this.selectedAddress){
                            // this.openAddNewAddForm=true;
                            this.showAddBtn = true
                            this.showAddList=false;
                            this.selectedAddress=null;
            
                        }else{
                            this.openAddNewAddForm=false;
                            this.showAddList=false;
            
                            this.selectedAddress?this.selectedAddress.countryName=this.countries.filter(item=>item.value === this.selectedAddress['countryId'])[0].label:'';
                            // this.selectedAddress?this.showAddList=false:this.showAddList=true;
                        }
                        this.hideMainSpinner()
            
                    });
                 }
                 else {
                    // this.selectedAddress = null;
                    let role;
                
                    if (this.currentTab === ShoppingCartoccordionTabs.ShippingInfo && this.shipInfoIndex === 2) {
                        role = 6;
                    } else if (this.currentTab === ShoppingCartoccordionTabs.BillingInfo && this.billingIndexInfo === 1) {
                        role = 4;
                    }
                
                    const shIPtOroleContact = this.appTransactionsForViewDto?.appTransactionContacts.find(
                        contact => contact?.contactRole === 6
                    );
                    const apRoleContact = this.appTransactionsForViewDto?.appTransactionContacts.find(
                        contact => contact?.contactRole === 4
                    );
                
                    console.log(shIPtOroleContact?.contactAddressDetail.countryCode, 'shIPtOroleContact');
                    console.log(apRoleContact?.contactAddressDetail.countryCode, 'apRoleContact');
                
                    if (role === 6 && shIPtOroleContact?.contactAddressDetail?.countryCode) {
                        // Set data for role 6 (Shipping)
                        const generatedId = this.generateNewId();
                        this.savedAddressesList[0] = {
                            ...shIPtOroleContact.contactAddressDetail,
                            code: shIPtOroleContact.contactAddressCode,
                            name: shIPtOroleContact.contactAddressName,
                            id: generatedId
                        };
                        this.refSavedAddressesList[0] = {
                            ...shIPtOroleContact.contactAddressDetail,
                            code: shIPtOroleContact.contactAddressCode,
                            name: shIPtOroleContact.contactAddressName,
                            id: generatedId
                        };
                        // this.selectedAddress = this.savedAddressesList[0];
                    } else if (role === 4 && shIPtOroleContact?.contactAddressDetail?.countryCode) {
                        // Set data for role 4 (Billing) and handle both Shipping and AP
                        const generatedId = this.generateNewId();
                        
                        // Address for role 6 (Shipping)
                        this.savedAddressesList[0] = {
                            ...shIPtOroleContact.contactAddressDetail,
                            code: shIPtOroleContact.contactAddressCode,
                            name: shIPtOroleContact.contactAddressName,

                            id: generatedId
                        };
                        this.refSavedAddressesList[0] = {
                            ...shIPtOroleContact.contactAddressDetail,
                            code: shIPtOroleContact.contactAddressCode,
                            name: shIPtOroleContact.contactAddressName,

                            id: generatedId
                        };
                
                        // Address for role 4 (Billing)
                        if (apRoleContact?.contactAddressDetail?.countryCode) {
                            const apGeneratedId = this.generateNewId();
                            this.savedAddressesList[1] = {
                                ...apRoleContact.contactAddressDetail,
                                code: apRoleContact.contactAddressCode,
                                name: apRoleContact.contactAddressName,
                                id: apGeneratedId
                            };
                            this.refSavedAddressesList[1] = {
                                ...apRoleContact.contactAddressDetail,
                                code: apRoleContact.contactAddressCode,
                                name: apRoleContact.contactAddressName,
                                id: apGeneratedId
                            };
                            // this.selectedAddress = this.savedAddressesList[1];
                        } else {
                            this.selectedAddress = null;
                        }
                    } else if (apRoleContact?.contactAddressDetail?.countryCode) {
                        // Fallback to AP role address if role 6 (Shipping) is not found
                        const apGeneratedId = this.generateNewId();
                        this.savedAddressesList[0] = {
                            ...apRoleContact.contactAddressDetail,
                            code: apRoleContact.contactAddressCode,
                            name: apRoleContact.contactAddressName,

                            id: apGeneratedId
                        };
                        this.refSavedAddressesList[0] = {
                            ...apRoleContact.contactAddressDetail,
                            code: apRoleContact.contactAddressCode,
                            name: apRoleContact.contactAddressName,
                            id: apGeneratedId
                        };
                        // this.selectedAddress = this.savedAddressesList[0];
                    } else {
                        this.selectedAddress = null;
                    }
                
                    console.log(this.savedAddressesList, 'this.savedAddressesList');
                }
                
                        
                    //  }
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
        this.addressCode='';
        this.name='';
        this.address1='';
        this.address2='';
        this.city='';
        this.state='';
        this.postalCode='';
        this.selectedCountry='';
        this.address.accountId=null;
    }
    openAddAddressForm(){
        this.openAddNewAddForm=true;
    }
    deleteAddress(addressId:number){
        Swal.fire({
            title: "",
            text: "Are you sure that you want to delete this address?",
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            allowOutsideClick: false,
            allowEscapeKey: false,
            backdrop: true,
            customClass: {
              popup: 'popup-class',
              icon: 'icon-class',
              content: 'content-class',
              actions: 'actions-class',
              confirmButton: 'confirm-button-class2',
      
            },
          }).then((result) => {
            if (result.isConfirmed) {
                this._accountsServiceProxy.deleteAddress(addressId)
                .subscribe((item)=>{
                    const index = this.savedAddressesList.findIndex(item=>item.id === addressId)
                    this.savedAddressesList.splice(index,1)
                    this.notify.success(this.l("DeletedSuccessfully"));
                    if(this.savedAddressesList.length==0){
                        this.openAddAddressForm();
                        this.showAddList=false;
                        this.selectedAddress=null;
                    }
                },(err:HttpErrorResponse)=>{
                    this.notify.error(err.message)
                })
            }
          })

    }

    saveAddress(addressForm:NgForm) {
        this.saving = true;
        this.address.code=addressForm.value.addressCode;
        this.address.name=addressForm.value.name;
        this.address.addressLine1=addressForm.value.address1;
        this.address.addressLine2=addressForm.value.address2;
        this.address.city=addressForm.value.cityAddress;
        this.address.state=addressForm.value.State;
        this.address.postalCode=addressForm.value.postalCode;
        this.address.countryId=addressForm.value.AddressCountry;
        this.address.accountId=this.contactId;
        this.address.tenantId=this.appSession.tenantId;
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
    generateNewId(): number {
        return Date.now(); // Generates a unique ID based on the current timestamp
    }
savetempAddress(addressForm: NgForm) {
    this.saving = true;
     console.log(addressForm.value,'addressForm')
    // Assign address fields from the form
    this.address.id = this.generateNewId();
    this.address.code = addressForm.value.addressCode ;
    this.address.name = addressForm.value.name ;
    this.address.addressLine1 = addressForm.value.address1 ;
    this.address.addressLine2 = addressForm.value.address2 ;
    this.address.city = addressForm.value.cityAddress ;
    this.address.state = addressForm.value.State ;
    this.address.postalCode = addressForm.value.postalCode ;
    this.address.countryId = addressForm.value.AddressCountry ;
    this.address.addressCode = addressForm.value.addressCode ;
    this.address.countryName = addressForm.value.AddressCountry ;
    this.addressIdForEdit?this.address.id=this.addressIdForEdit:null;
        let addNew = this.addressIdForEdit == null || this.addressIdForEdit == undefined || this.addressIdForEdit == 0
    // Handle the address ID for editing
    if (this.addressIdForEdit) {
        this.address.id = this.addressIdForEdit;
    }

    // If editing, find and update the existing address in the list; else, add a new address
    if (this.addressIdForEdit) {
        const index = this.savedAddressesList.findIndex(addr => addr.id === this.addressIdForEdit);
        if (index !== -1) {
            this.savedAddressesList[index] = { ...this.address }; // Update the existing address
        }
    } else {
        this.savedAddressesList.push({ ...this.address }); // Add new address to the list
        this.selectAddress(this.address.id)
        // this.selectedAddress = this.savedAddressesList[0]
    }

    this.saving = false;
    this.openAddNewAddForm = false;
    addressForm.resetForm();
    this.discardAddressForm();
    this.addressIdForEdit = null; // Reset edit mode


    // console.log('Address saved:', this.address);
    // console.log('Updated savedAddressesList:', this.savedAddressesList);
}
addAddressDataToDto(index: number) {
    // Determine the role based on index
    let role;
    if (index === 2) {
        role = 6;
    } else if (index === 1) {
        role = 4;
    }

    // Find the role contact based on the calculated role
    const roleContact = this.appTransactionsForViewDto?.appTransactionContacts.find(
        contact => contact?.contactRole === role
    );

    if (roleContact) {
        // Only update the address-related properties, leave the rest of the DTO unchanged
        roleContact.contactAddressCity = this.selectedAddress.city || roleContact.contactAddressCity;
        roleContact.contactAddressCountryCode = this.selectedAddress.countryCode || roleContact.contactAddressCountryCode;
        roleContact.contactAddressCountryId = this.selectedAddress.countryId || roleContact.contactAddressCountryId;
        roleContact.contactAddressName = this.selectedAddress.name || roleContact.contactAddressName;
        roleContact.contactAddressCode = this.selectedAddress.code || roleContact.contactAddressCode
        
        // Ensure contactAddressDetail is updated with address-related values but leave others unchanged
        roleContact.contactAddressDetail = new ContactAppAddressDto({
            code: this.selectedAddress?.code || roleContact.contactAddressDetail.code,
            name: roleContact.contactAddressName,
            countryName: this.selectedAddress?.countryName || roleContact.contactAddressDetail.countryName,
            addressLine1: this.selectedAddress?.addressLine1 || roleContact.contactAddressDetail.addressLine1,
            addressLine2: this.selectedAddress?.addressLine2 || roleContact.contactAddressDetail.addressLine2,
            city: this.selectedAddress?.city || roleContact.contactAddressDetail.city,
            state: this.selectedAddress?.state || roleContact.contactAddressDetail.state,
            postalCode: this.selectedAddress?.postalCode || roleContact.contactAddressDetail.postalCode,
            countryId: this.selectedAddress?.countryId || roleContact.contactAddressDetail.countryId,
            countryCode: this.selectedAddress?.countryCode || roleContact.contactAddressDetail.countryCode,
            countryIdName: this.selectedAddress?.countryIdName || roleContact.contactAddressDetail.countryIdName,
            contactEmail: roleContact.contactEmail || roleContact.contactAddressDetail.contactEmail,
            contactPhone: roleContact.contactPhone || roleContact.contactAddressDetail.contactPhone,
            tenantId: roleContact.tenantId || roleContact.contactAddressDetail.tenantId,
            accountId: roleContact.accountId || roleContact.contactAddressDetail.accountId,
            contactAddressId: roleContact.contactAddressId || roleContact.contactAddressDetail.contactAddressId,
            useDTOTenant: roleContact.useDTOTenant || roleContact.contactAddressDetail.useDTOTenant,
            id: roleContact.id || roleContact.contactAddressDetail.id || this.generateNewId()
        });

        // Set additional address properties if they exist
        roleContact.contactAddressLine1 = this.selectedAddress.addressLine1 || roleContact.contactAddressLine1;
        roleContact.contactAddressLine2 = this.selectedAddress.addressLine2 || roleContact.contactAddressLine2;
        roleContact.contactAddressPostalCode = this.selectedAddress.postalCode || roleContact.contactAddressDetail.postalCode;

        roleContact.contactAddressState = this.selectedAddress.state || roleContact.contactAddressState;
    }

    // Debugging: log the contacts to ensure the update is applied
    console.log(this.appTransactionsForViewDto?.appTransactionContacts[2], 'Contact for role 6');
    console.log(this.appTransactionsForViewDto?.appTransactionContacts[3], 'Contact for role 4');
}



    
    editAddress(addressId){
        this.openAddAddressForm();
        this.addressIdForEdit=addressId;
        const currentAddress = this.savedAddressesList.filter(item=>item.id === this.addressIdForEdit);
        this.addressCode=currentAddress[0].code;
        this.name=currentAddress[0].name;
        this.address1=currentAddress[0].addressLine1;
        this.address2=currentAddress[0].addressLine2;
        this.city=currentAddress[0].city;
        this.state=currentAddress[0].state;
        this.postalCode=currentAddress[0].postalCode;
        this.selectedCountry=currentAddress[0].countryId;
        this.address.accountId=currentAddress[0].contactId;
    }
    selectAddress(addId: number) {
        // Create a new instance of ContactAppAddressDto using selectedAddress properties
        const contactAddressDto = new ContactAppAddressDto({
            code: this.selectedAddress?.code,
            name: this.selectedAddress?.name,
            countryName: this.selectedAddress?.countryName,
            addressLine1: this.selectedAddress?.addressLine1,
            addressLine2: this.selectedAddress?.addressLine2,
            city: this.selectedAddress?.city,
            state: this.selectedAddress?.state,
            postalCode: this.selectedAddress?.postalCode,
            countryId: this.selectedAddress?.countryId,
            countryCode: this.selectedAddress?.countryCode,
            countryIdName: this.selectedAddress?.countryIdName,
            contactEmail: this.selectedAddress?.contactEmail,
            contactPhone: this.selectedAddress?.contactPhone,
            tenantId: this.selectedAddress?.tenantId,
            accountId: this.selectedAddress?.accountId ,
            contactAddressId: this.selectedAddress?.contactAddressId,
            useDTOTenant: this.selectedAddress?.useDTOTenant,
            id: this.selectedAddress?.id
        });
    
        // Find the address based on the given addId
        const currentAddress = this.savedAddressesList.filter(item => item.id === addId);
        this.selectedAddress = currentAddress[0] as ContactAppAddressDto;
    
        // Set the country name based on the countryId
        
        const countryObj = this.countries.find(item => item.value === currentAddress[0]['countryId']);
        this.selectedAddress.countryName = countryObj ? countryObj.label : '';
        this.selectedAddress.countryCode = countryObj ? countryObj.code : '';
        
        this.showAddList = false;
    
        // Ensure no undefined or null values, default them to empty strings or null
       this.selectedAddress.id = this.selectedAddress.id
        this.selectedAddress.addressLine1 = this.selectedAddress?.addressLine1 ;
        this.selectedAddress.addressLine2 = this.selectedAddress?.addressLine2 ;
        this.selectedAddress.city = this.selectedAddress?.city ;
        this.selectedAddress.state = this.selectedAddress?.state ;
        this.selectedAddress.countryName = this.selectedAddress?.countryName ;
        this.selectedAddress.countryCode = this.selectedAddress?.countryCode ;
        this.selectedAddress.postalCode = this.selectedAddress?.postalCode ;
        this.selectedAddress.countryId = this.selectedAddress?.countryId ;
        this.selectedAddress.code = this.selectedAddress?.code ;
        this.selectedAddress.state = this.selectedAddress?.state;
        this.selectedAddress.name = this.selectedAddress?.name ;
    
        // Check if Buyer SSN is empty or null before adding address data
        if (this.appTransactionsForViewDto?.buyerCompanySSIN == '' || this.appTransactionsForViewDto?.buyerCompanySSIN == null) {
            if (this.currentTab == ShoppingCartoccordionTabs.ShippingInfo && this.shipInfoIndex == 2) {
                this.addAddressDataToDto(2);
            } else if (this.currentTab == ShoppingCartoccordionTabs.BillingInfo && this.billingIndexInfo == 1) {
                this.addAddressDataToDto(1);
            }
        }
    
        // Ensure selectedAddress is an instance of ContactAppAddressDto before emitting
        const updatedContactAddressDto = new ContactAppAddressDto({
            code: this.selectedAddress?.code,
            name: this.selectedAddress?.name,
            countryName: this.selectedAddress?.countryName,
            addressLine1: this.selectedAddress?.addressLine1,
            addressLine2: this.selectedAddress?.addressLine2,
            city: this.selectedAddress?.city,
            state: this.selectedAddress?.state,
            postalCode: this.selectedAddress?.postalCode,
            countryId: this.selectedAddress?.countryId,
            countryCode: this.selectedAddress?.countryCode,
            countryIdName: this.selectedAddress?.countryIdName,
            contactEmail: this.selectedAddress?.contactEmail,
            contactPhone: this.selectedAddress?.contactPhone,
            tenantId: this.selectedAddress?.tenantId,
            accountId: this.selectedAddress?.accountId,
            contactAddressId: this.selectedAddress?.contactAddressId,
            useDTOTenant: this.selectedAddress?.useDTOTenant,
            id: this.selectedAddress?.id ||  this.generateNewId(),
        });
       
        
        // Emit the updated selectedAddressObj as an instance of ContactAppAddressDto
        this.updateSelectedAddress.emit({
            id: addId,
            code: currentAddress[0].code,
            selectedAddressObj: updatedContactAddressDto // Send the DTO object
        });
    }
    
deleteTempAddress(addressId) {
    Swal.fire({
        title: "",
        text: "Are you sure that you want to delete this address?",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        allowOutsideClick: false,
        allowEscapeKey: false,
        backdrop: true,
        customClass: {
          popup: 'popup-class',
          icon: 'icon-class',
          content: 'content-class',
          actions: 'actions-class',
          confirmButton: 'confirm-button-class2',
  
        },
      }).then((result) => {
        if (result.isConfirmed) {
            const index = this.savedAddressesList.findIndex(item=>item.id === addressId)
            this.savedAddressesList.splice(index,1)
            this.notify.success(this.l("DeletedSuccessfully"));
            if(this.savedAddressesList.length==0){
                this.openAddAddressForm();
                this.showAddList=false;
                this.selectedAddress=null;
            }
        }
      })
}
showAddressList(){
    this.showAddList=true;
}
    ngOnInit(): void {
        this.savedAddressesList=[];
        if(this.selectedAddressDetails){
            this.showAddList=false;
            this.openAddNewAddForm=false;
            this.selectedAddress=this.selectedAddressDetails;
        }
    }
    selectAddressType(){
        this.updateSelectedAddress.emit({id:this.selectedAddress.id,code:this.selectedAddress.code,typeId:this.addType});
    
    }

}
