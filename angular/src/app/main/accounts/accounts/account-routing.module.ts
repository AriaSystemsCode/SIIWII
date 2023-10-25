import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyAccountsComponent } from './components/my-accounts.component';
import { MergeConvertAccountsToolComponent } from './merge-convert-accounts-tool/merge-convert-accounts-tool.component';
const routes: Routes = [
    { path: '', component: MyAccountsComponent, data: { permission: 'Pages.Accounts' } },
    { path: 'accounts/merge-convert-accounts-tool', component: MergeConvertAccountsToolComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
