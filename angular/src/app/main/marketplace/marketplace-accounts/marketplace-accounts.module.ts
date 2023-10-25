import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketplaceAccountsRoutingModule } from './marketplace-accounts-routing.module';
import { MarketplaceAccountsComponent } from './components/marketplace-accounts.component';
import { AccountSharedModule } from '@app/main/accounts/account-shared/account-shared.module';


@NgModule({
  declarations: [MarketplaceAccountsComponent],
  imports: [
    CommonModule,
    MarketplaceAccountsRoutingModule,
    AccountSharedModule
  ]
})
export class MarketplaceAccountsModule { }
