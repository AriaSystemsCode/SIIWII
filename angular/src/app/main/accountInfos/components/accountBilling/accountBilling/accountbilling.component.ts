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
isInvoice:boolean = false;
isPlan:boolean= true;
isAddOn:boolean=false;
isActivityLog = false;
AccountBillingComponent()
{
  this.btnStyle="billing-option-btn";
} 
ngOnInit()
{
  this.openbillingpage(BillingOptionsPageTabs.PlansOption,'planbtn');
}
openbillingpage(number:BillingOptionsPageTabs,id:string)
{
  this.currentTab = number;
  this.btnStyle="billing-option-btn-clicked";
  if (id == "invoicebtn")
{
  this.isInvoice = true;
  this.isPlan= false;
  this.isAddOn=false;
  this.isActivityLog = false;
}
if (id == "actlogbtn")
{
  this.isInvoice = false;
  this.isPlan= false;
  this.isAddOn=false;
  this.isActivityLog = true;
}
if (id == "addonbtn")
{
  this.isInvoice = false;
  this.isPlan= false;
  this.isAddOn=true;
  this.isActivityLog = false;
}
if (id == "planbtn")
{
  this.isInvoice = false;
  this.isPlan= true;
  this.isAddOn=false;
  this.isActivityLog = false;
}

  /* var button = document.getElementById(id); 
  if (button!=null)
     button.setAttribute("style","billing-option-btn-clicked"); */
   
  //this.__router.navigate(["add-ons"]);
}
}
