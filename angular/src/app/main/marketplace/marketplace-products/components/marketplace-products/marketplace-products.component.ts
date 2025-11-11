


import {
    Component,
    Injector,
    OnDestroy,
    ViewChild,
   SimpleChanges, OnChanges, ViewChildren, ElementRef
} from "@angular/core";
import {  ActivatedRoute, Router } from "@angular/router";
import { AppItemsComponent } from "@app/main/app-items/app-items-browse/components/appItems.component";
import { AppItemBrowseEvents } from "@app/main/app-items/app-items-browse/models/appItems-browse-events";
import { ActionsMenuEventEmitter } from "@app/main/app-items/app-items-browse/models/ActionsMenuEventEmitter";
import {
    AppEntitiesServiceProxy,
    AppMarketplaceItemsServiceProxy,
    SycEntityObjectCategoriesServiceProxy,
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
    isAuthenticate= this.appSession?.user

    selectedCategories: number[] = []; 

    constructor(
        injector: Injector,
        private _router: Router,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _AppMarketplaceItemsServiceProxy: AppMarketplaceItemsServiceProxy,
        private _pricingHelperService: PricingHelpersService,
        public datepipe: DatePipe,
        public breakpointObserver: BreakpointObserver,
        private route: ActivatedRoute,   
         private _sycEntityObjectCategoriesServiceProxy: SycEntityObjectCategoriesServiceProxy,
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
        this.setCurrency();
        this.tentantID = this.appSession?.tenant?.id;
        


        this.checkMediaQuery();
        if(this.isAuthenticate){
            this.getAllCurrencies();
            this.getAspectatio();
        }
        
    }
    ngOnInit() {
        const savedFilters = localStorage.getItem("productFilters");
        if (savedFilters) {
          const parsedFilters = JSON.parse(savedFilters);
          this.onlyAvialbleStock = parsedFilters.onlyAvailableStock ?? null;
          this.selectedCurrrency = parsedFilters.selectedCurrency ?? 'USD';
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
      
        // 🔗 URL takes priority if present
        this.route.queryParamMap.subscribe(async (params) => {
            const q = params.get('q'); // <-- new

            if (q !== null) {
              this.searchInput = q; // URL wins over local storage
            }
          const brandName = params.get('brand');
      
          if (brandName) {
            // resolve human-readable name -> id
            const id = await this.resolveBrandNameToId(brandName);
            this.brands = id ? [id] : [];   // apply real filter value
          }

          const DepartmentName = params.get('dept');
      
          if (DepartmentName) {
            // resolve human-readable name -> id
            const id = await this.resolveDeptNameToId(DepartmentName);
            this.selectedDepartments = id ? [id] : [];
            this.filters.preselectDeptId = id ?? undefined;  // tell the child to highlight
          }
          // If no brand param, we keep the restored localStorage brands as-is.
          const listName = params.get('proList');
          if (listName) {
            const listId = await this.resolveListNameToId(listName);
            this.appItemListId = listId || null;
          
            // (optional) make the sidebar visually highlight the selected list
            if (this.filters) this.filters.catalogId = listId ?? null;
          }
          const catName = params.get('cat');
          if (catName) {
            const id = await this.resolveCategoryNameToId(catName);
            this.selectedCategories = id ? [id] : [];
            if (this.filters) this.filters.preselectCategoryId = id ?? undefined; // optional if you add it in child
          }
        
          this.getAllProducts(); // 
        });
      }
      
    
    private async resolveBrandNameToId(brandName: string): Promise<number | string | null> {
        // Call your brands endpoint and find the matching brand by name.
        // You can optimize this with a dedicated "getByName" if you have one.
        const res = await this._AppMarketplaceItemsServiceProxy
          .getAllBrandsWithPaging(
            null, null, null, null, null,false, 'BRAND', null, null,
            86, 'name', 0, 200, this.sellerSSIN
          )
          .toPromise();
      
        const items = res?.items ?? [];
        const match = items.find((b: any) =>
          (b.name ?? b.label ?? '').toLowerCase() === brandName.toLowerCase()
        );
      
        return match ? (match.id ?? match.value) : null;
      }

      private async resolveDeptNameToId(deptName: string): Promise<number | null> {
        // 1) Load top-level categories once
        const parents = await this._sycEntityObjectCategoriesServiceProxy
          .getAllWithChildsForProductWithPaging(
            undefined, undefined, undefined, undefined, undefined, undefined, undefined,
            undefined, /* includeParents */ true,
            undefined,
            [],               // selected parents
            "name", 0, 50     // sort, paging (tweak page size if you have many parents)
          )
          .toPromise();
      
        const parentsNodes = (parents?.items ?? []) as any[];
      
        // 2) BFS over the tree, loading children lazily until we find a name match
        const norm = (s: string) => (s || '').trim().toLowerCase();
        const target = norm(deptName);
      
        const queue: any[] = [...parentsNodes];
      
        while (queue.length) {
          const node = queue.shift();
          const cat = node?.data?.sycEntityObjectCategory;
          const label = node?.label;
      
          const nameHere = norm(cat?.name ?? cat?.displayName ?? label);
          if (nameHere === target) return cat?.id ?? null;
      
          // load children if absent
          if (!node.children || node.children.length === 0) {
            const kids = await this._sycEntityObjectCategoriesServiceProxy
              .getAllChildsWithPaging(
                undefined, undefined, undefined, undefined, undefined, undefined, undefined,
                cat?.id, true, undefined, undefined, "name", 0, 50
              )
              .toPromise();
            node.children = kids?.items ?? [];
          }
      
          if (node.children?.length) queue.push(...node.children);
        }
      
        return null;
      }
      private async resolveListNameToId(listName: string): Promise<number | null> {
        const res = await this._AppMarketplaceItemsServiceProxy
          .getSharedItemLists(null, 'name', 0, 200, this.sellerSSIN)
          .toPromise();
      
        const items = res?.items ?? [];
        const norm = (s: string) => (s || '').trim().toLowerCase();
        const match = items.find((x: any) => norm(x.name) === norm(listName));
        return match ? match.id : null;
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
            selectedCategory: this.selectedCategories || [], 
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
                sessionStorage.getItem("SellerSSIN"),
                null,
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
                undefined,
                requestParams.selectedCategory || this.selectedCategories,  //category
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
    selectCatalog(value: any) {
        if (!value || !value.id) {
          this.appItemListId = null;
          this.updateUrlQueryParams({ proList: null });
        } else {
          this.appItemListId = value.id;
          this.updateUrlQueryParams({ proList: value.name || null });
        }
        this.getAllProducts();
      }
      
    private updateUrlQueryParams(partial: { dept?: string | null; proList?: string | null; q?: string | null ; cat?: string | null}) {
        this._router.navigate([], {
          relativeTo: this.route,
          queryParams: {
            dept: partial.dept ?? undefined,
            proList: partial.proList ?? undefined,
            q: partial.q ?? undefined,
            cat: partial.cat ?? undefined, 
          },
          queryParamsHandling: 'merge',
          // replaceUrl: true, // optional
        });
      }
      
      

    selectDepartment(value) {
        if (!value) {
          this.selectedDepartments = [];
          this.updateUrlQueryParams({ dept: null });
        } else {
          const id = value.node.data.sycEntityObjectCategory.id;
          const name = value.node.data.sycEntityObjectCategory.name
                    ?? value.node.data.sycEntityObjectCategory.displayName
                    ?? value.node.label;
      
          this.selectedDepartments = [id];
          this.updateUrlQueryParams({ dept: name });
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
         this.selectedCategories = [];
        this.brands =[]
        this.skipCount= 0;
        this.maxResultCount= 12;
        this.selectedDepartments =[]
        this.onlyAvialbleStock = null
        localStorage.removeItem("productFilters");
        this.getAllProducts();

    }
    selectCategory(value: any) {
      if (!value) {
        this.selectedCategories = [];
        this.updateUrlQueryParams({ cat: null });
      } else {
        const node = value.node?.data?.sycEntityObjectCategory;
        const id = node?.id;
        const name = node?.name ?? node?.displayName ?? value.node?.label;
        this.selectedCategories = id ? [id] : [];
        this.updateUrlQueryParams({ cat: name || null });
      }
      this.getAllProducts();
    }
    private async resolveCategoryNameToId(catName: string): Promise<number | null> {
      // load category roots
      const parents = await this._sycEntityObjectCategoriesServiceProxy
        .getAllWithChildsForProductWithPaging(
          undefined, undefined, undefined, undefined, undefined, undefined, undefined,
          undefined, /* departments? */ false,
          undefined, [], 'name', 0, 50
        ).toPromise();
    
      const norm = (s: string) => (s || '').trim().toLowerCase();
      const target = norm(catName);
      const queue: any[] = [...(parents?.items ?? [])];
    
      while (queue.length) {
        const node = queue.shift();
        const cat = node?.data?.sycEntityObjectCategory;
        const label = node?.label;
        const here = norm(cat?.name ?? cat?.displayName ?? label);
        if (here === target) return cat?.id ?? null;
    
        if (!node.children || node.children.length === 0) {
          const kids = await this._sycEntityObjectCategoriesServiceProxy
            .getAllChildsWithPaging(
              undefined, undefined, undefined, undefined, undefined, undefined, undefined,
              cat?.id, /* departments? */ false,
              undefined, undefined, 'name', 0, 50
            ).toPromise();
          node.children = kids?.items ?? [];
        }
        if (node.children?.length) queue.push(...node.children);
      }
      return null;
    }
        
    ngOnDestroy() {

          // Keep SellerSSIN while navigating inside the seller room / product views
  const inSellerRoom = JSON.parse(localStorage.getItem('fromSellerRoom') || 'false');
  const inMarketplace = JSON.parse(localStorage.getItem('fromMarketPlace') || 'false');

  if (!inSellerRoom || inMarketplace) {
    sessionStorage.removeItem('SellerSSIN');
    localStorage.removeItem('BuyerSSIN');
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
