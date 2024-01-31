import {
    AfterViewInit,
    Component,
    Injector,
    OnInit,
    ViewChild,
} from "@angular/core";
import { NgForm } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AppEntityListDynamicModalComponent } from "@app/app-entity-dynamic-modal/app-entity-list-dynamic-modal/app-entity-list-dynamic-modal.component";
import { SelectAppItemTypeComponent } from "@app/app-item-type/select-app-item-type/select-app-item-type.component";
import { SelectCategoriesDynamicModalComponent } from "@app/categories/select-categories-dynamic-modal.component";
import { SelectClassificationDynamicModalComponent } from "@app/classification/select-classification-dynamic-modal.component";
import { ImageCropperComponent } from "@app/shared/common/image-cropper/image-cropper.component";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    AppEntityAttachmentDto,
    AppEntityCategoryDto,
    AppEntityClassificationDto,
    AppItemsServiceProxy,
    CreateOrEditAppItemDto,
    AppEntityExtraDataDto,
    GetAllEntityObjectTypeOutput,
    GetSycAttachmentCategoryForViewDto,
    SycAttachmentCategoryDto,
    SycEntityObjectTypesServiceProxy,
    TreeNodeOfGetSycEntityObjectCategoryForViewDto,
    TreeNodeOfGetSycEntityObjectClassificationForViewDto,
    TreeNodeOfGetSycEntityObjectTypeForViewDto,
    VariationItemDto,
    AppItemPriceInfo,
    IAppItemPriceInfo,
    CurrencyInfoDto,
    LookupLabelDto,
    AppEntitiesServiceProxy,
} from "@shared/service-proxies/service-proxies";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { TabDirective, TabsetComponent } from "ngx-bootstrap/tabs";
import { Observable, Subscription } from "rxjs";
import { finalize } from "rxjs/internal/operators/finalize";
import { CreateEditAppItemExtraAttribute } from "../../app-item-shared/models/create-edit-app-item-extra-attribute";
import { FilteredExtraAttribute } from "../../app-item-shared/models/filtered-extra-attribute";
import { ExtraAttributeDataService } from "../../app-item-shared/services/extra-attribute-data.service";
import { PublishService } from "../../a../../app-item-shared/services/publish.service";
import { ListingModeEnum } from "../models/app-item-listing-enum";
import { EExtraAttributeUsage } from "../models/extra-attribute-usage.enum";
import { PublishAppItemListingService } from "../../app-item-shared/services/publish-app-item-listing.service";
import { SelectItem } from "primeng/api";
import { Location } from "@angular/common";
import { DropdownSelection } from "@shared/components/shared-forms-components/dropdown-with-pagination/dropdown-with-pagination.component";
import { AppEntityDtoWithActions } from "../models/app-entity-dto-with-actions";
import { PricingHelpersService } from "../../app-item-shared/services/pricing-helpers.service";
import { ApplyVariationOutput } from "./create-edit-app-item-variations.component";

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
    @ViewChild("staticTabs", { static: false }) staticTabs: TabsetComponent;
    @ViewChild("productForm", { static: true }) productForm: NgForm;
    modalRef: BsModalRef;
    defaultImageIndex: number = -1;
    appItem: CreateOrEditAppItemDto = new CreateOrEditAppItemDto();
    submitted: boolean = false;
    updateVariation: boolean = true;

    descriptionEditor: string;
    descriptionExportedHtml: string;
    saving = false;
    activeDescriptionIndex = 0;

    appItemTypeId: number;
    selectedItemTypeData: GetAllEntityObjectTypeOutput =
        new GetAllEntityObjectTypeOutput();

    extraAttributes: {
        [key in EExtraAttributeUsage]: CreateEditAppItemExtraAttribute;
    };

    attachmentsSrcs: string[] = Array(1).fill("");
    editMode: boolean = false;
    displayVariations: boolean = false;
    listingMode: ListingModeEnum;
    headerTitle: string = this.l("CreateProduct");
    headerDesc: string = this.l("FillYourProductDetails");
    readonlyDesc: boolean = true;

    // photos
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

    categoriesSkipCount: number = 0;
    departmentsSkipCount: number = 0;
    classificationsSkipCount: number = 0;
    categoriesTotalCount: number;
    departmentsTotalCount: number;
    classificationsTotalCount: number;
    maxResultCount: number = 10;
    sortBy: string = "name";
    categories: AppEntityDtoWithActions<AppEntityCategoryDto>[] = [];
    departments: AppEntityDtoWithActions<AppEntityCategoryDto>[] = [];
    classifications: AppEntityDtoWithActions<AppEntityClassificationDto>[] = [];
    entityObjectType: string = "PRODUCT";
    defaultCurrencyMSRPPriceIndex = -1;
    showAdvancedPricing: boolean = false;
    PriceValidMsg: string = "";

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
    // getters & setters
    public get selectedClassificationsIds(): number[] {
        let selectedIds: number[] = [];
        if (this.classifications) {
            selectedIds = this.classifications.reduce((accum, elem) => {
                const addedAndNotSavedYet: boolean = !elem.entityDto.id;
                if (addedAndNotSavedYet)
                    accum.push(elem.entityDto.entityObjectClassificationId);
                return accum;
            }, []);
        }
        return selectedIds;
    }

    public get selectedCategoriesIds(): number[] {
        let selectedIds: number[] = [];
        if (this.categories) {
            selectedIds = this.categories.reduce((accum, elem) => {
                const addedAndNotSavedYet: boolean = !elem.entityDto.id;
                if (addedAndNotSavedYet)
                    accum.push(elem.entityDto.entityObjectCategoryId);
                return accum;
            }, []);
        }
        return selectedIds;
    }

    public get selectedDepartmentsIds(): number[] {
        let selectedIds: number[] = [];
        if (this.departments) {
            selectedIds = this.departments.reduce((accum, elem) => {
                const addedAndNotSavedYet: boolean = !elem.entityDto.id;
                if (addedAndNotSavedYet)
                    accum.push(elem.entityDto.entityObjectCategoryId);
                return accum;
            }, []);
        }
        return selectedIds;
    }
    id: number;
    // interfaces implementations

    ngOnInit(): void {
        this.defineExtraAttributes();
        this.initUploaders();
        this.id = this.detectComponentMode();
        if (this.id) {
            this.getAppItemDataForEdit(this.id)
                .then((res) => {
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
    }

    ngAfterViewInit() {
        setTimeout(() => (this.readonlyDesc = false), 100);
        this.productForm.valueChanges.subscribe((value) => {
            if (this.productForm.dirty) this.formTouched = true;
        });
    }

    // methods
    detectComponentMode() {
        let appItemId;
        let id = this._activatedRoute.snapshot.params["id"]; // in case of createOrEdit product
        const listingId = this._activatedRoute.snapshot.params["listingId"]; // in case of edit Listing
        const productId = this._activatedRoute.snapshot.params["productId"]; // in case of create Listing
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
    detectDefaultImageIndex() {
        this.defaultImageIndex = this.appItem.entityAttachments.findIndex(
            (elem) => elem.isDefault
        );
    }
    adjustImageSrcsUrls() {
        let attachments = this.appItem.entityAttachments.reduce(
            (accum: string[], elem: AppEntityAttachmentDto) => {
                let imgUrlSrc = `${this.attachmentBaseUrl}/${elem.url}`;
                accum.push(imgUrlSrc);
                return accum;
            },
            []
        );
        if (attachments.length === 10) this.attachmentsSrcs = [];
        this.attachmentsSrcs.unshift(...attachments);
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
            let value = object[key];
            if (key === "variationItems") {
                // skip variation as we need their ids to be set on the parent id field per every variation
                object[key].map((item) => {
                    item.parentId = item.id;
                    return item;
                });
            }
            if (key === "appItemSizesScaleInfo") {
                // skip variation as we need their ids to be set on the parent id field per every variation
                object.appItemSizesScaleInfo.map(
                    (appItemSizesScaleInfo, index) => {
                        appItemSizesScaleInfo.parentId = index == 0 ? null : 0; // index =0 =>sizescale, index=1 => sizeratio
                        return appItemSizesScaleInfo;
                    }
                );
            }
            if (Array.isArray(value)) {
                value.map((item) => {
                    delete item.id;
                    return item;
                });
                value.forEach((item) => {
                    this.removeIds(item);
                });
            }
        });
    }

    // handle product type
    async getAppItemDataForEdit(id: number) {
        this.showMainSpinner();
        return await this._appItemsServiceProxy
            .getAppItemForEdit(
                id,
                undefined,
                0,
                this.maxResultCount,
                undefined,
                0,
                this.maxResultCount,
                undefined,
                0,
                this.maxResultCount,
                undefined,
                undefined,
                undefined
            )
            .toPromise()
            .then((res) => {
                this.appItem = CreateOrEditAppItemDto.fromJS({
                    ...res.appItem,
                    entityCategories: res.appItem.entityCategories.items,
                    entityDepartments: res.appItem.entityDepartments.items,
                    entityClassifications:
                        res.appItem.entityClassifications.items,
                });
                this.categoriesTotalCount =
                    res.appItem.entityCategories.totalCount;
                this.departmentsTotalCount =
                    res.appItem.entityDepartments.totalCount;
                this.classificationsTotalCount =
                    res.appItem.entityClassifications.totalCount;
                this.handleCategories(res.appItem.entityCategories.items);
                this.handleDepartments(res.appItem.entityDepartments.items);
                this.handleClassifications(
                    res.appItem.entityClassifications.items
                );
                this.sellVariationChecked = Boolean(
                    this.appItem.variationItems.length
                );
                return true;
            })
            .catch((err) => {
                return false;
            })
            .finally(() => this.hideMainSpinner());
    }

    defineExtraAttributes() {
        this.extraAttributes = {
            [EExtraAttributeUsage.Recommended]:
                new CreateEditAppItemExtraAttribute({
                    header: this.l("Recommended"),
                    title: this.l("BuyersMayAlsoBeInterestedInTheseItemSpecifics"),
                    usageEnum: EExtraAttributeUsage.Recommended,
                    orderOfDisplay: 1,
                }),
            [EExtraAttributeUsage.Additional]:
                new CreateEditAppItemExtraAttribute({
                    header: this.l("Additional"),
                    title: this.l(
                        "Buyersfrequentlysearchfortheseitemspecifics"
                    ),
                    usageEnum: EExtraAttributeUsage.Additional,
                    orderOfDisplay: 2,
                }),
        };
    }

    getAppItemTypeExtraAttributesById(id: number) {
        if (!id) return;
        return this._sycEntityObjectTypesServiceProxy.getAllWithExtraAttributes(
            id
        );
    }

    selectTab(tabId: number) {
        this.staticTabs.tabs[tabId].active = true;
    }

    // item type methods
    onItemTypeChange(id: number) {
        if (!isNaN(id)) {
            this.getAppItemTypeExtraAttributesById(id).subscribe(
                (result) => {
                    if (result.length > 0) {
                        this.selectedItemTypeData = result[0];
                        if (
                            this.selectedItemTypeData.extraAttributes &&
                            this.selectedItemTypeData.extraAttributes
                                .extraAttributes
                        ) {
                            this.setAdditionalAndRecommendedExtraAttributes();
                            this.loadRecommendedAndAdditionalExtraDataLookupLists();
                            if (this.editMode) {
                                this.setSelectedAppEntityExtraDataOnEditMode();
                                this.removeSelectedOrAddUnSelectedExtraAttributesOnVariationsFromAppItemEntityExtraData();
                            }
                        } else {
                            this.resetExtraData();
                        }
                    } else {
                        this.selectedItemTypeData =
                            new GetAllEntityObjectTypeOutput();
                    }
                },
                (err) => {
                    return this.notify.info(
                        this.l("FailedToLoadProductTypeData")
                    );
                }
            );
        } else {
            if (!this.appItem.entityExtraData)
                this.appItem.entityExtraData = [];
            this.selectedItemTypeData = new GetAllEntityObjectTypeOutput();
            this.resetExtraData();
        }
    }

    loadRecommendedAndAdditionalExtraDataLookupLists() {
        this.extraAttributes.RECOMMENDED.extraAttributes.forEach(
            (extraAttr) => {
                if (!extraAttr.isLookup) return;
                this.loadExtraDataLookupList(extraAttr);
            }
        );
        this.extraAttributes.ADDITIONAL.extraAttributes.forEach((extraAttr) => {
            if (!extraAttr.isLookup) return;
            this.loadExtraDataLookupList(extraAttr);
        });
    }
    loadExtraDataLookupList(extraAttr: FilteredExtraAttribute) {
        this._extraAttributeDataService
            .getExtraAttributeLookupDataWithPaging(
                extraAttr.entityObjectTypeCode,
                extraAttr.paginationSetting.skipCount,
                extraAttr.paginationSetting.maxResultCount
            )
            .subscribe((result) => {
                extraAttr.paginationSetting.totalCount = result.totalCount;
                if (extraAttr.paginationSetting.skipCount == 0)
                    extraAttr.paginationSetting.list = [];
                else
                    extraAttr.paginationSetting.list.splice(
                        extraAttr.paginationSetting.list.length - 1,
                        1
                    );
                extraAttr.paginationSetting.list.push(...result.items);
                if (
                    extraAttr.paginationSetting.list.length <
                    extraAttr.paginationSetting.totalCount
                ) {
                    const showMoreSelectItem: SelectItem = {
                        value: -1,
                        label: this.l("showMore"),
                        icon: "fas  fa-reply",
                        styleClass: "showMore",
                        disabled: false,
                    };
                    extraAttr.paginationSetting.list.push(showMoreSelectItem);
                }
                extraAttr.paginationSetting.skipCount +=
                    extraAttr.paginationSetting.maxResultCount;
            });
    }
    DropdownSelection = DropdownSelection;
    sellVariationChecked: boolean;
    askToRemoveAllVariations($event) {
        if (this.sellVariationChecked || !this.appItem?.variationItems?.length)
            return;
        var isConfirmed: Observable<boolean>;
        isConfirmed = this.askToConfirm(
            "AreYouSureYouWantToDeleteAllVariations?",
            "Confirm"
        );
        isConfirmed.subscribe((res) => {
            if (res) {
                this.removeAllVariations();
            } else {
                this.sellVariationChecked = true;
            }
        });
    }
    removeAllVariations() {
        this.formTouched = true;
        this.appItem.variationItems = [];
        this.removeSelectedOrAddUnSelectedExtraAttributesOnVariationsFromAppItemEntityExtraData();
        this.appItem.appItemSizesScaleInfo = [];
    }
    resetExtraData() {
        this.appItem.entityExtraData = [];
        this.extraAttributes.RECOMMENDED.extraAttributes = [];
        this.extraAttributes.ADDITIONAL.extraAttributes = [];
    }
    setAdditionalAndRecommendedExtraAttributes() {
        const extraAttributres =
            this.selectedItemTypeData.extraAttributes.extraAttributes;
        this.extraAttributes.RECOMMENDED.extraAttributes =
            this._extraAttributeDataService.getFilteredAttributesByUsage(
                extraAttributres,
                EExtraAttributeUsage.Recommended,
                false
            );
        this.extraAttributes.ADDITIONAL.extraAttributes =
            this._extraAttributeDataService.getFilteredAttributesByUsage(
                extraAttributres,
                EExtraAttributeUsage.Additional,
                false
            );
    }

    setSelectedAppEntityExtraDataOnEditMode() {
        if (!this.appItem.entityExtraData) return;
        let selectedExtraDataAsObject: { [key: number]: any } = {}; // {[12]:[15,18,19]} = {[colorId]=[15,12,16]}
        const getFilterDefinition = (itemExtraData: AppEntityExtraDataDto) => {
            const item = [
                ...this.extraAttributes.ADDITIONAL.extraAttributes,
                ...this.extraAttributes.RECOMMENDED.extraAttributes,
            ].filter((x) => x.attributeId == itemExtraData.attributeId);
            return item.length ? item[0] : undefined;
        };
        this.appItem.entityExtraData.forEach((ItemExtraData) => {
            const extraAttrDef = getFilterDefinition(ItemExtraData);
            let key = ItemExtraData.attributeId;
            const isLookup: boolean = !!ItemExtraData.attributeValueId;
            let value = isLookup
                ? ItemExtraData.attributeValueId
                : ItemExtraData.attributeValue;
            if (!selectedExtraDataAsObject[key])
                selectedExtraDataAsObject[key] = [];
            isLookup && extraAttrDef?.acceptMultipleValues
                ? selectedExtraDataAsObject[key].push(value)
                : (selectedExtraDataAsObject[key] = value);
        });

        this.extraAttributes.ADDITIONAL.extraAttributes.map((elem) => {
            let _selectedValues = selectedExtraDataAsObject[elem.attributeId];
            if (_selectedValues !== undefined)
                elem.selectedValues = _selectedValues;
            return elem;
        });

        this.extraAttributes.RECOMMENDED.extraAttributes.map((elem) => {
            let _selectedValue = selectedExtraDataAsObject[elem.attributeId];
            if (_selectedValue !== undefined)
                elem.selectedValues = _selectedValue;
            return elem;
        });
    }

    // AppItem Type methods

    openSelectAppItemTypeModal() {
        let config: ModalOptions = new ModalOptions();
        config.class = "right-modal slide-right-in";
        let modalDefaultData: Partial<SelectAppItemTypeComponent> = {
            savedId: this.appItem.entityObjectTypeId,
        };
        config.initialState = modalDefaultData;
        let modalRef: BsModalRef = this._BsModalService.show(
            SelectAppItemTypeComponent,
            config
        );
        let subs: Subscription = this._BsModalService.onHidden.subscribe(() => {
            this.selectAppItemTypeHandler(modalRef);
            subs.unsubscribe();
        });
    }

    resetAppItemType() {
        this.appItem.entityObjectTypeId = undefined;
        this.onItemTypeChange(undefined);
    }

    productTypeId: number;
    selectAppItemTypeHandler(modalRef: BsModalRef) {
        let data: SelectAppItemTypeComponent = modalRef.content;
        if (data.selectionDone && data.selectedRecord) {
            // add or edit done
            this._appItemsServiceProxy.generateProductCode(data.selectedRecord.data.sycEntityObjectType.id, false).subscribe((res: any) => {
                this.appItem.code = res;
                this.appItem.OriginalCode = res
            })
            this.productTypeId =
                data.selectedRecord.data.sycEntityObjectType.id;
            this.addSelectedAppItemType(data.selectedRecord);
            this.onItemTypeChange(
                data.selectedRecord.data.sycEntityObjectType.id
            );
        }
    }



    addSelectedAppItemType(
        selected: TreeNodeOfGetSycEntityObjectTypeForViewDto
    ): void {
        this.formTouched = true;
        this.appItem.entityObjectTypeId = selected.data.sycEntityObjectType.id;
    }

    // Categories
    openSelectCategoriesModal() {
        let config: ModalOptions = new ModalOptions();
        config.class = "right-modal slide-right-in";
        let modalDefaultData: Partial<SelectCategoriesDynamicModalComponent> = {
            savedIds: this.selectedCategoriesIds,
            showAddAction: true,
            showActions: true,
            entityId: this.appItem.entityId,
        };
        config.initialState = modalDefaultData;
        let modalRef: BsModalRef = this._BsModalService.show(
            SelectCategoriesDynamicModalComponent,
            config
        );
        let subs: Subscription = this._BsModalService.onHidden.subscribe(() => {
            this.selectCategoriesHandler(modalRef);
            if (!modalRef.content.isHiddenToCreateOrEdit) subs.unsubscribe();
        });
    }
    removeCategory(
        category: AppEntityDtoWithActions<AppEntityCategoryDto>,
        i: number
    ) {
        this.formTouched = true;
        if (category.entityDto.id) {
            category.removed = true;
        } else this.categories.splice(i, 1);
    }
    undoCategory(category: AppEntityDtoWithActions<AppEntityCategoryDto>) {
        category.removed = false;
    }

    selectCategoriesHandler(modalRef) {
        let data: SelectCategoriesDynamicModalComponent = modalRef.content;
        if (
            data.selectionDone &&
            Array.isArray(data.selectedRecords) &&
            data.selectedRecords.length
        ) {
            // add or edit done
            this.addSelectedCategories(data.selectedRecords);
        }
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
            .subscribe((res) => {
                this.handleCategories(res.items);
            });
    }

    handleCategories(data: AppEntityCategoryDto[]) {
        if (!data) return;
        data.forEach((item) => {
            const categ = new AppEntityDtoWithActions<AppEntityCategoryDto>();
            categ.entityDto = item;
            this.categories.push(categ);
        });
    }

    addSelectedCategories(
        selected: TreeNodeOfGetSycEntityObjectCategoryForViewDto[]
    ): void {
        let selectedCategories: AppEntityCategoryDto[] = [];
        selected.forEach((element) => {
            if(! (!element?.parent && !element?.leaf)){
            console.log(element);
            const newCategory: AppEntityDtoWithActions<AppEntityCategoryDto> =
                new AppEntityDtoWithActions<AppEntityCategoryDto>({
                    entityDto: new AppEntityCategoryDto({
                        id: 0,
                        entityObjectCategoryId:
                            element.data.sycEntityObjectCategory.id,
                        entityObjectCategoryCode:
                            element.data.sycEntityObjectCategory.code,
                            entityObjectCategoryName: this.getPath(element),
                    }),
                });
       
            this.categories.push(newCategory);
        }
        });
        this.appItem.entityCategories = selectedCategories;
        this.formTouched = true;
    }

    seperateNewAndRemovedDepartments() {
        const newlyAddedDepartments: AppEntityCategoryDto[] = [];
        const removedDepartments: AppEntityCategoryDto[] = [];
        this.departments.forEach((department) => {
            if (department.removed)
                removedDepartments.push(department.entityDto);
            else if (!department.entityDto.id)
                newlyAddedDepartments.push(department.entityDto);
        });
        this.appItem.entityDepartmentsAdded = newlyAddedDepartments;
        this.appItem.entityDepartmentsRemoved = removedDepartments;
    }

    // Departmetns
    openSelectDepartmentsModal() {
        this.formTouched = true;
        let config: ModalOptions = new ModalOptions();
        config.class = "right-modal slide-right-in";
        let modalDefaultData: Partial<SelectCategoriesDynamicModalComponent> = {
            savedIds: this.selectedDepartmentsIds,
            showAddAction: false,
            showActions: false,
            isDepartment: true,
            entityObjectDisplayName: this.l("Departments"),
            entityId: this.appItem.entityId,
        };
        config.initialState = modalDefaultData;
        let modalRef: BsModalRef = this._BsModalService.show(
            SelectCategoriesDynamicModalComponent,
            config
        );
        let subs: Subscription = this._BsModalService.onHidden.subscribe(() => {
            this.selectDepartmentsHandler(modalRef);
            subs.unsubscribe();
        });
    }

    removeDepartment(
        department: AppEntityDtoWithActions<AppEntityCategoryDto>,
        i: number
    ) {
        this.formTouched = true;
        if (department.entityDto.id) {
            department.removed = true;
        } else this.departments.splice(i, 1);
    }
    undoDepartment(department: AppEntityDtoWithActions<AppEntityCategoryDto>) {
        department.removed = false;
    }

    selectDepartmentsHandler(modalRef) {
        let data: SelectCategoriesDynamicModalComponent = modalRef.content;
        if (
            data.selectionDone &&
            Array.isArray(data.selectedRecords) &&
            data.selectedRecords.length
        ) {
            // add or edit done
            this.addSelectedDepartments(data.selectedRecords);
        }
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
            .subscribe((res) => {
                // this.handleCategories(res.items)
            });
    }

    handleDepartments(data: AppEntityCategoryDto[]) {
        if (!data) return;
        data.forEach((item) => {
            const categ = new AppEntityDtoWithActions<AppEntityCategoryDto>();
            categ.entityDto = item;
            this.departments.push(categ);
        });
    }

    addSelectedDepartments(
        selected: TreeNodeOfGetSycEntityObjectCategoryForViewDto[]
    ): void {
        let selectedCategories: AppEntityCategoryDto[] = [];
        selected.forEach((element) => {
            if(! (!element?.parent && !element?.leaf)){
            console.log(element);
            const newCategory: AppEntityDtoWithActions<AppEntityCategoryDto> =
                new AppEntityDtoWithActions<AppEntityCategoryDto>({
                    entityDto: new AppEntityCategoryDto({
                        id: 0,
                        entityObjectCategoryId:
                            element.data.sycEntityObjectCategory.id,
                        entityObjectCategoryCode:
                            element.data.sycEntityObjectCategory.code,
                        entityObjectCategoryName: this.getPath(element),
                    }),
                });
            this.departments.push(newCategory);
            }
        });
    }

    getPath(item: any): any {
        if (!item.parent) {
            return item.label;
        }
        return this.getPath(item.parent) + "-" + item.label;
    }

    seperateNewAndRemovedCategories() {
        const newlyAddedCategories: AppEntityCategoryDto[] = [];
        const removedCategories: AppEntityCategoryDto[] = [];
        this.categories.forEach((category) => {
            if (category.removed) removedCategories.push(category.entityDto);
            else if (!category.entityDto.id)
                newlyAddedCategories.push(category.entityDto);
        });
        this.appItem.entityCategoriesAdded = newlyAddedCategories;
        this.appItem.entityCategoriesRemoved = removedCategories;
    }

    // classification methods
    openSelectClassificationsModal() {
        this.formTouched = true;
        let config: ModalOptions = new ModalOptions();
        config.class = "right-modal slide-right-in";
        let modalDefaultData: Partial<SelectClassificationDynamicModalComponent> =
        {
            savedIds: this.selectedClassificationsIds,
            showAddAction: true,
            showActions: true,
            entityId: this.appItem.entityId,
        };
        config.initialState = modalDefaultData;
        let modalRef: BsModalRef = this._BsModalService.show(
            SelectClassificationDynamicModalComponent,
            config
        );
        let subs: Subscription = this._BsModalService.onHidden.subscribe(() => {
            this.selectClassificationsHandler(modalRef);
            if (!modalRef.content.isHiddenToCreateOrEdit) subs.unsubscribe();
        });
    }

    removeClassification(
        classification: AppEntityDtoWithActions<AppEntityClassificationDto>,
        i: number
    ) {
        this.formTouched = true;
        if (classification.entityDto.id) {
            classification.removed = true;
        } else this.classifications.splice(i, 1);
    }
    undoClassification(
        classification: AppEntityDtoWithActions<AppEntityClassificationDto>
    ) {
        classification.removed = false;
    }

    selectClassificationsHandler(modalRef) {
        let data: SelectClassificationDynamicModalComponent = modalRef.content;
        if (
            data.selectionDone &&
            Array.isArray(data.selectedRecords) &&
            data.selectedRecords.length
        ) {
            // add or edit done
            this.addSelectedClassifications(data.selectedRecords);
        }
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
                // this.appItem.entityId
            )
            .subscribe((res) => {
                this.handleClassifications(res.items);
            });
    }

    handleClassifications(data: AppEntityClassificationDto[]) {
        if (!data) return;
        data.forEach((item) => {
            const classification =
                new AppEntityDtoWithActions<AppEntityClassificationDto>();
            classification.entityDto = item;
            this.classifications.push(classification);
        });
    }

    addSelectedClassifications(
        selected: TreeNodeOfGetSycEntityObjectClassificationForViewDto[]
    ): void {
        this.formTouched = true;
        selected.forEach((element) => {
            if(! (!element?.parent && !element?.leaf)){
            const newClass: AppEntityDtoWithActions<AppEntityClassificationDto> =
                new AppEntityDtoWithActions<AppEntityClassificationDto>({
                    entityDto: new AppEntityClassificationDto({
                        id: 0,
                        entityObjectClassificationId:
                            element.data.sycEntityObjectClassification.id,
                        entityObjectClassificationCode:
                            element.data.sycEntityObjectClassification.code,
                            entityObjectClassificationName: this.getPath(element),
                    }),
                });
            this.classifications.push(newClass);
            }
        });
    }

    seperateNewAndRemovedClassifications() {
        const newlyAddedClassifications: AppEntityClassificationDto[] = [];
        const removedClassifications: AppEntityClassificationDto[] = [];
        this.classifications.forEach((classification) => {
            if (classification.removed)
                removedClassifications.push(classification.entityDto);
            else if (!classification.entityDto.id)
                newlyAddedClassifications.push(classification.entityDto);
        });
        this.appItem.entityClassificationsAdded = newlyAddedClassifications;
        this.appItem.entityClassificationsRemoved = removedClassifications;
    }

    // extra attribute
    // multiValuesExtraAttributeOnChange(
    //     $event: {
    //         itemValue: number;
    //         value: number[];
    //         originalEvent: MouseEvent;
    //     },
    //     extraAttrDefinition: FilteredExtraAttribute<number[]>
    // ) {
    //   this.formTouched = true;

    //     let selectedAttrValue = $event.itemValue;
    //     if (selectedAttrValue == -1) {
    //         selectedAttrValue = undefined;
    //         return this.loadExtraDataLookupList(extraAttrDefinition);
    //     }
    // }

    // singleValueExtraAttributeOnChange(
    //     $event: { value: number; originalEvent: MouseEvent },
    //     extraAttrDefinition: FilteredExtraAttribute<number>
    // ) {
    //   this.formTouched = true;

    //     let selectedAttrValue = $event.value;
    //     if (selectedAttrValue == -1) {
    //         selectedAttrValue = undefined;
    //         return this.loadExtraDataLookupList(extraAttrDefinition);
    //     }
    // }
    multiValuesExtraAttributeOnChange(
        $event: {
            itemValue: number;
            value: number[];
            originalEvent: MouseEvent;
        },
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
        $event: {
            value: number;
            originalEvent: MouseEvent;
        },
        extraAttrDefinition: FilteredExtraAttribute<number>
    ) {
        if ($event.value == -1) {
            extraAttrDefinition.selectedValues = undefined;
            return this.loadMoreLookupData(extraAttrDefinition);
        }
        this.formTouched = true;
    }

    loadMoreLookupData(extraAttrDefinition: FilteredExtraAttribute<number>) {
        return this.loadExtraDataLookupList(extraAttrDefinition);
    }

    notLookupExtraAttributeOnChange(
        value,
        extraAttrDefinition: FilteredExtraAttribute
    ) {
        this.formTouched = true;
    }

    fileChange(
        event,
        attachmentCategory: GetSycAttachmentCategoryForViewDto,
        index?: number,
        aspectRatio?: number,
        cropWithoutOptions?: boolean
    ) {
        this.formTouched = true;
        if (event.target.value) {
            // there is a file
            // destructing operator => declare 2 variables from the returned object with the same keys names
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
            this.appItem.entityAttachments == null ||
            this.appItem.entityAttachments == undefined
        ) {
            this.appItem.entityAttachments = [];
        }
        // create GuId
        let guid = this.guid();
        // create app attachment entity
        let att: AppEntityAttachmentDto = new AppEntityAttachmentDto();
        att.index = index;
        att.fileName = file.name;
        att.attachmentCategoryId = attachmentCategory.sycAttachmentCategory.id;
        att.guid = guid;
        const tempFile = guid + file.name.match(/\.[0-9a-z]+$/i)[0];
        this.addTempAttachments([tempFile]);
        // save image as a base64
        this.attachmentsSrcs[index] =
            croppedImageContent.croppedImageAsBase64 as string;
        this.appItem.entityAttachments[index] = att;
        if (index === 0) {
            this.setDefaultImage(0);
        }

        this.uploadBlobAttachment(croppedImageContent.croppedImage, att);

        // if all is filled with images add new input
        if (
            this.attachmentsSrcs.every((elem) => elem) &&
            this.attachmentsSrcs.length < 10
        )
            this.attachmentsSrcs.push("");
    }

    setDefaultImage(index) {
        this.formTouched = true;
        if (
            this.appItem.entityAttachments == null ||
            this.appItem.entityAttachments == undefined
        ) {
            this.appItem.entityAttachments = [];
        }
        this.defaultImageIndex = index;
        this.appItem.entityAttachments.map((item, i) => {
            item.isDefault = index == i ? true : false;
            return item;
        });
    }
    removePhoto(i: number) {
        this.formTouched = true;
        if (
            this.defaultImageIndex === i &&
            this.appItem.entityAttachments.length > 1
        )
            return this.notify.info(
                "Please set another image as default first"
            );
        this.appItem.entityAttachments.splice(i, 1);
        this.attachmentsSrcs.splice(i, 1);
        if (
            (this.attachmentsSrcs.length === 9 &&
                this.attachmentsSrcs.every((item) => item)) ||
            this.attachmentsSrcs.length === 0
        )
            this.attachmentsSrcs.push("");
        else if (this.defaultImageIndex > i) this.defaultImageIndex--;
    }

    removeAllAttachments() {
        this.formTouched = true;
        if (this.attachmentsSrcs.length) {
            var isConfirmed: Observable<boolean>;
            isConfirmed = this.askToConfirm(
                "AreYouSureYouWantToDeleteAllTheAttachments?",
                "Confirm"
            );

            isConfirmed.subscribe((res) => {
                if (res) {
                    this.attachmentsSrcs = [""];
                    this.appItem.entityAttachments = [];
                }
            });
        }
    }

    // save product
    saveProduct(form: NgForm) {
        // if (!this.appItem?.appItemPriceInfos[this.defaultCurrencyMSRPPriceIndex]?.price || this.appItem?.appItemPriceInfos[this.defaultCurrencyMSRPPriceIndex]?.price <= 0) {
        //     this.PriceValidMsg = "Price must be greater than 0";
        //     return this.notify.error(
        //         this.l(this.PriceValidMsg)
        //     );
        // }
        // else {
            this.appItem?.variationItems?.forEach((variation) => {
                if(!variation.appItemPriceInfos)variation.appItemPriceInfos = this.getParentProductPrices();
            });
    // }

        this.submitted = true;
        if (form.form.invalid) {
            form.form.markAllAsTouched();
            return this.notify.error(
                this.l("Please,CompleteAllTheRequiredFields(*)")
            );
        }
        if (!this.appItem?.entityAttachments?.length) {
            return this.notify.error(
                this.l("Please,UploadAtLeastOneImageToThisProduct")
            );
        }
        if (this.uploader.isUploading) {
            return this.notify.error(
                this.l("PleaseWait,SomeAttachmentsAreStillUploading")
            );
        }
        this.removeBase64ImagesFromDataBeforeSend();
        this.saving = true;
        this.appItem.itemType =
            this.listingMode === undefined
                ? ListingModeEnum.Create
                : ListingModeEnum.Edit;
        if (this.listingMode === ListingModeEnum.Create) delete this.appItem.id;
        this.seperateNewAndRemovedCategories();
        this.seperateNewAndRemovedDepartments();
        this.seperateNewAndRemovedClassifications();
        this.extraSelectedValuesExtraData();
        if (this.appItem.sycIdentifierId == 0)
            this.appItem.sycIdentifierId = null;
        this._appItemsServiceProxy
            .createOrEdit(this.appItem)
            .pipe(
                finalize(() => {
                    this.saving = false;
                })
            )
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
    extraSelectedValuesExtraData() {
        const recentlyExtraAttributes: FilteredExtraAttribute<any>[] = [
            ...this.extraAttributes.ADDITIONAL.extraAttributes,
            ...this.extraAttributes.RECOMMENDED.extraAttributes,
        ];
        const previousExtraAttributes: AppEntityExtraDataDto[] =
            this.appItem.entityExtraData || [];
        this.appItem.entityExtraData = [];
        recentlyExtraAttributes.forEach((extraAttr) => {
            if (!extraAttr.selectedValues || extraAttr.isSelectedOnVariation)
                return;
            if (extraAttr.isLookup) {
                // is lookup
                if (extraAttr.acceptMultipleValues) {
                    // multi selection
                    extraAttr?.selectedValues?.forEach((attributeValueId) => {
                        const alreadySelected: AppEntityExtraDataDto =
                            previousExtraAttributes.filter((item) => {
                                item.attributeValueId == attributeValueId;
                            })[0];
                        if (alreadySelected)
                            return this.appItem.entityExtraData.push(
                                alreadySelected
                            );
                        const entityExtraData: AppEntityExtraDataDto =
                            new AppEntityExtraDataDto();
                        entityExtraData.id = 0;
                        entityExtraData.attributeValueId = attributeValueId;
                        entityExtraData.attributeId = extraAttr.attributeId;
                        this.appItem.entityExtraData.push(entityExtraData);
                    });
                } else {
                    // single selection
                    const alreadySelected: AppEntityExtraDataDto =
                        previousExtraAttributes.filter((item) => {
                            item.attributeId = extraAttr.attributeId;
                        })[0];
                    if (alreadySelected) {
                        alreadySelected.attributeValueId =
                            extraAttr?.selectedValues;
                        this.appItem.entityExtraData.push(alreadySelected);
                    } else {
                        const entityExtraData: AppEntityExtraDataDto =
                            new AppEntityExtraDataDto();
                        entityExtraData.id = 0;
                        entityExtraData.attributeValueId =
                            extraAttr?.selectedValues;
                        entityExtraData.attributeId = extraAttr.attributeId;
                        this.appItem.entityExtraData.push(entityExtraData);
                    }
                }
            } else {
                // any other not lookup data
                const alreadySelected: AppEntityExtraDataDto =
                    previousExtraAttributes.filter((item) => {
                        item.attributeId = extraAttr?.attributeId;
                    })[0];
                if (alreadySelected) {
                    alreadySelected.attributeValue = extraAttr?.selectedValues;
                    this.appItem.entityExtraData.push(alreadySelected);
                } else {
                    const entityExtraData: AppEntityExtraDataDto =
                        new AppEntityExtraDataDto();
                    entityExtraData.id = 0;
                    entityExtraData.attributeValue = extraAttr?.selectedValues;
                    entityExtraData.attributeId = extraAttr.attributeId;
                    this.appItem.entityExtraData.push(entityExtraData);
                }
            }
        });
    }

    showCreateOrEditVariationPage() {
        if (!this.appItem.entityObjectTypeId) {
            return this.notify.error(this.l("PleaseChooseAProductTypeFirst"));
        }else if(!this.appItem?.code){
            return this.notify.error(this.l("PleaseAddAProductCode"));
        }
         else if (
            !this.selectedItemTypeData.extraAttributes ||
            !this.selectedItemTypeData.extraAttributes.extraAttributes ||
            !this.selectedItemTypeData.extraAttributes.extraAttributes.length
        ) {
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

    cancel() {
        // this._createEditAppItemDataService.resetState()
        //this._router.navigate(['/app/main/appItem'])
        this.goBack("app/main/products");
    }

    applyVariations($event: ApplyVariationOutput) {
        this.appItem.variationItems = $event.variation;
        this.appItem.appItemSizesScaleInfo = $event.appItemSizesScaleInfo;
        this.removeSelectedOrAddUnSelectedExtraAttributesOnVariationsFromAppItemEntityExtraData();
        this.hideVariations(true);
        this.updateProductAvailableQuantity();
        if (
            this.appItem.appItemPriceInfos.length ==
            this.appItem?.variationItems[0]?.appItemPriceInfos.length &&
          this.appItem.appItemPriceInfos['currencyId']!==this.appItem?.variationItems[0]?.appItemPriceInfos['currencyId']
          &&this.appItem.appItemPriceInfos['price']!==this.appItem?.variationItems[0]?.appItemPriceInfos['price']           
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
            (accum, item) => {
                return (accum += isNaN(item.stockAvailability)
                    ? 0
                    : item.stockAvailability);
            },
            0
        );
    }
    updateProductPriceInfos() {
        if (!this.appItem?.appItemPriceInfos?.length) return;
        this.appItem.appItemPriceInfos =
            this.appItem?.variationItems[0]?.appItemPriceInfos;
    }


    hideVariations($event) {
        if ($event?.target?.files.length == 0)
            return;
        this.displayVariations = false;
    }

    allCurrencies: CurrencyInfoDto[] = [];
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
    selectedCurrencies: CurrencyInfoDto[] = [];
    showVariations() {
        this.appItem.appItemPriceInfos.forEach((priceDto) => {
            const currencyId = priceDto.currencyId;
            const alreadyAdded: boolean =
                this.selectedCurrencies.findIndex(
                    (item) => item.value == currencyId
                ) > -1;
            let currency = this.allCurrencies.filter(
                (curr) => curr.value == currencyId
            )[0];
            if (currency && !alreadyAdded) {
                this.selectedCurrencies.push(currency);
            }
        });
        const defaultCurrencyAlreadyAdded: boolean =
                this.selectedCurrencies.findIndex(
                    (item) => item.value == this.tenantDefaultCurrency.value
                ) > -1;
        if(!defaultCurrencyAlreadyAdded) this.selectedCurrencies.push(this.tenantDefaultCurrency) 
        this.formTouched = true;
        this.displayVariations = true;
    }
    removeBase64ImagesFromDataBeforeSend() {
        if (!this.appItem.variationItems) return;
        this.appItem.variationItems.forEach((item) => {
            item.entityAttachments.map((att) => {
                if (att.guid) att.url = undefined;
            });
        });
    }

    removeSelectedOrAddUnSelectedExtraAttributesOnVariationsFromAppItemEntityExtraData() {
        let variation = this.appItem.variationItems[0];
        if (!variation) {
            variation = new VariationItemDto();
            variation.entityExtraData = [];
        }
        const selectedExtraAttributesIds: number[] =
            variation.entityExtraData.reduce((accum, item) => {
                accum.push(item.attributeId);
                return accum;
            }, []);
        this.extraAttributes.ADDITIONAL.extraAttributes =
            this.extraAttributes.ADDITIONAL.extraAttributes.map((item) => {
                const isSelectedOnVariation =
                    selectedExtraAttributesIds.includes(item.attributeId);
                item.isSelectedOnVariation = isSelectedOnVariation;
                return item;
            });
        this.extraAttributes.RECOMMENDED.extraAttributes =
            this.extraAttributes.RECOMMENDED.extraAttributes.map((item) => {
                const isSelectedOnVariation =
                    selectedExtraAttributesIds.includes(item.attributeId);
                item.isSelectedOnVariation = isSelectedOnVariation;
                return item;
            });
        // if (!this.appItem.entityExtraData) this.appItem.entityExtraData = [];
        // this.appItem.entityExtraData = this.appItem.entityExtraData.filter(
        //     (item) => {
        //         return !selectedExtraAttributesIds.includes(item.attributeId);
        //     }
        // );
    }
    openCreateNewAppEntityModal(extraAttr: FilteredExtraAttribute) {
        this.formTouched = true;
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
        let modalRef: BsModalRef = this._BsModalService.show(
            AppEntityListDynamicModalComponent,
            config
        );
        let subs: Subscription = this._BsModalService.onHidden.subscribe(() => {
            this._extraAttributeDataService.getExtraAttributeLookupData(
                extraAttr.entityObjectTypeCode,
                extraAttr.lookupData
            );
            let modalRefData: AppEntityListDynamicModalComponent =
                modalRef.content;
                
              if(extraAttr?.paginationSetting?.skipCount)
               extraAttr.paginationSetting.skipCount = 0; 
            
               this.loadExtraDataLookupList(extraAttr);

            if (modalRefData.selectionDone)
                extraAttr.selectedValues = modalRefData.selectedRecords;

            // if(extraAttr.acceptMultipleValues){ // multi selection
            //     const selectedValues : number[] =  extraAttr.selectedValues
            //     selectedValues.forEach(selectedValue => {
            //         const selectedValueIndex = this.appItem.entityExtraData.findIndex(
            //             (elem) => elem.attributeValueId != selectedValue
            //         );

            //         if(selectedValueIndex > -1) return

            //         const newExtraData = new AppEntityExtraDataDto();
            //         // newExtraData.attributeId = extraAttrDefinition.attributeId
            //         // newExtraData.attributeValueId = selectedAttrValue
            //         newExtraData.id = 0

            //         this.appItem.entityExtraData.push(newExtraData);
            //     });
            // } else { // single selction
            //     const selectedValue : number =  extraAttr.selectedValues

            //     const selectedValueAsEntityExtraData = this.appItem.entityExtraData.filter(
            //         (elem) => elem.attributeValueId != extraAttr.attributeId
            //     );

            //     if( selectedValueAsEntityExtraData.length > 0) {
            //         selectedValueAsEntityExtraData[0].attributeValueId = selectedValue
            //     } else {
            //         const newExtraData = new AppEntityExtraDataDto();
            //         newExtraData.attributeId = extraAttr.attributeId
            //         newExtraData.attributeValueId = selectedValue
            //         newExtraData.id = 0
            //         this.appItem.entityExtraData.push(newExtraData);
            //     }
            // }

            if (!modalRef.content.isHiddenToCreateOrEdit) subs.unsubscribe();
        });
    }
    askToPublish() {
        var isConfirmed: Observable<boolean>;
        isConfirmed = this.askToConfirm(
            this.l(
                `Savedsuccessfully,AreYouWantToPublishYourProductListingow?`
            ),
            "",
            {
                confirmButtonText: this.l("PublishNow"),
                cancelButtonText: this.l("Later"),
            }
        );

        isConfirmed.subscribe((res) => {
            if (res) {
                this.openShareProductListingModal();
            }
            //this._router.navigate(["/app/main/appItem"]);
            else this.goBack("app/main/products");
        });
    }
    resetExtraAttributeSelectedValue(extraAttr: FilteredExtraAttribute) {
        this.formTouched = true;
        extraAttr.selectedValues = undefined;
        this.appItem.entityExtraData = this.appItem.entityExtraData.filter(
            (item) => item.attributeId !== extraAttr.attributeId
        );
    }

    openShareProductListingModal() {
        const listingId: number = this.appItem.id;
        const alreadyPublished: boolean = this.appItem.published;
        const successCallBack = () => {
            // this.notify.success(
            //     this.l("PublishedSuccessfully"),
            //     this.l("Success")
            // );
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
        this._publishAppItemListingService
            .unPublish(this.appItem.id)
            .subscribe(() => {
                // this.notify.success(this.l("UnPublishedSuccessfully"));
                this.appItem.published = false;
            });
    }

    getCodeValue(code: string) {
        this.appItem.code = code;
        this.setVariationCode();
    }

    setVariationCode() {
        if (this.appItem?.variationItems?.length > 0)
            var subCode = this.appItem?.variationItems[0]?.code.split("-");
        if (subCode && subCode[0] == this.appItem?.code) return;
        for (var i = 0; i < this.appItem?.variationItems?.length; i++) {
            for (
                var j = 0;
                j < this.appItem?.variationItems[i]?.entityExtraData?.length;
                j++
            ) {
                if (j == 0) {
                    if (this.appItem?.code)
                        this.appItem.variationItems[i].code = this.appItem.code;
                    else this.appItem.variationItems[i].code = "";
                }
                this.appItem.variationItems[i].code +=
                    "-" +
                    this.appItem?.variationItems[i]?.entityExtraData[j]
                        ?.attributeValue;
            }
        }
    }
    checkDefaultCurrencyMSRPPriceIndex() {
        this.defaultCurrencyMSRPPriceIndex =
            this._pricingHelperService.getDefaultPricingIndex(
                this.appItem.appItemPriceInfos
            );
    }
    stockAvailabilityChanged($event) {
        if (this.appItem.stockAvailability < 0)
            this.notify.error("Available Qty should be >=0");
    }
    checkAndAddDefaultPriceObject() {
        if (
            !this.appItem.appItemPriceInfos ||
            !this.appItem.appItemPriceInfos.length
        ) {
            this.appItem.appItemPriceInfos = [
                this._pricingHelperService.getDefaultPricingInstance(),
            ];
        }
        this.checkDefaultCurrencyMSRPPriceIndex();
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
                if (this.updateVariation) {
                    variation.appItemPriceInfos = this.getParentProductPrices();
                }
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
}
