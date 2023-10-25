import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountInfoComponent } from './accountInfo.component';


const routes: Routes = [
  {
    path: '',
    // component: ,
    children: [
   { path: 'myaccount', component: AccountInfoComponent, data: { permission: 'Pages.AccountInfo' }  }

    
  ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountInfosRoutingModule { }
