import { CommonModule } from "@angular/common";
import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppLocalizationService } from "@app/shared/common/localization/app-localization.service";
import { AppNavigationService } from "@app/shared/layout/nav/app-navigation.service";
import { onetouchCommonModule } from "@shared/common/common.module";
import { UtilsModule } from "@shared/utils/utils.module";
import { ModalModule } from "ngx-bootstrap/modal";
import { TabsModule } from "ngx-bootstrap/tabs";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import {
    BsDatepickerModule,
    BsDatepickerConfig,
    BsDaterangepickerConfig,
} from "ngx-bootstrap/datepicker";
import { PaginatorModule } from "primeng/paginator";
import { TableModule } from "primeng/table";
import { AppAuthService } from "./auth/app-auth.service";
import { AppRouteGuard } from "./auth/auth-route-guard";
import { CommonLookupModalComponent } from "./lookup/common-lookup-modal.component";
import { EntityTypeHistoryModalComponent } from "./entityHistory/entity-type-history-modal.component";
import { EntityChangeDetailModalComponent } from "./entityHistory/entity-change-detail-modal.component";
import { DateRangePickerInitialValueSetterDirective } from "./timing/date-range-picker-initial-value.directive";
import { DatePickerInitialValueSetterDirective } from "./timing/date-picker-initial-value.directive";
import { DateTimeService } from "./timing/date-time.service";
import { TimeZoneComboComponent } from "./timing/timezone-combo.component";
import { CustomizableDashboardComponent } from "./customizable-dashboard/customizable-dashboard.component";
import { WidgetGeneralStatsComponent } from "./customizable-dashboard/widgets/widget-general-stats/widget-general-stats.component";
import { DashboardViewConfigurationService } from "./customizable-dashboard/dashboard-view-configuration.service";
import { GridsterModule } from "angular-gridster2";
import { WidgetDailySalesComponent } from "./customizable-dashboard/widgets/widget-daily-sales/widget-daily-sales.component";
import { WidgetEditionStatisticsComponent } from "./customizable-dashboard/widgets/widget-edition-statistics/widget-edition-statistics.component";
import { WidgetHostTopStatsComponent } from "./customizable-dashboard/widgets/widget-host-top-stats/widget-host-top-stats.component";
import { WidgetIncomeStatisticsComponent } from "./customizable-dashboard/widgets/widget-income-statistics/widget-income-statistics.component";
import { WidgetMemberActivityComponent } from "./customizable-dashboard/widgets/widget-member-activity/widget-member-activity.component";
import { WidgetProfitShareComponent } from "./customizable-dashboard/widgets/widget-profit-share/widget-profit-share.component";
import { WidgetRecentTenantsComponent } from "./customizable-dashboard/widgets/widget-recent-tenants/widget-recent-tenants.component";
import { WidgetRegionalStatsComponent } from "./customizable-dashboard/widgets/widget-regional-stats/widget-regional-stats.component";
import { WidgetSalesSummaryComponent } from "./customizable-dashboard/widgets/widget-sales-summary/widget-sales-summary.component";
import { WidgetSubscriptionExpiringTenantsComponent } from "./customizable-dashboard/widgets/widget-subscription-expiring-tenants/widget-subscription-expiring-tenants.component";
import { WidgetTopStatsComponent } from "./customizable-dashboard/widgets/widget-top-stats/widget-top-stats.component";
import { FilterDateRangePickerComponent } from "./customizable-dashboard/filters/filter-date-range-picker/filter-date-range-picker.component";
import { AddWidgetModalComponent } from "./customizable-dashboard/add-widget-modal/add-widget-modal.component";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { NgxBootstrapDatePickerConfigService } from "assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service";
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";
import CountoModule  from "angular2-counto";
import { AppBsModalModule } from "@shared/common/appBsModal/app-bs-modal.module";
import { SingleLineStringInputTypeComponent } from "./input-types/single-line-string-input-type/single-line-string-input-type.component";
import { ComboboxInputTypeComponent } from "./input-types/combobox-input-type/combobox-input-type.component";
import { CheckboxInputTypeComponent } from "./input-types/checkbox-input-type/checkbox-input-type.component";
import { MultipleSelectComboboxInputTypeComponent } from "./input-types/multiple-select-combobox-input-type/multiple-select-combobox-input-type.component";
import { AutoCompleteModule } from "primeng/autocomplete";
import { ConfirmModal } from "../common/confirm-modal/confirm-modal.components";
import { ConfirmModalSide } from "../common/confirm-modal-side/confirm-modal-side.components";
import { DialogModule } from "primeng/dialog";
import { ImageCropperComponent } from "./image-cropper/image-cropper.component";
import { ImageCropperModule } from "ngx-image-cropper";
import { ImageViewerComponent } from "./image-viewer/image-viewer.component";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { LanguageSwitchComponent } from "./language-switch/language-switch.component";
import { GoogleMapComponent } from "./GoogleMap/google-map/google-map.component";
import { CarouselModule} from "primeng/carousel";
import {SendMailModalComponent} from '@app/shared/common/Mail/sendMail-modal.component';
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { ImageDisplayComponent } from './image-display/image-display.component';
import { ProgressComponent } from './progress/progress.component'
import { CheckboxModule } from "primeng/checkbox";
import { GenericFormModalComponent } from "./generic-forms/generic-form-modal.component";
import { MatrixGridComponent } from "./matrix-grid/matrix-grid.component";
import { SelectionModalComponent } from "./selection-modals/selection-modal.component";
import { AppSideBarComponent } from "./app-side-bar/app-side-bar.component";
import { AppTransactionSideBarComponent } from "@app/admin/sideBarComponents/app-transaction-side-bar/app-transaction-side-bar.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule.forRoot(),
        UtilsModule,
        onetouchCommonModule,
        TableModule,
        PaginatorModule,
        CarouselModule,
        DialogModule,
        GridsterModule,
        TabsModule.forRoot(),
        BsDropdownModule.forRoot(),
        NgxChartsModule,
        BsDatepickerModule.forRoot(),
        PerfectScrollbarModule,
        CountoModule,
        AppBsModalModule,
        AutoCompleteModule,
        ImageCropperModule,
        ScrollingModule,
        CheckboxModule
    ],
    declarations: [
        TimeZoneComboComponent,
        CommonLookupModalComponent,
        EntityTypeHistoryModalComponent,
        EntityChangeDetailModalComponent,
        DateRangePickerInitialValueSetterDirective,
        DatePickerInitialValueSetterDirective,
        CustomizableDashboardComponent,
        WidgetGeneralStatsComponent,
        WidgetDailySalesComponent,
        WidgetEditionStatisticsComponent,
        WidgetHostTopStatsComponent,
        WidgetIncomeStatisticsComponent,
        WidgetMemberActivityComponent,
        WidgetProfitShareComponent,
        WidgetRecentTenantsComponent,
        WidgetRegionalStatsComponent,
        WidgetSalesSummaryComponent,
        WidgetSubscriptionExpiringTenantsComponent,
        WidgetTopStatsComponent,
        FilterDateRangePickerComponent,
        AddWidgetModalComponent,
        SingleLineStringInputTypeComponent,
        ComboboxInputTypeComponent,
        CheckboxInputTypeComponent,
        MultipleSelectComboboxInputTypeComponent,
        ConfirmModal,
        ConfirmModalSide,
        ImageCropperComponent,
        ImageViewerComponent,
        LanguageSwitchComponent,
        GoogleMapComponent,
        SendMailModalComponent,
        ImageUploadComponent,
        ImageDisplayComponent,
        ProgressComponent,
        MatrixGridComponent,
        GenericFormModalComponent,
        SelectionModalComponent,
        AppSideBarComponent,AppTransactionSideBarComponent
    ],
    exports: [
        TimeZoneComboComponent,
        CommonLookupModalComponent,
        EntityTypeHistoryModalComponent,
        EntityChangeDetailModalComponent,
        DateRangePickerInitialValueSetterDirective,
        DatePickerInitialValueSetterDirective,
        CustomizableDashboardComponent,
        NgxChartsModule,
        ConfirmModal,
        ConfirmModalSide,
        LanguageSwitchComponent,
        GoogleMapComponent,
        SendMailModalComponent,
        ImageUploadComponent,
        ImageDisplayComponent,
        ProgressComponent,
        MatrixGridComponent,
        GenericFormModalComponent,
        SelectionModalComponent,AppSideBarComponent
    ],
    providers: [
        DateTimeService,
        AppLocalizationService,
        AppNavigationService,
        DashboardViewConfigurationService,
        {
            provide: BsDatepickerConfig,
            useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig,
        },
        {
            provide: BsDaterangepickerConfig,
            useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig,
        },
    ]
})
export class AppCommonModule {
    static forRoot(): ModuleWithProviders<AppCommonModule> {
        return {
            ngModule: AppCommonModule,
            providers: [AppAuthService, AppRouteGuard],
        };
    }
}
