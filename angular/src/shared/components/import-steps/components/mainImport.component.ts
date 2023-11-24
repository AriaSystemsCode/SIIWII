import { EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ViewChild } from "@angular/core";
import { Component } from "@angular/core";
import { BrowseFolderComponent } from "./browseFolder.component";
import { HttpClient } from "@angular/common/http";
import { AppComponentBase } from "@shared/common/app-component-base";
import { Injector } from "@angular/core";
import { FileUploader, FileUploaderOptions } from "ng2-file-upload";
import { IAjaxResponse } from "abp-ng2-module";
import { uploadStatusComponent } from "./uploadStatus.component";
import { ImageFile } from "../models/imageFile.model";
import { upperCase } from "lodash";
import { isEmpty } from "lodash";
import { imageCroppingComponent } from "./imageCropping.Component";
import { autoCropComponent } from "./autoCrop.component";
import { MainImportService } from "../services/mainImport.service";
import { importConfirmationComponent } from "./importConfirmation.component";
import { FileUploaderCustom } from "../models/FileUploaderCustom.model";
import { base64ToFile } from "ngx-image-cropper";
import { AppConsts } from "@shared/AppConsts";
import { successfullyImportComponent } from "./successfullyImport.component";
import { finalize } from "rxjs/operators";
import Swal from "sweetalert2";
import { FileDownloadService } from "@shared/download/fileDownload.service";
import { Observable } from "rxjs";
import { ProgressComponent } from "@app/shared/common/progress/progress.component";
import { ImportTypes } from "../models/ImportTypes";
import { SycAttachmentCategoryDto } from "@shared/service-proxies/service-proxies";
import { ImportStepInfo } from "../models/ImportStepInfo";
import { ImportStepsEnum } from "../models/ImportStepsEnum";

@Component({
    selector: "MainImportModal",
    templateUrl: "./mainImport.component.html",
    styleUrls: ["./mainImport.component.scss"],
})
export class MainImportComponent
    extends AppComponentBase
    implements OnInit {
    @ViewChild("BrowseModal", { static: true })
    BrowseModal: BrowseFolderComponent;
    @ViewChild("ProgressModal", { static: true })
    ProgressModal: ProgressComponent;
    @ViewChild("StatusModal", { static: true })
    StatusModal: uploadStatusComponent;
    @ViewChild("AutoCropModal", { static: true })
    AutoCropModal: autoCropComponent;
    @ViewChild("imageCroppingModal", { static: true })
    imageCroppingModal: imageCroppingComponent;
    @ViewChild("importConfirmationModal", { static: true })
    importConfirmationModal: importConfirmationComponent;
    @ViewChild("successfullyImportModal", { static: true })
    successfullyImportModal: successfullyImportComponent;

    //Step1
    UploadedFolder: File[] = [];
    imagesName: string[] = [];
    imagesList: ImageFile[] = [];
    uploadUrl: string = "";
    uploader: FileUploader;
    imagesUploader: FileUploaderCustom;
    _guid: string = "";
    progress: number;

    //Step2
    progressHeader: string;
    ProgressDetail: string;

    //Step3
    uploadingResult: any = null;
    uploadindResultExcelList: any[] = null;
    totalPassedRecords: number;
    totalFailedRecords: number;

    //Step4
    imageFailed: number = 0;
    imagePassed: number = 0;
    failedImagesIndex: number[] = [];
    //Step5
    autoCrop: string = "";
    finalImages: ImageFile[] = [];
    finalUploadedImages: ImageFile[] = [];
    guids: string[] = [];
    finishCropping: boolean;
    Previous: boolean = false;
    OnChange: boolean;

    //Step6
    finalCountFailed: number;
    finalCountPassed: number;
    repreateHandler: number;
    passedImages: File[] = [];

    //step7
    logFileUrl: string;
    logFileName: string;
    importType: ImportTypes;
    importService: any;
    importServiceProxy: any;
    serviceUtilitesProxy: any;
    serviceUtilites: any;
    sycAttachmentCategory: { [key: string]: SycAttachmentCategoryDto };
    skipAutoCropModal:boolean;
    hasImages: boolean;
    currentStep: ImportStepInfo;
    importStepsInfo: ImportStepInfo[];
    @Output() finishImport = new EventEmitter<boolean>();


    public constructor(
        private _httpClient: HttpClient,
        private _importService: MainImportService,
        private _downloadService: FileDownloadService,
        private injector: Injector
    ) {
        super(injector);
    }

    ngOnInit() {
        this.guids = [];
    }

    async show(importType: ImportTypes, importService: any, serviceUtilites: any, attachmetnCategoriesCodes: string[], hasImages: boolean, importStepsInfo: ImportStepInfo[]) {
        this.importStepsInfo = importStepsInfo;
        this.guids = [];
        this.hasImages = hasImages;
        this.skipAutoCropModal=false;
        this.Previous=false;
        this.sycAttachmentCategory = {};
        if (attachmetnCategoriesCodes) {
            this.getSycAttachmentCategoriesByCodes(attachmetnCategoriesCodes).subscribe((result) => {
                result.forEach(attach => {
                    var aspectRatioNumbers = attach.aspectRatio.split(":");
                    var num1 = Number(aspectRatioNumbers[0]);
                    var num2 = Number(aspectRatioNumbers[1]);
                    let aspectRatio = num1 / num2;
                    this.sycAttachmentCategory[attach.code.toUpperCase()] = attach;
                    this.sycAttachmentCategory[attach.code.toUpperCase()].aspectRatio = aspectRatio.toString();
                });
            });
        }

        this.importType = importType;
        this.importService = importService;
        this.serviceUtilites = serviceUtilites;
        this.importServiceProxy = this.injector.get(this.importService);
        this.serviceUtilitesProxy = this.injector.get(this.serviceUtilites);
        this.UploadedFolder = [];
        this.imagesName = [];
        this.imagesList = [];
        this.uploadUrl = "";
        this.uploader = null;
        this._guid = "";
        this.progress = 0;
        this.progressHeader = "";
        this.ProgressDetail = "";
        this.uploadingResult = null;
        this.uploadindResultExcelList = null;
        this.imageFailed = 0;
        this.imagePassed = 0;
        this.failedImagesIndex = [];
        this.autoCrop = "";
        this.progress = 0;
        this.totalPassedRecords = 0;
        this.totalFailedRecords = 0;
        this.imageFailed = 0;
        this.imagePassed = 0;
        this.finalCountFailed = 0;
        this.finalCountPassed = 0;
        this.repreateHandler = 0;

        this.currentStep = importStepsInfo[0];
        this.changeStep();
    }

    onUploadedFolder($event: any) {
        this.BrowseModal.hide();
        this.UploadedFolder = $event;
        this.uploadUrl = "/Attachment/UploadFiles";
        this.uploader = this.createUploader(this.uploadUrl);
        for (let i = 0; i < this.UploadedFolder.length; i++) {
            var file = this.UploadedFolder[i];

            if (file.type.includes("image") && this.hasImages) {
                if (this._importService.checkImageValidExt(file.name, this.sycAttachmentCategory, "image")) {
                    this.imagesName.push(file.name.toUpperCase());
                    var imgFile = new ImageFile();
                    imgFile.file = file;
                    this.imagesList.push(imgFile);
                }
            }

            if (file.type.includes("sheet")) {
                this.uploader.addToQueue(new Array<File>(file));
            }
        }
        if (this.uploader.queue.length == 0) {
            var _fileName = "";
            _fileName = ImportTypes[this.importType] + ".xlsx";


            Swal.fire(
                " ",
                "Folder not have excel file with name " +
                _fileName +
                ", can not import.",
                "error"
            );
        } else {
            this.uploader.onSuccessItem = (item, response, status) => {
                const ajaxResponse = <IAjaxResponse>JSON.parse(response);
                if (ajaxResponse.success) {
                    setTimeout(() => {
                        this.CheckRatio();
                    }, 0);

                    this.ProgressModal.hide();
                    this.spinnerService.show();
                    this.importServiceProxy
                        .validateExcel(this._guid, this.imagesName)
                        .pipe(finalize(() => this.spinnerService.hide()))
                        .subscribe((result) => {
                            this.logFileUrl =
                                result?.excelLogDTO?.excelLogPath;
                            this.logFileName =
                                result?.excelLogDTO?.excelLogFileName;
                            if (!isEmpty(result?.errorMessage)) {
                                Swal.fire(
                                    " ",
                                    result?.errorMessage,
                                    "error"
                                );
                            } else {
                                this.uploadingResult = result;
                                this.goNext();
                                if(this.hasImages){
                                let ret = this.serviceUtilitesProxy.checkImagesExistance(result, this.imagesList, this.sycAttachmentCategory);
                                this.imagePassed = ret.imagePassed;
                                this.imageFailed = ret.imageFailed;
                                this.failedImagesIndex = ret.failedImagesIndex;
                                }
                            }
                        });
                } else {
                    this.notify.error(this.l("ExcelVersionIsNotCompatible"));
                }
            };

            this._guid = this.guid();
            this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
                form.append("guid", this._guid);
            };

            this.uploader.uploadAll();
            this.ProgressModal.show();
            this.progressHeader = this.l(("Import" + ImportTypes[this.importType]));


            this.ProgressDetail = this.l("Importdocumentsyouwanttoshare");
            this.uploader.onProgressAll = (progress) => {
                this.progress = progress;
            };

            this.uploader.onCompleteAll = () => {
                this.progress = 100;
            };
        }
    }



    ontotalFailedRecords($event) {
        this.totalFailedRecords = $event;
    }

    ontotalPassedRecords($event) {
        this.totalPassedRecords = $event;
    }

    imageCroppingGoBack($event: boolean) {
        if ($event) {
            this.Previous = true;
            this.goPrevious();
        }
    }

    CheckRatio() {
        var ratio = 0;
        for (let i = 0; i < this.imagesList.length; i++) {
            var image = this.imagesList[i].file;
            const reader = new FileReader();
            reader.readAsDataURL(image);
            reader.onload = () => {
                const img = new Image();
                img.src = reader.result as string;
                this.imagesList[i].tempBase64 = img.src;
                img.onload = () => {
                    const height = img.naturalHeight;
                    const width = img.naturalWidth;
                    this.imagesList[i].ratio =
                        Math.round((width / height) * 100) / 100;
                };
            };
        }
    }

    onautoCrop($event: any) {
        this.autoCrop = $event;
         this.goNext();
        if (this.finalImages && this.finalImages.length > 0) {
            this.imageCroppingModal.show(
                $event,
                this.imagePassed,
                this.imageFailed,
                this.importType, this.sycAttachmentCategory
            );

            this.OnChange = !this.OnChange;
        } else this.goNext();
    }

    onfinalImages($event: any) {
        this.finalImages = $event;
    }
    onfinishCropping($event: any) {
        this.finishCropping = $event;
    }

    onfinalCountFailed($event) {
        this.finalCountFailed = $event;
    }
    onfinalCountPassed($event) {
        this.finalCountPassed = $event;
    }

    askToClose($event: boolean) {
        var isConfirmed: Observable<boolean>;
        isConfirmed = this.askToConfirm("Are you sure you want to cancel importing?", "",
            {
                confirmButtonText: this.l("Yes"),
                cancelButtonText: this.l("No"),
            });

        isConfirmed.subscribe((res) => {
            if (res) {
              this.hideAllmodal();
            }
        }
        );
    }

    onrepreateHandler($event: number) {
        this.repreateHandler = $event;
    }

    importConfirmationGoBack() {
            if (this.skipAutoCropModal || !this.hasImages ) {
                this.Previous = true;
                this.goPrevious();
            }

            else {
                this.goPrevious();
                this.OnChange = !this.OnChange;
                this.imageCroppingModal.show(
                    this.autoCrop,
                    this.finalCountPassed,
                    this.finalCountFailed,
                    this.importType, this.sycAttachmentCategory
                );
            }
    }

    callImport(iterationNo: number) {
        //this.progress=(this.uploadingResult.toList[iterationNo]*100/this.uploadingResult.totalRecords);
        var toValue = this.uploadingResult.toList[iterationNo];
        if (toValue > 1) { toValue = toValue - 1; }
        //   this.progress = (toValue * 100 / this.uploadingResult.totalRecords);
        this.progress = Math.round((toValue / this.uploadingResult.totalRecords) * 100);


        this.ProgressDetail = this.uploadingResult.codesFromList[iterationNo] + "[" + this.uploadingResult.fromList[iterationNo] + "-" + this.uploadingResult.toList[iterationNo] + "]";
        if (iterationNo < this.uploadingResult.fromList.length) {
            this.uploadingResult.from = this.uploadingResult.fromList[iterationNo]
            this.uploadingResult.to = this.uploadingResult.toList[iterationNo]

            this.uploadingResult.excelRecords = null;
            this.uploadingResult.excelRecords = this.uploadindResultExcelList.slice(
                this.uploadingResult.from - 2, this.uploadingResult.to - 2 + 1);
            this.importServiceProxy
                .saveFromExcel(this.uploadingResult)
                .pipe(finalize(() => {

                    if (iterationNo == this.uploadingResult.fromList.length - 1) {
                        this.spinnerService.hide()
                        this.ProgressModal.hide();
                    }

                }))
                .subscribe((result) => {

                    if (iterationNo == this.uploadingResult.fromList.length - 1) {
                        this.logFileUrl = result.excelLogPath;
                        this.logFileName = result.excelLogFileName;

                        this.successfullyImportModal.show(this.importType);
                    }
                    else {
                        this.callImport(iterationNo + 1);
                    }
                }
                    , (error) => {
                        //console.log("error happen in iteration "+iterationNo.toString() + " From:"+this.uploadingResult.from + " To: "+ this.uploadingResult.to )
                        //this.callImport(iterationNo+1);
                        if (iterationNo == this.uploadingResult.fromList.length - 1) {
                            this.successfullyImportModal.show(this.importType);
                        }
                        else {
                            this.callImport(iterationNo + 1);
                        }
                    }
                );
        }
    }

    createUploader(
        url: string,
        success?: (result: any) => void
    ): FileUploaderCustom {
        const uploader = new FileUploaderCustom({
            url: AppConsts.remoteServiceBaseUrl + url,
        });

        uploader.onAfterAddingFile = (file) => {
            file.withCredentials = false;
        };

        const uploaderOptions: FileUploaderOptions = {};
        uploaderOptions.authToken = "Bearer " + this.tokenService.getToken();
        uploaderOptions.removeAfterUpload = true;
        uploader.setOptions(uploaderOptions);
        return uploader;
    }

    onDownloadLogFile($event) {
        let attach = AppConsts.attachmentBaseUrl;
        let fullURL = `${attach}/${this.logFileUrl}`;
        //let fullURL = `${url}`; // FOR Local Use
        this._downloadService.download(fullURL, this.logFileName);
    }

    goPrevious() {
        if (this.currentStep.stepNumber - 1 >= 0)
            this.currentStep = this.importStepsInfo[this.currentStep.stepNumber - 1];
        else
            this.currentStep = this.importStepsInfo[0];
        this.changeStep();
    }

    goNext() {
        if (this.currentStep.stepNumber + 1 < this.importStepsInfo.length)
            this.currentStep = this.importStepsInfo[this.currentStep.stepNumber + 1];
        else
            this.currentStep = this.importStepsInfo[this.importStepsInfo.length]
        this.changeStep();
    }

    hideAllmodal(){
        this.BrowseModal.hide();
        this.StatusModal.hide();
        this.AutoCropModal.hide();
        this.imageCroppingModal.hide();
        this.importConfirmationModal.hide();
        this.successfullyImportModal.hide();
        this.ProgressModal.hide();
    }

    changeStep() {
        this.hideAllmodal();
        switch (this.currentStep.stepEnum) {
            case ImportStepsEnum.BrowseModalStep:
                this.BrowseModal.show(this.importType, this.importService, this.hasImages);
                break;

            case ImportStepsEnum.StatusModalStep:
                this.StatusModal.show(this.importType);
                break;

            case ImportStepsEnum.AutoCropModalStep:
                this.skipAutoCropModal=false;
                if (!this.AutoCropModal.show(this.importType, this.sycAttachmentCategory)) {
                    this.skipAutoCropModal=true;
                    if (this.Previous) {
                        this.Previous = false;
                       this.goPrevious();
                    } else this.onautoCrop("false");
                }
                break;

            case ImportStepsEnum.imageCroppingModalStep:
                if (this.skipAutoCropModal && this.Previous) 
                    this.goPrevious();
                break;

            case ImportStepsEnum.importConfirmationModalStep:
                this.importConfirmationModal.show(this.importType, this.uploadingResult.hasDuplication, this.hasImages);
            break;

            case ImportStepsEnum.successfullyImportModalStep :
                    this.passedImages = [];
                    this.uploadingResult.repreateHandler = this.repreateHandler;
        
                    this.uploadUrl = "/Attachment/UploadFiles";
        
                    this.imagesUploader = this.createUploader(this.uploadUrl);
        
                    this.finalImages.forEach((image) => {
                        if (image.finalStatus) {
                            let file: File;
                            if (isEmpty(image.croppedbase64)) file = image.file;
                            else {
                                let fileAsBlob = <File>(
                                    base64ToFile(image.croppedbase64)
                                );
                                file = new File([fileAsBlob], image.file.name);
                            }
        
                            image.Guid = this.guid();
                            this.passedImages.push(file);
                            this.finalUploadedImages.push(image);
                            this.guids.push(image.Guid);
                        }
                    });
        
                    this.imagesUploader.addToQueue(this.passedImages);
                    this.imagesUploader.onBuildItemForm = (
                        fileItem: any,
                        form: any
                    ) => {
                        for (let i = 0; i < this.guids.length; i++) {
                            form.append("guid" + i, this.guids[i]);
                        }
                    };
        
                    this.ProgressModal.show();
                    this.progressHeader = this.l(("Import" + ImportTypes[this.importType]));
        
                    this.ProgressDetail = this.l("Importdocumentsyouwanttoshare");
        
                    this.imagesUploader.onProgressAll = (progress) => {
                        this.progress = Math.round((progress.loaded / progress.total) * 100);
                    };
        
                    this.imagesUploader.onErrorItem = (item, response, status) => {
                        this.notify.error(this.l("UploadFailed"));
                    };
        
                    this.imagesUploader.onSuccessItem = (item, response, status) => {
                        const ajaxResponse = <IAjaxResponse>JSON.parse(response);
        
                        this.progress = 100;
        
                        var ret = this.serviceUtilitesProxy.setImagesGuids(this.uploadingResult, this.finalUploadedImages);
                        this.uploadingResult = ret;
                        this.uploadindResultExcelList = this.uploadingResult.excelRecords.slice();
                        this.callImport(0);
        
                    };
                    this.imagesUploader.uploadAllFiles();
                break;

            default:
                break;
        }
    }

    onFinishImport($event){
    this.finishImport.emit($event);
    }
}

