import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppItemsMultiSelectionDemoComponent } from './app-items-multi-selection-demo/app-items-multi-selection-demo.component';


const routes: Routes = [
  { path:"AppItemsMultiSelection", component : AppItemsMultiSelectionDemoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppItemsMultiSelectionDemoRoutingModule { }
