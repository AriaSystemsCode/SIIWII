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
import { BsModalRef, BsModalService, ModalOptions } from '@node_modules/ngx-bootstrap/modal';

import { AppComponentBase } from '@shared/common/app-component-base';
import {
  AccountsServiceProxy,
  AppEntitiesServiceProxy,
  AppEntityCategoryDto,
  AppEntityClassificationDto,
  AppEntityExtraDataDto,
  ConnectionInfo,
  CurrencyInfoDto,
  GetAppEntityForEditOutput,
  LookupLabelDto,
  SycEntityObjectTypesServiceProxy,
  TreeNodeOfGetSycEntityObjectCategoryForViewDto,
  TreeNodeOfGetSycEntityObjectClassificationForViewDto
} from '@shared/service-proxies/service-proxies';
import { forkJoin, Subscription } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
type EntityMode = 'create' | 'edit' | 'view';



@Component({
  selector: 'app-account-sections',
  templateUrl: './account-sections.component.html',
  styleUrls: ['./account-sections.component.scss'],
})
export class AccountSectionsComponent
  extends AppComponentBase
  implements OnInit, OnChanges {

  @Input() accountId: number;
  @Input() entityData: any;
  @Input() mode: EntityMode = 'view';

  account: any = {};
  mainBranch: any = {};

  allLanguages: LookupLabelDto[] = [];
  allCurrencies: CurrencyInfoDto[] = [];
  allPhoneTypes: LookupLabelDto[] = [];

  private loadedAccountId: number | null = null;


  connectionsInfo: ConnectionInfo[] = [];

selectedRelationId: number | null = null;

relationshipEntityObjectTypeId: number | null = null;

dynamicInputsForViewDto: GetAppEntityForEditOutput | null = null;

allRelationshipAttributes: any[] = [];

groupedByUsage: Record<string, any[]> = {};

usageList: string[] = [];

isLoadingRelationship = false;


roleEntityObjectTypeId :number;

roleDynamicInputsForViewDto: GetAppEntityForEditOutput | null = null;

roleExtraAttributeObject: any = null;

roleAttributes: any[] = [];

isLoadingRoles = false;

  //Department
    showMoreDepartment: boolean = false;
    showLessDepartment: boolean = false;
    totalDepartment: number;
    noOfDepartmentToShowInitially: number;
    maxDepartmentCount: number;
    skipDepartmentCount: number;
    departmentToLoad: number;
    initDepartment: string[] = [];
    scrollDepartment: boolean = false;
    maxDepartmentCnt: number;
    //Classification
    showMoreClassification: boolean = false;
    showLessClassification: boolean = false;
    totalClassification: number;
    noOfClassificationToShowInitially: number;
    maxClassificationCount: number;
    skipClassificationCount: number;
    classificationToLoad: number;
    initClassification: string[] = [];
    scrollClassification: boolean = false;
    maxClassificationCnt: number;
    maxContainerHeight: number = 150;



    categoriesIds: number[] = [];

classificationsIds: number[] = [];
  constructor(
    injector: Injector,
    private _accountsServiceProxy: AccountsServiceProxy,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
       
  private _sycEntityObjectTypesServiceProxy:
    SycEntityObjectTypesServiceProxy,  private _bsModalService:
    BsModalService
  ) {
    super(injector);
  }

  ngOnInit(): void {


    this.loadLookups();

  if (this.entityData?.account) {
    this.setAccountData(this.entityData);
    
  }
}
 ngOnChanges(changes: SimpleChanges): void {

    if (changes.entityData?.currentValue?.account) {
    this.setAccountData(changes.entityData.currentValue);
  }

        this.initDepartmentVariables(true);
            this.initClassificationVariables(true);
}
trackByValue(index: number, value: string): string {
  return value || index.toString();
}


private setAccountData(data: any): void {
  this.entityData = data;
  this.account = data?.account ?? {};

  const branch =
    this.account?.branches?.[0]?.data?.branch;

  // View API keeps these values inside main branch.
  if (branch) {
    this.account.tradeName ??=
      branch.tradeName;

    this.account.languageId ??=
      branch.languageId;

    this.account.currencyId ??=
      branch.currencyId;

    this.account.phone1TypeId ??=
      branch.phone1TypeId;

    this.account.phone1Number ??=
      branch.phone1Number;

    this.account.phone1Ex ??=
      branch.phone1Ex ??
      branch.phone1Ext;

    this.account.phone2TypeId ??=
      branch.phone2TypeId;

    this.account.phone2Number ??=
      branch.phone2Number;

    this.account.phone2Ex ??=
      branch.phone2Ex ??
      branch.phone2Ext;

    this.account.phone3TypeId ??=
      branch.phone3TypeId;

    this.account.phone3Number ??=
      branch.phone3Number;

    this.account.phone3Ex ??=
      branch.phone3Ex ??
      branch.phone3Ext;
  }

  this.mainBranch = this.account;

  this.roleEntityObjectTypeId =
    this.account?.accountTypeId;

  this.loadedAccountId =
    this.account?.id ??
    this.accountId ??
    null;

  this.connectionsInfo =
    data?.connectionsInfo ??
    this.account?.connectionsInfo ??
    [];

  this.initializeAccountFields();

  if (this.roleEntityObjectTypeId) {
    this.initializeRolesSection();
  }

  if (
    this.mode !== 'create' &&
    this.connectionsInfo?.length
  ) {
    this.initializeRelationshipSection();
  } else {
    this.resetRelationshipData();
  }
}


private initializeAccountFields(): void {
  this.account.tradeName ??= '';
  this.account.languageId ??= undefined;

  this.account.phone1TypeId ??= undefined;
  this.account.phone1Number ??= '';
  this.account.phone1Ex ??= '';

  this.account.phone2TypeId ??= undefined;
  this.account.phone2Number ??= '';
  this.account.phone2Ex ??= '';

  this.account.phone3TypeId ??= undefined;
  this.account.phone3Number ??= '';
  this.account.phone3Ex ??= '';

  const existingExtraData =
    this.entityData?.entityExtraData ??
    this.account?.entityExtraData ??
    [];

  this.account.entityExtraData =
    existingExtraData;

  this.entityData.entityExtraData =
    existingExtraData;

  this.account.entityAttachments ??= [];
  this.account.entityCategories ??= [];
  this.account.entityClassifications ??= [];

  this.initializeBusinessSelections();
}

private initializeRolesSection(): void {
  this.isLoadingRoles = true;
  this.roleExtraAttributeObject = null;
  this.roleAttributes = [];

  const accountExtraData: AppEntityExtraDataDto[] =
    this.entityData?.entityExtraData ??
    this.account?.entityExtraData ??
    [];

  this._sycEntityObjectTypesServiceProxy
    .getAllWithExtraAttributes(this.roleEntityObjectTypeId)
    .pipe(
      finalize(() => {
        this.isLoadingRoles = false;
      })
    )
    .subscribe({
      next: result => {
        const roleType = result?.find(
          item => item.id === this.roleEntityObjectTypeId
        ) ?? result?.[0];

        this.roleAttributes =
          roleType?.extraAttributes?.extraAttributes ?? [];

        this.roleAttributes.forEach(attribute => {
          if (!attribute.paginationSetting) {
            attribute.paginationSetting = {
              skipCount: 0,
              maxResultCount: 10,
              totalCount: 0,
              list: []
            };
          }
        });

     
        this.roleDynamicInputsForViewDto =
          new GetAppEntityForEditOutput();
(this.roleDynamicInputsForViewDto as any).extraDataAttributes =
  this.roleAttributes.map(attribute => {

  const attributeId =
  attribute.attributeId ??
  attribute.id;

const matchedValues =
  accountExtraData.filter(
    item =>
      Number(item.attributeId) ===
      Number(attributeId)
  );

    let selectedValues: Array<{ value: any }> = [];

    const isMultiSelect =
      attribute.dataType?.toUpperCase() ===
        'MULTISELECTDROPDOWNLIST' ||
      attribute.acceptMultipleValues === true;

    if (isMultiSelect) {
      selectedValues = matchedValues.flatMap(item => {
        const rawValue =
          item.attributeValue ??
          item.attributeValueId ??
          '';

        if (Array.isArray(rawValue)) {
          return rawValue.map(value => ({
            value
          }));
        }

        return this.parseMultiSelectValue(
          rawValue,
          attribute.validEntries
        ).map(value => ({
          value
        }));
      });
    } else {
      selectedValues = matchedValues.map(item => ({
        value:
          item.attributeValueId ??
          item.attributeValue ??
          ''
      }));
    }

  return {
  extraAttributeId: attributeId,
  extraAttrName: attribute.name,
  selectedValues
};
  });
        /*
         * Keep entityExtraData because you use it later for saving.
         */
        this.roleDynamicInputsForViewDto.entityExtraData =
          [...accountExtraData];

        this.roleExtraAttributeObject = {
          value: {
            filteredExtraAttributes: this.roleAttributes,
            extraAttributes: this.roleAttributes
          }
        };
      },
      error: error => {
        console.error(
          'Failed to load role attributes:',
          error
        );

        this.roleAttributes = [];
        this.roleExtraAttributeObject = null;
        this.roleDynamicInputsForViewDto = null;
      }
    });
}


private parseMultiSelectValue(
  rawValue: any,
  validEntries: string
): string[] {

  if (
    rawValue === null ||
    rawValue === undefined ||
    rawValue === ''
  ) {
    return [];
  }

  if (Array.isArray(rawValue)) {
    return rawValue;
  }

  const value = String(rawValue).trim();

  const options = (validEntries ?? '')
    .split('|')
    .map(option => option.trim())
    .filter(Boolean);

  /*
   * Safest method:
   * find which valid options exist in the stored string.
   *
   * Stored:
   * Buyer-Seller-Sales Rep-Buying Office
   */
  if (options.length) {
    return options.filter(option => {
      const escapedOption =
        option.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&'
        );

      const pattern = new RegExp(
        `(^|-)${escapedOption}(?=-|$)`,
        'i'
      );

      return pattern.test(value);
    });
  }

  return value
    .split('-')
    .map(item => item.trim())
    .filter(Boolean);
}
private initializeRelationshipSection(): void {
  if (!this.connectionsInfo?.length) {
    this.resetRelationshipData();
    return;
  }

  const firstRelationId =
    this.connectionsInfo[0]?.relationEntityId;

  if (!firstRelationId) {
    this.resetRelationshipData();
    return;
  }

  this.selectedRelationId = firstRelationId;

  this.loadRelationshipData(firstRelationId);
}



  //Department
    initDepartmentVariables(firstInit: boolean) {
        if (firstInit)
            this.initDepartment = this.entityData.account.categories;
        else this.entityData.account.categories = this.initDepartment;

        this.noOfDepartmentToShowInitially = 10;
        this.maxDepartmentCount = 10;
        this.scrollDepartment = false;
        this.maxDepartmentCnt = 40;
        this.departmentToLoad = 20;
        this.totalDepartment =
            this.entityData?.account?.categoriesTotalCount;

        if (this.noOfDepartmentToShowInitially < this.totalDepartment)
            this.showMoreDepartment = true;
        else this.showMoreDepartment = false;
        this.showLessDepartment = false;
    }

    showDepartment() {
        if (this.noOfDepartmentToShowInitially < this.totalDepartment) {
            this.maxDepartmentCount = this.departmentToLoad;
            this.skipDepartmentCount = this.noOfDepartmentToShowInitially;
            this.noOfDepartmentToShowInitially += this.departmentToLoad;

            this._AppEntitiesServiceProxy
                .getAppEntityDepartmentsNamesWithPaging(
                    this.entityData?.account?.entityId,
                    undefined,
                    this.skipDepartmentCount,
                    this.maxDepartmentCount,
                )
                .subscribe((res) => {
                    if (
                        this.noOfDepartmentToShowInitially >=
                        this.totalDepartment
                    ) {
                        this.showMoreDepartment = false;
                        this.showLessDepartment = true;
                    }

                    this.entityData.account.categories =
                        this.entityData.account.categories.concat(
                            res.items
                        );
                    if (
                        this.entityData.account.categories.length >= this.maxDepartmentCnt
                    )
                        this.scrollDepartment = true;
                });
        } else {
            this.initDepartmentVariables(false);
        }
    }

    //Classification
    initClassificationVariables(firstInit: boolean) {
        if (firstInit)
            this.initClassification = this.entityData.account.classfications
        else this.entityData.account.classfications = this.initClassification;

        this.noOfClassificationToShowInitially = 10;
        this.maxClassificationCount = 10;
        this.scrollClassification = false;
        this.maxClassificationCnt = 40;
        this.classificationToLoad = 20;
        this.totalClassification = this.entityData.account.classificationsTotalCount;
        if (this.noOfClassificationToShowInitially < this.totalClassification)
            this.showMoreClassification = true;
        else this.showMoreClassification = false;
        this.showLessClassification = false;
    }
    showClassification() {
        if (this.noOfClassificationToShowInitially < this.totalClassification) {
            this.maxClassificationCount = this.classificationToLoad;
            this.skipClassificationCount =
                this.noOfClassificationToShowInitially;
            this.noOfClassificationToShowInitially += this.classificationToLoad;

            this._AppEntitiesServiceProxy
                .getAppEntityClassificationsNamesWithPaging(
                    this.entityData.account.entityId,
                    undefined,
                    this.skipDepartmentCount,
                    this.maxDepartmentCount,
                )
                .subscribe((res) => {
                    if (
                        this.noOfClassificationToShowInitially >=
                        this.totalClassification
                    ) {
                        this.showMoreClassification = false;
                        this.showLessClassification = true;
                    }

                    this.entityData.account.classfications = this.entityData.account.classfications.concat(
                        res.items
                    );
                    if (
                        this.entityData.account.classfications.length >= this.maxClassificationCnt
                    )
                        this.scrollClassification = true;
                });
        } else {
            this.initClassificationVariables(false);
        }
    }

onRelationshipOptionChange(
  relationId: number
): void {

  if (!relationId) {
    return;
  }

  this.selectedRelationId = relationId;

  this.loadRelationshipData(relationId);
}
onRelationshipExtraDataChanged(
  changedAttributes: any[]
): void {

  if (!this.dynamicInputsForViewDto) {
    this.dynamicInputsForViewDto =
      new GetAppEntityForEditOutput();
  }

  if (!this.dynamicInputsForViewDto.entityExtraData) {
    this.dynamicInputsForViewDto.entityExtraData = [];
  }

  const existingData =
    this.dynamicInputsForViewDto.entityExtraData;

  const incomingData: AppEntityExtraDataDto[] =
    (changedAttributes ?? []).flatMap(attribute => {

      if (
        attribute.isLookup &&
        attribute.acceptMultipleValues
      ) {
        return (attribute.value ?? []).map(
          value => {
            const dto =
              new AppEntityExtraDataDto();

            dto.attributeId =
              attribute.attributeId;

            dto.entityObjectTypeId =
              this.relationshipEntityObjectTypeId;

            dto.entityid =
              this.selectedRelationId;

            dto.attributeValueId = value;

            return dto;
          }
        );
      }

      const dto =
        new AppEntityExtraDataDto();

      dto.attributeId =
        attribute.attributeId;

      dto.entityObjectTypeId =
        this.relationshipEntityObjectTypeId;

      dto.entityid =
        this.selectedRelationId;

      if (attribute.isLookup) {
        const parsedValue =
          Number(attribute.value);

        dto.attributeValueId =
          Number.isNaN(parsedValue)
            ? null
            : parsedValue;
      } else {
        dto.attributeValue =
          attribute.value;
      }

      return [dto];
    });

  const changedAttributeIds =
    new Set(
      incomingData.map(
        item => item.attributeId
      )
    );

  const unchangedExistingData =
    existingData.filter(
      item =>
        !changedAttributeIds.has(
          item.attributeId
        )
    );

  this.dynamicInputsForViewDto.entityExtraData = [
    ...unchangedExistingData,
    ...incomingData
  ];
}
private loadRelationshipData(
  relationId: number
): void {

  if (!relationId) {
    return;
  }

  this.isLoadingRelationship = true;

  this.dynamicInputsForViewDto = null;
  this.allRelationshipAttributes = [];
  this.groupedByUsage = {};
  this.usageList = [];

  const relationshipValues$ =
    this._AppEntitiesServiceProxy
      .getAppEntityForEdit(relationId, true);

  const relationshipType$ =
    this._sycEntityObjectTypesServiceProxy
      .getAllWithExtraAttributesByCode(
        'BTB',
        'MARKETPLACECONTACTRELATIONSHIP'
      );

  forkJoin({
    relationshipValues: relationshipValues$,
    relationshipType: relationshipType$
  })
    .pipe(
      switchMap(result => {
        this.dynamicInputsForViewDto =
          result.relationshipValues;

        const type =
          result.relationshipType?.find(
            item => item.code === 'BTB'
          ) ??
          result.relationshipType?.[0];

        this.relationshipEntityObjectTypeId =
          type?.id ?? null;

        if (!this.relationshipEntityObjectTypeId) {
          throw new Error(
            'Relationship entity object type was not found.'
          );
        }

        return this._sycEntityObjectTypesServiceProxy
          .getAllWithExtraAttributes(
            this.relationshipEntityObjectTypeId
          );
      }),
      finalize(() => {
        this.isLoadingRelationship = false;
      })
    )
    .subscribe({
      next: result => {
        const typeData = result?.[0];

        this.allRelationshipAttributes =
          typeData?.extraAttributes?.extraAttributes ??
          [];

        this.groupedByUsage =
          this.groupRelationshipAttributesByUsage(
            this.allRelationshipAttributes
          );

        this.usageList =
          Object.keys(this.groupedByUsage);
      },
      error: error => {
        console.error(
          'Failed to load relationship information:',
          error
        );

        this.resetRelationshipData();
      }
    });
}
private resetRelationshipData(): void {
  this.selectedRelationId = null;

  this.relationshipEntityObjectTypeId = null;

  this.dynamicInputsForViewDto = null;

  this.allRelationshipAttributes = [];

  this.groupedByUsage = {};

  this.usageList = [];

  this.isLoadingRelationship = false;
}
onRelationshipExtraDataCleared(
  attributeId: number
): void {

  if (
    !this.dynamicInputsForViewDto
      ?.entityExtraData
  ) {
    return;
  }

  this.dynamicInputsForViewDto.entityExtraData =
    this.dynamicInputsForViewDto
      .entityExtraData
      .filter(
        item =>
          item.attributeId !== attributeId
      );
}
private groupRelationshipAttributesByUsage(
  attributes: any[]
): Record<string, any[]> {

  return (attributes ?? []).reduce(
    (
      groups: Record<string, any[]>,
      attribute: any
    ) => {

      const usage =
        attribute?.usage ||
        this.l('RelationshipSettings');

      if (!groups[usage]) {
        groups[usage] = [];
      }

      if (!attribute.paginationSetting) {
        attribute.paginationSetting = {
          skipCount: 0,
          maxResultCount: 10,
          totalCount: 0,
          list: []
        };
      }

      groups[usage].push(attribute);

      return groups;
    },
    {}
  );
}
  private createEmptyMainBranch(): any {
    return {
      tradeName: '',

      languageId: null,
      languageName: '',

      currencyId: null,
      currencyName: '',

      phone1TypeId: null,
      phone1TypeName: '',
      phone1Number: '',
      phone1Ext: '',

      phone2TypeId: null,
      phone2TypeName: '',
      phone2Number: '',
      phone2Ext: '',

      phone3TypeId: null,
      phone3TypeName: '',
      phone3Number: '',
      phone3Ext: ''
    };
  }

  getAccountDataForView(): void {
    if (!this.accountId) {
      return;
    }
    this.showMainSpinner()


    this._accountsServiceProxy
      .getAccountForView(this.accountId, 5)
      .subscribe({
        next: result => {
          this.setAccountData(result);
          this.hideMainSpinner()
        },
        error: error => {
          this.loadedAccountId = null;
          console.error('Failed to load account data:', error);
        }
      });
  }

  private loadLookups(): void {
    this.getLanguages();
    this.getCurrencies();
    this.getPhoneTypes();
  }

    getPhoneTypes() {
        this._AppEntitiesServiceProxy.getAllPhoneTypeForTableDropdown().subscribe(result => {
            this.allPhoneTypes = result;


        });
    }

    getLanguages() {
        this._AppEntitiesServiceProxy.getAllLanguageForTableDropdown().subscribe(result => {
            this.allLanguages = result;
        });
    }

    getCurrencies() {
        this._AppEntitiesServiceProxy.getAllCurrencyForTableDropdown().subscribe(result => {
            this.allCurrencies = result;
        });
    }


  get isViewMode(): boolean {
    return this.mode === 'view';
  }

  get rolesEntityObjectTypeId(): number | null {
    const roleExtraData = this.entityData?.entityExtraData?.find(
      item => item.attributeCode === 'MARKETPLACE-ROLE'
    );

    return roleExtraData?.entityObjectTypeId ?? null;
  }

  onRoleExtraAttributesChanged(
  changedAttributes: any[]
): void {

  if (!this.roleDynamicInputsForViewDto) {
    this.roleDynamicInputsForViewDto =
      new GetAppEntityForEditOutput();
  }

  if (!this.roleDynamicInputsForViewDto.entityExtraData) {
    this.roleDynamicInputsForViewDto.entityExtraData = [];
  }

  const existingData =
    this.roleDynamicInputsForViewDto.entityExtraData;

  const incomingData: AppEntityExtraDataDto[] =
    (changedAttributes ?? []).flatMap(attribute => {

      if (
        attribute.isLookup &&
        attribute.acceptMultipleValues
      ) {
        return (attribute.value ?? []).map(value => {
          const dto = new AppEntityExtraDataDto();

          dto.attributeId = attribute.attributeId;
          dto.entityObjectTypeId =
            this.roleEntityObjectTypeId;

          dto.entityid =
            this.account?.id ??
            this.accountId;

          dto.attributeValueId = value;

          return dto;
        });
      }

      const dto = new AppEntityExtraDataDto();

      dto.attributeId = attribute.attributeId;
      dto.entityObjectTypeId =
        this.roleEntityObjectTypeId;

      dto.entityid =
        this.account?.id ??
        this.accountId;

      if (attribute.isLookup) {
        const parsedValue = Number(attribute.value);

        dto.attributeValueId =
          Number.isNaN(parsedValue)
            ? null
            : parsedValue;
      } else {
        dto.attributeValue = attribute.value;
      }

      return [dto];
    });

  const incomingAttributeIds = new Set(
    incomingData.map(item => item.attributeId)
  );

  const remainingExistingData =
    existingData.filter(
      item =>
        !incomingAttributeIds.has(item.attributeId)
    );

  this.roleDynamicInputsForViewDto.entityExtraData = [
    ...remainingExistingData,
    ...incomingData
  ];

  /*
   * Keep the main account view DTO synchronized.
   */
  this.entityData.entityExtraData =
    this.roleDynamicInputsForViewDto.entityExtraData;
}

onRoleExtraAttributeCleared(
  attributeId: number
): void {

  if (
    !this.roleDynamicInputsForViewDto
      ?.entityExtraData
  ) {
    return;
  }

  this.roleDynamicInputsForViewDto.entityExtraData =
    this.roleDynamicInputsForViewDto
      .entityExtraData
      .filter(
        item =>
          item.attributeId !== attributeId
      );

  this.entityData.entityExtraData =
    this.roleDynamicInputsForViewDto.entityExtraData;
}

get selectedDepartments():
  AppEntityCategoryDto[] {

  return this.account
    ?.entityCategories ?? [];
}

get selectedClassifications():
  AppEntityClassificationDto[] {

  return this.account
    ?.entityClassifications ?? [];
}


private initializeBusinessSelections(): void {
  this.account.entityCategories ??= [];
  this.account.entityClassifications ??= [];

  this.categoriesIds =
    this.account.entityCategories
      .map(
        item =>
          Number(
            item.entityObjectCategoryId
          )
      )
      .filter(id => !!id);

  this.classificationsIds =
    this.account.entityClassifications
      .map(
        item =>
          Number(
            item.entityObjectClassificationId
          )
      )
      .filter(id => !!id);
}

openSelectCategoriesModal(): void {
  if (this.isViewMode) {
    return;
  }

  const config =
    new ModalOptions();

  config.class =
    'right-modal slide-right-in';

  const initialState:
    Partial<SelectCategoriesDynamicModalComponent> = {

    savedIds: [
      ...this.categoriesIds
    ],

    showAddAction: false,
    showActions: false,

    entityObjectName:
      'Product',

    entityObjectDisplayName:
      'Departments',

    isDepartment: true,

    entityId:
      this.account?.entityId ??
      undefined
  };

  config.initialState =
    initialState;

  const modalRef:
    BsModalRef =
      this._bsModalService.show(
        SelectCategoriesDynamicModalComponent,
        config
      );

  const subscription:
    Subscription =
      this._bsModalService
        .onHidden
        .subscribe(() => {

          this.handleSelectedCategories(
            modalRef
          );

          subscription.unsubscribe();
        });
}

private handleSelectedCategories(
  modalRef: BsModalRef
): void {

  const modal:
    SelectCategoriesDynamicModalComponent =
      modalRef.content;

  if (
    !modal?.selectionDone ||
    !Array.isArray(
      modal.selectedRecords
    )
  ) {
    return;
  }

  this.addSelectedCategories(
    modal.selectedRecords
  );
}


private addSelectedCategories(
  selected:
    TreeNodeOfGetSycEntityObjectCategoryForViewDto[]
): void {

  this.account.entityCategories ??= [];

  const existingIds =
    new Set(
      this.account.entityCategories.map(
        item =>
          Number(
            item.entityObjectCategoryId
          )
      )
    );

  const newCategories =
    (selected ?? [])
      .map(node => {
        const category =
          node?.data
            ?.sycEntityObjectCategory;

        if (
          !category?.id ||
          existingIds.has(
            Number(category.id)
          )
        ) {
          return null;
        }

        const dto =
          new AppEntityCategoryDto();

        dto.id = 0;

        dto.entityObjectCategoryId =
          category.id;

        dto.entityObjectCategoryCode =
          category.code;

        dto.entityObjectCategoryName =
          category.name;

        existingIds.add(
          Number(category.id)
        );

        return dto;
      })
      .filter(
        (
          item
        ): item is AppEntityCategoryDto =>
          !!item
      );

  this.account.entityCategories = [
    ...this.account.entityCategories,
    ...newCategories
  ];

  this.categoriesIds =
    this.account.entityCategories.map(
      item =>
        Number(
          item.entityObjectCategoryId
        )
    );

  this.syncBusinessInformation();
}

removeCategory(
  index: number
): void {

  if (
    this.isViewMode ||
    index < 0
  ) {
    return;
  }

  this.message.confirm(
    this.l(
      'AreYouSureYouWantToRemoveThisDepartment?'
    ),
    this.l('AreYouSure'),
    confirmed => {

      if (!confirmed) {
        return;
      }

      this.account.entityCategories
        .splice(index, 1);

      this.categoriesIds =
        this.account.entityCategories.map(
          item =>
            Number(
              item.entityObjectCategoryId
            )
        );

      this.syncBusinessInformation();
    }
  );
}

openSelectClassificationsModal():
  void {

  if (this.isViewMode) {
    return;
  }

  const config =
    new ModalOptions();

  config.class =
    'right-modal slide-right-in';

  const initialState:
    Partial<SelectClassificationDynamicModalComponent> = {

    savedIds: [
      ...this.classificationsIds
    ],

    showAddAction: false,
    showActions: false,

    entityObjectName:
      'Contact',

    entityObjectDisplayName:
      'Business Classifications',

    entityId:
      this.account?.entityId ??
      undefined
  };

  config.initialState =
    initialState;

  const modalRef:
    BsModalRef =
      this._bsModalService.show(
        SelectClassificationDynamicModalComponent,
        config
      );

  const subscription:
    Subscription =
      this._bsModalService
        .onHidden
        .subscribe(() => {

          this.handleSelectedClassifications(
            modalRef
          );

          subscription.unsubscribe();
        });
}

private handleSelectedClassifications(
  modalRef: BsModalRef
): void {

  const modal:
    SelectClassificationDynamicModalComponent =
      modalRef.content;

  if (
    !modal?.selectionDone ||
    !Array.isArray(
      modal.selectedRecords
    )
  ) {
    return;
  }

  this.addSelectedClassifications(
    modal.selectedRecords
  );
}

private addSelectedClassifications(
  selected:
    TreeNodeOfGetSycEntityObjectClassificationForViewDto[]
): void {

  this.account.entityClassifications ??=
    [];

  const existingIds =
    new Set(
      this.account
        .entityClassifications
        .map(
          item =>
            Number(
              item
                .entityObjectClassificationId
            )
        )
    );

  const newClassifications =
    (selected ?? [])
      .map(node => {
        const classification =
          node?.data
            ?.sycEntityObjectClassification;

        if (
          !classification?.id ||
          existingIds.has(
            Number(
              classification.id
            )
          )
        ) {
          return null;
        }

        const dto =
          new AppEntityClassificationDto();

        dto.id = 0;

        dto.entityObjectClassificationId =
          classification.id;

        dto.entityObjectClassificationCode =
          classification.code;

        dto.entityObjectClassificationName =
          classification.name;

        existingIds.add(
          Number(
            classification.id
          )
        );

        return dto;
      })
      .filter(
        (
          item
        ): item is AppEntityClassificationDto =>
          !!item
      );

  this.account.entityClassifications = [
    ...this.account.entityClassifications,
    ...newClassifications
  ];

  this.classificationsIds =
    this.account
      .entityClassifications
      .map(
        item =>
          Number(
            item
              .entityObjectClassificationId
          )
      );

  this.syncBusinessInformation();
}

removeClassification(
  index: number
): void {

  if (
    this.isViewMode ||
    index < 0
  ) {
    return;
  }

  this.message.confirm(
    this.l(
      'AreYouSureTouWantToRemoveThisClassification?'
    ),
    this.l('AreYouSure'),
    confirmed => {

      if (!confirmed) {
        return;
      }

      this.account
        .entityClassifications
        .splice(index, 1);

      this.classificationsIds =
        this.account
          .entityClassifications
          .map(
            item =>
              Number(
                item
                  .entityObjectClassificationId
              )
          );

      this.syncBusinessInformation();
    }
  );
}

private syncBusinessInformation():
  void {

  this.account.entityCategories ??= [];
  this.account.entityClassifications ??=
    [];

  this.entityData.account =
    this.account;

  /*
   * Optional display arrays used by
   * getAccountForView response shape.
   */
  this.entityData.account.categories =
    this.account.entityCategories.map(
      item =>
        item.entityObjectCategoryName
    );

  this.entityData.account.classfications =
    this.account
      .entityClassifications
      .map(
        item =>
          item
            .entityObjectClassificationName
      );
}
}