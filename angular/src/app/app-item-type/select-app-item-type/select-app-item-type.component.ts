import { Component, Injector, OnInit } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    SycEntityObjectTypesServiceProxy,
    TreeNodeOfGetSycEntityObjectTypeForViewDto,
} from "@shared/service-proxies/service-proxies";
import { BsModalRef } from "ngx-bootstrap/modal";
import { finalize } from "rxjs/operators";

@Component({
    selector: "app-select-app-item-type",
    templateUrl: "./select-app-item-type.component.html",
    styleUrls: ["./select-app-item-type.component.scss"],
})
export class SelectAppItemTypeComponent
    extends AppComponentBase
    implements OnInit
{
    savedId: number;
    selectionDone: boolean = false;
    createOrEditModalRef: BsModalRef;
    allRecords: TreeNodeOfGetSycEntityObjectTypeForViewDto[] = [];
    displayedRecords: TreeNodeOfGetSycEntityObjectTypeForViewDto[] = [];
    selectedRecord: TreeNodeOfGetSycEntityObjectTypeForViewDto;
    active: boolean = false;
    saving: boolean = false;
    loading: boolean;
    skipCount: number = 0;
    maxResultCount: number = 10;
    sortBy: string = "name";
    totalCount: number;
    showMoreListDataButton: boolean;
    lastSelection: TreeNodeOfGetSycEntityObjectTypeForViewDto;

    constructor(
        injector: Injector,
        public currentModalRef: BsModalRef,
        private _sycEntityObjectTypesServiceProxy: SycEntityObjectTypesServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.getAppItemTypesList();
    }

    close() {
        this.currentModalRef.setClass("right-modal slide-right-out");
        this.selectionDone = false;
        this.currentModalRef.hide();
    }

    submitSelection() {
        this.selectionDone = true;
        this.currentModalRef.hide();
    }
    loadedChildrenRecords: TreeNodeOfGetSycEntityObjectTypeForViewDto[] = [];
    lastSelectedRecord: TreeNodeOfGetSycEntityObjectTypeForViewDto;
    getAppItemTypesList(searchQuery?: string) {
        console.log(">>", searchQuery)
        this.loading = true;
        const subs = this._sycEntityObjectTypesServiceProxy
            .getAllWithChildsForProductWithPaging(
                searchQuery,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                this.sortBy,
                this.skipCount,
                this.maxResultCount
            )
            .pipe(finalize(() => (this.loading = false)))
            .subscribe((result) => {
                if (searchQuery !== undefined) this.allRecords = [];
                result.items.map((record) => {
                    // const cachedItem : TreeNodeOfGetSycEntityObjectTypeForViewDto = this.loadedChildrenRecords.filter((selectedRecord:TreeNodeOfGetSycEntityObjectTypeForViewDto)=>{
                    //     const isCached : boolean = selectedRecord.data.sycEntityObjectType.id == record.data.sycEntityObjectType.id
                    //     return isCached
                    // })[0]
                    // const isCached : boolean = !!cachedItem

                    // if(isCached){
                    //     record.children = cachedItem.children
                    //     record.expanded = cachedItem.expanded
                    //     record.totalChildrenCount = cachedItem.totalChildrenCount;
                    //     (record as any).partialSelected = (cachedItem as any).partialSelected
                    // }

                    this.checkItemSelection(record);

                    return record;
                });
                this.allRecords.push(...result.items);
                this.lastSelectedRecord = this.selectedRecord;
                this.selectedRecord = undefined;
                this.displayedRecords = this.allRecords;
                this.totalCount = result.totalCount;
                this.showMoreListDataButton =
                    this.allRecords.length < this.totalCount;
                this.active = true;
                this.loading = false;
            });
        this.subscriptions.push(subs);
    }

    onNodeSelect(value: TreeNodeOfGetSycEntityObjectTypeForViewDto) {
        console.log(value.node.data.sycEntityObjectType.id);
    }

    checkItemSelection(item: TreeNodeOfGetSycEntityObjectTypeForViewDto) {
        const itemId = item.data.sycEntityObjectType.id;
        if (itemId == this.savedId) this.selectedRecord = item;
        if (item?.children?.length) {
            item.children.forEach((childItem) => {
                this.checkItemSelection(childItem);
            });
        }
    }

    loadAppItemTypesNode($event: {
        node: TreeNodeOfGetSycEntityObjectTypeForViewDto;
    }) {
        if ($event.node) {
            const loadedCompletely: boolean =
                !isNaN($event.node?.totalChildrenCount) &&
                !isNaN($event.node?.children?.length) &&
                $event.node.totalChildrenCount === $event.node.children.length;
            if (loadedCompletely) return;
            const parentId = $event.node.data.sycEntityObjectType.id;
            // const subs = this._sycEntityObjectTypesServiceProxy.getAllWithChildsForProductWithPaging(
            //     undefined,
            //     undefined,
            //     undefined,
            //     undefined,
            //     undefined,
            //     undefined,
            //     parentId,
            //     this.sortBy,
            //     undefined,
            //     undefined,
            // )
            const subs = this._sycEntityObjectTypesServiceProxy
                .getAllChilds(parentId)
                .pipe(finalize(() => (this.loading = false)))
                .subscribe((res) => {
                    const node: any = $event.node;
                    // if(!node.parent) {
                    //     this.cachRecordWithNodes(node)
                    // }
                    if (this.savedId) {
                        res.forEach((item) => {
                            if (
                                item.data.sycEntityObjectType.id == this.savedId
                            )
                                this.checkItemSelection(item);
                        });
                    }
                    if (!$event.node.children) $event.node.children = [];
                    $event.node.children.push(...res);
                    $event.node.totalChildrenCount = res.length;
                    // $event.node.totalChildrenCount = res.totalCount
                });
            this.subscriptions.push(subs);
        }
    }
    cachRecordWithNodes(node: TreeNodeOfGetSycEntityObjectTypeForViewDto) {
        const alreadyExit: boolean = !!this.loadedChildrenRecords.filter(
            (elem) => {
                return (
                    elem.data.sycEntityObjectType.id ==
                    node.data.sycEntityObjectType.id
                );
            }
        ).length;
        if (!alreadyExit) {
            this.loadedChildrenRecords.push(node);
        }
    }
    preventSelectNonLeaf(node: TreeNodeOfGetSycEntityObjectTypeForViewDto) {
        if (
            this.selectedRecord?.data?.sycEntityObjectType?.id ==
            node?.data?.sycEntityObjectType?.id
        ) {
            node.expanded = !node.expanded;
        }
        this.selectedRecord = this.lastSelection;
    }
    showMoreListData() {
        if (!this.showMoreListDataButton) this.showMoreListDataButton = true;
        this.skipCount += this.maxResultCount;
        this.getAppItemTypesList();
    }
    onSelectionChangeHandler(node: TreeNodeOfGetSycEntityObjectTypeForViewDto) {
        if (node && node.leaf != true) {
            this.loadAppItemTypesNode({ node });
            this.preventSelectNonLeaf(node);
            return;
        }
        this.lastSelection = this.selectedRecord;
    }

    filterAppitemTypes(
        searchQuery: string,
        list: TreeNodeOfGetSycEntityObjectTypeForViewDto[]
    ) {
        const filterList: TreeNodeOfGetSycEntityObjectTypeForViewDto[] = [];
        list.forEach((node) => {
            if (
                !node?.label
                    ?.toLowerCase()
                    ?.includes(searchQuery?.toLowerCase())
            )
                return;
            const item: TreeNodeOfGetSycEntityObjectTypeForViewDto =
                new TreeNodeOfGetSycEntityObjectTypeForViewDto();
            item.init({ ...node, children: undefined });
            if (item?.children)
                item.children = this.filterAppitemTypes(
                    searchQuery,
                    node.children
                );
            filterList.push(item);
        });
        return filterList;
    }

    onFilter(searchQuery: string) {
        this.skipCount = 0;
        this.getAppItemTypesList(searchQuery);
    }
}
