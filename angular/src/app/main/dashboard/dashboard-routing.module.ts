import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardBrowseComponent } from './components/DashboardBrowse/dashboard-browse.component';




const routes: Routes = [


      { path: 'my-dashboards', component: DashboardBrowseComponent, },

  
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
