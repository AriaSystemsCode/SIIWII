import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppEntitiesComponent } from '../appEntities/appEntities/appEntities.component';
import { ViewAppEntityModalComponent } from '../appEntities/appEntities/view-appEntity-modal.component';
import { CreateOrEditAppEntityModalComponent } from '../appEntities/appEntities/create-or-edit-appEntity-modal.component';

const routes: Routes = [
  {
    path:'',
    // component: AccountsComponent,
    children: [
      { path: '', component: AppEntitiesComponent, data: { permission: 'Pages.AppEntities' }  },
     
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppEntitiesRoutingModule { }
