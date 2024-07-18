import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppEntitiesServiceProxy, AppTransactionServiceProxy, CurrencyInfoDto, GetOrderDetailsForViewDto } from '@shared/service-proxies/service-proxies';


@Component({
  selector: 'app-transaction-side-bar',
  templateUrl: './app-transaction-side-bar.component.html',
  styleUrls: ['./app-transaction-side-bar.component.scss']
})
export class AppTransactionSideBarComponent
  extends AppComponentBase implements OnInit {

  shoppingCartDetails: GetOrderDetailsForViewDto;
  @Input() id = 0;

  @Output("hideSideBar") hideSideBar: EventEmitter<boolean> = new EventEmitter<boolean>();
  
  currencySymbol: string = "";


  constructor(
    injector: Injector,
    private _AppTransactionServiceProxy: AppTransactionServiceProxy,
    private _AppEntitiesServiceProxy: AppEntitiesServiceProxy
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

        //Currency
        this._AppEntitiesServiceProxy.getCurrencyInfo(res.currencyCode)
        .subscribe((res: CurrencyInfoDto) => {
            this.currencySymbol = res.symbol ? res.symbol : res.code  ;
        });

      });
  }

  onhideSideBar(){
    this.hideSideBar.emit(true);
  }


}


export class defultSideBar extends AppTransactionSideBarComponent{}
