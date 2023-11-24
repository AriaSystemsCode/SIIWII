import { Component, EventEmitter, Injector, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LazyLoadEvent, Paginator, SelectItem } from 'primeng';
import { debounceTime, finalize } from 'rxjs/operators';
import { AccountsServiceProxy, GetMemberForViewDto, MemberFilterTypeEnum } from '@shared/service-proxies/service-proxies';
import { MembersListComponentInputsI } from '../models/member-list-component-interface';
@Component({
    selector: 'app-members-list',
    templateUrl: './members-list.component.html',
    styleUrls: ['./members-list.component.scss'],
    animations: [appModuleAnimation()]
})
export class MembersListComponent extends AppComponentBase {
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @Output() create : EventEmitter<number> = new EventEmitter<number>()
    @Output() view : EventEmitter<{memberId:number,userId:number}> = new EventEmitter<{memberId:number,userId:number}>()

    singleItemPerRowMode: boolean = false
    MemberFilterTypeEnum = MemberFilterTypeEnum
    showConfirm: boolean = false
    selectedItemId: number
    selectedIndex: number

    _entityTypeFullName = 'onetouch.AppItems.AppItem';
    entityHistoryEnabled = false;

    members: GetMemberForViewDto[] = []
    sortingOptions: SelectItem[]

    active: boolean = false
    loading: boolean = false
    defaultMainFilter: MemberFilterTypeEnum
    showMainFiltersOptions: boolean
    pageMainFilters: SelectItem[] = [];
    debounceTimeDelay:number = 1500
    // instantSearch:boolean = false

    filterForm: FormGroup
    isHost: boolean
    accountId:number
    title:string
    canAdd:boolean
    canView:boolean
    showActiveStatus:boolean
    get mainFilterCtrl(): AbstractControl { return this.filterForm?.get('mainFilterType') }
    get sortingCtrl(): AbstractControl { return this.filterForm?.get('sorting') }
    get searchCtrl(): AbstractControl { return this.filterForm?.get('search') }
    constructor(
        injector: Injector,
        private _formBuilder: FormBuilder,
        private _accountsServiceProxy: AccountsServiceProxy,
    ) {
        super(injector);
        this.overridePrimeTableSetting()
    }
    show(inputs:MembersListComponentInputsI ) {
        this.showMainSpinner()
        this.loading = true
        // if(this.accountId && this.members?.length) return
        this.pageMainFilters = inputs.pageMainFilters
        this.defaultMainFilter = inputs.defaultMainFilter
        if( this.defaultMainFilter == MemberFilterTypeEnum.Profile ) {
            this.showActiveStatus = true
        } else if ( this.defaultMainFilter == MemberFilterTypeEnum.MarketPlace || this.defaultMainFilter == MemberFilterTypeEnum.View ) {
            this.showActiveStatus = false
        }
        this.showMainFiltersOptions = inputs.showMainFiltersOptions
        this.canAdd = inputs.canAdd
        this.canView = inputs.canView
        this.accountId = inputs.accountId
        this.isHost = !this.appSession.tenantId;
        this.initFilterForm()
        this.applyFiltersOnChange()
        this.defineSortingOptions()
        this.getUserPreferenceForListView()
        this.setMainPageFilter(this.defaultMainFilter)
        this.active = true
    }

    setMainPageFilter(filter: MemberFilterTypeEnum) {
        const selectedfilter = this.pageMainFilters.filter(item => filter == item.value)[0]
        if (!selectedfilter) return
        this.mainFilterCtrl.setValue(selectedfilter)
    }
    overridePrimeTableSetting() {
        this.primengTableHelper.defaultRecordsCountPerPage = 10
        this.primengTableHelper.predefinedRecordsCountPerPage = new Array().fill(10, 0, 4).map((item, index) => item += item * index)
    }

    applyFiltersOnChange() {
        let debounceTimeDelay = this.debounceTimeDelay
        const subs = this.filterForm.valueChanges
            .pipe(
                 debounceTime(debounceTimeDelay ),
            )
            .subscribe((status) => {
                if (status) {
                    this.getMembers({ rows: this.primengTableHelper.defaultRecordsCountPerPage })
                }
            })
        this.subscriptions.push(subs)
    }

    saveUserPreferenceForListView() {
        const key = "members-list-view-mode"
        const value = String(Number(this.singleItemPerRowMode))
        localStorage.setItem(key, value)
    }
    getUserPreferenceForListView() {
        const key = "members-list-view-mode"
        const value = localStorage.getItem(key)
        if (value) this.singleItemPerRowMode = Boolean(Number(value))
    }
    triggerListView() {
        this.singleItemPerRowMode = !this.singleItemPerRowMode
        this.saveUserPreferenceForListView()
    }

    defineSortingOptions() {
        this.sortingOptions = [
            { label: this.l('FirstName'), value: "name asc" },
            { label: this.l('Surname'), value: "lastName asc" },
        ]
    }

    resetList() {
        this.filterForm.reset()
        this.setMainPageFilter(this.defaultMainFilter)
    }

    getMembers(event?: LazyLoadEvent) {
        if ( isNaN(this.defaultMainFilter) ) return
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }
        const filters = this.filterForm.value
        this.primengTableHelper.showLoadingIndicator();
        this.showMainSpinner()
        this.loading = true
        const subs = this._accountsServiceProxy.getAllMembers(
            filters?.search || undefined,
            this.accountId,
            filters?.mainFilterType?.value ,
            filters?.sorting?.value || undefined,
            this.primengTableHelper.getSkipCount(this.paginator, event) || 0,
            this.primengTableHelper.getMaxResultCount(this.paginator, event)
        )
        .pipe(finalize(() => {
            if (!this.active) this.active = true
            this.loading = false
            this.hideMainSpinner()
            this.primengTableHelper.hideLoadingIndicator();
        }))
        .subscribe(result => {
            this.members = result.items
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
        });
        this.subscriptions.push(subs)
    }


    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }

    createNewMember() {
        if(!this.canAdd) return
        this.create.emit()
    }

    viewMember(memberId:number,userId:number) {
        if(!this.canView) return
        this.view.emit({memberId,userId})
    }

    exportToExcel(): void {
        // this._accountsServiceProxy.getAccountsToExcel(
        // this.filterText,
        //     this.appEntityNameFilter,
        // )
        // .subscribe(result => {
        //     this._fileDownloadService.downloadTempFile(result);
        //  });
    }


    initFilterForm() {
        if (this.filterForm) return
        this.filterForm = this._formBuilder.group({
            search: [],
            mainFilterType: [],
            sorting: [],
        })
    }
    handleSearchInput($event ){
        this.searchCtrl.setValue($event.target.value)
    }

    hide(){
        this.active = false
        this.subscriptions.forEach(subs=>subs.unsubscribe())
        this.filterForm.reset()
        this.members = []
    }
}
