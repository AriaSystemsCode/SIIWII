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
btnStyle:string;
AccountBillingComponent()
{
  this.btnStyle="billing-option-btn";
} 
openbillingpage(number:BillingOptionsPageTabs,id:string)
{
  this.currentTab = number;
  this.btnStyle="billing-option-btn-clicked";
  /* var button = document.getElementById(id); 
  if (button!=null)
     button.setAttribute("style","billing-option-btn-clicked"); */
   
  //this.__router.navigate(["add-ons"]);
}
}
