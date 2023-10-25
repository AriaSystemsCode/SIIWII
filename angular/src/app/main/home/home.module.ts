import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AppCommonModule } from "@app/shared/common/app-common.module";
import { HomeRoutingModule } from "./home-routing.module";
import { PostsModule } from "../posts/posts.module";
import { HomeComponent } from "./Components/home/home.component";
import { ModalModule } from "ngx-bootstrap/modal";
import { eventsModule } from "../AppEvent/events.module";

@NgModule({
    declarations: [HomeComponent],
    imports: [
        CommonModule,
        HomeRoutingModule,
        PostsModule,
        AppCommonModule,
        ModalModule.forRoot(),
        eventsModule
    ],
})
export class HomeModule {}
