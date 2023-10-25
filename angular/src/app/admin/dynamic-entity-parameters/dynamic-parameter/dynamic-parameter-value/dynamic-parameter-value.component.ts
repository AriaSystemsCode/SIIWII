// import { Component, OnInit, Input, Injector, ViewChild } from '@angular/core';
// import { AppComponentBase } from '@shared/common/app-component-base';
// import { DynamicParameterValueServiceProxy, DynamicParameterValueDto } from '@shared/service-proxies/service-proxies';
// import { Observable } from 'rxjs';
// import { CreateOrEditDynamicParameterValueModalComponent } from './create-or-edit-dynamic-parameter-value-modal.component';

// @Component({
//   selector: 'dynamic-parameter-value',
//   templateUrl: './dynamic-parameter-value.component.html',
//   styleUrls: ['./dynamic-parameter-value.component.css']
// })
// export class DynamicParameterValueComponent extends AppComponentBase {
//   @Input() dynamicParameterId: number;
//   @ViewChild('createOrEditDynamicParameterValue') createOrEditDynamicParameterValueModal: CreateOrEditDynamicParameterValueModalComponent;

//   constructor(
//     injector: Injector,
//     private _dynamicParameterValueAppService: DynamicParameterValueServiceProxy
//   ) {
//     super(injector);
//   }

//   getDynamicParameters() {
//     this.showMainSpinner();
//     this._dynamicParameterValueAppService.getAllValuesOfDynamicParameter(this.dynamicParameterId)
//       .subscribe(
//         (result) => {
//           this.primengTableHelper.totalRecordsCount = result.items.length;
//           this.primengTableHelper.records = result.items;
//           this.primengTableHelper.hideLoadingIndicator();
//           this.hideMainSpinner();
//         },
//         (err) => {
//           this.hideMainSpinner();
//         }
//       );
//   }

//   editDynamicParameterValue(dynamicParameterValueId: number): void {
//     this.createOrEditDynamicParameterValueModal.show(dynamicParameterValueId, this.dynamicParameterId);
//   }

//   deleteDynamicParameterValue(dynamicParameterValueId: number): void {
//     var isConfirmed: Observable<boolean>;
//     isConfirmed   = this.askToConfirm("DeleteDynamicParameterValueMessage","AreYouSure");

//    isConfirmed.subscribe((res)=>{
//       if(res){
//           this._dynamicParameterValueAppService.delete(dynamicParameterValueId).subscribe(() => {
//             abp.notify.success(this.l('SuccessfullyDeleted'));
//             this.getDynamicParameters();
//           });
//         }
//       }
//     );
//   }

//   createDynamicParameterValue(): void {
//     this.createOrEditDynamicParameterValueModal.show(null, this.dynamicParameterId);
//   }
// }
