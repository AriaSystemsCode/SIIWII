import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';

import {
    FormControl
} from '@angular/forms';

import {
    FilterMetaData
} from '../models/FilterMetaData.model';

@Component({
    selector: 'app-tree-multi-selection-filter',
    templateUrl: './tree-multi-selection-filter.component.html',
    styleUrls: [
        './tree-multi-selection-filter.component.scss'
    ]
})
export class TreeMultiSelectionFilterComponent
    implements OnInit, OnChanges {

    @Input()
    title: string;

    @Input()
    filterMetaData: FilterMetaData<any[]>;

    @Input()
    formContol: FormControl;

    @Output()
    onChange:
        EventEmitter<boolean> =
        new EventEmitter<boolean>();

    @Output()
    onLoadData:
        EventEmitter<any> =
        new EventEmitter<any>();

    @Output()
    onLoadNode:
        EventEmitter<any> =
        new EventEmitter<any>();

    selections: any[] = [];

    collapseListDataCollapseButton =
        false;

    showMoreListDataButton =
        false;

    constructor() { }

    ngOnInit(): void {

        this.subscribeToFormControlChange();

        // Try initial restore
        this.restoreSelectionFromForm();
    }

    ngOnChanges(
        changes: SimpleChanges
    ): void {

        if (
            changes?.filterMetaData &&
            this.filterMetaData
        ) {
            this.onLoadData.emit();
        }

        if (
            changes?.formContol
        ) {
            this.restoreSelectionFromForm();
        }
    }


    onSelectionChangeHandler(
        event: any
    ): void {

        this.formContol.setValue(
            this.selections
        );

        this.onChange.emit(true);
    }

    restoreSelectionFromForm(): void {

        if (
            !this.formContol ||
            !this.filterMetaData
                ?.displayedList
                ?.length
        ) {
            return;
        }

        const formValue =
            this.formContol.value;

        if (
            !Array.isArray(formValue) ||
            formValue.length === 0
        ) {
            this.selections = [];
            return;
        }

        const selectedIds =
            this.extractIds(
                formValue
            );

        if (
            !selectedIds.length
        ) {
            this.selections = [];
            return;
        }

        const matchedNodes =
            this.findNodesByIds(
                this.filterMetaData
                    .displayedList,
                selectedIds
            );

        this.selections = [
            ...matchedNodes
        ];
    }

    private extractIds(
        value: any[]
    ): number[] {

        return (value || [])
            .map(
                item => {

                    if (
                        typeof item ===
                        'number'
                    ) {
                        return item;
                    }

                    if (
                        typeof item ===
                        'string'
                    ) {
                        return Number(
                            item
                        );
                    }

                    /**
                     * Classification node
                     */
                    const classificationId =
                        item?.data
                            ?.sycEntityObjectClassification
                            ?.id;

                    if (
                        classificationId !==
                        undefined &&
                        classificationId !==
                        null
                    ) {
                        return Number(
                            classificationId
                        );
                    }

                    /**
                     * Category node
                     */
                    const categoryId =
                        item?.data
                            ?.sycEntityObjectCategory
                            ?.id;

                    if (
                        categoryId !==
                        undefined &&
                        categoryId !==
                        null
                    ) {
                        return Number(
                            categoryId
                        );
                    }

                    /**
                     * Generic fallback
                     */
                    return Number(
                        item?.value ??
                        item?.id
                    );
                }
            )
            .filter(
                id =>
                    id !== null &&
                    id !== undefined &&
                    !isNaN(id)
            );
    }

    private findNodesByIds(
        nodes: any[],
        ids: number[]
    ): any[] {

        const result: any[] = [];

        const visit = (
            list: any[]
        ) => {

            (list || [])
                .forEach(
                    node => {

                        const nodeId =
                            this.getNodeId(
                                node
                            );

                        if (
                            nodeId !== null &&
                            ids.includes(
                                nodeId
                            )
                        ) {
                            result.push(
                                node
                            );
                        }

                        if (
                            node?.children
                                ?.length
                        ) {
                            visit(
                                node.children
                            );
                        }
                    }
                );
        };

        visit(nodes);

        return result;
    }

    private getNodeId(
        node: any
    ): number | null {

        const classificationId =
            node?.data
                ?.sycEntityObjectClassification
                ?.id;

        if (
            classificationId !==
            undefined &&
            classificationId !==
            null
        ) {
            return Number(
                classificationId
            );
        }

        const categoryId =
            node?.data
                ?.sycEntityObjectCategory
                ?.id;

        if (
            categoryId !==
            undefined &&
            categoryId !==
            null
        ) {
            return Number(
                categoryId
            );
        }

        const genericId =
            node?.data?.id ??
            node?.id ??
            node?.value;

        if (
            genericId ===
            undefined ||
            genericId ===
            null
        ) {
            return null;
        }

        return Number(
            genericId
        );
    }


    onListLoadCallback(
        result: {
            items: any[];
            totalCount: number;
        }
    ): void {

        this.filterMetaData.list.push(
            ...(result?.items || [])
        );

        this.filterMetaData
            .displayedList = [
                ...this.filterMetaData
                    .list
            ];

        this.filterMetaData
            .listTotalCount =
            result?.totalCount ?? 0;

        this.showMoreListDataButton =
            this.filterMetaData
                .list.length <
            this.filterMetaData
                .listTotalCount;

        this.restoreSelectionFromForm();
    }


    loadNode(
        event: {
            node: any;
        }
    ): void {

        if (!event?.node) {
            return;
        }

        this.onLoadNode.emit(
            event.node
        );

        setTimeout(() => {
            this.restoreSelectionFromForm();
        });
    }

    restoreSelection(): void {
        this.restoreSelectionFromForm();
    }

    triggerListCollapse(): void {

        this.collapseListDataCollapseButton =
            !this
                .collapseListDataCollapseButton;

        if (
            this
                .collapseListDataCollapseButton
        ) {

            this.filterMetaData
                .displayedList =
                this.filterMetaData.list;

        } else {

            this.filterMetaData
                .displayedList =
                this.filterMetaData
                    .list.slice(
                        0,
                        this.filterMetaData
                            .collapsedDisplayedListCount
                    );

  
            this.restoreSelectionFromForm();

            return;
        }

        if (
            this.showMoreListDataButton &&
            this.filterMetaData
                .list.length ===
            this.filterMetaData
                .collapsedDisplayedListCount
        ) {
            this.showMoreListData();
        }

        this.restoreSelectionFromForm();
    }

    showMoreListData(): void {

        if (
            !this
                .showMoreListDataButton
        ) {
            this.showMoreListDataButton =
                true;
        }

        this.filterMetaData
            .listSkipCount +=
            this.filterMetaData
                .listMaxResultCount;

        if (
            this.filterMetaData
                .listMaxResultCount ===
            this.filterMetaData
                .collapsedDisplayedListCount
        ) {
            this.filterMetaData
                .listMaxResultCount =
                10;
        }

        this.onLoadData.emit();
    }

    resetSelection(): void {
        this.selections = [];
    }

    subscribeToFormControlChange():
        void {

        this.formContol
            .valueChanges
            .subscribe(
                value => {

                    if (
                        !value ||
                        value.length === 0
                    ) {
                        this.resetSelection();
                        return;
                    }

                    this.restoreSelectionFromForm();
                }
            );
    }
}