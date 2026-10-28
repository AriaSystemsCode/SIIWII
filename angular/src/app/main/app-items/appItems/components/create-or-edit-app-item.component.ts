import {
    AfterViewInit,
    Component,
    Injector,
    OnInit,
    ViewChild,
} from "@angular/core";
import { Location } from "@angular/common";
import { NgForm } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AppEntityListDynamicModalComponent } from "@app/app-entity-dynamic-modal/app-entity-list-dynamic-modal/app-entity-list-dynamic-modal.component";
import { SelectAppItemTypeComponent } from "@app/app-item-type/select-app-item-type/select-app-item-type.component";
import { SelectCategoriesDynamicModalComponent } from "@app/categories/select-categories-dynamic-modal.component";
import { SelectClassificationDynamicModalComponent } from "@app/classification/select-classification-dynamic-modal.component";
import { SelectRelatedItemDynamicModalComponent } from "@app/relatedItems/select-relatedItem-dynamic-modal.component";
import { AttachmentUploadSelection } from "@app/shared/common/attachment-uploader/attachment-uploader.component";
import { ImageCropperComponent } from "@app/shared/common/image-cropper/image-cropper.component";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { AppConsts } from "@shared/AppConsts";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    AppEntitiesServiceProxy,
    AppEntityAttachmentDto,
    AppEntityCategoryDto,
    AppEntityClassificationDto,
    AppEntityExtraDataDto,
    AppItemLookupDto,
    AppItemPriceInfo,
    AppItemsServiceProxy,
    CreateOrEditAppItemDto,
    CurrencyInfoDto,
    GetAllEntityObjectTypeOutput,
    GetSycAttachmentCategoryForViewDto,
    IAppItemPriceInfo,
    LookupLabelDto,
    SycAttachmentCategoryDto,
    SycEntityObjectTypesServiceProxy,
    TreeNodeOfGetSycEntityObjectCategoryForViewDto,
    TreeNodeOfGetSycEntityObjectClassificationForViewDto,
    TreeNodeOfGetSycEntityObjectTypeForViewDto,
    VariationItemDto,
    VariationListToDeleteDto,
} from "@shared/service-proxies/service-proxies";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { TabDirective } from "ngx-bootstrap/tabs";
import { SelectItem } from "primeng/api";
import { Observable, Subscription } from "rxjs";
import { finalize } from "rxjs/internal/operators/finalize";
import Swal from "sweetalert2";
import { CreateEditAppItemExtraAttribute } from "../../app-item-shared/models/create-edit-app-item-extra-attribute";
import { FilteredExtraAttribute } from "../../app-item-shared/models/filtered-extra-attribute";
import { ExtraAttributeDataService } from "../../app-item-shared/services/extra-attribute-data.service";
import { PricingHelpersService } from "../../app-item-shared/services/pricing-helpers.service";
import { PublishAppItemListingService } from "../../app-item-shared/services/publish-app-item-listing.service";
import { PublishService } from "../../app-item-shared/services/publish.service";
import { AppEntityDtoWithActions } from "../models/app-entity-dto-with-actions";
import { ListingModeEnum } from "../models/app-item-listing-enum";
import { EExtraAttributeUsage } from "../models/extra-attribute-usage.enum";
import { ApplyVariationOutput } from "./create-edit-app-item-variations.component";

interface ProductGalleryAttachment {
    type: "image" | "pdf" | "video";
    previewUrl: string;
    originalUrl: string;
    records: AppEntityAttachmentDto[];
}

const MAX_ATTACHMENTS = 10;

const SWAL_CUSTOM_CLASS = {
    popup: "popup-class",
    icon: "icon-class",
    content: "content-class",
    actions: "actions-class",
    confirmButton: "confirm-button-class2",
};

@Component({
    selector: "app-create-or-edit-app-item",
    templateUrl: "./create-or-edit-app-item.component.html",
    styleUrls: ["./create-or-edit-app-item.component.scss"],
    providers: [PublishService],
    animations: [appModuleAnimation()],
})
export class CreateOrEditAppItemComponent
    extends AppComponentBase
    implements OnInit, AfterViewInit {
    @ViewChild("productForm", { static: true }) productForm: NgForm;

    // ---------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------
    id: number;
    appItem: CreateOrEditAppItemDto = new CreateOrEditAppItemDto();
    editMode = false;
    saving = false;
    submitted = false;
    readonlyDesc = true;
    isArabic: boolean;
    languageSettingName: string;
    listingMode: ListingModeEnum;
    entityObjectType = "PRODUCT";
    headerTitle: string = this.l("CreateProduct");
    headerDesc: string = this.l("FillYourProductDetails");

    // description
    activeDescriptionIndex = 0;
    descriptionEditor: string;
    descriptionExportedHtml: string;

    // product type & extra attributes
    productTypeId: number;
    extraVariationsTypes: any;
    selectedItemTypeData: GetAllEntityObjectTypeOutput =
        new GetAllEntityObjectTypeOutput();
    extraAttributes: {
        [key in EExtraAttributeUsage]: CreateEditAppItemExtraAttribute;
    };
    oldnonLookupValues: LookupLabelDto[];

    // variations
    displayVariations = false;
    updateVariation = true;
    sellVariationChecked = true;
    selectedCurrencies: CurrencyInfoDto[] = [];
    allCurrencies: CurrencyInfoDto[] = [];

    // pricing
    defaultCurrencyMSRPPriceIndex = -1;
    showAdvancedPricing = false;

    // paged lists
    maxResultCount = 10;
    categories: AppEntityDtoWithActions<AppEntityCategoryDto>[] = [];
    departments: AppEntityDtoWithActions<AppEntityCategoryDto>[] = [];
    relatedItems: AppEntityDtoWithActions<AppItemLookupDto>[] = [];
    classifications: AppEntityDtoWithActions<AppEntityClassificationDto>[] = [];
    categoriesSkipCount = 0;
    departmentsSkipCount = 0;
    relatedItemsSkipCount = 0;
    classificationsSkipCount = 0;
    categoriesTotalCount: number;
    departmentsTotalCount: number;
    relatedItemsTotalCount: number;
    classificationsTotalCount: number;

    // attachments
    aspectRatio: number;
    defaultImageIndex = -1;
    attachmentsSrcs: string[] = [""];
    galleryAttachments: ProductGalleryAttachment[] = [];
    showAttachmentPanel = false;
    selectedAttachmentIndex = 0;
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

    constructor(
        injector: Injector,
        _location: Location,
        private _BsModalService: BsModalService,
        private _appItemsServiceProxy: AppItemsServiceProxy,
        private _publishAppItemListingService: PublishAppItemListingService,
        private _sycEntityObjectTypesServiceProxy: SycEntityObjectTypesServiceProxy,
        private _extraAttributeDataService: ExtraAttributeDataService,
        private _activatedRoute: ActivatedRoute,
        private _pricingHelperService: PricingHelpersService,
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _router: Router
    ) {
        super(injector, _location);
    }

    // ---------------------------------------------------------------------
    // Getters: ids of items added in this session (not yet saved)
    // ---------------------------------------------------------------------
    get selectedClassificationsIds(): number[] {
        return this.getUnsavedIds(
            this.classifications,
            (dto) => dto.entityObjectClassificationId
        );
    }

    get selectedCategoriesIds(): number[] {
        return this.getUnsavedIds(
            this.categories,
            (dto) => dto.entityObjectCategoryId
        );
    }

    get selectedDepartmentsIds(): number[] {
        return this.getUnsavedIds(
            this.departments,
            (dto) => dto.entityObjectCategoryId
        );
    }

    get selectedRelatedItemsIds(): number[] {
        return this.getUnsavedIds(this.relatedItems, (dto) => dto.appItemId);
    }

    private getUnsavedIds<T extends { id?: number }>(
        items: AppEntityDtoWithActions<T>[],
        idSelector: (dto: T) => number
    ): number[] {
        return (items || [])
            .filter((item) => !item.entityDto.id)
            .map((item) => idSelector(item.entityDto));
    }

    // ---------------------------------------------------------------------
    // Lifecycle
    // ---------------------------------------------------------------------
    ngOnInit(): void {
        const currentLang = abp.utils.getCookieValue("Abp.Localization.CultureName");
        this.isArabic = currentLang == "ar" || currentLang == "ar-EG";

        this.defineExtraAttributes();
        this.initUploaders();
        this.id = this.detectComponentMode();

        if (this.id) {
            this.getAppItemDataForEdit(this.id)
                .then(() => {
                    if (this.listingMode === ListingModeEnum.Create)
                        this.createNewListingMapper(this.appItem);
                    this.adjustImageSrcsUrls();
                    this.detectDefaultImageIndex();
                    this.onItemTypeChange(this.appItem.entityObjectTypeId);
                    this.productTypeId = this.appItem.entityObjectTypeId;
                    this.editMode = true;
                    this.checkAndAddDefaultPriceObject();
                })
                .catch((err) => {
                    this.notify.error(err);
                });
        } else {
            this.checkAndAddDefaultPriceObject();
        }

        this.getCurrencies();
        this.getAspectatio();
        this.languageSettingName = AppConsts.languageSettingName;

        if (!this.appItem?.taxRate) this.appItem.taxRate = 0;
    }

    ngAfterViewInit() {
        setTimeout(() => (this.readonlyDesc = false), 100);
        this.productForm.valueChanges.subscribe(() => {
            if (this.productForm.dirty) this.formTouched = true;
        });
    }

    // ---------------------------------------------------------------------
    // Mode detection & loading
    // ---------------------------------------------------------------------
    detectComponentMode() {
        let appItemId;
        const params = this._activatedRoute.snapshot.params;
        const id = params["id"]; // create/edit product
        const listingId = params["listingId"]; // edit listing
        const productId = params["productId"]; // create listing

        if (id) {
            appItemId = id;
            this.headerTitle = this.l("EditProduct");
            this.headerDesc = this.l("YouCanEditTheProductDetails");
            this.entityObjectType = "PRODUCT";
        } else if (productId) {
            this.listingMode = ListingModeEnum.Create;
            appItemId = productId;
            this.headerTitle = this.l("CreateListing");
            this.headerDesc = this.l("YouCanNowEditTheListingDetails");
            this.entityObjectType = "LISTING";
        } else if (listingId) {
            this.listingMode = ListingModeEnum.Edit;
            appItemId = listingId;
            this.headerTitle = this.l("EditListing");
            this.headerDesc = this.l("YouCanNowEditTheListingDetails");
            this.entityObjectType = "LISTING";
        }
        return appItemId;
    }

    async getAppItemDataForEdit(id: number) {
        this.showMainSpinner();
        const max = this.maxResultCount;
        return await this._appItemsServiceProxy
            .getAppItemForEdit(
                id,
                undefined, 0, max,
                undefined, 0, max,
                undefined, 0, max,
                undefined, 0, max,
                undefined, // item SSIN
                undefined, 0, max
            )
            .toPromise()
            .then((res) => {
                this.appItem = CreateOrEditAppItemDto.fromJS({
                    ...res.appItem,
                    entityCategories: res.appItem.entityCategories.items,
                    entityDepartments: res.appItem.entityDepartments.items,
                    entityRelatedItems: res.appItem.relatedAppItems.items,
                    entityClassifications: res.appItem.entityClassifications.items,
                    nonLookupValues: res.nonLookupValues,
                });
                this.snapshotNonLookupValues();

                this.categoriesTotalCount = res.appItem.entityCategories.totalCount;
                this.departmentsTotalCount = res.appItem.entityDepartments.totalCount;
                this.relatedItemsTotalCount = res.appItem?.relatedAppItems?.totalCount;
                this.classificationsTotalCount = res.appItem.entityClassifications.totalCount;

                this.handleCategories(res.appItem.entityCategories.items);
                this.handleDepartments(res.appItem.entityDepartments.items);
                this.handleRelatedItems(res.appItem.relatedAppItems.items);
                this.handleClassifications(res.appItem.entityClassifications.items);

                this.sellVariationChecked = Boolean(this.appItem.variationItems.length);
                return true;
            })
            .catch(() => false)
            .finally(() => this.hideMainSpinner());
    }

    createNewListingMapper(parentProduct: CreateOrEditAppItemDto) {
        this.appItem = CreateOrEditAppItemDto.fromJS(parentProduct);
        this.appItem.parentId = this.appItem.id;
        delete this.appItem.id;
        delete this.appItem.entityId;
        this.removeIds(this.appItem);
    }

    removeIds(object: any) {
        Object.keys(object).forEach((key) => {
            const value = object[key];

            // variations keep their ids on the parentId field
            if (key === "variationItems") {
                object[key].forEach((item) => (item.parentId = item.id));
            }

            if (key === "appItemSizesScaleInfo") {
                object.appItemSizesScaleInfo.forEach((info, index) => {
                    info.parentId = index == 0 ? null : 0; // 0 => size scale, 1 => size ratio
                });
            }

            if (Array.isArray(value)) {
                value.forEach((item) => delete item.id);
                value.forEach((item) => this.removeIds(item));
            }
        });
    }

    private snapshotNonLookupValues() {
        const values = this.appItem.nonLookupValues;
        this.oldnonLookupValues =
            values && values.length > 0
                ? values.map((item) => new LookupLabelDto(item))
                : [];
    }

    // ---------------------------------------------------------------------
    // Modal helpers
    // ---------------------------------------------------------------------
    private createSideModalConfig(initialState?: any): ModalOptions {
        const config = new ModalOptions();
        config.class = this.isArabic
            ? "left-modal slide-left-in ngLeft"
            : "right-modal slide-right-in";
        if (initialState) config.initialState = initialState;
        return config;
    }

    private fireDialog(
        text: string,
        confirmButtonText: string,
        cancelButtonText?: string
    ) {
        return Swal.fire({
            title: "",
            text,
            icon: "info",
            showCancelButton: !!cancelButtonText,
            confirmButtonText,
            cancelButtonText,
            allowOutsideClick: false,
            allowEscapeKey: false,
            backdrop: true,
            customClass: SWAL_CUSTOM_CLASS,
        });
    }

    // ---------------------------------------------------------------------
    // Product type & extra attributes
    // ---------------------------------------------------------------------
    defineExtraAttributes() {
        this.extraAttributes = {
            [EExtraAttributeUsage.Recommended]: new CreateEditAppItemExtraAttribute({
                header: this.l("Recommended"),
                title: this.l("BuyersMayAlsoBeInterestedInTheseItemSpecifics"),
                usageEnum: EExtraAttributeUsage.Recommended,
                orderOfDisplay: 1,
            }),
            [EExtraAttributeUsage.Additional]: new CreateEditAppItemExtraAttribute({
                header: this.l("Additional"),
                title: this.l("Buyersfrequentlysearchfortheseitemspecifics"),
                usageEnum: EExtraAttributeUsage.Additional,
                orderOfDisplay: 2,
            }),
        };
    }

    onItemTypeChange(id: number) {
        this.getallAtrributes(id);
    }

    getallAtrributes(id: number) {
        this._appItemsServiceProxy
            .getProductVariationsTypes(id)
            .subscribe((res: any) => {
                const sameVariationTypes =
                    !this.extraVariationsTypes ||
                    JSON.stringify(this.extraVariationsTypes) == JSON.stringify(res);

                if (sameVariationTypes) {
                    this.extraVariationsTypes = res;
                    this.getAppItemTypeExtraAttributesByIdFun(id);
                    return;
                }

                this.fireDialog(
                    "The original product type has attributes that don't exist in the selected product type , data in those attributes will be lost ?",
                    "Continue",
                    "Cancel"
                ).then((result) => {
                    if (result.isConfirmed)
                        this.getAppItemTypeExtraAttributesByIdFun(id);
                });
            });
    }

    getAppItemTypeExtraAttributesById(id: number) {
        if (!id) return;
        return this._sycEntityObjectTypesServiceProxy.getAllWithExtraAttributes(id);
    }

    getAppItemTypeExtraAttributesByIdFun(id) {
        if (isNaN(id)) {
            if (!this.appItem.entityExtraData) this.appItem.entityExtraData = [];
            this.selectedItemTypeData = new GetAllEntityObjectTypeOutput();
            this.resetExtraData();
            return;
        }

        this.getAppItemTypeExtraAttributesById(id).subscribe(
            (result) => {
                if (!result.length) {
                    this.selectedItemTypeData = new GetAllEntityObjectTypeOutput();
                    return;
                }

                this.selectedItemTypeData = result[0];
                if (this.selectedItemTypeData.extraAttributes?.extraAttributes) {
                    this.setAdditionalAndRecommendedExtraAttributes();
                    this.loadRecommendedAndAdditionalExtraDataLookupLists();
                    if (this.editMode) {
                        this.setSelectedAppEntityExtraDataOnEditMode();
                        this.removeSelectedOrAddUnSelectedExtraAttributesOnVariationsFromAppItemEntityExtraData();
                    }
                } else {
                    this.resetExtraData();
                }
            },
            () => this.notify.info(this.l("FailedToLoadProductTypeData"))
        );
    }

    resetExtraData() {
        this.appItem.entityExtraData = [];
        this.extraAttributes.RECOMMENDED.extraAttributes = [];
        this.extraAttributes.ADDITIONAL.extraAttributes = [];
    }

    setAdditionalAndRecommendedExtraAttributes() {
        const extraAttributes =
            this.selectedItemTypeData.extraAttributes.extraAttributes;
        this.extraAttributes.RECOMMENDED.extraAttributes =
            this._extraAttributeDataService.getFilteredAttributesByUsage(
                extraAttributes,
                EExtraAttributeUsage.Recommended,
                false
            );
        this.extraAttributes.ADDITIONAL.extraAttributes =
            this._extraAttributeDataService.getFilteredAttributesByUsage(
                extraAttributes,
                EExtraAttributeUsage.Additional,
                false
            );
    }

    loadRecommendedAndAdditionalExtraDataLookupLists() {
        [
            ...this.extraAttributes.RECOMMENDED.extraAttributes,
            ...this.extraAttributes.ADDITIONAL.extraAttributes,
        ].forEach((extraAttr) => {
            if (extraAttr.isLookup) this.loadExtraDataLookupList(extraAttr);
        });
    }

    loadExtraDataLookupList(extraAttr: FilteredExtraAttribute) {
        const paging = extraAttr.paginationSetting;
        this._extraAttributeDataService
            .getExtraAttributeLookupDataWithPaging(
                extraAttr.entityObjectTypeCode,
                paging.skipCount,
                paging.maxResultCount
            )
            .subscribe((result) => {
                paging.totalCount = result.totalCount;

                if (paging.skipCount == 0) paging.list = [];
                else paging.list.splice(paging.list.length - 1, 1); // drop previous "show more"

                const selectedExistsInResult = result.items.some(
                    (item) => item.value == extraAttr.attributeId
                );
                if (!selectedExistsInResult && extraAttr?.selectedValues?.length > 0) {
                    result.items.push(
                        new LookupLabelDto({
                            code: extraAttr.code,
                            label: extraAttr.selectedValues,
                            stockAvailability: undefined,
                            value: extraAttr.selectedValues,
                            isHostRecord: false,
                            hexaCode: undefined,
                            image: undefined,
                            status: undefined,
                            entityObjectStatusId: undefined,
                        })
                    );
                }

                paging.list.push(...result.items);

                if (paging.list.length < paging.totalCount) {
                    const showMoreSelectItem: SelectItem = {
                        value: -1,
                        label: this.l("showMore"),
                        icon: "fas  fa-reply",
                        styleClass: "showMore",
                        disabled: false,
                    };
                    paging.list.push(showMoreSelectItem);
                }
                paging.skipCount += paging.maxResultCount;
            });
    }

    setSelectedAppEntityExtraDataOnEditMode() {
        if (!this.appItem.entityExtraData) return;

        const allAttributes = [
            ...this.extraAttributes.ADDITIONAL.extraAttributes,
            ...this.extraAttributes.RECOMMENDED.extraAttributes,
        ];
        const selectedExtraDataAsObject: { [key: number]: any } = {}; // {[colorId]: [15,12,16]}

        this.appItem.entityExtraData.forEach((itemExtraData) => {
            const extraAttrDef = allAttributes.find(
                (x) => x.attributeId == itemExtraData.attributeId
            );
            const key = itemExtraData.attributeId;
            const isLookup = !!itemExtraData.attributeValueId;
            const value = isLookup
                ? itemExtraData.attributeValueId
                : itemExtraData.attributeValue;

            if (!selectedExtraDataAsObject[key]) selectedExtraDataAsObject[key] = [];

            if (isLookup && extraAttrDef?.acceptMultipleValues)
                selectedExtraDataAsObject[key].push(value);
            else selectedExtraDataAsObject[key] = value;
        });

        allAttributes.forEach((elem) => {
            const selected = selectedExtraDataAsObject[elem.attributeId];
            if (selected !== undefined) elem.selectedValues = selected;
        });
    }

    removeSelectedOrAddUnSelectedExtraAttributesOnVariationsFromAppItemEntityExtraData() {
        let variation = this.appItem.variationItems[0];
        if (!variation) {
            variation = new VariationItemDto();
            variation.entityExtraData = [];
        }
        const selectedIds = variation.entityExtraData.map((item) => item.attributeId);
        const flag = (item: FilteredExtraAttribute) => {
            item.isSelectedOnVariation = selectedIds.includes(item.attributeId);
            return item;
        };
        this.extraAttributes.ADDITIONAL.extraAttributes =
            this.extraAttributes.ADDITIONAL.extraAttributes.map(flag);
        this.extraAttributes.RECOMMENDED.extraAttributes =
            this.extraAttributes.RECOMMENDED.extraAttributes.map(flag);
    }

    multiValuesExtraAttributeOnChange(
        $event: { itemValue: number; value: number[]; originalEvent: MouseEvent },
        extraAttrDefinition
    ) {
        if ($event.itemValue == -1) {
            extraAttrDefinition.selectedValues = (
                extraAttrDefinition.selectedValues as number[]
            ).filter((item) => item > 0);
            return this.loadMoreLookupData(extraAttrDefinition);
        }
        this.formTouched = true;
    }

    singleValueExtraAttributeOnChange(
        $event: { value: number; originalEvent: MouseEvent },
        extraAttrDefinition: FilteredExtraAttribute<number>
    ) {
        if ($event.value == -1) {
            extraAttrDefinition.selectedValues = undefined;
            return this.loadMoreLookupData(extraAttrDefinition);
        }
        this.formTouched = true;
    }

    notLookupExtraAttributeOnChange(value, extraAttrDefinition: FilteredExtraAttribute) {
        this.formTouched = true;
    }

    loadMoreLookupData(extraAttrDefinition: FilteredExtraAttribute<number>) {
        return this.loadExtraDataLookupList(extraAttrDefinition);
    }

    resetExtraAttributeSelectedValue(extraAttr: FilteredExtraAttribute) {
        this.formTouched = true;
        extraAttr.selectedValues = undefined;
        this.appItem.entityExtraData = this.appItem.entityExtraData.filter(
            (item) => item.attributeId !== extraAttr.attributeId
        );
    }

    openCreateNewAppEntityModal(extraAttr: FilteredExtraAttribute) {
        this.formTouched = true;
        const modalDefaultData: Partial<AppEntityListDynamicModalComponent> = {
            entityObjectType: {
                name: extraAttr.name,
                code: extraAttr.entityObjectTypeCode, // to be discussed with Farag
            },
            selectedRecords: extraAttr.selectedValues,
            acceptMultiValues: extraAttr.acceptMultipleValues,
        };
        const modalRef: BsModalRef = this._BsModalService.show(
            AppEntityListDynamicModalComponent,
            this.createSideModalConfig(modalDefaultData)
        );
        const subs: Subscription = this._BsModalService.onHidden.subscribe(() => {
            this._extraAttributeDataService.getExtraAttributeLookupData(
                extraAttr.entityObjectTypeCode,
                extraAttr.lookupData
            );
            const modalRefData: AppEntityListDynamicModalComponent = modalRef.content;

            if (extraAttr?.paginationSetting?.skipCount)
                extraAttr.paginationSetting.skipCount = 0;

            this.loadExtraDataLookupList(extraAttr);

            if (modalRefData.selectionDone)
                extraAttr.selectedValues = modalRefData.selectedRecords;

            if (
                modalRef.content.isHiddenToCreateOrEdit != undefined &&
                !modalRef.content.isHiddenToCreateOrEdit
            )
                subs.unsubscribe();
        });
    }

    extraSelectedValuesExtraData() {
        const recentlyExtraAttributes: FilteredExtraAttribute<any>[] = [
            ...this.extraAttributes.ADDITIONAL.extraAttributes,
            ...this.extraAttributes.RECOMMENDED.extraAttributes,
        ];
        const previousExtraAttributes: AppEntityExtraDataDto[] =
            this.appItem.entityExtraData || [];
        this.appItem.entityExtraData = [];

        recentlyExtraAttributes.forEach((extraAttr) => {
            if (!extraAttr.selectedValues || extraAttr.isSelectedOnVariation) return;

            if (extraAttr.isLookup && extraAttr.acceptMultipleValues) {
                extraAttr.selectedValues.forEach((attributeValueId) => {
                    const alreadySelected = previousExtraAttributes.find(
                        (item) => item.attributeValueId == attributeValueId
                    );
                    if (alreadySelected)
                        return this.appItem.entityExtraData.push(alreadySelected);

                    const entityExtraData = new AppEntityExtraDataDto();
                    entityExtraData.id = 0;
                    entityExtraData.attributeValueId = attributeValueId;
                    entityExtraData.attributeId = extraAttr.attributeId;
                    this.appItem.entityExtraData.push(entityExtraData);
                });
                return;
            }

            // single lookup or non-lookup value
            const entityExtraData =
                previousExtraAttributes.find(
                    (item) => item.attributeId == extraAttr.attributeId
                ) || this.newExtraData(extraAttr.attributeId);

            if (extraAttr.isLookup)
                entityExtraData.attributeValueId = parseInt(extraAttr.selectedValues);
            else entityExtraData.attributeValue = extraAttr.selectedValues;

            this.appItem.entityExtraData.push(entityExtraData);
        });
    }

    private newExtraData(attributeId: number): AppEntityExtraDataDto {
        const entityExtraData = new AppEntityExtraDataDto();
        entityExtraData.id = 0;
        entityExtraData.attributeId = attributeId;
        return entityExtraData;
    }

    // ---------------------------------------------------------------------
    // Product type modal
    // ---------------------------------------------------------------------
    openSelectAppItemTypeModal() {
        const modalDefaultData: Partial<SelectAppItemTypeComponent> = {
            savedId: this.appItem.entityObjectTypeId,
        };
        const modalRef: BsModalRef = this._BsModalService.show(
            SelectAppItemTypeComponent,
            this.createSideModalConfig(modalDefaultData)
        );
        const subs: Subscription = this._BsModalService.onHidden.subscribe(() => {
            this.selectAppItemTypeHandler(modalRef);
            subs.unsubscribe();
        });
    }

    selectAppItemTypeHandler(modalRef: BsModalRef) {
        const data: SelectAppItemTypeComponent = modalRef.content;
        if (!(data.selectionDone && data.selectedRecord)) return;

        const typeId = data.selectedRecord.data.sycEntityObjectType.id;

        if (!(this.appItem?.id > 0)) {
            this._appItemsServiceProxy
                .generateProductCode(typeId, false, this.appSession.tenantId)
                .subscribe((res: any) => {
                    this.appItem.code = res;
                    this.appItem.OriginalCode = res;
                });
        }
        this.productTypeId = typeId;
        this.addSelectedAppItemType(data.selectedRecord);
        this.onItemTypeChange(typeId);
    }

    addSelectedAppItemType(selected: TreeNodeOfGetSycEntityObjectTypeForViewDto): void {
        this.formTouched = true;
        this.appItem.entityObjectTypeId = selected.data.sycEntityObjectType.id;
    }

    // ---------------------------------------------------------------------
    // Categories
    // ---------------------------------------------------------------------
    openSelectCategoriesModal() {
        const modalDefaultData: Partial<SelectCategoriesDynamicModalComponent> = {
            savedIds: this.selectedCategoriesIds,
            showAddAction: true,
            showActions: true,
            entityId: this.appItem.entityId,
        };
        const modalRef: BsModalRef = this._BsModalService.show(
            SelectCategoriesDynamicModalComponent,
            this.createSideModalConfig(modalDefaultData)
        );
        const subs: Subscription = this._BsModalService.onHidden.subscribe(() => {
            this.selectCategoriesHandler(modalRef);
            if (
                modalRef.content.isHiddenToCreateOrEdit != undefined &&
                !modalRef.content.isHiddenToCreateOrEdit
            )
                subs.unsubscribe();
        });
    }

    selectCategoriesHandler(modalRef) {
        const data: SelectCategoriesDynamicModalComponent = modalRef.content;
        if (data.selectionDone && Array.isArray(data.selectedRecords) && data.selectedRecords.length)
            this.addSelectedCategories(data.selectedRecords);
    }

    removeCategory(category: AppEntityDtoWithActions<AppEntityCategoryDto>, i: number) {
        this.formTouched = true;
        if (category.entityDto.id) category.removed = true;
        else this.categories.splice(i, 1);
    }

    undoCategory(category: AppEntityDtoWithActions<AppEntityCategoryDto>) {
        category.removed = false;
    }

    loadMoreCategories() {
        this.categoriesSkipCount += this.maxResultCount;
        this._appItemsServiceProxy
            .getAppItemCategoriesWithPaging(
                this.id,
                undefined,
                undefined,
                this.categoriesSkipCount,
                this.maxResultCount
            )
            .subscribe((res) => this.handleCategories(res.items));
    }

    handleCategories(data: AppEntityCategoryDto[]) {
        if (!data) return;
        data.forEach((item) => {
            const categ = new AppEntityDtoWithActions<AppEntityCategoryDto>();
            categ.entityDto = item;
            this.categories.push(categ);
        });
    }

    addSelectedCategories(selected: TreeNodeOfGetSycEntityObjectCategoryForViewDto[]): void {
        this.pushSelectedCategoryNodes(selected, this.categories);
        this.appItem.entityCategories = [];
        this.formTouched = true;
    }

    seperateNewAndRemovedCategories() {
        const [added, removed] = this.splitAddedAndRemoved(this.categories);
        this.appItem.entityCategoriesAdded = added;
        this.appItem.entityCategoriesRemoved = removed;
    }

    // ---------------------------------------------------------------------
    // Departments
    // ---------------------------------------------------------------------
    openSelectDepartmentsModal() {
        this.formTouched = true;
        const modalDefaultData: Partial<SelectCategoriesDynamicModalComponent> = {
            savedIds: this.selectedDepartmentsIds,
            showAddAction: false,
            showActions: false,
            isDepartment: true,
            entityObjectDisplayName: this.l("Departments"),
            entityId: this.appItem.entityId,
        };
        const modalRef: BsModalRef = this._BsModalService.show(
            SelectCategoriesDynamicModalComponent,
            this.createSideModalConfig(modalDefaultData)
        );
        const subs: Subscription = this._BsModalService.onHidden.subscribe(() => {
            this.selectDepartmentsHandler(modalRef);
            subs.unsubscribe();
        });
    }

    selectDepartmentsHandler(modalRef) {
        const data: SelectCategoriesDynamicModalComponent = modalRef.content;
        if (data.selectionDone && Array.isArray(data.selectedRecords) && data.selectedRecords.length)
            this.addSelectedDepartments(data.selectedRecords);
    }

    removeDepartment(department: AppEntityDtoWithActions<AppEntityCategoryDto>, i: number) {
        this.formTouched = true;
        if (department.entityDto.id) department.removed = true;
        else this.departments.splice(i, 1);
    }

    undoDepartment(department: AppEntityDtoWithActions<AppEntityCategoryDto>) {
        department.removed = false;
    }

    loadMoreDepartments() {
        this.departmentsSkipCount += this.maxResultCount;
        this._appItemsServiceProxy
            .getAppItemDepartmentsWithPaging(
                this.id,
                undefined,
                undefined,
                this.departmentsSkipCount,
                this.maxResultCount
            )
            .subscribe(() => {});
    }

    handleDepartments(data: AppEntityCategoryDto[]) {
        if (!data) return;
        data.forEach((item) => {
            const dept = new AppEntityDtoWithActions<AppEntityCategoryDto>();
            dept.entityDto = item;
            this.departments.push(dept);
        });
    }

    addSelectedDepartments(selected: TreeNodeOfGetSycEntityObjectCategoryForViewDto[]): void {
        this.pushSelectedCategoryNodes(selected, this.departments);
    }

    seperateNewAndRemovedDepartments() {
        const [added, removed] = this.splitAddedAndRemoved(this.departments);
        this.appItem.entityDepartmentsAdded = added;
        this.appItem.entityDepartmentsRemoved = removed;
    }

    // ---------------------------------------------------------------------
    // Related items
    // ---------------------------------------------------------------------
    openSelectRelatedItemsModal() {
        this.formTouched = true;
        const modalDefaultData: Partial<SelectRelatedItemDynamicModalComponent> = {
            savedIds: this.selectedRelatedItemsIds,
            showAddAction: false,
            showActions: false,
            entityObjectDisplayName: this.l("Relatedproducts"),
            entityId: this.appItem.entityId,
        };
        const modalRef: BsModalRef = this._BsModalService.show(
            SelectRelatedItemDynamicModalComponent,
            this.createSideModalConfig(modalDefaultData)
        );
        const subs: Subscription = this._BsModalService.onHidden.subscribe(() => {
            this.selectRelatedItemsHandler(modalRef);
            subs.unsubscribe();
        });
    }

    selectRelatedItemsHandler(modalRef) {
        const data: SelectRelatedItemDynamicModalComponent = modalRef.content;
        if (data.selectionDone && Array.isArray(data.selectedRecords) && data.selectedRecords.length)
            this.addSelectedRelatedItems(data.selectedRecords);
    }

    removeRelatedItem(relatedItem: AppEntityDtoWithActions<AppItemLookupDto>, i: number) {
        this.formTouched = true;
        if (relatedItem.entityDto.id) relatedItem.removed = true;
        else this.relatedItems.splice(i, 1);
    }

    undoRelatedItem(relatedItem: AppEntityDtoWithActions<AppItemLookupDto>) {
        relatedItem.removed = false;
    }

    loadMoreRelatedItems() {
        this.relatedItemsSkipCount += this.maxResultCount;
        this._appItemsServiceProxy
            .getAppItemRelatedProductsWithPaging(
                undefined, undefined, undefined, undefined, undefined,
                undefined, undefined, undefined, undefined,
                this.appItem.entityId,
                undefined, undefined, undefined, undefined,
                this.relatedItemsSkipCount,
                this.maxResultCount
            )
            .subscribe((res) => this.handleRelatedItems(res.items));
    }

    handleRelatedItems(data: AppItemLookupDto[]) {
        if (!data) return;
        data.forEach((item) => {
            const related = new AppEntityDtoWithActions<AppItemLookupDto>();
            related.entityDto = item;
            this.relatedItems.push(related);
        });
    }

    addSelectedRelatedItems(selected: TreeNodeOfGetSycEntityObjectCategoryForViewDto[]): void {
        selected.forEach((element) => {
            if (!element.leaf) return;
            const category = element.data.sycEntityObjectCategory;
            this.relatedItems.push(
                new AppEntityDtoWithActions<AppItemLookupDto>({
                    entityDto: new AppItemLookupDto({
                        appItemId: category?.id ?? 0,
                        appItemCode: category?.code ?? "",
                        appItemName: category?.name ?? "",
                        appItemDescription: category?.description ?? "",
                        appItemImageUrl: category?.appItemImageUrl ?? "",
                        appItemImageName: category?.appItemImageName ?? "",
                        id: 0,
                    }),
                })
            );
        });
    }

    seperateNewAndRemovedRelatedItems() {
        const added: AppItemLookupDto[] = [];
        const removed: AppItemLookupDto[] = [];

        this.relatedItems.forEach((relatedItem) => {
            if (relatedItem.removed) removed.push(relatedItem.entityDto);
            else if (!relatedItem.entityDto.id) added.push(relatedItem.entityDto);
        });

        this.appItem.entityRelatedItemAdded = added.map((item) => this.toCategoryDto(item, 0));
        this.appItem.entityRelatedItemsRemoved = removed.map((item) => this.toCategoryDto(item, 0));
    }

    private toCategoryDto(item: AppItemLookupDto, id: number): AppEntityCategoryDto {
        const dto = new AppEntityCategoryDto();
        dto.entityObjectCategoryId = item.appItemId;
        dto.entityObjectCategoryCode = item.appItemCode;
        dto.entityObjectCategoryName = item.appItemName;
        dto.id = id;
        return dto;
    }

    // ---------------------------------------------------------------------
    // Classifications
    // ---------------------------------------------------------------------
    openSelectClassificationsModal() {
        this.formTouched = true;
        const modalDefaultData: Partial<SelectClassificationDynamicModalComponent> = {
            savedIds: this.selectedClassificationsIds,
            showAddAction: true,
            showActions: true,
            entityId: this.appItem.entityId,
        };
        const modalRef: BsModalRef = this._BsModalService.show(
            SelectClassificationDynamicModalComponent,
            this.createSideModalConfig(modalDefaultData)
        );
        const subs: Subscription = this._BsModalService.onHidden.subscribe(() => {
            this.selectClassificationsHandler(modalRef);
            if (
                modalRef.content.isHiddenToCreateOrEdit != undefined &&
                !modalRef.content.isHiddenToCreateOrEdit
            )
                subs.unsubscribe();
        });
    }

    selectClassificationsHandler(modalRef) {
        const data: SelectClassificationDynamicModalComponent = modalRef.content;
        if (data.selectionDone && Array.isArray(data.selectedRecords) && data.selectedRecords.length)
            this.addSelectedClassifications(data.selectedRecords);
    }

    removeClassification(
        classification: AppEntityDtoWithActions<AppEntityClassificationDto>,
        i: number
    ) {
        this.formTouched = true;
        if (classification.entityDto.id) classification.removed = true;
        else this.classifications.splice(i, 1);
    }

    undoClassification(classification: AppEntityDtoWithActions<AppEntityClassificationDto>) {
        classification.removed = false;
    }

    loadMoreClassifications() {
        this.classificationsSkipCount += this.maxResultCount;
        this._appItemsServiceProxy
            .getAppItemClassificationsWithPaging(
                this.id,
                undefined,
                undefined,
                this.classificationsSkipCount,
                this.maxResultCount
            )
            .subscribe((res) => this.handleClassifications(res.items));
    }

    handleClassifications(data: AppEntityClassificationDto[]) {
        if (!data) return;
        data.forEach((item) => {
            const classification = new AppEntityDtoWithActions<AppEntityClassificationDto>();
            classification.entityDto = item;
            this.classifications.push(classification);
        });
    }

    addSelectedClassifications(
        selected: TreeNodeOfGetSycEntityObjectClassificationForViewDto[]
    ): void {
        this.formTouched = true;
        selected.forEach((element) => {
            if (!element.leaf) return;
            this.classifications.push(
                new AppEntityDtoWithActions<AppEntityClassificationDto>({
                    entityDto: new AppEntityClassificationDto({
                        id: 0,
                        entityObjectClassificationId: element.data.sycEntityObjectClassification.id,
                        entityObjectClassificationCode: element.data.sycEntityObjectClassification.code,
                        entityObjectClassificationName: this.getPath(element),
                    }),
                })
            );
        });
    }

    seperateNewAndRemovedClassifications() {
        const [added, removed] = this.splitAddedAndRemoved(this.classifications);
        this.appItem.entityClassificationsAdded = added;
        this.appItem.entityClassificationsRemoved = removed;
    }

    // ---------------------------------------------------------------------
    // Shared helpers for tag lists
    // ---------------------------------------------------------------------
    getPath(item: any): any {
        if (!item.parent) return item.label;
        const parentPath = this.getPath(item.parent);
        return parentPath ? parentPath + "-" + item.label : item.label;
    }

    private pushSelectedCategoryNodes(
        selected: TreeNodeOfGetSycEntityObjectCategoryForViewDto[],
        target: AppEntityDtoWithActions<AppEntityCategoryDto>[]
    ) {
        selected.forEach((element) => {
            if (!element.leaf) return;
            target.push(
                new AppEntityDtoWithActions<AppEntityCategoryDto>({
                    entityDto: new AppEntityCategoryDto({
                        id: 0,
                        entityObjectCategoryId: element.data.sycEntityObjectCategory.id,
                        entityObjectCategoryCode: element.data.sycEntityObjectCategory.code,
                        entityObjectCategoryName: this.getPath(element),
                    }),
                })
            );
        });
    }

    private splitAddedAndRemoved<T extends { id?: number }>(
        items: AppEntityDtoWithActions<T>[]
    ): [T[], T[]] {
        const added: T[] = [];
        const removed: T[] = [];
        items.forEach((item) => {
            if (item.removed) removed.push(item.entityDto);
            else if (!item.entityDto.id) added.push(item.entityDto);
        });
        return [added, removed];
    }

    // ---------------------------------------------------------------------
    // Description
    // ---------------------------------------------------------------------
    triggerDescription($event: TabDirective, tabIndex: number) {
        this.activeDescriptionIndex = tabIndex;
        if (tabIndex == 0) {
            this.descriptionEditor = this.appItem.description;
            this.appItem.description = this.descriptionExportedHtml;
        } else {
            this.descriptionExportedHtml = this.appItem.description;
            this.appItem.description = this.descriptionEditor;
        }
    }

    // ---------------------------------------------------------------------
    // Pricing & stock
    // ---------------------------------------------------------------------
    checkAndAddDefaultPriceObject() {
        if (!this.appItem.appItemPriceInfos) this.appItem.appItemPriceInfos = [];

        this.defaultCurrencyMSRPPriceIndex =
            this._pricingHelperService.getDefaultPricingIndex(this.appItem.appItemPriceInfos);

        if (this.defaultCurrencyMSRPPriceIndex < 0) {
            this.appItem.appItemPriceInfos.push(
                this._pricingHelperService.getDefaultPricingInstance()
            );
            this.defaultCurrencyMSRPPriceIndex = this.appItem.appItemPriceInfos.length - 1;
        }
    }

    showAdvancedPricingModal() {
        this.showAdvancedPricing = true;
    }

    hideAdvancedPricingModal() {
        this.showAdvancedPricing = false;
    }

    productAdvancedPriceChangesHandler($event: AppItemPriceInfo[]) {
        this.showAdvancedPricing = false;
        this.appItem.appItemPriceInfos = $event;
        if (this.updateVariation) {
            this.appItem.variationItems.forEach((variation) => {
                variation.appItemPriceInfos = this.getParentProductPrices();
            });
        }
        this.checkAndAddDefaultPriceObject();
    }

    getParentProductPrices() {
        return this.appItem.appItemPriceInfos.map((item) =>
            AppItemPriceInfo.fromJS({ ...item, id: 0 } as IAppItemPriceInfo)
        );
    }

    onUpdateVariation($event) {
        this.updateVariation = $event;
    }

    convertTodecimal(value) {
        return value % 1 == 0 ? Number(value).toFixed(2) : value;
    }

    fixNegative() {
        if (this.appItem.taxRate < 0) this.appItem.taxRate = 0;
    }

    stockAvailabilityChanged($event) {
        if (this.appItem.stockAvailability < 0)
            this.notify.error("Available Qty should be >=0");
    }

    getCurrencies() {
        return this._appEntitiesServiceProxy
            .getAllCurrencyForTableDropdown()
            .subscribe((result) => {
                this.allCurrencies = result.map((item) => {
                    item.label = item.label + " " + (item.symbol || "");
                    return item;
                });
            });
    }

    // ---------------------------------------------------------------------
    // Variations
    // ---------------------------------------------------------------------
    askToRemoveAllVariations($event) {
        if (this.sellVariationChecked || !this.appItem?.variationItems?.length) return;

        this.askToConfirm("AreYouSureYouWantToDeleteAllVariations?", "Confirm").subscribe(
            (confirmed) => {
                if (confirmed) this.removeAllVariations();
                else this.sellVariationChecked = true;
            }
        );
    }

    removeAllVariations() {
        this.formTouched = true;
        this._appItemsServiceProxy
            .getItemVariationsToDelete(this.id, undefined)
            .subscribe((res: VariationListToDeleteDto) => {
                const inUse = res?.variationsInUse;
                if (inUse?.length > 0) {
                    this.fireDialog(
                        inUse.length == 1
                            ? "Variation '" + inUse[0]?.code?.toString() + "' Is in use"
                            : "More than one variation in use",
                        "Ok"
                    );
                    return;
                }
                this.appItem.variationItems = [];
                this.removeSelectedOrAddUnSelectedExtraAttributesOnVariationsFromAppItemEntityExtraData();
                this.appItem.appItemSizesScaleInfo = [];
            });
    }

    showCreateOrEditVariationPage() {
        if (!this.appItem.entityObjectTypeId) {
            return this.notify.error(this.l("PleaseChooseAProductTypeFirst"));
        }
        if (!this.appItem?.code) {
            return this.notify.error(this.l("PleaseAddAProductCode"));
        }
        if (!this.selectedItemTypeData.extraAttributes?.extraAttributes?.length) {
            return this.notify.error(
                this.l("ProductType") +
                    ' " ' +
                    this.selectedItemTypeData.name +
                    ' " ' +
                    this.l("doesnotHaveExtraAttributes.")
            );
        }
        this.showVariations();
    }

    showVariations() {
        this.appItem.appItemPriceInfos.forEach((priceDto) => {
            const currencyId = priceDto.currencyId;
            const alreadyAdded = this.selectedCurrencies.some(
                (item) => item.value == currencyId
            );
            const currency = this.allCurrencies.find((curr) => curr.value == currencyId);
            if (currency && !alreadyAdded) this.selectedCurrencies.push(currency);
        });

        const defaultCurrencyAlreadyAdded = this.selectedCurrencies.some(
            (item) => item.value == this.tenantDefaultCurrency.value
        );
        if (!defaultCurrencyAlreadyAdded)
            this.selectedCurrencies.push(this.tenantDefaultCurrency);

        this.formTouched = true;
        this.displayVariations = true;
    }

    hideVariations($event) {
        if ($event?.target?.files.length == 0) return;
        this.displayVariations = false;
        this.appItem.nonLookupValues = this.oldnonLookupValues;
    }

    applyVariations($event: ApplyVariationOutput) {
        this.snapshotNonLookupValues();

        this.appItem.variationItems = $event.variation;
        this.appItem.appItemSizesScaleInfo = $event.appItemSizesScaleInfo;
        this.removeSelectedOrAddUnSelectedExtraAttributesOnVariationsFromAppItemEntityExtraData();
        this.hideVariations(true);
        this.updateProductAvailableQuantity();

        const firstVariationPrices = this.appItem?.variationItems[0]?.appItemPriceInfos;
        if (
            this.appItem.appItemPriceInfos.length == firstVariationPrices?.length &&
            this.appItem.appItemPriceInfos["currencyId"] !== firstVariationPrices["currencyId"] &&
            this.appItem.appItemPriceInfos["price"] !== firstVariationPrices["price"]
        ) {
            this.message.confirm(
                "",
                this.l("Do you want to save the updated price?"),
                (isConfirmed) => {
                    if (isConfirmed) this.updateProductPriceInfos();
                }
            );
        }

        this.sellVariationChecked = Boolean(this.appItem.variationItems.length);
    }

    updateProductAvailableQuantity() {
        if (!this.appItem?.variationItems?.length) return;
        this.appItem.stockAvailability = this.appItem.variationItems.reduce(
            (sum, item) => sum + (isNaN(item.stockAvailability) ? 0 : item.stockAvailability),
            0
        );
    }

    updateProductPriceInfos() {
        if (!this.appItem?.appItemPriceInfos?.length) return;
        this.appItem.appItemPriceInfos = this.appItem?.variationItems[0]?.appItemPriceInfos;
    }

    removeBase64ImagesFromDataBeforeSend() {
        if (!this.appItem.variationItems) return;
        this.appItem.variationItems.forEach((item) => {
            item.entityAttachments.forEach((att) => {
                if (att.guid) att.url = undefined;
            });
        });
    }

    getCodeValue(code: string) {
        this.appItem.code = code;
        this.setVariationCode();
    }

    setVariationCode() {
        const variations = this.appItem?.variationItems;
        const subCode = variations?.length > 0 ? variations[0]?.code?.split("-") : undefined;
        if (subCode && subCode[0] == this.appItem?.code) return;

        for (let i = 0; i < variations?.length; i++) {
            const extraData = variations[i]?.entityExtraData;
            for (let j = 0; j < extraData?.length; j++) {
                if (j == 0) variations[i].code = this.appItem?.code || "";
                if (extraData[j]?.attributeValue)
                    variations[i].code += "-" + extraData[j].attributeValue;
            }
        }
    }

    // ---------------------------------------------------------------------
    // Attachments gallery
    // ---------------------------------------------------------------------
    getAspectatio() {
        this.getSycAttachmentCategoriesByCodes(["LOGO", "BANNER", "IMAGE"]).subscribe(
            (result) => {
                const image = result.find((item) => item.code == "IMAGE");
                if (!image) return;
                const [width, height] = image.aspectRatio.split(":");
                this.aspectRatio = Number(width) / Number(height);
            }
        );
    }

    openAttachmentPanel(index: number): void {
        this.selectedAttachmentIndex = index;
        this.showAttachmentPanel = true;
    }

    closeAttachmentPanel(): void {
        this.showAttachmentPanel = false;
    }

    onSharedAttachmentSelected(selection: AttachmentUploadSelection): void {
        if (!selection?.file) return;

        this.appItem.entityAttachments ??= [];
        this.galleryAttachments ??= [];

        const index = this.selectedAttachmentIndex;
        const logicalCount = this.galleryAttachments.length;

        // validate count and slot
        if (logicalCount >= MAX_ATTACHMENTS) {
            this.notify.warn(this.l("MaximumAttachmentsAllowed"));
            return;
        }
        if (index < 0 || index !== logicalCount) {
            this.notify.warn(this.l("PleaseSelectEmptyAttachmentSlot"));
            return;
        }

        const file = selection.file;
        const fileName = file.name.toLowerCase();
        const isImage =
            file.type.startsWith("image/") ||
            /\.(jpg|jpeg|png|gif|webp|bmp)$/.test(fileName);
        const isPdf = file.type === "application/pdf" || fileName.endsWith(".pdf");
        const isVideo = file.type === "video/mp4" || fileName.endsWith(".mp4");

        if (!isImage && !isPdf && !isVideo) {
            this.notify.warn("Only images, PDF and MP4 files are supported.");
            return;
        }

        // original attachment
        const attachment = this.createAttachmentRecord(file.name, index);

        // optional PDF thumbnail (same logical index as the PDF)
        const thumbnailAttachment =
            isPdf && selection.thumbnailFile
                ? this.createAttachmentRecord(selection.thumbnailFile.name, index)
                : undefined;

        // upload
        this.uploadBlobAttachment(file, attachment);
        this.appItem.entityAttachments.push(attachment);

        if (thumbnailAttachment) {
            this.uploadBlobAttachment(selection.thumbnailFile, thumbnailAttachment);
            this.appItem.entityAttachments.push(thumbnailAttachment);
        }

        // preview: images/videos use the original; PDFs use thumbnail, generated preview or icon
        const originalUrl = URL.createObjectURL(file);
        let previewUrl = originalUrl;
        if (isPdf) {
            previewUrl = selection.thumbnailFile
                ? URL.createObjectURL(selection.thumbnailFile)
                : selection.previewUrl || "../../../assets/Items/pdf-Icon.png";
        }

        this.galleryAttachments.push({
            type: isPdf ? "pdf" : isVideo ? "video" : "image",
            previewUrl,
            originalUrl,
            records: thumbnailAttachment ? [attachment, thumbnailAttachment] : [attachment],
        });
        this.refreshGalleryArrays();

        if (isImage && this.defaultImageIndex === -1)
            this.setDefaultImage(this.galleryAttachments.length - 1);

        this.formTouched = true;
        this.closeAttachmentPanel();
    }

    private createAttachmentRecord(fileName: string, index: number): AppEntityAttachmentDto {
        const record = new AppEntityAttachmentDto();
        record.index = index;
        record.fileName = fileName;
        record.guid = this.guid();
        record.attachmentCategoryId = this.productImageCategory.sycAttachmentCategory.id;
        record.isPublic = true;
        record.isDefault = false;
        return record;
    }

    setDefaultImage(index: number): void {
        const item = this.galleryAttachments[index];
        if (!item || item.type !== "image") return;

        this.defaultImageIndex = index;
        const selected = item.records[0];

        (this.appItem.entityAttachments || []).forEach((record) => {
            record.isDefault = record === selected;
            if (record.isDefault) record.isPublic = true;
        });

        this.formTouched = true;
    }

    setVisibleinMarketplaceImage(index: number, isChecked: boolean) {
        if (this.defaultImageIndex === index) return;
        this.formTouched = true;
        const attachment = this.appItem.entityAttachments?.[index];
        if (attachment) attachment.isPublic = isChecked;
    }

    removeAttach(index: number): void {
        const item = this.galleryAttachments[index];
        if (!item) return;

        if (index === this.defaultImageIndex && this.galleryAttachments.length > 1) {
            this.notify.info("Please set another image as default first");
            return;
        }

        this.revokeBlobUrls(item);

        const recordsToRemove = new Set(item.records);
        this.appItem.entityAttachments = (this.appItem.entityAttachments || []).filter(
            (record) => !recordsToRemove.has(record)
        );
        this.galleryAttachments.splice(index, 1);

        if (this.defaultImageIndex === index) this.defaultImageIndex = -1;
        else if (this.defaultImageIndex > index) this.defaultImageIndex--;

        this.refreshGalleryArrays();
        this.formTouched = true;
    }

    removeAllAttachments(): void {
        if (!this.galleryAttachments.length) return;

        this.askToConfirm("AreYouSureYouWantToDeleteAllTheAttachments?", "Confirm").subscribe(
            (confirmed) => {
                if (!confirmed) return;

                this.galleryAttachments.forEach((item) => this.revokeBlobUrls(item));
                this.galleryAttachments = [];
                this.appItem.entityAttachments = [];
                this.attachmentsSrcs = [""];
                this.defaultImageIndex = -1;
                this.formTouched = true;
            }
        );
    }

    private revokeBlobUrls(item: ProductGalleryAttachment) {
        [item.originalUrl, item.previewUrl].forEach((url) => {
            if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
        });
    }

    openOriginalAttachment(index: number): void {
        const item = this.galleryAttachments[index];
        if (!item?.originalUrl) {
            this.notify.warn(this.l("AttachmentNotAvailable"));
            return;
        }
        window.open(item.originalUrl, "_blank", "noopener,noreferrer");
    }

    isGalleryImage(index: number): boolean {
        return this.galleryAttachments[index]?.type === "image";
    }

    isGalleryPdf(index: number): boolean {
        return this.galleryAttachments[index]?.type === "pdf";
    }

    isGalleryVideo(index: number): boolean {
        return this.galleryAttachments[index]?.type === "video";
    }

    private getSavedAttachmentUrl(attachment: AppEntityAttachmentDto): string {
        if (!attachment?.url) return "";
        if (/^(https?:|blob:|data:)/i.test(attachment.url)) return attachment.url;
        return `${this.attachmentBaseUrl}/${attachment.url.replace(/^\/+/, "")}`;
    }

    private getAttachmentType(
        attachment: AppEntityAttachmentDto
    ): "image" | "pdf" | "video" | null {
        const name = (
            attachment?.fileName ||
            attachment?.displayName ||
            attachment?.url ||
            ""
        )
            .toLowerCase()
            .split("?")[0];

        if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/.test(name)) return "image";
        if (/\.pdf$/.test(name)) return "pdf";
        if (/\.(mp4|webm|mov|m4v|ogg)$/.test(name)) return "video";
        return null;
    }

    private refreshGalleryArrays(): void {
        this.attachmentsSrcs = this.galleryAttachments.map((item) => item.previewUrl);
        if (this.galleryAttachments.length < MAX_ATTACHMENTS) this.attachmentsSrcs.push("");
    }

    /** Builds the gallery from saved attachment records (edit mode). */
    adjustImageSrcsUrls(): void {
        const records = this.appItem.entityAttachments || [];
        const used = new Set<AppEntityAttachmentDto>();
        this.galleryAttachments = [];

        records.forEach((attachment, position) => {
            if (used.has(attachment)) return;

            const type = this.getAttachmentType(attachment);
            if (!type) return;

            used.add(attachment);
            const originalUrl = this.getSavedAttachmentUrl(attachment);

            if (type === "pdf") {
                // Legacy data has no explicit thumbnail relation:
                // pair only an immediately following image with the PDF.
                let thumbnail: AppEntityAttachmentDto | undefined;
                const next = records[position + 1];
                if (next && !used.has(next) && this.getAttachmentType(next) === "image") {
                    thumbnail = next;
                    used.add(next);
                }

                this.galleryAttachments.push({
                    type: "pdf",
                    previewUrl: thumbnail
                        ? this.getSavedAttachmentUrl(thumbnail)
                        : "../../../assets/Items/pdf-Icon.png",
                    originalUrl,
                    records: thumbnail ? [attachment, thumbnail] : [attachment],
                });
                return;
            }

            this.galleryAttachments.push({
                type,
                previewUrl: originalUrl,
                originalUrl,
                records: [attachment],
            });
        });

        this.refreshGalleryArrays();
    }

    detectDefaultImageIndex(): void {
        this.defaultImageIndex = this.galleryAttachments.findIndex((item) =>
            item.records.some((record) => record.isDefault)
        );
    }

    // ---------------------------------------------------------------------
    // Drag & drop upload (legacy flow, still wired in the template)
    // ---------------------------------------------------------------------
    onDragLeave(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
    }

    onDragOver(event: DragEvent) {
        event.preventDefault(); // required to allow dropping
        event.stopPropagation();
    }

    onDrop(event: DragEvent, index: number) {
        event.preventDefault();
        event.stopPropagation();

        if (!event.dataTransfer?.files.length) return;

        const file = event.dataTransfer.files[0];
        const mockEvent = { target: { files: [file], value: file.name } }; // mimics an input event

        this.fileChange(
            mockEvent as unknown as Event,
            this.productImageCategory,
            index,
            undefined,
            true
        );
    }

    fileChange(
        event,
        attachmentCategory: GetSycAttachmentCategoryForViewDto,
        index?: number,
        aspectRatio?: number,
        cropWithoutOptions?: boolean
    ) {
        this.formTouched = true;
        if (!event.target.value) return;

        const file = event.target.files[0];
        if (!aspectRatio) aspectRatio = this.aspectRatio;

        if (file.type.toLowerCase().startsWith("image/")) {
            const { onCropDone, data } = this.openImageCropper(
                event,
                aspectRatio,
                cropWithoutOptions
            );
            const subs = onCropDone.subscribe(() => {
                if (data.isCropDone)
                    this.tempUploadImage(event, attachmentCategory, data, index);
                event.target.value = null; // reset input
                subs.unsubscribe();
            });
        } else {
            this.tempUploadImage(event, attachmentCategory, null, index);
            event.target.value = null;
        }
    }

    tempUploadImage(
        event: Event,
        attachmentCategory: GetSycAttachmentCategoryForViewDto,
        croppedImageContent: ImageCropperComponent,
        index?: number
    ) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const isImage = file.type.startsWith("image/");
        const isPdfOrVideo = file.type === "application/pdf" || file.type.startsWith("video/");

        this.appItem.entityAttachments ??= [];

        const att = new AppEntityAttachmentDto();
        att.index = index;
        att.fileName = file.name;
        att.attachmentCategoryId = attachmentCategory.sycAttachmentCategory.id;
        att.guid = this.guid();
        att.isPublic = true;

        if (isImage) {
            const base64 = croppedImageContent.croppedImageAsBase64 as string;
            attachmentCategory.imgURL = base64;
            this.attachmentsSrcs[index] = base64;

            this.uploadBlobAttachment(croppedImageContent.croppedImage, att);
            this.appItem.entityAttachments[index] = att;
            if (index === 0) this.setDefaultImage(0);

            this.appendEmptyAttachmentSlot();
        } else if (isPdfOrVideo) {
            const reader = new FileReader();
            reader.onload = () => {
                this.attachmentsSrcs[index] = reader.result as string;
                this.uploadBlobAttachment(file, att);
                this.appItem.entityAttachments[index] = att;
                this.appendEmptyAttachmentSlot();
            };
            reader.readAsDataURL(file);
        }
    }

    /** Adds a new empty slot once every existing slot is filled. */
    private appendEmptyAttachmentSlot() {
        if (
            this.attachmentsSrcs.every((src) => src) &&
            this.attachmentsSrcs.length < MAX_ATTACHMENTS
        )
            this.attachmentsSrcs.push("");
    }

    // ---------------------------------------------------------------------
    // Save
    // ---------------------------------------------------------------------
    saveProduct(form: NgForm) {
        this.appItem?.variationItems?.forEach((variation) => {
            if (!variation.appItemPriceInfos)
                variation.appItemPriceInfos = this.getParentProductPrices();
        });

        const hasZeroPrice = this.appItem?.variationItems?.some((variation) =>
            variation.appItemPriceInfos?.some((priceInfo) => priceInfo.price == 0)
        );

        if (!hasZeroPrice) {
            this._saveProduct(form);
            return;
        }

        this.fireDialog("Some variation have zero price continue ?", "Yes", "No").then(
            (result) => {
                if (result.isConfirmed) this._saveProduct(form);
            }
        );
    }

    private _saveProduct(form: NgForm) {
        this.submitted = true;

        if (form.form.invalid) {
            form.form.markAllAsTouched();
            return this.notify.error(this.l("Please,CompleteAllTheRequiredFields(*)"));
        }
        if (!this.appItem?.entityAttachments?.length) {
            return this.notify.error(this.l("Please,UploadAtLeastOneImageToThisProduct"));
        }
        if (this.uploader.isUploading) {
            return this.notify.error(this.l("PleaseWait,SomeAttachmentsAreStillUploading"));
        }

        this.removeBase64ImagesFromDataBeforeSend();
        this.saving = true;
        this.appItem.itemType =
            this.listingMode === undefined ? ListingModeEnum.Create : ListingModeEnum.Edit;
        if (this.listingMode === ListingModeEnum.Create) delete this.appItem.id;

        this.seperateNewAndRemovedCategories();
        this.seperateNewAndRemovedDepartments();
        this.seperateNewAndRemovedRelatedItems();
        this.seperateNewAndRemovedClassifications();
        this.extraSelectedValuesExtraData();
        if (this.appItem.sycIdentifierId == 0) this.appItem.sycIdentifierId = null;

        this.appItem.entityRelatedItems = this.appItem?.entityRelatedItems?.map(
            (item: any) => this.toCategoryDto(item, item.id)
        );

        this._appItemsServiceProxy
            .createOrEdit(this.appItem)
            .pipe(finalize(() => (this.saving = false)))
            .subscribe((res) => {
                this.appItem.id = res;
                this.stopFormListening = true;
                this.emitDestroy();
                this.removeAllUnusedTempAttachments();
                this.notify.info(this.l("SavedSuccessfully"));
                if (
                    this.listingMode === ListingModeEnum.Create ||
                    this.listingMode === ListingModeEnum.Edit
                )
                    return this.askToPublish();
                this.goBack("app/main/products");
            });
    }

    cancel() {
        this.goBack("app/main/products");
    }

    // ---------------------------------------------------------------------
    // Publish
    // ---------------------------------------------------------------------
    askToPublish() {
        this.askToConfirm(
            this.l(`Savedsuccessfully,AreYouWantToPublishYourProductListingow?`),
            "",
            {
                confirmButtonText: this.l("PublishNow"),
                cancelButtonText: this.l("Later"),
            }
        ).subscribe((confirmed) => {
            if (confirmed) this.openShareProductListingModal();
            else this.goBack("app/main/products");
        });
    }

    openShareProductListingModal() {
        const listingId: number = this.appItem.id;
        const alreadyPublished: boolean = this.appItem.published;
        const successCallBack = () => {
            this._router.navigate(["/app/main/products"]);
            this.appItem.published = true;
        };
        this._publishAppItemListingService.openProductListingSharingModal(
            alreadyPublished,
            listingId,
            successCallBack
        );
    }

    unPublish() {
        if (!this.appItem.published)
            return this.notify.info(this.l("ProductIsAlreadyUnpublished"));
        this._publishAppItemListingService.unPublish(this.appItem.id).subscribe(() => {
            this.appItem.published = false;
        });
    }
}