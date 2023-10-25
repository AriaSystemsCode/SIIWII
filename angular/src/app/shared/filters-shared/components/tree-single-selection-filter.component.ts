import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TreeNode } from 'primeng/api';
import { FilterMetaData } from '../models/FilterMetaData.model';

@Component({
  selector: 'app-tree-single-selection-filter',
  templateUrl: './tree-single-selection-filter.component.html',
  styleUrls: ['./tree-single-selection-filter.component.scss']
})
export class TreeSingleSelectionFilterComponent implements OnInit {
    @Input() title: string
    @Input() filterMetaData: FilterMetaData<any[]>
    @Input() formContol: FormControl
    @Input() dataObjectName: string = "sycEntityObjectType"

    @Output() onLoadData : EventEmitter<any> = new EventEmitter<any>()
    @Output() onLoadNode : EventEmitter<TreeNode> = new EventEmitter<TreeNode>()

    selection : any

    collapseListDataCollapseButton: boolean = false
    showMoreListDataButton: boolean = false

    lastSelection : TreeNode

    constructor() { }

    ngOnInit(){
        this.subscribeToFormControlChange()
    }

    ngOnChanges(){
        if(this.filterMetaData) this.onLoadData.emit()
    }
    onSelectionChangeHandler(node) {
        if(node && node.leaf != true )  {
            this.loadNode({node})
            this.preventSelectNonLeaf(node)
            return
        }
        this.formContol.setValue(this.selection)
        this.lastSelection = this.selection
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

    onListLoadCallback( result: { items : any[], totalCount:number }){
        this.filterMetaData.list.push(...result.items);
        this.filterMetaData.displayedList = [ ...this.filterMetaData.list ]
        this.filterMetaData.listTotalCount = result.totalCount;
        this.showMoreListDataButton = this.filterMetaData.list.length < this.filterMetaData.listTotalCount
    }

    resetSelection(){
        this.selection = undefined
    }

    loadNode(event:{node : TreeNode}){
        if (event.node) {
            this.onLoadNode.emit(event.node)
        }
    }

    subscribeToFormControlChange(){
        this.formContol.valueChanges
        .subscribe((value)=>{
            if(!value ) {
                this.resetSelection()
            }
        })
    }
    preventSelectNonLeaf(node : TreeNode ){
        if(this.selection?.data[this.dataObjectName].id == node?.data[this.dataObjectName].id){
            node.expanded = !node.expanded
        }
        this.selection  = this.lastSelection
    }
}
