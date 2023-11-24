import { TreeNodeOfGetSycEntityObjectCategoryForViewDto, TreeNodeOfGetSycEntityObjectClassificationForViewDto, TreeNodeOfGetSycEntityObjectTypeForViewDto, ArrtibuteFilter } from "@shared/service-proxies/service-proxies";
import { SelectItem } from "primeng";
import { Subject, Observable } from "rxjs";
import { FilteredExtraAttribute } from "../../app-item-shared/models/filtered-extra-attribute";

export class AppItemListFilters {
    private sortingDefaultValue = { label:'Product Id', value:"id" }
    private filterTypeDefaultValue = { label:'My Products', value:'0' }
    private listingStatusDefaultValue = 0
    private publishStatusDefaultValue = 0
    private visibilityStatusDefaultValue = 0

    private _categories: TreeNodeOfGetSycEntityObjectCategoryForViewDto[];
    private _departments: TreeNodeOfGetSycEntityObjectCategoryForViewDto[];
    private _classifications: TreeNodeOfGetSycEntityObjectClassificationForViewDto[];
    private _search: string;
    private _appItemType: TreeNodeOfGetSycEntityObjectTypeForViewDto;
    private _extraAttributes: FilteredExtraAttribute[];
    private _sorting: SelectItem = this.sortingDefaultValue;
    private _filterType: SelectItem = this.filterTypeDefaultValue;
    private _listingStatus: number = this.listingStatusDefaultValue;
    private _publishStatus: number = this.publishStatusDefaultValue;
    private _visibilityStatus: number = this.visibilityStatusDefaultValue;

    private _applyFiltersSubj : Subject<boolean> = new Subject<boolean>()
    applyFilters$ : Observable<boolean> = this._applyFiltersSubj.asObservable()

    public get search(): string {
        return this._search;
    }
    public set search(value: string) {
        this._search = value;
        this.applyFilters()
    }

    public get classifications(): TreeNodeOfGetSycEntityObjectClassificationForViewDto[] {
        return this._classifications;
    }
    public set classifications(value: TreeNodeOfGetSycEntityObjectClassificationForViewDto[]) {
        this._classifications = value;
        if(value){
            this.applyFilters()
            //override array .push and .splice to add some code
            this.classifications.push = function (){
                this.applyFilters()
                return Array.prototype.push.apply(this,arguments);
            }
            this.classifications.splice = function (){
                this.applyFilters()
                return Array.prototype.splice.apply(this,arguments);
            }
        }
        else {
            this.applyFilters()
        }
    }

    public get categories(): TreeNodeOfGetSycEntityObjectCategoryForViewDto[] {
        return this._categories;
    }
    public set categories(value: TreeNodeOfGetSycEntityObjectCategoryForViewDto[]) {
        this._categories = value;
        if(value){
            this.applyFilters()
            //override array .push and .splice to add some code
            this.categories.push = function (){
                this.applyFilters()
                return Array.prototype.push.apply(this,arguments);
            }
            this.categories.splice = function (){
                this.applyFilters()
                return Array.prototype.splice.apply(this,arguments);
            }
        } else {
            this.applyFilters()
        }
    }

    public get departments(): TreeNodeOfGetSycEntityObjectCategoryForViewDto[] {
        return this._departments;
    }
    public set departments(value: TreeNodeOfGetSycEntityObjectCategoryForViewDto[]) {
        this._departments = value;
        if(value){
            this.applyFilters()
            //override array .push and .splice to add some code
            this.departments.push = function (){
                this.applyFilters()
                return Array.prototype.push.apply(this,arguments);
            }
            this.departments.splice = function (){
                this.applyFilters()
                return Array.prototype.splice.apply(this,arguments);
            }
        } else {
            this.applyFilters()
        }
    }

    public get appItemType(): TreeNodeOfGetSycEntityObjectTypeForViewDto {
        return this._appItemType;
    }
    public set appItemType(value: TreeNodeOfGetSycEntityObjectTypeForViewDto) {
        this._appItemType = value;
        this.applyFilters()
    }

    public get extraAttributes(): FilteredExtraAttribute[] {
        return this._extraAttributes;
    }
    public set extraAttributes(value: FilteredExtraAttribute[]) {
        this._extraAttributes = value;
        this.applyFilters()
    }

    public get sorting(): SelectItem {
        return this._sorting;
    }
    public set sorting(value: SelectItem) {
        this._sorting = value;
        this.applyFilters()
    }

    public get filterType() :SelectItem {
        return this._filterType;
    }
    public set filterType(value:SelectItem) {
        this._filterType = value;
        if(value.value == 0) {
            this.visibilityStatus = undefined
            this.publishStatus = undefined
            this.listingStatus = 0
        }
        if(value.value == 1) {
            this.listingStatus = undefined
            this.visibilityStatus = 0
            this.publishStatus = 0
        }
        this.applyFilters()
    }
    public get listingStatus():number {
        return this._listingStatus;
    }
    public set listingStatus(value:number) {
        this._listingStatus = value;
        this.applyFilters()
    }
    public get publishStatus() :number{
        return this._publishStatus;
    }
    public set publishStatus(value:number) {
        this._publishStatus = value;
        this.applyFilters()
    }
    public get visibilityStatus():number {
        return this._visibilityStatus;
    }
    public set visibilityStatus(value:number) {
        this._visibilityStatus = value;
        this.applyFilters()
    }


    applyFilters(trueOrFalse:boolean=true){
        this._applyFiltersSubj.next(trueOrFalse)
    }

    private get selectedClassificationIds () : number[] {
        if(!this.classifications) return []
        else {
            return this.classifications.reduce((accum,elem)=>{
                let classId = elem.data.sycEntityObjectClassification.id
                accum.push(classId)
                return accum
            },[])
        }
    }

    private get selectedAttributes () : ArrtibuteFilter[] {

        const attributeFilters : ArrtibuteFilter[] = []
        if(this.extraAttributes && this.extraAttributes.length) {
            this.extraAttributes.forEach((extraAttr)=>{
                if(extraAttr.selectedValues){
                    extraAttr.selectedValues.forEach((value)=>{
                        let attributeFilter : ArrtibuteFilter = new ArrtibuteFilter()
                        attributeFilter.arrtibuteValueId = value
                        attributeFilter.arrtibuteId = extraAttr.attributeId
                        attributeFilters.push(attributeFilter)
                    })
                }
            })
        }
        return attributeFilters
    }

    private get selectedCategoriesIds () : number[] {
        if(!this.categories) return []
        else {
            return this.categories.reduce((accum,elem)=>{
                let categoryId = elem.data.sycEntityObjectCategory.id
                accum.push(categoryId)
                return accum
            },[])
        }
    }

    private get selectedDepartmentsIds () : number[] {
        if(!this.departments) return []
        else {
            return this.departments.reduce((accum,elem)=>{
                let departmentId = elem.data.sycEntityObjectCategory.id
                accum.push(departmentId)
                return accum
            },[])
        }
    }

    private get entityObjectTypeId () : number {
        let id:number
        if(this.appItemType && this.appItemType.data && this.appItemType.data.sycEntityObjectType && this.appItemType.data.sycEntityObjectType.id){
            id = this.appItemType.data.sycEntityObjectType.id
        }
        return id
    }

    public get filterData() {
        return {
            filter:this.search,
            sorting:this.sorting?.value,
            publishStatus:this.publishStatus,
            listingStatus:this.listingStatus,
            visibilityStatus:this.visibilityStatus,
            filterType:this.filterType?.value,
            classificationFilters:this.selectedClassificationIds,
            departmentsFilters:this.selectedDepartmentsIds,
            categoryFilters:this.selectedCategoriesIds,
            attributeFilters : this.selectedAttributes,
            entityObjectTypeId  : this.entityObjectTypeId
        }
    }

}
