import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppCommonModule } from "@app/shared/common/app-common.module";
import { SycEntityObjectTypeSycIdentifierDefinitionLookupTableModalComponent } from './systemObjects/sycEntityObjectTypes/sycEntityObjectType-sycIdentifierDefinition-lookup-table-modal.component';
import { SycAttachmentTypesComponent } from './systemObjects/sycAttachmentTypes/sycAttachmentTypes.component';
import { ViewSycAttachmentTypeModalComponent } from './systemObjects/sycAttachmentTypes/view-sycAttachmentType-modal.component';
import { CreateOrEditSycAttachmentTypeModalComponent } from './systemObjects/sycAttachmentTypes/create-or-edit-sycAttachmentType-modal.component';

import { AutoCompleteModule } from "primeng/autocomplete";
import { PaginatorModule } from "primeng/paginator";
import { EditorModule } from "primeng/editor";
import { InputMaskModule } from "primeng/inputmask";
import { FileUploadModule } from "primeng/fileupload";
import { TableModule } from "primeng/table";
import { TreeTableModule } from "primeng/treetable";

import { UtilsModule } from "@shared/utils/utils.module";
import { CountoModule } from "angular2-counto";
import { ModalModule } from "ngx-bootstrap/modal";
import { TabsModule } from "ngx-bootstrap/tabs";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { PopoverModule } from "ngx-bootstrap/popover";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { MainRoutingModule } from "./main-routing.module";
import { NgxChartsModule } from "@swimlane/ngx-charts";

import {
    BsDatepickerConfig,
    BsDaterangepickerConfig,
    BsLocaleService,
} from "ngx-bootstrap/datepicker";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { NgxBootstrapDatePickerConfigService } from "assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service";
import { TabMenuModule } from "primeng/tabmenu";
import { TreeModule } from "primeng/tree";
import { MultiSelectModule } from "primeng/multiselect";
import { DropdownModule } from "primeng/dropdown";
import { Ng2TelInputModule } from "ng2-tel-input";
import { NgImageSliderModule } from "ng-image-slider";
import { TreeviewModule } from "ngx-treeview";
import { eventsModule } from "./AppEvent/events.module";;
import { SycLandingPageSettingsModule} from './SycLandingPageSettings/SycLandingPageSettings.module'
;

NgxBootstrapDatePickerConfigService.registerNgxBootstrapDatePickerLocales();

@NgModule({
    imports: [
        CommonModule,
        MainRoutingModule,
        TreeModule,
        eventsModule,
        ModalModule.forRoot(),
        TabsModule.forRoot(),
        TooltipModule.forRoot(),
        TreeviewModule.forRoot(),
        FileUploadModule,
        AutoCompleteModule,
        PaginatorModule,
        EditorModule,
        MultiSelectModule,
        DropdownModule,
        InputMaskModule,
        TableModule,
        TreeTableModule,
        TabMenuModule,
        Ng2TelInputModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule,
        TabsModule,
        TooltipModule,
        AppCommonModule,
        UtilsModule,
        CountoModule,
        NgxChartsModule,
        NgImageSliderModule,
        BsDatepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        PopoverModule.forRoot(),
        SycLandingPageSettingsModule,
    ],
    declarations: [
        SycEntityObjectTypeSycIdentifierDefinitionLookupTableModalComponent,
        DashboardComponent,
        SycAttachmentTypesComponent,
        ViewSycAttachmentTypeModalComponent,
        CreateOrEditSycAttachmentTypeModalComponent,
        DashboardComponent
    ],
    exports: [
        CommonModule,
        MainRoutingModule,
        TreeModule,
        FileUploadModule,
        AutoCompleteModule,
        PaginatorModule,
        EditorModule,
        MultiSelectModule,
        DropdownModule,
        InputMaskModule,
        TableModule,
        TreeTableModule,
        TabMenuModule,
        Ng2TelInputModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule,
        TabsModule,
        TooltipModule,
        AppCommonModule,
        UtilsModule,
        CountoModule,
        NgxChartsModule,
        NgImageSliderModule,
    ],
    providers: [
        {
            provide: BsDatepickerConfig,
            useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig,
        },
        {
            provide: BsDaterangepickerConfig,
            useFactory:
                NgxBootstrapDatePickerConfigService.getDaterangepickerConfig,
        },
        {
            provide: BsLocaleService,
            useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale,
        },
    ],
})
export class MainModule {}
