import { Component, EventEmitter, Injector, Output, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppItemsServiceProxy, AppItemVariationDto, AppItemVariationsDto } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ExtraAttributeDataService, groupExtraAttributeValuesByExtraAttrIdModel } from '../services/extra-attribute-data.service';

export class VariationSelectionDto extends AppItemVariationDto {
    initiallySelected:boolean
    variationSummary:groupExtraAttributeValuesByExtraAttrIdModel
}
export class VariationSelectionOutput {
    listId:number
    productListingId:number
    selectedVariationsIds:number[]
}

@Component({
  selector: 'app-variations-selection-modal',
  templateUrl: './variations-selection-modal.component.html',
  styleUrls: ['./variations-selection-modal.component.scss'],
  providers:[AppItemsServiceProxy]
})
export class VariationsSelectionModalComponent extends AppComponentBase  {
    @ViewChild('variationSelecionModal', { static: true }) modal: ModalDirective;
    @Output() variationSelectionDone: EventEmitter<VariationSelectionOutput> = new EventEmitter<VariationSelectionOutput>();
    @Output() cancelDone: EventEmitter<number> = new EventEmitter<number>();
    active = false;
    saving = false;
    loading: boolean;
    productListingVariations : VariationSelectionDto[] = [];
    selectedVariationsIds : number[];
    productListingId: number;
    listId: number;
    displayedRecords : VariationSelectionDto[];
    searchQuery:string
    constructor(
        injector: Injector,
        public _extraAttrDataService : ExtraAttributeDataService,
    ) {
        super(injector);
    }

    ngAfterViewInit(){
        this.modal.config.backdrop = 'static'
        this.modal.config.ignoreBackdropClick = true
    }

    show(productId:number, listingId:number,variations:AppItemVariationDto[],selectedVariationsIds:number[] = []): void {
        this.productListingId = productId
        this.listId = listingId
        this.active = true;
        variations.forEach(variation=>{
            const _variation : VariationSelectionDto = Object.assign(new VariationSelectionDto(),variation)
            _variation.variationSummary = this._extraAttrDataService.groupExtraAttributeValuesByExtraAttrId([variation as any])
            _variation.initiallySelected = selectedVariationsIds.includes(_variation.itemId)
            this.productListingVariations.push(_variation)
        })
        this.displayedRecords = this.productListingVariations
        // if( selectedVariationsIds?.length === 0 )   this.selectedVariationsIds = this.displayedRecords.map(item=>item.itemId)
        // else {
        this.selectedVariationsIds = selectedVariationsIds
        // }
        this.modal.show();
    }
    emitListSelection(){
        let output :VariationSelectionOutput = new VariationSelectionOutput()
        output.listId = this.listId
        output.productListingId = this.productListingId
        output.selectedVariationsIds = this.selectedVariationsIds
        this.variationSelectionDone.emit(output);
        this.hide()
    }

    close(): void {
        this.hide()
    }

    hide(){
        this.active = false;
        this.modal.hide();
        this.resetState()
    }
    resetState(){
        this.productListingVariations = [];
        this.selectedVariationsIds = undefined
        this.productListingId= undefined
        this.listId= undefined
        this.displayedRecords = undefined
        this.searchQuery= undefined
    }

    onCancel(){
        this.cancelDone.emit(this.listId)
        this.hide()
    }

    filterValues(){

        if(!this.searchQuery) this.displayedRecords = this.productListingVariations
        else {
            this.displayedRecords = this.productListingVariations.filter((item)=>{
                const isMatched : boolean = item.entityExtraData.some( extraData=>{
                    const compareStrings = (_reference:string,_case:string)=> { return _reference.toLowerCase().includes( _case.toLowerCase() ) }
                    return compareStrings(extraData.entityObjectTypeName ,this.searchQuery) || compareStrings(extraData.attributeValue , this.searchQuery)
                })
                return isMatched
            })
            this.displayedRecords = [ ...this.displayedRecords ]
        }
    }

    applyVariationSelection(){
        this.emitListSelection()
    }

}
