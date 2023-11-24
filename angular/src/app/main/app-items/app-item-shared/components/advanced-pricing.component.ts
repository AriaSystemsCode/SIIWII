import { AfterViewInit, Component, EventEmitter, Injector, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormInputs } from '@app/shared/common/generic-forms/modals/FormInputs';
import { FormInputType } from '@app/shared/common/generic-forms/modals/FormInputType';
import { MatrixGridComponent } from '@app/shared/common/matrix-grid/matrix-grid.component';
import { MatrixGridColumns } from '@app/shared/common/matrix-grid/models/MatrixGridColumns';
import { MatrixGridRows } from '@app/shared/common/matrix-grid/models/MatrixGridRows';
import { MatrixGridSelectItem } from '@app/shared/common/matrix-grid/models/MatrixGridSelectItem';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppItemPriceInfo, CurrencyInfoDto } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SelectItem } from 'primeng';
import { PricingHelpersService } from '../services/pricing-helpers.service';

@Component({
  selector: 'app-advanced-pricing',
  templateUrl: './advanced-pricing.component.html',
  styleUrls: ['./advanced-pricing.component.scss']
})
export class AdvancedPricingComponent extends AppComponentBase implements OnChanges, AfterViewInit {
  @ViewChild('matrixGrid', { static: true }) matrixGrid: MatrixGridComponent
  @ViewChild('bsModal', { static: true }) modal: ModalDirective;

  @Input() prices:AppItemPriceInfo[] = []
  @Input() readOnly:boolean 
  @Input() allCurrencies:CurrencyInfoDto[] = []
  @Output() _submit : EventEmitter<AppItemPriceInfo[]> = new EventEmitter()
  @Output() _cancel : EventEmitter<any> = new EventEmitter()
  
  cols: MatrixGridColumns
  rows: MatrixGridRows[]
  canAddCols: boolean = true
  canAddRows: boolean = true
  rowHeaderFormInput:FormInputs<string,CurrencyInfoDto[]>
  cellSelectionFormInput:FormInputs<string,CurrencyInfoDto[]>
  constructor(
    private pricingHelpersService: PricingHelpersService,
    private injector: Injector
  ) {
    super(injector);
  }
  ngOnChanges(changes:SimpleChanges){
    if(this.prices){
      this.openPricing()
    }
  }
  ngAfterViewInit(){
    if(this.prices){
      this.modal.config.ignoreBackdropClick = true
      this.modal.show()
    }
  }
  
  openPricing() {
    if(!this.readOnly){
      this.rowHeaderFormInput = new FormInputs<string,CurrencyInfoDto[]>({ 
        type: FormInputType.Select,
        name: `Currency-${this.guid()}`, 
        id: this.guid(),
        label: 'Currency',
        extraData: this.allCurrencies,
        required: true
      })
      this.cellSelectionFormInput = new FormInputs<string,CurrencyInfoDto[]>({ 
        type: FormInputType.Number,
        name: `cell-${this.guid()}`, 
        id: this.guid(),
        label: '',
        required: true,
        min : 0,
        pattern:this.patterns.positiveNumbersFromZero
      })
    } else {
      this.canAddCols = false
      this.canAddRows = false
    }
    
    this.cols = this.pricingHelpersService.getDefaultCols();
    this.rows = []
    this.prices.forEach(item=>{
      let currencyRowIndex : number = this.rows.findIndex(row=>row.rowHeader.value == item.currencyId)
      if(currencyRowIndex == -1) {
        const newRow :MatrixGridRows  = new MatrixGridRows({
          rowHeader:new MatrixGridSelectItem({ 
            label:item.currencyName,
            code:item.currencyCode, 
            value:item.currencyId,
            disabled:true
          }),
          rowValues:this.pricingHelpersService.setRowValues(),
        })
        if(this.tenantDefaultCurrency.value == item.currencyId){
          newRow.canotBeRemoved = true
          newRow.canotBeRemovedMsg = this.l('CannotDeleteTheBaseCurrencyRow')
        }
        this.rows.push(newRow)
        currencyRowIndex = this.rows.length - 1
      }
      const matrixCellIndex : number = this.rows[currencyRowIndex].rowValues.findIndex(cell=>cell.label == item.code)
      if(matrixCellIndex > -1) this.rows[currencyRowIndex].rowValues[matrixCellIndex].value = item.price
    })
  }
  addNewCurrency() {
    this.matrixGrid.addNewRows([{ rowHeader: { label: '', value: '' }, rowValues: this.pricingHelpersService.setRowValues() }])
  }
  submit(){
    if(!this.isValid) return this.notify.error(this.l('FormIsInvalid'))
    const defaultCurrencyExist = this.rows.filter(item=>item.rowHeader.value == this.tenantDefaultCurrency.value).length;
    if(!defaultCurrencyExist) return this.notify.error(this.l("DefaultCurrencyMustExist"))
    const hasDuplicates = new Set(this.rows.map(item=>item.rowHeader.value)).size !== this.rows.length;
    if(hasDuplicates) return this.notify.error(this.l("CurrenciesCannotBeDublicated"))
    const newPrices : AppItemPriceInfo[] = this.mapRowsToAppItemPricesDto()
    this._submit.emit(newPrices)
  }
  mapRowsToAppItemPricesDto(){
    const getPriceInfoIndex = ( currencyCode:string, level:string ) :number=>{
      return this.prices.findIndex(item=>item.currencyCode == currencyCode && item.code == level)
    }
    const newPrices : AppItemPriceInfo[] = []
    this.rows.forEach(row=>{
      const currencyCode : string = row.rowHeader.code
      const currencyName : string = row.rowHeader.label
      const currencyId : number = row.rowHeader.value
      row.rowValues.forEach(cell=>{
        if(!cell.value) return
        const level = cell.label
        const oldItemIndex :number = getPriceInfoIndex( currencyCode, level ) 
        const item = new AppItemPriceInfo()
        if(oldItemIndex > -1) item.init(this.prices[oldItemIndex])
        item.currencyCode = currencyCode
        item.currencyId = currencyId
        item.currencyName = currencyName
        item.code = level
        item.price = cell.value
        newPrices.push(item)
      })
    })
    return newPrices
  }
  cancel(){
    this._cancel.emit()
  }
  rowHeaderSelectionChange({id,index}:{id:number,index:number}){
    const list = this.rowHeaderFormInput.extraData
    const currencyIndex = list.findIndex(item=>item.value == id)
    this.rows[index].rowHeader.code = list[currencyIndex].code
    this.rows[index].rowHeader.label = list[currencyIndex].label
    this.rows[index].rowHeader.value = list[currencyIndex].value
  }
  isValid :boolean
  statusChanged(status:string){
    this.isValid = status == 'VALID'
    console.log('statusChanged adv pric',this.isValid)
  }
}