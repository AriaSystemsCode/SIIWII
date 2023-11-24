import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectAppItemTypeComponent } from './select-app-item-type/select-app-item-type.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { onetouchCommonModule } from '@shared/common/common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TreeModule } from 'primeng';



@NgModule({
  declarations: [SelectAppItemTypeComponent],
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
export class AppItemTypeModule { }
