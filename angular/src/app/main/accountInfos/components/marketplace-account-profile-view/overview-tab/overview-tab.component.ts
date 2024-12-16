import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AccountDto, AppPostDto, AppPostsServiceProxy, GetAppPostForViewDto } from '@shared/service-proxies/service-proxies';
import * as moment from 'moment';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-overview-tab',
  templateUrl: './overview-tab.component.html',
  styleUrls: ['./overview-tab.component.scss'],
})
export class OverviewTabComponent {
  postData: any;
   baseUrl = "https://localhost:44301/";

progressValue = 30;
posts : any []
@Input('accountDataForView') accountDataForView :AccountDto;
@Output("activeTabIndexBtn") activeTabIndexBtn: EventEmitter<number> = new EventEmitter<number>()
@ViewChild('reviewsSection') reviewsSection!: ElementRef;

  constructor(     private _postService: AppPostsServiceProxy,) {


}

ngOnInit() {
  this.rating = 3.4
  this.getAllPosts()
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
  // this.subscriptions.push(subs);
}
goReviews() {
  this.reviewsSection.nativeElement.scrollIntoView({ behavior: 'smooth' });
}
}
