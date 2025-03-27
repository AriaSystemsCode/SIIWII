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

@Output() toggleEditMode = new EventEmitter<boolean>();
hasUserInteracted = false;

selectedExtraData: any[] = [];

    ngOnInit(): void {
    }
    openCalendar(calendar: any) {
        calendar.overlayVisible = true;
      }
    ngOnChanges(){
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
      
      
      
      clearExtraAttr(attr: any) {
        attr.selectedValues = null;
      
        // Remove from selectedExtraData immediately
        this.selectedExtraData = this.selectedExtraData.filter(
          x => x.attributeId !== attr.attributeId
        );
      
        this.extraDataChanged.emit(this.selectedExtraData);
        console.log('🧹 Attribute cleared:', attr.attributeId);
      }
      
      
}
