import { AfterViewInit, Component, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { GetAllInputs } from './models/GetAllInputs';
import { PagedResultDto } from './models/PagedResultDto';
import { SelectionModalInputs } from './models/SelectionModalInputs';
import { SelectionMode } from './models/SelectionMode';

@Component({
  selector: 'app-selection-modal',
  templateUrl: './selection-modal.component.html',
  styleUrls: ['./selection-modal.component.scss']
})
export class SelectionModalComponent<T = any> extends AppComponentBase implements OnInit, AfterViewInit {
  @ViewChild('bsModal', { static: true }) modal: ModalDirective;
  @Output() _delete: EventEmitter<T> = new EventEmitter<T>()
  @Output() _createOrEdit: EventEmitter<T> = new EventEmitter<T>()
  @Output() _getAll: EventEmitter<GetAllInputs> = new EventEmitter()
  @Output() _submit: EventEmitter<number[]> = new EventEmitter<number[]>()
  @Output() _cancel: EventEmitter<boolean> = new EventEmitter<boolean>()
  labelField:string
  valueField:string
  selectedRecords: number[] = []
  active: boolean = false;
  loading: boolean;
  totalCount: number
  showMoreListDataButton: boolean
  searchQuery: string
  searchSubj: Subject<string> = new Subject<string>()
  allRecords : T[] = []
  getAllInputs :GetAllInputs = new GetAllInputs()
  showAdd : boolean
  showEdit : boolean
  showDelete : boolean
  title: string
  selectionMode = SelectionMode
  mode:SelectionMode
  constructor(
    injector: Injector,
  ) {
    super(injector)
  }

  ngOnInit(): void {
    this.getAllInputs.skipCount = 0
    this.getAllInputs.maxResultCount = 10
    this.searchSubj
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.getAllInputs.search = this.searchQuery 
        this.resetList()
      })
  }
  ngAfterViewInit(){
    this.modal.config.backdrop = 'static'
    this.modal.config.ignoreBackdropClick = true
}

  getAllList() {
    this.loading = true
    this.active = false;
    this._getAll.emit(this.getAllInputs)
  }
  renderData(results:PagedResultDto<T>){
    this.loading = false
    this.active = true;
    const isFirstPage = this.getAllInputs.skipCount == 0
    if (isFirstPage) this.allRecords = []
    this.allRecords.push(...results.items);
    this.totalCount = results.totalCount;
    const isLastPage = this.getAllInputs.skipCount + this.getAllInputs.maxResultCount > this.totalCount
    this.showMoreListDataButton = !isLastPage
  }
  
  show(selectionModalInputs:SelectionModalInputs<T>){
    this.selectedRecords = selectionModalInputs.selections
    this.showAdd = selectionModalInputs.showAdd
    this.showEdit = selectionModalInputs.showEdit
    this.showDelete = selectionModalInputs.showDelete
    this.labelField = selectionModalInputs.labelField
    this.valueField = selectionModalInputs.valueField
    this.title = selectionModalInputs.title
    this.mode = selectionModalInputs.mode
    this.renderData(selectionModalInputs.results)
    this.modal.show()
  }
  showMoreListData() {
    if (!this.showMoreListDataButton) this.showMoreListDataButton = true
    this.getAllInputs.skipCount += this.getAllInputs.maxResultCount
    this.getAllData()
  }
  createOrEdit(item?:T): void {
    this.close()
    this._createOrEdit.emit(item)
  }
  resetList() {
    this.getAllInputs.skipCount = 0
    this.getAllData()
  }
  getAllData(){
    this._getAll.emit(this.getAllInputs)
  }
  close(){
    this.active = false;
    this.modal.hide();
  } 
  cancel() {
    this._cancel.emit()
    this.reset()
    this.close()
  }
  reset(){
    this.selectedRecords = []
//    this.selectionMode = undefined
    this.showAdd = undefined
    this.showEdit = undefined
    this.showDelete = undefined
    this.title = undefined
    this.active = false
  }

  deleteItem(item: T): void {
    this._delete.emit(item)
  }
  onFilter() {
    this.searchSubj.next(this.searchQuery)
  }

  submitSelection() {
    this._submit.emit(this.selectedRecords)
    this.close()
  }
  
}