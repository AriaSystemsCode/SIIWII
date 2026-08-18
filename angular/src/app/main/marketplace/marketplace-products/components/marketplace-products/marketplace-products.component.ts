import {
    Component,
    Injector,
    OnDestroy,
    ViewChild,
    SimpleChanges, OnChanges, ViewChildren,
    Input,
    QueryList
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AppItemsComponent } from "@app/main/app-items/app-items-browse/components/appItems.component";
import {
    AppEntitiesServiceProxy,
    AppMarketplaceItemsServiceProxy,
    CurrencyInfoDto,
    GetAppMarketItemForViewDto,
} from "@shared/service-proxies/service-proxies";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { PricingHelpersService } from "@app/main/app-items/app-item-shared/services/pricing-helpers.service";
import { AppSessionService } from "@shared/common/session/app-session.service";
import { AppComponentBase } from "@shared/common/app-component-base";
import { DatePipe } from "@angular/common";
import { finalize } from "rxjs";
import { BreakpointObserver, BreakpointState } from "@angular/cdk/layout";
import { Paginator } from "primeng/paginator";
import { ProdcutCardComponent } from "../prodcut-card/prodcut-card.component";
@Component({
    selector: "app-marketplace-products",
    templateUrl: "./marketplace-products.component.html",
    styleUrls: ["./marketplace-products.component.scss"],
    animations: [appModuleAnimation()],
    providers: [AppMarketplaceItemsServiceProxy],
})
export class MarketplaceProductsComponent
    extends AppComponentBase
    implements OnDestroy, OnChanges {
    @ViewChild("AppItemsBrowseComponent") appItemsBrowseComponent: AppItemsComponent;
    @ViewChildren(ProdcutCardComponent) ProdcutCardComponent: ProdcutCardComponent;
    @ViewChild("p", { static: false }) paginator!: Paginator;
    @ViewChild("filters", { static: false }) filters!: any;
    @ViewChildren(ProdcutCardComponent) productCards!: QueryList<ProdcutCardComponent>;

    @Input() fromMarketAcoount: boolean;
    @Input() accountDataForView: any
    @Input() marketplaceAccCurrency: string

    isFilterHidden: boolean = true;
    sellerData: any;
    isSellerIdExists: boolean = false;
    currencies: CurrencyInfoDto[];
    selectedCurrrency: any;
    searchInput: string;
    sortingData: any[];
    selectedSort: any;
    sharingOptions: any[];
    seletedOption: any;
    sharingLevel: number;
    currency: string;
    appSession: AppSessionService;
    skipCount: number = 0;
    maxResultCount: number = 12;
    pagesNumber: number;
    displayFitlers: boolean = false;
    filterType: string;
    tentantID: number;
    isMobile: boolean = false;

    sellerSSIN: string;
    buyerSSIN: string;
    contactSSIN: string;
    acceptedAspectRatio;

    isFromSellerRoom: boolean

    items: GetAppMarketItemForViewDto[];
    minimumPrice: number;
    maximumPrice: number;
    timeOut: any;
    onlyAvialbleStock: boolean;
    appItemListId: any;
    selectedDepartments: any;

    isAuthenticate = this.appSession?.user
    selectedCategories: number[] = [];
    sellerSSinSetting: string


    constructor(
        injector: Injector,
        private _router: Router,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _AppMarketplaceItemsServiceProxy: AppMarketplaceItemsServiceProxy,
        private _pricingHelperService: PricingHelpersService,
        public datepipe: DatePipe,
        public breakpointObserver: BreakpointObserver,
        private route: ActivatedRoute,

    ) {
        super(injector);
        this.isFromSellerRoom = JSON.parse(localStorage.getItem("fromSellerRoom"));


        if (localStorage.getItem("contactSSIN") && localStorage.getItem("contactSSIN") != "undefined") {
            this.contactSSIN = JSON.parse(localStorage.getItem("contactSSIN"));
        }

        if (sessionStorage.getItem("SellerSSIN") && sessionStorage.getItem("SellerSSIN") != "undefined") {
            this.sellerSSIN = JSON.parse(sessionStorage.getItem("SellerSSIN"));
        }
        if (localStorage.getItem("BuyerSSIN") && localStorage.getItem("BuyerSSIN") != "undefined") {
            this.buyerSSIN = JSON.parse(localStorage.getItem("BuyerSSIN"));
        }

        this.isSellerIdExists = sessionStorage.getItem("SellerSSIN")
            ? true
            : false;
        if (sessionStorage.getItem("SellerSSIN") && sessionStorage.getItem("SellerSSIN") != "undefined") {
            this._AppMarketplaceItemsServiceProxy
                .getAccountImages(sessionStorage.getItem("SellerSSIN"))
                .subscribe((res) => {
                    this.sellerData = res;
                });
        }
        this.sortingData = [
            { label: this.l('ProductName'), value: 'name' },
            { label: this.l('ProductCode'), value: 'manufacturercode' },
            { label: this.l('PriceLowToHigh'), value: 'price' },
            { label: this.l('PriceHighToLow'), value: 'price desc' },
        ];

        this.selectedSort = {
            label: this.l('ProductName'),
            value: 'name'
        };

        this.sharingOptions = [
            { label: this.l('PublicAndSharedWithMe'), value: 2 },
            { label: this.l('Public'), value: 0 },
            { label: this.l('SharedWithMe'), value: 1 },
        ];

        this.seletedOption = {
            label: this.l('PublicAndSharedWithMe'),
            value: 2
        };
        this.setCurrency();
        this.tentantID = this.appSession?.tenant?.id;



        this.checkMediaQuery();
        if (this.isAuthenticate) {
            this.getAllCurrencies();
            this.getAspectatio();
        }

    }
    ngOnInit() {
        this.getSettingDataMsrp()
        this.getSettingData()
        const state = (this._router.getCurrentNavigation()?.extras?.state ?? history.state) as any;

        if (state?.accountDataForView) {
            this.fromMarketAcoount = !!state.fromMarketAcoount;
            this.accountDataForView = state.accountDataForView;
            this.marketplaceAccCurrency = state.marketplaceAccCurrency;

            localStorage.removeItem('productFilters');
        }
        const savedFilters = localStorage.getItem("productFilters");
        if (savedFilters) {
            const parsedFilters = JSON.parse(savedFilters);
            this.onlyAvialbleStock = parsedFilters.onlyAvailableStock ?? undefined;
            this.selectedCurrrency = parsedFilters.selectedCurrency ?? this.selectedCurrrency;
            this.selectedSort = this.sortingData.find(s => s.value === parsedFilters.selectedSort) ?? this.selectedSort;

            this.appItemListId = parsedFilters.appItemListId || this.appItemListId;
            this.searchInput = parsedFilters.searchText || this.searchInput;
            this.selectedDepartments = parsedFilters.selectedDepartments || this.selectedDepartments;
            this.selectedCategories = parsedFilters.selectedCategory || this.selectedCategories;
            this.minimumPrice = parsedFilters.minimumPrice || this.minimumPrice;
            this.maximumPrice = parsedFilters.maximumPrice || this.maximumPrice;
            this.startSoldOutData = parsedFilters.startSoldOutData || this.startSoldOutData;
            this.endSoldOutData = parsedFilters.endSoldOutData || this.endSoldOutData;
            this.startShipData = parsedFilters.startShipData ? new Date(parsedFilters.startShipData) : this.startShipData;
            this.endShipData = parsedFilters.endShipData ? new Date(parsedFilters.endShipData) : this.endShipData;
            this.brands = parsedFilters.brands || this.brands;
            this.seletedOption = this.sharingOptions.find(option => option.value === parsedFilters.selectedOption) || this.seletedOption;
            this.skipCount = parsedFilters.skipCount || this.skipCount;
            this.maxResultCount = parsedFilters.maxResultCount || this.maxResultCount;
        }

        this.getSettingData().subscribe({
            next: (res) => {

                this.sellerSSinSetting = (res as any)?.value ?? (res as any) ?? null;

                this.route.queryParamMap.subscribe((params) => {

                    // merege
                    const q = params.get('q');
                    if (q !== null) this.searchInput = q;

                    const brandParams = params.getAll('brand');
                    if (brandParams?.length) this.brands = brandParams.map(v => +v);

                    const deptParams = params.getAll('dept');
                    if (deptParams?.length) {
                        const ids = deptParams.map(v => +v).filter(id => !!id);
                        this.selectedDepartments = ids;
                        if (this.filters) this.filters.preselectDeptId = ids[0];
                    }

                    const listParam = params.get('proList');
                    if (listParam) {
                        const id = +listParam;
                        this.appItemListId = id || null;
                        if (this.filters) this.filters.catalogId = id ?? null;
                    }

                    const catParams = params.getAll('cat');
                    if (catParams?.length) {
                        const ids = catParams.map(v => +v).filter(id => !!id);
                        this.selectedCategories = ids;
                        if (this.filters) this.filters.preselectCategoryId = ids[0];
                    }

                    this.getAllProducts();
                });
            },
            error: () => {

                this.sellerSSinSetting = null;

                this.route.queryParamMap.subscribe(() => this.getAllProducts());
            }
        });
    }




    ngAfterViewInit() {
        document.getElementById("_searchInput").focus();

    }

    ngOnChanges(changes: SimpleChanges) {

        document.getElementById("_searchInput").focus();
    }
    getAspectatio() {
        let sycAttachmentCategoryImage;
        this.getSycAttachmentCategoriesByCodes(['LOGO', "BANNER", "IMAGE"]).subscribe((result) => {
            result.forEach(item => {
                if (item.code == "IMAGE") {
                    sycAttachmentCategoryImage = item
                    let [width, height, border] = sycAttachmentCategoryImage.aspectRatio.split(':')
                    this.acceptedAspectRatio = Number(width) / Number(height);
                    return;
                }
            });
        });
    }
    checkMediaQuery() {
        this.breakpointObserver
            .observe(["(max-width: 900px)"])
            .subscribe((state: BreakpointState) => {
                if (state.matches) {
                    this.isMobile = true;
                } else {
                    this.isMobile = false;
                }
            });
    }

    getCurrencyCurrent() {
        this._pricingHelperService.getDefaultPricingInstance();
    }

    getAllCurrencies() {
        this._AppEntitiesServiceProxy
            .getAllCurrencyForTableDropdown()
            .subscribe((res: any) => {
                this.currencies = res;
            });
    }

    toggleFilters() {
        this.isFilterHidden = !this.isFilterHidden;
    }


    getAllProducts() {
        this.showMainSpinner();

        // const selectedCurrency =
        //     (this.fromMarketAcoount)
        //         ? (this.marketplaceAccCurrency || 'USD')
        //         : (this.selectedCurrrency || 'USD');
        const currencyCode = this.getCurrencyCodeForRequest();

        const requestParams = {
            contactSSIN: this.contactSSIN,
            sellerSSIN: this.sellerSSIN,
            tenantId: null,
            appItemListId: this.appItemListId || null,
            searchText: this.searchInput || '',
            selectedDepartments: this.selectedDepartments || [],
            selectedCategory: this.selectedCategories || [],
            minimumPrice: this.minimumPrice || null,
            maximumPrice: this.maximumPrice || null,
            selectedOption: this.seletedOption?.value ?? 2,
            onlyAvailableStock: this.onlyAvialbleStock ?? undefined,
            startSoldOutData: this.startSoldOutData || null,
            endSoldOutData: this.endSoldOutData || null,
            startShipData: this.startShipData || null,
            endShipData: this.endShipData || null,
            brands: this.brands || [],
            selectedCurrency: currencyCode,
            selectedSort: this.selectedSort?.value || 'name',
            skipCount: this.skipCount,
            maxResultCount: this.maxResultCount
        };
        localStorage.setItem("productFilters", JSON.stringify(requestParams));

        this._AppMarketplaceItemsServiceProxy
            .getAll(
                this.contactSSIN,
                this.fromMarketAcoount
                    ? this.accountDataForView?.ssin
                    : this.sellerSSinSetting ? this.sellerSSinSetting : sessionStorage.getItem("SellerSSIN"),
                null,
                requestParams.appItemListId || this.appItemListId,
                false,
                requestParams.searchText || this.searchInput,
                null,
                null,
                null,
                requestParams.selectedDepartments || this.selectedDepartments,
                requestParams.minimumPrice || this.minimumPrice,
                requestParams.maximumPrice || this.maximumPrice,
                this.seletedOption.value,
                requestParams.onlyAvailableStock || this.onlyAvialbleStock,
                requestParams.startSoldOutData || this.startSoldOutData,
                requestParams.endSoldOutData || this.endSoldOutData,
                requestParams.startShipData || this.startShipData,
                requestParams.endShipData || this.endShipData,
                requestParams.brands || this.brands, // ids
                currencyCode,
                undefined,
                requestParams.selectedCategory || this.selectedCategories,  //category
                undefined,
                requestParams.selectedSort || this.selectedSort.value,
                requestParams.skipCount || this.skipCount,
                requestParams.maxResultCount || this.maxResultCount
            )
            .pipe(
                finalize(() => {
                    this.displayFitlers = false;
                    this.hideMainSpinner();
                    this.setCurrency();
                })
            )
            .subscribe((result) => {
                this.items = result.items;
                this.pagesNumber = result.totalCount;

                if (
                    result.items.length == 1 &&
                    !this.fromMarketAcoount &&
                    this.searchInput != ''
                ) {
                    setTimeout(() => {
                        const firstCard = this.productCards.first;
                        firstCard?.viewProduct(firstCard.product.id);
                    }, 500);
                }
            });
    }

    setCurrency() {
        const raw = localStorage.getItem("currencyCode");
        let code = this.tenantDefaultCurrency?.code || 'USD';

        if (raw && raw !== 'undefined' && raw !== 'null') {
            try {
                const parsed = JSON.parse(raw);
                code = parsed?.code ?? parsed ?? code;
            } catch { code = raw; }
        }

        this.selectedCurrrency = this.currencies?.find(c => c.code === code) || 'USD';
        this.currency = this.selectedCurrrency?.code || code;
    }



    onPageChange(value: any) {
        this.skipCount = value.first;
        this.maxResultCount = value.rows;
        this.getAllProducts();
        document.getElementById("_searchInput").focus();

    }

    handleProductSearchText() {
        clearTimeout(this.timeOut);
        this.timeOut = setTimeout(() => {
            this.getAllProducts();
        }, 1500);
    }

    handleSharingLevelsOptions(data: any) {
        this.getAllProducts();
    }

    handleCurrencyChange(data: any) {
        setTimeout(
            () => {
                this.currency = this.selectedCurrrency?.code ? this.selectedCurrrency?.code : this.selectedCurrrency;
                localStorage.setItem("currencyCode", this.currency);
                this.getAllProducts();
            }, 1500);

    }

    handleSortingChange(data: any) {
        this.getAllProducts();
    }
    swtichStock(value) {
        this.onlyAvialbleStock = value.checked;
        this.getAllProducts();
    }

    selectCatalog(value: any) {
        if (!value || !value.id) {
            this.appItemListId = null;
            this.updateUrlQueryParams({ proList: null });
        } else {
            this.appItemListId = value.id;
            this.updateUrlQueryParams({ proList: String(value.id) });
        }
        this.getAllProducts();
    }


    private updateUrlQueryParams(partial: {
        dept?: string | string[] | null;
        proList?: string | null;
        q?: string | null;
        cat?: string | string[] | null;
        brand?: string | string[] | null;
    }) {
        this._router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                dept: partial.dept ?? undefined,
                proList: partial.proList ?? undefined,
                q: partial.q ?? undefined,
                cat: partial.cat ?? undefined,
                brand: partial.brand ?? undefined,
            },
            queryParamsHandling: 'merge',
        });
    }




    selectDepartment(value) {
        this.appItemListId = null;
        if (this.filters) {
            this.filters.catalogId = null;
        }

        const ids = Array.isArray(value)
            ? value.map(id => +id).filter(id => !!id)
            : (value?.node?.data?.sycEntityObjectCategory?.id ? [+value.node.data.sycEntityObjectCategory.id] : []);

        if (!ids.length) {
            this.selectedDepartments = [];
            this.updateUrlQueryParams({ dept: null, proList: null });
        } else {
            this.selectedDepartments = ids;
            this.updateUrlQueryParams({ dept: ids.map(id => String(id)), proList: null });
        }
        this.getAllProducts();
    }




    setPriceFrom(value) {
        this.minimumPrice = value;
        this.getAllProducts();
    }
    setPriceTo(value) {
        this.maximumPrice = value;
        this.getAllProducts();
    }

    startShipData: any;
    setStartShipDate(value) {
        this.startShipData = value;
        this.getAllProducts();
    }

    endShipData: any;
    setEndtShipDate(value) {
        this.endShipData = value;
        this.getAllProducts();
    }
    startSoldOutData: any;
    setStartSoldOutDate(value) {
        this.startSoldOutData = value;
        this.getAllProducts();
    }
    endSoldOutData: any;
    setEndSoldOutDate(value) {
        this.endSoldOutData = value;
        this.getAllProducts();
    }

    brands: any[] = [];

    async selectBrands(value: any[]) {
        this.brands = value || [];

        // No brands -> remove param
        if (!this.brands.length) {
            this.updateUrlQueryParams({ brand: null });
            this.getAllProducts();
            return;
        }

        // Just send IDs as strings
        const brandIdsAsString = this.brands.map(id => String(id));

        // URL becomes ?brand=12&brand=34
        this.updateUrlQueryParams({ brand: brandIdsAsString });

        this.getAllProducts();
    }
    resetProducts($event) {
        this.filters.resetFilters();
        (this.seletedOption = { label: "Public And Shared With Me", value: 2 }),
            (this.selectedCurrrency =
                localStorage.getItem("currencyCode") == "undefined" || JSON.parse(localStorage.getItem("currencyCode")) === null
                    ? this.tenantDefaultCurrency
                    : JSON.parse(localStorage.getItem("currencyCode")));
        this.currency =
            localStorage.getItem("currencyCode") == "undefined" || JSON.parse(localStorage.getItem("currencyCode")) === null
                ? this.tenantDefaultCurrency?.code
                : JSON.parse(localStorage.getItem("currencyCode")).code;
        this.tentantID = this.appSession?.tenant?.id;
        this.selectedSort = { label: "Product Name", value: "name" };
        this.searchInput = "";
        this.paginator.changePageToFirst($event);
        this.appItemListId = ''
        this.selectedCategories = [];
        this.brands = []
        this.skipCount = 0;
        this.maxResultCount = 12;
        this.selectedDepartments = []
        this.onlyAvialbleStock = undefined
        localStorage.removeItem("productFilters");
        this.getAllProducts();
    }
    selectCategory(value: any) {
        this.appItemListId = null;
        if (this.filters) {
            this.filters.catalogId = null;
        }

        const ids = Array.isArray(value)
            ? value.map(id => +id).filter(id => !!id)
            : (value?.node?.data?.sycEntityObjectCategory?.id ? [+value.node.data.sycEntityObjectCategory.id] : []);

        if (!ids.length) {
            this.selectedCategories = [];
            this.updateUrlQueryParams({ cat: null, proList: null });
        } else {
            this.selectedCategories = ids;
            this.updateUrlQueryParams({ cat: ids.map(id => String(id)), proList: null });
        }
        this.getAllProducts();
    }


    ngOnDestroy() {

        // Keep SellerSSIN while navigating inside the seller room / product views
        const inSellerRoom = JSON.parse(localStorage.getItem('fromSellerRoom') || 'false');
        const inMarketplace = JSON.parse(localStorage.getItem('fromMarketPlace') || 'false');

        if ((!inSellerRoom || inMarketplace) && !this.fromMarketAcoount) {
            sessionStorage.removeItem('SellerSSIN');
            localStorage.removeItem('BuyerSSIN');
        }


        // localStorage.setItem("currencyCode", null);
    }


    cancel() {
        this.displayFitlers = false;
    }

    openFiltersDialog(text: string) {
        this.filterType = text;
        this.displayFitlers = true;
    }


    clearFiltrs(value) {
        if (value) {
            this.resetProducts('')
        }

    }
    // private getCurrencyCodeForRequest(): string {

    //     if (this.selectedCurrrency && typeof this.selectedCurrrency === 'object' && this.selectedCurrrency.code) {
    //       return this.selectedCurrrency.code;
    //     }

    //     if (typeof this.selectedCurrrency === 'string' && this.selectedCurrrency.trim()) {
    //       return this.selectedCurrrency.trim();
    //     }

    //     const stored = localStorage.getItem('currencyCode');
    //     if (stored && stored !== 'undefined' && stored !== 'null') {
    //       try {
    //         const parsed = JSON.parse(stored);

    //         if (typeof parsed === 'string' && parsed.trim()) {
    //           return parsed.trim();
    //         }

    //         if (parsed && typeof parsed === 'object' && parsed.code) {
    //           return parsed.code;
    //         }
    //       } catch {

    //         if (stored.trim()) {
    //           return stored.trim();
    //         }
    //       }
    //     }

    //     if ((this as any).tenantDefaultCurrency?.code) {
    //       return (this as any).tenantDefaultCurrency.code;
    //     }

    //     return 'USD';
    //   }

    private getCurrencyCodeForRequest(): string {
        const clean = (val: any): string | null => {
            if (!val) return null;

            if (typeof val === 'string') {
                const v = val.trim();

                if (
                    !v ||
                    v === 'undefined' ||
                    v === 'null' ||
                    v === 'XUA'
                ) {
                    return null;
                }

                return v;
            }

            if (typeof val === 'object' && val.code) {
                return clean(val.code);
            }

            return null;
        };

        let code = clean(this.selectedCurrrency);

        if (!code) {
            const stored = localStorage.getItem('currencyCode');

            if (stored) {
                try {
                    code = clean(JSON.parse(stored)) || clean(stored);
                } catch {
                    code = clean(stored);
                }
            }
        }

        //  Do NOT fallback to tenantDefaultCurrency if it is XUA
        return code || 'USD';
    }

    getSettingData() {
        return this._AppEntitiesServiceProxy.getHostSettingValue(1316, null);
    }

    showMsrP: boolean
    getSettingDataMsrp() {
        this._AppEntitiesServiceProxy.getHostSettingValue(1214, null)
            .subscribe((result) => {
                this.showMsrP = result?.toString().toLowerCase() == 'yes' ? true : false;

            });

    }


}
