import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppEventDto, EventsFilterTypesEnum } from '@shared/service-proxies/service-proxies';
import { EventsBrowseActionsEvents } from '../../models/Events-browse-inputs';
import { EventsBrowseComponentActionsMenuFlags } from "../../models/EventsBrowseComponentActionsMenuFlags";

@Component({
  selector: 'app-events-browse-actions-menu',
  templateUrl: './events-browse-actions-menu.component.html',
  styleUrls: ['./events-browse-actions-menu.component.scss']
})
export class EventsBrowseActionsMenuComponent extends AppComponentBase implements OnChanges {
    @Input() item: AppEventDto;
    @Input() filterType: EventsFilterTypesEnum;
    EventsFilterTypesEnum = EventsFilterTypesEnum
    @Input() actionsMenuFlags:EventsBrowseComponentActionsMenuFlags
    @Output() triggerEvent: EventEmitter<EventsBrowseActionsEvents> = new EventEmitter<EventsBrowseActionsEvents>();
    isItemOwner:boolean = false
    EventsBrowseActionsEvents = EventsBrowseActionsEvents
    constructor(
        private injector:Injector,
    ) {
        super(injector)
    }
    ngOnChanges(changes: SimpleChanges): void {
        if(this.item){
            this.isItemOwner = this.appSession.user.id == this.item.userId
        }
    }
    _triggerEvent(event:EventsBrowseActionsEvents){
        this.triggerEvent.emit(event)
    }

}

