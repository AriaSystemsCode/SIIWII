import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { ProductCatalogueReportParams } from '../models/product-Catalogue-Report-Params';
import { GetAccountForDropdownDto, LookupLabelDto, LookupLabelWithAttachmentDto } from '@shared/service-proxies/service-proxies';
import { AppEntitiesServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
  selector: 'app-catalogue-detail-info-step',
  templateUrl: './catalogue-detail-info-step.component.html',
  styleUrls: ['./catalogue-detail-info-step.component.scss']
})
export class CatalogueDetailInfoStepComponent extends AppComponentBase implements OnInit {
  @Input() printInfoParam: ProductCatalogueReportParams;
  @Output() continue: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Output() previous: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Output("searchAccount") searchAccountEvent: EventEmitter<string> = new EventEmitter<string>()
  @Input('accounts') accounts: GetAccountForDropdownDto[] = []
  specialPrices: SelectItem[] = [];
  backgrounds: SelectItem[] = [];
  backgroundsItems: LookupLabelWithAttachmentDto[];
  bKGround: string = '';
  bgImgSrc = "";
  lineSheetDetailPageSort: SelectItem[] = [];
  lineSheetDetailPageSortLookup: LookupLabelDto[] = [];
  lineSheetColorPageSort: SelectItem[] = [];
  lineSheetColorPageSortLookup: LookupLabelDto[] = [];
  attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
  localattachmentBaseUrl: string = "http://localhost" ;
  colorPageSort;
  detailPageSort;
  linesheetName;
  constructor(private _appEntitiesServiceProxy: AppEntitiesServiceProxy, private injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.specialPrices = this.getPriceLevel();
    this.getbackgrounds();
    this.setBgImageSrc();
    this.getLineSheetDetailPageSort();
    this.getLineSheetColorPageSort();
  }

  getbackgrounds() {
    this.backgrounds = [];
    this._appEntitiesServiceProxy.getAllBackgroundWithPaging(undefined, undefined, undefined, undefined, undefined, "BACKGROUND", undefined, undefined, undefined
      , undefined, undefined, undefined).subscribe((res) => {
        this.backgroundsItems = res.items;
        if (res.items.length > 0)
          this.backgrounds.push({ label: "No Background", value: "" });

        for (let i = 0; i < res.items.length; i++) {
          this.backgrounds.push({ label: res.items[i].label, value: res.items[i].code });
        }
      });
  }

  getLineSheetDetailPageSort() {
    this.lineSheetDetailPageSort = [];
    this._appEntitiesServiceProxy.getLineSheetDetailPageSort().subscribe((res) => {
      this.lineSheetDetailPageSort = res;
      this.lineSheetDetailPageSortLookup = res;
    });
  }

  getLineSheetColorPageSort() {
    this.lineSheetColorPageSort = [];
    this._appEntitiesServiceProxy.getLineSheetColorSort().subscribe((res) => {
      this.lineSheetColorPageSort = res;
      this.lineSheetColorPageSortLookup = res;
    });
  }

  onChangeColorPageSort($event) {
    let index = this.lineSheetColorPageSort.findIndex(x => x.value == $event.value);
    if (index >= 0)
   {  this.printInfoParam.ColorPageSort = this.lineSheetColorPageSort[index].label;
      this.printInfoParam.ColorPageSort = this.lineSheetColorPageSortLookup[index].code;
   }
    else
      this.printInfoParam.ColorPageSort = "";
  }
  onChangeDetailPageSort($event) {
    let index = this.lineSheetDetailPageSort.findIndex(x => x.value == $event.value);
    if (index >= 0)
      {
       //this.printInfoParam.DetailPageSort = this.lineSheetDetailPageSort[index].label;
       this.printInfoParam.DetailPageSort = this.lineSheetDetailPageSortLookup[index].code;
       this.printInfoParam.DetailPageGroupByName = this.lineSheetDetailPageSort[index].label;
       console.log("DetailPageGroupByName:"+this.printInfoParam.DetailPageGroupByName)
       this.printInfoParam.orderBy = this.lineSheetDetailPageSortLookup[index].code}
    else
      this.printInfoParam.DetailPageSort = "";
  }



  searchAccounts(str: string) {
    this.searchAccountEvent.emit(str)
  }


  continueToNextStep() {
    this.continue.emit(true);
  }

  previousStep() {
    this.previous.emit(true)
  }
  setBgImageSrc() {
    if (this.bgImgSrc == '')
      this.bgImgSrc = "../../../../../assets/placeholders/BGPreview.png";
  }

  onChangeShowCoverPage($event) {
    if (!$event.checked) {
      this.printInfoParam.BKGround = "";
      this.bKGround = "";
      this.bgImgSrc = '';
      this.setBgImageSrc();
    }
  }

  onChangeShowColors($event) {
    if (!$event.checked) {
      this.printInfoParam.ColorPageShowCategory = false;
      this.printInfoParam.ColorPageSort = '';
    }
  }

  onChangeSpecialPrice($event) {
    if (!$event.checked)
      this.printInfoParam.specialPriceLevel = '';
  }

  onChangeBackground($event) {
    let indx = this.backgroundsItems.findIndex(x => x.code == this.bKGround);
    if (indx >= 0) {
      this.bgImgSrc = this.attachmentBaseUrl + "/" + this.backgroundsItems[indx].attachmentName;
    }
    else {
      this.bgImgSrc = '';
      this.setBgImageSrc();
    }

    //this.printInfoParam.BKGround = this.attachmentBaseUrl + "/" + this.backgroundsItems[indx].attachmentName;
    this.printInfoParam.BKGround = this.localattachmentBaseUrl + "/" + this.backgroundsItems[indx].attachmentName;
    console.log(this.printInfoParam.BKGround) 
  }

  setLinesheetName($event){
    this.linesheetName=$event;
  }
}