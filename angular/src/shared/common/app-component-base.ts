import {
    PermissionCheckerService,
    FeatureCheckerService,
    LocalizationService,
    MessageService,
    AbpMultiTenancyService,
    NotifyService,
    SettingService,
    IAjaxResponse,
    TokenService,
} from "abp-ng2-module";
import { Injector, TemplateRef } from "@angular/core";
import { AppConsts } from "@shared/AppConsts";
import { AppUrlService } from "@shared/common/nav/app-url.service";
import { AppSessionService } from "@shared/common/session/app-session.service";
import { AppUiCustomizationService } from "@shared/common/ui/app-ui-customization.service";
import { PrimengTableHelper } from "shared/helpers/PrimengTableHelper";
import {
    AppEntityAttachmentDto,
    GetAllAppItemsInput,
    CurrencyInfoDto,
    SycAttachmentCategoriesServiceProxy,
    SycAttachmentCategoryDto,
    UiCustomizationSettingsDto,
} from "@shared/service-proxies/service-proxies";
import { NgxSpinnerService } from "ngx-spinner";
import { NgxSpinnerTextService } from "@app/shared/ngx-spinner-text.service";
import { Patterns } from "../utils/patterns/pattern";
import { FileItem, FileUploader, FileUploaderOptions } from "ng2-file-upload";
import { BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { ImageViewerComponent } from "@app/shared/common/image-viewer/image-viewer.component";
import {
    BehaviorSubject,
    fromEvent,
    Observable,
    of,
    Subject,
    Subscription,
} from "rxjs";
import { ImageCropperComponent } from "@app/shared/common/image-cropper/image-cropper.component";
import { SelectItem } from "primeng/api";
import {
    Router,
    NavigationStart,
    Event as NavigationEvent,
} from "@angular/router";
import { debounceTime, filter, takeUntil } from "rxjs/operators";
import { Location } from "@angular/common";
import { FileUploaderCustom } from "@shared/components/import-steps/models/FileUploaderCustom.model";
import { SweetAlertOptions } from "sweetalert2";
import { ajax } from "rxjs/ajax";
import { ToastService } from "./toast/toast.service";

export abstract class AppComponentBase {
    patterns = Patterns;
    localizationSourceName =
        AppConsts.localization.defaultLocalizationSourceName;
    attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
    logoDefaultPlaceHolder =
        AppConsts.appBaseUrl + "/assets/placeholders/_logo-placeholder.png";
    appItemDefaultPlaceHolder =
        AppConsts.appBaseUrl + "/assets/placeholders/appitem-placeholder.png";
    coverDefaultPlaceHolder =
        AppConsts.appBaseUrl + "/assets/placeholders/_default_cover.jpg";
    localization: LocalizationService;
    permission: PermissionCheckerService;
    feature: FeatureCheckerService;
    setting: SettingService;
    message: MessageService;
    multiTenancy: AbpMultiTenancyService;
    appSession: AppSessionService;
    primengTableHelper: PrimengTableHelper;
    ui: AppUiCustomizationService;
    appUrlService: AppUrlService;
    spinnerService: NgxSpinnerService;
    tokenService: TokenService;
    notify: ToastService
    private ngxSpinnerTextService: NgxSpinnerTextService;
    public uploader: FileUploader;
    protected bsModalService: BsModalService;
    __router: Router;
    uploadUrl: string = "/Attachment/UploadFiles";
    deleteFilesUrl: string = "/Attachment/DeleteFiles";
    subscriptions: Subscription[] = [];
    topComopaniesNo: number = 3;
    topPeopleNo: number = 3;
    topPostsNo: number = 4;
    topDaysNo: number = 7;
    appItemsFilterBody = new GetAllAppItemsInput();

    tenantDefaultCurrency: CurrencyInfoDto
    _sycAttachmentCategoriesServiceProxy: SycAttachmentCategoriesServiceProxy


    constructor(injector: Injector, private _location?: Location) {
        this.localization = injector.get(LocalizationService);
        this.permission = injector.get(PermissionCheckerService);
        this.feature = injector.get(FeatureCheckerService);
        this.notify = injector.get(ToastService);
        this.setting = injector.get(SettingService);
        this.message = injector.get(MessageService);
        this.multiTenancy = injector.get(AbpMultiTenancyService);
        this.appSession = injector.get(AppSessionService);
        this.ui = injector.get(AppUiCustomizationService);
        this.appUrlService = injector.get(AppUrlService);
        this.primengTableHelper = new PrimengTableHelper();
        this.spinnerService = injector.get(NgxSpinnerService);
        this.ngxSpinnerTextService = injector.get(NgxSpinnerTextService);
        this.tokenService = injector.get(TokenService);
        this.bsModalService = injector.get(BsModalService);
        this.__router = injector.get(Router);
        this._sycAttachmentCategoriesServiceProxy = injector.get(SycAttachmentCategoriesServiceProxy);
        this.onDestroyHandler();
        this.setAppItemsFilterBody();
    }


    setAppItemsFilterBody() {
        this.appItemsFilterBody.categoryFilters = undefined
        this.appItemsFilterBody.classificationFilters = undefined
        this.appItemsFilterBody.departmentFilters = undefined
        this.appItemsFilterBody.entityObjectTypeId = undefined
        this.appItemsFilterBody.arrtibuteFilters = []
        this.appItemsFilterBody.filterType = 1
        this.appItemsFilterBody.priceListId = undefined
        this.appItemsFilterBody.listingStatus = undefined
        this.appItemsFilterBody.publishStatus = undefined
        this.appItemsFilterBody.visibilityStatus = undefined
        this.appItemsFilterBody.minimumPrice = 0
        this.appItemsFilterBody.maximumPrice = 0
        this.appItemsFilterBody.sorting = undefined
        this.appItemsFilterBody.skipCount = 0
        this.appItemsFilterBody.filter = undefined
        this.appItemsFilterBody.tenantId = 0
        this.appItemsFilterBody.selectorOnly = false
        this.tenantDefaultCurrency = this.appSession?.tenant?.currencyInfoDto
    }
    flattenDeep(array) {
        return array.reduce(
            (acc, val) =>
                Array.isArray(val)
                    ? acc.concat(this.flattenDeep(val))
                    : acc.concat(val),
            []
        );
    }

    l(key: string, ...args: any[]): string {
        args.unshift(key);
        args.unshift(this.localizationSourceName);
        return this.ls.apply(this, args);
    }

    ls(sourcename: string, key: string, ...args: any[]): string {
        let localizedText = this.localization.localize(key, sourcename);

        if (!localizedText) {
            localizedText = key;
        }

        if (!args || !args.length) {
            return localizedText;
        }

        args.unshift(localizedText);
        return abp.utils.formatString.apply(this, this.flattenDeep(args));
    }

    isGranted(permissionName: string): boolean {
        return this.permission.isGranted(permissionName);
    }

    isGrantedAny(...permissions: string[]): boolean {
        if (!permissions) {
            return false;
        }

        for (const permission of permissions) {
            if (this.isGranted(permission)) {
                return true;
            }
        }

        return false;
    }

    s(key: string): string {
        return abp.setting.get(key);
    }

    appRootUrl(): string {
        return this.appUrlService.appRootUrl;
    }

    get currentTheme(): UiCustomizationSettingsDto {
        return this.appSession.theme;
    }

    get containerClass(): string {
        if (this.appSession.theme.baseSettings.layout.layoutType === "fluid") {
            return "kt-container kt-container--fluid";
        }

        return "kt-container";
    }

    showMainSpinner(text?: string): void {
        if (text) this.ngxSpinnerTextService.currentText = text;
        setTimeout(() => {
            this.spinnerService.show();
        }, 1);
    }

    hideMainSpinner(): void {
        setTimeout(() => {
            this.spinnerService.hide();
        }, 1);
    }
    deepClone(data: any) {
        return JSON.parse(JSON.stringify(data));
    }
    // upload
    initUploaders(): void {
        this.uploader = this.createUploader(
            "/Attachment/UploadFiles",
            (result) => {
                // this.appSession.tenant.logoFileType = result.fileType;
                // this.appSession.tenant.logoId = result.id;
            }
        );
    }
    tempAttachments: string[] = []
    addTempAttachments(tempAttachment: string[]) {
        this.tempAttachments.push(...tempAttachment);
    }
    removeAllUnusedTempAttachments() {
        const tempAttachmentCount = this.tempAttachments?.length
        if (!tempAttachmentCount) return
        const paramKeyName = 'files'
        const params = this.tempAttachments.reduce((accum, item, index) => {
            accum += index == 0 ? `?` : `&`;
            accum += `${paramKeyName}=${item}`;
            return accum
        }, "")
        const url = this.attachmentBaseUrl + this.deleteFilesUrl + params
        const headers = { Authorization: "Bearer " + this.tokenService.getToken() }
        ajax.get(url, headers)
            .subscribe(res => {
                // console.log(res)
            })
    }
    createUploader(url: string, success?: (result: any) => void): FileUploader {
        const uploader = new FileUploader({
            url: AppConsts.remoteServiceBaseUrl + url,
        });

        uploader.onAfterAddingFile = (file) => {
            file.withCredentials = false;
        };

        uploader.onSuccessItem = (item, response, status) => {
            const ajaxResponse = <IAjaxResponse>JSON.parse(response);
            if (ajaxResponse.success) {
                this.notify.info(this.l("UploadSuccessfully"));
                if (success) {
                    success(ajaxResponse.result);
                }
            } else {
                this.message.error(ajaxResponse.error.message);
            }
        };

        const uploaderOptions: Partial<FileUploaderOptions> = {};
        uploaderOptions.authToken = "Bearer " + this.tokenService.getToken();
        uploaderOptions.removeAfterUpload = true;
        uploader.setOptions(uploaderOptions as FileUploaderOptions);
        return uploader;
    }
    createCustomUploader(
        url?: string,
        success?: (result: any) => void
    ): FileUploaderCustom {
        url = this.uploadUrl;
        const uploader = new FileUploaderCustom({
            url: AppConsts.remoteServiceBaseUrl + url,
        });

        uploader.onAfterAddingFile = (file) => {
            file.withCredentials = false;
        };

        uploader.onSuccessItem = (item, response, status) => {
            const ajaxResponse = <IAjaxResponse>JSON.parse(response);
            if (ajaxResponse.success) {
                this.notify.info(this.l("UploadSuccessfully"));
                if (success) {
                    success(ajaxResponse.result);
                }
            } else {
                this.message.error(ajaxResponse.error.message);
            }
        };

        const uploaderOptions: Partial<FileUploaderOptions> = {};
        uploaderOptions.authToken = "Bearer " + this.tokenService.getToken();
        uploaderOptions.removeAfterUpload = true;
        uploader.setOptions(uploaderOptions as FileUploaderOptions);
        return uploader;
    }
    uploadBlobAttachment(
        attachmentAsBlob: Blob,
        attachment: AppEntityAttachmentDto
    ) {
        let fileFromBlob: File = new File(
            [attachmentAsBlob],
            attachment.fileName
        );

        this.uploader.addToQueue(new Array<File>(fileFromBlob));

        this.uploader.onBuildItemForm = (fileItem: FileItem, form: any) => {
            form.append("guid", attachment.guid);
        };

        this.uploader.uploadAll();
    }

    uploadFileAttachment(
        attachmentAsFile: File,
        attachment: AppEntityAttachmentDto
    ) {


        this.uploader.addToQueue([attachmentAsFile]);

        this.uploader.onBuildItemForm = (fileItem: FileItem, form: any) => {
            form.append("guid", attachment.guid);
        };

        this.uploader.uploadAll();
    }

    openImageViewer(attachment: string, sycAttachmentCategory?: SycAttachmentCategoryDto): void {
        let config: ModalOptions = new ModalOptions();
        config.class = "img-viewer";
        config.initialState = {
            imgSrc: attachment,
            aspectRatio: sycAttachmentCategory.aspectRatio
        };
        this.bsModalService.show(ImageViewerComponent, config);
    }
    openImageCropper(
        event,
        aspectRatio?: number,
        noOptions?: boolean
    ): { onCropDone: Observable<any>; data: ImageCropperComponent } {
        if (event.target.files.length === 0) return; // there are no files selected
        let config: ModalOptions = new ModalOptions();
        // data to be shared to the modal
        config.initialState = {
            title: "Edit image:",
            originalFileChangeEvent: event,
        };
        if (noOptions != undefined)
            config.initialState["noOptions"] = noOptions; // open modal with crop only without any other functionalities
        if (!isNaN(aspectRatio))
            config.initialState["aspectRatio"] = aspectRatio;
        config.class = "right-modal";
        let mgCropperModalRef = this.bsModalService.show(
            ImageCropperComponent,
            config
        );
        return {
            onCropDone: this.bsModalService.onHide,
            data: mgCropperModalRef.content,
        };
    }
    guid(): string {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return (
            s4() +
            s4() +
            "-" +
            s4() +
            "-" +
            s4() +
            "-" +
            s4() +
            "-" +
            s4() +
            s4() +
            s4()
        );
    }
    convertEnumToSelectItems(_enum: any) {
        // _enum : of type enum
        let currentIndex: number = 0;

        const testValue = Object.values(_enum)[0]
        const isEnumValueNumber: boolean = typeof testValue == 'number'
        let totalIndices = Object.keys(_enum).length / (isEnumValueNumber ? 2 : 1);
        const selectOptions: SelectItem[] = [];
        for (const label in _enum) {
            if (Object.prototype.hasOwnProperty.call(_enum, label)) {
                if (isEnumValueNumber && currentIndex < totalIndices) {
                    currentIndex++;
                    continue;
                }
                const value = _enum[label];
                let option: SelectItem = { label: this.l(label), value };
                selectOptions.push(option);
            }
        }
        return selectOptions;
    }
    // convertEnumToSelectItems(_enum: any) {
    //     // _enum : of type enum
    //     let currentIndex: number = 0;

    //     const enumKeys = Object.keys(_enum)
    //     let totalIndices : number
    //     if( enumKeys.length % 2 == 0 ){
    //         const firsKey = enumKeys[0]
    //         const middleValue = Object.values(_enum)[enumKeys.length]
    //         const enumKeys
    //         totalIndices = Object.keys(_enum).length / ( isEnumValueNumber ? 2 : 1);

    //     }
    //     const selectOptions: SelectItem[] = [];
    //     for (const label in _enum) {
    //         if (Object.prototype.hasOwnProperty.call(_enum, label)) {
    //             if (isEnumValueNumber && currentIndex < totalIndices) {
    //                 currentIndex++;
    //                 continue;
    //             }
    //             const value = _enum[label];
    //             let option: SelectItem = { label: this.l(label), value };
    //             selectOptions.push(option);
    //         }
    //     }
    //     return selectOptions;
    // }
    unsubscribeToAllSubscriptions() {
        this.subscriptions.forEach((subs) => subs.unsubscribe());
    }
    // use it on or after view init cycle hook ( after dom loaded )
    scrolltoTop() {
        document?.getElementById("kt_scrolltop")?.click();
    }

    /** Confirm discard changes on the pages that contain forms

        Steps to use it :
        1- set formTouched to true whenever the user made any changes either you using tempelate driven or reactive form
            -   template driven form : form that makes a reference on the form and subscribe to the valuechanges observable then
                change the value of the touched form inside the valuechanges subscribtion when dirty is true
            -   reactive form : subscribe to the valuechanges observable then change the value of the touched form inside
                the valuechanges subscribtion when dirty is true
            -   on any custom field that changes outside the form you must change the formTouched field manually whenver any changes happened
        2- subscribe to change

    **/
    private _formTouched: boolean = false;
    set formTouched(bool: boolean) {
        if (bool && !this.formTouched) this.initFormListeners();
        this._formTouched = bool;
    }
    get formTouched(): boolean {
        return this._formTouched;
    }
    destroy$: Subject<any> = new Subject<any>();
    async onDestroyHandler() {
        this.destroy$.subscribe(() => {
            this.unsubscribeToAllSubscriptions();
        });
    }

    emitDestroy() {
        this.destroy$.next(undefined);
    }

    confirmDiscardChanges(): boolean {
        return window.confirm(
            this.l("YouAreAboutToLoseAllTheChangesYouHaveDone,AreYouSure?")
        );
    }
    stopFormListening: boolean = false
    initFormListeners() {
        // handle reload and close
        const beforeUnloadEventHandler: Subscription = fromEvent(
            window,
            "beforeunload"
        ).subscribe((e) => {
            e.preventDefault();
            e.returnValue = false;
            if (this.stopFormListening || this.confirmDiscardChanges()) {
                this.emitDestroy();
                this.removeAllUnusedTempAttachments();
            }
        });
        this.subscriptions.push(beforeUnloadEventHandler);

        // handle routing change
        const routerNavigationHandler: Subscription = this.__router.events
            .pipe(filter((event) => event instanceof NavigationStart))
            .subscribe((event) => {
                if (this.stopFormListening || this.confirmDiscardChanges()) {
                    this.removeAllUnusedTempAttachments();
                    return this.emitDestroy();
                }
                const currentRoute = this.__router.routerState;
                this.__router.navigateByUrl(currentRoute.snapshot.url, {
                    skipLocationChange: true,
                });
            });
        this.subscriptions.push(routerNavigationHandler);
    }

    goBack(defaultUrl: string) {
        if (history.state.navigationId > 1) this._location.back();
        else this.__router.navigate([defaultUrl]);
    }

    askToConfirm(message: string, title: string, options: SweetAlertOptions = {}): Observable<boolean> {

        var confirmSubject: Subject<boolean> = new Subject<boolean>()
        var confirmObservable$: Observable<boolean> = confirmSubject.asObservable()
        this.message.confirm(
            this.l(message),
            this.l(title),
            (_isConfirmed) => {
                if (_isConfirmed)
                    return confirmSubject.next(true)
                else
                    return confirmSubject.next(false)

            }, {
                confirmButtonColor: '#411549',
                cancelButtonColor: '#705275',
                reverseButtons: true,
                ...options
            } as SweetAlertOptions
        );
        return confirmObservable$;
    }
    getSycAttachmentCategoriesByCodes(codes: string[]) {
        return this._sycAttachmentCategoriesServiceProxy.getSycAttachmentCategoriesByCodes(codes)
    }
    async renderImageAndGetDimensions(file: File): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            var fr = new FileReader;
            fr.onload = function () { // file is loaded
                var img = new Image;

                img.onload = function () {
                    resolve(img)// image is loaded; sizes are available
                };

                img.src = fr.result as string; // is the data URL because called with readAsDataURL
            };

            fr.readAsDataURL(file);
        })
    }
    parseTenantId(tenantIdAsStr?: string): number | undefined {
        let tenantId: number | undefined
        if (tenantIdAsStr) {
            tenantId = parseInt(tenantIdAsStr, 10);
            if (isNaN(tenantId)) {
                tenantId = undefined;
            }
        }
        return tenantId;
    }

    getPriceLevel(): SelectItem[] {
        let allPriceLevel: SelectItem[] = [];
        allPriceLevel.push({ label: 'A', value: 'A' });
        allPriceLevel.push({ label: 'B', value: 'B' });
        allPriceLevel.push({ label: 'C', value: 'C' });
        allPriceLevel.push({ label: 'D', value: 'D' });

        return allPriceLevel;
    }

    getTransactionRole(roleValue): string {
        let transactionRole = "";
        if (roleValue.includes("Seller"))
            transactionRole = "Seller"

        if (roleValue.includes("Buyer"))
            transactionRole = "Buyer"

        if (roleValue.includes("Sales Rep"))
            transactionRole = "Independent Sales Rep"

        if (roleValue.includes("buying office"))
            transactionRole = "Independent Buying Office"

        return transactionRole;

    }
}
