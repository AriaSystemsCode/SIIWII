import { ChangeDetectorRef, Component, Injector, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import {AppSubscriptionPlanDetailDto, AppSubscriptionPlanDetailsServiceProxy, GetAppSubscriptionPlanDetailForViewDto } from '@shared/service-proxies/service-proxies';
import {AppTenantSubscriptionPlansServiceProxy} from '@shared/service-proxies/service-proxies';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { Observable } from 'rxjs/internal/Observable';
import { trigger, transition, style, animate } from '@angular/animations';
import { ProgressComponent } from "@app/shared/common/progress/progress.component";

@Component({
  selector: 'app-add-ons',
  templateUrl: './add-ons.component.html',
  styleUrls: ['./add-ons.component.scss']
})
export class AddOnsComponent extends AppComponentBase {
  @ViewChild("ProgressModal", { static: true }) 
  ProgressModal: ProgressComponent;
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  tenantId = this.appSession.tenantId;
  tenantSubscriptionPlanId:Observable<number>;
  progressValue = 50  ;
  progress=0.1;
  
  constructor( injector: Injector,
    private _appSubscriptionPlanDetailsServiceProxy: AppSubscriptionPlanDetailsServiceProxy,
    private _appTenantSubscriptionPlansServiceProxy:AppTenantSubscriptionPlansServiceProxy
    )
    {
      super(injector);
      
    }
    async ngOnInit()
    {
      this.progress = 0.1;
       
    }
    async getAppTenantAddOns(event?: LazyLoadEvent)
{
  if (this.primengTableHelper.shouldResetPaging(event)) {
    this.paginator.changePage(0);
    //return;
}

this.primengTableHelper.showLoadingIndicator();
  this.tenantSubscriptionPlanId = this._appTenantSubscriptionPlansServiceProxy.getTenantSubscriptionPlanId(this.tenantId);
  var header = await this.tenantSubscriptionPlanId.toPromise();
  this._appSubscriptionPlanDetailsServiceProxy.getAll(
    null,    null,    null,    null,  null ,    null,
    null,    null,    null,    null,    null,    null, null,    null, 
    null,    null, null,    null,
    null,  header,  null,   true,null,     0,    100).subscribe(result => {
    this.primengTableHelper.totalRecordsCount = result.totalCount;
    this.primengTableHelper.records = result.items;
    this.primengTableHelper.hideLoadingIndicator();
    //this.cdr.detectChanges();
});

} 
reloadPage(): void {
  this.paginator.changePage(this.paginator.getPage());
}
add(){}
getProgressBarWidth(inputRow: GetAppSubscriptionPlanDetailForViewDto)
{
  var widthCalc = 1;
  if (inputRow.featureCreditQty!=0)
     widthCalc = (inputRow.featureUsedQty/inputRow.featureCreditQty) *100;
  
  return {'width.%': widthCalc};
}
}
