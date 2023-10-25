import { Component, Injector, Input, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppTransactionServiceProxy, ContactRoleEnum, GetAppTransactionsForViewDto } from '@shared/service-proxies/service-proxies';
import { ShoppingCartoccordionTabs } from '../shopping-cart-view-component/ShoppingCartoccordionTabs';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-view-sales-rep-info',
  templateUrl: './view-sales-rep-info.component.html',
  styleUrls: ['./view-sales-rep-info.component.scss']
})
export class ViewSalesRepInfoComponent extends AppComponentBase
  implements OnInit {


  @Input("createOrEditSalesRepInfo") createOrEditSalesRepInfo: boolean;
  @Input("activeTab") activeTab: number;
  @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
  shoppingCartoccordionTabs = ShoppingCartoccordionTabs;
  @Output("showSalesRepEditMode") showSalesRepEditMode: EventEmitter<boolean> = new EventEmitter<boolean>() 
  @Output("onshowSaveBtn") onshowSaveBtn: EventEmitter<boolean> = new EventEmitter<boolean>()
  salesRepIndex = 1;
  salesReps: any[];

  constructor(
    injector: Injector,
    private _AppTransactionServiceProxy: AppTransactionServiceProxy
  ) {
    super(injector);
  }
  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges) {
    this.salesReps = [];
    this.salesReps.push(1);

    var SalesRep1Index = this.appTransactionsForViewDto?.appTransactionContacts?.findIndex(x => x.contactRole == ContactRoleEnum.SalesRep1);
    var SalesRep2Index = this.appTransactionsForViewDto?.appTransactionContacts?.findIndex(x => x.contactRole == ContactRoleEnum.SalesRep2);

    if (SalesRep1Index >= 0)
      this.addNewSalesRep();

    if (SalesRep2Index >= 0)
      this.addNewSalesRep();
  }

  addNewSalesRep() {
    this.salesReps.push(this.salesReps.length);
  }


  onUpdateAppTransactionsForViewDto($event) {
    this.appTransactionsForViewDto = $event;
  }



  showEditMode() {
    this.createOrEditSalesRepInfo = true;
    this.onshowSaveBtn.emit(true);
    this.showSalesRepEditMode.emit(true);
  }




  createOrEditTransaction() {
    this.showMainSpinner();
    this._AppTransactionServiceProxy.createOrEditTransaction(this.appTransactionsForViewDto)
      .pipe(finalize(() => this.hideMainSpinner()))
      .subscribe((res) => {
        if (res) {
          this.onshowSaveBtn.emit(false);
        }
      });
  }
}
