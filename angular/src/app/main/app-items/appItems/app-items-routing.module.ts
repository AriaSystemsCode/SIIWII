import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyItemViewComponent } from '../appItems/components/my-item-view.component'
import { CreateOrEditAppItemComponent } from './components/create-or-edit-app-item.component';
import { MyAppItemsComponent } from './components/my-app-items.component';

const routes: Routes = [
    { path: '', component: MyAppItemsComponent   },
    { path: 'createOrEdit',
        children:[
            {
                path:"",
                component: CreateOrEditAppItemComponent
            },
            {
                path:":id",
                component: CreateOrEditAppItemComponent,
            }
        ],
    },
    {
        path:"createListing/:productId",
        component: CreateOrEditAppItemComponent
    },
    {
        path:"editListing/:listingId",
        component: CreateOrEditAppItemComponent
    },
    {
        path: '*',
        redirectTo :''
    },
    {
        path:"view/:Id",
        component: MyItemViewComponent
    },

    // { path: '/view', component: ViewAppItemComponent, data: { permission: 'Pages.AppItems' }  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppItemsRoutingModule { }
