import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { SycLandingPageSettingsComponent } from "./components/syc-landing-page-settings.component";

const routes: Routes = [
    {
        path: "",
        component: SycLandingPageSettingsComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SycLandingPageSettingsRoutingModule {}
