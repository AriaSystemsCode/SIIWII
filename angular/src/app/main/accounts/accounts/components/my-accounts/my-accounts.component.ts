import { Component, Injector, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { SelectItem } from 'primeng/api';
import { AccountMainFilterEnum } from '../../../account-shared/models/accounts-main-filter.enum';

@Component({
  selector: 'app-my-accounts',
  templateUrl: './my-accounts.component.html',
  styleUrls: ['./my-accounts.component.scss']
})
export class MyAccountsComponent extends AppComponentBase implements OnInit {
  defaultMainFilter: AccountMainFilterEnum;
  pageMainFilters: SelectItem[] = [];
  isHost: boolean;
  showMainFiltersOptions = true;
  showAddButton = true;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.isHost = !this.appSession.tenantId;
    this.initializeMainFilters();
  }

  private initializeMainFilters(): void {
    const filters: { labelKey: string; value: AccountMainFilterEnum }[] = this.isHost
      ? [{ labelKey: 'ExternalAccounts', value: AccountMainFilterEnum.ExternalAccounts }]
      : [
          { labelKey: 'My Connections', value: AccountMainFilterEnum.ManualAndConnectedAccounts },
          { labelKey: 'ManualAccounts', value: AccountMainFilterEnum.ManualAccounts },
          { labelKey: 'ConnectedAccounts', value: AccountMainFilterEnum.ConnectedAccounts }
        ];

    this.pageMainFilters = filters.map(f => ({
      label: this.l(f.labelKey),
      value: f.value
    }));

    this.defaultMainFilter = filters[0].value;
  }
}
