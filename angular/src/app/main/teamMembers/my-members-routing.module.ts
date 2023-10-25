import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateOrEditMemberComponent } from './components/create-or-edit-member/create-or-edit-member.component';
import { ViewMemberProfileComponent } from './components/view-member-profile/view-member-profile.component';

const routes: Routes = [
    {
        path: '',

        children: [
            { path: 'Create-Contact', component: CreateOrEditMemberComponent, data: { permission: 'Pages.Accounts' } },
            { path: 'edit-member/:id', component: CreateOrEditMemberComponent, data: { permission: 'Pages.Accounts' } },
            { path: 'ViewMemberProfile/:id', component: ViewMemberProfileComponent, data: { permission: 'Pages.Accounts' } },
        ]
    }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyMembersRoutingModule { }
