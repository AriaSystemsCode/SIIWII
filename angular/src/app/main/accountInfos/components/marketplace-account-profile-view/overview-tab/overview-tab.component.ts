import { Component, ElementRef, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountDto, AppPostDto, AppPostsServiceProxy, GetAppPostForViewDto, GetMessagesForViewDto, MessagePagedResultDto, MessageServiceProxy, OverAllRatingDto } from '@shared/service-proxies/service-proxies';
import * as moment from 'moment';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-overview-tab',
  templateUrl: './overview-tab.component.html',
  styleUrls: ['./overview-tab.component.scss'],
})
export class OverviewTabComponent extends AppComponentBase implements OnInit,OnDestroy  {
  
   baseUrl = "https://localhost:44301/";


posts: GetAppPostForViewDto[] = [];
reviews : any [] =[]
@Input('accountDataForView') accountDataForView :AccountDto;
@Output("activeTabIndexBtn") activeTabIndexBtn: EventEmitter<number> = new EventEmitter<number>()
@ViewChild('reviewsSection') reviewsSection!: ElementRef;
totalCount: number = 0; // Total number of reviews
skipCount: number = 0; // Current offset
maxResultCount: number = 1; // Number of reviews per request
reviewRating : number
selectedRating: number = 0; // Initialize with no rating
value: number;
overRating : OverAllRatingDto
  constructor(        injector: Injector, private _postService: AppPostsServiceProxy,private messageServiceProxy:MessageServiceProxy) {
    super(injector);

}

ngOnInit() {

  // this.rating = 3.4

}


ngOnChanges(){

  this.getAllPosts()
  this.getAllReviws()
  this.getOverAllRatings()
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
          // this.accountDataForView.entityId,
          undefined,
          undefined,
          "REVIEW",
          "",
          this.skipCount,
          this.maxResultCount
      )
      .pipe(
          finalize(() => {
              // this.loading = false;
          })
      )
        .subscribe(
        (result) => {
          // Append new reviews to the existing list
          this.reviews = [...this.reviews, ...result.items];
          this.totalCount = result.totalCount; // Update total count of reviews
        },
       
      );
  this.subscriptions.push(subs);
}



loadMoreReviews(): void {
  if (this.reviews.length < this.totalCount ) {
    this.skipCount += this.maxResultCount; // Increment the offset
    this.getAllReviws(); // Fetch more reviews
  }
}



getOverAllRatings() {

  const subs = this.messageServiceProxy
      .getOverAllRatings(
          449928,
          // this.accountDataForView.entityId,
      )
      .pipe(
          finalize(() => {
          
          })
      )
        .subscribe(
        (result) => {
         console.log(result,'resultresultresult')
          this.overRating =result

        },
       
      );
  this.subscriptions.push(subs);
}

setRating(rating: number): void {
  this.selectedRating = rating;
  console.log(`User selected ${rating} stars`);
  this.saveRating(rating);
}

// Simulated function to save the rating (API call can be added here)
saveRating(rating: number): void {
  // Replace this with an actual API service call
  console.log(`Saving rating: ${rating}`);
  // Example: this.ratingService.saveRating(rating).subscribe(...);
}

ngOnDestroy() {
  this.unsubscribeToAllSubscriptions();
}
}
