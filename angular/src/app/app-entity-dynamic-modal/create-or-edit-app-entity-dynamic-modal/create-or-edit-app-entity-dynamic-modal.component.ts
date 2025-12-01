import {
    AfterViewInit,
    Component,
    EventEmitter,
    Injector,
    Input,
    Output,
    ViewChild,
} from "@angular/core";
import { NgForm } from "@angular/forms";
import { FilteredExtraAttribute } from "@app/main/app-items/app-item-shared/models/filtered-extra-attribute";
import { ExtraAttributeDataService } from "@app/main/app-items/app-item-shared/services/extra-attribute-data.service";
import { ImageCropperComponent } from "@app/shared/common/image-cropper/image-cropper.component";
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
import { Observable, Subscription } from "rxjs";
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
    implements AfterViewInit {
    @ViewChild("createOreEditLookups", { static: true }) modal: ModalDirective;

    entityObjectType: { name: string; code: string };
    @Output() saveDone: EventEmitter<any> = new EventEmitter<any>();
    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();
    active: boolean = false;
    saving: boolean = false;
    loading: boolean = false;
    isSize: boolean = false;
    isColor: boolean = false;
    sizes: any[];
    displaySaveSideBar: boolean = false;
    appEntity: AppEntityDto = new AppEntityDto();
    selectedItemTypeData: GetAllEntityObjectTypeOutput;
    editMode: boolean = false;
    extraAttributes: FilteredExtraAttribute[];
    aspectRatio: number;
    codeIsRequired: boolean;
    showCodeErrMsg: boolean = false;
    isHost: boolean;
    SelectedVal: any;
    attCategoriesShow: boolean = false;
    attCategories: GetSycAttachmentCategoryForViewDto[];
    @Input() enableAddToLookup: boolean = true;
    @Input() wantdisplaySaveSideBar: boolean = true;
    addToLookup: boolean = true;
    @Output() addNonLookupValues: EventEmitter<any> = new EventEmitter<any>();

    visual = {
        solid: true,
        image: false
    };

    _displayVisualTypes:boolean=true;
    pdfSafeMap: { [index: number]: SafeResourceUrl } = {};
    private pdfRawUrl: { [index: number]: string } = {};
    statusValues: SycEntityObjectStatusLookupTableDto[]
    hideAddToLookupOption = false;

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


    show(
        entityObjectType: { name: string; code: string },
        appEntity?: AppEntityDto,
        nonlookup: boolean = false
    ): void {
        this.entityObjectType = entityObjectType;
        this.displayVisualTypes();
        this.getStatusOptions();
        this.getLookupCode()
        this.saving=false;
        if (appEntity) this.appEntity = appEntity;
        else appEntity = new AppEntityDto();
        this.appEntity.tenantId = -1;
        if (this.appEntity?.id && !nonlookup) {
            this.editMode = true;
            this.addToLookup = true;
            this.appEntity.nonlookup = false;
            this._appEntitiesServiceProxy
                .getAppEntityForEdit(this.appEntity.id)
                .pipe(
                    finalize(() => {
                        this.getExtrAttributes();
                    })
                )
                .subscribe((res) => {
                    this.appEntity = AppEntityDto.fromJS(res.appEntity);
                    if (!this.appEntity.tenantId) this.appEntity.tenantId = -1;
                    this.adjustImageSrcsUrls();
                    this.loading = true;


                    if (!(this.appEntity.entityAttachments && this.appEntity.entityAttachments?.length > 0))
                        this.setSolid(true);
                    else
                        this.setSolid(false);
                });


        }
        else {
            if (this.appEntity?.code) {
                this.editMode = true;
                if (!this.appEntity.tenantId) this.appEntity.tenantId = -1;
                this.appEntity.id = Math.floor((1 + Math.random()) * 0x10000);
                this.appEntity.nonlookup = true;
                this.addToLookup = false;
                this.adjustImageSrcsUrls();
                this.loading = true;

                if (!(this.appEntity.entityAttachments && this.appEntity.entityAttachments?.length > 0))
                    this.setSolid(true);
                else
                    this.setSolid(false);

                this.getExtrAttributes();

            }
        }


        this._sycAttachmentCategoriesServiceProxy.getAllByEntityObjectType(
            0,
            this.entityObjectType.code,
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            0,
            "",
            undefined,
            undefined,
            undefined,
            undefined
        ).subscribe(result => {

            this.attCategories = result.items;
            if (this.attCategories.length > 0) {
                this.aspectRatio = Number(this.attCategories[0].sycAttachmentCategory.aspectRatio);
                this.productImageCategory = this.attCategories[0];
                this.attCategoriesShow = true
            }
            if (this.attCategories.length > 0 && this.editMode == true && this.appEntity.entityAttachments?.length > 0) {

                let found = this.attCategories.filter(e => e.sycAttachmentCategory.id == this.appEntity.entityAttachments[0].attachmentCategoryId);
                if (found && found.length > 0) {
                    this.aspectRatio = Number(found[0].sycAttachmentCategory.aspectRatio);
                    this.productImageCategory = found[0];
                    this.attCategoriesShow = true

                }
            }

        });
        this.getExtrAttributes();
        this.initAttachmentSlots();
        this.active = true;
        this.modal.show();
    }

    ngAfterViewInit() {
        this.modal.config.backdrop = "static";
        this.modal.config.ignoreBackdropClick = true;
    }

    hide() {
        this.active = false;
        this.modal.hide();
        this.resetState();
    }
    resetState() {
        this.appEntity = new AppEntityDto();
        this._extraAttributeDataService.resetExtraAttrSelectedValues(this.extraAttributes);
        this.displaySaveSideBar = false;
        this.attachmentsSrcs = [];
        this.uploader.clearQueue();
        this.aspectRatio = undefined;
    
        this.initAttachmentSlots();
    }
    

    getStatusOptions() {
        this._sycEntityObjectStatusesAppService.getAllSycEntityStatusForTableDropdown("Lookup").subscribe(result => {
            this.statusValues = result
            if (!this.appEntity?.id && !this.appEntity.entityObjectStatusId) {
                const active = this.statusValues.find(s => s.displayName === 'Active');
                this.appEntity.entityObjectStatusId = active
                    ? active.id
                    : this.statusValues[0]?.id;
            }
        });
    }

    createAnotherEntityLookup() {
        this.hide();
        this.show(this.entityObjectType);
    }

    changeFn(event: any) {
        if (this.aspectRatio != Number(this.productImageCategory.sycAttachmentCategory.aspectRatio)) {
            this.productImageCategory =
                new GetSycAttachmentCategoryForViewDto({
                    imgURL: null,
                    sycAttachmentCategory: new SycAttachmentCategoryDto({
                        code: "IMAGE",
                        name: "Image",
                        attributes: null,
                        parentCode: null,
                        parentId: null,
                        aspectRatio: this.aspectRatio,
                        id: 3,
                    } as any),
                    sycAttachmentCategoryName: "",
                });
        }
    }
    getSelectedValue(value: any) {

        // Prints selected value

        this.aspectRatio = Number(this.attCategories[value].sycAttachmentCategory.aspectRatio);
        this.productImageCategory = this.attCategories[value];

    }

    close() {
        this.cancel.emit(true);
        this.hide();
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
                this.appEntity.nonlookup = false;
            }

            this.appEntity.nonlookup = false;

            this._appEntitiesServiceProxy
                .saveEntity(this.appEntity)
                .pipe(
                    finalize(() => {
                        this.saving = false;
                    })
                )
                .subscribe((result) => {
                    this.notify.info(this.l("SavedSuccessfully"));
                    if (this.wantdisplaySaveSideBar)
                        this.displaySaveSideBar = true;
                    this.appEntity.value = !this.appEntity.value ? result : this.appEntity.value;
                    this.addNonLookupValues.emit(this.appEntity);
                    this.saveDone.emit(true);
                    this.hide();
                });
        }
        else {

            this.appEntity.nonlookup = true;
            if (!this.appEntity.id) {
                this._appEntitiesServiceProxy
                    .isCodeExisting(this.appEntity)
                    .subscribe((result: boolean) => {
                        if (!result) {
                            this.notify.info(this.l("SavedSuccessfully"));
                            this.appEntity.tenantId = this.appSession.tenantId;
                            this.addNonLookupValues.emit(this.appEntity)
                            this.saveDone.emit(true);
                            this.hide();
                        }
                        else {
                            this.notify.error(this.l("Code is already Exist"));
                            this.saving = false;
                        }

                    });
            }
            else {
                this.notify.info(this.l("SavedSuccessfully"));
                this.appEntity.tenantId = this.appSession.tenantId;
                this.addNonLookupValues.emit(this.appEntity)
                this.saveDone.emit(true);
                this.hide();
            }
        }
    }

    getExtrAttributes() {
        this._sycEntityObjectTypesServiceProxy
            .getAllWithExtraAttributesByCode(this.entityObjectType.code)
            .subscribe(async (result) => {

                this.entityObjectType.code === "SIZE";
                if (result.length > 0) {
                    this.selectedItemTypeData = result[0];
                    this.appEntity.objectId = 1;
                    this.appEntity.entityObjectTypeId = this.selectedItemTypeData.id;

                    if (
                        this.selectedItemTypeData?.extraAttributes
                            ?.extraAttributes
                    ) {
                        await this.setAdditionalAndRecommendedExtraAttributes();
                        if (this.editMode) {
                            this.setSelectedAppEntityExtraDataOnEditMode();
                        }
                    } else {
                        this.resetExtraData();
                    }
                } else {
                    this.selectedItemTypeData =
                        new GetAllEntityObjectTypeOutput();
                }
            });


    }

    resetExtraData() {
        this.appEntity.entityExtraData = [];
        this.extraAttributes = [];
    }
    async setAdditionalAndRecommendedExtraAttributes() {
        const extraAttributres =
            this.selectedItemTypeData.extraAttributes.extraAttributes;
        this.extraAttributes =
            this._extraAttributeDataService.getFilteredAttributesByUsage(
                extraAttributres,
                undefined,
                false
            );
        const isLookupExtraAttributes: FilteredExtraAttribute[] =
            this.extraAttributes.filter((extraAttr) => extraAttr.isLookup);
        const isLookupExtraAttributesCodes: string[] =
            isLookupExtraAttributes.map((extraAttr) => extraAttr.code);

        this.isSize = isLookupExtraAttributesCodes[0] === "SIZE" ? true : false;
        this.isColor =
            isLookupExtraAttributesCodes[0] === "COLOR-SCHEME" ? true : false;
        if (this.isSize) {
            this._appEntitiesServiceProxy
                .getMarketPlaceSizes()
                .subscribe((res: any) => {
                    this.sizes = res;
                    this.appSession.tenantId;
                });
        } else {
            const responses =
                await this._extraAttributeDataService.getExtraAttributesLookupDataAsync(
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
        let selectedExtraDataAsObject: { [key: number]: any } = {}; // {[12]:[15,18,19]} = {[colorId]=[15,12,16]}
        this.appEntity.entityExtraData.forEach((ItemExtraData) => {
            let key = ItemExtraData.attributeId;
            const isLookup: boolean = !!ItemExtraData.attributeValueId;
            let value = isLookup
                ? ItemExtraData.attributeValueId
                : ItemExtraData.attributeValue;
            if (!selectedExtraDataAsObject[key])
                selectedExtraDataAsObject[key] = [];
            isLookup
                ? selectedExtraDataAsObject[key].push(value)
                : (selectedExtraDataAsObject[key] = value);
        });

        this.extraAttributes.map((elem) => {
            let _selectedValue = selectedExtraDataAsObject[elem.attributeId];
            if (_selectedValue !== undefined) {
                if (elem.isLookup && !elem.acceptMultipleValues)
                    elem.selectedValues = _selectedValue[0];
                else elem.selectedValues = _selectedValue;
            }
            return elem;
        });
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

    // extra attribute
    multiValuesExtraAttributeOnChange(
        $event: {
            itemValue: number;
            value: number[];
            originalEvent: MouseEvent;
        },
        extraAttrDefinition: FilteredExtraAttribute<number[]>
    ) {
        let selectedAttrValue = $event.itemValue;
        const isJustAdded = $event.value.includes(selectedAttrValue);

        if (!this.appEntity.entityExtraData)
            this.appEntity.entityExtraData = [];

        if (isJustAdded) {
            const newExtraData = new AppEntityExtraDataDto({
                entityId: undefined, // ??
                entityObjectTypeCode: extraAttrDefinition.entityObjectTypeCode,
                entityObjectTypeName: undefined,
                entityObjectTypeId: this.appEntity.entityObjectTypeId,
                attributeId: extraAttrDefinition.attributeId,
                attributeValueFkName: undefined,
                attributeValue: undefined, // other data types of extra attributes goes here
                attributeValueId: selectedAttrValue,
                id: 0,
                attributeValueFkCode: undefined,
                attributeCode: undefined,
            });
            this.appEntity.entityExtraData.push(newExtraData);
        } else {
            this.appEntity.entityExtraData =
                this.appEntity.entityExtraData.filter(
                    (elem) => elem.attributeValueId != selectedAttrValue
                );
        }
    }


    setStringValue(attrId: number, value: string | boolean): void {

        if (!this.appEntity.entityExtraData) this.appEntity.entityExtraData = [];

        // find existing row
        let idx = this.appEntity.entityExtraData.findIndex(x => x.attributeId === attrId);

        if (idx === -1) {
            // create new row
            const newExtra = new AppEntityExtraDataDto({
                entityId: undefined,
                attributeId: attrId,
                attributeValue: String(value),        //
                attributeValueId: 0,
                id: 0,
                entityObjectTypeCode: this.entityObjectType.code,
                entityObjectTypeName: undefined,
                entityObjectTypeId: this.appEntity.entityObjectTypeId,
                attributeValueFkName: undefined,
                attributeValueFkCode: undefined,
                attributeCode: undefined,
            });
            this.appEntity.entityExtraData.push(newExtra);
        } else {
            // update existing row
            this.appEntity.entityExtraData[idx].attributeValue = String(value);
            this.appEntity.entityExtraData[idx].attributeValueId = 0; // ensure non-lookup
        }

        // reflect in the filtered attributes (keeps UI in sync)
        const attrMeta = this.extraAttributes?.find(x => x.attributeId === attrId);
        if (attrMeta) {
            // for non-lookup/string/boolean attrs we store the raw value
            (attrMeta as any).selectedValues = String(value);
        }
    }

    singleValueExtraAttributeOnChange(
        $event: { value: number; originalEvent: MouseEvent },
        extraAttrDefinition: FilteredExtraAttribute<number>
    ) {
        let selectedAttrValue = $event.value;
        if (this.entityObjectType.code == 'MARKETPLACESECTION') {
            if ((selectedAttrValue == 486055 || selectedAttrValue == 486056)) {
                this.setStringValue(1005, 'true')

            } else {
                this.setStringValue(1005, 'false')

            }
        }
        if (!this.appEntity.entityExtraData)
            this.appEntity.entityExtraData = [];

        const currentExtraAttrIndex: number =
            this.appEntity.entityExtraData.findIndex(
                (elem) => elem.attributeId == extraAttrDefinition.attributeId
            );

        const newExtraData = new AppEntityExtraDataDto({
            entityId: undefined, // ??
            attributeId: extraAttrDefinition.attributeId,
            attributeValue: undefined,
            attributeValueId: selectedAttrValue,
            id: 0,
            entityObjectTypeCode: extraAttrDefinition.entityObjectTypeCode,
            attributeValueFkName: undefined,
            entityObjectTypeName: undefined,
            entityObjectTypeId: this.appEntity.entityObjectTypeId,
            attributeValueFkCode: undefined,
            attributeCode: undefined,
        });
        if (currentExtraAttrIndex > -1) {
            this.appEntity.entityExtraData[
                currentExtraAttrIndex
            ].attributeValueId = selectedAttrValue;
        } else {
            this.appEntity.entityExtraData.push(newExtraData);
        }
    }

    onColorChange(value, extraAttrDefinition: FilteredExtraAttribute) {

        this.notLookupExtraAttributeOnChange(value, extraAttrDefinition);
    }

    notLookupExtraAttributeOnChange(
        value,
        extraAttrDefinition: FilteredExtraAttribute
    ) {


        if (!this.appEntity.entityExtraData)
            this.appEntity.entityExtraData = [];

        this.appEntity.entityExtraData = this.appEntity.entityExtraData.filter(
            (elem) => elem.attributeId !== extraAttrDefinition.attributeId
        );

        if (value === "") return;

        const newExtraData = new AppEntityExtraDataDto({
            entityId: undefined, // ??
            attributeId: extraAttrDefinition.attributeId,
            attributeValue: value, // other data types of Extra Attributes goes here
            attributeValueId: 0,
            id: 0,
            entityObjectTypeCode: extraAttrDefinition.entityObjectTypeCode,
            attributeValueFkName: undefined,
            entityObjectTypeName: undefined,
            entityObjectTypeId: this.appEntity.entityObjectTypeId,
            attributeValueFkCode: undefined,
            attributeCode: undefined,
        });

        this.appEntity.entityExtraData.push(newExtraData);
    }
    resetExtraAttributeSelectedValue(extraAttr: FilteredExtraAttribute) {
        extraAttr.selectedValues = undefined;
        this.appEntity.entityExtraData = this.appEntity.entityExtraData.filter(
            (item) => item.attributeId !== extraAttr.attributeId
        );

    }

    openCreateAppEntityListModal(extraAttr: FilteredExtraAttribute) {
        let config: ModalOptions = new ModalOptions();
        config.class = "right-modal slide-right-in";
        let modalDefaultData: Partial<AppEntityListDynamicModalComponent> = {
            entityObjectType: {
                name: extraAttr.name,
                code: extraAttr.entityObjectTypeCode, //to be discussed with Farag
            },
            selectedRecords: extraAttr.selectedValues,
            acceptMultiValues: extraAttr.acceptMultipleValues,
        };
        config.initialState = modalDefaultData;
        let modalRef: BsModalRef = this.bsModalService.show(
            AppEntityListDynamicModalComponent,
            config
        );
        let subs: Subscription = this.bsModalService.onHidden.subscribe(() => {
            this._extraAttributeDataService.getExtraAttributeLookupData(
                extraAttr.entityObjectTypeCode,
                extraAttr.lookupData
            );

            let modalRefData: AppEntityListDynamicModalComponent =
                modalRef.content;
            if (modalRefData.selectionDone)
                extraAttr.selectedValues = modalRefData.selectedRecords;
            // if (!modalRef.content.isHiddenToCreateOrEdit)
            if (modalRef.content.isHiddenToCreateOrEdit != undefined && !modalRef.content.isHiddenToCreateOrEdit) subs.unsubscribe();
        });
    }
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
        // attachmentsSrcs: string[] = Array(1).fill("");
        attachmentsSrcs: string[] = [''];


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
        
            this.initAttachmentSlots(); // make sure we respect maxAllowedAttachments
        }
        

    fileChange(
        event: Event,
        attachmentCategory: GetSycAttachmentCategoryForViewDto,
        index?: number,
        aspectRatio?: number | string,
        cropWithoutOptions?: boolean
    ) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);

        if (isPdf) {
            // Create & sanitize blob URL for <object>
            const url = URL.createObjectURL(file);
            this.pdfRawUrl[index] = url;
            this.pdfSafeMap[index] = this.sanitizer.bypassSecurityTrustResourceUrl(url);

            // Ensure image preview slot is cleared for this index
            this.attachmentsSrcs[index] = '';

            // Prepare attachment dto (no crop)
            const att = new AppEntityAttachmentDto();
            att.index = index;
            att.fileName = file.name;
            att.attachmentCategoryId = attachmentCategory.sycAttachmentCategory.id;
            att.guid = this.guid();

            if (!this.appEntity.entityAttachments) this.appEntity.entityAttachments = [];
            this.appEntity.entityAttachments[index] = att;

            // Upload the raw PDF file
            this.uploadBlobAttachment(file, att);

            if (this.canUploadMultipleAttachments &&
                this.attachmentsSrcs.every((elem, idx) => elem || this.pdfSafeMap[idx]) &&
                this.attachmentsSrcs.length < this.maxAllowedAttachments
            ) {
                this.attachmentsSrcs.push('');
            }

            input.value = '';
            return;
        }

        // Image branch (as you already do)
        const { onCropDone, data } = this.openImageCropper(event, Number(aspectRatio), cropWithoutOptions,  this.getStaticWidthForEntity());
        const sub = onCropDone.subscribe(() => {
            if (data.isCropDone) {
                this.tempUploadImage(event, attachmentCategory, data, index);
                // clear any previous pdf in same slot
                if (this.pdfRawUrl[index]) { URL.revokeObjectURL(this.pdfRawUrl[index]); delete this.pdfRawUrl[index]; }
                delete this.pdfSafeMap[index];
            }
            input.value = '';
            // sub.unsubscribe(); // if needed
        });
    }



    tempUploadImage(
        event: Event,
        attachmentCategory: GetSycAttachmentCategoryForViewDto,
        croppedImageContent: ImageCropperComponent,
        index?: number
    ) {
        const file = (event.target as HTMLInputElement).files[0];
        // attachmentCategory.imgURL =
        //     croppedImageContent.croppedImageAsBase64 as string;

        if (
            this.appEntity.entityAttachments == null ||
            this.appEntity.entityAttachments == undefined
        ) {
            this.appEntity.entityAttachments = [];
        }
        // create GuId
        let guid = this.guid();
        // create app attachment entity
        let att: AppEntityAttachmentDto = new AppEntityAttachmentDto();
        att.index = index;
        att.fileName = file?.name;
        att.attachmentCategoryId = attachmentCategory.sycAttachmentCategory.id;
        att.guid = guid;

        // save image as a base64
        this.attachmentsSrcs[index] =
            croppedImageContent.croppedImageAsBase64 as string;
        this.appEntity.entityAttachments[index] = att;

        this.uploadBlobAttachment(croppedImageContent.croppedImage, att);


//         if (this.canUploadMultipleAttachments &&
//             this.attachmentsSrcs.every((elem, idx) => elem || this.pdfSafeMap[idx]) &&
//             this.attachmentsSrcs.length < this.maxAllowedAttachments
// ) {
//             this.attachmentsSrcs.push('');
//         }
  
    }

    // removePhoto(i: number) {
    //     if (this.appEntity.entityAttachments.length > 1)
    //         return this.notify.info(
    //             "Please set another image as default first"
    //         );
    //     this.appEntity.entityAttachments.splice(i, 1);
    //     this.attachmentsSrcs.splice(i, 1);
    //     if (this.attachmentsSrcs.length === 0) this.attachmentsSrcs.push("");
    //     this.uploader.removeFromQueue(this.uploader.queue[i]);
    // }
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
            this.attachmentsSrcs = [''];
        }
    
        // Remove from uploader queue if exists
        if (this.uploader?.queue?.[i]) {
            this.uploader.removeFromQueue(this.uploader.queue[i]);
        }
    }
    
    
    // removeAllAttachments() {
    //     if (this.attachmentsSrcs.length) {
    //         var isConfirmed: Observable<boolean>;
    //         isConfirmed = this.askToConfirm(
    //             "AreYouSureYouWantToDeleteAllTheAttachments?",
    //             "Confirm"
    //         );

    //         isConfirmed.subscribe((res) => {
    //             if (res) {
    //                 this.attachmentsSrcs = [""];
    //                 this.appEntity.entityAttachments = [];
    //                 this.uploader.clearQueue();
    //             }
    //         });
    //     }
    // }
    removeAllAttachments() {
        if (this.attachmentsSrcs.length) {
            const isConfirmed: Observable<boolean> =
                this.askToConfirm("AreYouSureYouWantToDeleteAllTheAttachments?", "Confirm");
    
            isConfirmed.subscribe((res) => {
                if (res) {
                    this.attachmentsSrcs = [""];
                    this.appEntity.entityAttachments = [];
                    this.pdfSafeMap = {};
                    Object.values(this.pdfRawUrl).forEach(url => URL.revokeObjectURL(url));
                    this.pdfRawUrl = {};
                    this.uploader.clearQueue();
                }
            });
        }
    }
    
    getCodeValue(code: string) {
        this.appEntity.code = code;
    }
    setSolid(value: boolean) {
        this.visual.solid = value;
        this.visual.image = !value;
    }

    dropdownOptions(validEntries) {
        return validEntries.split('|');
    }
    displayVisualTypes():boolean{
        //i49- what else ? 
        if(this.entityObjectType.code.toString().toUpperCase() == "CHARGES")
            this._displayVisualTypes=false;
        else
        this._displayVisualTypes=true;


        return this._displayVisualTypes ;
    }

    get canUploadMultipleAttachments(): boolean {
        return this.entityObjectType?.code === 'MARKETPLACESECTIONBLOCK';
    }

     async getLookupCode(){
        if(!this.appEntity.code){
         let  sequance="";
   
 
         const getNextEntityCodeRes = await this._sycIdentifierDefinitionsServiceProxy.getNextEntityCode(this.entityObjectType.code,this.appSession.tenantId).toPromise()
         if(getNextEntityCodeRes)
             sequance=getNextEntityCodeRes;
 
         this.appEntity.code= sequance;
     }
    }

    getStaticWidthForEntity(): number {
        switch (this.entityObjectType?.code) {
            case 'MARKETPLACESECTIONBLOCK':
            case 'MARKETPLACESECTION':
                return 318;  // same as your crop/resize logic
            default:
                return 200;
        }
    }
    onImageBrowseDone(
        output: ImageUploadComponentOutput,
        sycAttachmentCategory: SycAttachmentCategoryDto,
        index: number
      ): void {
        if (!output) {
          return;
        }
      
        const isPdf =
          output.file.type === 'application/pdf' ||
          output.file.name.toLowerCase().endsWith('.pdf');
      
        if (!this.appEntity.entityAttachments) {
          this.appEntity.entityAttachments = [];
        }
        if (!this.attachmentsSrcs) {
          this.attachmentsSrcs = [];
        }
      
        let existingIndex = this.appEntity.entityAttachments.findIndex(
          (x) =>
            x.attachmentCategoryId === sycAttachmentCategory.id &&
            x.index === index
        );
      
        let att: AppEntityAttachmentDto;
        if (existingIndex > -1) {
          att = this.appEntity.entityAttachments[existingIndex];
        } else {
          att = new AppEntityAttachmentDto();
        }
      
        const guid = this.guid();
        att.fileName = output.file.name;
        att.attachmentCategoryId = sycAttachmentCategory.id;
        att.guid = guid;
        att.index = index;
      
        if (isPdf) {
          // 🧹 نظف أي PDF قديم على نفس الـ index
          if (this.pdfRawUrl[index]) {
            URL.revokeObjectURL(this.pdfRawUrl[index]);
          }
      
          this.attachmentsSrcs[index] = ''; // عشان *ngIf(src || pdfSafeMap[i]) يشتغل
      
          const rawUrl = URL.createObjectURL(output.file);
          this.pdfRawUrl[index] = rawUrl;
          this.pdfSafeMap[index] =
            this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
      
        } else {
          // 🖼 صورة عادية
          this.attachmentsSrcs[index] = output.image;
      
          // لو كان فيه PDF قبل كده على نفس الـ index امسحيه
          if (this.pdfRawUrl[index]) {
            URL.revokeObjectURL(this.pdfRawUrl[index]);
            delete this.pdfRawUrl[index];
          }
          delete this.pdfSafeMap[index];
        }
      
        if (existingIndex === -1) {
          this.appEntity.entityAttachments.push(att);
        } else {
          this.appEntity.entityAttachments[existingIndex] = att;
        }
      
        // 👇 نفس لوجيك الرفع بتاعك
        this.uploader.addToQueue([output.file]);
        this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
          form.append('guid', guid);
        };
        this.uploader.uploadAll();
      
        // إضافة slot فاضية لو multi و لسه أقل من max
        if (
          this.canUploadMultipleAttachments &&
          this.attachmentsSrcs.every((elem, idx) => elem || this.pdfSafeMap[idx]) &&
          this.attachmentsSrcs.length < this.maxAllowedAttachments
        ) {
          this.attachmentsSrcs.push('');
        }
      }
      
    
      onRemoveImageFromUpload(_event: any, index: number): void {
        const fakeClick = new MouseEvent('click');
        this.onRemovePhoto(index, fakeClick);
      }
      
    getStaticHeightForEntity(): number {
        switch (this.entityObjectType?.code) {
            case 'MARKETPLACESECTIONBLOCK':
            case 'MARKETPLACESECTION':
                return 200;   // matches 16:9 with width 355 ≈ 355x200
            default:
                return 120;
        }
    }

    get maxAllowedAttachments(): number {
        return this.entityObjectType?.code === 'MARKETPLACESECTIONBLOCK'
            ? 2
            : 1;
    }
    private initAttachmentSlots(): void {
        if (!this.attachmentsSrcs || this.attachmentsSrcs.length === 0) {
          this.attachmentsSrcs = [''];  
        }
      }
      
      
    
      get currentAttachmentsCount(): number {
        return this.appEntity?.entityAttachments?.length || 0;
      }
      
      get nextUploadIndex(): number {

        return this.currentAttachmentsCount;
      }
      
}

