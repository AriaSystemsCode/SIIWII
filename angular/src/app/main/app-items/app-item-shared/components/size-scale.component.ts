import { AfterViewInit, Component, EventEmitter, Injector, Input, OnChanges, OnDestroy, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AppEntityListDynamicModalComponent } from '@app/app-entity-dynamic-modal/app-entity-list-dynamic-modal/app-entity-list-dynamic-modal.component';
import { GenericFormModalComponent } from '@app/shared/common/generic-forms/generic-form-modal.component';
import { FormInputs } from '@app/shared/common/generic-forms/modals/FormInputs';
import { FormInputType } from '@app/shared/common/generic-forms/modals/FormInputType';
import { MatrixGridComponent } from '@app/shared/common/matrix-grid/matrix-grid.component';
import { MatrixGridColumns } from '@app/shared/common/matrix-grid/models/MatrixGridColumns';
import { MatrixGridRows } from '@app/shared/common/matrix-grid/models/MatrixGridRows';
import { MatrixGridSelectItem } from '@app/shared/common/matrix-grid/models/MatrixGridSelectItem';
import { GetAllInputs } from '@app/shared/common/selection-modals/models/GetAllInputs';
import { SelectionModalInputs } from '@app/shared/common/selection-modals/models/SelectionModalInputs';
import { SelectionMode } from '@app/shared/common/selection-modals/models/SelectionMode';
import { SelectionModalComponent } from '@app/shared/common/selection-modals/selection-modal.component';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppItemSizesScaleInfo, AppSizeScaleForEditDto, AppSizeScalesDetailDto, AppSizeScaleServiceProxy, GetAppSizeScaleForViewDto, IAppSizeScaleForEditDto, LookupLabelDto } from '@shared/service-proxies/service-proxies';
import { BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { IsVariationExtraAttribute } from '../models/IsVariationExtraAttribute';
import { ExtraAttributeDataService } from '../services/extra-attribute-data.service';
@Component({
  selector: 'app-size-scale',
  templateUrl: './size-scale.component.html',
  styleUrls: ['./size-scale.component.scss']
})
export class SizeScaleComponent extends AppComponentBase implements OnChanges, AfterViewInit,OnDestroy {
  @ViewChild('matrixGrid', { static: true }) matrixGrid: MatrixGridComponent
  @ViewChild('appSelectionModal', { static: true }) appSelectionModal: SelectionModalComponent<GetAppSizeScaleForViewDto>
  @ViewChild('sizeScaleForm', { static: true }) sizeScaleForm: NgForm
  
  @Input() extraAttr:IsVariationExtraAttribute 
  @Input() readOnly:boolean 
  @Input() oldAppSizeScaleDto:AppItemSizesScaleInfo 
  @Output() _submit : EventEmitter<AppItemSizesScaleInfo> = new EventEmitter()
  @Output() _cancel : EventEmitter<any> = new EventEmitter()
  @Output() _onChange : EventEmitter<any> = new EventEmitter()
  appSizeScaleDto:AppItemSizesScaleInfo 
  cols: MatrixGridColumns = new MatrixGridColumns({ rowHeaderColumn:new MatrixGridSelectItem({label:'',value:''}), columns:[]})
  rows: MatrixGridRows[] = []
  canAddCols: boolean = false
  canAddRows: boolean = false
  cellSelectionFormInput:FormInputs<string,LookupLabelDto[]> // any to be changed
  appSizeScalesDetails;
  sizeScaleName:string="";

  constructor(
    private _extraAttributeDataService:ExtraAttributeDataService,
    private _appSizeScaleServiceProxy:AppSizeScaleServiceProxy,
    private injector: Injector,
  ) {
    super(injector);
  }
  ngAfterViewInit(){
    if(this.oldAppSizeScaleDto){
      this.cellSelectionFormInput = new FormInputs<string,LookupLabelDto[]>({ 
        type: FormInputType.Checkbox,
        name: `cell-${this.guid()}`, 
        id: this.guid(),
        label: '',
        defaultValue:true
      })
    }
  }
  ngOnChanges(){
    if(this.oldAppSizeScaleDto){
      this.appSizeScaleDto = new AppItemSizesScaleInfo(this.oldAppSizeScaleDto)
      this.mapAppSizeScaleDtoToMatrixGrid()
    }
  }
  ngOnDestroy(){
    // this.submit()
  }
  submit(){
    this._submit.emit(this.mapMatrixGridToAppSizeScaleDto())
  }
  sizeScaleSelectionDoneHandler(id:number){
    this._appSizeScaleServiceProxy.getSizeScaleForEdit(id).subscribe((res)=>{
      this.appSizeScaleDto = new AppItemSizesScaleInfo({
        ...res, 
        sizeScaleId:res.id,
        id:this.appSizeScaleDto.id || 0
      })
      this.appSizeScalesDetails=this.appSizeScaleDto.appSizeScalesDetails;
      this.mapAppSizeScaleDtoToMatrixGrid()
      this.canAddCols = true
      this.canAddRows = true
    })
  }
  sizeScaleSelectionCancelHandler(){
    
  }
  mapMatrixGridToAppSizeScaleDto() : AppItemSizesScaleInfo {
    const newAppSizeScalesDetailsCombinations : AppSizeScalesDetailDto[] = []
    const newAppSizeScalesDetails1stDimension : AppSizeScalesDetailDto[] = []
    const newAppSizeScalesDetails2ndDimension : AppSizeScalesDetailDto[] = []
    const getDetailDtoIndex = ( {code, sizeId, is1stDimension, is2ndDimension}:{code:string, sizeId?:number, is1stDimension?:boolean, is2ndDimension?:boolean} ) :number=>{
      return this.appSizeScaleDto.appSizeScalesDetails.findIndex(item=> 
        item.sizeCode == code 
        && 
        ( isNaN(sizeId) ? true : item.sizeId == sizeId) 
        && 
        (
          ( (is1stDimension && is2ndDimension) && (item.d1Position && item.d2Position) )
          ||
          ( (is1stDimension && !is2ndDimension) && (item.d1Position && !item.d2Position) )
          ||
          ( (!is1stDimension && is2ndDimension) && (!item.d1Position && item.d2Position) )
        )
      )
    }
    // map 1st dimension values
    this.cols.columns.forEach((col,colIndex)=>{
      const colExistIndex = getDetailDtoIndex({code:col.code, sizeId: col.value, is1stDimension:true})
      const _dimension1 = colExistIndex == -1 ? new AppSizeScalesDetailDto() : this.appSizeScaleDto.appSizeScalesDetails[colExistIndex]
      _dimension1.sizeCode = col.code
      _dimension1.sizeId = col.value
      _dimension1.d1Position = String(colIndex) 
      _dimension1.dimensionName = this.appSizeScaleDto.dimesion1Name
      newAppSizeScalesDetails1stDimension.push(_dimension1)
    })

    // map 2nd dimension values
    this.rows.forEach((row,rowIndex)=>{
      const rowExistIndex = getDetailDtoIndex({code:row.rowHeader.code, sizeId: row.rowHeader.value, is2ndDimension:true})
      const _dimension2 = rowExistIndex == -1 ? new AppSizeScalesDetailDto() : this.appSizeScaleDto.appSizeScalesDetails[rowExistIndex]
      _dimension2.sizeCode = row.rowHeader.code
      _dimension2.sizeId = row.rowHeader.value
      _dimension2.d2Position = String(rowIndex) //2nd dimension
      _dimension2.dimensionName = this.appSizeScaleDto.dimesion2Name
        // map combination cells
        row.rowValues.forEach((cell,colIndex)=>{
          if(!cell.value) return
          const sizeCode = `${this.cols.columns[colIndex].code}-${row.rowHeader.code}`
          const cellExistIndex = getDetailDtoIndex({code:sizeCode, sizeId:cell.value})
          const item = cellExistIndex  == -1 ? new AppSizeScalesDetailDto() : this.appSizeScaleDto.appSizeScalesDetails[cellExistIndex]
          item.sizeCode = sizeCode
          item.d1Position = String(colIndex) 
          item.d2Position = String(rowIndex) 
          item.d3Position = String(0) 
          newAppSizeScalesDetailsCombinations.push(item)
        })
      newAppSizeScalesDetails2ndDimension.push(_dimension2)
    })
    
    this.appSizeScaleDto.appSizeScalesDetails = [ ...newAppSizeScalesDetailsCombinations, ...newAppSizeScalesDetails1stDimension, ...newAppSizeScalesDetails2ndDimension ]
    return this.appSizeScaleDto
  }
  cancel(){
    this._cancel.emit()
  }
  dimension1NameOnChange($event:string){
    this.canAddCols = Boolean($event)
  }
  dimension2NameOnChange($event:string){
    this.canAddRows = Boolean($event)
  }
  openAppEntityListModal(dimension:1|2|3) {
    let config : ModalOptions = new ModalOptions()
    const acceptMultiValues = true
    config.class = 'right-modal slide-right-in'
    let selectedRecords = []
    switch (dimension) {
      case 1:
        selectedRecords = this.cols.columns.map(item=>item.value)
        break;
        case 2:
        selectedRecords = this.rows.map(item=>item.rowHeader.value)
        break;
      default:
        break;
    }
    let modalDefaultData :Partial<AppEntityListDynamicModalComponent> = {
        entityObjectType : {
            name : this.extraAttr.name,
            code : this.extraAttr.entityObjectTypeCode,
        },
        selectedRecords,
        acceptMultiValues
    }
    config.initialState = modalDefaultData
    let modalRef:BsModalRef = this.bsModalService.show(AppEntityListDynamicModalComponent,config)
    let subs : Subscription = this.bsModalService.onHidden.subscribe(()=>{
        this._extraAttributeDataService.getExtraAttributeLookupData(this.extraAttr.entityObjectTypeCode, this.extraAttr.lookupData, this.extraAttr)
        let modalRefData :AppEntityListDynamicModalComponent = modalRef.content
        if(modalRefData.selectionDone) {
          if(dimension == 2) {
            this.adjustRows(modalRefData)
            if(!this.appSizeScaleDto.dimesion2Name)
               this.appSizeScaleDto.dimesion2Name="Second dimension"
              
          } else if(dimension == 1) {
            this.adjustCols(modalRefData)
            if(!this.appSizeScaleDto.dimesion1Name)
               this.appSizeScaleDto.dimesion1Name="First dimension"
          }
        }
      
        
       
       
       
        if(!modalRef.content.isHiddenToCreateOrEdit)  subs.unsubscribe()
    })
  }
  adjustRows(modalRefData :AppEntityListDynamicModalComponent){
    // remove unselected values
let selectedRecords:number[] ; 
selectedRecords=modalRefData.selectedRecords;
    const unselectedItemsIndeces = []
    this.rows.forEach((row,index)=> {
      const isSelected:boolean = selectedRecords.includes(row.rowHeader.value)
      if(isSelected) return
      unselectedItemsIndeces.push(index)
    })
    // check for selected records existance and add newly selected ones
    const newRows :MatrixGridRows[] = []
    selectedRecords.forEach(record=>{
      //let recordSelectItem : MatrixGridSelectItem = this.extraAttr.lookupData.filter(item=>item.value == record)[0]
      let recordSelectItem : MatrixGridSelectItem = modalRefData.allRecords.filter(item=>item.value == record)[0];

      const existIndex = this.rows.findIndex(row=>row.rowHeader.value == record)
      if(existIndex > -1) return 
      const row = new MatrixGridRows({
        rowHeader : new MatrixGridSelectItem(recordSelectItem),
        rowValues : []
      })
      newRows.push(row)
    })
    this.matrixGrid.removeRows(unselectedItemsIndeces)
    // this.matrixGrid.addNewRows(newRows)
    newRows.forEach(newRow=>{
      this.cols.columns.forEach((col)=>{
        const sizeCode = `${col.code}-${newRow.rowHeader.code}`
        const newCell = new MatrixGridSelectItem({
            code:sizeCode,
            value:true,
            label:sizeCode
        })
        newRow.rowValues.push(newCell)
      })
      this.rows.push(newRow)
    })
  }
  adjustCols(modalRefData:AppEntityListDynamicModalComponent){
    // remove unselected values
let selectedRecords:number[] ; 
selectedRecords=modalRefData.selectedRecords;
    const unselectedItemsIndeces = []
    this.cols.columns.forEach((col,index)=> {
      const isSelected:boolean = selectedRecords.includes(col.value)
      if(isSelected) return
      unselectedItemsIndeces.push(index)
    })
    // check for selected records existance and add newly selected ones
    const newCols :MatrixGridSelectItem[] = []
    selectedRecords.forEach(record=>{
    //  let recordSelectItem : MatrixGridSelectItem = this.extraAttr.lookupData.filter(item=>item.value == record)[0]
    let recordSelectItem : MatrixGridSelectItem = modalRefData.allRecords.filter(item=>item.value == record)[0];
      const existIndex = this.cols.columns.findIndex(col=>col.value == record)
      if(existIndex > -1) return 
      const col = new MatrixGridSelectItem(recordSelectItem)
      newCols.push(col)
    })
    this.matrixGrid.removeColumns(unselectedItemsIndeces)
    newCols.forEach((newCol)=>{
      this.cols.columns.push(newCol)
      this.rows.forEach(row=>{
        const sizeCode = `${newCol.code}-${row.rowHeader.code}`
        const newCell = new MatrixGridSelectItem({
            code:sizeCode,
            value:true,
            label:sizeCode
        })
        row.rowValues.push(newCell)
      })
    })
    // this.matrixGrid.addNewColumns(newCols)
  }
  getAllSizeScales(getAllInputs: GetAllInputs) {
    return this._appSizeScaleServiceProxy.getAll(
      getAllInputs.search,
      undefined,
      getAllInputs.sortBy,
      getAllInputs.skipCount,
      getAllInputs.maxResultCount,
    )
  }
  handleGetAllSizeScales(getAllInputs: GetAllInputs) {
    this.getAllSizeScales(getAllInputs)
      .subscribe((result) => {
        this.appSelectionModal.renderData(result)
      })
  }
  async openSelectSizeScaleModal() {
      const getAllInputs = this.appSelectionModal.getAllInputs
      const results = await this.getAllSizeScales(getAllInputs).toPromise()
      const SelectionModalInputs: SelectionModalInputs<GetAppSizeScaleForViewDto> = {
          showAdd: false,
          showEdit: false,
          showDelete: false,
          results: results,
          labelField: 'name',
          valueField: 'id',
          mode: SelectionMode.Single,
          selections: this.appSizeScaleDto?.sizeScaleId,
          title: this.l('SizeScale'),
      }
      this.appSelectionModal.show(SelectionModalInputs)
  }
  openCreateOrEditSizeScale(isNew:boolean) {
  }
  createOrEdit(isNew:boolean) {
    if(!this.appSizeScaleDto.dimesion1Name || (this.rows?.length && !this.appSizeScaleDto.dimesion2Name)) {
      this.sizeScaleForm.form.markAllAsTouched();
      return this.notify.error(this.l('CompleteAllTheRequired*fields'))
    }
    if(!this.cols?.columns?.length) {
      this.sizeScaleForm.form.markAllAsTouched();
      return this.notify.error(this.l('PleaseSelectAtLeastOneValueFor{0}',this.appSizeScaleDto.dimesion2Name || this.l("FirstDimension")  ))
    }
    if(!this.rows?.length && this.appSizeScaleDto.dimesion2Name) {
      this.sizeScaleForm.form.markAllAsTouched();
      return this.notify.error(this.l('PleaseSelectAtLeastOneValueFor{0}',this.appSizeScaleDto.dimesion2Name || this.l("SecondDimension")  ))
    }
    const body = new AppSizeScaleForEditDto()
    this.mapMatrixGridToAppSizeScaleDto()
    body.appSizeScalesDetails = this.appSizeScaleDto.appSizeScalesDetails.map(item=>{
      item.id = 0
      return item
    })
    body.code = this.appSizeScaleDto.code
    body.id = isNew ? 0 : this.appSizeScaleDto.sizeScaleId
    body.dimesion1Name = this.appSizeScaleDto.dimesion1Name 
    body.dimesion2Name = this.appSizeScaleDto.dimesion2Name 
    body.dimesion3Name = this.appSizeScaleDto.dimesion3Name 
    body.noOfDimensions = this.appSizeScaleDto.noOfDimensions
    body.name = this.appSizeScaleDto.name
    if( this.appSizeScalesDetails && this.appSizeScalesDetails?.length == body.appSizeScalesDetails.length && 
      JSON.stringify(this.appSizeScalesDetails) == JSON.stringify(body.appSizeScalesDetails)){
   return   this.notify.error(this.l('No change to Saved!'))
    }
  

   /*  if(!this.appSizeScaleDto.name ) {
      this.sizeScaleForm.form.markAllAsTouched();
      return this.notify.error(this.l('PleaseEnterSizeScaleName'))
    } */

    if (!this.appSizeScaleDto.name) {
      this.sizeScaleForm.form.markAllAsTouched();
             this.sizeScaleName= "";
             if (this.rows.length > 0) {
               this.sizeScaleName = this.rows[0]?.rowValues[0]?.code;
               if (this.rows.length - 1 != 0)
               this.sizeScaleName += '-' + this.rows[this.rows.length - 1]?.rowValues[this.rows[this.rows.length - 1]?.rowValues.length - 1]?.code;
             }
             else if (this.cols.columns.length > 0) {
               this.sizeScaleName = this.cols?.columns[0]?.code;
               if (this.cols.columns.length - 1 != 0)
               this.sizeScaleName += '-' + this.cols?.columns[this.cols.columns.length - 1]?.code;
             }
             this.message.confirm(
              '',
              this.l('The size scale name will be "'+ this.sizeScaleName +'" Do you need to proceed with this change?'),
              (isConfirmed) => {
                  if (isConfirmed) 
                 {
                  this.appSizeScaleDto.name =  this.sizeScaleName;
                  body.name = this.appSizeScaleDto.name
                  this._createOrEdit(body);
                 }
                  else{
                  this.appSizeScaleDto.name="";
                  return;
                  }
              }
          );
             
           }

           else
           this._createOrEdit(body);
  }

  _createOrEdit(body){
    this._appSizeScaleServiceProxy.createOrEditAppSizeScale(body).subscribe(result=>{
      this.notify.success(this.l('SavedSuccessfully'))
      this.appSizeScaleDto.sizeScaleId = result.id
    })
  }
  onCancelHandler() {

  }
  mapAppSizeScaleDtoToMatrixGrid(){
    const cols = new MatrixGridColumns({ rowHeaderColumn:new MatrixGridSelectItem({label:'',value:''}), columns:[]})
    const rows = []
    this.appSizeScaleDto.appSizeScalesDetails.forEach(item=>{
      const isDimensionValue : boolean = Boolean(item.sizeCode)  && Boolean(item.dimensionName)
      const isColValue : boolean = isDimensionValue && Boolean(item.d1Position) 
      const isRowValue : boolean = isDimensionValue && Boolean(item.d2Position) 
      if(isColValue) cols.columns[item.d1Position] = new MatrixGridSelectItem({
        code:item.sizeCode,
        value:item.sizeId,
        label:item.sizeCode,
        reorederable:true
      }) 
      else {
        let existRow = rows[item.d2Position]
        if(!existRow) {
          existRow = rows[item.d2Position] = new MatrixGridRows({
            rowHeader : new MatrixGridSelectItem(),
            rowValues : []
          })
        }
        if(isRowValue){
          existRow.rowHeader =  new MatrixGridSelectItem({
              value:item.sizeId,
              label:item.sizeCode,
              code:item.sizeCode,
              reorederable:true
            })
        } else {
          existRow.rowValues[item.d1Position] = new MatrixGridSelectItem({
            code:item.sizeCode,
            value:true,
            label:item.sizeCode,
          }) 
        }
      }
    })
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex]
      for (let colIndex = 0; colIndex < cols.columns.length; colIndex++) {
        let cell = rows[rowIndex].rowValues[colIndex]
        if(!cell) {
          const sizeCode = `${cols.columns[colIndex].code}-${row.rowHeader.code}`
          cell = new MatrixGridSelectItem({
            code:this.readOnly ? '': sizeCode,
            value:this.readOnly ? '': false,
            label:sizeCode
          })
          rows[rowIndex].rowValues[colIndex] = cell
        }
      }
    }
    this.rows = rows
    this.cols = cols
  }
}
