import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateOrEditAppEntityDynamicModalComponent } from './create-or-edit-app-entity-dynamic-modal/create-or-edit-app-entity-dynamic-modal.component';
import { UtilsModule } from '@shared/utils/utils.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { onetouchCommonModule } from '@shared/common/common.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AppEntityListDynamicModalComponent } from './app-entity-list-dynamic-modal/app-entity-list-dynamic-modal.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { ColorPickerModule } from 'ngx-color-picker';


@NgModule({
  declarations: [CreateOrEditAppEntityDynamicModalComponent, AppEntityListDynamicModalComponent],
  imports: [
    CommonModule,
    AppCommonModule,
    ModalModule,
    ReactiveFormsModule,
    FormsModule,
    onetouchCommonModule,
    UtilsModule,
    BsDropdownModule.forRoot(),
    CheckboxModule,
    MultiSelectModule,
    DropdownModule,
    RadioButtonModule,
    ColorPickerModule
  ],
  exports : [CreateOrEditAppEntityDynamicModalComponent, AppEntityListDynamicModalComponent]
})
export class AppEntityDynamicModalModule { }
