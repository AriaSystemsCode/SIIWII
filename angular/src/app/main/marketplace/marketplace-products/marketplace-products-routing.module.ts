import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MarketplaceProductsComponent } from './components/marketplace-products.component';
import { MarketplaceViewProductComponent } from './components/marketplace-view-product.component';
import { CopyMarketplaceViewComponent } from './components/copy-marketplace-view/copy-marketplace-view.component';

const routes: Routes = [
    { path : "",  component : MarketplaceProductsComponent },
    { path : "marketplace-copy",  component : CopyMarketplaceViewComponent },
    { path : "view/:id",  component : MarketplaceViewProductComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketplaceProductsRoutingModule { }
