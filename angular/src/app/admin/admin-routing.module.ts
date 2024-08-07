import { NgModule } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { SycCurrencyExchangeRatesComponent } from './sycCurrencyExchangeRates/sycCurrencyExchangeRates/sycCurrencyExchangeRates.component';
import { CreateOrEditSycCurrencyExchangeRatesComponent } from './sycCurrencyExchangeRates/sycCurrencyExchangeRates/create-or-edit-sycCurrencyExchangeRates.component';
import { ViewSycCurrencyExchangeRatesComponent } from './sycCurrencyExchangeRates/sycCurrencyExchangeRates/view-sycCurrencyExchangeRates.component';
import { AppTenantInvoicesComponent } from './appSubscriptionPlans/appTenantInvoices/appTenantInvoices.component';
import { CreateOrEditAppTenantInvoiceComponent } from './appSubscriptionPlans/appTenantInvoices/create-or-edit-appTenantInvoice.component';
import { ViewAppTenantInvoiceComponent } from './appSubscriptionPlans/appTenantInvoices/view-appTenantInvoice.component';
import { AppTenantActivitiesLogComponent } from './appSubScriptionPlan/appTenantActivitiesLog/appTenantActivitiesLog.component';
import { CreateOrEditAppTenantActivityLogComponent } from './appSubScriptionPlan/appTenantActivitiesLog/create-or-edit-appTenantActivityLog.component';
import { ViewAppTenantActivityLogComponent } from './appSubScriptionPlan/appTenantActivitiesLog/view-appTenantActivityLog.component';
import { AppSubscriptionPlanDetailsComponent } from './appSubScriptionPlan/appSubscriptionPlanDetails/appSubscriptionPlanDetails.component';
import { AppFeaturesComponent } from './appSubScriptionPlan/appFeatures/appFeatures.component';
import { CreateOrEditAppFeatureComponent } from './appSubScriptionPlan/appFeatures/create-or-edit-appFeature.component';
import { ViewAppFeatureComponent } from './appSubScriptionPlan/appFeatures/view-appFeature.component';
import { MaintainancesComponent } from './maintainances/maintainances/maintainances.component';
import { SycIdentifierDefinitionsComponent } from './sycIdentifierDefinitions/sycIdentifierDefinitions/sycIdentifierDefinitions.component';
import { SycSegmentIdentifierDefinitionsComponent } from './sycSegmentIdentifierDefinitions/sycSegmentIdentifierDefinitions/sycSegmentIdentifierDefinitions.component';
import { SycCountersComponent } from './sycCounters/sycCounters/sycCounters.component';
import { AppAdvertisementsComponent } from './appAdvertisements/appAdvertisements/appAdvertisements.component';
import { CreateOrEditAppAdvertisementComponent } from './appAdvertisements/appAdvertisements/create-or-edit-appAdvertisement.component';
import { ViewAppAdvertisementComponent } from './appAdvertisements/appAdvertisements/view-appAdvertisement.component';
import { TicketNotesComponent } from './autoTaskTicketNotes/ticketNotes/ticketNotes.component';
import { TicketsComponent } from './autoTaskTickets/tickets/tickets.component';
import { AppTenantPlansComponent } from './appTenantPlans/appTenantPlans/appTenantPlans.component';
import { AppTransactionsComponent } from './appTransactions/appTransactions/appTransactions.component';
import { AppTransactionsBrowseComponent } from './appTransactions/appTransactions/appTransBrowse.component';
import { SycPlanServicesComponent } from './sycPlanServices/sycPlanServices/sycPlanServices.component';
import { SycPlansComponent } from './sycPlans/sycPlans/sycPlans.component';
import { SycServicesComponent } from './sycServices/sycServices/sycServices.component';
import { SycApplicationsComponent } from './sycApplications/sycApplications/sycApplications.component';
import { AuditLogsComponent } from './audit-logs/audit-logs.component';
import { HostDashboardComponent } from './dashboard/host-dashboard.component';
import { DemoUiComponentsComponent } from './demo-ui-components/demo-ui-components.component';
import { EditionsComponent } from './editions/editions.component';
import { InstallComponent } from './install/install.component';
import { LanguageTextsComponent } from './languages/language-texts.component';
import { LanguagesComponent } from './languages/languages.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { OrganizationUnitsComponent } from './organization-units/organization-units.component';
import { RolesComponent } from './roles/roles.component';
import { HostSettingsComponent } from './settings/host-settings.component';
import { TenantSettingsComponent } from './settings/tenant-settings.component';
import { InvoiceComponent } from './subscription-management/invoice/invoice.component';
import { SubscriptionManagementComponent } from './subscription-management/subscription-management.component';
import { TenantsComponent } from './tenants/tenants.component';
import { UiCustomizationComponent } from './ui-customization/ui-customization.component';
import { UsersComponent } from './users/users.component';
import { WebhookSubscriptionComponent } from './webhook-subscription/webhook-subscription.component';
import { WebhookSubscriptionDetailComponent } from './webhook-subscription/webhook-subscription-detail.component';
import { WebhookEventDetailComponent } from './webhook-subscription/webhook-event-detail.component';
import { AppTenantSubscriptionPlansComponent } from './appSubScriptionPlan/appTenantSubscriptionPlans/appTenantSubscriptionPlans.component';
import { CreateOrEditAppTenantSubscriptionPlanComponent } from './appSubScriptionPlan/appTenantSubscriptionPlans/create-or-edit-appTenantSubscriptionPlan.component';
import { ViewAppTenantSubscriptionPlanComponent } from './appSubScriptionPlan/appTenantSubscriptionPlans/view-appTenantSubscriptionPlan.component';
// import { DynamicParameterComponent } from './dynamic-entity-parameters/dynamic-parameter/dynamic-parameter.component';
// import { DynamicParameterDetailComponent } from './dynamic-entity-parameters/dynamic-parameter/dynamic-parameter-detail.component';
// import { EntityDynamicParameterComponent } from './dynamic-entity-parameters/entity-dynamic-parameter/entity-dynamic-parameter.component';
// import { EntityDynamicParameterValueComponent } from './dynamic-entity-parameters/entity-dynamic-parameter/entity-dynamic-parameter-value/entity-dynamic-parameter-value.component';


@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'sycCurrencyExchangeRates/sycCurrencyExchangeRates', component: SycCurrencyExchangeRatesComponent, data: { permission: 'Pages.Administration.SycCurrencyExchangeRates' }  },
                    { path: 'sycCurrencyExchangeRates/sycCurrencyExchangeRates/createOrEdit', component: CreateOrEditSycCurrencyExchangeRatesComponent, data: { permission: 'Pages.Administration.SycCurrencyExchangeRates.Create' }  },
                    { path: 'sycCurrencyExchangeRates/sycCurrencyExchangeRates/view', component: ViewSycCurrencyExchangeRatesComponent, data: { permission: 'Pages.Administration.SycCurrencyExchangeRates' }  },
                    { path: 'appSubscriptionPlans/appTenantInvoices', component: AppTenantInvoicesComponent, data: { permission: 'Pages.Administration.AppTenantInvoices' }  },
                    { path: 'appSubscriptionPlans/appTenantInvoices/createOrEdit', component: CreateOrEditAppTenantInvoiceComponent, data: { permission: 'Pages.Administration.AppTenantInvoices.Create' }  },
                    { path: 'appSubscriptionPlans/appTenantInvoices/view', component: ViewAppTenantInvoiceComponent, data: { permission: 'Pages.Administration.AppTenantInvoices' }  },
                    { path: 'appSubScriptionPlan/appTenantActivitiesLog', component: AppTenantActivitiesLogComponent  },
                    { path: 'appSubScriptionPlan/appTenantActivitiesLog/createOrEdit', component: CreateOrEditAppTenantActivityLogComponent   },
                    { path: 'appSubScriptionPlan/appTenantActivitiesLog/view', component: ViewAppTenantActivityLogComponent  },
                    { path: 'appSubScriptionPlan/appSubscriptionPlanDetails', component: AppSubscriptionPlanDetailsComponent, data: { permission: 'Pages.Administration.AppSubscriptionPlanDetails' }  },
                    { path: 'appSubScriptionPlan/appTenantSubscriptionPlans', component: AppTenantSubscriptionPlansComponent, data: { permission: 'Pages.Administration.AppTenantSubscriptionPlans' }  },
                    { path: 'appSubScriptionPlan/appTenantSubscriptionPlans/createOrEdit', component: CreateOrEditAppTenantSubscriptionPlanComponent },
                    { path: 'appSubScriptionPlan/appTenantSubscriptionPlans/view', component: ViewAppTenantSubscriptionPlanComponent, data: { permission: 'Pages.Administration.AppTenantSubscriptionPlans' }  },
                    { path: 'appSubScriptionPlan/appFeatures', component: AppFeaturesComponent, data: { permission: 'Pages.Administration.AppFeatures' }  },
                    { path: 'appSubScriptionPlan/appFeatures/createOrEdit', component: CreateOrEditAppFeatureComponent, data: { permission: 'Pages.Administration.AppFeatures.Create' }  },
                    { path: 'appSubScriptionPlan/appFeatures/view', component: ViewAppFeatureComponent, data: { permission: 'Pages.Administration.AppFeatures' }  },
                    { path: 'maintainances/maintainances', component: MaintainancesComponent, data: { permission: 'Pages.Administration.Maintainances' }  },
                    { path: 'sycIdentifierDefinitions/sycIdentifierDefinitions', component: SycIdentifierDefinitionsComponent, data: { permission: 'Pages.Administration.SycIdentifierDefinitions' }  },
                    { path: 'sycSegmentIdentifierDefinitions/sycSegmentIdentifierDefinitions', component: SycSegmentIdentifierDefinitionsComponent, data: { permission: 'Pages.Administration.SycSegmentIdentifierDefinitions' }  },
                    { path: 'sycCounters/sycCounters', component: SycCountersComponent, data: { permission: 'Pages.Administration.SycCounters' }  },
                    { path: 'appAdvertisements/appAdvertisements', component: AppAdvertisementsComponent, data: { permission: 'Pages.Administration.AppAdvertisements' }  },
                    { path: 'appAdvertisements/appAdvertisements/createOrEdit', component: CreateOrEditAppAdvertisementComponent, data: { permission: 'Pages.Administration.AppAdvertisements.Create' }  },
                    { path: 'appAdvertisements/appAdvertisements/view', component: ViewAppAdvertisementComponent, data: { permission: 'Pages.Administration.AppAdvertisements' }  },
                   { path: 'appTenantsActivitiesLogs/appTenantsActivitiesLogs', component: AppTenantActivitiesLogComponent , data: { permission: 'Pages.Administration.AppTenantsActivitiesLogs' }  },
                    { path: 'appTenantPlans/appTenantPlans', component: AppTenantPlansComponent, data: { permission: 'Pages.Administration.AppTenantPlans' }  },
                    { path: 'appTransactions/appTransactions', component: AppTransactionsComponent, data: { permission: 'Pages.Administration.AppTransactions' }  },
                    { path: 'appTransactions/MyTransactions', component: AppTransactionsBrowseComponent , data: { permission: 'Pages.AppSiiwiiTransactions' } } ,
                  //  { path: 'appTransactions/MyTransactions', component: AppTransactionsBrowseComponent } ,
                    { path: 'sycPlanServices/sycPlanServices', component: SycPlanServicesComponent, data: { permission: 'Pages.Administration.SycPlanServices' }  },
                    { path: 'sycPlans/sycPlans', component: SycPlansComponent, data: { permission: 'Pages.Administration.SycPlans' }  },
                    { path: 'sycServices/sycServices', component: SycServicesComponent, data: { permission: 'Pages.Administration.SycServices' }  },
                    { path: 'sycApplications/sycApplications', component: SycApplicationsComponent, data: { permission: 'Pages.Administration.SycApplications' }  },
                    { path: 'autoTaskTicketNotes/ticketNotes', component: TicketNotesComponent, data: { permission: 'Pages.Administration.TicketNotes' }  },
                    { path: 'autoTaskTickets/tickets', component: TicketsComponent, data: { permission: 'Pages.Administration.Tickets' }  },
                    { path: 'users', component: UsersComponent, data: { permission: 'Pages.Administration.Users' } },
                    { path: 'roles', component: RolesComponent, data: { permission: 'Pages.Administration.Roles' } },
                    { path: 'auditLogs', component: AuditLogsComponent, data: { permission: 'Pages.Administration.AuditLogs' } },
                    { path: 'maintenance', component: MaintenanceComponent, data: { permission: 'Pages.Administration.Host.Maintenance' } },
                    { path: 'hostSettings', component: HostSettingsComponent, data: { permission: 'Pages.Administration.Host.Settings' } },
                    { path: 'editions', component: EditionsComponent, data: { permission: 'Pages.Editions' } },
                    { path: 'languages', component: LanguagesComponent, data: { permission: 'Pages.Administration.Languages' } },
                    { path: 'languages/:name/texts', component: LanguageTextsComponent, data: { permission: 'Pages.Administration.Languages.ChangeTexts' } },
                    { path: 'tenants', component: TenantsComponent, data: { permission: 'Pages.Tenants' } },
                    { path: 'organization-units', component: OrganizationUnitsComponent, data: { permission: 'Pages.Administration.OrganizationUnits' } },
                    { path: 'subscription-management', component: SubscriptionManagementComponent, data: { permission: 'Pages.Administration.Tenant.SubscriptionManagement' } },
                    { path: 'invoice/:paymentId', component: InvoiceComponent, data: { permission: 'Pages.Administration.Tenant.SubscriptionManagement' } },
                    { path: 'tenantSettings', component: TenantSettingsComponent, data: { permission: 'Pages.Administration.Tenant.Settings' } },
                    { path: 'hostDashboard', component: HostDashboardComponent, data: { permission: 'Pages.Administration.Host.Dashboard' } },
                    { path: 'demo-ui-components', component: DemoUiComponentsComponent, data: { permission: 'Pages.DemoUiComponents' } },
                    { path: 'install', component: InstallComponent },
                    { path: 'ui-customization', component: UiCustomizationComponent },
                    { path: 'webhook-subscriptions', component: WebhookSubscriptionComponent, data: { permission: 'Pages.Administration.WebhookSubscription' } },
                    { path: 'webhook-subscriptions-detail', component: WebhookSubscriptionDetailComponent, data: { permission: 'Pages.Administration.WebhookSubscription.Detail' } },
                    { path: 'webhook-event-detail', component: WebhookEventDetailComponent, data: { permission: 'Pages.Administration.WebhookSubscription.Detail' } },
                    // { path: 'dynamic-parameter', component: DynamicParameterComponent, data: { permission: 'Pages.Administration.DynamicParameters' } },
                    // { path: 'dynamic-parameter-detail', component: DynamicParameterDetailComponent, data: { permission: 'Pages.Administration.DynamicParameters' } },
                    // { path: 'entity-dynamic-parameter', component: EntityDynamicParameterComponent, data: { permission: 'Pages.Administration.EntityDynamicParameters' } },
                    // { path: 'entity-dynamic-parameter-value/manage-all/:entityFullName/:rowId', component: EntityDynamicParameterValueComponent, data: { permission: 'Pages.Administration.EntityDynamicParameters' } },
                    { path: '', redirectTo: 'hostDashboard', pathMatch: 'full' },
                    { path: '**', redirectTo: 'hostDashboard' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class AdminRoutingModule {

    constructor(
        private router: Router
    ) {
        router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                window.scroll(0, 0);
            }
        });
    }
}
