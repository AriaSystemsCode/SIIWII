import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AppComponentBase } from "@shared/common/app-component-base";
import { AppTransactionServiceProxy, GetAppTransactionsForViewDto } from "@shared/service-proxies/service-proxies";
import { ShoppingCartoccordionTabs } from '../../transaction-information-component/ShoppingCartoccordionTabs';


@Component({
    selector: 'view-extra-data',
    templateUrl: './view-extra-data.component.html',
    styleUrls: ['./view-extra-data.component.scss']
})
export class ViewExtraDataComponent extends AppComponentBase implements OnInit, OnChanges {

    @Input("isCreateOrEdit") isCreateOrEdit: boolean;
    @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
    @Input("extraAttributeObject") extraAttributeObject;
    @Input("canChange") canChange: boolean = true;

    @Output("onshowSaveBtn") onshowSaveBtn: EventEmitter<boolean> = new EventEmitter<boolean>()

    shoppingCartoccordionTabs = ShoppingCartoccordionTabs;
    usageTypeAttributeMap: { [key: string]: any[] } = {};

    constructor(
        injector: Injector,
    ) {


        super(injector);

    }

    ngOnChanges(changes: SimpleChanges): void {

    }

    prepareUsageTypeAttributeMap() {
        const attributes = this.appTransactionsForViewDto.extraDataAttributes || [];

        this.usageTypeAttributeMap = attributes.reduce((map, attr) => {
            if (!map[attr.extraAttrUsage]) {
                map[attr.extraAttrUsage] = [];
            }
            map[attr.extraAttrUsage].push(attr);
            return map;
        }, {});
    }
    showEditMode() {
        this.isCreateOrEdit = true;
        this.onshowSaveBtn.emit(true);

    }


    ngOnInit(): void {


    }

}
