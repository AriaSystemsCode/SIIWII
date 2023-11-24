import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MembersListSharedRoutingModule } from './members-list-shared-routing.module';
import { MembersListComponent } from './components/members-list.component';
import { MembersListCardComponent } from './components/members-list-card.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TreeviewModule } from 'ngx-treeview';
import { PaginatorModule } from 'primeng';


@NgModule({
    declarations: [
        MembersListComponent,
        MembersListCardComponent
    ],
    imports: [
        CommonModule,
        MembersListSharedRoutingModule,
        AppCommonModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule.forRoot(),
        TabsModule.forRoot(),
        TreeviewModule.forRoot(),
        PaginatorModule,
        UtilsModule,
        BsDatepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
    ],
    exports: [
        MembersListComponent,
    ],
})
export class MembersListSharedModule { }
