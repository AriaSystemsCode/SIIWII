import { Component, EventEmitter, Injector, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CreateOrEditAddressModalComponent } from '@app/selectAddress/create-or-edit-Address-modal/create-or-edit-Address-modal.component';
import { SelectAddressModalComponent } from '@app/selectAddress/selectAddress/selectAddress-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountLevelEnum, AccountsServiceProxy, AppEntitiesServiceProxy, BranchDto, LookupLabelDto, TreeNodeOfBranchForViewDto, TreeviewItem } from '@shared/service-proxies/service-proxies';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { TreeTable } from 'primeng/treetable';
import { Observable, Subscription } from 'rxjs';
import { BranchDetailsDynamicModalComponent } from '../branch-details-dynamic-modal/branch-details-dynamic-modal.component';
import { CreateOrEditBranchModalComponent } from '../create-or-edit-branch-modal/create-or-edit-branch-modal.component';


@Component({
    selector: 'app-branches',
    templateUrl: './branches.component.html',
    styleUrls: ['./branches.component.scss'],
    animations: [appModuleAnimation()],
})
export class BranchesComponent extends AppComponentBase {
    @Input('branches') branches: TreeNodeOfBranchForViewDto[]
    @Input('accountId') accountId: number
    @Input('accountLevel') accountLevel: AccountLevelEnum
    @Input('viewMode') viewMode: boolean = false
    @Output("askToPublish") askToPublish: EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output("changeTouchState") changeTouchState: EventEmitter<boolean> = new EventEmitter<boolean>()

    // @ViewChild('createOrEditBranchModal', { static: true }) createOrEditBranchModal: CreateOrEditBranchModalComponent;
    // @ViewChild('createOrEditAddressModal', { static: true }) createOrEditAddressModal: CreateOrEditAddressModalComponent;
    // @ViewChild('selectAddressModal', { static: true }) selectAddressModal: SelectAddressModalComponent;
    @ViewChild('dataTable', { static: true }) dataTable: TreeTable;

    loadingChilds: boolean
    publishing: boolean
    currBranchNode: { node: TreeNodeOfBranchForViewDto, parent: TreeNodeOfBranchForViewDto, level?: number, visiable?: boolean }
    currSelectAddress: number;
    selectedBranchId: number
    selectedParentBranchId: number
    displaySaveAccount: boolean
    dropdownActionmenuhover: string = ''
    billingAddressDef: LookupLabelDto
    directShippingAddressDef: LookupLabelDto
    distributionCenterAddressDef: LookupLabelDto
    mailingAddressDef: LookupLabelDto
branchModalRef: BsModalRef;

selectAddressModalRef: BsModalRef;
addressModalRef: BsModalRef;
lastSelectedAddressNumber: number;
    constructor(
        injector: Injector,
        private _BsModalService: BsModalService,
        private _accountsServiceProxy: AccountsServiceProxy,
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
    ) {
        super(injector)
        this.getAllBranchesTypes();
    }

    // editBranch(rowNode: { level: number, node: TreeNodeOfBranchForViewDto, parent: TreeNodeOfBranchForViewDto, visible: boolean }) {
    //     this.currBranchNode = rowNode
    //     this.selectedBranchId = rowNode.node.data.branch.id
    //     const sendAccountId = Boolean(rowNode.parent)
    //     this.createOrEditBranchModal.show(sendAccountId ? this.accountId : null, this.selectedBranchId)
    // }


    editBranch(rowNode: any): void {
  this.currBranchNode = rowNode;
  this.selectedBranchId = rowNode.node.data.branch.id;

  const sendAccountId = Boolean(rowNode.parent);

  this.openCreateOrEditBranchModal(
    sendAccountId ? this.accountId : null,
    this.selectedBranchId
  );
}
    // createBranch(rowNode: { node: TreeNodeOfBranchForViewDto, parent: any, level: number, visiable: boolean }) {
    //     if (rowNode.level > 2) {
    //         return this.message.info(
    //             this.l("Can'tCreateANewSubBranch,BranchesIsLimitedTo3Levels"),
    //             this.l("Info")
    //         )
    //     }
    //     this.currBranchNode = rowNode
    //     this.selectedBranchId = 0
    //     this.selectedParentBranchId = rowNode.node.data.branch.id
    //     this.createOrEditBranchModal.show(this.accountId, 0, this.selectedParentBranchId)
    // }

    createBranch(rowNode: any): void {
  if (rowNode.level > 2) {
    return this.message.info(
      this.l("Can'tCreateANewSubBranch,BranchesIsLimitedTo3Levels"),
      this.l("Info")
    );
  }

  this.currBranchNode = rowNode;
  this.selectedBranchId = 0;
  this.selectedParentBranchId = rowNode.node.data.branch.id;

  this.openCreateOrEditBranchModal(
    this.accountId,
    0,
    this.selectedParentBranchId
  );
}

    branchAdded(event) {
        this.displaySaveAccount = true
        this.askToPublish.emit(true)

        this.currBranchNode.node.leaf = false
        this.currBranchNode.node.expanded = true
        this.getBranches(this.currBranchNode)
        this.adjustParentBranchesCount(this.currBranchNode)
        if (this.currBranchNode)
            this.rerenderBranches()
        this.selectedBranchId = undefined
        this.selectedParentBranchId = undefined
    }
    adjustParentBranchesCount(branch) {
        branch.node.data.subTotal += 1
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

    // selectAddress() {
    //     this.createOrEditBranchModal.close();
    //     this.selectAddressModal.show(this.currBranchNode, this.accountId);
    // }

//     selectAddress() {
//     this.branchModalRef?.hide();
//     this.selectAddressModal.show(this.currBranchNode, this.accountId);
// }
selectAddress(): void {

  const branchContent =
    this.branchModalRef?.content as CreateOrEditBranchModalComponent;

  this.lastSelectedAddressNumber =
    branchContent?.currSelectAddress;

  this.branchModalRef?.hide();

  this.openSelectAddressModal();
}
    // addressSelected(address) {
    //     this.selectAddressModal.close();
    //     this.createOrEditBranchModal.addressSelected(address);
    // }



//     addressSelected(address) {
//     this.selectAddressModal.close();

//     const content =
//       this.branchModalRef?.content as CreateOrEditBranchModalComponent;

//     content?.addressSelected(address);
// }
addressSelected(address): void {

  this.selectAddressModalRef?.hide();

  this.openCreateOrEditBranchModal(
    this.accountId,
    this.selectedBranchId,
    this.selectedParentBranchId
  );

  setTimeout(() => {

    const content =
      this.branchModalRef?.content as CreateOrEditBranchModalComponent;

    if (content) {

      content.currSelectAddress =
        this.lastSelectedAddressNumber;

      content.addressSelected(address);
    }

  }, 300);
}
    // createOrEditaddressCanceled() {
    //     this.selectAddressModal.show(this.currBranchNode, this.accountId)
    // }

    createOrEditaddressCanceled() {
  this.openSelectAddressModal();
}
    // addressSelectionCanceled() {
    //     this.createOrEditBranchModal.show(this.accountId, this.selectedBranchId, this.selectedParentBranchId)
    // }

    addressSelectionCanceled() {
    this.openCreateOrEditBranchModal(
      this.accountId,
      this.selectedBranchId,
      this.selectedParentBranchId
    );
}
    // addNewAddress() {
    //     this.selectAddressModal.close();
    //     this.createOrEditAddressModal.show(undefined, undefined, this.accountId);
    // }
//     addNewAddress() {
//   this.selectAddressModalRef?.hide();
//   this.createOrEditAddressModal.show(undefined, undefined, this.accountId);
// }
addNewAddress() {
  this.selectAddressModalRef?.hide();
  this.openCreateOrEditAddressModal();
}
    selectedAddressId: number
    // editAddress(addressId) {
    //     this.selectedAddressId = addressId
    //     this.selectAddressModal.close();
    //     this.createOrEditAddressModal.show(addressId);
    // }

//     editAddress(addressId: number) {
//   this.selectedAddressId = addressId;
//   this.selectAddressModalRef?.hide();
//   this.createOrEditAddressModal.show(addressId);
// }
editAddress(addressId: number) {
  this.selectedAddressId = addressId;
  this.selectAddressModalRef?.hide();
  this.openCreateOrEditAddressModal(addressId);
}

    // addressAdded(address) {
    //     this.createOrEditAddressModal.close();
    //     this.selectAddressModal.addressAdded(address);
    // }

//     addressAdded(address) {
//   this.createOrEditAddressModal.close();

//   this.openSelectAddressModal();

//   setTimeout(() => {
//     const content = this.selectAddressModalRef?.content as SelectAddressModalComponent;
//     content?.addressAdded(address);
//   });
// }
addressAdded(address) {
  this.addressModalRef?.hide();
  this.openSelectAddressModal();

  setTimeout(() => {
    const content = this.selectAddressModalRef?.content as SelectAddressModalComponent;
    content?.addressAdded(address);
  });
}

    // addressUpdated(address) {
    //     this.createOrEditAddressModal.close();
    //     this.selectAddressModal.addressUpdated(address);
    // }
//     addressUpdated(address) {
//   this.createOrEditAddressModal.close();

//   this.openSelectAddressModal();

//   setTimeout(() => {
//     const content = this.selectAddressModalRef?.content as SelectAddressModalComponent;
//     content?.addressUpdated(address);
//   });
// }

addressUpdated(address) {
  this.addressModalRef?.hide();
  this.openSelectAddressModal();

  setTimeout(() => {
    const content = this.selectAddressModalRef?.content as SelectAddressModalComponent;
    content?.addressUpdated(address);
  });
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

    showBranchDetails(rowNode: { node: TreeNodeOfBranchForViewDto }) {
        this.openBranchDetailsModal(rowNode.node.data.branch.id, rowNode.node.data.branch.name)
    }

    changeStyleActionButton($event) {
        this.dropdownActionmenuhover = $event.type == 'mouseover' ? 'dropdownActionmenuhover' : '';

    }
    deleteBranch(branch: BranchDto, parent: TreeviewItem): void {
        this._accountsServiceProxy.deleteBranch(branch.id)
            .subscribe(() => {
                this.removeNodeFromParent(branch.id, parent)
                this.notify.success(this.l('SuccessfullyDeleted'));
            });
    }

    askToConfirmDelete(branch: BranchDto, rowNode: TreeviewItem) {
        if (rowNode === null) return this.notify.error(this.l("Can'tDeleteTheMainBranch"))
        var isConfirmed: Observable<boolean>;
        isConfirmed = this.askToConfirm('', "AreYouSureToRemoveThisBranch");

        isConfirmed.subscribe((res) => {
            if (!res) return
            this.deleteBranch(branch, rowNode)
        }
        );
    }

    getAllBranchesTypes() {
        this._appEntitiesServiceProxy.getAllEntitiesByTypeCode('ADDRESS-TYPE')
            .subscribe((res) => {
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


    openBranchDetailsModal(branchId: number, branchName: string) {
        let config: ModalOptions = new ModalOptions()
        config.class = 'right-modal slide-right-in'
        let modalDefaultData: Partial<BranchDetailsDynamicModalComponent> = {
            branchId,
            branchName,
            mailingAddressDef: this.mailingAddressDef,
            directShippingAddressDef: this.directShippingAddressDef,
            distributionCenterAddressDef: this.distributionCenterAddressDef,
            billingAddressDef: this.billingAddressDef,
        }
        config.initialState = modalDefaultData
        let modalRef: BsModalRef = this._BsModalService.show(BranchDetailsDynamicModalComponent, config)
        let subs: Subscription = this._BsModalService.onHidden.subscribe(() => {
            subs.unsubscribe()
        })
    }
    removeNodeFromParent(id: number, parent: TreeviewItem) {
        let dataAfterDeleteItem = parent.children.filter((_item: any) => {
            const item: TreeNodeOfBranchForViewDto = _item
            return item.data.branch.id !== id
        })
        let _parent: any = parent
        let __parent: TreeNodeOfBranchForViewDto = _parent
        parent.children = [...dataAfterDeleteItem]
        __parent.data.subTotal = dataAfterDeleteItem.length
        if (dataAfterDeleteItem.length === 0) {
            __parent.expanded = false
            __parent.leaf = true
        }
        this.rerenderBranches()
    }
    rerenderBranches() {
        this.branches = [...this.branches];
    }

//     openCreateOrEditBranchModal(
//   accountId?: number,
//   branchId?: number,
//   parentId?: number
// ): void {
//   const config: ModalOptions = new ModalOptions();

//   config.class = 'right-modal slide-right-in';
//   config.initialState = {
//     accountId,
//     branchId,
//     parentId,
//     billingAddressDef: this.billingAddressDef,
//     directShippingAddressDef: this.directShippingAddressDef,
//     distributionCenterAddressDef: this.distributionCenterAddressDef,
//     mailingAddressDef: this.mailingAddressDef
//   };

// const modalRef: BsModalRef = this._BsModalService.show(
//   CreateOrEditBranchModalComponent,
//   config
// );

// this.branchModalRef = modalRef;

//   const content = modalRef.content as CreateOrEditBranchModalComponent;

//   content.branchAdded.subscribe((event) => {
//     this.branchAdded(event);
//   });

//   content.branchUpdated.subscribe((event) => {
//     this.branchUpdated(event);
//   });

//   content.selectAddress.subscribe(() => {
//     this.selectAddress();
//   });
// }
openCreateOrEditBranchModal(
  accountId?: number,
  branchId?: number,
  parentId?: number
): void {
  const config: ModalOptions = new ModalOptions();

  config.class = 'right-modal slide-right-in';
  config.initialState = {
    accountId,
    branchId,
    parentId,
    billingAddressDef: this.billingAddressDef,
    directShippingAddressDef: this.directShippingAddressDef,
    distributionCenterAddressDef: this.distributionCenterAddressDef,
    mailingAddressDef: this.mailingAddressDef
  };

  const modalRef = this._BsModalService.show(CreateOrEditBranchModalComponent, config);
  this.branchModalRef = modalRef;

  const content = modalRef.content as CreateOrEditBranchModalComponent;

  content.branchAdded.subscribe((event) => this.branchAdded(event));
  content.branchUpdated.subscribe((event) => this.branchUpdated(event));
  content.selectAddress.subscribe(() => this.selectAddress());
}
openCreateOrEditAddressModal(addressId?: number): void {
  const config: ModalOptions = new ModalOptions();

  config.class = 'right-modal slide-right-in';
  config.initialState = {
    addressId,
    branch: this.currBranchNode,
    accountId: this.accountId
  };

  const modalRef = this._BsModalService.show(CreateOrEditAddressModalComponent, config);
  this.addressModalRef = modalRef;

  const content = modalRef.content as CreateOrEditAddressModalComponent;

  content.addressAdded.subscribe((address) => this.addressAdded(address));
  content.addressUpdated.subscribe((address) => this.addressUpdated(address));
  content.createOrEditaddressCanceled.subscribe(() => this.createOrEditaddressCanceled());
}
openSelectAddressModal(): void {
  const config: ModalOptions = new ModalOptions();

  config.class = 'right-modal slide-right-in';
  config.initialState = {
    branch: this.currBranchNode,
    accountId: this.accountId
  };

  const modalRef = this._BsModalService.show(SelectAddressModalComponent, config);
  this.selectAddressModalRef = modalRef;

  const content = modalRef.content as SelectAddressModalComponent;

  content.addressSelected.subscribe((address) => {
    this.addressSelected(address);
  });

  content.addNewAddress.subscribe(() => {
    this.addNewAddress();
  });

  content.editAddress.subscribe((addressId) => {
    this.editAddress(addressId);
  });

  content.addressSelectionCanceled.subscribe(() => {
    this.addressSelectionCanceled();
  });
}
}
