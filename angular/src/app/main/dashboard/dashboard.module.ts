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
import { CardModule } from 'primeng/card';
import { InputSwitchModule } from "primeng/inputswitch";
import { GridsterModule } from 'angular-gridster2';
import { CalendarModule } from 'primeng/calendar';
import { TabViewModule } from 'primeng/tabview';
import { OverlayPanelModule } from 'primeng/overlaypanel';

import {
    PivotViewModule
} from '@syncfusion/ej2-angular-pivotview';



@NgModule({
    declarations: [
        DashboardBrowseComponent,
        DashboardDetailComponent,
   
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
        CardModule,
                InputSwitchModule,   // <-- you used <p-inputSwitch>
              
                GridsterModule,
                CalendarModule,
                TabViewModule,
                OverlayPanelModule,
                PivotViewModule
         
    ],
    providers: [
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale },
         
    ],
    exports: [
     
    ]
})
export class DashboardModule { }
