import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MarketplaceContactsComponent } from './components/marketplace-contacts.component';
import { MarketplaceViewContactComponent } from './components/marketplace-view-contact.component';


const routes: Routes = [
    { path : "",  component : MarketplaceContactsComponent },
    { path : "view/:id",  component : MarketplaceViewContactComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketplaceContactsRoutingModule { }
