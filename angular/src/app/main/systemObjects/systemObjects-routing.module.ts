import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { GeneralAccountInfoComponent } from './general-account-info.component';
import { SystemObjectsComponent } from './systemObjects.component';
import { SydObjectsComponent } from '../systemObjects/sydObjects/sydObjects.component';
import { SysObjectTypesComponent } from '../systemObjects/sysObjectTypes/sysObjectTypes.component';
import { SycEntityObjectClassificationsComponent } from '../systemObjects/sycEntityObjectClassifications/sycEntityObjectClassifications.component';
import { SycEntityObjectStatusesComponent } from '../systemObjects/sycEntityObjectStatuses/sycEntityObjectStatuses.component';
import { SycEntityObjectCategoriesComponent } from '../systemObjects/sycEntityObjectCategories/sycEntityObjectCategories.component';
import { SycEntityObjectTypesComponent } from '../systemObjects/sycEntityObjectTypes/sycEntityObjectTypes.component';
import { SycAttachmentCategoriesComponent } from './sycAttachmentCategories/sycAttachmentCategories.component';
import { SuiIconsComponent } from './suiIcons/suiIcons.component';


const routes: Routes = [
  {
    path: '',
    component: SystemObjectsComponent,
    children: [
      { path: 'sysObjectTypes', component: SysObjectTypesComponent, data: { permission: 'Pages.SysObjectTypes' } },
      { path: 'sydObjects', component: SydObjectsComponent, data: { permission: 'Pages.SydObjects' } },
      { path: 'sycEntityObjectClassifications', component: SycEntityObjectClassificationsComponent, data: { permission: 'Pages.SycEntityObjectClassifications' }  },
      { path: 'sycEntityObjectStatuses', component: SycEntityObjectStatusesComponent, data: { permission: 'Pages.SycEntityObjectStatuses' }  },
      { path: 'sycEntityObjectCategories', component: SycEntityObjectCategoriesComponent, data: { permission: 'Pages.SycEntityObjectCategories' }  },
      { path: 'sycEntityObjectTypes', component: SycEntityObjectTypesComponent, data: { permission: 'Pages.SycEntityObjectTypes' }  },
      { path: 'sycAttachmentCategories', component: SycAttachmentCategoriesComponent, data: { permission: 'Pages.SycAttachmentCategories' }  },
      { path: 'suiIcons', component: SuiIconsComponent, data: { permission: 'Pages.SuiIcons' }  },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemObjectsRoutingModule { }
