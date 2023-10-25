import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent implements OnInit {
  @ViewChild('GenericProgress', { static: true }) modal: ModalDirective;
  @Input() progress: number;
  @Input() progressHeader: string;
  @Input() ProgressDetail: string;

  constructor() { }

  ngOnInit(): void {
  }

  show() {
    this.modal.show();
  }

  hide() {
    this.modal.hide();
  }

}
