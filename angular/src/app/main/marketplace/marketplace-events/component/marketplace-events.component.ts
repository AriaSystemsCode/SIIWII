import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventsBrowseComponent } from '@app/main/AppEventsBrowse/components/events-browse/events-browse.component';
import { EventsBrowseInputs } from '@app/main/AppEventsBrowse/models/Events-browse-inputs';
import { EventsBrowseComponentFiltersDisplayFlags } from "@app/main/AppEventsBrowse/models/EventsBrowseComponentFiltersDisplayFlags";
import { EventsBrowseComponentActionsMenuFlags } from "@app/main/AppEventsBrowse/models/EventsBrowseComponentActionsMenuFlags";
import { EventsBrowseComponentStatusesFlags } from "@app/main/AppEventsBrowse/models/EventsBrowseComponentStatusesFlags";
import { SelectItem } from 'primeng/api';
import { EventsFilterTypesEnum } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-marketplace-events',
  templateUrl: './marketplace-events.component.html',
  styleUrls: ['./marketplace-events.component.scss']
})
export class MarketplaceEventsComponent  implements AfterViewInit {
    @ViewChild('EventBrowseComponent') eventBrowseComponent: EventsBrowseComponent
    constructor(
        private  _router : Router,
        private _activatedRoute : ActivatedRoute
    ) { }

    ngAfterViewInit(): void {
        const defaultMainFilter: EventsFilterTypesEnum = EventsFilterTypesEnum.UpcommingEvents
        const showMainFiltersOptions: boolean = true
        const pageMainFilters: SelectItem[] = [
            { label: "AllEvents", value: EventsFilterTypesEnum.AllEvents },
            { label: "UpcomingEvents", value: EventsFilterTypesEnum.UpcommingEvents },
            { label: "PriorEvents", value: EventsFilterTypesEnum.PriorEvents },
            { label: "MyEvents", value: EventsFilterTypesEnum.MyEvents }
        ]
        const filtersFlags :EventsBrowseComponentFiltersDisplayFlags = new EventsBrowseComponentFiltersDisplayFlags()
        const statusesFlags :EventsBrowseComponentStatusesFlags = new EventsBrowseComponentStatusesFlags()
        const actionsMenuFlags :EventsBrowseComponentActionsMenuFlags = new EventsBrowseComponentActionsMenuFlags()
        filtersFlags.showAll()
        statusesFlags.showAll()
        actionsMenuFlags.showAll()

        const title:string = "MarketPlaceProducts"
        const canView:boolean = true
        const canAdd:boolean = true
        const inputs : EventsBrowseInputs = {
            canAdd,
            canView,
            title,
            statusesFlags,
            filtersFlags,
            actionsMenuFlags,
            defaultMainFilter,
            showMainFiltersOptions,
            pageMainFilters
        }
        this.eventBrowseComponent.show(inputs)
    }

}
