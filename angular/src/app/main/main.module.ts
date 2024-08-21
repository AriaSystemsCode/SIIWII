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
import { AppSubscriptionPlanHeadersComponent } from "./appSubScriptionPlan/appSubscriptionPlanHeaders/appSubscriptionPlanHeaders.component";
import { ViewAppSubscriptionPlanHeaderModalComponent } from "./appSubScriptionPlan/appSubscriptionPlanHeaders/view-appSubscriptionPlanHeader-modal.component";
import { CreateOrEditAppSubscriptionPlanHeaderModalComponent } from "./appSubScriptionPlan/appSubscriptionPlanHeaders/create-or-edit-appSubscriptionPlanHeader-modal.component";
import { MasterDetailChild_AppSubscriptionPlanHeader_AppSubscriptionPlanDetailsComponent } from "@app/admin/appSubScriptionPlan/appSubscriptionPlanDetails/masterDetailChild_AppSubscriptionPlanHeader_appSubscriptionPlanDetails.component";
import { CreateOrEditAppSubscriptionPlanDetailModalComponent } from "@app/admin/appSubScriptionPlan/appSubscriptionPlanDetails/create-or-edit-appSubscriptionPlanDetail-modal.component";
import { ViewAppSubscriptionPlanDetailModalComponent } from "@app/admin/appSubScriptionPlan/appSubscriptionPlanDetails/view-appSubscriptionPlanDetail-modal.component";
import { MasterDetailChild_AppSubscriptionPlanHeader_ViewAppSubscriptionPlanDetailModalComponent } from "@app/admin/appSubScriptionPlan/appSubscriptionPlanDetails/masterDetailChild_AppSubscriptionPlanHeader_view-appSubscriptionPlanDetail-modal.component";
import { MasterDetailChild_AppSubscriptionPlanHeader_CreateOrEditAppSubscriptionPlanDetailModalComponent } from "@app/admin/appSubScriptionPlan/appSubscriptionPlanDetails/masterDetailChild_AppSubscriptionPlanHeader_create-or-edit-appSubscriptionPlanDetail-modal.component";
import { AppSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModalComponent } from "@app/admin/appSubScriptionPlan/appSubscriptionPlanDetails/appSubscriptionPlanDetail-appSubscriptionPlanHeader-lookup-table-modal.component";
import { AppSubscriptionPlanDetailsComponent } from "@app/admin/appSubScriptionPlan/appSubscriptionPlanDetails/appSubscriptionPlanDetails.component";
import { AppTenantSubscriptionPlansComponent } from '@app/admin/appSubScriptionPlan/appTenantSubscriptionPlans/appTenantSubscriptionPlans.component';
import { CreateOrEditAppTenantSubscriptionPlanComponent } from '@app/admin/appSubScriptionPlan/appTenantSubscriptionPlans/create-or-edit-appTenantSubscriptionPlan.component';
import { ViewAppTenantSubscriptionPlanComponent } from '@app/admin/appSubScriptionPlan/appTenantSubscriptionPlans/view-appTenantSubscriptionPlan.component';
import { AppTenantActivitiesLogComponent } from "@app/admin/appSubScriptionPlan/appTenantActivitiesLog/appTenantActivitiesLog.component";
import { AppSubscriptionPlanDetailAppFeatureLookupTableModalComponent } from "@app/admin/appSubScriptionPlan/appSubscriptionPlanDetails/appSubscriptionPlanDetail-appFeature-lookup-table-modal.component";

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
        AppSubscriptionPlanHeadersComponent, 
        ViewAppSubscriptionPlanHeaderModalComponent,
        CreateOrEditAppSubscriptionPlanHeaderModalComponent,
        ViewAppSubscriptionPlanHeaderModalComponent,
        CreateOrEditAppSubscriptionPlanDetailModalComponent,
        ViewAppSubscriptionPlanDetailModalComponent,
        AppSubscriptionPlanDetailAppSubscriptionPlanHeaderLookupTableModalComponent,
        AppSubscriptionPlanDetailAppFeatureLookupTableModalComponent,
        MasterDetailChild_AppSubscriptionPlanHeader_ViewAppSubscriptionPlanDetailModalComponent,
        MasterDetailChild_AppSubscriptionPlanHeader_AppSubscriptionPlanDetailsComponent,
        MasterDetailChild_AppSubscriptionPlanHeader_CreateOrEditAppSubscriptionPlanDetailModalComponent,
        AppSubscriptionPlanDetailsComponent, AppTenantSubscriptionPlansComponent ,CreateOrEditAppTenantSubscriptionPlanComponent ,
         ViewAppTenantSubscriptionPlanComponent,AppTenantActivitiesLogComponent
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
