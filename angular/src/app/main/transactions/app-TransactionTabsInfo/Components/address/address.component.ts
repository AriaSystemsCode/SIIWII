

import { Component, Injector, OnInit, Input, ViewChild, Output, EventEmitter, SimpleChanges, OnChanges, AfterViewInit, OnDestroy } from "@angular/core";
import { AccountsServiceProxy, AppAddressDto, AppEntitiesServiceProxy, LookupLabelDto, AppTransactionServiceProxy, GetAppTransactionsForViewDto, ContactRoleEnum, ContactAppAddressDto } from "@shared/service-proxies/service-proxies";
import Swal from 'sweetalert2';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize, Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TransactionCartoccordionTabs } from "../../../enums/TransactionCartoccordionTabs";

@Component({
  selector: "app-address",
  templateUrl: "./address.component.html",
  styleUrls: ["./address.component.scss"],
})
export class AddressComponent extends AppComponentBase implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
  @Input("selectedAddressDetails") selectedAddressDetails;
  @Input("showAddressType") showAddressType: boolean = true;
  @Input("showAddBtn") showAddBtn: boolean = true;
  @Input("showEditDelBtn") showEditDelBtn: boolean = true;
  @Input("fromSalesRep") fromSalesRep: boolean = true;
  @Input("isCreateOredit") isCreateOredit: boolean;
  @Input() contactId: number;
  @Input("shipInfoIndex") shipInfoIndex: number;
  @Input("billingIndexInfo") billingIndexInfo: number;
  @Input("canChange") canChange: boolean = true;
  @Input("currentTab") currentTab: number;
@Input() companySsin: string | null = null;
@Input() branchSsin: string | null = null;
  @Output("updateSelectedAddress") updateSelectedAddress = new EventEmitter<any>();

  @ViewChild("addressForm") addressForm: NgForm;

  showAddList: boolean = false;
  addressCode: string;
  name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: String;
  selectedCountry: any;
  countries: LookupLabelDto[] = [];
  savedAddressesList: any[] = [];
  refSavedAddressesList: any[] = [];
  openAddNewAddForm: boolean = false;
  address: AppAddressDto = new AppAddressDto();
  selectedAddress: ContactAppAddressDto;
  saving: boolean = false;
  addressIdForEdit: number = null;
  AddressTypesList: any = [];
  addType: any;

  subscriptions: Subscription[] = [];

  currentLang: string
  isArabic: boolean
  selectedAddressIndex: number | null = null;
  selectedAddressText = '';

  loadingAddresses:any

  constructor(injector: Injector,
    private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
    private _accountsServiceProxy: AccountsServiceProxy,
    private _AppTransactionServiceProxy: AppTransactionServiceProxy
  ) {
    super(injector);

  }


  ngAfterViewInit() {
    if (this.currentTab == TransactionCartoccordionTabs.BillingInfo || this.currentTab == TransactionCartoccordionTabs.ShippingInfo) {
      this.getCountries();
      this.getAddressTypes()
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.currentTab == TransactionCartoccordionTabs.BillingInfo || this.currentTab == TransactionCartoccordionTabs.ShippingInfo) {
      if (this.selectedAddressDetails) {
        this.selectedAddressDetails.addressLine1 = this.selectedAddressDetails?.addressLine1 ? this.selectedAddressDetails?.addressLine1 : '';
        this.selectedAddressDetails.addressLine2 = this.selectedAddressDetails?.addressLine2 ? this.selectedAddressDetails?.addressLine2 : '';
        this.selectedAddressDetails.city = this.selectedAddressDetails?.city ? this.selectedAddressDetails?.city : '';
        this.selectedAddressDetails.state = this.selectedAddressDetails?.state ? this.selectedAddressDetails?.state : '';
        this.selectedAddressDetails.countryName = this.selectedAddressDetails?.countryName ? this.selectedAddressDetails?.countryName : '';
        this.selectedAddressDetails.postalCode = this.selectedAddressDetails?.postalCode ? this.selectedAddressDetails?.postalCode : '';

        if (!this.selectedAddress && this.selectedAddressDetails)
          this.selectedAddress = this.selectedAddressDetails;

      } else {
        let role;

        if (this.currentTab === TransactionCartoccordionTabs.ShippingInfo && this.shipInfoIndex === 2) {
          role = 6;
        } else if (this.currentTab === TransactionCartoccordionTabs.BillingInfo && this.billingIndexInfo === 1) {
          role = 4;
        }

        const shIPtOroleContact = this.appTransactionsForViewDto?.appTransactionContacts.find(
          contact => contact?.contactRole === 6
        );
        const apRoleContact = this.appTransactionsForViewDto?.appTransactionContacts.find(
          contact => contact?.contactRole === 4
        );



        if (role == 6) {

          this.selectedAddressDetails = {
            ...shIPtOroleContact.contactAddressDetail,
          };

        } else if (role == 4) {
          this.selectedAddressDetails = {
            ...apRoleContact.contactAddressDetail,

          };


        }


      }
    }
  }
  filterAddressList(filterVal: string) {
    this.savedAddressesList = this.refSavedAddressesList.filter(item =>
    (
      item.addressLine1?.toLowerCase().includes(filterVal.toLowerCase()) ||
      item.addressLine2?.toLowerCase().includes(filterVal.toLowerCase()) ||
      item.city?.toLowerCase().includes(filterVal.toLowerCase()) ||
      item.state?.toLowerCase().includes(filterVal.toLowerCase()) ||
      item.countryCode?.toLowerCase().includes(filterVal.toLowerCase()) ||
      item.postalCode?.toLowerCase().includes(filterVal.toLowerCase()))
    );
  }

  private getCurrentRole(): ContactRoleEnum {
    if (this.currentTab === TransactionCartoccordionTabs.ShippingInfo) {
      if (this.shipInfoIndex === 1) return ContactRoleEnum.ShipFromContact; // 5
      if (this.shipInfoIndex === 2) return ContactRoleEnum.ShipToContact;   // 6
    }

    if (this.currentTab === TransactionCartoccordionTabs.BillingInfo) {
      if (this.billingIndexInfo === 1) return ContactRoleEnum.APContact;   // 4
      if (this.billingIndexInfo === 2) return ContactRoleEnum.ARContact; // 3
    }

    return null;
  }

  private getRelatedFallbackRole(currentRole: ContactRoleEnum): ContactRoleEnum {
    switch (currentRole) {
      case ContactRoleEnum.ShipToContact: return ContactRoleEnum.APContact;
      case ContactRoleEnum.APContact: return ContactRoleEnum.ShipToContact;

      case ContactRoleEnum.ShipFromContact: return ContactRoleEnum.ARContact;
      case ContactRoleEnum.ARContact: return ContactRoleEnum.ShipFromContact;

      default: return null;
    }
  }

  getAddressList(companySsin: string, branchSsin?: string): void {
    const role = this.getCurrentRole();
    const fallbackRole = this.getRelatedFallbackRole(role);

    if (!role) return;

    if (companySsin) {
      const subs = this._AppTransactionServiceProxy.getCompanyAddresses(companySsin, null).subscribe(result => {
        this.savedAddressesList = [...result];
        this.refSavedAddressesList = [...result];

        this._AppTransactionServiceProxy.getCompanyDefaultAddresses(companySsin, branchSsin).subscribe(defaults => {
          if (!defaults?.length) return;

          const roleAddressTypeMap = {
            [ContactRoleEnum.ShipToContact]: 'Shipping',
            [ContactRoleEnum.ShipFromContact]: 'Shipping',
            [ContactRoleEnum.APContact]: 'Billing',
            [ContactRoleEnum.ARContact]: 'Billing'
          };

          const expectedType = roleAddressTypeMap[role];
          const defaultAddress = defaults.find(addr => addr.addressType === expectedType);

          if (defaultAddress) {
            const matched = this.savedAddressesList.find(a => a.id === defaultAddress.addressId);
            // if (matched) {
            //   this.selectedAddress = { ...matched };
            //   this.selectedAddressDetails = { ...matched };
            //   this.selectAddress(this.selectedAddress.id);
            //   this.addAddressDataToDto(role);
            // }
            if (matched) {
              this.selectedAddress = { ...matched } as any;
              this.selectedAddressDetails = { ...matched };

              this.selectedAddressText = this.getAddressText(this.selectedAddress);

              this.selectAddress(this.selectedAddress.id);
              this.addAddressDataToDto(role);
            }
          }
        });

        // Add fallback address from related contact
        const fallbackContact = this.appTransactionsForViewDto?.appTransactionContacts.find(c => c?.contactRole === fallbackRole);
        if (fallbackContact?.contactAddressDetail?.countryCode) {
          const fallback = {
            ...fallbackContact.contactAddressDetail,
            code: fallbackContact.contactAddressCode,
            name: fallbackContact.contactAddressName,
            id: this.generateNewId()
          };

          // Prevent duplicate fallback by checking existing IDs
          const alreadyExists = this.savedAddressesList.some(a => a.code === fallback.code && a.name === fallback.name);
          if (!alreadyExists) {
            this.savedAddressesList.push(fallback);
            this.refSavedAddressesList.push(fallback);
          }
        }
        if (this.selectedAddress || this.selectedAddressDetails) {
          this.selectedAddressText = this.getAddressText(
            this.selectedAddress || this.selectedAddressDetails
          );
        }
        if (this.savedAddressesList.length === 0 && !this.selectedAddress) {
          this.showAddBtn = true;
          this.showAddList = false;
          this.selectedAddress = null;
        } else {
          this.openAddNewAddForm = false;
          this.showAddList = false;

          if (this.selectedAddress?.countryId) {
            const country = this.countries.find(c => c.value === this.selectedAddress.countryId);
            if (country) this.selectedAddress.countryName = country.label;
          }
        }

        this.hideMainSpinner();
      });

      this.subscriptions.push(subs);
    } else {
      const contact = this.appTransactionsForViewDto?.appTransactionContacts.find(c => c?.contactRole === role);
      if (contact?.contactAddressDetail?.countryCode) {
        const fallbackAddress = {
          ...contact.contactAddressDetail,
          code: contact.contactAddressCode,
          name: contact.contactAddressName,
          id: this.generateNewId()
        };

        this.savedAddressesList = [fallbackAddress];
        this.refSavedAddressesList = [fallbackAddress];
        this.selectedAddressDetails = fallbackAddress;
      } else {
        this.selectedAddress = null;
      }

      // Add related fallback (manual case)
      const fallbackContact = this.appTransactionsForViewDto?.appTransactionContacts.find(c => c?.contactRole === fallbackRole);
      if (fallbackContact?.contactAddressDetail?.countryCode) {
        const fallback = {
          ...fallbackContact.contactAddressDetail,
          code: fallbackContact.contactAddressCode,
          name: fallbackContact.contactAddressName,
          id: this.generateNewId()
        };

        this.savedAddressesList.push(fallback);
        this.refSavedAddressesList.push(fallback);
      }
    }
  }

  getAddressTypes() {
    const subs = this._AppEntitiesServiceProxy
      .getAllAddressTypeForTableDropdown()
      .subscribe((result) => {
        this.AddressTypesList = result;
      });
    this.subscriptions.push(subs)
  }
  // get countries
  getCountries() {
    const subs = this._AppEntitiesServiceProxy.getAllCountryForTableDropdown().subscribe(result => {
      this.countries = result;
    });
    this.subscriptions.push(subs)
  }
  discardAddressForm() {
    this.openAddNewAddForm = false;
    this.addressIdForEdit = null;
    this.addressCode = '';
    this.name = '';
    this.address1 = '';
    this.address2 = '';
    this.city = '';
    this.state = '';
    this.postalCode = '';
    this.selectedCountry = '';
    this.address.accountId = null;
  }
  openAddAddressForm() {
    this.openAddNewAddForm = true;
  }
  deleteAddress(addressId: number) {
    Swal.fire({
      title: "",
      text: this.l("Are you sure that you want to delete this address?"),
      icon: "info",
      showCancelButton: true,
      confirmButtonText: this.l("Yes"),
      cancelButtonText: this.l("No"),
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
        const subs = this._accountsServiceProxy.deleteAddress(addressId)
          .subscribe((item) => {
            const index = this.savedAddressesList.findIndex(item => item.id === addressId)
            this.savedAddressesList.splice(index, 1)
            this.notify.success(this.l("DeletedSuccessfully"));
            if (this.savedAddressesList.length == 0) {
              this.openAddAddressForm();
              this.showAddList = false;
              this.selectedAddress = null;
            }
          }, (err: HttpErrorResponse) => {
            this.notify.error(err.message)
          })
        this.subscriptions.push(subs)
      }
    })

  }

  saveAddress(addressForm: NgForm) {
    this.saving = true;
    this.address.code = addressForm.value.addressCode;
    this.address.name = addressForm.value.name;
    this.address.addressLine1 = addressForm.value.address1;
    this.address.addressLine2 = addressForm.value.address2;
    this.address.city = addressForm.value.cityAddress;
    this.address.state = addressForm.value.State;
    this.address.postalCode = addressForm.value.postalCode;
    this.address.countryId = addressForm.value.AddressCountry;
    this.address.accountId = this.contactId;
    this.address.tenantId = this.appSession.tenantId;
    this.addressIdForEdit ? this.address.id = this.addressIdForEdit : null;
    let addNew = this.addressIdForEdit == null || this.addressIdForEdit == undefined || this.addressIdForEdit == 0

    const subs = this._accountsServiceProxy.createOrEditAddress(this.address)
      .pipe(finalize(() => { this.saving = false; }))
      .subscribe((value) => {

        this.notify.info(this.l('SavedSuccessfully'));
        addressForm.resetForm();
        this.discardAddressForm();
        if (addNew) {
          this.savedAddressesList.push(value);
          this.showAddList = true;
        }
        else {
          const index = this.savedAddressesList.findIndex(item => item.id === value.id);
          this.savedAddressesList[index] = value;
          this.addressIdForEdit = null;
        }
      });
    this.subscriptions.push(subs)
  }
  generateNewId(): number {
    return Date.now(); // Generates a unique ID based on the current timestamp
  }
  savetempAddress(addressForm: NgForm) {
    this.saving = true;
    // Assign address fields from the form
    this.address.id = this.generateNewId();
    this.address.code = addressForm.value.addressCode;
    this.address.name = addressForm.value.name;
    this.address.addressLine1 = addressForm.value.address1;
    this.address.addressLine2 = addressForm.value.address2;
    this.address.city = addressForm.value.cityAddress;
    this.address.state = addressForm.value.State;
    this.address.postalCode = addressForm.value.postalCode;
    this.address.countryId = addressForm.value.AddressCountry;
    this.address.addressCode = addressForm.value.addressCode;
    this.address.countryName = addressForm.value.AddressCountry;
    this.addressIdForEdit ? this.address.id = this.addressIdForEdit : null;
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

  }




  editAddress(addressId) {
    this.openAddAddressForm();
    this.addressIdForEdit = addressId;
    const currentAddress = this.savedAddressesList.filter(item => item.id === this.addressIdForEdit);
    this.addressCode = currentAddress[0].code;
    this.name = currentAddress[0].name;
    this.address1 = currentAddress[0].addressLine1;
    this.address2 = currentAddress[0].addressLine2;
    this.city = currentAddress[0].city;
    this.state = currentAddress[0].state;
    this.postalCode = currentAddress[0].postalCode;
    this.selectedCountry = currentAddress[0].countryId;
    this.address.accountId = currentAddress[0].contactId;
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
      accountId: this.selectedAddress?.accountId,
      contactAddressId: this.selectedAddress?.contactAddressId,
      useDTOTenant: this.selectedAddress?.useDTOTenant,
      id: this.selectedAddress?.id
    });

    // Find the address based on the given addId
    const currentAddress = this.savedAddressesList.filter(item => item.id === addId);
    this.selectedAddress = currentAddress[0] as ContactAppAddressDto;

    // Set the country name based on the countryId

    this.selectedAddress.countryName = this.countries.filter(item => item.value === currentAddress[0]['countryId'])[0]?.label;
    this.selectedAddress.countryCode = this.countries.filter(item => item.value === currentAddress[0]['countryId'])[0]?.code;
    this.showAddList = false;

    // Ensure no undefined or null values, default them to empty strings or null
    this.selectedAddress.id = this.selectedAddress.id
    this.selectedAddress.addressLine1 = this.selectedAddress?.addressLine1;
    this.selectedAddress.addressLine2 = this.selectedAddress?.addressLine2;
    this.selectedAddress.city = this.selectedAddress?.city;
    this.selectedAddress.state = this.selectedAddress?.state;
    this.selectedAddress.countryName = this.selectedAddress?.countryName;
    this.selectedAddress.countryCode = this.selectedAddress?.countryCode;
    this.selectedAddress.postalCode = this.selectedAddress?.postalCode;
    this.selectedAddress.countryId = this.selectedAddress?.countryId;
    this.selectedAddress.code = this.selectedAddress?.code;
    this.selectedAddress.state = this.selectedAddress?.state;
    this.selectedAddress.name = this.selectedAddress?.name;

    // Check if Buyer SSN is empty or null before adding address data
    if (this.appTransactionsForViewDto?.buyerCompanySSIN == '' || this.appTransactionsForViewDto?.buyerCompanySSIN == null) {
      if (this.currentTab == TransactionCartoccordionTabs.ShippingInfo && this.shipInfoIndex == 2) {
        this.addAddressDataToDto(2);
      } else if (this.currentTab == TransactionCartoccordionTabs.BillingInfo && this.billingIndexInfo == 1) {
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
      id: this.selectedAddress?.id || this.generateNewId(),
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
      text: this.l("Are you sure that you want to delete this address?"),
      icon: "info",
      showCancelButton: true,
      confirmButtonText: this.l("Yes"),
      cancelButtonText: this.l("No"),
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
        const index = this.savedAddressesList.findIndex(item => item.id === addressId)
        this.savedAddressesList.splice(index, 1)
        this.notify.success(this.l("DeletedSuccessfully"));
        if (this.savedAddressesList.length == 0) {
          this.openAddAddressForm();
          this.showAddList = false;
          this.selectedAddress = null;
        }
      }
    })
  }
  // showAddressList() {
  //   this.showAddList = true;
  // }
showAddressList(): void {
    const role = this.getCurrentRole();

    if (!role) {
        console.warn('Cannot load addresses: role is missing', {
            currentTab: this.currentTab,
            shipInfoIndex: this.shipInfoIndex,
            billingIndexInfo: this.billingIndexInfo
        });

        return;
    }

    const transactionContact =
        this.appTransactionsForViewDto
            ?.appTransactionContacts
            ?.find(
                contact =>
                    contact?.contactRole === role
            );

    const validCompanySsin =
        (
            this.companySsin ||
            transactionContact?.companySSIN
        )
            ?.trim();

    const validBranchSsin =
        this.branchSsin ||
        transactionContact?.branchSSIN ||
        transactionContact?.branchSsin ||
        null;

    console.log('Change address clicked:', {
        inputCompanySsin: this.companySsin,
        transactionCompanySsin:
            transactionContact?.companySSIN,
        resolvedCompanySsin:
            validCompanySsin,
        resolvedBranchSsin:
            validBranchSsin,
        role
    });

 
    if (validCompanySsin) {
        this.loadCompanyAddresses(
            validCompanySsin,
            validBranchSsin
        );

        return;
    }

    
    this.restoreSelectedAddressIndex();
    this.openAddNewAddForm = false;
    this.showAddList = true;
}

private loadCompanyAddresses(
    companySsin: string,
    branchSsin?: string | null
): void {
    const role = this.getCurrentRole();

    if (!role) {
        console.warn('Address role could not be resolved', {
            currentTab: this.currentTab,
            shipInfoIndex: this.shipInfoIndex,
            billingIndexInfo: this.billingIndexInfo
        });

        return;
    }

    this.loadingAddresses = true;
    this.showMainSpinner();

    const subscription =
        this._AppTransactionServiceProxy
            .getCompanyAddresses(
                companySsin,
                null
            )
            .pipe(
                finalize(() => {
                    this.loadingAddresses = false;
                    this.hideMainSpinner();
                })
            )
            .subscribe({
                next: result => {
                  
                    this.savedAddressesList =
                        this.removeDuplicateAddresses(
                            result || []
                        );

                    this.refSavedAddressesList = [
                        ...this.savedAddressesList
                    ];

                
                    const selectedFound =
                        this.restoreSelectedAddressIndex();

                    if (selectedFound) {
                        this.showAddressOptions();
                        return;
                    }

                    this.loadDefaultAddress(
                        companySsin,
                        branchSsin || undefined,
                        role
                    );
                },

                error: error => {
                    console.error(
                        'Failed to load company addresses',
                        error
                    );

                    this.savedAddressesList = [];
                    this.refSavedAddressesList = [];
                    this.selectedAddressIndex = null;

                    this.showAddressOptions();
                }
            });

    this.subscriptions.push(subscription);
}

private loadDefaultAddress(
    companySsin: string,
    branchSsin: string | undefined,
    role: ContactRoleEnum
): void {
    const subscription =
        this._AppTransactionServiceProxy
            .getCompanyDefaultAddresses(
                companySsin,
                branchSsin
            )
            .subscribe({
                next: defaults => {
                    if (!defaults?.length) {
                        this.selectedAddressIndex = null;
                        this.showAddressOptions();
                        return;
                    }

                    const expectedType =
                        role === ContactRoleEnum.ShipFromContact ||
                        role === ContactRoleEnum.ShipToContact
                            ? 'Shipping'
                            : 'Billing';

                    const defaultAddress =
                        defaults.find(
                            item =>
                                item.addressType
                                    ?.trim()
                                    .toLowerCase() ===
                                expectedType.toLowerCase()
                        );

                    if (!defaultAddress) {
                        this.selectedAddressIndex = null;
                        this.showAddressOptions();
                        return;
                    }

                    const index =
                        this.savedAddressesList.findIndex(
                            address =>
                                address.id ===
                                defaultAddress.addressId
                        );

                    if (index < 0) {
                        this.selectedAddressIndex = null;
                        this.showAddressOptions();
                        return;
                    }

                    this.setSelectedAddressFromList(
                        index,
                        false
                    );

                    this.showAddressOptions();
                },

                error: error => {
                    console.error(
                        'Failed to load default address',
                        error
                    );

                    this.selectedAddressIndex = null;
                    this.showAddressOptions();
                }
            });

    this.subscriptions.push(subscription);
}

private restoreSelectedAddressIndex(): boolean {
    const currentSelected =
        this.selectedAddressDetails ||
        this.selectedAddress;

    if (!currentSelected) {
        this.selectedAddressIndex = null;
        return false;
    }

    const selectedId =
        currentSelected?.id ||
        currentSelected?.contactAddressId;

    let index = -1;

    if (selectedId) {
        index =
            this.savedAddressesList.findIndex(
                address =>
                    address.id === selectedId ||
                    address.contactAddressId === selectedId
            );
    }


    if (index < 0) {
        const selectedKey =
            this.getAddressKey(currentSelected);

        index =
            this.savedAddressesList.findIndex(
                address =>
                    this.getAddressKey(address) ===
                    selectedKey
            );
    }

    if (index < 0) {
        this.selectedAddressIndex = null;
        return false;
    }

    this.setSelectedAddressFromList(
        index,
        false
    );

    return true;
}

private setSelectedAddressFromList(
    index: number,
    emitChange: boolean
): void {
    const address =
        this.savedAddressesList?.[index];

    if (!address) {
        return;
    }

    const country =
        this.countries?.find(
            item =>
                item.value === address.countryId
        );

    const selected =
        new ContactAppAddressDto({
            code: address?.code,
            name: address?.name,

            countryName:
                country?.label ||
                address?.countryName ||
                '',

            addressLine1:
                address?.addressLine1 || '',

            addressLine2:
                address?.addressLine2 || '',

            city:
                address?.city || '',

            state:
                address?.state || '',

            postalCode:
                address?.postalCode || '',

            countryId:
                address?.countryId || 0,

            countryCode:
                country?.code ||
                address?.countryCode ||
                '',

            countryIdName:
                address?.countryIdName || '',

            contactEmail:
                address?.contactEmail,

            contactPhone:
                address?.contactPhone,

            tenantId:
                address?.tenantId,

            accountId:
                address?.accountId,

            contactAddressId:
                address?.contactAddressId ||
                address?.id,

            useDTOTenant:
                address?.useDTOTenant,

            id:
                address?.id
        });

    this.selectedAddressIndex = index;
    this.selectedAddress = selected;
    this.selectedAddressDetails = selected;
    this.selectedAddressText =
        this.getAddressText(selected);

    if (emitChange) {
        this.updateSelectedAddress.emit({
            id: selected.id,
            code: selected.code,
            selectedAddressObj: selected
        });
    }
}

selectAddressByIndex(
    index: number
): void {
    const address =
        this.savedAddressesList?.[index];

    if (!address) {
        return;
    }

    this.setSelectedAddressFromList(
        index,
        true
    );

    this.showAddList = false;
}

private removeDuplicateAddresses(
    addresses: any[]
): any[] {
    const addressMap =
        new Map<string, any>();

    for (const address of addresses || []) {
        const key =
            address?.id
                ? `id:${address.id}`
                : this.getAddressKey(address);

        if (!addressMap.has(key)) {
            addressMap.set(key, {
                ...address
            });
        }
    }

    return Array.from(
        addressMap.values()
    );
}

private getAddressKey(
    address: any
): string {
    return [
        address?.code,
        address?.addressLine1,
        address?.addressLine2,
        address?.city,
        address?.state,
        address?.countryCode,
        address?.postalCode
    ]
        .map(value =>
            String(value || '')
                .trim()
                .toLowerCase()
        )
        .join('|');
}

private showAddressOptions(): void {
    this.openAddNewAddForm = false;
    this.showAddList = true;
}
  ngOnInit(): void {
    this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
    this.currentLang == 'ar' || this.currentLang == 'ar-EG' ? this.isArabic = true : this.isArabic = false
    this.savedAddressesList = [];
    // if (this.selectedAddressDetails) {
    //   this.showAddList = false;
    //   this.openAddNewAddForm = false;
    //   this.selectedAddress = this.selectedAddressDetails;
    // }
    if (this.selectedAddressDetails) {
      this.showAddList = false;
      this.openAddNewAddForm = false;
      this.selectedAddress = this.selectedAddressDetails;
      this.selectedAddressText = this.getAddressText(this.selectedAddressDetails);
    }
  }
  selectAddressType() {
    this.updateSelectedAddress.emit({ id: this.selectedAddress.id, code: this.selectedAddress.code, typeId: this.addType });

  }

  getAddressText(address: any): string {
    if (!address) {
      return '';
    }

    return [
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.countryName || address.countryCode,
      address.postalCode
    ]
      .filter(x => x !== null && x !== undefined && x !== '')
      .join(' , ');
  }
  // selectAddressByIndex(index: number): void {
  //   const currentAddress = this.savedAddressesList?.[index];
  //   if (!currentAddress) {
  //     return;
  //   }

  //   this.selectedAddressIndex = index;


  //   const country = this.countries?.find(item => item.value === currentAddress.countryId);

  //   const updatedContactAddressDto = new ContactAppAddressDto({
  //     code: currentAddress?.code,
  //     name: currentAddress?.name,
  //     countryName: country?.label || currentAddress?.countryName || '',
  //     addressLine1: currentAddress?.addressLine1 || '',
  //     addressLine2: currentAddress?.addressLine2 || '',
  //     city: currentAddress?.city || '',
  //     state: currentAddress?.state || '',
  //     postalCode: currentAddress?.postalCode || '',
  //     countryId: currentAddress?.countryId || 0,
  //     countryCode: country?.code || currentAddress?.countryCode || '',
  //     countryIdName: currentAddress?.countryIdName || '',
  //     contactEmail: currentAddress?.contactEmail,
  //     contactPhone: currentAddress?.contactPhone,
  //     tenantId: currentAddress?.tenantId,
  //     accountId: currentAddress?.accountId,
  //     contactAddressId: currentAddress?.contactAddressId,
  //     useDTOTenant: currentAddress?.useDTOTenant,
  //     id: currentAddress?.id || this.generateNewId()
  //   });

  //   this.selectedAddress = updatedContactAddressDto as any;
  //   this.selectedAddressDetails = updatedContactAddressDto;
  //   this.selectedAddressText = this.getAddressText(updatedContactAddressDto);

  //   this.showAddList = false;

  //   if (
  //     this.appTransactionsForViewDto?.buyerCompanySSIN === '' ||
  //     this.appTransactionsForViewDto?.buyerCompanySSIN === null
  //   ) {
  //     if (
  //       this.currentTab === TransactionCartoccordionTabs.ShippingInfo &&
  //       this.shipInfoIndex === 2
  //     ) {
  //       this.addAddressDataToDto(2);
  //     } else if (
  //       this.currentTab === TransactionCartoccordionTabs.BillingInfo &&
  //       this.billingIndexInfo === 1
  //     ) {
  //       this.addAddressDataToDto(1);
  //     }
  //   }

  //   this.updateSelectedAddress.emit({
  //     id: updatedContactAddressDto.id,
  //     code: currentAddress?.code,
  //     selectedAddressObj: updatedContactAddressDto
  //   });
  // }
  ngOnDestroy() {
    this.unsubscribeToAllSubscriptions();

  }
}
