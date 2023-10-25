import { AppComponentBase } from "@shared/common/app-component-base";
import { Component, OnInit } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { Injector } from "@angular/core";
import {
  AppEntitiesServiceProxy,
  TopCompany,
} from "@shared/service-proxies/service-proxies";

// #docregion compnent overview - functionaclity
// component to reterive top ranking companies data from API.
// with no of compnies as this.topComopaniesNo.
// with period day no as this.topDaysNo.
// suppose to be replaced later with settings in appSettings file.
// #enddocregion your-region-name

@Component({
  selector: 'app-top-company',
  templateUrl: './top-company.component.html',
  styleUrls: ['./top-company.component.scss']
})
export class TopCompanyComponent
  extends AppComponentBase
  implements OnInit {

    //array to retreive the companies
  items: TopCompany[] = [];

  // flag to start display companies if found
  itemsToShow: Boolean = false;

  attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
  constructor(private _appEntitiesServiceProxy: AppEntitiesServiceProxy, injector: Injector
  ) {
    super(injector);
  }

  ngOnInit(): void {

    //initilize the reteriveing companies array, and empty it.
    this.items = [];

    //initilize the displaying companies flag.
    this.itemsToShow = false;

    // call the API to get the companies data
    this._appEntitiesServiceProxy.getTopCompanies(this.topComopaniesNo, this.topDaysNo).subscribe(
      (result) => {
        for (var i = 0; i < result.length; i++) {
          this.items.push(result[i]);
        }
        this.itemsToShow = (this.items.length > 0);
      }
    );
  }
}
