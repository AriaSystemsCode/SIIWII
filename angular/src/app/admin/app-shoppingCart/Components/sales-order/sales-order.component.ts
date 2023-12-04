import { Component, EventEmitter, Injector, Input, OnInit, Output } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    AppEntitiesServiceProxy,
    AppTransactionServiceProxy,
    GetAppTransactionsForViewDto,
    SycEntityObjectCategoriesServiceProxy,
    SycEntityObjectClassificationsServiceProxy,
    TreeNodeOfGetSycEntityObjectCategoryForViewDto,
} from "@shared/service-proxies/service-proxies";
import { Router } from "express-serve-static-core";
import { finalize } from "rxjs";
import { ShoppingCartoccordionTabs } from "../shopping-cart-view-component/ShoppingCartoccordionTabs";
import * as moment from "moment";
import { ShoppingCartMode } from "../shopping-cart-view-component/ShoppingCartMode";

@Component({
    selector: "app-sales-order",
    templateUrl: "./sales-order.component.html",
    styleUrls: ["./sales-order.component.scss"],
})
export class SalesOrderComponent extends AppComponentBase implements OnInit {
    fullName: string;
    isReviewMode: boolean = false;
    classificationsFiles: TreeNodeOfGetSycEntityObjectCategoryForViewDto[];
    categoriesFiles: TreeNodeOfGetSycEntityObjectCategoryForViewDto[];
    loading: boolean = false;
    enterdDate: any;
    currencies: any[];
    rate: string;
    public ShoppingCartMode = ShoppingCartMode;
    @Output("orderInfoValid") orderInfoValid: EventEmitter<ShoppingCartoccordionTabs> = new EventEmitter<ShoppingCartoccordionTabs>()
    @Output("ontabChange")
    ontabChange: EventEmitter<ShoppingCartoccordionTabs> =
        new EventEmitter<ShoppingCartoccordionTabs>();
    @Input("activeTab") activeTab: number;
    @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
    shoppingCartoccordionTabs = ShoppingCartoccordionTabs;



    constructor(
        injector: Injector,
        private _AppTransactionServiceProxy: AppTransactionServiceProxy,
        private _sycEntityObjectClassificationsServiceProxy: SycEntityObjectClassificationsServiceProxy,
        private _sycEntityObjectCategoriesServiceProxy: SycEntityObjectCategoriesServiceProxy,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy
    ) {
        super(injector);
        this.getParentCategories();
        this.getParentClassifications();
        this.getAllCurrencies();
    }
    ngOnInit(): void {
        // DepartmentFlag: false
        // EntityId: 165420
        // Sorting: name
        // SkipCount: 0
        // MaxResultCount: 10
        this.fullName =
            this.appSession.user.name + this.appSession.user.surname;
    }

    getAllCurrencies() {
        this._AppEntitiesServiceProxy
            .getAllCurrencyForTableDropdown()
            .subscribe((res: any) => {
                this.currencies = res;
            });
    }
    // get parent categories
    getParentCategories() {
        let apiMethod = "getAllWithChildsForProductWithPaging";
        const subs = this._sycEntityObjectCategoriesServiceProxy[apiMethod](
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            false,
            165420,
            [],
            "name",
            0,
            100
        ).subscribe(
            (res: {
                items: TreeNodeOfGetSycEntityObjectCategoryForViewDto[];
                totalCount: number;
            }) => {
                this.categoriesFiles = res.items;
            }
        );
    }

    getParentClassifications() {
        let apiMethod = "getAllWithChildsForProductWithPaging";
        const subs = this._sycEntityObjectClassificationsServiceProxy[
            apiMethod
        ](
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            165420,
            "name",
            0,
            100
        )
            .pipe(finalize(() => (this.loading = false)))
            .subscribe(
                (res: {
                    items: TreeNodeOfGetSycEntityObjectCategoryForViewDto[];
                    totalCount: number;
                }) => {
                    this.classificationsFiles = res.items;
                }
            );
    }

    // get childs related to parents
    classificationNodeExpand(value: any) {
        console.log(">>", value);

        if (value.node) {
            this.loading = true;
            this._sycEntityObjectClassificationsServiceProxy
                .getAllChildsWithPaging(
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    value.node.data.sycEntityObjectClassification.id,
                    null,
                    165420,
                    "name",
                    0,
                    100
                )
                .pipe(finalize(() => (this.loading = false)))
                .subscribe((res: any) => {
                    value.node.children = res.items;
                    this.classificationsFiles = [...this.classificationsFiles];
                });
        }
    }

    categoriesNodeExpand(value: any) {
        if (value.node) {
            this.loading = true;
            this._sycEntityObjectCategoriesServiceProxy
                .getAllChildsWithPaging(
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    value.node.data.sycEntityObjectCategory.id,
                    true,
                    undefined,
                    undefined,
                    "name",
                    0,
                    10
                )
                .pipe(finalize(() => (this.loading = false)))
                .subscribe((res: any) => {
                    value.node.children = res.items;
                    this.categoriesFiles = [...this.categoriesFiles];
                });
        }
    }

    classificationItemPath: string[] = [];
    classififcationNodeSelect(event: any) {
        this.classificationItemPath.push(
            this.getClassificationPath(event.node)
        );
    }

    categoriesItemPath: string[] = [];
    categoriesNodeSelect(event: any) {
        this.categoriesItemPath.push(this.getCategoriesPath(event.node));
    }

    getCategoriesPath(item: any): any {
        if (!item.parent) {
            return item.label;
        }
        return this.getCategoriesPath(item.parent) + "-" + item.label;
    }

    getClassificationPath(item: any): any {
        if (!item.parent) {
            return item.label;
        }
        return this.getClassificationPath(item.parent) + "-" + item.label;
    }

    isSalesOrderValidForm(): boolean {
        // Check if all required fields have values
        const isValid =
            this.appTransactionsForViewDto.entityClassifications.length !== 0 &&
            this.appTransactionsForViewDto.entityCategories.length !== 0 &&
            this.appTransactionsForViewDto.currencyId &&
            this.rate &&
            this.enterdDate &&
            moment(
                this.appTransactionsForViewDto.completeDate,
                "YYYY-MM-DD HH:mm:ss",
                true
            ).isValid() &&
            moment(
                this.appTransactionsForViewDto.availableDate,
                "YYYY-MM-DD HH:mm:ss",
                true
            ).isValid() &&
            moment(
                this.appTransactionsForViewDto.startDate,
                "YYYY-MM-DD HH:mm:ss",
                true
            ).isValid();
            // this.availabledate &&
            // this.startDate &&
            // this.enterdDate &&
            // this.compeleteDate;
        return isValid;
    }

    showPreview() {
        // this.isReviewMode = true;
        this.ontabChange.emit(ShoppingCartoccordionTabs.orderInfo);
        this.orderInfoValid.emit(ShoppingCartoccordionTabs.orderInfo);
    }
    showEdirMode() {
        this.isReviewMode = false;
    }

    isContactsValid: boolean = false;
    isContactFormValid(value) {
        this.isContactsValid = value;
        if (value)
            this.isContactsValid = true;

    }
    onUpdateAppTransactionsForViewDto($event) {
        this.appTransactionsForViewDto = $event;
    }
}
