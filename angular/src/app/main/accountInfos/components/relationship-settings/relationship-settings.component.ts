import { Component, Injector, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CreateEditAppItemExtraAttribute } from '@app/main/app-items/app-item-shared/models/create-edit-app-item-extra-attribute';
import { FilteredExtraAttribute } from '@app/main/app-items/app-item-shared/models/filtered-extra-attribute';
import { ExtraAttributeDataService } from '@app/main/app-items/app-item-shared/services/extra-attribute-data.service';
import { EExtraAttributeUsage } from '@app/main/app-items/appItems/models/extra-attribute-usage.enum';
import { SelectItem } from '@node_modules/primeng/api';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppEntitiesServiceProxy, AppEntityDto, AppEntityExtraDataDto, GetAppEntityForEditOutput, LookupLabelDto, SycEntityObjectTypesServiceProxy } from '@shared/service-proxies/service-proxies';
import { dynamicInputs } from '@shared/components/dynamicInputs/dynamicInputs.component';
@Component({
  selector: 'app-relationship-settings',
  templateUrl: './relationship-settings.component.html',
  styleUrls: ['./relationship-settings.component.scss']
})

export class RelationshipSettingsComponent extends AppComponentBase implements OnInit {
  @Input() accountId!: number;
  @Input() relationId!: number;
  dynamicInputsForViewDto: GetAppEntityForEditOutput;
  entityObjectTypeId: number = 747;
  allAttributes = []; // flat list from API
  groupedByUsage = {}; // { RECOMMENDED: [], ADDITIONAL: [] }
  usageList: string[] = []; // for sidebar
  selectedUsage: string;
  selectedTransTypeData: any;
  extraAttributes: any;
  activeAccordionIndexes: number[] = [0]; // open first tab by default

@ViewChildren('appdynamicInputs')
dynamicInputsComponents!: QueryList<dynamicInputs>;
  @Input() connnectionInfo=[];

  constructor(
    injector: Injector,
    private _sycEntityObjectTypesServiceProxy: SycEntityObjectTypesServiceProxy,
    private _extraAttributeDataService: ExtraAttributeDataService,
    private _appEntitiesServiceProxy : AppEntitiesServiceProxy
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.stopFormListening = true;
    this.getRelations();
  }

  getData() {
    this.getRelationshipSettingsData()
    this.getAppItemTypeExtraAttributesById()
  }

  getRelations() {
    //i49-get relations
    const defaultId = this.connnectionInfo?.[0]?.id ?? this.relationId;
    this.onRelationshipOptionChange(defaultId);
  }

  onRelationshipOptionChange(relationId: number) {
    this.relationId = relationId;
    this.getData();
}
  getRelationshipSettingsData() {
    if(this.relationId){
      this._appEntitiesServiceProxy.getAppEntityForEdit(this.relationId).subscribe(result => {
        this.dynamicInputsForViewDto = result;
      });
    }
  }

  getAppItemTypeExtraAttributesById() {
   this._sycEntityObjectTypesServiceProxy.getAllWithExtraAttributesByCode('BTB', 'MARKETPLACECONTACTRELATIONSHIP').pipe(finalize(() => {
      this._sycEntityObjectTypesServiceProxy.getAllWithExtraAttributes(
        this.entityObjectTypeId)
        .subscribe((res) => {
          if (res?.length > 0) {
            this.allAttributes = res[0]?.extraAttributes.extraAttributes;

            // Group attributes by `usage`
            this.groupedByUsage = this.groupAttributesByUsage(this.allAttributes);
            this.usageList = Object.keys(this.groupedByUsage);
            this.selectedUsage = this.usageList[0];

            // ✅ Initialize extraAttributes before using it
            this.selectedTransTypeData = res[0]; // ensure defineExtraAttributes uses correct data
            this.defineExtraAttributes();

            this.loadRelationshipSettings();

            setTimeout(() => this.scrollToUsage(this.selectedUsage), 200);
          }
        });
    })).subscribe((res) => {
      this.entityObjectTypeId = res.find(x => x.code === 'BTB')?.id ?? 747;
    });
  }

  groupAttributesByUsage(attrs: any[]): any {
    return attrs.reduce((acc, attr) => {
      const usage = attr.usage || this.l("RelationshipSettings");
      if (!acc[usage]) acc[usage] = [];
      acc[usage].push(attr);
      return acc;
    }, {});
  }

  selectUsage(usage: string): void {
    this.selectedUsage = usage;
  }

  defineExtraAttributes() {
    this.extraAttributes = {};

    const allAttributes = this.selectedTransTypeData?.extraAttributes?.extraAttributes ?? [];

    allAttributes.forEach(attr => {
      const usageKey = attr.usage?.replace(/\s+/g, '_').toUpperCase() || 'DEFAULT';

      if (!this.extraAttributes[usageKey]) {
        this.extraAttributes[usageKey] = new CreateEditAppItemExtraAttribute({
          header: this.l(attr.usage),
          title: this.l(attr.usage),
          usageEnum: usageKey as unknown as EExtraAttributeUsage,
          orderOfDisplay: 1,
          filteredExtraAttributes: [],
          extraAttributes: []
        });
      }

      // ✅ Add this if missing
      if (!attr.paginationSetting) {
        attr.paginationSetting = {
          skipCount: 0,
          maxResultCount: 10,
          totalCount: 0,
          list: []
        };
      }



      this.extraAttributes[usageKey].filteredExtraAttributes.push(attr);
    });

  }

  loadRelationshipSettings() {
    if (!this.extraAttributes || typeof this.extraAttributes !== 'object') {
      return;
    }

    Object.keys(this.extraAttributes).forEach(key => {
      const group = this.extraAttributes[key];
      group.filteredExtraAttributes.forEach(extraAttr => {
        if (extraAttr.isLookup) {
          this.loadExtraDataLookupList(extraAttr);
        }
      });
    });
  }

  loadExtraDataLookupList(extraAttr: FilteredExtraAttribute) {
    this._extraAttributeDataService
      .getExtraAttributeLookupDataWithPaging(
        extraAttr.entityObjectTypeCode,
        extraAttr.paginationSetting.skipCount,
        extraAttr.paginationSetting.maxResultCount
      )
      .subscribe((result) => {
        extraAttr.paginationSetting.totalCount = result.totalCount;
        if (extraAttr.paginationSetting.skipCount == 0)
          extraAttr.paginationSetting.list = [];
        else
          extraAttr.paginationSetting.list.splice(
            extraAttr.paginationSetting.list.length - 1,
            1
          );
        let isExist = result.items.filter((item) => { return item.value == extraAttr.attributeId });
        if ((isExist!.length == 0 || isExist == undefined) && extraAttr?.selectedValues?.length > 0) {

        

          const index = result.items.findIndex(item =>
            item.value == extraAttr.selectedValues ||
            (item.label || '').toLowerCase().trim() === (extraAttr.selectedValues || '').toString().toLowerCase().trim()
          );

          let finalLabel;

          if (index > -1) {
            finalLabel = result.items[index].label;
            result.items.splice(index, 1);
          } else 
            finalLabel = extraAttr.selectedValues;
          

          const newItem = new LookupLabelDto({
            code: extraAttr.code,
            label: finalLabel,
            stockAvailability: undefined,
            value: extraAttr.selectedValues,
            isHostRecord: false,
            hexaCode: undefined,
            image: undefined,
            status: undefined,
            entityObjectStatusId: undefined
          });
          result.items.push(newItem);
        }

        extraAttr.paginationSetting.list.push(...result.items);
        if (
          extraAttr.paginationSetting.list.length <
          extraAttr.paginationSetting.totalCount
        ) {
          const showMoreSelectItem: SelectItem = {
            value: -1,
            label: this.l("showMore"),
            icon: "fas  fa-reply",
            styleClass: "showMore",
            disabled: false,
          };
          extraAttr.paginationSetting.list.push(showMoreSelectItem);
        }
        extraAttr.paginationSetting.skipCount +=
          extraAttr.paginationSetting.maxResultCount;
      });
  }


  scrollToUsage(usage: string): void {
    this.selectedUsage = usage;

    const index = this.usageList.indexOf(usage);
    if (index !== -1) {
      // Expand only the clicked tab
      this.activeAccordionIndexes = [index];

      // Scroll to the section
      setTimeout(() => {
        const element = document.getElementById('usage_' + usage);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }
  onExtraAttributesChanged(dataFromChild: any[]) {
    this.formTouched = true;
    if (!this.dynamicInputsForViewDto) {
      this.dynamicInputsForViewDto = new GetAppEntityForEditOutput();
    }

    if (!this.dynamicInputsForViewDto.entityExtraData) {
      this.dynamicInputsForViewDto.entityExtraData = [];
    }

    const existingData = this.dynamicInputsForViewDto.entityExtraData;

    // Step 1: Map incoming data cleanly
    const incomingData: AppEntityExtraDataDto[] = dataFromChild.flatMap(attr => {
      if (attr.isLookup && attr.acceptMultipleValues) {
        return (attr.value || []).map(v => {
          const d = new AppEntityExtraDataDto();
          d.attributeId = attr.attributeId;
          d.entityObjectTypeId = this.entityObjectTypeId;
          d.entityid = this.relationId;
          d.attributeValueId = v;
          return d;
        });
      } else {
        const dto = new AppEntityExtraDataDto();
        dto.attributeId = attr.attributeId;
        dto.entityObjectTypeId = this.entityObjectTypeId;
        dto.entityid = this.relationId;

        if (attr.isLookup) {
          const parsedValue = Number(attr.value);

          dto.attributeValueId = !isNaN(parsedValue) ? parsedValue : null;
        } else {
          dto.attributeValue = attr.value;
        }
        return dto;
      }
    });

    // ✅ Step 2: No filter — keep all values
    const cleanIncomingData = incomingData;

    // Step 3: Remove old entries for incoming attributeIds
    const incomingAttributeIds = new Set(cleanIncomingData.map(d => d.attributeId));
    const filteredExistingData = existingData.filter(
      d => !incomingAttributeIds.has(d.attributeId)
    );

    // Step 4: Merge clean incoming data
    const finalData = [...filteredExistingData, ...cleanIncomingData];
    console.log(finalData, 'finalData')

    this.dynamicInputsForViewDto.entityExtraData = finalData;
  }

  onExtraAttributeCleared(attributeId: number) {
    const data = this.dynamicInputsForViewDto?.entityExtraData;
    if (data && data.length > 0) {
      let index = -1;
      while ((index = data.findIndex(x => x.attributeId === attributeId)) !== -1) {
        data.splice(index, 1);
      }

    }
  }
  
  saveAll(): void {
    this.showMainSpinner();
  
    let appEntityDto: AppEntityDto = new AppEntityDto();
    appEntityDto.entityExtraData = this.dynamicInputsForViewDto?.entityExtraData || [];
    appEntityDto.id = this.relationId;
    appEntityDto.entityObjectTypeId = this.entityObjectTypeId;
    appEntityDto.objectId = 2;
    appEntityDto.tenantId = this.appSession.tenantId;
    appEntityDto.code = this.dynamicInputsForViewDto.appEntity.code;
    appEntityDto.name = this.dynamicInputsForViewDto.appEntity.name
      //i49-save relations values ??      appEntityDto.entityObjectTypeId= this.relationId

         this.dynamicInputsComponents.first.saveAll(appEntityDto);

  }

}
