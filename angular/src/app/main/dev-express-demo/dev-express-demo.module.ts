import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DevExpressDemoRoutingModule } from './dev-express-demo-routing.module';
import { DxReportDesignerModule, DxReportViewerModule } from 'devexpress-reporting-angular';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ReportDesignerComponent } from './reportdesigner/report-designer.component';
import { ReportViewerComponent } from './reportviewer/report-viewer.component';
import { AppCommonModule } from '@app/shared/common/app-common.module';

@NgModule({
  declarations: [
    ReportViewerComponent,
    ReportDesignerComponent
  ],
  imports: [
    CommonModule,
    AppCommonModule,
    HttpClientModule,
    FormsModule,
    DxReportViewerModule,
    DxReportDesignerModule,
    DevExpressDemoRoutingModule,
  ],
  exports : [
    ReportViewerComponent,
    ReportDesignerComponent
  ]
})
export class DevExpressDemoModule { }
