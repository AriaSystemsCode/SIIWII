import {
    Component,
    EventEmitter,
    Injector,
    OnInit,
    Output,
    ViewChild,
} from "@angular/core";
// import { GoogleMapComponent } from "@app/shared/common/GoogleMap/google-map/google-map.component";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    AppEventDto,
    AppEventGuestsServiceProxy,
    AppEventsServiceProxy,
    CreateOrEditAppEventGuestDto,
    GetAppEventForViewDto,
    ResponceType,
    SycAttachmentCategoryDto,
} from "@shared/service-proxies/service-proxies";
import * as moment from "moment";
import { ModalDirective } from "ngx-bootstrap/modal";
import { finalize } from "rxjs/operators";

@Component({
    selector: "app-view-event",
    templateUrl: "./view-event.component.html",
    styleUrls: ["./view-event.component.scss"],
})
export class ViewEventComponent extends AppComponentBase implements OnInit {
    @ViewChild("viewEventModal", { static: true }) modal: ModalDirective;
    /* @ViewChild("googleMapModal", { static: true })
    googleMapModal: GoogleMapComponent; */
    @Output() createPostEvent = new EventEmitter<AppEventDto>();
    event: GetAppEventForViewDto = new GetAppEventForViewDto();
    eventAddress: string = "";
    eventId: number;
    idFilter: number;
    entityIdFilter: number;
    responceType = ResponceType;
    _responceType: ResponceType;
    showResponse: boolean = false;
    timezoneOffset: number;
    logoDefaultImage = "../../../assets/placeholders/_logo-placeholder.png"
    coverDefaultImage = "../../../assets/placeholders/_default_cover.jpg"
    sycAttachmentCategoryLogo :SycAttachmentCategoryDto
    sycAttachmentCategoryBanner :SycAttachmentCategoryDto
    logoPhoto : string
    coverPhoto : string
    // displayStatus:boolean=false;
    public constructor(
        private _appEventsServiceProxy: AppEventsServiceProxy,
        private _appEventGuestsAppService: AppEventGuestsServiceProxy,
        injector: Injector
    ) {
        super(injector);
    }

    ngOnInit(){
        this.getAllAttachmentCategories()
    }

    ngOnDestroy() {
        this.unsubscribeToAllSubscriptions();
    }

    showModal() {
        this.modal.show();
    }
    show(idFilter: number, entityIdFilter: number ) {
        this.eventId = idFilter;
        this.idFilter = idFilter;
        this.entityIdFilter = entityIdFilter;
        this.showMainSpinner();

        const subs = this._appEventsServiceProxy
            .getAppEventForView(this.idFilter,this.entityIdFilter, moment.tz.guess() )
            .pipe(finalize(() => this.hideMainSpinner()))
            .subscribe((result) => {

                this.event = result;
                // if(this.event?.appEvent?.userId==abp.session?.userId)
                //     this.displayStatus = true;
                //    else
                //    this.displayStatus = false; 

                if (!this.event.appEvent.code) {
                    if (this.appSession.tenantId)
                        this.event.appEvent.code = 'Event' + this.appSession.tenantId + moment(this.event.appEvent.fromDate.toDate()).format("ddd,MMM-D,YYYY-HH:mm A");
                    else
                        this.event.appEvent.code = 'Event' + moment(this.event.appEvent.fromDate.toDate()).format("ddd,MMM-D,YYYY-HH:mm A");
                }
                this.eventId = result.appEvent.id;
                if(this.event?.appEvent?.logoURL) this.logoPhoto = this.attachmentBaseUrl + '/' + this.event?.appEvent?.logoURL;
                if(this.event?.appEvent?.banarURL) this.coverPhoto = this.attachmentBaseUrl + '/' + this.event?.appEvent?.banarURL;
            
                if (!this.event.appEvent.isOnLine) this.getAddressDetails();
                this.getTimezoneOffset();

                    this._responceType = this.event?.currentUserResponce;
                this.showModal();
            });
        this.subscriptions.push(subs);
    }
    hide() {
        this.showResponse=false;
        this.modal.hide();
    }

    getAddressDetails() {
        this.eventAddress="";
        this.eventAddress += this.event.appEvent?.address1
            ? this.eventAddress != ""
                ? " - " + this.event.appEvent?.address1
                : this.event.appEvent?.address1
            : "";
        this.eventAddress += this.event.appEvent?.address2
            ? this.eventAddress != ""
                ? " - " + this.event.appEvent?.address2
                : this.event.appEvent?.address2
            : "";
        this.eventAddress += this.event.appEvent?.city
            ? this.eventAddress != ""
                ? " - " + this.event.appEvent?.city
                : this.event.appEvent?.city
            : "";
        this.eventAddress += this.event.appEvent?.state
            ? this.eventAddress != ""
                ? " - " + this.event.appEvent?.state
                : this.event.appEvent?.state
            : "";
        this.eventAddress += this.event.appEvent?.postal
            ? this.eventAddress != ""
                ? " - " + this.event.appEvent?.postal
                : this.event.appEvent?.postal
            : "";
        this.eventAddress += this.event.appEvent?.country
            ? this.eventAddress != ""
                ? " - " + this.event.appEvent?.country
                : this.event.appEvent?.country
            : "";
    }

    getTimezoneOffset() {
        this.timezoneOffset = new Date().getTimezoneOffset();
    }
    /* showAddressOnMap() {
        this.googleMapModal.show(this.eventAddress);
    } */

    createPost() {
        this.hide();
        this.createPostEvent.emit(this.event.appEvent);
    }
    editEventGuestsResponce() {

        if (this._responceType == ResponceType.GOING)
            this.event.appEvent.guestsCount += 1;
        else {
            if (this.event.appEvent.guestsCount > 0)
                this.event.appEvent.guestsCount -= 1;
        }


        this.event.currentUserResponce = this._responceType;
        var createOrEditAppEventGuestDto: CreateOrEditAppEventGuestDto =
            new CreateOrEditAppEventGuestDto();
        createOrEditAppEventGuestDto.eventId = this.eventId;
        createOrEditAppEventGuestDto.userResponce = this._responceType;
        createOrEditAppEventGuestDto.code=this.event.appEvent.code;
        const subs = this._appEventGuestsAppService
            .createOrEdit(createOrEditAppEventGuestDto)
            .subscribe((result) => {

                const _subs = this._appEventsServiceProxy
                    .getAppEventForView(this.idFilter,this.entityIdFilter,moment.tz.guess())
                    .pipe(finalize(() => this.hideMainSpinner()))
                    .subscribe((result) => {
                        this.event.appEvent.guestsCount =
                            result.appEvent.guestsCount;
                        this.event.currentUserResponce =
                            result.currentUserResponce;
                    });
                this.subscriptions.push(_subs);
            });

        this.subscriptions.push(subs);
    }
    getAllAttachmentCategories() {
        this.getSycAttachmentCategoriesByCodes(['LOGO',"BANNER"]).subscribe((result)=>{
            result.forEach(item=>{
                if(item.code == "LOGO") this.sycAttachmentCategoryLogo = item
                else if(item.code == "BANNER") this.sycAttachmentCategoryBanner = item
            })
        })

    }
}
