import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TransactionInformationComponent } from '@app/main/transactions/app-TransactionTabsInfo/Components/transaction-information-component/transaction-information.component';
import { TransactionCartMode } from '@app/main/transactions/enums/TransactionCartMode';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppEntitiesServiceProxy, AppTransactionServiceProxy, CurrencyInfoDto, GetOrderDetailsForViewDto } from '@shared/service-proxies/service-proxies';


@Component({
  selector: 'app-transaction-side-bar',
  templateUrl: './app-transaction-side-bar.component.html',
  styleUrls: ['./app-transaction-side-bar.component.scss'],
})
export class AppTransactionSideBarComponent
  extends AppComponentBase implements OnInit {

  shoppingCartDetails: GetOrderDetailsForViewDto;
  @Input() id = 0;

  @Output("hideSideBar") hideSideBar: EventEmitter<boolean> = new EventEmitter<boolean>();
  
  @ViewChild("shoppingCartModal", { static: true }) shoppingCartModal: TransactionInformationComponent;
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

   openTransaction() {
           
        this.shoppingCartModal.show(this.id, true, true, TransactionCartMode.view);
  

      }
  

          onHideShoppingCartModal($event) {
     
    }

}

export const defultSideBar = AppTransactionSideBarComponent;