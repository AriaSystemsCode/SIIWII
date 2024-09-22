import { Component, Injector } from '@angular/core';
import { AppSubscriptionPlanDetailsServiceProxy, AppSubscriptionPlanHeaderDto, AppSubscriptionPlanHeadersServiceProxy, AppTenantSubscriptionPlansServiceProxy, GetAppSubscriptionPlanHeaderForViewDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';


@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.scss'],

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
  showToast: boolean = false;
  showConfirmDialog: boolean = false;
  toastMessage: string = '';
  toastClass: string = '';
  visible: boolean;
  tenantId:any
  tenantDto:any
  constructor( injector: Injector,
        private _appSubscriptionPlanHeadersServiceProxy: AppSubscriptionPlanHeadersServiceProxy,private _AppSubscriptionPlanDetailsServiceProxy:AppSubscriptionPlanDetailsServiceProxy,private AppTenantSubscriptionPlansServiceProxy : AppTenantSubscriptionPlansServiceProxy)
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
    // this.primengTableHelper.totalRecordsCount = result.totalCount;
    this.plans = result.items
    this.plans.forEach(plan => {
      if(plan.appSubscriptionPlanHeader.appTenantSubscriptionPlanId != null) {
        this.getTenantData(plan.appSubscriptionPlanHeader.appTenantSubscriptionPlanId )

      }


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
confirm() {
  this.showConfirmDialog = true;
}

accept() {
  this.showConfirmDialog = false;
  // this.showToastMessage('Action confirmed!', 'success');
}

reject() {
  this.showConfirmDialog = false;
  // this.showToastMessage('Action rejected!', 'error');
}

getTenantData(id:any){
  this.AppTenantSubscriptionPlansServiceProxy.getAppTenantSubscriptionPlanForView(
id).subscribe(result => {
  this.tenantId = id
   this.tenantDto = result
   console.log(this.tenantDto,'dddd')

});
}





showDialog() {
  this.visible = true;
  let tenantId = ''
  if (localStorage.getItem("SellerId") && localStorage.getItem("SellerId") != "undefined") {
    tenantId = JSON.parse(localStorage.getItem("SellerId"));
}
  let body;
  this.AppTenantSubscriptionPlansServiceProxy.createOrEdit(
    body).subscribe(result => {
     
       this.tenantDto = result
       console.log(this.tenantDto,'dddd')
    
    });
}


getPlanClass(planIndex: number): string {
  switch (planIndex) {
      case 0:
          return 'custom-p-free';  // Custom class for plan 0
      case 1:
          return 'custom-p-sil';  // Custom class for plan 1
      case 2:
          return 'custom-p-gold';  // Custom class for plan 2
      default:
          return 'default-class';     // Fallback class
  }
}

getPlanBtnClass(planIndex: number): string {
  switch (planIndex) {
      case 0:
          return 'free-btn';  // Custom class for plan 0
      case 1:
          return 'sil-btn';  // Custom class for plan 1
      case 2:
          return 'gold-btn';  // Custom class for plan 2
      default:
          return 'default-class';     // Fallback class
  }
}
}
