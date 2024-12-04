import { Component } from '@angular/core';
import { AppPostDto, GetAppPostForViewDto } from '@shared/service-proxies/service-proxies';
import * as moment from 'moment';

@Component({
  selector: 'app-overview-tab',
  templateUrl: './overview-tab.component.html',
  styleUrls: ['./overview-tab.component.scss']
})
export class OverviewTabComponent {
  postData: any;
   baseUrl = "https://localhost:44301/";

progressValue = 50;

  constructor() {
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
rating: number = 3.3; // Rating out of 5

}
