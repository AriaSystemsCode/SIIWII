import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    AppEntitiesServiceProxy,
    AppEntityCategoryDto,
    AppEntityClassification,
    AppEntityClassificationDto,
    AppTransactionServiceProxy,
    CreateOrEditSycEntityObjectCategoryDto,
    CurrencyInfoDto,
    GetAppTransactionForViewDto,
    GetAppTransactionsForViewDto,
    SycEntityObjectCategoriesServiceProxy,
    SycEntityObjectClassificationsServiceProxy,
    SycEntityObjectTypesServiceProxy,
    TreeNodeOfGetSycEntityObjectCategoryForViewDto,
    TreeNodeOfGetSycEntityObjectTypeForViewDto,
} from "@shared/service-proxies/service-proxies";
import { Router } from "express-serve-static-core";
import { finalize } from "rxjs";
import { ShoppingCartoccordionTabs } from "../shopping-cart-view-component/ShoppingCartoccordionTabs";
import * as moment from "moment";
import { forEach } from "lodash";
import { TreeSelect } from "primeng/treeselect";

@Component({
    selector: "app-sales-order",
    templateUrl: "./sales-order.component.html",
    styleUrls: ["./sales-order.component.scss"],
})
export class SalesOrderComponent extends AppComponentBase implements OnInit, OnChanges {
    fullName: string;
    companeyNames: any[];
    nodes: any[];
    category : CreateOrEditSycEntityObjectCategoryDto

    selectedCategories: any;

    classificationsFiles: TreeNodeOfGetSycEntityObjectCategoryForViewDto[];
    categoriesFiles: any[];
    loading: boolean = false;
    selectedClassification: any[] = [];
    // selectedCategories: any[] = ['kkkkk'];
    currencies: any[];
    selectedCurrency;
    selectedCurrrency: any;
    @Output("orderInfoValid") orderInfoValid: EventEmitter<ShoppingCartoccordionTabs> = new EventEmitter<ShoppingCartoccordionTabs>()
    @Output("ontabChange") ontabChange: EventEmitter<ShoppingCartoccordionTabs> = new EventEmitter<ShoppingCartoccordionTabs>()
    @Input("activeTab") activeTab: number;
    @Input("currentTab") currentTab: number;
    @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
    shoppingCartoccordionTabs = ShoppingCartoccordionTabs; 
    @Input("createOrEditorderInfo") createOrEditorderInfo: boolean ;
    @Input("oldCreateOrEditorderInfo") oldCreateOrEditorderInfo: boolean ;

    enteredDate = new Date();
    startDate = new Date();
    availableDate = new Date();
    completeDate = new Date();
    reference: any 

    showSaveBtn: boolean = false;
    showCatBtn: boolean = false;
    hideCatBtn: boolean = true;
    showSelectedCat: boolean = true;
    
    oldappTransactionsForViewDto;
    @ViewChild(TreeSelect) treeSelect!: TreeSelect;
    @Output("generatOrderReport") generatOrderReport: EventEmitter<boolean> = new EventEmitter<boolean>()
    @Input("canChange") canChange: boolean = true;
    sycEntityObjectCategory: CreateOrEditSycEntityObjectCategoryDto = new CreateOrEditSycEntityObjectCategoryDto();
    entityObjectType:string ="CATEGORY"
    sortBy: string = "name";
    skipCount: number = 0;
    maxResultCount: number = 10;
    allRecords: TreeNodeOfGetSycEntityObjectCategoryForViewDto[] = [];
    parentCat : any;
    addSubCat: boolean = false;
    editSubCat: boolean = false;
    openDropDown: boolean = false;
    constructor(
        injector: Injector,
        private _AppTransactionServiceProxy: AppTransactionServiceProxy,
        private _sycEntityObjectClassificationsServiceProxy: SycEntityObjectClassificationsServiceProxy,
        private _sycEntityObjectCategoriesServiceProxy: SycEntityObjectCategoriesServiceProxy,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _sycEntityObjectTypesServiceProxy: SycEntityObjectTypesServiceProxy
    ) {

        
        super(injector);
        // this.getAppTransactionList();

        this.getParentCategories();
        this.getParentClassifications();
        this.getAllCurrencies();
      
    }
    ngOnInit(): void {
        this.getAppTransactionList();

        if(!this.category) {
            this.category = new CreateOrEditSycEntityObjectCategoryDto()
        }

        // DepartmentFlag: false
        // EntityId: 165420
        // Sorting: name
        // SkipCount: 0
        // MaxResultCount: 10
        this.categoriesFiles = [
            {
                label: 'Electronics',
                data: '1',
                children: [
                    {
                        label: 'Mobile Phones',
                        data: '1.1',
                        children: [
                            { label: 'Apple', data: '1.1.1' },
                            { label: 'Samsung', data: '1.1.2' },
                        ]
                    },
                    {
                        label: 'Laptops',
                        data: '1.2',
                        children: [
                            { label: 'HP', data: '1.2.1' },
                            { label: 'Dell', data: '1.2.2' },
                        ]
                    }
                ]
            },
            {
                label: 'Furniture',
                data: '2',
                children: [
                    {
                        label: 'Tables',
                        data: '2.1',
                        children: [
                            { label: 'Dining Table', data: '2.1.1' },
                            { label: 'Coffee Table', data: '2.1.2' },
                        ]
                    },
                    {
                        label: 'Chairs',
                        data: '2.2',
                        children: [
                            { label: 'Office Chair', data: '2.2.1' },
                            { label: 'Dining Chair', data: '2.2.2' },
                        ]
                    }
                ]
            }

        ];
        this.fullName =
            this.appSession.user.name + this.appSession.user.surname;
        this.enteredDate = this.appTransactionsForViewDto?.enteredDate?.toDate();
        this.startDate = this.appTransactionsForViewDto?.startDate?.toDate();
        this.availableDate = this.appTransactionsForViewDto?.availableDate?.toDate();
        this.completeDate = this.appTransactionsForViewDto?.completeDate?.toDate();
        this.reference = this.appTransactionsForViewDto?.reference;
        // this.category = this.appTransactionsForViewDto.entityCategories
        this.classificationItemPath = [];
        this.categoriesItemPath = [];
        console.log(this.appTransactionsForViewDto,'appTransactionsForViewDto')

    }

    ngOnChanges(changes: SimpleChanges) {
        
        if (this.appTransactionsForViewDto) {
            this.createOrEditorderInfo=this.oldCreateOrEditorderInfo;
            this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto));
            this.enteredDate = this.appTransactionsForViewDto?.enteredDate?.toDate();
            this.startDate = this.appTransactionsForViewDto?.startDate?.toDate();
            this.availableDate = this.appTransactionsForViewDto?.availableDate?.toDate();
            this.completeDate = this.appTransactionsForViewDto?.completeDate?.toDate();
        this.reference = this.appTransactionsForViewDto?.reference;

            if (!this.selectedCurrency)
                this.selectedCurrency = this.appTransactionsForViewDto?.currencyId;
            this.showSaveBtn = false;

            this.selectedCategories = this.appTransactionsForViewDto?.entityCategories;
            this.selectedClassification = this.appTransactionsForViewDto?.entityClassifications;
        }
        console.log(this.appTransactionsForViewDto,'appTransactionsForViewDto')


    }
    toggleDropDown (){
        this.openDropDown  = !this.openDropDown
    }
    getAllCurrencies() {
        this._AppEntitiesServiceProxy
            .getAllCurrencyForTableDropdown()
            .subscribe((res: any) => {
                this.currencies = res;
            });
    }

    onNodeToggle(event: any, isExpanded: boolean) {
    const node = event.node;
    if (isExpanded) {
        console.log('Node expanded:', node);
        // Custom logic when a node is expanded
    } else {
        console.log('Node collapsed:', node);
        // Custom logic when a node is collapsed
    }
}


    getCodeValue(code: string) {
        this.category.code= code;
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
                // this.categoriesFiles = res.items;


                this.categoriesItemPath?.forEach(item => {
                    const filteredCategoriesFiles = this.categoriesFiles.filter(function (_item) {
                        return (_item?.data?.sycEntityObjectCategory?.id != item?.data?.sycEntityObjectCategory?.id);
                    });
                    // this.categoriesFiles = filteredCategoriesFiles;
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
                    // this.categoriesFiles = [...this.categoriesFiles];
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


    // categoriesNodeSelect(event: any) {

    
          
    //     // Reset the selected categories for each selection
    //     this.selectedCategories = [];
    
    //     if (!this.appTransactionsForViewDto?.entityCategories) {
    //         this.appTransactionsForViewDto.entityCategories = [];
    //     }
    
    //     // Add the selected path to categoriesItemPath
    //     // this.categoriesItemPath.push(event.node);
    
    //     this.categoriesItemPath.forEach((item) => {
            
    //         let index = this.appTransactionsForViewDto.entityCategories.findIndex(
    //             (x) => x.entityObjectCategoryId === item.data.sycEntityObjectCategory.id
    //         );
    
    //         if (index < 0) {
    //             const appEntityCategoryDto : AppEntityCategoryDto = {
    //                 entityObjectCategoryCode: item.data.sycEntityObjectCategory.code,
    //                 entityObjectCategoryId: item.data.sycEntityObjectCategory.id,
    //                 entityObjectCategoryName: item.data.sycEntityObjectCategory.name,
    //                 id: 0,
    //                 init: undefined,
    //                 toJSON:undefined
    //             };
    //             this.appTransactionsForViewDto.entityCategories.push(appEntityCategoryDto);
    //         }
    //     });
    
    //     // Set selectedCategories to the newly updated entityCategories
    //     this.selectedCategories = [...this.appTransactionsForViewDto.entityCategories];
    //     console.log(this.selectedCategories, 'Selected Categories');
    // }


    categoriesNodeSelect(event: any) {
        // Preserve default selection behavior
        const selectedNode = event.node;
        
        // Add custom logic here, if needed
        if (!this.appTransactionsForViewDto?.entityCategories) {
            this.appTransactionsForViewDto.entityCategories = [];
        }
    
        const newCategory = new AppEntityCategoryDto({
            entityObjectCategoryCode: selectedNode.data.sycEntityObjectCategory?.code,
            entityObjectCategoryId: selectedNode.data.sycEntityObjectCategory?.id,
            entityObjectCategoryName: selectedNode.data.sycEntityObjectCategory?.name,
            id: 0,
            init: undefined,
            toJSON:undefined
        });
    
        // Ensure no duplicate categories are added
        const categoryExists = this.appTransactionsForViewDto.entityCategories
            .some(cat => cat.entityObjectCategoryId === newCategory.entityObjectCategoryId);
    
        if (!categoryExists) {
            this.appTransactionsForViewDto.entityCategories.push(newCategory);
        }
    console.log(categoryExists,'categoryExists')
    console.log( this.appTransactionsForViewDto.entityCategories,' this.appTransactionsForViewDto.entityCategories')
        // Sync the selected categories with `appTransactionsForViewDto.entityCategories`
        this.selectedCategories = [...this.appTransactionsForViewDto.entityCategories];
    }
    
    onLabelClick(event: Event) {
        event.stopPropagation(); // Prevent selection on label click
      }

    toggleSelectAll(event: any) {
        if (event.target.checked) {
            this.selectedCategories = [...this.allRecords]; // Select all nodes
        } else {
            this.selectedCategories = []; // Deselect all nodes
        }
    }
    
    collapseAll() {
        this.allRecords.forEach(node => {
            node.expanded = false;
        });
    }
    categoriesItemPath: any[] = [];
    
    // categoriesNodeSelect(event: any) {
    //     // this.categoriesItemPath.push(this.getCategoriesPath(event.node));
    //     // this.getCategoriesPath(event.node);

    //     if (!this.appTransactionsForViewDto?.entityCategories || this.appTransactionsForViewDto?.entityCategories?.length == 0)
    //         this.appTransactionsForViewDto.entityCategories = [];

    //     this.categoriesItemPath.forEach(item => {
    //         let indx = this.appTransactionsForViewDto.entityCategories.findIndex(x => x.entityObjectCategoryId == item?.data?.sycEntityObjectCategory?.id);
    //         if (indx < 0) {
    //             let appEntityCategoryDto = new AppEntityCategoryDto();
    //             appEntityCategoryDto.entityObjectCategoryCode = item?.data?.sycEntityObjectCategory?.code;
    //             appEntityCategoryDto.entityObjectCategoryId = item?.data?.sycEntityObjectCategory?.id;
    //             appEntityCategoryDto.entityObjectCategoryName = item?.data?.sycEntityObjectCategory?.name;
    //             this.appTransactionsForViewDto.entityCategories.push(appEntityCategoryDto);
    //         }

    //         const filteredCategoriesFiles = this.categoriesFiles.filter(function (_item) {
    //             return (_item?.data?.sycEntityObjectCategory?.id != item?.data?.sycEntityObjectCategory?.id);
    //         });

    //         // this.categoriesFiles = filteredCategoriesFiles;

    //     });

    //     this.selectedCategories = this.appTransactionsForViewDto.entityCategories;
    // }
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
    addAsNewChild(node: TreeNodeOfGetSycEntityObjectCategoryForViewDto) {
        this.showCatBtn = true
        this.addSubCat = true
     this.parentCat = {
        // name: node.data.sycEntityObjectCategory,
        
        code: node.data.sycEntityObjectCategory.code,
        parentId: node.data.sycEntityObjectCategory.id,
 }
  
    }
    


    EditCat(node: TreeNodeOfGetSycEntityObjectCategoryForViewDto) {
        this.showCatBtn = true
        this.editSubCat = true
     this.parentCat = {
        name: node.data.sycEntityObjectCategory.name,
        
        code: node.data.sycEntityObjectCategory.code,
        parentId: node.data.sycEntityObjectCategory.id,
 }
 this.category.name =  this.parentCat.name
 console.log(node,'node')
 console.log(this.parentCat,'this.parentCat')
 console.log(this.category.name ,'this.category.name ')

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

       
    
        if ( !this.completeDate || this.completeDate <=  this.startDate) {
            this.completeDate=this.startDate;
        }
    
        if ( !this.availableDate ||  this.availableDate <= this.startDate) {
            this.availableDate=this.startDate;
        }

        let enteredDate = this.enteredDate.toLocaleString();
        let startDate = this.startDate.toLocaleString();
        let availableDate = this.availableDate.toLocaleString();
        let completeDate = this.completeDate.toLocaleString();


        this.appTransactionsForViewDto.enteredDate = moment.utc(enteredDate);
        this.appTransactionsForViewDto.startDate = moment.utc(startDate);
        this.appTransactionsForViewDto.availableDate = moment.utc(availableDate);
        this.appTransactionsForViewDto.completeDate = moment.utc(completeDate);
    }
    changeCompleteDate(date) {
        const selectedDate = date;
    
        this.completeDate = selectedDate;
        this.availableDate=selectedDate;
        this.onChangeDate()
    }

    createOrEditTransaction() {
        // this.showMainSpinner();
        this.onChangeDate();
    
         this.appTransactionsForViewDto.entityCategories = this.selectedCategories ;
         this.appTransactionsForViewDto.reference = this.reference;
         console.log(this.appTransactionsForViewDto.entityCategories,'this.appTransactionsForViewDto.entityCategories')


        this._AppTransactionServiceProxy.createOrEditTransaction(this.appTransactionsForViewDto)

        .pipe(finalize(() =>  {
            this.generatOrderReport.emit(true)}))
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
    saveSelection() {
        // Implement your save logic here
        this.showSelectedCat = true
        this.closeDropdown();

        console.log(this.selectedCategories ,'this.selectedCategories ')
        this.appTransactionsForViewDto.entityCategories = this.selectedCategories ;
        console.log(this.appTransactionsForViewDto.entityCategories,'this.appTransactionsForViewDto.entityCategories')
        // this.notify.info('Selection saved successfully!');
    }
    
    cancelSelection() {
        // Implement your cancel logic here
        // this.selectedCategories = []; // Or any logic to reset selection
        this.closeDropdown();
        // this.notify.info('Selection canceled.');
    }
    closeDropdown() {
        if (this.treeSelect) {
          this.treeSelect.hide(); // Close the dropdown (make sure this method exists in your TreeSelect version)
        }
      }
    
saveCat(category:any){
    console.log(category,'category') 
    let cat = new CreateOrEditSycEntityObjectCategoryDto({
        code: this.editSubCat ? this.parentCat.code: this.category.code,
        name: category.name,
        objectId: undefined,
        parentId: this.addSubCat?  this.parentCat.parentId  : undefined,
        id: this.editSubCat?  this.parentCat.parentId : undefined
    });


    
    // edit
    // let cat = new CreateOrEditSycEntityObjectCategoryDto({
    //     code: this.editSubCat ? this.parentCat.code: this.category.code,
    //     name: category.name,
    //     objectId: undefined,
    //     parentId: this.addSubCat?  this.parentCat.parentId  : undefined,
    //     id:this.editSubCat?  this.parentCat.parentId : undefined
    // });





    // this.sycEntityObjectCategory = {...cat}
    // this._sycEntityObjectCategoriesServiceProxy.createOrEdit(cat)
    // .pipe(finalize(() => { 
    //     // this.saving = false;
    // }))
    // .subscribe(() => {
    //    this.notify.info(this.l('SavedSuccessfully'));

    // });
    // this.showCatBtn = false

    
        // this.sycEntityObjectCategory = {...cat}
    this._sycEntityObjectCategoriesServiceProxy.createOrEditForObjectTransaction(cat)
    .pipe(finalize(() => { 
        // this.saving = false;
    }))
    .subscribe(() => {
    //    this.notify.info(this.l('SavedSuccessfully'));
       this.getAppTransactionList()

    });
    this.showCatBtn = false
        this.selectedCategories[0] = {...cat};
        console.log(this.selectedCategories,'selectedCategories')
    
}
    showEditMode() {
        this.selectedCategories = this.appTransactionsForViewDto?.entityCategories;
        this.selectedClassification = this.appTransactionsForViewDto?.entityClassifications; 
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


    loadedChildrenRecords: TreeNodeOfGetSycEntityObjectTypeForViewDto[] = [];
    // lastSelectedRecord: TreeNodeOfGetSycEntityObjectTypeForViewDto;
    getAppTransactionList(searchQuery?: string) {
        console.log(">>", searchQuery)
        // this.loading = true;
        const subs = this._sycEntityObjectCategoriesServiceProxy
            .getAllWithChildsForTransactionWithPaging(
                searchQuery,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                false,
                undefined,
                undefined,
                this.sortBy,
                this.skipCount,
                this.maxResultCount
            )
            .pipe(finalize(() => (this.loading = false)))
            .subscribe((result) => {
                console.log(result.items,'result.items')

                if (searchQuery !== undefined) this.allRecords = [];
                result.items.map((record) => {
              
                    // const cachedItem : TreeNodeOfGetSycEntityObjectTypeForViewDto = this.loadedChildrenRecords.filter((selectedRecord:TreeNodeOfGetSycEntityObjectTypeForViewDto)=>{
                    //     const isCached : boolean = selectedRecord.data.sycEntityObjectType.id == record.data.sycEntityObjectType.id
                    //     return isCached
                    // })[0]
                    // const isCached : boolean = !!cachedItem

                    // if(isCached){
                    //     record.children = cachedItem.children
                    //     record.expanded = cachedItem.expanded
                    //     record.totalChildrenCount = cachedItem.totalChildrenCount;
                    //     (record as any).partialSelected = (cachedItem as any).partialSelected
                    // }

                    // this.checkItemSelection(record);

                    return record;
                });
                this.allRecords.push(...result.items);
                console.log(this.allRecords,'this.allRecords')
                // this.lastSelectedRecord = this.selectedRecord;
                // this.selectedRecord = undefined;
                // this.displayedRecords = this.allRecords;
                // this.totalCount = result.totalCount;
                // this.showMoreListDataButton =
                //     this.allRecords.length < this.totalCount;
                // this.active = true;
                // this.loading = false;
            });
        this.subscriptions.push(subs);
    }

}
