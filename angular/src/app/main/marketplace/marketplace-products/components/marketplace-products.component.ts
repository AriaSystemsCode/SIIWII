import {
    AfterViewInit,
    Component,
    Injector,
    OnDestroy,
    ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AppItemsComponent } from "@app/main/app-items/app-items-browse/components/appItems.component";
import {
    AppItemsBrowseComponentFiltersDisplayFlags,
    AppItemsBrowseComponentStatusesFlags,
    AppItemsBrowseComponentActionsMenuFlags,
    AppItemsBrowseInputs,
} from "@app/main/app-items/app-items-browse/models/app-item-browse-inputs.model";
import { AppItemBrowseEvents } from "@app/main/app-items/app-items-browse/models/appItems-browse-events";
import { ActionsMenuEventEmitter } from "@app/main/app-items/app-items-browse/models/ActionsMenuEventEmitter";
import {
    AppEntitiesServiceProxy,
    AppItemsServiceProxy,
    AppMarketplaceItemsServiceProxy,
    ItemsFilterTypesEnum,
} from "@shared/service-proxies/service-proxies";
import { SelectItem } from "primeng/api";
import { BrowseMode } from "@app/main/app-items/app-items-browse/models/BrowseModeEnum";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { PricingHelpersService } from "@app/main/app-items/app-item-shared/services/pricing-helpers.service";
import { AppSessionService } from "@shared/common/session/app-session.service";
import { AppComponentBase } from "@shared/common/app-component-base";
import { DatePipe } from "@angular/common";
import { finalize } from "rxjs";
import { BreakpointObserver, BreakpointState } from "@angular/cdk/layout";
import { Paginator } from "primeng/paginator";

@Component({
    selector: "app-marketplace-products",
    templateUrl: "./marketplace-products.component.html",
    styleUrls: ["./marketplace-products.component.scss"],
    animations: [appModuleAnimation()],
    providers: [AppMarketplaceItemsServiceProxy],
})
export class MarketplaceProductsComponent
    extends AppComponentBase
    implements OnDestroy
{
    @ViewChild("AppItemsBrowseComponent")
    appItemsBrowseComponent: AppItemsComponent;
    isFilterHidden: boolean = false;
    sellerData: any;
    isSellerIdExists: boolean = false;
    currencies: any[];
    selectedCurrrency: any;
    searchInput: string;
    sortingData: any[];
    selectedSort: any;
    sharingOptions: any[];
    seletedOption: any;
    sharingLevel: number;
    currency: string;
    sortBy: number;
    appSession: AppSessionService;
    skipCount: number = 0;
    maxResultCount: number = 10;
    pagesNumber: number;
    displayFitlers: boolean = false;
    filterType: string;
    tentantID: any;
    isMobile: boolean = false;
    @ViewChild("p", { static: false })
    paginator!: Paginator;
    @ViewChild("filters", { static: false }) filters!: any;
    sellerSSIN: any;
    buyerSSIN: any;

    constructor(
        injector: Injector,
        private _router: Router,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _AppMarketplaceItemsServiceProxy: AppMarketplaceItemsServiceProxy,
        private _pricingHelperService: PricingHelpersService,
        public datepipe: DatePipe,
        public breakpointObserver: BreakpointObserver
    ) {
        super(injector);

        if (localStorage.getItem("SellerSSIN") &&localStorage.getItem("SellerSSIN")!="undefined" ) {
            this.sellerSSIN = JSON.parse(localStorage.getItem("SellerSSIN"));
        }
        if (localStorage.getItem("BuyerSSIN") &&localStorage.getItem("BuyerSSIN")!="undefined" ) {
            this.buyerSSIN = JSON.parse(localStorage.getItem("BuyerSSIN"));
        }

        // this.getAllProducts()
        this.isSellerIdExists = localStorage.getItem("SellerSSIN")
            ? true
            : false;
        if (localStorage.getItem("SellerSSIN") &&localStorage.getItem("SellerSSIN")!="undefined" ) {
            this._AppMarketplaceItemsServiceProxy
                //.getAccountImages(Number(localStorage.getItem("SellerId")))
                .getAccountImages(localStorage.getItem("SellerSSIN"))
                .subscribe((res) => {
                    console.log(">> sellerData", res);
                    this.sellerData = res;
                });
        }
        this.sortingData = [
            { label: "Product Name", value: "name" },
            { label: "Product code", value: "code" },
            { label: "Price low to high", value: "price" },
            { label: "Price high to low", value: "price desc" },
        ];
        this.selectedSort = { label: "Product Name", value: "name" };
        this.sharingOptions = [
            { label: "Public And Shared With Me", value: 2 },
            { label: "Public", value: 0 },
            { label: "Shared With Me", value: 1 },
        ];
        (this.seletedOption = { label: "Public And Shared With Me", value: 2 }),
            this.getAllCurrencies();
        this.selectedCurrrency =
        localStorage.getItem("currencyCode")=="undefined"  || JSON.parse(localStorage.getItem("currencyCode")) === null
                ? this.tenantDefaultCurrency
                : JSON.parse(localStorage.getItem("currencyCode"));
        this.currency =
        localStorage.getItem("currencyCode")=="undefined"  ||   JSON.parse(localStorage.getItem("currencyCode")) === null
                ? this.tenantDefaultCurrency.code
                : JSON.parse(localStorage.getItem("currencyCode")).code;
        this.tentantID = this.appSession?.tenant?.id;
        // init get products on screen initalization
        this.showMainSpinner();
        this._AppMarketplaceItemsServiceProxy
            .getAll(
                localStorage.getItem("SellerSSIN"),
                null, // tenant id
                null,
                false, // false
                this.searchInput, // search text
                null, //null
                null, //null
                null, // null
                [], // depratment
                null,
                null,
                this.seletedOption.value,
                false,
                undefined, //'2022-2-2'
                undefined,
                undefined,
                undefined,
                [], // ids
                this.selectedCurrrency?.code  ?  this.selectedCurrrency?.code  :  this.selectedCurrrency,
                this.selectedSort.value,
                this.skipCount,
                this.maxResultCount
            )
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe((result) => {
                this.items = result.items;
                this.pagesNumber = result.totalCount;
            });
        // this.getCurrencyCurrent();

        this.checkMediaQuery();
    }

    checkMediaQuery() {
        this.breakpointObserver
            .observe(["(max-width: 900px)"])
            .subscribe((state: BreakpointState) => {
                console.log(">>", state.matches);
                if (state.matches) {
                    this.isMobile = true;
                } else {
                    this.isMobile = false;
                }
            });
    }

    getCurrencyCurrent() {
        this._pricingHelperService.getDefaultPricingInstance();
        console.log(
            ">>",
            this._pricingHelperService.getDefaultPricingInstance()
        );
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

    viewProductHandler(
        $event: ActionsMenuEventEmitter<AppItemBrowseEvents, number>
    ) {
        if ($event.event != AppItemBrowseEvents.View) return;
        this._router.navigate([
            "/app/main/marketplace/products/view",
            $event.data,
        ]);
    }

    items: any[];

    getAllProducts() {
        this.showMainSpinner();
        this._AppMarketplaceItemsServiceProxy
            .getAll(
                localStorage.getItem("SellerSSIN"),
                null, // tenant id
                this.appItemListId,
                false, // false
                this.searchInput, // search text
                null, //null
                null, //null
                null, // null
                this.selectedDepartments, // depratment
                this.minimumPrice,
                this.maximumPrice,
                this.seletedOption.value,
                this.onlyAvialbleStock,
                this.startSoldOutData, //'2022-2-2'
                this.endSoldOutData,
                this.startShipData,
                this.endShipData,
                this.brands, // ids
                this.selectedCurrrency?.code  ?  this.selectedCurrrency?.code  :  this.selectedCurrrency,
                this.selectedSort.value,
                this.skipCount,
                this.maxResultCount
            )
            .pipe(
                finalize(() => {
                    this.displayFitlers = false;
                    this.hideMainSpinner();
                })
            )
            .subscribe((result) => {
                this.items = result.items;
                this.pagesNumber = result.totalCount;
            });
    }

    onPageChange(value: any) {
        this.skipCount = value.first;
        this.maxResultCount = value.rows;
        this.getAllProducts();
    }

    timeOut: any;
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
            () =>{
        this.currency = this.selectedCurrrency?.code   ?  this.selectedCurrrency?.code  :  this.selectedCurrrency;
        this.getAllProducts();
    },1500);  

    }
    handleSortingChange(data: any) {
        this.getAllProducts();
    }
    onlyAvialbleStock: boolean;
    swtichStock(value) {
        this.onlyAvialbleStock = value.checked;
        if (!this.isMobile) {
            this.getAllProducts();
        }
    }

    // start filter criteria
    appItemListId: any;
    selectCatalog(value) {
        this.appItemListId = value.id;
        if (!this.isMobile) {
            this.getAllProducts();
        }
    }
    selectedDepartments: any;
    selectDepartment(value) {
        console.log(value);

        if (value == null) {
            this.selectedDepartments = [];
        } else {
            this.selectedDepartments = [
                value.node.data.sycEntityObjectCategory.id,
            ];
        }
        if (!this.isMobile) {
            this.getAllProducts();
        }
    }

    minimumPrice: number;
    maximumPrice: number;
    setPriceFrom(value) {
        this.minimumPrice = value;
        if (!this.isMobile) {
            this.getAllProducts();
        }
    }
    setPriceTo(value) {
        this.maximumPrice = value;
        if (!this.isMobile) {
            this.getAllProducts();
        }
    }

    startShipData: any;
    setStartShipDate(value) {
        this.startShipData = value;
        if (!this.isMobile) {
            this.getAllProducts();
        }
    }

    endShipData: any;
    setEndtShipDate(value) {
        this.endShipData = value;
        if (!this.isMobile) {
            this.getAllProducts();
        }
    }
    startSoldOutData: any;
    setStartSoldOutDate(value) {
        this.startSoldOutData = value;
        if (!this.isMobile) {
            this.getAllProducts();
        }
    }
    endSoldOutData: any;
    setEndSoldOutDate(value) {
        this.endSoldOutData = value;
        if (!this.isMobile) {
            this.getAllProducts();
        }
    }

    brands: [] = [];
    selectBrands(value) {
        this.brands = value;
        if (!this.isMobile) {
            this.getAllProducts();
        }
    }

    resetProducts($event) {
        this.filters.resetFilters();
        (this.seletedOption = { label: "Public And Shared With Me", value: 2 }),
            (this.selectedCurrrency =
                localStorage.getItem("currencyCode")=="undefined"||  JSON.parse(localStorage.getItem("currencyCode")) === null
                    ? this.tenantDefaultCurrency
                    : JSON.parse(localStorage.getItem("currencyCode")));
        this.currency =
        localStorage.getItem("currencyCode")=="undefined"||  JSON.parse(localStorage.getItem("currencyCode")) === null
                ? this.tenantDefaultCurrency.code
                : JSON.parse(localStorage.getItem("currencyCode")).code;
        this.tentantID = this.appSession?.tenant?.id;
        this.selectedSort = { label: "Product Name", value: "name" };
        this.searchInput = "";
        this.paginator.changePageToFirst($event);
        this.showMainSpinner();
        this._AppMarketplaceItemsServiceProxy
            .getAll(
                localStorage.getItem("SellerSSIN"),
                null, // tenant id
                null,
                false, // false
                this.searchInput, // search text
                null, //null
                null, //null
                null, // null
                [], // depratment
                null,
                null,
                this.seletedOption.value,
                false,
                undefined, //'2022-2-2'
                undefined,
                undefined,
                undefined,
                [], // ids
                this.selectedCurrrency?.code  ?  this.selectedCurrrency?.code  :  this.selectedCurrrency,
                this.selectedSort.value,
                this.skipCount,
                this.maxResultCount
            )
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe((result) => {
                this.items = result.items;
                this.pagesNumber = result.totalCount;
            });
    }

    ngOnDestroy() {
        if (localStorage.getItem("SellerSSIN") &&localStorage.getItem("SellerSSIN")!="undefined") {
            // localStorage.removeItem("SellerId");
            localStorage.removeItem("SellerSSIN");
            localStorage.removeItem("BuyerSSIN");
        }
        localStorage.setItem("currencyCode", null);
    }

    // start mobile filters
    cancel() {
        this.displayFitlers = false;
    }

    openFiltersDialog(text: string) {
        this.filterType = text;
        this.displayFitlers = true;
    }

    applyFilters() {
        this.getAllProducts();
        this.currency = this.selectedCurrrency.code;
    }
}
