import { Component, EventEmitter, Injector, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppTransactionServiceProxy, GetAppTransactionsForViewDto } from '@shared/service-proxies/service-proxies';
import { ShoppingCartoccordionTabs } from '../shopping-cart-view-component/ShoppingCartoccordionTabs';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-view-buyer-seller-contact-info',
  templateUrl: './view-buyer-seller-contact-info.component.html',
  styleUrls: ['./view-buyer-seller-contact-info.component.scss']
})
export class ViewBuyerSellerContactInfoComponent extends AppComponentBase
  implements OnInit {

    @Input("isCreateOrEdit") isCreateOrEdit: boolean;
    @Input("activeTab") activeTab: number;
    @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
    shoppingCartoccordionTabs = ShoppingCartoccordionTabs;
    @Output("showBuyer_sellerEditMode") showBuyer_sellerEditMode: EventEmitter<boolean> = new EventEmitter<boolean>() 
    @Output("onshowSaveBtn") onshowSaveBtn: EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output("generatOrderReport") generatOrderReport: EventEmitter<boolean> = new EventEmitter<boolean>()

  constructor(
    injector: Injector,
    private _AppTransactionServiceProxy: AppTransactionServiceProxy
  ) {
    super(injector);
  }
  ngOnInit(): void {

  }
  
  ngOnChanges(changes: SimpleChanges) {
  }

  onUpdateAppTransactionsForViewDto($event) {
    this.appTransactionsForViewDto = $event;
  }

  showEditMode() {
    this.isCreateOrEdit = true;
    this.onshowSaveBtn.emit(true);
    this.showBuyer_sellerEditMode.emit(true);
  }




  createOrEditTransaction() {
    this.showMainSpinner();
    this._AppTransactionServiceProxy.createOrEditTransaction(this.appTransactionsForViewDto)
      .pipe(finalize(() =>  {this.hideMainSpinner();this.generatOrderReport.emit(true)}))
      .subscribe((res) => {
        if (res) {
          this.onshowSaveBtn.emit(false);
        }
      });
  }


  
}
