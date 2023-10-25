// import { Component, OnInit, EventEmitter, Output, ViewChild, Injector } from '@angular/core';
// import { ModalDirective } from 'ngx-bootstrap/modal';
// import { AppComponentBase } from '@shared/common/app-component-base';
// import { DynamicParameterValueDto, DynamicParameterValueServiceProxy } from '@shared/service-proxies/service-proxies';
// import { Observable } from 'rxjs';

// @Component({
//   selector: 'create-or-edit-dynamic-parameter-value-modal',
//   templateUrl: './create-or-edit-dynamic-parameter-value-modal.component.html',
//   styleUrls: ['./create-or-edit-dynamic-parameter-value-modal.component.css']
// })
// export class CreateOrEditDynamicParameterValueModalComponent extends AppComponentBase {
//   @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
//   @ViewChild('createOrEditModal') modal: ModalDirective;

//   dynamicParameterValue: DynamicParameterValueDto;
//   saving = false;

//   constructor(
//     injector: Injector,
//     private _dynamicParameterValueAppService: DynamicParameterValueServiceProxy
//   ) {
//     super(injector);
//   }

//   show(dynamicParameterValueId?: number, dynamicParameterId?: number) {
//     if (!dynamicParameterValueId) {
//       this.dynamicParameterValue = new DynamicParameterValueDto();
//       this.dynamicParameterValue.dynamicParameterId = dynamicParameterId;
//       this.modal.show();
//       return;
//     }

//     this.showMainSpinner();
//     this._dynamicParameterValueAppService.get(dynamicParameterValueId)
//       .subscribe(
//         (data) => {
//           this.dynamicParameterValue = data;
//           this.hideMainSpinner();
//           this.modal.show();
//         },
//         (err) => {
//           this.hideMainSpinner();
//         }
//       );
//   }

//   save(): void {
//     this.saving = true;
//     this.showMainSpinner();
//     let observable: Observable<void>;
//     if (!this.dynamicParameterValue.id) {
//       observable = this._dynamicParameterValueAppService.add(this.dynamicParameterValue);
//     } else {
//       observable = this._dynamicParameterValueAppService.update(this.dynamicParameterValue);
//     }

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

//   close(): void {
//     this.modal.hide();
//   }
// }
