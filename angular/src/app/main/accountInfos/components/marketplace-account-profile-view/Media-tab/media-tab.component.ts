import { Component, Injector, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@node_modules/@angular/platform-browser';
import { finalize } from 'rxjs';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountDto, AccountsServiceProxy, AppEntityAttachmentDto } from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';


@Component({
  selector: 'app-media-tab',
  templateUrl: './media-tab.component.html',
  styleUrls: ['./media-tab.component.scss'],

})
export class MediaTabComponent extends AppComponentBase implements OnInit {

  @Input('accountDataForView') accountDataForView: AccountDto;
  @Input('fromOverviewTab') fromOverviewTab: boolean = false

  attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
  mediaItems: AppEntityAttachmentDto[]
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalItems: number = 0;
  isModalOpen : boolean = false;
  selectedIndex :number = 0;
  lastImageIndex: number = 0;

  constructor(
    injector: Injector,
    private _AccountsServiceProxy: AccountsServiceProxy,
    private sanitizer: DomSanitizer,
  ) {
    super(injector);
  }
  ngOnInit(): void { }


  ngOnChanges(): void {


    this.getAllMedia()

    this.mediaItems = this.mediaItems?.map((item) => {
      if (item.attachmentCategoryId !== 3) {
        // Explicitly create a new AppEntityAttachmentDto object
        return {
          ...item, // Spread existing properties
          safeUrl: this.sanitizeUrl(item.url), // Add sanitized URL
          init: item.init,
          toJSON: item.toJSON
        } as AppEntityAttachmentDto;
      }
      return item;
    });

    this.lastImageIndex = Math.min(this.mediaItems?.length - 1, 8);
  }

  sanitizeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getAllMedia() {
    this.showMainSpinner();
  
    const skipCount = (this.currentPage - 1) * this.itemsPerPage;
  
    this._AccountsServiceProxy
      .getAllAccountMediaAttachment(this.accountDataForView?.ssin, undefined, skipCount, this.itemsPerPage)
      .pipe(finalize(() => this.hideMainSpinner()))
      .subscribe((res) => {
        this.mediaItems = res.items
        // ?.map((item) => {
        //   if (item.attachmentCategoryId == 8) {
        //     return {
        //       ...item,
        //       safeUrl: this.sanitizeUrl(item.url),
        //       init: item.init,
        //       toJSON: item.toJSON
        //     } as AppEntityAttachmentDto;
        //   }
        //   return item;
        // });
  
        this.totalItems = res.totalCount; // ✅ This should come from backend
      });
  }
  
  changePage(event: any): void {
    this.currentPage = (event.first / event.rows) + 1;
    this.itemsPerPage = event.rows;
    this.getAllMedia();
  }
  
  
  openModal(index: number): void {
    this.selectedIndex = index;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  prevMedia(): void {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
    }
  }

  nextMedia(): void {
    if (this.selectedIndex < this.mediaItems.length - 1) {
      this.selectedIndex++;
    }
  }



}