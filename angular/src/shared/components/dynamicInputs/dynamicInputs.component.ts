import { Component, EventEmitter, Injector, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppAdvertisementsServiceProxy, GetAppAdvertisementForViewDto, SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-dynamicInputs',
    templateUrl: './dynamicInputs.component.html',
    styleUrls: ['./dynamicInputs.component.scss'],
    animations:[appModuleAnimation()]
})
export class dynamicInputs implements OnInit,OnChanges {
   @Input("extraAttributeObject") extraAttributeObject;
   @Input("entityType") entityType;
   @Input("entityObjectTypeId") entityObjectTypeId;
   @Output() extraDataChanged = new EventEmitter<any[]>();
@Output() extraDataCleared = new EventEmitter<number>(); // send attributeId
selectedExtraData: any[] = [];
@Input() appTransactionsForViewDto: any;
originalValuesMap = new Map<number, any>();


    ngOnInit(): void {
      this.fillSelectedValuesFromDto();
    }
    openCalendar(calendar: any) {
        calendar.overlayVisible = true;
      }
    ngOnChanges(){
      this.fillSelectedValuesFromDto();
        this.onAnyInputChange();
    }
    onAnyInputChange() {
      if (!this.selectedExtraData) {
        this.selectedExtraData = [];
      }
    
      const updatedDataMap = new Map<number, any>();
    
      // Preserve existing values
      for (const item of this.selectedExtraData) {
        updatedDataMap.set(item.attributeId, item);
      }
    
      if (this.extraAttributeObject?.value?.filteredExtraAttributes) {
        for (const attr of this.extraAttributeObject.value.filteredExtraAttributes) {

          // ✅ Skip hidden fields
          if (attr.isSelectedOnVariation || attr.isVariation) {
            continue;
          }
        
          let formattedValue = attr.selectedValues;
        
          // ✅ Handle datetime formatting and empty input case
          if (attr.dataType === 'Datetime') {
            const dateValue = new Date(formattedValue);
        
            if (!formattedValue || formattedValue === 'Invalid Date' || isNaN(dateValue.getTime())) {
              formattedValue = null;
            } else {
              formattedValue = dateValue.toISOString();
        
              // ✅ If it is epoch (1970) and original value exists, treat as unchanged
              if (formattedValue === '1970-01-01T00:00:00.000Z') {
                const originalValue = this.originalValuesMap.get(attr.attributeId);
                if (originalValue) {
                  formattedValue = originalValue; // keep original value
                }
              }
            }
          }
        
          const originalValue = this.originalValuesMap.get(attr.attributeId);
          const isSame = JSON.stringify(originalValue) === JSON.stringify(formattedValue);
        
          const finalValue = (!isSame && formattedValue != null) ? formattedValue : null;
        
          const updatedValue = {
            attributeId: attr.attributeId,
            value: finalValue,
            isLookup: attr.isLookup === true,
            acceptMultipleValues: attr.acceptMultipleValues === true
          };
        
          updatedDataMap.set(attr.attributeId, updatedValue);
        }
        
      }
      
    
      this.selectedExtraData = Array.from(updatedDataMap.values());
    
      this.extraDataChanged.emit(this.selectedExtraData);
      console.log('✅ Final emitted data:', this.selectedExtraData);
    }
    
      
      
      fillSelectedValuesFromDto() {
        if (!this.extraAttributeObject?.value?.extraAttributes || !this.appTransactionsForViewDto?.extraDataAttributes) {
          return;
        }
      
        const dtoData = this.appTransactionsForViewDto.extraDataAttributes;
      
        for (const attr of this.extraAttributeObject.value.extraAttributes) {
          const matchedDto = dtoData.find(d => d.extraAttributeId === attr.attributeId);
        
          if (matchedDto && matchedDto.selectedValues?.length) {
            const dtoValue = matchedDto.selectedValues[matchedDto.selectedValues.length - 1].value; // ✅ Take last value
        
            if (attr.isLookup) {
              const matchedOption = attr.paginationSetting?.list?.find(opt => {
                return opt.label === dtoValue || opt.value === dtoValue;
              });
        
              if (matchedOption) {
                attr.selectedValues = matchedOption.value;
              } else {
                // Option not in list: push manually
                const manualOption = {
                  value: dtoValue,
                  label: dtoValue,
                  code: null,
                  isHostRecord: false,
                  stockAvailability: null,
                  image: null,
                  hexaCode: null
                };
                attr.paginationSetting.list.push(manualOption);
                attr.selectedValues = manualOption.value;
              }
            } else if (attr.dataType === 'Datetime' && typeof dtoValue === 'string') {
              attr.selectedValues = new Date(dtoValue);
            } else {
              attr.selectedValues = dtoValue;
            }
          }
        }
        
      }
      
      
      clearExtraAttr(attr: any) {
        if (attr.acceptMultipleValues) {
          attr.selectedValues = [];
        } else {
          attr.selectedValues = null;
        }
      
        //  Also clear original source value 
        const matchedAttr = this.extraAttributeObject?.value?.extraAttributes?.find(
          a => a.attributeId === attr.attributeId
        );
        if (matchedAttr) {
          matchedAttr.selectedValues = attr.selectedValues;
        }
      
        //  Update selectedExtraData to keep the attributeId, but empty value
        const existingIndex = this.selectedExtraData.findIndex(
          x => x.attributeId === attr.attributeId
        );
      
        if (existingIndex !== -1) {
          this.selectedExtraData[existingIndex].value = attr.acceptMultipleValues ? [] : null;
        } else {
          // If not found, push a new clean entry
          this.selectedExtraData.push({
            attributeId: attr.attributeId,
            value: attr.acceptMultipleValues ? [] : null,
            isLookup: attr.isLookup,
            acceptMultipleValues: attr.acceptMultipleValues
          });
        }
      
        this.extraDataChanged.emit(this.selectedExtraData);
        console.log(' Attribute cleared (but kept in data):', this.selectedExtraData);
      }
      
      
      
      
      
}
