import { Component, Injector, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreateOrEditEventComponent } from '@app/main/AppEvent/Components/create-or-edit-event.component';
import { ViewEventComponent } from '@app/main/AppEvent/Components/view-event.component';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountDto, AppEntitiesServiceProxy, AppEntityAttachmentDto, AppEventsServiceProxy, AppPostDto, AppPostsServiceProxy, CreateOrEditAppPostDto, EventsFilterTypesEnum, GetAppEventForViewDto, GetAppPostForViewDto, PostType, ProfileServiceProxy } from '@shared/service-proxies/service-proxies';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { debounceTime, finalize, tap } from 'rxjs/operators';
import { EventsBrowseActionsEvents, EventsBrowseInputs } from '../../models/Events-browse-inputs';
import { EventsBrowseComponentFiltersDisplayFlags } from "../../models/EventsBrowseComponentFiltersDisplayFlags";
import { EventsBrowseComponentActionsMenuFlags } from "../../models/EventsBrowseComponentActionsMenuFlags";
import { EventsBrowseComponentStatusesFlags } from "../../models/EventsBrowseComponentStatusesFlags";
import * as moment from 'moment';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { CreateorEditPostComponent } from '@app/main/posts/Components/createor-edit-post.component';
import { Observable } from 'rxjs';
import { SelectItem, LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { BreakpointObserver } from '@angular/cdk/layout';

import {
    ActivatedRoute,
    Router
} from '@angular/router';
@Component({
  selector: 'app-events-browse',
  templateUrl: './events-browse.component.html',
  styleUrls: ['./events-browse.component.scss'],
  animations: [appModuleAnimation()],
})
export class EventsBrowseComponent extends AppComponentBase  implements OnInit,OnChanges{
    singleItemPerRowMode: boolean = false;
    @ViewChild("createOrEditModal", { static: true }) createOrEditModal: CreateorEditPostComponent;
    @ViewChild("createOrEditEventModal", { static: true }) createOrEditEventModal: CreateOrEditEventComponent;
    @ViewChild("viewEventModal", { static: true }) viewEventModal: ViewEventComponent;
    @ViewChild("dataTable", { static: true }) dataTable: Table;
    @ViewChild("paginator", { static: true }) paginator: Paginator;
    active:boolean
    showConfirm: boolean = false;
    selectedItemId: number;
    selectedIndex: number;
    filterText = "";

    entityHistoryEnabled = false;

    items: GetAppEventForViewDto[] = [];
    sortingOptions: SelectItem[];

    // filters: AppItemListFilters = new AppItemListFilters();
    pageMainFilters: SelectItem[];
    noOfItemsToShowInitially: number = 20;
    itemsToLoad: number = 20;
    itemsToShow = [];
    skipCount: number = 0;
    maxResultCount: number = 20;
    isFullListDisplayed: boolean = false;
    lastFilterType: number
    defaultMainFilter : EventsFilterTypesEnum
    canAdd : boolean
    canView : boolean
    showMainFiltersOptions : boolean
    filtersFlags: EventsBrowseComponentFiltersDisplayFlags
    actionsMenuFlags :   EventsBrowseComponentActionsMenuFlags
    statusesFlags :  EventsBrowseComponentStatusesFlags
    title : string
    filterForm:FormGroup = this._fb.group({})
    get mainFilterCtrl () { return this.filterForm.get('filterType') }
    get searchCtrl () { return this.filterForm.get('search') }
    get sortingCtrl () { return this.filterForm.get('sorting') }
    get startDateCtrl () { return this.filterForm.get('startDate') }
    get endDateCtrl () { return this.filterForm.get('endDate') }
    totalCount:number
    @Input() fromMarketPlaceProfile :boolean =false;
    @Input() fromOverviewMarketPlaceProfile :boolean =false;
    @Input() accountDataForView :AccountDto;
    
    currentLang: string = 'en';
    isArabic: boolean = false;
    filterVisible :boolean=false

  isAuthenticated: boolean = false;

  private restoringFiltersFromUrl = false;

    constructor(
        injector: Injector,
        private _appEventsServiceProxy: AppEventsServiceProxy,
        private _fileDownloadService: FileDownloadService,
        private _postService: AppPostsServiceProxy,
        private _entitiesService: AppEntitiesServiceProxy,
        private _profileService : ProfileServiceProxy,
        private _fb : FormBuilder,
        private breakpointObserver: BreakpointObserver,
           private router: Router,
    private route: ActivatedRoute
    ) {
        super(injector);
    }

    initFilterForm(){
        this.filterForm = this._fb.group({
            search :[],
            filterType:[],
            sorting:[],
        })
    }

    fillFormFilters(){
        const flags = this.filtersFlags
        if(flags.timeZone){
            const timeZoneControl = this._fb.control(undefined)
            this.filterForm.addControl("timeZone",timeZoneControl)
        }
        if(flags.startDate){
            const StartDateControl = this._fb.control(undefined)
            this.filterForm.addControl("startDate",StartDateControl)
        }
        if(flags.startTime){
            const StartTimeControl = this._fb.control(undefined)
            this.filterForm.addControl("startTime",StartTimeControl)
        }
        if(flags.endDate){
            const EndtDateControl = this._fb.control(undefined)
            this.filterForm.addControl("endDate",EndtDateControl)
        }
        if(flags.endTime){
            const EndTimeControl = this._fb.control(undefined)
            this.filterForm.addControl("endTime",EndTimeControl)
        }
        if(flags.city){
            const CityControl = this._fb.control(undefined)
            this.filterForm.addControl("city",CityControl)
        }
        if(flags.postalCode){
            const PostalCodeControl = this._fb.control(undefined)
            this.filterForm.addControl("postalCode",PostalCodeControl)
        }
        if(flags.state){
            const StateControl = this._fb.control(undefined)
            this.filterForm.addControl("state",StateControl)
        }
        if(flags.isOnline){
            const EventTypeControl = this._fb.control(undefined)
            this.filterForm.addControl("isOnline",EventTypeControl)
        }
        if(flags.country){
          
          this.filterForm.addControl('countries', this._fb.control([]));
        }
        // if(flags.startDate && flags.endDate){
        //     // this.filterForm.setAsyncValidators()
        // }
        if (flags.startDate || flags.endDate) {
            const dateRangeCtrl = this._fb.control(undefined); // [Date, Date]
            this.filterForm.addControl('dateRange', dateRangeCtrl);
          }
          
    }

    ngOnInit(): void {
    this.isAuthenticated = !!this.appSession?.user;
        this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
        this.currentLang == 'ar' || this.currentLang == 'ar-EG'  ? this.isArabic = true : this.isArabic = false
        if(this.isAuthenticated){
        this.getProfilePicture();

        }
        this.getUserPreferenceForListView();
        this.initFilterForm()
        const sub = this.breakpointObserver
        .observe(['(max-width: 767.98px)'])
        .subscribe(res => (this.isMobile = res.matches));
        this.userName =
            this.appSession.user.name + " " + this.appSession.user.surname;
    }
    ngOnChanges(changes: SimpleChanges) {
        if (changes['accountDataForView']) {
            this.getFreshData();
          }
        }
    getProfilePicture(): void {
        const subs = this._profileService
            .getProfilePicture()
            .subscribe((result) => {
                if (result && result.profilePicture) {
                    this.profilePicture =
                        "data:image/jpeg;base64," + result.profilePicture;
                }
            });
        this.subscriptions.push(subs);
    }
    setMainPageFilter(filter:EventsFilterTypesEnum){
        const selectedfilter = this.pageMainFilters.filter(item=>filter == item.value)[0]
        if(!selectedfilter) return
        this.mainFilterCtrl.setValue(selectedfilter)
    }


    show(inputs: EventsBrowseInputs): void {

    this.defaultMainFilter =
        inputs.defaultMainFilter;

    this.canView =
        inputs.canView;

    this.canAdd =
        inputs.canAdd;

    this.pageMainFilters =
        inputs.pageMainFilters;

    this.filtersFlags =
        inputs.filtersFlags;

    this.statusesFlags =
        inputs.statusesFlags;

    this.actionsMenuFlags =
        inputs.actionsMenuFlags;

    this.title =
        inputs.title;

    this.showMainFiltersOptions =
        inputs.showMainFiltersOptions;

    this.defineSortingOptions();

    // Add dynamic controls first
    this.fillFormFilters();

    this.bindDateRangeToStartEnd();
    this.bindDateRangeToStartEndForForm(
        this.filterForm
    );
    this.setDefaultFilters();

    this.loadFiltersFromUrl();

    this.subscribeToFiltersChangeAndApplyFilteration();

    this.getFreshData();
}
private setDefaultFilters(): void {

    const selectedFilter =
        this.pageMainFilters?.find(
            x =>
                x.value ===
                this.defaultMainFilter
        );

    if (selectedFilter) {
        this.mainFilterCtrl?.setValue(
            selectedFilter,
            {
                emitEvent: false
            }
        );
    }

    if (
        this.sortingOptions?.length
    ) {
        this.sortingCtrl?.setValue(
            this.sortingOptions[0],
            {
                emitEvent: false
            }
        );
    }
}

setDefaultSorting(
    sorting: SelectItem
): void {

    this.sortingCtrl?.setValue(
        sorting
    );
}

private loadFiltersFromUrl(): void {

    const params =
        this.route.snapshot.queryParamMap;

    const hasUrlFilters =
        params.keys.length > 0;

    if (!hasUrlFilters) {
        return;
    }

    this.restoringFiltersFromUrl =
        true;

    try {

        const filterType =
            params.get('filterType');

        const search =
            params.get('search');

        const sorting =
            params.get('sorting');

        const isOnline =
            params.get('isOnline');

        const countries =
            this.parseNumberArray(
                params.get('countries')
            );

        const city =
            params.get('city');

        const state =
            params.get('state');

        const postalCode =
            params.get('postalCode');

        const fromDate =
            params.get('fromDate');

        const toDate =
            params.get('toDate');

   
        if (filterType !== null) {

            const selectedFilter =
                this.pageMainFilters
                    ?.find(
                        x =>
                            Number(x.value) ===
                            Number(filterType)
                    );

            if (selectedFilter) {

                this.mainFilterCtrl
                    ?.setValue(
                        selectedFilter,
                        {
                            emitEvent: false
                        }
                    );
            }
        }

        if (sorting) {

            const selectedSorting =
                this.sortingOptions
                    ?.find(
                        x =>
                            x.value ===
                            sorting
                    );

            if (selectedSorting) {

                this.sortingCtrl
                    ?.setValue(
                        selectedSorting,
                        {
                            emitEvent: false
                        }
                    );
            }
        }

        /*
         * Other controls
         */
        const patch: any = {};

        if (
            this.filterForm.get(
                'search'
            )
        ) {
            patch.search =
                search || undefined;
        }

        if (
            this.filterForm.get(
                'isOnline'
            )
        ) {

            patch.isOnline =
                isOnline === null
                    ? undefined
                    : isOnline === 'true';
        }

        if (
            this.filterForm.get(
                'countries'
            )
        ) {
            patch.countries =
                countries;
        }

        if (
            this.filterForm.get(
                'city'
            )
        ) {
            patch.city =
                city || undefined;
        }

        if (
            this.filterForm.get(
                'state'
            )
        ) {
            patch.state =
                state || undefined;
        }

        if (
            this.filterForm.get(
                'postalCode'
            )
        ) {
            patch.postalCode =
                postalCode || undefined;
        }

        /*
         * Dates
         */
        const startDate =
            fromDate
                ? new Date(
                    fromDate + 'T00:00:00'
                )
                : undefined;

        const endDate =
            toDate
                ? new Date(
                    toDate + 'T00:00:00'
                )
                : undefined;

        if (
            this.filterForm.get(
                'startDate'
            )
        ) {
            patch.startDate =
                startDate
                    ? moment(startDate).format(
                        moment.HTML5_FMT
                            .DATETIME_LOCAL
                    )
                    : undefined;
        }

        if (
            this.filterForm.get(
                'endDate'
            )
        ) {
            patch.endDate =
                endDate
                    ? moment(endDate).format(
                        moment.HTML5_FMT
                            .DATETIME_LOCAL
                    )
                    : undefined;
        }

        if (
            this.filterForm.get(
                'dateRange'
            )
        ) {
            patch.dateRange = [
                startDate,
                endDate
            ];
        }

        this.filterForm.patchValue(
            patch,
            {
                emitEvent: false
            }
        );

    } finally {

        this.restoringFiltersFromUrl =
            false;
    }
}
private parseNumberArray(
    value: string | null
): number[] {

    if (!value) {
        return [];
    }

    return value
        .split(',')
        .map(
            x => Number(x)
        )
        .filter(
            x => !isNaN(x)
        );
}

private updateFiltersInUrl(
    filters: any
): void {

    if (
        this.restoringFiltersFromUrl
    ) {
        return;
    }

    const dateRange =
        filters?.dateRange;

    const fromDate =
        dateRange?.[0]
            ? moment(
                dateRange[0]
            ).format(
                'YYYY-MM-DD'
            )
            : null;

    const toDate =
        dateRange?.[1]
            ? moment(
                dateRange[1]
            ).format(
                'YYYY-MM-DD'
            )
            : null;

    const queryParams: any = {

        filterType:
            filters
                ?.filterType
                ?.value ??
            null,

        search:
            filters?.search ||
            null,

        sorting:
            filters
                ?.sorting
                ?.value ??
            null,

        isOnline:
            typeof filters?.isOnline ===
                'boolean'
                ? filters.isOnline
                : null,

        countries:
            Array.isArray(
                filters?.countries
            ) &&
            filters.countries.length
                ? filters.countries
                    .join(',')
                : null,

        city:
            filters?.city ||
            null,

        state:
            filters?.state ||
            null,

        postalCode:
            filters?.postalCode ||
            null,

        fromDate,

        toDate
    };

    this.router.navigate(
        [],
        {
            relativeTo:
                this.route,

            queryParams,

            queryParamsHandling:
                'merge',

            replaceUrl:
                true
        }
    );
}
    yesterday = moment({second:0,millisecond:0,hours:0}).subtract(1, 'days')
    today = moment({second:0,millisecond:0,hours:0})
    dateErrorMessage:string
    isConfirming:boolean = false
   subscribeToFiltersChangeAndApplyFilteration() {

    this.filterForm.valueChanges
        .pipe(

            tap((value) => {

                if (value) {

                    const currentFilterType: number =
                        value.filterType?.value;

                    const startDate: Date =
                        value.startDate
                            ? new Date(
                                value.startDate
                            )
                            : undefined;

                    const startDateAsMoment:
                        moment.Moment =
                        startDate
                            ? moment({
                                day:
                                    startDate
                                        .getDate(),

                                month:
                                    startDate
                                        .getMonth(),

                                year:
                                    startDate
                                        .getFullYear(),

                                second: 0,
                                millisecond: 0,
                                hour: 0
                            })
                            : undefined;

                    const endDate: Date =
                        value.endDate
                            ? new Date(
                                value.endDate
                            )
                            : undefined;

                    const endDateAsMoment:
                        moment.Moment =
                        endDate
                            ? moment({
                                day:
                                    endDate
                                        .getDate(),

                                month:
                                    endDate
                                        .getMonth(),

                                year:
                                    endDate
                                        .getFullYear(),

                                second: 0,
                                millisecond: 0,
                                hour: 0
                            })
                            : undefined;

                    const lastFilterType =
                        this.lastFilterType;

                    if (
                        this.lastFilterType !==
                        currentFilterType
                    ) {

                        this.items = [];

                        this.loading = true;

                        this.lastFilterType =
                            currentFilterType;

                        const rangeCtrl =
                            this.filterForm
                                .get(
                                    'dateRange'
                                );

                        if (
                            currentFilterType ==
                            EventsFilterTypesEnum
                                .UpcommingEvents
                        ) {

                            rangeCtrl
                                ?.patchValue(
                                    [
                                        this.today
                                            .toDate(),
                                        undefined
                                    ],
                                    {
                                        emitEvent:
                                            true
                                    }
                                );

                        } else if (
                            currentFilterType ==
                            EventsFilterTypesEnum
                                .PriorEvents
                        ) {

                            rangeCtrl
                                ?.patchValue(
                                    [
                                        undefined,
                                        this.yesterday
                                            .toDate()
                                    ],
                                    {
                                        emitEvent:
                                            true
                                    }
                                );

                        } else {

                            if (
                                lastFilterType ==
                                    EventsFilterTypesEnum
                                        .UpcommingEvents &&
                                startDate &&
                                this.today.isSame(
                                    startDateAsMoment
                                )
                            ) {

                                this.startDateCtrl
                                    ?.patchValue(
                                        undefined
                                    );

                            } else if (
                                lastFilterType ==
                                    EventsFilterTypesEnum
                                        .PriorEvents &&
                                endDate &&
                                this.yesterday
                                    .isSame(
                                        endDateAsMoment
                                    )
                            ) {

                                this.endDateCtrl
                                    ?.patchValue(
                                        undefined
                                    );
                            }
                        }

                    } else {

                        if (
                            currentFilterType ==
                            EventsFilterTypesEnum
                                .UpcommingEvents
                        ) {

                            if (
                                startDate &&
                                this.today.isAfter(
                                    startDateAsMoment
                                )
                            ) {

                                this.isConfirming =
                                    true;

                                this.askToConfirm(
                                    this.l(
                                        'fromDateUpcomingEventsErroMessage'
                                    ),
                                    this.l(
                                        'Warning'
                                    ),
                                    {
                                        allowEscapeKey:
                                            false,

                                        allowOutsideClick:
                                            false
                                    }
                                )
                                    .subscribe(
                                        isConfirmed => {

                                            this.isConfirming =
                                                false;

                                            if (
                                                isConfirmed
                                            ) {

                                                this.setMainPageFilter(
                                                    EventsFilterTypesEnum
                                                        .AllEvents
                                                );

                                            } else {

                                                this.filterForm
                                                    .patchValue(
                                                        {
                                                            startDate:
                                                                this.today
                                                                    .format(
                                                                        moment
                                                                            .HTML5_FMT
                                                                            .DATETIME_LOCAL
                                                                    )
                                                        }
                                                    );
                                            }
                                        }
                                    );
                            }

                        } else if (
                            currentFilterType ==
                            EventsFilterTypesEnum
                                .PriorEvents
                        ) {

                            if (
                                endDate &&
                                this.yesterday
                                    .isBefore(
                                        endDateAsMoment
                                    )
                            ) {

                                this.isConfirming =
                                    true;

                                this.askToConfirm(
                                    this.l(
                                        'toDatePriorEventsErroMessage'
                                    ),
                                    this.l(
                                        'Warning'
                                    ),
                                    {
                                        allowEscapeKey:
                                            false,

                                        allowOutsideClick:
                                            false
                                    }
                                )
                                    .subscribe(
                                        isConfirmed => {

                                            this.isConfirming =
                                                false;

                                            if (
                                                isConfirmed
                                            ) {

                                                this.setMainPageFilter(
                                                    EventsFilterTypesEnum
                                                        .AllEvents
                                                );

                                            } else {

                                                this.filterForm
                                                    .patchValue(
                                                        {
                                                            startDate:
                                                                this.yesterday
                                                                    .format(
                                                                        moment
                                                                            .HTML5_FMT
                                                                            .DATETIME_LOCAL
                                                                    )
                                                        }
                                                    );
                                            }
                                        }
                                    );
                            }
                        }
                    }

                    if (
                        startDateAsMoment &&
                        endDateAsMoment &&
                        startDateAsMoment.isAfter(
                            endDateAsMoment
                        )
                    ) {

                        this.dateErrorMessage =
                            this.l(
                                'InvalidDateRangeError'
                            );

                    } else {

                        this.dateErrorMessage =
                            '';
                    }
                }
            }),

            debounceTime(700)
        )
        .subscribe((value) => {

            if (!value) {
                return;
            }

            if (
                this.isConfirming ||
                this.dateErrorMessage
            ) {
                return;
            }

            // THIS WAS MISSING
            this.updateFiltersInUrl(
                value
            );

            this.getFreshData();
        });
}
    resetPagination() {
        this.items = [];
        this.skipCount = 0;
        this.noOfItemsToShowInitially = this.maxResultCount;
    }
    // getFreshData() {
    //     this.resetPagination();
    //     this.getEvents();
    // }

    getFreshData(): void {

    /**
     * Clear current records while loading
     * a completely new filtered result.
     */
    this.items = [];

    /**
     * Reset custom paging variables.
     */
    this.skipCount = 0;

    this.noOfItemsToShowInitially =
        this.maxResultCount;

    /**
     * Reset PrimeNG paginator visually
     * to first page.
     *
     * Important:
     * don't call changePage(0) here because
     * it can trigger onPageChange/getEvents
     * and cause a duplicate API request.
     */
    if (this.paginator) {

        this.paginator.first = 0;

        this.paginator.rows =
            this.paginator.rows || 12;
    }

    /**
     * Call first page explicitly.
     *
     * Your paginator is configured with
     * 12 rows initially.
     */
    this.getEvents({
        first: 0,
        rows:
            this.paginator?.rows ||
            12
    });
}

    showMore() {
        this.getEvents();
    }
    defineSortingOptions() {
        this.sortingOptions = [
            { label: this.l("name"), value: "name asc" },
            { label: this.l("StartDateAsc"), value: "UTCFromDateTime asc" },
            { label: this.l("StartDateDesc"), value: "UTCFromDateTime desc" },
        ];
    }

    loading: boolean = false;
    getEvents(event?: LazyLoadEvent) {
        if ( isNaN(this.defaultMainFilter) ) return
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.totalRecords = 12;
            this.paginator.changePage(0);
            return;
        }
        const filters = this.filterForm.value
        this.primengTableHelper.showLoadingIndicator();
        this.showMainSpinner()
        this.loading = true
        const subs = this._appEventsServiceProxy
        .getAll(
            filters?.filterType?.value,
            filters?.search || undefined,
            typeof filters?.isOnline == 'boolean'? filters?.isOnline : undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            filters?.timeZone || undefined,
            undefined,
            filters?.startDate ? moment(filters.startDate,false) : undefined,
            filters?.endDate ? moment(filters.endDate,false) : undefined,
            undefined,
            undefined,
            filters?.startTime|| undefined,
            undefined,
            filters?.endTime|| undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            filters?.city || undefined,
            undefined,
            filters?.countries?.length ? filters?.countries : undefined,
            
            filters?.state || undefined,
            filters?.postalCode || undefined,
       
            this.accountDataForView?.tenantId ? this.accountDataForView?.tenantId : undefined,
                undefined,
                undefined,
            filters?.sorting.value ,
           
            this.primengTableHelper.getSkipCount(this.paginator, event) || 0,
            this.primengTableHelper.getMaxResultCount(this.paginator, event)
        )
        .pipe(
            finalize(() => {
                if (!this.active) this.active = true
                this.loading = false
                this.hideMainSpinner()
                this.primengTableHelper.hideLoadingIndicator();
            })
        )
        .subscribe((result) => {
            this.items  = result.items
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
        });
        this.subscriptions.push(subs)
    }

    createNewEvents() {
        if(!this.canAdd) return
        this.openCreateOrEditEventModal()
        // call show of create or edit event component
    }

    viewEvent(memberId:number,userId:number) {
        if(!this.canView) return
        // call show of view event component
    }

    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }
    handleSearchInput($event ){
        this.searchCtrl.setValue($event.target.value)
    }
    // resetList() {
    //     this.filterForm.reset()
    //     this.setMainPageFilter(this.defaultMainFilter)
    //     this.setDefaultSorting(this.sortingOptions[0].value)
    // }

    resetList(): void {

    this.filterForm.reset(
        {},
        {
            emitEvent: false
        }
    );

    const selectedFilter =
        this.pageMainFilters
            ?.find(
                x =>
                    x.value ===
                    this.defaultMainFilter
            );

    if (selectedFilter) {
        this.mainFilterCtrl
            ?.setValue(
                selectedFilter,
                {
                    emitEvent: false
                }
            );
    }

    if (
        this.sortingOptions?.length
    ) {
        this.sortingCtrl
            ?.setValue(
                this.sortingOptions[0],
                {
                    emitEvent: false
                }
            );
    }

    this.router.navigate(
        [],
        {
            relativeTo:
                this.route,

            queryParams: {
                filterType: null,
                search: null,
                sorting: null,
                isOnline: null,
                countries: null,
                city: null,
                state: null,
                postalCode: null,
                fromDate: null,
                toDate: null
            },

            queryParamsHandling:
                'merge',

            replaceUrl:
                true
        }
    );

    this.getFreshData();
}
    exportToExcel(): void {
        this._appEventsServiceProxy
            .getAppEventsToExcel(
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
                )
            .subscribe((result) => {
                this._fileDownloadService.downloadTempFile(result);
            });
    }

    saveUserPreferenceForListView() {
        const key = "events-list-view-mode";
        const value = String(Number(this.singleItemPerRowMode));
        localStorage.setItem(key, value);
    }
    getUserPreferenceForListView() {
        const key = "events-list-view-mode";
        const value = localStorage.getItem(key);
        if (value) this.singleItemPerRowMode = Boolean(Number(value));
    }
    triggerListView() {
        this.singleItemPerRowMode = !this.singleItemPerRowMode;
        this.saveUserPreferenceForListView();
    }
    openCreateOrEditEventModal(eventId?:number) {
        this.createOrEditEventModal.show(eventId, false);
    }
    openViewEvent($event: number) {
        this.viewEventModal.show($event, 0);
    }
    publishEvent(eventId:number,index:number){
        var isConfirmed: Observable<boolean>;
    isConfirmed   = this.askToConfirm(`AreYouSureYouWantToPublishThisEvent?`,"PublishEvent?",
    {
        confirmButtonText: this.l("Yes"),
        cancelButtonText: this.l("No"),
    });

   isConfirmed.subscribe((res)=>{
      if(res){
                    this.showMainSpinner()
                    this._appEventsServiceProxy.publish(eventId)
                    .pipe(
                        finalize(()=>{
                            this.hideMainSpinner()
                        })
                    )
                    .subscribe(res=>{
                        this.notify.success(this.l('PublishedSuccessfully'))
                        this.items[index].appEvent.isPublished = true
                    })
                }
            }
        );
    }
    profilePicture: String;

    unPublishEvent(eventId:number,index:number){
        var isConfirmed: Observable<boolean>;
    isConfirmed   = this.askToConfirm("AreYouSureYouWantToUnPublishThisEvent?","UnPublish",
    {
        confirmButtonText: this.l("Yes"),
        cancelButtonText: this.l("No"),
    });

   isConfirmed.subscribe((res)=>{
      if(res){
                    this.showMainSpinner()
                    this._appEventsServiceProxy.unPublish(eventId)
                    .pipe(
                        finalize(()=>{
                            this.hideMainSpinner()
                        })
                    )
                    .subscribe(res=>{
                        this.notify.success(this.l('UnPublishedSuccessfully'))
                        this.items[index].appEvent.isPublished = false
                    })
                }
            }
        );
    }
    deleteEvent(eventId:number,index:number){
        var isConfirmed: Observable<boolean>;
    isConfirmed   = this.askToConfirm("AreYouSureYouWantToPermanentlyDeleteThisEvent?","DeleteEvent?",
    {
        confirmButtonText: this.l("Yes"),
        cancelButtonText: this.l("No"),
    });

   isConfirmed.subscribe((res)=>{
      if(res){
                    this.showMainSpinner()
                    this._appEventsServiceProxy.delete(eventId)
                    .pipe(
                        finalize(()=>{
                            this.hideMainSpinner()
                        })
                    )
                    .subscribe(res=>{
                        this.notify.success(this.l('DeletedSuccessfully'))
                        this.items.splice(index, 1);
                    })
                }
            }
        );
    }
    eventHandler(event:EventsBrowseActionsEvents,id:number,index:number){
        if(event == EventsBrowseActionsEvents.View) this.openViewEvent(id)
        else if(event == EventsBrowseActionsEvents.Edit) this.openCreateOrEditEventModal(id)
        else if(event == EventsBrowseActionsEvents.Publish) this.publishEvent(id,index)
        else if(event == EventsBrowseActionsEvents.UnPublish) this.unPublishEvent(id,index)
        else if(event == EventsBrowseActionsEvents.Delete) this.deleteEvent(id,index)
    }
    fromViewEvent:boolean=false;
    relatedEntityId: number = 0;
    typeFile: PostType;
    userName: String;

    oncreatePostEvent($event: any,fromViewEvent:boolean) {
        this.fromViewEvent=fromViewEvent;
        var getAppPostForViewDto: GetAppPostForViewDto =
            new GetAppPostForViewDto();
        getAppPostForViewDto.type = PostType.SINGLEIMAGE;
        this.typeFile = PostType.SINGLEIMAGE;
        getAppPostForViewDto.appPost = new AppPostDto();

        var eventType = "";
        if ($event.isOnLine) eventType = "Online";
        else eventType = "in Person";

        var userName = "";
        if ($event.userName) userName = $event.userName;
        else userName = this.userName.toString();

        getAppPostForViewDto.appPost.description =
            $event.name +
            "\n" +
            "Event by " +
            userName +
            "\n" +
            eventType +
            "\n" +
            $event.fromDate.format("MMM D ,Y").toString() +
            " , " +
            $event.fromTime.format("HH:mm").toString() +
            " - " +
            $event.toDate.format("MMM D ,Y").toString() +
            " , " +
            $event.toTime.format("HH:mm").toString();

        this.relatedEntityId = $event.entityId;
        this._entitiesService
            .getAppEntityAttachmentsWithPaging(
                $event.entityId,
                undefined,
                undefined,
                undefined
            )
            .subscribe((result) => {
                getAppPostForViewDto.attachments = result.items;
                this.onshowCreateOrEdit(getAppPostForViewDto);
            });
    }
    onshowCreateOrEdit($event) {
        this.createOrEditModal.show(
            $event,
            this.typeFile,
            this.relatedEntityId
        );
    }
    onTypeFile($event) {
        this.typeFile = $event;
    }
    attachmets: any[] = [];
    AttachmentInfoDto: AppEntityAttachmentDto[] = [];

    onCreateOrEditPost($event: GetAppPostForViewDto) {
        this.showMainSpinner();
        this.attachmets = $event.attachments;
        this.createOrEditPost($event);
    }

    createOrEditPost($event: GetAppPostForViewDto) {
        const post = new CreateOrEditAppPostDto();
        post.attachments = $event.attachments
        post.description = $event.appPost.description;
        post.type = $event.type;
        post.urlTitle = $event.urlTitle;
        post.relatedEntityId = this.relatedEntityId;

        const subs = this._postService
            .createOrEdit(post)
            .pipe(
                finalize(() => {
                    this.hideMainSpinner()
                    this.createOrEditModal.hideModal();
                    this.relatedEntityId = 0;
                })
            )
            .subscribe((result) => {
                this.notify.info(this.l("Postsuccessful"));
            });
        this.subscriptions.push(subs);
    }
    showEventModal($event: boolean) {
        if (this.fromViewEvent) this.viewEventModal.showModal();
        this.fromViewEvent=false;
        this.relatedEntityId=0;
    }

    private bindDateRangeToStartEnd(): void {
        const rangeCtrl = this.filterForm.get('dateRange');
        if (!rangeCtrl) return;
      
        const sub = rangeCtrl.valueChanges.subscribe((range: Date[]) => {
          const start = range?.[0] ?? undefined;
          const end = range?.[1] ?? undefined;
      
          this.filterForm.patchValue(
            {
              startDate: start ? moment(start).format(moment.HTML5_FMT.DATETIME_LOCAL) : undefined,
              endDate: end ? moment(end).format(moment.HTML5_FMT.DATETIME_LOCAL) : undefined,
            },
            { emitEvent: false } 
          );
        });
      
        this.subscriptions.push(sub);
      }

      mobileFiltersVisible = false;
mobileFilterForm: FormGroup;
isMobile = false; 


closeMobileFilters(apply: boolean): void {
  if (apply) {
    // apply temp values to real form
    this.filterForm.patchValue(this.mobileFilterForm.getRawValue(), { emitEvent: true });
  }
  this.mobileFiltersVisible = false;
}

resetMobileFilters(): void {
  this.mobileFilterForm.reset();
  
  const selectedfilter = this.pageMainFilters?.find(x => x.value === this.defaultMainFilter);
  if (selectedfilter) this.mobileFilterForm.get('filterType')?.setValue(selectedfilter);

  if (this.sortingOptions?.length) {
    this.mobileFilterForm.get('sorting')?.setValue(this.sortingOptions[0].value);
  }
}

private bindDateRangeToStartEndForForm(form: FormGroup): void {
    const rangeCtrl = form.get('dateRange');
    if (!rangeCtrl) return;
  
    const sub = rangeCtrl.valueChanges.subscribe((range: Date[]) => {
      const start = range?.[0] ?? undefined;
      const end = range?.[1] ?? undefined;
  
      form.patchValue(
        {
          startDate: start ? moment(start).format(moment.HTML5_FMT.DATETIME_LOCAL) : undefined,
          endDate: end ? moment(end).format(moment.HTML5_FMT.DATETIME_LOCAL) : undefined,
        },
        { emitEvent: false }
      );
    });
  
    this.subscriptions.push(sub);
  }
  
  openMobileFilters(ev?: Event): void {
    ev?.preventDefault();
    ev?.stopPropagation();
  
    this.mobileFilterForm = this._fb.group({});
    Object.keys(this.filterForm.controls).forEach((key) => {
      this.mobileFilterForm.addControl(
        key,
        this._fb.control(this.filterForm.get(key)?.value)
      );
    });
  
    this.bindDateRangeToStartEndForForm(this.mobileFilterForm);
  
    this.mobileFiltersVisible = true;
  }

  toggleFilter(): void {
    this.filterVisible = !this.filterVisible;

}
  
}
