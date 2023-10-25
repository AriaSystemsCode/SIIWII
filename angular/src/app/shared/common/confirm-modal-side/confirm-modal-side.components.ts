import { Component, Input, OnInit,SimpleChanges, TemplateRef ,Output,EventEmitter,ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
@Component({
  selector: 'confirm-modal-side',
  templateUrl: './confirm-modal-side.components.html',
  styleUrls: ['./confirm-modal-side.components.css'],
})
export class ConfirmModalSide  implements  OnInit {
  @ViewChild('staticModal', { static: true }) staticModal: ModalDirective;
  @Input()displayItem;
  @Input()type;
  @Input()data = false;
  @Input()titleHeader='';
  @Input()content1='';
  @Input()content2='';
  @Input()buttonYes;
  @Input()buttonNo;
  @Input()defualtButton:boolean=true;
  @Input()icon='assets/profile/DeleteAddress.svg'
  @Input()iconIsText : boolean = false
  @Output()buttonClicked = new EventEmitter();
  display = "block";


  modalRef: BsModalRef;
  constructor(private modalService: BsModalService) {}

  // display: boolean = false;
    ngOnInit() {
      //
      // (this.displayItem)?this.display="block":this.display="none";
      // this.staticModal.show();

    }
    // ngOnChanges(changes: SimpleChanges) {
    //
    //   if (changes.displayItem) {
    //     (this.displayItem)?this.display="block":this.display="none";

    //   }
    // }
    closeModal(){
      this.display="none";
    }
    openModal() {
      this.staticModal.show();
    }
    onClickYes(){
      let data={
        value:'yes',
        type:this.type
      }
      this.buttonClicked.emit(data)
    }
    onClickNo(){
      let data={
        value:'no',
        type:this.type
      }
      this.buttonClicked.emit(data)

    }
}
