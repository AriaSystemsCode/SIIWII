import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MembersListComponent } from './components/members-list.component';


const routes: Routes = [
    { path:"", component : MembersListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MembersListSharedRoutingModule { }
