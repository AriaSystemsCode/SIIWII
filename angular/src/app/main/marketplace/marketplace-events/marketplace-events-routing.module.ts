import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MarketplaceEventsComponent } from './component/marketplace-events.component';

const routes: Routes = [
    { path : "",  component : MarketplaceEventsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketplaceEventsRoutingModule { }
