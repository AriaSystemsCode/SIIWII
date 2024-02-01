import { Component, Injector, Input, OnDestroy, OnInit } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    CreateOrEditSycEntityObjectCategoryDto,
    SycEntityObjectCategoriesServiceProxy,
    SycEntityObjectCategoryDto,
    TreeNodeOfGetSycEntityObjectCategoryForViewDto,
} from "@shared/service-proxies/service-proxies";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { Observable, Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged, finalize } from "rxjs/operators";
import { CreateOrEditCategoryDynamicModalComponent } from "./create-or-edit-category-dynamic-modal.component";
export class TreeItem extends TreeNodeOfGetSycEntityObjectCategoryForViewDto {
    partialSelected: boolean;
    parent: TreeNodeOfGetSycEntityObjectCategoryForViewDto;
}

@Component({
    selector: "app-select-categories-dynamic-modal",
    templateUrl: "./select-categories-dynamic-modal.component.html",
    styleUrls: ["./select-categories-dynamic-modal.component.scss"],
})
export class SelectCategoriesDynamicModalComponent
    extends AppComponentBase
    implements OnInit
{
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
    entityObjectDisplayName: string = "Product Categories";
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
    constructor(
        injector: Injector,
        public currentModalRef: BsModalRef,
        private _sycEntityObjectCategoriesServiceProxy: SycEntityObjectCategoriesServiceProxy,
        private _BsModalService: BsModalService
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.getCategoriesList();
        this.searchSubj
            .pipe(debounceTime(300), distinctUntilChanged())
            .subscribe(() => {
                this.resetList();
            });
    }

    openCreateOrEditModal({
        category,
        parentCategory,
        addAsChild = false,
    }: {
        parentCategory?: SycEntityObjectCategoryDto;
        category?: SycEntityObjectCategoryDto;
        addAsChild?: boolean;
    } = {}): void {
        let config: ModalOptions = new ModalOptions();
        // data to be shared to the modal
        config.initialState = {
            title: "Edit Category",
        };
        config.class = "right-modal slide-right-in";
        config.backdrop = true;
        config.ignoreBackdropClick = true;
        this.currentModalRef.setClass("right-modal slide-right-out");

        let initialModalData: Partial<CreateOrEditCategoryDynamicModalComponent> =
            {};

        if (addAsChild) {
            // add new child
            category = new CreateOrEditSycEntityObjectCategoryDto();
            if (parentCategory) category.parentId = parentCategory.id;
        } else {
            if (!category)
                category = new CreateOrEditSycEntityObjectCategoryDto();
            if (parentCategory) category.parentId = parentCategory.id;
        }
        if (parentCategory)
            initialModalData.parentCategory = JSON.parse(
                JSON.stringify(parentCategory)
            );
        initialModalData.category = JSON.parse(JSON.stringify(category));

        config.initialState = initialModalData;
        this.isHiddenToCreateOrEdit = true;
        this.createOrEditModalRef = this._BsModalService.show(
            CreateOrEditCategoryDynamicModalComponent,
            config
        );
        let subs: Subscription = this._BsModalService.onHide.subscribe(() => {
            this.onCreateOrEditDoneHandler();
            subs.unsubscribe();
        });
    }

    onCreateOrEditDoneHandler() {
        this.currentModalRef.setClass("right-modal slide-right-in");
        let data = this.createOrEditModalRef.content;
        setTimeout(() => {
            this.isHiddenToCreateOrEdit = false;
        }, 500);
        if (data.changesApplied) {
            // add or edit done
            this.resetList(true);
        }
    }

    isSelected = (id: number): boolean =>
        !!this.lastSelectedRecords.filter(
            (item) => item.data.sycEntityObjectCategory.id == id
        )[0];

    checkItemSelection(item: TreeNodeOfGetSycEntityObjectCategoryForViewDto) {
        const itemId = item.data.sycEntityObjectCategory.id;
        const selected: boolean = this.isSelected(itemId);
        if (selected) this.selectedRecords.push(item);

        if (item?.children?.length) {
            item.children.forEach((childItem) => {
                this.checkItemSelection(childItem);
            });
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

    addAsNewChild(node: TreeNodeOfGetSycEntityObjectCategoryForViewDto) {
        this.openCreateOrEditModal({
            parentCategory: node.data.sycEntityObjectCategory,
            addAsChild: true,
        });
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
        return this.getPath(item.parent) + "-" + item.label;
    }

    editCategory(node) {
        let category = node.data.sycEntityObjectCategory;
        let parentCategory = node.parent
            ? node.parent.data.sycEntityObjectCategory
            : undefined;
        this.openCreateOrEditModal({ category, parentCategory });
    }
    deleteSycEntityObject(
        node: TreeNodeOfGetSycEntityObjectCategoryForViewDto
    ): void {
        var isConfirmed: Observable<boolean>;
        let message = node.leaf
            ? "AreYouSure"
            : "AreYouSure,AllSubCategoriesWillBeDeleted";
        isConfirmed = this.askToConfirm(message, "");

        isConfirmed.subscribe((res) => {
            if (res) {
                this._sycEntityObjectCategoriesServiceProxy
                    .delete(node.data.sycEntityObjectCategory.id)
                    .subscribe(() => {
                        if ((node as any).parent) {
                            (node as any).parent.children = (
                                node as any
                            ).parent.children.filter(
                                (item) =>
                                    item.data.sycEntityObjectCategory.id !=
                                    node.data.sycEntityObjectCategory.id
                            );

                            if ((node as any).parent.children.length === 0) {
                                (node as any).parent.children = null; // or parentNode.children = [];
                                (node as any).parent.leaf = true;
                            }
                        } else {
                            this.displayedRecords =
                                this.displayedRecords.filter(
                                    (item) =>
                                        item.data.sycEntityObjectCategory.id !=
                                        node.data.sycEntityObjectCategory.id
                                );
                        }
                        this.notify.success(this.l("SuccessfullyDeleted"));
                    });
            }
        });
    }
    stopPropagation($event) {
        $event.stopPropagation(); // stop click event bubbling
    }
    getCategoriesList(Changed?:Boolean) {
        this.loading = true;
        let apiMethod = `getAllWithChildsFor${this.entityObjectName}WithPaging`;
        const subs = this._sycEntityObjectCategoriesServiceProxy[apiMethod](
            this.searchQuery,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            this.isDepartment,
            this.entityId,
            [],
            this.sortBy,
            this.skipCount,
            this.maxResultCount
        )
            .pipe(finalize(() => (this.loading = false)))
            .subscribe(
                (result: {
                    items: TreeNodeOfGetSycEntityObjectCategoryForViewDto[];
                    totalCount: number;
                }) => {
                    const isFirstPage = this.skipCount == 0;
                    if (isFirstPage) this.allRecords = [];

                    let currentLoadedItemsAfterExludingSelections: TreeNodeOfGetSycEntityObjectCategoryForViewDto[] =
                        [];
                    this.totalCount = result.totalCount;
                    const isLastPage =
                        this.skipCount + this.maxResultCount > this.totalCount;

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
                    this.lastSelectedRecords = this.selectedRecords;
                    if (isFirstPage && !this.searchQuery) {
                        this.selectedRecords = [];
                    }
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

    loadCategoriesNode($event: {
        node: TreeNodeOfGetSycEntityObjectCategoryForViewDto;
    }) {
        if ($event.node) {
            const loadedCompletely: boolean =
                !isNaN($event.node?.totalChildrenCount) &&
                !isNaN($event.node?.children?.length) &&
                $event.node.totalChildrenCount === $event.node.children.length;
            if (loadedCompletely) return;
            const parentId = $event.node.data.sycEntityObjectCategory.id;
            console.log(
                ">>",
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                parentId,
                this.isDepartment,
                this.entityId,
                undefined,
                this.sortBy,
                0,
                $event.node.totalChildrenCount
            );
            const subs = this._sycEntityObjectCategoriesServiceProxy
                .getAllChildsWithPaging(
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    parentId,
                    this.isDepartment,
                    this.entityId,
                    undefined,
                    this.sortBy,
                    0,
                    $event.node.totalChildrenCount
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
        this.getCategoriesList();
    }

    filterCategories(
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
                item.children = this.filterCategories(
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
    resetList(Changed?:boolean) {
        this.skipCount = 0;
        this.getCategoriesList(Changed);
    }
}
