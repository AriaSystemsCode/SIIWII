import { Component, EventEmitter, Injector, Output, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-success-right-modal',
  templateUrl: './success-right-modal.component.html',
  styleUrls: ['./success-right-modal.component.scss']
})
export class SuccessRightModalComponent extends AppComponentBase {
    @ViewChild('successModal', { static: true }) modal: ModalDirective;

    @Output() onClose: EventEmitter<boolean> = new EventEmitter<boolean>();


    active = false;
    saving = false;
    loading: boolean;
    listName:string
    constructor(
        private injector:Injector
    ) {
        super(injector)
    }

    show(listName:string) {
        this.listName = listName
        this.active = true
        this.modal.show()
    }
    close(){
        this.active = false
        this.modal.hide()
        this.onClose.emit()
    }

}
