import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Injector, Output } from '@angular/core';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { AppComponentBase } from '@shared/common/app-component-base';
import {
  AccountsServiceProxy,
  AppAddressDto,
  AppContactAddressDto,
  AppEntitiesServiceProxy,
  BranchDto,
  LookupLabelDto
} from '@shared/service-proxies/service-proxies';
import {
  EntityBasicInfoField,
  EntityMode,
  GenericEntityEditor,
  GenericEntityNode
} from '@app/shared/entity-shell/models/generic-entity.model';

type BranchAddressUiCode = 'BILLING' | 'SHIPPING' | 'DISTRIBUTION' | 'MAILING';

interface BranchAddressSection {
  code: BranchAddressUiCode;
  label: string;
  addressTypeId: number | null;
  addressTypeCode: string;
  selectedAddress: any | null;
  selectorOpen: boolean;
  showNewAddressForm: boolean;
  searchText: string;
  newAddress: any;
}

/** The four address types. addressTypeCode is the code of the ADDRESS-TYPE entity. */
const ADDRESS_TYPES: Array<{ code: BranchAddressUiCode; label: string; addressTypeCode: string }> = [
  { code: 'BILLING', label: 'BillingAddress', addressTypeCode: 'BILLING' },
  { code: 'SHIPPING', label: 'ShippingAddress', addressTypeCode: 'DIRECT-SHIPPING' },
  { code: 'DISTRIBUTION', label: 'DistributionAddress', addressTypeCode: 'DISTRIBUTION-CENTER' },
  { code: 'MAILING', label: 'MailingAddress', addressTypeCode: 'MAILING' }
];

/** Fields of the new-address form that must not be empty. */
const REQUIRED_ADDRESS_FIELDS = ['code', 'name', 'addressLine1', 'city', 'state', 'postalCode'];

/** Branch fields copied to the DTO that is sent to the server. */
const BRANCH_FIELDS = [
  'id', 'code', 'name', 'tradeName', 'parentId', 'website', 'eMailAddress',
  'phone1CountryKey', 'phone1Number', 'phone1Ext', 'phone1TypeId', 'phone1TypeName',
  'phone2CountryKey', 'phone2Number', 'phone2Ext', 'phone2TypeId', 'phone2TypeName',
  'phone3CountryKey', 'phone3Number', 'phone3Ext', 'phone3TypeId', 'phone3TypeName',
  'currencyId', 'currencyName', 'languageId', 'languageName',
  'accountId', 'ssin', 'tenantId', 'useDTOTenant', 'parentCode', 'tenantOwner',
  'attachmentSourceTenantId'
];

@Component({
  selector: 'app-branch-generic',
  templateUrl: './branch-generic.component.html',
  styleUrls: ['./branch-generic.component.scss']
})
export class BranchGenericComponent extends AppComponentBase implements GenericEntityEditor {

  // ---------- Used by the shell ----------
  node: GenericEntityNode;
  mode: EntityMode = 'view';
  entity: BranchDto = new BranchDto();
  entityData: any = { branch: this.entity };
  loading = false;
  saving = false;
  showMedia = false;

  @Output() entityChange = new EventEmitter<any>();
  @Output() saved = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  basicInfoFields: EntityBasicInfoField[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'dropdown',
      valuePath: 'branch.status',
      options: [
        { label: 'Active', value: true },
        { label: 'Inactive', value: false }
      ],
      optionLabel: 'label',
      optionValue: 'value',
      editableInCreate: true,
      editableInEdit: true
    },
    { key: 'name', label: 'Name', type: 'text', valuePath: 'branch.name', editableInCreate: true, editableInEdit: true },
    { key: 'code', label: 'Code', type: 'text', valuePath: 'branch.code', editableInCreate: true, editableInEdit: false },
    { key: 'ssin', label: 'SSIN', type: 'text', valuePath: 'branch.ssin', readonly: true }
  ];

  // ---------- Used by the template ----------
  readonly phoneFields = [1, 2, 3].map(n => ({
    label: `Phone${n}`,
    type: `phone${n}TypeId`,
    number: `phone${n}Number`,
    ext: `phone${n}Ext`
  }));

  allPhoneTypes: LookupLabelDto[] = [];
  allLanguages: LookupLabelDto[] = [];
  allCurrencies: LookupLabelDto[] = [];
  allCountries: LookupLabelDto[] = [];

  accountAddresses: any[] = [];
  addressSections: BranchAddressSection[] = [];
  loadingAddresses = false;
  savingAddress = false;

  // ---------- Private ----------
  private lookupsLoaded = false;
  private lookupsLoading = false;
  private addressTypesLoaded = false;
  private addressTypesLoading = false;
  private addressTypeIds: Record<string, number | null> = {};

  private branchBackup: BranchDto | null = null;
  private addressSectionsBackup: BranchAddressSection[] = [];

  constructor(
    injector: Injector,
    private _accountsService: AccountsServiceProxy,
    private _appEntitiesService: AppEntitiesServiceProxy
  ) {
    super(injector);
  }

  get isViewMode(): boolean {
    return this.mode === 'view';
  }

  // ================= Load =================

  loadEntity(): void {
    this.loadLookups();

    // Address sections need the address type ids, so they load first.
    this.loadAddressTypes(() => {
      const branchId = Number(this.node?.id);
      if (branchId) {
        this.loadBranch(branchId);
      } else {
        this.initializeCreateMode();
      }
    });
  }

  private loadBranch(branchId: number): void {
    if (this.loading) {
      return;
    }

    this.loading = true;

    this._accountsService.getBranchForEdit(branchId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (result: any) => {
          const raw = result?.branch ?? result?.accountInfo ?? result;
          this.entity = raw instanceof BranchDto ? raw : BranchDto.fromJS(raw ?? {});
          this.entity.contactAddresses ??= [];
          this.entityData = { branch: this.entity };

          this.initializeAddressSections();
          this.loadAccountAddresses();
        },
        error: error => {
          console.error('GetBranchForEdit failed:', error);
          this.notify.error(this.l('FailedToLoadBranch'));
        }
      });
  }

  private initializeCreateMode(): void {
    const context = this.node?.context;

    this.entity = new BranchDto();
    this.entity.id = undefined;
    this.entity.accountId = this.toOptionalNumber(context?.accountId);
    this.entity.parentId = this.toOptionalNumber(this.node?.parentId);
    this.entity.tenantId = this.toOptionalNumber(context?.tenantId);
    this.entity.contactAddresses = [];
    this.entityData = { branch: this.entity };

    this.mode = 'create';
    this.initializeAddressSections();
    this.loadAccountAddresses();
  }

  private loadAddressTypes(callback: () => void): void {
    if (this.addressTypesLoaded) {
      callback();
      return;
    }
    if (this.addressTypesLoading) {
      return;
    }

    this.addressTypesLoading = true;

    this._appEntitiesService.getAllEntitiesByTypeCode('ADDRESS-TYPE')
      .pipe(finalize(() => (this.addressTypesLoading = false)))
      .subscribe({
        next: result => {
          this.toArray(result).forEach((item: any) => {
            const code = String(item?.code ?? '').trim().toUpperCase();
            if (ADDRESS_TYPES.some(type => type.addressTypeCode === code)) {
              // Depending on the DTO, the entity id is `id` or `value`.
              this.addressTypeIds[code] = this.toValidId(item?.id) ?? this.toValidId(item?.value);
            }
          });

          this.addressTypesLoaded = true;
          callback();
        },
        error: error => {
          console.error('Failed to load ADDRESS-TYPE:', error);
          this.notify.error(this.l('FailedToLoadAddressTypes'));
        }
      });
  }

  private loadLookups(): void {
    if (this.lookupsLoaded || this.lookupsLoading) {
      return;
    }

    this.lookupsLoading = true;

    forkJoin({
      phoneTypes: this._appEntitiesService.getAllPhoneTypeForTableDropdown(),
      languages: this._appEntitiesService.getAllLanguageForTableDropdown(),
      currencies: this._appEntitiesService.getAllCurrencyForTableDropdown(),
      countries: this._appEntitiesService.getAllCountryForTableDropdown()
    })
      .pipe(finalize(() => (this.lookupsLoading = false)))
      .subscribe({
        next: result => {
          this.allPhoneTypes = this.toArray(result.phoneTypes);
          this.allLanguages = this.toArray(result.languages);
          this.allCurrencies = this.toArray(result.currencies);
          this.allCountries = this.toArray(result.countries);
          this.lookupsLoaded = true;
        },
        error: error => console.error('Failed to load branch lookups:', error)
      });
  }

  private loadAccountAddresses(): void {
    const accountId = this.getAccountId();
    if (!accountId || this.loadingAddresses) {
      return;
    }

    this.loadingAddresses = true;

    this._accountsService.getAllAccountAddresses(accountId)
      .pipe(finalize(() => (this.loadingAddresses = false)))
      .subscribe({
        next: result => {
          this.accountAddresses = this.toArray(result);
          // GetBranchForEdit may return only addressId + relation info,
          // so the visible address data is filled from this list.
          this.hydrateSelectedAddresses();
        },
        error: error => {
          console.error('GetAllAccountAddresses failed:', error);
          this.accountAddresses = [];
        }
      });
  }

  // ================= Address sections =================

  private initializeAddressSections(): void {
    const assigned: any[] = Array.isArray(this.entity?.contactAddresses) ? this.entity.contactAddresses : [];

    this.addressSections = ADDRESS_TYPES.map(type => {
      const typeId = this.addressTypeIds[type.addressTypeCode] ?? null;

      const selected = assigned.find(address => {
        const sameCode = this.upper(address?.addressTypeCode) === type.addressTypeCode.toUpperCase();
        const sameId = !!typeId && Number(address?.addressTypeId) === Number(typeId);
        return sameCode || sameId;
      });

      return {
        code: type.code,
        label: type.label,
        addressTypeCode: type.addressTypeCode,
        addressTypeId: this.toValidId(selected?.addressTypeId) ?? typeId,
        selectedAddress: selected ? this.toSelectableAddress(selected) : null,
        selectorOpen: false,
        showNewAddressForm: false,
        searchText: '',
        newAddress: this.createEmptyAddress()
      };
    });
  }

  /** Converts a saved branch address relation into the shape used by the picker. */
  private toSelectableAddress(relation: any): any {
    if (!relation) {
      return null;
    }

    const fk = relation.addressFk;

    return {
      id: relation.addressId ?? fk?.id,                // reusable account address id
      contactAddressId: relation.id,                   // relation id
      contactId: relation.contactId,
      accountId: relation.accountId,
      addressTypeId: relation.addressTypeId,
      addressTypeIdName: relation.addressTypeIdName,
      addressTypeCode: relation.addressTypeCode,
      contactCode: relation.contactCode,
      addressCode: relation.addressCode,
      code: relation.code ?? fk?.code ?? relation.addressCode,
      name: relation.name ?? fk?.name,
      addressLine1: relation.addressLine1 ?? fk?.addressLine1,
      addressLine2: relation.addressLine2 ?? fk?.addressLine2,
      city: relation.city ?? fk?.city,
      state: relation.state ?? fk?.state,
      postalCode: relation.postalCode ?? fk?.postalCode,
      countryId: Number(relation.countryId) > 0 ? relation.countryId : fk?.countryId,
      countryCode: fk?.countryCode,
      countryIdName: relation.countryIdName ?? fk?.countryIdName,
      tenantId: fk?.tenantId ?? this.entity?.tenantId
    };
  }

  private hydrateSelectedAddresses(): void {
    this.addressSections.forEach(section => {
      const old = section.selectedAddress;
      if (!old) {
        return;
      }

      const accountAddress = this.accountAddresses.find(a => Number(a?.id) === Number(old.id));
      if (!accountAddress) {
        return;
      }

      section.selectedAddress = {
        ...this.clone(accountAddress),
        contactAddressId: old.contactAddressId,
        contactId: old.contactId,
        addressTypeId: section.addressTypeId ?? old.addressTypeId,
        addressTypeCode: section.addressTypeCode,
        contactCode: old.contactCode ?? this.entity?.code,
        addressCode: accountAddress.code
      };
    });
  }

  // ================= Address picker =================

  openAddressSelector(selected: BranchAddressSection): void {
    if (this.isViewMode) {
      return;
    }

    this.addressSections
      .filter(section => section !== selected)
      .forEach(section => this.closeSection(section));

    selected.selectorOpen = true;
    selected.showNewAddressForm = false;
    selected.searchText = '';

    if (!this.accountAddresses.length) {
      this.loadAccountAddresses();
    }
  }

  closeAddressSelector(section: BranchAddressSection): void {
    this.closeSection(section);
    section.newAddress = this.createEmptyAddress();
  }

  private closeSection(section: BranchAddressSection): void {
    section.selectorOpen = false;
    section.showNewAddressForm = false;
    section.searchText = '';
  }

  getFilteredAddresses(section: BranchAddressSection): any[] {
    const search = String(section.searchText ?? '').trim().toLowerCase();
    if (!search) {
      return this.accountAddresses;
    }

    return this.accountAddresses.filter(address =>
      [
        address?.code, address?.name, address?.addressLine1, address?.addressLine2,
        address?.city, address?.state, address?.postalCode,
        address?.countryCode, address?.countryIdName
      ]
        .filter(value => this.hasValue(value))
        .join(' ')
        .toLowerCase()
        .includes(search)
    );
  }

  selectAddress(section: BranchAddressSection, address: any): void {
    if (!address) {
      return;
    }

    const previous = section.selectedAddress;
    const sameAddress = Number(previous?.id) === Number(address.id);

    section.selectedAddress = {
      ...this.clone(address),
      // Keep the relation id only when the same address stays selected.
      contactAddressId: sameAddress ? previous?.contactAddressId : undefined,
      contactId: this.entity?.id,
      addressTypeId: section.addressTypeId,
      addressTypeCode: section.addressTypeCode,
      contactCode: this.entity?.code,
      addressCode: address.code
    };

    this.closeSection(section);
  }

  clearSelectedAddress(section: BranchAddressSection): void {
    section.selectedAddress = null;
    section.selectorOpen = false;
    section.showNewAddressForm = false;
  }

  // ================= Add / edit / delete account address =================

  showAddAddressForm(section: BranchAddressSection): void {
    section.selectorOpen = true;
    section.showNewAddressForm = true;
    section.newAddress = this.createEmptyAddress();
  }

  cancelNewAddress(section: BranchAddressSection): void {
    section.showNewAddressForm = false;
    section.newAddress = this.createEmptyAddress();
  }

  editAddress(section: BranchAddressSection, address: any, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    section.selectorOpen = true;
    section.showNewAddressForm = true;
    section.newAddress = this.clone(address);
  }

  removeAddressFromList(section: BranchAddressSection, address: any, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const addressId = Number(address?.id);
    if (!addressId) {
      return;
    }

    Swal.fire({
      title: '',
      text: 'Are you sure that you want to delete this address?',
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

      this._accountsService.deleteAddress(addressId).subscribe({
        next: () => {
          this.accountAddresses = this.accountAddresses.filter(item => Number(item?.id) !== addressId);
          this.notify.success(this.l('DeletedSuccessfully'));

          // Nothing left to pick, so open the "add new address" form.
          if (!this.accountAddresses.length) {
            this.showAddAddressForm(section);
          }
        },
        error: (err: HttpErrorResponse) =>
          this.notify.error(err?.error?.error?.message ?? err?.error?.message ?? err?.message)
      });
    });
  }

  isNewAddressValid(address: any): boolean {
    return REQUIRED_ADDRESS_FIELDS.every(field => !!String(address?.[field] ?? '').trim()) &&
      !!this.toValidId(address?.countryId);
  }

  saveNewAddress(section: BranchAddressSection): void {
    if (this.savingAddress || !this.isNewAddressValid(section.newAddress)) {
      return;
    }

    const form = section.newAddress;
    const trimmed = (value: any) => String(value ?? '').trim();
    const country = this.allCountries.find(item => Number(item.value) === Number(form.countryId));

    const input = new AppAddressDto();
    if (this.toValidId(form.id)) {
      input.id = Number(form.id);                      // keep the id when editing
    }
    input.code = trimmed(form.code);
    input.tenantId = this.entity?.tenantId ?? this.toOptionalNumber(this.node?.context?.tenantId);
    input.accountId = this.getAccountId();
    input.name = trimmed(form.name);
    input.addressLine1 = trimmed(form.addressLine1);
    input.addressLine2 = form.addressLine2;
    input.city = trimmed(form.city);
    input.state = trimmed(form.state);
    input.postalCode = trimmed(form.postalCode);
    input.countryId = Number(form.countryId);
    input.countryIdName = country?.label ?? form.countryIdName;
    input.countryCode = (country as any)?.code ?? form.countryCode;
    input.useDTOTenant = false;

    this.savingAddress = true;

    this._accountsService.createOrEditAddress(input)
      .pipe(finalize(() => (this.savingAddress = false)))
      .subscribe({
        next: result => {
          const savedAddress = result instanceof AppAddressDto ? result.toJSON() : (result ?? {});
          const index = this.accountAddresses.findIndex(a => Number(a?.id) === Number(savedAddress?.id));

          this.accountAddresses = index >= 0
            ? this.accountAddresses.map((a, i) => (i === index ? { ...savedAddress } : a))
            : [{ ...savedAddress }, ...this.accountAddresses];

          // The new address is not selected automatically.
          section.showNewAddressForm = false;
          section.selectorOpen = true;
          section.searchText = '';
          section.newAddress = this.createEmptyAddress();

          this.notify.success(this.l('SavedSuccessfully'));
        },
        error: error => {
          console.error('CreateOrEditAddress failed:', error);
          this.notify.error(this.l('SaveFailed'));
        }
      });
  }

  private createEmptyAddress(): any {
    return {
      id: undefined,
      code: '',
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      countryId: undefined,
      countryCode: undefined,
      countryIdName: undefined,
      tenantId: this.entity?.tenantId ?? this.node?.context?.tenantId,
      accountId: this.getAccountId(),
      useDTOTenant: false
    };
  }

  // ================= Edit / cancel =================

  editEntity(): void {
    this.branchBackup = this.cloneBranch(this.entity);
    this.addressSectionsBackup = this.clone(this.addressSections);
    this.mode = 'edit';
  }

  cancelEntity(): void {
    if (this.branchBackup) {
      this.entity = this.cloneBranch(this.branchBackup);
      this.entityData = { branch: this.entity };
    }

    this.addressSections = this.clone(this.addressSectionsBackup);
    this.addressSections.forEach(section => this.closeSection(section));

    this.mode = 'view';
    this.cancelled.emit();
  }

  // ================= Save =================

  saveEntity(): void {
    if (this.saving || !this.entity) {
      return;
    }
    if (!this.applySelectedAddresses()) {
      return;
    }

    const source: any = this.entity;
    const branch = new BranchDto();

    BRANCH_FIELDS.forEach(field => ((branch as any)[field] = source[field]));
    branch.contactAddresses = source.contactAddresses;

    this.saving = true;

    this._accountsService.createOrEditBranch(branch)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: result => {
          this.mode = 'view';
          this.notify.success(this.l('SavedSuccessfully'));
          this.saved.emit(result);
          this.loadEntity();
        },
        error: error => {
          console.error('CreateOrEditBranch failed:', error);
          this.notify.error(this.l('SaveFailed'));
        }
      });
  }

  /** Builds entity.contactAddresses from the selected address of each section. Returns false when invalid. */
  private applySelectedAddresses(): boolean {
    const contactAddresses: AppContactAddressDto[] = [];

    for (const section of this.addressSections) {
      const selected = section.selectedAddress;
      if (!selected) {
        continue;
      }

      const addressTypeId = this.toValidId(section.addressTypeId);
      const addressId = this.toValidId(selected.id);

      if (!addressTypeId) {
        console.error('Missing addressTypeId', { section, context: this.node?.context });
        this.notify.error(`${section.label}: address type is not configured`);
        return false;
      }
      if (!addressId) {
        console.error('Invalid selected address:', selected);
        this.notify.error(this.l('InvalidAddress'));
        return false;
      }

      const relation = new AppContactAddressDto();
      relation.accountId = 0;
      relation.contactId = Number(this.entity.id);       // contactId is the BRANCH id
      relation.addressTypeId = addressTypeId;
      relation.addressId = addressId;
      this.copyAddressFields(relation, selected);

      // Keep the relation id only when the address was already assigned.
      const relationId = this.toValidId(selected.contactAddressId);
      if (relationId) {
        relation.id = relationId;
      }

      // Extra properties the server expects.
      (relation as any).addressTypeCode = section.addressTypeCode;
      (relation as any).contactCode = this.entity.code;
      (relation as any).addressCode = selected.code;

      const addressFk = new AppAddressDto();
      addressFk.id = addressId;
      this.copyAddressFields(addressFk, selected);
      addressFk.countryCode = selected.countryCode;
      addressFk.tenantId = this.entity.tenantId;
      addressFk.accountId = this.entity.accountId;
      addressFk.useDTOTenant = false;
      relation.addressFk = addressFk;

      contactAddresses.push(relation);
    }

    this.entity.contactAddresses = contactAddresses;
    return true;
  }

  /** Fields shared by AppContactAddressDto and AppAddressDto. */
  private copyAddressFields(target: any, source: any): void {
    target.code = source.code;
    target.name = source.name;
    target.addressLine1 = source.addressLine1;
    target.addressLine2 = source.addressLine2;
    target.city = source.city;
    target.state = source.state;
    target.postalCode = source.postalCode;
    target.countryId = Number(source.countryId) || 0;
    target.countryIdName = source.countryIdName;
  }

  // ================= Other =================

  onEntityDataChanged(changedData: any): void {
    if (!changedData) {
      return;
    }

    const changed = changedData.branch ?? changedData;
    this.entity = changed instanceof BranchDto ? changed : BranchDto.fromJS(changed ?? {});
    this.entityData = { branch: this.entity };
    this.entityChange.emit(this.entityData);
  }

  formatAddress(address: any): string {
    if (!address) {
      return '';
    }

    return [
      address.name, address.addressLine1, address.addressLine2,
      address.city, address.state, address.postalCode,
      address.countryCode ?? address.countryIdName
    ]
      .filter(value => this.hasValue(value))
      .map(value => String(value).trim())
      .join(' - ');
  }

  trackByAddressId(index: number, address: any): number | string {
    return address?.id ?? index;
  }

  trackByAddressSection(index: number, section: BranchAddressSection): string {
    return section?.code ?? String(index);
  }

  // ================= Helpers =================

  private getAccountId(): number | undefined {
    return this.toOptionalNumber(this.entity?.accountId ?? this.node?.context?.accountId);
  }

  /** Lookup and list results can be an array, { items } or { result }. */
  private toArray(result: any): any[] {
    if (Array.isArray(result)) {
      return result;
    }
    if (Array.isArray(result?.items)) {
      return result.items;
    }
    if (Array.isArray(result?.result)) {
      return result.result;
    }
    return [];
  }

  private cloneBranch(branch: BranchDto): BranchDto {
    return branch ? BranchDto.fromJS(branch.toJSON()) : new BranchDto();
  }

  private clone<T>(value: T): T {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  private upper(value: any): string {
    return String(value ?? '').trim().toUpperCase();
  }

  private hasValue(value: any): boolean {
    if (value === null || value === undefined) {
      return false;
    }
    return typeof value === 'string' ? !!value.trim() : true;
  }

  private toValidId(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const id = Number(value);
    return Number.isFinite(id) && id > 0 ? id : null;
  }

  private toOptionalNumber(value: any): number | undefined {
    return this.toValidId(value) ?? undefined;
  }
}