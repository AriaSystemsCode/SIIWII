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
import {  BulkImportModule } from '../../../../shared/components/import-steps/bulk-import.module';
import { AccountCardComponent } from './components/account-card/account-card.component';
import { AccountsListFiltersComponent } from './components/accounts-list-filters/accounts-list-filters.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';
import { FiltersSharedModule } from '@app/shared/filters-shared/filters-shared.module';
import { CreateMarketplaceAccountServiceProxy, EmailingTemplateServiceProxy } from '@shared/service-proxies/service-proxies';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { TreeModule } from 'primeng/tree';
import { TreeTableModule } from 'primeng/treetable';
import { DialogModule } from 'primeng/dialog';
import { AccountSectionsComponent } from './components/account-sections/account-sections.component';
import { EntityShellModule } from '@app/shared/entity-shell/entity-shell.module';
import { AccordionModule } from "primeng/accordion";
import { SharedDynamicInputsModule } from '@shared/shared-module';


@NgModule({
    declarations: [
        AccountsComponent,
        AccountsListFiltersComponent,
        AccountCardComponent,
        AccountSectionsComponent
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
        FiltersSharedModule,
        DialogModule,
        EntityShellModule,
        AccordionModule,
        SharedDynamicInputsModule
    ],
    providers: [
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale },
        EmailingTemplateServiceProxy,
        CreateMarketplaceAccountServiceProxy
    ],
    exports: [
        AccountsComponent,
        AccountsListFiltersComponent,
        AccountCardComponent,
        AccountSectionsComponent
    ]
})
export class AccountSharedModule { }
