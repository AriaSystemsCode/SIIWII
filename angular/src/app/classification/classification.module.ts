import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UtilsModule } from '../../shared/utils/utils.module';
import { TreeModule } from 'primeng';
import { onetouchCommonModule } from '../../shared/common/common.module';
import { AppCommonModule } from '../shared/common/app-common.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectClassificationDynamicModalComponent } from './select-classification-dynamic-modal.component';
import { CreateOrEditClassificationDynamicModalComponent } from './create-or-edit-classification-dynamic-modal.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

@NgModule({
  declarations: [SelectClassificationDynamicModalComponent, CreateOrEditClassificationDynamicModalComponent],
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
export class ClassificationModule { }
