import { Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountDto, AccountsServiceProxy, AppEntityAttachmentDto, CreateMessageInput, GetAppPostForViewDto, MessageServiceProxy, OverAllRatingDto } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-overview-tab',
  templateUrl: './overview-tab.component.html',
  styleUrls: ['./overview-tab.component.scss'],
})
export class OverviewTabComponent extends AppComponentBase implements OnInit, OnDestroy {


  @Input('accountDataForView') accountDataForView: AccountDto;
  @Output("activeTabIndexBtn") activeTabIndexBtn: EventEmitter<number> = new EventEmitter<number>()
  @ViewChild('reviewsSection') reviewsSection!: ElementRef;

  baseUrl: string = AppConsts.attachmentBaseUrl;
  overRating: OverAllRatingDto
  mediaItems: AppEntityAttachmentDto[]

  messages: CreateMessageInput = new CreateMessageInput();
  loginAccoutType: string = "";
  isModalOpen : boolean = false;
  selectedIndex : number = 0; 

  constructor(injector: Injector, private messageServiceProxy: MessageServiceProxy, private _AccountsServiceProxy: AccountsServiceProxy

  ) {
    super(injector);

  }

  ngOnInit() {
    this.getLoginAccoutType()
    this.getOverAllRatings()
    this.getAllMedia()

  }


  ngOnChanges() {
  }

  getAllMedia() {
    this.showMainSpinner()
    this._AccountsServiceProxy.getAllAccountMediaAttachment(this.accountDataForView?.ssin, undefined, 0, 9).pipe(
      finalize(
        () =>
          this.hideMainSpinner()
      )
    ).subscribe((res) => {

      this.mediaItems = res?.items

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
        finalize(() => {

        })
      )
      .subscribe(
        (result) => {
          this.overRating = result

        },

      );
    this.subscriptions.push(subs);
  }

  getLoginAccoutType() {
    this._AccountsServiceProxy.getAccountForView(this.appSession.user.accountId, 5).subscribe((res) => {
      this.loginAccoutType = res.account.accountType;
    }

    )
  }


  ngOnDestroy() {
    this.unsubscribeToAllSubscriptions();
  }
}
