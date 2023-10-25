import { Component, Injector, Input, OnChanges, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { FilterMetaData } from '@app/shared/filters-shared/models/FilterMetaData.model';
import { AppComponentBase } from '@shared/common/app-component-base';
import {  AppEntitiesServiceProxy, ExtraAttribute, GetAllEntityObjectTypeOutput,  ItemsFilterTypesEnum,  LookupLabelDto,  PagedResultDtoOfLookupLabelDto,  SycEntityObjectCategoriesServiceProxy, SycEntityObjectClassificationsServiceProxy, SycEntityObjectTypesServiceProxy, TreeNodeOfGetSycEntityObjectCategoryForViewDto, TreeNodeOfGetSycEntityObjectClassificationForViewDto, TreeNodeOfGetSycEntityObjectTypeForViewDto } from '@shared/service-proxies/service-proxies';
import { SelectItem } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { ExtraAttributeDataService } from '../../app-item-shared/services/extra-attribute-data.service';
import { AppItemsBrowseComponentFiltersDisplayFlags } from '../models/app-item-browse-inputs.model';

@Component({
  selector: 'app-items-filters',
  templateUrl: './appItems-filters.component.html',
})
export class AppItemsFiltersComponent extends AppComponentBase implements OnInit, OnChanges {
    @Input() filterForm : FormGroup
    @Input()  filtersFlags:  AppItemsBrowseComponentFiltersDisplayFlags
    loading:boolean = false
    ItemsFilterTypesEnum = ItemsFilterTypesEnum

    lastSelectedAppItemType : TreeNodeOfGetSycEntityObjectTypeForViewDto

    categoriesFilterMetaData:FilterMetaData<TreeNodeOfGetSycEntityObjectCategoryForViewDto[]>
    departmentsFilterMetaData:FilterMetaData<TreeNodeOfGetSycEntityObjectCategoryForViewDto[]>
    classificationsFilterMetaData:FilterMetaData<TreeNodeOfGetSycEntityObjectClassificationForViewDto[]>

    appItemTypeFilterMetaData:FilterMetaData<TreeNodeOfGetSycEntityObjectTypeForViewDto[]>

    listingStatusFilterMetaData:FilterMetaData<SelectItem[]>
    publishStatusFilterMetaData:FilterMetaData<SelectItem[]>
    visibilityStatusFilterMetaData:FilterMetaData<SelectItem[]>

    get extraAttributesCtrl()  : FormGroup { return this.filterForm.get('extraAttributes') as FormGroup }
    get appItemTypeCtrl(){ return this.filterForm.get('appItemType') }
    get mainFilterCtrl(){ return this.filterForm.get('filterType') }

    sortBy : string = 'name'
    extraAttributesMetaData : ExtraAttrFilter[] = []

    constructor(
        injector:Injector,
        private _sycEntityObjectCategoriesServiceProxy : SycEntityObjectCategoriesServiceProxy,
        private _sycEntityObjectClassificationsServiceProxy : SycEntityObjectClassificationsServiceProxy,
        private _sycEntityObjectTypesServiceProxy : SycEntityObjectTypesServiceProxy,
        private _extraAttributeDataService : ExtraAttributeDataService,
        private _appEntitiesServiceProxy : AppEntitiesServiceProxy
    ) {
        super(injector)
    }

    ngOnInit(): void {

        this.categoriesFilterMetaData = new FilterMetaData<TreeNodeOfGetSycEntityObjectCategoryForViewDto[]>({list : []})
        this.departmentsFilterMetaData = new FilterMetaData<TreeNodeOfGetSycEntityObjectCategoryForViewDto[]>({list : []})
        this.classificationsFilterMetaData = new FilterMetaData<TreeNodeOfGetSycEntityObjectClassificationForViewDto[]>({list : []})
        this.appItemTypeFilterMetaData = new FilterMetaData<TreeNodeOfGetSycEntityObjectTypeForViewDto[]>({list : []})
        this.listingStatusFilterMetaData = new FilterMetaData<SelectItem[]>({list : []})
        this.publishStatusFilterMetaData = new FilterMetaData<SelectItem[]>({list : []})
        this.visibilityStatusFilterMetaData = new FilterMetaData<SelectItem[]>({list : []})

    }

    ngOnChanges(){
        if(this.appItemTypeCtrl){
            this.appItemTypeCtrl.valueChanges.subscribe(value=>{
                if(value){ // load extra attributes
                    const id = value.data.sycEntityObjectType.id
                    this.getItemTypeData(id)
                } else  { // remove extra attributes
                    this.removeExtraAttributesCtrl()
                }
            })
            this.mainFilterCtrl.valueChanges.subscribe(()=>{
                this.listingStatusFilterMetaData.list = []
                this.publishStatusFilterMetaData.list = []
                this.visibilityStatusFilterMetaData.list = []
                this.filterForm.patchValue({
                    publishStatus:undefined,
                    listingStatus:undefined,
                    visibilityStatus:undefined
                })
            })
        }
    }

    getItemTypeData(id:number){
        this._sycEntityObjectTypesServiceProxy.getAllWithExtraAttributes(id)
        .subscribe((res)=>{
            this.removeExtraAttributesCtrl()
            if(!res[0]) return
            const extraAttr = this.getFilteredExtraAttributes(res[0])

            extraAttr.forEach((extraAttr)=>{
                const attributeId = String(extraAttr.attributeId)
                const control = new FormControl(undefined)
                this.extraAttributesCtrl.addControl( attributeId, control )
                const extraAttrMetaData:ExtraAttrFilter = new ExtraAttrFilter()
                extraAttrMetaData.code = extraAttr.entityObjectTypeCode
                extraAttrMetaData.attributeId = extraAttr.attributeId
                extraAttrMetaData.formControl = control
                extraAttrMetaData.filterMetaData = new FilterMetaData<SelectItem[]>({ list : [] })
                this.extraAttributesMetaData.push(extraAttrMetaData)
            })

        })
    }

    getExtraAttributeLookupDataWithPagination(componentRef:{ onListLoadCallback : Function },extraAttrFilter:ExtraAttrFilter) {
        return this._appEntitiesServiceProxy.getAllEntitiesByTypeCodeWithPaging(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            extraAttrFilter.code,
            undefined,
            undefined,
            undefined,
            this.sortBy,
            extraAttrFilter.filterMetaData.listSkipCount,
            extraAttrFilter.filterMetaData.listMaxResultCount,
            )
         .subscribe((res)=>{
            componentRef.onListLoadCallback(res)
         })
     }


    getFilteredExtraAttributes(itemTypeObject : GetAllEntityObjectTypeOutput){
        return itemTypeObject?.extraAttributes ?
        this._extraAttributeDataService.getFilteredIsAdvancedSearchIsLookupExtraAttributes(itemTypeObject.extraAttributes.extraAttributes,false) :
        []
    }
    removeExtraAttributesCtrl(){
        const keys = Object.keys(this.extraAttributesCtrl.controls)
        keys.forEach(key => {
            this.extraAttributesCtrl.removeControl(key)
        });
        this.extraAttributesMetaData = []
    }


    getClassificationsList(componentRef:{ onListLoadCallback : Function }){
        this.loading = true
        const subs = this._sycEntityObjectClassificationsServiceProxy.getAllWithChildsForProductWithPaging(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            this.sortBy,
            this.classificationsFilterMetaData.listSkipCount,
            this.classificationsFilterMetaData.listMaxResultCount,
        )
        .pipe(
            finalize(()=>this.loading = false)
        )
        .subscribe((result)=>{
            componentRef.onListLoadCallback(result);
        })
        this.subscriptions.push(subs)
    }

    loadClassificationNode(node : TreeNodeOfGetSycEntityObjectClassificationForViewDto){
        if (node) {
            const loadedCompletely : boolean =  !isNaN(node?.totalChildrenCount) && !isNaN(node?.children?.length) && node.totalChildrenCount === node.children.length
            if( loadedCompletely ) return
            const parentId = node.data.sycEntityObjectClassification.id
            const subs = this._sycEntityObjectClassificationsServiceProxy.getAllChildsWithPaging(
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                parentId,
                undefined,
                undefined,
                this.sortBy,
                0,
                node.totalChildrenCount,
            )
            .pipe(
                finalize(()=>this.loading = false)
            )
            .subscribe((res)=>{
                if(!node.children) node.children = []
                node.children.push(...res.items)
            })
            this.subscriptions.push(subs)
        }
    }

    getListingStatusOptionsList(componentRef:{ onListLoadCallback : Function }){
        const items =  [
            { label:this.l('Both'), value: 0},
            { label:this.l('NoListings'), value:1 },
            { label:this.l('WithListings'), value:2 },
        ]
        const result: { items : any[], totalCount?:number } = {
            items,
            totalCount:items.length
        }
        componentRef.onListLoadCallback(result);
    }

    getPublishOptionsList(componentRef:{ onListLoadCallback : Function }){
        const items =  [
            { label:this.l('Both'), value: 0 },
            { label:this.l('Published'), value:1 },
            { label:this.l('UnPublished'), value:2 },
        ]
        const result: { items : any[], totalCount?:number } = {
            items,
            totalCount:items.length
        }
        componentRef.onListLoadCallback(result);
    }

    getVisibiltyOptionsList(componentRef:{ onListLoadCallback : Function }){
        const items = [
            { label:this.l('Both'), value: 0 },
            { label:this.l('Public'), value:1 },
            { label:this.l('Private'), value:2 },
        ]
        const result: { items : any[], totalCount?:number } = {
            items,
            totalCount:items.length
        }
        componentRef.onListLoadCallback(result);
    }

    getCategoriesList(componentRef:{ onListLoadCallback : Function }){
        this.loading = true
        const subs = this._sycEntityObjectCategoriesServiceProxy.getAllWithChildsForProductWithPaging(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            false,
            undefined,
            undefined,
            this.sortBy,
            this.categoriesFilterMetaData.listSkipCount,
            this.categoriesFilterMetaData.listMaxResultCount,
        )
        .pipe(
            finalize(()=>this.loading = false)
        )
        .subscribe((res)=>{
            componentRef.onListLoadCallback(res);
        })
        this.subscriptions.push(subs)
    }
    getDepartmentsList(componentRef:{ onListLoadCallback : Function }){
        this.loading = true
        const subs = this._sycEntityObjectCategoriesServiceProxy.getAllWithChildsForProductWithPaging(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            true,
            undefined,
            undefined,
            this.sortBy,
            this.departmentsFilterMetaData.listSkipCount,
            this.departmentsFilterMetaData.listMaxResultCount,
        )
        .pipe(
            finalize(()=>this.loading = false)
        )
        .subscribe((res)=>{
            componentRef.onListLoadCallback(res);
        })
        this.subscriptions.push(subs)
    }

    loadCategoriesNode(node : TreeNodeOfGetSycEntityObjectCategoryForViewDto){
        if (node) {
            const loadedCompletely : boolean =  !isNaN(node?.totalChildrenCount) && !isNaN(node?.children?.length) && node.totalChildrenCount === node.children.length
            if( loadedCompletely ) return
            const parentId = node.data.sycEntityObjectCategory.id
            const subs = this._sycEntityObjectCategoriesServiceProxy.getAllChildsWithPaging(
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                parentId,
                true,
                undefined,
                undefined,
                this.sortBy,
                0,
                node.totalChildrenCount,
            )
            .pipe(
                finalize(()=>this.loading = false)
            )
            .subscribe((res)=>{
                if(!node.children) node.children = []
                node.children.push(...res.items)
            })
            this.subscriptions.push(subs)
        }
    }

    getAppItemTypesList(componentRef:{ onListLoadCallback : Function }){
        this.loading = true
        const subs = this._sycEntityObjectTypesServiceProxy.getAllWithChildsForProductWithPaging(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            this.sortBy,
            this.appItemTypeFilterMetaData.listSkipCount,
            this.appItemTypeFilterMetaData.listMaxResultCount,
        )
        .pipe(
            finalize(()=>this.loading = false)
        )
        .subscribe((res)=>{
            componentRef.onListLoadCallback(res);
        })
        this.subscriptions.push(subs)
    }

    loadAppItemTypesNode(node : TreeNodeOfGetSycEntityObjectTypeForViewDto){
        if (node) {
            const loadedCompletely : boolean =  !isNaN(node?.totalChildrenCount) && !isNaN(node?.children?.length) && node.totalChildrenCount === node.children.length
            if( loadedCompletely ) return
            const parentId = node.data.sycEntityObjectType.id
            const subs = this._sycEntityObjectTypesServiceProxy.getAllChilds(
                parentId,
            )
            .pipe(
                finalize(()=>this.loading = false)
            )
            .subscribe((res)=>{
                if(!node.children) node.children = []
                node.children.push(...res)
                node.totalChildrenCount = res.length
            })
            this.subscriptions.push(subs)
        }
    }

    onExtraAttrChange(selectedValue,extraAttr) {

        var index = extraAttr.selectedValues.indexOf(selectedValue);
        if (index > -1) {
            extraAttr.selectedValues.splice(index, 1);
        }
        // Is newly selected
        else {
            extraAttr.selectedValues.push(selectedValue);
        }
        // this.filters.applyFilters()
    }

}



export class ExtraAttrFilter {
    code:string
    filterMetaData:FilterMetaData<SelectItem[]>
    formControl:FormControl
    attributeId:number
}
