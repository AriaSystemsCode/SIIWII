import { Component, Inject, Injector, ViewEncapsulation } from '@angular/core';
import { NullLogger } from '@microsoft/signalr';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppSessionService } from '@shared/common/session/app-session.service';

@Component({
  selector: 'report-designer',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './report-designer.component.html',
  styleUrls: [
    "../../../../../node_modules/jquery-ui/themes/base/all.css",
    "../../../../../node_modules/devextreme/dist/css/dx.common.css",
    "../../../../../node_modules/devextreme/dist/css/dx.light.css",
    "../../../../../node_modules/@devexpress/analytics-core/dist/css/dx-analytics.common.css",
    "../../../../../node_modules/@devexpress/analytics-core/dist/css/dx-analytics.light.css",
    "../../../../../node_modules/@devexpress/analytics-core/dist/css/dx-querybuilder.css",
    "../../../../../node_modules/devexpress-reporting/dist/css/dx-webdocumentviewer.css",
    "../../../../../node_modules/devexpress-reporting/dist/css/dx-reportdesigner.css"
  ]
})

export class ReportDesignerComponent extends AppComponentBase {
  appSession: AppSessionService=undefined;
  getDesignerModelAction = "api/ReportDesigner/GetReportDesignerModel";
  reportUrl = undefined;
  hostUrl="https://localhost:44301/";
  constructor(injector: Injector) { 

    super(injector);
    this.appSession = injector.get(AppSessionService);
    this.reportUrl = "ProductsCatalogTemplate1?itemsListId=" + "10073" + "&reportTitle=Test Title Passed From Front-End&userId=1&preparedForContactId=14&tenantId=" + (this.appSession==null?"":this.appSession.tenantId.toString()) ;
  }
}
