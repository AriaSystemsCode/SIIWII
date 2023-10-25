import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateOrEditEventComponent } from '@app/main/AppEvent/Components/create-or-edit-event.component';
import { ViewEventComponent } from '@app/main/AppEvent/Components/view-event.component';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppEntitiesServiceProxy, AppEntityAttachmentDto, AppEventsServiceProxy, AppPostDto, AppPostsServiceProxy, AttachmentsCategories, CreateOrEditAppPostDto, EventsFilterTypesEnum, GetAppEventForViewDto, GetAppPostForViewDto, PostType, ProfileServiceProxy } from '@shared/service-proxies/service-proxies';
import { FileDownloadService } from '@shared/utils/file-download.service';

//import { Observable } from 'rxjs';
import { SelectItem, LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { debounceTime, finalize, tap } from 'rxjs/operators';
import { NewsBrowseActionsEvents, NewsBrowseInputs } from '../../models/News-browse-inputs';
import { NewsBrowseComponentFiltersDisplayFlags } from "../../models/NewsBrowseComponentFiltersDisplayFlags";
import { NewsBrowseComponentActionsMenuFlags } from "../../models/NewsBrowseComponentActionsMenuFlags";
import { NewsBrowseComponentStatusesFlags } from "../../models/NewsBrowseComponentStatusesFlags";
import { PostCardComponent } from "../../../posts/Components/post-card.component";
import { ViewPostComponent } from "../../../posts/Components/view-post.component";
import * as moment from 'moment';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { CreateorEditPostComponent } from '@app/main/posts/Components/createor-edit-post.component';
import { FileUploaderCustom } from '@shared/components/import-steps/models/FileUploaderCustom.model';
import { AppConsts } from '@shared/AppConsts';
import { FileUploaderOptions } from 'ng2-file-upload';
import { Observable } from 'rxjs';
import { DateFormValidations } from '@shared/utils/validation/date-form-validation.directive';
import Swal from "sweetalert2/dist/sweetalert2.js";

@Component({
  selector: 'app-news-browse',
  templateUrl: './news-browse.component.html',
  styleUrls: ['./news-browse.component.scss'],
  animations: [appModuleAnimation()],
})
export class NewsBrowseComponent extends AppComponentBase {
    singleItemPerRowMode: boolean = true;
    @ViewChild("createOrEditModal", { static: true }) createOrEditModal: CreateorEditPostComponent;
    @ViewChild("createOrEditEventModal", { static: true }) createOrEditEventModal: CreateOrEditEventComponent;
    @ViewChild("viewEventModal", { static: true }) viewEventModal: ViewEventComponent;
    @ViewChild("dataTable", { static: true }) dataTable: Table;
    @ViewChild("paginator", { static: true }) paginator: Paginator;
    @ViewChild("viewPostModal", { static: true }) viewPostModal: ViewPostComponent;

    
    active:boolean
    showConfirm: boolean = false;
    selectedItemId: number;
    selectedIndex: number;
    filterText = "";

    entityHistoryEnabled = false;

    //items: GetAppEventForViewDto[] = [];
    items: GetAppPostForViewDto[] = [];
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
    filtersFlags: NewsBrowseComponentFiltersDisplayFlags
    actionsMenuFlags :   NewsBrowseComponentActionsMenuFlags
    statusesFlags :  NewsBrowseComponentStatusesFlags
    title : string
    filterForm:FormGroup = this._fb.group({})
    get mainFilterCtrl () { return this.filterForm.get('filterType') }
    get searchCtrl () { return this.filterForm.get('search') }
    get sortingCtrl () { return this.filterForm.get('sorting') }
    get startDateCtrl () { return this.filterForm.get('startDate') }
    get endDateCtrl () { return this.filterForm.get('endDate') }
    totalCount:number
    constructor(
        injector: Injector,
        private _appEventsServiceProxy: AppEventsServiceProxy,
        private _fileDownloadService: FileDownloadService,
        private _postService: AppPostsServiceProxy,
        private _entitiesService: AppEntitiesServiceProxy,
        private _profileService : ProfileServiceProxy,
        private _router: Router,
        private _fb : FormBuilder
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

        onshowViewPost($event) {
        this.viewPostModal.show($event);
    }
    onshowCreateOrEdit($event) {
        this.createOrEditModal.show(
            $event,
            this.typeFile,
            this.relatedEntityId
        );
    }

    ondeletePost($event: GetAppPostForViewDto, index: number) {
        Swal.fire({
            title: "Remove this news",
            text: "Are you sure you want to permanently remove this news?",
            showCancelButton: true,
            cancelButtonText: "No",
            imageUrl: "../assets/posts/deletePost.svg",
            imageWidth: 70,
            imageHeight: 70,
            confirmButtonText: "Yes",
            allowOutsideClick: false,
            allowEscapeKey: false,
            backdrop: true,
            customClass: {
                confirmButton: "swal-btn swal-confirm",
                cancelButton: "swal-btn",
                title: "swal-title",
            },
        }).then((result) => {
            if (result.isConfirmed) {
                const subs = this._postService
                    .delete($event.appPost.id)
                    .subscribe((result) => {
                        this.items.splice(index, 1);
                        this.itemsToShow.splice(index, 1);
                        this.items = [...this.items];
                        this.itemsToShow = [...this.itemsToShow];
                        this.notify.info("News successfully deleted.");
                    });
                this.subscriptions.push(subs);
            }
        });
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
        // if(flags.startDate && flags.endDate){
        //     // this.filterForm.setAsyncValidators()
        // }
    }

    ngOnInit(): void {
        this.getProfilePicture();
        this.getUserPreferenceForListView();
        this.initFilterForm()
        this.userName =
            this.appSession.user.name + " " + this.appSession.user.surname;
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

    show(inputs:NewsBrowseInputs){
        this.defaultMainFilter   =  inputs.defaultMainFilter
        this.canView  =  inputs.canView
        this.canAdd  =  inputs.canAdd
        this.pageMainFilters  =  inputs.pageMainFilters
        this.filtersFlags  =  inputs.filtersFlags
        this.statusesFlags  =  inputs.statusesFlags
        this.actionsMenuFlags  =  inputs.actionsMenuFlags
        this.title = inputs.title
        this.showMainFiltersOptions = inputs.showMainFiltersOptions
        this.subscribeToFiltersChangeAndApplyFilteration();
        this.defineSortingOptions();
        this.fillFormFilters()
        this.setMainPageFilter(this.defaultMainFilter)
        this.setDefaultSorting(this.sortingOptions[0].value)
    }

    setDefaultSorting(sorting:string){
        this.sortingCtrl.setValue(sorting)
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
                        const currentFilterType: number = value.filterType?.value;
                        const startDate : Date = value.startDate ? new Date(value.startDate) : undefined;
                        const startDateAsMoment : moment.Moment = startDate ? moment({ day:startDate.getDate(), month:startDate.getMonth(), year:startDate.getFullYear(), second:0, millisecond:0, hour:0 }) : undefined
                        const endDate : Date = value.endDate ? new Date(value.endDate) : undefined;
                        const endDateAsMoment : moment.Moment = endDate ? moment({ day:endDate.getDate(), month:endDate.getMonth(), year:endDate.getFullYear(), second:0, millisecond:0, hour:0 }) : undefined
                        const lastFilterType = this.lastFilterType
                        if (this.lastFilterType !== currentFilterType) {
                            this.items = [];
                            this.loading = true
                            this.lastFilterType = currentFilterType;

                            if(currentFilterType == EventsFilterTypesEnum.UpcommingEvents) {
                                //this.startDateCtrl.patchValue( this.today.format(moment.HTML5_FMT.DATETIME_LOCAL))
                                this.startDateCtrl.patchValue( undefined)
                                this.endDateCtrl.patchValue( undefined )
                            }
                            else if(currentFilterType == EventsFilterTypesEnum.PriorEvents){
                                this.startDateCtrl.patchValue( undefined)
                                this.endDateCtrl.patchValue( this.yesterday.format(moment.HTML5_FMT.DATETIME_LOCAL) )
                            } else {
                                if( lastFilterType == EventsFilterTypesEnum.UpcommingEvents && startDate && this.today.isSame(startDateAsMoment) ) this.startDateCtrl.patchValue( undefined)
                                else if( lastFilterType == EventsFilterTypesEnum.PriorEvents && endDate && this.yesterday.isSame(endDateAsMoment) ) this.endDateCtrl.patchValue( undefined)
                            }
                        } else {
                            
                        }

                        if(startDateAsMoment && endDateAsMoment && startDateAsMoment.isAfter(endDateAsMoment) ) {
                            this.dateErrorMessage = this.l("InvalidDateRangeError")
                        } else {
                            this.dateErrorMessage = ''
                        }
                    }
                }),
                debounceTime(1500)
            )
            .subscribe((value) => {
                if (value) {
                    if(this.isConfirming || this.dateErrorMessage) return
                    this.getFreshData();
                }
            });

    }
    resetPagination() {
        this.items = [];
        this.skipCount = 0;
        this.noOfItemsToShowInitially = this.maxResultCount;
    }
    getFreshData() {
        this.resetPagination();
        this.getEvents();
    }

    showMore() {
        this.getEvents();
    }
    defineSortingOptions() {
        this.sortingOptions = [
            { label: this.l("PostTitle"), value: "SORTBYTITLE" },
            { label: this.l("DateAscending"), value: "SORTBYDATEASC" },
            { label: this.l("DateDescending"), value: "SORTBYDATEDESC" },
            { label: this.l("ViewsAscending"), value: "SORTBYVIEWSASC" },
            { label: this.l("ViewsDescending"), value: "SORTBYVIEWSDESC" },
        ];
    }

    loading: boolean = false;
    getEvents(event?: LazyLoadEvent) {
        if ( isNaN(this.defaultMainFilter) ) return
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.totalRecords = 10;
            this.paginator.changePage(0);
            return;
        }
        const filters = this.filterForm.value
        this.primengTableHelper.showLoadingIndicator();
        this.showMainSpinner()
        this.loading = true
     /*   const subs = this._appEventsServiceProxy
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
            filters?.state || undefined,
            filters?.postalCode || undefined,
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
        this.subscriptions.push(subs) */

        const subs = this._postService  .getAll(
            filters?.search || undefined,
            undefined,
            undefined,
            PostType.NEWSDIGEST,
            filters?.startDate ? moment(filters.startDate,false) : undefined,
            filters?.endDate ? moment(filters.endDate,false) : undefined,
            undefined,
            undefined,
            0,
            filters?.sorting.value,
            this.primengTableHelper.getSkipCount(this.paginator, event) || 0,
            this.primengTableHelper.getMaxResultCount(this.paginator, event)
        ) .pipe(
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
    resetList() {
        this.filterForm.reset()
        this.setMainPageFilter(this.defaultMainFilter)
        this.setDefaultSorting(this.sortingOptions[0].value)
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
                        //this.items[index].appEvent.isPublished = true
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
                        //this.items[index].appEvent.isPublished = false
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
                        //this.items.splice(index, 1);
                    })
                }
            }
        );
    }
    eventHandler(event:NewsBrowseActionsEvents,id:number,index:number){
        if(event == NewsBrowseActionsEvents.View) this.openViewEvent(id)
        else if(event == NewsBrowseActionsEvents.Edit) this.openCreateOrEditEventModal(id)
        else if(event == NewsBrowseActionsEvents.Publish) this.publishEvent(id,index)
        else if(event == NewsBrowseActionsEvents.UnPublish) this.unPublishEvent(id,index)
        else if(event == NewsBrowseActionsEvents.Delete) this.deleteEvent(id,index)
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
    /*onshowCreateOrEdit($event) {
        this.createOrEditModal.show(
            $event,
            this.typeFile,
            this.relatedEntityId
        );
    }*/

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
}
