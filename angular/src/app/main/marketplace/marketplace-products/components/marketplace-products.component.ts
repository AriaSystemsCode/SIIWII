import {
    AfterViewInit,
    Component,
    Injector,
    OnDestroy,
    ViewChild,
    OnInit,
   SimpleChanges, OnChanges, ViewChildren, ElementRef
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
import { ProdcutCardComponent } from "./prodcut-card/prodcut-card.component";
@Component({
    selector: "app-marketplace-products",
    templateUrl: "./marketplace-products.component.html",
    styleUrls: ["./marketplace-products.component.scss"],
    animations: [appModuleAnimation()],
    providers: [AppMarketplaceItemsServiceProxy],
})
export class MarketplaceProductsComponent
    extends AppComponentBase
    implements OnDestroy , OnChanges  {
    @ViewChild("AppItemsBrowseComponent")
    appItemsBrowseComponent: AppItemsComponent;
    @ViewChildren(ProdcutCardComponent) ProdcutCardComponent: ProdcutCardComponent;
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
    maxResultCount: number = 12;
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
    contactSSIN:any;
    isFromSellerRoom:boolean
    ismarketPLace:boolean
    constructor(
        injector: Injector,
        private _router: Router,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _AppMarketplaceItemsServiceProxy: AppMarketplaceItemsServiceProxy,
        private _pricingHelperService: PricingHelpersService,
        public datepipe: DatePipe,
        public breakpointObserver: BreakpointObserver,
        private eleRef: ElementRef
    ) {
        super(injector);
        this.isFromSellerRoom = JSON.parse(localStorage.getItem("fromSellerRoom") );
        this.ismarketPLace = JSON.parse(localStorage.getItem("fromMarketPlace") );

  
        if (localStorage.getItem("contactSSIN") && localStorage.getItem("contactSSIN") != "undefined") {
               this.contactSSIN = JSON.parse(localStorage.getItem("contactSSIN"));
        }

        if (localStorage.getItem("SellerSSIN") && localStorage.getItem("SellerSSIN") != "undefined") {
            this.sellerSSIN = JSON.parse(localStorage.getItem("SellerSSIN"));
        }
        if (localStorage.getItem("BuyerSSIN") && localStorage.getItem("BuyerSSIN") != "undefined") {
            this.buyerSSIN = JSON.parse(localStorage.getItem("BuyerSSIN"));
        }
   
        // this.getAllProducts()
        this.isSellerIdExists = localStorage.getItem("SellerSSIN")
            ? true
            : false;
        if (localStorage.getItem("SellerSSIN") && localStorage.getItem("SellerSSIN") != "undefined") {
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
            { label: "Product code", value: "manufacturercode" },
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
        // this.selectedCurrrency =
        // localStorage.getItem("currencyCode")=="undefined"  || JSON.parse(localStorage.getItem("currencyCode")) === null
        //         ? this.tenantDefaultCurrency
        //         : JSON.parse(localStorage.getItem("currencyCode"));
        // this.currency =
        // localStorage.getItem("currencyCode")=="undefined"  ||   JSON.parse(localStorage.getItem("currencyCode")) === null
        //         ? this.tenantDefaultCurrency.code
        //         : JSON.parse(localStorage.getItem("currencyCode")).code;

        this.setCurrency();
        this.tentantID = this.appSession?.tenant?.id;
        // init get products on screen initalization
        // this.showMainSpinner();
        // this._AppMarketplaceItemsServiceProxy
        //     .getAll(
        //         this.contactSSIN,
        //         localStorage.getItem("SellerSSIN"),
        //         null, // tenant id
        //         null,
        //         false, // false
        //         this.searchInput, // search text
        //         null, //null
        //         null, //null
        //         null, // null
        //         [], // depratment
        //         null,
        //         null,
        //         this.seletedOption.value,
        //         false,
        //         undefined, //'2022-2-2'
        //         undefined,
        //         undefined,
        //         undefined,
        //         [], // ids
        //         this.selectedCurrrency?.code ? this.selectedCurrrency?.code : this.selectedCurrrency,
        //         this.selectedSort.value,
        //         this.skipCount,
        //         this.maxResultCount
        //     )
        //     .pipe(finalize(() => this.hideMainSpinner()))
        //     .subscribe((result) => {
        //         this.items = result.items;
        //         this.pagesNumber = result.totalCount;
        //         this.setCurrency();
        //     });
        // this.getCurrencyCurrent();

        this.checkMediaQuery();
    }
    ngOnInit() {
        const savedFilters = localStorage.getItem("productFilters");
        
        if (savedFilters) {
            const parsedFilters = JSON.parse(savedFilters);
    
          
            this.appItemListId = parsedFilters.appItemListId ||   this.appItemListId;
            this.searchInput = parsedFilters.searchText||    this.searchInput;
            this.selectedDepartments = parsedFilters.selectedDepartments ||  this.selectedDepartments;
            this.minimumPrice = parsedFilters.minimumPrice ||  this.minimumPrice;
            this.maximumPrice = parsedFilters.maximumPrice || this.maximumPrice;
            // this.seletedOption = { value: parsedFilters.selectedOption } 
            this.onlyAvialbleStock = parsedFilters.onlyAvailableStock || false;
            this.startSoldOutData = parsedFilters.startSoldOutData || this.startSoldOutData
            this.endSoldOutData = parsedFilters.endSoldOutData || this.endSoldOutData;
            this.startShipData = parsedFilters.startShipData ? new Date(parsedFilters.startShipData) :   this.startShipData;
            this.endShipData = parsedFilters.endShipData ? new Date(parsedFilters.endShipData) :  this.endShipData;
            this.brands = parsedFilters.brands || this.brands ;
            this.selectedCurrrency = parsedFilters.selectedCurrency ||  this.selectedCurrrency ;
            this.selectedSort = parsedFilters.selectedSort || this.selectedSort;
            this.seletedOption = this.sharingOptions.find(option => option.value === parsedFilters.selectedOption) || this.seletedOption;
            this.skipCount = parsedFilters.skipCount ||     this.skipCount;
            this.maxResultCount = parsedFilters.maxResultCount || this.maxResultCount;
        }
    
        this.getAllProducts(); // Fetch products using restored filters
    }
    
    ngAfterViewInit() {
        document.getElementById("_searchInput").focus();

    }
    
    ngOnChanges(changes: SimpleChanges) {
        debugger
        alert("change")
        document.getElementById("_searchInput").focus();
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
    
        const requestParams = {
            contactSSIN: this.contactSSIN,
            sellerSSIN: localStorage.getItem("SellerSSIN"),
            tenantId: null,
            appItemListId: this.appItemListId,
            searchText: this.searchInput,
            selectedDepartments: this.selectedDepartments,
            minimumPrice: this.minimumPrice,
            maximumPrice: this.maximumPrice,
            selectedOption: this.seletedOption.value, // Add this line
            onlyAvailableStock: this.onlyAvialbleStock,
            startSoldOutData: this.startSoldOutData,
            endSoldOutData: this.endSoldOutData,
            startShipData: this.startShipData,
            endShipData: this.endShipData,
            brands: this.brands,
            selectedCurrency: this.selectedCurrrency?.code || this.selectedCurrrency,
            selectedSort: this.selectedSort.value,
            skipCount: this.skipCount,
            maxResultCount: this.maxResultCount
        };
        // Save to localStorage
        localStorage.setItem("productFilters", JSON.stringify(requestParams));
    
        this._AppMarketplaceItemsServiceProxy
            .getAll(
                this.contactSSIN,
                localStorage.getItem("SellerSSIN"),
                null, // tenant id
                requestParams.appItemListId ||  this.appItemListId,
                false, // false
                requestParams.searchText || this.searchInput,
                null, //null
                null, //null
                null, // null
                requestParams.selectedDepartments ||     this.selectedDepartments,
                requestParams.minimumPrice||     this.minimumPrice,
                requestParams.maximumPrice || this.maximumPrice,
               this.seletedOption.value,
                requestParams.onlyAvailableStock ||    this.onlyAvialbleStock,
                requestParams.startSoldOutData || this.startSoldOutData,
                requestParams.endSoldOutData ||  this.endSoldOutData,
                requestParams.startShipData || this.startShipData,
                requestParams.endShipData ||  this.endShipData,
                requestParams.brands ||  this.brands, // ids
                requestParams.selectedCurrency ||  this.selectedCurrrency?.code ? this.selectedCurrrency?.code : this.selectedCurrrency,
                requestParams.selectedSort || this.selectedSort.value,
                requestParams.skipCount || this.skipCount,
                requestParams.maxResultCount ||  this.maxResultCount
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
                if (result.items.length == 1) {
                    setTimeout(function() {
                        this.ProdcutCardComponent.first.viewProduct(this.ProdcutCardComponent.first.product.id)
                    }.bind(this), 500);
                    }
                });
                
       
    }
    

    setCurrency() {
        this.selectedCurrrency =
            localStorage.getItem("currencyCode") == "undefined" || JSON.parse(localStorage.getItem("currencyCode")) === null
                ? this.tenantDefaultCurrency
                : JSON.parse(localStorage.getItem("currencyCode"));
        this.currency = this.selectedCurrrency?.code ? this.selectedCurrrency?.code : this.selectedCurrrency;

        if (!this.selectedCurrrency?.code) {
            var indx = this.currencies?.findIndex(x => x.code == this.selectedCurrrency);
            if (indx >= 0)
                this.selectedCurrrency = this.currencies[indx];
        }
    }

    onPageChange(value: any) {
        this.skipCount = value.first;
        this.maxResultCount = value.rows;
        this.getAllProducts();
        document.getElementById("_searchInput").focus();

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
            () => {
                this.currency = this.selectedCurrrency?.code ? this.selectedCurrrency?.code : this.selectedCurrrency;
                localStorage.setItem("currencyCode", this.currency);
                this.getAllProducts();
            }, 1500);

    }
    handleSortingChange(data: any) {
        this.getAllProducts();
    }
    onlyAvialbleStock: boolean;
    swtichStock(value) {
        this.onlyAvialbleStock = value.checked;
        // if (!this.isMobile) {
            this.getAllProducts();
        // }
    }

    // start filter criteria
    appItemListId: any;
    selectCatalog(value) {
        this.appItemListId = value.id;
        // if (!this.isMobile) {
            this.getAllProducts();
        // }
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
        // if (!this.isMobile) {
            this.getAllProducts();
        // }
    }

    minimumPrice: number;
    maximumPrice: number;
    setPriceFrom(value) {
        this.minimumPrice = value;
        // if (!this.isMobile) {
            this.getAllProducts();
        // }
    }
    setPriceTo(value) {
        this.maximumPrice = value;
        // if (!this.isMobile) {
            this.getAllProducts();
        // }
    }

    startShipData: any;
    setStartShipDate(value) {
        this.startShipData = value;
        // if (!this.isMobile) {
            this.getAllProducts();
        // }
    }

    endShipData: any;
    setEndtShipDate(value) {
        this.endShipData = value;
        // if (!this.isMobile) {
            this.getAllProducts();
        // }
    }
    startSoldOutData: any;
    setStartSoldOutDate(value) {
        this.startSoldOutData = value;
        // if (!this.isMobile) {
            this.getAllProducts();
        // }
    }
    endSoldOutData: any;
    setEndSoldOutDate(value) {
        this.endSoldOutData = value;
        // if (!this.isMobile) {
            this.getAllProducts();
        // }
    }

    brands: [] = [];
    selectBrands(value) {
        this.brands = value;
        // if (!this.isMobile) {
            this.getAllProducts();
        // }
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
                ? this.tenantDefaultCurrency.code
                : JSON.parse(localStorage.getItem("currencyCode")).code;
        this.tentantID = this.appSession?.tenant?.id;
        this.selectedSort = { label: "Product Name", value: "name" };
        this.searchInput = "";
        this.paginator.changePageToFirst($event);
         this.appItemListId =''

        this.brands =[]
        this.skipCount= 0;
        this.maxResultCount= 12;

        localStorage.removeItem("productFilters");
        this.getAllProducts();
        // this.showMainSpinner();
        // this._AppMarketplaceItemsServiceProxy
        //     .getAll(
        //         this.contactSSIN,
        //         localStorage.getItem("SellerSSIN"),
        //         null, // tenant id
        //         null,
        //         false, // false
        //         this.searchInput, // search text
        //         null, //null
        //         null, //null
        //         null, // null
        //         [], // depratment
        //         null,
        //         null,
        //         this.seletedOption.value,
        //         false,
        //         undefined, //'2022-2-2'
        //         undefined,
        //         undefined,
        //         undefined,
        //         [], // ids
        //         this.selectedCurrrency?.code ? this.selectedCurrrency?.code : this.selectedCurrrency,
        //         this.selectedSort.value,
        //         this.skipCount,
        //         this.maxResultCount
        //     )
        //     .pipe(finalize(() => this.hideMainSpinner()))
        //     .subscribe((result) => {
        //         this.items = result.items;
        //         this.pagesNumber = result.totalCount;
        //         this.setCurrency();
        //     });
           
    }

    ngOnDestroy() {
        if (localStorage.getItem("SellerSSIN") && localStorage.getItem("SellerSSIN") != "undefined") {
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
        //  this.currency = this.selectedCurrrency.code;
        this.currency = this.selectedCurrrency?.code ? this.selectedCurrrency?.code : this.selectedCurrrency;
        localStorage.setItem("currencyCode", this.currency);

    }
    clearFiltrs(value) {
      if(value){
        this.resetProducts('')
      }
     
    }
}
