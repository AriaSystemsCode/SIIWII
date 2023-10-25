// import { Component, Injector, EventEmitter, Output, ViewChild } from '@angular/core';
// import { AppComponentBase } from '@shared/common/app-component-base';
// import { EntityDynamicParameterDto, EntityDynamicParameterServiceProxy, DynamicParameterServiceProxy, DynamicEntityParameterDefinitionServiceProxy, DynamicParameterDto } from '@shared/service-proxies/service-proxies';
// import { ModalDirective } from 'ngx-bootstrap/modal';
// import { forkJoin } from 'rxjs';

// @Component({
//   selector: 'create-entity-dynamic-parameter-modal',
//   templateUrl: './create-entity-dynamic-parameter-modal.component.html'
// })
// export class CreateEntityDynamicParameterModalComponent extends AppComponentBase {
//   @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
//   @ViewChild('createModal') modal: ModalDirective;

//   entityDynamicParameter = new EntityDynamicParameterDto;

//   allEntities: string[];
//   allDynamicParameters: DynamicParameterDto[];
//   initialized = false;
//   saving = false;

//   constructor(
//     injector: Injector,
//     private _entityDynamicParameterService: EntityDynamicParameterServiceProxy,
//     private _dynamicParameterService: DynamicParameterServiceProxy,
//     private _dynamicEntityParameterDefinitionService: DynamicEntityParameterDefinitionServiceProxy
//   ) {
//     super(injector);
//   }


//   private initialize() {
//     if (this.initialized) {
//       return;
//     }

//     this.showMainSpinner();
//     let allDynamicParametersObservable = this._dynamicParameterService.getAll();
//     let allEntitiesObservable = this._dynamicEntityParameterDefinitionService.getAllEntities();

//     forkJoin(allDynamicParametersObservable, allEntitiesObservable)
//       .subscribe(
//         ([dynamicParameters, entities]) => {
//           this.allEntities = entities;
//           this.allDynamicParameters = dynamicParameters.items;
//           this.hideMainSpinner();
//           this.initialized = true;
//         },
//         (err) => {
//           this.hideMainSpinner();
//         }
//       );
//   }

//   show() {
//     this.initialize();
//     this.entityDynamicParameter = new EntityDynamicParameterDto();
//     this.modal.show();
//   }


//   save(): void {
//     this.saving = true;
//     this.showMainSpinner();

//     this.entityDynamicParameter.tenantId = abp.session.tenantId;
//     this._entityDynamicParameterService.add(this.entityDynamicParameter)
//       .subscribe(() => {
//         this.notify.info(this.l('SavedSuccessfully'));
//         this.hideMainSpinner();
//         this.modalSave.emit(null);
//         this.modal.hide();
//         this.saving = false;
//       }, (e) => {
//         this.hideMainSpinner();
//         this.saving = false;
//       });
//   }

//   close(): void {
//     this.modal.hide();
//   }
// }
