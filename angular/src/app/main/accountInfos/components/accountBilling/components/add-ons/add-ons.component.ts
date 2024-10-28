import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Injector, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import {AddOnsInputDto, AppSubscriptionPlanDetailDto, AppSubscriptionPlanDetailsServiceProxy, AppTenantActivitiesLogServiceProxy, GetAppSubscriptionPlanDetailForViewDto } from '@shared/service-proxies/service-proxies';
import {AppTenantSubscriptionPlansServiceProxy} from '@shared/service-proxies/service-proxies';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { Observable } from 'rxjs/internal/Observable';
import { trigger, transition, style, animate } from '@angular/animations';
import { ProgressComponent } from "@app/shared/common/progress/progress.component";
import { forEach } from 'lodash';
import { left } from '@devexpress/analytics-core/analytics-elements-metadata';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-ons',
  templateUrl: './add-ons.component.html',
  styleUrls: ['./add-ons.component.scss']
})
export class AddOnsComponent extends AppComponentBase implements OnInit  {
 
  tenantId = this.appSession.tenantId;
  tenantSubscriptionPlanId:Observable<number>;
 
  progress=0.1;
  addons: GetAppSubscriptionPlanDetailForViewDto[];
  cart: GetAppSubscriptionPlanDetailForViewDto[] = []; // Cart items
  purshasedAddons: AddOnsInputDto[] = [];
  
 
  constructor( injector: Injector,
    private _appSubscriptionPlanDetailsServiceProxy: AppSubscriptionPlanDetailsServiceProxy,
    private _appTenantSubscriptionPlansServiceProxy:AppTenantSubscriptionPlansServiceProxy,
    private el: ElementRef, private AppTenantActivitiesLogServiceProxy:AppTenantActivitiesLogServiceProxy )
    {
      super(injector);
      
    }

     ngOnInit()
    {
      
       this.getAppTenantAddOns()
   

    }


    getAppTenantAddOns() {
    this.showMainSpinner();

      this._appTenantSubscriptionPlansServiceProxy.getTenantSubscriptionPlanId(this.tenantId).subscribe(
        (tenantSubscriptionPlanId: number) => {
          console.log(tenantSubscriptionPlanId, ' tenantSubscriptionPlanId');
    
          var header = tenantSubscriptionPlanId;
    
          this._appSubscriptionPlanDetailsServiceProxy.getAll(
            null, null, null, null, null, null,
            null, null, null, null, null, null, null, null, 
            null, null, null, null,
            null, header, null, true, null, 0, 100
          ).subscribe(result => {
            // this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.addons = result.items;
        this.hideMainSpinner();

            console.log(this.addons,'lklklklkk')
            // this.primengTableHelper.hideLoadingIndicator();
            //this.cdr.detectChanges();
          });
        },
        (error) => {
          console.error('Error fetching subscription plan ID', error);
        }
      );
    }


addToCart(record: GetAppSubscriptionPlanDetailForViewDto) {
  // Check if the item already exists in the cart based on a unique property like `featureName`
  const existingItem = this.cart.find(cartItem => cartItem.appSubscriptionPlanDetail?.featureName === record.appSubscriptionPlanDetail?.featureName);

  if (!existingItem) {
    // If the item does not exist, add it to the cart
    const newRecord = new GetAppSubscriptionPlanDetailForViewDto();
    newRecord.init({
      ...record,
      featureUsedQty: 1  
    });
    this.cart.push(newRecord);
  }
}


removeRecord(record: GetAppSubscriptionPlanDetailForViewDto) {
  this.cart = this.cart.filter(
    item => 
      item.appSubscriptionPlanDetail?.featureName !== record.appSubscriptionPlanDetail?.featureName ||
      item.featureUsedQty !== record.featureUsedQty
  );
  this.totalQuantity
  this.totalAmount
}


clearCart() {
  this.cart = [];
}

get totalQuantity(): number {
  return this.cart.reduce((acc, item) => acc + (item.featureUsedQty || 0), 0);
}

// Getter to calculate total amount
get totalAmount(): number {
  return this.cart.reduce((acc, item) => acc + (item.appSubscriptionPlanDetail.unitPrice * (item.featureUsedQty || 0)), 0);
}

isRecordInCart(record: any): boolean {
  return this.cart.some(cartItem => cartItem?.appSubscriptionPlanDetail?.featureName === record?.appSubscriptionPlanDetail?.featureName);
}


purchaseAddons() {



  Swal.fire({
    title: "",
    text: "Are you sure you Want this purshased Add ons ?",
    icon: "info",
    showCancelButton: true,
    confirmButtonText:
        "Yes",
    cancelButtonText: "No",
    allowOutsideClick: false,
    allowEscapeKey: false,
    backdrop: true,
    customClass: {
        popup: "popup-class",
        icon: "icon-class",
        content: "content-class",
        actions: "actions-class",
        confirmButton: "confirm-button-class2",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      this.showMainSpinner();
      const mappedCart = this.cart.map((record: any) => {
        let addOn = new AddOnsInputDto();
        addOn.featureCode = record.appSubscriptionPlanDetail?.featureCode;
        addOn.featureName = record.appSubscriptionPlanDetail?.featureName;
        addOn.price = record.appSubscriptionPlanDetail?.unitPrice || 0;
        addOn.qty = record.featureUsedQty || 1;
        return addOn;
      });
    
      let body = [...mappedCart];  
    
      
      console.log(body, 'Mapped Cart Body');
    
     
      this.AppTenantActivitiesLogServiceProxy.addCreditActivityLog(body).subscribe(result => {
        this.hideMainSpinner();
        this.notify.info("Addons Purshased Successfully .");
        this.cart = []
        this.getAppTenantAddOns()
        console.log('Purchase successful', result);
      });
    }
  });


  console.log(this.cart, 'heee');  

  
}


}
