import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { StateEnum, CreateOrEditAppItemsListItemDto } from '@shared/service-proxies/service-proxies';
import { ExtraAttributeDataService, groupExtraAttributeValuesByExtraAttrIdModel } from '../../app-item-shared/services/extra-attribute-data.service';

@Component({
  selector: 'app-item-list-item-card',
  templateUrl: './item-list-item-card.component.html',
  styleUrls: ['./item-list-item-card.component.scss']
})
export class ItemListItemCardComponent extends AppComponentBase implements OnChanges {

    attachmentBaseUrl :string = AppConsts.attachmentBaseUrl
    @Input('item') item : CreateOrEditAppItemsListItemDto
    @Input('viewMode') viewMode : boolean
    @Input('class') class :string
    @Input('singleItemPerRowMode') singleItemPerRowMode : boolean
    @Output('deleteMe') deleteMe : EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output('changeStatus') changeStatus : EventEmitter<StateEnum> = new EventEmitter<StateEnum>()
    @Output('openVariation') openVariation : EventEmitter<boolean> = new EventEmitter<boolean>()
    variationSummary : groupExtraAttributeValuesByExtraAttrIdModel
    StateEnum = StateEnum
    
    constructor(
        injector:Injector,
        public extraAttributeDataService:ExtraAttributeDataService
    ){
        super(injector)
    }
    ngOnChanges(changes:SimpleChanges){
        if( this?.item?.appItemsListItemVariations ) {
            let variations = this.item.appItemsListItemVariations.map(x=>x.variation)
            this.variationSummary = this.extraAttributeDataService.groupExtraAttributeValuesByExtraAttrId(variations as any)
        }
    }

    deleteItem(){
        this.deleteMe.emit(true)
    }

    openVariationModal(){
        this.openVariation.emit(true)
    }
    markItemAs(state:StateEnum){
        this.changeStatus.emit(state)
    }

}
