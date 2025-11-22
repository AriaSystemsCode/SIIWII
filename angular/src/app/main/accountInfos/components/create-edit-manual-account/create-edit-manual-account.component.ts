import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountLevelEnum } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-create-edit-manual-account',
  templateUrl: './create-edit-manual-account.component.html',
  styleUrls: ['./create-edit-manual-account.component.scss']
})
export class CreateEditManualAccountComponent implements OnInit {
    accountLevel : AccountLevelEnum = AccountLevelEnum.Manual
    accountId : number
  constructor(private activatedRoute:ActivatedRoute) { }

  ngOnInit(): void {
    this.checkForIdOnParam()
  }
  checkForIdOnParam(){
    this.activatedRoute.params.subscribe(params => {
        this.accountId = params['id']
      });
  }

}
