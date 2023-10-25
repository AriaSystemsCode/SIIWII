import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { ModalModule } from "ngx-bootstrap/modal";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { DropdownModule } from "primeng/dropdown";
import { AppCommonModule } from "@app/shared/common/app-common.module";
import { UtilsModule } from "@shared/utils/utils.module";
import { FormsModule } from "@angular/forms";
import { StepsModule } from "primeng/steps";
import { CreateOrEditEventComponent } from "./Components/create-or-edit-event.component";
import { ViewEventComponent } from "./Components/view-event.component";
import { UpCommingEventComponent } from "./Components/up-comming-event.component";
import { TimepickerModule } from "ngx-bootstrap/timepicker";
import { SelectAddressModule } from "@app/selectAddress/selectAddress.module";
import {
    AppEventGuestsServiceProxy,
    AppEventsServiceProxy,
    TimeZoneInfoServiceProxy,
} from "@shared/service-proxies/service-proxies";
import { CarouselModule} from "primeng/carousel";
import { InputSwitchModule } from "primeng/inputswitch";

@NgModule({
    declarations: [
        CreateOrEditEventComponent,
        ViewEventComponent,
        UpCommingEventComponent,
    ],
    imports: [
        CommonModule,
        InputSwitchModule,
        BsDropdownModule,
        DropdownModule,
        AppCommonModule,
        UtilsModule,
        FormsModule,
        BsDatepickerModule.forRoot(),
        TimepickerModule.forRoot(),
        StepsModule,
        ModalModule.forRoot(),
        SelectAddressModule,
        CarouselModule
    ],

    exports: [
        CreateOrEditEventComponent,
        ViewEventComponent,
        UpCommingEventComponent,
    ],
    providers: [
        AppEventsServiceProxy,
        AppEventGuestsServiceProxy,
        TimeZoneInfoServiceProxy,
    ],
})
export class eventsModule {}
