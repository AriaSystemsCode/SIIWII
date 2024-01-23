import { AfterViewInit, Component, EventEmitter, Injector, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { GenericFormModalComponent } from '@app/shared/common/generic-forms/generic-form-modal.component';
import { FormInputs } from '@app/shared/common/generic-forms/modals/FormInputs';
import { FormInputType } from '@app/shared/common/generic-forms/modals/FormInputType';
import { GetAllInputs } from '@app/shared/common/selection-modals/models/GetAllInputs';
import { SelectionModalInputs } from '@app/shared/common/selection-modals/models/SelectionModalInputs';
import { SelectionMode } from '@app/shared/common/selection-modals/models/SelectionMode';
import { SelectionModalComponent } from '@app/shared/common/selection-modals/selection-modal.component';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppItemSizesScaleInfo, AppSizeScaleForEditDto, AppSizeScalesDetailDto, AppSizeScaleServiceProxy, GetAppSizeScaleForViewDto, IAppItemSizesScaleInfo } from '@shared/service-proxies/service-proxies';
import { ModalOptions } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-size-ratio',
  templateUrl: './size-ratio.component.html',
  styleUrls: ['./size-ratio.component.scss']
})
export class SizeRatioComponent extends AppComponentBase implements OnChanges,AfterViewInit,OnDestroy  {
  @Input() oldAppSizeRatios : AppItemSizesScaleInfo
  @Input() appSizeScales : AppItemSizesScaleInfo
  @Input() readOnly : boolean
  
  @ViewChild('appSelectionModal', { static: true }) appSelectionModal: SelectionModalComponent<GetAppSizeScaleForViewDto>
  @ViewChild('appFormModal', { static: true }) appFormModal: GenericFormModalComponent
  @ViewChild("SizeRatioForm", { static: true }) sizeRatioForm: NgForm;
  @Output('StatusChanged') statusChanged:EventEmitter<boolean> = new EventEmitter<boolean>() 
  appSizeRatios : AppItemSizesScaleInfo
  constructor(
    private _appSizeScaleServiceProxy:AppSizeScaleServiceProxy,
    private injector : Injector
  ) {
    super(injector)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.oldAppSizeRatios?.appSizeScalesDetails?.length) {
      this.appSizeRatios = new AppItemSizesScaleInfo(this.oldAppSizeRatios)
      this.calculateQtySum()
    }
  }
  ngOnInit(){
    console.log('on init')
    this.sizeRatioForm.statusChanges.subscribe(status=>{
      this.statusChanged.emit('VALID' == status)
    })
  }
  ngAfterViewInit(){
    /*this.sizeRatioForm.statusChanges.subscribe(status=>{
      console.log('after init')
      this.statusChanged.emit('VALID' == status)
    })*/
    
  }
  ngOnDestroy() {
    console.log('destroy')

    this.statusChanged.emit(true)
  }
  sizeRatioNameChanges($event){
    debugger
  }
  totalQty :number = 0
  calculateQtySum(){
    this.totalQty = this.appSizeRatios?.appSizeScalesDetails?.reduce((accum,item)=>{
      if(item.sizeRatio) accum += item.sizeRatio
      return accum
    },0)
  }
 
  getAllSizeRatios(getAllInputs: GetAllInputs) {
    return this._appSizeScaleServiceProxy.getAll(
      getAllInputs.search,
      this.appSizeScales.sizeScaleId,
      getAllInputs.sortBy,
      getAllInputs.skipCount,
      getAllInputs.maxResultCount,
    )
  }
  handleGetAllSizeRatios(getAllInputs: GetAllInputs) {
    this.getAllSizeRatios(getAllInputs)
      .subscribe((result) => {
        this.appSelectionModal.renderData(result)
      })
  }
  async openSelectSizeRatioModal() {
      const getAllInputs = this.appSelectionModal.getAllInputs
      const results = await this.getAllSizeRatios(getAllInputs).toPromise()
      const SelectionModalInputs: SelectionModalInputs<GetAppSizeScaleForViewDto> = {
          showAdd: false,
          showEdit: false,
          showDelete: false,
          results: results,
          labelField: 'name',
          valueField: 'id',
          mode: SelectionMode.Single,
          selections: this.appSizeRatios?.sizeScaleId,
          title: this.l('SizeRatio'),
      }
      this.appSelectionModal.show(SelectionModalInputs)
  }
  isSaving:boolean
  createOrEdit(isNew:boolean) {
    if(!this.appSizeRatios.name) return this.notify.error(this.l('PleaseEnterSizeRatioName')) 
    const body = new AppSizeScaleForEditDto()
    body.appSizeScalesDetails = this.appSizeRatios.appSizeScalesDetails
    body.code = this.appSizeRatios.code
    body.id = isNew ? undefined : this.appSizeRatios.sizeScaleId
    body.dimesion1Name = this.appSizeRatios.dimesion1Name 
    body.dimesion2Name = this.appSizeRatios.dimesion2Name 
    body.dimesion3Name = this.appSizeRatios.dimesion3Name 
    body.noOfDimensions = this.appSizeRatios.noOfDimensions
    body.name = this.appSizeRatios.name
    body.parentId = this.appSizeScales.sizeScaleId
    this._appSizeScaleServiceProxy.createOrEditAppSizeScale(body).subscribe(result=>{
      this.notify.success(this.l('SavedSuccessfully'))
      this.appSizeRatios = new AppItemSizesScaleInfo({
        ...result,
        appSizeScalesDetails:this.appSizeRatios.appSizeScalesDetails,
        id:this.appSizeRatios.id,
        sizeScaleId:result.id,
      }) 
    })
  }
  onCancelHandler() {
    
  }
  sizeRatioSelectionDoneHandler(id:number){
    this._appSizeScaleServiceProxy.getSizeScaleForEdit(id).subscribe((res)=>{
      this.appSizeRatios.sizeScaleId = res.id
      this.appSizeRatios.name = res.name
      this.appSizeRatios.appSizeScalesDetails.forEach((appSizeRatioItem)=>{
        const item = res.appSizeScalesDetails.filter(item=> item.sizeCode == appSizeRatioItem.sizeCode)[0]
        if(item) appSizeRatioItem.sizeRatio = item.sizeRatio
      })
      this.calculateQtySum()
    })
  }
}
