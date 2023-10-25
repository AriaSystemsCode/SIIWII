import { Component, Injector, Input, OnChanges, } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ExtraAttribute, ItemExtraAttributes, VariationItemDto } from '@shared/service-proxies/service-proxies';
import { ExtraAttributeDataService } from '../../app-item-shared/services/extra-attribute-data.service';
import { PricingHelpersService } from '../../app-item-shared/services/pricing-helpers.service';

@Component({
  selector: 'app-variations-meta-info',
  templateUrl: './variations-meta-info.component.html',
  styleUrls: ['./variations-meta-info.component.scss']
})
export class VariationsMetaInfoComponent extends AppComponentBase implements OnChanges {
    @Input() showPriceRange :boolean = false
    @Input() variations : VariationItemDto []
    @Input() extraAttributes : ExtraAttribute []
    @Input() stockAvailability :number 
    selectedVariations : { [key:string] :  string[] } = {} // {color:"blue,red,brown"}
    minPrice:number = 0
    maxPrice:number = 0
    constructor(
        private _extraAttrDataService : ExtraAttributeDataService,
        private injector:Injector
        ) {
            super(injector);
        }
    priceSymbol:string
    ngOnChanges(): void {
        if(Array.isArray(this.variations && this.extraAttributes)){
            this.detectSelectedExtraAttributesFromVariationMatrices()
        }
    }

    detectSelectedExtraAttributesFromVariationMatrices(){
        if(!this.variations) return
        const groupedByExtraAttrData = this._extraAttrDataService.groupExtraAttributeValuesByExtraAttrId(this.variations,this.extraAttributes,this.showPriceRange)
        this.selectedVariations = groupedByExtraAttrData.selectedVariations
        if(this.showPriceRange) {
            this.maxPrice = groupedByExtraAttrData.priceRange.max
            this.minPrice = groupedByExtraAttrData.priceRange.min
        }

    }
}
