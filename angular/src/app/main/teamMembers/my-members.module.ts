import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MyMembersRoutingModule } from './my-members-routing.module';
import { InputSwitchModule, TreeModule } from 'primeng';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { DropdownModule } from 'primeng/dropdown';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { FormsModule } from '@angular/forms';
import { CreateOrEditMemberComponent } from './components/create-or-edit-member/create-or-edit-member.component';
import { ViewMemberProfileComponent } from './components/view-member-profile/view-member-profile.component';
import { SelectBranchModule } from '@app/select-branch/select-branch.module';
@NgModule({
    declarations: [
        CreateOrEditMemberComponent,
        ViewMemberProfileComponent,
    ],
    imports: [
        CommonModule,
        MyMembersRoutingModule,
        InputSwitchModule,
        BsDropdownModule,
        DropdownModule,
        Ng2TelInputModule,
        AppCommonModule,
        UtilsModule,
        FormsModule,
        BsDatepickerModule.forRoot(),
        SelectBranchModule
    ],
    exports: [
        CreateOrEditMemberComponent,
        ViewMemberProfileComponent
    ]
})
export class MyMembersModule { }
