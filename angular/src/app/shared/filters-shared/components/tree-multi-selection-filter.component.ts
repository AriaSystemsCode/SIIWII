import { EventEmitter, OnChanges } from '@angular/core';
import { Component, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FilterMetaData } from '../models/FilterMetaData.model';

@Component({
  selector: 'app-tree-multi-selection-filter',
  templateUrl: './tree-multi-selection-filter.component.html',
  styleUrls: ['./tree-multi-selection-filter.component.scss']
})
export class TreeMultiSelectionFilterComponent implements OnInit, OnChanges {
    @Input() title: string
    @Input() filterMetaData: FilterMetaData<any[]>
    @Input() formContol: FormControl

    @Output() onChange: EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output() onLoadData : EventEmitter<any> = new EventEmitter<any>()
    @Output() onLoadNode : EventEmitter<number> = new EventEmitter<number>()

    selections : any[] = []

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
        this.formContol.setValue(this.selections)
        this.onChange.emit()
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

        if( this.filterMetaData.listMaxResultCount ==  this.filterMetaData.collapsedDisplayedListCount ) this.filterMetaData.listMaxResultCount = 10

        this.onLoadData.emit()
    }

    onListLoadCallback( result: { items : any[], totalCount:number }){
        this.filterMetaData.list.push(...result.items);
        this.filterMetaData.displayedList = [ ...this.filterMetaData.list ]
        this.filterMetaData.listTotalCount = result.totalCount;
        this.showMoreListDataButton = this.filterMetaData.list.length < this.filterMetaData.listTotalCount
    }

    resetSelection(){
        this.selections = []
    }

    loadNode(event:{node : any}){
        if (event.node) {
            this.onLoadNode.emit(event.node)
        }
    }

    subscribeToFormControlChange(){
        this.formContol.valueChanges
        .subscribe((value)=>{
            if(!value || value.length === 0) {
                this.resetSelection()
            }
        })
    }
}
