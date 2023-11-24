import { Component, Input, OnInit, Output,EventEmitter } from '@angular/core';
@Component({
  selector: 'confirm-modal',
  template: `
  <p-dialog header="{{titleHeader}}" [(visible)]="display" [style]="{width: '50vw'}" class="confirm-modal" [baseZIndex]="10000">
  <p [ngClass]="data? 'content1':'content1 content1-del'">{{content1}}</p>
  <p class="content2">{{content2}}</p>
    <p-footer>
    <button type="button" pButton icon="pi pi-check" (click)="onClickYes()" class="btn-buttonYes" >{{buttonYes}}</button>
    <button type="button" pButton icon="pi pi-times" (click)="onClickNo()"  class="ui-button-secondary btn-buttonNo">{{buttonNo}}</button>
  </p-footer>
  </p-dialog> 
      
  `,
  styles: ['body .ui-dialog .ui-dialog-titlebar { background-color:transparent !important; }']
})
export class ConfirmModal  implements  OnInit {
  @Input()display;
  @Input()type;
  @Input()data = false;
  @Input()titleHeader='';
  @Input()content1='';
  @Input()content2='';
  @Input()buttonYes;
  @Input()buttonNo;
  @Output()buttonClicked = new EventEmitter();
  

  // display: boolean = false;
    ngOnInit() {

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