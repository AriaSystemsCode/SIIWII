import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { AppCommonModule } from '@app/shared/common/app-common.module'; 
import { UtilsModule } from '@shared/utils/utils.module';
import { AppTransactionSideBarComponent } from './app-transaction-side-bar/app-transaction-side-bar.component';
import { AppSideBarComponent } from './app-side-bar/app-side-bar.component';
import { TransactionModule } from '@app/main/transactions/transaction.module';

@NgModule({
  declarations: [AppTransactionSideBarComponent,AppSideBarComponent],
  exports: [AppTransactionSideBarComponent,AppSideBarComponent],
  imports: [

    FormsModule,
    AppCommonModule, 
    UtilsModule,
    TransactionModule
  ]
})
export class SideBarModule {}
