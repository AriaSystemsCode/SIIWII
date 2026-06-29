import { Component, Injector, Input, OnChanges, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FilterMetaData } from '@app/shared/filters-shared/models/FilterMetaData.model';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    AppEntitiesServiceProxy,
  DisplayNameValueDto,
  EventsFilterTypesEnum,
  LookupLabelDto,
  TimeZoneInfoServiceProxy
} from '@shared/service-proxies/service-proxies';
import { SelectItem } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { EventsBrowseComponentFiltersDisplayFlags } from '../../models/EventsBrowseComponentFiltersDisplayFlags';

@Component({
  selector: 'app-events-browse-filters',
  templateUrl: './events-browse-filters.component.html',
  styleUrls: ['./events-browse-filters.component.scss']
})
export class EventsBrowseFiltersComponent extends AppComponentBase implements OnInit, OnChanges {
  @Input() filterForm: FormGroup;
  @Input() filtersFlags: EventsBrowseComponentFiltersDisplayFlags;
  @Input() dateErrorMessage: string;

  loading = false;
  ItemsFilterTypesEnum = EventsFilterTypesEnum;

  timeZonesFilterMetaData: FilterMetaData<SelectItem[]>;
  publishStatusFilterMetaData: FilterMetaData<SelectItem[]>;
  eventTypeStatusFilterMetaData: FilterMetaData<SelectItem[]>;

  /** safe getters (no crash if filterForm undefined) */
  get mainFilterCtrl() { return this.filterForm?.get('filterType'); }
  get startDateCtrl() { return this.filterForm?.get('startDate'); }
  get endDateCtrl() { return this.filterForm?.get('endDate'); }

  private mainFilterSubAdded = false;

  constructor(
    injector: Injector,
    private _timeZoneInfoServiceProxy: TimeZoneInfoServiceProxy,
           private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.timeZonesFilterMetaData = new FilterMetaData<DisplayNameValueDto[]>({ list: [] });
    this.publishStatusFilterMetaData = new FilterMetaData<SelectItem[]>({ list: [] });
    this.eventTypeStatusFilterMetaData = new FilterMetaData<SelectItem[]>({ list: [] });
    this.countryFilterMetaData = new FilterMetaData<LookupLabelDto[]>({
        list: [],
        displayedList: [],
        listSkipCount: 0,
        listMaxResultCount: 10,
        listTotalCount: 0,
        collapsedDisplayedListCount: 10,
      });
    
  }

  ngOnChanges(): void {

    const ctrl = this.mainFilterCtrl;
    if (!ctrl || this.mainFilterSubAdded) return;

 
    this.mainFilterSubAdded = true;

    const sub = ctrl.valueChanges.subscribe(() => {
      this.publishStatusFilterMetaData.list = [];
      this.eventTypeStatusFilterMetaData.list = [];


      this.filterForm?.patchValue(
        {
          publishStatus: undefined,
          eventTypeStatus: undefined,
        },
        { emitEvent: false }
      );
    });

    this.subscriptions.push(sub);
  }

  getTimeZonesList(componentRef: { onListLoadCallback: Function }) {
    this.loading = true;

    const subs = this._timeZoneInfoServiceProxy.getTimeZonesList()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((result) => {
        const callBackResult: { items: any[]; totalCount?: number } = {
          items: result,
          totalCount: result.length,
        };
        componentRef.onListLoadCallback(callBackResult);
      });

    this.subscriptions.push(subs);
  }

  getEventTypeOptionsList(componentRef: { onListLoadCallback: Function }) {
    const items = [
      { label: this.l('All'), value: undefined },
      { label: this.l('Online'), value: true },
      { label: this.l('InPerson'), value: false },
    ];

    const result: { items: any[]; totalCount?: number } = {
      items,
      totalCount: items.length,
    };

    componentRef.onListLoadCallback(result);
  }

  getPublishOptionsList(componentRef: { onListLoadCallback: Function }) {
    const items = [
      { label: this.l('All'), value: 0 },
      { label: this.l('Published'), value: 1 },
      { label: this.l('NotPublished'), value: 2 },
    ];

    const result: { items: any[]; totalCount?: number } = {
      items,
      totalCount: items.length,
    };

    componentRef.onListLoadCallback(result);
  }

  countryFilterMetaData :FilterMetaData<LookupLabelDto[]>
  countryFilter: string | undefined;
  getCountriesList(componentRef: { onListLoadCallback: Function }) {
    const subs = this._appEntitiesServiceProxy.getAllCountryForTableDropdowWithPaging(
        this.countryFilter,   undefined,
        undefined, undefined, undefined, undefined, undefined, undefined, undefined,
        undefined,
        undefined,
        this.countryFilterMetaData.listSkipCount,
        this.countryFilterMetaData.listMaxResultCount,
    ).subscribe(result => {
        componentRef.onListLoadCallback(result);
    });
    this.subscriptions.push(subs);
  }

  
  onLookupSearch(q: string, kind: any, componentRef: any) {
  const query = q?.trim() || undefined;

  if (kind === 'country') {
    this.countryFilter = query;
    this.countryFilterMetaData.listSkipCount = 0;
    this.countryFilterMetaData.list = [];
    this.countryFilterMetaData.displayedList = [];
    this.getCountriesList(componentRef);
  }
}


}
