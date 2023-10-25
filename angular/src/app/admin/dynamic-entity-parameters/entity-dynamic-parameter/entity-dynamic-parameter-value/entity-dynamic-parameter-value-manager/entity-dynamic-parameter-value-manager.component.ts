// import { Component, OnInit, Injector, Input, EventEmitter, Output } from '@angular/core';
// import { AppComponentBase } from '@shared/common/app-component-base';
// import { EntityDynamicParameterValueServiceProxy, GetAllEntityDynamicParameterValuesOutputItem, CleanValuesInput, InsertOrUpdateAllValuesInput, InsertOrUpdateAllValuesInputItem } from '@shared/service-proxies/service-proxies';
// import { InputTypeConfigurationDefinition, InputTypeConfigurationService } from '@app/shared/common/input-types/input-type-configuration.service';
// import { InputTypeComponentBase } from '@app/shared/common/input-types/input-type-component-base';
// import { Observable } from 'rxjs';

// export class EntityDynamicParameterValueViewItem {
//   data: GetAllEntityDynamicParameterValuesOutputItem;
//   definition: InputTypeConfigurationDefinition;
//   injector: Injector;
//   componentInstance: InputTypeComponentBase;
//   constructor(data: GetAllEntityDynamicParameterValuesOutputItem, definition: InputTypeConfigurationDefinition) {
//     this.data = data;
//     this.definition = definition;
//   }
// }

// @Component({
//   selector: 'entity-dynamic-parameter-value-manager',
//   templateUrl: './entity-dynamic-parameter-value-manager.component.html'
// })
// export class EntityDynamicParameterValueManagerComponent extends AppComponentBase implements OnInit {
//   @Input() entityFullName: string;
//   @Input() entityId: string;
//   @Output() onSaveDone: EventEmitter<any> = new EventEmitter<any>();

//   initialized = false;
//   items: EntityDynamicParameterValueViewItem[];

//   constructor(
//     private _injector: Injector,
//     private _entityDynamicParameterValueService: EntityDynamicParameterValueServiceProxy,
//     private _inputTypeConfigurationService: InputTypeConfigurationService
//   ) {
//     super(_injector);
//   }

//   ngOnInit() {
//     this.initialize();
//   }

//   initialize(): void {
//     this.initialized = false;
//     this._entityDynamicParameterValueService
//       .getAllEntityDynamicParameterValues(this.entityFullName, this.entityId)
//       .subscribe(
//         (data) => {
//           if (data.items) {
//             this.items = data.items.map((item) => {
//               let definition = this._inputTypeConfigurationService.getByInputType(item.inputType);

//               let viewItem = new EntityDynamicParameterValueViewItem(item, definition);

//               const componentInstanceCallback = (instance: InputTypeComponentBase) => {
//                 viewItem.componentInstance = instance;
//               };

//               let injector = Injector.create(
//                 [
//                   { provide: 'selectedValues', useValue: item.selectedValues },
//                   { provide: 'allValues', useValue: item.allValuesInputTypeHas },
//                   { provide: 'componentInstance', useValue: componentInstanceCallback },
//                 ], this._injector);

//               viewItem.injector = injector;
//               return viewItem;
//             });
//           }
//           this.initialized = true;
//           this.hideMainSpinner();
//         },
//         (err) => {
//           this.hideMainSpinner();
//         }
//       );
//   }

//   deleteAllValuesOfEntityDynamicParameterId(item: EntityDynamicParameterValueViewItem): void {
//     var isConfirmed: Observable<boolean>;
//     isConfirmed   = this.askToConfirm("DeleteEntityDynamicParameterValueMessage","AreYouSure");

//    isConfirmed.subscribe((res)=>{
//       if(res){
//           this._entityDynamicParameterValueService.cleanValues(new CleanValuesInput({
//             entityDynamicParameterId: item.data.entityDynamicParameterId,
//             entityId: this.entityId
//           })).subscribe(() => {
//             abp.notify.success(this.l('SuccessfullyDeleted'));
//             this.initialize();
//           });
//         }
//       }
//     );
//   }

//   saveAll(): void {
//     if (!this.items || this.items.length === 0) {
//       return;
//     }

//     let newItems: InsertOrUpdateAllValuesInputItem[] = [];
//     for (let i = 0; i < this.items.length; i++) {
//       const element = this.items[i];
//       newItems.push(
//         new InsertOrUpdateAllValuesInputItem({
//           entityDynamicParameterId: element.data.entityDynamicParameterId,
//           entityId: this.entityId,
//           values: element.componentInstance.getSelectedValues()
//         })
//       );
//     }

//     this._entityDynamicParameterValueService
//       .insertOrUpdateAllValues(
//         new InsertOrUpdateAllValuesInput({
//           items: newItems
//         })
//       )
//       .subscribe(
//         () => {
//           abp.notify.success(this.l('SavedSuccessfully'));
//           this.initialize();
//           this.hideMainSpinner();

//           if (this.onSaveDone) {
//             this.onSaveDone.emit();
//           }
//         },
//         (err) => {
//           this.hideMainSpinner();
//         }
//       );
//   }
// }
