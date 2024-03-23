import { Component, Injector, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { AppTransactionServiceProxy, ContactRoleEnum, GetAppTransactionsForViewDto } from '@shared/service-proxies/service-proxies';
import { ShoppingCartoccordionTabs } from '../shopping-cart-view-component/ShoppingCartoccordionTabs';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-create-or-edit-sales-rep-info',
  templateUrl: './create-or-edit-sales-rep-info.component.html',
  styleUrls: ['./create-or-edit-sales-rep-info.component.scss']
})

export class CreateOrEditSalesRepInfoComponent extends AppComponentBase {
  @Input("activeTab") activeTab: number;
  @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
  @Output("SalesRepInfoValid") SalesRepInfoValid: EventEmitter<ShoppingCartoccordionTabs> = new EventEmitter<ShoppingCartoccordionTabs>();
  shoppingCartoccordionTabs = ShoppingCartoccordionTabs;
  @Output("ontabChange") ontabChange: EventEmitter<ShoppingCartoccordionTabs> = new EventEmitter<ShoppingCartoccordionTabs>()
  salesRepIndex = 1;
  salesReps: any[];
  @Input("showSaveBtn") showSaveBtn: boolean = false;
  @Input("createOrEditSalesRepInfo") createOrEditSalesRepInfo: boolean = true;
  oldappTransactionsForViewDto;
  @Output("generatOrderReport") generatOrderReport: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Input("canChange")  canChange:boolean=true;

  constructor(
    injector: Injector,
   
   
    private _AppTransactionServiceProxy: AppTransactionServiceProxy
  ) {
    super(injector);
  }
  ngOnInit(): void {
  }
  ngOnChanges(changes: SimpleChanges) {
    this.oldappTransactionsForViewDto =JSON.parse(JSON.stringify(this.appTransactionsForViewDto));

    this.salesReps = [];
    this.salesReps.push(1);
    var SalesRep1Index = this.appTransactionsForViewDto?.appTransactionContacts?.findIndex(x => x.contactRole == ContactRoleEnum.SalesRep1);
    var SalesRep2Index = this.appTransactionsForViewDto?.appTransactionContacts?.findIndex(x => x.contactRole == ContactRoleEnum.SalesRep2);

    if (SalesRep1Index >= 0)
      this.addNewSalesRep();

    if (SalesRep2Index >= 0)
      this.addNewSalesRep();
  }
  onShowSalesRepEditMode($event) {
    if ($event) {
      this.createOrEditSalesRepInfo = true;
      this.oldappTransactionsForViewDto=JSON.parse(JSON.stringify(this.appTransactionsForViewDto));

    }
  }

  onshowSaveBtn($event) {
    this.showSaveBtn = $event;
  }

  save() {
    this.createOrEditSalesRepInfo = false;
    this.createOrEditTransaction();
  }
  cancel(){
    this.appTransactionsForViewDto=JSON.parse(JSON.stringify(this.oldappTransactionsForViewDto));
    this.onUpdateAppTransactionsForViewDto(this.appTransactionsForViewDto);
    this.createOrEditSalesRepInfo = false;
    this.showSaveBtn = false;
  }
  createOrEditTransaction() {
    this.showMainSpinner()
    this._AppTransactionServiceProxy.createOrEditTransaction(this.appTransactionsForViewDto)
      .pipe(finalize(() =>  {this.hideMainSpinner();this.generatOrderReport.emit(true)}))
      .subscribe((res) => {
        if (res) {
          this.oldappTransactionsForViewDto=JSON.parse(JSON.stringify(this.appTransactionsForViewDto));
          if (!this.showSaveBtn)
            this.ontabChange.emit(ShoppingCartoccordionTabs.SalesRepInfo);

          else
            this.showSaveBtn = false;
        }
      });
  }


  onUpdateAppTransactionsForViewDto($event) {
    this.appTransactionsForViewDto = $event;
  }

  isContactsValid: boolean = false;
  isContactFormValid(value) {
    if(this.activeTab==this.shoppingCartoccordionTabs.SalesRepInfo)
    {
    this.isContactsValid = value;
    if (value) {
      this.isContactsValid = true;
      this.SalesRepInfoValid.emit(ShoppingCartoccordionTabs.SalesRepInfo);
    }
  }

  }

  addNewSalesRep() {
    this.salesReps.push(this.salesReps.length);
  }

}
