import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardBrowseComponent } from './components/DashboardBrowse/dashboard-browse.component';
import { DashboardDetailComponent } from './components/dashboard-deatail/dashboard-detail.component';
import { CreateOrEditSpreadsheetComponent } from './components/create-or-edit-spreadsheet/create-or-edit-spreadsheet.component';




const routes: Routes = [


      { path: 'my-dashboards', component: DashboardBrowseComponent, },
      { path: 'dashboard-details/:id', component: DashboardDetailComponent, },
      { path: 'dashboard-edit/:id', component: CreateOrEditSpreadsheetComponent, },

  
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
