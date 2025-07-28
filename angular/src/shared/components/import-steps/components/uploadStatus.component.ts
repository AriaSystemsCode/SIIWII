// <!-- Iteration-8 -->
import { HostListener, OnChanges, OnInit, SimpleChanges, ViewChild } from "@angular/core";
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
export class uploadStatusComponent extends AppComponentBase implements OnInit , OnChanges{
    @ViewChild("uploadStatus", { static: true }) modal: ModalDirective;

    @Input() uploadingResult: any = null;
    @Output() goNextstep = new EventEmitter<any>();
    @Output() close = new EventEmitter<boolean>();
    @Output() totalPassedRecords = new EventEmitter<number>();
    @Output() totalFailedRecords = new EventEmitter<number>();
    @Output() onDownloadLogFile = new EventEmitter<boolean>();
    importType: ImportTypes;
    ImportTypes = ImportTypes;
    activeRecordType: string = 'Data';
    uploadStatsColumnsName: string[];


    public constructor(
        private _importService: MainImportService,
        injector: Injector
    ) {
        super(injector);
    }

    ngOnInit() {
        this.getuploadStatsColumnsName();
    }

       ngOnChanges(changes: SimpleChanges) {
        this.records= this.filteredRecords();
        this.records.forEach(r => {
            r.showActions = false;
        });
    }
    show(importType: ImportTypes) {
        this.importType = importType;
        this.modal.show();
    }

    hide() {
        this.modal.hide();
    }

    GoNextstep() {
        var _text = "";
        _text = "All " + ImportTypes[this.importType] + " Failed , can not import.";

        if (this.uploadingResult.totalPassedRecords == 0) {
            Swal.fire({
                title: "",
                text: _text,
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

    downloadLogFile() {
        this.onDownloadLogFile.emit(true);
    }


     filteredRecords() {
        if (this.activeRecordType == 'Data')
            return this.uploadingResult?.excelRecords?.filter(r => r?.recordType !== 'Image');

        else   
         return this.uploadingResult?.excelRecords?.filter(r => r?.recordType == 'Image');

    }

    records;
    switchTab(type: string) {
        this.activeRecordType = type;

        this.records=this.filteredRecords();
        this.records.forEach(r => {
            r.showActions = false;
        });
          
    }

    getuploadStatsColumnsName() {
        this.uploadStatsColumnsName = [];
        this.uploadStatsColumnsName.push("Image Preview");
        this.uploadStatsColumnsName.push("Record Type");
        this.uploadStatsColumnsName.push("Record Status");
        this.uploadStatsColumnsName.push("Status");
        this.uploadStatsColumnsName.push("Parent Code");
        this.uploadStatsColumnsName.push("Code");
        this.uploadStatsColumnsName.push("Name");
        this.uploadStatsColumnsName.push("Product Description");
        this.uploadStatsColumnsName.push("Product Classification");
        this.uploadStatsColumnsName.push("Product Classification Description");
        this.uploadStatsColumnsName.push("Product Category Code");
        this.uploadStatsColumnsName.push("Product Category Description");
        this.uploadStatsColumnsName.push("Price");
        this.uploadStatsColumnsName.push("Price Currency Code");
        this.uploadStatsColumnsName.push("Image is Default");
        this.uploadStatsColumnsName.push("Image Folder Name");
        this.uploadStatsColumnsName.push("Color Code");
        this.uploadStatsColumnsName.push("Color Name");
        this.uploadStatsColumnsName.push("Size Code");
        this.uploadStatsColumnsName.push("Size Name");
        this.uploadStatsColumnsName.push("Size Scale Name");
        this.uploadStatsColumnsName.push("Scale Sizes Order");
        this.uploadStatsColumnsName.push("Size Ratio Name");
        this.uploadStatsColumnsName.push("Size Ratio Value");
        this.uploadStatsColumnsName.push("Material Content");
        this.uploadStatsColumnsName.push("Sold Out Date");
        this.uploadStatsColumnsName.push("Brand Code");
        this.uploadStatsColumnsName.push("Brand Name");
        this.uploadStatsColumnsName.push("Start Ship Date");
        this.uploadStatsColumnsName.push("Dimension 1 sizes");
        this.uploadStatsColumnsName.push("Dimension 2 sizes");
        this.uploadStatsColumnsName.push("Dimension 3 sizes");
        this.uploadStatsColumnsName.push("Dimension 1 Name");
        this.uploadStatsColumnsName.push("Dimension 2 Name");
        this.uploadStatsColumnsName.push("Dimension 3 Name");
        this.uploadStatsColumnsName.push("Color-HEX");
        this.uploadStatsColumnsName.push("Color-Image");
        this.uploadStatsColumnsName.push("Color-Scheme");
        this.uploadStatsColumnsName.push("Color-NRF");
        this.uploadStatsColumnsName.push("Size Market");
        this.uploadStatsColumnsName.push("Size-NRF");
        this.uploadStatsColumnsName.push("Dimension1 Position");
        this.uploadStatsColumnsName.push("Dimension2 Position");
        this.uploadStatsColumnsName.push("Dimension3 Position");
        this.uploadStatsColumnsName.push("Price A");
        this.uploadStatsColumnsName.push("Price B");
        this.uploadStatsColumnsName.push("Price C");
        this.uploadStatsColumnsName.push("Price D");

    }
    
    toggleMenu(record: any, event: MouseEvent) {
        this.records.forEach(r => {
          if (r !== record) r.showActions = false;
        });
        record.showActions = !record.showActions;

        if (record.showActions) {
            const target = (event.target as HTMLElement).closest('.dropdown');
            const rect = target?.getBoundingClientRect();
            const spaceBelow = window.innerHeight - (rect?.bottom ?? 0);
        
            record.openUpward = spaceBelow < 250;
          }
      }
      
      @HostListener('document:click', ['$event'])
      onClickOutside(event: MouseEvent): void {
        const clickedInside = (event.target as HTMLElement).closest('.dropdown');
        if (!clickedInside) {
          this.records?.forEach(record => record.showActions = false);
        }
      }
    validateDataRecord(record){


        this.records.forEach(r => {
            r.showActions = false;
        });
    }
}