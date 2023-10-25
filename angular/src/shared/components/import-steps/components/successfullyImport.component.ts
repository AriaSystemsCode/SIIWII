// <!-- Iteration-8 -->
import { EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import { Injector } from "@angular/core";
import { Component } from "@angular/core";
import { AppConsts } from "@shared/AppConsts";
import { AppComponentBase } from "@shared/common/app-component-base";
import { ModalDirective } from "ngx-bootstrap/modal";
import { FileDownloadService } from "@shared/download/fileDownload.service";
import { Input } from "@angular/core";
import { ImportTypes } from "../models/ImportTypes";

@Component({
    selector: "successfullyImportModal",
    templateUrl: './successfullyImport.component.html',
    styleUrls: ['./successfullyImport.component.scss'],

})
export class successfullyImportComponent extends AppComponentBase implements OnInit {
    @ViewChild('successfullyImport', { static: true }) modal: ModalDirective;

    @Output() onDownloadLogFile = new EventEmitter<boolean>();
    @Output() finishImport = new EventEmitter<boolean>();

    importType:ImportTypes;
    ImportTypes=ImportTypes;

    public constructor(
        injector: Injector) {
        super(injector);
    }

    ngOnInit()
    {

    }

    show( importType:ImportTypes)
    {
        this.importType=importType;
       this.modal.show();
    }

    hide() {
        this.modal.hide();
    }

    downloadLogFile()
    {
          this.onDownloadLogFile.emit(true);

    }

    close(){
        this.finishImport.emit(true);
        this.hide();
    }


}


// <!-- Iteration-8 -->
