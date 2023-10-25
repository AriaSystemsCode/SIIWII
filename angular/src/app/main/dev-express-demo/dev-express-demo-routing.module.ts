import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportDesignerComponent } from './reportdesigner/report-designer.component';
import { ReportViewerComponent } from './reportviewer/report-viewer.component';


const routes: Routes = [
    { path: 'designer', component: ReportDesignerComponent },
    { path: 'viewer', component: ReportViewerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevExpressDemoRoutingModule { }
