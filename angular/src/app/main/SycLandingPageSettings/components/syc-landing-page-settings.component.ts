import { Component, Injector, OnInit, ViewChild } from "@angular/core";
import { SliderComponent } from "./syclanding-Slider.component";
import { CTAComponent } from "./syclanding-CTA.component";
import { SyclandingADVComponent } from "./syclanding-adv.component";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    SliderEnum,
    SydObjectsServiceProxy,
} from "@shared/service-proxies/service-proxies";

@Component({
    selector: "app-syc-landing-page-settings",
    templateUrl: "./syc-landing-page-settings.component.html",
    styleUrls: ["./syc-landing-page-settings.component.scss"],
})
export class SycLandingPageSettingsComponent
    extends AppComponentBase
    implements OnInit
{
    @ViewChild("slider", { static: true }) slider: SliderComponent;
    @ViewChild("cta", { static: true }) cta: CTAComponent;
    @ViewChild("adv_sm", { static: true }) adv_sm: SyclandingADVComponent;
    @ViewChild("ad_md", { static: true }) adv_md: SyclandingADVComponent;

    autoSliderCode: string = "SycLandingPageSettingsAutoSlider";
    CTASliderCode: string = "SycLandingPageSettingsCTASlider";
    advSliderCode: string = "SycLandingPageSettingsAdvSlider";
     advSliderItems: string[] = [];


    constructor(
        injector: Injector,
        private _sydObjectsAppService: SydObjectsServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.GetAllAtoSliderSettings();
        this.getAllCallToActionSettings();
        this.getAdvSettings();
    }

    ngOnDestroy() {
        this.unsubscribeToAllSubscriptions();
    }

    GetAllAtoSliderSettings() {
        var sliderItems: string[] = [];
        const subs = this._sydObjectsAppService
            .getAllSliderSettings(SliderEnum.AutoSlider, this.autoSliderCode)
            .subscribe((result) => {
                result.forEach((img) => {
                    sliderItems.push(img.image);
                });

                this.slider.sliderItems = sliderItems;
            });
        this.subscriptions.push(subs);
    }

    getAllCallToActionSettings() {
        const subs = this._sydObjectsAppService
            .getAllSliderSettings(SliderEnum.CallToAction, this.CTASliderCode)
            .subscribe((result) => {
                this.cta.sycLangingPageSetting = result;
            });
        this.subscriptions.push(subs);
    }

    getAdvSettings() {
        var _advSliderItems: string[] = [];
        const subs = this._sydObjectsAppService
            .getAllSliderSettings(SliderEnum.AdvSlider, this.advSliderCode)
            .subscribe((result) => {

                result.forEach((img) => {
                    _advSliderItems.push(img.image);
                });
                // this.adv_sm.advSliderItems = advSliderItems;
                // this.adv_md.advSliderItems = advSliderItems;
                this.advSliderItems=_advSliderItems;
            });
        this.subscriptions.push(subs);
    }
}
