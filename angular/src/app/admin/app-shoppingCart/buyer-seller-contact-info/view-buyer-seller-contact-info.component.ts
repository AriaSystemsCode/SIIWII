import { Component, Injector, Input, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppTransactionServiceProxy, GetAppTransactionsForViewDto } from '@shared/service-proxies/service-proxies';
import { ShoppingCartoccordionTabs } from '../Components/shopping-cart-view-component/ShoppingCartoccordionTabs';

@Component({
  selector: 'app-view-buyer-seller-contact-info',
  templateUrl: './view-buyer-seller-contact-info.component.html',
  styleUrls: ['./view-buyer-seller-contact-info.component.scss']
})
export class ViewBuyerSellerContactInfoComponent extends AppComponentBase
  implements OnInit {

  @Input("activeTab") activeTab: number;
  @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
  shoppingCartoccordionTabs = ShoppingCartoccordionTabs;

  constructor(
    injector: Injector,
    private _AppTransactionServiceProxy: AppTransactionServiceProxy
  ) {
    super(injector);
  }
  ngOnInit(): void {

  }
}
