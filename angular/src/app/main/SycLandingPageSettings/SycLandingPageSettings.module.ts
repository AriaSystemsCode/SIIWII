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
import { SyclandingFooterComponent } from "./components/syclanding-Footer.component";
import { RouterModule } from "@angular/router";
import { CarouselModule } from "primeng/carousel";
import { SycLandingPageSettingsRoutingModule } from "./SycLandingPageSettingsRoutingModule-routing.module";
import { SyclandingADVComponent } from "./components/syclanding-adv.component";

@NgModule({
    declarations: [
        SycLandingPageSettingsComponent,
        SliderComponent,
        CTAComponent,
        SyclandingFooterComponent,
        SyclandingADVComponent,
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
    ],
    exports: [SycLandingPageSettingsComponent, SliderComponent, CTAComponent],
})
export class SycLandingPageSettingsModule {}
