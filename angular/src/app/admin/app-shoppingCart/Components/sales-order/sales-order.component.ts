import { AfterViewInit, Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    AppEntitiesServiceProxy,
    AppEntityCategoryDto,
    AppEntityClassification,
    AppEntityClassificationDto,
    AppTransactionServiceProxy,
    CreateOrEditSycEntityObjectCategoryDto,
    CreateOrEditSycEntityObjectClassificationDto,
    CurrencyInfoDto,
    GetAppTransactionForViewDto,
    GetAppTransactionsForViewDto,
    SycEntityObjectCategoriesServiceProxy,
    SycEntityObjectClassificationsServiceProxy,
    SycEntityObjectTypesServiceProxy,
    TreeNodeOfGetSycEntityObjectCategoryForViewDto,
    TreeNodeOfGetSycEntityObjectClassificationForViewDto,
    TreeNodeOfGetSycEntityObjectTypeForViewDto,
} from "@shared/service-proxies/service-proxies";
import { Router } from "express-serve-static-core";
import { finalize } from "rxjs";
import { ShoppingCartoccordionTabs } from "../shopping-cart-view-component/ShoppingCartoccordionTabs";
import * as moment from "moment";
import { forEach } from "lodash";
import { TreeSelect } from "primeng/treeselect";
import { TreeNode } from "primeng/api";

@Component({
    selector: "app-sales-order",
    templateUrl: "./sales-order.component.html",
    styleUrls: ["./sales-order.component.scss"],
})
export class SalesOrderComponent extends AppComponentBase implements OnInit, OnChanges , AfterViewInit {
    fullName: string;
    companeyNames: any[];
    nodes: any[];
    category : CreateOrEditSycEntityObjectCategoryDto
    classification : CreateOrEditSycEntityObjectClassificationDto

    selectedCategories: AppEntityCategoryDto[]=[];
    selectedCategoriesShow: AppEntityCategoryDto[]=[];
    selectedClassificationsShow: AppEntityClassificationDto[]=[];

    classificationsFiles: TreeNodeOfGetSycEntityObjectCategoryForViewDto[];
    categoriesFiles: any[];
    loading: boolean = false;
    selectedClassification: AppEntityClassificationDto[]=[];
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
    hideClassBtn: boolean = true;
    showSelectedCat: boolean = false;
    showClassBtn: boolean = false;
    showSelectedClass: boolean = false;
    showExistCat: boolean = false;
    showExistClass: boolean = false;
    oldappTransactionsForViewDto;
    @ViewChild(TreeSelect) treeSelect!: TreeSelect;
    @Output("generatOrderReport") generatOrderReport: EventEmitter<boolean> = new EventEmitter<boolean>()
    @Input("canChange") canChange: boolean = true;
    sycEntityObjectCategory: CreateOrEditSycEntityObjectCategoryDto = new CreateOrEditSycEntityObjectCategoryDto();
    entityObjectType:string ="CATEGORY"
    entityObjectClassificationType:string ="CLASSIFICATION"
    sortBy: string = "name";
    skipCount: number = 0;
    maxResultCount: number = 10;
    allRecords: TreeNodeOfGetSycEntityObjectCategoryForViewDto[] = [];
    filteredRecords: any[] = [];
    allClassFilteredRecords :any[] =[]
    tempDeselectedCategories: any[] = [];
    tempDeselectedClassification :any[]=[]
    allClassRecords: TreeNodeOfGetSycEntityObjectClassificationForViewDto[] = [];
    loadedChildrenRecords: TreeNodeOfGetSycEntityObjectClassificationForViewDto[] = []

    parentClassification : CreateOrEditSycEntityObjectClassificationDto
    savedIds: number[]; // input
  
    parentCat : any;
    parentClass : any;
    addSubCat: boolean = false;
    editSubCat: boolean = false;

    addSubClas: boolean = false;
    editSubClass: boolean = false;
    openDropDown: boolean = false;
    showAppCodes: boolean = false;
    showAppCatCodes: boolean = false;
    
    selectAllChecked: boolean = false;
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
       
      
    }

    ngAfterViewInit() {
        if(this.currentTab == ShoppingCartoccordionTabs.orderInfo){
            
            // this.getParentCategories();
            // this.getParentClassifications();
            this.getAllCurrencies();
            }
    }
    ngOnInit(): void {
        if(this.currentTab == ShoppingCartoccordionTabs.orderInfo){
            this.getAppTransactionList();
            this.getAppTransactionClassList()
        if(!this.category) {
            this.category = new CreateOrEditSycEntityObjectCategoryDto()
        }
        if(!this.classification) {
            this.classification = new CreateOrEditSycEntityObjectClassificationDto()
        }
        if(this.parentClassification && this.parentClassification.id ) {
            this.classification.parentId = this.parentClassification.id
        }
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
        this.reference = this.appTransactionsForViewDto?.reference;
        
        // this.selectedCategories = this.appTransactionsForViewDto.entityCategories
        this.classificationItemPath = [];
        this.categoriesItemPath = [];
        console.log(this.appTransactionsForViewDto,'appTransactionsForViewDto')


    }
}

    ngOnChanges(changes: SimpleChanges) {
        if(this.currentTab == ShoppingCartoccordionTabs.orderInfo){
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

            if (this.appTransactionsForViewDto?.entityCategories) {
                this.selectedCategories = this.appTransactionsForViewDto.entityCategories;
                this.selectedCategoriesShow = [...this.selectedCategories];
            }
            if (this.appTransactionsForViewDto?.entityClassifications) {
                this.selectedClassification = this.appTransactionsForViewDto.entityClassifications;
                this.selectedClassificationsShow= [...this.selectedClassification];
            }
        }
        console.log(this.appTransactionsForViewDto,'appTransactionsForViewDto')

        
    }

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
        // if(this.category?.code)
        this.category.code= code;
    }
    getClassCodeValue(code: string) {
        this.classification.code= code;
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



    
    onLabelClick(event: Event) {
        event.stopPropagation(); // Prevent selection on label click
      }

      toggleSelectAll() {
        // Check if all nodes are already selected
        const allNodesSelected = this.selectedCategories.length === this.filteredRecords.length;
      
        if (allNodesSelected) {
          // Deselect all nodes
          this.selectedCategories = [];
        } else {
          // Select all nodes
          this.selectedCategories = this.filteredRecords.map(node => {
            // Ensure the node has valid data
            if (node && node.data && node.data.sycEntityObjectCategory) {
              const category = node.data.sycEntityObjectCategory;
              return new AppEntityCategoryDto({
                entityObjectCategoryId: category.id || 0,
                entityObjectCategoryCode: category.code || '',
                entityObjectCategoryName: category.name || '',
                id: 0,
              });
            } else {
              console.warn('Invalid node structure:', node);
              return null;
            }
          }).filter(category => category !== null);
        }
      
        // Optionally update appTransactionsForViewDto
        this.appTransactionsForViewDto.entityCategories = this.selectedCategories;
      }
      
    
    
    collapseAll() {
        this.filteredRecords.forEach(node => {
            node.expanded = false;
        });
    }
    categoriesItemPath: any[] = [];
    
  
    // categoriesNodeUnSelect(event: any) {
    //     let indx = this.appTransactionsForViewDto.entityCategories.findIndex(x => x.entityObjectCategoryId == event?.entityObjectCategoryId);
    //     if (indx >= 0)
    //         this.appTransactionsForViewDto.entityCategories.splice(indx, 1);


    //     let categoriesItemPathindx = this.categoriesItemPath?.findIndex(x => x.data.sycEntityObjectCategory.id == event.entityObjectCategoryId);
    //     if (categoriesItemPathindx >= 0)
    //         this.categoriesItemPath.splice(categoriesItemPathindx, 1);

    //     this.selectedCategories = this.appTransactionsForViewDto.entityCategories;

    //     this.getParentCategories();

    // }

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
     
        this.showCatBtn = true;
        this.addSubCat = true;
        // Set the parent category details when adding a subcategory
        this.parentCat = {
            code: this.category.code,
            parentId: node.data.sycEntityObjectCategory.id,
        };
    }


    addAsNewChildClass(node: TreeNodeOfGetSycEntityObjectClassificationForViewDto) {
      
        this.showClassBtn = true
        this.addSubClas = true
     this.parentClass = {

        code: this.classification.code,
        parentId: node.data.sycEntityObjectClassification.id,
 }


 
  
    }
    


    EditCat(node: TreeNodeOfGetSycEntityObjectCategoryForViewDto) {
        this.showCatBtn = true
        this.editSubCat = true
     this.parentCat = {
        name: node.data.sycEntityObjectCategory.name,
        
        code: node.data.sycEntityObjectCategory.code,
        id: node.data.sycEntityObjectCategory.id,
 }

 
 this.category.name =  this.parentCat.name


    }
    EditClass(node: TreeNodeOfGetSycEntityObjectClassificationForViewDto) {


        this.showClassBtn = true
        this.editSubClass = true
     this.parentClass = {
        name: node.data.sycEntityObjectClassification.name,
        
        code: node.data.sycEntityObjectClassification.code,
        id: node.data.sycEntityObjectClassification.id,
    }
     this.classification.name =  this.parentClass.name

    
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
            console.log(enteredDate,'enteredDate')

        this.appTransactionsForViewDto.enteredDate = moment.utc(enteredDate);
        this.appTransactionsForViewDto.startDate = moment.utc(startDate);
        this.appTransactionsForViewDto.availableDate = moment.utc(availableDate);
        this.appTransactionsForViewDto.completeDate = moment.utc(completeDate);
        console.log(this.appTransactionsForViewDto.enteredDate,'this.appTransactionsForViewDto.enteredDate')

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

         this.appTransactionsForViewDto.reference = this.reference;

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
        console.log(this.appTransactionsForViewDto.enteredDate,'save')

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
   
    deSelectCat(
        category: any,
        i: number
    ) {


        if (category?.data?.sycEntityObjectCategory?.id) {
            category.removed = true;
        } else this.selectedCategories.splice(i, 1);

        this.tempDeselectedCategories.push(category);
        this.showSelectedCat = true
    }


onNodeSelectCat(event: any) {
    this.processNodeSelectionCat(event.node, true);
  }
  
  
  onNodeUnselectCat(event: any) {
    this.processNodeSelectionCat(event.node, false);
  }
  

  processNodeSelectionCat(node: any, isSelected: boolean) {
    if (!node?.data?.sycEntityObjectCategory) {
      console.warn('Invalid node data:', node);
      return;
    }
  
    const categoryy = node.data.sycEntityObjectCategory;
    const newCategory = new AppEntityCategoryDto({
      entityObjectCategoryId: categoryy.id || 0,
      entityObjectCategoryCode: categoryy.code || '',
      entityObjectCategoryName: categoryy.name || '',
      id: 0,
    });
  
    // Initialize entity categories if not present
    if (!this.appTransactionsForViewDto?.entityCategories) {
      this.appTransactionsForViewDto.entityCategories = [];
    }
  
    if (isSelected) {
      // Check if the category already exists in the selected list
      const categoriesExists = this.appTransactionsForViewDto.entityCategories.some(
        (existingCategory) =>
          existingCategory.entityObjectCategoryId ===
          newCategory.entityObjectCategoryId
      );
  
      if (!categoriesExists) {
        this.appTransactionsForViewDto.entityCategories.push(newCategory);
        this.selectedCategories.push(newCategory);
      }
    } else {
      // Remove the category when unselected
      this.selectedCategories = this.selectedCategories.filter(
        (existingCategory) =>
          !(existingCategory instanceof AppEntityCategoryDto &&
            existingCategory.entityObjectCategoryId ===
              newCategory.entityObjectCategoryId)
      );
  
      this.appTransactionsForViewDto.entityCategories = this.appTransactionsForViewDto.entityCategories.filter(
        (existingCategory) =>
          existingCategory.entityObjectCategoryId !==
          newCategory.entityObjectCategoryId
      );
    }
  
    // Handle parent-child selection/deselection relationships
    this.ensureParentChildSelectionCat(node, isSelected);
  }
  
  // Function to manage parent-child relationships during selection
  ensureParentChildSelectionCat(node: any, isSelected: boolean) {
    if (node.children && node.children.length > 0) {
      // If a parent node is unselected, ensure all its children are also unselected
      node.children.forEach((child: any) => {
        if (!isSelected) {
          const childIndex = this.selectedCategories.findIndex(
            (selected) =>
              selected.entityObjectCategoryId ===
              child.data?.sycEntityObjectCategory?.id
          );
  
          if (childIndex !== -1) {
            this.selectedCategories.splice(childIndex, 1);
            this.appTransactionsForViewDto.entityCategories.splice(childIndex, 1);
          }
        }
      });
    } 

  }
  
  
    // categoriesNodeSelect(event: any) {
    //     console.log(event, 'Event received in categoriesNodeSelect');
    
    //     const newNode = event[event.length - 1];
    
    //     if (newNode?.data?.sycEntityObjectCategory) {
    //         const category = newNode.data.sycEntityObjectCategory;
    
    //         const newCategory = new AppEntityCategoryDto();
    //         newCategory.entityObjectCategoryId = category.id || 0;
    //         newCategory.entityObjectCategoryCode = category.code || '';
    //         newCategory.entityObjectCategoryName = category.name || '';
    //         newCategory.id = 0;
    
    //         if (!this.appTransactionsForViewDto?.entityCategories) {
    //             this.appTransactionsForViewDto.entityCategories = [];
    //         }
    
    //         this.selectedCategories = this.selectedCategories.filter(
    //             (cat) => !(cat instanceof AppEntityCategoryDto && cat.entityObjectCategoryId === newCategory.entityObjectCategoryId)
    //         );
    
    //         const categoryExists = this.appTransactionsForViewDto.entityCategories.some(
    //             (cat) => cat.entityObjectCategoryId === newCategory.entityObjectCategoryId
    //         );
    
    //         if (!categoryExists) {
    //             this.appTransactionsForViewDto.entityCategories.push(newCategory);
    //             this.selectedCategories.push(newCategory);
    //         }
    
    //         console.log(this.selectedCategories, 'Current selected categories');
    //     } else {
    //         console.warn('Invalid node data:', newNode);
    //     }
    // }
    
    
    
    
    saveSelection() {

        this.selectedCategories = this.selectedCategories.filter(
            (cat) => cat instanceof AppEntityCategoryDto
        );
    

        this.selectedCategoriesShow = this.selectedCategories;
    
     
        this.appTransactionsForViewDto.entityCategories = this.selectedCategories.map((item) => {
            return new AppEntityCategoryDto({
                entityObjectCategoryId: item.entityObjectCategoryId || 0,
                entityObjectCategoryCode: item.entityObjectCategoryCode || '',
                entityObjectCategoryName: item.entityObjectCategoryName || '',
                id: 0, 
            });
        });
    
    
        // this.showSelectedCat = true;
        this.showExistCat = false;
    
    
        this.closeDropdown();
        this.treeSelect.hide();
        this.getAppTransactionList();
    }
    
    
    
    cancelSelection() {
        this.closeDropdown();
        this.treeSelect.hide();
        this.showExistCat = false
        this.tempDeselectedCategories =[]

    }

    saveCat(category: any) {
        const isEditing = this.editSubCat;
        
        if (!isEditing) {
            this.getCodeValue(this.generateUniqueCode()); 
        }
        

        const parentId = this.addSubCat ? this.parentCat?.parentId : undefined;
        
       
        let cat = new CreateOrEditSycEntityObjectCategoryDto({
            code: this.category.code, 
            name: category.name,
            objectId: undefined,
            parentId: parentId, 
            id: isEditing ? this.parentCat.id : undefined,
        });
        

        this._sycEntityObjectCategoriesServiceProxy.createOrEditForObjectTransaction(cat)
            .pipe(finalize(() => {
                this.getAppTransactionList(); 
            }))
            .subscribe(() => {
           
                if (!isEditing) {
                    this.notify.info('Added Successfully');
                } else {
                    this.notify.info('Updated Successfully');
                }
            });
    
        // Reset the flags and form inputs
        this.showExistCat = true;
        this.addSubCat = false;
        this.editSubCat = false;
        this.category.name = '';
    }
    
    // Function to generate a unique code for new categories or subcategories
    generateUniqueCode(): string {
        return 'CAT-' + Math.floor(Math.random() * 100000).toString();
    }

    generateUniqueCodeClass(): string {
      
        return 'CLS-' + Math.floor(Math.random() * 100000).toString();
    }
    



    // handleNodeSelect(event: any) {
    //     // Custom logic to handle node selection
    //     console.log('Node selected:', event.node);
    //     const selectedNode = event.node;
    
    //     // Check if the node is already in the selectedClassification array
    //     if (!this.selectedClassification.find(node => node.id === selectedNode.id)) {
    //         // Add the newly selected node to the selectedClassification array
    //         this.selectedClassification.push(selectedNode);
    //     }
    // }
    
    // handleNodeUnselect(event: any) {
    //     const unselectedNode = event.node;
    
    //     // Remove the unselected node from the selectedClassification array
    //     this.selectedClassification = this.selectedClassification.filter(node => node.id !== unselectedNode.id);
    // }
    
    

    deSelectClass(
        classification: any,
        i: number
    ) {


        if (classification?.data?.sycEntityObjectClassification?.id) {
            classification.removed = true;
        } else this.selectedClassification.splice(i, 1);

        this.tempDeselectedClassification.push(classification);
        this.showSelectedClass= true
    }


// Handles when a node is selected
onNodeSelect(event: any) {
    this.processNodeSelection(event.node, true);
  }
  
  // Handles when a node is unselected
  onNodeUnselect(event: any) {
    this.processNodeSelection(event.node, false);
  }
  
  // Common method to process the selection or deselection of a node
  processNodeSelection(node: any, isSelected: boolean) {
    if (!node?.data?.sycEntityObjectClassification) {
      console.warn('Invalid node data:', node);
      return;
    }
  
    const classification = node.data.sycEntityObjectClassification;
    const newClassification = new AppEntityClassificationDto({
      entityObjectClassificationId: classification.id || 0,
      entityObjectClassificationCode: classification.code || '',
      entityObjectClassificationName: classification.name || '',
      id: 0,
    });
  
    // Initialize entity classifications if not present
    if (!this.appTransactionsForViewDto?.entityClassifications) {
      this.appTransactionsForViewDto.entityClassifications = [];
    }
  
    // Handling node addition (when selected)
    if (isSelected) {
      const classificationExists = this.appTransactionsForViewDto.entityClassifications.some(
        (classificate) =>
          classificate.entityObjectClassificationId ===
          newClassification.entityObjectClassificationId
      );
  
      if (!classificationExists) {
        this.appTransactionsForViewDto.entityClassifications.push(newClassification);
        this.selectedClassification.push(newClassification);
      }
    } else {
      // Handling node removal (when unselected)
      this.selectedClassification = this.selectedClassification.filter(
        (classificate) =>
          !(classificate instanceof AppEntityClassificationDto &&
            classificate.entityObjectClassificationId ===
              newClassification.entityObjectClassificationId)
      );
  
      this.appTransactionsForViewDto.entityClassifications = this.appTransactionsForViewDto.entityClassifications.filter(
        (classificate) =>
          classificate.entityObjectClassificationId !==
          newClassification.entityObjectClassificationId
      );
    }
  
    // Ensure parent or child specific handling
    this.ensureParentChildSelection(node, isSelected);
  
    console.log(this.selectedClassification, 'Current selected classification');
  }
  
  // Additional function to handle parent-child selection relationships
  ensureParentChildSelection(node: any, isSelected: boolean) {
    // Check if the node is a parent or has children
    if (node.children && node.children.length > 0) {
      // If a parent is unselected, ensure children are also unselected
      node.children.forEach((child: any) => {
        if (!isSelected) {
          const childIndex = this.selectedClassification.findIndex(
            (selected) =>
              selected.entityObjectClassificationId ===
              child.data?.sycEntityObjectClassification?.id
          );
          if (childIndex !== -1) {
            this.selectedClassification.splice(childIndex, 1);
            this.appTransactionsForViewDto.entityClassifications.splice(childIndex, 1);
          }
        }
      });
    }
  }
  
  
    // classificationNodeSelect(event: any) {
    
    //     const newNode = event[event.length - 1];
    
    //     if (newNode?.data?.sycEntityObjectClassification) {
    //         const classification = newNode.data.sycEntityObjectClassification;
    
    //         const newClassification= new AppEntityClassificationDto();
    //         newClassification.entityObjectClassificationId = classification.id || 0;
    //         newClassification.entityObjectClassificationCode = classification.code || '';
    //         newClassification.entityObjectClassificationName = classification.name || '';
    //         newClassification.id = 0;
    
    //         if (!this.appTransactionsForViewDto?.entityClassifications) {
    //             this.appTransactionsForViewDto.entityClassifications = [];
    //         }
    
    //         this.selectedClassification = this.selectedClassification.filter(
    //             (classificate) => !(classificate instanceof AppEntityClassificationDto && classificate.entityObjectClassificationId === newClassification.entityObjectClassificationId)
    //         );
    
    //         const classificationExists = this.appTransactionsForViewDto.entityClassifications.some(
    //             (classificate) => classificate.entityObjectClassificationId === newClassification.entityObjectClassificationId
    //         );
    
    //         if (!classificationExists) {
    //             this.appTransactionsForViewDto.entityClassifications.push(newClassification);
    //             this.selectedClassification.push(newClassification);
    //         }
    
    //         console.log(this.selectedClassification, 'Current selected classification');
    //     } else {
    //         console.warn('Invalid node data:', newNode);
    //     }
    // }
    saveClassSelection() {
        
        this.selectedClassification = this.selectedClassification.filter(
            item => item instanceof AppEntityClassificationDto
        );
    
        this.selectedClassificationsShow = this.selectedClassification;


        this.appTransactionsForViewDto.entityClassifications = this.selectedClassification.map(item => {
            return new AppEntityClassificationDto({
                entityObjectClassificationId: item.entityObjectClassificationId || 0,
                entityObjectClassificationCode: item.entityObjectClassificationCode || '',
                entityObjectClassificationName: item.entityObjectClassificationName || '',
                id: 0 
            });
        });

        // this.showSelectedClass = true;
     
        this.showExistClass = false;
        this.closeDropdown();
        this.treeSelect.hide();
        this.getAppTransactionClassList(); 
    }
    
    
    
    
    
    cancelClassSelection() {
      
        this.closeDropdown();
        this.treeSelect.hide();

        this.showExistClass = false
     
        this.tempDeselectedClassification =[]

    }
    closeDropdown() {
        if (this.treeSelect) {
          this.treeSelect.hide(); // Close the dropdown (make sure this method exists in your TreeSelect version)
        }
      }
   




saveClass(classification:any,type?:''){
    const isEditing = this.editSubClass;
    if (!isEditing) {
        this.getClassCodeValue(this.generateUniqueCodeClass()); 
    }

    const parentId = this.addSubClas ? this.parentClass?.parentId : undefined;
    let classificate = new CreateOrEditSycEntityObjectClassificationDto({
        code:  this.classification.code,
        name: classification.name,
        objectId: undefined,
        parentId:  parentId,
        id:  isEditing ? this.parentClass.id : undefined,
    });
  
    this._sycEntityObjectClassificationsServiceProxy.createOrEditForObjectTransaction(classificate)
    .pipe(finalize(() => { 
        this.getAppTransactionClassList()

    }))
    .subscribe(() => {
        if (!isEditing) {

            this.notify.info('Added Successfuly');
                   } else {
            this.notify.info('Updated Sucssefuly');
           
                   }

    });
    this.showClassBtn = false
    this.addSubClas = false
    this.editSubClass = false
    this.classification.name = '';
   

    
}






deleteCat(cat:any){
    console.log(cat,'id') 

    this._sycEntityObjectCategoriesServiceProxy.delete(cat.data.sycEntityObjectCategory.id)
    .pipe(finalize(() => { 
        // this.saving = false;
    }))
    .subscribe(() => {
        this.notify.info("Successfully deleted.");
       this.getAppTransactionList()


    });
    // this.showCatBtn = false
        // this.selectedCategories[0] = {...cat};
    //    this.category.name = ''
        console.log(this.selectedCategories,'selectedCategories')
    
}

deleteClass(classi:any){
    console.log(classi,'id') 

    this._sycEntityObjectClassificationsServiceProxy.delete(classi.data.sycEntityObjectClassification.id)
    .pipe(finalize(() => { 
        // this.saving = false;
    }))
    .subscribe(() => {
        this.notify.info("Successfully deleted.");
       this.getAppTransactionClassList()


    });
    // this.showCatBtn = false
        // this.selectedCategories[0] = {...cat};
    //    this.category.name = ''
        console.log(this.selectedCategories,'selectedCategories')
    
}
cancelCat(){
     this.getAppTransactionList()
       this.category.name = ''
       this.addSubCat = false
       this.editSubCat = false
    //    this.tempDeselectedCategories =[]

}

cancelClass(){
    this.getAppTransactionClassList()
      this.classification.name = ''
      this.addSubClas = false
      this.editSubClass = false
}
    showEditMode() {
        this.selectedCategories = this.appTransactionsForViewDto?.entityCategories;
        this.selectedClassification = this.appTransactionsForViewDto?.entityClassifications; 
        this.createOrEditorderInfo = true;
        this.showSaveBtn = true;
        this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto));
    }

    save() {
        this.tempDeselectedCategories = [];
        this.tempDeselectedClassification = [];

        this.createOrEditorderInfo = false;
        this.createOrEditTransaction();
        this.getAppTransactionList()
        this.getAppTransactionClassList()

        if (this.appTransactionsForViewDto?.entityCategories) {
            this.selectedCategories = this.appTransactionsForViewDto.entityCategories;
            this.selectedCategoriesShow = [...this.selectedCategories];
        }
        if (this.appTransactionsForViewDto?.entityClassifications) {
            this.selectedClassification = this.appTransactionsForViewDto.entityClassifications;
            this.selectedClassificationsShow= [...this.selectedClassification];
        }
    }
    cancel() {
        this.appTransactionsForViewDto=JSON.parse(JSON.stringify(this.oldappTransactionsForViewDto));
        this.onUpdateAppTransactionsForViewDto(this.appTransactionsForViewDto);
        this.createOrEditorderInfo = false;
        this.showSaveBtn = false;
        this.tempDeselectedCategories =[]
        this.tempDeselectedClassification=[]


    }
    onUpdateAppTransactionsForViewDto($event) {
        this.appTransactionsForViewDto = $event;
    }


    // loadedChildrenRecords: TreeNodeOfGetSycEntityObjectTypeForViewDto[] = [];
    // lastSelectedRecord: TreeNodeOfGetSycEntityObjectTypeForViewDto;
    getAppTransactionList(searchQuery?: string) {
        console.log(">>", searchQuery)
        // this.loading = true;
        const subs = this._sycEntityObjectCategoriesServiceProxy
            .getAllWithChildsForTransaction(
                // searchQuery,
                // undefined,
                // undefined,
                // undefined,
                // undefined,
                // undefined,
                // undefined,
                // undefined,
                // false,
                // undefined,
                // undefined,
                // this.sortBy,
                // this.skipCount,
                // this.maxResultCount
            )
            .pipe(finalize(() => (this.loading = false)))
            .subscribe((result) => {
                // this.selectedCategories = this.appTransactionsForViewDto?.entityCategories;
                console.log(result.items,'result.items')

                // if (searchQuery !== undefined) this.allRecords = [];
                // result.items.map((record) => {
              
                //     // const cachedItem : TreeNodeOfGetSycEntityObjectTypeForViewDto = this.loadedChildrenRecords.filter((selectedRecord:TreeNodeOfGetSycEntityObjectTypeForViewDto)=>{
                //     //     const isCached : boolean = selectedRecord.data.sycEntityObjectType.id == record.data.sycEntityObjectType.id
                //     //     return isCached
                //     // })[0]
                //     // const isCached : boolean = !!cachedItem

                //     // if(isCached){
                //     //     record.children = cachedItem.children
                //     //     record.expanded = cachedItem.expanded
                //     //     record.totalChildrenCount = cachedItem.totalChildrenCount;
                //     //     (record as any).partialSelected = (cachedItem as any).partialSelected
                //     // }

                //     // this.checkItemSelection(record);

                //     return record;
                // });
                this.allRecords = [];
  
                
                this.allRecords.push(...result.items);
   
                this.filteredRecords = this.allRecords.filter(record =>
                    !this.selectedCategories.some(
                        selected => selected.entityObjectCategoryId === record.data?.sycEntityObjectCategory?.id
                    )
                
                  );
                //   this.filteredRecords = [
                //     {
                //       key: 'customNode', // Unique key to identify the custom node
                //       label: '', // Optional label if needed
                //       data: null, // Optional data if needed
                //     },
                //     ...this.filteredRecords, // Your actual nodes go here
                //   ];
              
                // }
               
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




    getAppTransactionClassList(searchQuery?: string) {
        console.log(">>", searchQuery)
        // this.loading = true;
        const subs = this._sycEntityObjectClassificationsServiceProxy
            .getAllWithChildsForTransaction(

            )
            .pipe(finalize(() => (this.loading = false)))
            .subscribe((result) => {
           
                this.allClassRecords = [];
                this.allClassRecords.push(...result.items);
                console.log(this.allClassRecords,'this.allRecordsclass')
  

                this.allClassFilteredRecords = this.allClassRecords.filter(record =>
                    !this.selectedClassification.some(
                      (  selected => selected.entityObjectClassificationId === record.data?.sycEntityObjectClassification?.id)
                    )
                  );

                //   this.allClassFilteredRecords = this.allClassRecords.filter(record => {
           
                //      !this.selectedClassification.some(selected => 
                     
                   
                //         record.children?.some(child => 
                //             selected.entityObjectClassificationId === child.data?.sycEntityObjectClassification?.id
                //         )
                //     );
                // });

            });
        this.subscriptions.push(subs);
    }


    toggleAppCodes() {
        this.showAppCodes = false;
        setTimeout(() => {
          this.showAppCodes = true; // Re-render app-codes after a delay
        }, 0); // Delay to force Angular to re-create the component
      }

      toggleAppCatCodes() {
        this.showAppCatCodes = false;
        setTimeout(() => {
          this.showAppCatCodes = true; // Re-render app-codes after a delay
        }, 0); // Delay to force Angular to re-create the component
      }


      
}
