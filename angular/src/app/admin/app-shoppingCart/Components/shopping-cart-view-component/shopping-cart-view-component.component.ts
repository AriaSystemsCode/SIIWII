import {
  Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild
  , AfterViewInit, ViewChildren, QueryList, ViewContainerRef, Renderer2, ElementRef, ComponentFactoryResolver,
  ChangeDetectorRef,
} from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AddVariationToInputDto, AppEntitiesServiceProxy, AppTransactionServiceProxy, CurrencyInfoDto, GetAccountInformationOutputDto, GetAppMarketItemForViewDto, GetAppTransactionsForViewDto, GetOrderDetailsForViewDto, PagedResultDtoOfGetAccountInformationOutputDto, TenantTransactionInfo, TransactionPosition, TransactionType, ValidateTransaction } from '@shared/service-proxies/service-proxies';
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
import { ReportViewerComponent } from '@app/main/dev-express-demo/reportviewer/report-viewer.component';
import { AppConsts } from '@shared/AppConsts';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  activeIndex ;
  showSaveBtn: boolean = false;
  currencySymbol: string = "";
  transactionCode:string="";
  transactionFormPath:string="";
  _transactionFormPath:string="";
  onshare:boolean=false;
  //orderConfirmationFile;
  printInfoParam: ProductCatalogueReportParams = new ProductCatalogueReportParams();
  reportUrl: string = "";
  invokeAction = '/DXXRDV';
  @ViewChild('reportViewerContainer', { read: ViewContainerRef }) reportViewerContainer: ViewContainerRef;
  isOwnedByMe:boolean=true;
  canChange:boolean=true;
  companeyNames:GetAccountInformationOutputDto[];
  currentTab:number
  shareDone:boolean=false;
  openActions:boolean =false
  temp: TreeNode<any>[] = null;
  addLine:boolean=true;
  visible:boolean = false
  allVariations: GetAppMarketItemForViewDto[] = [];
  displayedVariations: any[] = [];
  incrementCount: number = 10;
totalVariationsCount: number = 0;

  selectedVariation: string = '';
  selectedPrice: number = 0; // Holds the selected price
selectedQuantity: number = 0; // Holds the entered quantity
selectedImg: number = 0; // Holds the entered quantity
amount: number = 0; // Holds the calculated amount
showAddLine : boolean = false
newData:any
showSaveCancel : boolean = false
// visibleD: boolean = false;
cancelBtn: boolean = false;
saveBtn: boolean = false;
SuccessMsg: boolean = false;
addNewLinebtn : boolean = true;
filterForm: FormGroup;
comNew : boolean
conNew : boolean
TempComp : boolean = false
currentFilter: string = '';
regenrate : boolean = false
syncMsg : boolean = false
mainLoad : boolean = false
  constructor(
    injector: Injector,
    private _AppTransactionServiceProxy: AppTransactionServiceProxy,
    private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
    private userClickService: UserClickService,
    private componentFactoryResolver: ComponentFactoryResolver,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private _formBuilder: FormBuilder,
  ) {
    super(injector);

  }
  ngOnInit(): void {
    this.initFilterForm()
  
 let value = localStorage.getItem("comNew"); 

 if (value) {
  this.comNew = Boolean((value));
 }else {
  this.comNew = false
 }
 let value2 = localStorage.getItem("conNew");
 if (value2) {
  this.conNew = Boolean((value2));
}  else {
  this.conNew = false;

}
const button = document.getElementById("stickyButton");
  const rightCol = document.getElementById("rightCol");

  window.addEventListener("scroll", () => {
    const rect = rightCol.getBoundingClientRect();
    if (rect.top < 20 && rect.bottom > window.innerHeight) {
      button.style.position = "fixed";
      button.style.bottom = "20px";
      button.style.right = rect.left + "px"; // Adjust based on the right column's position
    } else {
      button.style.position = "absolute";
      button.style.bottom = "20px";
    }
  });
 console.log(this.comNew,'this.comNew')
 console.log(this.conNew,'this.conNew')
  }
  ngOnChanges() {
   

  }

 
initFilterForm() {  


  // if (this.showHeader) {
      this.filterForm = this._formBuilder.group({
        selectedVariation: ['', Validators.required],
        selectedQuantity: [null, [Validators.required, Validators.min(1)]],
        selectedPrice: [null, [Validators.required, Validators.min(1)]]

      });
 

}

addNewLine() {
  console.log(this.newData, 'newData'); // Log new data for debugging
  const filters = this.filterForm.value;

  // Get the item data from the selected line (newData)
  const appItem = this.newData?.value?.appItem;

  // Initialize the new parent node without using itself within the definition
  const newParentNode: any = {
   
    data: {}, // We’ll fill this data field after initializing the node
    children: [], // Children will be added afterward
    expanded: true // Expand the new node by default
  };

  // Fill the parent node's data to match the required structure
  newParentNode.data = {
    code: appItem?.code,
    manufacturerCode: appItem?.manufacturerCode,
    name: appItem?.name,
    qty: filters.selectedQuantity,
    price: filters.selectedPrice,
    amount: filters.selectedQuantity * filters.selectedPrice,
    image: appItem?.imageUrl,
    parentId: 0, // Top-level node
    // lineId: new Date().getTime(), // Unique identifier for lineId
    colorId: 0,
    colorCode: "", // Empty if not applicable
    sizeId: 0,
    sizeCode: "", // Empty if not applicable
    editQty: true,
    noOfPrePacks: 0,
    prePackQty: 0,
    added:true
  };

  // Define a child node that references the parent node's lineId
  // const childNode = {
  //   // key: 'new-child-' + new Date().getTime(), // Unique key for child
  //   data: {
  //     code: appItem?.code + '-child', // Custom code for the child
  //     manufacturerCode: appItem?.manufacturerCode,
  //     name: appItem?.name,
  //     qty: this.selectedQuantity,
  //     price: appItem?.price,
  //     amount: this.selectedQuantity * appItem?.price,
  //     image: appItem?.imageUrl,
  //     parentId: newParentNode.data.lineId, // Link to parent
  //     // lineId: new Date().getTime() + 1, // Unique lineId for child
  //     colorId: 0,
  //     colorCode: "", // Empty if not applicable
  //     sizeId: 0,
  //     sizeCode: "", // Empty if not applicable
  //     editQty: true,
  //     noOfPrePacks: 0,
  //     prePackQty: 0
  //   },
  //   children: null // No further children for this level
  // };

  // Add the child node to the parent's children array
  // newParentNode.children.push(childNode);

  // Add the new parent node to the shopping cart tree
  this.shoppingCartTreeNodes.push(newParentNode);

  // Update the tree structure in the UI
  this.cdr.detectChanges();
  this.shoppingCartTreeNodes = [...this.shoppingCartTreeNodes];
  console.log(this.shoppingCartTreeNodes, 'Updated shopping cart tree nodes');

  // Reset variables
  this.showSaveCancel = false;
  this.addLine = true
  // this.selectedVariation = '';
  // this.selectedQuantity = 0;
  // this.selectedPrice = 0
  // this.amount = 0;
  // this.getSellerVariations()
  this.addLine = false
}
handleVarSearch(event: any, dropdown?: any) {
  const filterText = event.filter?.trim();
  this.currentFilter = filterText; // Store the current filter text
  this.allVariations = []; // Reset all variations for new filter
  this.displayedVariations = []; // Clear displayed variations

  // Load initial set of items matching the filter
  this.loadMore(new MouseEvent('click'), dropdown, filterText);
}

getSellerVariations(
  skipCount: number = 0,
  maxResultCount: number = this.incrementCount,
  filter: string = ''
) {
  this._AppTransactionServiceProxy
    .getAllSellerVariations(
      this.appTransactionsForViewDto?.sellerCompanySSIN,
      filter, // Pass filter to the backend
      this.appTransactionsForViewDto?.buyerContactSSIN,
      'USD',
      undefined,
      skipCount,
      maxResultCount
    )
    .pipe(finalize(() => this.hideMainSpinner()))
    .subscribe((res) => {
      this.totalVariationsCount = res.totalCount;

      if (filter && skipCount === 0) {
        // Replace variations on new filter
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

  // Determine the next `skipCount` based on the filter and loaded variations
  const nextSkipCount = this.allVariations.length;

  // Check if there are more items to load or if filtering is applied
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
  console.log(event,'mmmmmmevv')
// this.filterForm.reset();
  // filters.reset()
  this.filterForm.controls['selectedQuantity']?.setValue(0);
  this.selectedQuantity = 0;
  // this.selectedPrice = 0;
  this.newData = event;

  if ( event.value.appItem.price) {
    this.selectedImg = event.value.appItem.image
   
     this.filterForm.controls['selectedPrice']?.setValue(event.value.appItem.price); // Ensure selectedPrice is a number
    //  this.selectedPrice = filters.selectedPrice
    this.updateAmount(); // Recalculate the amount when a new price is selected
  }
}

updateAmount() {
  const filters = this.filterForm.value;
  
 this.selectedPrice = filters.selectedPrice
 this.selectedQuantity = filters.selectedQuantity
  // Calculate the amount based on the quantity and selected price
  this.amount = this.selectedQuantity * this.selectedPrice;
}

updatePrice() {
  const filters = this.filterForm.value;
  this.selectedQuantity = filters.selectedQuantity

  // Calculate the amount based on the quantity and selected price
  this.amount = filters.selectedQuantity * this.selectedPrice;
}

saveVariations() {
  const body = new AddVariationToInputDto();
  const filters = this.filterForm.value;
  
 this.selectedPrice = filters.selectedPrice
 this.selectedQuantity = filters.selectedQuantity
  // Assign each property to the DTO object
  body.variationSSIN = this.newData?.value?.appItem?.ssin;
  body.qty = this.selectedQuantity;
  body.price = this.selectedPrice;
  body.transactionId = this.orderId;
  body.transactionType = this.appTransactionsForViewDto?.transactionType;

  this._AppTransactionServiceProxy.addVariationToTransaction(body)
    .pipe(finalize(() =>  {
        this.selectedVariation = '';
  this.selectedQuantity = 0;
  this.selectedPrice = 0
  this.amount = 0;
  // this.filterForm.value.reset()
  // this.hideMainSpinner()
  this.getShoppingCartData();
  this.showSaveCancel = false

    }))
    .subscribe((res) => {
      console.log(this.displayedVariations, 'displayedVariations');
      // Handle post-save logic here
    });
    this.addNewLinebtn = true
}

cancelAddLine() {
  this.addLine = true
  this.showAddLine = false;
  this.showSaveCancel = false;
 
  this.addNewLinebtn = true
 
    this.selectedVariation = '';
    this.filterForm.controls['selectedQuantity']?.setValue(0);
    this.filterForm.controls['selectedPrice']?.setValue(0);

    this.selectedQuantity = 0;

  this.selectedPrice = 0
  this.amount = 0;
  this.shoppingCartTreeNodes.pop(); // Removes the last item
  this.shoppingCartTreeNodes = [...this.shoppingCartTreeNodes];
  // Reset selections as needed
}

cancelsaveLine() {
  this.addLine = true
  this.showAddLine = false;
  this.showSaveCancel = false;
 
  this.addNewLinebtn = true
 
    this.selectedVariation = '';
    this.filterForm.controls['selectedQuantity']?.setValue(0);
    this.filterForm.controls['selectedPrice']?.setValue(0);

    this.selectedQuantity = 0;

  this.selectedPrice = 0
  this.amount = 0;
  
}

  
  // loadCommentsList() {
  //   const screenWidth = window.innerWidth;
  //   const tabletWidth = 768; // iPads and tablets
  //   // this.commentParentComponent.show(this.postCreatorUserId,this.orderId,this.parentId,this.threadId)
  //  //if(screenWidth <= tabletWidth)
  //   this.commentParentComponent?.first?.show(this.appTransactionsForViewDto.creatorUserId, this.orderId, undefined, undefined)
    
  //   //else 
  //     this.commentParentComponent?.last?.show(this.appTransactionsForViewDto.creatorUserId, this.orderId, undefined, undefined)
      
  // }

// ensureCommentsComponentReady(): Promise<void> {
//     return new Promise((resolve) => {
//         const checkInterval = setInterval(() => {
//             if (this.commentParentComponent?.first && this.commentParentComponent?.last) {
//                 clearInterval(checkInterval);
//                 resolve();
//             }
//         }, 10);
//     });
// }

getCommentsRefreshed (event){
  if(event){
    this.loadCommentsList()
  }
}
loadCommentsList() {
  setTimeout(() => {
      if (this.commentParentComponent?.first && this.commentParentComponent?.last) {
          this.commentParentComponent?.first?.show(
              this.appTransactionsForViewDto.creatorUserId,
              this.orderId
          );
          this.commentParentComponent?.last?.show(
              this.appTransactionsForViewDto.creatorUserId,
              this.orderId
          );
      }
  }, 200);
}


  show(orderId: number, showCarousel: boolean = false, validateOrder: boolean = false, shoppingCartMode: ShoppingCartMode= ShoppingCartMode.createOrEdit) {

    this.showMainSpinner();
    if( ! (this.companeyNames && this.companeyNames?.length>0)){
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
        0,
        undefined,false, null
    )
    .subscribe((res2: PagedResultDtoOfGetAccountInformationOutputDto) => {
      this.companeyNames= [...res2.items];
    });
  }


    this.resetData();
    this.orderId = orderId;
    this.loadNotesComp = true;
    this.showCarousel = showCarousel;
    this.validateOrder = validateOrder;
    this.shoppingCartMode = 0;

    this.onshare = false;


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

 /*  resetTabValidation() {
    var valid: boolean = false;

    if (this.shoppingCartDetails?.entityStatusCode?.toUpperCase() == 'OPEN')tabs
      valid = true;

    this.orderInfoValid = valid;
    this.buyerContactInfoValid = valid;
    this.SellerContactInfoValid = valid;
    this.SalesRepInfoValid = valid;
    this.shippingInfOValid = valid;
    this.BillingInfoValid = valid;
  } */

  resetData() {
   // this.resetTabValidation();
    this.activeIndex = -1;
 this.currentTab=-1;
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
    this.appTransactionsForViewDto=null;
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
this.temp=temp;
    this.showMainSpinner();
    //header
    this._AppTransactionServiceProxy.getAppTransactionsForView(this.orderId, false, 0, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, false,undefined,Intl.DateTimeFormat().resolvedOptions().timeZone, undefined, 0, 10, this.transactionPosition.Current)
    .pipe(finalize(() => {
this.hideMainSpinner();
    }))
    .subscribe((res: GetAppTransactionsForViewDto) => {
         res.companeyNames=this.companeyNames;
          this.appTransactionsForViewDto = res;

          /// set validations 
          this.orderInfoValid = this.appTransactionsForViewDto.isOrderInformationValid;
          this.buyerContactInfoValid = this.appTransactionsForViewDto.isBuyerContactInformationValid;
          this.SellerContactInfoValid = this.appTransactionsForViewDto.isSellerContactInformationValid;
          this.SalesRepInfoValid = (this.transactionType == "Sales Order" && this.appTransactionsForViewDto?.enteredByUserRole.toString().includes("Independent Sales Rep"))  ?  this.SalesRepInfoValid  : this.appTransactionsForViewDto.isSalesRepInformationValid ;
          this.shippingInfOValid = this.appTransactionsForViewDto.isShippingInformationValid;
          this.BillingInfoValid = this.appTransactionsForViewDto.isBillingInformationValid;
          ///
          this.isOwnedByMe= res.isOwnedByMe;
          this.canChange= this.isOwnedByMe
           this.transactionCode=res?.code;
           if (res?.entityAttachments?.length > 0)
            this._transactionFormPath = res?.entityAttachments[0]?.url? this.attachmentBaseUrl +"/"+ res?.entityAttachments[0]?.url : "";
             this.loadCommentsList()

              //Currency
    this._AppEntitiesServiceProxy.getCurrencyInfo(res.currencyCode)
    .subscribe((res: CurrencyInfoDto) => {
        this.currencySymbol = res.symbol ? res.symbol : res.code  ;
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

  getLinesData(){
     //lines
   if  ((this.showTabs && this.activeIndex==6 ) || (!this.showTabs && this.activeIndex==0 )){
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
        console.log(this.shoppingCartTreeNodes,'llll')
       this?.shoppingCartDetails?.totalAmount % 1 == 0 ? this.shoppingCartDetails.totalAmount = parseFloat(Math.round(this.shoppingCartDetails.totalAmount * 100 / 100).toFixed(2)) : null;

       this.userClickService.userClicked("refreshShoppingInfoInTopbar");
       if (res.transactionType == TransactionType.PurchaseOrder)
         this.transactionType = "Purchase Order";

       if (res.transactionType == TransactionType.SalesOrder)
         this.transactionType = "Sales Order";

         this.SalesRepInfoValid = (this.transactionType == "Sales Order" && this.appTransactionsForViewDto?.enteredByUserRole.toString().includes("Independent Sales Rep"))  ?  this.SalesRepInfoValid  : true ;


       if (!this.temp) this.shoppingCartTreeNodes = res.detailsView;
       else this.shoppingCartTreeNodes = this.temp;

       this.colors = res.colors;
       this.sizes = res.sizes;
     });
  }
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
  
      console.log('Third-Level Variations:', thirdLevelVariations); 
      this.shoppingCartTreeNodes = thirdLevelVariations
  
      // Now, you can use `thirdLevelVariations` to display the variations or process them
    } 
   } else {
    this.getShoppingCartData();
   }

}


  onContinueShopping() {
    if (this.validateOrder && this.shoppingCartTreeNodes)
      this.validateShoppingCart();
    if (this.appTransactionsForViewDto?.sellerCompanySSIN) {
      localStorage.setItem(
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
     // this.router.navigateByUrl("app/main/marketplace/products");

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
    console.log(rowNode,'rowNode')
    if(rowNode?.node?.data?.added) {
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
      this.showSaveCancel = false;
     
     
        this.selectedVariation = '';
      this.selectedQuantity = 0;
      this.selectedPrice = 0
      this.amount = 0;
      this.shoppingCartTreeNodes.pop(); // Removes the last item
      this.shoppingCartTreeNodes = [...this.shoppingCartTreeNodes];
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
                  // this.onGeneratOrderReport(true,undefined,false,true);
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
                  // this.onGeneratOrderReport(true,undefined,false,true);
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
                  // this.onGeneratOrderReport(true,undefined,false,true);
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


    if(rowNode.node.data.added) { 


      this.selectedQuantity =     rowNode.node.data.updatedQty
      this.updateAmount()

      rowNode.node.data.amount =  this.amount
      rowNode.node.data.qty =  this.selectedQuantity 
      rowNode.node.data.showEditQty = false;

    }else {

    
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
            // this.onGeneratOrderReport(true,undefined,false,true);
            rowNode.node.data.showEditQty = false;
            this.getShoppingCartData();
            this.hideMainSpinner();
          });
        break;

      case 1:
        this.showMainSpinner();
        // let moduleQty =
        //   rowNode.node.data.updatedQty %
        //   rowNode.node.data.noOfPrePacks;

        let moduleQty =
        rowNode.node.data.updatedQty % (
        rowNode.node.data.qty/  rowNode.node.data.noOfPrePacks);
        // let qty =
        //   rowNode.node.data.updatedQty /
        //   rowNode.node.data.noOfPrePacks 
        let qty=rowNode.node.data.updatedQty ;
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
              // this.onGeneratOrderReport(true,undefined,false,true);
              this.getShoppingCartData();
              // rowNode.node.data.showEditQty = false;
              this.hideMainSpinner();
            });
        } else {
          // rowNode.node.data.invalidUpdatedQty =
          //   "The quantity must be divisible by the prepack (" +
          //   rowNode.node.data.noOfPrePacks +
          //   ")";
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
    let indx = -1;
    indx = this.minimizedOrders?.findIndex(x => x.orderId == this.appTransactionsForViewDto?.id);
    if (indx >= 0)
      this.minimizedOrders.splice(indx, 1);
    this.userClickService.userClicked("refreshShoppingInfoInTopbar");
    // if (this.shoppingCartMode == ShoppingCartMode.view)
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
    //  this.minimize = true;
    this.modal.hide();
  }

  maximizeScreen(orderId: number) {
    // this.minimize = false;
    let indx = -1;
    indx = this.minimizedOrders?.findIndex(x => x.orderId == orderId);
    if (indx >= 0)
      this.minimizedOrders.splice(indx, 1);
    if(this.appTransactionsForViewDto?.entityStatusCode =="DRAFT") {
      this.show(orderId, this.showCarousel, this.validateOrder, ShoppingCartMode.createOrEdit);
    } else {
        this.show(orderId, this.showCarousel, this.validateOrder, ShoppingCartMode.view);
}
  }

  onProceedToCheckout() {
    this.showMainSpinner();
    this._AppTransactionServiceProxy.getAppTransactionsForView(this.orderId, false, 0, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, false,undefined, undefined,Intl.DateTimeFormat().resolvedOptions().timeZone, undefined, 0, 10, this.transactionPosition.Current)
      .subscribe((res: GetAppTransactionsForViewDto) => {
        res.companeyNames=this.companeyNames;
        this.appTransactionsForViewDto = res;
        // this.onGeneratOrderReport(true,undefined,false,true);
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
            localStorage.removeItem("comNew");
            localStorage.removeItem("conNew");
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
        localStorage.removeItem("comNew");
        localStorage.removeItem("conNew");
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

                // this.toGenerate();
      this.onGeneratOrderReport(true,undefined,true,true)
                this.getOrderConfirmation();
            }  else {
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
    // Swal.fire({
    //   title: "",
    //   text: "Are you sure that you want to place the order?",
    //   icon: "info",
    //   showCancelButton: true,
    //   confirmButtonText: "Yes",
    //   cancelButtonText: "No",
    //   allowOutsideClick: false,
    //   allowEscapeKey: false,
    //   backdrop: true,
    //   customClass: {
    //     popup: 'popup-class',
    //     icon: 'icon-class',
    //     content: 'content-class',
    //     actions: 'actions-class',
    //     confirmButton: 'confirm-button-class2',

    //   },
    // }).then((result) => {
    //   if (result.isConfirmed) {
        this.showMainSpinner();
        this.appTransactionsForViewDto.lFromPlaceOrder = true;
        this.appTransactionsForViewDto.timeZoneValue = Intl.DateTimeFormat().resolvedOptions().timeZone; 
        this._AppTransactionServiceProxy.createOrEditTransaction(this.appTransactionsForViewDto)
          .pipe(finalize(() => {

            this.onGeneratOrderReport(true,undefined,true,true);
         
            localStorage.removeItem("comNew");
            localStorage.removeItem("conNew");
         //   this.hide();
         this.show(this.orderId, this.showCarousel, this.validateOrder, this._shoppingCartMode.view);
         this.getShoppingCartData()


        }
          ))
          .subscribe((res) => {

            if (res) {
            this.getShoppingCartData()

            this.hideMainSpinner();

              this.visible = false
              this.SuccessMsg = true

            //   Swal.fire({
            //     title: "",
            //     text: "Order #" + this.transactionCode + " has been placed successfully",
            //     icon: "success",
            //     showCancelButton: false,
            //     confirmButtonText: "OK",
            //     allowOutsideClick: false,
            //     allowEscapeKey: false,
            //     backdrop: true,
            //     customClass: {
            //       popup: 'popup-class',
            //       icon: 'icon-class',
            //       content: 'content-class',
            //       actions: 'actions-class',
            //       confirmButton: 'confirm-button-class2',
            //     },
            //   }).then((result) => {
            //     if (result.isConfirmed) {
            //     }
            //   });
            }
          });
    //   }
    // });
  }
  toGenerate(){
    this._AppTransactionServiceProxy.createOrEditTransaction(this.appTransactionsForViewDto)
    .pipe(finalize(() => {
      // this.getOrderConfirmation()
  }
    ))
    .subscribe((res) => {

      // if (res) {
      // }
    });
  }
  sync(){
    this.showMainSpinner();
    this._AppTransactionServiceProxy.syncTransaction(this.orderId)
      .pipe(finalize(() => {
        this.hideMainSpinner()
        this.getShoppingCartData();
        this.syncMsg = true

      } ))
      .subscribe((res) => {
        // if (res) {
        //   Swal.fire({
        //     title: "",
        //     text:  "Transaction has been sync successfully",
        //     icon: "success",
        //     showCancelButton: false,
        //     confirmButtonText: "OK",
        //     allowOutsideClick: false,
        //     allowEscapeKey: false,
        //     backdrop: true,
        //     customClass: {
        //       popup: 'popup-class',
        //       icon: 'icon-class',
        //       content: 'content-class',
        //       actions: 'actions-class',
        //       confirmButton: 'confirm-button-class2',
        //     },
        //   }).then((result) => {
        //     if (result.isConfirmed) {
        //     }
        //   });
        // }
      });
    
  }
  goPrevious_Next_Transaction(transactionPosition: TransactionPosition) {
    this.showMainSpinner();
    this._AppTransactionServiceProxy.getAppTransactionsForView(this.orderId, false, 0, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, false,undefined, undefined,Intl.DateTimeFormat().resolvedOptions().timeZone, undefined, 0, 1, transactionPosition)
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
    this.currentTab= this.activeIndex ;
  }

  refreshShoppingCart(event) {
    if (this.appTransactionsForViewDto?.entityStatusCode?.toUpperCase() == 'OPEN') {

    if (event) {
    this.getShoppingCartData()
      }
  
    }
  }
  
  onChangeAppTransactionsForViewDto($event) {
    $event.companeyNames=this.companeyNames;
    this.appTransactionsForViewDto = $event;
  }

  TempCompValid($event) {
   if($event && this.appTransactionsForViewDto?.buyerCompanySSIN == '') {
    this.TempComp = $event;
    
   }
  }

  printTransaction() {
    // var page = window.open(this._transactionFormPath);
    // page.print();
    this._AppTransactionServiceProxy.isOrderConfirmationNeedsReprint(this.orderId)
    .subscribe((res) => {
        if (res == true) {

          this.showMainSpinner()
          this.onGeneratOrderReport(true,undefined,true,false,true)
        

        }  else {
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
   
        }
    });

  }

  onShareTransaction() {
    this.onshare = true;
  }
  offShareTransaction() {
    this.onshare = false;
  }
  async onGeneratOrderReport($event, printInfoParam?: ProductCatalogueReportParams, FromPlaceOrder?: boolean, refreshData: boolean = true,printTrans:boolean = false) {
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
            this._AppTransactionServiceProxy.getTenantRoleInTransaction(this.orderId,this.appTransactionsForViewDto.tenantId).subscribe((res) => {
                this.printInfoParam.orderConfirmationRole = res.contactRole;
                this.printInfoParam.contactName = res.contactName;
           
 
                
                // Ensure dependent logic is executed after the async operation
                this.reportUrl = this.printInfoParam.getReportUrl();
                this.createReportViewer();

                if (refreshData) {
                    this.getShoppingCartData();
                }
                if(printTrans){
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
                  },10000)
                }
            });

            // Any logic dependent on the above call must be moved here
        }
    }
}

  getOrderConfirmation(){
    this.transactionFormPath="";
     this.transactionFormPath=this._transactionFormPath;
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


}
