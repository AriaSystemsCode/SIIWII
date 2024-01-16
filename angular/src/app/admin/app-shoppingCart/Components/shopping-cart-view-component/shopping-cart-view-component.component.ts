import {
  Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild
  , AfterViewInit, ViewChildren, QueryList,
} from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppEntitiesServiceProxy, AppTransactionServiceProxy, CurrencyInfoDto, GetAppTransactionsForViewDto, GetOrderDetailsForViewDto, TransactionPosition, TransactionType, ValidateTransaction } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SelectItem } from 'primeng/api';
import Swal from 'sweetalert2';
import { TreeNode } from 'primeng/api';
import { Router } from '@angular/router';
import { cloneDeep } from 'lodash';
import { ShoppingCartMode } from "./ShoppingCartMode";
import { UserClickService } from '@shared/utils/user-click.service';
import { finalize } from 'rxjs';
import { ShoppingCartoccordionTabs } from './ShoppingCartoccordionTabs';
import { CommentParentComponent } from '@app/main/interactions/components/comment-parent/comment-parent.component';
import { ProductCatalogueReportParams } from '@app/main/app-items/appitems-catalogue-report/models/product-Catalogue-Report-Params';

@Component({
  selector: 'app-shopping-cart-view-component',
  templateUrl: './shopping-cart-view-component.component.html',
  styleUrls: ['./shopping-cart-view-component.component.scss'],
})
export class ShoppingCartViewComponentComponent
  extends AppComponentBase
  implements OnInit {
  @ViewChild("shoppingCartModal", { static: true }) modal: ModalDirective;
  @ViewChildren(CommentParentComponent) commentParentComponent!: QueryList<CommentParentComponent>;
  @Output("hideShoppingCartModal") hideShoppingCartModal: EventEmitter<boolean> = new EventEmitter<boolean>()

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
  loadNotesComp: boolean = false;
  transactionNum: Number = 0;
  disableProceedBtn: boolean = true;
  productCode;
  colorFilter;
  colors: SelectItem[] = [];
  sizeFilter;
  sizes: SelectItem[] = [];
  showVariations: boolean = false;
  oldShowVariations: boolean = false;
  validateOrder: boolean = false;
  orderId: number = 0;
  cols!: any[];
  shoppingCartDetails: GetOrderDetailsForViewDto;
  shoppingCartTreeNodes!: TreeNode[];
  //minimize: boolean = false;
  shoppingCartMode: ShoppingCartMode;
  _shoppingCartMode = ShoppingCartMode;
  showTabs: boolean = false;
  transactionType: string = "";
  appTransactionsForViewDto: GetAppTransactionsForViewDto;
  showCarousel: boolean = false;
  transactionPosition = TransactionPosition;
  activeIndex = 0;
  showSaveBtn: boolean = false;
  currencySymbol: string = "";
  transactionFormPath:string="";
  onshare:boolean=false;
  printInfoParam: ProductCatalogueReportParams = new ProductCatalogueReportParams();
  reportUrl:string="";
  invokeAction = '/DXXRDV';
  
  constructor(
    injector: Injector,
    private _AppTransactionServiceProxy: AppTransactionServiceProxy,
    private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
    private userClickService: UserClickService,
    private router: Router
  ) {
    super(injector);

  }
  ngOnInit(): void {
  }
  loadCommentsList() {
    // this.commentParentComponent.show(this.postCreatorUserId,this.orderId,this.parentId,this.threadId)
    this.commentParentComponent.first.show(this.appTransactionsForViewDto.creatorUserId, this.orderId, undefined, undefined)
  }

  show(orderId: number, showCarousel: boolean = false, validateOrder: boolean = false, shoppingCartMode: ShoppingCartMode = ShoppingCartMode.createOrEdit) {
    this.resetData();
    this.orderId = orderId;
    this.loadNotesComp = true;
    this.showCarousel = showCarousel;
    this.validateOrder = validateOrder;
    this.shoppingCartMode = shoppingCartMode;

    if (shoppingCartMode == ShoppingCartMode.createOrEdit) {
      this.showTabs = false;
      this.createOrEditorderInfo = true;
      this.createOrEditbuyerContactInfo = true;
      this.createOrEditSellerContactInfo = true;
      this.createOrEditSalesRepInfo = true;
      this.createOrEditshippingInfO = true;
      this.createOrEditBillingInfo = true;
    }
    else {
      this.showTabs = true;
      this.createOrEditorderInfo = false;
      this.createOrEditbuyerContactInfo = false;
      this.createOrEditSellerContactInfo = false;
      this.createOrEditSalesRepInfo = false;
      this.createOrEditshippingInfO = false;
      this.createOrEditBillingInfo = false;
    }

    this.getColumns();
    this.getShoppingCartData();
  }

  resetTabValidation() {
    var valid: boolean = false;

    if (this.shoppingCartDetails?.entityStatusCode?.toUpperCase() == 'OPEN')
      valid = true;

    this.orderInfoValid = valid;
    this.buyerContactInfoValid = valid;
    this.SellerContactInfoValid = valid;
    this.SalesRepInfoValid = valid;
    this.shippingInfOValid = valid;
    this.BillingInfoValid = valid;
  }

  resetData() {
    this.resetTabValidation();
    this.activeIndex = 0;
    this.transactionNum = 0;
    this.productCode = undefined;
    this.colorFilter = undefined;
    this.colors = [];
    this.sizeFilter = undefined;
    this.sizes = [];
    this.showVariations = false;
    this.oldShowVariations = false;
    this.validateOrder = false;
    this.cols = [];
    this.showTabs = false;
    this.createOrEditorderInfo = true;
    this.createOrEditbuyerContactInfo = true;
    this.createOrEditSellerContactInfo = true;
    this.createOrEditSalesRepInfo = true;
    this.createOrEditshippingInfO = true;
    this.createOrEditBillingInfo = true;
  }

  getColumns() {
    this.cols = [
      { field: "image", header: "Image" },
      { field: "manufacturerCode", header: "Code" },
      { field: "name", header: "Name" },
      { field: "qty", header: "Quantity" },
      { field: "price", header: "Price" },
      { field: "amount", header: "Amount" }
    ];
  }

  getShoppingCartData(temp: TreeNode<any>[] = null) {

    //header
    this._AppTransactionServiceProxy.getAppTransactionsForView(this.orderId, false, 0, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, false, undefined, 0, 10, this.transactionPosition.Current)
      .subscribe((res: GetAppTransactionsForViewDto) => {
        this.appTransactionsForViewDto = res;

        this.loadCommentsList()

        //lines
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
            this.resetTabValidation();

            this.shoppingCartDetails?.totalAmount % 1 == 0 ? this.shoppingCartDetails.totalAmount = parseFloat(Math.round(this.shoppingCartDetails.totalAmount * 100 / 100).toFixed(2)) : null;

            this.userClickService.userClicked("refreshShoppingInfoInTopbar");
            if (res.transactionType == TransactionType.PurchaseOrder)
              this.transactionType = "Purchase Order";

            if (res.transactionType == TransactionType.SalesOrder)
              this.transactionType = "Sales Order";

            if (!temp) this.shoppingCartTreeNodes = res.detailsView;
            else this.shoppingCartTreeNodes = temp;

            this.colors = res.colors;
            this.sizes = res.sizes;


          });


          //Currency
            this._AppEntitiesServiceProxy.getCurrencyInfo(res.currencyCode)
                .subscribe((res: CurrencyInfoDto) => {
                    this.currencySymbol = res.symbol ? res.symbol : res.code  ;
                });
        this.modal.hide();
        this.modal.show();
        this.hideMainSpinner();
      });
  }

  expandCollapseRecursive(node: TreeNode, isExpand: boolean) {
    node.expanded = isExpand;
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        this.expandCollapseRecursive(node.children[i], isExpand);
      }
    }
  }

  onShowVariations($event) {
    const temp = cloneDeep(this.shoppingCartTreeNodes);
    temp.forEach((node) => {
      this.expandCollapseRecursive(node, this.showVariations);
    });

    if (this.oldShowVariations != this.showVariations)
      this.getShoppingCartData(temp);

    this.oldShowVariations = this.showVariations;
  }

  onContinueShopping() {
    if (this.validateOrder && this.shoppingCartTreeNodes)
      this.validateShoppingCart();
    if (this.shoppingCartDetails?.sellerCompanySSIN) {
      localStorage.setItem(
        "SellerSSIN",
        JSON.stringify(this.shoppingCartDetails.sellerCompanySSIN)
      );

      localStorage.setItem(
        "currencyCode",
        JSON.stringify(this.appTransactionsForViewDto.currencyCode)
      );

      localStorage.setItem(
        "transNO",
        this.shoppingCartDetails.code
      );
      this.router.navigateByUrl("app/main/marketplace/products");
    }
    this.hide();
  }

  validateShoppingCart() {
    this.showMainSpinner();

    this._AppTransactionServiceProxy.validateBuyerSellerTransaction(this.shoppingCartDetails.sellerSSIN, this.shoppingCartDetails.buyerSSIN, this.shoppingCartDetails.transactionType).subscribe((res) => {
      switch (res.validateOrder) {
        case ValidateTransaction.FoundShoppingCart:
          // this.show(res.shoppingCartId, this.validateOrder);
          this.hideMainSpinner();
          break;

        case ValidateTransaction.NotFound:
        case ValidateTransaction.NotFoundShoppingCartForTemp:
          this._AppTransactionServiceProxy.setCurrentUserActiveTransaction(this.orderId).subscribe((res) => {
            this.userClickService.userClicked("refreshShoppingInfoInTopbar");
            //this.show(this.orderId, this.validateOrder);
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
              //   this.show(res.shoppingCartId, this.validateOrder);
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
              //   this.show(res.shoppingCartId, this.validateOrder);
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
                this.hideMainSpinner();
              });
            break;

          default:
            break;
        }
      }
    });
  }
  onEditQty(rowNode) {
    rowNode.node.data.invalidUpdatedQty = "";
    switch (rowNode.level) {
      case 0:
      case 2:
        this.showMainSpinner();
        this._AppTransactionServiceProxy
          .updateByProductLineId(
            this.orderId,
            rowNode.node.data.lineId,
            rowNode.node.data.updatedQty
          )
          .subscribe((res) => {
            if (res) this.notify.info("Successfully Updated.");
            this.getShoppingCartData();
            rowNode.node.data.showEditQty = false;
            this.hideMainSpinner();
          });
        break;

      case 1:
        this.showMainSpinner();
        let moduleQty =
          rowNode.node.data.updatedQty %
          rowNode.node.data.noOfPrePacks;
        let qty =
          rowNode.node.data.updatedQty /
          rowNode.node.data.noOfPrePacks;
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
              rowNode.node.data.showEditQty = false;
              this.hideMainSpinner();
            });
        } else {
          rowNode.node.data.invalidUpdatedQty =
            "The quantity must be divisible by the prepack (" +
            rowNode.node.data.noOfPrePacks +
            ")";
          this.hideMainSpinner();
        }

        break;

      default:
        break;
    }
  }
  hide() {
    this.resetData();
    this.modal.hide();
    let indx = -1;
    indx = this.minimizedOrders?.findIndex(x => x.orderId == this.shoppingCartDetails?.orderId);
    if (indx >= 0)
      this.minimizedOrders.splice(indx, 1);
    this.userClickService.userClicked("refreshShoppingInfoInTopbar");
    if (this.shoppingCartMode == ShoppingCartMode.view)
      this.hideShoppingCartModal.emit(true);
  }

  minimizedOrders: any[] = [];
  minimizeScreen() {
    let indx = -1;
    indx = this.minimizedOrders?.findIndex(x => x.orderId == this.shoppingCartDetails.orderId);
    if (indx >= 0) {
    }
    else {
      this.minimizedOrders.push({
        orderId: this.shoppingCartDetails.orderId,
        name: this.shoppingCartDetails.name,
      });
    }
    //  this.minimize = true;
    this.modal.hide();
  }

  maximizeScreen(orderId: number) {
    // this.minimize = false;
    let indx = -1;
    indx = this.minimizedOrders?.findIndex(x => x.orderId == orderId);
    if (indx >= 0)
      this.minimizedOrders.splice(indx, 1);
    this.show(orderId, this.showCarousel, this.validateOrder, this.shoppingCartMode);
  }

  onProceedToCheckout() {
    this.showMainSpinner();
    this._AppTransactionServiceProxy.getAppTransactionsForView(this.orderId, false, 0, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, false, undefined, 0, 10, this.transactionPosition.Current)
      .subscribe((res: GetAppTransactionsForViewDto) => {
        this.appTransactionsForViewDto = res;
        this.hideMainSpinner();
        this.showTabs = true;
      });
  }

  onDiscardShopping() {
    Swal.fire({
      title: "",
      text: "Do you need to discared shopping cart permanently?",
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

  PlaceOrder() {
    Swal.fire({
      title: "",
      text: "Are you sure that you want to place the order?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
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
        this.showMainSpinner();
        this.appTransactionsForViewDto.lFromPlaceOrder = true;
        this._AppTransactionServiceProxy.createOrEditTransaction(this.appTransactionsForViewDto)
          .pipe(finalize(() => {
            this.hideMainSpinner();
            this.hide();
          }
          ))
          .subscribe((res) => {
            if (res) {
              Swal.fire({
                title: "",
                text: "Order #" + res + " has been placed successfully",
                icon: "success",
                showCancelButton: false,
                confirmButtonText: "OK",
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
                }
              });
            }
          });
      }
    });
  }

  goPrevious_Next_Transaction(transactionPosition: TransactionPosition) {
    this.showMainSpinner();
    this._AppTransactionServiceProxy.getAppTransactionsForView(this.orderId, false, 0, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, false, undefined, 0, 1, transactionPosition)
      .pipe(finalize(() => this.hideMainSpinner()))
      .subscribe((res1: GetAppTransactionsForViewDto) => {
        this.show(res1.id, this.showCarousel, this.validateOrder, this.shoppingCartMode);
      });
  }

  ontabInfoValid(activetab) {
    switch (activetab) {
      case ShoppingCartoccordionTabs.orderInfo:
        this.orderInfoValid = true;
        break;

      case ShoppingCartoccordionTabs.BuyerContactInfo:
        this.buyerContactInfoValid = true;
        break;


      case ShoppingCartoccordionTabs.SellerContactInfo:
        this.SellerContactInfoValid = true;
        break;

      case ShoppingCartoccordionTabs.SalesRepInfo:
        this.SalesRepInfoValid = true;
        break;

      case ShoppingCartoccordionTabs.ShippingInfo:
        this.shippingInfOValid = true;
        break;


      case ShoppingCartoccordionTabs.BillingInfo:
        this.BillingInfoValid = true;
        break;
      default:
        break;
    }

  }
  ontabChange($event) {
    this.activeIndex = $event + 1;
  }

  onChangeAppTransactionsForViewDto($event) {
    this.appTransactionsForViewDto = $event;
  }
  printTransaction(){
    var page = window.open(this.transactionFormPath);
    page.print();
  }

  onShareTransaction(){
    this.onshare=true;
  }
  offShareTransaction(){
    this.onshare=false;
  }
  onGeneratOrderReport($event){
    if($event){
      this.printInfoParam.reportTemplateName=this.transactionReportTemplateName;
      this.printInfoParam.TransactionId=this.orderId.toString();
    //this.printInfoParam.orderType=this.appTransactionsForViewDto.transactionType== TransactionType.SalesOrder  ? "SO" : "PO";
      this.printInfoParam.orderConfirmationRole=this.getTransactionRole(this.appTransactionsForViewDto.enteredByUserRole);
      this.printInfoParam.saveToPDF=true;
      this.printInfoParam.tenantId = this.appSession?.tenantId
      this.printInfoParam.userId = this.appSession?.userId
      this.reportUrl = this.printInfoParam.getReportUrl()
    }
  }
}
