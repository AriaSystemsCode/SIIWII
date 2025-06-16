import { Component, Injector } from '@angular/core';
import { AppSubscriptionPlanHeadersServiceProxy, AppTenantSubscriptionPlansServiceProxy, GetAppSubscriptionPlanHeaderForViewDto, GetAppTenantSubscriptionPlanForViewDto, PagedResultDtoOfGetAppSubscriptionPlanHeaderForViewDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.scss'],

})
export class PlansComponent extends AppComponentBase {
  isMonthlyPlan: boolean = true;
  plans: GetAppSubscriptionPlanHeaderForViewDto[] = []
  allDetails: GetAppSubscriptionPlanHeaderForViewDto[] = [];
  featureName:string = ''
  visible: boolean;
  tenantId: string =''
  tenantDto: GetAppTenantSubscriptionPlanForViewDto
  selectedPlanName: string = '';
  plansubId: number
  cols: GetAppSubscriptionPlanHeaderForViewDto[]

  constructor(injector: Injector,
    private _appSubscriptionPlanHeadersServiceProxy: AppSubscriptionPlanHeadersServiceProxy,
    private AppTenantSubscriptionPlansServiceProxy: AppTenantSubscriptionPlansServiceProxy) {

    super(injector);

  }
  ngOnInit() {

    this.monthlyClick()
  }
  monthlyClick() {
    this.showMainSpinner();

    this.isMonthlyPlan = true;
    this._appSubscriptionPlanHeadersServiceProxy.getAll(
      null, null, 1, null, null, null,
      null, null, null, null, null, null,
      null, null, 0, 100).subscribe(result => {
        this.plans = result.items
        this.plans.forEach(plan => {
          if (plan.appSubscriptionPlanHeader.appTenantSubscriptionPlanId != null) {
            this.getTenantData(plan.appSubscriptionPlanHeader.appTenantSubscriptionPlanId)
            this.plansubId = plan.appSubscriptionPlanHeader.appTenantSubscriptionPlanId

          }

          this.hideMainSpinner();

        });
      });


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
    this.cols = allDetails


    return uniqueFeatures;
  }

  yearlyClick() {
    this.isMonthlyPlan = false;
  }


  getTenantData(id: any) {
    this.AppTenantSubscriptionPlansServiceProxy.getAppTenantSubscriptionPlanForView(
      id).subscribe(result => {
        this.tenantId = id
        this.tenantDto = result

      });
  }




  showDialog(plan: any) {
    if (!this.tenantDto || !this.tenantDto.appTenantSubscriptionPlan) {
      this.tenantDto = {
        appTenantSubscriptionPlan: {}
      } as GetAppTenantSubscriptionPlanForViewDto;
    }
  
    this.tenantDto.appTenantSubscriptionPlan.subscriptionPlanCode = plan?.appSubscriptionPlanHeader?.code;
    this.tenantDto.appTenantSubscriptionPlan.appSubscriptionPlanHeaderId = plan?.appSubscriptionPlanHeader?.id;
    this.tenantDto.appTenantSubscriptionPlan.tenantId = this.appSession.tenantId;
  
    this.selectedPlanName = plan?.appSubscriptionPlanHeader?.name;
    this.visible = true;
  }
  


  confirm() {
    let body;
    body = this.tenantDto.appTenantSubscriptionPlan

    this.showMainSpinner();
    this.AppTenantSubscriptionPlansServiceProxy.createOrEdit(
      body).pipe(finalize(() => {
        this.hideMainSpinner();
        this.monthlyClick()
      })).subscribe(result => {

        this.notify.info(`Your subscription plan has been successfully updated to [${this.selectedPlanName}] , Note: You will be on the new plan starting from the next billing period.`);
      });


  }

  hasFeature(plan: any, feature: any): boolean {
    return plan.appSubscriptionPlanHeader?.appSubscriptionPlanDetails?.some((detail: any) => detail?.featureName === feature?.featureName);
  }
  getPlanClass(index: number): string {
    return ['custom-p-free', 'custom-p-sil', 'custom-p-gold', 'default-class', 'custom-p-free', 'custom-p-sil'][index] || 'default-class';
  }

  getPlanBtnClass(index: number): string {
    return ['free-btn', 'sil-btn', 'gold-btn', 'default-class-b', 'free-btn', 'sil-btn'][index] || 'default-class-b';
  }

  getFontSize(): string {
    const baseSize = 20;
    return this.plans.length > 4 ? `${baseSize - 8}px` : `${baseSize}px`;
  }
}
