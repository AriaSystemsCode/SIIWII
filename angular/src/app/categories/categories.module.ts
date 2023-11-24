import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UtilsModule } from '../../shared/utils/utils.module';
import { TreeModule } from 'primeng';
import { onetouchCommonModule } from '../../shared/common/common.module';
import { AppCommonModule } from '../shared/common/app-common.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectCategoriesDynamicModalComponent } from './select-categories-dynamic-modal.component';
import { CreateOrEditCategoryDynamicModalComponent } from './create-or-edit-category-dynamic-modal.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

@NgModule({
  declarations: [SelectCategoriesDynamicModalComponent, CreateOrEditCategoryDynamicModalComponent],
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
export class CategoriesModule { }
