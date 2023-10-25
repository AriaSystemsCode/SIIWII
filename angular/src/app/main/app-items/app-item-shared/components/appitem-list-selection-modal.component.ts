import { AfterViewInit, Component, EventEmitter, Injector, Input,  Output, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppItemsListDto, AppItemsListsServiceProxy, GetAppItemsListForViewDto, ItemsListFilterTypesEnum} from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged,  finalize } from 'rxjs/operators';

@Component({
  selector: 'app-appitem-list-selection-modal',
  templateUrl: './appitem-list-selection-modal.component.html',
  styleUrls: ['./appitem-list-selection-modal.component.scss'],
  providers:[AppItemsListsServiceProxy]
})
export class AppitemListSelectionModalComponent extends AppComponentBase implements AfterViewInit  {
    @ViewChild('selectListModal', { static: true }) modal: ModalDirective;


    @Output() addNew: EventEmitter<any> = new EventEmitter<any>();
    @Output() selectVariation: EventEmitter<AppItemsListDto> = new EventEmitter<AppItemsListDto>();
    @Output() cancel: EventEmitter<boolean> = new EventEmitter<boolean>();

    active = false;
    saving = false;
    loading: boolean;

    lists : GetAppItemsListForViewDto[] = []; //  replace any with the list model dto
    @Input('selectedList') selectedListId: number;
    productListId : number
    moreDataExist:boolean = true
    noOfItemsToShowInitially: number = 18;
    skipCount: number = 0;
    maxResultCount: number = 18;
    itemsToLoad: number = 18;
    isFullListDisplayed :boolean = false
    searchQuery: string
    searchQuerySubject : Subject<string> = new Subject<string>()
    searchQuery$: Observable<string> = this.searchQuerySubject.asObservable()
    constructor(
        injector: Injector,
        private appItemsListsServiceProxy:AppItemsListsServiceProxy
    ) {
        super(injector);
    }

    ngAfterViewInit(){
        this.modal.config.backdrop = 'static'
        this.modal.config.ignoreBackdropClick = true
    }

    show(productListId:number,selectedListId?:number): void {
        this.selectedListId = selectedListId
        this.productListId = productListId
        this.loading=true;
        // get all list
        this.active = true;
        this.modal.show();
        this.getAllListData()
        this.listenToSearchChange()
    }

    close(): void {
        this.hide()
    }

    hide(){
        this.active = false;
        this.modal.hide();
    }
    cancelSelection(){
        this.hide();
        this.cancel.emit()
    }
    getAllListData(instantSearch?:boolean){
        this.loading = true
        this.showMainSpinner()
        this.primengTableHelper.showLoadingIndicator();
        if(this.lists == undefined || instantSearch) this.lists = [];
        if(instantSearch) this.skipCount = 0

        this.appItemsListsServiceProxy.getAll(
            this.searchQuery,
            ItemsListFilterTypesEnum.MyItemsList,
            false,
            undefined,
            this.skipCount,
            this.maxResultCount
            )
            .pipe(
                finalize(()=>{
                    this.primengTableHelper.hideLoadingIndicator();
                    this.hideMainSpinner()
                    this.loading = false
            })
        )
        .subscribe((res)=>{
            this.moreDataExist = res.items.length === this.maxResultCount

            this.lists.push(...res.items)
            if(res.items.length === 0 ){
                let message = ""
                if(this.lists.length) message = this.l("NoMoreData...")
                else message = this.l("NoDataFound...")
                this.notify.info(message)
            }
        })
    }
    triggerAddNewOutput(){
        this.addNew.emit()
    }
    triggerVariationSelection(selectedList:AppItemsListDto){

        this.selectVariation.emit(selectedList)
    }

    filterValues(){

        this.searchQuerySubject.next(this.searchQuery)
    }
    listenToSearchChange(){

        const subs = this.searchQuery$
        .pipe(
            distinctUntilChanged(),
            debounceTime(1000)
        )
        .subscribe(res=>{
            if(this.loading) return
            this.getAllListData(true)
        })
        this.subscriptions.push(subs)
    }

    onScroll($event): void {
        if(this.loading || !this.active) return
        const currentPos = $event.target.scrollTop
        const elementTotalHeight = $event.target.scrollHeight - $event.target.offsetHeight

        if( elementTotalHeight - currentPos  > 150 ) return
        this.scrollIntoTop($event,currentPos)

        if (this.moreDataExist) {
            this.maxResultCount = this.itemsToLoad;
            this.skipCount = this.noOfItemsToShowInitially;
            this.noOfItemsToShowInitially += this.itemsToLoad;

            this.getAllListData();
        } else {
            this.isFullListDisplayed = true;
        }
    }

    scrollIntoTop($event,currentPos){
        $event.target.scroll(0,currentPos)
    }

    resetState(){
        this.searchQuery = undefined
        this.moreDataExist = false
        this.noOfItemsToShowInitially = 18;
        this.skipCount = 0;
        this.maxResultCount = 18;
        this.itemsToLoad = 18;
        this.isFullListDisplayed  = false
        this.lists = []
        this.emitDestroy()
    }

}
