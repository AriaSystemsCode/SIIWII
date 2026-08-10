import {
  Component,
  EventEmitter,
  Injector,
  Output
} from '@angular/core';

import {
  forkJoin
} from 'rxjs';

import {
  finalize
} from 'rxjs/operators';

import {
  AccountsServiceProxy,
  AppEntitiesServiceProxy,
  BranchDto,
  LookupLabelDto,
  AppContactAddressDto,
  AppAddressDto
} from '@shared/service-proxies/service-proxies';

import {
  AppComponentBase
} from '@shared/common/app-component-base';

import {
  EntityBasicInfoField,
  EntityMode,
  GenericEntityEditor,
  GenericEntityNode
} from '@app/shared/entity-shell/models/generic-entity.model';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

type BranchAddressUiCode =
  | 'BILLING'
  | 'SHIPPING'
  | 'DISTRIBUTION'
  | 'MAILING';


interface BranchAddressSection {

  code:
    BranchAddressUiCode;

  label:
    string;

  addressTypeId:
    number | null;

  addressTypeCode:
    string;

  selectedAddress:
    any | null;

  selectorOpen:
    boolean;

  showNewAddressForm:
    boolean;

  searchText:
    string;

  newAddress:
    any;
}


@Component({
  selector: 'app-branch-generic',
  templateUrl: './branch-generic.component.html',
  styleUrls: ['./branch-generic.component.scss']
})
export class BranchGenericComponent
  extends AppComponentBase
  implements GenericEntityEditor {

  /* =====================================================
   * GENERIC ENTITY
   * ===================================================== */

  node:
    GenericEntityNode;

  mode:
    EntityMode = 'view';

  entity:
    BranchDto =
      new BranchDto();

  entityData:
    any = {
      branch:
        this.entity
    };

  loading =
    false;

  saving =
    false;

  showMedia =
    false;


  /* =====================================================
   * OUTPUTS
   * ===================================================== */

  @Output()
  entityChange =
    new EventEmitter<any>();

  @Output()
  saved =
    new EventEmitter<any>();

  @Output()
  cancelled =
    new EventEmitter<void>();


  /* =====================================================
   * LOOKUPS
   * ===================================================== */

  allPhoneTypes:
    LookupLabelDto[] = [];

  allLanguages:
    LookupLabelDto[] = [];

  allCurrencies:
    LookupLabelDto[] = [];

  allCountries:
    LookupLabelDto[] = [];

  private lookupsLoaded =
    false;

  private lookupsLoading =
    false;


  /* =====================================================
   * ADDRESS DATA
   * ===================================================== */

  accountAddresses:
    any[] = [];

  addressSections:
    BranchAddressSection[] = [];

  loadingAddresses =
    false;

  savingAddress =
    false;


  /* =====================================================
   * BACKUP
   * ===================================================== */

  private branchBackup:
    BranchDto | null =
      null;

  private addressSectionsBackup:
    BranchAddressSection[] =
      [];


  /* =====================================================
   * BASIC INFO
   * ===================================================== */

  basicInfoFields:
    EntityBasicInfoField[] = [

      {
        key: 'status',
        label: 'Status',
        type: 'dropdown',
        valuePath: 'branch.status',

        options: [
          {
            label: 'Active',
            value: true
          },
          {
            label: 'Inactive',
            value: false
          }
        ],

        optionLabel: 'label',
        optionValue: 'value',

        editableInCreate: true,
        editableInEdit: true
      },

      {
        key: 'name',
        label: 'Name',
        type: 'text',
        valuePath: 'branch.name',

        editableInCreate: true,
        editableInEdit: true
      },

      {
        key: 'code',
        label: 'Code',
        type: 'text',
        valuePath: 'branch.code',

        editableInCreate: true,
        editableInEdit: false
      },

      {
        key: 'ssin',
        label: 'SSIN',
        type: 'text',
        valuePath: 'branch.ssin',

        readonly: true
      }

    ];


    private addressTypesLoaded = false;
private addressTypesLoading = false;

private billingAddressTypeId:
  number | null = null;

private shippingAddressTypeId:
  number | null = null;

private distributionAddressTypeId:
  number | null = null;

private mailingAddressTypeId:
  number | null = null;

  constructor(
    injector: Injector,

    private _accountsService:
      AccountsServiceProxy,

    private _appEntitiesService:
      AppEntitiesServiceProxy
  ) {
    super(injector);
  }


  /* =====================================================
   * ADDRESS TYPE CONFIG
   * ===================================================== */

get addressTypes(): Array<{
  code: BranchAddressUiCode;
  label: string;
  addressTypeId: number | null;
  addressTypeCode: string;
}> {

  return [

    {
      code:
        'BILLING',

      label:
        'BillingAddress',

      addressTypeCode:
        'BILLING',

      addressTypeId:
        this.billingAddressTypeId
    },

    {
      code:
        'SHIPPING',

      label:
        'ShippingAddress',

      addressTypeCode:
        'DIRECT-SHIPPING',

      addressTypeId:
        this.shippingAddressTypeId
    },

    {
      code:
        'DISTRIBUTION',

      label:
        'DistributionAddress',

      addressTypeCode:
        'DISTRIBUTION-CENTER',

      addressTypeId:
        this.distributionAddressTypeId
    },

    {
      code:
        'MAILING',

      label:
        'MailingAddress',

      addressTypeCode:
        'MAILING',

      addressTypeId:
        this.mailingAddressTypeId
    }

  ];
}

private resolveAddressTypeId(
  addressTypeCode: string,
  contextValue: any
): number | null {

  /*
   * 1. First try context.
   */
  const contextId =
    this.toValidId(
      contextValue
    );

  if (contextId) {
    return contextId;
  }


  /*
   * 2. Try existing branch relations.
   *
   * Example:
   * {
   *   addressTypeId: 822,
   *   addressTypeCode: 'BILLING'
   * }
   */
  const existingRelation =
    (this.entity?.contactAddresses ?? [])
      .find(
        address =>
          String(
            (address as any)
              ?.addressTypeCode ??
            ''
          )
            .trim()
            .toUpperCase() ===
          addressTypeCode
            .trim()
            .toUpperCase()
      );


  const existingId =
    this.toValidId(
      existingRelation
        ?.addressTypeId
    );


  if (existingId) {
    return existingId;
  }


  return null;
}


  /* =====================================================
   * LOAD ENTITY
   * ===================================================== */
private loadAddressTypes(
  callback?: () => void
): void {

  if (this.addressTypesLoaded) {
    callback?.();
    return;
  }

  if (this.addressTypesLoading) {
    return;
  }

  this.addressTypesLoading = true;

  this._appEntitiesService
    .getAllEntitiesByTypeCode('ADDRESS-TYPE')
    .pipe(
      finalize(() => {
        this.addressTypesLoading = false;
      })
    )
    .subscribe({

      next: (result: any) => {

        const records =
          Array.isArray(result)
            ? result
            : result?.items ?? [];

        records.forEach((item: any) => {

          const code =
            String(item?.code ?? '')
              .trim()
              .toUpperCase();

          /*
           * Depending on the returned DTO,
           * the entity ID may be id or value.
           */
          const typeId =
            this.toValidId(item?.id) ??
            this.toValidId(item?.value);

          switch (code) {

            case 'BILLING':

              this.billingAddressTypeId =
                typeId;

              break;


            case 'DIRECT-SHIPPING':

              this.shippingAddressTypeId =
                typeId;

              break;


            case 'DISTRIBUTION-CENTER':

              this.distributionAddressTypeId =
                typeId;

              break;


            case 'MAILING':

              this.mailingAddressTypeId =
                typeId;

              break;
          }
        });


        this.addressTypesLoaded = true;


        console.log(
          'ADDRESS TYPE IDS:',
          {
            billing:
              this.billingAddressTypeId,

            shipping:
              this.shippingAddressTypeId,

            distribution:
              this.distributionAddressTypeId,

            mailing:
              this.mailingAddressTypeId
          }
        );


        callback?.();
      },


      error: error => {

        console.error(
          'Failed to load ADDRESS-TYPE:',
          error
        );

        this.notify.error(
          this.l('FailedToLoadAddressTypes')
        );
      }

    });
}
  loadEntity(): void {

  this.loadLookups();

  /*
   * Load ADDRESS-TYPE first.
   *
   * initializeAddressSections() must run only
   * after these IDs are available.
   */
  this.loadAddressTypes(() => {

    const branchId =
      Number(
        this.node?.id
      );

    if (!branchId) {

      this.initializeCreateMode();

      return;
    }

    this.loadBranch(
      branchId
    );
  });
}


  private loadBranch(
    branchId:
      number
  ):
    void {

    if (
      !branchId ||
      this.loading
    ) {
      return;
    }

    this.loading =
      true;

    this._accountsService
      .getBranchForEdit(
        branchId
      )
      .pipe(
        finalize(() => {
          this.loading =
            false;
        })
      )
      .subscribe({

        next:
          result => {

            const rawBranch =
              (result as any)?.branch ??
              (result as any)?.accountInfo ??
              result;

            this.entity =
              rawBranch instanceof BranchDto

                ? rawBranch

                : BranchDto.fromJS(
                    rawBranch ?? {}
                  );

            this.entity.contactAddresses ??=
              [];

            this.entityData = {
              branch:
                this.entity
            };

            this.initializeAddressSections();

            this.loadAccountAddresses();
          },

        error:
          error => {

            console.error(
              'GetBranchForEdit failed:',
              error
            );

            this.notify.error(
              this.l(
                'FailedToLoadBranch'
              )
            );
          }

      });
  }


  /* =====================================================
   * CREATE MODE
   * ===================================================== */

  private initializeCreateMode():
    void {

    this.entity =
      new BranchDto();

    this.entity.id =
      undefined;

    this.entity.accountId =
      this.toOptionalNumber(
        this.node?.context
          ?.accountId
      );

    this.entity.parentId =
      this.toOptionalNumber(
        this.node?.parentId
      );

    this.entity.tenantId =
      this.toOptionalNumber(
        this.node?.context
          ?.tenantId
      );

    this.entity.contactAddresses =
      [];

    this.entityData = {
      branch:
        this.entity
    };

    this.mode =
      'create';

    this.initializeAddressSections();

    this.loadAccountAddresses();
  }


  /* =====================================================
   * LOOKUPS
   * ===================================================== */

  private loadLookups():
    void {

    if (
      this.lookupsLoaded ||
      this.lookupsLoading
    ) {
      return;
    }

    this.lookupsLoading =
      true;

    forkJoin({

      phoneTypes:
        this._appEntitiesService
          .getAllPhoneTypeForTableDropdown(),

      languages:
        this._appEntitiesService
          .getAllLanguageForTableDropdown(),

      currencies:
        this._appEntitiesService
          .getAllCurrencyForTableDropdown(),

      countries:
        this._appEntitiesService
          .getAllCountryForTableDropdown()

    })
      .pipe(
        finalize(() => {
          this.lookupsLoading =
            false;
        })
      )
      .subscribe({

        next:
          result => {

            this.allPhoneTypes =
              this.normalizeLookupResult(
                result.phoneTypes
              );

            this.allLanguages =
              this.normalizeLookupResult(
                result.languages
              );

            this.allCurrencies =
              this.normalizeLookupResult(
                result.currencies
              );

            this.allCountries =
              this.normalizeLookupResult(
                result.countries
              );

            this.lookupsLoaded =
              true;
          },

        error:
          error => {

            console.error(
              'Failed to load branch lookups:',
              error
            );
          }

      });
  }


  private normalizeLookupResult(
    result:
      any
  ):
    LookupLabelDto[] {

    if (
      Array.isArray(result)
    ) {
      return result;
    }

    if (
      Array.isArray(
        result?.items
      )
    ) {
      return result.items;
    }

    if (
      Array.isArray(
        result?.result
      )
    ) {
      return result.result;
    }

    return [];
  }


  /* =====================================================
   * INITIALIZE ADDRESS SECTIONS
   * ===================================================== */

 private initializeAddressSections(): void {

  const assignedAddresses =
    Array.isArray(
      this.entity?.contactAddresses
    )
      ? this.entity.contactAddresses
      : [];


  this.addressSections =
    this.addressTypes.map(type => {

      const selected =
        assignedAddresses.find(
          address => {

            const addressCode =
              String(
                (address as any)
                  ?.addressTypeCode ??
                ''
              )
                .trim()
                .toUpperCase();


            const sameCode =
              addressCode ===
              type.addressTypeCode
                .toUpperCase();


            const sameId =
              !!type.addressTypeId &&
              Number(
                address
                  ?.addressTypeId
              ) ===
              Number(
                type.addressTypeId
              );


            return (
              sameCode ||
              sameId
            );
          }
        );


      const addressTypeId =
        this.toValidId(
          selected?.addressTypeId
        ) ??
        type.addressTypeId;


      return {

        code:
          type.code,

        label:
          type.label,

        addressTypeCode:
          type.addressTypeCode,

        addressTypeId,

        selectedAddress:
          selected
            ? this.convertContactAddressToSelectableAddress(
                selected
              )
            : null,

        selectorOpen:
          false,

        showNewAddressForm:
          false,

        searchText:
          '',

        newAddress:
          this.createEmptyAddress()
      };
    });


  console.log(
    'ADDRESS SECTIONS:',
    this.addressSections
  );
}

  /* =====================================================
   * CONTACT ADDRESS -> SELECTABLE ADDRESS
   * ===================================================== */

  private convertContactAddressToSelectableAddress(
    relation:
      any
  ):
    any {

    if (!relation) {
      return null;
    }

    const addressFk =
      relation?.addressFk;

    return {

      /*
       * Account reusable address ID.
       */
      id:
        relation?.addressId ??
        addressFk?.id,

      /*
       * Existing AppContactAddressDto relation ID.
       */
      contactAddressId:
        relation?.id,

      contactId:
        relation?.contactId,

      accountId:
        relation?.accountId,

      addressTypeId:
        relation?.addressTypeId,

      addressTypeIdName:
        relation?.addressTypeIdName,

      addressTypeCode:
        (relation as any)
          ?.addressTypeCode,

      contactCode:
        (relation as any)
          ?.contactCode,

      addressCode:
        (relation as any)
          ?.addressCode,

      code:
        relation?.code ??
        addressFk?.code ??
        (relation as any)
          ?.addressCode,

      name:
        relation?.name ??
        addressFk?.name,

      addressLine1:
        relation?.addressLine1 ??
        addressFk?.addressLine1,

      addressLine2:
        relation?.addressLine2 ??
        addressFk?.addressLine2,

      city:
        relation?.city ??
        addressFk?.city,

      state:
        relation?.state ??
        addressFk?.state,

      postalCode:
        relation?.postalCode ??
        addressFk?.postalCode,

      countryId:
        (
          relation?.countryId &&
          Number(
            relation.countryId
          ) > 0
        )
          ? relation.countryId
          : addressFk?.countryId,

      countryCode:
        addressFk?.countryCode,

      countryIdName:
        relation?.countryIdName ??
        addressFk?.countryIdName,

      tenantId:
        addressFk?.tenantId ??
        this.entity?.tenantId

    };
  }


  /* =====================================================
   * LOAD ALL ACCOUNT ADDRESSES
   * ===================================================== */

  private loadAccountAddresses():
    void {

    const accountId =
      this.getAccountId();

    if (
      !accountId ||
      this.loadingAddresses
    ) {
      return;
    }

    this.loadingAddresses =
      true;

    this._accountsService
      .getAllAccountAddresses(
        accountId
      )
      .pipe(
        finalize(() => {
          this.loadingAddresses =
            false;
        })
      )
      .subscribe({

        next:
          result => {

            const addresses =
              Array.isArray(
                result
              )

                ? result

                : (
                    (result as any)
                      ?.items ??
                    (result as any)
                      ?.result ??
                    []
                  );

            this.accountAddresses =
              Array.isArray(
                addresses
              )
                ? addresses
                : [];

            /*
             * GetBranchForEdit may return only
             * addressId + relation info.
             *
             * Fill the visible address data from
             * GetAllAccountAddresses.
             */
            this.hydrateSelectedAddresses();
          },

        error:
          error => {

            console.error(
              'GetAllAccountAddresses failed:',
              error
            );

            this.accountAddresses =
              [];
          }

      });
  }


  /* =====================================================
   * HYDRATE ASSIGNED ADDRESSES
   * ===================================================== */

  private hydrateSelectedAddresses():
    void {

    this.addressSections
      .forEach(
        section => {

          if (
            !section.selectedAddress
          ) {
            return;
          }

          const addressId =
            Number(
              section
                .selectedAddress
                .id
            );

          const accountAddress =
            this.accountAddresses
              .find(
                address =>
                  Number(
                    address?.id
                  ) ===
                  addressId
              );

          if (!accountAddress) {
            return;
          }

          const old =
            section.selectedAddress;

          section.selectedAddress = {

            ...this.clonePlainObject(
              accountAddress
            ),

            contactAddressId:
              old.contactAddressId,

            contactId:
              old.contactId,

            addressTypeId:
              section.addressTypeId ??
              old.addressTypeId,

            addressTypeCode:
              section.addressTypeCode,

            contactCode:
              old.contactCode ??
              this.entity?.code,

            addressCode:
              accountAddress.code

          };
        }
      );
  }


  /* =====================================================
   * OPEN ADDRESS SELECTOR
   * ===================================================== */

  openAddressSelector(
    selectedSection:
      BranchAddressSection
  ):
    void {

    if (
      this.isViewMode
    ) {
      return;
    }

    this.addressSections
      .forEach(
        section => {

          if (
            section !==
            selectedSection
          ) {

            section.selectorOpen =
              false;

            section.showNewAddressForm =
              false;

            section.searchText =
              '';
          }
        }
      );

    selectedSection.selectorOpen =
      true;

    selectedSection.showNewAddressForm =
      false;

    selectedSection.searchText =
      '';

    if (
      !this.accountAddresses
        .length
    ) {
      this.loadAccountAddresses();
    }
  }


  closeAddressSelector(
    section:
      BranchAddressSection
  ):
    void {

    section.selectorOpen =
      false;

    section.showNewAddressForm =
      false;

    section.searchText =
      '';

    section.newAddress =
      this.createEmptyAddress();
  }


  /* =====================================================
   * FILTER
   * ===================================================== */

  getFilteredAddresses(
    section:
      BranchAddressSection
  ):
    any[] {

    const searchText =
      String(
        section.searchText ??
        ''
      )
        .trim()
        .toLowerCase();

    if (!searchText) {
      return this.accountAddresses;
    }

    return this.accountAddresses
      .filter(
        address => {

          const text =
            [
              address?.code,
              address?.name,
              address?.addressLine1,
              address?.addressLine2,
              address?.city,
              address?.state,
              address?.postalCode,
              address?.countryCode,
              address?.countryIdName
            ]
              .filter(
                value =>
                  this.hasValue(
                    value
                  )
              )
              .join(' ')
              .toLowerCase();

          return text.includes(
            searchText
          );
        }
      );
  }


  /* =====================================================
   * SELECT EXISTING ADDRESS
   * ===================================================== */

  selectAddress(
    section:
      BranchAddressSection,

    address:
      any
  ):
    void {

    if (!address) {
      return;
    }

    const previous =
      section.selectedAddress;

    const sameAddress =
      Number(
        previous?.id
      ) ===
      Number(
        address?.id
      );

    section.selectedAddress = {

      ...this.clonePlainObject(
        address
      ),

      /*
       * Keep relation id only when user
       * keeps the same existing address.
       */
      contactAddressId:
        sameAddress
          ? previous
              ?.contactAddressId
          : undefined,

      contactId:
        this.entity?.id,

      addressTypeId:
        section.addressTypeId,

      addressTypeCode:
        section.addressTypeCode,

      contactCode:
        this.entity?.code,

      addressCode:
        address?.code
    };

    section.selectorOpen =
      false;

    section.showNewAddressForm =
      false;

    section.searchText =
      '';
  }


  clearSelectedAddress(
    section:
      BranchAddressSection
  ):
    void {

    section.selectedAddress =
      null;

    section.selectorOpen =
      false;

    section.showNewAddressForm =
      false;
  }


  /* =====================================================
   * ADD NEW ADDRESS
   * ===================================================== */

  showAddAddressForm(
    section:
      BranchAddressSection
  ):
    void {

    section.selectorOpen =
      true;

    section.showNewAddressForm =
      true;

    section.newAddress =
      this.createEmptyAddress();
  }


  cancelNewAddress(
    section:
      BranchAddressSection
  ):
    void {

    section.showNewAddressForm =
      false;

    section.newAddress =
      this.createEmptyAddress();
  }


  /* =====================================================
   * EDIT ACCOUNT ADDRESS
   * ===================================================== */

  editAddress(
    section:
      BranchAddressSection,

    address:
      any,

    event:
      MouseEvent
  ):
    void {

    event.preventDefault();

    event.stopPropagation();

    section.selectorOpen =
      true;

    section.showNewAddressForm =
      true;

    section.newAddress =
      this.clonePlainObject(
        address
      );
  }


  /* =====================================================
   * REMOVE FROM DISPLAYED LIST
   * ===================================================== */


  

removeAddressFromList(
  section: BranchAddressSection,
  address: any,
  event: MouseEvent
): void {

  event.preventDefault();
  event.stopPropagation();

  const addressId =
    Number(address?.id);

  if (!addressId) {
    return;
  }

  Swal.fire({
    title: '',
    text:
      'Are you sure that you want to delete this address?',
    icon: 'info',

    showCancelButton: true,

    confirmButtonText: 'Yes',
    cancelButtonText: 'No',

    allowOutsideClick: false,
    allowEscapeKey: false,

    backdrop: true,

    customClass: {
      popup: 'popup-class',
      icon: 'icon-class',
      htmlContainer: 'content-class',
      actions: 'actions-class',
      confirmButton: 'confirm-button-class2'
    }

  }).then(result => {

    if (!result.isConfirmed) {
      return;
    }

    this._accountsService
      .deleteAddress(addressId)
      .subscribe({

        next: () => {

          /*
           * Only remove the deleted account
           * address from the selectable list.
           */
          this.accountAddresses =
            this.accountAddresses.filter(
              item =>
                Number(item?.id) !==
                addressId
            );

          this.notify.success(
            this.l('DeletedSuccessfully')
          );

          /*
           * If there are no reusable addresses
           * anymore, show the Add New Address form.
           */
          if (
            this.accountAddresses.length === 0
          ) {

            section.selectorOpen =
              true;

            section.showNewAddressForm =
              true;

            section.newAddress =
              this.createEmptyAddress();
          }
        },

        error: (
          err: HttpErrorResponse
        ) => {

          this.notify.error(
            err?.error?.error?.message ??
            err?.error?.message ??
            err?.message
          );
        }

      });

  });
}


  

  /* =====================================================
   * CREATE EMPTY ADDRESS
   * ===================================================== */

  private createEmptyAddress():
    any {

    return {

      id:
        undefined,

      code:
        '',

      name:
        '',

      addressLine1:
        '',

      addressLine2:
        '',

      city:
        '',

      state:
        '',

      postalCode:
        '',

      countryId:
        undefined,

      countryCode:
        undefined,

      countryIdName:
        undefined,

      tenantId:
        this.entity?.tenantId ??
        this.node?.context
          ?.tenantId,

      accountId:
        this.getAccountId(),

      useDTOTenant:
        false

    };
  }


  /* =====================================================
   * ADDRESS VALIDATION
   * ===================================================== */

  isNewAddressValid(
    address:
      any
  ):
    boolean {

    return !!(

      String(
        address?.code ??
        ''
      ).trim()

      &&

      String(
        address?.name ??
        ''
      ).trim()

      &&

      String(
        address?.addressLine1 ??
        ''
      ).trim()

      &&

      String(
        address?.city ??
        ''
      ).trim()

      &&

      String(
        address?.state ??
        ''
      ).trim()

      &&

      String(
        address?.postalCode ??
        ''
      ).trim()

      &&

      this.toValidId(
        address?.countryId
      )

    );
  }


  /* =====================================================
   * CREATE / EDIT AppAddressDto
   * ===================================================== */

  saveNewAddress(
    section:
      BranchAddressSection
  ):
    void {

    if (
      this.savingAddress ||
      !this.isNewAddressValid(
        section.newAddress
      )
    ) {
      return;
    }

    const input =
      new AppAddressDto();

    /*
     * Preserve id during edit.
     */
    if (
      this.toValidId(
        section.newAddress
          ?.id
      )
    ) {
      input.id =
        Number(
          section.newAddress.id
        );
    }

    input.code =
      String(
        section.newAddress
          ?.code ??
        ''
      ).trim();

    input.tenantId =
      this.entity?.tenantId ??
      this.toOptionalNumber(
        this.node?.context
          ?.tenantId
      );

    input.accountId =
      this.getAccountId();

    input.name =
      String(
        section.newAddress
          ?.name ??
        ''
      ).trim();

    input.addressLine1 =
      String(
        section.newAddress
          ?.addressLine1 ??
        ''
      ).trim();

    input.addressLine2 =
      section.newAddress
        ?.addressLine2;

    input.city =
      String(
        section.newAddress
          ?.city ??
        ''
      ).trim();

    input.state =
      String(
        section.newAddress
          ?.state ??
        ''
      ).trim();

    input.postalCode =
      String(
        section.newAddress
          ?.postalCode ??
        ''
      ).trim();

    input.countryId =
      Number(
        section.newAddress
          ?.countryId
      );

    const country =
      this.allCountries.find(
        item =>
          Number(
            item.value
          ) ===
          Number(
            input.countryId
          )
      );

    input.countryIdName =
      country?.label ??
      section.newAddress
        ?.countryIdName;

    input.countryCode =
      (country as any)
        ?.code ??
      section.newAddress
        ?.countryCode;

    input.useDTOTenant =
      false;

    this.savingAddress =
      true;

    this._accountsService
      .createOrEditAddress(
        input
      )
      .pipe(
        finalize(() => {
          this.savingAddress =
            false;
        })
      )
      .subscribe({

   next: result => {

  const savedAddress =
    result instanceof AppAddressDto
      ? result.toJSON()
      : (
          result ?? {}
        );

  const index =
    this.accountAddresses
      .findIndex(
        address =>
          Number(address?.id) ===
          Number(savedAddress?.id)
      );

  if (index >= 0) {

    /*
     * Edit existing address in list.
     */
    this.accountAddresses[
      index
    ] = {
      ...savedAddress
    };

    this.accountAddresses = [
      ...this.accountAddresses
    ];

  } else {

    /*
     * Add newly created address
     * to displayed list.
     */
    this.accountAddresses = [
      {
        ...savedAddress
      },
      ...this.accountAddresses
    ];
  }


  /*
   * IMPORTANT:
   * Do NOT select the address automatically.
   */
  // this.selectAddress(
  //   section,
  //   savedAddress
  // );


  /*
   * Hide Add/Edit form only.
   */
  section.showNewAddressForm =
    false;


  /*
   * Keep address selector/list open.
   */
  section.selectorOpen =
    true;


  /*
   * Clear search so the new address
   * is visible immediately.
   */
  section.searchText =
    '';


  /*
   * Reset form for next Add.
   */
  section.newAddress =
    this.createEmptyAddress();


  this.notify.success(
    this.l(
      'SavedSuccessfully'
    )
  );
},

        error:
          error => {

            console.error(
              'CreateOrEditAddress failed:',
              error
            );

            this.notify.error(
              this.l(
                'SaveFailed'
              )
            );
          }

      });
  }


  /* =====================================================
   * EDIT BRANCH
   * ===================================================== */

  editEntity():
    void {

    this.branchBackup =
      this.cloneBranch(
        this.entity
      );

    this.addressSectionsBackup =
      this.clonePlainObject(
        this.addressSections
      );

    this.mode =
      'edit';
  }


  /* =====================================================
   * CANCEL
   * ===================================================== */

  cancelEntity():
    void {

    if (
      this.branchBackup
    ) {

      this.entity =
        this.cloneBranch(
          this.branchBackup
        );

      this.entityData = {
        branch:
          this.entity
      };
    }

    this.addressSections =
      this.clonePlainObject(
        this.addressSectionsBackup
      );

    this.closeAllAddressSelectors();

    this.mode =
      'view';

    this.cancelled.emit();
  }


  private closeAllAddressSelectors():
    void {

    this.addressSections
      .forEach(
        section => {

          section.selectorOpen =
            false;

          section.showNewAddressForm =
            false;

          section.searchText =
            '';
        }
      );
  }


  /* =====================================================
   * BUILD AppContactAddressDto[]
   * ===================================================== */

  private syncSelectedAddressesBeforeSave():
    boolean {

    const contactAddresses:
      AppContactAddressDto[] =
        [];

    for (
      const section of
      this.addressSections
    ) {

      if (
        !section.selectedAddress
      ) {
        continue;
      }

      const selected =
        section.selectedAddress;

      const addressTypeId =
        this.toValidId(
          section.addressTypeId
        );

      const addressId =
        this.toValidId(
          selected?.id
        );

      if (
        !addressTypeId
      ) {

        console.error(
          'Missing addressTypeId',
          {
            section,
            context:
              this.node?.context
          }
        );

        this.notify.error(
          `${section.label}: address type is not configured`
        );

        return false;
      }

      if (
        !addressId
      ) {

        console.error(
          'Invalid selected address:',
          selected
        );

        this.notify.error(
          this.l(
            'InvalidAddress'
          )
        );

        return false;
      }


      /* ===============================================
       * AppContactAddressDto
       * =============================================== */

      const relation =
        new AppContactAddressDto();


      /*
       * Match your existing working payload.
       */
      relation.accountId =
        0;


      /*
       * Important:
       * contactId is the BRANCH ID.
       */
      relation.contactId =
        Number(
          this.entity.id
        );


      relation.addressTypeId =
        addressTypeId;


      relation.addressId =
        addressId;


      relation.code =
        selected.code;


      relation.name =
        selected.name;


      relation.addressLine1 =
        selected.addressLine1;


      relation.addressLine2 =
        selected.addressLine2;


      relation.city =
        selected.city;


      relation.state =
        selected.state;


      relation.postalCode =
        selected.postalCode;


      relation.countryId =
        Number(
          selected.countryId
        ) || 0;


      relation.countryIdName =
        selected.countryIdName;


      /*
       * Preserve relation ID only if
       * this was already assigned.
       */
      const existingRelationId =
        this.toValidId(
          selected
            ?.contactAddressId
        );


      if (
        existingRelationId
      ) {
        relation.id =
          existingRelationId;
      }


      /*
       * Generated class accepts extra
       * properties through its indexer.
       */
      (relation as any)
        .addressTypeCode =
          section.addressTypeCode;


      (relation as any)
        .contactCode =
          this.entity.code;


      (relation as any)
        .addressCode =
          selected.code;


      /* ===============================================
       * AppAddressDto
       * =============================================== */

      const addressFk =
        new AppAddressDto();


      addressFk.id =
        addressId;


      addressFk.code =
        selected.code;


      addressFk.name =
        selected.name;


      addressFk.addressLine1 =
        selected.addressLine1;


      addressFk.addressLine2 =
        selected.addressLine2;


      addressFk.city =
        selected.city;


      addressFk.state =
        selected.state;


      addressFk.postalCode =
        selected.postalCode;


      addressFk.countryId =
        Number(
          selected.countryId
        ) || 0;


      addressFk.countryCode =
        selected.countryCode;


      addressFk.countryIdName =
        selected.countryIdName;


      addressFk.tenantId =
        this.entity.tenantId;


      addressFk.accountId =
        this.entity.accountId;


      addressFk.useDTOTenant =
        false;


      relation.addressFk =
        addressFk;


      contactAddresses.push(
        relation
      );
    }


    this.entity.contactAddresses =
      contactAddresses;


    return true;
  }


  /* =====================================================
   * SAVE BRANCH
   * ===================================================== */

 saveEntity(): void {

  if (this.saving || !this.entity) {
    return;
  }

  if (!this.syncSelectedAddressesBeforeSave()) {
    return;
  }

  const source: any = this.entity;

  const branch = new BranchDto();

  // =========================
  // Basic branch information
  // =========================

  branch.id = source.id;

  branch.code = source.code;
  branch.name = source.name;
  branch.tradeName = source.tradeName;

  branch.parentId = source.parentId;

  branch.website = source.website;
  branch.eMailAddress = source.eMailAddress;

  // =========================
  // Phone 1
  // =========================

  branch.phone1CountryKey =
    source.phone1CountryKey;

  branch.phone1Number =
    source.phone1Number;

  branch.phone1Ext =
    source.phone1Ext;

  branch.phone1TypeId =
    source.phone1TypeId;

  branch.phone1TypeName =
    source.phone1TypeName;

  // =========================
  // Phone 2
  // =========================

  branch.phone2CountryKey =
    source.phone2CountryKey;

  branch.phone2Number =
    source.phone2Number;

  branch.phone2Ext =
    source.phone2Ext;

  branch.phone2TypeId =
    source.phone2TypeId;

  branch.phone2TypeName =
    source.phone2TypeName;

  // =========================
  // Phone 3
  // =========================

  branch.phone3CountryKey =
    source.phone3CountryKey;

  branch.phone3Number =
    source.phone3Number;

  branch.phone3Ext =
    source.phone3Ext;

  branch.phone3TypeId =
    source.phone3TypeId;

  branch.phone3TypeName =
    source.phone3TypeName;

  // =========================
  // Currency / Language
  // =========================

  branch.currencyId =
    source.currencyId;

  branch.currencyName =
    source.currencyName;

  branch.languageId =
    source.languageId;

  branch.languageName =
    source.languageName;

  // =========================
  // Account information
  // =========================

  branch.accountId =
    source.accountId;

  branch.ssin =
    source.ssin;

  branch.tenantId =
    source.tenantId;

  branch.useDTOTenant =
    source.useDTOTenant;

  branch.parentCode =
    source.parentCode;

  branch.tenantOwner =
    source.tenantOwner;

  branch.attachmentSourceTenantId =
    source.attachmentSourceTenantId;

  // =========================
  // Addresses
  // IMPORTANT:
  // must be AppContactAddressDto
  // =========================

  branch.contactAddresses =
    (source.contactAddresses || [])
      .map((address: any) => {

        const contactAddress =
          new AppContactAddressDto();

        contactAddress.accountId =
          address.accountId ?? 0;

        contactAddress.contactId =
          address.contactId ??
          source.id;

        contactAddress.addressTypeId =
          Number(address.addressTypeId);

        contactAddress.addressTypeIdName =
          address.addressTypeIdName;

        contactAddress.addressId =
          Number(address.addressId);

        contactAddress.code =
          address.code;

        contactAddress.name =
          address.name;

        contactAddress.addressLine1 =
          address.addressLine1;

        contactAddress.addressLine2 =
          address.addressLine2;

        contactAddress.city =
          address.city;

        contactAddress.state =
          address.state;

        contactAddress.postalCode =
          address.postalCode;

        contactAddress.countryId =
          Number(address.countryId) || 0;

        contactAddress.countryIdName =
          address.countryIdName;

        contactAddress.id =
          address.id;

        // Extra BE properties
        (contactAddress as any).addressTypeCode =
          address.addressTypeCode;

        (contactAddress as any).contactCode =
          address.contactCode ??
          source.code;

        (contactAddress as any).addressCode =
          address.addressCode ??
          address.code;

        // =========================
        // Address FK
        // =========================

        const addressSource =
          address.addressFk ??
          address;

        const addressFk =
          new AppAddressDto();

        addressFk.id =
          Number(
            addressSource.id ??
            address.addressId
          );

        addressFk.code =
          addressSource.code ??
          address.code;

        addressFk.name =
          addressSource.name ??
          address.name;

        addressFk.addressLine1 =
          addressSource.addressLine1 ??
          address.addressLine1;

        addressFk.addressLine2 =
          addressSource.addressLine2 ??
          address.addressLine2;

        addressFk.city =
          addressSource.city ??
          address.city;

        addressFk.state =
          addressSource.state ??
          address.state;

        addressFk.postalCode =
          addressSource.postalCode ??
          address.postalCode;

        addressFk.countryId =
          Number(
            addressSource.countryId ??
            address.countryId
          ) || 0;

        addressFk.countryCode =
          addressSource.countryCode;

        addressFk.countryIdName =
          addressSource.countryIdName;

        addressFk.tenantId =
          addressSource.tenantId ??
          source.tenantId;

        addressFk.accountId =
          addressSource.accountId ??
          source.accountId;

        addressFk.useDTOTenant =
          addressSource.useDTOTenant ??
          false;

        contactAddress.addressFk =
          addressFk;

        return contactAddress;
      });

  // =========================
  // DEBUG THE ACTUAL JSON
  // =========================

  console.log(
    'BRANCH BEFORE API:',
    branch
  );

  console.log(
    'BRANCH JSON:',
    branch.toJSON()
  );

  console.log(
    'FINAL JSON.stringify:',
    JSON.stringify(branch)
  );

  // =========================
  // SAVE
  // =========================

  this.saving = true;

  this._accountsService
    .createOrEditBranch(branch)
    .pipe(
      finalize(() => {
        this.saving = false;
      })
    )
    .subscribe({

      next: result => {

        this.mode = 'view';

        this.notify.success(
          this.l('SavedSuccessfully')
        );

        this.saved.emit(result);

        this.loadEntity();
      },

      error: error => {

        console.error(
          'CreateOrEditBranch failed:',
          error
        );

        this.notify.error(
          this.l('SaveFailed')
        );
      }

    });
}

  /* =====================================================
   * ENTITY CHANGE
   * ===================================================== */

  onEntityDataChanged(
    changedData:
      any
  ):
    void {

    if (
      !changedData
    ) {
      return;
    }


    const changedBranch =
      changedData?.branch ??
      changedData;


    this.entity =
      changedBranch instanceof
        BranchDto

        ? changedBranch

        : BranchDto.fromJS(
            changedBranch ??
            {}
          );


    this.entityData = {
      branch:
        this.entity
    };


    this.entityChange.emit(
      this.entityData
    );
  }


  /* =====================================================
   * FORMAT ADDRESS
   * ===================================================== */

  formatAddress(
    address:
      any
  ):
    string {

    if (
      !address
    ) {
      return '';
    }


    return [

      address.name,
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.postalCode,
      address.countryCode ??
        address.countryIdName

    ]
      .filter(
        value =>
          this.hasValue(
            value
          )
      )
      .map(
        value =>
          String(
            value
          ).trim()
      )
      .join(' - ');
  }


  /* =====================================================
   * TRACK BY
   * ===================================================== */

  trackByAddressId(
    index:
      number,

    address:
      any
  ):
    number | string {

    return (
      address?.id ??
      index
    );
  }


  trackByAddressSection(
    index:
      number,

    section:
      BranchAddressSection
  ):
    string {

    return (
      section?.code ??
      String(index)
    );
  }


  /* =====================================================
   * GETTERS
   * ===================================================== */

  get isViewMode():
    boolean {

    return (
      this.mode ===
      'view'
    );
  }


  /* =====================================================
   * HELPERS
   * ===================================================== */

  private getAccountId():
    number | undefined {

    return this.toOptionalNumber(

      this.entity?.accountId ??

      this.node?.context
        ?.accountId

    );
  }


  private cloneBranch(
    branch:
      BranchDto
  ):
    BranchDto {

    if (
      !branch
    ) {
      return new BranchDto();
    }


    return BranchDto.fromJS(
      branch.toJSON()
    );
  }


  private clonePlainObject<T>(
    value:
      T
  ):
    T {

    if (
      value === null ||
      value === undefined
    ) {
      return value;
    }


    return JSON.parse(
      JSON.stringify(
        value
      )
    );
  }


  private hasValue(
    value:
      any
  ):
    boolean {

    if (
      value === null ||
      value === undefined
    ) {
      return false;
    }


    if (
      typeof value ===
        'string'
    ) {
      return !!value.trim();
    }


    return true;
  }


  private toOptionalNumber(
    value:
      any
  ):
    number | undefined {

    const numberValue =
      Number(
        value
      );


    return (
      Number.isFinite(
        numberValue
      ) &&
      numberValue > 0
    )

      ? numberValue

      : undefined;
  }


  private toValidId(
    value:
      any
  ):
    number | null {

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return null;
    }


    const numberValue =
      Number(
        value
      );


    if (
      !Number.isFinite(
        numberValue
      ) ||
      numberValue <= 0
    ) {
      return null;
    }


    return numberValue;
  }
}