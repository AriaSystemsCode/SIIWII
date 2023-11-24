import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SelectBranchRoutingModule } from './select-branch-routing.module';
import { SelectBranchModalComponent } from './select-branch-modal/select-branch-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TreeModule } from 'primeng';


@NgModule({
  declarations: [SelectBranchModalComponent],
  imports: [
    ModalModule.forRoot(),
    CommonModule,
    SelectBranchRoutingModule,
    CommonModule,
    TreeModule,
    AppCommonModule,
    UtilsModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports : [SelectBranchModalComponent]
})
export class SelectBranchModule { }
