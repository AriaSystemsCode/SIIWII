import {
    AfterViewInit,
    Component,
    EventEmitter,
    Injector,
    Input,
    OnInit,
    Output,
    ViewChild,
} from "@angular/core";
import { NgForm } from "@angular/forms";
import { FilteredExtraAttribute } from "@app/main/app-items/app-item-shared/models/filtered-extra-attribute";
import { ExtraAttributeDataService } from "@app/main/app-items/app-item-shared/services/extra-attribute-data.service";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    AppEntitiesServiceProxy,
    AppEntityAttachmentDto,
    AppEntityDto,
    AppEntityExtraDataDto,
    GetAllEntityObjectTypeOutput,
    GetSycAttachmentCategoryForViewDto,
    SycAttachmentCategoryDto,
    SycEntityObjectStatusesServiceProxy,
    SycEntityObjectStatusLookupTableDto,
    SycEntityObjectTypesServiceProxy,
    SycIdentifierDefinitionsServiceProxy,
} from "@shared/service-proxies/service-proxies";
import { BsModalRef, ModalDirective, ModalOptions } from "ngx-bootstrap/modal";
import { Subscription } from "rxjs";
import { finalize } from "rxjs/operators";
import { AppEntityListDynamicModalComponent } from "../app-entity-list-dynamic-modal/app-entity-list-dynamic-modal.component";
import { DomSanitizer, SafeResourceUrl } from "@node_modules/@angular/platform-browser";
import { Router } from "@angular/router";
import { ImageUploadComponentOutput } from "@app/shared/common/image-upload/image-upload.component";

@Component({
    selector: "app-create-or-edit-app-entity-dynamic-modal",
    templateUrl: "./create-or-edit-app-entity-dynamic-modal.component.html",
    styleUrls: ["./create-or-edit-app-entity-dynamic-modal.component.scss"],
    providers: [ExtraAttributeDataService],
})
export class CreateOrEditAppEntityDynamicModalComponent
    extends AppComponentBase
    implements OnInit, AfterViewInit {
    @ViewChild("createOreEditLookups", { static: true }) modal: ModalDirective;

    @Input() enableAddToLookup: boolean = true;
    @Input() wantdisplaySaveSideBar: boolean = true;
    @Output() saveDone: EventEmitter<any> = new EventEmitter<any>();
    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();
    @Output() addNonLookupValues: EventEmitter<any> = new EventEmitter<any>();

    entityObjectType: { name: string; code: string };
    appEntity: AppEntityDto = new AppEntityDto();
    selectedItemTypeData: GetAllEntityObjectTypeOutput;
    extraAttributes: FilteredExtraAttribute[];
    statusValues: SycEntityObjectStatusLookupTableDto[];
    sizes: any[];

    active: boolean = false;
    saving: boolean = false;
    editMode: boolean = false;
    addToLookup: boolean = true;
    displaySaveSideBar: boolean = false;
    hideAddToLookupOption: boolean = false;
    isSize: boolean = false;
    isColor: boolean = false;
    isHost: boolean;
    isArabic: boolean = false;
    codeIsRequired: boolean; // set externally by parent components
    showCodeErrMsg: boolean = false;

    visual = { solid: true, image: false };
    _displayVisualTypes: boolean = true;

    // Attachments
    imageAttachmentType: 'IMAGE' | 'BANNER' | 'LOGO' = 'LOGO';
    selectedOrientation = 'Portrait';
    attachmentsSrcs: string[] = [];
    pdfSafeMap: { [index: number]: SafeResourceUrl } = {};
    excelFileMap: { [index: number]: string } = {};
    private pdfRawUrl: { [index: number]: string } = {};

    productImageCategory: GetSycAttachmentCategoryForViewDto =
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

    imageTypeOptions = [
        { label: this.l('Logo'), value: 'LOGO' },
        { label: this.l('Image'), value: 'IMAGE' },
        { label: this.l('Banner'), value: 'BANNER' },
    ];

    orientationOptions = [
        { label: this.l('Portrait'), value: 'Portrait' },
        { label: this.l('Landscape'), value: 'Landscape' },
    ];

    constructor(
        injector: Injector,
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _sycEntityObjectTypesServiceProxy: SycEntityObjectTypesServiceProxy,
        private _extraAttributeDataService: ExtraAttributeDataService,
        private sanitizer: DomSanitizer,
        private _sycEntityObjectStatusesAppService: SycEntityObjectStatusesServiceProxy,
        private router: Router,
        private _sycIdentifierDefinitionsServiceProxy: SycIdentifierDefinitionsServiceProxy
    ) {
        super(injector);
        this.initUploaders();
        this.isHost = !this.appSession.tenantId;
    }

    ngOnInit(): void {
        this.hideAddToLookupOption = this.router.url.includes('/app/main/lookups');
    }

    ngAfterViewInit() {
        this.modal.config.backdrop = "static";
        this.modal.config.ignoreBackdropClick = true;
    }

    get hasFirstAttachmentSrc(): boolean {
        return !!(this.attachmentsSrcs && this.attachmentsSrcs.length > 0 && this.attachmentsSrcs[0] != '');
    }

    get canUploadMultipleAttachments(): boolean {
        return this.entityObjectType?.code === 'MARKETPLACESECTIONBLOCK';
    }

    get maxAllowedAttachments(): number {
        return this.canUploadMultipleAttachments ? 2 : 1;
    }

    get displaySlots(): number[] {
        return Array.from({ length: this.maxAllowedAttachments }, (_, i) => i);
    }


    show(
        entityObjectType: { name: string; code: string },
        appEntity?: AppEntityDto,
        nonlookup: boolean = false
    ): void {
        const lang = abp.utils.getCookieValue('Abp.Localization.CultureName');
        this.isArabic = lang === 'ar' || lang === 'ar-EG';
        this.entityObjectType = entityObjectType;
        this.imageAttachmentType = this.imageAttachmentType ?? 'LOGO';
        this.selectedOrientation = this.selectedOrientation ?? 'Portrait';

        this.displayVisualTypes();
        this.getStatusOptions();
        this.saving = false;

        this.appEntity = appEntity || new AppEntityDto();
        this.appEntity.tenantId = -1;

        if (this.appEntity?.id && !nonlookup) {
            this.editMode = true;
            this.addToLookup = true;
            this.appEntity.nonlookup = false;

            this._appEntitiesServiceProxy
                .getAppEntityForEdit(this.appEntity.id, true)
                .pipe(finalize(() => this.getExtrAttributes()))
                .subscribe((res) => {
                    this.appEntity = AppEntityDto.fromJS(res.appEntity);
                    if (!this.appEntity.tenantId) {
                        this.appEntity.tenantId = -1;
                    }
                    this.initAttachmentState();
                });
        } else if (this.appEntity?.code) {
            this.editMode = true;
            this.appEntity.id = this.appEntity.id || Math.floor((1 + Math.random()) * 0x10000);
            this.appEntity.nonlookup = true;
            this.addToLookup = false;

            this.initAttachmentState();
            this.getExtrAttributes();
        } else {
            this.editMode = false;
            this.addToLookup = true;
            this.appEntity.nonlookup = false;

            this.getLookupCode();
            this.getExtrAttributes();
        }

        this.loadAttachmentCategory();
        this.initAttachmentSlots();
        this.active = true;
        this.modal.show();
    }

    hide() {
        this.active = false;
        this.modal.hide();
        this.resetState();
    }

    close() {
        this.cancel.emit(true);
        this.hide();
    }

    resetState() {
        this.appEntity = new AppEntityDto();
        this._extraAttributeDataService.resetExtraAttrSelectedValues(this.extraAttributes);
        this.displaySaveSideBar = false;
        this.attachmentsSrcs = [];
        this.uploader.clearQueue();

        this.pdfSafeMap = {};
        this.excelFileMap = {};
        Object.values(this.pdfRawUrl).forEach(url => URL.revokeObjectURL(url));
        this.pdfRawUrl = {};

        this.initAttachmentSlots();
    }

    createAnotherEntityLookup() {
        this.hide();
        this.show(this.entityObjectType);
    }

    createOrEditDone() {
        this.saveDone.emit(true);
        this.hide();
    }

    askForAnotherAdd(event) {
        if (event.value == "no") {
            this.createOrEditDone();
        } else {
            this.createAnotherEntityLookup();
        }
    }

    getStatusOptions() {
        this._sycEntityObjectStatusesAppService.getAllSycEntityStatusForTableDropdown("Lookup").subscribe(result => {
            this.statusValues = result;
            if (!this.appEntity?.id && !this.appEntity.entityObjectStatusId) {
                const active = this.statusValues.find(s => s.displayName === 'Active');
                this.appEntity.entityObjectStatusId = active ? active.id : this.statusValues[0]?.id;
            }
        });
    }

    async getLookupCode() {
        if (this.appEntity.code) return;

        const nextCode = await this._sycIdentifierDefinitionsServiceProxy
            .getNextEntityCode(this.entityObjectType.code, this.appSession.tenantId)
            .toPromise();
        this.appEntity.code = nextCode || "";
    }

    private loadAttachmentCategory(): void {
        this._sycAttachmentCategoriesServiceProxy
            .getAllByEntityObjectType(
                0, this.entityObjectType.code,
                "", "", "", "", "", "",
                "", 0, "",
                undefined, undefined, undefined, undefined
            )
            .subscribe(result => {
                const categories = result.items;
                if (categories.length === 0) return;

                this.productImageCategory = categories[0];

                if (this.editMode === true && this.appEntity.entityAttachments?.length > 0) {
                    const attachmentCategoryId = this.appEntity.entityAttachments[0].attachmentCategoryId;
                    const found = categories.find(e => e.sycAttachmentCategory.id == attachmentCategoryId);
                    if (found) {
                        this.productImageCategory = found;
                    }
                }
            });
    }

    getExtrAttributes() {
        this._sycEntityObjectTypesServiceProxy
            .getAllWithExtraAttributesByCode(this.entityObjectType.code, "")
            .subscribe(async (result) => {
                if (result.length === 0) {
                    this.selectedItemTypeData = new GetAllEntityObjectTypeOutput();
                    return;
                }

                this.selectedItemTypeData = result[0];
                this.appEntity.objectId = 1;
                this.appEntity.entityObjectTypeId = this.selectedItemTypeData.id;

                if (this.selectedItemTypeData?.extraAttributes?.extraAttributes) {
                    await this.setAdditionalAndRecommendedExtraAttributes();
                    if (this.editMode) {
                        this.setSelectedAppEntityExtraDataOnEditMode();
                    }
                } else {
                    this.resetExtraData();
                }
            });
    }

    resetExtraData() {
        this.appEntity.entityExtraData = [];
        this.extraAttributes = [];
    }

    async setAdditionalAndRecommendedExtraAttributes() {
        this.extraAttributes = this._extraAttributeDataService.getFilteredAttributesByUsage(
            this.selectedItemTypeData.extraAttributes.extraAttributes,
            undefined,
            false
        );

        const isLookupExtraAttributes = this.extraAttributes.filter((extraAttr) => extraAttr.isLookup);
        const isLookupExtraAttributesCodes = isLookupExtraAttributes.map((extraAttr) => extraAttr.code);

        this.isSize = isLookupExtraAttributesCodes[0] === "SIZE";
        this.isColor = isLookupExtraAttributesCodes[0] === "COLOR-SCHEME";

        if (this.isSize) {
            this._appEntitiesServiceProxy
                .getMarketPlaceSizes()
                .subscribe((res: any) => {
                    this.sizes = res;
                });
        } else {
            const responses = await this._extraAttributeDataService.getExtraAttributesLookupDataAsync(
                isLookupExtraAttributesCodes
            );
            if (responses) {
                responses.forEach((res, index) => {
                    isLookupExtraAttributes[index].lookupData = res;
                });
            }
        }
    }

    setSelectedAppEntityExtraDataOnEditMode() {
        if (!this.appEntity.entityExtraData) return;

        // e.g. { [colorId]: [15, 18, 19] }
        const selectedExtraDataAsObject: { [key: number]: any } = {};
        this.appEntity.entityExtraData.forEach((itemExtraData) => {
            const key = itemExtraData.attributeId;
            const isLookup = !!itemExtraData.attributeValueId;

            if (isLookup) {
                if (!selectedExtraDataAsObject[key]) selectedExtraDataAsObject[key] = [];
                selectedExtraDataAsObject[key].push(itemExtraData.attributeValueId);
            } else {
                selectedExtraDataAsObject[key] = itemExtraData.attributeValue;
            }
        });

        this.extraAttributes.forEach((elem) => {
            const selectedValue = selectedExtraDataAsObject[elem.attributeId];
            if (selectedValue !== undefined) {
                elem.selectedValues =
                    elem.isLookup && !elem.acceptMultipleValues ? selectedValue[0] : selectedValue;
            }
        });
    }

    save(form: NgForm) {
        if (form.invalid) {
            this.notify.error(this.l("PleaseCompleteAllTheRequiredFields"));
            return form.form.markAllAsTouched();
        } else if (this.codeIsRequired && !this.appEntity.code) {
            this.showCodeErrMsg = true;
            return this.notify.error(this.l("CodeIsRequired"));
        }

        this.saving = true;

        if (this.visual.image && this.entityObjectType.code == "COLOR")
            this.appEntity.entityExtraData = [];

        if (!this.visual.image)
            this.appEntity.entityAttachments = [];

        if (this.addToLookup) {
            if (this.appEntity.nonlookup) {
                this.appEntity.id = 0;
            }
            this.appEntity.nonlookup = false;

            this._appEntitiesServiceProxy
                .saveEntity(this.appEntity)
                .pipe(finalize(() => (this.saving = false)))
                .subscribe((result) => {
                    this.notify.info(this.l("SavedSuccessfully"));
                    if (this.wantdisplaySaveSideBar)
                        this.displaySaveSideBar = true;
                    this.appEntity.value = !this.appEntity.value ? result : this.appEntity.value;
                    this.appEntity.id = result;
                    this.addNonLookupValues.emit(this.appEntity);
                    this.saveDone.emit(true);
                    this.hide();
                });
            return;
        }

        this.appEntity.nonlookup = true;

        if (!this.appEntity.id) {
            this._appEntitiesServiceProxy
                .isCodeExisting(this.appEntity)
                .subscribe((isExisting: boolean) => {
                    if (isExisting) {
                        this.notify.error(this.l("Code is already Exist"));
                        this.saving = false;
                        return;
                    }
                    this.finishNonLookupSave();
                });
        } else {
            this.finishNonLookupSave();
        }
    }

    private finishNonLookupSave(): void {
        this.notify.info(this.l("SavedSuccessfully"));
        this.appEntity.tenantId = this.appSession.tenantId;
        this.addNonLookupValues.emit(this.appEntity);
        this.saveDone.emit(true);
        this.hide();
    }

    private ensureExtraData(): void {
        if (!this.appEntity.entityExtraData)
            this.appEntity.entityExtraData = [];
    }

    private buildExtraData(
        attributeId: number,
        entityObjectTypeCode: string,
        attributeValue: string,
        attributeValueId: number
    ): AppEntityExtraDataDto {
        return new AppEntityExtraDataDto({
            entityId: undefined,
            entityObjectTypeCode,
            entityObjectTypeName: undefined,
            entityObjectTypeId: this.appEntity.entityObjectTypeId,
            attributeId,
            attributeValueFkName: undefined,
            attributeValueFkCode: undefined,
            attributeCode: undefined,
            attributeValue,
            attributeValueId,
            id: 0,
        });
    }

    multiValuesExtraAttributeOnChange(
        $event: { itemValue: number; value: number[]; originalEvent: MouseEvent },
        extraAttrDefinition: FilteredExtraAttribute<number[]>
    ) {
        const selectedAttrValue = $event.itemValue;
        const isJustAdded = $event.value.includes(selectedAttrValue);

        this.ensureExtraData();

        if (isJustAdded) {
            this.appEntity.entityExtraData.push(
                this.buildExtraData(
                    extraAttrDefinition.attributeId,
                    extraAttrDefinition.entityObjectTypeCode,
                    undefined,
                    selectedAttrValue
                )
            );
        } else {
            this.appEntity.entityExtraData = this.appEntity.entityExtraData.filter(
                (elem) => elem.attributeValueId != selectedAttrValue
            );
        }
    }

    setStringValue(attrId: number, value: string | boolean): void {
        this.ensureExtraData();

        const idx = this.appEntity.entityExtraData.findIndex(x => x.attributeId === attrId);

        if (idx === -1) {
            this.appEntity.entityExtraData.push(
                this.buildExtraData(attrId, this.entityObjectType.code, String(value), 0)
            );
        } else {
            this.appEntity.entityExtraData[idx].attributeValue = String(value);
            this.appEntity.entityExtraData[idx].attributeValueId = 0; // ensure non-lookup
        }

        // keep the UI in sync
        const attrMeta = this.extraAttributes?.find(x => x.attributeId === attrId);
        if (attrMeta) {
            (attrMeta as any).selectedValues = String(value);
        }
    }

    singleValueExtraAttributeOnChange(
        $event: { value: number; originalEvent: MouseEvent },
        extraAttrDefinition: FilteredExtraAttribute<number>
    ) {
        const selectedAttrValue = $event.value;

        if (this.entityObjectType.code === 'MARKETPLACESECTION' &&
            extraAttrDefinition.attributeId === 1001) {

            const selectedCode = extraAttrDefinition.lookupData
                ?.find(x => x.value === selectedAttrValue)?.code;

            this.setStringValue(1005, selectedCode === 'PF' || selectedCode === 'SM' ? 'true' : 'false');
            this.toggleLastFields(selectedCode === 'SRCTA' || selectedCode === 'MRCTA');
        }

        this.ensureExtraData();

        const currentIndex = this.appEntity.entityExtraData.findIndex(
            (elem) => elem.attributeId == extraAttrDefinition.attributeId
        );

        if (currentIndex > -1) {
            this.appEntity.entityExtraData[currentIndex].attributeValueId = selectedAttrValue;
        } else {
            this.appEntity.entityExtraData.push(
                this.buildExtraData(
                    extraAttrDefinition.attributeId,
                    extraAttrDefinition.entityObjectTypeCode,
                    undefined,
                    selectedAttrValue
                )
            );
        }
    }

    notLookupExtraAttributeOnChange(value, extraAttrDefinition: FilteredExtraAttribute) {
        this.ensureExtraData();

        if (this.entityObjectType.code === 'MARKETPLACESECTION' &&
            (extraAttrDefinition.attributeId === 1006 || extraAttrDefinition.attributeId === 1026) &&
            value !== '') {
            this.setStringValue(1009, 'Single Type Blocks');
        }

        this.appEntity.entityExtraData = this.appEntity.entityExtraData.filter(
            (elem) => elem.attributeId !== extraAttrDefinition.attributeId
        );

        if (value === "") return;

        this.appEntity.entityExtraData.push(
            this.buildExtraData(
                extraAttrDefinition.attributeId,
                extraAttrDefinition.entityObjectTypeCode,
                value,
                0
            )
        );
    }

    resetExtraAttributeSelectedValue(extraAttr: FilteredExtraAttribute) {
        extraAttr.selectedValues = undefined;
        this.appEntity.entityExtraData = this.appEntity.entityExtraData.filter(
            (item) => item.attributeId !== extraAttr.attributeId
        );
    }

    dropdownOptions(validEntries) {
        return validEntries.split('|');
    }

    isBlockTypeLocked(extraAttr: FilteredExtraAttribute): boolean {
        if (this.entityObjectType?.code !== 'MARKETPLACESECTION' || extraAttr?.attributeId !== 1009) {
            return false;
        }

        const attr1006 = this.extraAttributes?.find(x => x.attributeId === 1006);
        const attr1026 = this.extraAttributes?.find(x => x.attributeId === 1026);

        return !!attr1006?.selectedValues || !!attr1026?.selectedValues;
    }

    toggleLastFields(enable: boolean): void {
        const targetIds = [1006, 1007, 1008, 1009];

        this.extraAttributes?.forEach(attr => {
            if (targetIds.includes(attr.attributeId)) {
                attr.disabled = !enable;

                if (!enable) {
                    attr.selectedValues = '';
                    this.setStringValue(attr.attributeId, '');
                }
            }
        });
    }

    onExtraAttributeColorChange(event: Event, extraAttr: FilteredExtraAttribute): void {
        const value = (event.target as HTMLInputElement).value;
        extraAttr.selectedValues = value;
        this.notLookupExtraAttributeOnChange(value, extraAttr);
    }

    onExtraAttributeColorValueChange(value: string, extraAttr: FilteredExtraAttribute): void {
        extraAttr.selectedValues = value;

        // Save only valid HEX colors
        if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            this.notLookupExtraAttributeOnChange(value, extraAttr);
        }
    }

    openCreateAppEntityListModal(extraAttr: FilteredExtraAttribute) {
        const config: ModalOptions = new ModalOptions();
        config.class = this.isArabic
            ? "left-modal slide-left-in ngLeft"
            : "right-modal slide-right-in";

        const modalDefaultData: Partial<AppEntityListDynamicModalComponent> = {
            entityObjectType: {
                name: extraAttr.name,
                code: extraAttr.entityObjectTypeCode,
            },
            selectedRecords: extraAttr.selectedValues,
            acceptMultiValues: extraAttr.acceptMultipleValues,
        };
        config.initialState = modalDefaultData;

        const modalRef: BsModalRef = this.bsModalService.show(AppEntityListDynamicModalComponent, config);
        const subs: Subscription = this.bsModalService.onHidden.subscribe(() => {
            this._extraAttributeDataService.getExtraAttributeLookupData(
                extraAttr.entityObjectTypeCode,
                extraAttr.lookupData
            );

            const modalRefData: AppEntityListDynamicModalComponent = modalRef.content;
            if (modalRefData.selectionDone)
                extraAttr.selectedValues = modalRefData.selectedRecords;

            if (modalRef.content.isHiddenToCreateOrEdit != undefined && !modalRef.content.isHiddenToCreateOrEdit)
                subs.unsubscribe();
        });
    }

    displayVisualTypes(): void {
        const shownTypes = [
            'COLOR', 'BACKGROUND', 'MARKETPLACESECTIONBLOCK', 'MARKETPLACESECTION',
            'BRAND', 'PATTERN', 'LANDINGPAGESETTINGS',
        ];

        this._displayVisualTypes = shownTypes.includes(
            this.entityObjectType.code.toString().toUpperCase()
        );

        if (!this._displayVisualTypes)
            this.visual = { solid: true, image: false };
    }

    setSolid(value: boolean) {
        this.visual.solid = value;
        this.visual.image = !value;
        this.imageAttachmentType = this.imageAttachmentType ?? 'LOGO';
    }

    private initAttachmentState(): void {
        this.adjustImageSrcsUrls();
        this.setSolid(!(this.appEntity.entityAttachments?.length > 0));
    }

    private initAttachmentSlots(): void {
        if (!this.attachmentsSrcs || this.attachmentsSrcs.length === 0) {
            this.attachmentsSrcs = [''];
        }
    }

    adjustImageSrcsUrls() {
        const atts = this.appEntity?.entityAttachments ?? [];
        this.attachmentsSrcs = [];
        this.pdfSafeMap = {};
        this.pdfRawUrl = {};

        atts.forEach((att, idx) => {
            const full = `${this.attachmentBaseUrl}/${att.url}`;
            if (/\.pdf$/i.test(att.url)) {
                this.pdfSafeMap[idx] = this.sanitizer.bypassSecurityTrustResourceUrl(full);
                this.attachmentsSrcs[idx] = '';
            } else {
                this.attachmentsSrcs[idx] = full;
            }
        });

        this.initAttachmentSlots(); // respect maxAllowedAttachments
    }

    showUploadSlot(i: number): boolean {
        if (i >= this.maxAllowedAttachments) {
            return false;
        }

        const hasAttachment = (idx: number): boolean =>
            !!this.attachmentsSrcs?.[idx] ||
            !!this.pdfSafeMap?.[idx] ||
            !!this.excelFileMap?.[idx];

        if (i === 0) {
            return !hasAttachment(0);
        }

        // Second slot is for the document's optional thumbnail
        if (i === 1) {
            const firstIsDocument = !!this.pdfSafeMap[0] || !!this.excelFileMap[0];
            return firstIsDocument && !hasAttachment(1);
        }

        return false;
    }

    onImageBrowseDone(
        output: ImageUploadComponentOutput,
        sycAttachmentCategory: SycAttachmentCategoryDto,
        index: number
    ): void {
        if (!output) {
            return;
        }

        const isExcel = /\.(xlsx|xls)$/i.test(output.file.name);
        const isPdf =
            output.file.type === 'application/pdf' ||
            output.file.name.toLowerCase().endsWith('.pdf');

        if (!this.appEntity.entityAttachments) {
            this.appEntity.entityAttachments = [];
        }
        if (!this.attachmentsSrcs) {
            this.attachmentsSrcs = [];
        }

        // make sure array has this index
        while (this.attachmentsSrcs.length <= index) {
            this.attachmentsSrcs.push(undefined);
        }

        const existingIndex = this.appEntity.entityAttachments.findIndex(
            (x) => x.attachmentCategoryId === sycAttachmentCategory.id && x.index === index
        );
        const att: AppEntityAttachmentDto =
            existingIndex > -1
                ? this.appEntity.entityAttachments[existingIndex]
                : new AppEntityAttachmentDto();

        const guid = this.guid();
        att.fileName = output.file.name;
        att.attachmentCategoryId = sycAttachmentCategory.id;
        att.guid = guid;
        att.index = index;

        if (isPdf || isExcel) {
            this.attachmentsSrcs[index] = undefined;

            if (isPdf) {
                const rawUrl = URL.createObjectURL(output.file);
                this.pdfRawUrl[index] = rawUrl;
                this.pdfSafeMap[index] = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
                delete this.excelFileMap[index];
            } else {
                this.excelFileMap[index] = output.file.name;
                delete this.pdfSafeMap[index];
            }
        } else {
            this.attachmentsSrcs[index] = output.image;
            delete this.pdfSafeMap[index];
            delete this.excelFileMap[index];
        }

        if (existingIndex === -1) {
            this.appEntity.entityAttachments.push(att);
        }

        // upload file with guid
        this.uploader.addToQueue([output.file]);
        this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
            form.append('guid', guid);
        };
        this.uploader.uploadAll();
    }

    onRemovePhoto(i: number, event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();

        if (!this.canUploadMultipleAttachments &&
            this.appEntity.entityAttachments.length > 1) {
            return this.notify.info("Please set another image as default first");
        }

        if (this.pdfRawUrl[i]) {
            URL.revokeObjectURL(this.pdfRawUrl[i]);
            delete this.pdfRawUrl[i];
        }
        delete this.pdfSafeMap[i];
        delete this.excelFileMap[i];

        // Remove attachment metadata
        if (this.appEntity.entityAttachments?.length) {
            this.appEntity.entityAttachments.splice(i, 1);
        }

        // Remove preview slot
        if (this.attachmentsSrcs?.length) {
            this.attachmentsSrcs.splice(i, 1);
        }

        // Keep at least one empty slot
        if (!this.attachmentsSrcs || this.attachmentsSrcs.length === 0) {
            this.initAttachmentSlots();
        }

        // Remove from uploader queue if exists
        if (this.uploader?.queue?.[i]) {
            this.uploader.removeFromQueue(this.uploader.queue[i]);
        }
    }

    onRemoveImageFromUpload(_event: any, index: number): void {
        this.onRemovePhoto(index, new MouseEvent('click'));
    }
}