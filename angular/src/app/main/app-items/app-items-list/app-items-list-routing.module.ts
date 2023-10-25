import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppItemListListComponent } from './components/app-item-list-list.component';
import { EditItemListingListComponent } from './components/edit-item-listing-list.component';
import { ViewItemListingListComponent } from './components/view-item-listing-list.component';


const routes: Routes = [
    {
        path:"",
        component:AppItemListListComponent
    },
    {
        path:"edit/:id",
        component:EditItemListingListComponent
    },
    {
        path:"view/:id",
        component:ViewItemListingListComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppItemsListRoutingModule { }
