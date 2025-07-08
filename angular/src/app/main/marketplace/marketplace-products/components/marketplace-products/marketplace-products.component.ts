import {
    Component,
    Injector,
    OnDestroy,
    ViewChild,
    OnInit,
   SimpleChanges, OnChanges, ViewChildren, ElementRef,
   Input
} from "@angular/core";
import {  Router } from "@angular/router";
import { AppItemsComponent } from "@app/main/app-items/app-items-browse/components/appItems.component";
import { AppItemBrowseEvents } from "@app/main/app-items/app-items-browse/models/appItems-browse-events";
import { ActionsMenuEventEmitter } from "@app/main/app-items/app-items-browse/models/ActionsMenuEventEmitter";
import {
    AppEntitiesServiceProxy,
    AppMarketplaceItemsServiceProxy,
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
    implements OnDestroy , OnChanges  {
    @ViewChild("AppItemsBrowseComponent") appItemsBrowseComponent: AppItemsComponent;
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
    @Input() fromMarketAcoount: boolean;
    @Input() fromOverView: boolean = false
    @Input() accountDataForView :any
    isFromSellerRoom:boolean
    ismarketPLace:boolean
    items: any[];
    minimumPrice: number;
    maximumPrice: number;
    timeOut: any;
    onlyAvialbleStock: boolean;
    appItemListId: any;
    selectedDepartments: any;
    acceptedAspectRatio;
    constructor(
        injector: Injector,
        private _router: Router,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _AppMarketplaceItemsServiceProxy: AppMarketplaceItemsServiceProxy,
        private _pricingHelperService: PricingHelpersService,
        public datepipe: DatePipe,
        public breakpointObserver: BreakpointObserver,
    ) {
        super(injector);
        this.isFromSellerRoom = JSON.parse(localStorage.getItem("fromSellerRoom") );
        this.ismarketPLace = JSON.parse(localStorage.getItem("fromMarketPlace") );

  
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


      
    }
  


    ngOnInit() {
        this.setCurrency();
        this.tentantID = this.appSession?.tenant?.id;
        const savedFilters = localStorage.getItem("productFilters");
        
        if (savedFilters) {
            const parsedFilters = JSON.parse(savedFilters);
            this.onlyAvialbleStock = parsedFilters.onlyAvailableStock ?? null;
            this.selectedCurrrency = parsedFilters.selectedCurrency ?? 'USD';
            this.selectedSort = this.sortingData.find(s => s.value === parsedFilters.selectedSort) ?? this.selectedSort;
            
            this.appItemListId = parsedFilters.appItemListId ||   this.appItemListId;
            this.searchInput = parsedFilters.searchText||    this.searchInput;
            this.selectedDepartments = parsedFilters.selectedDepartments ||  this.selectedDepartments;
            this.minimumPrice = parsedFilters.minimumPrice ||  this.minimumPrice;
            this.maximumPrice = parsedFilters.maximumPrice || this.maximumPrice;
            this.startSoldOutData = parsedFilters.startSoldOutData || this.startSoldOutData
            this.endSoldOutData = parsedFilters.endSoldOutData || this.endSoldOutData;
            this.startShipData = parsedFilters.startShipData ? new Date(parsedFilters.startShipData) :   this.startShipData;
            this.endShipData = parsedFilters.endShipData ? new Date(parsedFilters.endShipData) :  this.endShipData;
            this.brands = parsedFilters.brands || this.brands ;
            this.seletedOption = this.sharingOptions.find(option => option.value === parsedFilters.selectedOption) || this.seletedOption;
            this.skipCount = parsedFilters.skipCount ||     this.skipCount;
            this.maxResultCount = parsedFilters.maxResultCount || this.maxResultCount;
        }
    
        this.getAllProducts(); // Fetch products using restored filters
        this.checkMediaQuery();

            this.getAspectatio();
    }
    
    ngAfterViewInit() {
        document.getElementById("_searchInput").focus();

    }
    
    ngOnChanges(changes: SimpleChanges) {
        alert("change")
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

    viewProductHandler(
        $event: ActionsMenuEventEmitter<AppItemBrowseEvents, number>
    ) {
        if ($event.event != AppItemBrowseEvents.View) return;
        this._router.navigate([
            "/app/main/marketplace/products/view",
            $event.data,
        ]);
    }


    getAllProducts() {
        this.showMainSpinner();
    
        const requestParams = {
            contactSSIN: this.contactSSIN,
            sellerSSIN: this.sellerSSIN,
            tenantId: null,
            appItemListId: this.appItemListId || null,
            searchText: this.searchInput || '',
            selectedDepartments: this.selectedDepartments || [],
            minimumPrice: this.minimumPrice || null,
            maximumPrice: this.maximumPrice || null,
            selectedOption: this.seletedOption?.value ?? 2,
            onlyAvailableStock: this.onlyAvialbleStock ?? false,
            startSoldOutData: this.startSoldOutData || null,
            endSoldOutData: this.endSoldOutData || null,
            startShipData: this.startShipData || null,
            endShipData: this.endShipData || null,
            brands: this.brands || [],
            selectedCurrency: this.selectedCurrrency?.code || this.selectedCurrrency || 'USD',
            selectedSort: this.selectedSort?.value || 'name',
            skipCount: this.skipCount,
            maxResultCount: this.maxResultCount
        };
        localStorage.setItem("productFilters", JSON.stringify(requestParams));
        
    
        this._AppMarketplaceItemsServiceProxy
            .getAll(
                this.contactSSIN,
                this.fromMarketAcoount || this.fromOverView ? this.accountDataForView ?.ssin : localStorage.getItem("SellerSSIN"),
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

    // start filter criteria
    selectCatalog(value) {
        this.appItemListId = value.id;
            this.getAllProducts();
    }

    selectDepartment(value) {

        if (value == null) {
            this.selectedDepartments = [];
        } else {
            this.selectedDepartments = [
                value.node.data.sycEntityObjectCategory.id,
            ];
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

    brands: [] = [];
    selectBrands(value) {
        this.brands = value;
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
        this.selectedDepartments =[]
        this.onlyAvialbleStock = null
        localStorage.removeItem("productFilters");
        this.getAllProducts();

    }

    ngOnDestroy() {
        if (sessionStorage.getItem("SellerSSIN") && sessionStorage.getItem("SellerSSIN") != "undefined") {
            sessionStorage.removeItem("SellerSSIN");
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
        this.currency = this.selectedCurrrency?.code ? this.selectedCurrrency?.code : this.selectedCurrrency;
        localStorage.setItem("currencyCode", this.currency);

    }
    clearFiltrs(value) {
      if(value){
        this.resetProducts('')
      }
     
    }
}
