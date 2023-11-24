import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppItemsComponent } from '@app/main/app-items/app-items-browse/components/appItems.component';
import { AppItemsBrowseComponentFiltersDisplayFlags, AppItemsBrowseComponentStatusesFlags, AppItemsBrowseComponentActionsMenuFlags, AppItemsBrowseInputs } from '@app/main/app-items/app-items-browse/models/app-item-browse-inputs.model';
import { AppItemBrowseEvents } from '@app/main/app-items/app-items-browse/models/appItems-browse-events';
import { ActionsMenuEventEmitter } from "@app/main/app-items/app-items-browse/models/ActionsMenuEventEmitter";
import { ItemsFilterTypesEnum } from '@shared/service-proxies/service-proxies';
import { SelectItem } from 'primeng';
import { BrowseMode } from '@app/main/app-items/app-items-browse/models/BrowseModeEnum';

@Component({
  selector: 'app-marketplace-products',
  templateUrl: './marketplace-products.component.html',
  styleUrls: ['./marketplace-products.component.scss']
})
export class MarketplaceProductsComponent implements AfterViewInit {
    @ViewChild('AppItemsBrowseComponent') appItemsBrowseComponent: AppItemsComponent
    constructor(
        private  _router : Router,
        private _activatedRoute : ActivatedRoute
    ) { }

    ngAfterViewInit(): void {
        const defaultMainFilter: ItemsFilterTypesEnum = ItemsFilterTypesEnum.SharedWithMeAndPublic
        const showMainFiltersOptions: boolean = true
        const pageMainFilters: SelectItem[] = [
            { label: "Public", value: ItemsFilterTypesEnum.Public },
            { label: "SharedWithMe", value: ItemsFilterTypesEnum.SharedWithMe },
            { label: "SharedWithMeAndPublic", value: ItemsFilterTypesEnum.SharedWithMeAndPublic },
        ]
        const filtersFlags :AppItemsBrowseComponentFiltersDisplayFlags = new AppItemsBrowseComponentFiltersDisplayFlags()
        const statusesFlags :AppItemsBrowseComponentStatusesFlags = new AppItemsBrowseComponentStatusesFlags()
        const actionsMenuFlags :AppItemsBrowseComponentActionsMenuFlags= new AppItemsBrowseComponentActionsMenuFlags()
        filtersFlags.search = true
        filtersFlags.sorting = true
        filtersFlags.appItemType = true
        filtersFlags.extraAttributes = true
        filtersFlags.departments = true
        statusesFlags.allIsHidden = true
        actionsMenuFlags.allIsHidden = true

        const title:string = "MarketPlaceProducts"
        const canView:boolean = true
        const canAdd:boolean = false
        const browseMode = BrowseMode.View
        const inputs : AppItemsBrowseInputs = {
            canAdd,
            canView,
            title,
            statusesFlags,
            filtersFlags,
            actionsMenuFlags,
            defaultMainFilter,
            showMainFiltersOptions,
            pageMainFilters,
            browseMode
        }
        this.appItemsBrowseComponent.show(inputs)
    }
    viewProductHandler($event:ActionsMenuEventEmitter<AppItemBrowseEvents,number>){
        if($event.event != AppItemBrowseEvents.View) return
        this._router.navigateByUrl(this._router.createUrlTree(['../view',$event.data], {relativeTo: this._activatedRoute}))
    }

}
