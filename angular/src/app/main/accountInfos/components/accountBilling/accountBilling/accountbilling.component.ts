import { Component } from '@angular/core';
import {BillingOptionsPageTabs} from '../../../models/Billing-options-page-tabs.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { AddOnsComponent } from '../components/add-ons/add-ons.component';
import { TenantInvoicesComponent } from '../components/tenant-invoices/tenant-invoices.component';
import { ActivityLogComponent } from '../components/activity-log/activity-log.component';
import { PlansComponent } from '../components/plans/plans.component';
@Component({
  selector: 'app-accountbilling',
  templateUrl: './accountbilling.component.html',
  styleUrls: ['./accountbilling.component.scss']
})
export class AccountBillingComponent {
billingOptionsTabs = BillingOptionsPageTabs;
__router: Router;
currentTab: BillingOptionsPageTabs;
openbillingpage(number:BillingOptionsPageTabs)
{
  this.currentTab = number;
  var button = document.getElementById('planbtn'); 
   button.style.background= '#5A225A';
   button.style.color = 'white'
  //this.__router.navigate(["add-ons"]);
}
}
