import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AppCommonModule } from "@app/shared/common/app-common.module";
import { ModalModule } from "ngx-bootstrap/modal";
import { UtilsModule } from "@shared/utils/utils.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { eventsModule } from "../AppEvent/events.module";
import { InteractionsModule } from "../interactions/interactions.module";
import { RouterModule } from "@angular/router";
import { CarouselModule } from "primeng/carousel";
import { MarketplaceProductsModule } from "../marketplace/marketplace-products/marketplace-products.module";
import { FooterPageLinkComponent } from "./components/footer-page-link/footer-page-link.component";
import { LandingPageSliderWithCallToActionComponent } from "./components/landing-page-slider-with-callToAction/landing-page-slider-with-callToAction.component";
import { LandingPageSinglrRowCallActionComponent } from "./components/landing-page-single-row-callAction/landing-page-single-row-callAction.component";
import { landingPageFooterComponent } from "./components/landing-page-footer/landing-page-footer.component";
import { FooterSocialMediaComponent } from "./components/footer-social-media/footer-social-media.component";
import { LandingPageSliderWithoutCallToActionComponent } from "./components/landing-page-slider-without-callToAction/landing-page-slider-without-callToAction.component";
import { LandingPageCarusalWithCallToActionComponent } from "./components/landing-page-carusal-with-callToAction/landing-page-carusal-with-callToAction.component";
import { MarketplaceLandingPageComponent } from "./components/marketplace-landing-page/marketplace-landing-page.component";
import { LandingPageRoutingModule } from "./landingPage-routing.module";
import { LandingPageMultiRowCallToActionComponent } from "./components/landing-page-multi-row-callToAction/landing-page-multi-row-callToAction.component";
import { ContactUsModalComponent } from "./components/contact-us-modal/contact-us-modal.component";
import { MarketplaceEventCardComponent } from "./components/marketplace-event-card/marketplace-event-card.component";
import { MarketplaceAccountCardComponent } from "./components/marketplace-account-card/marketplace-account-card.component";
import { MarketplaceProductCardComponent } from "./components/marketplace-product-card/marketplace-product-card.component";
import { AccountSharedModule } from "../accounts/account-shared/account-shared.module";
import { EventsBrowseModule } from "../AppEventsBrowse/events-browse.module";
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';


@NgModule({
    declarations: [
        MarketplaceLandingPageComponent,
        LandingPageSliderWithCallToActionComponent,
        landingPageFooterComponent,
        FooterPageLinkComponent,
        FooterSocialMediaComponent,
        LandingPageSinglrRowCallActionComponent,
        LandingPageSliderWithoutCallToActionComponent,
        LandingPageCarusalWithCallToActionComponent,
        LandingPageMultiRowCallToActionComponent,
        ContactUsModalComponent,
        MarketplaceEventCardComponent,
        MarketplaceAccountCardComponent,
        MarketplaceProductCardComponent

    ],
    imports: [
        LandingPageRoutingModule,
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
        MarketplaceProductsModule,
        AccountSharedModule,
        EventsBrowseModule,
        TooltipModule,
        DialogModule
        
    ],
    exports: [MarketplaceLandingPageComponent, LandingPageSliderWithCallToActionComponent,FooterPageLinkComponent,FooterSocialMediaComponent,LandingPageSinglrRowCallActionComponent,LandingPageSliderWithoutCallToActionComponent,LandingPageCarusalWithCallToActionComponent,LandingPageMultiRowCallToActionComponent,ContactUsModalComponent],
})
export class LandingPageModule {}
