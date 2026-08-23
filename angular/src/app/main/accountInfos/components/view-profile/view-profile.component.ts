import { Component, ViewChild, Injector, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { AccountDto, AccountLevelEnum, AccountsServiceProxy, AppEntitiesServiceProxy, AppEntityAttachmentDto, AppEntityExtraDataDto, LookupLabelDto, SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { NgImageSliderComponent } from 'ng-image-slider';
import { AppConsts } from '@shared/AppConsts';
import { SelectItem } from 'primeng/api';
import { ImageObject } from '../../../accounts/account-shared/models/imageobject';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { finalize } from 'rxjs';
import { ImageUploadComponentOutput } from '@app/shared/common/image-upload/image-upload.component';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { IAjaxResponse, TokenService } from 'abp-ng2-module';
@Component({
    selector: 'app-view-profile',
    styleUrls: ['./view-profile.component.scss'],
    templateUrl: './view-profile.component.html',
    animations: [appModuleAnimation()]
})
export class ViewProfileComponent extends AppComponentBase implements OnChanges, OnInit {

    @ViewChild('nav') slider: NgImageSliderComponent;
    @Input('accountData') accountData: AccountDto;
    @Input('contactData') contactData: AccountDto;
    @Input('entityExtraData') entityExtraData: any;

    @Input('isPublished') isPublished: boolean;
    @Input('isSync') isSync: boolean;

    @Input('connectionCount') connectionCount: number;
    @Input() viewMode: boolean;
    @Input() accountLevel: AccountLevelEnum;
    @Input() personalAccount = false;

    @Output("edit") edit: EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output("editedData") editedData: EventEmitter<any> = new EventEmitter<any>()
    @Output("editedContactData") editedContactData: EventEmitter<any> = new EventEmitter<any>()
    @Output("delete") delete: EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output("publish") publish: EventEmitter<boolean> = new EventEmitter<boolean>()


    showEditConnected: boolean = false;
    priceLevel: string;
    allPriceLevel: SelectItem[] = [];

    accountLevelEnum = AccountLevelEnum;
    attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;

    coverPhoto: any = ""

    accountType: any;
    imageObject: ImageObject[] = [];
    allAccountTypes: SelectItem[] = []
    //Department
    showMoreDepartment: boolean = false;
    showLessDepartment: boolean = false;
    totalDepartment: number;
    noOfDepartmentToShowInitially: number;
    maxDepartmentCount: number;
    skipDepartmentCount: number;
    departmentToLoad: number;
    initDepartment: string[] = [];
    scrollDepartment: boolean = false;
    maxDepartmentCnt: number;
    //Classification
    showMoreClassification: boolean = false;
    showLessClassification: boolean = false;
    totalClassification: number;
    noOfClassificationToShowInitially: number;
    maxClassificationCount: number;
    skipClassificationCount: number;
    classificationToLoad: number;
    initClassification: string[] = [];
    scrollClassification: boolean = false;
    maxClassificationCnt: number;
    maxContainerHeight: number = 150;
    sycAttachmentCategoryLogo: SycAttachmentCategoryDto
    sycAttachmentCategoryBanner: SycAttachmentCategoryDto
    sycAttachmentCategoryImage: SycAttachmentCategoryDto
    btnLoader: boolean = false;
    editInfo = true;
    NoteditInfo = false;
    editFirstNameValue: string = '';
    editLastNameValue: string = '';
    editJobTitleValue: string = '';
    editEMailAddressValue: string = '';
    editLanguageNameValue: string = '';
    editPhoneNumberValue: string = '';

    editNotesValue: string = '';
    Editting: boolean = false;
    editPersonal: boolean = false;
    showPrivate = true;

    showHide = true;
    hidUshare = false;
    showIsSync = false;
    showShare = true;
    hideshowShare = false;
    editedPersonalData: any
    allLanguages: LookupLabelDto[];
    isRecordOwner: boolean

    currentLang: string
    isArabic: boolean
    emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
    phonePattern = '^(\\+?[1-9]\\d{0,2}(\\s|-)?(\\(?\\d{1,4}\\)?(\\s|-)?)+|\\d{1,20}|0\\d{9,14})$';


    companyLogo: any;

    // NEW: keep originals so Cancel can revert
    private _originalLogoUrl?: string;
    private _originalCoverUrl?: string;
  roles:any
            selectedRoles!: any[];


            @Input() createMode = false;

@Input() startInEditMode = false;

@Output()
cancelEdit =
    new EventEmitter<void>();


    private personalModeInitialized =
    false;

    constructor(
        injector: Injector,
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _AccountsServiceProxy: AccountsServiceProxy,
        private _tokenService: TokenService,
    ) {
        super(injector)
    }

    // ngOnChanges(changes: SimpleChanges) {
    //     if (this.accountData) {
    //         this.handleAccountData()
    //         this.initDepartmentVariables(true);
    //         this.initClassificationVariables(true);
    //         // this.getContactSync();
    //         this.getLanguages()
    //         this.setSelectedMarketplaceRoles();
    //         this.isRecordOwner = this.accountData?.id == this.appSession.user?.accountId ? true : false
    //     }

    // }

    ngOnChanges(
    changes: SimpleChanges
): void {

    if (this.accountData) {

        this.ensurePersonalModels();

        this.handleAccountData();

        if (!this.personalAccount) {

            this.initDepartmentVariables(
                true
            );

            this.initClassificationVariables(
                true
            );
        }

        this.getLanguages();

        this.setSelectedMarketplaceRoles();

        this.isRecordOwner =
            this.accountData?.id ==
            this.appSession.user?.accountId;
    }


    if (
        this.personalAccount &&
        this.startInEditMode &&
        !this.personalModeInitialized
    ) {

        this.enterPersonalEditMode();

        this.personalModeInitialized =
            true;
    }


    if (
        this.personalAccount &&
        !this.startInEditMode
    ) {

        this.Editting = false;
        this.editInfo = true;
        this.NoteditInfo = false;

        this.personalModeInitialized =
            false;
    }
}
    ngOnInit() {
                this.roles = [
            { name: 'Buyer' },
            { name: 'Seller' },
            { name: 'Sales Rep' },
            { name: 'Buying Office' },
         
        ];
        this.getAllForAccountInfo()
        this.allPriceLevel = this.getPriceLevel();
        this.allPriceLevel.push({ label: 'MSRP', value: 'MSRP' });

        this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
        this.currentLang == 'ar' || this.currentLang == 'ar-EG'  ? this.isArabic = true : this.isArabic = false
        this.initUploaders();

    }

    prevImageClick() {
        this.slider.prev();
    }

    nextImageClick() {
        this.slider.next();
    }

    handleAccountData() {
        if (this.accountData.isConnected)
            this.showEditConnected = true;
        else
            this.showEditConnected = false;

        this.priceLevel = this.accountData.priceLevel;
        if (this.accountData.coverUrl) {
            this.coverPhoto = `${this.attachmentBaseUrl}/${this.accountData.coverUrl}`;
            this._originalCoverUrl = this.coverPhoto;
        }
        if (this.accountData.logoUrl) {
            this.companyLogo = `${this.attachmentBaseUrl}/${this.accountData.logoUrl}`;
            this._originalLogoUrl = this.companyLogo;
        }

        for (let index = 0; index < this.accountData?.imagesUrls?.length; index++) {
            const element = this.accountData.imagesUrls[index];
            let object = {
                image: `${this.attachmentBaseUrl}/${element}`,
                thumbImage: `${this.attachmentBaseUrl}/${element}`,
                title: ''
            }
            this.imageObject.push(object);
        }
        this.accountType = this.allAccountTypes.find(x => x.value == this.accountData.accountType)
    }
    editAccount() {

        if (this.personalAccount && !this.editPersonal) {
            this.Editting = true;
            this.editInfo = false;
            this.NoteditInfo = true;
            this.setPersonalData()



        } else if (this.personalAccount && this.editPersonal) {
            if (!this.editedPersonalData) {
                this.editedPersonalData = { ...this.accountData }; // ensure it's initialized
            }
            this.editedPersonalData.firstName = this.editFirstNameValue
            this.editedPersonalData.lastName = this.editLastNameValue
            this.editedPersonalData.eMailAddress = this.editEMailAddressValue;
            this.editedPersonalData.languageId = this.contactData.languageId;
            this.editedPersonalData.languageName = this.allLanguages.find(l => l.value == this.contactData.languageId)?.label;
            this.editedPersonalData.phone1Number = this.editPhoneNumberValue;
            this.editedPersonalData.jobTitle = this.editJobTitleValue;


            this.editedPersonalData.emailAddressIsPublic = this.contactData?.emailAddressIsPublic;
            this.editedPersonalData.phone1IsPublic = this.contactData?.phone1IsPublic;
            this.contactData.entityAttachments = this.mergeAttachmentsForSave(
                this.contactData.entityAttachments,
                this.accountData.entityAttachments,
                this.sycAttachmentCategoryLogo?.id,
                this.sycAttachmentCategoryBanner?.id,
                this._removed
            );


            this.contactData.languageName = this.editedPersonalData.languageName;
                        this.contactData.notes =this.editNotesValue;
           this.updateMarketplaceRolesExtraData();
this.editedPersonalData.entityExtraData = this.accountData.entityExtraData;
            this.editedContactData.emit(this.contactData)
            this.editedData.emit(this.editedPersonalData);
            
            this.editInfo = true;
            this.NoteditInfo = false;
            this.Editting = false;
            this.editPersonal = false;


        }

        else {


            this.editInfo = true;
            this.NoteditInfo = false;
            this.Editting = false;
            this.edit.emit();
        }
    }

    deleteAccount() {
        this.delete.emit()
    }
    //Department
    initDepartmentVariables(firstInit: boolean) {
        if (firstInit)
            this.initDepartment = this.accountData.categories;
        else this.accountData.categories = this.initDepartment;

        this.noOfDepartmentToShowInitially = 10;
        this.maxDepartmentCount = 10;
        this.scrollDepartment = false;
        this.maxDepartmentCnt = 40;
        this.departmentToLoad = 20;
        this.totalDepartment =
            this.accountData.categoriesTotalCount;

        if (this.noOfDepartmentToShowInitially < this.totalDepartment)
            this.showMoreDepartment = true;
        else this.showMoreDepartment = false;
        this.showLessDepartment = false;
    }

    showDepartment() {
        if (this.noOfDepartmentToShowInitially < this.totalDepartment) {
            this.maxDepartmentCount = this.departmentToLoad;
            this.skipDepartmentCount = this.noOfDepartmentToShowInitially;
            this.noOfDepartmentToShowInitially += this.departmentToLoad;

            this._appEntitiesServiceProxy
                .getAppEntityDepartmentsNamesWithPaging(
                    this.accountData.entityId,
                    undefined,
                    this.skipDepartmentCount,
                    this.maxDepartmentCount,
                )
                .subscribe((res) => {
                    if (
                        this.noOfDepartmentToShowInitially >=
                        this.totalDepartment
                    ) {
                        this.showMoreDepartment = false;
                        this.showLessDepartment = true;
                    }

                    this.accountData.categories =
                        this.accountData.categories.concat(
                            res.items
                        );
                    if (
                        this.accountData.categories.length >= this.maxDepartmentCnt
                    )
                        this.scrollDepartment = true;
                });
        } else {
            this.initDepartmentVariables(false);
        }
    }

    //Classification
    initClassificationVariables(firstInit: boolean) {
        if (firstInit)
            this.initClassification = this.accountData.classfications
        else this.accountData.classfications = this.initClassification;

        this.noOfClassificationToShowInitially = 10;
        this.maxClassificationCount = 10;
        this.scrollClassification = false;
        this.maxClassificationCnt = 40;
        this.classificationToLoad = 20;
        this.totalClassification = this.accountData.classificationsTotalCount;
        if (this.noOfClassificationToShowInitially < this.totalClassification)
            this.showMoreClassification = true;
        else this.showMoreClassification = false;
        this.showLessClassification = false;
    }

    showClassification() {
        if (this.noOfClassificationToShowInitially < this.totalClassification) {
            this.maxClassificationCount = this.classificationToLoad;
            this.skipClassificationCount =
                this.noOfClassificationToShowInitially;
            this.noOfClassificationToShowInitially += this.classificationToLoad;

            this._appEntitiesServiceProxy
                .getAppEntityClassificationsNamesWithPaging(
                    this.accountData.entityId,
                    undefined,
                    this.skipDepartmentCount,
                    this.maxDepartmentCount,
                )
                .subscribe((res) => {
                    if (
                        this.noOfClassificationToShowInitially >=
                        this.totalClassification
                    ) {
                        this.showMoreClassification = false;
                        this.showLessClassification = true;
                    }

                    this.accountData.classfications = this.accountData.classfications.concat(
                        res.items
                    );
                    if (
                        this.accountData.classfications.length >= this.maxClassificationCnt
                    )
                        this.scrollClassification = true;
                });
        } else {
            this.initClassificationVariables(false);
        }
    }

    getAllForAccountInfo() {
        this.getSycAttachmentCategoriesByCodes(['LOGO', "BANNER", "IMAGE"]).subscribe((result) => {
            result.forEach(item => {
                if (item.code == "LOGO") this.sycAttachmentCategoryLogo = item
                else if (item.code == "BANNER") this.sycAttachmentCategoryBanner = item
                else if (item.code == "IMAGE") this.sycAttachmentCategoryImage = item
            })
        })

    }


    editConnnectedAccount() {
        this.showMainSpinner();
        this._AccountsServiceProxy.updateConnectedAccountPriceLevel(this.accountData.id, this.priceLevel)
            .pipe(
                finalize(
                    () => this.hideMainSpinner()
                )
            )
            .subscribe(result => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.showEditConnected = true;
                this.accountData.priceLevel = this.priceLevel;
            });


    }


    openShareAccountsModal() {
        this.showMainSpinner();
        this._AccountsServiceProxy.publishProfile(false)
            .pipe(
                finalize(() => this.hideMainSpinner()
                ))
            .subscribe((response) => {
                this.notify.info(this.l('Profile Shared Successfully'));
                this.connectionCount == 0 ? this.showPrivate = false : this.showHide = false
                this.hidUshare = true;
                this.hideshowShare = false;
                this.hideshowShare = true;
                this.showShare = true;
            }
            );
    }

    syncAccount() {
        this.showMainSpinner();
        this._AccountsServiceProxy.publishProfile(true).pipe(
            finalize(() => this.hideMainSpinner()
            )).subscribe(
                (response: boolean) => {
                    this.notify.success(this.l("Account sync Successfully"));
                    this.showIsSync = !response;
                    this.isSync = !response;
                    this.isSync = false;

                });

    }

    UnShareAccount() {
        this.showMainSpinner();
        this._AccountsServiceProxy.unPublishProfile().pipe(
            finalize(() => this.hideMainSpinner()
            )).subscribe(
                (response) => {
                    if ((this.connectionCount == 0 )) {
                        this.notify.success(this.l('Profile Set To Private Successfully'));

                    } else if ( this.connectionCount != 0 ) {
                        this.notify.success(this.l('Profile Set To Heddin Successfully'));
                    }

                    this.showShare = false;
                    this.hidUshare = true;
                    this.hideshowShare = true;
                    this.showHide = true;
                    this.showPrivate = true;
                    this.isPublished = false
                });
    }


    getContactSync() {
        this._AccountsServiceProxy.getContactSync(this.accountData.id)
            .subscribe((res: boolean) => {
                this.isSync = res;
            });

    }

    isNotManualLevel(): boolean {

        return this.accountLevel !== AccountLevelEnum.Manual;
    }


    isChangePersonalData(): boolean {
        if (!this.editFirstNameValue || !this.editLastNameValue || !this.editJobTitleValue || !this.editEMailAddressValue || !this.editLanguageNameValue || !this.editPhoneNumberValue)
            return false;


        if (this.editFirstNameValue == this.accountData.name && this.editJobTitleValue == this.accountData.jobTitle && this.editEMailAddressValue == this.accountData.eMailAddres && this.editLanguageNameValue == this.accountData.languageName && this.editPhoneNumberValue == this.accountData.phoneNumber)
            return false;

        return true;
    }

    get jobTitleAttr() {
        return this.accountData?.extraDataAttributes?.find(attr => attr.extraAttributeId === 706);
    }

    getLanguages() {
        this._appEntitiesServiceProxy.getAllLanguageForTableDropdown().subscribe(result => {
            this.allLanguages = result;
        });
    }

    // setPersonalData() {
    //     this.editFirstNameValue = this.contactData?.firstName;
    //     this.editLastNameValue = this.contactData?.lastName;
    //     this.editJobTitleValue = this.contactData?.jobTitle;
    //     this.editEMailAddressValue = this.accountData.eMailAddress;
    //     this.editPhoneNumberValue = this.accountData.phone1Number;
    // }


    setPersonalData(): void {

    this.editFirstNameValue =
        this.contactData?.firstName ??
        this.getExtraDataValue(701) ??
        '';

    this.editLastNameValue =
        this.contactData?.lastName ??
        this.getExtraDataValue(702) ??
        '';

    this.editJobTitleValue =
        this.contactData?.jobTitle ??
        this.getExtraDataValue(706) ??
        '';

    this.editEMailAddressValue =
        this.accountData?.eMailAddress ??
        '';

    this.editPhoneNumberValue =
        this.accountData?.phone1Number ??
        '';

            // Notes / About
    this.editNotesValue =
        this.accountData?.notes ??
        '';

    this.contactData.emailAddressIsPublic =
        this.contactData
            ?.emailAddressIsPublic ??
        this.getBooleanExtraDataValue(
            709
        );

    this.contactData.phone1IsPublic =
        this.contactData
            ?.phone1IsPublic ??
        this.getBooleanExtraDataValue(
            710
        );
}

private getExtraDataValue(
    attrId: number
): any {

    return (
        this.accountData
            ?.entityExtraData
            ?.find(
                x =>
                    x.attributeId ===
                    attrId
            )
            ?.attributeValue
        ??
        this.entityExtraData
            ?.find(
                x =>
                    x.attributeId ===
                    attrId
            )
            ?.attributeValue
    );
}

private getBooleanExtraDataValue(
    attrId: number
): boolean {

    const value =
        this.getExtraDataValue(
            attrId
        );

    return (
        value === true ||
        value === 'true'
    );
}

    // cancelPerAcc() {

    //     this.editInfo = true;
    //     this.NoteditInfo = false;
    //     this.Editting = false

    //     this.companyLogo = this._originalLogoUrl ?? this.companyLogo;
    //     this.coverPhoto = this._originalCoverUrl ?? this.coverPhoto;


    //     this.accountData.entityAttachments =
    //         (this.accountData.entityAttachments || []).filter(a => !(a.index === -1 || a.index === -2));

    //     this.setPersonalData()

    // }

    cancelPerAcc(): void {

    /*
     * CREATE
     */
    if (this.createMode) {

        this.setPersonalData();

        return;
    }


    /*
     * EDIT existing
     */

    this.editInfo = true;

    this.NoteditInfo = false;

    this.Editting = false;

    this.editPersonal = false;


    this.companyLogo =
        this._originalLogoUrl ??
        this.companyLogo;

    this.coverPhoto =
        this._originalCoverUrl ??
        this.coverPhoto;


    this.accountData.entityAttachments =
        (
            this.accountData
                .entityAttachments ||
            []
        ).filter(
            a =>
                !(
                    a.index === -1 ||
                    a.index === -2
                )
        );


    this.setPersonalData();

    this.cancelEdit.emit();
}
    initUploaders(): void {
        this.uploader = this.createUploader(
            '/Attachment/UploadFiles',
            result => {
            }
        );

    }

    createUploader(url: string, success?: (result: any) => void): FileUploader {
        const uploader = new FileUploader({ url: AppConsts.remoteServiceBaseUrl + url });

        uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
        uploader.onSuccessItem = (_item, response) => {
            const ajaxResponse = <IAjaxResponse>JSON.parse(response || '{}');
            if (ajaxResponse?.success) {
                this.notify.info(this.l('UploadSuccessfully'));
                success?.(ajaxResponse.result);
            } else if (ajaxResponse?.error?.message) {
                this.message.error(ajaxResponse.error.message);
            }
        };

        const opts: Partial<FileUploaderOptions> = {
            authToken: 'Bearer ' + this._tokenService.getToken(),
            removeAfterUpload: true
        };
        uploader.setOptions(opts as FileUploaderOptions);
        return uploader;
    }
    imageBrowseDone($event: ImageUploadComponentOutput, cat: SycAttachmentCategoryDto, index?: number) {
        this.accountData.entityAttachments ??= [];

        const guid = this.guid();

        // Decide the stable slot
        let slotIndex = index;
        if (cat.id === this.sycAttachmentCategoryLogo?.id) slotIndex = -1; // logo
        if (cat.id === this.sycAttachmentCategoryBanner?.id) slotIndex = -2; // cover

        // Live preview
        if (slotIndex === -1) this.companyLogo = $event.image;
        if (slotIndex === -2) this.coverPhoto = $event.image;

        // Upsert into entityAttachments
        const att = this.upsertAttachment(this.accountData.entityAttachments, {
            attachmentCategoryId: cat.id,
            index: slotIndex!,
            fileName: $event.file.name,
            guid
        });

        // Queue upload (requires this.uploader to be initialized in this component)
        this.uploader.addToQueue([$event.file]);
        this.uploader.onBuildItemForm = (_fileItem: any, form: any) => form.append('guid', guid);
        this.uploader.uploadAll();

        // Optional: when server responds, bind back id/url using the same guid
        this.uploader.onSuccessItem = (_item, response) => {
            try {
                const res = JSON.parse(response || '{}');
                if (res?.success && res?.result) {
                    // Map server result -> attachment
                    // Assuming your API returns: { id, url, guid }
                    const r = res.result;
                    const idx = this.accountData.entityAttachments.findIndex(a => a.guid === r.guid);
                    if (idx > -1) {
                        this.accountData.entityAttachments[idx].id = r.id;
                        this.accountData.entityAttachments[idx].url = r.url;
                    }
                }
            } catch { }
            this.notify.info(this.l('UploadSuccessfully'));
        };
    }



    removeImage(_e: any, cat: SycAttachmentCategoryDto, index: number) {
        this.accountData.entityAttachments ??= [];
        const i = this.accountData.entityAttachments.findIndex(a => a.attachmentCategoryId === cat.id && a.index === index);
        if (i > -1) this.accountData.entityAttachments.splice(i, 1);

        if (cat.id === this.sycAttachmentCategoryLogo?.id) { this.companyLogo = undefined; this._removed = { ...(this._removed || {}), logo: true }; }
        if (cat.id === this.sycAttachmentCategoryBanner?.id) { this.coverPhoto = undefined; this._removed = { ...(this._removed || {}), cover: true }; }
    }



    private _removed: { logo?: boolean; cover?: boolean } = {};

    private upsertAttachment(
        list: AppEntityAttachmentDto[],
        params: { attachmentCategoryId: number; index: number; fileName: string; guid: string }
    ): AppEntityAttachmentDto {
        const { attachmentCategoryId, index, fileName, guid } = params;
        const i = list.findIndex(a => a.attachmentCategoryId === attachmentCategoryId && a.index === index);
        let att = i > -1 ? list[i] : new AppEntityAttachmentDto();

        att.attachmentCategoryId = attachmentCategoryId;
        att.index = index;           // -1 logo, -2 cover
        att.fileName = fileName;
        att.guid = guid;

        if (i === -1) list.push(att);
        else list[i] = att;

        return att;
    }

    private mergeAttachmentsForSave(
        original: AppEntityAttachmentDto[] = [],
        edited: AppEntityAttachmentDto[] = [],
        logoCatId?: number,
        coverCatId?: number,
        removed?: { logo?: boolean; cover?: boolean }
    ): AppEntityAttachmentDto[] {

        const isLogo = (a: AppEntityAttachmentDto) => !!logoCatId && a.attachmentCategoryId === logoCatId;
        const isCover = (a: AppEntityAttachmentDto) => !!coverCatId && a.attachmentCategoryId === coverCatId;


        edited.forEach(a => {
            if (isLogo(a)) a.index = 0;
            if (isCover(a)) a.index = 0;
        });


        const out: AppEntityAttachmentDto[] = [];
        const key = (a: AppEntityAttachmentDto) => `${a.attachmentCategoryId}|${a.index}`;
        const seen = new Set<string>();
        edited
            .filter(a => !!a && !isLogo(a) && !isCover(a))
            .forEach(a => { const k = key(a); if (!seen.has(k)) { seen.add(k); out.push(a); } });

        // 2) Logo: edited wins. If not present in edited, treat as removed unless you pass removed.logo=false.
        const editedLogo = edited.find(isLogo);
        const originalLogo = original.find(isLogo);
        if (editedLogo) {
            out.push(editedLogo);
        } else if (!removed?.logo && originalLogo) {

            originalLogo.index = 0;
            out.push(originalLogo);
        }

        // 3) Cover: same logic
        const editedCover = edited.find(isCover);
        const originalCover = original.find(isCover);
        if (editedCover) {
            out.push(editedCover);
        } else if (!removed?.cover && originalCover) {
            originalCover.index = 0;
            out.push(originalCover);
        }

        return out;
    }

    get hasInvalidEmailOrPhone(): boolean {
        // Only consider invalid if the user typed something AND it doesn't match the pattern
        const email = (this.editEMailAddressValue || '').trim();
        const phone = (this.editPhoneNumberValue || '').trim();

        const emailBad = !!email && !(new RegExp(this.emailPattern).test(email));
        const phoneBad = !!phone && !(new RegExp(this.phonePattern).test(phone));

        return emailBad || phoneBad;
    }


get marketplaceRolesList(): string[] {
  const roleItem = this.entityExtraData?.find(
    x => x.attributeId === 610
  );

  return roleItem?.attributeValue
    ? roleItem.attributeValue.split('-').filter(Boolean)
    : [];
}



// buildMarketplaceRolesExtraData(): AppEntityExtraDataDto[] {
//   if (!this.selectedRoles?.length) return [];

//   const dto = new AppEntityExtraDataDto();

//   dto.entityId = this.accountData?.entityId;
//   dto.attributeId = 610;
//   dto.attributeCode = '';
//   dto.attributeValue = [...new Set(this.selectedRoles)].join('-');
//   dto.attributeValueId = null;
//   dto.attributeValueFkName = null;
//   dto.attributeValueFkCode = null;
//   dto.id = 0;

//   return [dto];
// }

buildMarketplaceRolesExtraData(): AppEntityExtraDataDto[] {

    if (!this.selectedRoles?.length) {
        return [];
    }

    const dto =
        new AppEntityExtraDataDto();

    dto.entityId =
        this.accountData?.entityId ??
        this.accountData?.id ??
        0;

    dto.entityObjectTypeId = 610;

    dto.entityObjectTypeCode =
        'PROD-RAWM-TRIM-POMP';

    dto.entityObjectTypeName =
        'Marketplace Role';

    dto.attributeId = 610;

    dto.attributeCode =
        'MARKETPLACE-ROLE';

    dto.attributeValue =
        [...new Set(this.selectedRoles)]
            .filter(Boolean)
            .join('-');

    dto.attributeValueId = null;
    dto.attributeValueFkName = null;
    dto.attributeValueFkCode = null;

    dto.id = 0;

    return [dto];
}

// updateMarketplaceRolesExtraData(): void {
//   if (!this.accountData) return;

//   const existingExtraData = this.accountData.entityExtraData || this.entityExtraData || [];

//   const updated = [
//     ...existingExtraData.filter(x => x.attributeId !== 610),
//     ...this.buildMarketplaceRolesExtraData()
//   ];


//   this.accountData.entityExtraData = updated;
//   this.entityExtraData = updated;
// }

updateMarketplaceRolesExtraData(): void {

    if (!this.accountData) {
        return;
    }

    const existing =
        this.accountData.entityExtraData ||
        this.entityExtraData ||
        [];

    this.accountData.entityExtraData = [
        ...existing.filter(
            x => x.attributeId !== 610
        ),
        ...this.buildMarketplaceRolesExtraData()
    ];

    this.entityExtraData =
        this.accountData.entityExtraData;
}


setSelectedMarketplaceRoles(): void {
  const marketplaceRole = this.entityExtraData?.find(
    x => x.attributeId === 610
  );

  this.selectedRoles = marketplaceRole?.attributeValue
    ? marketplaceRole.attributeValue.split('-').filter(Boolean)
    : [];
}


private enterPersonalEditMode(): void {

    this.ensurePersonalModels();

    this.Editting = true;

    this.editInfo = false;

    this.NoteditInfo = true;

    this.editPersonal = false;

    this.setPersonalData();
}


private savePersonalProfile(): void {

    this.ensurePersonalModels();


    const editedAccount: any = {
        ...this.accountData
    };


    editedAccount.firstName =
        this.editFirstNameValue;

    editedAccount.lastName =
        this.editLastNameValue;

    editedAccount.jobTitle =
        this.editJobTitleValue;

    editedAccount.eMailAddress =
        this.editEMailAddressValue;

    editedAccount.phone1Number =
        this.editPhoneNumberValue;


    editedAccount.languageId =
        this.contactData
            ?.languageId;

    editedAccount.languageName =
        this.allLanguages?.find(
            l =>
                l.value ==
                this.contactData
                    ?.languageId
        )?.label;


    editedAccount.emailAddressIsPublic =
        !!this.contactData
            ?.emailAddressIsPublic;

    editedAccount.phone1IsPublic =
        !!this.contactData
            ?.phone1IsPublic;


    /*
     * Keep Account DTO fields synchronized
     */
    this.accountData.eMailAddress =
        this.editEMailAddressValue;

    this.accountData.phone1Number =
        this.editPhoneNumberValue;

    this.accountData.languageId =
        this.contactData
            ?.languageId;


    /*
     * Contact fields
     */
    this.contactData.firstName =
        this.editFirstNameValue;

    this.contactData.lastName =
        this.editLastNameValue;

    this.contactData.jobTitle =
        this.editJobTitleValue;


    /*
     * Images
     */
    this.contactData.entityAttachments =
        this.mergeAttachmentsForSave(
            this.contactData
                ?.entityAttachments ||
                [],

            this.accountData
                ?.entityAttachments ||
                [],

            this.sycAttachmentCategoryLogo
                ?.id,

            this.sycAttachmentCategoryBanner
                ?.id,

            this._removed
        );


    /*
     * Marketplace role
     */
    this.updateMarketplaceRolesExtraData();

    editedAccount.entityExtraData =
        this.accountData
            .entityExtraData;


    this.editedContactData.emit(
        this.contactData
    );

    this.editedData.emit(
        editedAccount
    );
}

private ensurePersonalModels(): void {

    if (!this.accountData) {
        this.accountData = {} as any;
    }

    this.accountData.entityExtraData ??= [];
    this.accountData.entityAttachments ??= [];

    if (!this.contactData) {
        this.contactData = {
            firstName: '',
            lastName: '',
            jobTitle: '',
            languageId: null,
            languageName: '',
            emailAddressIsPublic: true,
            phone1IsPublic: true,
            entityAttachments: []
        } as any;
    } else {
        this.contactData.entityAttachments ??= [];
    }
}
}
