
import { Component, EventEmitter, Injector, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppAdvertisementsServiceProxy, GetAppAdvertisementForViewDto, SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-dynamicInputs',
  templateUrl: './dynamicInputs.component.html',
  styleUrls: ['./dynamicInputs.component.scss'],
  animations: [appModuleAnimation()]
})
export class dynamicInputs implements OnInit, OnChanges {
  @Input("extraAttributeObject") extraAttributeObject;
  @Input("entityType") entityType;
  @Input("entityObjectTypeId") entityObjectTypeId;
  @Output() extraDataChanged = new EventEmitter<any[]>();
  @Output() extraDataCleared = new EventEmitter<number>(); // send attributeId
  selectedExtraData: any[] = [];
  @Input() appTransactionsForViewDto: any;
  originalValuesMap = new Map<number, any>();
  @Input() fromSetting:boolean =false;

  openCalendar(calendar: any) {
    calendar.overlayVisible = true;
  }
  ngOnChanges() {
    this.fillSelectedValuesFromDto();
    this.onAnyInputChange();
  }
  onAnyInputChange() {


    const updatedDataMap = new Map<number, any>();

    // Preserve existing values
    for (const item of this.selectedExtraData) {
      updatedDataMap.set(item.attributeId, item);
    }

    if (this.extraAttributeObject?.value?.filteredExtraAttributes) {
      for (const attr of this.extraAttributeObject.value.filteredExtraAttributes) {

        if (attr.isSelectedOnVariation || attr.isVariation) {
          continue;
        }

        let formattedValue = attr.selectedValues;

        // ✅ Handle Datetime
        if (attr.dataType === 'Datetime') {
          const dateValue = new Date(formattedValue);

          if (!formattedValue || formattedValue === 'Invalid Date' || isNaN(dateValue.getTime())) {
            formattedValue = '';
          } else {
            formattedValue = dateValue.toISOString();
            if (formattedValue === '1970-01-01T00:00:00.000Z') {
              const originalValue = this.originalValuesMap.get(attr.attributeId);
              formattedValue = originalValue || '';
            }
          }
        }

        // ✅ Handle String input
        if (attr.dataType === 'string' && !attr.isLookup) {
          if (!formattedValue || formattedValue === null || formattedValue === undefined || formattedValue.toString().trim() === '') {
            formattedValue = '';
          }
        }

        // ✅ Handle Numeric input
        if (attr.dataType === 'Numeric') {
          if (formattedValue === null || formattedValue === undefined || formattedValue === '') {
            formattedValue = '';
          }
        }

        // ✅ Handle Boolean / Bit
        if (attr.dataType === 'boolean' || attr.dataType === 'bit') {
          if (formattedValue === null || formattedValue === undefined || formattedValue === '') {
            formattedValue = '';
          }
        }

        const originalValue = this.originalValuesMap.get(attr.attributeId);
        const isSame = JSON.stringify(originalValue) === JSON.stringify(formattedValue);

        let finalValue;

        if (attr.acceptMultipleValues && Array.isArray(formattedValue)) {
          finalValue = formattedValue.length ? formattedValue : [];
        } else if (!attr.acceptMultipleValues && (formattedValue === undefined || formattedValue === null || formattedValue === '')) {
          finalValue = ''; // ✅ always send empty string
        } else if (!isSame) {
          finalValue = formattedValue;
        } else {
          finalValue = formattedValue || '';
        }

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
  }





  fillSelectedValuesFromDto() {
    //i49- data should be like this 
    if (!this.extraAttributeObject?.value?.extraAttributes || !this.appTransactionsForViewDto?.extraDataAttributes) {
      return;
    }

    const dtoData = this.appTransactionsForViewDto.extraDataAttributes;

    const allAttributes = [
      ...(this.extraAttributeObject.value.extraAttributes || []),
      ...(this.extraAttributeObject.value.filteredExtraAttributes || [])
    ];

    for (const attr of allAttributes) {
      const matchedDto = dtoData.find(d => d.extraAttributeId === attr.attributeId);

      if (matchedDto && matchedDto.selectedValues?.length) {
        const dtoValue = matchedDto.selectedValues[matchedDto.selectedValues.length - 1].value;

        if (attr.isLookup) {
          const matchedOption = attr.paginationSetting?.list?.find(opt => {
            return opt.label === dtoValue || opt.value === dtoValue;
          });

          if (matchedOption) {
            attr.selectedValues = matchedOption.value;
          } else {
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
        this.originalValuesMap.set(attr.attributeId, attr.selectedValues);
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
      this.selectedExtraData[existingIndex].value = attr.acceptMultipleValues ? [] : '';
    } else {
      // If not found, push a new clean entry
      this.selectedExtraData.push({
        attributeId: attr.attributeId,
        value: attr.acceptMultipleValues ? [] : '',
        isLookup: attr.isLookup,
        acceptMultipleValues: attr.acceptMultipleValues
      });
    }

    this.extraDataChanged.emit(this.selectedExtraData);
  }


  ngOnInit(): void {
    this.fillSelectedValuesFromDto();
    setTimeout(() => this.onAnyInputChange(), 0);
  }

  isArray(val: any): boolean {
    return Array.isArray(val);
  }
  onCheckboxChange(checked: boolean, value: any, extraAttr: any): void {
    if (!Array.isArray(extraAttr.selectedValues)) {
      extraAttr.selectedValues = [];
    }
    if (checked) {
      if (!extraAttr.selectedValues.includes(value)) {
        extraAttr.selectedValues.push(value);
      }
    } else {
      extraAttr.selectedValues = extraAttr.selectedValues.filter(val => val !== value);
    }
    this.onAnyInputChange(); // emit changes
  }
}
