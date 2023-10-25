import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MarketplaceNewsComponent } from './component/marketplace-news.component';

const routes: Routes = [
    { path : "",  component : MarketplaceNewsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketplaceNewsRoutingModule { }
