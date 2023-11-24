import { Component, EventEmitter, Injector, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LookupLabelDto } from '@shared/service-proxies/service-proxies';
import { SelectItem } from 'primeng';
import { FormInputs } from '../generic-forms/modals/FormInputs';
import { FormInputType } from '../generic-forms/modals/FormInputType';
import { MatrixGridColumns } from './models/MatrixGridColumns';
import { MatrixGridComponentInputs } from './models/MatrixGridComponentInputs';
import { MatrixGridRows } from './models/MatrixGridRows';
import { MatrixGridSelectItem } from './models/MatrixGridSelectItem';

@Component({
  selector: 'app-matrix-grid',
  templateUrl: './matrix-grid.component.html',
  styleUrls: ['./matrix-grid.component.scss']
})
export class MatrixGridComponent extends AppComponentBase implements OnChanges {
  @ViewChild("MatrixGridForm", { static: true }) matrixGridForm: NgForm;


  @Input() cols: MatrixGridColumns;
  @Input() rows: MatrixGridRows[];
  @Input() rowHover?: boolean = false;
  @Input() colHover?: boolean = false;
  @Input() reorderableColumns?: boolean = false;
  @Input() reorderableRows?: boolean = false;
  @Input() canAddCols?: boolean = false;
  @Input() canAddRows?: boolean = false;
  @Input() canRemoveCols?: boolean = false;
  @Input() canRemoveRows?: boolean = false;
  @Input() rowHeaderIsUnique:boolean = true
  @Input() rowHeaderIsEditable:boolean = false
  @Input() rowHeaderFormInput:FormInputs 
  @Input() rowHeaderColIsEditable:boolean = false
  @Input() rowHeaderColFormInput:FormInputs
  @Input() cellSelectionIsEditable:boolean = false
  @Input() cellSelectionFormInput:FormInputs
  @Input() colIsEditable:boolean = false
  @Input() colFormInput:FormInputs
  @Input() disableAddCols:boolean
  @Input() disableAddRows:boolean
  @Input() cellLabelField:string = 'value'
  
  
  @Output() _newRow : EventEmitter<any> = new EventEmitter()
  @Output() _cellChange : EventEmitter<any> = new EventEmitter()
  @Output() _newColumn : EventEmitter<any> = new EventEmitter()
  @Output() _rowHeaderSelectionChanged : EventEmitter<{id:number,index:number}> = new EventEmitter()
  @Output() _formStatusChange : EventEmitter<boolean> = new EventEmitter()
  
  FormInputType = FormInputType;
  active : boolean = false
  constructor(
    private injector:Injector
  ) {
    super(injector)
  }
  dropDownLists :LookupLabelDto [][]
  ngOnChanges(changes: SimpleChanges): void {
    this.active = Boolean(this.cols)
    
    this.matrixGridForm.statusChanges.subscribe(status=>{
      if(!this.colIsEditable && !this.rowHeaderIsEditable && !this.rowHeaderColIsEditable && !this.cellSelectionIsEditable) return
      this._formStatusChange.emit(status)
    })
    if(this.rowHeaderFormInput?.extraData?.length){
      // this.dropDownLists.push()
    }
  }
  addNewRows(rows:MatrixGridRows[]){
    rows.forEach(row=>{
      if(!this.rows) this.rows = []
      if(this.cols.columns.length > row.rowValues.length){
        const defaultRowCell = ()=>new MatrixGridSelectItem({label:'',value:this.cellSelectionFormInput.defaultValue||''})
        const cellsLength = row.rowValues.length
        const missingCells = this.cols.columns.length - cellsLength
        for(let i=0; i < missingCells; i++){
          row.rowValues.push(defaultRowCell())
        }
      }
      this.rows.push(row)
    })
  }
  removeRows(indeces:number[]){
    indeces.sort((a,b)=>b-a) //sort them desc to avoid wrong indeces remove
    indeces.forEach(index=>{
      const rowToBeDeleted = this.rows[index]
      if(rowToBeDeleted.canotBeRemoved) return this.notify.error(this.l(rowToBeDeleted.canotBeRemovedMsg))
      this.rows.splice(index,1)
    })
  } 
  addNewColumns(columns:MatrixGridSelectItem[]){
    columns.forEach(column=>{
      if(!this.cols) this.cols = new MatrixGridColumns()
      if(!this.cols.columns) this.cols.columns = []
      this.cols.columns.push(column)
      for (let i = 0; i < this.rows.length; i++) {
        const element = this.rows[i];
        element.rowValues.push(new MatrixGridSelectItem())
      }
    })
  }
  removeColumns(indeces:number[]){
    indeces.sort((a,b)=>b-a) //sort them desc to avoid wrong indeces remove
    indeces.forEach(index=>{
      this.cols.columns.splice(index,1)
      for (let i = 0; i < this.rows.length; i++) {
        const element = this.rows[i];
        element.rowValues.splice(index,1)
      }
    })
  }
  hide(){
    this.active = true
  }
  submit(){
  }
  rowHeaderSelectionChange(id:number,index:number){
    this._rowHeaderSelectionChanged.emit({id,index})
  }
}