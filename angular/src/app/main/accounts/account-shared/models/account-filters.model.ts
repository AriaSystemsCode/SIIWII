import { LookupLabelDto, TreeNodeOfGetSycEntityObjectCategoryForViewDto, TreeNodeOfGetSycEntityObjectClassificationForViewDto } from "@shared/service-proxies/service-proxies"
import { SelectItem } from "primeng"
import { Observable, Subject } from "rxjs"

export class AccountFilters {
    // lastFilters
    private _search: string
    private _cityOrPostalCodeOrState: string

    private _accountType: number[]
    private _countries: number[]
    private _languages: number[]
    private _currency : number[]
    private _status: number[]

    private _filterType: SelectItem
    private _sorting: SelectItem

    private _classifications: TreeNodeOfGetSycEntityObjectClassificationForViewDto[]
    private _categories: TreeNodeOfGetSycEntityObjectCategoryForViewDto[]


    private _applyFiltersSubj : Subject<boolean> = new Subject<boolean>()
    applyFilters$ : Observable<boolean> = this._applyFiltersSubj.asObservable()

    constructor(){
    }

    public get status(): number[] { return this._status }
    public set status(value: number[])  {
        this._status = value
    }

    public get sorting(): SelectItem { return this._sorting }
    public set sorting(value: SelectItem)  {
        this._sorting = value
        this.applyFilters()
    }

    public get filterType(): SelectItem { return this._filterType }
    public set filterType(value: SelectItem)  {
        this._filterType = value
        this.applyFilters()
    }

    public get search(): string { return this._search }
    public set search(value: string)  {
        this._search = value
        this.applyFilters()
    }

    public get cityOrPostalCodeOrState(): string { return this._cityOrPostalCodeOrState }
    public set cityOrPostalCodeOrState(value: string) {
        this._cityOrPostalCodeOrState = value
        this.applyFilters()
    }


    public get language(): number[] { return this._languages }
    public set language(value: number[])   {
        this._languages = value;
        if(value){
            this.applyFilters()
            //override array .push and .splice to add some code
            this._languages.push = function (){
                this.applyFilters()
                return Array.prototype.push.apply(this,arguments);
            }
            this._languages.splice = function (){
                this.applyFilters()
                return Array.prototype.splice.apply(this,arguments);
            }
        }
        else {
            this.applyFilters()
        }
    }

    public get currency(): number[] { return this._currency }
    public set currency(value: number[])   {
        this._currency = value;
        if(value){
            this.applyFilters()
            //override array .push and .splice to add some code
            this._currency.push = function (){
                this.applyFilters()
                return Array.prototype.push.apply(this,arguments);
            }
            this._currency.splice = function (){
                this.applyFilters()
                return Array.prototype.splice.apply(this,arguments);
            }
        }
        else {
            this.applyFilters()
        }
    }

    public get countries(): number[] { return this._countries }
    public set countries(value: number[])   {
        this._countries = value;
        if(value){
            this.applyFilters()
            //override array .push and .splice to add some code
            this.countries.push = function (){
                this.applyFilters()
                return Array.prototype.push.apply(this,arguments);
            }
            this.countries.splice = function (){
                this.applyFilters()
                return Array.prototype.splice.apply(this,arguments);
            }
        }
        else {
            this.applyFilters()
        }
    }

    public get classifications(): TreeNodeOfGetSycEntityObjectClassificationForViewDto[] { return this._classifications }
    public set classifications(value: TreeNodeOfGetSycEntityObjectClassificationForViewDto[])  {
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

    public get categories(): TreeNodeOfGetSycEntityObjectCategoryForViewDto[] { return this._categories }
    public set categories(value: TreeNodeOfGetSycEntityObjectCategoryForViewDto[])   {
        this._categories = value
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
        }
        else {
            this.applyFilters()
        }
    }

    // public get accountType(): number[] { return this._accountType }
    // public set accountType(value: number[])  {
    //     this._accountType = value
    // }

    public get accountType(): number[] { return this._accountType }
    public set accountType(value: number[])   {
        this._accountType = value;
        if(value){
            this.applyFilters()
            //override array .push and .splice to add some code
            this.accountType.push = function (){
                this.applyFilters()
                return Array.prototype.push.apply(this,arguments);
            }
            this.accountType.splice = function (){
                this.applyFilters()
                return Array.prototype.splice.apply(this,arguments);
            }
        }
        else {
            this.applyFilters()
        }
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

    applyFilters(trueOrFalse:boolean=true)  {
        this._applyFiltersSubj.next(trueOrFalse)
    }

    resetFilters(){   }

    // private get selectedCountriesIds () :number[] {
    //     if(!this.countries) return []
    //     return this.countries.map((elem)=>{
    //         return elem.value
    //     },[])
    // }

    private get selectedCategoriesIds () :number[] {
        if(!this.categories) return []
        return this.categories.map((elem)=>{
            return elem.data.sycEntityObjectCategory.id
        },[])
    }

    // private get selectedAccountTypesIds () :number[] {
    //     let _accountType = this.accountType
    //     if(!_accountType) return []
    //     else {
    //         selectedValuesIds = this._accountType.map((elem)=>{
    //             return elem
    //         },[])
    //     }
    //     return selectedValuesIds
    // }

    // private get selectedStatusesIds () :number[] {
    //     if(!this.status) return []
    //     return this.status.map((elem)=>{
    //         return elem.value
    //     },[])
    // }

    // private get selectedLanguagesIds () :number[] {
    //     if(!this.language) return []
    //     return this.language.map((elem)=>{
    //         return elem.value
    //     },[])
    // }

    // private get selectedCurrenciesIds () :number[] {
    //     if(!this.currency) return []
    //     return this.currency.map((elem)=>{
    //         return elem.value
    //     },[])
    // }


    public get filterData() {
        return {
            filter: this.search,
            filterType: this.filterType ? this.filterType.value : undefined,
            cityOrPostalCodeOrState: this._cityOrPostalCodeOrState,
            accountTypes: this.accountType,
            status: this.status,
            languages: this.language,
            currencies:this.currency,
            countries: this.countries,
            classifications: this.selectedClassificationIds,
            categories: this.selectedCategoriesIds,
            sorting: this.sorting ? this.sorting.value :undefined ,
        }
    }
}
