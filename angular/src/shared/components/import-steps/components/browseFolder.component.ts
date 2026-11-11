// <!-- Iteration-8 -->
import { ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { Injector } from "@angular/core";
import { Component } from "@angular/core";
import { AppConsts } from "@shared/AppConsts";
import { AppComponentBase } from "@shared/common/app-component-base";
import { BsModalRef, BsModalService, ModalDirective, ModalOptions } from "ngx-bootstrap/modal";
import { FileDownloadService } from "@shared/download/fileDownload.service";
import { Output } from "@angular/core";
import { EventEmitter } from "@angular/core";
import { TreeNodeOfGetSycEntityObjectTypeForViewDto } from "@shared/service-proxies/service-proxies";
import { SelectAppItemTypeComponent } from "@app/app-item-type/select-app-item-type/select-app-item-type.component";
import { Subscription } from "rxjs";
import { ImportTypes } from "../models/ImportTypes";
import { finalize } from "rxjs/operators";
import Swal from "sweetalert2";

@Component({
  selector: "BrowseFolderModal",
  templateUrl: './browseFolder.component.html',
  styleUrls: ['./browseFolder.component.scss'],

})
export class BrowseFolderComponent extends AppComponentBase implements OnInit {
  @ViewChild('BrowseFolder', { static: true }) modal: ModalDirective;
  @Output() UploadedFolder = new EventEmitter<any>();
  templateUrl: string;
  templateFileName: string;
  templateVersion: string;
  templateDate: string;
  templateLoading: boolean = false;
  importType: ImportTypes;
  ImportTypes = ImportTypes;
  itemType: string = "";
  itemTypeId: number = 0;
  importServiceProxy: any;
  hasImages: boolean;


  imData: boolean = false;
  imImages: boolean = false;
  @Output() _imData = new EventEmitter<boolean>();
  @Output() _imImages = new EventEmitter<boolean>();

  isAnyOptionSelected: boolean = false;
  showUploadModal = false;
  folderName = 'Main Folder';
  totalFiles = 0;
  totalSizeMB = 0;
  fileevent;

  @Output() _openVideoModal = new EventEmitter<boolean>();
  @Output() _totalFiles = new EventEmitter<any>();
  @Output() _totalSizeMB = new EventEmitter<any>();
  @Output() _folderName = new EventEmitter<any>();
  @ViewChild('fileInput') fileInputRef!: ElementRef;

  @Output() _hasImages = new EventEmitter<boolean>();
  aspectRatioNumbers;

  public constructor(private _downloadService: FileDownloadService,
    private _BsModalService: BsModalService,
    private injector: Injector) {
    super(injector);
  }

  ngOnInit() {

  }

  show(importType: ImportTypes, importService: any, hasImages: boolean) {
    this.hasImages = hasImages;
    this.itemType = "";
    this.itemTypeId = 0;
    this.templateUrl = "";
    this.templateFileName = "";
    this.templateVersion = "";
    this.templateDate = "";
    this.importServiceProxy = this.injector.get(importService);
    this.importType = importType;
    this.modal.show();
    this.loadExcelTemplate();
  }

  hide() {
    this.imData = false;
    this.imImages = false;
    this.isAnyOptionSelected = false;
    this.modal.hide();
  }

  fileChangeEvent(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const input = event.target as HTMLInputElement;

    if(this.importType == ImportTypes.price){
      const invalidFiles = Array.from(input.files).filter(file => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        return ext !== 'csv';
      });
  
      if (invalidFiles.length > 0) {
        Swal.fire(
          " ",
          "Invalid file format, the supported format is csv.",
          "error"
        );
        input.value = '';
        return;
      }
    }

    this.fileevent = event;
    if (input.files && input.files.length > 0) {
      const files = input.files;
      this.showUploadModal = true;
      //this.totalFiles = files.length;
      const cleanFiles = Array.from(files).filter(file => !file.name.startsWith("~$"));
      this.totalFiles = cleanFiles.length;

      this.totalSizeMB = this.getTotalSizeInMB(files);
      this.folderName = this.extractFolderName(files[0]);
      this._totalFiles.emit(this.totalFiles);
      this._totalSizeMB.emit(this.totalSizeMB);
      this._folderName.emit(this.folderName);
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        document.body.style.overflow = '';
      }, 500);
    }
  }


  openSelectAppItemTypeModal() {
    let config: ModalOptions = new ModalOptions();
    config.class = "right-modal slide-right-in";
    let modalDefaultData: Partial<SelectAppItemTypeComponent> = {
      savedId: this.itemTypeId,
    };
    config.initialState = modalDefaultData;
    let modalRef: BsModalRef = this._BsModalService.show(
      SelectAppItemTypeComponent,
      config
    );
    let subs: Subscription = this._BsModalService.onHidden.subscribe(() => {
      this.selectAppItemTypeHandler(modalRef);
      subs.unsubscribe();
    });
  }
  selectAppItemTypeHandler(modalRef: BsModalRef) {
    let data: SelectAppItemTypeComponent = modalRef.content;
    if (data.selectionDone && data.selectedRecord)
      this.addSelectedAppItemType(data.selectedRecord);
  }
  addSelectedAppItemType(
    selected: TreeNodeOfGetSycEntityObjectTypeForViewDto
  ): void {
    this.formTouched = true;
    this.itemTypeId = selected.data.sycEntityObjectType.id;
    this.itemType = selected.data.sycEntityObjectType.name;
    this.loadExcelTemplate();
  }
  // <!-- Iteration-8 -->

  onOptionChange() {
    this.isAnyOptionSelected = this.imData || this.imImages;
  }

  openVideoModal(event: boolean = false) {
    if (event)
      this._openVideoModal.emit(event);
  }

  extractFolderName(file: File): string {
    if( this.importType==ImportTypes.price)
        return file?.name;

    const pathParts = file.webkitRelativePath.split('/');
    return pathParts.length > 1 ? pathParts[0] : 'Main Folder';

    name
  }

  getTotalSizeInMB(files: FileList): number {
    let totalBytes = 0;
    for (let i = 0; i < files.length; i++) {
      totalBytes += files[i].size;
    }
    return +(totalBytes / (1024 * 1024)).toFixed(2); // 2 decimal MB
  }

  confirmUpload() {
    this.showUploadModal = false;
    // Call your upload method here
    this.uploadSelectedFiles();
  }

  cancelUpload() {
    this.showUploadModal = false;
    this.clearFileInput();
  }


  uploadSelectedFiles() {
    let event = this.fileevent;
    let _UploadedFolder = [];
    for (let index = 0; index < event.target.files.length; index++) {
      let file = event.target.files[index];
      if (!(file.webkitRelativePath.split('/').length > 2))
        _UploadedFolder.push(file);
    }

    if(this.importType == ImportTypes.Items){
    this._imData.emit(this.imData);
    this._imImages.emit(this.imImages);
    this._hasImages.emit(this.imImages);
    }
    this.UploadedFolder.emit(_UploadedFolder);
    event.target.value = "";

  }

  downloadTemplate() {
    if (this.templateLoading || !this.templateUrl) {
      return;
    }

    let attach = AppConsts.attachmentBaseUrl
    let fullURL = `${attach}/${this.templateUrl}`;

    //let fullURL = `${url}`; // FOR Local Use
    this._downloadService.download(fullURL,
      this.templateFileName);
  }

  private loadExcelTemplate() {
    this.templateLoading = true;
    this.templateUrl = "";
    this.templateFileName = "";
    this.templateVersion = "";
    this.templateDate = "";

    this.importServiceProxy
      .getExcelTemplate(this.itemTypeId)
      .pipe(finalize(() => this.templateLoading = false))
      .subscribe((result) => {
        this.templateUrl = result.excelTemplateFullPath;
        this.templateFileName = result.excelTemplateFile;
        this.templateVersion = this.l(result.excelTemplateVersion);
        this.templateDate = this.l(result.excelTemplateDate);
      });
  }


  clearFileInput(): void {
    if (this.fileevent?.target?.value)
      this.fileevent.target.value = '';

    if (this.fileInputRef?.nativeElement) {
      this.fileInputRef.nativeElement.value = '';
    }
    this.folderName = '';
    this.totalFiles = 0;
    this.totalSizeMB = 0;
  }
}
