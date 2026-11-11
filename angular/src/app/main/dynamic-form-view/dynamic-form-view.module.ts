import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { DragDropModule } from 'primeng/dragdrop';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { SharedDynamicInputsModule } from '@shared/shared-module';
import { AppDashboardServiceProxy } from '@shared/service-proxies/service-proxies';
import { DynamicApiDispatcherService } from '@shared/dynamicApiDispatcherService ';

import { DynamicFormViewComponent } from './dynamic-form-view.component';
import { TableFieldsService } from './services/table-fields.service';
import { DynamicFormStorageService } from './services/dynamic-form-storage.service';

@NgModule({
    declarations: [DynamicFormViewComponent],
    imports: [
        CommonModule,
        FormsModule,
        AppCommonModule,
        UtilsModule,
        DropdownModule,
        DragDropModule,
        SharedDynamicInputsModule,
        RouterModule.forChild([{ path: '', component: DynamicFormViewComponent }])
    ],
    providers: [
        AppDashboardServiceProxy,
        DynamicApiDispatcherService,
        TableFieldsService,
        DynamicFormStorageService
    ]
})
export class DynamicFormViewModule { }
