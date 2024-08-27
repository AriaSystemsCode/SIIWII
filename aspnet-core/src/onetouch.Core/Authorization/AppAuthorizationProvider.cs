using Abp.Authorization;
using Abp.Configuration.Startup;
using Abp.Localization;
using Abp.MultiTenancy;

namespace onetouch.Authorization
{
    /// <summary>
    /// Application's authorization provider.
    /// Defines permissions for the application.
    /// See <see cref="AppPermissions"/> for all permission names.
    /// </summary>
    public class AppAuthorizationProvider : AuthorizationProvider
    {
        private readonly bool _isMultiTenancyEnabled;

        public AppAuthorizationProvider(bool isMultiTenancyEnabled)
        {
            _isMultiTenancyEnabled = isMultiTenancyEnabled;
        }

        public AppAuthorizationProvider(IMultiTenancyConfig multiTenancyConfig)
        {
            _isMultiTenancyEnabled = multiTenancyConfig.IsEnabled;
        }

        public override void SetPermissions(IPermissionDefinitionContext context)
        {
            //COMMON PERMISSIONS (FOR BOTH OF TENANTS AND HOST)

            var pages = context.GetPermissionOrNull(AppPermissions.Pages) ?? context.CreatePermission(AppPermissions.Pages, L("Pages"));

            var appTenantActivitiesLog = pages.CreateChildPermission(AppPermissions.Pages_AppTenantActivitiesLog, L("AppTenantActivitiesLog"), multiTenancySides: MultiTenancySides.Host);
            appTenantActivitiesLog.CreateChildPermission(AppPermissions.Pages_AppTenantActivitiesLog_Create, L("CreateNewAppTenantActivityLog"), multiTenancySides: MultiTenancySides.Host);
            appTenantActivitiesLog.CreateChildPermission(AppPermissions.Pages_AppTenantActivitiesLog_Edit, L("EditAppTenantActivityLog"), multiTenancySides: MultiTenancySides.Host);
            appTenantActivitiesLog.CreateChildPermission(AppPermissions.Pages_AppTenantActivitiesLog_Delete, L("DeleteAppTenantActivityLog"), multiTenancySides: MultiTenancySides.Host);

            var appSubscriptionPlanHeaders = pages.CreateChildPermission(AppPermissions.Pages_AppSubscriptionPlanHeaders, L("AppSubscriptionPlanHeaders"), multiTenancySides: MultiTenancySides.Host);
            appSubscriptionPlanHeaders.CreateChildPermission(AppPermissions.Pages_AppSubscriptionPlanHeaders_Create, L("CreateNewAppSubscriptionPlanHeader"), multiTenancySides: MultiTenancySides.Host);
            appSubscriptionPlanHeaders.CreateChildPermission(AppPermissions.Pages_AppSubscriptionPlanHeaders_Edit, L("EditAppSubscriptionPlanHeader"), multiTenancySides: MultiTenancySides.Host);
            appSubscriptionPlanHeaders.CreateChildPermission(AppPermissions.Pages_AppSubscriptionPlanHeaders_Delete, L("DeleteAppSubscriptionPlanHeader"), multiTenancySides: MultiTenancySides.Host);

            var appItemSelectors = pages.CreateChildPermission(AppPermissions.Pages_AppItemSelectors, L("AppItemSelectors"));
            appItemSelectors.CreateChildPermission(AppPermissions.Pages_AppItemSelectors_Create, L("CreateNewAppItemSelector"));
            appItemSelectors.CreateChildPermission(AppPermissions.Pages_AppItemSelectors_Edit, L("EditAppItemSelector"));
            appItemSelectors.CreateChildPermission(AppPermissions.Pages_AppItemSelectors_Delete, L("DeleteAppItemSelector"));

            var sycAttachmentTypes = pages.CreateChildPermission(AppPermissions.Pages_SycAttachmentTypes, L("SycAttachmentTypes"), multiTenancySides: MultiTenancySides.Host);
            sycAttachmentTypes.CreateChildPermission(AppPermissions.Pages_SycAttachmentTypes_Create, L("CreateNewSycAttachmentType"), multiTenancySides: MultiTenancySides.Host);
            sycAttachmentTypes.CreateChildPermission(AppPermissions.Pages_SycAttachmentTypes_Edit, L("EditSycAttachmentType"), multiTenancySides: MultiTenancySides.Host);
            sycAttachmentTypes.CreateChildPermission(AppPermissions.Pages_SycAttachmentTypes_Delete, L("DeleteSycAttachmentType"), multiTenancySides: MultiTenancySides.Host);

            var sycTenantInvitatios = pages.CreateChildPermission(AppPermissions.Pages_SycTenantInvitatios, L("SycTenantInvitatios"), multiTenancySides: MultiTenancySides.Tenant);
            sycTenantInvitatios.CreateChildPermission(AppPermissions.Pages_SycTenantInvitatios_Create, L("CreateNewSycTenantInvitatios"), multiTenancySides: MultiTenancySides.Tenant);
            sycTenantInvitatios.CreateChildPermission(AppPermissions.Pages_SycTenantInvitatios_Edit, L("EditSycTenantInvitatios"), multiTenancySides: MultiTenancySides.Tenant);
            sycTenantInvitatios.CreateChildPermission(AppPermissions.Pages_SycTenantInvitatios_Delete, L("DeleteSycTenantInvitatios"), multiTenancySides: MultiTenancySides.Tenant);

            var appEventGuests = pages.CreateChildPermission(AppPermissions.Pages_AppEventGuests, L("AppEventGuests"));
            appEventGuests.CreateChildPermission(AppPermissions.Pages_AppEventGuests_Create, L("CreateNewAppEventGuest"));
            appEventGuests.CreateChildPermission(AppPermissions.Pages_AppEventGuests_Edit, L("EditAppEventGuest"));
            appEventGuests.CreateChildPermission(AppPermissions.Pages_AppEventGuests_Delete, L("DeleteAppEventGuest"));

            var appEvents = pages.CreateChildPermission(AppPermissions.Pages_AppEvents, L("AppEvents"));
            appEvents.CreateChildPermission(AppPermissions.Pages_AppEvents_Create, L("CreateNewAppEvent"));
            appEvents.CreateChildPermission(AppPermissions.Pages_AppEvents_Edit, L("EditAppEvent"));
            appEvents.CreateChildPermission(AppPermissions.Pages_AppEvents_Delete, L("DeleteAppEvent"));

            var appPosts = pages.CreateChildPermission(AppPermissions.Pages_AppPosts, L("AppPosts"));
            appPosts.CreateChildPermission(AppPermissions.Pages_AppPosts_Create, L("CreateNewAppPost"));
            appPosts.CreateChildPermission(AppPermissions.Pages_AppPosts_Edit, L("EditAppPost"));
            appPosts.CreateChildPermission(AppPermissions.Pages_AppPosts_Delete, L("DeleteAppPost"));

            var appItemsLists = pages.CreateChildPermission(AppPermissions.Pages_AppItemsLists, L("AppItemsLists"), multiTenancySides: MultiTenancySides.Tenant);
            appItemsLists.CreateChildPermission(AppPermissions.Pages_AppItemsLists_Create, L("CreateNewAppItemsList"), multiTenancySides: MultiTenancySides.Tenant);
            appItemsLists.CreateChildPermission(AppPermissions.Pages_AppItemsLists_Edit, L("EditAppItemsList"), multiTenancySides: MultiTenancySides.Tenant);
            appItemsLists.CreateChildPermission(AppPermissions.Pages_AppItemsLists_Delete, L("DeleteAppItemsList"), multiTenancySides: MultiTenancySides.Tenant);
            appItemsLists.CreateChildPermission(AppPermissions.Pages_AppItemsLists_Print, L("PrintAppItemsList"), multiTenancySides: MultiTenancySides.Tenant);
            appItemsLists.CreateChildPermission(AppPermissions.Pages_AppItemsLists_Publish, L("PublishAppItemsList"), multiTenancySides: MultiTenancySides.Tenant);

            var autotaskQueues = pages.CreateChildPermission(AppPermissions.Pages_AutotaskQueues, L("AutotaskQueues"), multiTenancySides: MultiTenancySides.Host);
            autotaskQueues.CreateChildPermission(AppPermissions.Pages_AutotaskQueues_Create, L("CreateNewAutotaskQueue"), multiTenancySides: MultiTenancySides.Host);
            autotaskQueues.CreateChildPermission(AppPermissions.Pages_AutotaskQueues_Edit, L("EditAutotaskQueue"), multiTenancySides: MultiTenancySides.Host);
            autotaskQueues.CreateChildPermission(AppPermissions.Pages_AutotaskQueues_Delete, L("DeleteAutotaskQueue"), multiTenancySides: MultiTenancySides.Host);

            var appSiiwiiTransactions = pages.CreateChildPermission(AppPermissions.Pages_AppSiiwiiTransactions, L("AppSiiwiiTransactions"), multiTenancySides: MultiTenancySides.Tenant);

            var appItems = pages.CreateChildPermission(AppPermissions.Pages_AppItems, L("AppItems"), multiTenancySides: MultiTenancySides.Tenant);
            appItems.CreateChildPermission(AppPermissions.Pages_AppItems_Create, L("CreateNewAppItem"), multiTenancySides: MultiTenancySides.Tenant);
            appItems.CreateChildPermission(AppPermissions.Pages_AppItems_Edit, L("EditAppItem"), multiTenancySides: MultiTenancySides.Tenant);
            appItems.CreateChildPermission(AppPermissions.Pages_AppItems_Delete, L("DeleteAppItem"), multiTenancySides: MultiTenancySides.Tenant);
            appItems.CreateChildPermission(AppPermissions.Pages_AppItems_Publish, L("PublishListing"), multiTenancySides: MultiTenancySides.Tenant);
            appItems.CreateChildPermission(AppPermissions.Pages_AppItems_CreateListing, L("CreateListing"), multiTenancySides: MultiTenancySides.Tenant);
            appItems.CreateChildPermission(AppPermissions.Pages_AppItems_EditListing, L("EditListing"), multiTenancySides: MultiTenancySides.Tenant);
            appItems.CreateChildPermission(AppPermissions.Pages_AppItems_DeleteListing, L("DeleteListing"), multiTenancySides: MultiTenancySides.Tenant);

            var accounts = pages.CreateChildPermission(AppPermissions.Pages_Accounts, L("Accounts"));
            accounts.CreateChildPermission(AppPermissions.Pages_Accounts_Create, L("CreateNewAccount"));
            accounts.CreateChildPermission(AppPermissions.Pages_Accounts_Edit, L("EditAccount"));
            accounts.CreateChildPermission(AppPermissions.Pages_Accounts_Delete, L("DeleteAccount"));
            accounts.CreateChildPermission(AppPermissions.Pages_Accounts_Members_List, L("ViewMembersList"));
            accounts.CreateChildPermission(AppPermissions.Pages_Accounts_Member_Create, L("CreateMember"));
            accounts.CreateChildPermission(AppPermissions.Pages_Accounts_Member_Edit, L("EditMember"));
            accounts.CreateChildPermission(AppPermissions.Pages_Accounts_Member_Delete, L("DeleteMember"));
            accounts.CreateChildPermission(AppPermissions.Pages_Accounts_Publish, L("PublishProfile"));

            var sycAttachmentCategories = pages.CreateChildPermission(AppPermissions.Pages_SycAttachmentCategories, L("SycAttachmentCategories"), multiTenancySides: MultiTenancySides.Host);
            sycAttachmentCategories.CreateChildPermission(AppPermissions.Pages_SycAttachmentCategories_Create, L("CreateNewSycAttachmentCategory"), multiTenancySides: MultiTenancySides.Host);
            sycAttachmentCategories.CreateChildPermission(AppPermissions.Pages_SycAttachmentCategories_Edit, L("EditSycAttachmentCategory"), multiTenancySides: MultiTenancySides.Host);
            sycAttachmentCategories.CreateChildPermission(AppPermissions.Pages_SycAttachmentCategories_Delete, L("DeleteSycAttachmentCategory"), multiTenancySides: MultiTenancySides.Host);

            var accountInfoTemps = pages.CreateChildPermission(AppPermissions.Pages_AccountInfo, L("AccountInfo"), multiTenancySides: MultiTenancySides.Tenant);
            accountInfoTemps.CreateChildPermission(AppPermissions.Pages_AccountInfo_Edit, L("UpdateProfile"));
            accountInfoTemps.CreateChildPermission(AppPermissions.Pages_AccountInfo_Publish, L("PublishProfile"));

            var suiIcons = pages.CreateChildPermission(AppPermissions.Pages_SuiIcons, L("SuiIcons"), multiTenancySides: MultiTenancySides.Host);
            suiIcons.CreateChildPermission(AppPermissions.Pages_SuiIcons_Create, L("CreateNewSuiIcon"), multiTenancySides: MultiTenancySides.Host);
            suiIcons.CreateChildPermission(AppPermissions.Pages_SuiIcons_Edit, L("EditSuiIcon"), multiTenancySides: MultiTenancySides.Host);
            suiIcons.CreateChildPermission(AppPermissions.Pages_SuiIcons_Delete, L("DeleteSuiIcon"), multiTenancySides: MultiTenancySides.Host);

            var appEntities = pages.CreateChildPermission(AppPermissions.Pages_AppEntities, L("AppEntities"));
            appEntities.CreateChildPermission(AppPermissions.Pages_AppEntities_Create, L("CreateNewAppEntity"));
            appEntities.CreateChildPermission(AppPermissions.Pages_AppEntities_Edit, L("EditAppEntity"));
            appEntities.CreateChildPermission(AppPermissions.Pages_AppEntities_Delete, L("DeleteAppEntity"));

            var sycEntityObjectClassifications = pages.CreateChildPermission(AppPermissions.Pages_SycEntityObjectClassifications, L("SycEntityObjectClassifications"));
            sycEntityObjectClassifications.CreateChildPermission(AppPermissions.Pages_SycEntityObjectClassifications_Create, L("CreateNewSycEntityObjectClassification"));
            sycEntityObjectClassifications.CreateChildPermission(AppPermissions.Pages_SycEntityObjectClassifications_Edit, L("EditSycEntityObjectClassification"));
            sycEntityObjectClassifications.CreateChildPermission(AppPermissions.Pages_SycEntityObjectClassifications_Delete, L("DeleteSycEntityObjectClassification"));

            var sycEntityObjectStatuses = pages.CreateChildPermission(AppPermissions.Pages_SycEntityObjectStatuses, L("SycEntityObjectStatuses"), multiTenancySides: MultiTenancySides.Host);
            sycEntityObjectStatuses.CreateChildPermission(AppPermissions.Pages_SycEntityObjectStatuses_Create, L("CreateNewSycEntityObjectStatus"), multiTenancySides: MultiTenancySides.Host);
            sycEntityObjectStatuses.CreateChildPermission(AppPermissions.Pages_SycEntityObjectStatuses_Edit, L("EditSycEntityObjectStatus"), multiTenancySides: MultiTenancySides.Host);
            sycEntityObjectStatuses.CreateChildPermission(AppPermissions.Pages_SycEntityObjectStatuses_Delete, L("DeleteSycEntityObjectStatus"), multiTenancySides: MultiTenancySides.Host);

            var sycEntityObjectCategories = pages.CreateChildPermission(AppPermissions.Pages_SycEntityObjectCategories, L("SycEntityObjectCategories"));
            sycEntityObjectCategories.CreateChildPermission(AppPermissions.Pages_SycEntityObjectCategories_Create, L("CreateNewSycEntityObjectCategory"));
            sycEntityObjectCategories.CreateChildPermission(AppPermissions.Pages_SycEntityObjectCategories_Edit, L("EditSycEntityObjectCategory"));
            sycEntityObjectCategories.CreateChildPermission(AppPermissions.Pages_SycEntityObjectCategories_Delete, L("DeleteSycEntityObjectCategory"));

            var sycEntityObjectTypes = pages.CreateChildPermission(AppPermissions.Pages_SycEntityObjectTypes, L("SycEntityObjectTypes"), multiTenancySides: MultiTenancySides.Host);
            sycEntityObjectTypes.CreateChildPermission(AppPermissions.Pages_SycEntityObjectTypes_Create, L("CreateNewSycEntityObjectType"), multiTenancySides: MultiTenancySides.Host);
            sycEntityObjectTypes.CreateChildPermission(AppPermissions.Pages_SycEntityObjectTypes_Edit, L("EditSycEntityObjectType"), multiTenancySides: MultiTenancySides.Host);
            sycEntityObjectTypes.CreateChildPermission(AppPermissions.Pages_SycEntityObjectTypes_Delete, L("DeleteSycEntityObjectType"), multiTenancySides: MultiTenancySides.Host);

            var sydObjects = pages.CreateChildPermission(AppPermissions.Pages_SydObjects, L("SydObjects"), multiTenancySides: MultiTenancySides.Host);
            sydObjects.CreateChildPermission(AppPermissions.Pages_SydObjects_Create, L("CreateNewSydObject"), multiTenancySides: MultiTenancySides.Host);
            sydObjects.CreateChildPermission(AppPermissions.Pages_SydObjects_Edit, L("EditSydObject"), multiTenancySides: MultiTenancySides.Host);
            sydObjects.CreateChildPermission(AppPermissions.Pages_SydObjects_Delete, L("DeleteSydObject"), multiTenancySides: MultiTenancySides.Host);

            var sysObjectTypes = pages.CreateChildPermission(AppPermissions.Pages_SysObjectTypes, L("SysObjectTypes"), multiTenancySides: MultiTenancySides.Host);
            sysObjectTypes.CreateChildPermission(AppPermissions.Pages_SysObjectTypes_Create, L("CreateNewSysObjectType"), multiTenancySides: MultiTenancySides.Host);
            sysObjectTypes.CreateChildPermission(AppPermissions.Pages_SysObjectTypes_Edit, L("EditSysObjectType"), multiTenancySides: MultiTenancySides.Host);
            sysObjectTypes.CreateChildPermission(AppPermissions.Pages_SysObjectTypes_Delete, L("DeleteSysObjectType"), multiTenancySides: MultiTenancySides.Host);

            pages.CreateChildPermission(AppPermissions.Pages_DemoUiComponents, L("DemoUiComponents"), multiTenancySides: MultiTenancySides.Host);

            var administration = pages.CreateChildPermission(AppPermissions.Pages_Administration, L("Administration"));

            var sycCurrencyExchangeRates = administration.CreateChildPermission(AppPermissions.Pages_Administration_SycCurrencyExchangeRates, L("SycCurrencyExchangeRates"), multiTenancySides: MultiTenancySides.Host);
            sycCurrencyExchangeRates.CreateChildPermission(AppPermissions.Pages_Administration_SycCurrencyExchangeRates_Create, L("CreateNewSycCurrencyExchangeRates"), multiTenancySides: MultiTenancySides.Host);
            sycCurrencyExchangeRates.CreateChildPermission(AppPermissions.Pages_Administration_SycCurrencyExchangeRates_Edit, L("EditSycCurrencyExchangeRates"), multiTenancySides: MultiTenancySides.Host);
            sycCurrencyExchangeRates.CreateChildPermission(AppPermissions.Pages_Administration_SycCurrencyExchangeRates_Delete, L("DeleteSycCurrencyExchangeRates"), multiTenancySides: MultiTenancySides.Host);

            var appTenantInvoices = administration.CreateChildPermission(AppPermissions.Pages_Administration_AppTenantInvoices, L("AppTenantInvoices"));
            appTenantInvoices.CreateChildPermission(AppPermissions.Pages_Administration_AppTenantInvoices_Create, L("CreateNewAppTenantInvoice"), multiTenancySides: MultiTenancySides.Host);
            appTenantInvoices.CreateChildPermission(AppPermissions.Pages_Administration_AppTenantInvoices_Edit, L("EditAppTenantInvoice"), multiTenancySides: MultiTenancySides.Host);
            appTenantInvoices.CreateChildPermission(AppPermissions.Pages_Administration_AppTenantInvoices_Delete, L("DeleteAppTenantInvoice"), multiTenancySides: MultiTenancySides.Host);

            // var appTenantActivitiesLog = administration.CreateChildPermission(AppPermissions.Pages_Administration_AppTenantActivitiesLog, L("AppTenantActivitiesLog"), multiTenancySides: MultiTenancySides.Host);
            //  appTenantActivitiesLog.CreateChildPermission(AppPermissions.Pages_Administration_AppTenantActivitiesLog_Create, L("CreateNewAppTenantActivityLog"), multiTenancySides: MultiTenancySides.Host);
            //  appTenantActivitiesLog.CreateChildPermission(AppPermissions.Pages_Administration_AppTenantActivitiesLog_Edit, L("EditAppTenantActivityLog"), multiTenancySides: MultiTenancySides.Host);
            //  appTenantActivitiesLog.CreateChildPermission(AppPermissions.Pages_Administration_AppTenantActivitiesLog_Delete, L("DeleteAppTenantActivityLog"), multiTenancySides: MultiTenancySides.Host);

            var appTenantSubscriptionPlans = administration.CreateChildPermission(AppPermissions.Pages_Administration_AppTenantSubscriptionPlans, L("AppTenantSubscriptionPlans"), multiTenancySides: MultiTenancySides.Host);
            appTenantSubscriptionPlans.CreateChildPermission(AppPermissions.Pages_Administration_AppTenantSubscriptionPlans_Create, L("CreateNewAppTenantSubscriptionPlan"), multiTenancySides: MultiTenancySides.Host);
            appTenantSubscriptionPlans.CreateChildPermission(AppPermissions.Pages_Administration_AppTenantSubscriptionPlans_Edit, L("EditAppTenantSubscriptionPlan"), multiTenancySides: MultiTenancySides.Host);
            appTenantSubscriptionPlans.CreateChildPermission(AppPermissions.Pages_Administration_AppTenantSubscriptionPlans_Delete, L("DeleteAppTenantSubscriptionPlan"), multiTenancySides: MultiTenancySides.Host);

            var appSubscriptionPlanDetails = administration.CreateChildPermission(AppPermissions.Pages_Administration_AppSubscriptionPlanDetails, L("AppSubscriptionPlanDetails"), multiTenancySides: MultiTenancySides.Host);
            appSubscriptionPlanDetails.CreateChildPermission(AppPermissions.Pages_Administration_AppSubscriptionPlanDetails_Create, L("CreateNewAppSubscriptionPlanDetail"), multiTenancySides: MultiTenancySides.Host);
            appSubscriptionPlanDetails.CreateChildPermission(AppPermissions.Pages_Administration_AppSubscriptionPlanDetails_Edit, L("EditAppSubscriptionPlanDetail"), multiTenancySides: MultiTenancySides.Host);
            appSubscriptionPlanDetails.CreateChildPermission(AppPermissions.Pages_Administration_AppSubscriptionPlanDetails_Delete, L("DeleteAppSubscriptionPlanDetail"), multiTenancySides: MultiTenancySides.Host);

            var appFeatures = administration.CreateChildPermission(AppPermissions.Pages_Administration_AppFeatures, L("AppFeatures"), multiTenancySides: MultiTenancySides.Host);
            appFeatures.CreateChildPermission(AppPermissions.Pages_Administration_AppFeatures_Create, L("CreateNewAppFeature"), multiTenancySides: MultiTenancySides.Host);
            appFeatures.CreateChildPermission(AppPermissions.Pages_Administration_AppFeatures_Edit, L("EditAppFeature"), multiTenancySides: MultiTenancySides.Host);
            appFeatures.CreateChildPermission(AppPermissions.Pages_Administration_AppFeatures_Delete, L("DeleteAppFeature"), multiTenancySides: MultiTenancySides.Host);

            var maintainances = administration.CreateChildPermission(AppPermissions.Pages_Administration_Maintainances, L("Maintainances"), multiTenancySides: MultiTenancySides.Host);
            maintainances.CreateChildPermission(AppPermissions.Pages_Administration_Maintainances_Create, L("CreateNewMaintainance"), multiTenancySides: MultiTenancySides.Host);
            maintainances.CreateChildPermission(AppPermissions.Pages_Administration_Maintainances_Edit, L("EditMaintainance"), multiTenancySides: MultiTenancySides.Host);
            maintainances.CreateChildPermission(AppPermissions.Pages_Administration_Maintainances_Delete, L("DeleteMaintainance"), multiTenancySides: MultiTenancySides.Host);

            var sycIdentifierDefinitions = administration.CreateChildPermission(AppPermissions.Pages_Administration_SycIdentifierDefinitions, L("SycIdentifierDefinitions"), multiTenancySides: MultiTenancySides.Host);
            sycIdentifierDefinitions.CreateChildPermission(AppPermissions.Pages_Administration_SycIdentifierDefinitions_Create, L("CreateNewSycIdentifierDefinition"), multiTenancySides: MultiTenancySides.Host);
            sycIdentifierDefinitions.CreateChildPermission(AppPermissions.Pages_Administration_SycIdentifierDefinitions_Edit, L("EditSycIdentifierDefinition"), multiTenancySides: MultiTenancySides.Host);
            sycIdentifierDefinitions.CreateChildPermission(AppPermissions.Pages_Administration_SycIdentifierDefinitions_Delete, L("DeleteSycIdentifierDefinition"), multiTenancySides: MultiTenancySides.Host);

            var sycSegmentIdentifierDefinitions = administration.CreateChildPermission(AppPermissions.Pages_Administration_SycSegmentIdentifierDefinitions, L("SycSegmentIdentifierDefinitions"), multiTenancySides: MultiTenancySides.Host);
            sycSegmentIdentifierDefinitions.CreateChildPermission(AppPermissions.Pages_Administration_SycSegmentIdentifierDefinitions_Create, L("CreateNewSycSegmentIdentifierDefinition"), multiTenancySides: MultiTenancySides.Host);
            sycSegmentIdentifierDefinitions.CreateChildPermission(AppPermissions.Pages_Administration_SycSegmentIdentifierDefinitions_Edit, L("EditSycSegmentIdentifierDefinition"), multiTenancySides: MultiTenancySides.Host);
            sycSegmentIdentifierDefinitions.CreateChildPermission(AppPermissions.Pages_Administration_SycSegmentIdentifierDefinitions_Delete, L("DeleteSycSegmentIdentifierDefinition"), multiTenancySides: MultiTenancySides.Host);

            var sycCounters = administration.CreateChildPermission(AppPermissions.Pages_Administration_SycCounters, L("SycCounters"), multiTenancySides: MultiTenancySides.Host);
            sycCounters.CreateChildPermission(AppPermissions.Pages_Administration_SycCounters_Create, L("CreateNewSycCounter"), multiTenancySides: MultiTenancySides.Host);
            sycCounters.CreateChildPermission(AppPermissions.Pages_Administration_SycCounters_Edit, L("EditSycCounter"), multiTenancySides: MultiTenancySides.Host);
            sycCounters.CreateChildPermission(AppPermissions.Pages_Administration_SycCounters_Delete, L("DeleteSycCounter"), multiTenancySides: MultiTenancySides.Host);

            var appAdvertisements = administration.CreateChildPermission(AppPermissions.Pages_Administration_AppAdvertisements, L("AppAdvertisements"), multiTenancySides: MultiTenancySides.Host);
            appAdvertisements.CreateChildPermission(AppPermissions.Pages_Administration_AppAdvertisements_Create, L("CreateNewAppAdvertisement"), multiTenancySides: MultiTenancySides.Host);
            appAdvertisements.CreateChildPermission(AppPermissions.Pages_Administration_AppAdvertisements_Edit, L("EditAppAdvertisement"), multiTenancySides: MultiTenancySides.Host);
            appAdvertisements.CreateChildPermission(AppPermissions.Pages_Administration_AppAdvertisements_Delete, L("DeleteAppAdvertisement"), multiTenancySides: MultiTenancySides.Host);

            var ticketNotes = administration.CreateChildPermission(AppPermissions.Pages_Administration_TicketNotes, L("TicketNotes"), multiTenancySides: MultiTenancySides.Host);
            ticketNotes.CreateChildPermission(AppPermissions.Pages_Administration_TicketNotes_Create, L("CreateNewTicketNote"), multiTenancySides: MultiTenancySides.Host);
            ticketNotes.CreateChildPermission(AppPermissions.Pages_Administration_TicketNotes_Edit, L("EditTicketNote"), multiTenancySides: MultiTenancySides.Host);
            ticketNotes.CreateChildPermission(AppPermissions.Pages_Administration_TicketNotes_Delete, L("DeleteTicketNote"), multiTenancySides: MultiTenancySides.Host);

            var tickets = administration.CreateChildPermission(AppPermissions.Pages_Administration_Tickets, L("Tickets"), multiTenancySides: MultiTenancySides.Host);
            tickets.CreateChildPermission(AppPermissions.Pages_Administration_Tickets_Create, L("CreateNewTicket"), multiTenancySides: MultiTenancySides.Host);
            tickets.CreateChildPermission(AppPermissions.Pages_Administration_Tickets_Edit, L("EditTicket"), multiTenancySides: MultiTenancySides.Host);
            tickets.CreateChildPermission(AppPermissions.Pages_Administration_Tickets_Delete, L("DeleteTicket"), multiTenancySides: MultiTenancySides.Host);

            var appTenantsActivitiesLogs = administration.CreateChildPermission(AppPermissions.Pages_Administration_AppTenantsActivitiesLogs, L("AppTenantsActivitiesLogs"), multiTenancySides: MultiTenancySides.Host);
            appTenantsActivitiesLogs.CreateChildPermission(AppPermissions.Pages_Administration_AppTenantsActivitiesLogs_Create, L("CreateNewAppTenantsActivitiesLog"), multiTenancySides: MultiTenancySides.Host);
            appTenantsActivitiesLogs.CreateChildPermission(AppPermissions.Pages_Administration_AppTenantsActivitiesLogs_Edit, L("EditAppTenantsActivitiesLog"), multiTenancySides: MultiTenancySides.Host);
            appTenantsActivitiesLogs.CreateChildPermission(AppPermissions.Pages_Administration_AppTenantsActivitiesLogs_Delete, L("DeleteAppTenantsActivitiesLog"), multiTenancySides: MultiTenancySides.Host);

            var appTenantPlans = administration.CreateChildPermission(AppPermissions.Pages_Administration_AppTenantPlans, L("AppTenantPlans"), multiTenancySides: MultiTenancySides.Host);
            appTenantPlans.CreateChildPermission(AppPermissions.Pages_Administration_AppTenantPlans_Create, L("CreateNewAppTenantPlan"), multiTenancySides: MultiTenancySides.Host);
            appTenantPlans.CreateChildPermission(AppPermissions.Pages_Administration_AppTenantPlans_Edit, L("EditAppTenantPlan"), multiTenancySides: MultiTenancySides.Host);
            appTenantPlans.CreateChildPermission(AppPermissions.Pages_Administration_AppTenantPlans_Delete, L("DeleteAppTenantPlan"), multiTenancySides: MultiTenancySides.Host);

            var appTransactions = administration.CreateChildPermission(AppPermissions.Pages_Administration_AppTransactions, L("AppTransactions"), multiTenancySides: MultiTenancySides.Host);
            appTransactions.CreateChildPermission(AppPermissions.Pages_Administration_AppTransactions_Create, L("CreateNewAppTransaction"), multiTenancySides: MultiTenancySides.Host);
            appTransactions.CreateChildPermission(AppPermissions.Pages_Administration_AppTransactions_Edit, L("EditAppTransaction"), multiTenancySides: MultiTenancySides.Host);
            appTransactions.CreateChildPermission(AppPermissions.Pages_Administration_AppTransactions_Delete, L("DeleteAppTransaction"), multiTenancySides: MultiTenancySides.Host);

            var sycPlanServices = administration.CreateChildPermission(AppPermissions.Pages_Administration_SycPlanServices, L("SycPlanServices"), multiTenancySides: MultiTenancySides.Host);
            sycPlanServices.CreateChildPermission(AppPermissions.Pages_Administration_SycPlanServices_Create, L("CreateNewSycPlanService"), multiTenancySides: MultiTenancySides.Host);
            sycPlanServices.CreateChildPermission(AppPermissions.Pages_Administration_SycPlanServices_Edit, L("EditSycPlanService"), multiTenancySides: MultiTenancySides.Host);
            sycPlanServices.CreateChildPermission(AppPermissions.Pages_Administration_SycPlanServices_Delete, L("DeleteSycPlanService"), multiTenancySides: MultiTenancySides.Host);

            var sycPlans = administration.CreateChildPermission(AppPermissions.Pages_Administration_SycPlans, L("SycPlans"), multiTenancySides: MultiTenancySides.Host);
            sycPlans.CreateChildPermission(AppPermissions.Pages_Administration_SycPlans_Create, L("CreateNewSycPlan"), multiTenancySides: MultiTenancySides.Host);
            sycPlans.CreateChildPermission(AppPermissions.Pages_Administration_SycPlans_Edit, L("EditSycPlan"), multiTenancySides: MultiTenancySides.Host);
            sycPlans.CreateChildPermission(AppPermissions.Pages_Administration_SycPlans_Delete, L("DeleteSycPlan"), multiTenancySides: MultiTenancySides.Host);

            var sycServices = administration.CreateChildPermission(AppPermissions.Pages_Administration_SycServices, L("SycServices"), multiTenancySides: MultiTenancySides.Host);
            sycServices.CreateChildPermission(AppPermissions.Pages_Administration_SycServices_Create, L("CreateNewSycService"), multiTenancySides: MultiTenancySides.Host);
            sycServices.CreateChildPermission(AppPermissions.Pages_Administration_SycServices_Edit, L("EditSycService"), multiTenancySides: MultiTenancySides.Host);
            sycServices.CreateChildPermission(AppPermissions.Pages_Administration_SycServices_Delete, L("DeleteSycService"), multiTenancySides: MultiTenancySides.Host);

            var sycApplications = administration.CreateChildPermission(AppPermissions.Pages_Administration_SycApplications, L("SycApplications"), multiTenancySides: MultiTenancySides.Host);
            sycApplications.CreateChildPermission(AppPermissions.Pages_Administration_SycApplications_Create, L("CreateNewSycApplication"), multiTenancySides: MultiTenancySides.Host);
            sycApplications.CreateChildPermission(AppPermissions.Pages_Administration_SycApplications_Edit, L("EditSycApplication"), multiTenancySides: MultiTenancySides.Host);
            sycApplications.CreateChildPermission(AppPermissions.Pages_Administration_SycApplications_Delete, L("DeleteSycApplication"), multiTenancySides: MultiTenancySides.Host);

            var roles = administration.CreateChildPermission(AppPermissions.Pages_Administration_Roles, L("Roles"));
            roles.CreateChildPermission(AppPermissions.Pages_Administration_Roles_Create, L("CreatingNewRole"));
            roles.CreateChildPermission(AppPermissions.Pages_Administration_Roles_Edit, L("EditingRole"));
            roles.CreateChildPermission(AppPermissions.Pages_Administration_Roles_Delete, L("DeletingRole"));

            var users = administration.CreateChildPermission(AppPermissions.Pages_Administration_Users, L("Users"));
            users.CreateChildPermission(AppPermissions.Pages_Administration_Users_Create, L("CreatingNewUser"));
            users.CreateChildPermission(AppPermissions.Pages_Administration_Users_Edit, L("EditingUser"));
            users.CreateChildPermission(AppPermissions.Pages_Administration_Users_Delete, L("DeletingUser"));
            users.CreateChildPermission(AppPermissions.Pages_Administration_Users_ChangePermissions, L("ChangingPermissions"));
            users.CreateChildPermission(AppPermissions.Pages_Administration_Users_Impersonation, L("LoginForUsers"));
            users.CreateChildPermission(AppPermissions.Pages_Administration_Users_Unlock, L("Unlock"));

            var members = administration.CreateChildPermission(AppPermissions.Pages_Administration_Members, L("Members"));
            members.CreateChildPermission(AppPermissions.Pages_Administration_Members_List, L("ViewMembersList"));
            members.CreateChildPermission(AppPermissions.Pages_Administration_Members_Create, L("CreatingNewMember"));
            members.CreateChildPermission(AppPermissions.Pages_Administration_Members_Edit, L("EditingMember"));
            members.CreateChildPermission(AppPermissions.Pages_Administration_Members_Delete, L("DeletingMember"));
            members.CreateChildPermission(AppPermissions.Pages_Administration_Members_View, L("ViewingMember"));

            administration.CreateChildPermission(AppPermissions.Pages_Administration_AuditLogs, L("AuditLogs"), multiTenancySides: MultiTenancySides.Host);

            var organizationUnits = administration.CreateChildPermission(AppPermissions.Pages_Administration_OrganizationUnits, L("OrganizationUnits"));
            organizationUnits.CreateChildPermission(AppPermissions.Pages_Administration_OrganizationUnits_ManageOrganizationTree, L("ManagingOrganizationTree"));
            organizationUnits.CreateChildPermission(AppPermissions.Pages_Administration_OrganizationUnits_ManageMembers, L("ManagingMembers"));
            organizationUnits.CreateChildPermission(AppPermissions.Pages_Administration_OrganizationUnits_ManageRoles, L("ManagingRoles"));

            administration.CreateChildPermission(AppPermissions.Pages_Administration_UiCustomization, L("VisualSettings"), multiTenancySides: MultiTenancySides.Host);

            var webhooks = administration.CreateChildPermission(AppPermissions.Pages_Administration_WebhookSubscription, L("Webhooks"), multiTenancySides: MultiTenancySides.Host);
            webhooks.CreateChildPermission(AppPermissions.Pages_Administration_WebhookSubscription_Create, L("CreatingWebhooks"), multiTenancySides: MultiTenancySides.Host);
            webhooks.CreateChildPermission(AppPermissions.Pages_Administration_WebhookSubscription_Edit, L("EditingWebhooks"), multiTenancySides: MultiTenancySides.Host);
            webhooks.CreateChildPermission(AppPermissions.Pages_Administration_WebhookSubscription_ChangeActivity, L("ChangingWebhookActivity"), multiTenancySides: MultiTenancySides.Host);
            webhooks.CreateChildPermission(AppPermissions.Pages_Administration_WebhookSubscription_Detail, L("DetailingSubscription"), multiTenancySides: MultiTenancySides.Host);
            webhooks.CreateChildPermission(AppPermissions.Pages_Administration_Webhook_ListSendAttempts, L("ListingSendAttempts"), multiTenancySides: MultiTenancySides.Host);
            webhooks.CreateChildPermission(AppPermissions.Pages_Administration_Webhook_ResendWebhook, L("ResendingWebhook"), multiTenancySides: MultiTenancySides.Host);

            var dynamicParameters = administration.CreateChildPermission(AppPermissions.Pages_Administration_DynamicParameters, L("DynamicParameters"), multiTenancySides: MultiTenancySides.Host);
            dynamicParameters.CreateChildPermission(AppPermissions.Pages_Administration_DynamicParameters_Create, L("CreatingDynamicParameters"), multiTenancySides: MultiTenancySides.Host);
            dynamicParameters.CreateChildPermission(AppPermissions.Pages_Administration_DynamicParameters_Edit, L("EditingDynamicParameters"), multiTenancySides: MultiTenancySides.Host);
            dynamicParameters.CreateChildPermission(AppPermissions.Pages_Administration_DynamicParameters_Delete, L("DeletingDynamicParameters"), multiTenancySides: MultiTenancySides.Host);

            var dynamicParameterValues = dynamicParameters.CreateChildPermission(AppPermissions.Pages_Administration_DynamicParameterValue, L("DynamicParameterValue"), multiTenancySides: MultiTenancySides.Host);
            dynamicParameterValues.CreateChildPermission(AppPermissions.Pages_Administration_DynamicParameterValue_Create, L("CreatingDynamicParameterValue"), multiTenancySides: MultiTenancySides.Host);
            dynamicParameterValues.CreateChildPermission(AppPermissions.Pages_Administration_DynamicParameterValue_Edit, L("EditingDynamicParameterValue"), multiTenancySides: MultiTenancySides.Host);
            dynamicParameterValues.CreateChildPermission(AppPermissions.Pages_Administration_DynamicParameterValue_Delete, L("DeletingDynamicParameterValue"), multiTenancySides: MultiTenancySides.Host);

            var entityDynamicParameters = dynamicParameters.CreateChildPermission(AppPermissions.Pages_Administration_EntityDynamicParameters, L("EntityDynamicParameters"), multiTenancySides: MultiTenancySides.Host);
            entityDynamicParameters.CreateChildPermission(AppPermissions.Pages_Administration_EntityDynamicParameters_Create, L("CreatingEntityDynamicParameters"), multiTenancySides: MultiTenancySides.Host);
            entityDynamicParameters.CreateChildPermission(AppPermissions.Pages_Administration_EntityDynamicParameters_Edit, L("EditingEntityDynamicParameters"), multiTenancySides: MultiTenancySides.Host);
            entityDynamicParameters.CreateChildPermission(AppPermissions.Pages_Administration_EntityDynamicParameters_Delete, L("DeletingEntityDynamicParameters"), multiTenancySides: MultiTenancySides.Host);

            var entityDynamicParameterValues = dynamicParameters.CreateChildPermission(AppPermissions.Pages_Administration_EntityDynamicParameterValue, L("EntityDynamicParameterValue"), multiTenancySides: MultiTenancySides.Host);
            entityDynamicParameterValues.CreateChildPermission(AppPermissions.Pages_Administration_EntityDynamicParameterValue_Create, L("CreatingEntityDynamicParameterValue"), multiTenancySides: MultiTenancySides.Host);
            entityDynamicParameterValues.CreateChildPermission(AppPermissions.Pages_Administration_EntityDynamicParameterValue_Edit, L("EditingEntityDynamicParameterValue"), multiTenancySides: MultiTenancySides.Host);
            entityDynamicParameterValues.CreateChildPermission(AppPermissions.Pages_Administration_EntityDynamicParameterValue_Delete, L("DeletingEntityDynamicParameterValue"), multiTenancySides: MultiTenancySides.Host);

            //TENANT-SPECIFIC PERMISSIONS

            pages.CreateChildPermission(AppPermissions.Pages_Tenant_Dashboard, L("Dashboard"), multiTenancySides: MultiTenancySides.Tenant);

            administration.CreateChildPermission(AppPermissions.Pages_Administration_Tenant_Settings, L("Settings"), multiTenancySides: MultiTenancySides.Tenant);
            administration.CreateChildPermission(AppPermissions.Pages_Administration_Tenant_SubscriptionManagement, L("Subscription"), multiTenancySides: MultiTenancySides.Tenant);

            //HOST-SPECIFIC PERMISSIONS

            var editions = pages.CreateChildPermission(AppPermissions.Pages_Editions, L("Editions"), multiTenancySides: MultiTenancySides.Host);
            editions.CreateChildPermission(AppPermissions.Pages_Editions_Create, L("CreatingNewEdition"), multiTenancySides: MultiTenancySides.Host);
            editions.CreateChildPermission(AppPermissions.Pages_Editions_Edit, L("EditingEdition"), multiTenancySides: MultiTenancySides.Host);
            editions.CreateChildPermission(AppPermissions.Pages_Editions_Delete, L("DeletingEdition"), multiTenancySides: MultiTenancySides.Host);
            editions.CreateChildPermission(AppPermissions.Pages_Editions_MoveTenantsToAnotherEdition, L("MoveTenantsToAnotherEdition"), multiTenancySides: MultiTenancySides.Host);

            var tenants = pages.CreateChildPermission(AppPermissions.Pages_Tenants, L("Tenants"), multiTenancySides: MultiTenancySides.Host);
            tenants.CreateChildPermission(AppPermissions.Pages_Tenants_Create, L("CreatingNewTenant"), multiTenancySides: MultiTenancySides.Host);
            tenants.CreateChildPermission(AppPermissions.Pages_Tenants_Edit, L("EditingTenant"), multiTenancySides: MultiTenancySides.Host);
            tenants.CreateChildPermission(AppPermissions.Pages_Tenants_ChangeFeatures, L("ChangingFeatures"), multiTenancySides: MultiTenancySides.Host);
            tenants.CreateChildPermission(AppPermissions.Pages_Tenants_Delete, L("DeletingTenant"), multiTenancySides: MultiTenancySides.Host);
            tenants.CreateChildPermission(AppPermissions.Pages_Tenants_Impersonation, L("LoginForTenants"), multiTenancySides: MultiTenancySides.Host);

            administration.CreateChildPermission(AppPermissions.Pages_Administration_Host_Settings, L("Settings"), multiTenancySides: MultiTenancySides.Host);
            administration.CreateChildPermission(AppPermissions.Pages_Administration_Host_Maintenance, L("Maintenance"), multiTenancySides: _isMultiTenancyEnabled ? MultiTenancySides.Host : MultiTenancySides.Tenant);
            administration.CreateChildPermission(AppPermissions.Pages_Administration_HangfireDashboard, L("HangfireDashboard"), multiTenancySides: _isMultiTenancyEnabled ? MultiTenancySides.Host : MultiTenancySides.Tenant);
            administration.CreateChildPermission(AppPermissions.Pages_Administration_Host_Dashboard, L("Dashboard"), multiTenancySides: MultiTenancySides.Host);

            var languages = administration.CreateChildPermission(AppPermissions.Pages_Administration_Languages, L("Languages"), multiTenancySides: MultiTenancySides.Host);
            languages.CreateChildPermission(AppPermissions.Pages_Administration_Languages_Create, L("CreatingNewLanguage"), multiTenancySides: MultiTenancySides.Host);
            languages.CreateChildPermission(AppPermissions.Pages_Administration_Languages_Edit, L("EditingLanguage"), multiTenancySides: MultiTenancySides.Host);
            languages.CreateChildPermission(AppPermissions.Pages_Administration_Languages_Delete, L("DeletingLanguages"), multiTenancySides: MultiTenancySides.Host);
            languages.CreateChildPermission(AppPermissions.Pages_Administration_Languages_ChangeTexts, L("ChangingTexts"), multiTenancySides: MultiTenancySides.Host);

            //Esraa [Start]
            pages.CreateChildPermission(AppPermissions.Pages_AppMessage, L("AppMessage"));
            //Esraa [End]

            var marketplace = pages.CreateChildPermission(AppPermissions.Pages_Marketplace, L("Marketplace"), multiTenancySides: MultiTenancySides.Tenant);

            marketplace.CreateChildPermission(AppPermissions.Pages_Marketplace_Events, L("MarketplaceEvents"), multiTenancySides: MultiTenancySides.Tenant);
            marketplace.CreateChildPermission(AppPermissions.Pages_Marketplace_Accounts, L("MarketplaceAccounts"), multiTenancySides: MultiTenancySides.Tenant);
            marketplace.CreateChildPermission(AppPermissions.Pages_Marketplace_Contacts, L("MarketplaceContacts"), multiTenancySides: MultiTenancySides.Tenant);
            var marketplaceProducts = marketplace.CreateChildPermission(AppPermissions.Pages_Marketplace_Products, L("MarketplaceProducts"), multiTenancySides: MultiTenancySides.Tenant);
            marketplaceProducts.CreateChildPermission(AppPermissions.Pages_Marketplace_Products_View, L("ViewMarketplaceProducts"), multiTenancySides: MultiTenancySides.Tenant);

            // var homePage = pages.CreateChildPermission(AppPermissions.Pages_HomePage, L("HomePage"));
            // homePage.CreateChildPermission(AppPermissions.Pages_HomePage_View, L("HomePageView"));

        }

        private static ILocalizableString L(string name)
        {
            return new LocalizableString(name, onetouchConsts.LocalizationSourceName);
        }
    }
}