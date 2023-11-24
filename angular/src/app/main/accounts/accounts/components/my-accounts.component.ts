import { Component, Injector, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { SelectItem } from 'primeng';
import { AccountMainFilterEnum } from '../../account-shared/models/accounts-main-filter.enum';

@Component({
    selector: 'app-my-accounts',
    templateUrl: './my-accounts.component.html',
    styleUrls: ['./my-accounts.component.scss']
})
export class MyAccountsComponent extends AppComponentBase implements OnInit {
    defaultMainFilter: AccountMainFilterEnum
    pageMainFilters: SelectItem[]
    isHost:boolean
    showMainFiltersOptions = true
    showAddButton:boolean = true
    constructor(private injector:Injector) {
        super(injector)
    }

    ngOnInit(): void {
        this.isHost = !this.appSession.tenantId;
        this.definePagesMainFilter()
    }
    definePagesMainFilter(){
        if(this.isHost) {
            this.pageMainFilters = [
                { label: this.l('ExternalAccounts'), value: AccountMainFilterEnum.ExternalAccounts }
            ];
            this.defaultMainFilter = AccountMainFilterEnum.ExternalAccounts
        } else {
            this.pageMainFilters = [
                { label: this.l('MyAccounts'), value: AccountMainFilterEnum.MyAccounts },
                { label: this.l('ManualAccounts'), value: AccountMainFilterEnum.ManualAccounts },
            ];
            this.defaultMainFilter = AccountMainFilterEnum.MyAccounts
        }
    }

}
