import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppitemListSelectionModalComponent } from './components/appitem-list-selection-modal.component';
import { CreateOrEditAppitemListComponent } from './components/create-or-edit-appitem-list.component';
import { ShareListingComponent } from './components/share-listing.component';
import { SuccessRightModalComponent } from './components/success-right-modal.component';
import { VariationsSelectionModalComponent } from './components/variations-selection-modal.component';
import { UtilsModule } from '@shared/utils/utils.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { AppitemsActionsMenuComponent } from './components/appitems-actions-menu.component';
import { PublishAppItemListingService } from './services/publish-app-item-listing.service';
import { AppitemListPublishService } from '../app-items-list/services/appitem-list-publish.service';
import { PublishService } from './services/publish.service';
import { SizeScaleComponent } from './components/size-scale.component';
import { AdvancedPricingComponent } from './components/advanced-pricing.component';
import { SizeRatioComponent } from './components/size-ratio/size-ratio.component';
@NgModule({
  declarations: [
    AppitemListSelectionModalComponent,
    CreateOrEditAppitemListComponent,
    ShareListingComponent,
    SuccessRightModalComponent,
    VariationsSelectionModalComponent,
    AppitemsActionsMenuComponent,
    AdvancedPricingComponent,
    SizeScaleComponent,
    SizeRatioComponent
],
imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UtilsModule,
    AppCommonModule,
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    DropdownModule,
    CheckboxModule
  ],
  exports:[
    AppitemListSelectionModalComponent,
    CreateOrEditAppitemListComponent,
    ShareListingComponent,
    SuccessRightModalComponent,
    VariationsSelectionModalComponent,
    AppitemsActionsMenuComponent,
    AdvancedPricingComponent,
    SizeScaleComponent,
    SizeRatioComponent
  ],
  providers:[
    PublishAppItemListingService,
    AppitemListPublishService,
    PublishService
  ]
})
export class AppItemSharedModule { }
