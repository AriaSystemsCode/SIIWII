import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppCommonModule } from '@app/shared/common/app-common.module'; // ✅
import { UtilsModule } from '@shared/utils/utils.module';
import { GlobalEntityViewHostComponent } from './global-entity-view-host/global-entity-view-host.component';
import { AccountSharedModule } from '../accounts/account-shared/account-shared.module';

@NgModule({
  declarations: [GlobalEntityViewHostComponent],
  exports: [GlobalEntityViewHostComponent],
  imports: [
    CommonModule,
    FormsModule,
    AppCommonModule, 
    UtilsModule,
    AccountSharedModule
  ]
})
export class ViewHostModule {}
