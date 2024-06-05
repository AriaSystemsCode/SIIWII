import { Component, EventEmitter, Injector, OnDestroy, OnInit, Output, ViewChild, ViewChildren } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AppItemViewInput } from "@app/main/app-items/app-item-view/models/app-item-view-input";
import { AppConsts } from "@shared/AppConsts";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    AppEntitiesServiceProxy,
    AppEntityAttachmentDto,
    AppItemForViewDto,
    AppItemsServiceProxy,
    AppMarketplaceItemForViewDto,
    AppMarketplaceItemsServiceProxy,
    AppTransactionServiceProxy,
    CurrencyInfoDto,
    GetAppMarketplaceItemDetailForViewDto,
    MarketplaceExtraDataAttrDto,
    ShoppingCartSummary,
    TransactionType,
} from "@shared/service-proxies/service-proxies";
import { UserClickService } from "@shared/utils/user-click.service";
import { MessageService } from "abp-ng2-module";
import { throws } from "assert";
import { ConfirmEventType, ConfirmationService } from "primeng/api";
import { finalize } from "rxjs/operators";
import Swal from "sweetalert2";

@Component({
    selector: "app-marketplace-view-product",
    templateUrl: "./marketplace-view-product.component.html",
    styleUrls: ["./marketplace-view-product.component.scss"],
    providers: [ConfirmationService, MessageService]
})
export class MarketplaceViewProductComponent
    extends AppComponentBase
    implements OnInit, OnDestroy {
    // productId: number;
    // skipCount: number = 0;
    // maxResultCount: number = 10;
    // appItemViewInput: AppItemViewInput;
    // _appItemViewInput: AppItemViewInput = {
    //     header: this.l("MarcketplaceProductDetailView"),
    //     marketPlace: true,
    //     appItemForViewDto: new AppItemForViewDto(),
    //     publish: false,
    // };

    productBodyData: any;
    productImages: AppEntityAttachmentDto[];
    productDetails: any;
    colorsData: any[];
    currentIndex: number = 0;
    attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
    translateX = 0;
    orderSummary: any = [];
    colorAttachmentForMainIamge: string = "";
    orderType: string = "";
    productVarImages: MarketplaceExtraDataAttrDto[];
    currencySymbol: string = "";
    showEditSpecialPrice:boolean=true;
    updatedSpecialPrice:number=0;
    chk_Order_by_prepack: boolean = true;
    public constructor(
        private _AppMarketplaceItemsServiceProxy: AppMarketplaceItemsServiceProxy,
        private _AppTransactionServiceProxy: AppTransactionServiceProxy,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private userClickService: UserClickService,
        private router: Router,
        injector: Injector
    ) {
        super(injector);
        this.productBodyData = JSON.parse(localStorage.getItem("productData"));
        this.getProductDetailsForView();
    }
    ngOnInit(): void {
        // this.productId = this._activatedRoute.snapshot.params["id"];
        // this.showMainSpinner();
        // const subs = this._appItemsServiceProxy
        //     .getAppItemForView(
        //         undefined,
        //         0,
        //         undefined,
        //         undefined,
        //         undefined,
        //         undefined,
        //         undefined,
        //         undefined,
        //         this.productId,
        //         undefined,
        //         undefined,
        //         undefined,
        //         undefined,
        //         undefined,
        //         undefined,
        //         undefined,
        //         undefined,
        //         undefined,
        //         undefined,
        //         this.skipCount,
        //         this.maxResultCount
        //     )
        //     .pipe(
        //         finalize(() => {
        //             this.hideMainSpinner();
        //         })
        //     )
        //     .subscribe((result) => {
        //         this._appItemViewInput.appItemForViewDto = result.appItem;
        //         this.appItemViewInput = this._appItemViewInput;
        //     });
        // this.subscriptions.push(subs);
    }

    getProductDetailsForView() {
        this.showEditSpecialPrice=true;
        this._AppTransactionServiceProxy.getCurrentUserActiveTransaction()
            .subscribe((res: ShoppingCartSummary) => {
                if (res.orderType == TransactionType.SalesOrder)
                    this.orderType = 'SO';
                else if (res.orderType == TransactionType.PurchaseOrder)
                    this.orderType = 'PO';

                if (res.buyerSSIN)
                    this.productBodyData.buyerSSIN = res.buyerSSIN;
                if (res.sellerSSIN)
                    this.productBodyData.sellerSSIN = res.sellerSSIN;

                if (res.currencyCode)
                    this.productBodyData.currencyCode = res.currencyCode;
                this._AppMarketplaceItemsServiceProxy
                    .getMarketplaceAppItemForView(
                        undefined,
                        0,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        this.productBodyData.currencyCode,
                        this.productBodyData.buyerSSIN,
                        this.productBodyData.sellerSSIN,
                        this.productBodyData.id,
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
                    .subscribe((res: GetAppMarketplaceItemDetailForViewDto) => {
                        this.productDetails = res.appItem;
                        this.updatedSpecialPrice = this.productDetails.minSpecialPrice;
                        this.productDetails?.minMSRP % 1 ==0?this.productDetails.minMSRP=Math.round(this.productDetails.minMSRP * 100 / 100).toFixed(2):null; 
                        this.productDetails?.maxMSRP % 1 ==0?this.productDetails.maxMSRP=Math.round(this.productDetails.maxMSRP * 100 / 100).toFixed(2):null; 
                        this.productImages = res.appItem.entityAttachments;
                        this.productVarImages = res?.appItem?.variations;
                        let colorVariation: any[] = res.appItem.variations.filter(
                            (variation: any) => variation.extraAttrName === "COLOR"
                        );
                        let selectedValues = [
                            ...colorVariation.map(
                                (selected: any) => selected.selectedValues
                            ),
                        ];

                        this.colorsData = selectedValues[0].map((variation: any) => {
                            let sizesValue = variation.edRestAttributes.map(
                                (attr: any) => {
                                    if (attr.extraAttrName === "SIZE") {
                                        return [...attr.values];
                                    }
                                }
                            );
                            return {
                                colorName: variation.value,
                                sizes: sizesValue[0],
                                colorImg: variation.colorImage,
                                colorCode: variation.colorHexaCode,
                            };
                        });
                    });

                this.GetCurrencyInfo();
            }
            );
    }

    GetCurrencyInfo() {
        this._AppEntitiesServiceProxy.getCurrencyInfo(this.productBodyData.currencyCode)
            .subscribe((res: CurrencyInfoDto) => {
                this.currencySymbol = res.symbol ? res.symbol : res.code  ;
            });
    }

    isColorView: boolean = false
    setSizes(index: number) {
        this.currentIndex = index;
        this.isColorView = false
        this.colorAttachmentForMainIamge = this.colorsData[index].colorImg;
        this.productImages = this.productVarImages[0]?.selectedValues[this.currentIndex].entityAttachments;
        console.log(this.colorsData[index]);
    }
    setColorView(value: boolean) {
        this.isColorView = value
    }

    slideToNextImage(): void {
        this.currentIndex = (this.currentIndex + 1) % this.colorsData.length;
        this.translateX = -this.currentIndex * 60; // Adjust the width of each image as needed
        this.isColorView = true
        this.colorAttachmentForMainIamge = this.colorsData[this.currentIndex].colorImg;
        this.setSizes( this.currentIndex)
    }

slideToPreviousImage(): void {
    // Update currentIndex and translateX
    this.currentIndex = (this.currentIndex - 1 + this.colorsData.length) % this.colorsData.length;
    this.translateX = -this.currentIndex * 60; // Adjust the width of each image as needed
    this.isColorView = true;
    this.colorAttachmentForMainIamge = this.colorsData[this.currentIndex].colorImg;
    this.setSizes( this.currentIndex)
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
            if (summary.color.colorName === color.colorName) {
                foundColor = true;
            }
        });
        if (!foundColor) {
            this.orderSummary.push(orederedMappedData);
        }
       if (!(this.orderType == 'SO'  &&  this.productDetails?.orderByPrePack && !this.chk_Order_by_prepack ) ) {
            this.productDetails.variations.map((variation: any) => {
                if (variation.extraAttrName === "COLOR") {
                    variation.selectedValues.forEach((value) => {
                        if (
                            value.value ===
                            this.colorsData[this.currentIndex].colorName
                        ) {
                            value.edRestAttributes.forEach((attr) => {
                                if (attr.extraAttrName === "SIZE") {
                                    attr.values.forEach((sizeValue) => {
                                        sizeValue.orderedPrePacks =
                                            this.colorsData[
                                                this.currentIndex
                                            ]?.sizes[0].orderedPrePacks;
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

    // total of all order qty and price in order by size and prepack
    totalOrderQTY: number = 0;
    totlaOrderPrices: number = 0;
    calculateTotalOrderPriceAndQty(orders: any) {
        let qty = 0;
        let price = 0;
        orders.map((order: any) => {
            order.color.sizes.map((size) => {
                if (this.productDetails.orderByPrePack) {
                    
                    let multiby =
                        size.sizeRatio * order.color.sizes[0].orderedPrePacks;
                    let priceMultibly = multiby * size.price;
                    qty = qty + multiby;
                    price = price + priceMultibly;
                } else {
                    if (!size.orderedQty)
                      size.orderedQty = 0
                    let priceMultibly = size.orderedQty * size.price;
                    qty = qty + size.orderedQty;
                    price = price + priceMultibly;
                }

                this.totalOrderQTY = qty;
                this.totlaOrderPrices = price;
            });
        });
    }

    removeColor(color, i: number) {
        this.currentIndex =
            this.orderSummary.length === 0 ? 0 : color.colorIndex;
        if (!this.productDetails?.orderByPrePack) {
            // this.totalOrderQTY  = this.totalOrderQTY - this.cal
            let qty = 0;
            let price = 0;
            this.orderSummary[i].color.sizes.map((size) => {
                let priceMultibly = size.orderedQty * size.price;
                qty = qty + size.orderedQty;
                price = price + priceMultibly;
            });
            this.totlaOrderPrices = this.totlaOrderPrices - price;
            this.totalOrderQTY = this.totalOrderQTY - qty;
            this.colorsData[color.colorIndex].sizes.forEach((element) => {
                element.orderedQty = 0;
            });
        } else {
            let qty = 0;
            let price = 0;
            this.orderSummary[i].color.sizes.map((size) => {
                let multiby =
                    size.sizeRatio *
                    this.orderSummary[i].color.sizes[0].orderedPrePacks;
                let priceMultibly = multiby * size.price;
                qty = qty + multiby;
                price = price + priceMultibly;
            });
            this.totlaOrderPrices = this.totlaOrderPrices - price;
            this.totalOrderQTY = this.totalOrderQTY - qty;
            this.colorsData[color.colorIndex].sizes[0].orderedPrePacks = 0;
        }
        this.orderSummary.splice(i, 1);
    }

    removeSize(sizeIndex: number, size, color, orderIndex: number) {
        console.log(
            ">> size",
            this.orderSummary[orderIndex].color.sizes[sizeIndex].orderedQty
        );
        this.currentIndex = color.colorIndex;
        this.totalOrderQTY =
            this.totalOrderQTY -
            this.orderSummary[orderIndex].color.sizes[sizeIndex].orderedQty;
        let amount =
            this.orderSummary[orderIndex].color.sizes[sizeIndex].orderedQty *
            this.orderSummary[orderIndex].color.sizes[sizeIndex].price;
        this.totlaOrderPrices = this.totlaOrderPrices - amount;
        this.orderSummary[orderIndex].color.sizes[sizeIndex].orderedQty = 0;
    }

    // total ordered QTY in order by size
    calculateOrderedQTYSum(sizes): number {
        let sum = 0;
        sizes.forEach((item) => {
            sum += item.orderedQty;
        });
        return sum;
    }

    // total ordered Price in order by size
    calculatePriceSum(sizes): number {
        let sum:any = 0;
        sizes.forEach((item) => {
            let multiby = item.price * item.orderedQty;
            sum = sum + multiby;
        });
        return sum;
    }

    // totla ratios in order by prepack
    getTotlaPrepackSum() {
        let sum:any = 0;
        this.colorsData[this.currentIndex].sizes.forEach((item) => {
            sum = sum + item.sizeRatio;
        });
        //console.log('first pack ' , sum)
        //sum=Math.round(sum * 100 / 100).toFixed(2);
        //console.log('second pack ' , sum)

        return sum;
    }

    // totla ordered prepack QTY
    calculatePrepackOrderedQTYSum(prepackSizes: any, orderIndex: number) {
        let sum = 0;
        prepackSizes.forEach((item) => {
            let multiby =
                item.sizeRatio *
                this.orderSummary[orderIndex]?.color.sizes[0].orderedPrePacks;
            sum = sum + multiby;
        });

        return sum;
    }

    // totla amount for each size in order by prepack
    getTotalPrepackSizeAmount(prepackSizes: any, orderIndex: number) {
        let sum = 0;
        prepackSizes.forEach((item) => {
            let multiby =
                item.sizeRatio *
                this.orderSummary[orderIndex]?.color.sizes[0].orderedPrePacks;
            let amount = multiby * item.price;
            sum = sum + amount;
        });
        return sum;
    }

    scrollToTargetDiv() {
        const targetElement = document.getElementById("targetDiv");
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    }

    addToShoppingCart() {
        // this.confirmationService.confirm({
        //     message:
        //         "Are you sure Want to add ordered qunatities to you cart ?",
        //     icon: "pi pi-exclamation-triangle",
        //     accept: () => {
        //         let bodyRequest: any = {
        //             appItem: this.productDetails,
        //         };
        //         this.showMainSpinner();
        //         this._AppTransactionServiceProxy
        //             .addTransactionDetails(
        //                 localStorage.getItem("transNO"),
        //                 bodyRequest
        //             )
        //             .pipe(
        //                 finalize(() => {
        //                     this.hideMainSpinner();
        //                 })
        //             )
        //             .subscribe((res) => {
        //                 console.log(">>", res);
        //             });
        //     },
        //     reject: (type: ConfirmEventType) => { },
        // });



        Swal.fire({
            title: "",
            text: "Are you sure Want to add ordered qunatities to you cart ?",
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
                let bodyRequest: any = {
                    appItem: this.productDetails,
                };
                this.showMainSpinner();
                this._AppTransactionServiceProxy
                    .addTransactionDetails(
                        localStorage.getItem("transNO"), this.orderType,
                        bodyRequest
                    )
                    .pipe(
                        finalize(() => {
                            this.hideMainSpinner();
                            localStorage.setItem(
                                "SellerSSIN",
                                JSON.stringify(this.productBodyData.sellerSSIN)
                            );
                            localStorage.setItem(
                                "currencyCode",
                                JSON.stringify(this.productBodyData.currencyCode)
                            );

                            this.router.navigateByUrl("app/main/marketplace/products");
                        })
                    )
                    .subscribe(async (res) => {
                        console.log(">>", res);

                        this.userClickService.userClicked("refreshShoppingInfoInTopbar");

                    });
            }
        }
        )

    }

    goToShowroom() {
        localStorage.setItem(
            "SellerSSIN",
            JSON.stringify(this.productBodyData.sellerSSIN)
        );
        localStorage.setItem(
            "currencyCode",
            JSON.stringify(this.productBodyData.currencyCode)
        );

        this.router.navigateByUrl("app/main/marketplace/products");
    }
    onEditpecialPrice(updatedSpecialPrice){
        this.productDetails.variations.map((variation: any) => {
            if (variation.extraAttrName === "COLOR") {
                variation.selectedValues.forEach((value) => {
                        value.edRestAttributes.forEach((attr) => {
                            if (attr.extraAttrName === "SIZE") {
                                attr.values.forEach((sizeValue) => {
                                    sizeValue.price =updatedSpecialPrice;
                                });
                            }
                        });
                    
                });
            }
        });

        this.productDetails.minSpecialPrice=updatedSpecialPrice;
        this.productDetails.maxSpecialPrice= updatedSpecialPrice;
        this.showEditSpecialPrice= true
    }
    ngOnDestroy() {
        this.unsubscribeToAllSubscriptions();
        localStorage.removeItem("productData");
    }
}
