import { Component, ElementRef, EventEmitter, Injector, Input, Output, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountDto, AppPostDto, AppPostsServiceProxy, GetAppPostForViewDto, GetMessagesForViewDto, MessagePagedResultDto, MessageServiceProxy } from '@shared/service-proxies/service-proxies';
import * as moment from 'moment';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-overview-tab',
  templateUrl: './overview-tab.component.html',
  styleUrls: ['./overview-tab.component.scss'],
})
export class OverviewTabComponent extends AppComponentBase  {
  postData: any;
   baseUrl = "https://localhost:44301/";

progressValue = 30;
posts: GetAppPostForViewDto[] = [];
reviews : GetMessagesForViewDto [] =[]
@Input('accountDataForView') accountDataForView :AccountDto;
@Output("activeTabIndexBtn") activeTabIndexBtn: EventEmitter<number> = new EventEmitter<number>()
@ViewChild('reviewsSection') reviewsSection!: ElementRef;

  constructor(        injector: Injector, private _postService: AppPostsServiceProxy,private messageServiceProxy:MessageServiceProxy) {
    super(injector);

}

ngOnInit() {
  this.rating = 3.4
  this.getAllPosts()
  this.getAllReviws()
}
rating: number = 3.4; // Rating out of 5
getAllPosts() {
  // this.loading = true;
  const subs = this._postService
      .getAll(
         undefined,
         undefined,
        undefined,
          undefined,
          undefined,
          undefined,
          undefined,
         undefined,
          0,
          2486,
          2,
          "",
         0,
         5
      )
      .pipe(
          finalize(() => {
              // this.loading = false;
          })
      )
      .subscribe((result) => {
          // this.totalCount = result.totalCount;
      
      this.posts = result.items

      });
  this.subscriptions.push(subs);
}
goReviews() {
  this.reviewsSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
}

getAllReviws() {
  // this.loading = true;
  const subs = this.messageServiceProxy
      .getAllReviews(
         undefined,
          undefined,
          undefined,
          undefined,
          449928,
          undefined,
          undefined,
          "REVIEW",
          "",
         0,
         5
      )
      .pipe(
          finalize(() => {
              // this.loading = false;
          })
      )
      .subscribe((result) => {
          // this.totalCount = result.totalCount;
      console.log(result,'reeees')
      this.reviews = result.items
      console.log(this.reviews,'this.reviews')

      });
  this.subscriptions.push(subs);
}
ngOnDestroy() {
  this.unsubscribeToAllSubscriptions();
}
}
