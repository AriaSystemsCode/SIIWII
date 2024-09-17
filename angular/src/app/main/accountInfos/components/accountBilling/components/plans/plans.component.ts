import { Component, Injector } from '@angular/core';
import { AppSubscriptionPlanDetailsServiceProxy, AppSubscriptionPlanHeaderDto, AppSubscriptionPlanHeadersServiceProxy, GetAppSubscriptionPlanHeaderForViewDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.scss']
})
export class PlansComponent extends AppComponentBase {
  isMonthlyPlan:boolean =true;
  buttonMonthColor: string= '#4A0D4A';
  plans: GetAppSubscriptionPlanHeaderForViewDto[] = []
  records: any[];
  //primengTableHelper:any;
  constructor( injector: Injector,
        private _appSubscriptionPlanHeadersServiceProxy: AppSubscriptionPlanHeadersServiceProxy,private _AppSubscriptionPlanDetailsServiceProxy:AppSubscriptionPlanDetailsServiceProxy)
        {
          
    super(injector);
    
        }
ngOnInit()
{
//  this.products= [
//   { code: '001', name: 'Product A', category: 'Category X', quantity: 10 },
//   { code: '002', name: 'Product B', category: 'Category Y', quantity: 20 },
//   { code: '003', name: 'Product C', category: 'Category Z', quantity: 30 },
//   { code: '004', name: 'Product D', category: 'Category L', quantity: 34 },
//  ]
this.monthlyClick()
} 
monthlyClick()
{
  this.isMonthlyPlan =true;
  this._appSubscriptionPlanHeadersServiceProxy.getAll(
    null,    null,    1,    null,  null ,    null,
    null,    null,    null,    null,    null,    null,
    null,    null,    0,    100).subscribe(result => {
    this.primengTableHelper.totalRecordsCount = result.totalCount;
    // this.primengTableHelper.records = result.items;
    // this.primengTableHelper.hideLoadingIndicator();
    this.plans = result.items
    console.log(result.items,'result.items')
});
this._AppSubscriptionPlanDetailsServiceProxy.getAll(
  null,    null,    null,    null,  null ,    null,null,  null ,    null,null,  null ,    null,null,  null ,   
  null,    null,    null,    null,    null,    null,
  null,    null,    0,    100).subscribe(result => {
  this.primengTableHelper.totalRecordsCount = result.totalCount;
  // this.primengTableHelper.records = result.items;
  // this.primengTableHelper.hideLoadingIndicator();
  this.records = result.items
  console.log(result.items,'result.itemssssssssssssssssss')
});
}
getMonthStyle()
{
  //return this.monthStyle;
}
yearlyClick()
{
  this.isMonthlyPlan =false;
}
}
