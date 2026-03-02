import { Component, Injector, Input, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppEntityExtraDataDto, GetAppEntityForEditOutput } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-relationship-settings',
  templateUrl: './relationship-settings.component.html',
  styleUrls: ['./relationship-settings.component.scss']
})

export class RelationshipSettingsComponent extends AppComponentBase implements OnInit {
  @Input() accountId!: number;
  dynamicInputsForViewDto: GetAppEntityForEditOutput;
  entityObjectTypeTenantId: number;
  tenantEntityId: number;
  usageList: string[] = [];


  
    constructor(
      injector: Injector
    ) {
      super(injector);
    }
  
    ngOnInit(): void {
      this.getAppItemTypeExtraAttributesById();
    }

     getAppItemTypeExtraAttributesById() {
       
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
            d.entityObjectTypeId = this.entityObjectTypeTenantId;
            d.entityid = this.tenantEntityId;
            d.attributeValueId = v;
            return d;
          });
        } else {
          const dto = new AppEntityExtraDataDto();
          dto.attributeId = attr.attributeId;
          dto.entityObjectTypeId = this.entityObjectTypeTenantId;
          dto.entityid = this.tenantEntityId;
          if (attr.isLookup) {
            dto.attributeValueId = attr.value;
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

}
