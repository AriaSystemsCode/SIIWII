import { DatePipe, Location } from "@angular/common";
import {
    Component,
    ElementRef,
    Injector,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { AppConsts } from "@shared/AppConsts";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    AppEntityAttachmentDto,
    AppItemAttributePriceDto,
    AppItemForViewDto,
    AppItemPriceInfo,
    AppItemSizesScaleInfo,
    AppItemsListsServiceProxy,
    AppItemsServiceProxy,
    AppSizeScaleServiceProxy,
    CurrencyInfoDto,
    ExtraDataAttrDto,
    ICurrencyInfoDto,
    LookupLabelDto,
    RecommandedOrAdditional,
} from "@shared/service-proxies/service-proxies";
import { SelectItem } from "primeng/api";
import { AppitemListSelectionModalComponent } from "../../app-item-shared/components/appitem-list-selection-modal.component";
import { AppitemsActionsMenuComponent } from "../../app-item-shared/components/appitems-actions-menu.component";
import { CreateOrEditAppitemListComponent } from "../../app-item-shared/components/create-or-edit-appitem-list.component";
import { SuccessRightModalComponent } from "../../app-item-shared/components/success-right-modal.component";
import { VariationsSelectionModalComponent } from "../../app-item-shared/components/variations-selection-modal.component";
import { AppItemsActionsService } from "../../app-item-shared/services/app-items-actions.service";
import { PricingHelpersService } from "../../app-item-shared/services/pricing-helpers.service";
import { PublishAppItemListingService } from "../../app-item-shared/services/publish-app-item-listing.service";
import { ActionsMenuEventEmitter } from "../../app-items-browse/models/ActionsMenuEventEmitter";
import { AppItemsBrowseComponentActionsMenuFlags } from "../../app-items-browse/models/app-item-browse-inputs.model";
import { AppItemBrowseEvents } from "../../app-items-browse/models/appItems-browse-events";
import { AppitemListPublishService } from "../../app-items-list/services/appitem-list-publish.service";
import { AppItemViewInput } from "../models/app-item-view-input";
import { EventEmitter } from "stream";
import { finalize } from "rxjs";

@Component({
    selector: "app-app-items-view",
    templateUrl: "./app-items-view.component.html",
    styleUrls: ["./app-items-view.component.scss"],
    animations: [appModuleAnimation()],
})
export class AppItemsViewComponent
    extends AppComponentBase
    implements OnChanges, OnDestroy
{
    @ViewChild("itemListSelection", { static: true })
    itemListSelectionModal: AppitemListSelectionModalComponent;

    @ViewChild("createOrEditListModal", { static: true })
    createOrEditListModal: CreateOrEditAppitemListComponent;
    @ViewChild("variationSelectionModal", { static: true })
    variationSelectionModal: VariationsSelectionModalComponent;
    @ViewChild("successRightModal", { static: true })
    successRightModal: SuccessRightModalComponent;
    @ViewChild("recommendHeight")
    recommendHeight: ElementRef;
    @ViewChild("additionalHeight") additionalHeight: ElementRef;
    @ViewChild("AppitemsActionsMenuComponent", { static: true })
    appitemsActionsMenuComponent: AppitemsActionsMenuComponent;

    @Input() productId: number = 0;
    @Input() appItemViewInput: AppItemViewInput;
    appItemForViewDto: AppItemForViewDto;
    actionsMenuFlags: AppItemsBrowseComponentActionsMenuFlags =
        new AppItemsBrowseComponentActionsMenuFlags();

    maxContainerHeight: number = 150;
    productDescription: string = "";
    descCnt: number = 0;
    maxDescCnt: number = 550;
    scrollDesc: boolean = false;
    numVisible: number = 4;
    numScroll: number = 4;
    numLeftContainerImages: number = 4;

    currentDefaultEntityAttachmentPage: number = 0;
    totalDefaultImages: number;
    skipDefaultImagesCount: number = 0;
    maxDefaultImagesCount: number = 10;

    //Category
    showMoreCategory: boolean = false;
    showLessCategory: boolean = false;
    totalCategory: number;
    noOfCategoryToShowInitially: number;
    maxCategoryCount: number;
    skipCategoryCount: number;
    categoryToLoad: number;
    initCategory: string[] = [];
    scrollCategory: boolean = false;
    maxCategoryCnt: number;
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

    //Recommended
    initRecommended: ExtraDataAttrDto[] = [];
    showLessRecommended: boolean = false;
    showMoreRecommended: boolean = false;
    scrollRecommended: boolean = false;
    totalRecommended: number;
    noOfRecommendedToShowInitially: number;
    maxRecommendedCount: number;
    skipRecommendedCount: number;
    recommendedToLoad: number;
    maxRecommendedCnt: number;

    //Additional
    initAdditional: ExtraDataAttrDto[] = [];
    showLessAdditional: boolean = false;
    showMoreAdditional: boolean = false;
    scrollAdditional: boolean = false;
    totalAdditional: number;
    noOfAdditionalToShowInitially: number;
    maxAdditionalCount: number;
    skipAdditionalCount: number;
    additionalToLoad: number;
    maxAdditionalCnt: number;

    imageSelectedIndex: number = 0;
    varitaionSelectedIndex: number = 0;
    lastUpdatedDate: string;

    centerImage: AppEntityAttachmentDto = null;
    /*  showProductAttachment: boolean = true; */
    selectedValuesName: string = "";

    defaultLogo =
        AppConsts.appBaseUrl + "/assets/placeholders/appitem-placeholder.png";

    defaultCurrencyMSRPPriceIndex = -1;
    showAdvancedPricing: boolean = false;

    display: boolean = false;
    timezoneOffset: number;

    public constructor(
        private _router: Router,
        private _appItemsServiceProxy: AppItemsServiceProxy,
        private appSizeScaleServiceProxy: AppSizeScaleServiceProxy,
        private _pricingHelpersService: PricingHelpersService,
        injector: Injector,
        _location: Location,
        public _publishAppItemListingService: PublishAppItemListingService,
        private datePipe: DatePipe
    ) {
        super(injector, _location);
    }
    appSizeRatio: AppItemSizesScaleInfo;
    ngOnChanges(changes: SimpleChanges) {
        if (this.appItemViewInput) {
            this.appItemForViewDto = this.appItemViewInput.appItemForViewDto;
            this.appItemForViewDto?.minPrice % 1 ==0?this.appItemForViewDto.minPrice=parseFloat(Math.round(this.appItemForViewDto.minPrice * 100 / 100).toFixed(2)):null; 
            this.getTimezoneOffset();
        this.lastUpdatedDate = this.datePipe.transform(
            this.appItemViewInput.appItemForViewDto.lastModifiedDate.toISOString(),
            "MMM d, y, h:m a"
        );
        this.productId = this.appItemForViewDto.id;
        this._publishAppItemListingService.sharingStatus =
            this.appItemForViewDto.sharingLevel;
        this.actionsMenuFlags.showAll();
        this.appItemForViewDto.recommended[0];
        //Product 'Description'
        this.getProductDescription();

        //Product Category & Department & Classification
        this.initCategoryVariables(true);
        this.initDepartmentVariables(true);
        this.initClassificationVariables(true);
        this.initRecommendedVariables(true);
        this.initAdditionalVariables(true);
        if (this.appItemForViewDto?.variations.length == 0)
            this.centerImage = this.appItemForViewDto.entityAttachments[0];
        else
            this.showImagesOfVaritaionSelectedValues(
                this.appItemForViewDto.variations[0].selectedValues[0]
            );
        this.initPricingNeededData();
        this.selectedValuesName =
            this.appItemForViewDto?.variations[0]?.selectedValues[0]?.value;
        this.defaultCurrencyMSRPPriceIndex =
            this._pricingHelpersService.getDefaultPricingIndex(
                this.appItemForViewDto.appItemPriceInfos
            );
        this.filterPricing();
        }
    }


    getDetails(){
        this.appItemForViewDto = this.appItemViewInput.appItemForViewDto;
        this.appItemForViewDto?.minPrice % 1 ==0?this.appItemForViewDto.minPrice=parseFloat(Math.round(this.appItemForViewDto.minPrice * 100 / 100).toFixed(2)):null; 
        this.getTimezoneOffset();
        this.lastUpdatedDate = this.datePipe.transform(
            this.appItemViewInput.appItemForViewDto.lastModifiedDate.toISOString(),
            "MMM d, y, h:m a"
        );
        this.productId = this.appItemForViewDto.id;
        this._publishAppItemListingService.sharingStatus =
            this.appItemForViewDto.sharingLevel;
        this.actionsMenuFlags.showAll();
        this.appItemForViewDto.recommended[0];
        //Product 'Description'
        this.getProductDescription();

        //Product Category & Department & Classification
        this.initCategoryVariables(true);
        this.initDepartmentVariables(true);
        this.initClassificationVariables(true);
        this.initRecommendedVariables(true);
        this.initAdditionalVariables(true);
        if (this.appItemForViewDto?.variations.length == 0)
            this.centerImage = this.appItemForViewDto.entityAttachments[0];
        else
            this.showImagesOfVaritaionSelectedValues(
                this.appItemForViewDto.variations[0].selectedValues[0]
            );
        this.initPricingNeededData();
        this.selectedValuesName =
            this.appItemForViewDto?.variations[0]?.selectedValues[0]?.value;
        this.defaultCurrencyMSRPPriceIndex =
            this._pricingHelpersService.getDefaultPricingIndex(
                this.appItemForViewDto.appItemPriceInfos
            );
        this.filterPricing();
    }

    ngOnDestroy() {
        this.unsubscribeToAllSubscriptions();
    }

    getProductDescription() {
        this.productDescription = this.appItemForViewDto.description;
        if (this.productDescription.length >= this.maxDescCnt)
            this.scrollDesc = true;
        else this.scrollDesc = false;
    }

    setVaraitionExtraDataValues(secondAttributeindex: number) {
        if (
            !this.appItemForViewDto.variations[0].selectedValues[
                this.varitaionSelectedIndex
            ].edRestAttributes ||
            this.appItemForViewDto.variations[0].selectedValues[
                this.varitaionSelectedIndex
            ].edRestAttributes[secondAttributeindex].values.length == 0
        ) {
            this._appItemsServiceProxy
                .getSecondAttributeValues(
                    this.productId,
                    this.appItemForViewDto.variations[0].extraAttributeId,
                    this.appItemForViewDto.variations[0].selectedValues[
                        this.varitaionSelectedIndex
                    ].edRestAttributes[secondAttributeindex].extraAttributeId,
                    this.appItemForViewDto.variations[0].selectedValues[
                        this.varitaionSelectedIndex
                    ].value,
                    undefined,
                    undefined,
                    undefined
                )
                .subscribe((res) => {
                    this.appItemForViewDto.variations[0].selectedValues[
                        this.varitaionSelectedIndex
                    ].edRestAttributes[secondAttributeindex].values = res.items;
                });
        }
    }

    showImageAtCenter(img) {
        this.centerImage = img;
    }
    showImagesOfVaritaionSelectedValues(img: any) {
        this.varitaionSelectedIndex =
            this.appItemForViewDto.variations[0].selectedValues.indexOf(img);
        /* this.showProductAttachment = false; */
        this.centerImage = null;
        if (
            !this.appItemForViewDto.variations[0].selectedValues[
                this.varitaionSelectedIndex
            ].entityAttachments ||
            this.appItemForViewDto.variations[0].selectedValues[
                this.varitaionSelectedIndex
            ].entityAttachments.length == 0
        ) {
            // get attachment
            this._appItemsServiceProxy
                .getFirstAttributeAttachments(
                    this.productId,
                    this.appItemForViewDto.variations[0].extraAttributeId,
                    this.appItemForViewDto.variations[0].selectedValues[
                        this.varitaionSelectedIndex
                    ].value
                )
                .subscribe((res) => {
                    this.appItemForViewDto.variations[0].selectedValues[
                        this.varitaionSelectedIndex
                    ].entityAttachments = res;

                    this.setVariationsRelatedValues();
                });
        } else this.setVariationsRelatedValues();
    }
    setVariationsRelatedValues() {
        this.centerImage =
            this.appItemForViewDto.variations[0].selectedValues[
                this.varitaionSelectedIndex
            ].entityAttachments[0];

        this.selectedValuesName =
            this.appItemForViewDto.variations[0].selectedValues[
                this.varitaionSelectedIndex
            ].value;
        this.filterPricing();
    }
    getDefaultEntityAttachmentPerPage($event) {
        this.totalDefaultImages =
            this.appItemForViewDto.variations[0].selectedValuesTotalCount;

        let selectedValuesLength =
            this.appItemForViewDto.variations[0].selectedValues.length;
        //All Data Already Loaded
        if (selectedValuesLength >= this.totalDefaultImages) return;

        let pagingPagesNum = Math.floor(
            (selectedValuesLength - this.numVisible) / this.numVisible
        );
        if (
            $event.page < this.currentDefaultEntityAttachmentPage ||
            $event.page != pagingPagesNum
        )
            return;

        this.currentDefaultEntityAttachmentPage = $event.page;
        this.skipDefaultImagesCount += this.maxDefaultImagesCount;
        this._appItemsServiceProxy
            .getFirstAttributeValues(
                this.productId,
                this.appItemForViewDto.variations[0].extraAttributeId,
                undefined,
                this.skipDefaultImagesCount,
                this.maxDefaultImagesCount
            )
            .subscribe((res) => {
                this.appItemForViewDto.variations[0].selectedValues.push(
                    ...res.items
                );
            });
    }
    //category
    initCategoryVariables(firstInit: boolean) {
        if (firstInit)
            this.initCategory =
                this.appItemForViewDto.entityCategoriesNames.items;
        else
            this.appItemForViewDto.entityCategoriesNames.items =
                this.initCategory;
        this.noOfCategoryToShowInitially = 10;
        this.maxCategoryCount = 10;
        this.categoryToLoad = 20;
        this.scrollCategory = false;
        this.maxCategoryCnt = 40;
        this.totalCategory =
            this.appItemForViewDto.entityCategoriesNames.totalCount;
        if (this.noOfCategoryToShowInitially < this.totalCategory)
            this.showMoreCategory = true;
        else this.showMoreCategory = false;
        this.showLessCategory = false;
    }

    showCategory() {
        if (this.noOfCategoryToShowInitially < this.totalCategory) {
            this.maxCategoryCount = this.categoryToLoad;
            this.skipCategoryCount = this.noOfCategoryToShowInitially;
            this.noOfCategoryToShowInitially += this.categoryToLoad;

            this._appItemsServiceProxy
                .getAppItemCategoriesNamesWithPaging(
                    this.productId,
                    this.appItemForViewDto.entityId,
                    undefined,
                    this.skipCategoryCount,
                    this.maxCategoryCount
                )
                .subscribe((res) => {
                    if (
                        this.noOfCategoryToShowInitially >= this.totalCategory
                    ) {
                        this.showMoreCategory = false;
                        this.showLessCategory = true;
                    }

                    this.appItemForViewDto.entityCategoriesNames.items =
                        this.appItemForViewDto.entityCategoriesNames.items.concat(
                            res.items
                        );

                    if (
                        this.appItemForViewDto.entityCategoriesNames.items
                            .length >= this.maxCategoryCnt
                    )
                        this.scrollCategory = true;
                });
        } else {
            this.initCategoryVariables(false);
        }
    }
    //Department
    initDepartmentVariables(firstInit: boolean) {
        if (firstInit)
            this.initDepartment =
                this.appItemForViewDto.entityDepartmentsNames.items;
        else
            this.appItemForViewDto.entityDepartmentsNames.items =
                this.initDepartment;

        this.noOfDepartmentToShowInitially = 10;
        this.maxDepartmentCount = 10;
        this.scrollDepartment = false;
        this.maxDepartmentCnt = 40;
        this.departmentToLoad = 20;
        this.totalDepartment =
            this.appItemForViewDto.entityDepartmentsNames.totalCount;

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

            this._appItemsServiceProxy
                .getAppItemDepartmentsNamesWithPaging(
                    this.productId,
                    this.appItemForViewDto.entityId,
                    undefined,
                    this.skipDepartmentCount,
                    this.maxDepartmentCount
                )
                .subscribe((res) => {
                    if (
                        this.noOfDepartmentToShowInitially >=
                        this.totalDepartment
                    ) {
                        this.showMoreDepartment = false;
                        this.showLessDepartment = true;
                    }

                    this.appItemForViewDto.entityDepartmentsNames.items =
                        this.appItemForViewDto.entityDepartmentsNames.items.concat(
                            res.items
                        );
                    if (
                        this.appItemForViewDto.entityDepartmentsNames.items
                            .length >= this.maxDepartmentCnt
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
            this.initClassification =
                this.appItemForViewDto.entityClassificationsNames.items;
        else
            this.appItemForViewDto.entityClassificationsNames.items =
                this.initClassification;

        this.noOfClassificationToShowInitially = 10;
        this.maxClassificationCount = 10;
        this.scrollClassification = false;
        this.maxClassificationCnt = 40;
        this.classificationToLoad = 20;
        this.totalClassification =
            this.appItemForViewDto.entityClassificationsNames.totalCount;
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

            this._appItemsServiceProxy
                .getAppItemClassificationsNamesWithPaging(
                    this.productId,
                    this.appItemForViewDto.entityId,
                    undefined,
                    this.skipClassificationCount,
                    this.maxClassificationCount
                )
                .subscribe((res) => {
                    if (
                        this.noOfClassificationToShowInitially >=
                        this.totalClassification
                    ) {
                        this.showMoreClassification = false;
                        this.showLessClassification = true;
                    }

                    this.appItemForViewDto.entityClassificationsNames.items =
                        this.appItemForViewDto.entityClassificationsNames.items.concat(
                            res.items
                        );
                    if (
                        this.appItemForViewDto.entityClassificationsNames.items
                            .length >= this.maxClassificationCnt
                    )
                        this.scrollClassification = true;
                });
        } else {
            this.initClassificationVariables(false);
        }
    }

    //Recommended
    initRecommendedVariables(firstInit: boolean) {
        if (firstInit)
            this.initRecommended = this.appItemForViewDto.recommended;
        else this.appItemForViewDto.recommended = this.initRecommended;

        this.noOfRecommendedToShowInitially = 10;
        this.maxRecommendedCount = 10;
        this.scrollRecommended = false;
        this.maxRecommendedCnt = 40;
        this.recommendedToLoad = 20;
        this.totalRecommended = this.appItemForViewDto.recommended.length;
        if (this.noOfRecommendedToShowInitially < this.totalRecommended)
            this.showMoreRecommended = true;
        else this.showMoreRecommended = false;
        this.showLessRecommended = false;
    }
    showRecommended() {
        if (this.noOfRecommendedToShowInitially < this.totalRecommended) {
            this.maxRecommendedCount = this.recommendedToLoad;
            this.skipRecommendedCount = this.noOfRecommendedToShowInitially;
            this.noOfRecommendedToShowInitially += this.recommendedToLoad;

            this._appItemsServiceProxy
                .getAppItemExtraDataWithPaging(
                    this.appItemForViewDto.entityObjectTypeId,
                    RecommandedOrAdditional.RECOMMENDED,
                    this.productId,
                    this.appItemForViewDto.entityId,
                    undefined,
                    this.skipRecommendedCount,
                    this.maxRecommendedCount
                )
                .subscribe((res) => {
                    if (
                        this.noOfRecommendedToShowInitially >=
                        this.totalRecommended
                    ) {
                        this.showMoreRecommended = false;
                        this.showLessRecommended = true;
                    }

                    this.appItemForViewDto.recommended =
                        this.appItemForViewDto.recommended.concat(res.items);
                    if (
                        this.appItemForViewDto.recommended.length >=
                        this.maxRecommendedCnt
                    )
                        this.scrollRecommended = true;
                });
        } else {
            this.initRecommendedVariables(false);
        }
    }

    //Additional
    initAdditionalVariables(firstInit: boolean) {
        if (firstInit) this.initAdditional = this.appItemForViewDto.additional;
        else this.appItemForViewDto.additional = this.initAdditional;

        this.noOfAdditionalToShowInitially = 10;
        this.maxAdditionalCount = 10;
        this.scrollAdditional = false;
        this.maxAdditionalCnt = 40;
        this.additionalToLoad = 20;
        this.totalAdditional = this.appItemForViewDto.additional.length;
        if (this.noOfAdditionalToShowInitially < this.totalAdditional)
            this.showMoreAdditional = true;
        else this.showMoreAdditional = false;
        this.showLessAdditional = false;
    }
    showAdditional() {
        if (this.noOfAdditionalToShowInitially < this.totalAdditional) {
            this.maxAdditionalCount = this.additionalToLoad;
            this.skipAdditionalCount = this.noOfAdditionalToShowInitially;
            this.noOfAdditionalToShowInitially += this.additionalToLoad;

            this._appItemsServiceProxy
                .getAppItemExtraDataWithPaging(
                    this.appItemForViewDto.entityObjectTypeId,
                    RecommandedOrAdditional.RECOMMENDED,
                    this.productId,
                    this.appItemForViewDto.entityId,
                    undefined,
                    this.skipRecommendedCount,
                    this.maxRecommendedCount
                )
                .subscribe((res) => {
                    if (
                        this.noOfAdditionalToShowInitially >=
                        this.totalAdditional
                    ) {
                        this.showMoreAdditional = false;
                        this.showLessAdditional = true;
                    }

                    this.appItemForViewDto.additional =
                        this.appItemForViewDto.additional.concat(res.items);
                    if (
                        this.appItemForViewDto.additional.length >=
                        this.maxAdditionalCnt
                    )
                        this.scrollAdditional = true;
                });
        } else {
            this.initAdditionalVariables(false);
        }
    }

    //Action Menu Functions
    //Edit
    editItemHandler() {
        this._router.navigate([
            "/app/main/products/createOrEdit",
            this.productId,
        ]);
    }

    //EditListing
    editListingHandler() {
        this._router.navigate([
            "/app/main/products/editListing",
            this.productId,
        ]);
    }
    //Delete
    deleteItemHandler() {
        this.notify.success(this.l("SuccessfullyDeleted"));
        this._router.navigate(["app/main/products"]);
    }

    //Create Listing
    createListingHandler() {
        this._router.navigate([
            "/app/main/products/createListing",
            this.productId,
        ]);
    }

    //Publish Listing
    publishListingHandler() {
        this.appItemForViewDto.published = true;
        this.appItemViewInput.publish = true;
    }

    //UnPublish Listing
    unPublishListingHandler() {
        this.appItemForViewDto.published = false;
        this.appItemViewInput.publish = false;
        this.notify.success(this.l("UnPublishedSuccessfully"));
    }

    //Publish Product
    publishProductListHandler() {
        this.appItemForViewDto.published = true;
        this.appItemViewInput.publish = true;
    }
    handleFailedImage($event) {
        $event.target.src = this.defaultLogo;
    }
    addingToList: boolean = false;
    addToListHandler($event) {
        this.addingToList = true;
    }
    addToListDoneOrCanceled($event) {
        this.addingToList = false;
    }
    eventTriggerHandler(
        $event: ActionsMenuEventEmitter<AppItemBrowseEvents, number>
    ) {
        switch ($event.event) {
            case AppItemBrowseEvents.Edit:
                this.editItemHandler();
                break;
            case AppItemBrowseEvents.EditListing:
                this.editListingHandler();
                break;
            case AppItemBrowseEvents.Delete:
                this.deleteItemHandler();
                break;
            case AppItemBrowseEvents.CreateListing:
                this.createListingHandler();
                break;
            case AppItemBrowseEvents.PublishProductList:
                this.publishProductListHandler();
                break;
            case AppItemBrowseEvents.PublishListing:
                this.publishListingHandler();
                break;
            case AppItemBrowseEvents.UnPublishListing:
                this.unPublishListingHandler();
                break;
            case AppItemBrowseEvents.AddToList:
                this.addToListHandler($event.data);
                break;
            default:
                break;
        }
    }
    showAdvancedPricingModal() {
        this.showAdvancedPricing = true;
    }
    hideAdvancedPricingModal() {
        this.showAdvancedPricing = false;
    }
    level: string;
    currencyId: number;
    prices: AppItemAttributePriceDto[];
    filterPricing() {
        const currentCurrency = this.currencies.filter(
            (item) => item.value == this.currencyId
        )[0];
        const attributeId =
            this.appItemForViewDto.variations[0]?.extraAttributeId;
        if (attributeId && currentCurrency) {
            this._appItemsServiceProxy
                .getAppItemPrice(
                    this.productId,
                    this.level,
                    currentCurrency.code,
                    attributeId,
                    this.selectedValuesName
                )
                .subscribe((result) => {
                    this.prices = result;
                });
        } else {
            this.parentProductPriceIndex =
                this._pricingHelpersService.getPricingIndex(
                    this.appItemForViewDto.appItemPriceInfos,
                    this.level,
                    this.currencyId
                );
        }
    }
    parentProductPriceIndex: number = -1;
    levels: SelectItem[] = [];
    currencies: CurrencyInfoDto[] = [];
    initPricingNeededData() {
        this.appItemForViewDto.appItemPriceInfos.forEach((priceDto) => {
            const currencyId = priceDto.currencyId;
            const alreadyAdded: boolean =
                this.currencies.findIndex((item) => item.value == currencyId) >
                -1;
            let currency = new CurrencyInfoDto({
                label: `${priceDto.currencyName}`,
                code: priceDto.currencyCode,
                symbol: priceDto.currencySymbol,
                value: priceDto.currencyId,
                isHostRecord: undefined,
                stockAvailability: undefined,
            });
            if (currency.symbol) currency.label += ` ${currency.symbol}`;
            if (currency && !alreadyAdded) {
                this.currencies.push(currency);
            }
        });
        this.currencyId = this.tenantDefaultCurrency.value;
        this.level = this._pricingHelpersService.defaultLevel;
        // currencies
        this.levels = [
            {
                label: this._pricingHelpersService.defaultLevel,
                value: this._pricingHelpersService.defaultLevel,
            },
            ...this._pricingHelpersService.levels.map((item) => {
                return {
                    label: item,
                    value: item,
                };
            }),
        ];
    }
    showSizeRatio() {}

    openShareProductListingModal() {
        console.log(">> listing");
        const listingId: number = this.productId;
        const alreadyPublished: boolean = false;
        const successCallBack = () => {
            this.notify.success(this.l("PublishedSuccessfully"));
            // this.eventTriggered.emit({
            //     event: AppItemBrowseEvents.PublishListing,
            //     data: true,
            // });
        };
        this._publishAppItemListingService.openProductListingSharingModal(
            alreadyPublished,
            listingId,
            successCallBack
        );
        this._publishAppItemListingService.subscribersNumber =
            this.appItemForViewDto.numberOfSubscribers;
        this._publishAppItemListingService.productId = this.productId;
        this._publishAppItemListingService.screen = 1
    }
    btnLoader: boolean = false;
    syncProduct() {
        this.btnLoader = true;
       // T-SII-20230917.0005
       // const timeZoneOffset = new Date().getTimezoneOffset();
        const timeZoneValue=  Intl.DateTimeFormat().resolvedOptions().timeZone ;
        this._appItemsServiceProxy
            .syncProduct(this.productId)
            .pipe(finalize(() => (this.btnLoader = false)))
            .subscribe((res: any) => {
                this._appItemsServiceProxy
            .getAppItemForView(
                undefined,
                0,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                timeZoneValue,
                this.productId,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                0,
                10
            )
            .pipe(
                finalize(() => {
                    this.hideMainSpinner();
                    this.notify.success(this.l("Product sync Successfully"));
                })
            )
            .subscribe((result) => {
                console.log(">>",result.appItem)
                this.appItemForViewDto.showSync = result.appItem.showSync
            })
            });
    }

    getTimezoneOffset() {
        this.timezoneOffset = new Date().getTimezoneOffset();
    }
}
