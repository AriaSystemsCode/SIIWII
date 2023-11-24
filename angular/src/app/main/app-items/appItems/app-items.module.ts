import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppItemsRoutingModule } from './app-items-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FileUploadModule, PaginatorModule, EditorModule, MultiSelectModule,  TableModule, TreeModule, AccordionModule, SelectButtonModule, InputNumberModule } from 'primeng';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { CategoriesModule } from '@app/categories/categories.module';
import { ClassificationModule } from '@app/classification/classification.module';
import { AppItemTypeModule } from '@app/app-item-type/app-item-type.module';
import { AppEntityDynamicModalModule } from '@app/app-entity-dynamic-modal/app-entity-dynamic-modal.module';
import { AppItemSharedModule } from '../app-item-shared/app-item-shared.module';
import { ExtraAttributeDataService } from '../app-item-shared/services/extra-attribute-data.service';
import { CreateEditAppItemVariationsComponent } from './components/create-edit-app-item-variations.component';
import { CreateOrEditAppItemComponent } from './components/create-or-edit-app-item.component';
import { VariationsMetaInfoComponent } from './components/variations-meta-info.component';
import { PublishAppItemListingService } from '../app-item-shared/services/publish-app-item-listing.service';
import { PublishService } from '../app-item-shared/services/publish.service';
import { AppitemListPublishService } from '../app-items-list/services/appitem-list-publish.service';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MyItemViewComponent } from './components/my-item-view.component';
import { AppItemViewModule } from '../app-item-view/app-item-view.module';
import { AppItemsBrowseModule } from '../app-items-browse/app-items-browse.module';
import { SharedFormsComponentsModule } from '@shared/components/shared-forms-components/shared-forms-components.module';
import { MyAppItemsComponent } from './components/my-app-items.component';
import {  BulkImportModule } from '../../../../shared/components/import-steps/bulk-import.module';
import { AppitemsCatalogueReportModule } from '../appitems-catalogue-report/appitems-catalogue-report.module';

@NgModule({
  declarations: [
    CreateOrEditAppItemComponent,
    CreateEditAppItemVariationsComponent,
    VariationsMetaInfoComponent,
    MyItemViewComponent,
    MyAppItemsComponent,
  ],
  imports: [
    CommonModule,
    AppItemsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AppCommonModule,
    UtilsModule,
    FileUploadModule,
    PaginatorModule,
    TabsModule.forRoot(),
    EditorModule,
    MultiSelectModule,
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TableModule,
    ModalModule,
    TreeModule,
    AccordionModule,
    CategoriesModule,
    ClassificationModule,
    AppItemTypeModule,
    SelectButtonModule,
    AppEntityDynamicModalModule,
    AppItemSharedModule,
    AppItemViewModule,
    AppItemsBrowseModule,
    SharedFormsComponentsModule,
    InputNumberModule,
    BulkImportModule,
    AppitemsCatalogueReportModule
  ],
  providers:[
    ExtraAttributeDataService,
    PublishService,
    PublishAppItemListingService,
    AppitemListPublishService
  ],
})
export class AppItemsModule { }

