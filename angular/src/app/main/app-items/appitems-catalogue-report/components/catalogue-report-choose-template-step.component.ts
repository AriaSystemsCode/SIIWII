import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GetSycReportForViewDto } from '@shared/service-proxies/service-proxies';
import { ProductCatalogueReportParams } from '../models/product-Catalogue-Report-Params';

@Component({
    selector: 'app-catalogue-report-choose-template-step',
    templateUrl: './catalogue-report-choose-template-step.component.html',
    styleUrls: ['./catalogue-report-choose-template-step.component.scss']
})
export class CatalogueReportChooseTemplateStepComponent extends AppComponentBase {
    constructor(
        private injector : Injector
    ) {
        super(injector)
    }
    @Input() printInfoParam : ProductCatalogueReportParams
    @Input() templates  : GetSycReportForViewDto []
    @Output('continue') continue : EventEmitter<GetSycReportForViewDto> = new EventEmitter<GetSycReportForViewDto>()
    @Output() previous : EventEmitter<boolean> = new EventEmitter<boolean>()

    continueToNextStep(){
        const selectedTemplate : GetSycReportForViewDto = this.templates.filter(item=>item.sycReport.name == this.printInfoParam.productsCatalogTemplate)[0]
        if(!selectedTemplate) return this.notify.info("PleaseChooseATemplateFirst")
        this.continue.emit(selectedTemplate)
    }

    previousStep(){
        this.previous.emit(true)
    }

}
