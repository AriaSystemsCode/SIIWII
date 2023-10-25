import { Component, Injector, Input, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import {  SycEntityObjectClassificationsServiceProxy, SycEntityObjectClassificationDto, TreeNodeOfGetSycEntityObjectClassificationForViewDto } from '@shared/service-proxies/service-proxies';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { CreateOrEditClassificationDynamicModalComponent } from './create-or-edit-classification-dynamic-modal.component';
export class TreeItem  extends TreeNodeOfGetSycEntityObjectClassificationForViewDto {
    partialSelected: boolean
    parent : TreeNodeOfGetSycEntityObjectClassificationForViewDto
}

@Component({
  selector: 'app-select-classification-dynamic-modal',
  templateUrl: './select-classification-dynamic-modal.component.html',
  styleUrls: ['./select-classification-dynamic-modal.component.scss']
})
export class SelectClassificationDynamicModalComponent extends AppComponentBase implements OnInit {
    showAddAction :boolean = false
    showActions :boolean = false
    selectionDone : boolean = false
    createOrEditModalRef : BsModalRef
    allRecords : TreeNodeOfGetSycEntityObjectClassificationForViewDto[] =[];
    displayedRecords : TreeNodeOfGetSycEntityObjectClassificationForViewDto[] =[];
    selectedRecords : TreeNodeOfGetSycEntityObjectClassificationForViewDto[] =[];
    savedIds: number[]; // input
    active : boolean = false;
    loading : boolean;
    entityObjectName:string = "Product"
    entityObjectDisplayName:string = "Product Classifications"
    isHiddenToCreateOrEdit : boolean = false
    maxResultCount : number = 10
    skipCount : number = 0
    sortBy : string = "name"
    totalCount : number
    showMoreListDataButton : boolean
    entityId:number
    loadedChildrenRecords : TreeNodeOfGetSycEntityObjectClassificationForViewDto[] = []
    lastSelectedRecords : TreeNodeOfGetSycEntityObjectClassificationForViewDto[] = []
    searchQuery:string
    searchSubj:Subject<string>=new Subject<string>()

    constructor(
        injector: Injector,
        public currentModalRef: BsModalRef,
        private _sycEntityObjectClassificationsServiceProxy: SycEntityObjectClassificationsServiceProxy,
        private _BsModalService :BsModalService
    ) {
        super(injector)
    }

    ngOnInit(): void {
        this.getClassificationsList()
        this.searchSubj
        .pipe(
            debounceTime(300),
            distinctUntilChanged()
        )
        .subscribe(()=>{
            this.resetList()
        })
    }

    openCreateOrEditModal(classification ?:SycEntityObjectClassificationDto,addAsChild:boolean = false) : void {
        let config : ModalOptions = new ModalOptions()
        // data to be shared to the modal
        config.initialState = {
            title:"Edit Classification",
        }
        config.class = 'right-modal slide-right-in'
        this.currentModalRef.setClass('right-modal slide-right-out')
        if( classification ){
            if(addAsChild){
                config.initialState['parentClassification'] = classification
            } else {
                config.initialState['classification'] = classification
            }
        }
        // we may need to hide this modal on opening create/edit modal
        this.isHiddenToCreateOrEdit = true
        this.createOrEditModalRef = this._BsModalService.show(CreateOrEditClassificationDynamicModalComponent,config)
        let subs : Subscription =  this._BsModalService.onHide.subscribe(()=>{
            this.onCreateOrEditDoneHandler()
            subs.unsubscribe()
        })
    }

    onCreateOrEditDoneHandler(){
        this.currentModalRef.setClass('right-modal slide-right-in')
        let data = this.createOrEditModalRef.content
        setTimeout(() => {
            this.isHiddenToCreateOrEdit = false
        }, 500);
        if(data.changesApplied) { // add or edit done
            this.resetList()
        }
    }

    isSelected = (id:number) : boolean => !!this.lastSelectedRecords.filter(item=>item.data.sycEntityObjectClassification.id == id)[0]

    checkItemSelection(item:TreeNodeOfGetSycEntityObjectClassificationForViewDto){
        const itemId = item.data.sycEntityObjectClassification.id
        const selected :boolean = this.isSelected(itemId)
        if ( selected ) this.selectedRecords.push(item)

        if(item?.children?.length){
            item.children.forEach((childItem)=>{
                this.checkItemSelection(childItem)
            })
        }
    }
    close(){
        this.currentModalRef.setClass('right-modal slide-right-out')
        this.selectionDone = false
        this.currentModalRef.hide()
    }
    submitSelection(){
        this.selectionDone = true
        this.currentModalRef.hide()
    }

    addAsNewChild(node:TreeNodeOfGetSycEntityObjectClassificationForViewDto){
        this.openCreateOrEditModal(node.data.sycEntityObjectClassification,true)
    }
    deleteSycEntityObject(node: TreeNodeOfGetSycEntityObjectClassificationForViewDto): void {
        var isConfirmed: Observable<boolean>;
        let message = node.leaf ? "AreYouSure" : "AreYouSure,AllSubClassificationsWillBeDeleted";
    isConfirmed   = this.askToConfirm(message,"");

   isConfirmed.subscribe((res)=>{
      if(res){
                    this._sycEntityObjectClassificationsServiceProxy.delete(node.data.sycEntityObjectClassification.id)
                    .subscribe(() => {
                        if((node as any).parent) {
                            (node as any).parent.children = (node as any).parent.children.filter(item=>item.data.sycEntityObjectClassification.id != node.data.sycEntityObjectClassification.id)
                        } else {
                            this.displayedRecords = this.displayedRecords.filter(item=>item.data.sycEntityObjectClassification.id != node.data.sycEntityObjectClassification.id)
                        }
                        this.notify.success(this.l('SuccessfullyDeleted'));
                    });
                }
            }
        );
    }
    stopPropagation($event){
        $event.stopPropagation() // stop click event bubbling
    }

    getClassificationsList(){
        this.loading = true
        let apiMethod = `getAllWithChildsFor${this.entityObjectName}WithPaging`

        const subs = this._sycEntityObjectClassificationsServiceProxy[apiMethod](
            this.searchQuery,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            [],
            this.entityId,
            this.sortBy,
            this.skipCount,
            this.maxResultCount,
        )
        .pipe(
            finalize(()=>this.loading = false)
        )
        .subscribe((result:{items:TreeNodeOfGetSycEntityObjectClassificationForViewDto[],totalCount:number})=>{
            const isFirstPage  = this.skipCount == 0
            if( isFirstPage ) this.allRecords = []

            let currentLoadedItemsAfterExludingSelections :TreeNodeOfGetSycEntityObjectClassificationForViewDto [] = []
            this.totalCount = result.totalCount;
            const isLastPage = this.skipCount + this.maxResultCount > this.totalCount

            //check selection of the newly added elements
            if(this.savedIds?.length){
                currentLoadedItemsAfterExludingSelections = result.items.filter((item)=>{
                    return !this.savedIds.includes(item.data.sycEntityObjectClassification.id)
                })
                if(currentLoadedItemsAfterExludingSelections.length === 0 && !isLastPage) {
                    return this.showMoreListData()
                }
            } else {
                currentLoadedItemsAfterExludingSelections = result.items
            }

            this.lastSelectedRecords = this.selectedRecords
            if(isFirstPage && !this.searchQuery){
                this.selectedRecords = []
            }
            currentLoadedItemsAfterExludingSelections.map((record)=>{

                const cachedItem : TreeNodeOfGetSycEntityObjectClassificationForViewDto = this.loadedChildrenRecords.filter((selectedRecord:TreeNodeOfGetSycEntityObjectClassificationForViewDto)=>{
                    const isCached : boolean = selectedRecord.data.sycEntityObjectClassification.id == record.data.sycEntityObjectClassification.id
                    return isCached
                })[0]

                const isCached : boolean = !!cachedItem

                if(isCached){
                    record.children = cachedItem.children
                    record.expanded = cachedItem.expanded
                    record.totalChildrenCount = cachedItem.totalChildrenCount;
                    (record as any).partialSelected = (cachedItem as any).partialSelected
                }

                this.checkItemSelection(record)

                return  record
            })

            this.showMoreListDataButton = !isLastPage
            this.active = true;
            this.loading=false;
            this.allRecords.push(...currentLoadedItemsAfterExludingSelections)
            this.displayedRecords = this.allRecords
        })
        this.subscriptions.push(subs)
    }

    loadClassificationsNode($event: { node : TreeNodeOfGetSycEntityObjectClassificationForViewDto }){
        if ($event.node) {
            const loadedCompletely : boolean =  !isNaN($event.node?.totalChildrenCount) && !isNaN($event.node?.children?.length) && $event.node.totalChildrenCount === $event.node.children.length
            if( loadedCompletely ) return
            const parentId = $event.node.data.sycEntityObjectClassification.id
            const subs = this._sycEntityObjectClassificationsServiceProxy.getAllChildsWithPaging(
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                parentId,
                undefined,
                this.entityId,
                this.sortBy,
                0,
                $event.node.totalChildrenCount,
            )
            .pipe(
                finalize(()=>this.loading = false)
            )
            .subscribe((res)=>{
                const node : any = $event.node
                if(!node.parent) {
                    this.cachRecordWithNodes(node)
                }
                if(this.savedIds?.length){
                    res.items = res.items.filter((item)=>{
                        return !this.savedIds.includes(item.data.sycEntityObjectClassification.id)
                    })
                }
                if(!$event.node.children) $event.node.children = []
                $event.node.children.push(...res.items)
            })
            this.subscriptions.push(subs)
        }
    }
    cachRecordWithNodes(node:TreeNodeOfGetSycEntityObjectClassificationForViewDto){
        const alreadyExit : boolean = !!this.loadedChildrenRecords.filter((elem)=>{
            return elem.data.sycEntityObjectClassification.id == node.data.sycEntityObjectClassification.id
        }).length
        if( !alreadyExit ){
            this.loadedChildrenRecords.push(node)
        }
    }
    showMoreListData() {
        if(!this.showMoreListDataButton) this.showMoreListDataButton = true
        this.skipCount += this.maxResultCount
        this.getClassificationsList()
    }

    onFilter(){
        this.searchSubj.next(this.searchQuery)
    }
    resetList(){
        this.skipCount = 0
        this.getClassificationsList()
    }

}
