import { Component, Injector, Input, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import {   MessageServiceProxy, OverAllRatingDto } from '@shared/service-proxies/service-proxies';


@Component({
  selector: 'app-overallRating',
  templateUrl: './overallRating.component.html',
  styleUrls: ['./overallRating.component.scss'],
})
export class OverallRatingComponent extends AppComponentBase implements OnInit, OnDestroy {

  @Input() overRating: OverAllRatingDto
  @Input() fromOverview: boolean 

  baseUrl: string = AppConsts.attachmentBaseUrl;

  constructor(injector: Injector, private messageServiceProxy: MessageServiceProxy

  ) {
    super(injector);

  }

  ngOnInit() {
    
  }


  ngOnChanges(changes: SimpleChanges): void {

  }






  ngOnDestroy() {
    this.unsubscribeToAllSubscriptions();
  }
}
