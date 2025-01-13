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
    SycEntityObjectTypesServiceProxy,
    
} from "@shared/service-proxies/service-proxies";
import { BsModalRef, ModalDirective, ModalOptions } from "ngx-bootstrap/modal";
import { Observable, Subscription } from "rxjs";
import { finalize } from "rxjs/operators";
import { AppEntityListDynamicModalComponent } from "../app-entity-list-dynamic-modal/app-entity-list-dynamic-modal.component";
import { throws } from "assert";
import { SelectItem } from "primeng/api";

@Component({
    selector: "app-create-or-edit-app-entity-dynamic-modal",
    templateUrl: "./create-or-edit-app-entity-dynamic-modal.component.html",
    styleUrls: ["./create-or-edit-app-entity-dynamic-modal.component.scss"],
    providers: [ExtraAttributeDataService],
})
export class CreateOrEditAppEntityDynamicModalComponent
    extends AppComponentBase
    implements AfterViewInit
{
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
    attCategoriesShow:boolean=false;
    attCategories: GetSycAttachmentCategoryForViewDto [];
    @Input() enableAddToLookup:boolean=true;
    @Input()  wantdisplaySaveSideBar :boolean=true;
    addToLookup:boolean=true;
    @Output() addNonLookupValues: EventEmitter<any> = new EventEmitter<any>();
    
    visual = {
        solid: true,
        image: false
    };
    constructor(
        injector: Injector,
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _sycEntityObjectTypesServiceProxy: SycEntityObjectTypesServiceProxy,
        private _extraAttributeDataService: ExtraAttributeDataService
    ) {
        super(injector);
        this.initUploaders();
        this.isHost = !this.appSession.tenantId;
    }

    show(
        entityObjectType: { name: string; code: string },
        appEntity?: AppEntityDto,
        nonlookup:boolean=false
    ): void {
        this.entityObjectType = entityObjectType;
        this.saving=false;
        if (appEntity) this.appEntity = appEntity;
        else appEntity = new AppEntityDto();
        this.appEntity.tenantId = -1;
        if(this.appEntity?.id && !nonlookup)
                {
            this.editMode = true;
            this.addToLookup=true;
            this.appEntity.nonlookup=false;
                this._appEntitiesServiceProxy
                .getAppEntityForEdit(this.appEntity.id)
                .subscribe((res) => {
                    this.appEntity = AppEntityDto.fromJS(res.appEntity);
                   if(!this.appEntity.tenantId)   this.appEntity.tenantId = -1;
                    console.log(">>", this.appEntity);
                    this.adjustImageSrcsUrls();
                    this.loading = true;


                    if(!(this.appEntity.entityAttachments && this.appEntity.entityAttachments ?.length>0) )
                    this.setSolid(true);
                else
                this.setSolid(false);
                });
             
          
        }
        else{
            if(this.appEntity?.code){
                this.editMode = true;
                if(!this.appEntity.tenantId)   this.appEntity.tenantId = -1;
                this.appEntity.id=Math.floor((1 + Math.random()) * 0x10000);
                this.appEntity.nonlookup=true;
                this.addToLookup=false;
                this.adjustImageSrcsUrls();
                this.loading = true;

                if(!(this.appEntity.entityAttachments && this.appEntity.entityAttachments ?.length>0))
                this.setSolid(true);
            else
            this.setSolid(false);
            }
        }

       
            console.log("this.entityObjectType.code"+this.entityObjectType.code);
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
            //this.primengTableHelper.totalRecordsCount = result.totalCount;
            //this.primengTableHelper.records = result.items;
            //this.primengTableHelper.hideLoadingIndicator();
            this.attCategories = result.items;
            if(this.attCategories.length>0)
            {
                this.aspectRatio =  Number(this.attCategories[0].sycAttachmentCategory.aspectRatio);
                this.productImageCategory =  this.attCategories[0];
                this.attCategoriesShow = true
            }
            if(this.attCategories.length>0 && this.editMode == true && this.appEntity.entityAttachments?.length > 0)
            {
                 
                 let found = this.attCategories.filter(e=> e.sycAttachmentCategory.id == this.appEntity.entityAttachments[0].attachmentCategoryId);
                 if(found && found.length>0)
                 {  this.aspectRatio =  Number(found[0].sycAttachmentCategory.aspectRatio);
                    this.productImageCategory =  found[0];
                    this.attCategoriesShow = true
                     
                 }
            }
            
        });
        this.getExtrAttributes();

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
        this._extraAttributeDataService.resetExtraAttrSelectedValues(
            this.extraAttributes
        );
        this.displaySaveSideBar = false;
        this.attachmentsSrcs = [""];
        this.uploader.clearQueue();
        this.aspectRatio = undefined;
    }

    createAnotherEntityLookup() {
        this.hide();
        this.show(this.entityObjectType);
    }

    changeFn(event: any)
    {
        if (this.aspectRatio != Number(this.productImageCategory.sycAttachmentCategory.aspectRatio))
        {
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
    getSelectedValue(value:any){
  
        // Prints selected value
        console.log(value);
        this.aspectRatio = Number(this.attCategories[value].sycAttachmentCategory.aspectRatio);
        this.productImageCategory =  this.attCategories[value];
        
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

        if(this.visual.image) 
            this.appEntity.entityExtraData=[];
           else
           this.appEntity.entityAttachments=[];

        if(this.addToLookup){ 
           if(this.appEntity.nonlookup)
            {
                this.appEntity.id=0;
                this.appEntity.nonlookup=false;
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
                this.addNonLookupValues.emit(this.appEntity);
                this.saveDone.emit(true);
                this.hide();
            });
        }
        else {

            this.appEntity.nonlookup=true;
            if(!this.appEntity.id){
            this._appEntitiesServiceProxy
            .isCodeExisting(this.appEntity)
            .subscribe((result:boolean) => {
                if(!result){
                this.notify.info(this.l("SavedSuccessfully"));
                this.appEntity.tenantId=this.appSession.tenantId;
                this.addNonLookupValues.emit(this.appEntity)
                     this.saveDone.emit(true);
                    this.hide();
                }
                else{
                    this.notify.error(this.l("Code is already Exist"));
                    this.saving = false;
                }

                    });
                }
                else{
                this.notify.info(this.l("SavedSuccessfully"));
                this.appEntity.tenantId=this.appSession.tenantId;
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
                console.log(">>", this.entityObjectType.code);
                this.entityObjectType.code === "SIZE";
                if (result.length > 0) {
                    this.selectedItemTypeData = result[0];
                    this.appEntity.objectId = 1;
                    this.appEntity.entityObjectTypeId =
                        this.selectedItemTypeData.id;
                    this.appEntity.entityObjectStatusId = null;
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
        console.log(">>", isLookupExtraAttributesCodes);
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

    singleValueExtraAttributeOnChange(
        $event: { value: number; originalEvent: MouseEvent },
        extraAttrDefinition: FilteredExtraAttribute<number>
    ) {
        let selectedAttrValue = $event.value;

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
        console.log(">>", value);
        this.notLookupExtraAttributeOnChange(value, extraAttrDefinition);
    }

    notLookupExtraAttributeOnChange(
        value,
        extraAttrDefinition: FilteredExtraAttribute
    ) {
        console.log(">>", value, extraAttrDefinition);

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
        console.log(">>", this.appEntity.entityExtraData);
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
            console.log(
                ">>",
                extraAttr.entityObjectTypeCode,
                extraAttr.lookupData
            );

            let modalRefData: AppEntityListDynamicModalComponent =
                modalRef.content;
            if (modalRefData.selectionDone)
                extraAttr.selectedValues = modalRefData.selectedRecords;
           // if (!modalRef.content.isHiddenToCreateOrEdit)
            if ( modalRef.content.isHiddenToCreateOrEdit!=undefined && !modalRef.content.isHiddenToCreateOrEdit) subs.unsubscribe();
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
    attachmentsSrcs: string[] = Array(1).fill("");
    adjustImageSrcsUrls() {
        let attachments = this.appEntity?.entityAttachments?.reduce(
            (accum: string[], elem: AppEntityAttachmentDto) => {
                let imgUrlSrc = `${this.attachmentBaseUrl}/${elem.url}`;
                accum.push(imgUrlSrc);
                return accum;
            },
            []
        );
        attachments=attachments? attachments : [] ;
        if (attachments?.length > 0) this.attachmentsSrcs = [];
        this.attachmentsSrcs.unshift(...attachments);
    }
    fileChange(
        event,
        attachmentCategory: GetSycAttachmentCategoryForViewDto,
        index?: number,
        aspectRatio?: number | string,
        cropWithoutOptions?: boolean
    ) {
        if (event.target.value) {
            // there is a file
            // destructing operator => declare 2 variables from the returned object with the same keys names
            let { onCropDone, data } = this.openImageCropper(
                event,
                Number(aspectRatio),
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
            //  subs.unsubscribe();
            });
        }
    }

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

        // // if all is filled with images add new input
        // if (
        //     this.attachmentsSrcs.every((elem) => elem) &&
        //     this.attachmentsSrcs.length < 10
        // )
        //     this.attachmentsSrcs.push("");
    }

    removeAllAttachments() {
        if (this.attachmentsSrcs.length) {
            var isConfirmed: Observable<boolean>;
            isConfirmed = this.askToConfirm(
                "AreYouSureYouWantToDeleteAllTheAttachments?",
                "Confirm"
            );

            isConfirmed.subscribe((res) => {
                if (res) {
                    this.attachmentsSrcs = [""];
                    this.appEntity.entityAttachments = [];
                    this.uploader.clearQueue();
                }
            });
        }
    }
    removePhoto(i: number) {
        if (this.appEntity.entityAttachments.length > 1)
            return this.notify.info(
                "Please set another image as default first"
            );
        this.appEntity.entityAttachments.splice(i, 1);
        this.attachmentsSrcs.splice(i, 1);
        if (this.attachmentsSrcs.length === 0) this.attachmentsSrcs.push("");
        this.uploader.removeFromQueue(this.uploader.queue[i]);
    }
    getCodeValue(code: string) {
        this.appEntity.code = code;
    }
    setSolid(value:boolean){
        this.visual.solid=value;
        this.visual.image=!value;
    }
}

