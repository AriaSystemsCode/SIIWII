import {
  Component, EventEmitter, Injector, OnInit, Output, ViewChild
  , ViewChildren, QueryList, ViewContainerRef, ComponentFactoryResolver,
} from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppEntitiesServiceProxy, AppMarketplaceItemsServiceProxy, AppTransactionServiceProxy, CurrencyInfoDto, GetAccountInformationOutputDto, GetAllEntityObjectTypeOutput, GetAppMarketItemForViewDto, GetAppMarketplaceItemDetailForViewDto, GetAppTransactionsForViewDto, GetOrderDetailsForViewDto, LookupLabelDto, PagedResultDtoOfGetAccountInformationOutputDto, SycEntityObjectTypesServiceProxy, TenantTransactionInfo, TransactionPosition, TransactionType, ValidateTransaction } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SelectItem } from 'primeng/api';
import Swal from 'sweetalert2';
import { TreeNode } from 'primeng/api';
import { Router } from '@angular/router';
import { TransactionCartMode } from "../../../enums/TransactionCartMode";
import { UserClickService } from '@shared/utils/user-click.service';
import { filter, finalize, Observable, switchMap, take, timeout, timer } from 'rxjs';
import { CommentParentComponent } from '@app/main/interactions/components/comment-parent/comment-parent.component';
import { ProductCatalogueReportParams } from '@app/main/app-items/appitems-catalogue-report/models/product-Catalogue-Report-Params';
import { ReportViewerComponent } from '@app/main/dev-express-demo/reportviewer/report-viewer.component';
import { AppConsts } from '@shared/AppConsts';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { CreateEditAppItemExtraAttribute } from '@app/main/app-items/app-item-shared/models/create-edit-app-item-extra-attribute';
import { EExtraAttributeUsage } from '@app/main/app-items/appItems/models/extra-attribute-usage.enum';
import { FilteredExtraAttribute } from '@app/main/app-items/app-item-shared/models/filtered-extra-attribute';
import { ExtraAttributeDataService } from '@app/main/app-items/app-item-shared/services/extra-attribute-data.service';
import { TransactionCartoccordionTabs } from '../../../enums/TransactionCartoccordionTabs';

@Component({
  selector: 'app-transaction-information',
  templateUrl: './transaction-information.component.html',
  styleUrls: ['./transaction-information.component.scss'],
  providers: [AppMarketplaceItemsServiceProxy]
})
export class TransactionInformationComponent
  extends AppComponentBase
  implements OnInit {
  @ViewChild('reportViewerContainer', { read: ViewContainerRef }) reportViewerContainer: ViewContainerRef;
  @ViewChild("shoppingCartModal", { static: true }) modal: ModalDirective;
  // @ViewChildren(CommentParentComponent) commentParentComponent!: QueryList<CommentParentComponent>;
  @ViewChild('desktopComments') desktopComments!: CommentParentComponent;
@ViewChild('mobileComments') mobileComments!: CommentParentComponent;

  @Output("hideShoppingCartModal") hideShoppingCartModal: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Output("refreshReport") refreshReport: EventEmitter<boolean> = new EventEmitter<boolean>()

  orderInfoValid: boolean = false;
  buyerContactInfoValid = false;
  SellerContactInfoValid = false;
  SalesRepInfoValid = false;
  shippingInfOValid = false;
  BillingInfoValid = false;
  createOrEditorderInfo: boolean = true;
  createOrEditbuyerContactInfo: boolean = true;
  createOrEditSellerContactInfo: boolean = true;
  createOrEditSalesRepInfo: boolean = true;
  createOrEditshippingInfO: boolean = true;
  createOrEditBillingInfo: boolean = true;
  createOrEditExtraData: boolean = true;
  loadNotesComp: boolean = false;
  productCode;
  colorFilter;
  colors: SelectItem[] = [];
  sizeFilter;
  sizes: SelectItem[] = [];
  showVariations: boolean = false;
  validateOrder: boolean = false;
  orderId: number = 0;
  cols!: any[];
  shoppingCartDetails: GetOrderDetailsForViewDto;
  shoppingCartTreeNodes!: TreeNode[];
  transactionCartMode: TransactionCartMode;
  _transactionCartMode = TransactionCartMode;
  showTabs: boolean = false;
  transactionType: string = "";
  appTransactionsForViewDto: GetAppTransactionsForViewDto;
  showCarousel: boolean = false;
  transactionPosition = TransactionPosition;
  activeIndex;
  showSaveBtn: boolean = false;
  currencySymbol: string = "";
  transactionCode: string = "";
  transactionFormPath: string = "";
  _transactionFormPath: string = "";
  onshare: boolean = false;
  printInfoParam: ProductCatalogueReportParams = new ProductCatalogueReportParams();
  reportUrl: string = "";
  invokeAction = '/DXXRDV';
  isOwnedByMe: boolean = true;
  canChange: boolean = true;
  companeyNames: GetAccountInformationOutputDto[];
  currentTab: number
  shareDone: boolean = false;
  temp: TreeNode<any>[] = null;
  addLine: boolean = true;
  visible: boolean = false
  allVariations: GetAppMarketItemForViewDto[] = [];
  displayedVariations: any[] = [];
  incrementCount: number = 10;
  totalVariationsCount: number = 0;
  selectedVariation: string = '';
  showAddLine: boolean = false
  cancelBtn: boolean = false;
  saveBtn: boolean = false;
  SuccessMsg: boolean = false;
  addNewLinebtn: boolean = true;
  filterForm: FormGroup;
  comNew: boolean
  conNew: boolean
  TempComp: boolean = false
  currentFilter: string = '';
  regenrate: boolean = false
  syncMsg: boolean = false
  mainLoad: boolean = false
  productDetails: any;
  colorsData: any[];
  updatedSpecialPrice: number = 0;
  filteredColors: any[] = [];
  showEditSpecialPrice: boolean = true;
  orderType: any
  selectedColorName: any
  selectedColorImg: any
  selectedColorCode: any
  chk_Order_by_prepack: boolean[] = []
  currentIndex: number = 0;
  displayProductdata: boolean = false
  displayColordata: boolean = false
  displaysizesdata: boolean = false
  visibleSP: boolean = false
  selectedMainImgProduct: any
  orderSummary: any = [];
  sycAttachmentCategoryImage: any
  acceptedAspectRatio: any
  selectedTransactionTypeData: GetAllEntityObjectTypeOutput = new GetAllEntityObjectTypeOutput();
  selectedTransTypeData: any
  extraAttributes: any;
  totalOrderQTY: number = 0;
  totlaOrderPrices: number = 0;
  priceLevel: any
  languageSettingName = AppConsts.languageSettingName;
  currentLang: string
  isArabic: boolean
  transactionSharing: string = "";
  isAuthenticated = this.appSession?.user
  orderAmount:number =0;
  totalCharges:number =0;
  mobileTab: 'details' | 'summary' | 'chats' | 'actions' = 'details';
  constructor(
    injector: Injector,
    private _AppTransactionServiceProxy: AppTransactionServiceProxy,
    private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
    private userClickService: UserClickService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private router: Router,
    private _formBuilder: FormBuilder,
    private _AppMarketplaceItemsServiceProxy: AppMarketplaceItemsServiceProxy,
    private _sycEntityObjectTypesServiceProxy: SycEntityObjectTypesServiceProxy,
    private _extraAttributeDataService: ExtraAttributeDataService,
  ) {
    super(injector);
    this.priceLevel = localStorage.getItem("tempPriceLevel");

  }
  ngOnInit(): void {
    this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
    this.currentLang == 'ar' || this.currentLang == 'ar-EG' ? this.isArabic = true : this.isArabic = false
    this.defineExtraAttributes();

    this.initFilterForm()
    this.calcHight()

    let CompanyCheck = localStorage.getItem("comNew");

    if (CompanyCheck) {
      this.comNew = Boolean((CompanyCheck));
    } else {
      this.comNew = false
    }
    let ContactCheck = localStorage.getItem("conNew");
    if (ContactCheck) {
      this.conNew = Boolean((ContactCheck));
    } else {
      this.conNew = false;

    }


  }
  ngOnChanges() {


  }

  initFilterForm() {
    this.filterForm = this._formBuilder.group({
      selectedVariation: ['', Validators.required],
      updatedSpecialPrice: [null, [Validators.min(0)]],

    });
  }


  handleVarSearch(event: any, dropdown?: any) {
    const filterText = event.filter?.trim();
    this.currentFilter = filterText;
    this.allVariations = [];
    this.displayedVariations = [];

    // Load initial set of items matching the filter
    this.loadMore(new MouseEvent('click'), dropdown, filterText);
  }

  getSellerVariations(
    skipCount: number = 0,
    maxResultCount: number = this.incrementCount,
    filter: string = ''
  ) {

    this._AppMarketplaceItemsServiceProxy
      .getAll(
        this.appTransactionsForViewDto.sellerContactSSIN,
        this.appTransactionsForViewDto.sellerCompanySSIN,
        null,
        null,
        false,
        filter,
        null,
        null,
        null,
        [], // depratment
        null,
        null,
        2,
        false,
        undefined,
        undefined,
        undefined,
        undefined,
        [], // ids
        'USD',
        undefined,
        undefined,
        undefined,
        'name',
        skipCount,
        maxResultCount
      )

      .pipe(finalize(() => {
        this.hideMainSpinner()

      }))
      .subscribe((res) => {
        this.totalVariationsCount = res.totalCount;

        if (filter && skipCount === 0) {
          this.allVariations = res.items;
        } else {
          // Append new items otherwise
          this.allVariations = [...this.allVariations, ...res.items];
        }

        // Update displayed variations
        this.displayedVariations = [...this.allVariations];
      });
  }


  loadMore(event: MouseEvent, dropdown: any, filter: string = '') {
    // Prevent dropdown from closing
    event.stopPropagation();
    const nextSkipCount = this.allVariations.length;
    if (this.displayedVariations.length < this.totalVariationsCount || filter) {
      this.getSellerVariations(nextSkipCount, this.incrementCount, filter);

      // Keep the dropdown open after fetching more items
      setTimeout(() => {
        dropdown.overlayVisible = true;
      }, 0);
    }
  }


  onVariationSelect(event: any) {
    // Reset quantity and price when a new variation is selected  
    this.getProductDetailsForView(event.value.appItem.id)
    this.selectedMainImgProduct = event.value.appItem.imageUrl
    this.displayProductdata = true
    this.displayColordata = false
    this.displaysizesdata = false

  }




  saveVariations() {
    for (let index = 0; index < this.colorsData?.length; index++) {
      if ((this.orderType == 'SO' && this.productDetails?.orderByPrePack && !this.chk_Order_by_prepack[index])) {
        this.productDetails.variations.map((variation: any) => {
          if (variation?.extraAttrName === this.productDetails?.variations[0]?.extraAttrName) {
            let value = variation?.selectedValues[index];
            value.edRestAttributes.forEach((attr) => {
              if (attr.extraAttrName === "SIZE") {
                attr.values.forEach((sizeValue) => {
                  sizeValue.orderedQty = sizeValue.orderedPrePacks;
                  sizeValue.orderedPrePacks = 0;
                });
              }
            });
          }
        });
      }
    }

    let bodyRequest: any = {
      appItem: this.productDetails,
    };
    this.showMainSpinner();
    this._AppTransactionServiceProxy
      .addTransactionDetails(
        this.transactionCode, this.appTransactionsForViewDto.transactionType == 0 ? 'SO' : 'PO',
        bodyRequest
      )
      .pipe(
        finalize(() => {

          this.displayedVariations = []
          this.filteredColors = []
          this.allVariations = [];

        })
      )
      .subscribe((res) => {
        this.displayColordata = false
        this.displayProductdata = false
        this.displaysizesdata = false
        this.addLine = true;
        this.addNewLinebtn = true;
        this.showAddLine = false;
        this.filterForm.reset()
        this.displayedVariations = []
        this.filteredColors = []
        this.allVariations = [];
        this.hideMainSpinner();
        this.getShoppingCartData();
        this.filterForm.controls['selectedVariation'].reset()

      });




  }



  cancelVariationLine() {
    this.displayColordata = false
    this.displayProductdata = false
    this.displaysizesdata = false
    this.addLine = true;
    this.addNewLinebtn = true;
    this.showAddLine = false;
    this.filterForm.reset()
    this.displayedVariations = []
    this.allVariations = []
    this.filteredColors = []
    this.hideMainSpinner();
    this.filterForm.controls['selectedVariation'].reset()

  }

  onEditPrice(rowNode) {
    if (rowNode.node.data.added)
      rowNode.node.data.showEditPrice = false;
    else {
      this.showMainSpinner();
      switch (rowNode.level) {
        case 0:
        case 2:
          this._AppTransactionServiceProxy
            .updatePriceByProductLineId(
              this.orderId,
              rowNode.node.data.lineId,
              rowNode.node.data.updatedPrice
            )
            .subscribe((res) => {
              if (res)
                this.notify.info("Successfully Updated.");
              rowNode.node.data.showEditPrice = false;
              rowNode.node.data.price = rowNode.node.data.updatedPrice;
              this.getShoppingCartData();
              this.hideMainSpinner();
            });
          break;
        case 1:
          this.showMainSpinner();
          this._AppTransactionServiceProxy
            .updatePriceByProductSSINColor(
              this.orderId,
              rowNode.node.data.parentId,
              rowNode.node.data.colorCode,
              rowNode.node.data.colorId,
              rowNode.node.data.updatedPrice
            )
            .subscribe((res) => {
              if (res) this.notify.info("Successfully Updated.");
              rowNode.node.data.showEditPrice = false;
              rowNode.node.data.price = rowNode.node.data.updatedPrice;
              this.getShoppingCartData();
              this.hideMainSpinner();
            });
          break;
        default:
          break;
      }
    }
  }


  getCommentsRefreshed(event) {
    if (event) {
      this.loadCommentsList()
    }
  }
loadCommentsList() {
  setTimeout(() => {
    const target =
      window.innerWidth <= 991 ? this.mobileComments : this.desktopComments;

    target?.show(
      this.appTransactionsForViewDto.creatorUserId,
      this.orderId
    );
  }, 200);
}


  show(orderId: number, showCarousel: boolean = false, validateOrder: boolean = false, transactionCartMode: TransactionCartMode = TransactionCartMode.createOrEdit) {

    this.showMainSpinner();
    if (!(this.companeyNames && this.companeyNames?.length > 0)) {
      this._AppTransactionServiceProxy
        .getRelatedAccounts(
          "",
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
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          0,
          undefined, false, null ,this.appTransactionsForViewDto?.enteredByUserRole
        )
        .subscribe((res2: PagedResultDtoOfGetAccountInformationOutputDto) => {
          this.companeyNames = [...res2.items];
        });
    }


    this.resetData();
    this.orderId = orderId;
    this.loadNotesComp = true;
    this.showCarousel = showCarousel;
    this.validateOrder = validateOrder;
    this.transactionCartMode = 0;

    this.onshare = false;


    if (transactionCartMode == TransactionCartMode.createOrEdit) {
      this.showTabs = false;
      this.createOrEditorderInfo = true;
      this.createOrEditbuyerContactInfo = true;
      this.createOrEditSellerContactInfo = true;
      this.createOrEditSalesRepInfo = true;
      this.createOrEditshippingInfO = true;
      this.createOrEditBillingInfo = true;
      this.createOrEditExtraData = true;
    }
    else {
      this.showTabs = true;
      this.createOrEditorderInfo = false;
      this.createOrEditbuyerContactInfo = false;
      this.createOrEditSellerContactInfo = false;
      this.createOrEditSalesRepInfo = false;
      this.createOrEditshippingInfO = false;
      this.createOrEditBillingInfo = false;
      this.createOrEditExtraData = false;

    }

    this.getColumns();
    this.getShoppingCartData();
  }



  resetData() {
    this.activeIndex = -1;
    this.currentTab = -1;
    this.productCode = undefined;
    this.colorFilter = undefined;
    this.colors = [];
    this.sizeFilter = undefined;
    this.sizes = [];
    this.showVariations = false;
    this.validateOrder = false;
    this.cols = [];
    this.showTabs = false;
    this.createOrEditorderInfo = true;
    this.createOrEditbuyerContactInfo = true;
    this.createOrEditSellerContactInfo = true;
    this.createOrEditSalesRepInfo = true;
    this.createOrEditshippingInfO = true;
    this.createOrEditBillingInfo = true;
    this.createOrEditExtraData = true
    this.appTransactionsForViewDto = null;
  }

  getColumns() {
    this.cols = [
      { field: "image", header: this.l("Image") },
      { field: "manufacturerCode", header: this.l("Code") },
      { field: "name", header: this.l("Name") },
      { field: "qty", header: this.l("Quantity") },
      { field: "price", header: this.l("Price") },
      { field: "amount", header: this.l("Amount") }
    ];
  }

  
  getShoppingCartData(temp: TreeNode<any>[] = null) {

    this.temp = temp;
    this.showMainSpinner();
    this._AppTransactionServiceProxy.getAppTransactionsForView(this.orderId, false, 0, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, false, Intl.DateTimeFormat().resolvedOptions().timeZone, undefined, undefined, 0, 10, this.transactionPosition.Current)
      .pipe(finalize(() => {
        this.hideMainSpinner();
      }))
      .subscribe((res: GetAppTransactionsForViewDto) => {
        res.companeyNames = this.companeyNames;
        this.appTransactionsForViewDto = res;
        (this.appTransactionsForViewDto?.charges || []).forEach(c => {
          c.originalAmount = c.chargeAmount;
        });

        this.totalCharges=this.getTotalCharges();
        this.orderAmount = this.appTransactionsForViewDto.totalAmount - this.totalCharges;
        this.getAppItemTypeExtraAttributesById();


        /// set validations 
        this.orderInfoValid = this.appTransactionsForViewDto.isOrderInformationValid;
        this.buyerContactInfoValid = this.appTransactionsForViewDto.isBuyerContactInformationValid;
        this.SellerContactInfoValid = this.appTransactionsForViewDto.isSellerContactInformationValid;
        this.SalesRepInfoValid = (this.transactionType == "Sales Order" && this.appTransactionsForViewDto?.enteredByUserRole?.toString()?.includes("Independent Sales Rep")) ? this.SalesRepInfoValid : this.appTransactionsForViewDto.isSalesRepInformationValid;
        this.shippingInfOValid = this.appTransactionsForViewDto.isShippingInformationValid;
        this.BillingInfoValid = this.appTransactionsForViewDto.isBillingInformationValid;
        ///
        this.isOwnedByMe = res.isOwnedByMe;
        this.canChange = this.isOwnedByMe
        this.transactionCode = res?.code;
        if (res?.entityAttachments?.length > 0)
          this._transactionFormPath = res?.entityAttachments[0]?.url ? this.attachmentBaseUrl + "/" + res?.entityAttachments[0]?.url : "";
        this.loadCommentsList()

        //Currency
        this._AppEntitiesServiceProxy.getCurrencyInfo(res.currencyCode)
          .subscribe((res: CurrencyInfoDto) => {
            this.currencySymbol = res.symbol ? res.symbol : res.code;
          });

        //

        this.appTransactionsForViewDto?.totalAmount % 1 == 0 ? this.appTransactionsForViewDto.totalAmount = parseFloat(Math.round(this.appTransactionsForViewDto.totalAmount * 100 / 100).toFixed(2)) : null;

        if (res.transactionType == TransactionType.PurchaseOrder)
          this.transactionType = "Purchase Order";

        if (res.transactionType == TransactionType.SalesOrder)
          this.transactionType = "Sales Order";

        this.getLinesData()
        this.modal.hide();
        this.modal.show();
      });

  }

  getLinesData() {
    //lines

    // if ( (this.showTabs ) || (!this.showTabs && this.activeIndex == 0)) {
    this._AppTransactionServiceProxy
      .getOrderDetailsForView(
        this.orderId,
        this.showVariations,
        this.colorFilter,
        this.sizeFilter,
        this.productCode
      )
      .subscribe((res) => {
        this.shoppingCartDetails = res;
        this?.shoppingCartDetails?.totalAmount % 1 == 0 ? this.shoppingCartDetails.totalAmount = parseFloat(Math.round(this.shoppingCartDetails.totalAmount * 100 / 100).toFixed(2)) : null;

        this.userClickService.userClicked("refreshShoppingInfoInTopbar");
        if (res.transactionType == TransactionType.PurchaseOrder)
          this.transactionType = "Purchase Order";

        if (res.transactionType == TransactionType.SalesOrder)
          this.transactionType = "Sales Order";

        this.SalesRepInfoValid = (this.transactionType == "Sales Order" && this.appTransactionsForViewDto?.enteredByUserRole?.toString()?.includes("Independent Sales Rep")) ? this.SalesRepInfoValid : true;


        if (!this.temp) this.shoppingCartTreeNodes = res.detailsView;
        else this.shoppingCartTreeNodes = this.temp;

        this.colors = res.colors;
        this.sizes = res.sizes;
      });
    // }
  }

  // Recursive function to extract only third-level nodes (variations)
  getThirdLevelVariations(node: any, level: number = 1): any[] {
    let variations: any[] = [];

    // If the current node is a third-level node and has no children, add it to the variations
    if (level === 3 && node.children === null) {
      variations.push(node);
    }

    // If the node has children, process them recursively
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        variations = variations.concat(this.getThirdLevelVariations(child, level + 1));
      });
    }

    return variations;
  }

  onShowVariations(event) {
    // Check if shoppingCartTreeNodes is an array

    if (event?.target?.checked) {
      if (Array.isArray(this.shoppingCartTreeNodes)) {
        // Get the third-level variations from the shoppingCartTreeNodes
        const thirdLevelVariations = this.shoppingCartTreeNodes.map((rootNode) => {
          return this.getThirdLevelVariations(rootNode);
        }).flat(); // Flatten the array to get a single list of third-level variations

        this.shoppingCartTreeNodes = thirdLevelVariations

      }
    } else {
      this.getShoppingCartData();
    }

  }


  onContinueShopping() {
    localStorage.removeItem("productFilters");
    if (this.validateOrder && this.shoppingCartTreeNodes)
      this.validateShoppingCart();
    if (this.appTransactionsForViewDto?.sellerCompanySSIN) {
      sessionStorage.setItem(
        "SellerSSIN",
        JSON.stringify(this.appTransactionsForViewDto?.sellerCompanySSIN)
      );
      localStorage.setItem(
        "contactSSIN",
        JSON.stringify(this.appTransactionsForViewDto?.buyerContactSSIN)
      );
      localStorage.setItem(
        "currencyCode",
        JSON.stringify(this.appTransactionsForViewDto?.currencyCode)
      );

      localStorage.setItem(
        "transNO",
        this.appTransactionsForViewDto.code
      );
      localStorage.setItem("fromSellerRoom", JSON.stringify(true));
      localStorage.setItem("fromMarketPlace", JSON.stringify(false));
      // this.router.navigateByUrl("app/main/marketplace/products");
                    localStorage.setItem("transId", JSON.stringify(this.appTransactionsForViewDto?.id));

      if (location.href.toString() == AppConsts.appBaseUrl + "/app/main/marketplace/products")
        location.reload();
      else
        this.router.navigateByUrl("app/main/marketplace/products");
    }

    this.hide();
  }

  validateShoppingCart() {
    this.showMainSpinner();

    this._AppTransactionServiceProxy.validateBuyerSellerTransaction(this.appTransactionsForViewDto?.sellerCompanySSIN, this.appTransactionsForViewDto?.buyerCompanySSIN, this.appTransactionsForViewDto?.transactionType).subscribe((res) => {
      switch (res.validateOrder) {
        case ValidateTransaction.FoundShoppingCart:
          this.hideMainSpinner();
          break;

        case ValidateTransaction.NotFound:
        case ValidateTransaction.NotFoundShoppingCartForTemp:
          this._AppTransactionServiceProxy.setCurrentUserActiveTransaction(this.orderId).subscribe((res) => {
            this.userClickService.userClicked("refreshShoppingInfoInTopbar");
            this.hideMainSpinner();
          });
          break;

        case ValidateTransaction.FoundInAnotherTransaction:
        case ValidateTransaction.FoundShoppingCartForTemp:
          this.hideMainSpinner();
          Swal.fire({
            title: "",
            text: "Conflict between the new order and the active shopping cart order",
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Continue with the Shopping Cart",
            cancelButtonText: "Continue with the new order",
            allowOutsideClick: false,
            allowEscapeKey: false,
            backdrop: true,
            customClass: {
              popup: 'popup-class',
              icon: 'icon-class',
              content: 'content-class',
              actions: 'actions-class',
              confirmButton: 'confirm-button-class2',

            },
          }).then((result) => {
            if (result.isConfirmed) {
              this.hideMainSpinner();
            }
            else {
              this._AppTransactionServiceProxy.setCurrentUserActiveTransaction(this.orderId).subscribe((res) => {
                this.userClickService.userClicked("refreshShoppingInfoInTopbar");
                this.hideMainSpinner();
              });
            }
          });
          break;

        case ValidateTransaction.FoundInAnotherTransaction:
          this.hideMainSpinner();
          Swal.fire({
            title: "",
            text: "Conflict between the new order and the active shopping cart order",
            icon: "info",
            showCancelButton: true,
            confirmButtonText:
              "Continue with the Shopping Cart",
            cancelButtonText: "Continue with the new order",
            allowOutsideClick: false,
            allowEscapeKey: false,
            backdrop: true,
            customClass: {
              popup: "popup-class",
              icon: "icon-class",
              content: "content-class",
              actions: "actions-class",
              confirmButton: "confirm-button-class2",
            },
          }).then((result) => {
            if (result.isConfirmed) {
              this.hideMainSpinner();
            } else {
              this._AppTransactionServiceProxy
                .setCurrentUserActiveTransaction(
                  this.orderId
                )
                .subscribe((res) => {
                  this.hideMainSpinner();
                });
            }
          });
          break;
        default:
          this.hideMainSpinner();
          break;
      }
    });
  }
  onDelete(rowNode) {
    if (rowNode?.node?.data?.added) {
      Swal.fire({
        title: "Remove",
        text: "Are you sure you want to permanently remove this ?",
        showCancelButton: true,
        cancelButtonText: "No",
        imageUrl: "../../../assets/posts/deletePost.svg",
        imageWidth: 70,
        imageHeight: 70,
        confirmButtonText: "Yes",
        allowOutsideClick: false,
        allowEscapeKey: false,
        backdrop: true,
        customClass: {
          confirmButton: "swal-btn swal-confirm bgPurple",
          cancelButton: "swal-btn",
          title: "swal-title purpleColor",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.addLine = true
          this.showAddLine = false;


          this.selectedVariation = '';
          this.addNewLinebtn = true

        }
      });
    } else {
      Swal.fire({
        title: "Remove",
        text: "Are you sure you want to permanently remove this ?",
        showCancelButton: true,
        cancelButtonText: "No",
        imageUrl: "../../../assets/posts/deletePost.svg",
        imageWidth: 70,
        imageHeight: 70,
        confirmButtonText: "Yes",
        allowOutsideClick: false,
        allowEscapeKey: false,
        backdrop: true,
        customClass: {
          confirmButton: "swal-btn swal-confirm bgPurple",
          cancelButton: "swal-btn",
          title: "swal-title purpleColor",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.showMainSpinner();
          switch (rowNode.level) {
            case 0:
              this._AppTransactionServiceProxy
                .deleteByProductSSIN(
                  this.orderId,
                  rowNode.node.data.lineId
                )
                .subscribe((res) => {
                  if (res)
                    this.notify.info("Successfully deleted.");
                  this.getShoppingCartData();
                  rowNode.node.data.showEditQty = false;
                  this.hideMainSpinner();
                });
              break;

            case 1:
              this._AppTransactionServiceProxy
                .deleteByProductSSINColor(
                  this.orderId,
                  rowNode.node.data.parentId,
                  rowNode.node.data.colorCode,
                  rowNode.node.data.colorId
                )
                .subscribe((res) => {
                  if (res)
                    this.notify.info("Successfully deleted.");
                  this.getShoppingCartData();
                  rowNode.node.data.showEditQty = false;
                  this.hideMainSpinner();
                });
              break;

            case 2:
              this._AppTransactionServiceProxy
                .deleteByProductLineId(
                  this.orderId,
                  rowNode.node.data.lineId
                )
                .subscribe((res) => {
                  if (res)
                    this.notify.info("Successfully deleted.");
                  this.getShoppingCartData();
                  rowNode.node.data.showEditQty = false;
                  this.hideMainSpinner();
                });
              break;

            default:
              break;
          }
        }
      });
    }
  }
  onEditQty(rowNode) {


    if (rowNode.node.data.added) {
      rowNode.node.data.showEditQty = false;

    } else {


      rowNode.node.data.invalidUpdatedQty = "";
      this.showMainSpinner();

      switch (rowNode.level) {
        case 0:
        case 2:
          this._AppTransactionServiceProxy
            .updateByProductLineId(
              this.orderId,
              rowNode.node.data.lineId,
              rowNode.node.data.updatedQty
            )
            .subscribe((res) => {
              if (res) this.notify.info("Successfully Updated.");
              rowNode.node.data.showEditQty = false;
              this.getShoppingCartData();
              this.hideMainSpinner();
            });
          break;

        case 1:
          this.showMainSpinner();

          let moduleQty =
            rowNode.node.data.updatedQty % (
              rowNode.node.data.qty / rowNode.node.data.noOfPrePacks);
          let qty = rowNode.node.data.updatedQty;
          if (moduleQty == 0) {
            this._AppTransactionServiceProxy
              .updateByProductSSINColor(
                this.orderId,
                rowNode.node.data.parentId,
                rowNode.node.data.colorCode,
                rowNode.node.data.colorId,
                qty
              )
              .subscribe((res) => {
                if (res) this.notify.info("Successfully Updated.");
                this.getShoppingCartData();
                this.hideMainSpinner();
              });
          } else {
            rowNode.node.data.invalidUpdatedQty = "The quantity must be divisible by the prepack qty";
            this.hideMainSpinner();
          }

          break;

        default:
          break;


      }
    }
  }
  hide() {

    this.resetData();
    this.modal.hide();
    this.displayColordata = false
    this.displayProductdata = false
    this.displaysizesdata = false
    this.addLine = true;
    this.addNewLinebtn = true;
    this.showAddLine = false;
    this.filterForm.reset()
    this.displayedVariations = []
    this.filteredColors = []
    this.allVariations = [];
    this.filterForm.controls['selectedVariation'].reset()
    let indx = -1;
    indx = this.minimizedOrders?.findIndex(x => x.orderId == this.appTransactionsForViewDto?.id);
    if (indx >= 0)
      this.minimizedOrders.splice(indx, 1);
    this.userClickService.userClicked("refreshShoppingInfoInTopbar");
    this.hideShoppingCartModal.emit(true);

  }

  minimizedOrders: any[] = [];
  minimizeScreen() {
    let indx = -1;
    indx = this.minimizedOrders?.findIndex(x => x.orderId == this.appTransactionsForViewDto?.id);
    if (indx >= 0) {
    }
    else {
      this.minimizedOrders.push({
        orderId: this.appTransactionsForViewDto?.id,
        name: this.appTransactionsForViewDto?.name,
      });
    }
    this.modal.hide();
  }

  maximizeScreen(orderId: number) {
    let indx = -1;
    indx = this.minimizedOrders?.findIndex(x => x.orderId == orderId);
    if (indx >= 0)
      this.minimizedOrders.splice(indx, 1);
    if (this.appTransactionsForViewDto?.entityStatusCode == "DRAFT") {
      this.show(orderId, this.showCarousel, this.validateOrder, TransactionCartMode.createOrEdit);
    } else {
      this.show(orderId, this.showCarousel, this.validateOrder, TransactionCartMode.view);
    }
  }

  onProceedToCheckout() {
    this.showMainSpinner();
    this._AppTransactionServiceProxy.getAppTransactionsForView(this.orderId, false, 0, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, false, undefined, Intl.DateTimeFormat().resolvedOptions().timeZone, undefined, undefined, 0, 10, this.transactionPosition.Current)
      .subscribe((res: GetAppTransactionsForViewDto) => {
        res.companeyNames = this.companeyNames;
        this.appTransactionsForViewDto = res;
        this.hideMainSpinner();
        this.showTabs = true;
      });
  }

  onDiscardShopping() {
    Swal.fire({
      title: "",
      text: "Do you need to discard shopping cart permanently?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText:
        "Yes",
      cancelButtonText: "No",
      allowOutsideClick: false,
      allowEscapeKey: false,
      backdrop: true,
      customClass: {
        popup: "popup-class",
        icon: "icon-class",
        content: "content-class",
        actions: "actions-class",
        confirmButton: "confirm-button-class2",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.showMainSpinner();
        this._AppTransactionServiceProxy.discardTransaction(this.orderId)
          .subscribe(() => {
            this.hideMainSpinner();
            this.removeLocalStorage()
            this.userClickService.userClicked("refreshShoppingInfoInTopbar");
            this.hide();

          });
      }
    });
  }

  cancelOrder() {
    this.showMainSpinner();
    this._AppTransactionServiceProxy.cancelTransaction(this.orderId)
      .subscribe(() => {
        this.removeLocalStorage()
        this.hideMainSpinner();
        this.getShoppingCartData();
      });

  }

  unCancelOrder() {
    this.showMainSpinner();
    this._AppTransactionServiceProxy.unCancelTransaction(this.orderId)
      .subscribe(() => {
        this.hideMainSpinner();
        this.getShoppingCartData();
      });
  }
  isOrderConfirmationNeedsReprint(): void {
    this._AppTransactionServiceProxy.isOrderConfirmationNeedsReprint(this.orderId)
      .subscribe((res) => {
        if (res == true) {
          this.regenrate = true;
          this.mainLoad = false

          this.onGeneratOrderReport(true, undefined, true, true)
          this.getOrderConfirmation();
        } else {
          this.regenrate = false;

          this.mainLoad = true
        }
      });
  }
  stopReport(event) {

    if (event) {
      this.regenrate = false
    }


  }
  PlaceOrder() {

    this.showMainSpinner();

    this.saveDates()
    this.appTransactionsForViewDto.lFromPlaceOrder = true;
    this.appTransactionsForViewDto.timeZoneValue = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this._AppTransactionServiceProxy.createOrEditTransaction(this.appTransactionsForViewDto)
      .pipe(finalize(() => {

        this.onGeneratOrderReport(true, undefined, true, true);
        this.removeLocalStorage()
        this.show(this.orderId, this.showCarousel, this.validateOrder, this._transactionCartMode.view);
        this.getShoppingCartData()



      }
      ))
      .subscribe((res) => {

        if (res) {
          this.getShoppingCartData()

          this.hideMainSpinner();

          this.visible = false
          this.SuccessMsg = true

        }
      });
  }


  askForShareTransactions() {
    this._AppEntitiesServiceProxy
      .getTenantSettingValue(1301, null)
      .subscribe((res: any) => {
        this.transactionSharing = res?.toString().toLowerCase();

        switch (this.transactionSharing.toString().toLowerCase()) {
          case 'manual':
            break;

          case 'automatic':
            this.automaticShare();
            break;

          case 'inquire':
            Swal.fire({
              title: "",
              text: "Would you like to share the transaction with the other partner or not?",
              icon: "question",
              showCancelButton: true,
              confirmButtonText: "Share Now",
              cancelButtonText: "Cancel",
              allowOutsideClick: false,
              allowEscapeKey: false,
              backdrop: true,
              customClass: {
                popup: 'popup-class',
                icon: 'icon-class',
                content: 'content-class',
                actions: 'actions-class',
                confirmButton: 'confirm-button-class2',
              },
            }).then((result) => {
              if (result.isConfirmed) {
                this.onShareTransaction();
              }
            })
            break;

          default:
            break;
        }
      });
  }
  sync() {
    this.showMainSpinner();
    this._AppTransactionServiceProxy.syncTransaction(this.orderId)
      .pipe(finalize(() => {
        this.hideMainSpinner()
        this.getShoppingCartData();
        this.syncMsg = true

      }))
      .subscribe((res) => {

      });

  }
  goPrevious_Next_Transaction(transactionPosition: TransactionPosition) {
    this.showMainSpinner();
    this._AppTransactionServiceProxy.getAppTransactionsForView(this.orderId, false, 0, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, false, undefined, Intl.DateTimeFormat().resolvedOptions().timeZone, undefined, undefined, 0, 1, transactionPosition)
      .pipe(finalize(() => this.hideMainSpinner()))
      .subscribe((res1: GetAppTransactionsForViewDto) => {

        if (res1) {

          if (res1?.entityStatusCode?.toUpperCase() != "DRAFT") {
            this.show(res1.id, this.showCarousel, this.validateOrder, TransactionCartMode.view);


          } else {
            this.show(res1.id, this.showCarousel, this.validateOrder, TransactionCartMode.createOrEdit);

          }
        }


      });
  }

  ontabInfoValid(activetab) {

    switch (activetab) {
      case TransactionCartoccordionTabs.orderInfo:
        this.orderInfoValid = true;
        break;

      case TransactionCartoccordionTabs.BuyerContactInfo:

        this.buyerContactInfoValid = true;
        break;


      case TransactionCartoccordionTabs.SellerContactInfo:
        this.SellerContactInfoValid = true;
        break;

      case TransactionCartoccordionTabs.SalesRepInfo:
        this.SalesRepInfoValid = true;
        break;

      case TransactionCartoccordionTabs.ShippingInfo:
        this.shippingInfOValid = true;
        break;


      case TransactionCartoccordionTabs.BillingInfo:
        this.BillingInfoValid = true;
        break;
      default:
        break;
    }

  }
  ontabChange($event) {
    this.activeIndex = $event + 1;
    this.currentTab = this.activeIndex;
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

  }

  refreshShoppingCart(event) {
    if (this.appTransactionsForViewDto?.entityStatusCode?.toUpperCase() == 'OPEN') {

      if (event) {
        this.getShoppingCartData()
      }

    }
  }

  onChangeAppTransactionsForViewDto($event) {
    $event.companeyNames = this.companeyNames;
    this.appTransactionsForViewDto = $event;
  }

  TempCompValid($event) {
    if ($event && this.appTransactionsForViewDto?.buyerCompanySSIN == '') {
      this.TempComp = $event;

    }
  }
// private addCacheBuster(url: string): string {
//   const separator = url.includes('?') ? '&' : '?';
//   return `${url}${separator}v=${Date.now()}`;
// }
private preparePrintUrl(url: string): string {
  // convert \ to /
  const cleanUrl = url.replace(/\\/g, '/');

  // force latest file (avoid cached old PDF)
  const separator = cleanUrl.includes('?') ? '&' : '?';

  return `${cleanUrl}${separator}v=${Date.now()}`;
}

async printTransaction(): Promise<void> {
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    console.error('Popup blocked.');
    return;
  }

  printWindow.document.write('<p>Preparing print preview...</p>');
  printWindow.document.close();

  this.showMainSpinner();

  // start generate report
  this.onGeneratOrderReport(true, undefined, true, false, false);

  // wait for backend generation
  setTimeout(() => {

    this._AppTransactionServiceProxy
      .getTransactionOrderConfirmationUrl(this.orderId)
      .pipe(finalize(() => this.hideMainSpinner()))
      .subscribe((url: string) => {

        if (!url || !url.trim()) {
          printWindow.document.body.innerHTML =
            '<p>Print file is not ready. Please try again.</p>';
          return;
        }

        // open fresh updated PDF
        printWindow.location.href = this.preparePrintUrl(url);

      });

  }, 11000); // wait 10 sec for generation
}
// generateOrderReportPromise(): Promise<void> {
//   return new Promise((resolve, reject) => {
//     this.reportUrl = '';

//     this.printInfoParam = new ProductCatalogueReportParams();
//     this.printInfoParam.reportTemplateName = this.transactionReportTemplateName;
//     this.printInfoParam.TransactionId = this.orderId.toString();
//     this.printInfoParam.saveToPDF = true;
//     this.printInfoParam.tenantId = this.appSession?.tenantId;
//     this.printInfoParam.userId = this.appSession?.userId;

//     this._AppTransactionServiceProxy
//       .getTenantRoleInTransaction(this.orderId, this.appTransactionsForViewDto.tenantId)
//       .subscribe({
//         next: (res) => {
//           this.printInfoParam.orderConfirmationRole = res.contactRole;
//           this.printInfoParam.contactName = res.contactName;

//           this.reportUrl = this.printInfoParam.getReportUrl();
//           this.createReportViewer();

//           resolve();
//         },
//         error: reject
//       });
//   });
// }
// waitForOrderConfirmationUrlPromise(): Promise<string> {
//   return new Promise((resolve, reject) => {
//     let attempts = 0;
//     const maxAttempts = 12;

//     const interval = setInterval(() => {
//       attempts++;

//       this._AppTransactionServiceProxy
//         .getTransactionOrderConfirmationUrl(this.orderId)
//         .subscribe({
//           next: (url: string) => {
//             if (url && url.trim() !== '') {
//               clearInterval(interval);
//               resolve(url);
//               return;
//             }

//             if (attempts >= maxAttempts) {
//               clearInterval(interval);
//               reject('Timeout waiting for report URL');
//             }
//           },
//           error: (err) => {
//             clearInterval(interval);
//             reject(err);
//           }
//         });
//     }, 3000);
//   });
// }
  onShareTransaction() {
    this.onshare = true;
  }
  offShareTransaction() {
    this.onshare = false;
  }
  async onGeneratOrderReport($event, printInfoParam?: ProductCatalogueReportParams, FromPlaceOrder?: boolean, refreshData: boolean = true, printTrans: boolean = false) {
    if (($event && this.appTransactionsForViewDto?.entityStatusCode?.toUpperCase() != 'DRAFT') || ($event && FromPlaceOrder)) {
      this.reportUrl = "";
      if (printInfoParam) {
        this.printInfoParam = printInfoParam;
      } else {
        this.printInfoParam = new ProductCatalogueReportParams();
        this.printInfoParam.reportTemplateName = this.transactionReportTemplateName;
        this.printInfoParam.TransactionId = this.orderId.toString();

        this.printInfoParam.saveToPDF = true;
        this.printInfoParam.tenantId = this.appSession?.tenantId;
        this.printInfoParam.userId = this.appSession?.userId;

        // Asynchronous handling for setting orderConfirmationRole
        this._AppTransactionServiceProxy.getTenantRoleInTransaction(this.orderId, this.appTransactionsForViewDto.tenantId).subscribe((res) => {
          this.printInfoParam.orderConfirmationRole = res.contactRole ? res.contactRole : 'buyer';
          this.printInfoParam.contactName = res.contactName ? res.contactName : 'Savty';



          // Ensure dependent logic is executed after the async operation
          this.reportUrl = this.printInfoParam.getReportUrl();
          this.createReportViewer();

          if (refreshData) {
            this.getShoppingCartData();
          }
          if (printTrans) {
            setTimeout(() => {
              this.hideMainSpinner()
              this._AppTransactionServiceProxy.getTransactionOrderConfirmationUrl(this.orderId)
                .pipe(
                  finalize(() => {

                  })
                )
                .subscribe((res) => {
                  var page = window.open(res);
                  page.print();
                }

                );
            }, 10000)
          }
        });

        // Any logic dependent on the above call must be moved here
      }
    }
  }

  getOrderConfirmation() {
    this.transactionFormPath = "";
    this.transactionFormPath = this._transactionFormPath;
  }

  onShareTransactionByMessage($event: { tenantTransactionInfo: TenantTransactionInfo[], appTransactionsForViewDto: GetAppTransactionsForViewDto }) {
    // Assign the incoming data
    this.appTransactionsForViewDto = $event.appTransactionsForViewDto;

    // Iterate through tenantTransactionInfo to fetch tenant roles and generate reports
    $event.tenantTransactionInfo.forEach((tenantInfo) => {
      this._AppTransactionServiceProxy.getTenantRoleInTransaction(tenantInfo.transactionId, tenantInfo.tenantId)
        .subscribe((res) => {
          const printInfoParam = new ProductCatalogueReportParams();

          // Set fetched data
          printInfoParam.orderConfirmationRole = res.contactRole;
          printInfoParam.contactName = res.contactName;
          printInfoParam.reportTemplateName = this.transactionReportTemplateName;
          printInfoParam.saveToPDF = true;
          printInfoParam.userId = this.appSession?.userId;

          // Set transaction-specific data
          printInfoParam.TransactionId = tenantInfo.transactionId.toString();
          printInfoParam.tenantId = tenantInfo.tenantId;

          // Pass the updated params to onGeneratOrderReport
          this.onGeneratOrderReport(true, printInfoParam, false, false);
        });
    });
  }


  createReportViewer() {
    // Resolve the factory for ReportViewerComponent
    const factory = this.componentFactoryResolver.resolveComponentFactory(ReportViewerComponent);

    // Create a new container for the report viewer
    const containerRef = this.reportViewerContainer.createComponent(factory);

    // Ensure the containerRef is valid
    if (!containerRef) {
      console.error("Failed to create reportViewerContainer.");
      return;
    }

    // Set input properties for the container
    const instance = containerRef.instance as ReportViewerComponent;
    instance.reportUrl = this.reportUrl;
    instance.invokeAction = this.invokeAction;

    // Add a class to hide the component initially
    const containerNativeElement = containerRef.location.nativeElement as HTMLElement;
    if (containerNativeElement) {
      containerNativeElement.classList.add('d-none');
    } else {
      console.error("Native element of reportViewerContainer is not available.");
    }
  }
  getProductDetailsForView(id: any) {
    this.appTransactionsForViewDto.transactionType == 0 ? this.orderType = 'SO' : this.orderType = 'PO'
    this.showMainSpinner();
    this.showEditSpecialPrice = true;
    this._AppMarketplaceItemsServiceProxy
      .getMarketplaceAppItemForView(
        undefined,
                  0,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
        this.appTransactionsForViewDto?.currencyCode,
        this.appTransactionsForViewDto?.buyerCompanySSIN,
        this.appTransactionsForViewDto?.sellerCompanySSIN,
        this.appTransactionsForViewDto?.priceLevel,
        this.appTransactionsForViewDto?.id,
        id,
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
        undefined,
        undefined,
        undefined,
        0,
        10
      )
      .pipe(
        finalize(() => {
          this.hideMainSpinner();
        })
      )
      .subscribe((res: GetAppMarketplaceItemDetailForViewDto) => {
        this.productDetails = res?.appItem;
        this.productDetails.maxSpecialPrice = this.productDetails?.maxSpecialPrice ? this.productDetails?.maxSpecialPrice : 0;
        this.filterForm.controls['updatedSpecialPrice']?.setValue(this.productDetails?.maxSpecialPrice);
        let colorVariation: any[] = res?.appItem?.variations?.filter(
          (variation: any) => variation.extraAttrName === this.productDetails?.variations[0]?.extraAttrName
        );
        let selectedValues = [
          ...colorVariation.map(
            (selected: any) => selected?.selectedValues
          ),
        ];

        this.colorsData = selectedValues[0]?.map((variation: any) => {
          let sizesValue = variation?.edRestAttributes?.map(
            (attr: any) => {
              if (attr?.extraAttrName === "SIZE") {
                return [...attr.values];
              }
            }
          );
          return {
            colorName: variation?.value,
            sizes: sizesValue[0],
            colorImg: variation?.colorImage,
            colorCode: variation?.colorHexaCode,
            colorCodeSelectedValues: variation?.code
          };
        });
        this.filteredColors = this.colorsData
        this.chk_Order_by_prepack = [];
        this.chk_Order_by_prepack = new Array(this.colorsData?.length).fill(true);
      });

  }
  onColorSelect(event) {
    this.currentIndex = this.colorsData.findIndex(
      (option) => option.colorName === event.value.colorName
    );
    this.selectedColorName = event.value.colorName
    this.selectedColorImg = event.value.colorImg
    this.selectedColorCode = event.value.colorCode

    this.displayColordata = true
    this.displaysizesdata = true
  }

  // create order by size summary JSON
  onNumberChange(e: any, color: any, sizeIndex: any) {
    let orederedMappedData = {
      color,
      sizeIndex,
      colorIndex: this.currentIndex,
    };
    let foundColor = false;
    this.orderSummary.forEach((summary: any) => {
      if (summary?.color?.colorName === color?.colorName) {
        foundColor = true;
      }
    });
    if (!foundColor) {


      this.orderSummary.push(orederedMappedData);
    }
    if (!(this.orderType == 'SO' && this.productDetails?.orderByPrePack && !this.chk_Order_by_prepack[this.currentIndex])) {
      this.productDetails.variations.map((variation: any) => {
        if (variation?.extraAttrName === this.productDetails?.variations[0]?.extraAttrName) {
          variation?.selectedValues?.forEach((value) => {
            if (
              value?.value ===
              this.filteredColors[this.currentIndex]?.colorName
            ) {
              value?.edRestAttributes?.forEach((attr) => {
                if (attr?.extraAttrName === "SIZE") {


                  attr?.values?.forEach((sizeValue) => {
                    sizeValue.orderedPrePacks =
                      this.filteredColors[
                        this.currentIndex
                      ]?.sizes[0]?.orderedPrePacks;
                  });
                }
              });
            }
          });
        }
      });
    }

    this.calculateTotalOrderPriceAndQty(this.orderSummary);
  }


  onChangechk_Order_by_prepack() {
    if (!(this.orderType == 'SO' && this.productDetails?.orderByPrePack && !this.chk_Order_by_prepack[this.currentIndex])) {
      this.colorsData[this.currentIndex]?.sizes?.forEach((item) => {
        item.orderedPrePacks = 0;
      });
    }
    else {
      this.colorsData[this.currentIndex]?.sizes?.forEach((item) => {
        item.orderedPrePacks *= item?.sizeRatio;
      });
    }
  }

  onEditpecialPrice() {

    this.productDetails.variations.map((variation: any) => {
      if (variation.extraAttrName === this.productDetails?.variations[0]?.extraAttrName) {
        variation.selectedValues.forEach((value) => {
          value.edRestAttributes.forEach((attr) => {
            if (attr.extraAttrName === "SIZE") {
              attr.values.forEach((sizeValue) => {
                sizeValue.price = this.filterForm.controls['updatedSpecialPrice']?.value;
              });
            }
          });

        });
      }

      this.calculateTotalOrderPriceAndQty(this.orderSummary);
    });

    // this.productDetails.minSpecialPrice = updatedSpecialPrice;
    this.productDetails.maxSpecialPrice = this.filterForm.controls['updatedSpecialPrice']?.value;
    this.showEditSpecialPrice = true
  }

  // total of all order qty and price in order by size and prepack

  calculateTotalOrderPriceAndQty(orders: any) {
    let qty = 0;
    let price = 0;
    orders?.map((order: any) => {
      order?.color?.sizes?.map((size, index) => {
        if (this.productDetails.orderByPrePack) {

          let multiby =
            size?.sizeRatio * order?.color?.sizes[index]?.orderedPrePacks;
          let priceMultibly = multiby * size?.price;
          qty = qty + multiby;
          price = price + priceMultibly;
        } else {
          if (!size.orderedQty)
            size.orderedQty = 0
          let priceMultibly = size?.orderedQty * size?.price;
          qty = qty + size?.orderedQty;
          price = price + priceMultibly;
        }

        this.totalOrderQTY = qty;
        this.totlaOrderPrices = price;
      });
    });
  }

  calcHight() {
    this.getSycAttachmentCategoriesByCodes(['LOGO', "BANNER", "IMAGE"]).subscribe((result) => {
      result.forEach(item => {

        if (item.code == "IMAGE") {
          this.sycAttachmentCategoryImage = item
          let [width, height, border] = this.sycAttachmentCategoryImage.aspectRatio.split(':')
          this.acceptedAspectRatio = Number(width) / Number(height);
        }
      })
    })
  }

  // totla ordered prepack QTY
  calculatePrepackOrderedQTYSum(prepackSizes: any, orderIndex: number) {
    let sum = 0;
    prepackSizes.forEach((item, index) => {
      let multiby;
      if (this.orderType == 'SO' && this.productDetails?.orderByPrePack && !this.chk_Order_by_prepack[orderIndex])
        multiby = item.orderedPrePacks;

      else
        multiby =
          item.sizeRatio *
          this.orderSummary[orderIndex]?.color?.sizes[index]?.orderedPrePacks;

      sum = sum + multiby;
    });
    return sum;
  }

  // totla ratios in order by prepack
  getTotlaPrepackSum() {
    let sum: any = 0;
    this.colorsData[this.currentIndex]?.sizes.forEach((item) => {
      sum = sum + item?.sizeRatio;
    });


    return sum;
  }


  defineExtraAttributes() {
    this.extraAttributes = {};

    const allAttributes = this.selectedTransTypeData?.extraAttributes?.extraAttributes ?? [];

    allAttributes.forEach(attr => {
      const usageKey = attr.usage?.replace(/\s+/g, '_').toUpperCase() || 'DEFAULT';

      if (!this.extraAttributes[usageKey]) {
        this.extraAttributes[usageKey] = new CreateEditAppItemExtraAttribute({
          header: this.l(attr.usage),
          title: this.l(attr.usage),
          usageEnum: usageKey as unknown as EExtraAttributeUsage,
          orderOfDisplay: 1,
          filteredExtraAttributes: [],
          extraAttributes: []
        });
      }

      //  Add this if missing
      if (!attr.paginationSetting) {
        attr.paginationSetting = {
          skipCount: 0,
          maxResultCount: 10,
          totalCount: 0,
          list: []
        };
      }

      this.extraAttributes[usageKey].filteredExtraAttributes.push(attr);
    });

  }


  getAppItemTypeExtraAttributesById() {
    this._sycEntityObjectTypesServiceProxy.getAllWithExtraAttributes(this.appTransactionsForViewDto?.entityObjectTypeId)
      .subscribe((res) => {
        if (res?.length > 0) {
          this.selectedTransTypeData = res[0];

          const attributes = res[0]?.extraAttributes?.extraAttributes;


          if (attributes?.length > 0) {
            this.defineExtraAttributes();
            this.loadRecommendedAndAdditionalExtraDataLookupLists();
          } else {
            this.extraAttributes = {}; // No data, keep empty
          }
        }
      });
  }


  loadRecommendedAndAdditionalExtraDataLookupLists() {
    Object.keys(this.extraAttributes).forEach(key => {
      const group = this.extraAttributes[key];
      group.filteredExtraAttributes.forEach(extraAttr => {
        if (extraAttr.isLookup) {
          this.loadExtraDataLookupList(extraAttr);
        }
      });
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
        let isExist = result.items.filter((item) => { return item.value == extraAttr.attributeId });
        if ((isExist!.length == 0 || isExist == undefined) && extraAttr?.selectedValues?.length > 0) {

          const tempAtt = new LookupLabelDto({
            code: extraAttr.code,
            label: extraAttr.selectedValues,
            stockAvailability: undefined,
            value: extraAttr.selectedValues,
            isHostRecord: false,
            hexaCode: undefined,
            image: undefined,
            status: undefined,
            entityObjectStatusId: undefined

          })
          result.items.push(tempAtt)
        }

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



  getOrderDetailsTabIndex(): number {
    const extraAttrKeys = Object.keys(this.extraAttributes || {});
    const extraAttrTabCount = extraAttrKeys.length;
    return extraAttrTabCount > 0 ? extraAttrTabCount : 6; // fallback if no extra tabs
  }

  removeLocalStorage() {
    localStorage.removeItem("comNew");
    localStorage.removeItem("conNew");
  }

  saveDates() {
    let enteredDate = moment(this.appTransactionsForViewDto?.enteredDate).toDate();
    let startDate = moment(this.appTransactionsForViewDto?.startDate).toDate();
    let availableDate = moment(this.appTransactionsForViewDto?.availableDate).toDate();
    let completeDate = moment(this.appTransactionsForViewDto?.completeDate).toDate();

    this.appTransactionsForViewDto.enteredDate = moment.utc(moment(enteredDate).format('YYYY-MM-DD'));
    this.appTransactionsForViewDto.startDate = moment.utc(moment(startDate).format('YYYY-MM-DD'));
    this.appTransactionsForViewDto.availableDate = moment.utc(moment(availableDate).format('YYYY-MM-DD'));
    this.appTransactionsForViewDto.completeDate = moment.utc(moment(completeDate).format('YYYY-MM-DD'));
  }

  


  automaticShare() {
    if (!this.appTransactionsForViewDto?.sharedWithUsers ||
      this.appTransactionsForViewDto.sharedWithUsers.length === 0) {
      return;
    }
    const newsharingArray = this.appTransactionsForViewDto?.sharedWithUsers?.map(u => ({
      sharedTenantId: u.tenantId,
      sharedUserId: u.userId,
      sharedUserEMail: u.email,
      sharedUserName: u.name,
      sharedUserSureName: u.name,
      sharedUserTenantName: u.tenantName,
      id: u.id
    })) || [];
    let shareDto: any = {
      transactionId: this.orderId,
      message: `Hi,
Kindly check attached`,
      transactionSharing: newsharingArray,
      subject: undefined
    };
    this._AppTransactionServiceProxy.shareTransactionByMessage(shareDto)
      .subscribe(r => this.notify.success("Transaction shared automatically"));
  }
  getNeeddedSettingValues() {
    if (this.isAuthenticated) {
      this._AppEntitiesServiceProxy
        .getTenantSettingValue(1111, null)
        .subscribe((res: any) => {
          this.transactionSharing = res?.toString().toLowerCase();
        });
    }
  }

  getTotalCharges() {
    return this.appTransactionsForViewDto?.charges?.reduce(
      (acc, charge) => acc + (charge.chargeAmount || 0),
      0
    ) || 0;
  }


  onEditCharge(charge) {
    charge.isEditing = true;
    charge.originalAmount= charge.chargeAmount;
  }

  onSaveCharge(charge) {
    this.showMainSpinner();
    this._AppTransactionServiceProxy
      .updateCharges(this.orderId,this.appTransactionsForViewDto.charges)
      .pipe(
        finalize(() => {
          this.hideMainSpinner()
        })
      )
      .subscribe((res) => {
     this.appTransactionsForViewDto.totalAmount = res;
    charge.isEditing = false;
    charge.originalAmount = charge.chargeAmount;
    this.totalCharges= this.getTotalCharges();
    this.orderAmount = this.appTransactionsForViewDto.totalAmount - this.totalCharges;
      });

  }

  onCancelCharge(charge) {
    charge.chargeAmount = charge.originalAmount;
    charge.isEditing = false;
  }

canConfirm(charge): boolean {
  return (
    charge.chargeAmount !=null &&
    charge.chargeAmount !== charge.originalAmount &&
    charge.chargeAmount >= 0
  );
}


// /////////////////////// p-dialog login




dialog = {
  visible: false,
  message: '',
  icon: '',
  iconColor: '#F6851D',
  confirmText: 'Ok',
  cancelText: 'No',
  showCancel: false,
  style: { width: '474px' },
  confirmAction: () => {}
};

closeDialog() {
  this.dialog.visible = false;
}
openOrderSuccessDialog() {
  this.dialog = {
    visible: true,
   message: this.l('OrderPlacedSuccessfully', this.transactionCode),
    icon: 'fa fa-check-circle',
    iconColor: '#4A0D4A',
    confirmText: this.l('Ok'),
    cancelText: this.l('No'),
    showCancel: false,
    style: { width: '474px' },
    confirmAction: () => {
      this.dialog.visible = false;
      this.askForShareTransactions();
    }
  };
}
openSpecialPriceDialog() {
  this.dialog = {
    visible: true,
    message: this.l('SpecialPriceUpdateMessage'),
    icon: 'fa fa-bell',
    iconColor: '#F6851D',
    confirmText: this.l('Yes'),
    cancelText: this.l('No'),
    showCancel: false,
    style: { width: '425px' },
    confirmAction: () => {
      this.dialog.visible = false;
      this.onEditpecialPrice();
    }
  };
}
openPlaceOrderConfirm() {
  this.dialog = {
    visible: true,
    message: this.l('ConfirmPlaceOrder'),
    icon: 'fa fa-bell',
    iconColor: '#F6851D',
    confirmText: this.l('Yes'),
    cancelText: this.l('No'),
    showCancel: true,
    style: { width: '474px' },
    confirmAction: () => {
      this.dialog.visible = false;
      this.PlaceOrder();
    }
  };
}


onOrderDetailsTabSelected(isSelected: boolean) {
  if (!isSelected) return;

  this.currentTab = this.getOrderDetailsTabIndex();

  if (!this.shoppingCartDetails) {
    this.getLinesData();
  }
}
}
