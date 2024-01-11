import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppItemSelectorsServiceProxy, AppItemsListDto, AppItemsListsServiceProxy, AppItemsServiceProxy, CreateOrEditAppItemsListItemDto, GetAllAppItemsInput, GetAppItemForViewDto, GetAppItemsListForViewDto, ItemsFilterTypesEnum, ItemsListFilterTypesEnum, LookupLabelDto } from '@shared/service-proxies/service-proxies';
import { SelectItem } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppItemsBrowseModalComponent } from '../../app-items-browse/components/app-items-browse-modal.component';
import { AppItemsBrowseInputs } from '../../app-items-browse/models/app-item-browse-inputs.model';
import { MultiSelectionInfo } from '../../app-items-browse/models/multi-selection-info.model';
import { ProductCatalogueReportParams } from '../models/product-Catalogue-Report-Params';


@Component({
  selector: 'app-catalogue-report-data-selection-step',
  templateUrl: './catalogue-report-data-selection-step.component.html',
  styleUrls: ['./catalogue-report-data-selection-step.component.scss']
})
export class CatalogueReportDataSelectionStepComponent extends AppComponentBase implements OnChanges {
  @Input() getAllAppItemsInput: GetAllAppItemsInput
  @Input() printInfoParam: ProductCatalogueReportParams;
  @Input() itemListId: number;
  disableAppItemsList: boolean;
  @Output() continue: EventEmitter<boolean> = new EventEmitter<boolean>();
  myProducts : any[];
  myProductsName: string = '';
  numberofselectedproducts: number = 0;
  numOfDisplayedItem: number = 4;

  isValid:boolean=false;
  
  @ViewChild("appItemsBrowseModal", { static: true }) appItemsBrowseModal: AppItemsBrowseModalComponent;
  oldSelectedAppItemList : AppItemsListDto
  oldSelectedAppItemListKey : string

  constructor(
    injector: Injector,
    private _appItemsListsServiceProxy: AppItemsListsServiceProxy,
    private appItemSelectorsServiceProxy:AppItemSelectorsServiceProxy,
    private _appItemsServiceProxy: AppItemsServiceProxy
  ) {
    super(injector);
  }
  ngOnChanges(changes:SimpleChanges){
    if(!this.printInfoParam) return 
    
    if (this.itemListId) { // my list case
      this.getAppItemListAndSelectAllItsItems()
      this.disableAppItemsList = true
    } else if(!this.printInfoParam.itemsListId && this.printInfoParam.selectedKey ) {// my products case
      // my products case
      this.disableAppItemsList = true
      this.numberofselectedproducts = this.getAllAppItemsInput.maxResultCount;
      this.getSelectorProductsAndSetNames()
    } else {
      // this.searchAppItemLists()
      this.disableAppItemsList = false
    }
  }
  getAppItemListAndSelectAllItsItems(){
    this._appItemsListsServiceProxy
      .getAppItemsListForView(this.printInfoParam.itemsListId)
        .subscribe((res) => {
          this.myProducts = res.appItemsList.appItemsListItems.items;
          this.numberofselectedproducts = res.appItemsList.appItemsListItems.totalCount;
          this.setmyProductsName(false);
          this.selectAllHandler();
          if(!this.appItemsLists?.length){
            this.appItemsLists = [new AppItemsListDto(res.appItemsList as any)]
            this.selectedAppItemList = this.appItemsLists[0]
          }
        });
  }
  setmyProductsName(fromApply:boolean) {
    this.myProductsName = '';
    var code ="";
    for (let i = 0; i < this.myProducts.length; i++) {
      if (!fromApply)
        code = this.myProducts[i].itemCode;
      else
        code = this.myProducts[i].appItem.code;

      if ( (i < this.numOfDisplayedItem) && (i==this.myProducts.length-1))
        this.myProductsName += code+ ',';

      else if ( (i < this.numOfDisplayedItem) && (i!=this.myProducts.length-1))
        this.myProductsName += code+ ',';
      else
        break;
    }
  }

  showProductsModal() {
    let defaultMainFilter: ItemsFilterTypesEnum 
    let pageMainFilters: SelectItem[] 
    if(!this.printInfoParam.selectedKey) this.printInfoParam.selectedKey = this.guid()
    if( !isNaN(this.getAllAppItemsInput?.filterType) ){
      defaultMainFilter = this.getAllAppItemsInput.filterType;
      pageMainFilters = [
        { label: this.l(ItemsFilterTypesEnum[this.getAllAppItemsInput.filterType]), value: this.getAllAppItemsInput.filterType }
      ];
    } else {
      defaultMainFilter = ItemsFilterTypesEnum.MyListing;
      pageMainFilters = [
        { label: this.l(ItemsFilterTypesEnum[ItemsFilterTypesEnum.MyItems]), value: ItemsFilterTypesEnum.MyItems },
        { label: this.l(ItemsFilterTypesEnum[ItemsFilterTypesEnum.MyListing]), value: ItemsFilterTypesEnum.MyListing }
      ];
    }
    let options: Partial<AppItemsBrowseInputs> = { pageMainFilters, defaultMainFilter };
    options.initialyShowTopBar = true
    const multiSelectionInfo : MultiSelectionInfo = new MultiSelectionInfo()
    multiSelectionInfo.totalCount = this.numberofselectedproducts
    multiSelectionInfo.sessionSelectionKey = this.printInfoParam.selectedKey
    this.appItemsBrowseModal.show(multiSelectionInfo, options,this.printInfoParam.itemsListId);
  }


  selectAllHandler(){
    this.isValid=false;
    const body :GetAllAppItemsInput = new GetAllAppItemsInput({...this.appItemsFilterBody,maxResultCount:this.numberofselectedproducts}) 
    body.appItemListId=this.printInfoParam.itemsListId;
    body.selectorKey = this.printInfoParam.selectedKey;
    body.selectorOnly =false;
    this.showMainSpinner()
    this.appItemSelectorsServiceProxy.selectAll(  this.printInfoParam.selectedKey, body)
    .pipe(
      finalize(()=>this.hideMainSpinner())
    )
    .subscribe(totalSelection=>{
      this.isValid=true;
    })
} 

  continueToNextStep() {
    this.continue.emit(true);
  }
  getSelectorProductsAndSetNames(filterType=null){
    this.showMainSpinner();
    let body :GetAllAppItemsInput 
    if(this.getAllAppItemsInput) body = new GetAllAppItemsInput({ ...this.getAllAppItemsInput ,selectorOnly:true }) 
    else body = new GetAllAppItemsInput({ ...this.appItemsFilterBody, selectorOnly:true });
   
    if(filterType!=null)
      body.filterType = filterType;

    this._appItemsServiceProxy
    .getAll(
      body.tenantId,
      body.appItemListId,
      body.selectorOnly,
      body.filter,
      body.filterType,
      undefined,
      this.printInfoParam.selectedKey,
      body.priceListId,
      body.arrtibuteFilters,
      body.classificationFilters,
      body.categoryFilters,
      undefined,
      body.departmentFilters,
      body.entityObjectTypeId,
      body.minimumPrice,
      body.maximumPrice,
      undefined,
      body.listingStatus,
      body.publishStatus,
      body.visibilityStatus,
      body.sorting,
      body.skipCount,
      this.numOfDisplayedItem 
    ).pipe(
      finalize(() => {
        this.hideMainSpinner()
      })
    )
    .subscribe(res => {
      this.myProducts= res.items;
      this.isValid = Boolean(this.myProducts.length)
      this.setmyProductsName(true);
    });
  }
  applyHandler($event:{multiSelectionInfo:MultiSelectionInfo,totalCount:number}) {
    this.numberofselectedproducts = $event.multiSelectionInfo.totalCount
    var filterType= this.appItemsBrowseModal.lastFilterType?.value;
    this.getSelectorProductsAndSetNames(filterType)
  }
  cancelHandler() {
    this.appItemsBrowseModal.close();
  }
  selectedAppItemList:AppItemsListDto
  appItemsLists:AppItemsListDto[]
  searchAppItemLists($event?){
    this._appItemsListsServiceProxy.getAll(
      $event,
      Number(ItemsFilterTypesEnum.MyItems),
      true,
      'Name',
      undefined,
      undefined
    ).subscribe(result=>{
      this.appItemsLists = result.items.map(x=>x.appItemsList)
    })
  }
  onAppItemListSelectionChange($event:AppItemsListDto){
  }
  onSelectItem($event){
    if(this?.oldSelectedAppItemList?.id == this.selectedAppItemList?.id) return
    // remove old itemlist temp data
    if(this.oldSelectedAppItemListKey) this.appItemSelectorsServiceProxy.deleteAllTempWithKey(this.oldSelectedAppItemListKey, undefined, undefined).subscribe()
    // add new  itemlist temp data
    this.printInfoParam.itemsListId = this.selectedAppItemList.id
    this.printInfoParam.selectedKey = this.guid()
    this.numberofselectedproducts = this.selectedAppItemList.itemsCount
    this.getAppItemListAndSelectAllItsItems()

    this.oldSelectedAppItemList = this.selectedAppItemList
    this.oldSelectedAppItemListKey = this.printInfoParam.selectedKey
  }
  
  
}
