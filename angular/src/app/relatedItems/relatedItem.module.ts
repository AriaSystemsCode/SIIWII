import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UtilsModule } from '../../shared/utils/utils.module';
import { TreeModule } from 'primeng/tree';
import { onetouchCommonModule } from '../../shared/common/common.module';
import { AppCommonModule } from '../shared/common/app-common.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { SelectRelatedItemDynamicModalComponent } from './select-relatedItem-dynamic-modal.component';

@NgModule({
  declarations: [SelectRelatedItemDynamicModalComponent],
  imports: [
    CommonModule,
    AppCommonModule,
    TreeModule,
    ModalModule,
    ReactiveFormsModule,
    FormsModule,
    onetouchCommonModule,
    UtilsModule,
    BsDropdownModule.forRoot(),
  ]
})
export class relatedItemModule { }
