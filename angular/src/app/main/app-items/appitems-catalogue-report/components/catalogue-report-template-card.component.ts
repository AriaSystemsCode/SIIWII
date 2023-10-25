import { Component, Injector, Input, OnChanges, SimpleChanges  } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GetSycReportForViewDto } from '@shared/service-proxies/service-proxies';
import { ProductCatalogueReportParams } from '../models/product-Catalogue-Report-Params';

@Component({
    selector: 'app-catalogue-report-template-card',
    templateUrl: './catalogue-report-template-card.component.html',
    styleUrls: ['./catalogue-report-template-card.component.scss']
})
export class CatalogueReportTemplateCardComponent extends AppComponentBase {
    @Input() index:number
    @Input() template : GetSycReportForViewDto
    @Input() printInfoParam : ProductCatalogueReportParams

    constructor(private injector:Injector){
        super(injector)
    }
}
