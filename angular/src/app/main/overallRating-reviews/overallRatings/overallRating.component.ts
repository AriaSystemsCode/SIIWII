import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import {  AccountsServiceProxy, MessageServiceProxy } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-overallRating',
  templateUrl: './overallRating.component.html',
  styleUrls: ['./overallRating.component.scss'],
})
export class OverallRatingComponent extends AppComponentBase implements OnInit, OnDestroy {



  baseUrl: string = AppConsts.attachmentBaseUrl;
  // overRating: OverAllRatingDto
  overRating  = {
    overAllRating: 20,
    totalNumberOfRating: 248,
    fiveTotal: 5,
    fourTotal: 4,
    threeTotal: 2,
    twoTotal: 10,
    oneTotal: 20
  }



  constructor(injector: Injector, private messageServiceProxy: MessageServiceProxy, private _AccountsServiceProxy: AccountsServiceProxy

  ) {
    super(injector);

  }

  ngOnInit() {
    this.getOverAllRatings()
    this.overRating = {
      overAllRating: 20,
      totalNumberOfRating: 248,
      fiveTotal: 5,
      fourTotal: 4,
      threeTotal: 2,
      twoTotal: 10,
      oneTotal: 20
    }

  }


  ngOnChanges() {
  }



  getOverAllRatings() {
    // const subs = this.messageServiceProxy
    //   .getOverAllRatings(
    //     this.accountDataForView.entityId,
    //   )
    //   .pipe(
    //     finalize(() => {

    //     })
    //   )
    //   .subscribe(
    //     (result) => {
    //       this.overRating = result

    //     },

    //   );
    // this.subscriptions.push(subs);
  }



  ngOnDestroy() {
    this.unsubscribeToAllSubscriptions();
  }
}
