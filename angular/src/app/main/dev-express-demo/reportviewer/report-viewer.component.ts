import { AfterViewInit, Component, EventEmitter, Injector, Input, OnChanges, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DxReportViewerCallbacksComponent, DxReportViewerComponent, DxReportViewerRequestOptionsComponent } from 'devexpress-reporting-angular';

@Component({
    selector: 'report-viewer',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './report-viewer.component.html',
    styleUrls: [
        "../../../../../node_modules/jquery-ui/themes/base/all.css",
        "../../../../../node_modules/devextreme/dist/css/dx.common.css",
        "../../../../../node_modules/devextreme/dist/css/dx.light.css",
        "../../../../../node_modules/@devexpress/analytics-core/dist/css/dx-analytics.common.css",
        "../../../../../node_modules/@devexpress/analytics-core/dist/css/dx-analytics.light.css",
        "../../../../../node_modules/devexpress-reporting/dist/css/dx-webdocumentviewer.css"
    ]
})
export class ReportViewerComponent extends AppComponentBase implements AfterViewInit {
    @ViewChild('dxReportViewer') dxReportViewer: DxReportViewerComponent
    @ViewChild('dxrvRequestOptions') dxReportViewerRequestOptions: DxReportViewerRequestOptionsComponent
    @ViewChild('dxrvRequestCallbacks') dxReportViewerCallbacksComponent: DxReportViewerCallbacksComponent
    getDesignerModelAction = "api/ReportDesigner/GetReportDesignerModel";
    @Input() reportUrl : string
    @Input() invokeAction : string
    @Output() parametersSubmitted:EventEmitter<any> = new EventEmitter()
    @Output() documentReady:EventEmitter<any> = new EventEmitter()
    
    hostUrl = AppConsts.remoteServiceBaseUrl;
    constructor(injector: Injector) {
        super(injector);
    }
    
    ngAfterViewInit(){
        this.dxReportViewerCallbacksComponent.DocumentReady.subscribe(res=>{
            this.documentReady.emit()
        })
        this.dxReportViewerCallbacksComponent.ParametersSubmitted.subscribe(res=>{
            this.parametersSubmitted.emit()
        })
    }
}
