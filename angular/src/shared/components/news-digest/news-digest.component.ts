import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from "@shared/common/app-component-base";
import { ViewPostComponent } from "../../../app/main/posts/Components/view-post.component";
import { Injector } from "@angular/core";
import {
  AppEntitiesServiceProxy,
  AppPostsServiceProxy,
  PostType,
  TopPostDto,
  GetAppPostForViewDto,
} from "@shared/service-proxies/service-proxies";

// #docregion compnent overview - functionaclity
// component to reterive News digest data from API.
// #enddocregion your-region-name

@Component({
  selector: 'app-news-digest',
  templateUrl: './news-digest.component.html',
  styleUrls: ['./news-digest.component.scss']
})
export class NewsDigestComponent
  extends AppComponentBase
  implements OnInit {

  //array to retreive the posts
  items: GetAppPostForViewDto[] = [];
  newsPageURL: string = "/app/main/marketplace/news";
  // flag to start display posts if found
  itemsToShow: Boolean = false;
  attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;

  @Output() viewPost : EventEmitter<any> = new EventEmitter();
  numVisible: number = 1;
  numScroll: number = 1;
  constructor(private _appEntitiesServiceProxy: AppEntitiesServiceProxy, private _postService: AppPostsServiceProxy, injector: Injector
  ) {
    super(injector);
  }

  ngOnInit(): void {
    //array to retreive the posts
    this.items = [];

    // flag to start display posts if found
    this.itemsToShow = false;

    // call the API to get the top posts
    this._postService.getTopNewsDigest(3, 30).subscribe(
      (result) => {
        for (var i = 0; i < result.length; i++) {
          this.items.push(result[i]);
        }
        this.itemsToShow = (this.items.length > 0);
      }
    );
  }

  // call the post popup with parameter clicked on post to display the popup
  ShowViewPost(postid: number) {
    this.viewPost.emit(postid);
  }

}
