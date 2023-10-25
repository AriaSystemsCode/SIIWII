// import { Component, Injector, ViewChild } from '@angular/core';
// import { AppComponentBase } from '@shared/common/app-component-base';
// import { EntityDynamicParameterServiceProxy } from '@shared/service-proxies/service-proxies';
// import { CreateEntityDynamicParameterModalComponent } from './create-entity-dynamic-parameter-modal.component';
// import { appModuleAnimation } from '@shared/animations/routerTransition';
// import { Observable } from 'rxjs';

// @Component({
//   selector: 'app-entity-dynamic-parameter',
//   templateUrl: './entity-dynamic-parameter.component.html',
//   animations: [appModuleAnimation()]
// })
// export class EntityDynamicParameterComponent extends AppComponentBase {
//   @ViewChild('createEntityDynamicParameterModal') createEntityDynamicParameterModal: CreateEntityDynamicParameterModalComponent;

//   constructor(
//     injector: Injector,
//     private _entityDynamicParameterService: EntityDynamicParameterServiceProxy
//   ) {
//     super(injector);
//   }

//   getEntityDynamicParameters(): void {
//     this.showMainSpinner();
//     this._entityDynamicParameterService.getAll().subscribe(
//       (result) => {
//         this.primengTableHelper.totalRecordsCount = result.items.length;
//         this.primengTableHelper.records = result.items;
//         this.primengTableHelper.hideLoadingIndicator();
//         this.hideMainSpinner();
//       },
//       (err) => {
//         this.hideMainSpinner();
//       }
//     );
//   }

//   addNewEntityDynamicParameter(): void {
//     this.createEntityDynamicParameterModal.show();
//   }

//   deleteEntityDynamicParameter(id: number): void {
//     var isConfirmed: Observable<boolean>;
//     isConfirmed   = this.askToConfirm("DeleteDynamicParameterMessage","AreYouSure");

//    isConfirmed.subscribe((res)=>{
//       if(res){
//           this._entityDynamicParameterService.delete(id).subscribe(() => {
//             abp.notify.success(this.l('SuccessfullyDeleted'));
//             this.getEntityDynamicParameters();
//           });
//         }
//       }
//     );
//   }
// }
