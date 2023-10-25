import { Component, Injector, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountsServiceProxy, AppContactAddressDto, BranchDto, LookupLabelDto, SycEntityObjectCategoriesServiceProxy } from '@shared/service-proxies/service-proxies';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

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
    // to be defined later istead of any => AppContactAddressDto , but it make error
    billingAddress : any
    shippingAddress : any
    distributionAddress : any
    mailingAddress : any
    constructor(
        injector: Injector,
        public currentModalRef: BsModalRef,
        private _accountsServiceProxy :AccountsServiceProxy

    ) {
        super(injector)
    }

    close(){
        this.currentModalRef.setClass('right-modal slide-right-out')
        this.currentModalRef.hide()
    }

    ngOnInit(){
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
