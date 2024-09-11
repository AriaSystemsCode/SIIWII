import { Injectable, Injector } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PaginationSettings } from '@shared/components/shared-forms-components/dropdown-with-pagination/dropdown-with-pagination.component';
import { AppEntitiesServiceProxy, AppItemVariationDto, AppItemVariationsDto, ExtraAttribute, LookupLabelDto, VariationItemDto } from '@shared/service-proxies/service-proxies';
import { SelectItem } from 'primeng/api';
import { forkJoin, Observable, tap } from 'rxjs';
import { EExtraAttributeUsage } from '../../appItems/models/extra-attribute-usage.enum';
import { FilteredExtraAttribute } from '../models/filtered-extra-attribute';
import { IsVariationExtraAttribute } from '../models/IsVariationExtraAttribute';
export type groupExtraAttributeValuesByExtraAttrIdModel =  {selectedVariations: { [key:string] :  string[] }, priceRange? : { min:number, max:number } }
@Injectable()

export class ExtraAttributeDataService extends AppComponentBase {

    constructor(
        injector:Injector,
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
        ) {
        super(injector)
    }

    getFilteredIsAdvancedSearchIsLookupExtraAttributes(extraAttributes:ExtraAttribute[], loadLookupAsync:boolean = true) : FilteredExtraAttribute[] {
        const  _extraAttributes:FilteredExtraAttribute[] = []
        extraAttributes.forEach((extraAttr : ExtraAttribute)=>{
            if(extraAttr.isAdvancedSearch && extraAttr.isLookup){
                let _extraAttr = new FilteredExtraAttribute(
                    { ...this.deepClone(extraAttr) },
                )
                _extraAttr.selectedValues = _extraAttr.acceptMultipleValues ? [] : undefined
                _extraAttr.lookupData=[]
                if(loadLookupAsync){
                    this.getExtraAttributeLookupData(extraAttr.entityObjectTypeCode,_extraAttr.lookupData)
                }
                _extraAttributes.push(_extraAttr)
            }
         })
        return  _extraAttributes
    }

    getFilteredAttributesByUsage(extraAttributes:ExtraAttribute[],usageType?:EExtraAttributeUsage,loadLookupAsync:boolean = true) : FilteredExtraAttribute[] {
        const  _extraAttributes:FilteredExtraAttribute[] = []
        extraAttributes.forEach(async (extraAttr : ExtraAttribute)=>{
            if( usageType === undefined || extraAttr.usage == usageType ){
                let _extraAttr = new FilteredExtraAttribute(
                    { ...this.deepClone(extraAttr) },
                )
                _extraAttr.paginationSetting = new PaginationSettings()
                _extraAttr.selectedValues = _extraAttr.acceptMultipleValues ? [] : undefined
                if(extraAttr.isLookup){
                    if(_extraAttr.acceptMultipleValues){
                        _extraAttr.lookupData =[]
                    } else {
                        _extraAttr.lookupData =[{label:'None',value:undefined} as LookupLabelDto]
                    }
                    if(loadLookupAsync){
                        this.getExtraAttributeLookupData(extraAttr.entityObjectTypeCode,_extraAttr.lookupData,_extraAttr)
                    }
                }
                else {
                    const defaultValue = _extraAttr.defaultValue
                    if(defaultValue) {
                        if(_extraAttr.dataType === 'boolean') {
                            _extraAttr.selectedValues = Boolean(defaultValue)
                        } else {
                            _extraAttr.selectedValues = defaultValue
                        }
                    }
                }
                _extraAttributes.push(_extraAttr)
            }
         })
        return  _extraAttributes
    }

    getExtraAttributeLookupData(code:string,reference:LookupLabelDto[],extraAttr?:FilteredExtraAttribute,setSelectedValuesasCodes?:boolean): Observable<any> {
       return this._appEntitiesServiceProxy.getAllEntitiesByTypeCode(code)
       .pipe(
        tap((res) => {
            // empty the array whithout changing reference
            let count = reference.length
            for (let i = count; i > 0; i--) {
                reference.splice(i-1,1)
            }
            res.forEach(elem => {
                reference.push(elem)
            });
            extraAttr.displayedLookupData = reference;
            if (extraAttr){
                const defaultValue = reference.filter(item=>item.value == Number(extraAttr.defaultValue))
                if(defaultValue[0]) extraAttr.selectedValues = [ setSelectedValuesasCodes? defaultValue[0].code : defaultValue[0].value]
            }
        }))
    }
    sortBy: string = 'name'
    getExtraAttributeLookupDataWithPaging(code:string, skipCount:number, maxResultCount:number) {
        return this._appEntitiesServiceProxy.getAllEntitiesByTypeCodeWithPaging(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            code,
            undefined,
            undefined,
            undefined,
            this.sortBy,
            skipCount,
            maxResultCount
        )
     }


    getExtraAttributesLookupDataAsync(codes:string[]) : Promise<LookupLabelDto[][]> {
        console.log(">>", codes)
        let requests : Observable<LookupLabelDto[]>[] = []
        codes.forEach((code)=>{
            let req = this._appEntitiesServiceProxy.getAllEntitiesByTypeCode(code)
            requests.push(req)
        })
        return forkJoin(requests).toPromise()
    }

    getIsVariationFilteredAttributes(extraAttributes:ExtraAttribute[],loadLookupAsync:boolean = true,setSelectedValuesasCodes?:boolean) : IsVariationExtraAttribute[] {
        const  _extraAttributes:IsVariationExtraAttribute[] = []
        extraAttributes.forEach((extraAttr : ExtraAttribute)=>{
            if( extraAttr.isVariation ){
                let _extraAttr = new IsVariationExtraAttribute(
                    { ...this.deepClone(extraAttr) },
                )

                _extraAttr.selectedValues = _extraAttr.acceptMultipleValues ? [] : undefined
                _extraAttr.selected = false
                if(extraAttr.isLookup){
                    if(_extraAttr.acceptMultipleValues){
                        _extraAttr.lookupData=[]
                    } else {
                        _extraAttr.lookupData=[{label:'None',value:undefined} as LookupLabelDto]
                    }
                    if(loadLookupAsync){
                        this.getExtraAttributeLookupData(extraAttr.entityObjectTypeCode,_extraAttr.lookupData,_extraAttr,true)
                    }
                }
                _extraAttributes.push(_extraAttr)
            }
         })
        return  _extraAttributes
    }

    groupExtraAttributeValuesByExtraAttrId(Variations:VariationItemDto[] | AppItemVariationsDto[] ,extraAttributes?:ExtraAttribute[], returnPriceRange:boolean=false) :groupExtraAttributeValuesByExtraAttrIdModel  {
        const returnedObject : groupExtraAttributeValuesByExtraAttrIdModel = { selectedVariations:{} }
        let priceRange
        if(returnPriceRange){
            returnedObject.priceRange = { min:0, max:0 }
            priceRange = returnedObject.priceRange
        }
        Variations.forEach((variation,index)=>{
            if(returnPriceRange){
                const variationMSRPPrice = variation.appItemPriceInfos.filter(item=> item.code =='MSRP' && item.currencyId == this.tenantDefaultCurrency.value )[0]
                if( index == 0) {
                    priceRange.min = priceRange.max = variationMSRPPrice?.price
                }
                else {
                    if(priceRange.min > variationMSRPPrice?.price) priceRange.min = variationMSRPPrice?.price
                    if(priceRange.max < variationMSRPPrice?.price) priceRange.max = variationMSRPPrice?.price
                }
            }


            variation.entityExtraData.forEach((entityExtraData)=>{
                const extraAttrId:number = entityExtraData.attributeId
                let extraAttrName:string
                if(extraAttributes)    extraAttrName = extraAttributes.filter(item=>item.attributeId == extraAttrId)[0]?.name
                else extraAttrName = entityExtraData.entityObjectTypeName
                const optionLabel:string = entityExtraData.attributeValue
                if(!returnedObject.selectedVariations[extraAttrName]) returnedObject.selectedVariations[extraAttrName] = []

                const isAlreadyExist:boolean = returnedObject.selectedVariations[extraAttrName].includes(optionLabel)
                const currentSelectedAttribute = returnedObject.selectedVariations[extraAttrName]

                if(!isAlreadyExist){
                    currentSelectedAttribute.push(optionLabel)
                }
            })
        })

        return returnedObject
    }

    resetExtraAttrSelectedValues(extraAttributes:FilteredExtraAttribute[]){
        extraAttributes.map(extraAttr=>{
            if (extraAttr.isLookup && extraAttr.acceptMultipleValues) {
                extraAttr.selectedValues = []
            } else {
                extraAttr.selectedValues = undefined
            }
            return extraAttr
        })
    }
}
