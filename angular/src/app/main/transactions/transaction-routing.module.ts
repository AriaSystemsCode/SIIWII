import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppTransactionsBrowseComponent } from './appTransactions/appTransBrowse/appTransBrowse.component';
import { WidgetDailySalesComponent } from '@app/shared/common/customizable-dashboard/widgets/widget-daily-sales/widget-daily-sales.component';
import { WidgetGeneralStatsComponent } from '@app/shared/common/customizable-dashboard/widgets/widget-general-stats/widget-general-stats.component';
import { WidgetHostTopStatsComponent } from '@app/shared/common/customizable-dashboard/widgets/widget-host-top-stats/widget-host-top-stats.component';
import { WidgetIncomeStatisticsComponent } from '@app/shared/common/customizable-dashboard/widgets/widget-income-statistics/widget-income-statistics.component';
import { WidgetMemberActivityComponent } from '@app/shared/common/customizable-dashboard/widgets/widget-member-activity/widget-member-activity.component';
import { WidgetProfitShareComponent } from '@app/shared/common/customizable-dashboard/widgets/widget-profit-share/widget-profit-share.component';
import { WidgetRecentTenantsComponent } from '@app/shared/common/customizable-dashboard/widgets/widget-recent-tenants/widget-recent-tenants.component';
import { WidgetRegionalStatsComponent } from '@app/shared/common/customizable-dashboard/widgets/widget-regional-stats/widget-regional-stats.component';
import { WidgetSalesSummaryComponent } from '@app/shared/common/customizable-dashboard/widgets/widget-sales-summary/widget-sales-summary.component';



const routes: Routes = [


      // { path: 'appTransactions/MyTransactions', component: AppTransactionsBrowseComponent, },
      // { path: 'appTransactions/MyTransactions', component: WidgetDailySalesComponent, },
      { path: 'appTransactions/MyTransactions', component: WidgetGeneralStatsComponent, },
      // { path: 'appTransactions/MyTransactions', component: WidgetHostTopStatsComponent, },
      // { path: 'appTransactions/MyTransactions', component: WidgetIncomeStatisticsComponent, },
      // { path: 'appTransactions/MyTransactions', component: WidgetMemberActivityComponent, },
      // { path: 'appTransactions/MyTransactions', component: WidgetProfitShareComponent, },
      // { path: 'appTransactions/MyTransactions', component: WidgetRegionalStatsComponent, },
      // { path: 'appTransactions/MyTransactions', component: WidgetSalesSummaryComponent, },


      
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransactioRoutingModule { }
