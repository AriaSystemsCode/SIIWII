import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UtilsModule } from "@shared/utils/utils.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppCommonModule } from "@app/shared/common/app-common.module";
import { AppItemsViewComponent } from "./Components/app-items-view.component";
import { AppItemSharedModule } from "../app-item-shared/app-item-shared.module";
import { DropdownModule } from "primeng/dropdown";
import { RouterModule } from "@angular/router";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { ModalModule } from "ngx-bootstrap/modal";
import { CarouselModule} from "primeng/carousel";
import { InteractionsModule } from "@app/main/interactions/interactions.module";
import { TabsModule } from "ngx-bootstrap/tabs";

@NgModule({
    declarations: [AppItemsViewComponent],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        UtilsModule,
        CommonModule,
        AppCommonModule,
        AppItemSharedModule,
        RouterModule,
        DropdownModule,
        BsDropdownModule.forRoot(),
        ModalModule.forRoot(),
        CarouselModule,
        InteractionsModule,
        TabsModule.forRoot(),
    ],
    exports: [AppItemsViewComponent],
})
export class AppItemViewModule {}
