import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MarketplaceAccountsComponent } from './components/marketplace-accounts.component';


const routes: Routes = [
    { path : "", component: MarketplaceAccountsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketplaceAccountsRoutingModule { }
