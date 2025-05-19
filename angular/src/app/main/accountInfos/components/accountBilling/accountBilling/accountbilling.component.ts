import { Component } from '@angular/core';
import { BillingOptionsPageTabs } from '../../../models/Billing-options-page-tabs.enum';
import { Router } from '@angular/router';

@Component({
  selector: 'app-accountbilling',
  templateUrl: './accountbilling.component.html',
  styleUrls: ['./accountbilling.component.scss']
})
export class AccountBillingComponent {
  billingOptionsTabs = BillingOptionsPageTabs;
  __router: Router;
  currentTab: BillingOptionsPageTabs;
  isInvoice: boolean = false;
  isPlan: boolean = true;
  isAddOn: boolean = false;
  isActivityLog = false;

  ngOnInit() {
    this.openbillingpage(BillingOptionsPageTabs.PlansOption, 'planbtn');
  }


  openbillingpage(number: BillingOptionsPageTabs, id: string) {
    this.currentTab = number;
    if (id == "invoicebtn") {
      this.isInvoice = true;
      this.isPlan = false;
      this.isAddOn = false;
      this.isActivityLog = false;
    }
    if (id == "actlogbtn") {
      this.isInvoice = false;
      this.isPlan = false;
      this.isAddOn = false;
      this.isActivityLog = true;
    }
    if (id == "addonbtn") {
      this.isInvoice = false;
      this.isPlan = false;
      this.isAddOn = true;
      this.isActivityLog = false;
    }
    if (id == "planbtn") {
      this.isInvoice = false;
      this.isPlan = true;
      this.isAddOn = false;
      this.isActivityLog = false;
    }
  }
}
