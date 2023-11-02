import { Component, EventEmitter, Injector, Input, OnChanges, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GetAccountForDropdownDto } from '@shared/service-proxies/service-proxies';
import { ProductCatalogueReportParams } from '../models/product-Catalogue-Report-Params';

@Component({
  selector: 'app-catalogue-report-cover-page-step',
  templateUrl: './catalogue-report-cover-page-step.component.html',
  styleUrls: ['./catalogue-report-cover-page-step.component.scss']
})
export class CatalogueReportCoverPageStepComponent extends AppComponentBase  {
  @Input() printInfoParam: ProductCatalogueReportParams;
  @Output() continue: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Output() previous: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Input('accounts') accounts: GetAccountForDropdownDto[] = []
  @Output("searchAccount") searchAccountEvent: EventEmitter<string> = new EventEmitter<string>()
  @Output("linesheetName") linesheetName: EventEmitter<string> = new EventEmitter<string>()

  
  selectedAccount: GetAccountForDropdownDto
  // accounts : string[] = []
  constructor(
    private injector: Injector
  ) {
    super(injector)
  }
  continueToNextStep() {
    this.continue.emit(true);
  }

  previousStep() {
    this.previous.emit(true)
  }
  searchAccounts(str: string) {
    this.searchAccountEvent.emit(str)
  }

  onChangLinesheetName(){
    this.linesheetName.emit(this.printInfoParam.reportTitle);
  }
  selectAccount(account: GetAccountForDropdownDto) {
    if (!account) return
    this.printInfoParam.preparedForContactId = account.id
  }

}
