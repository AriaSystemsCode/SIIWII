import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import CountoModule from 'angular2-counto';
import { BsDatepickerConfig, BsDatepickerModule, BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TreeviewModule } from 'ngx-treeview';
import { PaginatorModule, MultiSelectModule, DropdownModule, TableModule, TreeTableModule, TabMenuModule, TreeModule, CheckboxModule } from 'primeng';
import {  BulkImportModule } from '../../../../shared/components/import-steps/bulk-import.module';
import { AccountCardComponent } from './components/account-card.component';
import { AccountsListFiltersComponent } from './components/accounts-list-filters.component';
import { AccountsComponent } from './components/accounts.component';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';
import { FiltersSharedModule } from '@app/shared/filters-shared/filters-shared.module';
import { EmailingTemplateServiceProxy } from '@shared/service-proxies/service-proxies';


@NgModule({
    declarations: [
        AccountsComponent,
        AccountsListFiltersComponent,
        AccountCardComponent
    ],
    imports: [
        CommonModule,
        AppCommonModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule.forRoot(),
        TabsModule.forRoot(),
        TreeviewModule.forRoot(),
        PaginatorModule,
        MultiSelectModule,
        DropdownModule,
        TableModule,
        TreeTableModule,
        TabMenuModule,
        UtilsModule,
        CountoModule,
        BsDatepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        TreeModule,
        CheckboxModule,
       BulkImportModule,
        FiltersSharedModule
    ],
    providers: [
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale },
        EmailingTemplateServiceProxy
    ],
    exports: [
        AccountsComponent,
        AccountsListFiltersComponent,
        AccountCardComponent
    ]
})
export class AccountSharedModule { }
