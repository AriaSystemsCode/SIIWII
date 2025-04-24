import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppTransactionsComponent } from './appTransactions/appTransactions/appTransactions.component';
import { AppTransactionsBrowseComponent } from './appTransactions/appTransBrowse/appTransBrowse.component';



const routes: Routes = [
    {
        path: '',

        children: [
             { path: 'appTransactions/appTransactions', component: AppTransactionsComponent, data: { permission: 'Pages.Administration.AppTransactions' }  },
                              { path: 'appTransactions/MyTransactions', component: AppTransactionsBrowseComponent , data: { permission: 'Pages.AppSiiwiiTransactions' } } ,
        ]
    }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransactioRoutingModule { }
