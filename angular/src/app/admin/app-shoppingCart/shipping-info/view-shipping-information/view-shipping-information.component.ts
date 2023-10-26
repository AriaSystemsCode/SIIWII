import { Component, Injector, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppTransactionServiceProxy, GetAppTransactionsForViewDto } from '@shared/service-proxies/service-proxies';
import { ShoppingCartoccordionTabs } from '../../Components/shopping-cart-view-component/ShoppingCartoccordionTabs';
import { ShoppingCartMode } from '../../Components/shopping-cart-view-component/ShoppingCartMode';

@Component({
  selector: 'app-view-shipping-information',
  templateUrl: './view-shipping-information.component.html',
  styleUrls: ['./view-shipping-information.component.scss']
})
export class ViewShippingInformationComponent extends AppComponentBase {
  @Input() shoppingCartMode = ShoppingCartMode;
  @Input("activeTab") activeTab: number;
  @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
  shoppingCartoccordionTabs = ShoppingCartoccordionTabs;
  constructor(
    injector: Injector,
    private _AppTransactionServiceProxy: AppTransactionServiceProxy
  ) {
    super(injector);
  }
}
