import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { AppTransactionServiceProxy, SycEntityObjectStatusesServiceProxy, SycEntityObjectTypesServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent, SelectItem } from 'primeng/api';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { finalize } from 'rxjs';
import { ShoppingCartViewComponentComponent } from '@app/admin/app-shoppingCart/Components/shopping-cart-view-component/shopping-cart-view-component.component';
import { ShoppingCartMode } from '@app/admin/app-shoppingCart/Components/shopping-cart-view-component/ShoppingCartMode';

@Component({
    selector: 'appTransBrowse',
    templateUrl: './appTransBrowse.component.html',
    styleUrls: ['./appTransBrowse.component.scss'],
    animations: [appModuleAnimation()],

})

export class AppTransactionsBrowseComponent extends AppComponentBase implements OnInit {

    @ViewChild('dataTable', { static: true }) dataTable;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    filterForm: FormGroup;
    pageMainFilters;
    showMainFiltersOptions = true;
    showAddButton = true;
    defaultMainFilter: any;
    filterText = '';
    roles: any[];
    modalheaderName: string;
    formType: string;
    orderNo: any;
    fullName: string = "";
    display: boolean = false;
    filterTransType: SelectItem[] = [];
    filterStatus: SelectItem[] = [];
    loading: boolean = false;
    advancedFiltersAreShown = false;

    sellerNameFilter = '';
    buyerNameFilter = '';
    codeFilter = '';
    statusFilter: number;
    maxCreateDateFilter: moment.Moment;
    minCreateDateFilter: moment.Moment;
    maxCompleteDateFilter: moment.Moment;
    minCompleteDateFilter: moment.Moment;
    orderId: number = 0;
    @ViewChild("shoppingCartModal", { static: true }) shoppingCartModal: ShoppingCartViewComponentComponent;


    constructor(
        injector: Injector,
        private _appTransactionServiceProxy: AppTransactionServiceProxy,
        private _formBuilder: FormBuilder,
        private _sycEntityObjectTypesServiceProxy: SycEntityObjectTypesServiceProxy,
        private _sycEntityObjectStatusesAppService: SycEntityObjectStatusesServiceProxy
    ) {
        super(injector);
    }
    ngOnInit(): void {
        this.setPageMainFilters();
        this.initFilterForm();
        // this.getAppTransactions();
    }
    initFilterForm() {
        this.filterForm = this._formBuilder.group({
            search: undefined,
            sellerNameFilter: undefined,
            buyerNameFilter: undefined,
            codeFilter: undefined,
            statusFilter: 0,
            maxCreateDateFilter: undefined,
            minCreateDateFilter: undefined,
            maxCompleteDateFilter: undefined,
            minCompleteDateFilter: undefined,
            mainFilterType: this.defaultMainFilter,

        });

        const selectedfilter = this.pageMainFilters.filter(
            (item) => this.defaultMainFilter.id == item.id
        )[0];
        if (!selectedfilter) return;
        this.mainFilterCtrl.setValue(selectedfilter);
    }

    setPageMainFilters() {
        this.pageMainFilters = [];
        this.filterTransType = [];
        this.filterStatus = [];
        this._sycEntityObjectStatusesAppService.getAllSycEntityStatusForTableDropdown("TRANSACTION").subscribe(result => {
            for (let index = 0; index < result.length; index++) {
                this.filterStatus.push({ label: result[index].displayName, value: result[index].id });
            }

        });

        this._sycEntityObjectTypesServiceProxy.getSycEntityObjectTypeForObjectAsTableDropdown("TRANSACTION").subscribe(result => {
            this.pageMainFilters = result;
            for (let index = 0; index < this.pageMainFilters.length; index++) {
                //   this.filterTransType.push(this.pageMainFilters[index].displayName.toUpperCase().toString().replace(/ /g, ""));
                this.filterTransType.push({ label: this.pageMainFilters[index].displayName, value: this.pageMainFilters[index].id });
            }

            this.pageMainFilters.unshift({ displayName: this.l('MyTransactions'), id: undefined });;
            this.defaultMainFilter = this.pageMainFilters[0];
            this.initFilterForm();
        });
    }


    get mainFilterCtrl(): AbstractControl {
        return this.filterForm?.get("mainFilterType");
    }

    getAppTransactions(event?: { first?: number, page?: number, pageCount?: number, rows?: number }) {

        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.totalRecords = this.primengTableHelper.totalRecordsCount > 0 ? this.primengTableHelper.totalRecordsCount : 10;
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();
        this.paginator.rows = event.rows;
        var maxResultCount = this.primengTableHelper.getMaxResultCount(this.paginator, event)
        var skipCount = (event?.page || 0) * maxResultCount

        const filters = this.filterForm.value;
        this.loading = true;
        // filters.transTypeFilter = filters.transTypeFilter.toUpperCase().toString().replace(/ /g, "")
        this._appTransactionServiceProxy.getAll(
            false, 0, filters.search,
            filters.codeFilter, undefined,
            filters.mainFilterType?.id, filters.minCreateDateFilter
            , filters.maxCreateDateFilter,
            filters.minCompleteDateFilter,
            filters.maxCompleteDateFilter,
            filters.sellerNameFilter, undefined, filters.buyerNameFilter, undefined, filters.statusFilter, false,
            this.primengTableHelper.getSorting(this.dataTable),
            skipCount,
            maxResultCount
            // this.dataTable.filters
        ).subscribe(result => {
            this.loading = false;
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
            console.log(result.items,'dataaaaaaaaaaaaaaaaaaa')
            this.primengTableHelper.hideLoadingIndicator();
        });
    }

    onSelectionChange($event) {
        /* if($event.entityObjectStatusCode!="DRAFT")
             return ; */
        if ($event?.id)
            this.orderId = $event?.id;

        if (this.orderId)
            this.shoppingCartModal.show(this.orderId, true, true, ShoppingCartMode.view);
    }

    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }
    resetList() {
        this.filterForm.reset();
        this.dataTable.reset();
        this.setMainPageFilter(this.defaultMainFilter);
        this.getAppTransactions();
    }

    setMainPageFilter(filter) {
        const selectedfilter = this.pageMainFilters.filter(
            (item) => filter.id == item.id
        )[0];
        if (!selectedfilter) return;
        this.mainFilterCtrl.setValue(selectedfilter);
    }
    createNewSalesOrder() {
        this.roles = [
            { name: "I'm a Seller", code: 1 },
            {
                name: "I'm an Independent Sales Rep.",
                code: 3,
            },
        ];
        this.getOderNumber("SO", "Sales Order");
    }

    createNewPurchaseOrder() {
        this.roles = [
            { name: "I'm a Buyer", code: 2 },
            {
                name: "I'm an Independent buying office.",
                code: 3,
            },
        ];
        this.getOderNumber("PO", "Purchase Order");

    }

    getOderNumber(tranType: string, tranName: string) {
        this.showMainSpinner();
        this._appTransactionServiceProxy
            .getNextOrderNumber(tranType)
            .pipe(finalize(() => {
                this.hideMainSpinner()
            }))
            .subscribe((res: any) => {
                this.orderNo = res;
                this.formType = tranType;
                this.modalheaderName = tranName;
                this.fullName =
                    this.appSession.user.name + this.appSession.user.surname;
                this.display = true;
            });
    }


    closeModal($event) {
        this.display = false;
        this.reloadPage();
    }


    customFilterCallback(filter: (a) => void, value: any): void {
        filter(value);
    }

    onHideShoppingCartModal($event){
        if($event)
          this.getAppTransactions();
    }
}