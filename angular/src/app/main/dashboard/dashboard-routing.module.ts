import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardBrowseComponent } from './components/DashboardBrowse/dashboard-browse.component';
import { DashboardDetailComponent } from './components/dashboard-deatail/dashboard-detail.component';




const routes: Routes = [


      { path: 'my-dashboards', component: DashboardBrowseComponent, },
      { path: 'dashboard-details/:id', component: DashboardDetailComponent, },

  
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
