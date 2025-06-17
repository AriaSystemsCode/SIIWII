import { Component, OnInit } from '@angular/core';
import { BillingOptionsPageTabs } from '../../../models/Billing-options-page-tabs.enum';

@Component({
  selector: 'app-accountbilling',
  templateUrl: './accountbilling.component.html',
  styleUrls: ['./accountbilling.component.scss']
})
export class AccountBillingComponent implements OnInit {
  billingOptionsTabs = BillingOptionsPageTabs;
  currentTab: BillingOptionsPageTabs;

  isInvoice = false;
  isPlan = true;
  isAddOn = false;
  isActivityLog = false;

  ngOnInit(): void {
    this.openbillingpage(BillingOptionsPageTabs.PlansOption, 'planbtn');
  }

  openbillingpage(tab: BillingOptionsPageTabs, id: string): void {
    this.currentTab = tab;

    // Reset all
    this.isInvoice = false;
    this.isPlan = false;
    this.isAddOn = false;
    this.isActivityLog = false;

    // Set active tab
    switch (id) {
      case 'invoicebtn':
        this.isInvoice = true;
        break;
      case 'actlogbtn':
        this.isActivityLog = true;
        break;
      case 'addonbtn':
        this.isAddOn = true;
        break;
      case 'planbtn':
      default:
        this.isPlan = true;
        break;
    }
  }
}
