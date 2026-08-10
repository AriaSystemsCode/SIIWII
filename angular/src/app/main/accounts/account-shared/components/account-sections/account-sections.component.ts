import {
  Component,
  Injector,
  Input,
  OnChanges,
  OnInit,
  QueryList,
  SimpleChanges,
  ViewChildren
} from '@angular/core';
import { SelectCategoriesDynamicModalComponent } from '@app/categories/select-categories-dynamic-modal.component';
import { SelectClassificationDynamicModalComponent } from '@app/classification/select-classification-dynamic-modal.component';
import { ExtraAttributeDataService } from '@app/main/app-items/app-item-shared/services/extra-attribute-data.service';
import { BsModalRef, BsModalService, ModalOptions } from '@node_modules/ngx-bootstrap/modal';

import { AppComponentBase } from '@shared/common/app-component-base';
import { dynamicInputs } from '@shared/components/dynamicInputs/dynamicInputs.component';
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
import { forkJoin, Subscription ,   Observable,
  of } from 'rxjs';
import { finalize, switchMap ,tap } from 'rxjs/operators';
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


  @Input()
fieldPermissions:
  Record<string, boolean> = {};

@Input()
sectionPermissions:
  Record<string, boolean> = {};

  account: any = {};
  // mainBranch: any = {};

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



@ViewChildren('appdynamicInputs')
dynamicInputsComponents!: QueryList<dynamicInputs>;

relationshipDynamicInputsForViewDto:
  GetAppEntityForEditOutput;


  allShipVia: LookupLabelDto[] = [];
allPaymentTerms: LookupLabelDto[] = [];
allPriceLevel: any[] = [];

@ViewChildren('relationshipDynamicInput')
relationshipDynamicInputs!:
  QueryList<dynamicInputs>;


relationshipTouched = false;

  constructor(
    injector: Injector,
    private _accountsServiceProxy: AccountsServiceProxy,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
         private _extraAttributeDataService: ExtraAttributeDataService,
       
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

mainBranch
private setAccountData(data: any): void {
  if (!data?.account) {
    this.entityData = null;
    this.account = {};
    this.mainBranch = {};
    this.connectionsInfo = [];

    return;
  }

  this.entityData = data;
  this.account = data.account;

  /*
   * No branch fallback.
   */
  this.mainBranch = this.account;

  this.account.categories ??= [];
  this.account.classfications ??= [];
  this.account.imagesUrls ??= [];

  this.account.entityAttachments ??= [];
  this.account.entityCategories ??= [];
  this.account.entityClassifications ??= [];

  const existingExtraData =
    data.entityExtraData ??
    this.account.entityExtraData ??
    [];

  this.account.entityExtraData =
    existingExtraData;

  this.entityData.entityExtraData =
    existingExtraData;

  this.connectionsInfo =
    data.connectionsInfo ?? [];

  this.roleEntityObjectTypeId =
    this.account.accountTypeId ?? null;

  this.loadedAccountId =
    this.account.id ??
    this.accountId ??
    null;

  this.initializeAccountFields();
  this.initializeSelectedBusinessData();

  if (this.roleEntityObjectTypeId) {
    this.initializeRolesSection();
  } else {
    // this.resetRoleData();
  }

  if (
    this.mode !== 'create' &&
    this.connectionsInfo.length
  ) {
    this.initializeRelationshipSection();
  } else {
    this.resetRelationshipData();
  }
}


private initializeSelectedBusinessData():
  void {

  this.account.entityCategories =
    Array.isArray(
      this.account
        .entityCategories
    )
      ? this.account
          .entityCategories
      : [];

  this.account
    .entityClassifications =
    Array.isArray(
      this.account
        .entityClassifications
    )
      ? this.account
          .entityClassifications
      : [];

  this.categoriesIds =
    this.account
      .entityCategories
      .map(item =>
        Number(
          item
            .entityObjectCategoryId
        )
      )
      .filter(id => id > 0);

  this.classificationsIds =
    this.account
      .entityClassifications
      .map(item =>
        Number(
          item
            .entityObjectClassificationId
        )
      )
      .filter(id => id > 0);
}


private initializeBusinessSelections(): void {
  this.categoriesIds = (this.account.entityCategories ?? [])
    .map(item => Number(item.entityObjectCategoryId))
    .filter(id => id > 0);

  this.classificationsIds =
    (this.account.entityClassifications ?? [])
      .map(item =>
        Number(item.entityObjectClassificationId)
      )
      .filter(id => id > 0);
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
// private initializeRelationshipSection(): void {

//   if (!this.connectionsInfo?.length) {
//     this.resetRelationshipData();
//     return;
//   }

//   this.loadRelationshipStaticLookups();

//   const firstRelationId =
//     this.connectionsInfo[0]
//       ?.relationEntityId;

//   if (!firstRelationId) {
//     this.resetRelationshipData();
//     return;
//   }

//   this.selectedRelationId =
//     firstRelationId;

//   this.loadRelationshipData();
// }

private initializeRelationshipSection():
  void {

  if (!this.connectionsInfo?.length) {

    this.resetRelationshipData();

    return;
  }


  const firstRelationId =
    this.connectionsInfo[0]
      ?.relationEntityId;


  if (!firstRelationId) {

    this.resetRelationshipData();

    return;
  }


  this.selectedRelationId =
    firstRelationId;


  /*
   * IMPORTANT:
   * Load Ship Via / Payment Terms
   * BEFORE creating dynamicInputs.
   */
  this.loadRelationshipStaticLookups()
    .subscribe({

      next: () => {

        this.loadRelationshipData();

      },

      error: error => {

        console.error(
          'Relationship lookup loading failed:',
          error
        );

        this.loadRelationshipData();
      }

    });
}

private applyRelationshipLookupLists(): void {

  this.allRelationshipAttributes
    .forEach((attr: any) => {

      const code =
        String(
          attr.code ??
          attr.attributeCode ??
          attr.name ??
          ''
        )
          .trim()
          .toUpperCase();


      attr.paginationSetting ??= {
        skipCount: 0,
        maxResultCount: 10,
        totalCount: 0,
        list: []
      };


      /*
       * Ship Via
       */
      if (
        code.includes('SHIP') &&
        code.includes('VIA')
      ) {

        attr.paginationSetting.list =
          [...this.allShipVia];

        attr.paginationSetting.totalCount =
          this.allShipVia.length;

        return;
      }


      /*
       * Payment Terms
       */
      if (
        code.includes('PAYMENT') &&
        code.includes('TERM')
      ) {

        attr.paginationSetting.list =
          [...this.allPaymentTerms];

        attr.paginationSetting.totalCount =
          this.allPaymentTerms.length;

        return;
      }


      /*
       * Price Level
       */
      if (
        code.includes('PRICE') &&
        code.includes('LEVEL')
      ) {

        attr.paginationSetting.list =
          [...this.allPriceLevel];

        attr.paginationSetting.totalCount =
          this.allPriceLevel.length;

        return;
      }

    });
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

  this.selectedRelationId =
    relationId;

  this.loadRelationshipData();
}


onRelationshipExtraDataChanged(
  dataFromChild: any[]
): void {

  this.relationshipTouched = true;

  if (
    !this.relationshipDynamicInputsForViewDto
  ) {
    this.relationshipDynamicInputsForViewDto =
      new GetAppEntityForEditOutput();
  }

  this.relationshipDynamicInputsForViewDto
    .entityExtraData ??= [];

  const existingData =
    this.relationshipDynamicInputsForViewDto
      .entityExtraData;

  const incomingData:
    AppEntityExtraDataDto[] =
      dataFromChild.flatMap(attr => {

        if (
          attr.isLookup &&
          attr.acceptMultipleValues
        ) {

          const values =
            Array.isArray(attr.value)
              ? attr.value
              : [];

          return values.map(value => {

            const dto =
              new AppEntityExtraDataDto();

            dto.attributeId =
              attr.attributeId;

            dto.entityObjectTypeId =
              this.relationshipEntityObjectTypeId;

            dto.entityid =
              this.selectedRelationId;

            dto.attributeValueId =
              Number(value);

            return dto;
          });
        }


        const dto =
          new AppEntityExtraDataDto();

        dto.attributeId =
          attr.attributeId;

        dto.entityObjectTypeId =
          this.relationshipEntityObjectTypeId;

        dto.entityid =
          this.selectedRelationId;


        if (attr.isLookup) {

          const parsedValue =
            Number(attr.value);

          dto.attributeValueId =
            !Number.isNaN(parsedValue)
              ? parsedValue
              : null;

          dto.attributeValue =
            null;

        } else {

          dto.attributeValue =
            attr.value ?? null;

          dto.attributeValueId =
            null;
        }

        return dto;
      });


  const changedIds =
    new Set(
      incomingData.map(
        item => item.attributeId
      )
    );


  const unchanged =
    existingData.filter(
      item =>
        !changedIds.has(
          item.attributeId
        )
    );


  this.relationshipDynamicInputsForViewDto
    .entityExtraData = [
      ...unchanged,
      ...incomingData
    ];


  console.log(
    'RELATION CHANGED:',
    this.relationshipDynamicInputsForViewDto
      .entityExtraData
  );
}
private loadRelationshipData(): void {

  if (!this.selectedRelationId) {
    return;
  }

  this.isLoadingRelationship =
    true;

  this._AppEntitiesServiceProxy
    .getAppEntityForEdit(
      this.selectedRelationId,
      true
    )
    .pipe(
      finalize(() => {
        this.isLoadingRelationship =
          false;
      })
    )
    .subscribe({

      next: result => {

        this.relationshipDynamicInputsForViewDto =
          result;

        this.loadRelationshipAttributes();
      },

      error: err => {

        console.error(
          'Failed to load relationship:',
          err
        );
      }

    });
}
private loadRelationshipAttributes():
  void {

  this._sycEntityObjectTypesServiceProxy
    .getAllWithExtraAttributesByCode(
      'BTB',
      'MARKETPLACECONTACTRELATIONSHIP'
    )
    .pipe(
      finalize(() => {

        this._sycEntityObjectTypesServiceProxy
          .getAllWithExtraAttributes(
            this.relationshipEntityObjectTypeId
          )
          .subscribe(res => {

            if (!res?.length) {
              return;
            }

            this.allRelationshipAttributes =
              res[0]?.extraAttributes
                ?.extraAttributes ??
              [];

          
            this.groupedByUsage =
              this.groupRelationshipAttributesByUsage(
                this.allRelationshipAttributes
              );

            this.usageList =
              Object.keys(
                this.groupedByUsage
              );
              this.applyRelationshipLookupLists();
            this.prepareRelationshipLookupLists();
          });
      })
    )
    .subscribe(res => {

      this.relationshipEntityObjectTypeId =
        res.find(
          x =>
            x.code === 'BTB'
        )?.id ?? 747;
    });
}

private prepareRelationshipLookupLists():
  void {

  this.allRelationshipAttributes
    .forEach((attr: any) => {

      if (!attr.isLookup) {
        return;
      }

      const code =
        String(
          attr.code ??
          attr.attributeCode ??
          attr.name ??
          ''
        )
          .trim()
          .toUpperCase();

      const isSpecialLookup =
        (
          code.includes('SHIP') &&
          code.includes('VIA')
        )
        ||
        (
          code.includes('PAYMENT') &&
          code.includes('TERM')
        )
        ||
        (
          code.includes('PRICE') &&
          code.includes('LEVEL')
        );

      if (isSpecialLookup) {
        return;
      }

      this.loadRelationshipLookupList(
        attr
      );
    });
}

private loadRelationshipLookupList(
  extraAttr: any
): void {

  this._extraAttributeDataService
    .getExtraAttributeLookupDataWithPaging(

      extraAttr.entityObjectTypeCode,

      extraAttr.paginationSetting
        .skipCount,

      extraAttr.paginationSetting
        .maxResultCount
    )
    .subscribe(result => {

      extraAttr.paginationSetting
        .totalCount =
          result.totalCount;

      if (
        extraAttr.paginationSetting
          .skipCount === 0
      ) {

        extraAttr.paginationSetting
          .list = [];
      }

      extraAttr.paginationSetting
        .list.push(
          ...(result.items ?? [])
        );

      extraAttr.paginationSetting
        .skipCount +=
          extraAttr.paginationSetting
            .maxResultCount;
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

  this.relationshipTouched = true;

  const data =
    this.relationshipDynamicInputsForViewDto
      ?.entityExtraData;

  if (!data) {
    return;
  }

  this.relationshipDynamicInputsForViewDto
    .entityExtraData =
      data.filter(
        item =>
          Number(item.attributeId) !==
          Number(attributeId)
      );
}
private groupRelationshipAttributesByUsage(
  attributes: any[]
): Record<string, any[]> {

  return attributes.reduce(
    (
      result:
        Record<string, any[]>,
      attr
    ) => {

      const usage =
        attr.usage ||
        this.l(
          'RelationshipSettings'
        );

      if (!result[usage]) {
        result[usage] = [];
      }

      /*
       * Dynamic inputs expects
       * paginationSetting to exist
       * for lookup attributes.
       */
      if (
        !attr.paginationSetting
      ) {

        attr.paginationSetting = {
          skipCount: 0,
          maxResultCount: 10,
          totalCount: 0,
          list: []
        };
      }

      result[usage].push(
        attr
      );

      return result;
    },
    {}
  );
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
  if (!this.canEditSection('roles')) {
    return;
  }

  if (!this.roleDynamicInputsForViewDto) {
    this.roleDynamicInputsForViewDto =
      new GetAppEntityForEditOutput();
  }

  this.roleDynamicInputsForViewDto
    .entityExtraData ??= [];

  const existingData =
    this.roleDynamicInputsForViewDto
      .entityExtraData;

  const incomingData:
    AppEntityExtraDataDto[] =
      (changedAttributes ?? []).map(
        attribute => {
          const dto =
            new AppEntityExtraDataDto();

          dto.attributeId =
            attribute.attributeId;

          dto.entityObjectTypeId =
            this.roleEntityObjectTypeId;

          /*
           * Use the AppEntity ID.
           */
          dto.entityid =
            this.account?.entityId ??
            null;

          const isMultiSelect =
            attribute
              .acceptMultipleValues === true ||
            String(attribute.dataType)
              .toUpperCase() ===
              'MULTISELECTDROPDOWNLIST';

          if (isMultiSelect) {
            const values =
              Array.isArray(attribute.value)
                ? attribute.value
                : attribute.value
                  ? [attribute.value]
                  : [];

            /*
             * Backend expects a string,
             * not a JavaScript array.
             */
            dto.attributeValue = values
              .map(value =>
                typeof value === 'object'
                  ? value?.value ??
                    value?.label ??
                    ''
                  : value
              )
              .filter(Boolean)
              .join('-');

            dto.attributeValueId = null;
          } else if (attribute.isLookup) {
            const parsedValue =
              Number(attribute.value);

            dto.attributeValueId =
              Number.isNaN(parsedValue)
                ? null
                : parsedValue;

            dto.attributeValue = null;
          } else {
            dto.attributeValue =
              attribute.value ?? '';

            dto.attributeValueId = null;
          }

          return dto;
        }
      );

  const changedAttributeIds =
    new Set(
      incomingData.map(
        item => item.attributeId
      )
    );

  const remainingExistingData =
    existingData.filter(
      item =>
        !changedAttributeIds.has(
          item.attributeId
        )
    );

  const finalExtraData = [
    ...remainingExistingData,
    ...incomingData
  ];

  this.roleDynamicInputsForViewDto
    .entityExtraData = finalExtraData;

  this.entityData.entityExtraData =
    finalExtraData;

  this.account.entityExtraData =
    finalExtraData;

  this.entityData.__extraDataTouched = true;
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
  selectedNodes:
    TreeNodeOfGetSycEntityObjectCategoryForViewDto[]
): void {

  this.account
    .entityCategories ??= [];

  const existingIds =
    new Set(
      this.account
        .entityCategories
        .map(item =>
          Number(
            item
              .entityObjectCategoryId
          )
        )
    );

  const newCategories =
    (selectedNodes ?? [])
      .map(node => {
        const category =
          node?.data
            ?.sycEntityObjectCategory;

        if (!category) {
          return null;
        }

        const dto =
          new AppEntityCategoryDto();

        dto.entityObjectCategoryId =
          category.id;

        dto.entityObjectCategoryCode =
          category.code;

        dto.entityObjectCategoryName =
          category.name;

        return dto;
      })
      .filter(
        (
          item
        ): item is
          AppEntityCategoryDto =>
          !!item &&
          !existingIds.has(
            Number(
              item
                .entityObjectCategoryId
            )
          )
      );

  this.account
    .entityCategories = [
      ...this.account
        .entityCategories,
      ...newCategories
    ];

  this.categoriesIds =
    this.account
      .entityCategories
      .map(item =>
        Number(
          item
            .entityObjectCategoryId
        )
      )
      .filter(id => id > 0);

  this.entityData
    .__categoriesTouched =
    true;

  this.syncCategoryNames();
}
removeCategory(
  index: number
): void {

  if (
    !this.canEditSection(
      'business'
    )
  ) {
    return;
  }

  const categories =
    this.account
      ?.entityCategories;

  if (
    !Array.isArray(
      categories
    ) ||
    index < 0 ||
    index >=
      categories.length
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

      this.account
        .entityCategories =
        categories.filter(
          (
            _,
            currentIndex
          ) =>
            currentIndex !==
            index
        );

      this.categoriesIds =
        this.account
          .entityCategories
          .map(item =>
            Number(
              item
                .entityObjectCategoryId
            )
          )
          .filter(id => id > 0);

      /*
       * This tells buildAccountEditDto()
       * to send the collection, even if
       * the user removed everything.
       */
      this.entityData
        .__categoriesTouched =
        true;

      this.syncCategoryNames();
    }
  );
}

private syncCategoryNames():
  void {

  this.account.categories =
    (
      this.account
        .entityCategories ??
      []
    )
      .map(item =>
        item
          .entityObjectCategoryName
      )
      .filter(Boolean);

  this.entityData.account =
    this.account;
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
  selectedNodes:
    TreeNodeOfGetSycEntityObjectClassificationForViewDto[]
): void {

  this.account
    .entityClassifications ??=
    [];

  const existingIds =
    new Set(
      this.account
        .entityClassifications
        .map(item =>
          Number(
            item
              .entityObjectClassificationId
          )
        )
    );

  const newClassifications =
    (selectedNodes ?? [])
      .map(node => {
        const classification =
          node?.data
            ?.sycEntityObjectClassification;

        if (!classification) {
          return null;
        }

        const dto =
          new AppEntityClassificationDto();

        dto.entityObjectClassificationId =
          classification.id;

        dto.entityObjectClassificationCode =
          classification.code;

        dto.entityObjectClassificationName =
          classification.name;

        return dto;
      })
      .filter(
        (
          item
        ): item is
          AppEntityClassificationDto =>
          !!item &&
          !existingIds.has(
            Number(
              item
                .entityObjectClassificationId
            )
          )
      );

  this.account
    .entityClassifications = [
      ...this.account
        .entityClassifications,
      ...newClassifications
    ];

  this.classificationsIds =
    this.account
      .entityClassifications
      .map(item =>
        Number(
          item
            .entityObjectClassificationId
        )
      )
      .filter(id => id > 0);

  this.entityData
    .__classificationsTouched =
    true;

  this.syncClassificationNames();
}

removeClassification(
  index: number
): void {

  if (
    !this.canEditSection(
      'business'
    )
  ) {
    return;
  }

  const classifications =
    this.account
      ?.entityClassifications;

  if (
    !Array.isArray(
      classifications
    ) ||
    index < 0 ||
    index >=
      classifications.length
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
        .entityClassifications =
        classifications.filter(
          (
            _,
            currentIndex
          ) =>
            currentIndex !==
            index
        );

      this.classificationsIds =
        this.account
          .entityClassifications
          .map(item =>
            Number(
              item
                .entityObjectClassificationId
            )
          )
          .filter(id => id > 0);

      this.entityData
        .__classificationsTouched =
        true;

      this.syncClassificationNames();
    }
  );
}


private syncClassificationNames():
  void {

  this.account.classfications =
    (
      this.account
        .entityClassifications ??
      []
    )
      .map(item =>
        item
          .entityObjectClassificationName
      )
      .filter(Boolean);

  this.entityData.account =
    this.account;
}
private syncBusinessInformation(): void {
  this.account.entityCategories ??= [];
  this.account.entityClassifications ??= [];

  this.entityData.account =
    this.account;

  this.entityData.account.categories =
    this.account.entityCategories.map(
      item =>
        item.entityObjectCategoryName
    );

  this.entityData.account.classfications =
    this.account.entityClassifications.map(
      item =>
        item.entityObjectClassificationName
    );
}

get selectedDepartments():
  AppEntityCategoryDto[] {

  return (
    this.account
      ?.entityCategories ??
    []
  );
}

get selectedClassifications():
  AppEntityClassificationDto[] {

  return (
    this.account
      ?.entityClassifications ??
    []
  );
}

get isManualAccount(): boolean {
  return this.account?.isManual === true;
}

get isConnectedAccount(): boolean {
  return this.account?.isConnected === true;
}

get canEditAccountData(): boolean {
  if (this.mode === 'view') {
    return false;
  }

  if (this.mode === 'create') {
    return true;
  }

  if (this.mode === 'edit') {
    return this.isManualAccount &&
      !this.isConnectedAccount;
  }

  return false;
}
get canEditRelationship(): boolean {
  return this.mode === 'edit';
}


canEditField(fieldName: string): boolean {
  if (!this.canEditAccountData) {
    return false;
  }

  /*
   * SSIN is never manually editable.
   */
  if (fieldName === 'ssin') {
    return false;
  }

  /*
   * Code:
   * editable only during create.
   */
  if (fieldName === 'code') {
    return this.mode === 'create';
  }

  return true;
}

canEditSection(
  section:
    'basic' |
    'business' |
    'roles' |
    'relationship'
): boolean {

  if (section === 'relationship') {
    return this.canEditRelationship;
  }

  return this.canEditAccountData;
}



// saveRelationship(): void {

//   if (
//     !this.relationshipDynamicInputsForViewDto
//       ?.appEntity
//   ) {

//     console.warn(
//       'No relationship AppEntity to save'
//     );

//     return;
//   }


//   const relationshipInput =
//     this.relationshipDynamicInputs
//       ?.first;


//   if (!relationshipInput) {

//     console.warn(
//       'Relationship dynamic input not found'
//     );

//     return;
//   }


//   let appEntityDto =
//     Object.assign(
//       new AppEntityDto(),
//       this.relationshipDynamicInputsForViewDto
//         .appEntity
//     );


//   appEntityDto.entityExtraData =
//     this.relationshipDynamicInputsForViewDto
//       .entityExtraData ?? [];


//   console.log(
//     'RELATION SAVE DTO:',
//     appEntityDto
//   );


//   relationshipInput.saveAll(
//     appEntityDto
//   );
// }

saveRelationship(): void {

  if (!this.relationshipTouched) {
    return;
  }

  if (
    !this.dynamicInputsForViewDto
      ?.appEntity
  ) {

    console.warn(
      'Relationship appEntity is missing'
    );

    return;
  }

  const dynamicInput =
    this.relationshipDynamicInputs
      ?.first;

  if (!dynamicInput) {

    console.warn(
      'Relationship dynamic input not found'
    );

    return;
  }


  const appEntityDto =
    Object.assign(
      new AppEntityDto(),
      this.dynamicInputsForViewDto
        .appEntity
    );


  appEntityDto.entityExtraData =
    this.dynamicInputsForViewDto
      .entityExtraData ?? [];


  console.log(
    'RELATION SAVE ENTITY:',
    appEntityDto
  );


  /*
   * This calls SaveEntity internally,
   * same behavior as old
   * RelationshipSettingsComponent.
   */
  dynamicInput.saveAll(
    appEntityDto
  );


  this.relationshipTouched =
    false;
}

onExtraAttributeCleared(
  attributeId: number
): void {

  this.relationshipTouched = true;

  if (
    !this.dynamicInputsForViewDto
      ?.entityExtraData
  ) {
    return;
  }

  this.dynamicInputsForViewDto
    .entityExtraData =
      this.dynamicInputsForViewDto
        .entityExtraData
        .filter(
          x =>
            Number(x.attributeId) !==
            Number(attributeId)
        );
}
onRoleExtraAttributeCleared(
  attributeId: number
): void {

  if (
    !this.canEditSection('roles')
  ) {
    return;
  }

  const currentData =
    this.roleDynamicInputsForViewDto
      ?.entityExtraData ?? [];

  const updatedData =
    currentData.filter(
      item =>
        Number(item.attributeId) !==
        Number(attributeId)
    );

  if (
    this.roleDynamicInputsForViewDto
  ) {
    this.roleDynamicInputsForViewDto
      .entityExtraData =
        updatedData;
  }

  this.entityData.entityExtraData =
    updatedData;

  this.account.entityExtraData =
    updatedData;

  /*
   * So the parent knows extra data
   * changed and should be sent on save.
   */
  this.entityData.__extraDataTouched =
    true;
}



// private loadRelationshipStaticLookups(): void {

//   this._AppEntitiesServiceProxy
//     .getAllEntitiesByTypeCode('SHIPVIA')
//     .subscribe(result => {
//       this.allShipVia = result ?? [];
//     });

//   this._AppEntitiesServiceProxy
//     .getAllEntitiesByTypeCode('PAYMENT-TERMS')
//     .subscribe(result => {
//       this.allPaymentTerms = result ?? [];
//     });

//   this.allPriceLevel =
//     this.getPriceLevel();
// }

private loadRelationshipStaticLookups():
  Observable<any> {

  return forkJoin({

    shipVia:
      this._AppEntitiesServiceProxy
        .getAllEntitiesByTypeCode(
          'SHIPVIA'
        ),

    paymentTerms:
      this._AppEntitiesServiceProxy
        .getAllEntitiesByTypeCode(
          'PAYMENT-TERMS'
        )

  }).pipe(

    tap(result => {

      this.allShipVia =
        result.shipVia ?? [];

      this.allPaymentTerms =
        result.paymentTerms ?? [];

      this.allPriceLevel =
        this.getPriceLevel();

    })

  );
}

onExtraAttributesChanged(dataFromChild: any[]): void {

  this.relationshipTouched = true;

  if (!this.dynamicInputsForViewDto) {
    return;
  }

  this.dynamicInputsForViewDto.entityExtraData ??= [];

  const existingData =
    this.dynamicInputsForViewDto.entityExtraData;

  const incomingData =
    dataFromChild.flatMap(attr => {

      if (
        attr.isLookup &&
        attr.acceptMultipleValues
      ) {
        const values =
          Array.isArray(attr.value)
            ? attr.value
            : [];

        return values.map(value => {

          const dto =
            new AppEntityExtraDataDto();

          dto.attributeId =
            attr.attributeId;

          dto.entityObjectTypeId =
            this.relationshipEntityObjectTypeId;

          dto.entityid =
            this.selectedRelationId;

          dto.attributeValueId =
            Number(value);

          return dto;
        });
      }

      const dto =
        new AppEntityExtraDataDto();

      dto.attributeId =
        attr.attributeId;

      dto.entityObjectTypeId =
        this.relationshipEntityObjectTypeId;

      dto.entityid =
        this.selectedRelationId;

      if (attr.isLookup) {

        const value =
          Number(attr.value);

        dto.attributeValueId =
          !isNaN(value)
            ? value
            : null;

      } else {

        dto.attributeValue =
          attr.value;
      }

      return dto;
    });

  const changedIds =
    new Set(
      incomingData.map(x => x.attributeId)
    );

  const oldUnchanged =
    existingData.filter(
      x => !changedIds.has(x.attributeId)
    );

  this.dynamicInputsForViewDto.entityExtraData = [
    ...oldUnchanged,
    ...incomingData
  ];
}


saveRelationshipEntity():
  Observable<any> {

  console.log(
    'saveRelationshipEntity called',
    {
      touched:
        this.relationshipTouched,

      dto:
        this.relationshipDynamicInputsForViewDto,

      selectedRelationId:
        this.selectedRelationId
    }
  );


  if (!this.relationshipTouched) {

    console.log(
      'Relationship unchanged - skip SaveEntity'
    );

    return of(null);
  }


  const relationshipDto =
    this.relationshipDynamicInputsForViewDto;


  if (!relationshipDto?.appEntity) {

    console.warn(
      'Relationship appEntity missing',
      relationshipDto
    );

    return of(null);
  }


  const dto =
    Object.assign(
      new AppEntityDto(),
      relationshipDto.appEntity
    );


  dto.entityExtraData =
    relationshipDto.entityExtraData ?? [];


  console.log(
    'CALLING SaveEntity:',
    dto
  );


  return this._AppEntitiesServiceProxy
    .saveEntity(dto)
    .pipe(

      tap(result => {

        console.log(
          'SaveEntity result:',
          result
        );

        this.relationshipTouched =
          false;
      })

    );
}

}