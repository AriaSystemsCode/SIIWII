import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountMainFilterEnum } from '@app/main/accounts/account-shared/models/accounts-main-filter.enum';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-marketplace-account-profile',
  templateUrl: './marketplace-account-profile.component.html',
  styleUrls: ['./marketplace-account-profile.component.scss']
})
export class MarketplaceAccountProfileComponent implements OnInit {
  accountId:number;
  accountType:string = "";
  defaultMainFilter : AccountMainFilterEnum= AccountMainFilterEnum.AllAccounts
  pageMainFilters : SelectItem [] = [{ label:'AllAccounts', value:AccountMainFilterEnum.AllAccounts }]
  constructor(private activatedRoute:ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.accountId = params['id']
    });

    this.activatedRoute.queryParams.subscribe(params => {
    this.accountType= params['accountType'];
    });


    //this.accountType=;
  }


}
