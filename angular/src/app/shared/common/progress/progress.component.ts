import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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

      @Input() _totalFiles;
      @Input() _totalSizeMB;
      @Input() _folderName;
      @Input() _folder_details;
      @Input() _remainingFiles
      @Input() _estimatedRemainingTime;
      @Input() _uploadedFilesCount;
      @Output() close = new EventEmitter<boolean>();
      
  constructor() { }

  ngOnInit(): void {
  }

  show() {
    this.modal.show();
  }

  hide() {
    this.modal.hide();
  }

  askToClose()
{
    this.close.emit(true);
}

}
