import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { MaintainancesComponent } from './maintainances/maintainances/maintainances.component';
import { ViewMaintainanceModalComponent } from './maintainances/maintainances/view-maintainance-modal.component';
import { CreateOrEditMaintainanceModalComponent } from './maintainances/maintainances/create-or-edit-maintainance-modal.component';

import { SycSegmentIdentifierDefinitionSycIdentifierDefinitionLookupTableModalComponent } from './sycSegmentIdentifierDefinitions/sycSegmentIdentifierDefinitions/sycSegmentIdentifierDefinition-sycIdentifierDefinition-lookup-table-modal.component';

import { SycIdentifierDefinitionsComponent } from './sycIdentifierDefinitions/sycIdentifierDefinitions/sycIdentifierDefinitions.component';
import { ViewSycIdentifierDefinitionModalComponent } from './sycIdentifierDefinitions/sycIdentifierDefinitions/view-sycIdentifierDefinition-modal.component';
import { CreateOrEditSycIdentifierDefinitionModalComponent } from './sycIdentifierDefinitions/sycIdentifierDefinitions/create-or-edit-sycIdentifierDefinition-modal.component';

import { SycSegmentIdentifierDefinitionsComponent } from './sycSegmentIdentifierDefinitions/sycSegmentIdentifierDefinitions/sycSegmentIdentifierDefinitions.component';
import { ViewSycSegmentIdentifierDefinitionModalComponent } from './sycSegmentIdentifierDefinitions/sycSegmentIdentifierDefinitions/view-sycSegmentIdentifierDefinition-modal.component';
import { CreateOrEditSycSegmentIdentifierDefinitionModalComponent } from './sycSegmentIdentifierDefinitions/sycSegmentIdentifierDefinitions/create-or-edit-sycSegmentIdentifierDefinition-modal.component';

import { MasterDetailChild_SycSegmentIdentifierDefinition_SycCountersComponent } from './sycCounters/sycCounters/masterDetailChild_SycSegmentIdentifierDefinition_sycCounters.component';
import { MasterDetailChild_SycSegmentIdentifierDefinition_ViewSycCounterModalComponent } from './sycCounters/sycCounters/masterDetailChild_SycSegmentIdentifierDefinition_view-sycCounter-modal.component';
import { MasterDetailChild_SycSegmentIdentifierDefinition_CreateOrEditSycCounterModalComponent } from './sycCounters/sycCounters/masterDetailChild_SycSegmentIdentifierDefinition_create-or-edit-sycCounter-modal.component';

import { SycCounterSycSegmentIdentifierDefinitionLookupTableModalComponent } from './sycCounters/sycCounters/sycCounter-sycSegmentIdentifierDefinition-lookup-table-modal.component';

import { SycCountersComponent } from './sycCounters/sycCounters/sycCounters.component';
import { ViewSycCounterModalComponent } from './sycCounters/sycCounters/view-sycCounter-modal.component';
import { CreateOrEditSycCounterModalComponent } from './sycCounters/sycCounters/create-or-edit-sycCounter-modal.component';

import { AppAdvertisementsComponent } from './appAdvertisements/appAdvertisements/appAdvertisements.component';
import { ViewAppAdvertisementComponent } from './appAdvertisements/appAdvertisements/view-appAdvertisement.component';
import { CreateOrEditAppAdvertisementComponent } from './appAdvertisements/appAdvertisements/create-or-edit-appAdvertisement.component';
import { AppAdvertisementAppEntityLookupTableModalComponent } from './appAdvertisements/appAdvertisements/appAdvertisement-appEntity-lookup-table-modal.component';
import { AppAdvertisementUserLookupTableModalComponent } from './appAdvertisements/appAdvertisements/appAdvertisement-user-lookup-table-modal.component';

import { TicketNotesComponent } from './autoTaskTicketNotes/ticketNotes/ticketNotes.component';
import { ViewTicketNoteModalComponent } from './autoTaskTicketNotes/ticketNotes/view-ticketNote-modal.component';
import { CreateOrEditTicketNoteModalComponent } from './autoTaskTicketNotes/ticketNotes/create-or-edit-ticketNote-modal.component';
import { TicketNoteTicketLookupTableModalComponent } from './autoTaskTicketNotes/ticketNotes/ticketNote-ticket-lookup-table-modal.component';

import { TicketsComponent } from './autoTaskTickets/tickets/tickets.component';
import { ViewTicketModalComponent } from './autoTaskTickets/tickets/view-ticket-modal.component';
import { CreateOrEditTicketModalComponent } from './autoTaskTickets/tickets/create-or-edit-ticket-modal.component';

import { AppTenantsActivitiesLogsComponent } from './appTenantsActivitiesLogs/appTenantsActivitiesLogs/appTenantsActivitiesLogs.component';
import { ViewAppTenantsActivitiesLogModalComponent } from './appTenantsActivitiesLogs/appTenantsActivitiesLogs/view-appTenantsActivitiesLog-modal.component';
import { CreateOrEditAppTenantsActivitiesLogModalComponent } from './appTenantsActivitiesLogs/appTenantsActivitiesLogs/create-or-edit-appTenantsActivitiesLog-modal.component';

import { AppTenantPlansComponent } from './appTenantPlans/appTenantPlans/appTenantPlans.component';
import { ViewAppTenantPlanModalComponent } from './appTenantPlans/appTenantPlans/view-appTenantPlan-modal.component';
import { CreateOrEditAppTenantPlanModalComponent } from './appTenantPlans/appTenantPlans/create-or-edit-appTenantPlan-modal.component';

import { AppTransactionsComponent } from './appTransactions/appTransactions/appTransactions.component';
import { ViewAppTransactionModalComponent } from './appTransactions/appTransactions/view-appTransaction-modal.component';
import { CreateOrEditAppTransactionModalComponent } from './appTransactions/appTransactions/create-or-edit-appTransaction-modal.component';

import { SycPlanServicesComponent } from './sycPlanServices/sycPlanServices/sycPlanServices.component';
import { ViewSycPlanServiceModalComponent } from './sycPlanServices/sycPlanServices/view-sycPlanService-modal.component';
import { CreateOrEditSycPlanServiceModalComponent } from './sycPlanServices/sycPlanServices/create-or-edit-sycPlanService-modal.component';

import { SycPlansComponent } from './sycPlans/sycPlans/sycPlans.component';
import { ViewSycPlanModalComponent } from './sycPlans/sycPlans/view-sycPlan-modal.component';
import { CreateOrEditSycPlanModalComponent } from './sycPlans/sycPlans/create-or-edit-sycPlan-modal.component';

import { SycServicesComponent } from './sycServices/sycServices/sycServices.component';
import { ViewSycServiceModalComponent } from './sycServices/sycServices/view-sycService-modal.component';
import { CreateOrEditSycServiceModalComponent } from './sycServices/sycServices/create-or-edit-sycService-modal.component';

import { SycApplicationsComponent } from './sycApplications/sycApplications/sycApplications.component';
import { ViewSycApplicationModalComponent } from './sycApplications/sycApplications/view-sycApplication-modal.component';
import { CreateOrEditSycApplicationModalComponent } from './sycApplications/sycApplications/create-or-edit-sycApplication-modal.component';

import { UtilsModule } from '@shared/utils/utils.module';
import { AddMemberModalComponent } from 'app/admin/organization-units/add-member-modal.component';
import { AddRoleModalComponent } from 'app/admin/organization-units/add-role-modal.component';
import { FileUploadModule } from 'ng2-file-upload';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BsDatepickerConfig, BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { EditorModule } from 'primeng/editor';
import { FileUploadModule as PrimeNgFileUploadModule } from 'primeng/fileupload';
import { InputMaskModule } from 'primeng/inputmask';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TreeModule } from 'primeng/tree';
import { DragDropModule } from 'primeng/dragdrop';
import { TreeDragDropService } from 'primeng/api';
import { ContextMenuModule } from 'primeng/contextmenu';
import { AdminRoutingModule } from './admin-routing.module';
import { AuditLogDetailModalComponent } from './audit-logs/audit-log-detail-modal.component';
import { AuditLogsComponent } from './audit-logs/audit-logs.component';
import { HostDashboardComponent } from './dashboard/host-dashboard.component';
import { DemoUiComponentsComponent } from './demo-ui-components/demo-ui-components.component';
import { DemoUiDateTimeComponent } from './demo-ui-components/demo-ui-date-time.component';
import { DemoUiEditorComponent } from './demo-ui-components/demo-ui-editor.component';
import { DemoUiFileUploadComponent } from './demo-ui-components/demo-ui-file-upload.component';
import { DemoUiInputMaskComponent } from './demo-ui-components/demo-ui-input-mask.component';
import { DemoUiSelectionComponent } from './demo-ui-components/demo-ui-selection.component';
import { CreateEditionModalComponent } from './editions/create-edition-modal.component';
import { EditEditionModalComponent } from './editions/edit-edition-modal.component';
import { MoveTenantsToAnotherEditionModalComponent } from './editions/move-tenants-to-another-edition-modal.component';
import { EditionsComponent } from './editions/editions.component';
import { InstallComponent } from './install/install.component';
import { CreateOrEditLanguageModalComponent } from './languages/create-or-edit-language-modal.component';
import { EditTextModalComponent } from './languages/edit-text-modal.component';
import { LanguageTextsComponent } from './languages/language-texts.component';
import { LanguagesComponent } from './languages/languages.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { CreateOrEditUnitModalComponent } from './organization-units/create-or-edit-unit-modal.component';
import { OrganizationTreeComponent } from './organization-units/organization-tree.component';
import { OrganizationUnitMembersComponent } from './organization-units/organization-unit-members.component';
import { OrganizationUnitRolesComponent } from './organization-units/organization-unit-roles.component';
import { OrganizationUnitsComponent } from './organization-units/organization-units.component';
import { CreateOrEditRoleModalComponent } from './roles/create-or-edit-role-modal.component';
import { RolesComponent } from './roles/roles.component';
import { HostSettingsComponent } from './settings/host-settings.component';
import { TenantSettingsComponent } from './settings/tenant-settings.component';
import { EditionComboComponent } from './shared/edition-combo.component';
import { FeatureTreeComponent } from './shared/feature-tree.component';
import { OrganizationUnitsTreeComponent } from './shared/organization-unit-tree.component';
import { PermissionComboComponent } from './shared/permission-combo.component';
import { PermissionTreeComponent } from './shared/permission-tree.component';
import { RoleComboComponent } from './shared/role-combo.component';
import { InvoiceComponent } from './subscription-management/invoice/invoice.component';
import { SubscriptionManagementComponent } from './subscription-management/subscription-management.component';
import { CreateTenantModalComponent } from './tenants/create-tenant-modal.component';
import { EditTenantModalComponent } from './tenants/edit-tenant-modal.component';
import { TenantFeaturesModalComponent } from './tenants/tenant-features-modal.component';
import { TenantsComponent } from './tenants/tenants.component';
import { UiCustomizationComponent } from './ui-customization/ui-customization.component';
import { DefaultThemeUiSettingsComponent } from './ui-customization/default-theme-ui-settings.component';
import { Theme2ThemeUiSettingsComponent } from './ui-customization/theme2-theme-ui-settings.component';
import { Theme3ThemeUiSettingsComponent } from './ui-customization/theme3-theme-ui-settings.component';
import { Theme4ThemeUiSettingsComponent } from './ui-customization/theme4-theme-ui-settings.component';
import { Theme5ThemeUiSettingsComponent } from './ui-customization/theme5-theme-ui-settings.component';
import { Theme6ThemeUiSettingsComponent } from './ui-customization/theme6-theme-ui-settings.component';
import { Theme7ThemeUiSettingsComponent } from './ui-customization/theme7-theme-ui-settings.component';
import { Theme8ThemeUiSettingsComponent } from './ui-customization/theme8-theme-ui-settings.component';
import { Theme9ThemeUiSettingsComponent } from './ui-customization/theme9-theme-ui-settings.component';
import { Theme10ThemeUiSettingsComponent } from './ui-customization/theme10-theme-ui-settings.component';
import { Theme11ThemeUiSettingsComponent } from './ui-customization/theme11-theme-ui-settings.component';
import { Theme12ThemeUiSettingsComponent } from './ui-customization/theme12-theme-ui-settings.component';
import { CreateOrEditUserModalComponent } from './users/create-or-edit-user-modal.component';
import { EditUserPermissionsModalComponent } from './users/edit-user-permissions-modal.component';
import { ImpersonationService } from './users/impersonation.service';
import { UsersComponent } from './users/users.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CountoModule } from 'angular2-counto';
import { TextMaskModule } from 'angular2-text-mask';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';
import { DropdownModule } from 'primeng/dropdown';

// Metronic
import { PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { PermissionTreeModalComponent } from './shared/permission-tree-modal.component';
import { WebhookSubscriptionComponent } from './webhook-subscription/webhook-subscription.component';
import { CreateOrEditWebhookSubscriptionModalComponent } from './webhook-subscription/create-or-edit-webhook-subscription-modal.component';
import { WebhookSubscriptionDetailComponent } from './webhook-subscription/webhook-subscription-detail.component';
import { WebhookEventDetailComponent } from './webhook-subscription/webhook-event-detail.component';
import { AppBsModalModule } from '@shared/common/appBsModal/app-bs-modal.module';
// import { DynamicParameterComponent } from './dynamic-entity-parameters/dynamic-parameter/dynamic-parameter.component';
// import { CreateOrEditDynamicParameterModalComponent } from './dynamic-entity-parameters/dynamic-parameter/create-or-edit-dynamic-parameter-modal.component';
// import { DynamicParameterDetailComponent } from './dynamic-entity-parameters/dynamic-parameter/dynamic-parameter-detail.component';
// import { DynamicParameterValueComponent } from './dynamic-entity-parameters/dynamic-parameter/dynamic-parameter-value/dynamic-parameter-value.component';
// import { CreateOrEditDynamicParameterValueModalComponent } from './dynamic-entity-parameters/dynamic-parameter/dynamic-parameter-value/create-or-edit-dynamic-parameter-value-modal.component';
// import { EntityDynamicParameterComponent } from './dynamic-entity-parameters/entity-dynamic-parameter/entity-dynamic-parameter.component';
// import { CreateEntityDynamicParameterModalComponent } from './dynamic-entity-parameters/entity-dynamic-parameter/create-entity-dynamic-parameter-modal.component';
// import { EntityDynamicParameterValueComponent } from './dynamic-entity-parameters/entity-dynamic-parameter/entity-dynamic-parameter-value/entity-dynamic-parameter-value.component';
// import { ManageEntityDynamicParameterValuesModalComponent } from './dynamic-entity-parameters/entity-dynamic-parameter/entity-dynamic-parameter-value/manage-entity-dynamic-parameter-values-modal.component';
// import { EntityDynamicParameterValueManagerComponent } from './dynamic-entity-parameters/entity-dynamic-parameter/entity-dynamic-parameter-value/entity-dynamic-parameter-value-manager/entity-dynamic-parameter-value-manager.component';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { StepperComponent } from './appAdvertisements/stepper/stepper.component';
import { EmailingTemplateServiceProxy } from '@shared/service-proxies/service-proxies';


const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    // suppressScrollX: true
};

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        FileUploadModule,
        ModalModule.forRoot(),
        TabsModule.forRoot(),
        TooltipModule.forRoot(),
        PopoverModule.forRoot(),
        BsDropdownModule.forRoot(),
        BsDatepickerModule.forRoot(),
        AdminRoutingModule,
        UtilsModule,
        AppCommonModule,
        TableModule,
        TreeModule,
        DragDropModule,
        ContextMenuModule,
        PaginatorModule,
        PrimeNgFileUploadModule,
        AutoCompleteModule,
        EditorModule,
        InputMaskModule,
        NgxChartsModule,
        CountoModule,
        TextMaskModule,
        ImageCropperModule,
        PerfectScrollbarModule,
        DropdownModule,
        AppBsModalModule,
        CdkStepperModule
    ],
    declarations: [
		MaintainancesComponent,

		ViewMaintainanceModalComponent,
		CreateOrEditMaintainanceModalComponent,
    SycSegmentIdentifierDefinitionSycIdentifierDefinitionLookupTableModalComponent,
		SycIdentifierDefinitionsComponent,

		ViewSycIdentifierDefinitionModalComponent,
		CreateOrEditSycIdentifierDefinitionModalComponent,
		SycSegmentIdentifierDefinitionsComponent,

		ViewSycSegmentIdentifierDefinitionModalComponent,
		CreateOrEditSycSegmentIdentifierDefinitionModalComponent,
		MasterDetailChild_SycSegmentIdentifierDefinition_SycCountersComponent,

		MasterDetailChild_SycSegmentIdentifierDefinition_ViewSycCounterModalComponent,
		MasterDetailChild_SycSegmentIdentifierDefinition_CreateOrEditSycCounterModalComponent,
    SycCounterSycSegmentIdentifierDefinitionLookupTableModalComponent,
		SycCountersComponent,

		ViewSycCounterModalComponent,
		CreateOrEditSycCounterModalComponent,
		AppAdvertisementsComponent,

		ViewAppAdvertisementComponent,
		CreateOrEditAppAdvertisementComponent,
    AppAdvertisementAppEntityLookupTableModalComponent,
    AppAdvertisementUserLookupTableModalComponent,
		TicketNotesComponent,

		ViewTicketNoteModalComponent,
		CreateOrEditTicketNoteModalComponent,
    TicketNoteTicketLookupTableModalComponent,
		TicketsComponent,

		ViewTicketModalComponent,
		CreateOrEditTicketModalComponent,
		AppTenantsActivitiesLogsComponent,

		ViewAppTenantsActivitiesLogModalComponent,
		CreateOrEditAppTenantsActivitiesLogModalComponent,
		AppTenantPlansComponent,

		ViewAppTenantPlanModalComponent,
		CreateOrEditAppTenantPlanModalComponent,
		AppTransactionsComponent,

		ViewAppTransactionModalComponent,
		CreateOrEditAppTransactionModalComponent,
		SycPlanServicesComponent,

		ViewSycPlanServiceModalComponent,
		CreateOrEditSycPlanServiceModalComponent,
		SycPlansComponent,

		ViewSycPlanModalComponent,
		CreateOrEditSycPlanModalComponent,
		SycServicesComponent,

		ViewSycServiceModalComponent,
		CreateOrEditSycServiceModalComponent,
		SycApplicationsComponent,

		ViewSycApplicationModalComponent,
		CreateOrEditSycApplicationModalComponent,
        UsersComponent,
        PermissionComboComponent,
        RoleComboComponent,
        CreateOrEditUserModalComponent,
        EditUserPermissionsModalComponent,
        PermissionTreeComponent,
        FeatureTreeComponent,
        OrganizationUnitsTreeComponent,
        RolesComponent,
        CreateOrEditRoleModalComponent,
        AuditLogsComponent,
        AuditLogDetailModalComponent,
        HostSettingsComponent,
        InstallComponent,
        MaintenanceComponent,
        EditionsComponent,
        CreateEditionModalComponent,
        EditEditionModalComponent,
        MoveTenantsToAnotherEditionModalComponent,
        LanguagesComponent,
        LanguageTextsComponent,
        CreateOrEditLanguageModalComponent,
        TenantsComponent,
        CreateTenantModalComponent,
        EditTenantModalComponent,
        TenantFeaturesModalComponent,
        CreateOrEditLanguageModalComponent,
        EditTextModalComponent,
        OrganizationUnitsComponent,
        OrganizationTreeComponent,
        OrganizationUnitMembersComponent,
        OrganizationUnitRolesComponent,
        CreateOrEditUnitModalComponent,
        TenantSettingsComponent,
        HostDashboardComponent,
        EditionComboComponent,
        InvoiceComponent,
        SubscriptionManagementComponent,
        AddMemberModalComponent,
        AddRoleModalComponent,
        DemoUiComponentsComponent,
        DemoUiDateTimeComponent,
        DemoUiSelectionComponent,
        DemoUiFileUploadComponent,
        DemoUiInputMaskComponent,
        DemoUiEditorComponent,
        UiCustomizationComponent,
        DefaultThemeUiSettingsComponent,
        Theme2ThemeUiSettingsComponent,
        Theme3ThemeUiSettingsComponent,
        Theme4ThemeUiSettingsComponent,
        Theme5ThemeUiSettingsComponent,
        Theme6ThemeUiSettingsComponent,
        Theme7ThemeUiSettingsComponent,
        Theme8ThemeUiSettingsComponent,
        Theme9ThemeUiSettingsComponent,
        Theme10ThemeUiSettingsComponent,
        Theme12ThemeUiSettingsComponent,
        Theme11ThemeUiSettingsComponent,
        PermissionTreeModalComponent,
        WebhookSubscriptionComponent,
        CreateOrEditWebhookSubscriptionModalComponent,
        WebhookSubscriptionDetailComponent,
        WebhookEventDetailComponent,
        // DynamicParameterComponent,
        // CreateOrEditDynamicParameterModalComponent,
        // DynamicParameterDetailComponent,
        // DynamicParameterValueComponent,
        // CreateOrEditDynamicParameterValueModalComponent,
        // EntityDynamicParameterComponent,
        // CreateEntityDynamicParameterModalComponent,
        // EntityDynamicParameterValueComponent,
        // ManageEntityDynamicParameterValuesModalComponent,
        // EntityDynamicParameterValueManagerComponent,
        StepperComponent
    ],
    exports: [
        AddMemberModalComponent,
        AddRoleModalComponent
    ],
    providers: [
        ImpersonationService,
        TreeDragDropService,
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale },
        { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG },
        EmailingTemplateServiceProxy
    ]
})
export class AdminModule { }
