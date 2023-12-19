import { Component, Injector, Input, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppTransactionServiceProxy, GetOrderDetailsForViewDto } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-transaction-side-bar',
  templateUrl: './app-transaction-side-bar.component.html',
  styleUrls: ['./app-transaction-side-bar.component.scss']
})
export class AppTransactionSideBarComponent
  extends AppComponentBase implements OnInit {

  shoppingCartDetails: GetOrderDetailsForViewDto;
  @Input() id = 0;

  constructor(
    injector: Injector,
    private _AppTransactionServiceProxy: AppTransactionServiceProxy,
  ) {
    super(injector);
  }
  ngOnInit(): void {
    this._AppTransactionServiceProxy
      .getOrderDetailsForView(
        this.id,
        false,
        undefined,
        undefined,
        undefined
      )
      .subscribe((res) => {
        this.shoppingCartDetails = res;
      });
  }


}
