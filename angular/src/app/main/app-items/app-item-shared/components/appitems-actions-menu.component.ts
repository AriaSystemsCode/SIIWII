import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GetAppItemForViewDto, AppItemsListDto, CreateOrEditAppItemsListItemDto, AppItemVariationDto, AppItemsListsServiceProxy, AppItemsServiceProxy, AppItemDto, AppItemsListItemVariationDto, StateEnum } from '@shared/service-proxies/service-proxies';
import { forkJoin, Observable } from 'rxjs';
import { AppItemsBrowseComponentActionsMenuFlags, AppItemsBrowseComponentStatusesFlags } from '../../app-items-browse/models/app-item-browse-inputs.model';
import { AppItemBrowseEvents } from '../../app-items-browse/models/appItems-browse-events';
import { ActionsMenuEventEmitter } from "../../app-items-browse/models/ActionsMenuEventEmitter";
import { AppitemListPublishService } from '../../app-items-list/services/appitem-list-publish.service';
import { PublishAppItemListingService } from '../services/publish-app-item-listing.service';
import { AppitemListSelectionModalComponent } from './appitem-list-selection-modal.component';
import { CreateOrEditAppitemListComponent } from './create-or-edit-appitem-list.component';
import { SuccessRightModalComponent } from './success-right-modal.component';
import { VariationsSelectionModalComponent, VariationSelectionOutput } from './variations-selection-modal.component';
import { map } from 'rxjs/operators';
export enum AppItemTypeEnum {
    product,
    listing
}
@Component({
    selector: 'app-appitems-actions-menu',
    templateUrl: './appitems-actions-menu.component.html',
    styleUrls: ['./appitems-actions-menu.component.scss']
})
export class AppitemsActionsMenuComponent extends AppComponentBase  {
    @ViewChild("itemListSelection", { static: true }) itemListSelectionModal: AppitemListSelectionModalComponent;
    @ViewChild("createOrEditListModal", { static: true })  createOrEditListModal: CreateOrEditAppitemListComponent;
    @ViewChild("variationSelectionModal", { static: true })  variationSelectionModal: VariationsSelectionModalComponent;
    @ViewChild("successRightModal", { static: true })  successRightModal: SuccessRightModalComponent;
    @Input() item: AppItemDto;
    @Input() appItemType: AppItemTypeEnum;
    AppItemTypeEnum = AppItemTypeEnum
    @Input() actionsMenuFlags:AppItemsBrowseComponentActionsMenuFlags
    @Output() eventTriggered: EventEmitter<ActionsMenuEventEmitter<AppItemBrowseEvents>> = new EventEmitter<ActionsMenuEventEmitter<AppItemBrowseEvents>>();
    attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
    selectedList: AppItemsListDto;
    constructor(
        private injector:Injector,
        private _appItemsServiceProxy: AppItemsServiceProxy,
        private _appItemsListsServiceProxy: AppItemsListsServiceProxy,
        private _publishAppItemListingService: PublishAppItemListingService,
        private _appitemListPublishService: AppitemListPublishService,
    ) {
        super(injector)
    }

    createListingHandler(){
        this.eventTriggered.emit({event:AppItemBrowseEvents.CreateListing,data:this.item.id})
    }
    editListingHandler(){
        this.eventTriggered.emit({event:AppItemBrowseEvents.EditListing,data:this.item.id})
    }
    editItemHandler(){
        this.eventTriggered.emit({event:AppItemBrowseEvents.Edit,data:this.item.id})
    }
    askToConfirmDelete(): void {
        var isConfirmed: Observable<boolean>;
        isConfirmed   = this.askToConfirm("",this.l("AreYouSure"));

        isConfirmed.subscribe((res)=>{
            if(res){
                this.deleteItem();
            }
        });
    }

    deleteItem() {
        this._appItemsServiceProxy.delete(this.item.id)
        .subscribe(()=>{
            this.eventTriggered.emit({event:AppItemBrowseEvents.Delete,data:this.item.id})
        })
    }
    askToPublishProductListing() {
        var isConfirmed: Observable<boolean>;
        var messsage= this.l(`Savedsuccessfully,AreYouWantToPublishThisList?`,
        {
            confirmButtonText: this.l("PublishNow"),
            cancelButtonText: this.l("Later"),
        });

        isConfirmed = this.askToConfirm(messsage,this.l("Publish"));

        isConfirmed.subscribe((res)=>{
            if(res){
                this.openShareProductListingModal();
            } else {
                this.eventTriggered.emit({event:AppItemBrowseEvents.PublishListing,data:false})
            }
        });
    }

    openShareProductListingModal() {
        console.log(">> listing" )
        const listingId: number = this.item.id;
        const alreadyPublished: boolean = this.item.published;
        const successCallBack = () => {
            this.notify.success(this.l("PublishedSuccessfully"));
            this.eventTriggered.emit({event:AppItemBrowseEvents.PublishListing,data:true})
        };
        this._publishAppItemListingService.openProductListingSharingModal(
            alreadyPublished,
            listingId,
            successCallBack
        );
    }

    askToPublishProductList() {
        if(this.selectedList?.statusCode?.toUpperCase() == "DRAFT") return
        var isConfirmed: Observable<boolean>;
        var message= this.l(`Savedsuccessfully,AreYouWantToPublishThisList?`);
        isConfirmed   = this.askToConfirm(message,"",
        {
            confirmButtonText: this.l("PublishNow"),
            cancelButtonText: this.l("Later"),
        });

        isConfirmed.subscribe((res)=>{
                if(res) this.openShareProductListModal();
                else this.eventTriggered.emit({event:AppItemBrowseEvents.PublishProductList,data:false})
                this.successRightModal.modal.hide();
            }
        );
    }

    openShareProductListModal() {
        const listId: number = this.selectedList.id;
        const alreadyPublished: boolean = this.item.published;

        const successCallBack = () => {
            this.notify.success(this.l("PublishedSuccessfully"));
            this.eventTriggered.emit({event:AppItemBrowseEvents.PublishProductList,data:true})
        };

        this._appitemListPublishService.openSharingModal(
            alreadyPublished,
            listId,
            successCallBack
        );
    }

    unPublishProductListing() {
        const productListingId = this.item.id;
        this._publishAppItemListingService
            .unPublish(productListingId)
            .subscribe(() => {
                this.eventTriggered.emit({event:AppItemBrowseEvents.UnPublishListing,data:true})
            });
    }

    getProductListingVariation() {
        return this._appItemsServiceProxy.getVariations(this.item.id);
    }

    getProductListingListSelectedVariations() : Observable<CreateOrEditAppItemsListItemDto> {
        return this._appItemsListsServiceProxy.getDetails(
            this.selectedList.id,
            this.item.id,
            undefined,
            0,
            1
        ).pipe(map(res=>{
            return res.items[0]
        }))
    }
    addNewItemToList() {
        return this._appItemsListsServiceProxy.createOrEditItem(this.appItemListProductListing)
    }
    removeItemsFromList(ids:number[]) {
        return this._appItemsListsServiceProxy.deleteItem(ids)
    }
    saveAppItemListSelection(toBeDeletedIds?:number[]){
        const requests :Observable<any>[] = []
        if(toBeDeletedIds?.length) requests.push(this.removeItemsFromList(toBeDeletedIds))
        requests.push(this.addNewItemToList())
        forkJoin(requests).subscribe((res) => {
            this.successRightModal.show(this.selectedList.name); // list name is missing
            this.itemListSelectionModal.hide();

        });
    }

    // add to list modal
    openAddtoListModal() {
        console.log(">>", 'pupblish')
        this.itemListSelectionModal.show(this.item.id);
    }

    onListSelectionDone(list: AppItemsListDto) {
        this.selectedList = list;
        this.itemListSelectionModal.resetState();
        this.itemListSelectionModal.hide();
        this.openVariationSelectionModal(list);
    }
    onListSelectionCanceled() {
        this.itemListSelectionModal.resetState();
        this.selectedList = undefined;
        this.itemListSelectionModal.hide();
        this.eventTriggered.emit({event:AppItemBrowseEvents.AddToList,data:false})
    }

    // create or edit list methods
    openCreateOrEditModal(listingId: number) {
        this.itemListSelectionModal.resetState();
        this.itemListSelectionModal.hide();
        this.createOrEditListModal.show(listingId);
    }

    onCreateOrEditDone(id: number) {
        this.itemListSelectionModal.show(this.item.id, id);
    }
    onCreateOrEditCanceled(listId: number) {
        this.itemListSelectionModal.show(this.item.id, listId);
    }

    appItemListProductListing : CreateOrEditAppItemsListItemDto
    allVariations: AppItemVariationDto[]
    openVariationSelectionModal(list: AppItemsListDto) {
        this.selectedList = list;
        forkJoin([
            this.getProductListingListSelectedVariations(),
            this.getProductListingVariation(),
        ]).subscribe(([product, allVariations]) => {
            const hasVariations = allVariations.length;
            if(product){
                this.appItemListProductListing = product
            } else {
                this.appItemListProductListing = new CreateOrEditAppItemsListItemDto()
                this.appItemListProductListing.itemId = this.item.id
                this.appItemListProductListing.itemsListId = this.selectedList.id
                this.appItemListProductListing.state = StateEnum.ActiveOrEmpty
                this.appItemListProductListing.appItemsListItemVariations = []
            }
            this.allVariations = allVariations
            let selectedVariationsIds: number[] = product?.appItemsListItemVariations?.map(
                (_var) => _var.itemId
            ) || [];
            if(selectedVariationsIds.length == 0) {
                selectedVariationsIds = this.allVariations.map(variation=>variation.itemId)
            }
            if (hasVariations)
                this.variationSelectionModal.show(
                    this.item.id,
                    list.id,
                    allVariations,
                    selectedVariationsIds
                );
            else {
                this.saveAppItemListSelection();
            }
        });
    }

    onVariationSelectionDone(output: VariationSelectionOutput) {
        let selectedVariationsIds = output.selectedVariationsIds
        let toBeDeletedDirectly : AppItemsListItemVariationDto[]=[]
        let toBeChanged : AppItemsListItemVariationDto[]=[]
        let toBeAdded : AppItemsListItemVariationDto[]=[]
        this.allVariations.forEach(variation=>{
            const previousSelectionIndex : number = this.appItemListProductListing.appItemsListItemVariations.findIndex(item=>item.itemId === variation.itemId)
            const selected = selectedVariationsIds.includes(variation.itemId)
            const record : AppItemsListItemVariationDto = new AppItemsListItemVariationDto()
            if(previousSelectionIndex == -1) { // not exist before
                if(!selected) return // not selected
                else  { // selected
                    record.itemsListId = this.selectedList.id
                    record.itemId = variation.itemId
                    record.state = StateEnum.ActiveOrEmpty
                    toBeAdded.push(record)
                }
            } else { // exists before
                if(!selected) { // handling delete
                    toBeDeletedDirectly.push(record)
                }
                else {
                    record.state = StateEnum.ActiveOrEmpty
                    
                    record.id = this.appItemListProductListing.appItemsListItemVariations[previousSelectionIndex].id;
                    record.itemsListId = this.selectedList.id
                    record.itemId = variation.itemId
                    
                    toBeChanged.push(record)
                }
            }
        })

        this.appItemListProductListing.appItemsListItemVariations = [...toBeAdded,...toBeChanged]
        const toBeDeletedIds : number[] = toBeDeletedDirectly.map(item=>item.id)
        this.saveAppItemListSelection(toBeDeletedIds);
    }
    onVariationSelectionCanceled(id: number) {
        this.appItemListProductListing = undefined
        this.itemListSelectionModal.show(this.item.id, id);
    }

    //success modal
    onSuccessClose() {
        this.eventTriggered.emit({event:AppItemBrowseEvents.AddToList, data:true})

        this.itemListSelectionModal.resetState();
        //this.askToPublishProductList();
    }
}
