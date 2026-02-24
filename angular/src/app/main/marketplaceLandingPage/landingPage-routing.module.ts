import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { MarketplaceLandingPageComponent } from "./components/marketplace-landing-page/marketplace-landing-page.component";

const routes: Routes = [
    {
        path: "",
        component: MarketplaceLandingPageComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class LandingPageRoutingModule {}
