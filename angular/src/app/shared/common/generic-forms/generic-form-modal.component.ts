import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormInputs } from './modals/FormInputs';
import { FormInputType } from './modals/FormInputType';

@Component({
  selector: 'app-generic-form-modal',
  templateUrl: './generic-form-modal.component.html',
  styleUrls: ['./generic-form-modal.component.scss']
})
export class GenericFormModalComponent extends AppComponentBase {
  @ViewChild('createOrEditListModal', { static: true }) modal: ModalDirective;
  @Output() _submit: EventEmitter<object> = new EventEmitter<object>();
  @Output() _cancel: EventEmitter<object> = new EventEmitter<object>();
  inputList: FormInputs[]
  title: string
  object:any = {}
  active = false;
  saving = false;
  loading: boolean;
  FormInputType = FormInputType;
  constructor(
    injector: Injector,
  ) {
    super(injector);
  }
  show(inputList: FormInputs[], object?) {
    this.inputList = inputList
    if (object) this.object = object
    this.active = true;
    this.modal.show();
  }
  ngAfterViewInit() {
    this.modal.config.backdrop = 'static'
    this.modal.config.ignoreBackdropClick = true
  }
  cancel(): void {
    this._cancel.emit(this.object)
    this.hide()
  }
  hide() {
    this.active = false;
    this.modal.hide();
    this.object = {}
  }
  save(form: NgForm) {
    if (form.form.invalid) {
      form.form.markAllAsTouched()
      return this.notify.info(this.l("Please,CompleteAllTheRequiredFields(*)"))
    }
    this._submit.emit({...this.object});
    this.hide()
  }
  getCodeValue($event:string){
    this.object.code = $event
  }
}


