import { Component, Injector, Input, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppItemsServiceProxy, RecommandedOrAdditional } from '@shared/service-proxies/service-proxies';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import {
    TreeNodeOfGetSycEntityObjectCategoryForViewDto,
} from "@shared/service-proxies/service-proxies";
export class TreeItem extends TreeNodeOfGetSycEntityObjectCategoryForViewDto {
    partialSelected: boolean;
    parent: TreeNodeOfGetSycEntityObjectCategoryForViewDto;
}
@Component({
    selector: 'app-select-relatedItem-dynamic-modal',
    templateUrl: './select-relatedItem-dynamic-modal.component.html',
    styleUrls: ['./select-relatedItem-dynamic-modal.component.scss']
})
export class SelectRelatedItemDynamicModalComponent extends AppComponentBase implements OnInit {
    showAddAction: boolean = false;
    showActions: boolean = false;
    selectionDone: boolean = false;
    createOrEditModalRef: BsModalRef;
    allRecords: TreeNodeOfGetSycEntityObjectCategoryForViewDto[] = [];
    displayedRecords: TreeNodeOfGetSycEntityObjectCategoryForViewDto[] = [];
    selectedRecords: TreeNodeOfGetSycEntityObjectCategoryForViewDto[] = [];
    savedIds: number[]; // input
    active: boolean = false;
    loading: boolean;
    entityObjectName: string = "Product";
    entityObjectDisplayName: string = "Related Product"
    isDepartment: boolean = false;
    isHiddenToCreateOrEdit: boolean = false;
    maxResultCount: number = 10;
    skipCount: number = 0;
    sortBy: string = "name";
    totalCount: number;
    showMoreListDataButton: boolean;
    entityId: number;
    loadedChildrenRecords: TreeNodeOfGetSycEntityObjectCategoryForViewDto[] =
        [];
    lastSelectedRecords: TreeNodeOfGetSycEntityObjectCategoryForViewDto[] = [];
    searchQuery?: string;
    searchSubj: Subject<string> = new Subject<string>();
    currentLang: string = 'en';
    isArabic: boolean = false;
    constructor(
        injector: Injector,
        public currentModalRef: BsModalRef,
        private _appItemsServiceProxy: AppItemsServiceProxy,
        private _BsModalService: BsModalService
    ) {
        super(injector)
    }

    ngOnInit(): void {
        this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
        this.currentLang == 'ar' || this.currentLang == 'ar-EG'  ? this.isArabic = true : this.isArabic = false
        this.getRelatedItemList();
        this.searchSubj
            .pipe(debounceTime(300), distinctUntilChanged())
            .subscribe(() => {
                this.resetList();
            });
    }

    getRelatedItemList(Changed?: Boolean) {
        this.loading = true;
        const subs = this._appItemsServiceProxy.getAllWithChildsExceptSelectedForProductWithPaging(
            this.searchQuery,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            this.entityId,
            undefined,
            undefined,
            undefined,
            this.sortBy,
            this.skipCount,
            this.maxResultCount
        )
            .pipe(finalize(() => (this.loading = false)))
            .subscribe(
                (
                        result: {
                            items: TreeNodeOfGetSycEntityObjectCategoryForViewDto[];
                            totalCount: number;
                        }
                ) => {
                    const isFirstPage = this.skipCount == 0;
                    if (isFirstPage) this.allRecords = [];

                    let currentLoadedItemsAfterExludingSelections: TreeNodeOfGetSycEntityObjectCategoryForViewDto[] =
                        [];
                    this.totalCount = result.totalCount;
                    // number of items excluded from current page - savedIds
                const excludedFromCurrentPage = this.savedIds?.length
                    ? result.items.filter(i =>
                        this.savedIds.includes(i.data.sycEntityObjectCategory.id)
                    ).length
                    : 0;

                // total visible items after exclusion
                const effectiveTotal = this.totalCount - excludedFromCurrentPage;

                // correct last page check based on visible items
                // const isLastPage = this.skipCount + this.maxResultCount > this.totalCount
                const isLastPage =
                    this.skipCount + this.maxResultCount >= effectiveTotal;


                    //check selection of the newly added elements
                    if (this.savedIds?.length) {
                        currentLoadedItemsAfterExludingSelections =
                            result.items.filter((item) => {
                                return !this.savedIds.includes(
                                    item.data.sycEntityObjectCategory.id
                                );
                            });
                        if (
                            currentLoadedItemsAfterExludingSelections.length ===
                            0 &&
                            !isLastPage
                        ) {
                            return this.showMoreListData();
                        }
                    } else {
                        currentLoadedItemsAfterExludingSelections =
                            result.items;
                    }

                    const previousSelectedRecords = [...this.selectedRecords];
                    const currentPageItemIds = new Set(
                        currentLoadedItemsAfterExludingSelections.map(
                            (item) => item.data.sycEntityObjectCategory.id
                        )
                    );

                    this.lastSelectedRecords = previousSelectedRecords;
                    this.selectedRecords = previousSelectedRecords.filter(
                        (item) =>
                            !currentPageItemIds.has(
                                item.data.sycEntityObjectCategory.id
                            )
                    );

                    currentLoadedItemsAfterExludingSelections.map((record) => {
                        const cachedItem: TreeNodeOfGetSycEntityObjectCategoryForViewDto =
                            this.loadedChildrenRecords.filter(
                                (
                                    selectedRecord: TreeNodeOfGetSycEntityObjectCategoryForViewDto
                                ) => {
                                    const isCached: boolean =
                                        selectedRecord.data
                                            .sycEntityObjectCategory.id ==
                                        record.data.sycEntityObjectCategory.id;
                                    return isCached;
                                }
                            )[0];

                        const isCached: boolean = !!cachedItem;

                        if (isCached && !Changed) {
                            record.children = cachedItem.children;
                            record.expanded = cachedItem.expanded;
                            record.totalChildrenCount =
                                cachedItem.totalChildrenCount;
                            (record as any).partialSelected = (
                                cachedItem as any
                            ).partialSelected;
                        }

                        this.checkItemSelection(record);

                        return record;
                    });

                    this.showMoreListDataButton = !isLastPage;
                    this.active = true;
                    this.loading = false;
                    this.allRecords.push(
                        ...currentLoadedItemsAfterExludingSelections
                    );
                    this.displayedRecords = this.allRecords;
                }
            );
        this.subscriptions.push(subs);
    }

    isSelected = (id: number): boolean =>
        !!this.lastSelectedRecords.filter(
            (item) => item.data.sycEntityObjectCategory.id == id
        )[0];

    checkItemSelection(item: TreeNodeOfGetSycEntityObjectCategoryForViewDto) {
        const itemId = item.data.sycEntityObjectCategory.id;
        const selected: boolean = this.isSelected(itemId);

        if (!selected) {
            return; // If the current node is not selected, return without further processing
        }

        if (!item.children || item.children.length === 0) {
            // If the node has no children and is selected, add it directly to the selected records
            this.addSelectedRecord(item);
        } else {
            // If the node has children, recursively check selection for child nodes
            let allChildrenSelected = true;
            item.children.forEach((childItem) => {
                if (!this.isSelected(childItem.data.sycEntityObjectCategory.id)) {
                    allChildrenSelected = false;
                    return; // Exit forEach loop early if any child is not selected
                }
            });

            if (!allChildrenSelected) {
                // If not all children are selected, add the parent node to the selected records
                this.addSelectedRecord(item);
            }

            // Recursively check selection for child nodes
            item.children.forEach((childItem) => {
                this.checkItemSelection(childItem);
            });
        }
    }

    private addSelectedRecord(
        item: TreeNodeOfGetSycEntityObjectCategoryForViewDto
    ) {
        const itemId = item.data.sycEntityObjectCategory.id;
        const alreadyAdded = this.selectedRecords.some(
            (record) => record.data.sycEntityObjectCategory.id === itemId
        );
        if (!alreadyAdded) {
            this.selectedRecords.push(item);
        }
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

    itemPath: string = "";
    nodeSelect(event: any) {
        this.itemPath = this.getPath(event.node);
        console.log(event);
    }

    getPath(item: any): any {
        if (!item.parent) {
            return item.label;
        }
        // Recursively build the path including all ancestor nodes
        const parentPath = this.getPath(item.parent);
        return parentPath ? parentPath + "-" + item.label : item.label;
    }

    stopPropagation($event) {
        $event.stopPropagation(); // stop click event bubbling
    }

    loadRelatedItemNode($event: {
        node: TreeNodeOfGetSycEntityObjectCategoryForViewDto;
    }) {
        if ($event.node) {
            const loadedCompletely: boolean =
                !isNaN($event.node?.totalChildrenCount) &&
                !isNaN($event.node?.children?.length) &&
                $event.node.totalChildrenCount === $event.node.children.length;
            if (loadedCompletely) return;
            const parentId = $event.node.data.sycEntityObjectCategory.id;

            const subs = this._appItemsServiceProxy.getAllWithChildsExceptSelectedForProductWithPaging(
                this.searchQuery,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                this.entityId,
                undefined,
                undefined,
                undefined,
                this.sortBy,
                this.skipCount,
                this.maxResultCount
            )
                .pipe(finalize(() => (this.loading = false)))
                .subscribe((res) => {
                    const node: any = $event.node;
                    if (!node.parent) {
                        this.cachRecordWithNodes(node);
                    }
                    if (this.savedIds?.length) {
                        res.items = res.items.filter((item) => {
                            return !this.savedIds.includes(
                                item.data.sycEntityObjectCategory.id
                            );
                        });
                    }
                    if (!$event.node.children) $event.node.children = [];
                  $event.node.children.push(...res.items);
                });
            this.subscriptions.push(subs);
        }
    }
    cachRecordWithNodes(node: TreeNodeOfGetSycEntityObjectCategoryForViewDto) {
        const alreadyExit: boolean = !!this.loadedChildrenRecords.filter(
            (elem) => {
                return (
                    elem.data.sycEntityObjectCategory.id ==
                    node.data.sycEntityObjectCategory.id
                );
            }
        ).length;
        if (!alreadyExit) {
            this.loadedChildrenRecords.push(node);
        }
    }
    showMoreListData() {
        if (!this.showMoreListDataButton) this.showMoreListDataButton = true;
        this.skipCount += this.maxResultCount;
        this.getRelatedItemList();
    }

    filterRelatedItem(
        searchQuery: string,
        list: TreeNodeOfGetSycEntityObjectCategoryForViewDto[]
    ) {
        const filterList: TreeNodeOfGetSycEntityObjectCategoryForViewDto[] = [];
        list.forEach((node) => {
            if (
                !node?.label
                    ?.toLowerCase()
                    ?.includes(searchQuery?.toLowerCase())
            )
                return;
            const item: TreeNodeOfGetSycEntityObjectCategoryForViewDto =
                new TreeNodeOfGetSycEntityObjectCategoryForViewDto();
            item.init({ ...node, children: undefined });
            if (item?.children)
                item.children = this.filterRelatedItem(
                    searchQuery,
                    node.children
                );
            filterList.push(item);
        });
        return filterList;
    }

    onFilter() {
        this.searchSubj.next(this.searchQuery);
    }
    resetList(Changed?: boolean) {
        this.skipCount = 0;
        this.getRelatedItemList(Changed);
    }

}
