import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountInfoComponent } from './components/accountInfo.component';
import { CreateEditExternalAccountComponent } from './components/create-edit-external-account.component';
import { CreateEditManualAccountComponent } from './components/create-edit-manual-account.component';
import { ViewOthersProfileComponent } from './components/view-others-profile.component';

const routes: Routes = [
  { path: '', component: AccountInfoComponent, data: { permission: 'Pages.Accounts' } },
  { path: 'create-manual', component: CreateEditManualAccountComponent, data: { permission: 'Pages.Accounts' } },
  { path: 'create-external', component: CreateEditExternalAccountComponent, data: { permission: 'Pages.Accounts' } },
  { path: 'edit-manual/:id', component: CreateEditManualAccountComponent, data: { permission: 'Pages.Accounts' } },
  { path: 'edit-external/:id', component: CreateEditExternalAccountComponent, data: { permission: 'Pages.Accounts' } },
  { path: 'view/:id', component: ViewOthersProfileComponent, data: { permission: 'Pages.Accounts' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountInfosRoutingModule { }
