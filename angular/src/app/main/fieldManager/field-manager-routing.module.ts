import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BrowseFieldManagerComponent } from './components/browse-field-manager/browse-field-manager.component';
import { CreateOrEditFieldManagerComponent } from './components/create-or-edit-field-manager/create-or-edit-field-manager.component';
import { ViewFieldManagerComponent } from './components/view-field-manager/view-field-manager.component';

const routes: Routes = [
    { path: '', component: BrowseFieldManagerComponent },
    { path: 'createOrEdit', component: CreateOrEditFieldManagerComponent },
    { path: 'createOrEdit/:id', component: CreateOrEditFieldManagerComponent },
    { path: 'view/:id', component: ViewFieldManagerComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FieldManagerRoutingModule { }
