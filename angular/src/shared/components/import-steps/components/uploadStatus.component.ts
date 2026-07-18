// <!-- Iteration-8 -->
import { ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, HostListener, OnChanges, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from "@angular/core";
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
import { DomSanitizer, SafeHtml } from "@node_modules/@angular/platform-browser";

@Component({
  selector: "uploadStatusModal",
  templateUrl: "./uploadStatus.component.html",
  styleUrls: ["./uploadStatus.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  visibleColumns;

  @Input() imagesList;
  acceptedAspectRatio;
  currentActionRecord: any = null;

  @ViewChildren('parentCodeInputContainer') ParentCodeInputContainers!: QueryList<ElementRef>;
  @ViewChildren('codeInputContainer') codeInputContainers!: QueryList<ElementRef>;
  @ViewChildren('colorCodeInputContainer') colorCodeInputContainers!: QueryList<ElementRef>;

  @ViewChildren('rowRef') rowRefs!: QueryList<ElementRef>;
  @Output() searchItemCode = new EventEmitter<any>();
  LinkToExistingITEM_Ret_Data;
  LinkToExistingItemColor_Ret_Data;
  LinkToExistingColorLookup_Ret_Data;
  activeRecord: any = null;
  @ViewChild('codeInputRef') codeInputRef!: ElementRef<HTMLInputElement>;
  @Output() selectSugItemCode = new EventEmitter<any>();
  @Input() updatedRecordData: any;
  @Input() _resetRecords: boolean = false;


  @Input() imData: boolean;
  @Input() imImages: boolean;
  hasDataRecords: boolean = false;
  hasImageRecords: boolean = false;
  UploadActionEnum = UploadActionEnum;
  @Output() updatedRecords = new EventEmitter<any[]>();
  @Output() _validateRecord = new EventEmitter<any[]>();
  @Output() loadMoreRecords = new EventEmitter<{ skipCount: number; maxResultCount: number; recordType: string }>();
  isConfirm: boolean = false;
  linkNewParentItem_Data;
  linkNewItemColor_Data;
  linkNewColorLookup_Data;
  @Output() _resetRecordsCompleted = new EventEmitter<void>();
  pageSize: number = 25;
  loadingMoreRecords: boolean = false;
  private recordTotals: { [recordType: string]: number } = {};


  public constructor(
    private _importService: MainImportService,
    injector: Injector,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {
    super(injector);
  }

  ngOnInit() {
    this.getuploadStatsColumnsName();
    this.refreshVisibleColumns();
    this.getAspectatio();
  }



  ngOnChanges(changes: SimpleChanges) {


    if (changes['uploadingResult'] && this.uploadingResult) {
      const pageSkipCount = this.uploadingResult?.pageSkipCount || 0;
      this.uploadingResult.excelRecords = this.uploadingResult?.excelRecords.map((r, idx) => ({
        ...r,
        id: r.recordIndex ?? pageSkipCount + idx,
        __originalIndex: r.recordIndex ?? pageSkipCount + idx
      }));

      const allRecords = this.uploadingResult?.excelRecords || [];
      // A paged result may contain only data rows on its first page. Keep the
      // tabs selected by the user visible until the corresponding rows load.
      this.hasDataRecords = !!this.imData || allRecords.some(r => r.recordType !== 'Image');
      this.hasImageRecords = !!this.imImages || allRecords.some(r => r.recordType === 'Image');

      if (this.hasDataRecords)
        this.activeRecordType = 'Data'
      else
        this.activeRecordType = 'Image'

      this.refreshVisibleColumns();

      if (!this.records || this.records?.length == 0) {
        this.records = this.filteredRecords()?.map((r, idx) => ({
          ...r,
          id: r.id ?? idx,
          __originalIndex: r.id ?? idx
        })) || [];
      }
      else {
        this.records?.forEach((rec, idx) => {
          const updated = this.filteredRecords()?.[idx];
          if (updated) {
            Object.assign(rec, updated);
          }
        });
      }
      this.records?.forEach(r => r.showActions = false);
      this.uploadingResult?.excelRecords?.forEach(r => r.showActions = false);
    }

    if (changes['_resetRecords'] && this._resetRecords) {
      this.records.forEach((r, index) => {
        this.resetRecords(r, index);
      });

      this._resetRecordsCompleted.emit();
    }

    if (changes['updatedRecordData'] && this.updatedRecordData) {
      const { record, newData } = this.updatedRecordData;

      const updatedRec = this.mergeRecord(record, newData);
      let indx = this.records.findIndex(r => r.id == record.id);
      this.records[indx] = updatedRec;
      this.currentActionRecord = updatedRec;

      if (this.isConfirm)
        this.resumeConfirm(updatedRec)
    }


  }

  mergeRecord(record: any, newData: any) {
    const merged = JSON.parse(JSON.stringify(record)); // clone record

    const deepMergeValues = (target: any, source: any) => {
      for (const key in source) {
        if (
          source[key] !== null &&
          typeof source[key] === 'object' &&
          !Array.isArray(source[key])
        ) {
          if (!target[key] || typeof target[key] !== 'object') {
            target[key] = {};
          }
          deepMergeValues(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    };

    deepMergeValues(merged, newData);
    return merged;
  }



  show(importType: ImportTypes) {
    this.importType = importType;
    this.modal.show();
    this.cdr.markForCheck();
  }

  hide() {
    this.modal.hide();
  }

  GoNextstep() {
    debugger
    var _text = "";
    _text = "All " + ImportTypes[this.importType] + " Failed , can not import.";

    const isImagesOnlyImport = this.imImages && !this.imData;

    if (!this.uploadingResult?.isPagedResult || isImagesOnlyImport) {
      this.uploadingResult.totalPassedRecords =
        (this.uploadingResult?.excelRecords?.filter(r => r.status.toLowerCase() == 'passed')?.length || 0) +
        (this.uploadingResult?.excelRecords?.filter(r => r.status.toLowerCase() == 'warning')?.length || 0);

      this.uploadingResult.totalFailedRecords = isImagesOnlyImport
        ? Math.max(
            0,
            (this.uploadingResult?.totalDisplayRecords || this.uploadingResult?.excelRecords?.length || 0) -
              this.uploadingResult.totalPassedRecords
          )
        : this.uploadingResult?.excelRecords?.filter(r => r.status.toLowerCase() == 'failed')?.length;
    }

    if (this.uploadingResult.totalPassedRecords == 0) {
      Swal.fire({
        title: "",
        text: _text,
        icon: "warning",
        showCancelButton: false,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ok",
      }).then((result) => {
      });
    } else {
      this.goNextstep.emit();

      this.records.forEach(updatedRec => {
        const originalRec = this.uploadingResult?.excelRecords.find(r => r.id === updatedRec.id);
        if (originalRec) {
          Object.assign(originalRec, updatedRec);
        }
      });

      this.updatedRecords.emit(this.uploadingResult);

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

  resetRecords(record: any, originalIndex: number) {
    const resetFlags = (rec: any) => {
      rec._isDataRecord = false;
      rec._isLinkingParent = false;
      rec._isLinkingItemColor = false;
      rec._isLinkingColorLookup = false;
      rec._isCreateParent = false;
      rec._isCreateItemColor = false;
      rec._isCreateColorLookup = false;
      rec._isLinkNewParent = false;
      rec._isLinkNewItemColor = false;
      rec._isLinkNewColorLookup = false;
      rec._inAction = false;
    };

    // reset for current record
    resetFlags(record);

    // reset for the one inside excelRecords
    if (Array.isArray(this.uploadingResult?.excelRecords)) {
      const originalRecord = this.uploadingResult.excelRecords.find(r => r.id === record.id);
      if (originalRecord)
        resetFlags(originalRecord);
    }

    this.currentActionRecord = null;
    this.LinkToExistingITEM_Ret_Data = null;
    this.LinkToExistingItemColor_Ret_Data = null;
    this.LinkToExistingColorLookup_Ret_Data = null;
    this.linkNewParentItem_Data = null;
    this.linkNewItemColor_Data = null;
    this.linkNewColorLookup_Data = null;
    this.activeRecord = null;
    this.isConfirm = false;

    delete record._original;
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

  appendRecords(newRecords: any[], totalCount?: number, recordType?: string) {
    if (recordType && totalCount !== undefined)
      this.recordTotals[recordType] = totalCount;

    const startIndex = this.uploadingResult?.excelRecords?.length || 0;
    const normalizedRecords = (newRecords || []).map((r, idx) => ({
      ...r,
      id: r.recordIndex ?? startIndex + idx,
      __originalIndex: r.recordIndex ?? startIndex + idx,
      showActions: false
    }));

    const existingIds = new Set((this.uploadingResult?.excelRecords || []).map(r => r.id));
    const recordsToAppend = normalizedRecords.filter(r => !existingIds.has(r.id));

    this.uploadingResult.excelRecords = [
      ...(this.uploadingResult?.excelRecords || []),
      ...recordsToAppend
    ];

    const visibleRecords = this.activeRecordType == 'Data'
      ? recordsToAppend.filter(r => r?.recordType !== 'Image')
      : recordsToAppend.filter(r => r?.recordType === 'Image');

    this.records = [
      ...(this.records || []),
      ...visibleRecords
    ];

    this.hasDataRecords = !!this.imData || this.uploadingResult.excelRecords.some(r => r.recordType !== 'Image');
    this.hasImageRecords = !!this.imImages || this.uploadingResult.excelRecords.some(r => r.recordType === 'Image');
    this.loadingMoreRecords = false;
    this.cdr.detectChanges();

    // Image rows can be after several pages of data rows. When the Images tab
    // is selected, continue paging until an image row is found or all rows are loaded.
    this.loadNextPageForEmptyActiveTab();
  }

  switchTab(type: string) {
    if (this.isActionInProgress()) {
      return;
    }

    this.activeRecordType = type;
    this.refreshVisibleColumns();

    this.records = this.filteredRecords()?.map((r, idx) => ({
      ...r,
      id: r.id ?? idx
    })) || [];

    this.records?.forEach(r => r.showActions = false);
    this.loadNextPageForEmptyActiveTab();
  }

  private loadNextPageForEmptyActiveTab(): void {
    if (!this.uploadingResult?.isPagedResult || this.loadingMoreRecords || this.records?.length)
      return;

    const loadedCount = this.getLoadedRecordCount(this.activeRecordType);
    const totalCount = this.recordTotals[this.activeRecordType]
      ?? this.uploadingResult?.totalDisplayRecords
      ?? this.uploadingResult?.totalRecords
      ?? 0;

    if (loadedCount < totalCount) {
      this.loadingMoreRecords = true;
      this.loadMoreRecords.emit({
        skipCount: loadedCount,
        maxResultCount: this.pageSize,
        recordType: this.activeRecordType
      });
    }
  }

  private getLoadedRecordCount(recordType: string): number {
    const records = this.uploadingResult?.excelRecords || [];
    return recordType === 'Image'
      ? records.filter(r => r?.recordType === 'Image').length
      : records.filter(r => r?.recordType !== 'Image').length;
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
      { name: "No. Of dimensions" },
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
    ].map(column => ({
      ...column,
      key: this.mapColumnNameToKey(column.name)
    }));
  }

  refreshVisibleColumns() {
    this.visibleColumns = (this.uploadStatsColumnsName || [])
      .filter(column => !column.showFor || column.showFor === this.activeRecordType);
  }

  trackByRecordId(index: number, record: any) {
    return record?.id ?? record?.__originalIndex ?? index;
  }

  trackByColumnName(index: number, column: any) {
    return column?.name ?? index;
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
      "No. Of dimensions": "noOfDim",
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
      record.dropdownPosition = {
        top: event.clientY,
        left: event.clientX
      };
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
    const originalIndex = record.__originalIndex;

    this.resetRecords(record, originalIndex);

    this.records.forEach(r => r.showActions = false);
    this.currentActionRecord = record;


    if (record?.excelDto?.actions)
      record._previousAction = record?.excelDto?.actions;

    record.excelDto.actions = action;
    const loadedRecord = this.uploadingResult?.excelRecords?.find(r => r.id === record.id);
    if (loadedRecord)
      loadedRecord._inAction = true;
    record._inAction = true;
    record._original = JSON.parse(JSON.stringify(record));


    switch (action) {
      case this.UploadActionEnum.ValidateDataRecord:
        this.ValidateDataRecord(record);
        break;

      case this.UploadActionEnum.LinkToExistingParentItem:
        this.LinkToExistingITEM(record);
        break;

      case this.UploadActionEnum.LinkToExistingItemColor:
        this.LinkToExistingITEMCOLOR(record);
        break;

      case this.UploadActionEnum.LinkToExistingColorLookup:
        this.LinkToExistingCOLORLOOKUP(record);
        break;

      case this.UploadActionEnum.CreateNewParentItemAndLinkAsDefaultImage:
        this.CreateNewParentItemAndLinkAsDefaultImage(record);
        break;

      case this.UploadActionEnum.CreateNewItemColorAndLinkImageAsDefaultImage:
        this.CreateNewItemColorAndLinkImageAsDefaultImage(record);
        break;

      case this.UploadActionEnum.CreateNewColorLookupAndLinkImage:
        this.CreateNewColorLookupAndLinkImage(record);
        break;

      case this.UploadActionEnum.LinkToNewParentItemCodeFromAssociatedData:
        this.LinkToNewParentItemCodeFromAssociatedData(record);
        break;

      case this.UploadActionEnum.LinkToNewItemVariantCodeFromAssociatedData:
        this.LinkToNewItemVariantCodeFromAssociatedData(record);
        break;

      case this.UploadActionEnum.LinkToNewColorLookupCodeFromAssociatedData:
        this.LinkToNewColorLookupCodeFromAssociatedData(record);
        break;

      default:
        console.warn('Unknown action enum:', action);
    }
  }



  ValidateDataRecord(record) {
    record._isDataRecord = true;
  }

  ValidateRecord(record) {
    this._validateRecord.emit(record);
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

  LinkToExistingITEMCOLOR(record) {
    record._isLinkingItemColor = true;

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

  LinkToExistingCOLORLOOKUP(record) {
    record._isLinkingColorLookup = true;

    // Scroll after DOM updated
    setTimeout(() => {
      const container = this.colorCodeInputContainers.find(
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






  CreateNewParentItemAndLinkAsDefaultImage(record) {
    record._isCreateParent = true;
    this.setRecordValue(record, this.mapColumnNameToKey('No. Of dimensions'), '1');


    /*  this.editableColumnsForCreateNewParent.forEach(colName => {
       this.setRecordValue(record, this.mapColumnNameToKey(colName), '');
     });
  */
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


  CreateNewItemColorAndLinkImageAsDefaultImage(record) {
    record._isCreateItemColor = true;
    this.setRecordValue(record, this.mapColumnNameToKey('No. Of dimensions'), '1');

    /*    this.editableColumnsForCreateNewItemColor.forEach(colName => {
         this.setRecordValue(record, this.mapColumnNameToKey(colName), '');
       }); */

    // Scroll after DOM updated
    setTimeout(() => {
      const container = this.ParentCodeInputContainers.find((el: ElementRef) =>
        el.nativeElement.getAttribute('data-record-id') == record.id
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


  CreateNewColorLookupAndLinkImage(record) {
    record._isCreateColorLookup = true;


    /* this.editableColumnsForCreateNewColorLookup.forEach(colName => {
      this.setRecordValue(record, this.mapColumnNameToKey(colName), '');
    }); */

    // Scroll after DOM updated
    setTimeout(() => {
      const container = this.colorCodeInputContainers.find(
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


  LinkToNewParentItemCodeFromAssociatedData(record) {
    record._isLinkNewParent = true;
    this.setRecordValue(record, this.mapColumnNameToKey('Code'), '');


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


  LinkToNewItemVariantCodeFromAssociatedData(record) {
    record._isLinkNewItemColor = true;
    this.setRecordValue(record, this.mapColumnNameToKey('Code'), '');


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

  LinkToNewColorLookupCodeFromAssociatedData(record) {
    record._isLinkNewColorLookup = true;
    this.setRecordValue(record, this.mapColumnNameToKey('colorCode'), '');

    setTimeout(() => {
      const container = this.colorCodeInputContainers.find(
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


      let ret = item?.croppedbase64 === ''
        ? item?.tempBase64
        : item?.croppedbase64;

      return !ret ? '' : ret;
    }

    else
      return "-";
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

  onRecordsScroll(event: Event) {
    if (!this.uploadingResult?.isPagedResult || this.loadingMoreRecords)
      return;

    const target = event.target as HTMLElement;
    const loadedCount = this.getLoadedRecordCount(this.activeRecordType);
    const totalCount = this.recordTotals[this.activeRecordType]
      ?? this.uploadingResult?.totalDisplayRecords
      ?? this.uploadingResult?.totalRecords
      ?? 0;
    const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 200;

    if (nearBottom && loadedCount < totalCount) {
      this.loadingMoreRecords = true;
      this.loadMoreRecords.emit({
        skipCount: loadedCount,
        maxResultCount: this.pageSize,
        recordType: this.activeRecordType
      });
    }
  }

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

    record._selectionMade = false;
    if (record._isLinkingParent || record._isLinkingItemColor)
      this.setRecordValue(record, 'code', value);

    else if (record._isLinkingColorLookup)
      this.setRecordValue(record, 'colorCode', value);


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
      maxResultCount: 100,
      isCodeItem: record._isLinkingParent,
      isCodeColorItem: record._isLinkingItemColor,
      isCodeColorLookup: record._isLinkingColorLookup
    };

    this.searchItemCode.emit(payload);
  }



  onAssCodeInputChange(record: any, value: string) {
    record._selectionMade = false;

    if (record._isLinkNewParent || record._isLinkNewItemColor) {
      this.setRecordValue(record, 'code', value);
    } else if (record._isLinkNewColorLookup) {
      this.setRecordValue(record, 'colorCode', value);
    }

    const result = this.getAssCodeSuggestions(value, record);

    if (record._isLinkNewParent) {
      this.linkNewParentItem_Data = result;
    } else if (record._isLinkNewItemColor) {
      this.linkNewItemColor_Data = result;
    } else if (record._isLinkNewColorLookup) {
      this.linkNewColorLookup_Data = result;
    }
  }

  private getAssCodeSuggestions(value: string, record: any): any[] {

    if (record._isLinkNewParent) {
      return this.uploadingResult.excelRecords
        .filter(r =>
          r.id !== record.id &&
          r.recordType === "Item" &&
          r.code &&
          r.code.toLowerCase().includes(value.toLowerCase())
        )
        .map(r => ({
          id: r.id,
          displayName: r.code
        }));

    }

    else if (record._isLinkNewItemColor) {
      const uniqueRecords = Object.values(
        this.uploadingResult.excelRecords
          .filter(r =>
            r.id !== record.id &&
            r.recordType === "Item Variant" &&
            r.code &&
            r.code.toLowerCase().includes(value.toLowerCase())
          )
          .reduce((acc, r) => {
            const baseName = r.code.replace(/-([^-]+)$/, "").trim();

            if (!acc[baseName]) {
              acc[baseName] = {
                id: r.id,
                ids: "",
                displayName: baseName
              };
            }

            acc[baseName].ids = acc[baseName].ids
              ? acc[baseName].ids + "," + r.id
              : String(r.id);

            return acc;
          }, {} as Record<string, { id: number; ids: string; displayName: string }>)
      );

      return uniqueRecords;

    }

    //I44-BE not return color records 
    else if (record._isLinkNewColorLookup) {
      return this.uploadingResult.excelRecords
        .filter(r =>
          r.id !== record.id &&
          r.recordType === "Color" &&
          r.excelDto.colorCode &&
          r.excelDto.colorCode.toLowerCase().includes(value.toLowerCase())
        )
        .map(r => ({
          id: r.id,
          displayName: r.excelDto.colorCode,
          colorName: r.excelDto.colorName
        }));
    }
    return [];

  }

  confirmLinking(record: any): void {
    let codeValue = "";
    let ColorCodeValue = "";
    let ColorCodeNameValue = "";


    codeValue = this.getRecordValue(record, 'code');
    ColorCodeValue = this.getRecordValue(record, 'colorCode');
    ColorCodeNameValue = this.getRecordValue(record, 'colorName');



    if (((record._isLinkingParent || record._isLinkingItemColor) && codeValue) || (record._isLinkingColorLookup && ColorCodeValue)
      || ((record._isCreateColorLookup) && ColorCodeValue && ColorCodeNameValue)
      || (this.isCreateNewCases(record) && record._selectionMade)
    ) {
      record.fieldsErrors = [];
      record.errorMessage = "";
      record.status = "Passed";

      this.resumeConfirm(record);
    }


    if (record._isDataRecord || record._isCreateParent || record._isCreateItemColor || this.isCreateNewCases(record)) {
      this.isConfirm = true;
      this.ValidateRecord(record);
    }
  }

  resumeConfirm(record) {
    const originalIndex = record.__originalIndex;
    if (Array.isArray(this.uploadingResult?.excelRecords)) {
      const loadedIndex = this.uploadingResult.excelRecords.findIndex(r => r.id === record.id);
      if (loadedIndex >= 0) {
        this.uploadingResult.excelRecords[loadedIndex] = {
        ...this.uploadingResult?.excelRecords[loadedIndex],
        ...record
      };
      }
    }
    this.resetRecords(record, originalIndex);
    this.cdr.detectChanges();
  }


  cancelLinking(record: any): void {
    const originalIndex = record.__originalIndex;

    if (record._original) {
      Object.assign(record, record._original);
      delete record._original;
    }

    if (record._previousAction)
      record.excelDto.actions = record._previousAction;
    else
      record.excelDto.actions = null;


    this.resetRecords(record, originalIndex);
    this.cdr.detectChanges();


  }

  isActionInProgress(): boolean {
    return this.records?.some(r => r._inAction);
  }



  selectSuggestion(record: any, selectedItem: any) {
    if (record._isLinkingParent || record._isLinkingItemColor || record._isLinkNewParent || record._isLinkNewItemColor) {
      this.setRecordValue(record, 'code', selectedItem.displayName);

      if (record._isLinkNewItemColor)
        record.excelDto.code = selectedItem.ids;
      else
        record.excelDto.code = selectedItem.id

    }

    else if (record._isLinkingColorLookup || record._isLinkNewColorLookup) {
      this.setRecordValue(record, 'colorCode', selectedItem.displayName);
      record.excelDto.code = selectedItem.id

      if (record._isLinkNewColorLookup) {
        this.setRecordValue(record, 'colorName', selectedItem.colorName);
        record.colorName = selectedItem?.colorName;
      }
    }

    setTimeout(() => {
      record._selectionMade = true;
      this.activeRecord = null;
    }, 0);

    if (!this.isCreateNewCases(record))
      this.selectSugItemCode.emit({ selectedItem, record });

  }

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html || '');
  }


  editableColumnsForCreateNewParent = [
    'Code',
    'Name',
    'Product Description',
    'Product Classification',
    'Product Classification Description',
    'Product Category Code',
    'Product Category Description',
    'Price',
    'Price Currency Code',
    'Material Content',
    'Sold Out Date',
    'Brand Code',
    'Brand Name',
    'Start Ship Date',
    'Price A',
    'Price B',
    'Price C',
    'Price D',
    'Color Code',
    'Color Name',
    'SIZE Code', 'SIZE Name', 'Size Scale Name', 'Scale Sizes Order',
    'Size Ratio Value',
    'Start Ship Date',
    'Dimension 1 sizes',
    'Dimension 1 Name',
    'Dimension 2 sizes',
    'Dimension 2 Name',
    'Dimension 3 sizes',
    'Dimension 3 Name',
    'No of Dimensions'
  ];

  editableColumnsForCreateNewItemColor = [
    'Parent Code',
    'Code',
    'Name',
    'Product Description',
    'Product Classification',
    'Product Classification Description',
    'Product Category Code',
    'Product Category Description',
    'Price',
    'Price Currency Code',
    'Color Code',
    'Color Name',
    'Size Scale Name',
    'Scale Sizes Order',
    'Size Ratio Name',
    'Price A',
    'Price B',
    'Price C',
    'Price D',
    'SIZE Code',
    'SIZE Name',
    'Dimension1Position',
    'Dimension2Position',
    'Dimension3Position',
    'Dimension4Position',

  ];


  editableColumnsForCreateNewColorLookup = [
    'Color Code',
    'Color Name'
  ];


  exampleTextsForCreateNewParent: { [key: string]: string } = {
    'Code': 'Example: SAM001',
    'Price Currency Code': 'Example: USD , GBP',
    'Color Code': 'Example: BLK|BLU|',
    'Color Name': 'Example: Black|Blue|',
    'Size Scale Name'  :'Example: S-XL',
    'Scale Sizes Order'  :'Example: S|M|L|XL',
    'Size Ratio Name': 'Example: 1-2-2-1',
    'Size Ratio Value':'Example: S~M~L~XL|1-2-2-1'
  };

  exampleTextsForCreateNewItemColor: { [key: string]: string } = {
    'Parent Code': 'Example: SAM001', 
    'Code': 'Example: SAM001 - BLK',
    'Price Currency Code': 'Example: USD , GBP',
    'Color Code': 'Example: BLK|BLU|',
    'Color Name': 'Example: Black|Blue|',
    'Size Scale Name': 'Example: S-XL',
    'Scale Sizes Order': 'Example: S|M|L|XL',
    'Size Ratio Name': 'Example: 1-2-2-1',
  };

  exampleTextsForCreateNewColorLookup: { [key: string]: string } = {
    'Color Code': 'Example: BLK|BLU|',
    'Color Name': 'Example: Black|Blue|',
  };

  exampleTextsForLinkToNewParentFromAssociatedData: { [key: string]: string } = {
    'Code': 'Valid parent item code from associated data'
  };


  exampleTextsForLinkToNewItemVariantCodeFromAssociatedData: { [key: string]: string } = {
    'Code': 'Valid item-color code from associated data'
  };

  exampleTextsForLinkToNewColorLookupCodeFromAssociatedData: { [key: string]: string } = {
    'Color Code': 'Valid color lookup code from associated data'
  };

  requiredColumnsForCreateNewParent: string[] = [
    'Code',
    'Name',
    'Product Description',
    'Price',
    'Price Currency Code',
    'Color Code',
    'Color Name',
    'Size Scale Name',
    'Scale Sizes Order',
    'Size Ratio Value',
    'Dimension 1 sizes',
    'Dimension 1 Name'
  ];


  requiredColumnsForCreateNewItemColor: string[] = [
    'Parent Code',
    'Code',
    'Name',
    'Product Description',
    'Price',
    'Price Currency Code',
    'Color Code',
    'Color Name',
    'Size Scale Name',
    'Scale Sizes Order',
    'Color Code',
    'Color Name'
  ];

  requiredColumnsForCreateNewColorLookup: string[] = [
    'Color Code',
    'Color Name',
  ];



  isCreateNewCase(record: any, columnName: string): boolean {
    if (!record.excelDto.actions) return false;

    const editableColumnsMap = {
      [this.UploadActionEnum.CreateNewParentItemAndLinkAsDefaultImage]: this.editableColumnsForCreateNewParent,
      [this.UploadActionEnum.CreateNewItemColorAndLinkImageAsDefaultImage]: this.editableColumnsForCreateNewItemColor,
      [this.UploadActionEnum.CreateNewColorLookupAndLinkImage]: this.editableColumnsForCreateNewColorLookup
    };

    const editableColumns = editableColumnsMap[record.excelDto.actions] || [];
    return editableColumns.includes(columnName);
  }


  getExampleTextForCases(record: any, columnName: string): string {
    const exampleTextsMap = {
      [this.UploadActionEnum.CreateNewParentItemAndLinkAsDefaultImage]: this.exampleTextsForCreateNewParent,
      [this.UploadActionEnum.CreateNewItemColorAndLinkImageAsDefaultImage]: this.exampleTextsForCreateNewItemColor,
      [this.UploadActionEnum.CreateNewColorLookupAndLinkImage]: this.exampleTextsForCreateNewColorLookup,
      [this.UploadActionEnum.LinkToNewParentItemCodeFromAssociatedData]: this.exampleTextsForLinkToNewParentFromAssociatedData,
      [this.UploadActionEnum.LinkToNewItemVariantCodeFromAssociatedData]: this.exampleTextsForLinkToNewItemVariantCodeFromAssociatedData,
      [this.UploadActionEnum.LinkToNewColorLookupCodeFromAssociatedData]: this.exampleTextsForLinkToNewColorLookupCodeFromAssociatedData

    };

    return exampleTextsMap[record.excelDto.actions]?.[columnName] || '';
  }



  isRequiredColumnForCreateNewCase(record: any, columnName: string): boolean {
    const requiredColumnsMap = {
      [this.UploadActionEnum.CreateNewParentItemAndLinkAsDefaultImage]: this.requiredColumnsForCreateNewParent,
      [this.UploadActionEnum.CreateNewItemColorAndLinkImageAsDefaultImage]: this.requiredColumnsForCreateNewItemColor,
      [this.UploadActionEnum.CreateNewColorLookupAndLinkImage]: this.requiredColumnsForCreateNewColorLookup
    };
    return requiredColumnsMap[record.excelDto.actions]?.includes(columnName) || false;
  }

  onCodeSelected(record: any, selectedCode: string) {
    record._selectionMade = true;
    this.setRecordValue(record, 'code', selectedCode);
  }
  isCodeValid(record: any): boolean {
    if (record._isLinkingParent || record._isLinkingItemColor || record._isLinkNewParent || record._isLinkNewItemColor)
      return !!record._selectionMade && !!this.getRecordValue(record, 'code');

    else if (record._isLinkingColorLookup || record._isLinkNewColorLookup)
      return !!record._selectionMade && !!this.getRecordValue(record, 'colorCode')
  }
  isRestrictedCase(record: any): boolean {
    return record._isLinkingParent || record._isLinkingItemColor || record._isLinkingColorLookup || record._isLinkNewParent || record._isLinkNewItemColor || record._isLinkNewColorLookup;
  }

  isCreateCase(record: any): boolean {
    return record._isCreateItemColor || record._isCreateColorLookup || record._isCreateParent;
  }


  isCreateNewCases(record: any): boolean {
    return record._isLinkNewParent || record._isLinkNewItemColor || record._isLinkNewColorLookup;
  }
  hasAllRequiredFields(record: any): boolean {
    const requiredColumnsMap = {
      [this.UploadActionEnum.CreateNewParentItemAndLinkAsDefaultImage]: this.requiredColumnsForCreateNewParent,
      [this.UploadActionEnum.CreateNewItemColorAndLinkImageAsDefaultImage]: this.requiredColumnsForCreateNewItemColor,
      [this.UploadActionEnum.CreateNewColorLookupAndLinkImage]: this.requiredColumnsForCreateNewColorLookup
    };

    const requiredColumns = requiredColumnsMap[record.excelDto.actions] || [];

    return requiredColumns.every(colName => !!this.getRecordValue(record, this.mapColumnNameToKey(colName)));
  }


  canConfirm(record: any): boolean {
    if (this.isRestrictedCase(record)) {
      return this.isCodeValid(record);
    }
    if (this.isCreateCase(record)) {
      return this.hasAllRequiredFields(record);
    }
    if (this.isCreateNewCases(record))
      return record._selectionMade;
    return true;
  }

  private isNumberLike(val: any): boolean {
    if (val === null || val === undefined) return false;
    const s = String(val).trim();
    if (!s) return false;
    return /^-?\d+(\.\d+)?$/.test(s);
  }

  isPriceValid(record: any): boolean {
    const price = this.getRecordValue(record, 'price');
    return this.isNumberLike(price);
  }

  isPriceFieldInvalid(record: any, columnName: string): boolean {
    if (columnName !== 'Price') return false;
    const val = this.getRecordValue(record, 'price');
    return !this.isNumberLike(val);
  }

}  
