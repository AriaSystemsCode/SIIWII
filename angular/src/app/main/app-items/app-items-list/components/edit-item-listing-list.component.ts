import { Location } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import {
    Component,
    ElementRef,
    Injector,
    Input,
    OnInit,
    ViewChild,
} from "@angular/core";
import { NgForm } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    AppItemSelectorsServiceProxy,
    AppItemsListItemVariationDto,
    AppItemsListsServiceProxy,
    AppItemsServiceProxy,
    AppItemVariationDto,
    CreateOrEditAppItemsListDto,
    CreateOrEditAppItemsListItemDto,
    GetAppItemsListForEditOutput,
    ItemsFilterTypesEnum,
    StateEnum
} from "@shared/service-proxies/service-proxies";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { LazyLoadEvent, SelectItem } from "primeng/api";
import { Paginator } from "primeng/paginator";
import { Table } from "primeng/table";
import { forkJoin, Observable } from "rxjs";
import { finalize, tap } from "rxjs/operators";
import { SweetAlertOptions } from "sweetalert2";
import {
    VariationSelectionOutput,
    VariationsSelectionModalComponent,
} from "../../app-item-shared/components/variations-selection-modal.component";
import { AppItemsBrowseModalComponent } from "../../app-items-browse/components/app-items-browse-modal.component";
import { AppItemsBrowseInputs } from "../../app-items-browse/models/app-item-browse-inputs.model";
import { MultiSelectionInfo } from "../../app-items-browse/models/multi-selection-info.model";
import { AppitemListPublishService } from "../services/appitem-list-publish.service";

@Component({
    selector: "app-edit-item-listing-list",
    templateUrl: "./edit-item-listing-list.component.html",
    styleUrls: ["./edit-item-listing-list.component.scss"],
    animations: [appModuleAnimation()],
})
export class EditItemListingListComponent
    extends AppComponentBase
    implements OnInit
{
    singleItemPerRowMode: boolean = true;
    @Input("viewMode") viewMode: boolean;
    sessionKey : string 
    @ViewChild("appItemsBrowseModal", { static: true }) appItemsBrowseModal: AppItemsBrowseModalComponent;
    @ViewChild("dataTable", { static: true }) dataTable: Table;
    @ViewChild("paginator", { static: true }) paginator: Paginator;
    @ViewChild("appItemsContainer", { static: false })
    appItemsContainer: ElementRef;
    @ViewChild("variationSelectionModal", { static: true })
    variationSelectionModal: VariationsSelectionModalComponent;

    selectedItemId: number;
    selectedIndex: number;
    filterText = "";

    _entityTypeFullName = "onetouch.AppItems.AppItem";
    entityHistoryEnabled = false;

    list: GetAppItemsListForEditOutput;

    filters: any;
    loading: boolean = false;
    listId: number;

    canPublish: boolean;
    canEdit: boolean;
    canPrint: boolean;
    canDelete: boolean;
    isRecordOwner: boolean;
    StateEnum = StateEnum

    constructor(
        injector: Injector,
        _location: Location,
        private _appItemsListsServiceProxy: AppItemsListsServiceProxy,
        private _fileDownloadService: FileDownloadService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _appitemListPublishService: AppitemListPublishService,
        private _appItemsServiceProxy: AppItemsServiceProxy,
        private _appItemSelectorsServiceProxy: AppItemSelectorsServiceProxy 
    ) {
        super(injector,_location);
    }

    ngOnInit(): void {
        this.listId = this._activatedRoute.snapshot.params.id;
        this.getAppItemListForEdit();
        this.checkPermissions();
    }

    getAppItemListForEdit() {
        this.loading = true;
        this.showMainSpinner();
        this.primengTableHelper.showLoadingIndicator();
        this._appItemsListsServiceProxy
            .getAppItemsListForEdit(this.listId)
            .pipe(
                finalize(() => {
                    this.loading = false;
                    this.hideMainSpinner();
                    this.primengTableHelper.hideLoadingIndicator();
                })
            )
            .subscribe((res) => {
                this.mapGetAppItemListForEdit(res)
            });
    }
    mapGetAppItemListForEdit(res:GetAppItemsListForEditOutput){
        this.list = res;
        this.primengTableHelper.totalRecordsCount =
            res.appItemsList.appItemsListItems.totalCount;
        this.primengTableHelper.records =
            res.appItemsList.appItemsListItems.items;
        this.isRecordOwner = res?.tenantId == this.appSession?.tenant?.id
    }
    getItemVariation(itemId:number){
        return this._appItemsListsServiceProxy
            .getDetails(
                this.listId,
                itemId,
                undefined,
                0,
                1
            )
    }
    getAppItemListDetails(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.totalRecords = 10;
            this.paginator.changePage(0);
            return;
        }
        this.loading = true;
        this.showMainSpinner();
        this.primengTableHelper.showLoadingIndicator();

        this._appItemsListsServiceProxy
            .getDetails(
                this.listId,
                undefined,
                undefined,
                this.primengTableHelper.getSkipCount(this.paginator, event),
                this.primengTableHelper.getMaxResultCount(this.paginator, event)
            )
            .pipe(
                finalize(() => {
                    this.loading = false;
                    this.hideMainSpinner();
                    this.primengTableHelper.hideLoadingIndicator();
                })
            )
            .subscribe((res) => {
                this.list.appItemsList.appItemsListItems = res;
                this.primengTableHelper.totalRecordsCount = res.totalCount;
                this.primengTableHelper.records = res.items;
            });
    }
    createHeaderBody() : CreateOrEditAppItemsListDto{
        const body: CreateOrEditAppItemsListDto =
            new CreateOrEditAppItemsListDto();
        body.id = this.list.appItemsList.id;
        body.name = this.list.appItemsList.name;
        body.code = this.list.appItemsList.code;
        body.description = this.list.appItemsList.description;
        return body
    }
    createOrEditAppItemList(form: NgForm): void {
        if (form.form.invalid) {
            form.form.markAllAsTouched();
            return this.notify.info(
                this.l("Please,CompleteAllTheRequiredFields(*)")
            );
        }
        const body = this.createHeaderBody()

        this.loading = true;
        this.showMainSpinner();

        this._appItemsListsServiceProxy
            .createOrEdit(body)
            .pipe(finalize(() => (this.loading = false)))
            .subscribe((res) => {
                // this.notify.success(this.l("AddedSuccessfully"));
                this.hideMainSpinner();
                this.mapGetAppItemListForEdit(res)
                this.askToPublishProductList();
            });
    }
    askToConfirmCancelChanges(): void {
        if(this?.list?.appItemsList?.statusCode?.toUpperCase() != 'DRAFT' ) return  this.redirectToAppItemList()
        var isConfirmed: Observable<boolean>;
        const options:SweetAlertOptions = {
            confirmButtonText:this.l('Yes'),
            cancelButtonText:this.l('No'),
        }
        isConfirmed   = this.askToConfirm("",this.l("DoYouWantToSaveTheCurrentProductListAsDraft?"),options);

        isConfirmed.subscribe((res)=>{
            if(res){
                this.notify.success(this.l('SavedAsDraft'))
                this.redirectToAppItemList()
            } else {
                this.cancel()
            }
        });
    }

    refreshPage() {
        const page = this.paginator.getPage();
        this.paginator.changePage(page);
    }

    exportToExcel(): void {
        this._appItemsListsServiceProxy
            .getAppItemsListsToExcel(this.filterText)
            .subscribe((result) => {
                this._fileDownloadService.downloadTempFile(result);
            });
    }

    deleteItem($event, item: CreateOrEditAppItemsListItemDto, index: number) {
        let ids = [ item.id, ...item.appItemsListItemVariations?.map(variation=>variation.id) ]
        this.list?.appItemsList?.appItemsListItems?.items
        this._appItemsListsServiceProxy.deleteItem(ids).subscribe(
            (res) => {
                this.notify.success(this.l("SuccessfullyDeleted"));
                this.list.appItemsList.appItemsListItems.items.splice(index, 1);
                this.changStatusAsDraft()
            },
            (err: HttpErrorResponse) => {
                this.notify.error(err.message);
            }
        );
    }

    getProductListingVariation(productListingId: number) {
        return this._appItemsServiceProxy.getVariations(productListingId);
    }

    onVariationSelectionCanceled(id: number) {}

    // variation selection output handlers
    openVariationSelectionModal($event, item: CreateOrEditAppItemsListItemDto) {
        const productListingId = item.itemId;
        const listId = this.list.appItemsList.id;
        let selectedVariationsIds = []
        item.appItemsListItemVariations.forEach((variation) => {
            if(variation.state != StateEnum.ToBeRemoved) selectedVariationsIds.push(variation.itemId)
        });
        this.appItemListProductListing = item
        this.getProductListingVariation(productListingId).subscribe(
            (allVariations) => {
                this.allVariations = allVariations
                const hasVariations = allVariations.length;

                if (hasVariations)
                    this.variationSelectionModal.show(
                        productListingId,
                        listId,
                        allVariations,
                        selectedVariationsIds
                    );
                else
                    return this.notify.info(
                        this.l(`Product{0}hasNoVariations`, item.itemName)
                    );
            }
        );
    }

    askToPublishProductList() {
        if(this.primengTableHelper.totalRecordsCount == 0 ) return this.redirectToAppItemList();
        var isConfirmed: Observable<boolean>;
        isConfirmed   = this.askToConfirm(this.l('DoYouWantToPublishThisProductList?'),this.l("SavedSuccessfully"),
        {
            confirmButtonText: this.l("PublishNow"),
            cancelButtonText: this.l("Later"),
        });

        isConfirmed.subscribe((res)=>{
            if(res){
                this.openShareProductListModal();
            } else {
                this.redirectToAppItemList();
            }
        });
    }

    openShareProductListModal() {
        if (!this.canPublish) return;
        const listId: number = this.list.appItemsList.id;
        const alreadyPublished: boolean = this.list.appItemsList.published;

        const successCallBack = () => {
            this.notify.success(this.l("PublishedSuccessfully"));
            this.list.appItemsList.published;
            this.redirectToAppItemList();
        };

        this._appitemListPublishService.openSharingModal(
            alreadyPublished,
            listId,
            successCallBack
        );
    }

    redirectToAppItemList() {
        this._router.navigate(["/app/main/productslists"]);
    }
    backURL() {
        this.goBack("app/main/productslists");
    }

    unPublish() {
        if (!this.canPublish) return;
        const listId: number = this.list.appItemsList.id;
        this.showMainSpinner();
        this._appitemListPublishService
            .unPublish(listId)
            .pipe(
                finalize(() => {
                    this.hideMainSpinner();
                })
            )
            .subscribe(() => {
                this.list.appItemsList.published = false;
                this.notify.success(this.l("UnPublishedSuccessfully"));
                this.redirectToAppItemList();
            });
    }

    askToConfirmDeleteList() {
        var isConfirmed: Observable<boolean>;
        isConfirmed   = this.askToConfirm("",this.l("AreYouSureYouWantToDeleteThisList?"));

        isConfirmed.subscribe((res)=>{
            if(res){
                this.deleteList();
            }
        });
    }

    deleteList() {
        if (!this.canDelete) return;
        const id = this.list.appItemsList.id;
        this._appItemsListsServiceProxy.delete(id).subscribe(
            (res) => {
                this.notify.success(this.l("SuccessfullyDeleted"));
                this.redirectToAppItemList();
            },
            (err: HttpErrorResponse) => {
                this.notify.error(err.message);
            }
        );
    }

    printList(): void {
        const productsCount =
            this.list.appItemsList.appItemsListItems.totalCount;
        if (!this.canPrint) return;
        else if (productsCount === 0)
            return this.notify.error(
                this.l("NoListingsInThisProductList.CannotPrint.")
            );
        this._router.navigate([
            "app/main/linesheet/print",
            this.list.appItemsList.id,
        ]);
    }

    checkPermissions() {
        this.canPublish = this.permission.isGranted(
            "Pages.AppItemsLists.Publish"
        );
        this.canEdit = this.permission.isGranted("Pages.AppItemsLists.Edit");
        this.canPrint = this.permission.isGranted("Pages.AppItemsLists.Print");
        this.canDelete = this.permission.isGranted(
            "Pages.AppItemsLists.Delete"
        );
    }
    openMultiSelector(){
        this.sessionKey = this.guid()
        const defaultMainFilter: ItemsFilterTypesEnum = ItemsFilterTypesEnum.MyListing
        const pageMainFilters: SelectItem[] = [
            { label: this.l("MyListings"), value: ItemsFilterTypesEnum.MyListing }
        ]
        let options: Partial<AppItemsBrowseInputs> = { pageMainFilters, defaultMainFilter }
        options.initialyShowTopBar = true
        const multiSelectionInfo = new MultiSelectionInfo()
        multiSelectionInfo.sessionSelectionKey = this.sessionKey 
        this.appItemsBrowseModal.show( multiSelectionInfo, options )
    }
    applyHandler($event){
        this.showMainSpinner()
        this._appItemsListsServiceProxy.saveSelection(this.list.appItemsList.id,this.sessionKey)
        .pipe(
            finalize(()=>this.hideMainSpinner())
        )
        .subscribe(res=>{
            this.changStatusAsDraft()
            this.reloadPage()
        })
    }
    cancelHandler(){
        this.appItemsBrowseModal.close()
    }
    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }
    cancel(){  
        this._appItemsListsServiceProxy.cancel(this.listId)
        .subscribe(res=>{
            if(this.list?.appItemsList?.statusCode?.toUpperCase() == 'DRAFT') this.notify.info(this.l('AllChangesAreDiscarded'))
            this.redirectToAppItemList()
        })
    }
    onHeaderInputsBlur($event){
        const body = this.createHeaderBody()
        this._appItemsListsServiceProxy.saveState(body).subscribe(res=>{
            // this.notify.success(this.l('SavedSuccessfully'))
            this.changStatusAsDraft()
        })
    }
    getStatus(){
        return this._appItemsListsServiceProxy.getStatus(this.list.appItemsList.id)
        .pipe(tap(res=>{
            this.list.appItemsList.statusCode = res.code
            this.list.appItemsList.statusId = res.id
        })).toPromise()
    }
    changStatusAsDraft(){
        if(this.list?.appItemsList?.statusCode?.toUpperCase() == 'DRAFT') return
        this._appItemsListsServiceProxy.changeStatus(this.list.appItemsList.id,"DRAFT").subscribe(()=>{
            this.getStatus()
        })
    }
    
    markItemAs( itemId:number, state:StateEnum,index:number ){
        this._appItemsListsServiceProxy.marItemsAs( this.list.appItemsList.id, itemId, state )
        .subscribe(res=>{
            this.list.appItemsList.appItemsListItems.items[index].state = state
            if(this.list?.appItemsList?.statusCode?.toUpperCase() == 'DRAFT') return
            this.getStatus()
        })
    }
    itemStatusChangeHandler( $event:StateEnum, itemId:number, index:number ){
        this.markItemAs(itemId,$event,index)
    }
    allVariations:AppItemVariationDto[]
    appItemListProductListing:CreateOrEditAppItemsListItemDto
    onVariationSelectionDone(output: VariationSelectionOutput) {
        let selectedVariationsIds = output.selectedVariationsIds 
        let toBeDeletedDirectly : AppItemsListItemVariationDto[]=[]
        let toBeChanged : AppItemsListItemVariationDto[]=[]
        let toBeAdded : AppItemsListItemVariationDto[]=[]
        this.allVariations.forEach(variation=>{ 
            const previousSelectionIndex : number = this.appItemListProductListing.appItemsListItemVariations.findIndex(item=>item.itemId == variation.itemId)
            const selected = selectedVariationsIds.includes(variation.itemId)
            const record : AppItemsListItemVariationDto = new AppItemsListItemVariationDto()
            if(previousSelectionIndex == -1 && selected) { // not exist before
                record.itemsListId = this.list.appItemsList.id
                record.itemId = variation.itemId
                record.state = StateEnum.ToBeAdded
                toBeAdded.push(record)
            } else { // exists before
                const previousRecord = this.appItemListProductListing.appItemsListItemVariations[previousSelectionIndex]
                record.init(previousRecord)
                if(!selected) { // handling delete
                    if( previousRecord.state == StateEnum.ToBeAdded){ // direct delete
                        toBeDeletedDirectly.push(record)
                    } else { // status change
                        record.state = StateEnum.ToBeRemoved
                        toBeChanged.push(record)
                    }
                }
                else { //selected
                    if( previousRecord.state == StateEnum.ToBeRemoved){ 
                        record.state = StateEnum.ActiveOrEmpty
                        toBeChanged.push(record)
                    } else {
                        record.state = previousRecord.state
                        toBeChanged.push(record)
                    }
                }
            }
        })
        this.appItemListProductListing.appItemsListItemVariations = [...toBeAdded,...toBeChanged]
        const toBeDeletedIds : number[] = toBeDeletedDirectly.map(item=>item.id)
        this.saveAppItemListSelection(toBeDeletedIds);
    }
    saveAppItemListSelection(toBeDeletedIds?:number[]){
        const requests :Observable<any>[] = []
        const itemListId = this.appItemListProductListing.itemsListId
        if(toBeDeletedIds?.length) requests.push(this.removeItemsFromList(toBeDeletedIds))
        const statusCode = this.list?.appItemsList?.statusCode?.toUpperCase()
        this.appItemListProductListing.state = StateEnum.ToBeAdded
        requests.push(this.addNewItemToList())
        forkJoin(requests).subscribe(() => {
            if(statusCode != "DRAFT") {
                this.changStatusAsDraft()
            }
            this.getItemVariation(this.appItemListProductListing.itemId).subscribe(res=>{
                this.appItemListProductListing.appItemsListItemVariations = res.items[0].appItemsListItemVariations
                this.appItemListProductListing = undefined
            })
        });
    }
    addNewItemToList() {
        return this._appItemsListsServiceProxy.createOrEditItem(this.appItemListProductListing)
    }
    removeItemsFromList(ids:number[]) {
        return this._appItemsListsServiceProxy.deleteItem(ids)
    }
    SaveAsDraft(){
        var isConfirmed: Observable<boolean>;
        const options:SweetAlertOptions = {
            confirmButtonText:this.l('Yes'),
            cancelButtonText:this.l('No'),
        }
        isConfirmed   = this.askToConfirm("",this.l("AreYouSure,YouWantToSaveAsDraft?"),options);

        isConfirmed.subscribe((res)=>{
            if(res){
                this.notify.success(this.l('SavedAsDraft'))
                this.redirectToAppItemList()
            } else {
                this.cancel()
            }
        });
        
    }
}
