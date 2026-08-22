import {  Component, Injector, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AddOnsInputDto, AppSubscriptionPlanDetailsServiceProxy, AppTenantActivitiesLogServiceProxy, GetAppSubscriptionPlanDetailForViewDto } from '@shared/service-proxies/service-proxies';
import { AppTenantSubscriptionPlansServiceProxy } from '@shared/service-proxies/service-proxies';
import { Observable } from 'rxjs/internal/Observable';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-ons',
  templateUrl: './add-ons.component.html',
  styleUrls: ['./add-ons.component.scss']
})
export class AddOnsComponent extends AppComponentBase implements OnInit {

  tenantId = this.appSession.tenantId;
  tenantSubscriptionPlanId: Observable<number>;

  addons: GetAppSubscriptionPlanDetailForViewDto[];
  cart: GetAppSubscriptionPlanDetailForViewDto[] = []; 


  constructor(injector: Injector,
    private _appSubscriptionPlanDetailsServiceProxy: AppSubscriptionPlanDetailsServiceProxy,
    private _appTenantSubscriptionPlansServiceProxy: AppTenantSubscriptionPlansServiceProxy,
    private AppTenantActivitiesLogServiceProxy: AppTenantActivitiesLogServiceProxy) {
    super(injector);

  }

  ngOnInit() {
    this.getAppTenantAddOns()
  }


// merge


  getAppTenantAddOns() {
    this.showMainSpinner();

    this._appTenantSubscriptionPlansServiceProxy.getTenantSubscriptionPlanId(this.tenantId).subscribe(
      (tenantSubscriptionPlanId: number) => {
        var header = tenantSubscriptionPlanId;

        this._appSubscriptionPlanDetailsServiceProxy.getAll(
          null, null, null, null, null, null,
          null, null, null, null, null, null, null, null,
          null, null, null, null,
          null, header, null, true, null, 0, 100
        ).subscribe(result => {
          this.addons = result.items;
          this.hideMainSpinner();;
        });
      },
  
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
        const mappedCart = this.cart.map((item : any) => {
          let addOn = new AddOnsInputDto();
          addOn.featureCode = item.appSubscriptionPlanDetail?.featureCode;
          addOn.featureName = item.appSubscriptionPlanDetail?.featureName;
          addOn.price = item.appSubscriptionPlanDetail?.unitPrice || 0;
          addOn.qty = item.featureUsedQty || 1;
          return addOn;
        });

        let body = [...mappedCart];

        this.AppTenantActivitiesLogServiceProxy.addCreditActivityLog(body).subscribe(result => {
          this.hideMainSpinner();
          this.notify.info("Addons Purshased Successfully .");
          this.cart = []
          this.getAppTenantAddOns()
        });
      }
    });

  }


}
