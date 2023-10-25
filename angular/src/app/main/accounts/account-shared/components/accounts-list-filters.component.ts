import { AfterViewInit, Component, Injector, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MultiSelectionFilterComponent } from '@app/shared/filters-shared/components/multi-selection-filter.component';
import { TreeMultiSelectionFilterComponent } from '@app/shared/filters-shared/components/tree-multi-selection-filter.component';
import { FilterMetaData } from '@app/shared/filters-shared/models/FilterMetaData.model';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppEntitiesServiceProxy, SycEntityObjectClassificationsServiceProxy, SycEntityObjectCategoriesServiceProxy,  LookupLabelDto, TreeNodeOfGetSycEntityObjectClassificationForViewDto, TreeNodeOfGetSycEntityObjectCategoryForViewDto, PagedResultDtoOfLookupLabelDto, ILookupLabelDto } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-accounts-list-filters',
  templateUrl: './accounts-list-filters.component.html',
  styleUrls: ['./accounts-list-filters.component.scss']
})
export class AccountsListFiltersComponent extends AppComponentBase implements OnInit, OnDestroy {

    @Input('filterForm') filterForm : FormGroup

    get categoriesCtrl () : AbstractControl { return this.filterForm.get('categories') }
    get classificationsCtrl () : AbstractControl { return this.filterForm.get('classifications') }

    classifications : TreeNodeOfGetSycEntityObjectClassificationForViewDto[] = []
    categories : TreeNodeOfGetSycEntityObjectCategoryForViewDto[] = []

    countries :LookupLabelDto[] = []
    currencies :LookupLabelDto[] = []
    languages : LookupLabelDto[] = []
    accountTypes : LookupLabelDto[] = []
    accountStatuses : LookupLabelDto[] = [];

    loading:boolean = false

    sortBy = 'name'

    selectedClassifications: number[]
    selectedCategories: number[]

    languageFilterMetaData :FilterMetaData<LookupLabelDto[]>
    accountTypeFilterMetaData :FilterMetaData<LookupLabelDto[]>
    countryFilterMetaData :FilterMetaData<LookupLabelDto[]>
    currencyFilterMetaData:FilterMetaData<LookupLabelDto[]>
    accountStatusFilterMetaData:FilterMetaData<LookupLabelDto[]>

    categoriesFilterMetaData:FilterMetaData<TreeNodeOfGetSycEntityObjectCategoryForViewDto[]>
    classificationsFilterMetaData:FilterMetaData<TreeNodeOfGetSycEntityObjectClassificationForViewDto[]>

    constructor(
        injector:Injector,
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _sycEntityObjectClassificationsServiceProxy: SycEntityObjectClassificationsServiceProxy ,
        private _sycEntityObjectCategoriesServiceProxy: SycEntityObjectCategoriesServiceProxy,
    ) {
        super(injector)
    }

    ngOnInit(): void {

        this.accountTypeFilterMetaData = new FilterMetaData<LookupLabelDto[]>({list : this.accountTypes})
        this.languageFilterMetaData = new FilterMetaData<LookupLabelDto[]>({list : this.languages})
        this.countryFilterMetaData = new FilterMetaData<LookupLabelDto[]>({list : this.countries})
        this.currencyFilterMetaData = new FilterMetaData<LookupLabelDto[]>({list : this.currencies})
        this.accountStatusFilterMetaData = new FilterMetaData<LookupLabelDto[]>({list : this.accountStatuses})
        this.categoriesFilterMetaData = new FilterMetaData<TreeNodeOfGetSycEntityObjectCategoryForViewDto[]>({list : this.categories})
        this.classificationsFilterMetaData = new FilterMetaData<TreeNodeOfGetSycEntityObjectClassificationForViewDto[]>({list : this.classifications})

        this.subscribeToCategoriesAndClassificationReset()
    }

    ngOnDestroy() {
        this.emitDestroy()
    }

    getClassificationsList( componentRef:{  onListLoadCallback  : Function } ){
        this.loading = true
        const subs = this._sycEntityObjectClassificationsServiceProxy.getAllWithChildsForContactWithPaging(
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
        .subscribe((res)=>{
            componentRef.onListLoadCallback(res)
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

    getCategoriesList(componentRef:{  onListLoadCallback  : Function } ){
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
            this.categoriesFilterMetaData.listSkipCount,
            this.categoriesFilterMetaData.listMaxResultCount,
        )
        .pipe(
            finalize(()=>this.loading = false)
        )
        .subscribe((res)=>{
            componentRef.onListLoadCallback(res)
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


    getCurrenciesList(componentRef:{  onListLoadCallback  : Function} ){
        const subs = this._appEntitiesServiceProxy.getAllCurrencyForTableDropdownWithPaging(
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
            this.currencyFilterMetaData.listSkipCount,
            this.currencyFilterMetaData.listMaxResultCount,
        ).subscribe(result => {
            componentRef.onListLoadCallback(result)
        });
        this.subscriptions.push(subs)
    }

    getCountriesList(componentRef:{  onListLoadCallback  : Function}){
        const subs = this._appEntitiesServiceProxy.getAllCountryForTableDropdowWithPaging(
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
            this.countryFilterMetaData.listSkipCount,
            this.countryFilterMetaData.listMaxResultCount,
        ).subscribe(result => {
            componentRef.onListLoadCallback(result)
        });
        this.subscriptions.push(subs)
    }

    getLanguagesList(componentRef:{  onListLoadCallback  : Function}){
        const subs = this._appEntitiesServiceProxy.getAllLanguageForTableDropdownWithPaging(
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
            this.languageFilterMetaData.listSkipCount,
            this.languageFilterMetaData.listMaxResultCount,
        ).subscribe(result => {
            componentRef.onListLoadCallback(result)
        });
        this.subscriptions.push(subs)
    }

    getAccountTypesList(componentRef:{  onListLoadCallback  : Function}){
        const subs = this._appEntitiesServiceProxy.getAllAccountTypesForTableDropdownWithPaging(
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
            this.accountTypeFilterMetaData.listSkipCount,
            this.accountTypeFilterMetaData.listMaxResultCount,
        )
        .subscribe(result => {
            componentRef.onListLoadCallback(result)
        });
        this.subscriptions.push(subs)
    }

    getAccountStatuses(componentRef:{  onListLoadCallback  : Function}){
        const result : PagedResultDtoOfLookupLabelDto = new PagedResultDtoOfLookupLabelDto()
        result.items = [
            new LookupLabelDto({label:this.l("Connected"),value:1,isHostRecord:true, code: undefined} as ILookupLabelDto),
            new LookupLabelDto({label:this.l("Not Connected"),value:2,isHostRecord:true, code: undefined} as ILookupLabelDto)
        ]
        result.totalCount = result.items.length
        componentRef.onListLoadCallback(result)
    }

    onCategoriesSelect( $event : TreeNodeOfGetSycEntityObjectCategoryForViewDto[] ){
        const ids = $event.map(item=>item.data.sycEntityObjectCategory.id)
        this.categoriesCtrl.setValue(ids)
    }

    onClassificationsSelect( $event : TreeNodeOfGetSycEntityObjectClassificationForViewDto[] ){
        const ids = $event.map(item=>item.data.sycEntityObjectClassification.id)
        this.classificationsCtrl.setValue(ids)
    }

    subscribeToCategoriesAndClassificationReset(){
        this.classificationsCtrl.valueChanges.subscribe((value)=>{
            if (!value) {
                this.selectedClassifications = []
            }
        })
        this.categoriesCtrl.valueChanges.subscribe((value)=>{
            if (!value) {
                this.selectedCategories = []
            }
        })
    }

}
