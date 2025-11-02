import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppTransactionsBrowseComponent } from './appTransactions/appTransBrowse/appTransBrowse.component';




const routes: Routes = [


      { path: 'appTransactions/MyTransactions', component: AppTransactionsBrowseComponent, },
      
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransactioRoutingModule { }
