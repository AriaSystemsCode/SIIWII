import { Component, Injector, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { HttpClient } from '@angular/common/http';

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
  reportUrl: string;
  hostUrl: string = "https://localhost:44310/";
  getDesignerModelAction: Function;

  constructor(injector: Injector, private http: HttpClient) {
    super(injector);

    const appSession = injector.get(AppSessionService);
    const tenantId = appSession?.tenantId ?? "";

    this.reportUrl = `reportTemplateName?itemsListId=10073&reportTitle=Test Title Passed From Front-End&userId=1&preparedForContactId=14&tenantId=${tenantId}`;

    this.getDesignerModelAction = (reportUrl: string) => {
      return this.http.post(`${this.hostUrl}api/ReportDesigner/GetReportDesignerModel`, { reportUrl }).toPromise();
    };
  }
}
