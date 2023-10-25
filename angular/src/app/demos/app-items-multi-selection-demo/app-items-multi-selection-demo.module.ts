import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppItemsMultiSelectionDemoRoutingModule } from './app-items-multi-selection-demo-routing.module';
import { AppItemsMultiSelectionDemoComponent } from './app-items-multi-selection-demo/app-items-multi-selection-demo.component';
import { UtilsModule } from '@shared/utils/utils.module';
import { AppItemsBrowseModule } from '@app/main/app-items/app-items-browse/app-items-browse.module';
import { FormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TableModule } from 'primeng/table';


@NgModule({
  declarations: [AppItemsMultiSelectionDemoComponent],
  imports: [
    CommonModule,
    AppItemsMultiSelectionDemoRoutingModule,
    UtilsModule,
    FormsModule,
    AppItemsBrowseModule,
    AppCommonModule,
    ModalModule.forRoot(),
    TableModule
  ]
})
export class AppItemsMultiSelectionDemoModule { }
