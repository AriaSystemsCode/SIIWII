import { AfterViewInit, Component, EventEmitter, Injector, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
  AppEntitiesServiceProxy,
  AppEntityCategoryDto,
  AppEntityClassificationDto,
  AppTransactionServiceProxy,
  CreateOrEditSycEntityObjectCategoryDto,
  CreateOrEditSycEntityObjectClassificationDto,
  GetAppTransactionsForViewDto,
  SycEntityObjectCategoriesServiceProxy,
  SycEntityObjectClassificationsServiceProxy,
  TreeNodeOfGetSycEntityObjectCategoryForViewDto,
  TreeNodeOfGetSycEntityObjectClassificationForViewDto,
} from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs";

import * as moment from "moment";
import { TreeSelect } from "primeng/treeselect";
import { Calendar } from "primeng/calendar";
import { TransactionCartoccordionTabs } from "../../../enums/TransactionCartoccordionTabs";
import { AppConsts } from "@shared/AppConsts";

@Component({
  selector: "app-order-information",
  templateUrl: "./order-information.component.html",
  styleUrls: ["./order-information.component.scss"],
})
export class OrderInformationComponent extends AppComponentBase implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @ViewChild('calendar1') calendar1: Calendar;
  @ViewChild('calendar2') calendar2: Calendar;
  @ViewChild('calendar3') calendar3: Calendar;
  @ViewChild('calendar4') calendar4: Calendar;
  @ViewChild(TreeSelect) treeSelect!: TreeSelect;

  @Output() generatOrderReport = new EventEmitter<boolean>();
  @Output() refreshShoppingCart = new EventEmitter<boolean>();
  @Output() orderInfoValid = new EventEmitter<TransactionCartoccordionTabs>();
  @Output() ontabChange = new EventEmitter<TransactionCartoccordionTabs>();

  @Input() canChange: boolean = true;
  @Input() activeTab: number;
  @Input() currentTab: number;
  @Input() appTransactionsForViewDto: GetAppTransactionsForViewDto;
  @Input() createOrEditorderInfo: boolean;
  @Input() oldCreateOrEditorderInfo: boolean;

  transactionCartoccordionTabs = TransactionCartoccordionTabs;
  fullName: string;
  reference: string;

  enteredDate = new Date();
  startDate = new Date();
  availableDate = new Date();
  completeDate = new Date();

  /** Entity Types */
  entityObjectType = "CATEGORY";
  entityObjectClassificationType = "CLASSIFICATION";

  /** Category */
  category = new CreateOrEditSycEntityObjectCategoryDto();
  sycEntityObjectCategory = new CreateOrEditSycEntityObjectCategoryDto();
  selectedCategories: AppEntityCategoryDto[] = [];
  selectedCategoriesShow: any;
  parentCat: any;

  /** Classification */
  classification = new CreateOrEditSycEntityObjectClassificationDto();
  selectedClassification: AppEntityClassificationDto[] = [];
  selectedClassificationsShow: any;
  parentClass: any;

  /** Tree Data */
  allRecords: TreeNodeOfGetSycEntityObjectCategoryForViewDto[] = [];
  filteredRecords: any[] = [];
  allClassRecords: TreeNodeOfGetSycEntityObjectClassificationForViewDto[] = [];
  allClassFilteredRecords: any[] = [];
  tempDeselectedCategories: any[] = [];
  tempDeselectedClassification: any[] = [];

  /** UI Controls */
  showSaveBtn = false;
  showCatBtn = false;
  hideCatBtn = true;
  hideClassBtn = true;
  showSelectedCat = false;
  showClassBtn = false;
  showSelectedClass = false;
  showExistCat = false;
  showExistClass = false;
  addSubCat = false;
  editSubCat = false;
  addSubClas = false;
  editSubClass = false;
  showAppCodes = false;
  showAppCatCodes = false;

  /** Currency */
  currencies: any[] = [];
  selectedCurrency: any;

  oldappTransactionsForViewDto;
  isContactsValid = false;
  primeDateFormat = 'mm/dd/yy'; // default
 languageSettingName  =AppConsts.languageSettingName;

  currentLang:string
  isArabic:boolean 

  constructor(
    injector: Injector,
    private _AppTransactionServiceProxy: AppTransactionServiceProxy,
    private _sycEntityObjectClassificationsServiceProxy: SycEntityObjectClassificationsServiceProxy,
    private _sycEntityObjectCategoriesServiceProxy: SycEntityObjectCategoriesServiceProxy,
    private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,

  ) {
    super(injector);
  }
  ngOnInit(): void {
    this.primeDateFormat = this.languageSettingName != 'en-GB'
    ? 'mm/dd/yy'
    : 'dd/mm/yy';
    this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
    this.currentLang == 'ar' || this.currentLang == 'ar-EG'  ? this.isArabic = true : this.isArabic = false
    if (this.currentTab === TransactionCartoccordionTabs.orderInfo) {
      this.fullName = `${this.appSession.user.name}${this.appSession.user.surname}`;
      this.initDates();
      this.getAppTransactionList();
      this.getAppTransactionClassList();
    }
  }

  ngAfterViewInit(): void {
    if (this.currentTab === TransactionCartoccordionTabs.orderInfo) {
      this.getAllCurrencies();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.currentTab === TransactionCartoccordionTabs.orderInfo && this.appTransactionsForViewDto) {
      this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto));
      this.initDates();
      this.reference = this.appTransactionsForViewDto.reference;
      this.selectedCurrency = this.appTransactionsForViewDto.currencyId || this.selectedCurrency;
      this.selectedCategories = this.appTransactionsForViewDto.entityCategories || [];
      this.selectedCategoriesShow = [...(this.appTransactionsForViewDto.entityCategoriesNames?.items || [])];
      this.selectedClassification = this.appTransactionsForViewDto.entityClassifications || [];
      this.selectedClassificationsShow = [...(this.appTransactionsForViewDto.entityClassificationsNames?.items || [])];
      this.showSaveBtn = false;
    }

    if (this.appTransactionsForViewDto?.entityCategories) {
      this.selectedCategories = this.appTransactionsForViewDto.entityCategories;
      if (this.appTransactionsForViewDto.entityCategoriesNames?.items.length > 0) {
        this.selectedCategoriesShow = [...this.appTransactionsForViewDto.entityCategoriesNames?.items];

      }
    }
    if (this.appTransactionsForViewDto?.entityClassifications) {
      this.selectedClassification = this.appTransactionsForViewDto.entityClassifications;
      if (this.appTransactionsForViewDto.entityClassificationsNames?.items.length > 0) {
        this.selectedClassificationsShow = [...this.appTransactionsForViewDto.entityClassificationsNames?.items];

      }
    }
  }

  initDates(): void {
    this.enteredDate = moment(this.appTransactionsForViewDto?.enteredDate).toDate();
    this.startDate = moment(this.appTransactionsForViewDto?.startDate).toDate();
    this.availableDate = moment(this.appTransactionsForViewDto?.availableDate).toDate();
    this.completeDate = moment(this.appTransactionsForViewDto?.completeDate).toDate();
  }

  onReferenceChange() {
    this.appTransactionsForViewDto.reference = this.reference;
  }

  openCalendar(calendar: Calendar) {
    calendar.inputfieldViewChild.nativeElement.click();
  }



  getAllCurrencies() {
    const subs = this._AppEntitiesServiceProxy
      .getAllCurrencyForTableDropdown()
      .subscribe((res: any) => {
        this.currencies = res;
      });
    this.subscriptions.push(subs)
  }

  getCodeValue(code: string) {

    this.category.code = code;
  }
  getClassCodeValue(code: string) {
    this.classification.code = code;
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
    this.category.name = this.parentCat.name
  }

  EditClass(node: TreeNodeOfGetSycEntityObjectClassificationForViewDto) {
    this.showClassBtn = true
    this.editSubClass = true
    this.parentClass = {
      name: node.data.sycEntityObjectClassification.name,
      code: node.data.sycEntityObjectClassification.code,
      id: node.data.sycEntityObjectClassification.id,
    }
    this.classification.name = this.parentClass.name
  }


  isSalesOrderValidForm(): boolean {
    // Check if all required fields have values
    const isValid = this.appTransactionsForViewDto?.currencyCode &&
      this.appTransactionsForViewDto?.currencyExchangeRate 
      &&
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

    if (!this.completeDate || this.completeDate <= this.startDate) {
      this.completeDate = this.startDate;
    }

    if (!this.availableDate || this.availableDate <= this.startDate) {
      this.availableDate = this.startDate;
    }
    this.appTransactionsForViewDto.enteredDate = moment.utc(moment(this.enteredDate).format('YYYY-MM-DD'));
    this.appTransactionsForViewDto.startDate = moment.utc(moment(this.startDate).format('YYYY-MM-DD'));
    this.appTransactionsForViewDto.availableDate = moment.utc(moment(this.availableDate).format('YYYY-MM-DD'));
    this.appTransactionsForViewDto.completeDate = moment.utc(moment(this.completeDate).format('YYYY-MM-DD'));


  }
  changeCompleteDate(date) {
    const selectedDate = date;

    this.completeDate = selectedDate;
    this.availableDate = selectedDate;
    this.onChangeDate()
  }

  createOrEditTransaction() {
    this.saveDates()
    this.appTransactionsForViewDto.timeZoneValue = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const subs = this._AppTransactionServiceProxy.createOrEditTransaction(this.appTransactionsForViewDto)

      .pipe(finalize(() => {

      }))

      .subscribe((res) => {
        if (res) {
          this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto));
          this.refreshShoppingCart.emit(true)

          if (!this.showSaveBtn)
            this.ontabChange.emit(TransactionCartoccordionTabs.orderInfo);

          else
            this.showSaveBtn = false;

        }
      });
    this.subscriptions.push(subs)

  }


  isContactFormValid(value) {
    if (this.activeTab == this.transactionCartoccordionTabs.orderInfo) {
      this.isContactsValid = value;
      if (value) {
        this.isContactsValid = true;
        if (this.isSalesOrderValidForm())
          this.orderInfoValid.emit(TransactionCartoccordionTabs.orderInfo);
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
    const category = node?.data?.sycEntityObjectCategory;
    if (!category) {
      return;
    }

    const newCategory = new AppEntityCategoryDto({
      id: 0,
      entityObjectCategoryId: category.id || 0,
      entityObjectCategoryCode: category.code || '',
      entityObjectCategoryName: category.name || '',
    });

    this.appTransactionsForViewDto.entityCategories ||= [];

    if (isSelected) {
      if (node.leaf) {  // Check if it's a leaf node
        const leafCategory = new AppEntityCategoryDto({
          id: 0,
          entityObjectCategoryId: category.id,
          entityObjectCategoryCode: category.code,
          entityObjectCategoryName: this.getPath(node),  // Use the provided path
        });

        // Add the leaf category if not already in selected categories
        if (!this.selectedCategories.some(
          cat => cat.entityObjectCategoryId === leafCategory.entityObjectCategoryId)) {
          this.selectedCategories.push(leafCategory);
        }
      } else {
        // Add the category if not already in selected categories
        if (!this.appTransactionsForViewDto.entityCategories.some(
          cat => cat.entityObjectCategoryId === newCategory.entityObjectCategoryId)) {
          this.appTransactionsForViewDto.entityCategories.push(newCategory);
          this.selectedCategories.push(newCategory);
        }
      }
    } else {
      // Remove the category when unselected
      this.selectedCategories = this.selectedCategories.filter(
        cat => cat.entityObjectCategoryId !== newCategory.entityObjectCategoryId
      );
      this.appTransactionsForViewDto.entityCategories = this.appTransactionsForViewDto.entityCategories.filter(
        cat => cat.entityObjectCategoryId !== newCategory.entityObjectCategoryId
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



  saveSelection() {
    this.selectedCategories = this.selectedCategories.filter(
      (cat) => cat instanceof AppEntityCategoryDto
    );
    this.selectedCategoriesShow = this.selectedCategories.map(
      (cat) => cat.entityObjectCategoryName
    );

    this.appTransactionsForViewDto.entityCategories = this.selectedCategories.map((item) => {
      return new AppEntityCategoryDto({
        entityObjectCategoryId: item.entityObjectCategoryId || 0,
        entityObjectCategoryCode: item.entityObjectCategoryCode || '',
        entityObjectCategoryName: item.entityObjectCategoryName || "",
        id: 0,
      });
    });

 

    this.appTransactionsForViewDto.entityCategoriesNames.totalCount = this.selectedCategories.length;
    this.appTransactionsForViewDto.entityCategoriesNames.items = this.selectedCategories.map(item => item.entityObjectCategoryName || '');
    this.showExistCat = false;
    this.treeSelect.hide();
    this.getAppTransactionList();
  }



  cancelSelection() {
    this.treeSelect.hide();
    this.showExistCat = false
    this.tempDeselectedCategories = []
    if (this.appTransactionsForViewDto?.entityCategories) {
      this.selectedCategories = this.appTransactionsForViewDto.entityCategories;
      this.selectedCategoriesShow = [...this.appTransactionsForViewDto.entityCategoriesNames?.items];
    }
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


    const subs = this._sycEntityObjectCategoriesServiceProxy.createOrEditForObjectTransaction(cat)
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
    this.subscriptions.push(subs)
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


  deSelectClass(
    classification: any,
    i: number
  ) {


    if (classification?.data?.sycEntityObjectClassification?.id) {
      classification.removed = true;
    } else this.selectedClassification.splice(i, 1);

    this.tempDeselectedClassification.push(classification);
    this.showSelectedClass = true
  }

  getPath(item: any): any {
    if (!item.parent) {
      return item.label;
    }

    // Recursively build the path including all ancestor nodes
    const parentPath = this.getPath(item.parent);
    return parentPath ? parentPath + "-" + item.label : item.label;
  }
  // Handles when a node is selected
  onNodeSelect(event: any) {
    this.processNodeSelection(event.node, true);
  }

  // Handles when a node is unselected
  onNodeUnselect(event: any) {
    this.processNodeSelection(event.node, false);
  }

  processNodeSelection(node: any, isSelected: boolean) {
    const classification = node?.data?.sycEntityObjectClassification;

    if (!classification) {
      return;
    }

    const newClassification = new AppEntityClassificationDto({
      id: 0,
      entityObjectClassificationId: classification.id || 0,
      entityObjectClassificationCode: classification.code || '',
      entityObjectClassificationName: classification.name || '',
    });

    this.appTransactionsForViewDto.entityClassifications ||= [];

    if (isSelected) {
      if (node.leaf) { // Check if it's a leaf node
        const leafClassification = new AppEntityClassificationDto({
          id: 0,
          entityObjectClassificationId: classification.id,
          entityObjectClassificationCode: classification.code,
          entityObjectClassificationName: this.getPath(node), // Use the provided path
        });

        // Add the leaf classification if not already in selected classifications
        if (!this.selectedClassification.some(
          classificate => classificate.entityObjectClassificationId === leafClassification.entityObjectClassificationId)) {
          this.selectedClassification.push(leafClassification);
        }
      } else {
        // Add the classification if not already in selected classifications
        if (!this.appTransactionsForViewDto.entityClassifications.some(
          classificate => classificate.entityObjectClassificationId === newClassification.entityObjectClassificationId)) {
          this.appTransactionsForViewDto.entityClassifications.push(newClassification);
          this.selectedClassification.push(newClassification);
        }
      }
    } else {
      // Remove the classification when unselected
      this.selectedClassification = this.selectedClassification.filter(
        classificate => classificate.entityObjectClassificationId !== newClassification.entityObjectClassificationId
      );
      this.appTransactionsForViewDto.entityClassifications = this.appTransactionsForViewDto.entityClassifications.filter(
        classificate => classificate.entityObjectClassificationId !== newClassification.entityObjectClassificationId
      );
    }

    // Handle parent-child selection/deselection relationships
    this.ensureParentChildSelection(node, isSelected);
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


  saveClassSelection() {
    this.selectedClassification = this.selectedClassification.filter(
      item => item instanceof AppEntityClassificationDto
    );
    this.selectedClassificationsShow = this.selectedClassification.map(
      (cat) => cat.entityObjectClassificationName
    );

    this.appTransactionsForViewDto.entityClassifications = this.selectedClassification.map(item => {
      return new AppEntityClassificationDto({
        entityObjectClassificationId: item.entityObjectClassificationId || 0,
        entityObjectClassificationCode: item.entityObjectClassificationCode || '',
        entityObjectClassificationName: item.entityObjectClassificationName || '',
        id: 0
      });
    });


    this.appTransactionsForViewDto.entityClassificationsNames.totalCount = this.selectedClassification.length;
    this.appTransactionsForViewDto.entityClassificationsNames.items = this.selectedClassification.map(item => item.entityObjectClassificationName || '');

    this.showExistClass = false;
    this.treeSelect.hide();
    this.getAppTransactionClassList();
  }


  cancelClassSelection() {

    this.treeSelect.hide();

    this.showExistClass = false

    this.tempDeselectedClassification = []
    if (this.appTransactionsForViewDto?.entityClassifications) {
      this.selectedClassification = this.appTransactionsForViewDto.entityClassifications;
      this.selectedClassificationsShow = [...this.appTransactionsForViewDto.entityClassificationsNames?.items];
    }

  }


  saveClass(classification: any, type?: '') {
    const isEditing = this.editSubClass;
    if (!isEditing) {
      this.getClassCodeValue(this.generateUniqueCodeClass());
    }

    const parentId = this.addSubClas ? this.parentClass?.parentId : undefined;
    let classificate = new CreateOrEditSycEntityObjectClassificationDto({
      code: this.classification.code,
      name: classification.name,
      objectId: undefined,
      parentId: parentId,
      id: isEditing ? this.parentClass.id : undefined,
    });

    const subs = this._sycEntityObjectClassificationsServiceProxy.createOrEditForObjectTransaction(classificate)
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
    this.subscriptions.push(subs)
    this.showClassBtn = false
    this.addSubClas = false
    this.editSubClass = false
    this.classification.name = '';



  }


  deleteCategory(cat: any) {
    const subs = this._sycEntityObjectCategoriesServiceProxy.delete(cat.data.sycEntityObjectCategory.id)
      .pipe(finalize(() => {
      }))
      .subscribe(() => {
        this.notify.info("Successfully deleted.");
        this.getAppTransactionList()


      });
    this.subscriptions.push(subs)

  }

  deleteClassification(classi: any) {
    const subs = this._sycEntityObjectClassificationsServiceProxy.delete(classi.data.sycEntityObjectClassification.id)
      .pipe(finalize(() => {
      }))
      .subscribe(() => {
        this.notify.info("Successfully deleted.");
        this.getAppTransactionClassList()
      });

    this.subscriptions.push(subs)

  }
  cancelCategory() {
    this.getAppTransactionList()
    this.category.name = ''
    this.addSubCat = false
    this.editSubCat = false
  }

  cancelClassification() {
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
      this.selectedClassificationsShow = [...this.selectedClassification];
    }
  }
  cancel() {
    this.appTransactionsForViewDto = JSON.parse(JSON.stringify(this.oldappTransactionsForViewDto));
    this.onUpdateAppTransactionsForViewDto(this.appTransactionsForViewDto);
    this.createOrEditorderInfo = false;
    this.showSaveBtn = false;
    this.tempDeselectedCategories = []
    this.tempDeselectedClassification = []
    this.getAppTransactionList()
    this.getAppTransactionClassList()
    if (this.appTransactionsForViewDto?.entityClassifications) {
      this.selectedClassification = this.appTransactionsForViewDto.entityClassifications;
      this.selectedClassificationsShow = [...this.appTransactionsForViewDto.entityClassificationsNames?.items];
    }
    if (this.appTransactionsForViewDto?.entityCategories) {
      this.selectedCategories = this.appTransactionsForViewDto.entityCategories;
      this.selectedCategoriesShow = [...this.appTransactionsForViewDto.entityCategoriesNames?.items];
    }
  }
  onUpdateAppTransactionsForViewDto($event) {
    this.appTransactionsForViewDto = $event;
  }



  getAppTransactionList(searchQuery?: string) {

    const subs = this._sycEntityObjectCategoriesServiceProxy
      .getAllWithChildsForTransaction()
      .subscribe((result) => {

        this.allRecords = [];
        this.allRecords.push(...result.items);
        this.filteredRecords = this.allRecords.filter(record =>
          !this.selectedCategories.some(
            selected => selected.entityObjectCategoryId === record.data?.sycEntityObjectCategory?.id
          )
        );
      });
    this.subscriptions.push(subs);
  }




  getAppTransactionClassList(searchQuery?: string) {
    const subs = this._sycEntityObjectClassificationsServiceProxy
      .getAllWithChildsForTransaction(

    )
      .subscribe((result) => {

        this.allClassRecords = [];
        this.allClassRecords.push(...result.items);
        this.allClassFilteredRecords = this.allClassRecords.filter(record =>
          !this.selectedClassification.some(
            (selected => selected.entityObjectClassificationId === record.data?.sycEntityObjectClassification?.id)
          )
        );
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
  ngOnDestroy() {
    this.unsubscribeToAllSubscriptions();

  }

}
