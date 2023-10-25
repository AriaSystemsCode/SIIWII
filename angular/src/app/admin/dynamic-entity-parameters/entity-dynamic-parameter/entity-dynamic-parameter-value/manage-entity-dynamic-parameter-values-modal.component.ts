// import { Component, Injector, ViewChild } from '@angular/core';
// import { AppComponentBase } from '@shared/common/app-component-base';
// import { ModalDirective } from 'ngx-bootstrap/modal';
// import { EntityDynamicParameterValueManagerComponent } from './entity-dynamic-parameter-value-manager/entity-dynamic-parameter-value-manager.component';

// @Component({
//   selector: 'manage-entity-dynamic-parameter-values-modal',
//   templateUrl: './manage-entity-dynamic-parameter-values-modal.component.html'
// })
// export class ManageEntityDynamicParameterValuesModalComponent extends AppComponentBase {
//   @ViewChild('entityDynamicParameterValueManager', { static: false }) entityDynamicParameterValueManager: EntityDynamicParameterValueManagerComponent;
//   @ViewChild('manageDynamicEntityParameterValuesModal') modal: ModalDirective;

//   entityFullName: string;
//   entityId: string;

//   initialized = false;

//   constructor(
//     _injector: Injector,
//   ) {
//     super(_injector);
//   }

//   saveAll(): void {
//     this.entityDynamicParameterValueManager.saveAll();
//   }

//   close(): void {
//     this.modal.hide();
//   }

//   show(entityFullName: string, entityId: string) {

//     this.entityFullName = entityFullName;
//     this.entityId = entityId;

//     if (this.entityDynamicParameterValueManager) {
//       this.entityDynamicParameterValueManager.entityFullName = entityFullName;
//       this.entityDynamicParameterValueManager.entityId = entityId;
//       this.entityDynamicParameterValueManager.initialize();
//     }

//     this.initialized = true;
//     this.modal.show();
//   }
// }
