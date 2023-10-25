import { Component } from '@angular/core';
import { AccountMainFilterEnum } from '@app/main/accounts/account-shared/models/accounts-main-filter.enum';
import { SelectItem } from 'primeng/api';

@Component({
    selector: 'app-marketplace-accounts',
    templateUrl: './marketplace-accounts.component.html',
    styleUrls: ['./marketplace-accounts.component.scss']
})
export class MarketplaceAccountsComponent  {
    showMainFiltersOptions:boolean = false
    showAddButton:boolean = false
    defaultMainFilter : AccountMainFilterEnum = AccountMainFilterEnum.AllAccounts
    pageMainFilters : SelectItem [] = [{ label:'AllAccounts', value:AccountMainFilterEnum.AllAccounts }]
    constructor() { }

}
