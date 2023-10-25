import {
    Component,
    Injector,
    ViewChild,
    ElementRef,
    Output,
    EventEmitter,
    Input,
} from "@angular/core";
import { Router } from "@angular/router";
import {
    AppItemsServiceProxy,
    AppItemDto,
    GetAppItemForViewDto,
    ItemsFilterTypesEnum,
    ArrtibuteFilter,
    GetAllAppItemsInput,
    AppItemStockAvailabilityServiceProxy,
} from "@shared/service-proxies/service-proxies";
import { AppComponentBase } from "@shared/common/app-component-base";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { Table } from "primeng/table";
import { Paginator } from "primeng/paginator";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { EntityTypeHistoryModalComponent } from "@app/shared/common/entityHistory/entity-type-history-modal.component";
import * as _ from "lodash";
import { debounceTime, finalize, tap } from "rxjs/operators";
import { LazyLoadEvent, SelectItem } from "primeng/api";
import { AppItemsActionsService } from "../../app-item-shared/services/app-items-actions.service";
import { AppItemsBrowseComponentActionsMenuFlags, AppItemsBrowseComponentFiltersDisplayFlags, AppItemsBrowseComponentStatusesFlags, AppItemsBrowseInputs } from "../models/app-item-browse-inputs.model";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MainImportComponent } from "@shared/components/import-steps/components/mainImport.component";
import { ImportTypes } from "@shared/components/import-steps/models/ImportTypes";
import { itemsImport } from "@shared/components/import-steps/services/itemsImport.service";
import { AppItemBrowseEvents } from "../models/appItems-browse-events";
import { ActionsMenuEventEmitter } from "../models/ActionsMenuEventEmitter";
import { BrowseMode } from "../models/BrowseModeEnum";
import { MultiSelectionInfo } from "../models/multi-selection-info.model";
import { ImportStepInfo } from "@shared/components/import-steps/models/ImportStepInfo";
import { ImportStepsEnum } from "@shared/components/import-steps/models/ImportStepsEnum";
import { MainImportService } from "@shared/components/import-steps/services/mainImport.service";

@Component({
    selector: "app-app-items",
    templateUrl: "./appItems.component.html",
    styleUrls: ["./appItems.component.scss"],
    animations: [appModuleAnimation()],
})
export class AppItemsComponent extends AppComponentBase {
    appItemListId:number;
    @Output() eventTriggered :EventEmitter<ActionsMenuEventEmitter<AppItemBrowseEvents>> = new EventEmitter<ActionsMenuEventEmitter<AppItemBrowseEvents>>()

    singleItemPerRowMode: boolean = false;
    @ViewChild("entityTypeHistoryModal", { static: true })  entityTypeHistoryModal: EntityTypeHistoryModalComponent;

    @ViewChild("dataTable", { static: true }) dataTable: Table;
    @ViewChild("paginator", { static: true }) paginator: Paginator;
    @ViewChild("appItemsContainer", { static: false })  appItemsContainer: ElementRef;
    active:boolean
    showConfirm: boolean = false;
    selectedItemId: number;
    selectedIndex: number;
    filterText = "";

    _entityTypeFullName = "onetouch.AppItems.AppItem";
    entityHistoryEnabled = false;

    items: GetAppItemForViewDto[] = [];
    sortingOptions: SelectItem[];

    // filters: AppItemListFilters = new AppItemListFilters();
    pageMainFilters: SelectItem[];
    itemsToShow = [];
    skipCount: number = 0;
    maxResultCount: number = 20;
    isFullListDisplayed: boolean = false;
    lastFilterType: number
    defaultMainFilter : ItemsFilterTypesEnum
    canAdd : boolean
    canView : boolean
    showMainFiltersOptions : boolean
    filtersFlags: AppItemsBrowseComponentFiltersDisplayFlags
    actionsMenuFlags :   AppItemsBrowseComponentActionsMenuFlags
    statusesFlags :  AppItemsBrowseComponentStatusesFlags
    title : string
    filterForm:FormGroup = this._fb.group({})
    get mainFilterCtrl () { return this.filterForm.get('filterType') }
    get searchCtrl () { return this.filterForm.get('search') }
    get sortingCtrl () { return this.filterForm.get('sorting') }
    get extraAttributesCtrl () { return this.filterForm.get('extraAttributes') }
    totalCount:number;
    @ViewChild("ImportProductsModal", { static: true })
    ImportProductsModal: MainImportComponent;

    AppItemBrowseEvents = AppItemBrowseEvents
    loading: boolean = false;
    isModal:boolean = false
    priceListId:number

    browseMode:BrowseMode
    BrowseModeEnum = BrowseMode
    multiSelectionInfo : MultiSelectionInfo
    applySelectionTitle:string = 'Apply'
    oldValue;
    constructor(
        injector: Injector,
        private _importService: MainImportService,
        private _appItemsServiceProxy: AppItemsServiceProxy,
        private _fileDownloadService: FileDownloadService,
        private _appItemsActionService: AppItemsActionsService,
        private _router: Router,
        private _fb : FormBuilder
    ) {
        super(injector);
    }

    initFilterForm(){
        this.filterForm = this._fb.group({
            search :[],
            filterType:[],
            sorting:[],
        })
    }

    fillFormFilters(){
        const flags = this.filtersFlags
        if(flags.appItemType){
            const control = this._fb.control(undefined)
            this.filterForm.addControl("appItemType",control)
        }
        if(flags.categories){
            const control = this._fb.control([])
            this.filterForm.addControl("categories",control)
        }
        if(flags.classifications){
            const control = this._fb.control([])
            this.filterForm.addControl("classifications",control)
        }
        if(flags.departments){
            const control = this._fb.control([])
            this.filterForm.addControl("departments",control)
        }
        if(flags.listingStatus){
            const control = this._fb.control(undefined)
            this.filterForm.addControl("listingStatus",control)
        }
        if(flags.publishStatus){
            const control = this._fb.control(undefined)
            this.filterForm.addControl("publishStatus",control)
        }
        if(flags.visibilityStatus){
            const control = this._fb.control(undefined)
            this.filterForm.addControl("visibilityStatus",control)
        }
        if(flags.extraAttributes){
            const control = this._fb.group([])
            this.filterForm.addControl("extraAttributes",control)
        }

        if(this.appItemListId){
            const control = this._fb.control(this.appItemListId)
            this.filterForm.addControl("appItemListId",control)
        }

    }

    ngOnInit(): void {
        this.entityHistoryEnabled = this.setIsEntityHistoryEnabled();
        this.getUserPreferenceForListView();
        this.initFilterForm()
    }

    setMainPageFilter(filter:ItemsFilterTypesEnum){
        const selectedfilter = this.pageMainFilters.filter(item=>filter == item.value)[0]
        if(!selectedfilter) return
        this.mainFilterCtrl.setValue(selectedfilter)
    }
    initialyShowTopBar:boolean
    show(inputs:AppItemsBrowseInputs){
        this.defaultMainFilter   =  inputs.defaultMainFilter
        this.canView  =  inputs.canView
        this.isModal  =  inputs.isModal
        this.canAdd  =  inputs.canAdd
        this.pageMainFilters  =  inputs.pageMainFilters
        this.filtersFlags  =  inputs.filtersFlags
        this.statusesFlags  =  inputs.statusesFlags
        this.actionsMenuFlags  =  inputs.actionsMenuFlags
        this.title = inputs.title
        this.priceListId = inputs.priceListId
        this.browseMode = inputs.browseMode
        this.multiSelectionInfo = inputs.multiSelectionInfo
        this.showMainFiltersOptions = inputs.showMainFiltersOptions
        this.initialyShowTopBar = inputs.initialyShowTopBar
        if(inputs.applySelectionTitle) this.applySelectionTitle = inputs.applySelectionTitle
        this.subscribeToFiltersChangeAndApplyFilteration();
        this.defineSortingOptions();
        this.fillFormFilters()
        this.setMainPageFilter(this.defaultMainFilter)
        this.setDefaultSorting("id")
    }

    setDefaultSorting(sorting:string){
        this.sortingCtrl.setValue(sorting)
    }

    private setIsEntityHistoryEnabled(): boolean {
        let customSettings = (abp as any).custom;
        return (
            this.isGrantedAny("Pages.Administration.AuditLogs") &&
            customSettings.EntityHistory &&
            customSettings.EntityHistory.isEnabled &&
            _.filter(
                customSettings.EntityHistory.enabledEntities,
                (entityType) => entityType === this._entityTypeFullName
            ).length === 1
        );
    }
    subscribeToFiltersChangeAndApplyFilteration() {
        this.filterForm.valueChanges
            .pipe(
                tap((value) => {
                    if (value) {
                        const currentFilterType: number = value.filterType;
                        if (this.lastFilterType !== currentFilterType) {
                            this.items = [];
                            this.lastFilterType = currentFilterType;
                        }
                    }
                }),
                debounceTime(1500)
            )
            .subscribe((value) => {
                if (value && value !=this.oldValue)  {
                    this.oldValue=value;
                    this.eventTriggered.emit({event:AppItemBrowseEvents.FilterChange})
                    this.getFreshData();
                }
            });

    }
    getFreshData() {
        this.resetPagination();
        this.getAppItems();
    }

    showMore() {
        this.getAppItems();
    }
    defineSortingOptions() {
        this.sortingOptions = [
            { label: "", value: "id" },
            { label: this.l("ProductName"), value: "name" },
            { label: this.l("ProductCode"), value: "code" },
        ];
    }
    filterBody = new GetAllAppItemsInput();
    getAppItems(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.totalRecords = 10;
            this.paginator.changePage(0);
            return;
        }
        const filters = this.filterForm.value;
        const filterBody = this.filterBody
        filterBody.categoryFilters = filters?.categories?.map(dept=>dept.data?.sycEntityObjectCategory?.id)
        filterBody.classificationFilters = filters?.classifications?.map(_class=>_class?.data?.sycEntityObjectClassification?.id)
        filterBody.departmentFilters = filters?.departments?.map(categ=>categ?.data?.sycEntityObjectCategory?.id)
        filterBody.entityObjectTypeId = filters?.appItemType?.data?.sycEntityObjectType?.id  || undefined
        filterBody.arrtibuteFilters = []
        filterBody.filterType = filters.filterType.value
        filterBody.priceListId = this.priceListId

        const extraAttributesKeys  = Object.keys(filters?.extraAttributes)
        if(extraAttributesKeys?.length) {
            extraAttributesKeys.forEach((key)=>{
                const selectedValues : number[] = filters?.extraAttributes[key]
                if(selectedValues){
                    selectedValues.forEach((value)=>{
                        let attributeFilter : ArrtibuteFilter = new ArrtibuteFilter()
                        attributeFilter.arrtibuteValueId = value
                        attributeFilter.arrtibuteId = Number(key)
                        filterBody.arrtibuteFilters.push(attributeFilter)
                    })
                }
            })
        }
        filterBody.listingStatus = filters.listingStatus || undefined
        filterBody.publishStatus = filters.publishStatus || undefined
        filterBody.visibilityStatus = filters.visibilityStatus || undefined
        filterBody.minimumPrice = 0
        filterBody.maximumPrice = 0
        filterBody.selectorKey = this.multiSelectionInfo?.sessionSelectionKey

        filterBody.sorting = filters.sorting.value
        filterBody.skipCount = this.primengTableHelper.getSkipCount(this.paginator, event),
        filterBody.maxResultCount = this.primengTableHelper.getMaxResultCount(this.paginator, event)
        filterBody.filter = filters.search || undefined
        filterBody.appItemListId = filters.appItemListId || undefined

        filterBody.tenantId = 0
        filterBody.selectorOnly =false

        this.primengTableHelper.showLoadingIndicator();
        this.showMainSpinner();
        this.loading = true;
        this._appItemsServiceProxy
            .getAll(
                filterBody.tenantId,
                filterBody.appItemListId,
                filterBody.selectorOnly,
                filterBody.filter,
                filterBody.filterType,
                filterBody.lastKey,
                filterBody.selectorKey,
                filterBody.priceListId,
                filterBody.arrtibuteFilters,
                filterBody.classificationFilters,
                filterBody.categoryFilters,
                filterBody.departmentFilters,
                filterBody.entityObjectTypeId,
                filterBody.minimumPrice,
                filterBody.maximumPrice,
                filterBody.itemType,
                filterBody.listingStatus,
                filterBody.publishStatus,
                filterBody.visibilityStatus,
                filterBody.sorting,
                filterBody.skipCount,
                filterBody.maxResultCount
            )
            .pipe(
                finalize(() => {
                    this.primengTableHelper.hideLoadingIndicator();
                    this.hideMainSpinner();
                    this.loading = false;
                    if (!this.active) this.active = true;

                })
            )
            .subscribe((result) => {
                this.items = result.items;
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = result.items;
            });
    }

    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }

    resetList() {
        this.filterForm.reset()
        this.setMainPageFilter(this.defaultMainFilter)
        this.setDefaultSorting("id")
        // this.subscribeToFiltersChangeAndApplyFilteration();
        this.resetPagination();
        // this.getAppItems();
    }
    resetPagination() {
        this.items = [];
        this.skipCount = 0;
    }

    createAppItem(): void {
        this._router.navigate(["/app/main/products/createOrEdit"]);
    }

    showHistory(appItem: AppItemDto): void {
        this.entityTypeHistoryModal.show({
            entityId: appItem.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: "",
        });
    }

    deleteItemHandler(index: number): void {
        this.notify.success(this.l("SuccessfullyDeleted"));
        this.items.splice(index, 1);
    }

    exportToExcel(): void {
        this._appItemsServiceProxy
            .getAppItemsToExcel(this.filterText)
            .subscribe((result) => {
                this._fileDownloadService.downloadTempFile(result);
            });
    }

    eventHandler(event:ActionsMenuEventEmitter<AppItemBrowseEvents>,index?:number): void {
        if(event.event == AppItemBrowseEvents.Delete) this.deleteItemHandler(index)
        this.eventTriggered.emit(event)
    }


    saveUserPreferenceForListView() {
        const key = "appitem-list-view-mode";
        const value = String(Number(this.singleItemPerRowMode));
        localStorage.setItem(key, value);
    }
    getUserPreferenceForListView() {
        const key = "appitem-list-view-mode";
        const value = localStorage.getItem(key);
        if (value) this.singleItemPerRowMode = Boolean(Number(value));
    }
    triggerListView() {
        this.singleItemPerRowMode = !this.singleItemPerRowMode;
        this.saveUserPreferenceForListView();
    }
    showImportProducts(){
        let importService=AppItemsServiceProxy;
        let serviceUtilites=itemsImport;
        let importStepsInfo:ImportStepInfo[];
        importStepsInfo= this._importService.getOriginalImportSteps();

        this.ImportProductsModal.show(ImportTypes.Items,importService,serviceUtilites,["IMAGE"],true,importStepsInfo);
    }

    showImportAvailableInventory(){
        let importService=AppItemStockAvailabilityServiceProxy;
        let serviceUtilites=itemsImport;
        let importStepsInfo:ImportStepInfo[]=[];

        importStepsInfo.push({
            stepEnum:ImportStepsEnum.BrowseModalStep,
            stepNumber:0
        },
        {
            stepEnum:ImportStepsEnum.StatusModalStep,
            stepNumber:1
        },
            {
                stepEnum:ImportStepsEnum.importConfirmationModalStep,
                stepNumber:2
            },
            {
                stepEnum:ImportStepsEnum.successfullyImportModalStep,
                stepNumber:3
            }
            );
        this.ImportProductsModal.show(ImportTypes.Qty,importService,serviceUtilites,null,false,importStepsInfo);
    }

    selectAll(){
        this.eventTriggered.emit({ event:AppItemBrowseEvents.SelectAll})
    }
    invertSelection(){
        this.eventTriggered.emit({ event:AppItemBrowseEvents.InvertSelection})
    }
    selectNone(){
        this.eventTriggered.emit({ event:AppItemBrowseEvents.SelectNone })
    }
    cancelSelection(){
        this.eventTriggered.emit({ event:AppItemBrowseEvents.CancelSelection })
    }
    applySelection(){
        this.eventTriggered.emit({ event:AppItemBrowseEvents.ApplySelection })
    }
    onFinishImport($event) {
        if ($event)
            this.reloadPage();
    }
}
