import {
    Component,
    Injector,
    OnInit,
    Input,
    ViewChild,
    Output,
    EventEmitter,
    SimpleChanges,
    OnChanges,
    AfterViewInit,
  } from "@angular/core";
  import {
    AccountsServiceProxy,
    AppAddressDto,
    AppEntitiesServiceProxy,
    LookupLabelDto,
    AppTransactionServiceProxy,
    GetAppTransactionsForViewDto,
    ContactRoleEnum,
    ContactAppAddressDto,
  } from "@shared/service-proxies/service-proxies";
  import { AppComponentBase } from "@shared/common/app-component-base";
  import { finalize } from "rxjs/operators";
  import { NgForm } from "@angular/forms";
  import Swal from "sweetalert2";
  import { ShoppingCartoccordionTabs } from "../shopping-cart-view-component/ShoppingCartoccordionTabs";
  
  @Component({
    selector: "app-address",
    templateUrl: "./address.component.html",
    styleUrls: ["./address.component.scss"],
  })
  export class AddressComponent
    extends AppComponentBase
    implements OnInit, OnChanges, AfterViewInit
  {
    @Input() appTransactionsForViewDto: GetAppTransactionsForViewDto;
    @Input() selectedAddressDetails: any;
    @Input() showAddressType: boolean = true;
    @Input() showAddBtn: boolean = true;
    @Input() showEditDelBtn: boolean = true;
    @Input() fromSalesRep: boolean = true;
    @Input() isCreateOredit: boolean;
    @Input() contactId: number;
    @Input() shipInfoIndex: number;
    @Input() billingIndexInfo: number;
    @Input() canChange: boolean = true;
    @Input() currentTab: number;
  
    @Output() updateSelectedAddress = new EventEmitter<any>();
  
    @ViewChild("addressForm") addressForm: NgForm;
  
    showAddList = false;
    openAddNewAddForm = false;
    address = new AppAddressDto();
    selectedAddress: ContactAppAddressDto;
    addressIdForEdit: number = null;
    saving = false;
  
    addressCode = "";
    name = "";
    address1 = "";
    address2 = "";
    city = "";
    state = "";
    postalCode = "";
    selectedCountry: any;
  
    countries: LookupLabelDto[] = [];
    savedAddressesList: any[] = [];
    refSavedAddressesList: any[] = [];
    AddressTypesList: any[] = [];
    addType: any;
  
    constructor(
      injector: Injector,
      private _entitiesService: AppEntitiesServiceProxy,
      private _accountsService: AccountsServiceProxy,
      private _transactionService: AppTransactionServiceProxy
    ) {
      super(injector);
    }
  
    ngOnInit(): void {
      this.savedAddressesList = [];
      if (this.selectedAddressDetails) {
        this.selectedAddress = this.selectedAddressDetails;
        this.showAddList = false;
        this.openAddNewAddForm = false;
      }
    }
  
    ngAfterViewInit(): void {
      if (
        this.currentTab === ShoppingCartoccordionTabs.BillingInfo ||
        this.currentTab === ShoppingCartoccordionTabs.ShippingInfo
      ) {
        this.getCountries();
        this.getAddressTypes();
      }
    }
  
    ngOnChanges(changes: SimpleChanges): void {
      if (
        this.currentTab !== ShoppingCartoccordionTabs.BillingInfo &&
        this.currentTab !== ShoppingCartoccordionTabs.ShippingInfo
      ) return;
  
      if (this.selectedAddressDetails) {
        const fields = ['addressLine1', 'addressLine2', 'city', 'state', 'countryName', 'postalCode'];
        fields.forEach(f => this.selectedAddressDetails[f] = this.selectedAddressDetails[f] || '');
        this.selectedAddress ||= this.selectedAddressDetails;
      } else {
        const role = this.getAddressRole();
        const contact = this.getRoleContact(role);
        if (contact?.contactAddressDetail) {
          this.selectedAddressDetails = { ...contact.contactAddressDetail };
        }
      }
    }
  
    getCountries(): void {
      this._entitiesService.getAllCountryForTableDropdown().subscribe(res => {
        this.countries = res;
      });
    }
  
    getAddressTypes(): void {
      this._entitiesService.getAllAddressTypeForTableDropdown().subscribe(res => {
        this.AddressTypesList = res;
      });
    }
  
    getAddressRole(): number {
      if (this.currentTab === ShoppingCartoccordionTabs.ShippingInfo && this.shipInfoIndex === 2) return 6;
      if (this.currentTab === ShoppingCartoccordionTabs.BillingInfo && this.billingIndexInfo === 1) return 4;
      return null;
    }
  
    getRoleContact(role: number) {
      return this.appTransactionsForViewDto?.appTransactionContacts.find(c => c.contactRole === role);
    }
  
    filterAddressList(filterVal: string): void {
      const val = filterVal.toLowerCase();
      this.savedAddressesList = this.refSavedAddressesList.filter(item =>
        ['addressLine1', 'addressLine2', 'city', 'state', 'countryCode', 'postalCode'].some(
          key => item[key]?.toLowerCase().includes(val)
        )
      );
    }
  
    generateNewId(): number {
      return Date.now();
    }
  
    discardAddressForm(): void {
      this.openAddNewAddForm = false;
      this.addressIdForEdit = null;
      this.addressCode = this.name = this.address1 = this.address2 = this.city = this.state = this.postalCode = '';
      this.selectedCountry = '';
      this.address = new AppAddressDto();
    }
  
    openAddAddressForm(): void {
      this.openAddNewAddForm = true;
    }
  
    deleteAddress(addressId: number): void {
      Swal.fire({
        title: "",
        text: "Are you sure that you want to delete this address?",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        customClass: {
          popup: 'popup-class',
          icon: 'icon-class',
          content: 'content-class',
          actions: 'actions-class',
          confirmButton: 'confirm-button-class2',
        },
      }).then(result => {
        if (!result.isConfirmed) return;
  
        this._accountsService.deleteAddress(addressId).subscribe(() => {
          this.savedAddressesList = this.savedAddressesList.filter(item => item.id !== addressId);
          this.notify.success(this.l("DeletedSuccessfully"));
  
          if (this.savedAddressesList.length === 0) {
            this.openAddAddressForm();
            this.showAddList = false;
            this.selectedAddress = null;
          }
        });
      });
    }
  
    editAddress(addressId: number): void {
      this.openAddAddressForm();
      this.addressIdForEdit = addressId;
      const addr = this.savedAddressesList.find(a => a.id === addressId);
      if (!addr) return;
  
      this.addressCode = addr.code;
      this.name = addr.name;
      this.address1 = addr.addressLine1;
      this.address2 = addr.addressLine2;
      this.city = addr.city;
      this.state = addr.state;
      this.postalCode = addr.postalCode;
      this.selectedCountry = addr.countryId;
      this.address.accountId = addr.contactId;
    }
  
    selectAddressType(): void {
      this.updateSelectedAddress.emit({
        id: this.selectedAddress?.id,
        code: this.selectedAddress?.code,
        typeId: this.addType,
      });
    }
  
    getAddressList(companySsin: string, branchSsin: string): void {
        this.showMainSpinner();
      
        if (companySsin) {
          this._transactionService.getCompanyAddresses(companySsin, null).subscribe(addresses => {
            this.savedAddressesList = this.refSavedAddressesList = addresses;
      
            this._transactionService.getCompanyDefaultAddresses(companySsin, branchSsin).subscribe(defaults => {
              if (defaults) {
                const role = this.getAddressRole();
                const isShipping = this.currentTab === ShoppingCartoccordionTabs.ShippingInfo;
      
                const defaultAddress = defaults.find(a => a.addressType === (isShipping ? "Shipping" : "Billing"));
                const matched = this.savedAddressesList.find(a => a.id === defaultAddress?.addressId);
      
                if (matched) {
                  this.addAddressDataToDto(isShipping ? 2 : 1);
                  this.selectedAddress = matched;
                  this.selectedAddressDetails = { ...matched };
                  this.selectAddress(matched.id);
                }
              }
            });
      
            if (this.savedAddressesList.length === 0 && !this.selectedAddress) {
              this.showAddBtn = true;
              this.showAddList = false;
              this.selectedAddress = null;
            } else {
              this.openAddNewAddForm = false;
              this.showAddList = false;
              const country = this.countries.find(c => c.value === this.selectedAddress?.countryId);
              if (country) this.selectedAddress.countryName = country.label;
            }
      
            this.hideMainSpinner();
          });
        } else {
          const role = this.getAddressRole();
          const shipping = this.getRoleContact(6);
          const billing = this.getRoleContact(4);
      
          if (role === 6 && shipping?.contactAddressDetail?.countryCode) {
            this.addToSavedList(shipping);
          } else if (role === 4 && shipping?.contactAddressDetail?.countryCode) {
            this.addToSavedList(shipping);
            if (billing?.contactAddressDetail?.countryCode) this.addToSavedList(billing);
          } else if (billing?.contactAddressDetail?.countryCode) {
            this.addToSavedList(billing);
          } else {
            this.selectedAddress = null;
          }
        }
      }
      
      private addToSavedList(contact): void {
        const id = this.generateNewId();
        const address = {
          ...contact.contactAddressDetail,
          code: contact.contactAddressCode,
          name: contact.contactAddressName,
          id
        };
        this.savedAddressesList.push(address);
        this.refSavedAddressesList.push(address);
      }
      
      saveAddress(form: NgForm): void {
        this.saving = true;
        Object.assign(this.address, {
          code: form.value.addressCode,
          name: form.value.name,
          addressLine1: form.value.address1,
          addressLine2: form.value.address2,
          city: form.value.cityAddress,
          state: form.value.State,
          postalCode: form.value.postalCode,
          countryId: form.value.AddressCountry,
          accountId: this.contactId,
          tenantId: this.appSession.tenantId,
          id: this.addressIdForEdit || undefined
        });
      
        const isNew = !this.addressIdForEdit;
      
        this._accountsService
          .createOrEditAddress(this.address)
          .pipe(finalize(() => (this.saving = false)))
          .subscribe(saved => {
            this.notify.info(this.l("SavedSuccessfully"));
            form.resetForm();
            this.discardAddressForm();
      
            if (isNew) {
              this.savedAddressesList.push(saved);
              this.showAddList = true;
            } else {
              const i = this.savedAddressesList.findIndex(a => a.id === saved.id);
              if (i !== -1) this.savedAddressesList[i] = saved;
            }
          });
      }
      
      savetempAddress(form: NgForm): void {
        this.saving = true;
      
        const tempId = this.addressIdForEdit || this.generateNewId();
        const addressData = {
          ...form.value,
          id: tempId,
          code: form.value.addressCode,
          name: form.value.name,
          countryId: form.value.AddressCountry,
          countryName: form.value.AddressCountry,
          addressCode: form.value.addressCode
        };
      
        Object.assign(this.address, addressData);
      
        const idx = this.savedAddressesList.findIndex(a => a.id === tempId);
        if (this.addressIdForEdit && idx !== -1) {
          this.savedAddressesList[idx] = { ...this.address };
        } else {
          this.savedAddressesList.push({ ...this.address });
          this.selectAddress(tempId);
        }
      
        this.saving = false;
        this.openAddNewAddForm = false;
        form.resetForm();
        this.discardAddressForm();
        this.addressIdForEdit = null;
      }
      
      selectAddress(addId: number): void {
        const addr = this.savedAddressesList.find(a => a.id === addId);
        if (!addr) return;
      
        this.selectedAddress = { ...addr } as ContactAppAddressDto;
      
        const country = this.countries.find(c => c.value === this.selectedAddress.countryId);
        this.selectedAddress.countryName = country?.label;
        this.selectedAddress.countryCode = country?.code;
      
        this.showAddList = false;
      
        if (!this.appTransactionsForViewDto?.buyerCompanySSIN) {
          const role = this.getAddressRole();
          if (role) this.addAddressDataToDto(role === 6 ? 2 : 1);
        }
      
        const updatedDto = new ContactAppAddressDto({
          ...this.selectedAddress,
          id: this.selectedAddress.id || this.generateNewId()
        });
      
        this.updateSelectedAddress.emit({
          id: addId,
          code: addr.code,
          selectedAddressObj: updatedDto
        });
      }
      
      addAddressDataToDto(index: number): void {
        const role = index === 2 ? 6 : 4;
        const contact = this.getRoleContact(role);
        if (!contact) return;
      
        Object.assign(contact, {
          contactAddressCity: this.selectedAddress.city,
          contactAddressCountryCode: this.selectedAddress.countryCode,
          contactAddressCountryId: this.selectedAddress.countryId,
          contactAddressName: this.selectedAddress.name,
          contactAddressCode: this.selectedAddress.code,
          contactAddressLine1: this.selectedAddress.addressLine1,
          contactAddressLine2: this.selectedAddress.addressLine2,
          contactAddressPostalCode: this.selectedAddress.postalCode,
          contactAddressState: this.selectedAddress.state,
          contactAddressDetail: new ContactAppAddressDto({
            ...this.selectedAddress,
            contactEmail: contact.contactEmail,
            contactPhone: contact.contactPhone,
            tenantId: contact.tenantId,
            accountId: contact.accountId,
            contactAddressId: contact.contactAddressId,
            useDTOTenant: contact.useDTOTenant,
            id: contact.id || this.generateNewId()
          })
        });
      }
      
      deleteTempAddress(addressId: number): void {
        Swal.fire({
          title: "",
          text: "Are you sure that you want to delete this address?",
          icon: "info",
          showCancelButton: true,
          confirmButtonText: "Yes",
          cancelButtonText: "No",
          customClass: {
            popup: 'popup-class',
            icon: 'icon-class',
            content: 'content-class',
            actions: 'actions-class',
            confirmButton: 'confirm-button-class2'
          }
        }).then(result => {
          if (!result.isConfirmed) return;
          this.savedAddressesList = this.savedAddressesList.filter(a => a.id !== addressId);
          this.notify.success(this.l("DeletedSuccessfully"));
      
          if (this.savedAddressesList.length === 0) {
            this.openAddAddressForm();
            this.showAddList = false;
            this.selectedAddress = null;
          }
        });
      }
      
      showAddressList(): void {
        this.showAddList = true;
      }
      
  }
  