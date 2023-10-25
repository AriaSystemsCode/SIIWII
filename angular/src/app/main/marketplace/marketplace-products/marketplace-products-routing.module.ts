import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MarketplaceProductsComponent } from './components/marketplace-products.component';
import { MarketplaceViewProductComponent } from './components/marketplace-view-product.component';

const routes: Routes = [
    { path : "",  component : MarketplaceProductsComponent },
    { path : "view/:id",  component : MarketplaceViewProductComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketplaceProductsRoutingModule { }
