import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { FieldManagerRoutingModule } from './field-manager-routing.module';
import { FieldManagerService } from './field-manager.service';
import { BrowseFieldManagerComponent } from './components/browse-field-manager/browse-field-manager.component';
import { CreateOrEditFieldManagerComponent } from './components/create-or-edit-field-manager/create-or-edit-field-manager.component';
import { ViewFieldManagerComponent } from './components/view-field-manager/view-field-manager.component';

@NgModule({
    declarations: [
        BrowseFieldManagerComponent,
        CreateOrEditFieldManagerComponent,
        ViewFieldManagerComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ModalModule.forRoot(),
        PaginatorModule,
        TableModule,
        AppCommonModule,
        UtilsModule,
        FieldManagerRoutingModule
    ],
    providers: [FieldManagerService]
})
export class FieldManagerModule { }
