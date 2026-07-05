// multi-selection-filter.component.ts
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { LookupLabelDto, PagedResultDtoOfLookupLabelDto } from '@shared/service-proxies/service-proxies';
import { FilterMetaData } from '../models/FilterMetaData.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-multi-selection-filter',
  templateUrl: './multi-selection-filter.component.html',
  styleUrls: ['./multi-selection-filter.component.scss']
})
export class MultiSelectionFilterComponent implements OnInit, OnChanges {
  @Input() title: string;
  @Input() filterMetaData: FilterMetaData<LookupLabelDto[]>;
  @Input() formContol: FormArray;
  @Input() showSearchBox: boolean = false;

  @Output() onChange = new EventEmitter<boolean>();
  @Output() onLoadData = new EventEmitter<boolean>();
  @Output() filterText = new EventEmitter<string>();

  selections: number[] = [];

  collapseListDataCollapseButton = false;
  showMoreListDataButton = false;


  searchCtrl = new FormControl<string>('');

  ngOnInit() {
    this.subscribeToFormControlChange();

  
    if (this.showSearchBox) {
      this.searchCtrl.valueChanges
        .pipe(debounceTime(300), distinctUntilChanged())
        .subscribe((q) => {
          this.filterText.emit((q ?? '').trim());
        });
    }
  }

  ngOnChanges() {
    if (this.filterMetaData) this.onLoadData.emit();
  }

  onSelectionChangeHandler(_: any) {
    this.formContol.setValue(this.selections);
    this.onChange.emit();
  }

  triggerListCollapse() {
    this.collapseListDataCollapseButton = !this.collapseListDataCollapseButton;

    if (this.collapseListDataCollapseButton) {
      this.filterMetaData.displayedList = this.filterMetaData.list;
    } else {
      this.filterMetaData.displayedList = this.filterMetaData.list.slice(
        0,
        this.filterMetaData.collapsedDisplayedListCount
      );
    }

    if (this.showMoreListDataButton &&
        this.filterMetaData.list.length === this.filterMetaData.collapsedDisplayedListCount) {
      this.showMoreListData();
    }
  }

  showMoreListData() {
    if (!this.showMoreListDataButton) this.showMoreListDataButton = true;

    this.filterMetaData.listSkipCount += this.filterMetaData.listMaxResultCount;

    //  Fix accidental assignment (=) to comparison (===)
    if (this.filterMetaData.listMaxResultCount === this.filterMetaData.collapsedDisplayedListCount) {
      this.filterMetaData.listMaxResultCount = 10;
    }

    this.onLoadData.emit();
  }

  onListLoadCallback(result: PagedResultDtoOfLookupLabelDto) {
    this.filterMetaData.list.push(...result.items);
    this.filterMetaData.displayedList = [...this.filterMetaData.list];
    this.filterMetaData.listTotalCount = result.totalCount;
    this.showMoreListDataButton = this.filterMetaData.list.length < this.filterMetaData.listTotalCount;
  }

  resetSelection() {
    this.selections = [];
  }

  subscribeToFormControlChange() {
    this.formContol.valueChanges.subscribe((value) => {
      if (!value || value.length === 0) this.resetSelection();
    });
  }

  clearSearch() {
    this.searchCtrl.setValue('');
  }
}
