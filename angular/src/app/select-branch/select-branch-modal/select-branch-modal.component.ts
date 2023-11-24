
import { Component, ViewChild, Injector, Output, EventEmitter,Input} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    BranchDto,
    AccountsServiceProxy,
    AppEntitiesServiceProxy
    } from '@shared/service-proxies/service-proxies';
import { HttpErrorResponse } from '@angular/common/http';
import { AccountLevelEnum,  CreateOrEditAccountInfoDto, TreeNodeOfBranchForViewDto, TreeviewItem } from '@shared/service-proxies/service-proxies';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { TreeNode, TreeTable } from 'primeng';
import { Subscription } from 'rxjs';
@Component({
  selector: 'selectBranchModal',
  templateUrl: './select-branch-modal.component.html',
  styleUrls: ['./select-branch-modal.component.scss']
})
export class SelectBranchModalComponent extends AppComponentBase {

    @ViewChild('selectBranchModal', { static: true }) modal: ModalDirective;
    branches:TreeNodeOfBranchForViewDto[];
    filteredbranches:TreeNodeOfBranchForViewDto[];
    branch:TreeNodeOfBranchForViewDto;
    branchId :number

    @Output() branchSelected: EventEmitter<any> = new EventEmitter<any>();
    selectedBranch :TreeNodeOfBranchForViewDto;

    @Output() BranchSelectionCanceled: EventEmitter<any> = new EventEmitter<any>();
    active = false;
    saving = false;
    isCheckedBranch = 0;
    busy=true;
    loading=false
    constructor(injector: Injector,private _accountsServiceProxy: AccountsServiceProxy,
)  {
        super(injector);
        this.busy=true;
    }

    show(branchs:TreeNodeOfBranchForViewDto[]): void {
        if (branchs !=undefined && branchs.length >0) {
            this.branchId = branchs[0].data.branch.id
            this.spinnerService.show();
            this._accountsServiceProxy.getBranchChilds(this.branchId).subscribe(result => {
                this.branches = branchs;
                this.filteredbranches=this.branches;
                this.spinnerService.hide();
                this.filteredbranches=branchs
                this.active = true;
                this.modal.show();
            });
        }
        else
        {//account has no branches yet}


        }
    }

    loadingChilds :boolean

    getBranches(event) {
        this.loadingChilds = true;

        this._accountsServiceProxy.getBranchChilds(event.node.data.branch.id
        ).subscribe(result => {
            const node = event.node;
            node.children = [];
            node.children = result;
            this.branches = [...this.branches];
        });


    }




    close(){
        this.active = false;
        this.modal.hide();
    }
    cancel(){
        this.BranchSelectionCanceled.emit()
        this.close()
    }

    filterItems(arr, query) {

        return arr.filter(function(el) {
            if(el.name !=null)
            return el.name.toLowerCase().indexOf(query.toLowerCase()) !== -1
        })
      }

    onChangeSearch(e){

        if(e.target.value)
        this.filteredbranches = this.filterItems( this.branches,e.target.value)
        else
        this.filteredbranches = this.branches
    }


    branchChecked(e){
         if(e.target.checked)
         this.isCheckedBranch = e.target.checked;
         else
         this.isCheckedBranch = 0;
    }

    selectBranch(): void {
        if(this.selectedBranch!=undefined){
            this.branchSelected.emit(this.selectedBranch.data.branch);
            this.spinnerService.hide();
            this.modal.hide()
        }
        this.close()
        this.spinnerService.hide();
    }
}
