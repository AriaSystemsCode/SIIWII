import { Component, Injector, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { AppEntityAttachmentDto, AppTenantInvoicesServiceProxy, AppTenantSubscriptionPlansServiceProxy, CreateOrEditAppTenantInvoiceDto, GetSycAttachmentCategoryForViewDto, SycAttachmentCategoryDto, TenantInformation } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { ImageCropperComponent } from "@app/shared/common/image-cropper/image-cropper.component";
import {Observable, config} from "@node_modules/rxjs";
import { SelectAppItemTypeComponent } from '@app/app-item-type/select-app-item-type/select-app-item-type.component';
import { AppEntityListDynamicModalComponent } from '@app/app-entity-dynamic-modal/app-entity-list-dynamic-modal/app-entity-list-dynamic-modal.component';

//import { ImageCropperComponent } from 'ngx-image-cropper';
//import { SelectAppItemTypeComponent } from '@app/app-item-type/select-app-item-type/select-app-item-type.component';





@Component({
    templateUrl: './create-or-edit-appTenantInvoice.component.html',
    animations: [appModuleAnimation()],
    styles: [`
      .drag-over {
        background-color: #f7f7f7 !important;
        border: 2px dashed #4A0D4A !important;
        transition: background-color 0.3s ease;
      },.pdf-thumbnail {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
    `]
  })
  
export class CreateOrEditAppTenantInvoiceComponent extends AppComponentBase implements OnInit {
    active = false;
    saving = false;
    attachmentsSrcs: string[] = Array(1).fill("");
    appTenantInvoice: CreateOrEditAppTenantInvoiceDto = new CreateOrEditAppTenantInvoiceDto();
    TenantList: TenantInformation[];

    constructor(
        injector: Injector,
        private _activatedRoute: ActivatedRoute,
        private _appTenantInvoicesServiceProxy: AppTenantInvoicesServiceProxy,
        private _appTenantSubscriptionPlansServiceProxy: AppTenantSubscriptionPlansServiceProxy,
        private _router: Router
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.show(this._activatedRoute.snapshot.queryParams['id']);
        this.initUploaders();
        this._appTenantSubscriptionPlansServiceProxy.getTenantsList()
            .subscribe((tenantLst: any) => {
                this.TenantList = tenantLst;
            });
    }
    onChange(op: any) {
        const pos = this.TenantList.findIndex(z => z.id == op.value);
        var tenObj = this.TenantList[pos];
        if (tenObj != undefined) {
            this.appTenantInvoice.tenantName = tenObj.name;
        }
    }
    show(appTenantInvoiceId?: number): void {

        if (!appTenantInvoiceId) {
            this.appTenantInvoice = new CreateOrEditAppTenantInvoiceDto();
            this.appTenantInvoice.id = appTenantInvoiceId;
            this.appTenantInvoice.invoiceDate = moment().startOf('day');
            this.appTenantInvoice.dueDate = moment().startOf('day');
            this.appTenantInvoice.payDate = moment().startOf('day');


            this.active = true;
        } else {
            this._appTenantInvoicesServiceProxy.getAppTenantInvoiceForEdit(appTenantInvoiceId).subscribe(result => {
                this.appTenantInvoice = result.appTenantInvoice;



                this.active = true;
            });
        }


    }

    save(): void {
        this.saving = true;
        if (this.uploader.isUploading) {
            return this.notify.error(
                this.l("PleaseWait,SomeAttachmentsAreStillUploading")
            );
        }
        this._appTenantInvoicesServiceProxy.createOrEdit(this.appTenantInvoice)
            .pipe(finalize(() => {
                this.saving = false;
            }))
            .subscribe(x => {
                this.saving = false;
                this.notify.info(this.l('SavedSuccessfully'));
                this._router.navigate(['/app/admin/appSubscriptionPlans/appTenantInvoices']);
            })
    }

    saveAndNew(): void {
        this.saving = true;

        this._appTenantInvoicesServiceProxy.createOrEdit(this.appTenantInvoice)
            .pipe(finalize(() => {
                this.saving = false;
            }))
            .subscribe(x => {
                this.saving = false;
                this.notify.info(this.l('SavedSuccessfully'));
                this.appTenantInvoice = new CreateOrEditAppTenantInvoiceDto();
            });
    }
    //I43
    fileChange(
        event,
        attachmentCategory: GetSycAttachmentCategoryForViewDto,
        index?: number,
        aspectRatio?: number,
        cropWithoutOptions?: boolean
    ) {
        this.formTouched = true;
        if (event.target.value) {
            this.tempUploadImage(
                event,
                attachmentCategory,
                event.target.data,
                index
            );

            event.target.value = null;

        }
    }

    imageCategory: GetSycAttachmentCategoryForViewDto =
        new GetSycAttachmentCategoryForViewDto({
            imgURL: null,
            sycAttachmentCategory: new SycAttachmentCategoryDto({
                code: "FILE",
                name: "file",
                attributes: null,
                parentCode: null,
                parentId: null,
                id: 6,
            } as any),
            sycAttachmentCategoryName: "",
        });




//I43

    tempUploadImage(
        event: Event,
        attachmentCategory: GetSycAttachmentCategoryForViewDto,
        croppedImageContent: ImageCropperComponent,
        index?: number
    ) {
        const file = (event.target as HTMLInputElement).files[0];

        if (
            this.appTenantInvoice.entityAttachments == null ||
            this.appTenantInvoice.entityAttachments == undefined
        ) {
            this.appTenantInvoice.entityAttachments = [];
        }
        // create GuId
        let guid = this.guid();
        // create app attachment entity
        let att: AppEntityAttachmentDto = new AppEntityAttachmentDto();
        att.index = index;
        att.fileName = file?.name;
        att.attachmentCategoryId = attachmentCategory.sycAttachmentCategory.id;
        att.guid = guid;
        const tempFile = guid + file.name.match(/\.[0-9a-z]+$/i)[0];
        this.addTempAttachments([tempFile]);
        this.appTenantInvoice.entityAttachments[index] = att;


        this.uploadFileAttachment(file, att);

        // if all is filled with images add new input
        if (
            this.attachmentsSrcs.every((elem) => elem) &&
            this.attachmentsSrcs.length < 10
        )
            this.attachmentsSrcs.push("");
    }
    //I43
    //I43 ISSUES Menna
    draggingIndex: number | null = null;

    onDragOver(event: DragEvent, i: number) {
      event.preventDefault();
      this.draggingIndex = i;
    }
    
    onDragLeave(event: DragEvent) {
      event.preventDefault();
      this.draggingIndex = null;
    }
    
    onFileDrop(event: DragEvent, attachmentCategory: any, startIndex: number) {
        event.preventDefault();
        this.draggingIndex = null;
      
        const files = Array.from(event.dataTransfer?.files || []);
      
        if (files.length === 0) {
          this.notify.warn('No files detected.');
          return;
        }
      
        files.forEach((file, offset) => {
          const index = startIndex + offset;
      
          const fakeEvent = {
            target: {
              files: [file],
              value: 'dropped'
            }
          };
      
          this.fileChange(fakeEvent, attachmentCategory, index, undefined, true);
        });
      }
      
      isImage(filePath: string): boolean {
        return /\.(jpg|jpeg|png|gif)$/i.test(filePath);
      }

}
