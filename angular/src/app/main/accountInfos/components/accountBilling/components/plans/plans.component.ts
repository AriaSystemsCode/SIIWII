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
  plans: any[] = []
  records: any[];
  //primengTableHelper:any;
  allDetails: any[] = [];
  featureName:any
  categoryName:any
  constructor( injector: Injector,
        private _appSubscriptionPlanHeadersServiceProxy: AppSubscriptionPlanHeadersServiceProxy,private _AppSubscriptionPlanDetailsServiceProxy:AppSubscriptionPlanDetailsServiceProxy)
        {
          
    super(injector);
    
        }
ngOnInit()
{

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
    this.plans.forEach(plan => {
    this.getDetailsForPlan(plan.appSubscriptionPlanHeader.id )

      // plan.appSubscriptionPlanHeader.appSubscriptionPlanDetails.forEach(detail => {
      //   if (plan.appSubscriptionPlanHeader.id === detail.appSubscriptionPlanHeaderId) {
      //     this.allDetails.push(detail);
      //   }
      // });
    });
    console.log(this.allDetails, 'Filtered details');



});


}

getDetailsForPlan(planId: number) {
  this.allDetails = [];  // Clear previous details

  // Find the plan with the matching planId
  const selectedPlan = this.plans.find(plan => plan.appSubscriptionPlanHeader.id === planId);

  if (selectedPlan) {
    // Filter the details for that specific plan
    selectedPlan.appSubscriptionPlanHeader.appSubscriptionPlanDetails.forEach(detail => {
      if (selectedPlan.appSubscriptionPlanHeader.id === detail.appSubscriptionPlanHeaderId) {
        this.allDetails.push(detail);
      }
    });
  }

  console.log(this.allDetails, 'Filtered details for plan with ID: ' + planId);
}
getUniqueCategories() {
  const allDetails = this.plans.reduce((acc, plan) => {
    return [...acc, ...plan.appSubscriptionPlanHeader.appSubscriptionPlanDetails];
  }, []);

  // Extract unique categories
  const uniqueCategories = allDetails
    .map(detail => detail.category)
    .filter((value, index, self) => value && index === self.indexOf(value));

  return uniqueCategories;
}

getFeaturesByCategory(category: string) {
  // Aggregate all details from all plans
  const allDetails = this.plans.reduce((acc, plan) => {
    return [...acc, ...plan.appSubscriptionPlanHeader.appSubscriptionPlanDetails];
  }, []);

  // Filter features by category
  const filteredFeatures = allDetails.filter(detail => detail.category === category);

  // Ensure unique features by featureCode
  const uniqueFeatures = filteredFeatures.filter((feature, index, self) =>
    index === self.findIndex(f => f.featureCode === feature.featureCode)
  );

  return uniqueFeatures;
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
