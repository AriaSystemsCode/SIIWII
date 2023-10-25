import { Component, OnInit } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from "@shared/common/app-component-base";
import { Injector } from "@angular/core";
import {
  AppEntitiesServiceProxy,
  UserInformationDto,
} from "@shared/service-proxies/service-proxies";

// #docregion compnent overview - functionaclity
// component to reterive top ranking people data from API.
// with no of people as this.topPeopleNo.
// with period day no as this.topDaysNo.
// suppose to be replaced later with settings in appSettings file.
// #enddocregion your-region-name

@Component({
  selector: 'app-top-people',
  templateUrl: './top-people.component.html',
  styleUrls: ['./top-people.component.scss']
})
export class TopPeopleComponent
  extends AppComponentBase
  implements OnInit {
  
    //array to retreive people
  items: UserInformationDto[] = [];

  // flag to start display people if found
  itemsToShow: Boolean = false;
  
  attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
  constructor(private _appEntitiesServiceProxy: AppEntitiesServiceProxy, injector: Injector
  ) {
    super(injector);
  }

  ngOnInit(): void {
    //initilize the reteriveing people array, and empty it.
    this.items = [];
    
    //initilize the displaying companies flag.
    this.itemsToShow = false;
    
    // call the API to get people data
    this._appEntitiesServiceProxy.getTopContributors(this.topPeopleNo, this.topDaysNo).subscribe(
      (result) => {
        for (var i = 0; i < result.length; i++) {
          this.items.push(result[i]);
        }
        this.itemsToShow = (this.items.length > 0);
      }
    );
  }
}
