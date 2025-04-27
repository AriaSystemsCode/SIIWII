import { ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { TransactionCartoccordionTabs } from '@app/main/transactions/app-TransactionTabsInfo/Components/transaction-information-component/TransactionCartoccordionTabs';

import { AppComponentBase } from '@shared/common/app-component-base';
import { AppAdvertisementsServiceProxy, GetAppAdvertisementForViewDto, GetAppTransactionsForViewDto, SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-dynamicInputs-view',
    templateUrl: './dynamic-inputs-view.component.html',
    styleUrls: ['./dynamic-inputs-view.component.scss'],

})
export class dynamicInputsView   extends AppComponentBase implements OnInit {

    @Input("isCreateOrEdit") isCreateOrEdit: boolean;
    @Input("activeTab") activeTab: number;
    @Input("currentTab") currentTab: number;
    @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
    shoppingCartoccordionTabs = TransactionCartoccordionTabs;
    @Output("onshowSaveBtn") onshowSaveBtn: EventEmitter<boolean> = new EventEmitter<boolean>()

    @Input("extraAttributeObject") extraAttributeObject;

    @Input("canChange")  canChange:boolean=true;



    @Input() entityExtraData: any[] = [];
    @Input() extraAttributeMeta: any[] = []; // Metadata: name, dataType, id, etc.
  
    extraAttributesToShow: { name: string; value: any }[] = [];
  
    recommendedAttributes = [];
additionalAttributes = [];


usageTypeAttributeMap: { [key: string]: any[] } = {};
  constructor(
    injector: Injector,
    private cdr: ChangeDetectorRef,

  ) {
    super(injector);

  }


    // get isReady(): boolean {
    //     return Array.isArray(this.entityExtraData) && Array.isArray(this.extraAttributeMeta);
    //   }
      
    ngOnChanges(changes: SimpleChanges): void {
      // this.prepareUsageTypeAttributeMap();
    }
     
      
      // setupAttributes() {
      //   if (this.entityExtraData?.length && this.extraAttributeMeta?.length) {
      //     this.extraAttributesToShow = this.entityExtraData.map((attr) => {
      //       const meta = this.extraAttributeMeta.find(
      //         (m) => m.attributeId === attr.attributeId
      //       );
      //       let value = attr.attributeValueId ?? attr.attributeValue;
      //       if (meta?.dataType === 'Datetime' && value) {
      //         value = new Date(value).toLocaleDateString();
      //       }
      //       return {
      //         name: meta?.name || `Attribute ${attr.attributeId}`,
      //         value: value,
      //       };
      //     });
      //   }
      // }
      
      // getAttributeDisplayValue(attrMeta: any): any {
      //   const attr = this.entityExtraData.find(d => d.attributeId === attrMeta.attributeId);
      
      //   if (!attr) return null;
      
      //   let value = attr.attributeValueId ?? attr.attributeValue;
      
      //   if (attrMeta?.dataType === 'Datetime' && value) {
      //     value = new Date(value).toLocaleDateString();
      //   }
      
      //   return value;
      // }
      
      // prepareExtraAttributes(): void {
      //   if (this.appTransactionsForViewDto?.extraDataAttributes?.length) {
      //     this.recommendedAttributes = this.appTransactionsForViewDto.extraDataAttributes.filter(
      //       (attr) => attr.extraAttrUsage === 'RECOMMENDED'
      //     );
      //     this.additionalAttributes = this.appTransactionsForViewDto.extraDataAttributes.filter(
      //       (attr) => attr.extraAttrUsage === 'ADDITIONAL'
      //     );
      //   }
      // }
 
      prepareUsageTypeAttributeMap() {
        const attributes = this.appTransactionsForViewDto.extraDataAttributes || [];
      
        this.usageTypeAttributeMap = attributes.reduce((map, attr) => {
          if (!map[attr.extraAttrUsage]) {
            map[attr.extraAttrUsage] = [];
          }
          map[attr.extraAttrUsage].push(attr);
          return map;
        }, {});
      }
  showEditMode() {
    this.isCreateOrEdit = true;
    this.onshowSaveBtn.emit(true);
  
  }

  
  ngOnInit(): void {

    // this.prepareUsageTypeAttributeMap();
      // if (this.isReady) {
      //   this.extraAttributesToShow = this.entityExtraData.map((attr) => {
      //     const meta = this.extraAttributeMeta.find(m => m.attributeId === attr.attributeId);
      //     let value = attr.attributeValueId ?? attr.attributeValue;
      //     if (meta?.dataType === 'Datetime' && value) {
      //       value = new Date(value).toLocaleDateString();
      //     }
      //     return {
      //       name: meta?.name || `Attribute ${attr.attributeId}`,
      //       value: value,
      //     };
      //   });
      // }
    }
    
}
