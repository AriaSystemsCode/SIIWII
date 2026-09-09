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
  AbstractControl,
  FormControl
} from '@angular/forms';

import {
  LookupLabelDto,
  PagedResultDtoOfLookupLabelDto
} from '@shared/service-proxies/service-proxies';

import {
  FilterMetaData
} from '../models/FilterMetaData.model';

import {
  debounceTime,
  distinctUntilChanged
} from 'rxjs/operators';

@Component({
  selector: 'app-multi-selection-filter',
  templateUrl: './multi-selection-filter.component.html',
  styleUrls: ['./multi-selection-filter.component.scss']
})
export class MultiSelectionFilterComponent
  implements OnInit, OnChanges {

  @Input()
  title: string;

  @Input()
  filterMetaData:
    FilterMetaData<LookupLabelDto[]>;

  @Input()
  formContol: AbstractControl;

  @Input()
  showSearchBox = false;

  @Output()
  onChange =
    new EventEmitter<boolean>();

  @Output()
  onLoadData =
    new EventEmitter<boolean>();

  @Output()
  filterText =
    new EventEmitter<string>();

  selections: number[] = [];

  collapseListDataCollapseButton =
    false;

  showMoreListDataButton =
    false;

  searchCtrl =
    new FormControl<string>('');

  ngOnInit(): void {

    /**
     * Restore immediately from parent form.
     */
    this.restoreSelectionFromForm();

    this.subscribeToFormControlChange();

    if (this.showSearchBox) {

      this.searchCtrl
        .valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe(q => {

          this.filterText.emit(
            (q ?? '').trim()
          );

        });
    }
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

  restoreSelectionFromForm(): void {

    if (!this.formContol) {
      this.selections = [];
      return;
    }

    const value =
      this.formContol.value;

    if (
      !Array.isArray(value) ||
      value.length === 0
    ) {

      this.selections = [];
      return;
    }

   
    this.selections =
      value
        .map((item: any) => {

          if (
            typeof item === 'number'
          ) {
            return item;
          }

          if (
            typeof item === 'string'
          ) {
            return Number(item);
          }

          return Number(
            item?.value ??
            item?.id
          );
        })
        .filter(
          id =>
            id !== null &&
            id !== undefined &&
            !isNaN(id)
        );


    this.selections = [
      ...this.selections
    ];
  }

  onSelectionChangeHandler(
    _: any
  ): void {

    this.formContol.setValue(
      [...this.selections]
    );

    this.onChange.emit(true);
  }

  onListLoadCallback(
    result:
      PagedResultDtoOfLookupLabelDto
  ): void {

    if (!this.filterMetaData.list) {
      this.filterMetaData.list = [];
    }

    const existingIds =
      new Set(
        this.filterMetaData.list
          .map(
            item =>
              Number(
                item?.value
              )
          )
      );

    const newItems =
      (result?.items || [])
        .filter(item =>
          !existingIds.has(
            Number(
              item?.value
            )
          )
        );

    this.filterMetaData.list.push(
      ...newItems
    );

    this.filterMetaData.displayedList = [
      ...this.filterMetaData.list
    ];

    this.filterMetaData.listTotalCount =
      result?.totalCount ?? 0;

    this.showMoreListDataButton =
      this.filterMetaData.list.length <
      this.filterMetaData.listTotalCount;

    this.restoreSelectionFromForm();
  }

  subscribeToFormControlChange():
    void {

    if (!this.formContol) {
      return;
    }

    this.formContol
      .valueChanges
      .subscribe(value => {

        if (
          !value ||
          (
            Array.isArray(value) &&
            value.length === 0
          )
        ) {

          this.resetSelection();
          return;
        }

        this.restoreSelectionFromForm();
      });
  }

  resetSelection(): void {

    this.selections = [];
  }

  triggerListCollapse(): void {

    this.collapseListDataCollapseButton =
      !this
        .collapseListDataCollapseButton;

    if (
      this
        .collapseListDataCollapseButton
    ) {

      this.filterMetaData.displayedList = [
        ...this.filterMetaData.list
      ];

    } else {

      this.filterMetaData.displayedList =
        this.filterMetaData.list.slice(
          0,
          this.filterMetaData
            .collapsedDisplayedListCount
        );
    }

    if (
      this.showMoreListDataButton &&
      this.filterMetaData.list.length ===
        this.filterMetaData
          .collapsedDisplayedListCount
    ) {

      this.showMoreListData();
    }

    this.restoreSelectionFromForm();
  }


  showMoreListData(): void {

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
        .listMaxResultCount = 10;
    }

    this.onLoadData.emit();
  }

  clearSearch(): void {

    this.searchCtrl.setValue('');
  }
}