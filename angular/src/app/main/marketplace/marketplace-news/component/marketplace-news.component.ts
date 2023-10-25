import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventsFilterTypesEnum } from '@shared/service-proxies/service-proxies';

import { NewsBrowseComponent } from '@app/main/AppNewsBrowse/components/news-browse/news-browse.component';
import { NewsBrowseInputs } from '@app/main/AppNewsBrowse/models/News-browse-inputs';
import { NewsBrowseComponentFiltersDisplayFlags } from "@app/main/AppNewsBrowse/models/NewsBrowseComponentFiltersDisplayFlags";
import { NewsBrowseComponentActionsMenuFlags } from "@app/main/AppNewsBrowse/models/NewsBrowseComponentActionsMenuFlags";
import { NewsBrowseComponentStatusesFlags } from "@app/main/AppNewsBrowse/models/NewsBrowseComponentStatusesFlags";
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-marketplace-news',
  templateUrl: './marketplace-news.component.html',
  styleUrls: ['./marketplace-news.component.scss']
})
export class MarketplaceNewsComponent  implements AfterViewInit {
    @ViewChild('EventBrowseComponent') newsBrowseComponent: NewsBrowseComponent
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
        const filtersFlags :NewsBrowseComponentFiltersDisplayFlags = new NewsBrowseComponentFiltersDisplayFlags()
        const statusesFlags :NewsBrowseComponentStatusesFlags = new NewsBrowseComponentStatusesFlags()
        const actionsMenuFlags :NewsBrowseComponentActionsMenuFlags = new NewsBrowseComponentActionsMenuFlags()
        filtersFlags.showAll()
        statusesFlags.showAll()
        actionsMenuFlags.showAll()

        const title:string = "MarketPlaceProducts"
        const canView:boolean = true
        const canAdd:boolean = true
        const inputs : NewsBrowseInputs = {
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
        this.newsBrowseComponent.show(inputs)
    }

}
