import { Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output, ViewChild, ViewChildren } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AppItemViewInput } from "@app/main/app-items/app-item-view/models/app-item-view-input";
import { ProductCatalogueReportParams } from "@app/main/app-items/appitems-catalogue-report/models/product-Catalogue-Report-Params";
import { animate, style, transition, trigger } from "@node_modules/@angular/animations";
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
import * as moment from "moment";
import { ConfirmEventType, ConfirmationService } from "primeng/api";
import { finalize } from "rxjs/operators";
import Swal from "sweetalert2";


@Component({
    selector: "app-marketplace-view-product",
    templateUrl: "./marketplace-view-product.component.html",
    styleUrls: ["./marketplace-view-product.component.scss"],
    providers: [ConfirmationService, MessageService],
    animations: [
        trigger('routerTransition', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('0.5s ease-in', style({ opacity: 1 })),
            ]),
            transition(':leave', [
                animate('0.5s ease-out', style({ opacity: 0 })),
            ]),
        ]),
    ],
})
export class MarketplaceViewProductComponent
    extends AppComponentBase
    implements OnInit, OnDestroy {
    activeTabIndex: number = 0;
    filterText = ''
    showIconClose: boolean = false
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
    showEditSpecialPrice: boolean = true;
    updatedSpecialPrice: number = 0;
    filteredColors: any[] = [];
    handleSCreenSelect: number = 0
    chk_Order_by_prepack: boolean[] = []
    visible: boolean = false;
    isFromSellerRoom: boolean
    ismarketPLace: boolean
    orderNo: any
    body: any
    buyerDataofPO: any
    buyerbranchPO: any
    sellerbranchPO: any
    alreadyOrderd: boolean = false
    productData: any;
    printInfoParam: ProductCatalogueReportParams = new ProductCatalogueReportParams()
    reportUrl = "";
    totalOrderQTY: number = 0;
    totlaOrderPrices: number = 0;
    isColorView: boolean = false
    priceLevel :any
    showSpecialPrice: boolean = false;
    languageSettingName  =AppConsts.languageSettingName;
    public constructor(
        private _AppMarketplaceItemsServiceProxy: AppMarketplaceItemsServiceProxy,
        private _AppTransactionServiceProxy: AppTransactionServiceProxy,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
        private userClickService: UserClickService,
        private router: Router,
        private _appTransactionServiceProxy: AppTransactionServiceProxy,
        private appItemsAppservice: AppItemsServiceProxy,
        injector: Injector
    ) {
        super(injector);
        this.isFromSellerRoom = JSON.parse(localStorage.getItem("fromSellerRoom"));
        this.ismarketPLace = JSON.parse(localStorage.getItem("fromMarketPlace"));
        this.productBodyData = JSON.parse(localStorage.getItem("productData"));
        this.priceLevel = localStorage.getItem("tempPriceLevel");
        this.getProductDetailsForView();
        this.filteredColors = this.colorsData;

    }
    ngOnInit(): void {
        this.showSpecialPrice = this.productBodyData?.sellerSSIN ? true : false;
        const screenWidth = window.innerWidth;
        if (screenWidth >= 992) { // lg screen
            this.handleSCreenSelect = 5
        } else if (screenWidth >= 768) { // md screen
            this.handleSCreenSelect = 3

        }

        this.filteredColors = this.colorsData;

        // this.IsVariationOrdered()
    }
    onFilterTextChanged() {
        this.showIconClose = this.filterText.trim() !== '';


        if (!this.filterText) {
            this.filteredColors = this.colorsData;
        } else {
            const filterTextLower = this.filterText?.toLowerCase();

            this.filteredColors = this.colorsData.filter(color =>
                (color?.colorName && color?.colorName?.toLowerCase()?.includes(filterTextLower)) ||
                (color?.colorCodeSelectedValues && color?.colorCodeSelectedValues?.toLowerCase()?.includes(filterTextLower))
            );
        }


    }

    clearFilterText(inputElement: HTMLInputElement) {
        this.filterText = '';
        this.filteredColors = this.colorsData;

        this.showIconClose = false;
        inputElement.focus();
    }
    getProductDetailsForView() {
        this.showMainSpinner();
        this.showEditSpecialPrice = true;
        this._AppTransactionServiceProxy.getCurrentUserActiveTransaction()
            .subscribe((res: ShoppingCartSummary) => {
                if (res?.orderType == TransactionType.SalesOrder)
                    this.orderType = 'SO';
                else if (res?.orderType == TransactionType.PurchaseOrder)
                    this.orderType = 'PO';

                if (res?.buyerSSIN)
                    this.productBodyData.buyerSSIN = res?.buyerSSIN;
                if (res?.sellerSSIN)
                    this.productBodyData.sellerSSIN = res?.sellerSSIN;

                if (res?.currencyCode)
                    this.productBodyData.currencyCode = res?.currencyCode;
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
                    .pipe(
                        finalize(() => {
                            this.hideMainSpinner();
                        })
                    )
                    .subscribe((res: GetAppMarketplaceItemDetailForViewDto) => {
                        this.productDetails = res?.appItem;
                        this.productData = res;
                        this.productDetails.maxSpecialPrice = this.productDetails?.maxSpecialPrice ? this.productDetails?.maxSpecialPrice : 0;
                        this.updatedSpecialPrice = this.productDetails?.maxSpecialPrice;
                        this.productDetails?.minMSRP % 1 == 0 ? this.productDetails.minMSRP = Math.round(this.productDetails?.minMSRP * 100 / 100).toFixed(2) : null;
                        this.productDetails?.maxMSRP % 1 == 0 ? this.productDetails.maxMSRP = Math.round(this.productDetails?.maxMSRP * 100 / 100).toFixed(2) : null;
                        this.productImages = res?.appItem?.entityAttachments;
                        this.productVarImages = res?.appItem?.variations;
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



                this.GetCurrencyInfo();
            }
            );
    }

    GetCurrencyInfo() {
        this._AppEntitiesServiceProxy.getCurrencyInfo(this.productBodyData?.currencyCode)
            .subscribe((res: CurrencyInfoDto) => {
                this.currencySymbol = res?.symbol ? res?.symbol : res?.code;
            });
    }

    setSizes(index: number) {
        this.currentIndex = index;
        this.isColorView = false
        this.colorAttachmentForMainIamge = this.colorsData[index]?.colorImg;
        this.productImages = this.productVarImages[0]?.selectedValues[this.currentIndex]?.entityAttachments;

    }
    setColorView(value: boolean) {
        this.isColorView = value
    }

    slideToNextImage(): void {
        this.currentIndex = (this.currentIndex + 1) % this.colorsData?.length;
        this.translateX = -this.currentIndex * 60; // Adjust the width of each image as needed
        this.isColorView = true
        this.colorAttachmentForMainIamge = this.colorsData[this.currentIndex]?.colorImg;
        this.setSizes(this.currentIndex)
        this.scrollIntoView();
    }

    slideToPreviousImage(): void {
        // Update currentIndex and translateX
        this.currentIndex = (this.currentIndex - 1 + this.colorsData?.length) % this.colorsData?.length;
        this.translateX = -this.currentIndex * 60; // Adjust the width of each image as needed
        this.isColorView = true;
        this.colorAttachmentForMainIamge = this.colorsData[this.currentIndex]?.colorImg;
        this.setSizes(this.currentIndex)
        this.scrollIntoView();

    }
    scrollIntoView(): void {
        setTimeout(() => {
            const activeElement = document.querySelector('.slider .border-primary');
            if (activeElement) {
                activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }, 100); // Small delay to allow rendering
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
    // total of all order qty and price in order by size and prepack
    calculateTotalOrderPriceAndQty(orders: any) {
        let qty = 0;
        let price = 0;
        orders.map((order: any) => {
            order.color.sizes.map((size, index) => {

                if (!this.productDetails?.orderByPrePack) {
                    if (!size.orderedQty)
                        size.orderedQty = 0
                    let priceMultibly = size.orderedQty * size.price;
                    qty = qty + size.orderedQty;
                    price = price + priceMultibly;
                }
                else {
                    if (!(this.orderType == 'SO' && this.productDetails?.orderByPrePack && !this.chk_Order_by_prepack[order.colorIndex])) {
                        let multiby =
                            size.sizeRatio * order.color.sizes[index].orderedPrePacks;
                        let priceMultibly = multiby * size.price;
                        qty = qty + multiby;
                        price = price + priceMultibly;
                    } else {
                        if (!size.orderedPrePacks)
                            size.orderedPrePacks = 0
                        let priceMultibly = size.orderedPrePacks * size.price;
                        qty = qty + size.orderedPrePacks;
                        price = price + priceMultibly;
                    }
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
        }

        else {
            if ((this.orderType == 'SO' && this.productDetails?.orderByPrePack && !this.chk_Order_by_prepack[color.colorIndex])) {
                // this.totalOrderQTY  = this.totalOrderQTY - this.cal
                let qty = 0;
                let price = 0;
                this.orderSummary[i].color.sizes.map((size) => {
                    let priceMultibly = size.orderedPrePacks * size.price;
                    qty = qty + size.orderedPrePacks;
                    price = price + priceMultibly;
                });
                this.totlaOrderPrices = this.totlaOrderPrices - price;
                this.totalOrderQTY = this.totalOrderQTY - qty;
                this.colorsData[color.colorIndex].sizes.forEach((element) => {
                    element.orderedPrePacks = 0;
                });
            } else {
                let qty = 0;
                let price = 0;
                this.orderSummary[i].color.sizes.map((size, index) => {
                    let multiby =
                        size.sizeRatio *
                        this.orderSummary[i].color.sizes[index].orderedPrePacks;
                    let priceMultibly = multiby * size.price;
                    qty = qty + multiby;
                    price = price + priceMultibly;
                });

                this.totlaOrderPrices = this.totlaOrderPrices - price;
                this.totalOrderQTY = this.totalOrderQTY - qty;
                this.colorsData[color.colorIndex].sizes[0].orderedPrePacks = 0;
            }
        }
        this.orderSummary.splice(i, 1);
    }

    removeSize(sizeIndex: number, size, color, orderIndex: number) {
        this.currentIndex = color.colorIndex;
        let amount = 0;

        if (!this.productDetails?.orderByPrePack) {
            this.totalOrderQTY =
                this.totalOrderQTY -
                this.orderSummary[orderIndex].color.sizes[sizeIndex].orderedQty;
            amount =
                this.orderSummary[orderIndex].color.sizes[sizeIndex].orderedQty *
                this.orderSummary[orderIndex].color.sizes[sizeIndex].price;
        }

        else {
            if ((this.orderType == 'SO' && this.productDetails?.orderByPrePack && !this.chk_Order_by_prepack[color.colorIndex])) {
                this.totalOrderQTY =
                    this.totalOrderQTY -
                    this.orderSummary[orderIndex].color.sizes[sizeIndex].orderedPrePacks;
                amount =
                    this.orderSummary[orderIndex].color.sizes[sizeIndex].orderedPrePacks *
                    this.orderSummary[orderIndex].color.sizes[sizeIndex].price;
            }
            else {
                this.totalOrderQTY =
                    this.totalOrderQTY -
                    (this.orderSummary[orderIndex].color.sizes[sizeIndex].sizeRatio * this.orderSummary[orderIndex].color.sizes[sizeIndex].orderedPrePacks);

                amount =
                    this.orderSummary[orderIndex].color.sizes[sizeIndex].sizeRatio * this.orderSummary[orderIndex].color.sizes[sizeIndex].orderedPrePacks *
                    this.orderSummary[orderIndex].color.sizes[sizeIndex].price;
            }
        }
        this.totlaOrderPrices = this.totlaOrderPrices - amount;
        this.orderSummary[orderIndex].color.sizes[sizeIndex].orderedQty = 0;
        this.orderSummary[orderIndex].color.sizes[sizeIndex].orderedPrePacks = 0;

        if (sizeIndex == 0 && this.orderSummary[orderIndex].color.sizes?.length > 0) {
            const sizes = this.colorsData[this.currentIndex].sizes;
            const preorderIndex = (this.orderType == 'SO' && this.productDetails?.orderByPrePack && !this.chk_Order_by_prepack[this.currentIndex]) ? sizes.findIndex(size => size.orderedQty) : sizes.findIndex(size => size.orderedPrePacks);

            if (preorderIndex > 0) {
                const [preorderItem] = sizes.splice(preorderIndex, 1);
                sizes.unshift(preorderItem);
            }
        }
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
        let sum: any = 0;
        sizes.forEach((item) => {
            let multiby = item?.price * item?.orderedQty;
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

    // totla ordered prepack QTY
    calculatePrepackOrderedQTYSum(prepackSizes: any, orderIndex: number, colorIndex: number) {
        let sum = 0;
        prepackSizes.forEach((item, index) => {
            let multiby;
            if (this.orderType == 'SO' && this.productDetails?.orderByPrePack && !this.chk_Order_by_prepack[colorIndex])
                multiby = item.orderedPrePacks;

            else
                multiby =
                    item.sizeRatio *
                    this.orderSummary[orderIndex]?.color?.sizes[index]?.orderedPrePacks;

            sum = sum + multiby;
        });
        return sum;
    }

    // totla amount for each size in order by prepack
    getTotalPrepackSizeAmount(prepackSizes: any, orderIndex: number, colorIndex: number) {
        let sum = 0;
        prepackSizes.forEach((item, index) => {
            let multiby;
            if (this.orderType == 'SO' && this.productDetails?.orderByPrePack && !this.chk_Order_by_prepack[orderIndex])
                multiby = item?.orderedPrePacks;

            else
                multiby =
                    item.sizeRatio *
                    this.orderSummary[orderIndex]?.color?.sizes[index]?.orderedPrePacks;

            let amount = multiby * item.price;
            sum = sum + amount;
        });
        return sum;
    }
    goToSummary() {
        this.activeTabIndex = 1;
        setTimeout(() => {
            const targetElement = document.getElementById("targetDiv2");
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        }, 100); // Adjust the delay as needed based on your tab switch animation

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
    getBuyerInfoForPO() {
        this._AppTransactionServiceProxy
            .getCurrentTenantAccountProfileInformation()
            .pipe(finalize(() => {
                this.getBuyerBranche();
                this.getsellerBranche()
            }))
            .subscribe((res: any) => {
                this.buyerDataofPO = {
                    buyerCompanySSIN: res?.accountSSIN,
                    buyerContactPhoneNumber: res?.phone,
                    buyerContactEMailAddress: res?.email
                };
            });
    }




    getBuyerBranche() {
        this._AppTransactionServiceProxy.getAccountBranches(this.buyerDataofPO.buyerCompanySSIN).subscribe(result => {

            this.buyerbranchPO = {
                buyerBranchSSIN: result[0]?.ssin,

            };
        });
    }

    getsellerBranche() {
        this._AppTransactionServiceProxy.getAccountBranches(this.productData.sellerSSIN).subscribe(result => {

            this.sellerbranchPO = {
                sellerBranchSSIN: result[0]?.ssin,

            };
        });
    }

    addToShoppingCart() {

        if (this.isFromSellerRoom) {



            Swal.fire({
                title: "",
                text: "Are you sure you want to add ordered quantities to you cart ?",
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


                    /////
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
                    /////

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

                            this.userClickService.userClicked("refreshShoppingInfoInTopbar");

                        });
                }
            }
            )
        } else if (this.ismarketPLace) {

            this.getBuyerInfoForPO()



            this._appTransactionServiceProxy
                .getNextOrderNumber("PO")
                .pipe(finalize(() => {
                    Swal.fire({
                        title: "",
                        text: `Quantities is added to the cart and purchase order # ${this.orderNo} is created?`,
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



                            this.showMainSpinner()



                            this.body = {

                                sellerContactName: null,

                                buyerContactName: this.appSession.user.name,
                                sellerContactId: null,
                                buyerContactId: this.appSession.user.id,
                                sellerContactEmailAddress: null,
                                buyerContactEmailAddress: this.appSession.user.emailAddress,
                                buyerContactPhoneNumber: '',
                                sellerContactPhoneNumber: null,
                                buyerCompanyName: this.appSession.tenancyName,
                                sellerCompanyName: this.productData.sellerCompanyName,
                                enteredByUserRole: "I'm a Buyer",
                                code: this.orderNo,
                                transactionType: 1,
                                sellerContactSSIN: null,
                                buyerContactSSIN: this.appSession.user.accountId,
                                sellerCompanySSIN: this.productData.sellerSSIN,
                                buyerCompanySSIN: this.buyerDataofPO.buyerCompanySSIN,
                                buyerBranchSSIN: null,
                                buyerBranchName: '*Main*',
                                sellerBranchSSIN: null,
                                sellerBranchName: '*Main*',
                                completeDate: moment(new Date).format('YYYY-MM-DD'),
                                enteredDate: moment(new Date).format('YYYY-MM-DD'),
                                startDate: moment(new Date).format('YYYY-MM-DD'),
                                availableDate: moment(new Date).format('YYYY-MM-DD'),
                                reference: "",
                                priceLevel: "MSRP",
                                currencyId: this.appSession.tenant.currencyInfoDto.value
                            };









                            this._AppTransactionServiceProxy
                                .createOrEdit(this.body)
                                .pipe(finalize(() => {


                                    //     /////
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
                                    /////

                                    let bodyRequest: any = {
                                        appItem: this.productDetails,
                                    };
                                    this.showMainSpinner();
                                    this._AppTransactionServiceProxy
                                        .addTransactionDetails(
                                            localStorage.getItem("transNO"), 'PO',
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

                                                this.goToShowroom()
                                            })
                                        )
                                        .subscribe(async (res) => {

                                            this.userClickService.userClicked("refreshShoppingInfoInTopbar");

                                        });


                                }))
                                .subscribe((response: any) => {

                                    this._AppTransactionServiceProxy
                                        .setCurrentUserActiveTransaction(
                                            response
                                        )
                                        .subscribe((res) => {

                                            this.userClickService.userClicked("refreshShoppingInfoInTopbar");


                                        });



                                    //////
                                    this.printInfoParam.reportTemplateName = this.transactionReportTemplateName;
                                    this.printInfoParam.TransactionId = response;
                                    //  this.printInfoParam.orderType=this.formType.toUpperCase();
                                    this.printInfoParam.orderConfirmationRole = this.getTransactionRole(this.body.enteredByUserRole);
                                    this.printInfoParam.saveToPDF = true;
                                    this.printInfoParam.tenantId = this.appSession?.tenantId
                                    this.printInfoParam.userId = this.appSession?.userId
                                    this.reportUrl = this.printInfoParam.getReportUrl()

                                    localStorage.setItem("fromSellerRoom", JSON.stringify(true));
                                    localStorage.setItem("fromMarketPlace", JSON.stringify(false));
                                    //  localStorage.setItem(
                                    //      "SellerId",
                                    //      JSON.stringify(this.sellerCompanyId)
                                    //  );

                                    localStorage.setItem("transNO", this.orderNo);

                                    localStorage.setItem(
                                        "currencyCode",
                                        JSON.stringify(this.appSession.tenant.currencyInfoDto)
                                    );





                                });
                        }






                    }

                    )

                }))
                .subscribe((res: any) => {
                    this.orderNo = res;

                });


        }
    }

    goToShowroom() {
        localStorage.removeItem("productFilters");
        localStorage.setItem(
            "SellerSSIN",
            JSON.stringify(this.productBodyData.sellerSSIN)
        );
        localStorage.setItem(
            "currencyCode",
            JSON.stringify(this.productBodyData.currencyCode)
        );
        localStorage.setItem("fromSellerRoom", JSON.stringify(true));

        localStorage.setItem("fromMarketPlace", JSON.stringify(false));
        this.router.navigateByUrl("app/main/marketplace/products");
    }

    backToResult() {

        this.router.navigateByUrl("app/main/marketplace/products");
    }

    onEditpecialPrice(updatedSpecialPrice) {

        this.productDetails.variations.map((variation: any) => {
            if (variation.extraAttrName === this.productDetails?.variations[0]?.extraAttrName) {
                variation.selectedValues.forEach((value) => {
                    value.edRestAttributes.forEach((attr) => {
                        if (attr.extraAttrName === "SIZE") {
                            attr.values.forEach((sizeValue) => {
                                sizeValue.price = updatedSpecialPrice;
                            });
                        }
                    });

                });
            }

            this.calculateTotalOrderPriceAndQty(this.orderSummary);
        });

        // this.productDetails.minSpecialPrice = updatedSpecialPrice;
        this.productDetails.maxSpecialPrice = updatedSpecialPrice;
        this.showEditSpecialPrice = true
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


    IsVariationOrdered() {


        this.appItemsAppservice.isVariationOrdered(this.productDetails?.code).pipe(
            finalize(() => {

            })
        )
            .subscribe((res) => {

            });

    }



    ngOnDestroy() {
        this.unsubscribeToAllSubscriptions();
        localStorage.removeItem("productData");

    }

}
