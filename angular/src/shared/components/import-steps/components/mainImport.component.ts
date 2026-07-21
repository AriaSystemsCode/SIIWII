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
import { result, upperCase } from "lodash";
import { isEmpty } from "lodash";
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
import { AppEntitiesServiceProxy, AppItemsServiceProxy, AppItemtExcelRecordDTO, GetAppEntityForEditOutput, ImportItemInputDto, ImportItemReturnDto, SycAttachmentCategoryDto } from "@shared/service-proxies/service-proxies";
import { ImportStepInfo } from "../models/ImportStepInfo";
import { ImportStepsEnum } from "../models/ImportStepsEnum";
import { videoTutorialComponent } from "./videoTutorial.component";
import { imageCroppingComponent } from "./imageCropping.Component";
import { debug } from "console";

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
    skipAutoCropModal: boolean;
    hasImages: boolean;
    currentStep: ImportStepInfo;
    importStepsInfo: ImportStepInfo[];
    @Output() finishImport = new EventEmitter<boolean>();
    validMethodName;
    saveMethodName;

    @ViewChild("videoModal", { static: true })
    videoModal: videoTutorialComponent;
    updateLookups: boolean = false;
    folder_details: boolean = false;
    imData: boolean = false;
    imImages: boolean = false;
    invalidImport: boolean = false;
    limitImImages = 100;
    updatedRecordData;
    _resetRecords: boolean = false;
    callValid: boolean = false;

    public constructor(
        private _httpClient: HttpClient,
        private _importService: MainImportService,
        private _downloadService: FileDownloadService,
        private injector: Injector,
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy
    ) {
        super(injector);
    }

    ngOnInit() {
        this.guids = [];
    }

    aspectRatioNumbers;
    async show(importType: ImportTypes, importService: any, serviceUtilites: any, attachmetnCategoriesCodes: string[], hasImages: boolean, importStepsInfo: ImportStepInfo[]) {
        this.invalidImport = false;
        this.importStepsInfo = importStepsInfo;
        this.guids = [];
        this.hasImages = hasImages;
        this.skipAutoCropModal = false;
        this.Previous = false;
        this.sycAttachmentCategory = {};
        this.finalImages = [];
        if (attachmetnCategoriesCodes) {
            this.getSycAttachmentCategoriesByCodes(attachmetnCategoriesCodes).subscribe((result) => {
                result.forEach(attach => {
                    var _aspectRatioNumbers = attach.aspectRatio ? attach.aspectRatio : "1:1";
                    this.aspectRatioNumbers=  attach?.name?.toLowerCase()?.includes('image')  ?   _aspectRatioNumbers  :"1:1" ; 
                    this.BrowseModal.aspectRatioNumbers =  this.aspectRatioNumbers;
                    var aspectRatioNumbers = _aspectRatioNumbers.split(":");
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
        this.validMethodName = this.importType != ImportTypes.price ? 'validateExcel' : 'validatePriceCSV';
        this.saveMethodName = this.importType != ImportTypes.price ? 'saveFromExcel' : 'savePriceFromCSV';
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
        let hasExcelFile = false;
        let hasImageFile = false;
        let invalidImagesCount = 0;
        let totalImageFiles = 0;
        let fakeProgress = 0;
        const interval = setInterval(() => {
            // Increase the fake progress gradually
            if (fakeProgress < 95) {
                fakeProgress += 10;
                this.progress = fakeProgress;
            }
        }, 100);


        if (this.importType == ImportTypes.Items && this.imImages) {
            let limitUploadImage = this.imData ? this.limitImImages + 1 : this.limitImImages;

            if (this._totalFiles > limitUploadImage) {
                this.invalidImport = true;
                Swal.fire(
                    " ",
                    "Image files limit is " + this.limitImImages + " files per import session, can not import.",
                    "error"
                );
                return;
            }
        }

        for (let i = 0; i < this.UploadedFolder.length; i++) {
            const file = this.UploadedFolder[i];
            if (file.name.startsWith("~$")) 
                continue;

            const isSheet = file.type.includes("sheet") ||  file.type.includes("text/csv");
            const isImage = file.type.includes("image") || this.isSupportedImportImage(file.name);
            if (isSheet && (this.importType !== ImportTypes.Items || this.imData)) {   
                hasExcelFile = true;
                this.uploader.addToQueue(new Array<File>(file));
            }

           
                if (isImage && (this.importType !== ImportTypes.Items || this.imImages)) {  
                hasImageFile = true;
                if (file.type.includes("image") && this.hasImages) {
                    totalImageFiles++;
                    if (this.isSupportedImportImage(file.name)) {
                        this.imagesName.push(file.name.toUpperCase());
                        var imgFile = new ImageFile();
                        imgFile.file = file;
                        this.imagesList.push(imgFile);
                    }
                    else
                        invalidImagesCount++;
                }
            }
        }



            if (!hasExcelFile && (this.imData || this.importType !== ImportTypes.Items)) {
            this.invalidImport = true;
            Swal.fire(
                " ",
                "Folder doesn't contain the Import " + ImportTypes[this.importType] + " Excel Template file, can not import.",
                "error"
            );
            return;
        }

        if (this.imImages && !hasImageFile) {
            this.invalidImport = true;
            Swal.fire(
                " ",
                "Folder doesn't contain Image files, can not import.",
                "error"
            );
            return;
        }

        if (this.imImages) {
            if (invalidImagesCount === totalImageFiles && totalImageFiles > 0) {
                this.invalidImport = true;
                Swal.fire(
                    " ",
                    "Image format is not supported ,the supported formats are JPG and PNG",
                    "error"
                );
                return;
            }
            else if (invalidImagesCount > 0) {
                Swal.fire(
                    " ",
                    "Image files should be of (PNG) or (JPG) formats , all other file formats will be neglected",
                    "warning"
                );

            }
        }

       
            if (this.uploader.queue.length == 0  && (this.imData || this.importType !== ImportTypes.Items)) {
            this.invalidImport = true;
            var _fileName = "";
            _fileName = ImportTypes[this.importType] + ".xlsx";

            Swal.fire(
                " ",
                "Folder doesn't contain excel file with name " +
                _fileName +
                ", can not import.",
                "error"
            );
            return;
        }
        this.callValid=false;

            if (!this.invalidImport && (this.imData || this.importType !== ImportTypes.Items)) {
            this.uploader.onSuccessItem = (item, response, status) => {
                const ajaxResponse = <IAjaxResponse>JSON.parse(response);
                if (ajaxResponse?.success) {
                    setTimeout(() => {
                        this.CheckRatio();
                    }, 0);

                    this.callValid=true;

                    this.importServiceProxy[this.validMethodName](this._guid, this.imagesName)
                        .pipe(finalize(() => {
                            this.progress = 100;
                            clearInterval(interval);
                            this.ProgressModal.hide();
                        }
                        ))
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
                                if (this.hasImages) {
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
            this.folder_details = false;
            this.progress = 0;
            this.ProgressModal.show();
           // this.progressHeader = this.l(("Import" + ImportTypes[this.importType]));
           // this.ProgressDetail = this.l("Importdocumentsyouwanttoshare");
           
           this.progressHeader =  "Uploading Folder";
           this.ProgressDetail ="Uploading the files that you want to import";


            /*  this.uploader.onProgressAll = (progress) => {
                 this.progress = progress;
 
             }; */

            /* this.uploader.onCompleteAll = () => {
                this.progress = 100;
            }; */
        }

            if (!this.callValid  && !this.invalidImport && this.importType == ImportTypes.Items && !this.imData) {   
            setTimeout(() => {
                this.CheckRatio();
            }, 0);

            this.importServiceProxy[this.validMethodName](this._guid, this.imagesName)
                .pipe(finalize(() => {
                    this.progress = 100;
                    clearInterval(interval);
                    this.ProgressModal.hide();
                }
                )).subscribe((result) => {
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
                        if (this.hasImages) {
                            let ret = this.serviceUtilitesProxy.checkImagesExistance(result, this.imagesList, this.sycAttachmentCategory);
                            this.imagePassed = ret.imagePassed;
                            this.imageFailed = ret.imageFailed;
                            this.failedImagesIndex = ret.failedImagesIndex;
                        }
                    }
                });

            this.folder_details = false;
            this.ProgressModal.show();
            //this.progressHeader = this.l(("Import" + ImportTypes[this.importType]));
            //this.ProgressDetail = this.l("Importdocumentsyouwanttoshare");
            
            this.progressHeader =  "Uploading Folder";
            this.ProgressDetail ="Uploading the files that you want to import";
        }

    }

    private isSupportedImportImage(fileName: string): boolean {
        const extension = fileName?.split('.').pop()?.toLowerCase();
        return extension === 'jpg' || extension === 'jpeg' || extension === 'png';
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
        if (!this.Previous)
            this.goNext();

        if (!(this.finalImages && this.finalImages?.length > 0))
            this.finalImages = this.imagesList;


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
                this._resetRecords = true;
                this.hideAllmodal();
            }
        }
        );
    }

    onResetRecordsCompleted() {
        this._resetRecords = false;
      }
    onrepreateHandler($event: number) {
        this.repreateHandler = $event;
    }

    importConfirmationGoBack() {
        if (this.skipAutoCropModal || !this.hasImages) {
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

    remainingFiles;
    estimatedRemainingTime = 0;
    avgTimePerFile = 0;
    uploadStartTime = Date.now();
    uploadedFilesCount = 1;
    callImport(iterationNo: number) {
        if (iterationNo === 0) {
            this.uploadStartTime = Date.now();
        }

        if (this.importType === ImportTypes.Items && this.uploadingResult?.resultKey) {
            this.importServiceProxy
                .saveFromExcelResult(this.uploadingResult.resultKey, this.uploadingResult)
                .pipe(finalize(() => {
                    this.spinnerService.hide();
                }))
                .subscribe(
                    (result) => {
                        this.logFileUrl = result.excelLogPath;
                        this.logFileName = result.excelLogFileName;
                    },
                    () => {
                        //this.notify.error("Import completed with some errors. Please check the log file.");
                    }
                );
            return;
        }
    
        const hasImageRecords = this.uploadindResultExcelList?.some(r => r.recordType === 'Image');
    
        if (hasImageRecords || this.importType == ImportTypes.price) {
            this.importServiceProxy[this.saveMethodName](this.uploadingResult)
                .pipe(finalize(() => {
                    this.spinnerService.hide();
                   // this.notify.success("Your import has been completed successfully.");
                }))
                .subscribe(
                    (result) => {
                        this.logFileUrl = result.excelLogPath;
                        this.logFileName = result.excelLogFileName;
                    },
                    () => {
                        //this.notify.error("Import completed with some errors. Please check the log file.");
                    }
                );
            return;
        }
    
        if (this.importType !== ImportTypes.Items || this.imData) {
            if (iterationNo < this.uploadingResult?.fromList.length) {
                this.uploadingResult.from = this.uploadingResult?.fromList[iterationNo];
                this.uploadingResult.to = this.uploadingResult?.toList[iterationNo];
    
                this.uploadingResult.excelRecords = this.uploadindResultExcelList.slice(
                    this.uploadingResult.from - 2,
                    this.uploadingResult.to - 2 + 1
                );
            }
        }
    
        const isLastIteration = iterationNo === this.uploadingResult?.fromList?.length - 1;
        const isItemsImport = this.importType === ImportTypes.Items;
        const hasImData = !!this.imData;
        const shouldFinish = (isLastIteration && (hasImData || !isItemsImport)) || (isItemsImport && !hasImData);
    
        this.importServiceProxy[this.saveMethodName](this.uploadingResult)
            .pipe(finalize(() => {
                if (shouldFinish) {
                    this.spinnerService.hide();
                   // this.notify.success("Your import has been completed successfully.");
                }
            }))
            .subscribe(
                (result) => {
                    if (shouldFinish) {
                        this.logFileUrl = result.excelLogPath;
                        this.logFileName = result.excelLogFileName;
                    } else {
                        this.callImport(iterationNo + 1);
                    }
                },
                () => {
                    if (shouldFinish) {
                        //this.notify.error("Import completed with some errors. Please check the log file.");
                    } else {
                        this.callImport(iterationNo + 1);
                    }
                }
            );
    }

    onLoadMoreValidateExcelRecords($event: { skipCount: number; maxResultCount: number; recordType: string }) {
        if (!this.uploadingResult?.resultKey || !this.importServiceProxy?.getValidateExcelResultPage) {
            this.StatusModal.loadingMoreRecords = false;
            return;
        }

        this.importServiceProxy
            .getValidateExcelResultPage(
                this.uploadingResult.resultKey,
                $event.skipCount,
                $event.maxResultCount,
                $event.recordType
            )
            .subscribe(
                (result) => {
                    this.StatusModal.appendRecords(
                        result?.excelRecords || [],
                        result?.totalDisplayRecords,
                        $event.recordType
                    );
                },
                () => {
                    this.StatusModal.loadingMoreRecords = false;
                }
            );
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

        const uploaderOptions: Partial<FileUploaderOptions> = {};
        uploaderOptions.authToken = "Bearer " + this.tokenService.getToken();
        uploaderOptions.removeAfterUpload = true;
        uploader.setOptions(uploaderOptions as FileUploaderOptions);
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

    hideAllmodal() {
        this.BrowseModal.hide();
        this.StatusModal.hide();
        //this.AutoCropModal.hide();
        this.imageCroppingModal.hide();
        this.importConfirmationModal.hide();
        this.successfullyImportModal.hide();
        this.ProgressModal.hide();
        this.videoModal.hide();
        if (this.BrowseModal)
            this.BrowseModal.clearFileInput();
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
                this.skipAutoCropModal = false;
                // if (!this.AutoCropModal.show(this.importType, this.sycAttachmentCategory)) {
                //this.skipAutoCropModal = true;
                if (this.Previous) {
                    this.Previous = false;
                    this.goPrevious();
                } else this.onautoCrop("false");
                // }
                break;

            case ImportStepsEnum.imageCroppingModalStep:
                if (this.skipAutoCropModal && this.Previous)
                    //this.goPrevious();
                    this.onautoCrop("false");

                if (!this.hasImages && this.Previous)
                    this.goPrevious();
                break;

            case ImportStepsEnum.importConfirmationModalStep:
                this.importConfirmationModal.show(this.importType, this.uploadingResult.hasDuplication, this.hasImages);
                break;

            case ImportStepsEnum.successfullyImportModalStep:
                this.passedImages = [];
                this.uploadingResult.repreateHandler = this.repreateHandler;
                this.uploadingResult.updateColorsToLookUp = this.updateLookups;

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
               // this.ProgressModal.show();
                // this.progressHeader = this.l(("Import" + ImportTypes[this.importType]));
              //  this.progressHeader = "Uploading folder contents";
                this.progressHeader =  "Uploading Folder";
                //this.ProgressDetail = this.l("Importdocumentsyouwanttoshare");

                


                this.imagesUploader.onProgressAll = (progress) => {
                    this.progress = Math.ceil((progress.loaded / progress.total) * 100);

                    var toValue = this.passedImages.length * (progress.loaded / progress.total);
                    if (toValue > 1) { toValue = toValue - 1; }
                    this.remainingFiles = this.uploadingResult.totalRecords - toValue;
                    this.remainingFiles = this.remainingFiles >= 0 ? this.remainingFiles : 1;

                    const uploadedSoFar = toValue;
                    this.uploadedFilesCount = Math.floor(uploadedSoFar);

                    const now = Date.now();
                    const elapsedSeconds = (now - this.uploadStartTime) / 1000;

                    if (uploadedSoFar > 0) {
                        const avgTimePerFile =
                            (this.avgTimePerFile * (uploadedSoFar - 1) + (elapsedSeconds / uploadedSoFar)) / uploadedSoFar;

                        const estimatedRemainingSeconds = avgTimePerFile * this.remainingFiles;
                        const estimatedRemainingMinutes = estimatedRemainingSeconds / 60;
                        this.estimatedRemainingTime = Math.ceil(estimatedRemainingMinutes);

                        this.avgTimePerFile = avgTimePerFile
                    } else {
                        this.estimatedRemainingTime = 0;
                        this.avgTimePerFile = 0;
                    }


                };

                this.imagesUploader.onErrorItem = (item, response, status) => {
                    this.notify.error(this.l("UploadFailed"));
                };

                this.imagesUploader.onSuccessItem = (item, response, status) => {
                    const ajaxResponse = <IAjaxResponse>JSON.parse(response);

                    this.progress = 100;

                    var ret = this.serviceUtilitesProxy.setImagesGuids(this.uploadingResult, this.finalUploadedImages);
                    this.uploadingResult = ret;
                    debugger
                    if (Array.isArray(this.uploadingResult.excelRecords)) {
                        this.uploadingResult.excelRecords = this.uploadingResult.excelRecords.map(item => {
                            if (item?.image) {
                                const match = this.finalUploadedImages.find(img =>
                                    img.code.toLowerCase() === item.image.toLowerCase()
                                );

                                if (match) {
                                    const ext = item.image.includes(".")
                                        ? item.image.substring(item.image.lastIndexOf(".")).toLowerCase()
                                        : "";
                                    item.image = match.Guid + ext;
                                }
                            }

                            return item instanceof AppItemtExcelRecordDTO
                                ? item
                                : AppItemtExcelRecordDTO.fromJS(item);
                        });
                    }
                    this.uploadindResultExcelList = this.uploadingResult.excelRecords;

                    
        let attach = AppConsts.attachmentBaseUrl;
        let fullURL = `${attach}/${this.logFileUrl}`;
                    this.uploadingResult.filepath = fullURL;
                    this.callImport(0);

                };
                this.imagesUploader.uploadAllFiles();
                break;

            default:
                break;
        }
    }

    onFinishImport($event) {
        this.finishImport.emit($event);
    }

    onOpenVideoModal($event) {
        if ($event) {
            this.videoModal.show("");
            this.spinnerService.show();
            this.importServiceProxy
                .getImportVideo()
                .pipe(finalize(() => this.spinnerService.hide()))
                .subscribe((videoTutorial) => {
                    this.BrowseModal.hide();
                    this.videoModal.show(videoTutorial);
                })
        }
    }

    videoTutorialGoBack() {
        this.hideAllmodal();
        this.BrowseModal.show(this.importType, this.importService, this.hasImages);
    }

    onUpdateLookups($event) {
        this.updateLookups = $event;
    }

    _totalFiles;
    _totalSizeMB;
    _folderName;
    settotalFiles($event) {
        this._totalFiles = $event;
    }

    settotalSizeMB($event) {
        this._totalSizeMB = $event;
    }

    setfolderName($event) {
        this._folderName = $event;
    }

    setImData($event) {
        this.imData = $event;
    }
    setImImages($event) {
        this.imImages = $event;
    }

    setHasImages($event) {
        this.hasImages = $event;
    }


    onsSearchItemCode($event) {
        if ($event?.isCodeItem) {
            this.importServiceProxy
                .getAllLookUp(
                    this.appSession.tenantId,
                    0,
                    false,
                    $event.filter,
                    $event.filterType,
                    "",
                    "",
                    0,
                    [],
                    [],
                    [],
                    [],
                    [],
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    "",
                    0,
                    100
                )
                .subscribe((result) => {
                    this.StatusModal.LinkToExistingITEM_Ret_Data = result;
                });
        }


        else if ($event?.isCodeColorItem) {
            this.importServiceProxy
                .getAllLookUpWithColors(
                    this.appSession.tenantId,
                    0,
                    false,
                    $event.filter,
                    $event.filterType,
                    "",
                    "",
                    0,
                    [],
                    [],
                    [],
                    [],
                    [],
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    "",
                    0,
                    100
                )
                .subscribe((result) => {
                    this.StatusModal.LinkToExistingItemColor_Ret_Data = result;
                });
        }


        else if ($event?.isCodeColorLookup) {
            this.importServiceProxy
                .getAllColorsLookUp(
                    $event.filter,
                    undefined,
                    undefined,
                    undefined, undefined, undefined, undefined, undefined, undefined, undefined, "", 0, 100

                )
                .subscribe((result) => {
                    this.StatusModal.LinkToExistingColorLookup_Ret_Data = result;
                });
        }


    }

    onSelectSugItemCode(event: { selectedItem: any, record: AppItemtExcelRecordDTO }) {
        const { selectedItem, record } = event;
        this.showMainSpinner();

        if (record?.isCodeItem || record?._isLinkingParent) {
            this.importServiceProxy.getAppItemForEditData(
                selectedItem.id,
                record.excelDto?.rowNumber,
                record.recordType,
                record.parentCode,
                record.code,
                record.name,
                record.fieldsErrors,
                record.excelDto?.actions,
                record.excelDto?.imagePreview,
                record.excelDto?.imageIsDefault,
                record.excelDto?.colorCode,
                record.excelDto?.colorName,
                record.excelDto?.colorHex,
                record.excelDto?.colorImage,
                record.excelDto?.colorSchema,
                record.excelDto?.colorNRF,
                record.excelDto?.sizeName,
                record.excelDto?.sizeScaleOrder,
                record.excelDto?.sizeMarket,
                record.excelDto?.sizeNRF,
                record.excelDto?.materialContent,
                record.excelDto?.soldOutDate,
                record.excelDto?.brancdCode,
                record.excelDto?.brandName,
                record.excelDto?.startShipDate,
                record.excelDto?.id,
                record.excelDto?.rowNumber,
                record.excelDto?.recordType,
                record.excelDto?.productType,
                record.excelDto?.productClassificationCode,
                record.excelDto?.productClassificationDescription,
                record.excelDto?.productCategoryCode,
                record.excelDto?.productCategoryDescription,
                record.excelDto?.price,
                record.excelDto?.priceA,
                record.excelDto?.priceB,
                record.excelDto?.priceC,
                record.excelDto?.priceD,
                record.excelDto?.currency,
                record.excelDto?.parentCode,
                record.excelDto?.imageType,
                record.excelDto?.imageFolderName,
                record.excelDto?.parentId,
                record.excelDto?.extraAttributesValues,
                record.excelDto?.extraAttributes,
                record.excelDto?.images,
                record.excelDto?.code,
                record.excelDto?.name,
                record.excelDto?.productDescription,
                record.excelDto?.entityObjectClassificaionID,
                record.excelDto?.entityObjectCategoryID,
                record.excelDto?.sizeScaleName,
                record.excelDto?.sizeRatioName,
                record.excelDto?.sizeRatioValue,
                record.excelDto?.noOfDim,
                record.excelDto?.d1Name,
                record.excelDto?.d2Name,
                record.excelDto?.d3Name,
                record.excelDto?.d1Sizes,
                record.excelDto?.d2Sizes,
                record.excelDto?.d3Sizes,
                record.excelDto?.d1Pos,
                record.excelDto?.d2Pos,
                record.excelDto?.d3Pos,
                record.excelDto?.sizeCode,
                record.status,
                record.errorMessage,
                record.imageType,
                record.image
            )
                .pipe(
                    finalize(() => {
                        this.hideMainSpinner();
                    })
                )
                .subscribe((result) => {
                    this.updatedRecordData = {
                        record,
                        newData: result
                    };

                });
        }


        else if (record?.isCodeColorItem || record?._isLinkingItemColor) {
            this.importServiceProxy.getAppItemColorForEditData(
                selectedItem.id,
                record.excelDto?.rowNumber,
                record.recordType,
                record.parentCode,
                record.code,
                record.name,
                record.fieldsErrors,
                record.excelDto?.actions,
                record.excelDto?.imagePreview,
                record.excelDto?.imageIsDefault,
                record.excelDto?.colorCode,
                record.excelDto?.colorName,
                record.excelDto?.colorHex,
                record.excelDto?.colorImage,
                record.excelDto?.colorSchema,
                record.excelDto?.colorNRF,
                record.excelDto?.sizeName,
                record.excelDto?.sizeScaleOrder,
                record.excelDto?.sizeMarket,
                record.excelDto?.sizeNRF,
                record.excelDto?.materialContent,
                record.excelDto?.soldOutDate,
                record.excelDto?.brancdCode,
                record.excelDto?.brandName,
                record.excelDto?.startShipDate,
                record.excelDto?.id,
                record.excelDto?.rowNumber,
                record.excelDto?.recordType,
                record.excelDto?.productType,
                record.excelDto?.productClassificationCode,
                record.excelDto?.productClassificationDescription,
                record.excelDto?.productCategoryCode,
                record.excelDto?.productCategoryDescription,
                record.excelDto?.price,
                record.excelDto?.priceA,
                record.excelDto?.priceB,
                record.excelDto?.priceC,
                record.excelDto?.priceD,
                record.excelDto?.currency,
                record.excelDto?.parentCode,
                record.excelDto?.imageType,
                record.excelDto?.imageFolderName,
                record.excelDto?.parentId,
                record.excelDto?.extraAttributesValues,
                record.excelDto?.extraAttributes,
                record.excelDto?.images,
                record.excelDto?.code,
                record.excelDto?.name,
                record.excelDto?.productDescription,
                record.excelDto?.entityObjectClassificaionID,
                record.excelDto?.entityObjectCategoryID,
                record.excelDto?.sizeScaleName,
                record.excelDto?.sizeRatioName,
                record.excelDto?.sizeRatioValue,
                record.excelDto?.noOfDim,
                record.excelDto?.d1Name,
                record.excelDto?.d2Name,
                record.excelDto?.d3Name,
                record.excelDto?.d1Sizes,
                record.excelDto?.d2Sizes,
                record.excelDto?.d3Sizes,
                record.excelDto?.d1Pos,
                record.excelDto?.d2Pos,
                record.excelDto?.d3Pos,
                record.excelDto?.sizeCode,
                record.status,
                record.errorMessage,
                record.imageType,
                record.image
            )
                .pipe(
                    finalize(() => {
                        this.hideMainSpinner();
                    })
                ).subscribe((result) => {
                    this.updatedRecordData = {
                        record,
                        newData: result
                    };
                });
        }

        else if (record?.isCodeColorLookup || record?._isLinkingColorLookup) {
            this._appEntitiesServiceProxy.getAppEntityForEdit(selectedItem.id,true)
                .pipe(
                    finalize(() => {
                        this.hideMainSpinner();
                    })
                )
                .subscribe((result: GetAppEntityForEditOutput) => {
                    record.excelDto.colorCode = result.appEntity.code;
                    record.excelDto.colorName = result.appEntity.name;
                    this.updatedRecordData = {
                        record,
                        newData: record
                    };
                });
        }
    }

    onUpdatedRecords($event) {
        this.uploadingResult = $event;
    }

    onValidateRecord(record) {
        
        let _ImportItemInputDto: ImportItemInputDto = new ImportItemInputDto();
       

        if (record._isCreateParent) {
            record.recordType = "Item";
            record.excelDto.recordType = "Item";
            //I44 record.NoOfDimensions="1"
        }

        if (record._isCreateItemColor) {
            record.recordType = "Item Variant";
            record.excelDto.recordType = "Item Variant";
            //I44 record.NoOfDimensions="1"
        }
         _ImportItemInputDto = this.mapRecordToImportItemInputDto(record)
         
        this.importServiceProxy.validateImportItemData(_ImportItemInputDto)
            .subscribe((result: ImportItemReturnDto[]) => {
                const hasErrors = Array.isArray(result) && result.length > 0;

                //record.fieldsErrors = hasErrors ? result : [];
                record.fieldsErrors = hasErrors
                    ? result.map(err => err.errorMessage)
                    : [];
                record.errorMessage = hasErrors ? "" : record.errorMessage;
                let allWarnings = result.every(
                    x => x.errorType?.toLowerCase() === "warning" ||
                         x.errorType?.toLowerCase() === "duplication"
                  );
                                                   record.status =hasErrors ? (allWarnings ? "Warning" :  "Failed" ) : "Passed"
                if (record._isCreateParent || record._isCreateItemColor) {
                    record.recordType = "Image";
                    record.excelDto.recordType = "Image";
                }

                this.updatedRecordData = {
                    record,
                    newData: record
                }

            });

    }

    private mapRecordToImportItemInputDto(record: any): ImportItemInputDto {
         record.excelDto.name= record?.name; 

        const dto = record?.excelDto;
        const ret = new ImportItemInputDto();

        if (!dto)
            return ret;

        ret.brandCode = dto.brandCode;
        ret.parentCode = record.parentCode;
        ret.productType = dto.productType;
        ret.recordType = dto.recordType;
        ret.code = record.code;
        ret.name = dto.name;
        ret.productDescription = dto.productDescription;
        ret.productClassificationCode = dto.productClassificationCode;
        ret.productCategoryCode = dto.productCategoryCode;
        ret.price = dto.price;
        ret.priceCurrencyCode = dto.priceCurrencyCode;
        ret.imageType = dto.imageType;
        ret.colorCode = dto.colorCode;
        ret.colorName = dto.colorName;
        ret.sizeScaleName = dto.sizeScaleName;
        ret.scaleSizesOrder = dto.scaleSizesOrder;
        ret.sizeRatioName = dto.sizeRatioName;
        ret.sizeRatioValue = dto.sizeRatioValue;
        ret.materialContent = dto.materialContent;
        ret.soldOutDate = dto.soldOutDate;
        ret.brandCode = dto.brandCode;
        ret.brandName = dto.brandName;
        ret.startShipDate = dto.startShipDate;
        ret.dimension1Sizes = dto.dimension1Sizes;
        ret.dimension2Sizes = dto.dimension2Sizes;
        ret.dimension3Sizes = dto.dimension3Sizes;
        ret.dimension1Name = dto.d1Name;
        ret.dimension2Name = dto.d2Name;
        ret.dimension3Name = dto.d3Name;
        ret.noOfDimensions = dto.noOfDimensions;
        ret.priceA = dto.priceA;
        ret.priceB = dto.priceB;
        ret.priceC = dto.priceC;
        ret.priceD = dto.priceD;
        //ret.parentCode = dto.parentCode;
        ret.productClassificationDescription = dto.productClassificationDescription;
        ret.productCategoryDescription = dto.productCategoryDescription;
        ret.sizeCode = dto.sizeCode;
        ret.sizeName = dto.sizeName;
        
        ret.dimension1Position = dto.dimension1Position;
        ret.dimension2Position = dto.dimension2Position;
        ret.dimension3Position = dto.dimension3Position;
        ret.priceCurrencyCode = dto.currency

        return ret;
    }


}

