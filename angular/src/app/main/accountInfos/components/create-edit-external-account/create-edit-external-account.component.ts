import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountLevelEnum } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-create-edit-external-account',
  templateUrl: './create-edit-external-account.component.html',
  styleUrls: ['./create-edit-external-account.component.scss']
})
export class CreateEditExternalAccountComponent implements OnInit {
    accountLevel : AccountLevelEnum = AccountLevelEnum.External
    accountId:number
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
