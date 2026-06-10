import { ChangeDetectorRef, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { AppTransactionServiceProxy, SycEntityObjectStatusesServiceProxy, SycEntityObjectTypesServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Paginator } from 'primeng/paginator';
import { SelectItem } from 'primeng/api';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { finalize } from 'rxjs';
import { TransactionInformationComponent } from '../../app-TransactionTabsInfo/Components/transaction-information-component/transaction-information.component';
import { TransactionCartMode } from '../../enums/TransactionCartMode';

@Component({
    selector: 'appTransBrowse',
    templateUrl: './appTransBrowse.component.html',
    styleUrls: ['./appTransBrowse.component.scss'],
    animations: [appModuleAnimation()],

})

export class AppTransactionsBrowseComponent extends AppComponentBase implements OnInit {

    @ViewChild("shoppingCartModal", { static: true }) shoppingCartModal: TransactionInformationComponent;
    @ViewChild('dataTable', { static: true }) dataTable;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('dataDetailTable', { static: true }) dataDetailTable;
    
    filterForm: FormGroup;
    pageMainFilters;
    showMainFiltersOptions = true;
    showAddButton = true;
    defaultMainFilter: any;
    filterText = '';
    roles: any[];
    modalheaderName: string;
    formType: string;
    orderNo: string;
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
    showHeader: boolean = true;
    showDetails: boolean = false;
    products: any
    selectedProduct: any;
    variationDetails: any[];
    transactionTypeFilter: number
    transactionNumberFilter = ''
    variationCodeFilter = ''
    referenceNumberFilter = ''
    minPrice: number
    maxPrice: number
    minAmount: number
    maxAmount: number
    totalRecords: number = 0;
    page: number = 0; // current page number
    rowsPerPage: number = 10;
    sortField: string | undefined;
    sortOrder: number | undefined;
    isAmountReset :boolean
    isReset :boolean
    isTypeReset :boolean
  currentLang: string
  isArabic: boolean

    constructor(
        injector: Injector,
        private _appTransactionServiceProxy: AppTransactionServiceProxy,
        private _formBuilder: FormBuilder,
        private _sycEntityObjectTypesServiceProxy: SycEntityObjectTypesServiceProxy,
        private _sycEntityObjectStatusesAppService: SycEntityObjectStatusesServiceProxy,
        private cdr: ChangeDetectorRef
    ) {
        super(injector);
        this.tenantRoleService.loadRoles();

    }
    ngOnInit(): void {
            this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
    this.currentLang == 'ar' || this.currentLang == 'ar-EG' ? this.isArabic = true : this.isArabic = false
        setTimeout(() => {
            this.showHeader = true;
            this.cdr.detectChanges();
        });
        this.setPageMainFilters();
        this.initFilterForm();

    }

    ngOnChanges(): void {
        this.initFilterForm();

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
            transactionTypeFilter: undefined,
            transactionNumberFilter: undefined,
            nameFilter: undefined,
            variationCodeFilter: undefined,
            referenceNumberFilter: undefined,
            minPrice: undefined,
            maxPrice: undefined,
            minAmount: undefined,
            maxAmount: undefined,

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
            false,0,undefined,filters.search,
            filters.codeFilter, undefined,
            filters.mainFilterType?.id,filters.minCreateDateFilter
            , filters.maxCreateDateFilter,
            
            filters.minCompleteDateFilter,
            filters.maxCompleteDateFilter,
            filters.sellerNameFilter, undefined, filters.buyerNameFilter, undefined, filters.statusFilter == null ? undefined: filters.statusFilter, false,
            undefined,undefined,filters.referenceNumberFilter,
            this.primengTableHelper.getSorting(this.dataTable),
            skipCount,
            maxResultCount,
            // this.dataTable.filters
        ).subscribe(result => {
            this.loading = false;
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
            // console.log(result.items,'dataaaaaaaaaaaaaaaaaaa')
            this.primengTableHelper.hideLoadingIndicator();
        });
    }

    onSelectionChange($event) {


        if ($event?.id)
            this.orderId = $event?.id;

        if (this.orderId) {
            if ($event.entityObjectStatusCode == "DRAFT") {
                this.shoppingCartModal.show(this.orderId, true, true, TransactionCartMode.createOrEdit);

            } else {
                this.shoppingCartModal.show(this.orderId, true, true, TransactionCartMode.view);

            }
        }
    }

    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }
    resetList() {
        this.sortField = undefined
        this.sortOrder = undefined
        this.initFilterForm()
        this.dataTable.reset();
        this.dataDetailTable.reset();
        this.setMainPageFilter(this.defaultMainFilter);
        if (this.showHeader) {
            this.getAppTransactions();

        } else if (this.showDetails) {
            this.getVariationDetail()

        }
    }

    setMainPageFilter(filter) {
        const selectedfilter = this.pageMainFilters.filter(
            (item) => filter.id == item.id
        )[0];
        if (!selectedfilter) return;
        this.mainFilterCtrl.setValue(selectedfilter);
    }
    createNewSalesOrder() {
        if (!this.tenantRoleService.canCreateSO()) {
            this.showNoCreatePermissionAlert();
            return;
        }
        else {
            this.roles = this.tenantRoleService.soRolesOptions;
            this.getOderNumber("SO", "Sales Order");
        }
    }

    createNewPurchaseOrder() {
        if (!this.tenantRoleService.canCreatePO()) {
            this.showNoCreatePermissionAlert();
            return;
        }
        else {
            this.roles = this.tenantRoleService.poRolesOptions;
            this.getOderNumber("PO", "Purchase Order");
        }
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
    onSort(event: { field: string; order: number }) {
        this.sortField = event.field;
        this.sortOrder = event.order;
        this.getVariationDetail();  // Trigger data load with new sorting
    }
    getVariationDetail(event?: { page?: number; rows?: number }) {
        this.showMainSpinner();

        // Update pagination if pagination event passed
        if (event) {
            this.page = event.page ?? this.page;
            this.rowsPerPage = event.rows ?? this.rowsPerPage;
        }

        const skipCount = this.page * this.rowsPerPage;
        const filters = this.filterForm.value;

        this._appTransactionServiceProxy
            .getllTransactionVariationsDetail(
                filters.variationCodeFilter,
                filters.mainFilterType?.id == undefined ? undefined : filters.mainFilterType.id == 723 ? 0 : 1,
                filters.search,
                filters.transactionNumberFilter,
                filters.minPrice,
                filters.maxPrice,
                filters.minAmount,
                filters.maxAmount,
                this.sortField ? `${this.sortField} ${this.sortOrder === 1 ? 'ASC' : 'DESC'}` : null,  // Sorting
                skipCount,
                this.rowsPerPage
            )
            .pipe(finalize(() => {
                this.hideMainSpinner();
            }))
            .subscribe(
                (result: any) => {
                    this.variationDetails = result.items;
                    this.totalRecords = result.totalCount;
                },
                (error) => {
                    console.error('API Request Failed:', error);
                    this.loading = false;
                }
            );
    }




    closeModal($event) {
        this.display = false;
        this.reloadPage();
    }


    customFilterCallback(filter: (a) => void, value: any): void {
        filter(value);
    }

    onHideShoppingCartModal($event) {
        if ($event)
            this.getAppTransactions();
    }


    onSearch(event: KeyboardEvent): void {
        event.preventDefault(); // Prevent form submission if inside a form
        event.stopPropagation(); // Prevent triggering other handlers
        this.getAppTransactions();
        this.getVariationDetail();
    }
    resetSort(event: MouseEvent ,field:string) {
        event.stopPropagation(); 
      if (this.sortField === 'amount' && field == 'amount') {
        this.sortField = null;
        this.sortOrder = null;
        this.isAmountReset = true

      }else if (this.sortField === 'price' && field == 'price'){
        this.sortField = null;
        this.sortOrder = null;
      this.isReset = true

      }else if (this.sortField === 'transactionType' && field == 'transactionType'){
        this.sortField = null;
        this.sortOrder = null;
      this.isTypeReset = true

      }

      
      
      this.getVariationDetail()
      if (this.dataDetailTable) {
        this.dataDetailTable.sortField = null;
        this.dataDetailTable.sortOrder = null;
        this.dataDetailTable._sort(); // Force sort reset
      }
    }
    

}