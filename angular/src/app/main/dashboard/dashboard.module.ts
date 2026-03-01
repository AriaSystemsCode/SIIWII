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
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';
import { EmailingTemplateServiceProxy } from '@shared/service-proxies/service-proxies';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { TreeModule } from 'primeng/tree';
import { TreeTableModule } from 'primeng/treetable';
import { DashboardBrowseComponent } from './components/DashboardBrowse/dashboard-browse.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DashboardDetailComponent } from './components/dashboard-deatail/dashboard-detail.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ChartWidgetCardComponent } from './components/widgit-card/chart-widget-card.component';
import { WidgetOutletComponent } from './components/widget-outlet/widget-outlet.component';
import { WidgetConfigModalComponent } from './components/widget-config-modal/widget-config-modal.component';
import { FilterBuilderComponent } from './components/filter-builder/filter-builder.component';
import { CardModule } from 'primeng/card';
import { InputSwitchModule } from "primeng/inputswitch";
import { NgxEchartsModule } from 'ngx-echarts';
import { GridsterModule } from 'angular-gridster2';
import { AddWidgetPickerComponent } from './components/add-widget-picker/add-widget-picker.component';
import { CalendarModule } from 'primeng/calendar';

@NgModule({
    declarations: [
        DashboardBrowseComponent,
        DashboardDetailComponent,
        ChartWidgetCardComponent,
        WidgetOutletComponent ,
        WidgetConfigModalComponent,
        FilterBuilderComponent,
        AddWidgetPickerComponent
    ],
    imports: [
        CommonModule,
        AppCommonModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule.forRoot(),
        TabsModule.forRoot(),
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
        DashboardRoutingModule,
        ToastModule, 
        ConfirmDialogModule,
        ButtonModule,
        MenuModule,
        DialogModule,
        InputTextModule,
        InputTextareaModule,
        DropdownModule,
        CheckboxModule,
        TooltipModule,
        OverlayPanelModule,
        CardModule,
                InputSwitchModule,   // <-- you used <p-inputSwitch>
                NgxEchartsModule.forRoot({ echarts: () => import('echarts') }),
                GridsterModule,
                CalendarModule

    ],
    providers: [
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale },
        EmailingTemplateServiceProxy
    ],
    exports: [
        ChartWidgetCardComponent,
        WidgetOutletComponent ,
        WidgetConfigModalComponent,
        FilterBuilderComponent
    ]
})
export class DashboardModule { }
