// <!-- Iteration-8 -->
import { OnInit, ViewChild } from "@angular/core";
import { Injector } from "@angular/core";
import { EventEmitter } from "@angular/core";
import { Input } from "@angular/core";
import { Output } from "@angular/core";
import { Component } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { ExcelRecordRepeateHandler } from "@shared/service-proxies/service-proxies";
import { ModalDirective } from "ngx-bootstrap/modal";
import { SelectItem } from "primeng/api";
import { ImageFile } from "../models/imageFile.model";
import { MainImportService } from "../services/mainImport.service";
import {ImportTypes} from "../models/ImportTypes"
@Component({
    selector: "importConfirmationModal",
    templateUrl: './importConfirmation.component.html',
    styleUrls: ['./importConfirmation.component.scss'],

})
export class importConfirmationComponent extends AppComponentBase implements OnInit {
    @ViewChild('importConfirmation', { static: true }) modal: ModalDirective;

    @Output() close = new EventEmitter<boolean>();
    @Output() repreateHandler = new EventEmitter<number>();
    @Output() goPrevious: EventEmitter<any> = new EventEmitter<any>();
    @Output() goNext: EventEmitter<any> = new EventEmitter<any>();

    @Input() finalImages: ImageFile[];
    hasDuplication : boolean=false;


    @Input() finalCountFailed: number = 0;
    @Input() finalCountPassed: number = 0;

    @Input() totalPassedRecords: number = 0;
    @Input() totalFailedRecords: number = 0;

    duplicatedOptions: SelectItem[] = [];
    selectedDuplicatedOption: number;
    importType: ImportTypes;
    ImportTypes=ImportTypes;
    hasImages:boolean;
    public constructor(
        private _importService: MainImportService,
        injector: Injector) {
        super(injector);
    }

    ngOnInit() {
        this.finalCountPassed = 0;
        this.finalCountFailed = 0;
        this.totalFailedRecords = 0;
        this.totalPassedRecords= 0;
    }

    show(importType: ImportTypes,hasDuplication:boolean,hasImages:boolean) {
        this.hasImages=hasImages;
        this.importType = importType;
        this.hasDuplication=hasDuplication;
        if( this.hasDuplication){
        this.duplicatedOptions = this.convertEnumToSelectItems(ExcelRecordRepeateHandler);
        this.selectedDuplicatedOption = 0;
        }
        this.modal.show();
    }

    hide() {
        this.modal.hide();
    }
    askToClose() {
        this.close.emit(true);
    }

    goPreviousStep() {
        this.goPrevious.emit();
    }

    import() {
        this.repreateHandler.emit(this.selectedDuplicatedOption);
        this.goNext.emit();
    }
    convertEnumToSelectItems(_enum: any) { // _enum : of type enum
        let currentIndex: number = 0
        let totalIndices = Object.keys(_enum).length / 2
        const selectOptions: SelectItem[] = []
        for (const label in _enum) {
            if (Object.prototype.hasOwnProperty.call(_enum, label)) {
                if (currentIndex < totalIndices) {
                    currentIndex++
                    continue;
                }
                const value = _enum[label];
                let option: SelectItem = { label: this.l(label), value }
                selectOptions.push(option)
            }
        }
        return selectOptions
    }
}
// <!-- Iteration-8 -->
