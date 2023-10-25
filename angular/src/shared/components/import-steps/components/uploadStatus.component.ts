// <!-- Iteration-8 -->
import { OnInit, ViewChild } from "@angular/core";
import { Injector } from "@angular/core";
import { Output } from "@angular/core";
import { EventEmitter } from "@angular/core";
import { Input } from "@angular/core";
import { Component } from "@angular/core";
import { AppConsts } from "@shared/AppConsts";
import { AppComponentBase } from "@shared/common/app-component-base";
import { ModalDirective } from "ngx-bootstrap/modal";
import Swal from "sweetalert2";
import { ImportTypes } from "../models/ImportTypes";
import { MainImportService } from "../services/mainImport.service";

@Component({
    selector: "uploadStatusModal",
    templateUrl: "./uploadStatus.component.html",
    styleUrls: ["./uploadStatus.component.scss"],
})
export class uploadStatusComponent extends AppComponentBase implements OnInit {
    @ViewChild("uploadStatus", { static: true }) modal: ModalDirective;

    @Input() uploadingResult: any = null;
    @Output() goNextstep = new EventEmitter<any>();
    @Output() close = new EventEmitter<boolean>();
    @Output() totalPassedRecords = new EventEmitter<number>();
    @Output() totalFailedRecords = new EventEmitter<number>();
    @Output() onDownloadLogFile = new EventEmitter<boolean>();
    importType:ImportTypes;
    ImportTypes=ImportTypes;

    public constructor(
        private _importService: MainImportService,
        injector: Injector
    ) {
        super(injector);
    }

    ngOnInit() {}

    show( importType:ImportTypes) {
        this.importType=importType;
        this.modal.show();
    }

    hide() {
        this.modal.hide();
    }

    GoNextstep() {
        var _text ="";
                _text ="All "+ ImportTypes[this.importType] +" Failed , can not import.";

        if (this.uploadingResult.totalPassedRecords == 0) {
            Swal.fire({
                title: "",
                text: _text ,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Ok",
            }).then((result) => {
            });
        } else {
            this.goNextstep.emit();
            this.totalFailedRecords.emit(
                this.uploadingResult.totalFailedRecords
            );
            this.totalPassedRecords.emit(
                this.uploadingResult.totalPassedRecords
            );
        }
    }

    askToClose() {
        this.close.emit(true);
    }
    
    downloadLogFile(){
        this.onDownloadLogFile.emit(true);
    }
}

// <!-- Iteration-8 -->
