import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { EventsFilterTypesEnum, GetAppEventForViewDto } from '@shared/service-proxies/service-proxies';
import { NewsBrowseActionsEvents } from '../../models/News-browse-inputs';
import { NewsBrowseComponentActionsMenuFlags } from "../../models/NewsBrowseComponentActionsMenuFlags";
import { NewsBrowseComponentStatusesFlags } from "../../models/NewsBrowseComponentStatusesFlags";
import { NewsBrowseActionsMenuComponent } from '../news-browse-actions-menu/news-browse-actions-menu.component';

@Component({
  selector: 'app-news-browse-card',
  templateUrl: './news-browse-card.component.html',
  styleUrls: ['./news-browse-card.component.scss']
})
export class NewsBrowseCardComponent extends AppComponentBase {

    @ViewChild("EventsBrowseActionsMenuComponent", { static: true }) eventsBrowseActionsMenuComponent: NewsBrowseActionsMenuComponent;
    @Input() item: GetAppEventForViewDto;
    @Input() filterForm: FormGroup;
    @Input() singleItemPerRowMode: boolean;
    @Input()  actionsMenuFlags:NewsBrowseComponentActionsMenuFlags
    @Input()  statusesFlags:NewsBrowseComponentStatusesFlags
    @Output() triggerEvent: EventEmitter<NewsBrowseActionsEvents> = new EventEmitter<NewsBrowseActionsEvents>();
    EventsFilterTypesEnum = EventsFilterTypesEnum
    NewsBrowseActionsEvents = NewsBrowseActionsEvents
    get mainFilterCtrl() { return this.filterForm.get('filterType') }
    constructor(
        injector: Injector,
    ) {
        super(injector);
    }
    _triggerEvent(event:NewsBrowseActionsEvents) {
        this.triggerEvent.emit(event);
    }
}
