import { Component, Injector, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountsServiceProxy, AppContactAddressDto, BranchDto, LookupLabelDto } from '@shared/service-proxies/service-proxies';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-branch-details-dynamic-modal',
  templateUrl: './branch-details-dynamic-modal.component.html',
  styleUrls: ['./branch-details-dynamic-modal.component.scss']
})
export class BranchDetailsDynamicModalComponent extends AppComponentBase implements OnInit   {
    billingAddressDef:LookupLabelDto
    directShippingAddressDef:LookupLabelDto
    distributionCenterAddressDef:LookupLabelDto
    mailingAddressDef:LookupLabelDto

    branchId : number
    branchName : string
    branch : BranchDto
    loading:boolean = false
    billingAddress : AppContactAddressDto
    shippingAddress : AppContactAddressDto
    distributionAddress : AppContactAddressDto
    mailingAddress : AppContactAddressDto

        currentLang:string
    isArabic:boolean = true

    constructor(
        injector: Injector,
        public currentModalRef: BsModalRef,
        private _accountsServiceProxy :AccountsServiceProxy

    ) {
        super(injector)
    }

    close(){
        // this.currentModalRef.setClass('right-modal slide-right-out')
          this.currentModalRef.setClass(
    this.isArabic
      ? 'left-modal slide-left-out'
      : 'right-modal slide-right-out'
  );

        this.currentModalRef.hide()
    }

    ngOnInit(){
            this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
        this.currentLang == 'ar' || this.currentLang == 'ar-EG'  ? this.isArabic = true : this.isArabic = false
        if(this.branchId) {
            this.getBranchDetails(this.branchId)
        } else {
            close()
        }
    }


    getBranchDetails(id){
        this.loading = true
        this._accountsServiceProxy.getBranchForEdit(id)
        .subscribe(res=>{
            this.loading = false
            this.branch = res
            this.billingAddress = this.branch.contactAddresses.find(x=>x.addressTypeId==this.billingAddressDef.value)
            this.shippingAddress = this.branch.contactAddresses.find(x=>x.addressTypeId==this.directShippingAddressDef.value)
            this.distributionAddress = this.branch.contactAddresses.find(x=>x.addressTypeId==this.distributionCenterAddressDef.value)
            this.mailingAddress = this.branch.contactAddresses.find(x=>x.addressTypeId==this.mailingAddressDef.value)
        })
    }

}
