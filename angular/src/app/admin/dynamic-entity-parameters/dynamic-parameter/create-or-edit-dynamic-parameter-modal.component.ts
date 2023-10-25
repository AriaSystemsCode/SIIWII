// import { Component, EventEmitter, Output, ViewChild, Injector, OnInit } from '@angular/core';
// import { ModalDirective } from 'ngx-bootstrap/modal';
// import { AppComponentBase } from '@shared/common/app-component-base';
// import { DynamicParameterServiceProxy, DynamicParameterDto, DynamicEntityParameterDefinitionServiceProxy } from '@shared/service-proxies/service-proxies';
// import { Observable } from 'rxjs';
// import { PermissionTreeModalComponent } from '@app/admin/shared/permission-tree-modal.component';

// @Component({
//   selector: 'create-or-edit-dynamic-parameter-modal',
//   templateUrl: './create-or-edit-dynamic-parameter-modal.component.html',
//   styleUrls: ['./create-or-edit-dynamic-parameter-modal.component.css']
// })
// export class CreateOrEditDynamicParameterModalComponent extends AppComponentBase implements OnInit {

//   @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
//   @ViewChild('createOrEditModal') modal: ModalDirective;
//   @ViewChild('permissionFilterTreeModal', { static: true }) permissionFilterTreeModal: PermissionTreeModalComponent;

//   dynamicParameter: DynamicParameterDto;
//   allIputTypes: string[];
//   dynamicParameterId: number;
//   active: boolean;
//   loading = true;
//   saving = false;
//   constructor(
//     injector: Injector,
//     private _dynamicParameterService: DynamicParameterServiceProxy,
//     private _dynamicEntityParameterDefinitionServiceProxy: DynamicEntityParameterDefinitionServiceProxy
//   ) {
//     super(injector);
//   }

//   public show(dynamicParameterId?: number): void {
//     this.dynamicParameterId = dynamicParameterId;
//     if (!dynamicParameterId) {
//       this.dynamicParameter = new DynamicParameterDto();
//       this.active = true;
//       this.modal.show();
//       return;
//     }

//     this.showMainSpinner();
//     this._dynamicParameterService.get(dynamicParameterId)
//       .subscribe(result => {
//         this.dynamicParameter = result;
//         this.active = true;
//         this.modal.show();
//         this.hideMainSpinner();
//       }, (e) => {
//         this.hideMainSpinner();
//       });
//   }

//   save(): void {
//     this.saving = true;
//     let observable: Observable<void>;
//     if (!this.dynamicParameter.id) {
//       observable = this._dynamicParameterService.add(this.dynamicParameter);
//     } else {
//       observable = this._dynamicParameterService.update(this.dynamicParameter);
//     }

//     this.showMainSpinner();
//     observable.subscribe(() => {
//       this.notify.info(this.l('SavedSuccessfully'));
//       this.hideMainSpinner();
//       this.modalSave.emit(null);
//       this.modal.hide();
//       this.saving = false;
//     }, (e) => {
//       this.hideMainSpinner();
//       this.saving = false;
//     });
//   }

//   ngOnInit(): void {
//     this._dynamicEntityParameterDefinitionServiceProxy.getAllAllowedInputTypeNames().subscribe((data) => {
//       this.allIputTypes = data;
//       this.loading = false;
//     });
//   }

//   close(): void {
//     this.modal.hide();
//   }

//   openPermissionTreeModal(): void {
//     this.permissionFilterTreeModal.openPermissionTreeModal();
//   }

//   onPermissionSelected(selectedValues: string[]): void {
//     this.dynamicParameter.permission = selectedValues[0];
//   }
// }
