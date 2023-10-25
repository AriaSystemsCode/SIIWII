import {
    Component,
    EventEmitter,
    Injector,
    Input,
    Output,
    ViewChild,
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { AppConsts } from "@shared/AppConsts";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    AppItemsListDto,
    AppItemsListsServiceProxy,
    AppItemsServiceProxy,
    GetAppItemForViewDto,
} from "@shared/service-proxies/service-proxies";
import { AppItemsBrowseComponentActionsMenuFlags, AppItemsBrowseComponentStatusesFlags } from "../models/app-item-browse-inputs.model";
import { AppItemBrowseEvents } from "../models/appItems-browse-events";
import { ActionsMenuEventEmitter } from "../models/ActionsMenuEventEmitter";
import { BrowseMode } from "../models/BrowseModeEnum";

@Component({
    selector: "app-item-card",
    templateUrl: "./app-item-card.component.html",
    styleUrls: ["./app-item-card.component.scss"],
    providers: [AppItemsServiceProxy, AppItemsListsServiceProxy],
})
export class AppItemCardComponent extends AppComponentBase {
    @Input() item: GetAppItemForViewDto;
    @Input() filterForm: FormGroup;
    @Input() singleItemPerRowMode: boolean;
    @Input() actionsMenuFlags:AppItemsBrowseComponentActionsMenuFlags
    @Input() statusesFlags:AppItemsBrowseComponentStatusesFlags
    @Input() browseMode:BrowseMode
    @Output() eventTriggered: EventEmitter<ActionsMenuEventEmitter<AppItemBrowseEvents>> = new EventEmitter<ActionsMenuEventEmitter<AppItemBrowseEvents>>();

    AppItemBrowseEvents = AppItemBrowseEvents
    selectedList: AppItemsListDto;
    attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
    BrowseModeEnum = BrowseMode
    get mainFilterCtrl() { return this.filterForm.get('filterType') }

    constructor(
        injector: Injector,
    ) {
        super(injector);
    }

    eventHandler($event:ActionsMenuEventEmitter<AppItemBrowseEvents>){
        console.log(">>", 'publish')
        switch ($event.event) {
            case AppItemBrowseEvents.PublishListing:
                this.item.appItem.published = true;
                break;
            case AppItemBrowseEvents.UnPublishListing:
                this.item.appItem.published = false;
                this.notify.success(this.l("UnPublishedSuccessfully"));
                break;
        }
        this.eventTriggered.emit($event);
    }
    viewItemHandler(){
        this.eventHandler({ event:AppItemBrowseEvents.View, data:this.item.appItem.id })
    }
    handleSelection($event){
        const isChecked = $event.checked
        this.eventHandler({ event: isChecked ? AppItemBrowseEvents.Select : AppItemBrowseEvents.UnSelect, data:this.item })
    }
}
