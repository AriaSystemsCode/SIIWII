using System.Collections.Generic;


namespace onetouch.Web.DashboardCustomization
{
    public class DashboardViewConfiguration
    {
        public Dictionary<string, WidgetViewDefinition> WidgetViewDefinitions { get; } = new Dictionary<string, WidgetViewDefinition>();

        public Dictionary<string, WidgetFilterViewDefinition> WidgetFilterViewDefinitions { get; } = new Dictionary<string, WidgetFilterViewDefinition>();

        public DashboardViewConfiguration()
        {
            var jsAndCssFileRoot = "/Areas/App/Views/CustomizableDashboard/Widgets/";
            var viewFileRoot = "~/Areas/App/Views/Shared/Components/CustomizableDashboard/Widgets/";

            #region FilterViewDefinitions

            WidgetFilterViewDefinitions.Add(onetouchDashboardCustomizationConsts.Filters.FilterDateRangePicker,
                new WidgetFilterViewDefinition(
                    onetouchDashboardCustomizationConsts.Filters.FilterDateRangePicker,
                    viewFileRoot + "DateRangeFilter.cshtml",
                    jsAndCssFileRoot + "DateRangeFilter/DateRangeFilter.min.js",
                    jsAndCssFileRoot + "DateRangeFilter/DateRangeFilter.min.css")
            );
            
            //add your filters iew definitions here
            #endregion

            #region WidgetViewDefinitions

            #region TenantWidgets

            WidgetViewDefinitions.Add(onetouchDashboardCustomizationConsts.Widgets.Tenant.DailySales,
                new WidgetViewDefinition(
                    onetouchDashboardCustomizationConsts.Widgets.Tenant.DailySales,
                    viewFileRoot + "DailySales.cshtml",
                    jsAndCssFileRoot + "DailySales/DailySales.min.js",
                    jsAndCssFileRoot + "DailySales/DailySales.min.css"));

            WidgetViewDefinitions.Add(onetouchDashboardCustomizationConsts.Widgets.Tenant.GeneralStats,
                new WidgetViewDefinition(
                    onetouchDashboardCustomizationConsts.Widgets.Tenant.GeneralStats,
                    viewFileRoot + "GeneralStats.cshtml",
                    jsAndCssFileRoot + "GeneralStats/GeneralStats.min.js",
                    jsAndCssFileRoot + "GeneralStats/GeneralStats.min.css"));

            WidgetViewDefinitions.Add(onetouchDashboardCustomizationConsts.Widgets.Tenant.ProfitShare,
                new WidgetViewDefinition(
                    onetouchDashboardCustomizationConsts.Widgets.Tenant.ProfitShare,
                    viewFileRoot + "ProfitShare.cshtml",
                    jsAndCssFileRoot + "ProfitShare/ProfitShare.min.js",
                    jsAndCssFileRoot + "ProfitShare/ProfitShare.min.css"));
  
            WidgetViewDefinitions.Add(onetouchDashboardCustomizationConsts.Widgets.Tenant.MemberActivity,
                new WidgetViewDefinition(
                    onetouchDashboardCustomizationConsts.Widgets.Tenant.MemberActivity,
                    viewFileRoot + "MemberActivity.cshtml",
                    jsAndCssFileRoot + "MemberActivity/MemberActivity.min.js",
                    jsAndCssFileRoot + "MemberActivity/MemberActivity.min.css"));

            WidgetViewDefinitions.Add(onetouchDashboardCustomizationConsts.Widgets.Tenant.RegionalStats,
                new WidgetViewDefinition(
                    onetouchDashboardCustomizationConsts.Widgets.Tenant.RegionalStats,
                    viewFileRoot + "RegionalStats.cshtml",
                    jsAndCssFileRoot + "RegionalStats/RegionalStats.min.js",
                    jsAndCssFileRoot + "RegionalStats/RegionalStats.min.css",
                    12,
                    10));

            WidgetViewDefinitions.Add(onetouchDashboardCustomizationConsts.Widgets.Tenant.SalesSummary,
                new WidgetViewDefinition(
                    onetouchDashboardCustomizationConsts.Widgets.Tenant.SalesSummary,
                    viewFileRoot + "SalesSummary.cshtml",
                    jsAndCssFileRoot + "SalesSummary/SalesSummary.min.js",
                    jsAndCssFileRoot + "SalesSummary/SalesSummary.min.css",
                    6,
                    10));

            WidgetViewDefinitions.Add(onetouchDashboardCustomizationConsts.Widgets.Tenant.TopStats,
                new WidgetViewDefinition(
                    onetouchDashboardCustomizationConsts.Widgets.Tenant.TopStats,
                    viewFileRoot + "TopStats.cshtml",
                    jsAndCssFileRoot + "TopStats/TopStats.min.js",
                    jsAndCssFileRoot + "TopStats/TopStats.min.css",
                    12,
                    10));

            //add your tenant side widget definitions here
            #endregion

            #region HostWidgets

            WidgetViewDefinitions.Add(onetouchDashboardCustomizationConsts.Widgets.Host.IncomeStatistics,
                new WidgetViewDefinition(
                    onetouchDashboardCustomizationConsts.Widgets.Host.IncomeStatistics,
                    viewFileRoot + "IncomeStatistics.cshtml",
                    jsAndCssFileRoot + "IncomeStatistics/IncomeStatistics.min.js",
                    jsAndCssFileRoot + "IncomeStatistics/IncomeStatistics.min.css"));

            WidgetViewDefinitions.Add(onetouchDashboardCustomizationConsts.Widgets.Host.TopStats,
                new WidgetViewDefinition(
                    onetouchDashboardCustomizationConsts.Widgets.Host.TopStats,
                    viewFileRoot + "HostTopStats.cshtml",
                    jsAndCssFileRoot + "HostTopStats/HostTopStats.min.js",
                    jsAndCssFileRoot + "HostTopStats/HostTopStats.min.css"));

            WidgetViewDefinitions.Add(onetouchDashboardCustomizationConsts.Widgets.Host.EditionStatistics,
                new WidgetViewDefinition(
                    onetouchDashboardCustomizationConsts.Widgets.Host.EditionStatistics,
                    viewFileRoot + "EditionStatistics.cshtml",
                    jsAndCssFileRoot + "EditionStatistics/EditionStatistics.min.js",
                    jsAndCssFileRoot + "EditionStatistics/EditionStatistics.min.css"));

            WidgetViewDefinitions.Add(onetouchDashboardCustomizationConsts.Widgets.Host.SubscriptionExpiringTenants,
                new WidgetViewDefinition(
                    onetouchDashboardCustomizationConsts.Widgets.Host.SubscriptionExpiringTenants,
                    viewFileRoot + "SubscriptionExpiringTenants.cshtml",
                    jsAndCssFileRoot + "SubscriptionExpiringTenants/SubscriptionExpiringTenants.min.js",
                    jsAndCssFileRoot + "SubscriptionExpiringTenants/SubscriptionExpiringTenants.min.css",
                    6,
                    10));

            WidgetViewDefinitions.Add(onetouchDashboardCustomizationConsts.Widgets.Host.RecentTenants,
                new WidgetViewDefinition(
                    onetouchDashboardCustomizationConsts.Widgets.Host.RecentTenants,
                    viewFileRoot + "RecentTenants.cshtml",
                    jsAndCssFileRoot + "RecentTenants/RecentTenants.min.js",
                    jsAndCssFileRoot + "RecentTenants/RecentTenants.min.css"));

            //add your host side widgets definitions here
            #endregion

            #endregion
        }
    }
}
