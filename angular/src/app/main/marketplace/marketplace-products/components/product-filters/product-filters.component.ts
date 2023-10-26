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
    startShipDate: string;
    endShipDate: string;
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

    constructor(
        private _AppMarketplaceItemsServiceProxy: AppMarketplaceItemsServiceProxy,
        private _SycEntityObjectTypesServiceProxy: SycEntityObjectTypesServiceProxy,
        private _sycEntityObjectCategoriesServiceProxy: SycEntityObjectCategoriesServiceProxy,
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy
    ) {
        this.getAllProductCAtalogs();
        this.getParentDepartments();
        this.getAllBrands();
    }

    // get all brands
    brands: any[] = [];
    getAllBrands() {
        this._appEntitiesServiceProxy
            .getAllEntitiesByTypeCodeWithPaging(
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
                10
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
            .getSharedItemLists(null, "name", 0, 200)
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
    getParentDepartments() {
        let apiMethod = "getAllWithChildsForProductWithPaging";
        const subs = this._sycEntityObjectCategoriesServiceProxy[apiMethod](
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
        ).subscribe(
            (res: {
                items: TreeNodeOfGetSycEntityObjectCategoryForViewDto[];
                totalCount: number;
            }) => {
                this.files = res.items;
            }
        );
    }

    collapseAll() {
        this.files.forEach((node) => {
            this.expandRecursive(node, false);
        });
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
        this.selectedFile = null;
        this.selctedBradns = [];
        this.min = "";
        this.max = "";
    }

    ngOnInit(): void {
        throw new Error("Method not implemented.");
    }

    ngOnDestroy(): void {
        clearTimeout(this.timeOut);
    }
}
