import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppEventDto, EventsFilterTypesEnum } from '@shared/service-proxies/service-proxies';
import { NewsBrowseActionsEvents } from '../../models/News-browse-inputs';
import { NewsBrowseComponentActionsMenuFlags } from "../../models/NewsBrowseComponentActionsMenuFlags";

@Component({
  selector: 'app-news-browse-actions-menu',
  templateUrl: './news-browse-actions-menu.component.html',
  styleUrls: ['./news-browse-actions-menu.component.scss']
})
export class NewsBrowseActionsMenuComponent extends AppComponentBase implements OnChanges {
    @Input() item: AppEventDto;
    @Input() filterType: EventsFilterTypesEnum;
    EventsFilterTypesEnum = EventsFilterTypesEnum
    @Input() actionsMenuFlags:NewsBrowseComponentActionsMenuFlags
    @Output() triggerEvent: EventEmitter<NewsBrowseActionsEvents> = new EventEmitter<NewsBrowseActionsEvents>();
    isItemOwner:boolean = false
    EventsBrowseActionsEvents = NewsBrowseActionsEvents
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
    _triggerEvent(event:NewsBrowseActionsEvents){
        this.triggerEvent.emit(event)
    }

}

