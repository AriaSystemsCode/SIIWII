import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    AppEntitiesServiceProxy,
    AppEntityCategoryDto,
    AppEntityClassification,
    AppEntityClassificationDto,
    AppTransactionServiceProxy,
    CurrencyInfoDto,
    GetAppTransactionForViewDto,
    GetAppTransactionsForViewDto,
    SycEntityObjectCategoriesServiceProxy,
    SycEntityObjectClassificationsServiceProxy,
    TreeNodeOfGetSycEntityObjectCategoryForViewDto,
} from "@shared/service-proxies/service-proxies";
import { Router } from "express-serve-static-core";
import { finalize } from "rxjs";
import { ShoppingCartoccordionTabs } from "../shopping-cart-view-component/ShoppingCartoccordionTabs";
import * as moment from "moment";
import { forEach } from "lodash";

@Component({
    selector: "app-sales-order",
    templateUrl: "./sales-order.component.html",
    styleUrls: ["./sales-order.component.scss"],
})
export class SalesOrderComponent extends AppComponentBase implements OnInit, OnChanges {
    fullName: string;
    companeyNames: any[];


    classificationsFiles: TreeNodeOfGetSycEntityObjectCategoryForViewDto[];
    categoriesFiles: TreeNodeOfGetSycEntityObjectCategoryForViewDto[];
    loading: boolean = false;
    selectedClassification: any[] = [];
    selectedCategories: any[] = [];
    currencies: any[];
    selectedCurrency;
    selectedCurrrency: any;
    @Output("orderInfoValid") orderInfoValid: EventEmitter<ShoppingCartoccordionTabs> = new EventEmitter<ShoppingCartoccordionTabs>()
    @Output("ontabChange") ontabChange: EventEmitter<ShoppingCartoccordionTabs> = new EventEmitter<ShoppingCartoccordionTabs>()
    @Input("activeTab") activeTab: number;
    @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
    shoppingCartoccordionTabs = ShoppingCartoccordionTabs;
    @Input("createOrEditorderInfo") createOrEditorderInfo: boolean ;
    @Input("oldCreateOrEditorderInfo") oldCreateOrEditorderInfo: boolean ;

    enteredDate = new Date();
    startDate = new Date();
    availableDate = new Date();
    completeDate = new Date();
    showSaveBtn: boolean = false;
    oldappTransactionsForViewDto;
    @Output("generatOrderReport") generatOrderReport: EventEmitter<boolean> = new EventEmitter<boolean>()

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
        this.enteredDate = this.appTransactionsForViewDto?.enteredDate?.toDate();
        this.startDate = this.appTransactionsForViewDto?.startDate?.toDate();
        this.availableDate = this.appTransactionsForViewDto?.availableDate?.toDate();
        this.completeDate = this.appTransactionsForViewDto?.completeDate?.toDate();
        this.classificationItemPath = [];
        this.categoriesItemPath = [];

    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.appTransactionsForViewDto) {
            this.createOrEditorderInfo=this.oldCreateOrEditorderInfo;
            this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto));
            this.enteredDate = this.appTransactionsForViewDto?.enteredDate?.toDate();
            this.startDate = this.appTransactionsForViewDto?.startDate?.toDate();
            this.availableDate = this.appTransactionsForViewDto?.availableDate?.toDate();
            this.completeDate = this.appTransactionsForViewDto?.completeDate?.toDate();
            if (!this.selectedCurrency)
                this.selectedCurrency = this.appTransactionsForViewDto?.currencyId;
            this.showSaveBtn = false;

            this.selectedCategories = this.appTransactionsForViewDto?.entityCategories;
            this.selectedClassification = this.appTransactionsForViewDto?.entityClassifications;
        }


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
       // let apiMethod = "getAllWithChildsForProductWithPaging";
         let apiMethod ="getAllWithChildsForTransactionWithPaging";
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


                this.categoriesItemPath?.forEach(item => {
                    const filteredCategoriesFiles = this.categoriesFiles.filter(function (_item) {
                        return (_item?.data?.sycEntityObjectCategory?.id != item?.data?.sycEntityObjectCategory?.id);
                    });
                    this.categoriesFiles = filteredCategoriesFiles;
                });
            }
        );
    }

    getParentClassifications() {
      // let apiMethod = "getAllWithChildsForProductWithPaging";
        let apiMethod ="getAllWithChildsForTransactionWithPaging";
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

                    this.classificationItemPath?.forEach(item => {
                        const filteredClassificationFiles = this.classificationsFiles.filter(function (_item) {
                            return (_item?.data?.sycEntityObjectClassification?.id != item?.data?.sycEntityObjectClassification?.id);
                        });
                        this.classificationsFiles = filteredClassificationFiles;
                    });
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

    classificationItemPath: any[] = [];
    classififcationNodeSelect(event: any) {


        this.getClassificationPath(event.node)
        if (!this.appTransactionsForViewDto?.entityClassifications || this.appTransactionsForViewDto?.entityClassifications?.length == 0)
            this.appTransactionsForViewDto.entityClassifications = [];

        this.classificationItemPath.forEach(item => {
            let indx = this.appTransactionsForViewDto.entityClassifications?.findIndex(x => x.entityObjectClassificationId == item?.data?.sycEntityObjectClassification?.id)
            if (indx < 0) {
                let appEntityClassificationDto = new AppEntityClassificationDto();
                appEntityClassificationDto.entityObjectClassificationCode = item?.data?.sycEntityObjectClassification?.code;
                appEntityClassificationDto.entityObjectClassificationId = item?.data?.sycEntityObjectClassification?.id;
                appEntityClassificationDto.entityObjectClassificationName = item?.data?.sycEntityObjectClassification?.name;
                this.appTransactionsForViewDto.entityClassifications.push(appEntityClassificationDto)
            }
            const filteredClassificationFiles = this.classificationsFiles.filter(function (_item) {
                return (_item?.data?.sycEntityObjectClassification?.id != item?.data?.sycEntityObjectClassification?.id);
            });

            this.classificationsFiles = filteredClassificationFiles;
        });
        this.selectedClassification = this.appTransactionsForViewDto.entityClassifications;
    }


    classififcationNodeUnSelect(event: any) {
        let indx = this.appTransactionsForViewDto.entityClassifications?.findIndex(x => x.entityObjectClassificationId == event?.entityObjectClassificationId)
        if (indx >= 0)
            this.appTransactionsForViewDto.entityClassifications.splice(indx, 1);


        let classificationsItemPathindx = this.classificationItemPath?.findIndex(x => x.data.sycEntityObjectClassification.id == event.entityObjectClassificationId);
        if (classificationsItemPathindx >= 0)
            this.classificationItemPath.splice(classificationsItemPathindx, 1);

        this.selectedClassification = this.appTransactionsForViewDto.entityClassifications;

        this.getParentClassifications();

    }
    categoriesItemPath: any[] = [];
    categoriesNodeSelect(event: any) {
        // this.categoriesItemPath.push(this.getCategoriesPath(event.node));
        this.getCategoriesPath(event.node);

        if (!this.appTransactionsForViewDto?.entityCategories || this.appTransactionsForViewDto?.entityCategories?.length == 0)
            this.appTransactionsForViewDto.entityCategories = [];

        this.categoriesItemPath.forEach(item => {
            let indx = this.appTransactionsForViewDto.entityCategories.findIndex(x => x.entityObjectCategoryId == item?.data?.sycEntityObjectCategory?.id);
            if (indx < 0) {
                let appEntityCategoryDto = new AppEntityCategoryDto();
                appEntityCategoryDto.entityObjectCategoryCode = item?.data?.sycEntityObjectCategory?.code;
                appEntityCategoryDto.entityObjectCategoryId = item?.data?.sycEntityObjectCategory?.id;
                appEntityCategoryDto.entityObjectCategoryName = item?.data?.sycEntityObjectCategory?.name;
                this.appTransactionsForViewDto.entityCategories.push(appEntityCategoryDto);
            }

            const filteredCategoriesFiles = this.categoriesFiles.filter(function (_item) {
                return (_item?.data?.sycEntityObjectCategory?.id != item?.data?.sycEntityObjectCategory?.id);
            });

            this.categoriesFiles = filteredCategoriesFiles;

        });

        this.selectedCategories = this.appTransactionsForViewDto.entityCategories;
    }
    categoriesNodeUnSelect(event: any) {
        let indx = this.appTransactionsForViewDto.entityCategories.findIndex(x => x.entityObjectCategoryId == event?.entityObjectCategoryId);
        if (indx >= 0)
            this.appTransactionsForViewDto.entityCategories.splice(indx, 1);


        let categoriesItemPathindx = this.categoriesItemPath?.findIndex(x => x.data.sycEntityObjectCategory.id == event.entityObjectCategoryId);
        if (categoriesItemPathindx >= 0)
            this.categoriesItemPath.splice(categoriesItemPathindx, 1);

        this.selectedCategories = this.appTransactionsForViewDto.entityCategories;

        this.getParentCategories();

    }

    getCategoriesPath(item: any): any {
        // if (!item.parent) {
        //     return item.label;
        // }
        // return this.getCategoriesPath(item.parent) + "-" + item.label;
        if (item.children && item.children?.length > 0) {
            item.children.forEach(child => {
                this.getCategoriesPath(child)
            });
        }

        this.categoriesItemPath.push(item);
    }

    getClassificationPath(item: any): any {
        if (item.children && item.children?.length > 0) {
            item.children.forEach(child => {
                this.getClassificationPath(child)
            });
        }

        this.classificationItemPath.push(item);

        // if (!item.parent) {
        //     return item.label;
        // }
        // return this.getClassificationPath(item.parent) + "-" + item.label;
    }

    isSalesOrderValidForm(): boolean {
        // Check if all required fields have values

        // this.appTransactionsForViewDto.entityClassifications.length !== 0 &&
        // this.appTransactionsForViewDto.entityCategories.length !== 0 &&
        const isValid = this.appTransactionsForViewDto?.currencyCode &&
            this.appTransactionsForViewDto?.currencyExchangeRate &&
            moment(
                this.appTransactionsForViewDto?.enteredDate,
                "YYYY-MM-DD HH:mm:ss",
                true
            ).isValid() &&
            moment(
                this.appTransactionsForViewDto?.completeDate,
                "YYYY-MM-DD HH:mm:ss",
                true
            ).isValid() &&
            moment(
                this.appTransactionsForViewDto?.availableDate,
                "YYYY-MM-DD HH:mm:ss",
                true
            ).isValid() &&
            moment(
                this.appTransactionsForViewDto?.startDate,
                "YYYY-MM-DD HH:mm:ss",
                true
            ).isValid();
        // this.availabledate &&
        // this.startDate &&
        // this.enterdDate &&
        // this.compeleteDate;
        return isValid;
    }

    onchangeCurrency() {
        var indx = this.currencies.findIndex(x => x.value == this.selectedCurrency);
        if (indx >= 0) {
            this.appTransactionsForViewDto.currencyId = this.currencies[indx].value;
            this.appTransactionsForViewDto.currencyCode = this.currencies[indx].code;
        }
    }
    onChangeDate() {
        //Dates
        this.appTransactionsForViewDto.enteredDate = moment(this.enteredDate);
        this.appTransactionsForViewDto.startDate = moment(this.startDate);
        this.appTransactionsForViewDto.availableDate = moment(this.availableDate);
        this.appTransactionsForViewDto.completeDate = moment(this.completeDate);
    }

    createOrEditTransaction() {
        this.showMainSpinner();

        this._AppTransactionServiceProxy.createOrEditTransaction(this.appTransactionsForViewDto)

            .pipe(finalize(() =>  {this.hideMainSpinner();this.generatOrderReport.emit(true)}))
            .subscribe((res) => {
                if (res) {
                    this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto));

                    // this.orderInfoValid.emit(ShoppingCartoccordionTabs.orderInfo);

                    if (!this.showSaveBtn)
                        this.ontabChange.emit(ShoppingCartoccordionTabs.orderInfo);

                    else
                        this.showSaveBtn = false;

                }
            });
    }


    isContactsValid: boolean = false;
    isContactFormValid(value) {
        if(this.activeTab==this.shoppingCartoccordionTabs.orderInfo)
        {
        this.isContactsValid = value;
        if (value) {
            this.isContactsValid = true;
            if (this.isSalesOrderValidForm())
                this.orderInfoValid.emit(ShoppingCartoccordionTabs.orderInfo);
        }
    }
    }

    showEditMode() {
        this.selectedCategories = this.appTransactionsForViewDto?.entityCategories;
        this.selectedClassification = this.appTransactionsForViewDto?.entityClassifications; this.selectedCategories
        this.createOrEditorderInfo = true;
        this.showSaveBtn = true;
        this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto));
    }

    save() {
        this.createOrEditorderInfo = false;
        this.createOrEditTransaction();
    }
    cancel() {
        this.appTransactionsForViewDto=JSON.parse(JSON.stringify(this.oldappTransactionsForViewDto));
        this.onUpdateAppTransactionsForViewDto(this.appTransactionsForViewDto);
        this.createOrEditorderInfo = false;
        this.showSaveBtn = false;
    }
    onUpdateAppTransactionsForViewDto($event) {
        this.appTransactionsForViewDto = $event;
    }
}
