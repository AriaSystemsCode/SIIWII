import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppItemsListRoutingModule } from './app-items-list-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AppItemListListComponent } from './components/app-item-list-list.component';
import { AppItemListCardComponent } from './components/app-item-list-card.component';
import { EditItemListingListComponent } from './components/edit-item-listing-list.component';
import { ItemListItemCardComponent } from './components/item-list-item-card.component';
import { ViewItemListingListComponent } from './components/view-item-listing-list.component';
import { ExtraAttributeDataService } from '../app-item-shared/services/extra-attribute-data.service';
import { PublishService } from '../app-item-shared/services/publish.service';
import { PublishAppItemListingService } from '../app-item-shared/services/publish-app-item-listing.service';
import { AppitemListPublishService } from './services/appitem-list-publish.service';
import { PaginatorModule, TableModule } from 'primeng';
import { AppItemsBrowseModule } from '../app-items-browse/app-items-browse.module';
import { AppItemSharedModule } from '../app-item-shared/app-item-shared.module';

@NgModule({
  declarations:
    [
        AppItemListListComponent,
        AppItemListCardComponent,
        EditItemListingListComponent,
        ItemListItemCardComponent,
        ViewItemListingListComponent
    ],
  imports: [
    CommonModule,
    AppItemsListRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AppCommonModule,
    UtilsModule,
    PaginatorModule,
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    TableModule,
    ModalModule,
    AppItemSharedModule,
    AppItemsBrowseModule
  ],
  providers:[
      ExtraAttributeDataService,
      PublishService,
      PublishAppItemListingService,
      AppitemListPublishService
    ]
})
export class AppItemsListModule { }
