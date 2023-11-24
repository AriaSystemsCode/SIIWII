import { Component, EventEmitter, Injector, Input, OnChanges, Output,  SimpleChanges,  ViewChild } from '@angular/core';
import { CreateOrEditAddressModalComponent } from '@app/selectAddress/create-or-edit-Address-modal/create-or-edit-Address-modal.component';
import { SelectAddressModalComponent } from '@app/selectAddress/selectAddress/selectAddress-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountLevelEnum, AccountsServiceProxy, AppEntitiesServiceProxy, BranchDto, CreateOrEditAccountInfoDto, LookupLabelDto, TreeNodeOfBranchForViewDto, TreeviewItem } from '@shared/service-proxies/service-proxies';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { TreeNode, TreeTable } from 'primeng';
import { Observable, Subscription } from 'rxjs';
import { BranchDetailsDynamicModalComponent } from './branch-details-dynamic-modal.component';
import { CreateOrEditBranchModalComponent } from './create-or-edit-branch-modal.component';

@Component({
  selector: 'app-branches',
  templateUrl: './branches.component.html',
  styleUrls: ['./branches.component.scss'],
  animations: [appModuleAnimation()],
})
export class BranchesComponent extends AppComponentBase  {
    @Input('branches') branches : TreeNodeOfBranchForViewDto[]
    @Input('accountId') accountId : number
    @Input('accountLevel') accountLevel : AccountLevelEnum
    @Input('viewMode') viewMode : boolean = false
    @Output("askToPublish") askToPublish : EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output("changeTouchState") changeTouchState : EventEmitter<boolean> = new EventEmitter<boolean>()

    @ViewChild('createOrEditBranchModal', { static: true }) createOrEditBranchModal: CreateOrEditBranchModalComponent;
    @ViewChild('createOrEditAddressModal', { static: true }) createOrEditAddressModal: CreateOrEditAddressModalComponent;
    @ViewChild('selectAddressModal', { static: true }) selectAddressModal: SelectAddressModalComponent;
    @ViewChild('dataTable', { static: true }) dataTable: TreeTable;

    loadingChilds :boolean
    publishing : boolean
    currBranchNode : { node :TreeNodeOfBranchForViewDto ,parent:TreeNodeOfBranchForViewDto,level?:number,visiable?:boolean}
    currSelectAddress: number;
    selectedBranchId:number
    selectedParentBranchId:number
    displaySaveAccount:boolean
    dropdownActionmenuhover:string = ''
    constructor(
        injector:Injector,
        private _BsModalService : BsModalService,
        private _accountsServiceProxy :AccountsServiceProxy,
        private _appEntitiesServiceProxy  :AppEntitiesServiceProxy,
    ) {
        super(injector)
        this.getAllBranchesTypes();
    }
    
    editBranch(rowNode : {level: number, node: TreeNodeOfBranchForViewDto , parent: TreeNodeOfBranchForViewDto , visible: boolean}) {
        // this.changeTouchState.emit(true)
        this.currBranchNode = rowNode
        //node.children
        this.selectedBranchId = rowNode.node.data.branch.id
        const isMainBranch = this.selectedBranchId == this.accountId
        const sendAccountId = Boolean(rowNode.parent) //|| isMainBranch
        this.createOrEditBranchModal.show( sendAccountId ? this.accountId : null, this.selectedBranchId )
    }

    createBranch(rowNode : { node :TreeNodeOfBranchForViewDto ,parent:any,level:number,visiable:boolean}) {
        if( rowNode.level > 2 ) {
            return this.message.info(
                this.l("Can'tCreateANewSubBranch,BranchesIsLimitedTo3Levels"),
                this.l("Info")
            )
        }
        // this.changeTouchState.emit(true)
        this.currBranchNode = rowNode
        this.selectedBranchId = 0
        this.selectedParentBranchId = rowNode.node.data.branch.id
        this.createOrEditBranchModal.show(this.accountId,0, this.selectedParentBranchId)
    }

    branchAdded(event) {
        this.displaySaveAccount = true
        this.askToPublish.emit(true)

        this.currBranchNode.node.leaf = false
        this.currBranchNode.node.expanded = true
        this.getBranches(this.currBranchNode)
        this.adjustParentBranchesCount(this.currBranchNode)
        if(this.currBranchNode)
        this.rerenderBranches()
        this.selectedBranchId = undefined
        this.selectedParentBranchId = undefined
    }
    adjustParentBranchesCount(branch){
        branch.node.data.subTotal +=1
        // if(branch.parent) {
        //     this.adjustParentBranchesCount(branch.parent)
        // }
    }
    branchUpdated(event) {

        this.displaySaveAccount = true
        this.askToPublish.emit(true)
        this.currBranchNode.node.data.branch.name = event.name
        this.currBranchNode.node.data.branch.code = event.code
        this.rerenderBranches()
        this.selectedBranchId = undefined
        this.selectedParentBranchId = undefined
    }

    selectAddress() {
        //this.currSelectAddress = addressNumber;
        this.createOrEditBranchModal.close();
        this.selectAddressModal.show(this.currBranchNode,this.accountId);
    }

    addressSelected(address) {
        this.selectAddressModal.close();
        this.createOrEditBranchModal.addressSelected(address);
    }

    createOrEditaddressCanceled(){
        this.selectAddressModal.show(this.currBranchNode,this.accountId)
    }
    addressSelectionCanceled(){
        this.createOrEditBranchModal.show(this.accountId,this.selectedBranchId,this.selectedParentBranchId)
        // if(this.selectedBranchId !== undefined && this.selectedParentBranchId !== undefined) this.createOrEditBranchModal.show(this.selectedBranchId,this.selectedParentBranchId)
        // else this.createOrEditBranchModal.show(this.selectedBranchId)
    }
    addNewAddress() {
        this.selectAddressModal.close();
        this.createOrEditAddressModal.show(undefined,undefined,this.accountId);
    }
    selectedAddressId :number
    editAddress(addressId) {
        this.selectedAddressId = addressId
        this.selectAddressModal.close();
        this.createOrEditAddressModal.show(addressId);
    }

    addressAdded(address) {
        this.createOrEditAddressModal.close();
        this.selectAddressModal.addressAdded(address);
    }

    addressUpdated(address) {
        this.createOrEditAddressModal.close();
        this.selectAddressModal.addressUpdated(address);
    }

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

    showBranchDetails(rowNode: {node:TreeNodeOfBranchForViewDto}){
        this.openBranchDetailsModal(rowNode.node.data.branch.id,rowNode.node.data.branch.name)
    }

    changeStyleActionButton($event) {
        this.dropdownActionmenuhover = $event.type == 'mouseover' ? 'dropdownActionmenuhover' : '';

    }
    deleteBranch(branch: BranchDto,parent:TreeviewItem): void {
        this._accountsServiceProxy.deleteBranch(branch.id)
        .subscribe(() => {
            // this.changeTouchState.emit(true)
            this.removeNodeFromParent(branch.id,parent)
            this.notify.success(this.l('SuccessfullyDeleted'));
        });
    }

    askToConfirmDelete(branch: BranchDto,rowNode:TreeviewItem){
        if(rowNode === null) return this.notify.error(this.l("Can'tDeleteTheMainBranch"))
        var isConfirmed: Observable<boolean>;
        isConfirmed   = this.askToConfirm('',"AreYouSureToRemoveThisBranch");

       isConfirmed.subscribe((res)=>{
                if(!res) return
                this.deleteBranch(branch,rowNode)
            }
        );
    }
    billingAddressDef:LookupLabelDto
    directShippingAddressDef:LookupLabelDto
    distributionCenterAddressDef:LookupLabelDto
    mailingAddressDef:LookupLabelDto
    getAllBranchesTypes(){
        this._appEntitiesServiceProxy.getAllEntitiesByTypeCode('ADDRESS-TYPE')
        .subscribe((res)=>{
            res.forEach(element => {
                switch (element.code) {
                    case "BILLING":
                        this.billingAddressDef = element
                        break;
                    case "DIRECT-SHIPPING":
                        this.directShippingAddressDef = element
                        break;
                    case "DISTRIBUTION-CENTER":
                        this.distributionCenterAddressDef = element
                        break;
                    case "MAILING":
                        this.mailingAddressDef = element
                        break;
                    default:
                        break;
                }
            });
        })
    }


    openBranchDetailsModal(branchId:number,branchName:string){
        let config : ModalOptions = new ModalOptions()
        config.class = 'right-modal slide-right-in'
        let modalDefaultData :Partial<BranchDetailsDynamicModalComponent> = {
            branchId,
            branchName,
            mailingAddressDef : this.mailingAddressDef,
            directShippingAddressDef : this.directShippingAddressDef,
            distributionCenterAddressDef : this.distributionCenterAddressDef,
            billingAddressDef : this.billingAddressDef,
        }
        config.initialState = modalDefaultData
        let modalRef:BsModalRef = this._BsModalService.show(BranchDetailsDynamicModalComponent,config)
        let subs : Subscription = this._BsModalService.onHidden.subscribe(()=>{
            subs.unsubscribe()
        })
    }
    removeNodeFromParent(id:number,parent:TreeviewItem){
        let dataAfterDeleteItem = parent.children.filter((_item:any)=>{
            const item : TreeNodeOfBranchForViewDto = _item
            return item.data.branch.id !== id
        })
        let _parent : any = parent
        let __parent : TreeNodeOfBranchForViewDto = _parent
        parent.children = [...dataAfterDeleteItem]
        __parent.data.subTotal = dataAfterDeleteItem.length
        if( dataAfterDeleteItem.length === 0 ) {
            __parent.expanded = false
            __parent.leaf = true
        }
        this.rerenderBranches()
    }
    rerenderBranches(){
        this.branches = [...this.branches];
    }
}
