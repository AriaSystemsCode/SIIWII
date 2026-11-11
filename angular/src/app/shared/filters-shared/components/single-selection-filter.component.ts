import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';

import {
    AbstractControl
} from '@angular/forms';

import {
    Subscription
} from 'rxjs';

import {
    FilterMetaData
} from '../models/FilterMetaData.model';


@Component({
    selector:
        'app-single-selection-filter',

    templateUrl:
        './single-selection-filter.component.html',

    styleUrls: [
        './single-selection-filter.component.scss'
    ]
})
export class SingleSelectionFilterComponent
    implements OnInit, OnChanges, OnDestroy {

    @Input()
    title: string;

    @Input()
    filterMetaData:
        FilterMetaData<any[]>;

    @Input()
    formContol:
        AbstractControl;

    @Output()
    onChange =
        new EventEmitter<boolean>();

    @Output()
    onLoadData =
        new EventEmitter<any>();

    selection:
        boolean | number | string | undefined =
        undefined;


    collapseListDataCollapseButton =
        false;

    showMoreListDataButton =
        false;


    private formControlSub?:
        Subscription;

    ngOnInit(): void {

        this.restoreSelectionFromForm();

        this.subscribeToFormControlChange();
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

            if (
                !changes.formContol
                    .firstChange
            ) {

                this.subscribeToFormControlChange();
            }
        }
    }



    restoreSelectionFromForm(): void {

        if (!this.formContol) {

            this.selection =
                undefined;

            return;
        }


        const value =
            this.formContol.value;

        if (
            value === null ||
            value === undefined ||
            value === ''
        ) {

            this.selection =
                undefined;

            return;
        }

        if (
            value === true ||
            value === false
        ) {

            this.selection =
                value;

            return;
        }


        if (
            value === 'true'
        ) {

            this.selection =
                true;

            return;
        }


        if (
            value === 'false'
        ) {

            this.selection =
                false;

            return;
        }


        this.selection =
            value;
    }


    onSelectionChangeHandler(
        value: any
    ): void {

        this.selection =
            value;


        this.formContol?.setValue(
            value
        );


        this.onChange.emit(
            true
        );
    }

    onListLoadCallback(
        result: {
            items: any[];
            totalCount?: number;
        }
    ): void {

        if (!this.filterMetaData) {
            return;
        }


        if (!this.filterMetaData.list) {

            this.filterMetaData.list =
                [];
        }

        const existingValues =
            new Set(
                this.filterMetaData
                    .list
                    .map(
                        item =>
                            String(
                                item?.value
                            )
                    )
            );


        const newItems =
            (
                result?.items ||
                []
            )
                .filter(
                    item =>
                        !existingValues.has(
                            String(
                                item?.value
                            )
                        )
                );


        this.filterMetaData
            .list.push(
                ...newItems
            );


        this.filterMetaData
            .displayedList = [
                ...this.filterMetaData
                    .list
            ];


        this.filterMetaData
            .listTotalCount =
            result?.totalCount ??
            this.filterMetaData
                .list.length;


        this.showMoreListDataButton =
            this.filterMetaData
                .list.length <
            this.filterMetaData
                .listTotalCount;

        this.restoreSelectionFromForm();
    }

    private subscribeToFormControlChange():
        void {

        this.formControlSub
            ?.unsubscribe();


        if (!this.formContol) {
            return;
        }


        this.formControlSub =
            this.formContol
                .valueChanges
                .subscribe(
                    () => {
                        this.restoreSelectionFromForm();
                    }
                );
    }

    get radioGroupName():
        string {
        return (
            this.title ||
            'singleSelectionFilter'
        )
            .replace(
                /\s+/g,
                '_'
            );
    }


    getRadioId(
        item: any
    ): string {

        let value =
            item?.value;


        if (
            value === undefined ||
            value === null
        ) {
            value =
                'all';
        }


        return (
            this.radioGroupName +
            '_' +
            String(value)
        );
    }


    triggerListCollapse():
        void {

        this.collapseListDataCollapseButton =
            !this
                .collapseListDataCollapseButton;


        if (
            this
                .collapseListDataCollapseButton
        ) {

            this.filterMetaData
                .displayedList = [
                    ...this.filterMetaData
                        .list
                ];

        } else {

            this.filterMetaData
                .displayedList =
                this.filterMetaData
                    .list
                    .slice(
                        0,
                        this.filterMetaData
                            .collapsedDisplayedListCount
                    );
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

    showMoreListData():
        void {

        if (
            !this.showMoreListDataButton
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


    resetSelection():
        void {

        this.selection =
            undefined;
    }

    ngOnDestroy():
        void {

        this.formControlSub
            ?.unsubscribe();
    }
}