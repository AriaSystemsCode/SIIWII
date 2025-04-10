import {
  
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    AppEntitiesServiceProxy,
    AppMarketplaceItemsServiceProxy,
    GetAllMarketplaceItemListsOutputDto,
    PagedResultDtoOfGetAllMarketplaceItemListsOutputDto,
    SycEntityObjectCategoriesServiceProxy,
    SycEntityObjectTypesServiceProxy,
    TreeNodeOfGetSycEntityObjectCategoryForViewDto,
} from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs";

@Component({
    selector: "app-product-filters",
    templateUrl: "./product-filters.component.html",
    styleUrls: ["./product-filters.component.scss"],
})
export class ProductFiltersComponent implements OnInit, OnDestroy {
    isExpanded: boolean = true;
    productList: GetAllMarketplaceItemListsOutputDto[];
    selectedList: boolean = false;
    catalogId: number;
    files: TreeNodeOfGetSycEntityObjectCategoryForViewDto[];
    loading: boolean;
    selectedFile: any;
    startShipDate: Date;
    endShipDate: Date;
    startSoldout: string;
    endSoldout: string;
    timeOut: any;
    selctedBradns: any[] = [];
    stockAvailablty: boolean = false;
    min: any;
    max: any;
    @Input() isSellerIdExists: boolean = false;

    // emit all values to parent component
    @Output() handleCatalogSelections: EventEmitter<any> = new EventEmitter();
    @Output() handledeDratmentsTreeSelections: EventEmitter<any> =
        new EventEmitter();
    @Output() handleStartPrice: EventEmitter<any> = new EventEmitter();
    @Output() handleEndPrice: EventEmitter<any> = new EventEmitter();
    @Output() handleStartShipDate: EventEmitter<any> = new EventEmitter();
    @Output() handleEndShipDate: EventEmitter<any> = new EventEmitter();
    @Output() handleSatrtsoldOutDate: EventEmitter<any> = new EventEmitter();
    @Output() handleEndSoldOutDate: EventEmitter<any> = new EventEmitter();
    @Output() handleStockSiwtch: EventEmitter<any> = new EventEmitter();
    @Output() handleBrandsSelection: EventEmitter<any> = new EventEmitter();
    @Output() clearAll: EventEmitter<any> = new EventEmitter();
    accountSSIN:string;
    savedFilters :any
    isSelected: boolean = false
    isFromSellerRoom:boolean
    ismarketPLace:boolean
    constructor(
        private _AppMarketplaceItemsServiceProxy: AppMarketplaceItemsServiceProxy,
        private _SycEntityObjectTypesServiceProxy: SycEntityObjectTypesServiceProxy,
        private _sycEntityObjectCategoriesServiceProxy: SycEntityObjectCategoriesServiceProxy,
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _appMarketplaceItemsServiceProxy:AppMarketplaceItemsServiceProxy,
     
    ) {
        this.isFromSellerRoom = JSON.parse(localStorage.getItem("fromSellerRoom") );
        this.ismarketPLace = JSON.parse(localStorage.getItem("fromMarketPlace") );
        this.savedFilters = localStorage.getItem("productFilters");
            
        if (this.savedFilters) {
            const parsedFilters = JSON.parse(this.savedFilters);
        
            this.selectedFile = parsedFilters.selectedDepartments;
            this.min = parsedFilters.minimumPrice;
            this.max = parsedFilters.maximumPrice;
            this.catalogId = parsedFilters.appItemListId;
            this.stockAvailablty = parsedFilters.onlyAvailableStock;
        
            // Ensure these are Date objects before using them
            this.startSoldout = parsedFilters.startSoldOutData;
            this.endSoldout = parsedFilters.endSoldOutData;
        
            this.startShipDate = parsedFilters.startShipData ? new Date(parsedFilters.startShipData) : null;
            this.endShipDate = parsedFilters.endShipData ? new Date(parsedFilters.endShipData) : null;
        
            this.selctedBradns = parsedFilters.brands;
        
         
        }
        
        
        this.accountSSIN=localStorage.getItem("SellerSSIN");
        this.getAllProductCAtalogs();
        this.getParentDepartments();
        this.getAllBrands();
        console.log(this.files,">> files" )
        console.log(this.selectedFile,">> 555" )
   
        
    }

    // get all brands
    brands: any[] = [];
    getAllBrands() {
        // this._appEntitiesServiceProxy
        //     .getAllEntitiesByTypeCodeWithPaging(
        //         null,
        //         null,
        //         null,
        //         null,
        //         null,
        //         "BRAND",
        //         null,
        //         null,
        //         86,
        //         "name",
        //         0,
        //         10
        //     )
        //     .subscribe((res) => {
        //         console.log(">>", res);
        //         this.brands = res.items;
        //     });

          this._appMarketplaceItemsServiceProxy
            .getAllBrandsWithPaging(
                null,
                null,
                null,
                null,
                null,
                "BRAND",
                null,
                null,
                86,
                "name",
                0,
                10,this.accountSSIN
            )
            .subscribe((res) => {
                console.log(">>", res);
                this.brands = res.items;
            });
    }

    handlebrandsSelction() {
        console.log(">>", this.selctedBradns);
        this.handleBrandsSelection.emit(this.selctedBradns);
    }

    // get all product list ( catalog or collection )
    getAllProductCAtalogs() {
        this._AppMarketplaceItemsServiceProxy
            .getSharedItemLists(null, "name", 0, 200,this.accountSSIN)
            .subscribe(
                (res: PagedResultDtoOfGetAllMarketplaceItemListsOutputDto) => {
                    this.productList = res.items;
                }
            );
    }
    // set selected catalog ui
    selectCatalog(catalog: GetAllMarketplaceItemListsOutputDto) {
        if (catalog.id == this.catalogId) {
            this.catalogId = null;
        }
        this.catalogId = catalog.id;
        this.handleCatalogSelections.emit(catalog);
    }

    // get parent departements
    // getParentDepartments() {
    //     let apiMethod = "getAllWithChildsForProductWithPaging";
    //     const subs = this._sycEntityObjectCategoriesServiceProxy[apiMethod](
    //         undefined,
    //         undefined,
    //         undefined,
    //         undefined,
    //         undefined,
    //         undefined,
    //         undefined,
    //         undefined,
    //         true,
    //         undefined,
    //         [],
    //         "name",
    //         0,
    //         10
    //     ).subscribe(
    //         (res: {
    //             items: TreeNodeOfGetSycEntityObjectCategoryForViewDto[];
    //             totalCount: number;
    //         }) => {
    //             this.files = res.items;
    //             if(this.savedFilters){
    //                 this.selectedFile = this.findNodeById(this.files, this.selectedFile[0]);
    //             }
                
    //         }
    //     );
    // }
    hasSelectedChild(node: any, selectedId: number): boolean {
        if (!node.children) return false;
        return node.children.some(child => {
          if (child.data.sycEntityObjectCategory.id === selectedId) {
            return true;
          }
          // Recursively check deeper levels
          return this.hasSelectedChild(child, selectedId);
        });
      }
      
      collapseAll(selectedId?: number) {
        this.files.forEach(node => {
          node.expanded = false;
      
          // If selectedId is provided, expand node which has selected child
          if (selectedId && this.hasSelectedChild(node, selectedId)) {
            node.expanded = true;
          }
      
          if (node.children) {
            this.expandRecursiveWithSelection(node, selectedId);
          }
        });
      }
      expandRecursiveWithSelection(node: any, selectedId: number) {
        node.expanded = this.hasSelectedChild(node, selectedId);
      
        if (node.children) {
          node.children.forEach(childNode => {
            this.expandRecursiveWithSelection(childNode, selectedId);
          });
        }
      }
            

    private expandRecursive(
        node: TreeNodeOfGetSycEntityObjectCategoryForViewDto,
        isExpand: boolean
    ) {
        node.expanded = isExpand;
        if (node.children) {
            node.children.forEach((childNode) => {
                this.expandRecursive(childNode, isExpand);
            });
        }
    }

    expandToNodeById(nodes: any[], targetId: number): void {
        for (let node of nodes) {
          if (node.data.sycEntityObjectCategory.id === targetId) {
            node.expanded = true;
            return;
          }
      
          if (node.children) {
            const found = this.findNodeById(node.children, targetId);
            if (found) {
              node.expanded = true;
              this.expandToNodeById(node.children, targetId);
              return;
            }
          } else {
            // If children are not yet loaded, load them and continue expanding
            this._sycEntityObjectCategoriesServiceProxy.getAllChildsWithPaging(
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              undefined,
              node.data.sycEntityObjectCategory.id,
              true,
              undefined,
              undefined,
              "name",
              0,
              10
            ).subscribe(res => {
              node.children = res.items;
              node.expanded = true;
      
              const found = this.findNodeById(node.children, targetId);
              if (found) {
                this.selectedFile = found;
              } else {
                this.expandToNodeById(node.children, targetId);
              }
            });
          }
        }
      }
      

    // get childs related to parents
    nodeExpand(value: any) {
        console.log(">> ", value.node.data.sycEntityObjectCategory.id);
        if (value.node) {
            this.loading = true;
            this._sycEntityObjectCategoriesServiceProxy
                .getAllChildsWithPaging(
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    value.node.data.sycEntityObjectCategory.id,
                    true,
                    undefined,
                    undefined,
                    "name",
                    0,
                    10
                )
                .pipe(finalize(() => (this.loading = false)))
                .subscribe((res: any) => {
                    console.log(">>", res);
                    value.node.children = res.items;
                });
        }
    }
    findNodeById(nodes: any[], id: number): any {
        for (let node of nodes) {
          if (node.data.sycEntityObjectCategory.id === id) {
            return node; // Return the node if the ID matches
          }
          if (node.children) {
            const found = this.findNodeById(node.children, id);
            if (found) return found;
          }
        }
        return null;
      }
    nodeSelect(value: any) {
        console.log(">>", value);
        this.handledeDratmentsTreeSelections.emit(value);
    }

    nodeUnselect(value: any) {
        console.log(value);

        this.handledeDratmentsTreeSelections.emit(null);
    }

    handleStartPriceTyping(event) {
        clearTimeout(this.timeOut);
        this.timeOut = setTimeout(() => {
            console.log(event.target.value);
            this.handleStartPrice.emit(event.target.value);
        }, 1500);
    }

    handleEndPriceTyping(event) {
        clearTimeout(this.timeOut);
        this.timeOut = setTimeout(() => {
            console.log(event.target.value);
            this.handleEndPrice.emit(event.target.value);
        }, 1500);
    }

    onStartShipDateChange() {
        console.log(this.startShipDate);
        this.handleStartShipDate.emit(this.startShipDate);
    }
    onEndShipDateChange() {
        console.log(this.endShipDate);
        this.handleEndShipDate.emit(this.endShipDate);
    }

    onStartSoldOutDateChange() {
        this.handleSatrtsoldOutDate.emit(this.startSoldout);
    }
    onEndSoldOutDateChange() {
        this.handleEndSoldOutDate.emit(this.endSoldout);
    }
    handleStockChange(value: any) {
        this.handleStockSiwtch.emit(value);
    }

    resetFilters() {
        console.log(">> filters" )
        this.stockAvailablty = false;
        this.catalogId = null;
        this.collapseAll();
        this.selectedFile = []
        this.selctedBradns = [];
        this.min = "";
        this.max = "";
        this.startShipDate = undefined
        this.endShipDate = undefined
        this.endSoldout = undefined
        this.startSoldout = undefined
        
    }
    getParentDepartments(): Promise<void> {
        return new Promise((resolve) => {
          let apiMethod = "getAllWithChildsForProductWithPaging";
          this._sycEntityObjectCategoriesServiceProxy[apiMethod](
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
            [],
            "name",
            0,
            10
          ).subscribe((res: any) => {
            this.files = res.items;
            resolve(); // ✅ Important!
          });
        });
      }
      
    

    ngOnInit(): void {
        this.savedFilters = localStorage.getItem("productFilters");
      
        if (this.savedFilters) {
          const parsedFilters = JSON.parse(this.savedFilters);
          const selectedDepartmentId = parsedFilters.selectedDepartments?.[0];
      
          this.selectedFile = parsedFilters.selectedDepartments;
          this.min = parsedFilters.minimumPrice;
          this.max = parsedFilters.maximumPrice;
          this.catalogId = parsedFilters.appItemListId;
          this.stockAvailablty = parsedFilters.onlyAvailableStock;
          this.startSoldout = parsedFilters.startSoldOutData;
          this.endSoldout = parsedFilters.endSoldOutData;
          this.startShipDate = parsedFilters.startShipData ? new Date(parsedFilters.startShipData) : null;
          this.endShipDate = parsedFilters.endShipData ? new Date(parsedFilters.endShipData) : null;
          this.selctedBradns = parsedFilters.brands;
          this.getParentDepartments().then(() => {
            if (selectedDepartmentId) {
              this.expandAndSelectNode(selectedDepartmentId);
            }
          });
          
  
        } else {
          this.getParentDepartments();
        }
      }
      
    clearAllFiltrs(){
        this.resetFilters()
    this.handleStartPrice.emit('');
    this.handleEndPrice.emit('');
    this.handleCatalogSelections.emit('');
    this.handledeDratmentsTreeSelections.emit(null)
    this.handleBrandsSelection.emit([]);
    this.handleEndShipDate.emit(undefined);
    this.handleStartShipDate.emit(undefined);
    this.handleEndSoldOutDate.emit(undefined);
    this.handleSatrtsoldOutDate.emit(undefined);
    this.clearAll.emit(true);
    
}

  expandAndSelectNode(targetId: number, nodes: any[] = this.files, parentNode?: any): void {
    if (!nodes) return;
  
    for (let node of nodes) {
      if (node.data.sycEntityObjectCategory.id === targetId) {
        if (parentNode) {
          parentNode.expanded = true; // ✅ expand parent
        }
        node.expanded = true;
        this.selectedFile = node;
        return;
      }
  
      if (node.children && node.children.length > 0) {
        this.expandAndSelectNode(targetId, node.children, node);
      } else {
        this._sycEntityObjectCategoriesServiceProxy.getAllChildsWithPaging(
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          node.data.sycEntityObjectCategory.id,
          true,
          undefined,
          undefined,
          "name",
          0,
          10
        ).subscribe(res => {
          node.children = res.items;
          node.expanded = true;
          this.expandAndSelectNode(targetId, node.children, node);
        });
      }
    }
  }
  
  
    ngOnDestroy(): void {
        clearTimeout(this.timeOut);
    }
}
