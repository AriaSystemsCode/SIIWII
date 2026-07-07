import {

  Component,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
  AppEntitiesServiceProxy,
  AppMarketplaceItemsServiceProxy,
  GetAllMarketplaceItemListsOutputDto,
  PagedResultDtoOfGetAllMarketplaceItemListsOutputDto,
  SycEntityObjectCategoriesServiceProxy,
  TreeNodeOfGetSycEntityObjectCategoryForViewDto,
} from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs";

@Component({
  selector: "app-product-filters",
  templateUrl: "./product-filters.component.html",
  styleUrls: ["./product-filters.component.scss"],
})
export class ProductFiltersComponent extends AppComponentBase implements OnInit, OnDestroy {
  isExpanded: boolean = true;
  productList: GetAllMarketplaceItemListsOutputDto[];
  selectedList: boolean = false;
  catalogId: number;
  files: TreeNodeOfGetSycEntityObjectCategoryForViewDto[];
  loading: boolean;
  selectedFile: any;
  selectedCatFile: any;
  startShipDate: Date;
  endShipDate: Date;
  startSoldout: string;
  endSoldout: string;
  timeOut: any;
  selctedBradns: any[] = [];
  stockAvailablty: boolean = false;
  min: any;
  max: any;
  brands: any[] = [];
  @Input() isSellerIdExists: boolean = false;
  @Input() selectedBrands: (number | string)[] = []; 
  @Input() selectedDepartmentId?: number;

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
  @Output() handleCategoriesTreeSelections: EventEmitter<any> = new EventEmitter();
  accountSSIN: string;
  savedFilters: any
  isSelected: boolean = false
  isFromSellerRoom: boolean
  ismarketPLace: boolean
  isAuthenticated = this.appSession?.user
  @Input() preselectDeptId?: number;
  categories:any
  @Input() preselectCategoryId?: number;
  sellerSSin:string
  constructor(
    private _AppMarketplaceItemsServiceProxy: AppMarketplaceItemsServiceProxy,
    private _sycEntityObjectCategoriesServiceProxy: SycEntityObjectCategoriesServiceProxy,
    private _appMarketplaceItemsServiceProxy: AppMarketplaceItemsServiceProxy,
            private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
    injector: Injector

  ) {
    super(injector);
    this.isFromSellerRoom = JSON.parse(localStorage.getItem("fromSellerRoom"));
    this.ismarketPLace = JSON.parse(localStorage.getItem("fromMarketPlace"));
    this.savedFilters = localStorage.getItem("productFilters");

    if (this.savedFilters) {
      const parsedFilters = JSON.parse(this.savedFilters);

      this.selectedFile = parsedFilters.selectedDepartments;
  this.selectedCatFile = parsedFilters.selectedCategory

      this.min = parsedFilters.minimumPrice;
      this.max = parsedFilters.maximumPrice;
      this.catalogId = parsedFilters.appItemListId;
      this.stockAvailablty = parsedFilters.onlyAvailableStock;

      // Ensure these are Date objects before using them
      this.startSoldout = parsedFilters.startSoldOutData;
      this.endSoldout = parsedFilters.endSoldOutData;

      this.startShipDate = parsedFilters.startShipData ? new Date(parsedFilters.startShipData) : null;
      this.endShipDate = parsedFilters.endShipData ? new Date(parsedFilters.endShipData) : null;



    }

   this.accountSSIN = 
   (sessionStorage.getItem("SellerSSIN") && sessionStorage.getItem("SellerSSIN") != "undefined") ?
    JSON.parse(sessionStorage.getItem("SellerSSIN")) : localStorage.getItem("SellerSSIN") ;

    
    this.getAllProductCAtalogs();
    this.getParentDepartments();
    this.getAllBrands();

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedBrands']) {
      const curr = changes['selectedBrands'].currentValue;
      this.selctedBradns = Array.isArray(curr) ? [...curr] : [];
    }
  
    if (changes['selectedDepartmentId'] && this.selectedDepartmentId) {
      if (this.files?.length) {
        this.expandAndSelectFullPath(this.selectedDepartmentId);
      }
    }
  
    if (changes['preselectCategoryId'] && this.preselectCategoryId) {
      if (this.categories?.length) {
        this.expandAndSelectFullPathCat(this.preselectCategoryId);
      }
    }
  }
  
  
  getAllBrands() {
    this._appMarketplaceItemsServiceProxy
      .getAllBrandsWithPaging(
        null, null, null, null, null,
        false, 'BRAND', null, null,
        86, 'name', 0, 200, this.sellerSSin ? this.sellerSSin: this.accountSSIN
      )
      .subscribe(res => {
        this.brands = (res.items || []).map((b: any) => ({
          label: b.name ?? b.label ?? b.displayName ?? '',
          value: b.id   ?? b.value
        }));
      });
  }
  
  

  handlebrandsSelction() {
    this.handleBrandsSelection.emit(this.selctedBradns);
  }

  // get all product list ( catalog or collection )
  getAllProductCAtalogs() {
    this._AppMarketplaceItemsServiceProxy
      .getSharedItemLists(null, "name", 0, 200, this.accountSSIN)
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
          undefined,
          "name",
          0,
          10
        ).subscribe(res => {
                                  // E-SII-20250507.0050 
          node.children = this.filterEmptyLeafCategories(res.items);
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
          undefined,
          "name",
          0,
          10
        )
        .pipe(finalize(() => (this.loading = false)))
        .subscribe((res: any) => {
              // E-SII-20250507.0050 
          value.node.children = this.filterEmptyLeafCategories(res.items);
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
    this.handledeDratmentsTreeSelections.emit(value);
  }

  nodeUnselect(value: any) {

    this.handledeDratmentsTreeSelections.emit(null);
  }

  handleStartPriceTyping(event) {
    clearTimeout(this.timeOut);
    this.timeOut = setTimeout(() => {
      this.handleStartPrice.emit(event.target.value);
    }, 1500);
  }

  handleEndPriceTyping(event) {
    clearTimeout(this.timeOut);
    this.timeOut = setTimeout(() => {
      this.handleEndPrice.emit(event.target.value);
    }, 1500);
  }

  onStartShipDateChange() {
    this.handleStartShipDate.emit(this.startShipDate);
  }
  onEndShipDateChange() {
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
    this.stockAvailablty = false;
    this.catalogId = null;
    this.collapseAll();
    this.selectedFile = []
    this.selectedCatFile = []
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
        undefined,
        undefined,
        0,
        10
      ).subscribe((res: any) => {
            // E-SII-20250507.0050 
        this.files = this.filterEmptyLeafCategories(res.items);
        resolve(); 
      });
    });
  }


  getParentCategories(): Promise<void> {
    return new Promise((resolve) => {
      
      const apiMethod = 'getAllWithChildsForProductWithPaging';
      this._sycEntityObjectCategoriesServiceProxy[apiMethod](
        undefined, undefined, undefined, undefined, undefined, undefined, undefined,
        undefined,
        false,
        undefined,
        [],
         undefined,
        undefined,
        0,
        10
      ).subscribe((res: any) => {
            // E-SII-20250507.0050 
        this.categories = this.filterEmptyLeafCategories(res.items);
  
        // 🔹 If we already know which category to preselect, expand to it
        if (this.preselectCategoryId) {
          this.expandAndSelectFullPathCat(this.preselectCategoryId);
        }
  
        resolve();
      });
    });
  }
  
      // E-SII-20250507.0050 
  filterEmptyLeafCategories(nodes: any[]): any[] {
    if (!nodes) return [];
    return nodes.filter(node => {
      if (!node?.leaf) {
        return true;
      }

      if (node?.resultCount === undefined || node?.resultCount === null) {
        return true;
      }

      return node?.resultCount !== 0;
    });
  }

  nodeCatExpand(evt: any) {
    this.loading = true;
    this._sycEntityObjectCategoriesServiceProxy
      .getAllChildsWithPaging(
        undefined, undefined, undefined, undefined, undefined, undefined, undefined,
        evt.node.data.sycEntityObjectCategory.id,
        false,   
        undefined, undefined, undefined,'name', 0, 10
      )
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res: any) => (evt.node.children = this.filterEmptyLeafCategories(res.items)));     // E-SII-20250507.0050 
  }
  
  nodeCatSelect(evt: any) {
    this.handleCategoriesTreeSelections.emit(evt);
  }
  
  nodeCatUnselect(_: any) {
    this.handleCategoriesTreeSelections.emit(null);
  }
  async expandAndSelectNodeLazyCat(
    targetId: number,
    nodes: any[] = this.categories,
    parentNode?: any
  ): Promise<boolean> {
    for (const node of nodes ?? []) {
      const currentId = node?.data?.sycEntityObjectCategory?.id;
  
      if (currentId === targetId) {
        if (parentNode) parentNode.expanded = true;
        node.expanded = true;
        this.selectedCatFile = node;
        return true;
      }
  
      if (!node.children || node.children.length === 0) {
        const res = await this._sycEntityObjectCategoriesServiceProxy
          .getAllChildsWithPaging(
            undefined, undefined, undefined, undefined, undefined, undefined, undefined,
            currentId,
            /* forDepartments? */ false,
            undefined, undefined, undefined,'name', 0, 10
          )
          .toPromise();
              // E-SII-20250507.0050 
        node.children = this.filterEmptyLeafCategories(res.items); 
      }
  
      const found = await this.expandAndSelectNodeLazyCat(targetId, node.children, node);
      if (found) {
        node.expanded = true;
        if (parentNode) parentNode.expanded = true;
        return true;
      }
    }
    return false;
  }
  
  async expandAndSelectFullPathCat(targetId: number) {
    // build path from node to root
    const pathIds: number[] = [];
    let currentId = targetId;
    while (currentId) {
      pathIds.unshift(currentId);
      const res = await this._sycEntityObjectCategoriesServiceProxy
        .getSycEntityObjectCategoryForEdit(currentId)
        .toPromise();
      currentId = res?.sycEntityObjectCategory?.parentId;
    }
  
    // walk down the path, expanding as we go
    let currentNodes = this.categories;
    for (const id of pathIds) {
      const ok = await this.expandAndSelectNodeLazyCat(id, currentNodes);
      if (!ok) break;
      const n = this.findNodeById(this.categories, id);
      currentNodes = n?.children ?? [];
    }
  
    // final select
    const finalNode = this.findNodeById(this.categories, targetId);
    if (finalNode) {
      finalNode.expanded = true;
      this.selectedCatFile = finalNode;
    }
  }
  
  ngOnInit(): void {
    this.getSettingData()
    this.savedFilters = localStorage.getItem('productFilters');
  
    const init = async () => {
      if (this.savedFilters) {
        const parsed = JSON.parse(this.savedFilters);
        const selectedDeptId = parsed.selectedDepartments?.[0];
        const selectedCatId  = parsed.selectedCategory?.[0];
  
        // mirror saved values into component state
        this.selectedFile = parsed.selectedDepartments;
        this.selectedCatFile = parsed.selectedCategory;
        this.min = parsed.minimumPrice;
        this.max = parsed.maximumPrice;
        this.catalogId = parsed.appItemListId;
        this.stockAvailablty = parsed.onlyAvailableStock;
        this.startSoldout = parsed.startSoldOutData;
        this.endSoldout = parsed.endSoldOutData;
        this.startShipDate = parsed.startShipData ? new Date(parsed.startShipData) : null;
        this.endShipDate   = parsed.endShipData   ? new Date(parsed.endShipData)   : null;
        // this.selctedBradns = parsed.brands;
  
        await Promise.all([this.getParentDepartments(), this.getParentCategories()]);
  
        if (selectedDeptId) await this.expandAndSelectFullPath(selectedDeptId);
        if (selectedCatId)  await this.expandAndSelectFullPathCat(selectedCatId);
      } else {
        await Promise.all([this.getParentDepartments(), this.getParentCategories()]);
      }
    };
  
    init();
  }
  
  expandAndSelectNode(targetId: number, nodes: any[] = this.files, parentNode?: any): void {
    if (!nodes) return;

    for (let node of nodes) {
      if (node.data.sycEntityObjectCategory.id === targetId) {
        if (parentNode) {
          parentNode.expanded = true; 
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
          undefined,
          "name",
          0,
          10
        ).subscribe(res => {
              // E-SII-20250507.0050 
          node.children = this.filterEmptyLeafCategories(res.items);
          node.expanded = true;
          this.expandAndSelectNode(targetId, node.children, node);
        });
      }
    }
  }

  clearAllFiltrs() {
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
    this.handleCategoriesTreeSelections.emit(null);
    this.clearAll.emit(true);

  }

  async expandAndSelectNodeLazy(targetId: number, nodes: any[] = this.files, parentNode?: any): Promise<boolean> {
    for (const node of nodes) {
      const currentId = node?.data?.sycEntityObjectCategory?.id;
      
      // Check if current node matches
      if (currentId === targetId) {
        if (parentNode) parentNode.expanded = true;
        node.expanded = true;
        this.selectedFile = node;
        return true;
      }
  
      // Load children if not loaded
      if (!node.children || node.children.length === 0) {
        const res = await this._sycEntityObjectCategoriesServiceProxy.getAllChildsWithPaging(
          undefined, undefined, undefined, undefined, undefined, undefined, undefined,
          currentId, true, undefined, undefined, undefined,"name", 0, 10
        ).toPromise();
            // E-SII-20250507.0050 
        node.children = this.filterEmptyLeafCategories(res.items);
      }
  
      const foundInChildren = await this.expandAndSelectNodeLazy(targetId, node.children, node);
      if (foundInChildren) {
        node.expanded = true;
        if (parentNode) parentNode.expanded = true;
        return true;
      }
    }
    return false;
  }
  

  async expandAndSelectFullPath(targetId: number) {
    const pathIds: number[] = [];
  
    let currentId = targetId;
  
    // Step 1: Collect path from selected to root
    while (currentId) {
      pathIds.unshift(currentId); // Add to the beginning
      const result = await this._sycEntityObjectCategoriesServiceProxy
        .getSycEntityObjectCategoryForEdit(currentId)
        .toPromise();
      currentId = result?.sycEntityObjectCategory?.parentId;
    }
  
    // Step 2: Walk and expand down the tree
    let currentNodes = this.files;
    for (const id of pathIds) {
      const foundNode = await this.expandAndReturnNode(id, currentNodes);
      if (!foundNode) break;
      currentNodes = foundNode.children || [];
    }
  
    // Step 3: Select the final node
    const finalNode = this.findNodeById(this.files, targetId);
    if (finalNode) {
      finalNode.expanded = true;
      this.selectedFile = finalNode;
    }
  }
  async expandAndReturnNode(id: number, nodes: any[]): Promise<any> {
    for (const node of nodes) {
      if (node.data?.sycEntityObjectCategory?.id === id) {
        if (!node.children || node.children.length === 0) {
          const res = await this._sycEntityObjectCategoriesServiceProxy
            .getAllChildsWithPaging(
              undefined, undefined, undefined, undefined, undefined, undefined, undefined,
              id, true, undefined, undefined, undefined, "name", 0, 10
            ).toPromise();
                // E-SII-20250507.0050 
          node.children = this.filterEmptyLeafCategories(res.items);
        }
        node.expanded = true;
        return node;
      }
  
      if (node.children && node.children.length > 0) {
        const found = await this.expandAndReturnNode(id, node.children);
        if (found) return found;
      }
    }
    return null;
  }

  getSettingData(){
    
    this._AppEntitiesServiceProxy.getHostSettingValue(1316, null).subscribe({
        next: (res) => {
            this.sellerSSin = res
        },
     
      });
  }
  selectionKeys: { [key: string]: boolean } = {}; 

  ngAfterViewInit() {
    // wait until deptTree is populated (if it's async, call this after you set it)
    queueMicrotask(() => {
      if (this.preselectDeptId) {
        this.selectedFile = { [this.preselectDeptId]: true };
      }
    });
  }
  ngOnDestroy(): void {
    clearTimeout(this.timeOut);
  }
}
