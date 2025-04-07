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
   @Input() createOrEdit: boolean = true;
@Input() canChange: boolean = true;
@Output() extraDataCleared = new EventEmitter<number>(); // send attributeId

@Output() toggleEditMode = new EventEmitter<boolean>();
hasUserInteracted = false;

selectedExtraData: any[] = [];
@Input() appTransactionsForViewDto: any;


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
      
        // Add all previously selected values to map
        for (const item of this.selectedExtraData) {
          updatedDataMap.set(item.attributeId, item);
        }
      
        // Update or add new values
        if (this.extraAttributeObject?.value?.extraAttributes) {
          for (const attr of this.extraAttributeObject.value.extraAttributes) {
            if (attr.selectedValues != null && attr.selectedValues !== '') {
              let formattedValue = attr.selectedValues;
      
              if (attr.dataType === 'Datetime' && formattedValue instanceof Date) {
                formattedValue = formattedValue.toISOString(); // or custom format
              }
      
              const updatedValue = {
                attributeId: attr.attributeId,
                value: formattedValue,
                isLookup: attr.isLookup,
                acceptMultipleValues: attr.acceptMultipleValues
              };
      
              updatedDataMap.set(attr.attributeId, updatedValue);
            }
          }
        }
      
        // Final merged array
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
      
        // ✅ Important: also clear original source
        const matchedAttr = this.extraAttributeObject?.value?.extraAttributes?.find(
          a => a.attributeId === attr.attributeId
        );
        if (matchedAttr) {
          if (matchedAttr.acceptMultipleValues) {
            matchedAttr.selectedValues = [];
          } else {
            matchedAttr.selectedValues = null;
          }
        }
      
        // Clean DTO
        const dtoData = this.appTransactionsForViewDto?.extraDataAttributes;
        if (dtoData) {
          const matchedDto = dtoData.find(d => d.extraAttributeId === attr.attributeId);
          if (matchedDto) {
            matchedDto.selectedValues = [];
          }
        }
      
        // Clean emitted data
        this.selectedExtraData = this.selectedExtraData.filter(
          x => x.attributeId !== attr.attributeId
        );
      
        this.extraDataChanged.emit(this.selectedExtraData);
        this.extraDataCleared.emit(attr.attributeId); // 🔥 parent notified
        console.log('🧹 Attribute cleared and notified parent:', attr.attributeId);
      }
      
      
      
      
      
}
