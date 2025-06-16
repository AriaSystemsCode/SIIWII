import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import {  AccountsServiceProxy, MessageServiceProxy, OverAllRatingDto } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-overallRating',
  templateUrl: './overallRating.component.html',
  styleUrls: ['./overallRating.component.scss'],
})
export class OverallRatingComponent extends AppComponentBase implements OnInit, OnDestroy {

  @Input() entityID : number

  baseUrl: string = AppConsts.attachmentBaseUrl;
  overRating: OverAllRatingDto




  constructor(injector: Injector, private messageServiceProxy: MessageServiceProxy, private _AccountsServiceProxy: AccountsServiceProxy

  ) {
    super(injector);

  }

  ngOnInit() {
    this.getOverAllRatings()
  }


  ngOnChanges() {
  }



  getOverAllRatings() {
    const subs = this.messageServiceProxy
      .getOverAllRatings(
        this.entityID,
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



  ngOnDestroy() {
    this.unsubscribeToAllSubscriptions();
  }
}
