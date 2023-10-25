import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { LookupLabelDto, PagedResultDtoOfLookupLabelDto } from '@shared/service-proxies/service-proxies';
import { FilterMetaData } from '../models/FilterMetaData.model';

@Component({
  selector: 'app-single-selection-filter',
  templateUrl: './single-selection-filter.component.html',
  styleUrls: ['./single-selection-filter.component.scss']
})
export class SingleSelectionFilterComponent implements OnInit {
    @Input() title: string
    @Input() filterMetaData: FilterMetaData<LookupLabelDto[]>
    @Input() formContol: FormControl

    @Output() onChange: EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output() onLoadData : EventEmitter<boolean> = new EventEmitter<boolean>()

    selection : number

    collapseListDataCollapseButton: boolean = false
    showMoreListDataButton: boolean = false
    constructor() { }

    ngOnInit(){
        this.subscribeToFormControlChange()
    }
    ngOnChanges(){
        if(this.filterMetaData) this.onLoadData.emit()
    }
    onSelectionChangeHandler($event) {
        this.formContol.setValue(this.selection)
    }

    triggerListCollapse() {
        this.collapseListDataCollapseButton = !this.collapseListDataCollapseButton

        if( this.collapseListDataCollapseButton ) this.filterMetaData.displayedList = this.filterMetaData.list
        else return this.filterMetaData.displayedList = this.filterMetaData.list.slice(0,this.filterMetaData.collapsedDisplayedListCount)

        if( this.showMoreListDataButton && this.filterMetaData.list.length === this.filterMetaData.collapsedDisplayedListCount ) this.showMoreListData()
    }

    showMoreListData() {
        if(!this.showMoreListDataButton) this.showMoreListDataButton = true

        this.filterMetaData.listSkipCount += this.filterMetaData.listMaxResultCount

        if( this.filterMetaData.listMaxResultCount =  this.filterMetaData.collapsedDisplayedListCount ) this.filterMetaData.listMaxResultCount = 10

        this.onLoadData.emit()
    }

    onListLoadCallback(result:PagedResultDtoOfLookupLabelDto){
        this.filterMetaData.list.push(...result.items);
        this.filterMetaData.displayedList = [ ...this.filterMetaData.list ]
        this.filterMetaData.listTotalCount = result.totalCount;
        this.showMoreListDataButton = this.filterMetaData.list.length < this.filterMetaData.listTotalCount
    }

    resetSelection(){
        this.selection = undefined
    }

    subscribeToFormControlChange(){
        this.formContol.valueChanges
        .subscribe((value)=>{
            if( value === undefined || value === null || value === "" ) {
                this.resetSelection()
            }
        })
    }
}

