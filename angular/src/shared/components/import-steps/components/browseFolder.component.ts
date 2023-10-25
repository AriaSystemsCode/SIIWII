// <!-- Iteration-8 -->
import { Input, OnInit, ViewChild } from "@angular/core";
import { Injector } from "@angular/core";
import { Component } from "@angular/core";
import { AppConsts } from "@shared/AppConsts";
import { AppComponentBase } from "@shared/common/app-component-base";
import { BsModalRef, BsModalService, ModalDirective, ModalOptions } from "ngx-bootstrap/modal";
import { FileDownloadService } from "@shared/download/fileDownload.service";
import { Output } from "@angular/core";
import { EventEmitter } from "@angular/core";
import {  TreeNodeOfGetSycEntityObjectTypeForViewDto } from "@shared/service-proxies/service-proxies";
import { SelectAppItemTypeComponent } from "@app/app-item-type/select-app-item-type/select-app-item-type.component";
import { Subscription } from "rxjs";
import { ImportTypes } from "../models/ImportTypes";
import { finalize } from "rxjs/operators";

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
    importType: ImportTypes;
    ImportTypes = ImportTypes;
    itemType: string = "";
    itemTypeId: number = 0;
    importServiceProxy:any;
    hasImages:boolean;

    public constructor(private _downloadService: FileDownloadService,
        private _BsModalService: BsModalService,
        private injector: Injector) {
        super(injector);
    }

    ngOnInit() {

    }

    show(importType: ImportTypes,importService:any,hasImages:boolean) {
        this.spinnerService.show();
        this.hasImages=hasImages;
        this.itemType="";
        this.itemTypeId=0;
        this.importServiceProxy = this.injector.get(importService);
        this.importType = importType;
        this.importServiceProxy
            .getExcelTemplate(this.itemTypeId)
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe((result) => {
                this.templateUrl = result.excelTemplateFullPath;
                this.templateFileName = result.excelTemplateFile;
                this.templateVersion = this.l(result.excelTemplateVersion);
                this.templateDate = this.l(result.excelTemplateDate);
                this.modal.show();
            });


    }

    hide() {
        this.modal.hide();
    }

    fileChangeEvent(event: any) {
        let _UploadedFolder = [];
        for (let index = 0; index < event.target.files.length; index++) {
            let file = event.target.files[index];
            if (!(file.webkitRelativePath.split('/').length > 2))
                _UploadedFolder.push(file);
        }
        this.UploadedFolder.emit(_UploadedFolder);
        event.target.value = "";

    }

    downloadTemplate() {
        this.importServiceProxy
            .getExcelTemplate(this.itemTypeId)
            .subscribe((result) => {
                this.templateUrl = result.excelTemplateFullPath;
                let attach = AppConsts.attachmentBaseUrl
                let fullURL = `${attach}/${this.templateUrl}`;

                //let fullURL = `${url}`; // FOR Local Use
                this._downloadService.download(fullURL,
                    this.templateFileName);
            });

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
    }
}
// <!-- Iteration-8 -->