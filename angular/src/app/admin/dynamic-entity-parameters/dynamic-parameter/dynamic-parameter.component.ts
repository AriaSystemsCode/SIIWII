// import { Component, Injector, ViewChild } from '@angular/core';
// import { AppComponentBase } from '@shared/common/app-component-base';
// import { DynamicParameterServiceProxy } from '@shared/service-proxies/service-proxies';
// import { Router } from '@angular/router';
// import { appModuleAnimation } from '@shared/animations/routerTransition';
// import { CreateOrEditDynamicParameterModalComponent } from './create-or-edit-dynamic-parameter-modal.component';

// @Component({
//   selector: 'app-dynamic-parameter',
//   templateUrl: './dynamic-parameter.component.html',
//   animations: [appModuleAnimation()]
// })
// export class DynamicParameterComponent extends AppComponentBase {
//   @ViewChild('createOrEditDynamicParameter', { static: true }) createOrEditDynamicParameterModal: CreateOrEditDynamicParameterModalComponent;

//   constructor(
//     injector: Injector,
//     private _dynamicParameterService: DynamicParameterServiceProxy,
//     private _router: Router
//   ) {
//     super(injector);
//   }

//   getDynamicParameters(): void {
//     this.showMainSpinner();
//     this._dynamicParameterService.getAll().subscribe(
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

//   goToDetail(id: string): void {
//     this._router.navigate(['app/admin/dynamic-parameter-detail'],
//       {
//         queryParams: {
//           id: id,
//         }
//       });
//   }

//   addNewDynamicParameter(): void {
//     this.createOrEditDynamicParameterModal.show();
//   }
// }
