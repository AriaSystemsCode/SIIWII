import {
    Component,
    EventEmitter,
    Injector,
    OnDestroy,
    OnInit,
    Output,
} from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    AppEventDto,
    AppEventsServiceProxy,
    EventsFilterTypesEnum,
    GetAppEventForViewDto,
} from "@shared/service-proxies/service-proxies";
import * as moment from "moment";

@Component({
    selector: "app-up-comming-event",
    templateUrl: "./up-comming-event.component.html",
    styleUrls: ["./up-comming-event.component.scss"],
})
export class UpCommingEventComponent
    extends AppComponentBase
    implements OnInit, OnDestroy
{
    constructor(
        private _appEventsServiceProxy: AppEventsServiceProxy,
        injector: Injector
    ) {
        super(injector);
    }

    upComingEvents: GetAppEventForViewDto[];
    maxResultCount: number = 3;
    timezoneOffset: number;
    eventPageURL: string = "/app/main/marketplace/events";
    @Output() viewEventModal = new EventEmitter<number>();
    ngOnInit(): void {
        const subs = this._appEventsServiceProxy
            .getAll(
                EventsFilterTypesEnum.AllEvents,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                moment(new Date()),
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                0,
                this.maxResultCount
            )
            .subscribe((res) => {

                this.getTimezoneOffset();
                this.upComingEvents = res.items;
            });
        this.subscriptions.push(subs);
    }
    ngOnDestroy() {
        this.unsubscribeToAllSubscriptions();
    }
    getTimezoneOffset() {
        this.timezoneOffset = new Date().getTimezoneOffset();
    }

    onViewEvent(eventId: number) {
        this.viewEventModal.emit(eventId)
    }
}
