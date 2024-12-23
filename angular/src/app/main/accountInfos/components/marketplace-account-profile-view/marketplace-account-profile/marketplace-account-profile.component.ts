import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-marketplace-account-profile',
  templateUrl: './marketplace-account-profile.component.html',
  styleUrls: ['./marketplace-account-profile.component.scss']
})
export class MarketplaceAccountProfileComponent implements OnInit {
  accountId:number;
  accountType:string = "";
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
