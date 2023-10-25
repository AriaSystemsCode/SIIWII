import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { AppItemSharedModule } from '../app-item-shared/app-item-shared.module';
import { AppItemCardComponent } from './components/app-item-card.component';
import { AppItemsFiltersComponent } from './components/appItems-filters.component';
import { AppItemsComponent } from './components/appItems.component';
import { RouterModule } from '@angular/router';
import { FiltersSharedModule } from '@app/shared/filters-shared/filters-shared.module';
import { ExtraAttributeDataService } from '../app-item-shared/services/extra-attribute-data.service';
import {  BulkImportModule } from '../../../../shared/components/import-steps/bulk-import.module';
import { AppItemsBrowseModalComponent } from './components/app-items-browse-modal.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AccordionModule } from 'primeng/accordion';
import { PaginatorModule } from 'primeng/paginator';
import { TreeModule } from 'primeng/tree';
import { InputSwitchModule } from 'primeng/inputswitch';

@NgModule({
    declarations: [
        AppItemCardComponent,
        AppItemsFiltersComponent,
        AppItemsComponent,
        AppItemsBrowseModalComponent
    ],
    imports: [
        CommonModule,
        AppCommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        UtilsModule,
        BsDropdownModule.forRoot(),
        TreeModule,
        AccordionModule,
        AppItemSharedModule,
        FiltersSharedModule,
        PaginatorModule,
        BulkImportModule,
        ModalModule.forRoot(),
        InputSwitchModule
    ],
    exports : [
        AppItemsComponent,
        AppItemsBrowseModalComponent
    ],
    providers:[
        ExtraAttributeDataService
    ]
})
export class AppItemsBrowseModule { }
