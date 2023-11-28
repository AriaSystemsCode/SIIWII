import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketplaceProductsRoutingModule } from './marketplace-products-routing.module';
import { AppItemsBrowseModule } from '@app/main/app-items/app-items-browse/app-items-browse.module';
import { AppItemViewModule } from '@app/main/app-items/app-item-view/app-item-view.module';
import { MarketplaceProductsComponent } from './components/marketplace-products.component';
import { MarketplaceViewProductComponent } from './components/marketplace-view-product.component';

@NgModule({
    declarations: [
        MarketplaceProductsComponent,
        MarketplaceViewProductComponent
    ],
    imports: [
        CommonModule,
        MarketplaceProductsRoutingModule,
        AppItemsBrowseModule,
        AppItemViewModule
    ]
})
export class MarketplaceProductsModule { }
