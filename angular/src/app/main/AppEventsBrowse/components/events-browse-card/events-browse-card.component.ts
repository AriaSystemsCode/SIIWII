import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { EventsFilterTypesEnum, GetAppEventForViewDto } from '@shared/service-proxies/service-proxies';
import { EventsBrowseActionsEvents } from '../../models/Events-browse-inputs';
import { EventsBrowseComponentActionsMenuFlags } from "../../models/EventsBrowseComponentActionsMenuFlags";
import { EventsBrowseComponentStatusesFlags } from "../../models/EventsBrowseComponentStatusesFlags";
import { EventsBrowseActionsMenuComponent } from '../events-browse-actions-menu/events-browse-actions-menu.component';

@Component({
  selector: 'app-events-browse-card',
  templateUrl: './events-browse-card.component.html',
  styleUrls: ['./events-browse-card.component.scss']
})
export class EventsBrowseCardComponent extends AppComponentBase {

    @ViewChild("EventsBrowseActionsMenuComponent", { static: true }) eventsBrowseActionsMenuComponent: EventsBrowseActionsMenuComponent;
    @Input() item: GetAppEventForViewDto;
    @Input() filterForm: FormGroup;
    @Input() singleItemPerRowMode: boolean;
    @Input()  actionsMenuFlags:EventsBrowseComponentActionsMenuFlags
    @Input()  statusesFlags:EventsBrowseComponentStatusesFlags
    @Output() triggerEvent: EventEmitter<EventsBrowseActionsEvents> = new EventEmitter<EventsBrowseActionsEvents>();
    EventsFilterTypesEnum = EventsFilterTypesEnum
    EventsBrowseActionsEvents = EventsBrowseActionsEvents
    get mainFilterCtrl() { return this.filterForm.get('filterType') }
    constructor(
        injector: Injector,
    ) {
        super(injector);
    }
    _triggerEvent(event:EventsBrowseActionsEvents) {
        this.triggerEvent.emit(event);
    }
}
