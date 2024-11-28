import { Component, ViewChild, Injector, Output, EventEmitter, OnInit} from '@angular/core';
import { BsModalRef, BsModalService, ModalDirective, ModalOptions } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AppEntityAttachmentDto, AppTenantInvoicesServiceProxy, AppTenantSubscriptionPlansServiceProxy, CreateOrEditAppTenantInvoiceDto, GetSycAttachmentCategoryForViewDto, SycAttachmentCategoryDto, TenantInformation } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import {Observable, config} from "@node_modules/rxjs";
import { ImageCropperComponent } from "@app/shared/common/image-cropper/image-cropper.component";
import { SelectAppItemTypeComponent } from '@app/app-item-type/select-app-item-type/select-app-item-type.component';
import { AppEntityListDynamicModalComponent } from '@app/app-entity-dynamic-modal/app-entity-list-dynamic-modal/app-entity-list-dynamic-modal.component';

//import { ImageCropperComponent } from 'ngx-image-cropper';
//import { SelectAppItemTypeComponent } from '@app/app-item-type/select-app-item-type/select-app-item-type.component';





@Component({
    templateUrl: './create-or-edit-appTenantInvoice.component.html',
    animations: [appModuleAnimation()]
})
export class CreateOrEditAppTenantInvoiceComponent extends AppComponentBase implements OnInit {
    active = false;
    saving = false;
    attachmentsSrcs: string[] = Array(1).fill("");
    appTenantInvoice: CreateOrEditAppTenantInvoiceDto = new CreateOrEditAppTenantInvoiceDto();
    TenantList: TenantInformation[];
    
    //private _appTenantSubscriptionPlansServiceProxy: any;





    constructor(
        injector: Injector,
        private _activatedRoute: ActivatedRoute,     
        private _BsModalService: BsModalService,   
        private _appTenantInvoicesServiceProxy: AppTenantInvoicesServiceProxy,
        private _appTenantSubscriptionPlansServiceProxy: AppTenantSubscriptionPlansServiceProxy,
        private _router: Router
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.show(this._activatedRoute.snapshot.queryParams['id']);
        this._appTenantSubscriptionPlansServiceProxy.getTenantsList()
        .subscribe((tenantLst: any) => {
            this.TenantList = tenantLst;
        });
    }
    onChange(op: any){
        const pos = this.TenantList.findIndex(z=>z.id==op.value);
        var tenObj = this.TenantList[pos];
       if (tenObj != undefined)
       {
         this.appTenantInvoice.tenantName = tenObj.name;
        // this.appTenantSubscriptionPlan.tenantId = op.value;
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
        
        this._appTenantInvoicesServiceProxy.createOrEdit(this.appTenantInvoice)
            .pipe(finalize(() => {
                this.saving = false;
            }))
            .subscribe(x => {
                 this.saving = false;               
                 this.notify.info(this.l('SavedSuccessfully'));
                 this._router.navigate( ['/app/admin/appSubscriptionPlans/appTenantInvoices']);
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
        let { onCropDone, data } = this.openImageCropper(
            event,
            aspectRatio,
            cropWithoutOptions
        );
        let subs = onCropDone.subscribe((res) => {
            if (data.isCropDone) {
                this.tempUploadImage(
                    event,
                    attachmentCategory,
                    data,
                    index
                );
            }
            // reset input
            event.target.value = null;
            subs.unsubscribe();
        });
    }
}

imageCategory: GetSycAttachmentCategoryForViewDto =
new GetSycAttachmentCategoryForViewDto({
    imgURL: null,
    sycAttachmentCategory: new SycAttachmentCategoryDto({
        code: "IMAGE",
        name: "Image",
        attributes: null,
        parentCode: null,
        parentId: null,
        id: 3,
    } as any),
    sycAttachmentCategoryName: "",
});


tempUploadImage(
    event: Event,
    attachmentCategory: GetSycAttachmentCategoryForViewDto,
    croppedImageContent: ImageCropperComponent,
    index?: number
) {
    const file = (event.target as HTMLInputElement).files[0];
    attachmentCategory.imgURL =
        croppedImageContent.croppedImageAsBase64 as string;

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
    // save image as a base64
    this.attachmentsSrcs[index] =
        croppedImageContent.croppedImageAsBase64 as string;
    this.appTenantInvoice.entityAttachments[index] = att;
    

    this.uploadBlobAttachment(croppedImageContent.croppedImage, att);

    // if all is filled with images add new input
    if (
        this.attachmentsSrcs.every((elem) => elem) &&
        this.attachmentsSrcs.length < 10
    )
        this.attachmentsSrcs.push("");
}
//I43












}
