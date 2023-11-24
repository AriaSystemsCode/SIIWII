import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PostCardComponent } from "./Components/post-card.component";
import { ViewPostComponent } from "./Components/view-post.component";
import { CreateorEditPostComponent } from "./Components/createor-edit-post.component";
import { PostListComponent } from "./Components/post-list.component";
import { CreatePostEntryComponent } from "./Components/create-post-entry.component";
import { AppCommonModule } from "@app/shared/common/app-common.module";
import { ModalModule } from "ngx-bootstrap/modal";
import { UtilsModule } from "@shared/utils/utils.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SanitizeurlPipe } from "./Pipes/sanitizeurl";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { CarouselModule} from "primeng/carousel";
import { eventsModule } from "../AppEvent/events.module";
import { LinkPreviewComponent } from './Components/link-preview.component';
import { InteractionsModule } from "../interactions/interactions.module";
import { RouterModule } from "@angular/router";
import { TrendingPostsComponent } from '../../../shared/components/trending-posts/trending-posts.component';
import { TopPeopleComponent } from '../../../shared/components/top-people/top-people.component';
import { TopCompanyComponent } from '../../../shared/components/top-company/top-company.component';
import { AdsSidebarComponent } from '../../../shared/components/ads-sidebar/ads-sidebar.component';

@NgModule({
    declarations: [
        PostCardComponent,
        ViewPostComponent,
        CreateorEditPostComponent,
        PostListComponent,
        CreatePostEntryComponent,
        SanitizeurlPipe,
        LinkPreviewComponent,
        TrendingPostsComponent,
        TopPeopleComponent,
        TopCompanyComponent,
        AdsSidebarComponent
    ],
    imports: [
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
        RouterModule
    ],
    exports: [
        PostCardComponent,
        ViewPostComponent,
        CreateorEditPostComponent,
        PostListComponent,
        CreatePostEntryComponent,
        TrendingPostsComponent,
        TopPeopleComponent,
        TopCompanyComponent,
        AdsSidebarComponent
    ],
})
export class PostsModule {}
