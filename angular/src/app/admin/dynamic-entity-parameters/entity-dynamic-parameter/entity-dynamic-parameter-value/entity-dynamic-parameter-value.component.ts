// import { Component, OnInit, Injector, ViewChild } from '@angular/core';
// import { ActivatedRoute, Params } from '@angular/router';
// import { AppComponentBase } from '@shared/common/app-component-base';
// import { appModuleAnimation } from '@shared/animations/routerTransition';
// import { EntityDynamicParameterValueManagerComponent } from './entity-dynamic-parameter-value-manager/entity-dynamic-parameter-value-manager.component';

// @Component({
//   selector: 'app-entity-dynamic-parameter-value',
//   templateUrl: './entity-dynamic-parameter-value.component.html',
//   animations: [appModuleAnimation()]
// })
// export class EntityDynamicParameterValueComponent extends AppComponentBase implements OnInit {
//   @ViewChild('entityDynamicParameterValueManager', { static: false }) entityDynamicParameterValueManager: EntityDynamicParameterValueManagerComponent;

//   entityFullName: string;
//   entityId: string;

//   initialized = false;
//   constructor(
//     _injector: Injector,
//     private _activatedRoute: ActivatedRoute
//   ) {
//     super(_injector);
//   }

//   ngOnInit() {
//     this._activatedRoute.params
//       .subscribe(
//         (params: Params) => {
//           this.entityFullName = params['entityFullName'];
//           this.entityId = params['rowId'];
//           this.initialized = true;
//         });
//   }

//   saveAll(): void {
//     this.entityDynamicParameterValueManager.saveAll();
//   }
// }
