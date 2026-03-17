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
    AppItemLookupDto,
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
import { DomSanitizer } from "@node_modules/@angular/platform-browser";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

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
    @Input() tenantOwner
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

    //RelatedItems
    showMoreRelatedItems: boolean = false;
    showLessRelatedItems: boolean = false;
    totalRelatedItems: number;
    noOfRelatedItemsToShowInitially: number;
    maxRelatedItemsCount: number;
    skipRelatedItemsCount: number;
    relatedItemsToLoad: number;
    initRelatedItems: AppItemLookupDto[] = [];
    scrollRelatedItems: boolean = false;
    maxRelatedItemsCnt: number;

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
    priceHasSamePrices:boolean=true;
    priceCellesCount:any=0;
    centerImage: AppEntityAttachmentDto = null;
    /*  showProductAttachment: boolean = true; */
    selectedValuesName: string = "";

    defaultLogo =
        AppConsts.appBaseUrl + "/assets/placeholders/appitem-placeholder.png";

    defaultCurrencyMSRPPriceIndex = -1;
    showAdvancedPricing: boolean = false;

    display: boolean = false;
    timezoneOffset: number;

    acceptedAspectRatio;
    languageSettingName  =AppConsts.languageSettingName;
    pdfCache: { [key: string]: string } = {};

    activeAttachments: AppEntityAttachmentDto[] = [];
currentIndex = 0;

pdfThumbMap: Record<number, string | null> = {};
pdfThumbLoadingMap: Record<number, boolean> = {};
private pdfThumbByPath: Record<string, string> = {};

showImagePreview = false;
previewImageUrl = '';

    public constructor(
        private _router: Router,
        private _appItemsServiceProxy: AppItemsServiceProxy,
        private appSizeScaleServiceProxy: AppSizeScaleServiceProxy,
        private _pricingHelpersService: PricingHelpersService,
        injector: Injector,
        _location: Location,
        public _publishAppItemListingService: PublishAppItemListingService,
        private datePipe: DatePipe,
        private sanitizer: DomSanitizer
    ) {
        super(injector, _location);
        (pdfjsLib as any).GlobalWorkerOptions.workerSrc = '/assets/pdfjs/pdf.worker.min.js';
        this.getAspectatio();
    }


    getAspectatio() {
        let sycAttachmentCategoryImage;
        this.getSycAttachmentCategoriesByCodes(['LOGO', "BANNER", "IMAGE"]).subscribe((result) => {
            result.forEach(item => {
                if (item.code == "IMAGE") {
                    sycAttachmentCategoryImage = item
                    let [width, height, border] = sycAttachmentCategoryImage.aspectRatio.split(':')
                    this.acceptedAspectRatio = Number(width) / Number(height);
                    return;
                }
            });
        });
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
        if (this.appItemForViewDto?.variations.length == 0){
            this.centerImage = this.appItemForViewDto.entityAttachments[0];

            this.setActiveAttachments(this.appItemForViewDto.entityAttachments);

        }
        
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
        if (this.appItemForViewDto?.variations.length == 0) {
            this.centerImage = this.appItemForViewDto.entityAttachments[0];
            this.setActiveAttachments(this.appItemForViewDto.entityAttachments);

        }
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
        img.isImageFile =false;
        img.isPdfFile =false;
        img.isVideoFile =false;

        if(this.isPdfFile(img.fileName)){
            img.isPdfFile =true;
          this.loadPdfFromUrl(img);
        }

         else if(this.isVideoFile(img.fileName))
            img.isVideoFile =true;

            else 
            img.isImageFile =true;

        this.centerImage = img;
    }

   
    loadPdfFromUrl(img) {
       let  pdfPath: string =  img.url;
       let fullUrl= this.attachmentBaseUrl + '/'+pdfPath;
        if (this.pdfCache[pdfPath]) {
          const pdfViewer = document.getElementById('pdfViewer') as HTMLIFrameElement;
          pdfViewer.src = this.pdfCache[pdfPath];
          img.loadingError = false;
          return;
        }
        img.loadingError = true;
        this.showMainSpinner();
       const subs = this._appItemsServiceProxy.getFile64FromUrl(fullUrl)
          .pipe(finalize(() => this.hideMainSpinner()))
          .subscribe(
            async (res) => {
              try {
                const base64 = res.includes(',') ? res.split(',')[1] : res;
                const byteCharacters = atob(base64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                  byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const pdfUrl = URL.createObjectURL(blob);
                this.pdfCache[pdfPath] = pdfUrl;
      
                const pdfViewer = document.getElementById('pdfViewer') as HTMLIFrameElement;
                pdfViewer.src = pdfUrl;
                img.loadingError = false;
              } catch (error) {
                console.error('Error processing PDF:', error);
                img.loadingError = true;
              }
            },
            (error) => {
              console.error('Error loading PDF:', error);
              img.loadingError = true;
            }
          );
      }
      
    // showImagesOfVaritaionSelectedValues(img: any) {
    //     this.varitaionSelectedIndex =
    //         this.appItemForViewDto.variations[0].selectedValues.indexOf(img);
    //     /* this.showProductAttachment = false; */
    //     this.centerImage = null;
    //     if (
    //         !this.appItemForViewDto.variations[0].selectedValues[
    //             this.varitaionSelectedIndex
    //         ].entityAttachments ||
    //         this.appItemForViewDto.variations[0].selectedValues[
    //             this.varitaionSelectedIndex
    //         ].entityAttachments.length == 0
    //     ) {
    //         // get attachment
    //         this._appItemsServiceProxy
    //             .getFirstAttributeAttachments(
    //                 this.productId,
    //                 this.appItemForViewDto.variations[0].extraAttributeId,
    //                 this.appItemForViewDto.variations[0].selectedValues[
    //                     this.varitaionSelectedIndex
    //                 ].value
    //             )
    //             .subscribe((res) => {
    //                 this.appItemForViewDto.variations[0].selectedValues[
    //                     this.varitaionSelectedIndex
    //                 ].entityAttachments = res;

    //                 this.setVariationsRelatedValues();
    //                 this.setActiveAttachments(
    //                     this.appItemForViewDto.variations[0].selectedValues[this.varitaionSelectedIndex].entityAttachments
    //                   );
                      
    //             });
    //     } else this.setVariationsRelatedValues();
    // }

    showImagesOfVaritaionSelectedValues(img: any) {
        this.varitaionSelectedIndex =
          this.appItemForViewDto.variations[0].selectedValues.indexOf(img);
      
        const selected =
          this.appItemForViewDto.variations[0].selectedValues[this.varitaionSelectedIndex];
      
        // const afterSet = () => {
       

        //     if(selected.entityAttachments?.length){
        //         this.setActiveAttachments(this.appItemForViewDto?.entityAttachments);

        //     }else {
        //   this.setActiveAttachments(selected.entityAttachments);

        //     }
      
         
        // //   this.centerImage = this.activeAttachments?.[this.currentIndex] ?? null;
      
      
        //   if (this.centerImage) {
        //     this.centerImage.isPdfFile = this.kindOf(this.centerImage) === 'pdf';
        //     this.centerImage.isVideoFile = this.kindOf(this.centerImage) === 'video';
        //     this.centerImage.isImageFile = this.kindOf(this.centerImage) === 'image';
        //   }
      
        //   this.selectedValuesName = selected.value;
        //   this.filterPricing();
        // };
      
        const afterSet = () => {
            const colorAttachments = selected.entityAttachments ?? [];
            const fallback = this.appItemForViewDto?.entityAttachments ?? [];
          
            const listToShow = colorAttachments.length ? colorAttachments : fallback;
          
            this.setActiveAttachments(listToShow);
          
            this.selectedValuesName = selected.value;
            this.filterPricing();
          };
          
        if (!selected.entityAttachments || selected.entityAttachments.length === 0) {
          this._appItemsServiceProxy
            .getFirstAttributeAttachments(
              this.productId,
              this.appItemForViewDto.variations[0].extraAttributeId,
              selected.value
            )
            .subscribe((res) => {
              selected.entityAttachments = res ?? [];
              afterSet(); 
            });
        } else {
          afterSet();
        }
      }
      
    setVariationsRelatedValues() {
        let img= this.appItemForViewDto.variations[0].selectedValues[
            this.varitaionSelectedIndex
        ].entityAttachments[0] ;

        this.centerImage =
          img ?  img :  this.appItemForViewDto.entityAttachments.find(x=>x.isDefault);

            if(this.isPdfFile( this.centerImage?.fileName))
                this.centerImage.isPdfFile =true;
    
             else if(this.isVideoFile( this.centerImage?.fileName))
                this.centerImage.isVideoFile =true;
    
                else 
                this.centerImage.isImageFile =true;

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


    //Related items
    initRelatedItemsVariables(firstInit: boolean) {
       if (firstInit)
           this.initRelatedItems = this.appItemForViewDto.relatedAppItems.items;
       else
           this.appItemForViewDto.relatedAppItems.items =this.initRelatedItems;
        this.noOfRelatedItemsToShowInitially = 10;
        this.maxRelatedItemsCount = 10;
        this.scrollRelatedItems = false;
        this.maxRelatedItemsCnt = 40;
        this.relatedItemsToLoad = 20;
        this.totalRelatedItems =
            this.appItemForViewDto.relatedAppItems.totalCount;
        if (this.noOfRelatedItemsToShowInitially < this.totalRelatedItems)
            this.showMoreRelatedItems= true;
        else this.showMoreRelatedItems = false;
        this.showLessRelatedItems = false;
    }

    showRelatedItems() {
        if (this.noOfRelatedItemsToShowInitially < this.totalRelatedItems) {
            this.maxRelatedItemsCount = this.relatedItemsToLoad;
            this.skipRelatedItemsCount =
                this.noOfRelatedItemsToShowInitially;
            this.noOfRelatedItemsToShowInitially += this.relatedItemsToLoad;

        
                this._appItemsServiceProxy
                .getAppItemRelatedProductsWithPaging(
                   undefined,
                   undefined,
                   undefined,
                   undefined,
                   undefined,
                   undefined,
                   undefined,
                   undefined,
                    undefined,
                    this.appItemForViewDto.entityId,
                    undefined,
                    undefined,
                    undefined,
                    this.skipClassificationCount,
                    this.maxClassificationCount
                )
                .subscribe((res) => {
                    if (
                        this.noOfRelatedItemsToShowInitially >=
                        this.totalRelatedItems
                    ) {
                        this.showMoreRelatedItems = false;
                        this.showLessRelatedItems = true;
                    }

                    this.appItemForViewDto.relatedAppItems.items =
                        this.appItemForViewDto.relatedAppItems.items.concat(
                            res.items
                        );
                    if (
                        this.appItemForViewDto.relatedAppItems.items
                            .length >= this.maxRelatedItemsCnt
                    )
                        this.scrollRelatedItems= true;
                });
        } else {
            this.initRelatedItemsVariables(false);
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
        let fileName =  $event.target.src?.split('/').pop();
         if(this.isPdfFile(fileName))
            $event.target.src ="/assets/Items/pdf-Icon.png" ; 

         else if(this.isVideoFile(fileName))
            $event.target.src ="/assets/Items/video-Icon.png" ; 

            else 
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
                    this.prices?.forEach((item)=>{
                     if(item.price!==this.prices[0].price)this.priceHasSamePrices=false;
                    })
                    if(this.priceCellesCount.length>4){
                        this.priceCellesCount=Math.ceil(this.priceCellesCount.length/4);
                    }else{
                        this.priceCellesCount=1;
                    }
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
                hexaCode:undefined,
                image:undefined,
                status:undefined,
                entityObjectStatusId:undefined
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
        const alreadyPublished: boolean = true;
        const successCallBack = () => {
            this.notify.success(this.l("PublishedSuccessfully"));
            // this.eventTriggered.emit({
            //     event: AppItemBrowseEvents.PublishListing,
            //     data: true,
            // });
        };
        const optinalData="mai";
        this._publishAppItemListingService.openProductListingSharingModal(
            alreadyPublished,
            listingId,
            successCallBack,
            optinalData
        );
        this._publishAppItemListingService.subscribersNumber =
            this.appItemForViewDto.numberOfSubscribers;
            this._publishAppItemListingService.sharingLevel =
            this.appItemForViewDto.sharingLevel;
            this._publishAppItemListingService.itemSharing =
            this.appItemForViewDto.itemSharing;
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
                undefined,
                10,
                undefined, //item ssin
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

    private setActiveAttachments(list: AppEntityAttachmentDto[] | null | undefined) {
        this.activeAttachments = (list ?? []).filter(x => !!x?.url);

        // if (!this.activeAttachments.length) {
        //   this.currentIndex = 0;
        //   this.centerImage = null;
        //   return;
        // }
      
        const imgIndex = this.activeAttachments.findIndex(x => this.kindOf(x) === 'image');
        this.currentIndex = imgIndex >= 0 ? imgIndex : 0;
      
        this.preloadVisiblePdfThumbs();
        this.preparePdfThumbIfNeeded(this.currentIndex);
      }
      
      
    getUrl(a: any): string {
        const url = (a?.url ?? '').trim();
        if (!url) return '';
        if (/^https?:\/\//i.test(url)) return url;
        return `${this.attachmentBaseUrl.replace(/\/$/,'')}/${url.replace(/^\//,'')}`;
      }
      
   
      
      kindOf(a: any): any {
        const mime = (a?.mimeType ?? '').toLowerCase();
        const url = (a?.url ?? '').toLowerCase();
        const file = (a?.fileName ?? '').toLowerCase();
      
        if (mime.startsWith('image/')) return 'image';
        if (mime.startsWith('video/')) return 'video';
        if (mime === 'application/pdf') return 'pdf';
      
        const target = url || file;
        if (/\.(jpe?g|png|webp|gif|svg)$/.test(target)) return 'image';
        if (/\.(mp4|webm|ogg)$/.test(target)) return 'video';
        if (/\.pdf$/.test(target)) return 'pdf';
      
        return 'other';
      }
      
      setMain(i: number) {
        this.currentIndex = i;
        this.preparePdfThumbIfNeeded(i);
      }
      private async buildPdfThumbFromBlob(blob: Blob, targetWidth = 520): Promise<string> {
        const ab = await blob.arrayBuffer();
        const loadingTask = (pdfjsLib as any).getDocument({ data: new Uint8Array(ab) });
        const pdf = await loadingTask.promise;
        const page1 = await pdf.getPage(1);
      
        const viewport1 = page1.getViewport({ scale: 1 });
        const scale = targetWidth / viewport1.width;
        const viewport = page1.getViewport({ scale });
      
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
      
        await page1.render({ canvasContext: ctx, viewport }).promise;
      
        page1.cleanup?.();
        pdf.destroy?.();
      
        return canvas.toDataURL('image/png');
      }
      
      private async preparePdfThumbIfNeeded(index: number) {
        const item = this.activeAttachments?.[index];
        if (!item || this.kindOf(item) !== 'pdf') {
          this.pdfThumbMap[index] = null;
          this.pdfThumbLoadingMap[index] = false;
          return;
        }
      
        const path = (item.url ?? item.fileName ?? '').trim();
        if (!path) return;
      
        if (this.pdfThumbByPath[path]) {
          this.pdfThumbMap[index] = this.pdfThumbByPath[path];
          this.pdfThumbLoadingMap[index] = false;
          return;
        }
      
        this.pdfThumbLoadingMap[index] = true;
      
        try {
          const fullUrl = this.getUrl(item);
          const res = await this._appItemsServiceProxy.getFile64FromUrl(fullUrl).toPromise();
      
          const base64 = (res && typeof res === 'string' && res.includes(',')) ? res.split(',')[1] : res;
          const byteChars = atob(base64);
          const byteNumbers = new Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
      
          const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' });
          const thumb = await this.buildPdfThumbFromBlob(blob, 520);
      
          this.pdfThumbByPath[path] = thumb;
          this.pdfThumbMap[index] = thumb;
        } catch {
          this.pdfThumbMap[index] = null;
        } finally {
          this.pdfThumbLoadingMap[index] = false;
        }
      }
      
      private preloadVisiblePdfThumbs() {
        const visible = Math.min(this.activeAttachments.length, 7);
        for (let i = 0; i < visible; i++) {
          if (this.kindOf(this.activeAttachments[i]) === 'pdf') {
            this.preparePdfThumbIfNeeded(i);
          }
        }
      }
      openNewTab(item: any) {
        window.open(this.getUrl(item), '_blank', 'noopener');
      }
      openImagePreview(url: string) {
        if (!url) return;
        this.previewImageUrl = url;
        this.showImagePreview = true;
      }
      onThumbError(ev: any, item: any) {
        const kind = this.kindOf(item);
        if (kind === 'pdf') ev.target.src = '/assets/Items/pdf-Icon.png';
        else if (kind === 'video') ev.target.src = '/assets/Items/video-Icon.png';
        else ev.target.src = this.defaultLogo;
      }
      
      onMainError(ev: any) {
        ev.target.src = this.defaultLogo;
      }
                              
      
}
