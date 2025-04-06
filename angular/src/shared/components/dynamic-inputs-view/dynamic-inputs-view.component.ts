import { Component, EventEmitter, Injector, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { ShoppingCartoccordionTabs } from '@app/admin/app-shoppingCart/Components/shopping-cart-view-component/ShoppingCartoccordionTabs';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppAdvertisementsServiceProxy, GetAppAdvertisementForViewDto, GetAppTransactionsForViewDto, SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-dynamicInputs-view',
    templateUrl: './dynamic-inputs-view.component.html',
    styleUrls: ['./dynamic-inputs-view.component.scss'],

})
export class dynamicInputsView implements OnInit {

    @Input("isCreateOrEdit") isCreateOrEdit: boolean;
    @Input("activeTab") activeTab: number;
    @Input("currentTab") currentTab: number;
    @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
    shoppingCartoccordionTabs = ShoppingCartoccordionTabs;
    @Output("onshowSaveBtn") onshowSaveBtn: EventEmitter<boolean> = new EventEmitter<boolean>()

    

    @Input("canChange")  canChange:boolean=true;



    @Input() entityExtraData: any[] = [];
    @Input() extraAttributeMeta: any[] = []; // Metadata: name, dataType, id, etc.
  
    extraAttributesToShow: { name: string; value: any }[] = [];
  
    ngOnInit(): void {
        if (this.isReady) {
          this.extraAttributesToShow = this.entityExtraData.map((attr) => {
            const meta = this.extraAttributeMeta.find(m => m.attributeId === attr.attributeId);
            let value = attr.attributeValueId ?? attr.attributeValue;
            if (meta?.dataType === 'Datetime' && value) {
              value = new Date(value).toLocaleDateString();
            }
            return {
              name: meta?.name || `Attribute ${attr.attributeId}`,
              value: value,
            };
          });
        }
      }
      

    get isReady(): boolean {
        return Array.isArray(this.entityExtraData) && Array.isArray(this.extraAttributeMeta);
      }
      
      ngOnChanges(): void {
        this.setupAttributes();
      }
      
      setupAttributes() {
        if (this.entityExtraData?.length && this.extraAttributeMeta?.length) {
          this.extraAttributesToShow = this.entityExtraData.map((attr) => {
            const meta = this.extraAttributeMeta.find(
              (m) => m.attributeId === attr.attributeId
            );
            let value = attr.attributeValueId ?? attr.attributeValue;
            if (meta?.dataType === 'Datetime' && value) {
              value = new Date(value).toLocaleDateString();
            }
            return {
              name: meta?.name || `Attribute ${attr.attributeId}`,
              value: value,
            };
          });
        }
      }
      
      getAttributeDisplayValue(attrMeta: any): any {
        const attr = this.entityExtraData.find(d => d.attributeId === attrMeta.attributeId);
      
        if (!attr) return null;
      
        let value = attr.attributeValueId ?? attr.attributeValue;
      
        if (attrMeta?.dataType === 'Datetime' && value) {
          value = new Date(value).toLocaleDateString();
        }
      
        return value;
      }
      
  showEditMode() {
    this.isCreateOrEdit = true;
    this.onshowSaveBtn.emit(true);
  
  }
}
