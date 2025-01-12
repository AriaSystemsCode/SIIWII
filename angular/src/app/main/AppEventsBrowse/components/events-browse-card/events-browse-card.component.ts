import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountDto, AppPostsServiceProxy, EventsFilterTypesEnum, GetAppEventForViewDto } from '@shared/service-proxies/service-proxies';
import { EventsBrowseActionsEvents } from '../../models/Events-browse-inputs';
import { EventsBrowseComponentActionsMenuFlags } from "../../models/EventsBrowseComponentActionsMenuFlags";
import { EventsBrowseComponentStatusesFlags } from "../../models/EventsBrowseComponentStatusesFlags";
import { EventsBrowseActionsMenuComponent } from '../events-browse-actions-menu/events-browse-actions-menu.component';

@Component({
  selector: 'app-events-browse-card',
  templateUrl: './events-browse-card.component.html',
  styleUrls: ['./events-browse-card.component.scss']
})
export class EventsBrowseCardComponent extends AppComponentBase implements OnChanges {

    @ViewChild("EventsBrowseActionsMenuComponent", { static: true }) eventsBrowseActionsMenuComponent: EventsBrowseActionsMenuComponent;
    @Input() item: GetAppEventForViewDto;
    @Input() filterForm: FormGroup;
    @Input() singleItemPerRowMode: boolean;
    @Input()  actionsMenuFlags:EventsBrowseComponentActionsMenuFlags
    @Input()  statusesFlags:EventsBrowseComponentStatusesFlags
    @Output() triggerEvent: EventEmitter<EventsBrowseActionsEvents> = new EventEmitter<EventsBrowseActionsEvents>();
    EventsFilterTypesEnum = EventsFilterTypesEnum
    EventsBrowseActionsEvents = EventsBrowseActionsEvents
    @Input() fromMarketPlaceProfile :boolean =false;
    eventAddress="";
    profilePicture:string ="";

    get mainFilterCtrl() { return this.filterForm.get('filterType') }
    constructor(
        injector: Injector,
        private _postService:AppPostsServiceProxy
    ) {
        super(injector);
    }

    ngOnChanges(changes: SimpleChanges) {
        this.getAddressDetails();
        this.getProfilePictureById(this.item?.appEvent?.profilePictureId);
    }

    getProfilePictureById(id: string) {
    this._postService
            .getProfilePictureAllByID(id)
            .subscribe((data) => {
                if (data.profilePicture) {
                    this.profilePicture =
                        "data:image/jpeg;base64," + data.profilePicture;
                }
            });
    }


    _triggerEvent(event:EventsBrowseActionsEvents) {
        this.triggerEvent.emit(event);
    }

    getAddressDetails() :string {
        this.eventAddress="";
        this.eventAddress += this.item.appEvent?.address1
            ? this.eventAddress != ""
                ? " - " + this.item.appEvent?.address1
                : this.item.appEvent?.address1
            : "";
        this.eventAddress += this.item.appEvent?.address2
            ? this.eventAddress != ""
                ? " - " + this.item.appEvent?.address2
                : this.item.appEvent?.address2
            : "";
        this.eventAddress += this.item.appEvent?.city
            ? this.eventAddress != ""
                ? " - " + this.item.appEvent?.city
                : this.item.appEvent?.city
            : "";
        this.eventAddress += this.item.appEvent?.state
            ? this.eventAddress != ""
                ? " - " + this.item.appEvent?.state
                : this.item.appEvent?.state
            : "";
        this.eventAddress += this.item.appEvent?.postal
            ? this.eventAddress != ""
                ? " - " + this.item.appEvent?.postal
                : this.item.appEvent?.postal
            : "";
        this.eventAddress += this.item.appEvent?.country
            ? this.eventAddress != ""
                ? " - " + this.item.appEvent?.country
                : this.item.appEvent?.country
            : "";

            return  this.eventAddress =  this.eventAddress ? this.eventAddress : "online ask for the link";
    }
}
