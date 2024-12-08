import { Component } from '@angular/core';
import { AppPostDto, AppPostsServiceProxy, GetAppPostForViewDto } from '@shared/service-proxies/service-proxies';
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
  constructor(     private _postService: AppPostsServiceProxy,) {
    this.postData = {
      
      
        appPost: {
            code: "POST01",
            description: "",
            tenantId: 2524,
            appContactId: null,
            appEntityId: 461457,
            creatorUserId: 30782,
            userName: "salma sami",
            accountName: "prada",
            accountId: 94112,
            profilePictureId: "00000000-0000-0000-0000-000000000000",
            userImage: null,
            creationDatetime: "2024-09-18T08:48:12.2704104",
            embeddedLink: null,
            profilePictureUrl: null,
            id: 51111
        },
        appContactName: "",
        appContactId: null,
        urlTitle: null,
        appEntityName: "",
        canEdit: false,
        attachments: null,
        attachmentsURLs: [
            "assets/placeholders/fluent_alert.png"
        ],
        type: 2,
        entityObjectTypeCode: "SINGLEIMAGE",
        timePassedFromCreation: null
    
}

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
}
