import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { MarketplaceProductsRoutingModule } from "./marketplace-products-routing.module";
import { AppItemsBrowseModule } from "@app/main/app-items/app-items-browse/app-items-browse.module";
import { AppItemViewModule } from "@app/main/app-items/app-item-view/app-item-view.module";
import { MarketplaceProductsComponent } from "./components/marketplace-products.component";
import { MarketplaceViewProductComponent } from "./components/marketplace-view-product.component";
import { SellerDataComponent } from "./components/seller-data/seller-data.component";
import { ProducrFiltersComponent } from "./components/producr-filters/producr-filters.component";
import { ProdcutCardComponent } from "./components/prodcut-card/prodcut-card.component";
import { DropdownModule } from "primeng/dropdown";
import { FormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { ButtonModule } from "primeng/button";
import { PaginatorModule } from "primeng/paginator";
import { ProductFiltersComponent } from "./components/product-filters/product-filters.component";
import { InputSwitchModule } from "primeng/inputswitch";
import { AccordionModule } from "primeng/accordion";
import { CheckboxModule } from "primeng/checkbox";
import { TreeModule } from "primeng/tree";
import { CalendarModule } from "primeng/calendar";
import { MobileFiltersDialogComponent } from "./components/mobile-filters-dialog/mobile-filters-dialog.component";
import { DialogModule } from "primeng/dialog";
import { RadioButtonModule } from 'primeng/radiobutton';
import { AppMarketplaceItemsServiceProxy } from "@shared/service-proxies/service-proxies";
import { ProductDetailImagesComponent } from './components/product-detail-images/product-detail-images.component';
import { CarouselModule } from 'primeng/carousel';
import { InputNumberModule } from 'primeng/inputnumber';
import { TabViewModule } from 'primeng/tabview';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AppCommonModule } from "@app/shared/common/app-common.module";
@NgModule({
    declarations: [
        MarketplaceProductsComponent,
        MarketplaceViewProductComponent,
        SellerDataComponent,
        ProducrFiltersComponent,
        ProdcutCardComponent,
        ProductFiltersComponent,
        MobileFiltersDialogComponent,
        ProductDetailImagesComponent,
    ],
    imports: [
        CommonModule,
        MarketplaceProductsRoutingModule,
        AppItemsBrowseModule,
        AppItemViewModule,
        DropdownModule,
        FormsModule,
        InputTextModule,
        ButtonModule,
        PaginatorModule,
        InputSwitchModule,
        AccordionModule,
        CheckboxModule,
        TreeModule,
        CalendarModule,
        DialogModule,
        RadioButtonModule,
        CarouselModule,
        InputNumberModule,
        TabViewModule,
        ConfirmDialogModule,AppCommonModule
    ],
    providers:[AppMarketplaceItemsServiceProxy]
})
export class MarketplaceProductsModule {}
