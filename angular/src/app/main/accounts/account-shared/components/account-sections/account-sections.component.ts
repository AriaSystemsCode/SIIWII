import {
  Component,
  Injector,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';

import { AppComponentBase } from '@shared/common/app-component-base';
import {
  AccountsServiceProxy,
  AppEntitiesServiceProxy,
  AppEntityExtraDataDto,
  ConnectionInfo,
  CurrencyInfoDto,
  GetAppEntityForEditOutput,
  LookupLabelDto,
  SycEntityObjectTypesServiceProxy
} from '@shared/service-proxies/service-proxies';
import { forkJoin } from 'rxjs';
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
  constructor(
    injector: Injector,
    private _accountsServiceProxy: AccountsServiceProxy,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
       
  private _sycEntityObjectTypesServiceProxy:
    SycEntityObjectTypesServiceProxy
  ) {
    super(injector);
  }

  ngOnInit(): void {
  // this.loadLookups();

  // if (this.accountId) {
  //   this.getAccountDataForView();
  // } else if (this.entityData?.account) {
  //   this.setAccountData(this.entityData);
  // }

    this.loadLookups();

  if (this.entityData?.account) {
    this.setAccountData(this.entityData);
    
  }
}
 ngOnChanges(changes: SimpleChanges): void {
  // if (
  //   changes.accountId &&
  //   this.accountId &&
  //   changes.accountId.currentValue !== changes.accountId.previousValue
  // ) {
  //   this.getAccountDataForView();
  //   return;
  // }

  // if (changes.entityData?.currentValue?.account && !this.accountId) {
  //   this.setAccountData(changes.entityData.currentValue);
  // }

    if (changes.entityData?.currentValue?.account) {
    this.setAccountData(changes.entityData.currentValue);
  }

        this.initDepartmentVariables(true);
            this.initClassificationVariables(true);
}
trackByValue(index: number, value: string): string {
  return value || index.toString();
}
  // private setAccountData(data: any): void {
  //   this.entityData = data;

  //   this.account = data?.account ?? {};

  //   this.mainBranch =
  //     this.account?.branches?.[0]?.data?.branch ??
  //     this.createEmptyMainBranch();

  //   this.loadedAccountId = this.account?.id ?? this.accountId ?? null;
  // }

//   private setAccountData(data: any): void {
//   this.entityData = data;

//   this.account = data?.account ?? {};

//   this.mainBranch =
//     this.account?.branches?.[0]?.data?.branch ??
//     this.createEmptyMainBranch();

//   this.loadedAccountId =
//     this.account?.id ??
//     this.accountId ??
//     null;

//   this.connectionsInfo =
//     data?.connectionsInfo ??
//     this.account?.connectionsInfo ??
//     [];

//   this.initializeRelationshipSection();
// }

private setAccountData(data: any): void {
  this.entityData = data;
  this.account = data?.account ?? {};
    this.roleEntityObjectTypeId = this.entityData?.account?.accountTypeId

  this.mainBranch =
    this.account?.branches?.[0]?.data?.branch ??
    this.createEmptyMainBranch();

  this.loadedAccountId =
    this.account?.id ??
    this.accountId ??
    null;

  this.connectionsInfo =
    data?.connectionsInfo ??
    this.account?.connectionsInfo ??
    [];

  this.initializeRolesSection();
  this.initializeRelationshipSection();
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

    const matchedValues = accountExtraData.filter(
      item =>
        item.attributeId === attribute.attributeId
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
      extraAttributeId: attribute.attributeId,
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
}