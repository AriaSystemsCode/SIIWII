import { Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountDto, AccountsServiceProxy, AppEntityAttachmentDto, AppMarketplaceItemsServiceProxy, CreateMessageInput, MessageServiceProxy, OverAllRatingDto } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-overview-tab',
  templateUrl: './overview-tab.component.html',
  styleUrls: ['./overview-tab.component.scss'],
})
export class OverviewTabComponent extends AppComponentBase implements OnInit, OnDestroy {
  @Input('accountDataForView') accountDataForView: AccountDto;
  @Input('marketPlaceData') marketPlaceData: AccountDto;
  @Output("activeTabIndexBtn") activeTabIndexBtn: EventEmitter<number> = new EventEmitter<number>()
  @ViewChild('reviewsSection') reviewsSection!: ElementRef;

  baseUrl: string = AppConsts.attachmentBaseUrl;
  overRating: OverAllRatingDto
  mediaItems: AppEntityAttachmentDto[]

  messages: CreateMessageInput = new CreateMessageInput();
  @Input() loginAccoutType: string = "";
  isModalOpen: boolean = false;
  selectedIndex: number = 0;
  totalImgs: number = 0
  accountReviewMsg = this.l("Your review for this account has already been recorded.") 
  isLoading: boolean = false
  items: any[]
    currentLang:string
  isArabic:boolean 
  constructor(injector: Injector, private messageServiceProxy: MessageServiceProxy, private _AccountsServiceProxy: AccountsServiceProxy, private _AppMarketplaceItemsServiceProxy: AppMarketplaceItemsServiceProxy,
    private _router: Router,

  ) {
    super(injector);

  }

  ngOnInit() {
    this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
    this.currentLang == 'ar' || this.currentLang == 'ar-EG'  ? this.isArabic = true : this.isArabic = false
    this.getOverAllRatings()
    this.getAllMedia()

    this.getAllProducts()
  }


  getAllMedia() {
    this.isLoading = true
    this._AccountsServiceProxy.getAllAccountMediaAttachment(this.accountDataForView?.ssin, undefined, 0, 6).pipe(
      finalize(
        () =>
          this.isLoading = false
      )
    ).subscribe((res) => {

      this.mediaItems = res?.items
      this.totalImgs = res?.totalCount

    })
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


  goReviews() {
    this.reviewsSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  getOverAllRatings() {
    const subs = this.messageServiceProxy
      .getOverAllRatings(
        this.accountDataForView.entityId,
      )
      .pipe(
        finalize(() => { })
      )
      .subscribe(
        (result) => {
          this.overRating = result
        },);
    this.subscriptions.push(subs);
  }


  handleRefreshRating(event: boolean) {
    if (event) {
      this.getOverAllRatings()
    }
  }

  goSvR(event: MouseEvent) {
    
    sessionStorage.setItem('SellerSSIN', JSON.stringify(this.accountDataForView?.ssin));
       this._router.navigate(['/app/main/marketplace/products'], {
      state: {
        fromMarketAcoount: true,
        accountDataForView: this.accountDataForView,
        marketplaceAccCurrency: this.accountDataForView?.currencyName
      }
    });
  }
  
  getAllProducts() {

    const selectedCurrency = (this.accountDataForView.currencyName || 'USD')

    this._AppMarketplaceItemsServiceProxy
      .getAll(
        this.accountDataForView?.ssin,
        this.accountDataForView?.ssin,
        undefined,
        undefined,
        false,
        '',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        2,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,

        undefined,
        selectedCurrency,
        undefined,
        undefined,
        undefined,
        'name',
        0,
        4
      )

      .pipe(
        finalize(() => {

        })
      )
      .subscribe((result) => {
        this.items = result.items;
      });
  }

  ngOnDestroy() {
    this.unsubscribeToAllSubscriptions();
  }
}
