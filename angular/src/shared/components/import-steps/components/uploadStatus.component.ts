// <!-- Iteration-8 -->
import { ChangeDetectorRef, ElementRef, HostListener, OnChanges, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from "@angular/core";
import { Injector } from "@angular/core";
import { Output } from "@angular/core";
import { EventEmitter } from "@angular/core";
import { Input } from "@angular/core";
import { Component } from "@angular/core";
import { AppConsts } from "@shared/AppConsts";
import { AppComponentBase } from "@shared/common/app-component-base";
import { ModalDirective } from "ngx-bootstrap/modal";
import Swal from "sweetalert2";
import { ImportTypes } from "../models/ImportTypes";
import { MainImportService } from "../services/mainImport.service";
import { GetAllAppItemsInput, ItemsFilterTypesEnum } from "@shared/service-proxies/service-proxies";
import { ReorderTreeListDragDropHelper } from "@node_modules/@devexpress/analytics-core/analytics-widgets-internal";
import { UploadActionEnum } from "../models/UploadActionEnum";

@Component({
  selector: "uploadStatusModal",
  templateUrl: "./uploadStatus.component.html",
  styleUrls: ["./uploadStatus.component.scss"],
})
export class uploadStatusComponent extends AppComponentBase implements OnInit, OnChanges {
  @ViewChild("uploadStatus", { static: true }) modal: ModalDirective;

  @Input() uploadingResult: any = null;
  @Output() goNextstep = new EventEmitter<any>();
  @Output() close = new EventEmitter<boolean>();
  @Output() totalPassedRecords = new EventEmitter<number>();
  @Output() totalFailedRecords = new EventEmitter<number>();
  @Output() onDownloadLogFile = new EventEmitter<boolean>();
  importType: ImportTypes;
  ImportTypes = ImportTypes;
  activeRecordType: string = 'Data';
  uploadStatsColumnsName;

  @Input() imagesList;
  acceptedAspectRatio;
  currentActionRecord: any = null;
  @ViewChildren('codeInputContainer') codeInputContainers!: QueryList<ElementRef>;
  @ViewChildren('rowRef') rowRefs!: QueryList<ElementRef>;
  @Output() searchItemCode = new EventEmitter<any>();
  LinkToExistingITEM_Ret_Data;
  activeRecord: any = null;
  @ViewChild('codeInputRef') codeInputRef!: ElementRef<HTMLInputElement>;
  @Output() selectSugItemCode = new EventEmitter<any>();
  @Input() updatedRecordData: any;


  @Input() imData: boolean;
  @Input() imImages: boolean;
  hasDataRecords: boolean = false;
  hasImageRecords: boolean = false;
  UploadActionEnum = UploadActionEnum;


  public constructor(
    private _importService: MainImportService,
    injector: Injector,
    private cdr: ChangeDetectorRef
  ) {
    super(injector);
  }

  ngOnInit() {
    this.getuploadStatsColumnsName();
    this.getAspectatio();
  }



  ngOnChanges(changes: SimpleChanges) {
    if (changes['uploadingResult'] && this.uploadingResult) {
      const allRecords = this.uploadingResult?.excelRecords || [];
      this.hasDataRecords = allRecords.some(r => r.recordType !== 'Image');
      this.hasImageRecords = allRecords.some(r => r.recordType === 'Image');

      if (this.hasDataRecords)
        this.activeRecordType = 'Data'
      else
        this.activeRecordType = 'Image'
    }

    this.records = this.filteredRecords()?.map((r, idx) => ({
      ...r,
      id: r.id ?? idx
    })) || [];
    this.records.forEach(r => r.showActions = false);

    //I44 update record
    if (changes['updatedRecordData'] && this.updatedRecordData) {
      const { record, newData } = this.updatedRecordData;
      const updatedRec = this.records.find(r => r.id === record.id);

      if (updatedRec) {
        for (const key in newData) {
          if (newData.hasOwnProperty(key)) {
            this.setRecordValue(updatedRec, key, newData[key]);
          }
        }
      }
    }
  }


  show(importType: ImportTypes) {
    this.importType = importType;
    this.modal.show();
  }

  hide() {
    this.modal.hide();
  }

  GoNextstep() {
    var _text = "";
    _text = "All " + ImportTypes[this.importType] + " Failed , can not import.";

    if (this.uploadingResult.totalPassedRecords == 0) {
      Swal.fire({
        title: "",
        text: _text,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ok",
      }).then((result) => {
      });
    } else {
      this.goNextstep.emit();
      this.totalFailedRecords.emit(
        this.uploadingResult.totalFailedRecords
      );
      this.totalPassedRecords.emit(
        this.uploadingResult.totalPassedRecords
      );
    }
  }

  askToClose() {
    this.close.emit(true);
  }

  downloadLogFile() {
    this.onDownloadLogFile.emit(true);
  }


  filteredRecords() {
    if (!this.uploadingResult?.excelRecords?.length) return [];

    if (this.activeRecordType == 'Data')
      return this.uploadingResult?.excelRecords?.filter(r => r?.recordType !== 'Image');

    else
      return this.uploadingResult?.excelRecords?.filter(r => r?.recordType == 'Image');

  }

  records;

  switchTab(type: string) {
    if (this.isActionInProgress()) {
      return;
    }

    this.activeRecordType = type;

    this.records = this.filteredRecords()?.map((r, idx) => ({
      ...r,
      id: r.id ?? idx
    })) || [];

    this.records?.forEach(r => r.showActions = false);
  }



  getuploadStatsColumnsName() {
    this.uploadStatsColumnsName = [
      { name: "Image Preview", showFor: "Image" },
      { name: "Record Type" },
      { name: "Status" },
      { name: "Record Status" },
      { name: "Parent Code" },
      { name: "Code" },
      { name: "Name" },
      { name: "Product Description" },
      { name: "Product Classification" },
      { name: "Product Classification Description" },
      { name: "Product Category Code" },
      { name: "Product Category Description" },
      { name: "Price" },
      { name: "Price Currency Code" },
      { name: "Image is Default", showFor: "Image" },
      { name: "Image Folder Name", showFor: "Image" },
      { name: "Color Code" },
      { name: "Color Name" },
      { name: "Size Code" },
      { name: "Size Name" },
      { name: "Size Scale Name" },
      { name: "Scale Sizes Order" },
      { name: "Size Ratio Name" },
      { name: "Size Ratio Value" },
      { name: "Material Content" },
      { name: "Sold Out Date" },
      { name: "Brand Code" },
      { name: "Brand Name" },
      { name: "Start Ship Date" },
      { name: "Dimension 1 sizes" },
      { name: "Dimension 2 sizes" },
      { name: "Dimension 3 sizes" },
      { name: "Dimension 1 Name" },
      { name: "Dimension 2 Name" },
      { name: "Dimension 3 Name" },
      { name: "Color-HEX" },
      { name: "Color-Image" },
      { name: "Color-Scheme" },
      { name: "Color-NRF" },
      { name: "Size Market" },
      { name: "Size-NRF" },
      { name: "Dimension1 Position" },
      { name: "Dimension2 Position" },
      { name: "Dimension3 Position" },
      { name: "Price A" },
      { name: "Price B" },
      { name: "Price C" },
      { name: "Price D" },
    ];
  }

  getRecordValue(record: any, key: string): any {
    if (record?.hasOwnProperty(key)) {
      return record[key];
    } else if (record?.excelDto?.hasOwnProperty(key)) {
      return record.excelDto[key];
    }
    return '';
  }

  setRecordValue(record: any, key: string, value: any): void {
    if (record?.hasOwnProperty(key)) {
      record[key] = value;
    } else if (record?.excelDto?.hasOwnProperty(key)) {
      record.excelDto[key] = value;
    }
  }



  mapColumnNameToKey(columnName: string): string {
    const map = {
      "Code": "code",
      "Name": "name",
      "Record Type": "recordType",
      "Status": "status",
      "Record Status": "fieldsErrors",
      "Parent Code": "parentCode",
      "Product Description": "productDescription",
      "Product Classification": "productClassificationCode",
      "Product Classification Description": "productClassificationDescription",
      "Product Category Code": "productCategoryCode",
      "Product Category Description": "productCategoryDescription",
      "Price": "price",
      "Price Currency Code": "currency",
      "Image is Default": "imageIsDefault",
      "Image Folder Name": "imageFolderName",
      "Color Code": "colorCode",
      "Color Name": "colorName",
      "Size Code": "sizeCode",
      "Size Name": "sizeName",
      "Size Scale Name": "sizeScaleName",
      "Scale Sizes Order": "sizeScaleOrder",
      "Size Ratio Name": "sizeRatioName",
      "Size Ratio Value": "sizeRatioValue",
      "Material Content": "materialContent",
      "Sold Out Date": "soldOutDate",
      "Brand Code": "brancdCode",
      "Brand Name": "brandName",
      "Start Ship Date": "startShipDate",
      "Dimension 1 sizes": "d1Sizes",
      "Dimension 2 sizes": "d2Sizes",
      "Dimension 3 sizes": "d3Sizes",
      "Dimension 1 Name": "d1Name",
      "Dimension 2 Name": "d2Name",
      "Dimension 3 Name": "d3Name",
      "Dimension1 Position": "d1Pos",
      "Dimension2 Position": "d2Pos",
      "Dimension3 Position": "d3Pos",
      "Color-HEX": "colorHex",
      "Color-Image": "colorImage",
      "Color-Scheme": "colorSchema",
      "Color-NRF": "colorNRF",
      "Size Market": "sizeMarket",
      "Size-NRF": "sizeNRF",
      "Price A": "priceA",
      "Price B": "priceB",
      "Price C": "priceC",
      "Price D": "priceD"
    };

    return map[columnName] || columnName.toLowerCase().replace(/ /g, '');
  }


  toggleMenu(record: any, event: MouseEvent) {
    if (this.currentActionRecord && this.currentActionRecord !== record) {
      event.stopPropagation();
      return;
    }

    this.records.forEach(r => {
      if (r !== record) r.showActions = false;
    });

    record.showActions = !record.showActions;

    if (record.showActions) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();

      record.dropdownPosition = {
        top: document.querySelector('.browser-table')?.getBoundingClientRect().top ?? 0,
        left: rect.left
      };

      record.openUpward = true;
    }
  }





  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const clickedInside = (event.target as HTMLElement).closest('.dropdown');
    if (!clickedInside) {
      this.records?.forEach(record => record.showActions = false);
    }
  }

  handleAction(record: any, action: UploadActionEnum) {
    this.records.forEach(r => r.showActions = false); // Close dropdown
    this.currentActionRecord = record;
    record._inAction = true;
    record._original = { ...record };
    record.action = action;
  
    switch (action) {
      case UploadActionEnum.ValidateDataRecord:
        break;
  
      case UploadActionEnum.LinkToExistingParentItem:
        this.LinkToExistingITEM(record);
        break;
  
      case UploadActionEnum.LinkToExistingItemColor:
        break;
  
      case UploadActionEnum.LinkToExistingColorLookup:
        break;
  
      case UploadActionEnum.CreateNewParentItemAndLinkAsDefaultImage:
        break;
  
      case UploadActionEnum.CreateNewItemColorAndLinkImageAsDefaultImage:
        break;
  
      case UploadActionEnum.CreateNewColorLookupAndLinkImage:
        break;
  
      case UploadActionEnum.LinkToNewParentItemCodeFromAssociatedData:
        break;
  
      case UploadActionEnum.LinkToNewItemVariantCodeFromAssociatedData:
        break;
  
      case UploadActionEnum.LinkToNewColorLookupCodeFromAssociatedData:
        break;
  
      default:
        console.warn('Unknown action enum:', action);
    }
  }
  
  


  LinkToExistingITEM(record) {
    record._isLinkingParent = true;

    // Scroll after DOM updated
    setTimeout(() => {
      const container = this.codeInputContainers.find(
        (el: ElementRef) => el.nativeElement.getAttribute('data-record-id') == record.id
      );

      if (container) {
        container.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

        const inputEl: HTMLInputElement = container.nativeElement.querySelector('input');
        if (inputEl) {
          inputEl.focus();
          inputEl.select();
        }
      }
    }, 100);


  }

  getImageUrl(imageName: string): string {
    if (!imageName)
      return '';
    return `${this.attachmentBaseUrl}/${imageName}`;
  }


  getImageSource(record: any): string {
    if (record.recordType == 'Image') {
      let imageItem = record?.image;
      let item = this.imagesList.find(x => x.code.toLowerCase() == imageItem.toLowerCase());


      return item?.croppedbase64 === ''
        ? item?.tempBase64
        : item?.croppedbase64;
    }
  }

  getStatusClass(columnName: string, value: any): string {
    if (columnName?.trim() !== 'Status' || !value) return '';

    const status = value.toString().trim().toLowerCase();

    switch (status) {
      case 'warning':
        return '_bg-warning';
      case 'passed':
        return '_bg-success';
      case 'failed':
        return '_bg-danger';
      default:
        return '';
    }
  }

  @ViewChild('tableScrollContainer') tableScrollContainer!: ElementRef;

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const container = this.tableScrollContainer?.nativeElement;
    if (!container) return;

    const scrollAmount = 100;

    switch (event.key) {
      case 'ArrowDown':
        container.scrollTop += scrollAmount;
        event.preventDefault();
        break;
      case 'ArrowUp':
        container.scrollTop -= scrollAmount;
        event.preventDefault();
        break;
      case 'ArrowRight':
        container.scrollLeft += scrollAmount;
        event.preventDefault();
        break;
      case 'ArrowLeft':
        container.scrollLeft -= scrollAmount;
        event.preventDefault();
        break;
    }
  }

  getAspectatio() {
    let sycAttachmentCategoryImage;
    this.getSycAttachmentCategoriesByCodes(['LOGO', "BANNER", "IMAGE"]).subscribe((result) => {
      result.forEach(item => {
        if (item.code == "IMAGE") {
          sycAttachmentCategoryImage = item
          let [width, height, border] = sycAttachmentCategoryImage.aspectRatio.split(':')
          this.acceptedAspectRatio = Number(width) / Number(height);
          return;
        }
      });
    });
  }


  onCodeInputChange(record: any, value: string) {
    this.setRecordValue(record, 'code', value);
    const payload = {
      filter: value,
      recordId: record.id,
      tenantId: 0,
      appItemListId: 0,
      selectorOnly: false,
      filterType: ItemsFilterTypesEnum.MyItems,
      lastKey: "",
      selectorKey: "",
      priceListId: 0,
      arrtibuteFilters: [],
      classificationFilters: [],
      categoryFilters: [],
      scalesFilters: [],
      departmentFilters: [],
      entityObjectTypeId: 0,
      minimumPrice: 0,
      maximumPrice: 0,
      itemType: 0,
      listingStatus: 0,
      publishStatus: 0,
      visibilityStatus: 0,
      sorting: "",
      skipCount: 0,
      maxResultCount: 100
    };

    this.searchItemCode.emit(payload);
  }

  confirmLinking(record: any): void {
    const codeValue = this.getRecordValue(record, 'code');

    //I44 3 first cases  if (codeValue  && (record._isLinkingParent  || record._isLinking..... )) {
    if (codeValue  && (record._isLinkingParent )) {
      record.fieldsErrors = [];
      record.errorMessage = "";
      record.status = "Passed";
    }
    record._isLinkingParent = false;
    this.currentActionRecord = null;
    record._inAction = false;
    this.LinkToExistingITEM_Ret_Data = null;
    this.activeRecord = null;

    

    this.cdr.detectChanges();

  }


  cancelLinking(record: any): void {
    if (record._original) {
      Object.assign(record, record._original);
      delete record._original;
    }
    record._isLinkingParent = false;
    this.currentActionRecord = null;
    record._inAction = false;
    this.LinkToExistingITEM_Ret_Data = null;
    this.activeRecord = null;

    this.cdr.detectChanges();


  }

  isActionInProgress(): boolean {
    return this.records?.some(r => r._inAction);
  }


  selectSuggestion(record: any, selectedItem: any) {
    this.setRecordValue(record, 'code', selectedItem.displayName);
    setTimeout(() => {
      this.activeRecord = null;
    }, 0);
    this.selectSugItemCode.emit({ selectedItem, record });

  }
}  