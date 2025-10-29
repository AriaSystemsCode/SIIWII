import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AppCommonModule } from "@app/shared/common/app-common.module";
import { ModalModule } from "ngx-bootstrap/modal";
import { UtilsModule } from "@shared/utils/utils.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { eventsModule } from "../AppEvent/events.module";
import { InteractionsModule } from "../interactions/interactions.module";
import { SycLandingPageSettingsComponent } from "./components/syc-landing-page-settings.component";
import { SliderComponent } from "./components/syclanding-Slider.component";
import { CTAComponent } from "./components/syclanding-CTA.component";
import { RouterModule } from "@angular/router";
import { CarouselModule } from "primeng/carousel";
import { SycLandingPageSettingsRoutingModule } from "./SycLandingPageSettingsRoutingModule-routing.module";

import { SyclandingFooterComponent } from "./components/syclanding-footer.component";
import { MarketplaceProductsModule } from "../marketplace/marketplace-products/marketplace-products.module";
import { PageLinkFooterComponent } from "./components/page-link-footer/page-link-footer.component";
import { SyclandingADVComponent } from "./components/syclanding-Adv.component";
import { SocialMediaFooterComponent } from "./components/social-media-footer/social-media-footer.component";
import { SinglrRowCallActionLandingPageComponent } from "./components/single-row-callAction-landing-page/single-row-callAction-landing-page.component";

@NgModule({
    declarations: [
        SycLandingPageSettingsComponent,
        SliderComponent,
        CTAComponent,
        SyclandingFooterComponent,
        SyclandingADVComponent,
        PageLinkFooterComponent,
        SocialMediaFooterComponent,
        SinglrRowCallActionLandingPageComponent
    ],
    imports: [
        SycLandingPageSettingsRoutingModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        UtilsModule,
        CommonModule,
        AppCommonModule,
        ModalModule.forRoot(),
        BsDropdownModule.forRoot(),
        CarouselModule,
        eventsModule,
        InteractionsModule,
        MarketplaceProductsModule
    ],
    exports: [SycLandingPageSettingsComponent, SliderComponent, CTAComponent,PageLinkFooterComponent,SocialMediaFooterComponent,SinglrRowCallActionLandingPageComponent],
})
export class SycLandingPageSettingsModule {}
