import { Component, Injector, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { finalize } from 'rxjs';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountDto, AccountsServiceProxy, AppEntityAttachmentDto } from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';

@Component({
  selector: 'app-media-tab',
  templateUrl: './media-tab.component.html',
  styleUrls: ['./media-tab.component.scss'],
})
export class MediaTabComponent extends AppComponentBase implements OnInit, OnChanges {

  @Input('accountDataForView') accountDataForView: AccountDto;
  @Input('fromOverviewTab') fromOverviewTab: boolean = false;
  @Input() isActive: boolean = false;

  attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
  mediaItems: AppEntityAttachmentDto[] = [];
  itemsPerPage: number = 12;
  currentPage: number = 1;
  totalItems: number = 0;
  isModalOpen: boolean = false;
  selectedIndex: number = 0;
  lastImageIndex: number = 0;
  isLoading: boolean = false;


  private mediaLoaded = false;

    currentLang:string
  isArabic:boolean 
  constructor(
    injector: Injector,
    private _AccountsServiceProxy: AccountsServiceProxy,
    private sanitizer: DomSanitizer,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
    this.currentLang == 'ar' || this.currentLang == 'ar-EG'  ? this.isArabic = true : this.isArabic = false
  }

  ngOnChanges(changes: SimpleChanges): void {

    if ((changes['accountDataForView'] || changes['isActive']) &&
        this.accountDataForView &&
        this.isActive &&
        !this.mediaLoaded) {
      this.loadMediaFirstPage();
    }
  }

  private loadMediaFirstPage(): void {
    this.currentPage = 1;
    this.getAllMedia();
    this.mediaLoaded = true;
  }

  sanitizeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getAllMedia() {
    this.isLoading = true;

    const skipCount = (this.currentPage - 1) * this.itemsPerPage;

    this._AccountsServiceProxy
      .getAllAccountMediaAttachment(this.accountDataForView?.ssin, undefined, skipCount, this.itemsPerPage)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((res) => {
        this.mediaItems = res.items;
        this.totalItems = res.totalCount;

        this.mediaItems = this.mediaItems.map((item) => {
          if (item.attachmentCategoryId !== 3) {
            return {
              ...item,
              safeUrl: this.sanitizeUrl(item.url),
              init: item.init,
              toJSON: item.toJSON,
            } as AppEntityAttachmentDto;
          }
          return item;
        });

        this.lastImageIndex = Math.min(this.mediaItems.length - 1, 8);
      });
  }

  changePage(event: any): void {
    this.currentPage = event.page + 1; 
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
