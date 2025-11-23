import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { EventsBrowseComponent } from '@app/main/AppEventsBrowse/components/events-browse/events-browse.component';
import { EventsBrowseInputs } from '@app/main/AppEventsBrowse/models/Events-browse-inputs';
import { EventsBrowseComponentActionsMenuFlags } from '@app/main/AppEventsBrowse/models/EventsBrowseComponentActionsMenuFlags';
import { EventsBrowseComponentFiltersDisplayFlags } from '@app/main/AppEventsBrowse/models/EventsBrowseComponentFiltersDisplayFlags';
import { EventsBrowseComponentStatusesFlags } from '@app/main/AppEventsBrowse/models/EventsBrowseComponentStatusesFlags';
import { AccountDto, EventsFilterTypesEnum } from '@shared/service-proxies/service-proxies';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-events-tab',
  templateUrl: './events-tab.component.html',
  styleUrls: ['./events-tab.component.scss']
})
export class EventsTabComponent implements AfterViewInit {

  @ViewChild('EventBrowseComponent') eventBrowseComponent: EventsBrowseComponent;
  @Input() accountDataForView: AccountDto;
  @Input() fromOverviewMarketPlaceProfile: boolean;



  ngAfterViewInit(): void {
    const defaultMainFilter: EventsFilterTypesEnum = EventsFilterTypesEnum.UpcommingEvents  //  "Business Accounts"
    const showMainFiltersOptions: boolean = true
    const pageMainFilters: SelectItem[] = [
      { label: "AllEvents", value: EventsFilterTypesEnum.AllEvents },
      { label: "UpcomingEvents", value: EventsFilterTypesEnum.UpcommingEvents },
      { label: "PriorEvents", value: EventsFilterTypesEnum.PriorEvents },
      { label: "MyEvents", value: EventsFilterTypesEnum.MyEvents }
    ]
    const filtersFlags: EventsBrowseComponentFiltersDisplayFlags = new EventsBrowseComponentFiltersDisplayFlags()
    const statusesFlags: EventsBrowseComponentStatusesFlags = new EventsBrowseComponentStatusesFlags()
    const actionsMenuFlags: EventsBrowseComponentActionsMenuFlags = new EventsBrowseComponentActionsMenuFlags()
    filtersFlags.showAll()
    statusesFlags.showAll()
    actionsMenuFlags.showAll()

    const title: string = ""
    const canView: boolean = true
    const canAdd: boolean = false
    const inputs: EventsBrowseInputs = {
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
