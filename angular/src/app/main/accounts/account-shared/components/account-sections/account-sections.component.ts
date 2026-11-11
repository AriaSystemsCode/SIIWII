import {
  Component,
  Injector,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { SelectCategoriesDynamicModalComponent } from '@app/categories/select-categories-dynamic-modal.component';
import { SelectClassificationDynamicModalComponent } from '@app/classification/select-classification-dynamic-modal.component';
import { ExtraAttributeDataService } from '@app/main/app-items/app-item-shared/services/extra-attribute-data.service';
import { BsModalService, ModalOptions } from '@node_modules/ngx-bootstrap/modal';

import { AppComponentBase } from '@shared/common/app-component-base';
import {
  AccountsServiceProxy,
  AppEntitiesServiceProxy,
  AppEntityCategoryDto,
  AppEntityClassificationDto,
  AppEntityDto,
  AppEntityExtraDataDto,
  ConnectionInfo,
  CurrencyInfoDto,
  GetAppEntityForEditOutput,
  LookupLabelDto,
  SycEntityObjectTypesServiceProxy,
  TreeNodeOfGetSycEntityObjectCategoryForViewDto,
  TreeNodeOfGetSycEntityObjectClassificationForViewDto
} from '@shared/service-proxies/service-proxies';
import { forkJoin, Observable, of } from 'rxjs';
import { finalize, switchMap, tap } from 'rxjs/operators';

type EntityMode = 'create' | 'edit' | 'view';

const PERSONAL_ACCOUNT_TYPE_ID = 21;
const DEFAULT_RELATIONSHIP_TYPE_ID = 747;

@Component({
  selector: 'app-account-sections',
  templateUrl: './account-sections.component.html',
  styleUrls: ['./account-sections.component.scss']
})
export class AccountSectionsComponent extends AppComponentBase implements OnInit, OnChanges {

  // ---------- Inputs ----------
  @Input() accountId: number;
  @Input() entityData: any;
  @Input() mode: EntityMode = 'view';
  @Input() isContact = false;
  @Input() fieldPermissions: Record<string, boolean> = {};
  @Input() sectionPermissions: Record<string, boolean> = {};

  // ---------- Account ----------
  account: any = {};

  readonly phoneFields = [1, 2, 3].map(n => ({
    type: `phone${n}TypeId`,
    number: `phone${n}Number`,
    ext: `phone${n}Ex`
  }));

  allLanguages: LookupLabelDto[] = [];
  allCurrencies: CurrencyInfoDto[] = [];
  allPhoneTypes: LookupLabelDto[] = [];

  // ---------- Business (departments / classifications) ----------
  categoriesIds: number[] = [];
  classificationsIds: number[] = [];

  // ---------- Roles ----------
  roleEntityObjectTypeId: number;
  roleDynamicInputsForViewDto: GetAppEntityForEditOutput | null = null;
  roleExtraAttributeObject: any = null;
  roleAttributes: any[] = [];
  isLoadingRoles = false;

  // ---------- Relationship ----------
  connectionsInfo: ConnectionInfo[] = [];
  selectedRelationId: number | null = null;
  relationshipEntityObjectTypeId: number | null = null;
  relationshipDynamicInputsForViewDto: GetAppEntityForEditOutput;
  allRelationshipAttributes: any[] = [];
  groupedByUsage: Record<string, any[]> = {};
  usageList: string[] = [];
  isLoadingRelationship = false;
  relationshipTouched = false;

  private allShipVia: LookupLabelDto[] = [];
  private allPaymentTerms: LookupLabelDto[] = [];
  private allPriceLevel: any[] = [];

  constructor(
    injector: Injector,
    private _accountsServiceProxy: AccountsServiceProxy,
    private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
    private _extraAttributeDataService: ExtraAttributeDataService,
    private _sycEntityObjectTypesServiceProxy: SycEntityObjectTypesServiceProxy,
    private _bsModalService: BsModalService
  ) {
    super(injector);
  }

  // ================= Lifecycle =================

  ngOnInit(): void {
    this.loadLookups();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const data = changes.entityData?.currentValue;
    if (data?.account) {
      this.setAccountData(data);
    }
  }

  // ================= Getters =================

  get isViewMode(): boolean {
    return this.mode === 'view';
  }

  get isPersonalAccount(): boolean {
    return this.roleEntityObjectTypeId === PERSONAL_ACCOUNT_TYPE_ID;
  }

  get selectedDepartments(): AppEntityCategoryDto[] {
    return this.account?.entityCategories ?? [];
  }

  get selectedClassifications(): AppEntityClassificationDto[] {
    return this.account?.entityClassifications ?? [];
  }

  get canEditAccountData(): boolean {
    if (this.mode === 'view') {
      return false;
    }
    // Contacts and new accounts are always editable.
    if (this.isContact || this.mode === 'create') {
      return true;
    }
    // Existing root account: only manual, not connected ones.
    return this.account?.isManual === true && this.account?.isConnected !== true;
  }

  canEditField(fieldName: string): boolean {
    if (!this.canEditAccountData || fieldName === 'ssin') {
      return false;
    }
    if (fieldName === 'code') {
      return this.mode === 'create';
    }
    return true;
  }

  canEditSection(section: 'basic' | 'business' | 'roles' | 'relationship'): boolean {
    return section === 'relationship'
      ? this.mode === 'edit'
      : this.canEditAccountData;
  }

  trackByValue(index: number, value: string): string {
    return value || index.toString();
  }

  // ================= Load =================

  private loadLookups(): void {
    this._appEntitiesServiceProxy.getAllLanguageForTableDropdown()
      .subscribe(result => (this.allLanguages = result));

    this._appEntitiesServiceProxy.getAllCurrencyForTableDropdown()
      .subscribe(result => (this.allCurrencies = result));

    this._appEntitiesServiceProxy.getAllPhoneTypeForTableDropdown()
      .subscribe(result => (this.allPhoneTypes = result));
  }

  getAccountDataForView(): void {
    if (!this.accountId) {
      return;
    }

    this.showMainSpinner();
    this._accountsServiceProxy.getAccountForView(this.accountId, 5)
      .pipe(finalize(() => this.hideMainSpinner()))
      .subscribe(result => this.setAccountData(result));
  }

  private setAccountData(data: any): void {
    if (!data?.account) {
      this.entityData = null;
      this.account = {};
      this.connectionsInfo = [];
      return;
    }

    this.entityData = data;
    this.account = data.account;
    this.connectionsInfo = data.connectionsInfo ?? [];
    this.roleEntityObjectTypeId = this.account.accountTypeId ?? null;

    this.initializeAccountFields();

    if (this.roleEntityObjectTypeId) {
      this.initializeRolesSection();
    }

    if (this.mode === 'create') {
      this.resetRelationshipData();
    } else {
      this.initializeRelationshipSection();
    }
  }

  private initializeAccountFields(): void {
    const account = this.account;

    account.categories ??= [];
    account.classfications ??= [];
    account.imagesUrls ??= [];
    account.entityAttachments ??= [];

    if (!Array.isArray(account.entityCategories)) {
      account.entityCategories = [];
    }
    if (!Array.isArray(account.entityClassifications)) {
      account.entityClassifications = [];
    }

    account.tradeName ??= '';
    account.languageId ??= undefined;

    this.phoneFields.forEach(phone => {
      account[phone.type] ??= undefined;
      account[phone.number] ??= '';
      account[phone.ext] ??= '';
    });

    const extraData = this.entityData.entityExtraData ?? account.entityExtraData ?? [];
    account.entityExtraData = extraData;
    this.entityData.entityExtraData = extraData;

    this.updateSelectedIds();
  }

  // ================= Shared helpers =================

  private ensurePagination(attribute: any): void {
    attribute.paginationSetting ??= {
      skipCount: 0,
      maxResultCount: 10,
      totalCount: 0,
      list: []
    };
  }

  /** Keeps old rows for attributes that did not change and adds the new ones. */
  private mergeExtraData(
    existing: AppEntityExtraDataDto[],
    incoming: AppEntityExtraDataDto[]
  ): AppEntityExtraDataDto[] {
    const changedIds = new Set(incoming.map(item => item.attributeId));
    return [...existing.filter(item => !changedIds.has(item.attributeId)), ...incoming];
  }

  private removeFromExtraData(
    data: AppEntityExtraDataDto[],
    attributeId: number
  ): AppEntityExtraDataDto[] {
    return data.filter(item => Number(item.attributeId) !== Number(attributeId));
  }

  private syncExtraData(data: AppEntityExtraDataDto[]): void {
    this.entityData.entityExtraData = data;
    this.account.entityExtraData = data;
  }

  // ================= Roles =================

  private initializeRolesSection(): void {
    this.isLoadingRoles = true;
    this.roleExtraAttributeObject = null;
    this.roleAttributes = [];

    const extraData: AppEntityExtraDataDto[] =
      this.entityData?.entityExtraData ?? this.account?.entityExtraData ?? [];

    this._sycEntityObjectTypesServiceProxy
      .getAllWithExtraAttributes(this.roleEntityObjectTypeId)
      .pipe(finalize(() => (this.isLoadingRoles = false)))
      .subscribe({
        next: result => {
          const roleType =
            result?.find(item => item.id === this.roleEntityObjectTypeId) ?? result?.[0];

          this.roleAttributes = roleType?.extraAttributes?.extraAttributes ?? [];
          this.roleAttributes.forEach(attribute => this.ensurePagination(attribute));

          const dto = new GetAppEntityForEditOutput();
          (dto as any).extraDataAttributes =
            this.roleAttributes.map(attribute => this.toRoleAttributeValues(attribute, extraData));
          // Kept because it is used later when saving.
          dto.entityExtraData = [...extraData];
          this.roleDynamicInputsForViewDto = dto;

          this.roleExtraAttributeObject = {
            value: {
              filteredExtraAttributes: this.roleAttributes,
              extraAttributes: this.roleAttributes
            }
          };
        },
        error: () => {
          this.roleAttributes = [];
          this.roleExtraAttributeObject = null;
          this.roleDynamicInputsForViewDto = null;
        }
      });
  }

  /** Builds the saved values of one role attribute for the dynamic inputs. */
  private toRoleAttributeValues(attribute: any, extraData: AppEntityExtraDataDto[]) {
    const attributeId = attribute.attributeId ?? attribute.id;

    const matched = extraData.filter(
      item => Number(item.attributeId) === Number(attributeId)
    );

    const isMultiSelect =
      attribute.dataType?.toUpperCase() === 'MULTISELECTDROPDOWNLIST' ||
      attribute.acceptMultipleValues === true;

    const selectedValues = isMultiSelect
      ? matched.flatMap(item => {
          const raw: any = item.attributeValue ?? item.attributeValueId ?? '';
          const values = Array.isArray(raw)
            ? raw
            : this.parseMultiSelectValue(raw, attribute.validEntries);
          return values.map(value => ({ value }));
        })
      : matched.map(item => ({
          value: item.attributeValueId ?? item.attributeValue ?? ''
        }));

    return {
      extraAttributeId: attributeId,
      extraAttrName: attribute.name,
      selectedValues
    };
  }

  /** Splits a saved "a-b-c" string into the valid entries it contains. */
  private parseMultiSelectValue(rawValue: any, validEntries: string): string[] {
    if (rawValue === null || rawValue === undefined || rawValue === '') {
      return [];
    }

    const value = String(rawValue).trim();
    const options = (validEntries ?? '')
      .split('|')
      .map(option => option.trim())
      .filter(Boolean);

    if (options.length) {
      return options.filter(option => {
        const escaped = option.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`(^|-)${escaped}(?=-|$)`, 'i').test(value);
      });
    }

    return value.split('-').map(item => item.trim()).filter(Boolean);
  }

  onRoleExtraAttributesChanged(changedAttributes: any[]): void {
    if (!this.canEditSection('roles')) {
      return;
    }

    const dto = (this.roleDynamicInputsForViewDto ??= new GetAppEntityForEditOutput());
    const incoming = (changedAttributes ?? []).map(attribute => this.createRoleExtraData(attribute));
    const merged = this.mergeExtraData(dto.entityExtraData ?? [], incoming);

    dto.entityExtraData = merged;
    this.syncExtraData(merged);
    this.entityData.__extraDataTouched = true;
  }

  onRoleExtraAttributeCleared(attributeId: number): void {
    if (!this.canEditSection('roles')) {
      return;
    }

    const updated = this.removeFromExtraData(
      this.roleDynamicInputsForViewDto?.entityExtraData ?? [],
      attributeId
    );

    if (this.roleDynamicInputsForViewDto) {
      this.roleDynamicInputsForViewDto.entityExtraData = updated;
    }
    this.syncExtraData(updated);
    this.entityData.__extraDataTouched = true;
  }

  private createRoleExtraData(attribute: any): AppEntityExtraDataDto {
    const dto = new AppEntityExtraDataDto();
    dto.attributeId = attribute.attributeId;
    dto.entityObjectTypeId = this.roleEntityObjectTypeId;
    dto.entityid = this.account?.entityId ?? null;

    const isMultiSelect =
      attribute.acceptMultipleValues === true ||
      String(attribute.dataType).toUpperCase() === 'MULTISELECTDROPDOWNLIST';

    if (isMultiSelect) {
      const values: any[] = Array.isArray(attribute.value)
        ? attribute.value
        : attribute.value ? [attribute.value] : [];

      dto.attributeValue = values
        .map(value => typeof value === 'object' ? value?.value ?? value?.label ?? '' : value)
        .filter(Boolean)
        .join('-');
      dto.attributeValueId = null;
    } else if (attribute.isLookup) {
      const id = Number(attribute.value);
      dto.attributeValueId = Number.isNaN(id) ? null : id;
      dto.attributeValue = null;
    } else {
      dto.attributeValue = attribute.value ?? '';
      dto.attributeValueId = null;
    }

    return dto;
  }

  // ================= Relationship =================

  private initializeRelationshipSection(): void {
    const firstRelationId = this.connectionsInfo?.[0]?.relationEntityId;

    if (!firstRelationId) {
      this.resetRelationshipData();
      return;
    }

    this.selectedRelationId = firstRelationId;
    this.loadRelationshipStaticLookups().subscribe(() => this.loadRelationshipData());
  }

  private resetRelationshipData(): void {
    this.selectedRelationId = null;
    this.relationshipEntityObjectTypeId = null;
    this.allRelationshipAttributes = [];
    this.groupedByUsage = {};
    this.usageList = [];
    this.isLoadingRelationship = false;
  }

  private loadRelationshipStaticLookups(): Observable<any> {
    return forkJoin({
      shipVia: this._appEntitiesServiceProxy.getAllEntitiesByTypeCode('SHIPVIA'),
      paymentTerms: this._appEntitiesServiceProxy.getAllEntitiesByTypeCode('PAYMENT-TERMS')
    }).pipe(
      tap(result => {
        this.allShipVia = result.shipVia ?? [];
        this.allPaymentTerms = result.paymentTerms ?? [];
        this.allPriceLevel = this.getPriceLevel();
      })
    );
  }

  onRelationshipOptionChange(relationId: number): void {
    if (!relationId) {
      return;
    }
    this.selectedRelationId = relationId;
    this.loadRelationshipData();
  }

  private loadRelationshipData(): void {
    if (!this.selectedRelationId) {
      return;
    }

    this.isLoadingRelationship = true;
    this._appEntitiesServiceProxy
      .getAppEntityForEdit(this.selectedRelationId, true)
      .pipe(finalize(() => (this.isLoadingRelationship = false)))
      .subscribe(result => {
        this.relationshipDynamicInputsForViewDto = result;
        this.loadRelationshipAttributes();
      });
  }

  private loadRelationshipAttributes(): void {
    this._sycEntityObjectTypesServiceProxy
      .getAllWithExtraAttributesByCode('BTB', 'MARKETPLACECONTACTRELATIONSHIP')
      .pipe(
        tap(types => {
          this.relationshipEntityObjectTypeId =
            types.find(type => type.code === 'BTB')?.id ?? DEFAULT_RELATIONSHIP_TYPE_ID;
        }),
        switchMap(() =>
          this._sycEntityObjectTypesServiceProxy
            .getAllWithExtraAttributes(this.relationshipEntityObjectTypeId)
        )
      )
      .subscribe(result => {
        if (!result?.length) {
          return;
        }

        this.allRelationshipAttributes = result[0]?.extraAttributes?.extraAttributes ?? [];
        this.groupedByUsage = this.groupByUsage(this.allRelationshipAttributes);
        this.usageList = Object.keys(this.groupedByUsage);
        this.setupRelationshipLookups();
      });
  }

  private groupByUsage(attributes: any[]): Record<string, any[]> {
    return attributes.reduce((groups: Record<string, any[]>, attribute) => {
      const usage = attribute.usage || this.l('RelationshipSettings');
      this.ensurePagination(attribute);
      (groups[usage] ??= []).push(attribute);
      return groups;
    }, {});
  }

  /** Ship via / payment terms / price level use the lists loaded here, other lookups are paged from the server. */
  private setupRelationshipLookups(): void {
    this.allRelationshipAttributes.forEach(attribute => {
      this.ensurePagination(attribute);

      const fixedList = this.getFixedLookupList(attribute);
      if (fixedList) {
        attribute.paginationSetting.list = [...fixedList];
        attribute.paginationSetting.totalCount = fixedList.length;
      } else if (attribute.isLookup) {
        this.loadLookupPage(attribute);
      }
    });
  }

  private getFixedLookupList(attribute: any): any[] | null {
    const code = String(attribute.code ?? attribute.attributeCode ?? attribute.name ?? '')
      .trim()
      .toUpperCase();

    if (code.includes('SHIP') && code.includes('VIA')) {
      return this.allShipVia;
    }
    if (code.includes('PAYMENT') && code.includes('TERM')) {
      return this.allPaymentTerms;
    }
    if (code.includes('PRICE') && code.includes('LEVEL')) {
      return this.allPriceLevel;
    }
    return null;
  }

  private loadLookupPage(attribute: any): void {
    const paging = attribute.paginationSetting;

    this._extraAttributeDataService
      .getExtraAttributeLookupDataWithPaging(
        attribute.entityObjectTypeCode,
        paging.skipCount,
        paging.maxResultCount
      )
      .subscribe(result => {
        paging.totalCount = result.totalCount;
        if (paging.skipCount === 0) {
          paging.list = [];
        }
        paging.list.push(...(result.items ?? []));
        paging.skipCount += paging.maxResultCount;
      });
  }

  onRelationshipExtraDataChanged(changes: any[]): void {
    this.relationshipTouched = true;

    const dto = (this.relationshipDynamicInputsForViewDto ??= new GetAppEntityForEditOutput());
    const incoming = changes.flatMap(attribute => this.createRelationshipExtraData(attribute));

    dto.entityExtraData = this.mergeExtraData(dto.entityExtraData ?? [], incoming);
  }

  onRelationshipExtraDataCleared(attributeId: number): void {
    this.relationshipTouched = true;

    const dto = this.relationshipDynamicInputsForViewDto;
    if (dto?.entityExtraData) {
      dto.entityExtraData = this.removeFromExtraData(dto.entityExtraData, attributeId);
    }
  }

  private createRelationshipExtraData(attribute: any): AppEntityExtraDataDto[] {
    const create = () => {
      const dto = new AppEntityExtraDataDto();
      dto.attributeId = attribute.attributeId;
      dto.entityObjectTypeId = this.relationshipEntityObjectTypeId;
      dto.entityid = this.selectedRelationId;
      return dto;
    };

    // Multi-select lookup: one row per selected value.
    if (attribute.isLookup && attribute.acceptMultipleValues) {
      const values: any[] = Array.isArray(attribute.value) ? attribute.value : [];
      return values.map(value => {
        const dto = create();
        dto.attributeValueId = Number(value);
        return dto;
      });
    }

    const dto = create();
    if (attribute.isLookup) {
      const id = Number(attribute.value);
      dto.attributeValueId = Number.isNaN(id) ? null : id;
      dto.attributeValue = null;
    } else {
      dto.attributeValue = attribute.value ?? null;
      dto.attributeValueId = null;
    }
    return [dto];
  }

  saveRelationshipEntity(): Observable<any> {
    const relationship = this.relationshipDynamicInputsForViewDto;

    if (!this.relationshipTouched || !relationship?.appEntity) {
      return of(null);
    }

    const dto = Object.assign(new AppEntityDto(), relationship.appEntity);
    dto.entityExtraData = relationship.entityExtraData ?? [];

    return this._appEntitiesServiceProxy
      .saveEntity(dto)
      .pipe(tap(() => (this.relationshipTouched = false)));
  }

  // ================= Business: departments =================

  openSelectCategoriesModal(): void {
    if (this.isViewMode) {
      return;
    }

    const initialState: Partial<SelectCategoriesDynamicModalComponent> = {
      savedIds: [...this.categoriesIds],
      showAddAction: false,
      showActions: false,
      entityObjectName: 'Product',
      entityObjectDisplayName: 'Departments',
      isDepartment: true,
      entityId: this.account?.entityId ?? undefined
    };

    this.openRightModal(
      SelectCategoriesDynamicModalComponent,
      initialState,
      (modal: SelectCategoriesDynamicModalComponent) => {
        if (modal?.selectionDone && Array.isArray(modal.selectedRecords)) {
          this.addCategories(modal.selectedRecords);
        }
      }
    );
  }

  private addCategories(nodes: TreeNodeOfGetSycEntityObjectCategoryForViewDto[]): void {
    const existingIds = new Set(
      this.selectedDepartments.map(item => Number(item.entityObjectCategoryId))
    );

    const added = (nodes ?? [])
      .map(node => {
        const category = node?.data?.sycEntityObjectCategory;
        if (!category) {
          return null;
        }

        const dto = new AppEntityCategoryDto();
        dto.entityObjectCategoryId = category.id;
        dto.entityObjectCategoryCode = category.code;
        dto.entityObjectCategoryName = category.name;
        return dto;
      })
      .filter((item): item is AppEntityCategoryDto =>
        !!item && !existingIds.has(Number(item.entityObjectCategoryId))
      );

    this.account.entityCategories = [...this.selectedDepartments, ...added];
    this.updateSelectedIds();
    this.entityData.__categoriesTouched = true;
    this.syncCategoryNames();
  }

  removeCategory(index: number): void {
    if (!this.canEditSection('business') || !this.isValidIndex(this.selectedDepartments, index)) {
      return;
    }

    this.message.confirm(
      this.l('AreYouSureYouWantToRemoveThisDepartment?'),
      this.l('AreYouSure'),
      confirmed => {
        if (!confirmed) {
          return;
        }

        this.account.entityCategories =
          this.selectedDepartments.filter((_, currentIndex) => currentIndex !== index);
        this.updateSelectedIds();
        this.entityData.__categoriesTouched = true;
        this.syncCategoryNames();
      }
    );
  }

  private syncCategoryNames(): void {
    this.account.categories = this.selectedDepartments
      .map(item => item.entityObjectCategoryName)
      .filter(Boolean);
    this.entityData.account = this.account;
  }

  // ================= Business: classifications =================

  openSelectClassificationsModal(): void {
    if (this.isViewMode) {
      return;
    }

    const initialState: Partial<SelectClassificationDynamicModalComponent> = {
      savedIds: [...this.classificationsIds],
      showAddAction: false,
      showActions: false,
      entityObjectName: 'Contact',
      entityObjectDisplayName: 'Business Classifications',
      entityId: this.account?.entityId ?? undefined
    };

    this.openRightModal(
      SelectClassificationDynamicModalComponent,
      initialState,
      (modal: SelectClassificationDynamicModalComponent) => {
        if (modal?.selectionDone && Array.isArray(modal.selectedRecords)) {
          this.addClassifications(modal.selectedRecords);
        }
      }
    );
  }

  private addClassifications(
    nodes: TreeNodeOfGetSycEntityObjectClassificationForViewDto[]
  ): void {
    const existingIds = new Set(
      this.selectedClassifications.map(item => Number(item.entityObjectClassificationId))
    );

    const added = (nodes ?? [])
      .map(node => {
        const classification = node?.data?.sycEntityObjectClassification;
        if (!classification) {
          return null;
        }

        const dto = new AppEntityClassificationDto();
        dto.entityObjectClassificationId = classification.id;
        dto.entityObjectClassificationCode = classification.code;
        dto.entityObjectClassificationName = classification.name;
        return dto;
      })
      .filter((item): item is AppEntityClassificationDto =>
        !!item && !existingIds.has(Number(item.entityObjectClassificationId))
      );

    this.account.entityClassifications = [...this.selectedClassifications, ...added];
    this.updateSelectedIds();
    this.entityData.__classificationsTouched = true;
    this.syncClassificationNames();
  }

  removeClassification(index: number): void {
    if (!this.canEditSection('business') || !this.isValidIndex(this.selectedClassifications, index)) {
      return;
    }

    this.message.confirm(
      this.l('AreYouSureTouWantToRemoveThisClassification?'),
      this.l('AreYouSure'),
      confirmed => {
        if (!confirmed) {
          return;
        }

        this.account.entityClassifications =
          this.selectedClassifications.filter((_, currentIndex) => currentIndex !== index);
        this.updateSelectedIds();
        this.entityData.__classificationsTouched = true;
        this.syncClassificationNames();
      }
    );
  }

  private syncClassificationNames(): void {
    this.account.classfications = this.selectedClassifications
      .map(item => item.entityObjectClassificationName)
      .filter(Boolean);
    this.entityData.account = this.account;
  }

  // ================= Business: shared =================

  private updateSelectedIds(): void {
    const toIds = (items: any[], key: string): number[] =>
      items.map(item => Number(item[key])).filter(id => id > 0);

    this.categoriesIds = toIds(this.selectedDepartments, 'entityObjectCategoryId');
    this.classificationsIds = toIds(this.selectedClassifications, 'entityObjectClassificationId');
  }

  private isValidIndex(list: any[], index: number): boolean {
    return index >= 0 && index < list.length;
  }

  /** Opens a right-side modal and calls onSelected with its content when it closes. */
  private openRightModal(
    component: any,
    initialState: any,
    onSelected: (modal: any) => void
  ): void {
    const config = new ModalOptions();
    config.class = 'right-modal slide-right-in';
    config.initialState = initialState;

    const modalRef = this._bsModalService.show(component, config);
    const subscription = this._bsModalService.onHidden.subscribe(() => {
      onSelected(modalRef.content);
      subscription.unsubscribe();
    });
  }
}