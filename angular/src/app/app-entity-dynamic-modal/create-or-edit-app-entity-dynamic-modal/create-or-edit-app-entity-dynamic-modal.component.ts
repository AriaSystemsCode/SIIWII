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

    _displayVisualTypes: boolean = true;
    pdfSafeMap: { [index: number]: SafeResourceUrl } = {};
    private pdfRawUrl: { [index: number]: string } = {};
    statusValues: SycEntityObjectStatusLookupTableDto[]
    hideAddToLookupOption = false;
    imageAttachmentType: 'IMAGE' | 'BANNER' | 'LOGO' = 'LOGO';


    imageTypeOptions = [
        { label: this.l('Logo'),   value: 'LOGO'   },
        { label: this.l('Image'),  value: 'IMAGE'  },
        { label: this.l('Banner'), value: 'BANNER' },
      ];

  orientationOptions = [
        { label: this.l('Portrait'),   value: 'Portrait'   },
        { label: this.l('Landscape'),  value: 'Landscape'  }
      ];
      selectedOrientation='Portrait'
    currentLang: string;
isArabic: boolean = false;

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
        this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName');
        this.isArabic = this.currentLang === 'ar' || this.currentLang === 'ar-EG';
        this.entityObjectType = entityObjectType;
        this.imageAttachmentType = this.imageAttachmentType ?? 'LOGO';
        this.selectedOrientation = this.selectedOrientation ?? 'Portrait';
        
        this.displayVisualTypes();
        this.getStatusOptions();
        this.saving = false;
    
      
        if (appEntity) {
            this.appEntity = appEntity;
        } else {
            this.appEntity = new AppEntityDto();
        }
    
        this.appEntity.tenantId = -1;

        if (this.appEntity?.id && !nonlookup) {
            this.editMode = true;
            this.addToLookup = true;
            this.appEntity.nonlookup = false;
    
            this._appEntitiesServiceProxy
                .getAppEntityForEdit(this.appEntity.id,true)
                .pipe(
                    finalize(() => {
                        this.getExtrAttributes();
                    })
                )
                .subscribe((res) => {
                    this.appEntity = AppEntityDto.fromJS(res.appEntity);
                    if (!this.appEntity.tenantId) {
                        this.appEntity.tenantId = -1;
                    }
    
                    this.adjustImageSrcsUrls();
                    this.loading = true;
    
                    if (!(this.appEntity.entityAttachments && this.appEntity.entityAttachments.length > 0)) {
                        this.setSolid(true);
                    } else {
                        this.setSolid(false);
                    }
                });

        } else if (this.appEntity?.code) {
            this.editMode = true;
    
            if (!this.appEntity.tenantId) {
                this.appEntity.tenantId = -1;
            }
    
            this.appEntity.id = this.appEntity.id || Math.floor((1 + Math.random()) * 0x10000);
            this.appEntity.nonlookup = true;
            this.addToLookup = false;
    
            this.adjustImageSrcsUrls();
            this.loading = true;
    
            if (!(this.appEntity.entityAttachments && this.appEntity.entityAttachments.length > 0)) {
                this.setSolid(true);
            } else {
                this.setSolid(false);
            }
    
            this.getExtrAttributes();
    
    
        } else {
            this.editMode = false;
            this.addToLookup = true;
            this.appEntity.nonlookup = false;
    
            this.getLookupCode();
    
            this.getExtrAttributes();
        }
    
        // attachment categories – unchanged
        this._sycAttachmentCategoriesServiceProxy
            .getAllByEntityObjectType(
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
            )
            .subscribe(result => {
    
                this.attCategories = result.items;
    
                if (this.attCategories.length > 0) {
                    this.aspectRatio = Number(this.attCategories[0].sycAttachmentCategory.aspectRatio);
                    this.productImageCategory = this.attCategories[0];
                    this.attCategoriesShow = true;
                }
    
                if (this.attCategories.length > 0 &&
                    this.editMode === true &&
                    this.appEntity.entityAttachments?.length > 0) {
    
                    const found = this.attCategories.filter(
                        e => e.sycAttachmentCategory.id == this.appEntity.entityAttachments[0].attachmentCategoryId
                    );
    
                    if (found && found.length > 0) {
                        this.aspectRatio = Number(found[0].sycAttachmentCategory.aspectRatio);
                        this.productImageCategory = found[0];
                        this.attCategoriesShow = true;
                    }
                }
            });
    
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

        this.pdfSafeMap = {};
        Object.values(this.pdfRawUrl).forEach(url => URL.revokeObjectURL(url));
        this.pdfRawUrl = {};

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

            this.appEntity.nonlookup=false;
            this._appEntitiesServiceProxy
            .saveEntity(this.appEntity)
            .pipe(
                finalize(() => {
                    this.saving = false;
                })
            )
            .subscribe((result) => {
                this.notify.info(this.l("SavedSuccessfully"));
                if(this.wantdisplaySaveSideBar)
                this.displaySaveSideBar = true;
                this.appEntity.value=  !this.appEntity.value ? result :this.appEntity.value ; 
                this.appEntity.id=result;
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
            .getAllWithExtraAttributesByCode(this.entityObjectType.code,"")
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
        if (this.entityObjectType.code === 'MARKETPLACESECTION' &&
            extraAttrDefinition.attributeId === 1001) {
    
        
            const selectedLookup = extraAttrDefinition.lookupData
                ?.find(x => x.value === selectedAttrValue);
    
       
            const selectedCode = selectedLookup?.code; 
    
            const shouldBeTrue = selectedCode === 'PF' || selectedCode === 'SM';
    
            this.setStringValue(1005, shouldBeTrue ? 'true' : 'false');


           const isSingleOrMulti = selectedCode === 'SRCTA' || selectedCode === 'MRCTA';

  this.toggleLastFields(isSingleOrMulti);

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
      
         if (
    this.entityObjectType.code === 'MARKETPLACESECTION' &&
    extraAttrDefinition.attributeId === 1006 &&
    value !== ''
  ) {
    this.setStringValue(1009, 'Single Type Blocks');

    const blockTypeAttr = this.extraAttributes?.find(x => x.attributeId === 1009);
    if (blockTypeAttr) {
      blockTypeAttr.selectedValues = 'Single Type Blocks';
    }
  }
    
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
    attachmentsSrcs: string[] = [];


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
            this.initAttachmentSlots();
        }

        // Remove from uploader queue if exists
        if (this.uploader?.queue?.[i]) {
            this.uploader.removeFromQueue(this.uploader.queue[i]);
        }
    }





    getCodeValue(code: string) {
        this.appEntity.code = code;
    }
    setSolid(value: boolean) {
        this.visual.solid = value;
        this.visual.image = !value;
        this.imageAttachmentType = this.imageAttachmentType ?? 'LOGO';
    }

    dropdownOptions(validEntries) {
        return validEntries.split('|');
    }
      displayVisualTypes(): boolean {
        //i49- what else ? 
       // const hiddenTypes = ['CHARGES', 'TRANSACTIONCHARGES','SHIPVIA', 'CHARGETYPES'];
        const showenTypes = ['COLOR', 'BACKGROUND', 'MARKETPLACESECTIONBLOCK', 'MARKETPLACESECTION','BRAND','PATTERN'];

        this._displayVisualTypes = showenTypes.includes(
    this.entityObjectType.code.toString().toUpperCase()
);

if(!this._displayVisualTypes)
      this.visual = {
        solid: true,
        image: false
    };
        return this._displayVisualTypes;
    }

    get canUploadMultipleAttachments(): boolean {
        return this.entityObjectType?.code === 'MARKETPLACESECTIONBLOCK';
    }

    async getLookupCode() {
        if (!this.appEntity.code) {
            let sequance = "";
                const getNextEntityCodeRes = await this._sycIdentifierDefinitionsServiceProxy.getNextEntityCode(this.entityObjectType.code, this.appSession.tenantId).toPromise()
                if (getNextEntityCodeRes)
                    sequance = getNextEntityCodeRes;
    
                this.appEntity.code = sequance;

    
        }
    }

    getStaticWidthForEntity(): number {
        switch (this.entityObjectType?.code) {
            case 'MARKETPLACESECTIONBLOCK':
            case 'MARKETPLACESECTION':
                return 800;  // same as your crop/resize logic
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

        // make sure array has this index
        while (this.attachmentsSrcs.length <= index) {
            this.attachmentsSrcs.push(undefined);
        }

        let existingIndex = this.appEntity.entityAttachments.findIndex(
            (x) => x.attachmentCategoryId === sycAttachmentCategory.id && x.index === index
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
            // clear image preview for this slot
            this.attachmentsSrcs[index] = undefined;

            // free previous PDF URL if exists
            if (this.pdfRawUrl[index]) {
                URL.revokeObjectURL(this.pdfRawUrl[index]);
            }

            const rawUrl = URL.createObjectURL(output.file);
            this.pdfRawUrl[index] = rawUrl;
            this.pdfSafeMap[index] =
                this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
        } else {
            // set image preview for this slot
            this.attachmentsSrcs[index] = output.image;

            // clean any PDF data for this index
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

        // upload file with guid
        this.uploader.addToQueue([output.file]);
        this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
            form.append('guid', guid);
        };
        this.uploader.uploadAll();

        console.log(this.attachmentsSrcs, 'srcs');
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


    showUploadSlot(i: number): boolean {
        const hasImageOrPdf = (idx: number) =>
            !!this.attachmentsSrcs?.[idx] || !!this.pdfSafeMap?.[idx];

        if (!this.canUploadMultipleAttachments || this.maxAllowedAttachments === 1) {

            return i === 0 && !hasImageOrPdf(0);
        }

        if (i >= this.maxAllowedAttachments) {
            return false;
        }

        const allPreviousFilled = Array.from({ length: i }).every((_, idx) =>
            hasImageOrPdf(idx)
        );

        const currentEmpty = !hasImageOrPdf(i);

        return allPreviousFilled && currentEmpty;
    }



    get displaySlots(): number[] {
        const max = this.maxAllowedAttachments;
        return Array.from({ length: max }, (_, i) => i);
    }


    isBlockTypeLocked(extraAttr: FilteredExtraAttribute): boolean {
  if (this.entityObjectType.code !== 'MARKETPLACESECTION') return false;
  if (extraAttr?.attributeId !== 1009) return false;

  const triggerAttr = this.extraAttributes?.find(x => x.attributeId === 1006);
  return !!triggerAttr?.selectedValues;
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

}

