import {  Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
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
    @Input("fromMarketplace") fromMarketplace :boolean=false;

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
   selectedClassifications:
    TreeNodeOfGetSycEntityObjectClassificationForViewDto[] = [];

selectedCategories:
    TreeNodeOfGetSycEntityObjectCategoryForViewDto[] = [];

    languageFilterMetaData :FilterMetaData<LookupLabelDto[]>
    accountTypeFilterMetaData :FilterMetaData<LookupLabelDto[]>
    countryFilterMetaData :FilterMetaData<LookupLabelDto[]>
    currencyFilterMetaData:FilterMetaData<LookupLabelDto[]>
    accountStatusFilterMetaData:FilterMetaData<LookupLabelDto[]>

    categoriesFilterMetaData:FilterMetaData<TreeNodeOfGetSycEntityObjectCategoryForViewDto[]>
    classificationsFilterMetaData:FilterMetaData<TreeNodeOfGetSycEntityObjectClassificationForViewDto[]>

    currencyFilter: string | undefined;
    countryFilter: string | undefined;

    accountTypeOptions: any[] = [];

    constructor(
        injector:Injector,
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _sycEntityObjectClassificationsServiceProxy: SycEntityObjectClassificationsServiceProxy ,
        private _sycEntityObjectCategoriesServiceProxy: SycEntityObjectCategoriesServiceProxy,
    ) {
        super(injector)
   
    }

    ngOnInit(): void {
        this.getAccountTypesList()
        // this.accountTypeFilterMetaData = new FilterMetaData<LookupLabelDto[]>({list : this.accountTypes})
          this.accountTypeFilterMetaData = new FilterMetaData<LookupLabelDto[]>({ list: this.accountTypes });
        this.languageFilterMetaData = new FilterMetaData<LookupLabelDto[]>({list : this.languages})
        this.countryFilterMetaData = new FilterMetaData<LookupLabelDto[]>({list : this.countries})
        this.currencyFilterMetaData = new FilterMetaData<LookupLabelDto[]>({list : this.currencies})
        this.accountStatusFilterMetaData = new FilterMetaData<LookupLabelDto[]>({list : this.accountStatuses})
        this.categoriesFilterMetaData = new FilterMetaData<TreeNodeOfGetSycEntityObjectCategoryForViewDto[]>({list : this.categories})
        this.classificationsFilterMetaData = new FilterMetaData<TreeNodeOfGetSycEntityObjectClassificationForViewDto[]>({list : this.classifications})

        this.subscribeToCategoriesAndClassificationReset()

        this.filterForm.get('accountTypes')?.valueChanges.subscribe((value) => {
    const selectedItem = this.accountTypeOptions?.find(x => x.value === value);
    const isBusiness = selectedItem?.code?.toUpperCase() === 'BUSINESS';

    if (!isBusiness) {
        this.filterForm.get('classifications')?.setValue(null);
        this.filterForm.get('categories')?.setValue(null);
    }
});
    }

    ngOnDestroy() {
        this.emitDestroy()
    }

    private resetMeta(m: FilterMetaData<any>) {
        m.list = [];
        m.displayedList = [];
        m.listSkipCount = 0;
        m.listTotalCount = 0;
      }
      

      onLookupSearch(q: string, kind: any, componentRef: any) {
        const query = q?.trim() || undefined;
      
        switch (kind) {
          case 'country':
            this.countryFilter = query;
            this.resetMeta(this.countryFilterMetaData);
            this.getCountriesList(componentRef);
            break;
      
          case 'currency':
            this.currencyFilter = query;
            this.resetMeta(this.currencyFilterMetaData);
            this.getCurrenciesList(componentRef);
            break;
        }
      }


  getClassificationsList(
    componentRef: any
) {

    this.loading = true;

    const subs =
        this
            ._sycEntityObjectClassificationsServiceProxy
            .getAllWithChildsForContactWithPaging(
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
                this.classificationsFilterMetaData
                    .listSkipCount,
                this.classificationsFilterMetaData
                    .listMaxResultCount
            )
            .pipe(
                finalize(
                    () =>
                        this.loading =
                            false
                )
            )
            .subscribe(res => {

                componentRef
                    .onListLoadCallback(
                        res
                    );

                const ids =
                    this.getSelectedIds(
                        'classifications'
                    );

                const selectedNodes =
                    this.findClassificationNodesByIds(
                        res.items || [],
                        ids
                    );


                componentRef
                    .restoreSelection?.(
                        selectedNodes
                    );
            });

    this.subscriptions.push(
        subs
    );
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

  loadCategoriesNode(
    node: TreeNodeOfGetSycEntityObjectCategoryForViewDto
): void {

    if (!node) {
        return;
    }

    const loadedCompletely =
        !isNaN(node?.totalChildrenCount) &&
        !isNaN(node?.children?.length) &&
        node.totalChildrenCount ===
            node.children.length;

    if (loadedCompletely) {
        return;
    }

    const parentId =
        node?.data
            ?.sycEntityObjectCategory
            ?.id;

    if (!parentId) {
        return;
    }

    this.loading = true;

    const subs =
        this._sycEntityObjectCategoriesServiceProxy
            .getAllChildsWithPaging(
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
                undefined,
                undefined,

                this.sortBy,

                0,

                node.totalChildrenCount
            )
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe({
                next: (res) => {

                    if (!node.children) {
                        node.children = [];
                    }


                    const existingIds =
                        new Set(
                            node.children
                                .map(
                                    child =>
                                        child?.data
                                            ?.sycEntityObjectCategory
                                            ?.id
                                )
                                .filter(
                                    id =>
                                        id !== null &&
                                        id !== undefined
                                )
                        );

                    const newChildren =
                        (res?.items || [])
                            .filter(
                                child => {

                                    const id =
                                        child?.data
                                            ?.sycEntityObjectCategory
                                            ?.id;

                                    return (
                                        id !== null &&
                                        id !== undefined &&
                                        !existingIds.has(id)
                                    );
                                }
                            );

                    node.children.push(
                        ...newChildren
                    );

                    /**
                     * ---------------------------------
                     * Restore saved selected categories
                     * ---------------------------------

                     */

                    const selectedIds =
                        this.getSelectedIds(
                            'categories'
                        );

                    if (!selectedIds.length) {
                        return;
                    }

                    const matchedNodes =
                        this.findCategoryNodesByIds(
                            node.children,
                            selectedIds
                        );

                    if (
                        !matchedNodes?.length
                    ) {
                        return;
                    }


                    const currentSelected =
                        this.selectedCategories ||
                        [];

                    const currentIds =
                        new Set(
                            currentSelected
                                .map(
                                    item =>
                                        item?.data
                                            ?.sycEntityObjectCategory
                                            ?.id
                                )
                                .filter(
                                    id =>
                                        id !== null &&
                                        id !== undefined
                                )
                        );

                    const nodesToAdd =
                        matchedNodes.filter(
                            item => {

                                const id =
                                    item?.data
                                        ?.sycEntityObjectCategory
                                        ?.id;

                                return (
                                    id !== null &&
                                    id !== undefined &&
                                    !currentIds.has(id)
                                );
                            }
                        );

                    this.selectedCategories = [
                        ...currentSelected,
                        ...nodesToAdd
                    ];


                },

                error: () => {
                    this.loading = false;
                }
            });

    this.subscriptions.push(
        subs
    );
}


    getCurrenciesList(
    componentRef: any
) {

    const subs =
        this._appEntitiesServiceProxy
            .getAllCurrencyForTableDropdownWithPaging(
                this.currencyFilter,
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
                this.currencyFilterMetaData
                    .listSkipCount,
                this.currencyFilterMetaData
                    .listMaxResultCount
            )
            .subscribe(
                result => {

                    componentRef
                        .onListLoadCallback(
                            result
                        );

                    // this.restoreSimpleCheckboxes(
                    //     'currencies',
                    //     result.items,
                    //     componentRef
                    // );
                }
            );

    this.subscriptions.push(
        subs
    );
}
      

  getCountriesList(
    componentRef: {
        onListLoadCallback:
            Function
    }
) {

    const subs =
        this._appEntitiesServiceProxy
            .getAllCountryForTableDropdowWithPaging(
                this.countryFilter,
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
                this.countryFilterMetaData
                    .listSkipCount,
                this.countryFilterMetaData
                    .listMaxResultCount
            )
            .subscribe(result => {

                componentRef
                    .onListLoadCallback(
                        result
                    );

              
            });

    this.subscriptions.push(
        subs
    );
}

private restoreSimpleCheckboxes(
    controlName: string,
    items: any[],
    componentRef: any
): void {

    const selectedIds =
        this.getSelectedIds(
            controlName
        );

    if (!selectedIds.length) {
        return;
    }

    const selectedItems =
        (items || [])
            .filter(item =>
                selectedIds.includes(
                    Number(
                        item?.value ??
                        item?.id
                    )
                )
            );



    this.filterForm
        .get(controlName)
        ?.setValue(
            selectedIds,
            {
                emitEvent: false
            }
        );
}
    getLanguagesList(componentRef:{  onListLoadCallback  : Function}){
        const subs = this._appEntitiesServiceProxy.getAllLanguageForTableDropdownWithPaging(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            false,
            undefined,
            undefined,
            undefined,
            undefined,
            this.sortBy,
            this.languageFilterMetaData.listSkipCount,
            this.languageFilterMetaData.listMaxResultCount,
        ).subscribe(result => {

    componentRef
        .onListLoadCallback(
            result
        );

    // this.restoreSimpleCheckboxes(
    //     'languages',
    //     result.items,
    //     componentRef
    // );
});
        this.subscriptions.push(subs)
    }

getAccountTypesList(): void {
  const subs = this._appEntitiesServiceProxy
    .getAllAccountTypesForTableDropdownWithPaging(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      false,
      undefined,
      undefined,
      undefined,
      undefined,
      this.sortBy,
      0,
      10,
      !this.fromMarketplace
    )
    .subscribe(result => {
      const uniqueCodes = new Set();
      const filteredItems = [];

      result.items.forEach(item => {
        const code = item.code?.toUpperCase();

        if (['BUSINESS', 'GROUP'].includes(code) && !uniqueCodes.has(code)) {
          uniqueCodes.add(code);
        //   filteredItems.push(item);
            filteredItems.push({
      ...item,
      label: this.l(code) // BUSINESS, GROUP
    });
        }

        if (code === 'PERSONAL' && !uniqueCodes.has('PERSONAL')) {
          uniqueCodes.add('PERSONAL');
          filteredItems.push({ ...item, label: this.l('PERSONAL') });
        }

        if (item.label?.toUpperCase() === 'PEOPLE' && !uniqueCodes.has('PERSONAL')) {
          uniqueCodes.add('PERSONAL');
          filteredItems.push({ ...item, label: this.l('PERSONAL'), code: 'PERSONAL' });
        }
      });

      this.accountTypeOptions = [
        { label: this.l('All'), value: null },
        ...filteredItems
      ];
    });

  this.subscriptions.push(subs);
}
      
      
      

    getAccountStatuses(
    componentRef: any
) {

    const result =
        new PagedResultDtoOfLookupLabelDto();

    result.items = [
        new LookupLabelDto({
            label:
                this.l(
                    'Connected'
                ),
            value: 1,
            isHostRecord: true,
            code: undefined
        } as ILookupLabelDto),

        new LookupLabelDto({
            label:
                this.l(
                    'Not Connected'
                ),
            value: 2,
            isHostRecord: true,
            code: undefined
        } as ILookupLabelDto)
    ];

    result.totalCount =
        result.items.length;

    componentRef
        .onListLoadCallback(
            result
        );

    // this.restoreSimpleCheckboxes(
    //     'statuses',
    //     result.items,
    //     componentRef
    // );
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


    get showBusinessOnlyFilters(): boolean {
    const selectedValue = this.filterForm?.get('accountTypes')?.value;

    const selectedItem = this.accountTypeOptions?.find(x => x.value === selectedValue);

    return selectedItem?.code?.toUpperCase() === 'BUSINESS';
}


/////////////////////////////
private getSelectedIds(
    controlName: string
): number[] {

    const value =
        this.filterForm
            ?.get(controlName)
            ?.value;

    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map(x => {

            if (
                typeof x === 'number'
            ) {
                return x;
            }

            if (
                typeof x === 'string'
            ) {
                return Number(x);
            }

            return (
                x?.value ??
                x?.id ??
                null
            );
        })
        .filter(
            x =>
                x !== null &&
                x !== undefined &&
                !isNaN(Number(x))
        )
        .map(Number);
}



private findClassificationNodesByIds(
    nodes:
        TreeNodeOfGetSycEntityObjectClassificationForViewDto[],
    ids: number[]
):
    TreeNodeOfGetSycEntityObjectClassificationForViewDto[] {

    const selected:
        TreeNodeOfGetSycEntityObjectClassificationForViewDto[] =
        [];

    const visit = (
        list:
            TreeNodeOfGetSycEntityObjectClassificationForViewDto[]
    ) => {

        (list || [])
            .forEach(
                node => {

                    const id =
                        node?.data
                            ?.sycEntityObjectClassification
                            ?.id;

                    if (
                        ids.includes(
                            Number(id)
                        )
                    ) {
                        selected.push(
                            node
                        );
                    }

                    if (
                        node?.children
                            ?.length
                    ) {
                        visit(
                            node.children
                        );
                    }
                }
            );
    };

    visit(nodes);

    return selected;
}
private findCategoryNodesByIds(
    nodes:
        TreeNodeOfGetSycEntityObjectCategoryForViewDto[],
    ids: number[]
):
    TreeNodeOfGetSycEntityObjectCategoryForViewDto[] {

    const selected:
        TreeNodeOfGetSycEntityObjectCategoryForViewDto[] =
        [];

    const visit = (
        list:
            TreeNodeOfGetSycEntityObjectCategoryForViewDto[]
    ) => {

        (list || [])
            .forEach(
                node => {

                    const id =
                        node?.data
                            ?.sycEntityObjectCategory
                            ?.id;

                    if (
                        ids.includes(
                            Number(id)
                        )
                    ) {
                        selected.push(
                            node
                        );
                    }

                    if (
                        node?.children
                            ?.length
                    ) {
                        visit(
                            node.children
                        );
                    }
                }
            );
    };

    visit(nodes);

    return selected;
}
}
