import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AppComponentBase } from "@shared/common/app-component-base";
import { AppEntitiesServiceProxy, AppEntityExtraDataDto, AppTransactionServiceProxy, CreateOrEditAppItemDto, GetAllEntityObjectTypeOutput, GetAppTransactionsForViewDto, LookupLabelDto, SycEntityObjectTypesServiceProxy } from "@shared/service-proxies/service-proxies";
import { ShoppingCartoccordionTabs } from '../shopping-cart-view-component/ShoppingCartoccordionTabs';
import { ExtraAttributeDataService } from '@app/main/app-items/app-item-shared/services/extra-attribute-data.service';
import { EExtraAttributeUsage } from '@app/main/app-items/appItems/models/extra-attribute-usage.enum';
import { CreateEditAppItemExtraAttribute } from '@app/main/app-items/app-item-shared/models/create-edit-app-item-extra-attribute';
import { FilteredExtraAttribute } from '@app/main/app-items/app-item-shared/models/filtered-extra-attribute';
import { SelectItem } from '@node_modules/primeng/api';
import { finalize } from "rxjs";





@Component({
    selector: 'create-or-edit-extra-data',
    templateUrl: './create-or-edit-extra-data.component.html',
    styleUrls: ['./create-or-edit-extra-data.component.scss']
  })
  export class CreateOrEditExtraDataComponent extends AppComponentBase  implements OnInit, OnChanges {


 @Input("activeTab") activeTab: number;
  @Input("currentTab") currentTab: number;
  @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
  @Input('extraAttributeObject') extraAttributeObject
  @Output("refreshShoppingCart") refreshShoppingCart: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Input("createOrEditExtraData") createOrEditExtraData: boolean = true;
  @Output("ontabChange") ontabChange: EventEmitter<ShoppingCartoccordionTabs> = new EventEmitter<ShoppingCartoccordionTabs>()
  oldappTransactionsForViewDto;
  @Input("showSaveBtn") showSaveBtn: boolean = false;
  @Input("canChange")  canChange:boolean=true;
  cancelBtn: boolean = false;
  saveBtn: boolean = false;



    @Input() extraAttributesMeta: any[] = [];
    @Input() entityExtraData: AppEntityExtraDataDto[] = [];
    @Input() isEditable: boolean = true;
  
    @Output() onSave = new EventEmitter<AppEntityExtraDataDto[]>();
    @Output() onCancel = new EventEmitter<void>();
  
    extraDataForm: { [key: string]: any } = {};
    originalData: any = {};


    appItem: CreateOrEditAppItemDto = new CreateOrEditAppItemDto();
      selectedItemTypeData: GetAllEntityObjectTypeOutput =
            new GetAllEntityObjectTypeOutput();
    
    extraAttributes: {
      [key in EExtraAttributeUsage]: CreateEditAppItemExtraAttribute;
    };
    openAdditional= false
    hasLoadedAdditional: boolean = false;
   
        constructor(
            injector: Injector,
         private _AppTransactionServiceProxy: AppTransactionServiceProxy,
         private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
              private _sycEntityObjectTypesServiceProxy: SycEntityObjectTypesServiceProxy,
               private _extraAttributeDataService: ExtraAttributeDataService,
        ) {
    
            
            super(injector);
            // this.getAppTransactionList();
           
          
        }
  
    ngOnInit(): void {
      if(this.appTransactionsForViewDto){
        this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto)); // ✅ add this
        this.getAppItemTypeExtraAttributesById(); // or your dynamic ID
  
      }
      this.mapDataToForm();
    }
  
    ngOnChanges(changes: SimpleChanges): void {
      this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto));
      if (changes.entityExtraData || changes.extraAttributesMeta) {
        this.mapDataToForm();
      }
    }
  
    mapDataToForm() {
      this.extraDataForm = {};
      this.originalData = {};
  
      this.extraAttributesMeta.forEach(meta => {
        const matched = this.entityExtraData?.find(e => e.attributeId === meta.attributeId);
        const value = matched?.attributeValueId ?? matched?.attributeValue ?? '';
        this.extraDataForm[meta.attributeId] = value;
        this.originalData[meta.attributeId] = value;
      });
    }
  
    // cancelEdit() {
    //   this.extraDataForm = { ...this.originalData };
    //   this.onCancel.emit();
    // }
  
    // save() {
    //   const updatedData: AppEntityExtraDataDto[] = this.extraAttributesMeta.map(meta => {
    //     const dto = new AppEntityExtraDataDto();
    //     dto.attributeId = meta.attributeId;
    //     if (meta.isLookup) {
    //       dto.attributeValueId = this.extraDataForm[meta.attributeId];
    //     } else {
    //       dto.attributeValue = this.extraDataForm[meta.attributeId];
    //     }
    //     return dto;
    //   });
    //   this.onSave.emit(updatedData);
    // }









    onUpdateAppTransactionsForViewDto($event) {
      this.appTransactionsForViewDto = $event;
      
  
    }
    
    cancel() {
      this.appTransactionsForViewDto=JSON.parse(JSON.stringify(this.oldappTransactionsForViewDto));
      this.onUpdateAppTransactionsForViewDto(this.appTransactionsForViewDto);
      this.createOrEditExtraData = false;
      this.showSaveBtn = false;
    }
    save() {
      this.createOrEditExtraData = false;
       this.saveExtra()
      // this.createOrEditTransaction();
    }
    onshowSaveBtn($event) {
      this.createOrEditExtraData = true; 
      this.showSaveBtn = $event;
    }
    


     getAppItemTypeExtraAttributesById() {
          this._sycEntityObjectTypesServiceProxy.getAllWithExtraAttributes(114)
            .subscribe((res) => {
              if (res?.length > 0) {
                console.log( this.selectedItemTypeData ,' this.selectedItemTypeData ')
                this.selectedItemTypeData = res[0];
        
                // Set recommended/additional attributes
                // this.setAdditionalAndRecommendedExtraAttributes();
        
                // Load lookup lists
                // this.loadRecommendedAndAdditionalExtraDataLookupLists();
        
                // // Set selected values if editing
                // if (this.appItem?.entityExtraData?.length) {
                //   this.setSelectedAppEntityExtraDataOnEditMode();
                // }
              }
            });
        }
        
    
        // loadRecommendedAndAdditionalExtraDataLookupLists() {
        //     this.extraAttributes.RECOMMENDED.extraAttributes.forEach(
        //         (extraAttr) => {
        //             if (!extraAttr.isLookup) return;
        //             this.loadExtraDataLookupList(extraAttr);
        //         }
        //     );
        //     this.extraAttributes.ADDITIONAL.extraAttributes.forEach((extraAttr) => {
        //         if (!extraAttr.isLookup) return;
        //         this.loadExtraDataLookupList(extraAttr);
        //     });
        // }
        // loadExtraDataLookupList(extraAttr: FilteredExtraAttribute) {
        //   this._extraAttributeDataService
        //     .getExtraAttributeLookupDataWithPaging(
        //       extraAttr.entityObjectTypeCode,
        //       extraAttr.paginationSetting.skipCount,
        //       extraAttr.paginationSetting.maxResultCount
        //     )
        //     .subscribe((result) => {
        //       extraAttr.paginationSetting.totalCount = result.totalCount;
        
        //       if (extraAttr.paginationSetting.skipCount === 0) {
        //         extraAttr.paginationSetting.list = [];
        //       } else {
        //         extraAttr.paginationSetting.list.splice(
        //           extraAttr.paginationSetting.list.length - 1,
        //           1
        //         );
        //       }
        
        //       const isExist = result.items.some(
        //         (item) => item.value == extraAttr.selectedValues
        //       );
        
        //       if (!isExist && extraAttr?.selectedValues) {
        //         const tempAtt = new LookupLabelDto({
        //           code: extraAttr.code,
        //           label: extraAttr.selectedValues,
        //           stockAvailability: undefined,
        //           value: extraAttr.selectedValues,
        //           isHostRecord: false,
        //           hexaCode: undefined,
        //           image: undefined,
        //         });
        //         result.items.push(tempAtt);
        //       }
        
        //       extraAttr.paginationSetting.list.push(...result.items);
        
        //       if (
        //         extraAttr.paginationSetting.list.length <
        //         extraAttr.paginationSetting.totalCount
        //       ) {
        //         const showMoreSelectItem: SelectItem = {
        //           value: -1,
        //           label: this.l("showMore"),
        //           icon: "fas fa-reply",
        //           styleClass: "showMore",
        //           disabled: false,
        //         };
        //         extraAttr.paginationSetting.list.push(showMoreSelectItem);
        //       }
        
        //       extraAttr.paginationSetting.skipCount +=
        //         extraAttr.paginationSetting.maxResultCount;
        //     });
        // }
        
        //   setAdditionalAndRecommendedExtraAttributes() {
        //     if (!this.extraAttributes) {
        //       console.warn('extraAttributes is undefined');
        //       return;
        //     }
          
        //         const extraAttributres =
        //             this.selectedItemTypeData.extraAttributes.extraAttributes;
        //         this.extraAttributes.RECOMMENDED.extraAttributes =
        //             this._extraAttributeDataService.getFilteredAttributesByUsage(
        //                 extraAttributres,
        //                 EExtraAttributeUsage.Recommended,
        //                 false
        //             );
        //         this.extraAttributes.ADDITIONAL.extraAttributes =
        //             this._extraAttributeDataService.getFilteredAttributesByUsage(
        //                 extraAttributres,
        //                 EExtraAttributeUsage.Additional,
        //                 false
        //             );
        //     }
        
            // setSelectedAppEntityExtraDataOnEditMode() {
            //     // if (!this.appItem.entityExtraData) return;
            //     let selectedExtraDataAsObject: { [key: number]: any } = {}; // {[12]:[15,18,19]} = {[colorId]=[15,12,16]}
            //     const getFilterDefinition = (itemExtraData: AppEntityExtraDataDto) => {
            //         const item = [
            //             ...this.extraAttributes.ADDITIONAL.extraAttributes,
            //             ...this.extraAttributes.RECOMMENDED.extraAttributes,
            //         ].filter((x) => x.attributeId == itemExtraData.attributeId);
            //         return item.length ? item[0] : undefined;
            //     };
            //     this.appItem.entityExtraData.forEach((ItemExtraData) => {
            //         const extraAttrDef = getFilterDefinition(ItemExtraData);
            //         let key = ItemExtraData.attributeId;
            //         const isLookup: boolean = !!ItemExtraData.attributeValueId;
            //         let value = isLookup
            //             ? ItemExtraData.attributeValueId
            //             : ItemExtraData.attributeValue;
            //         if (!selectedExtraDataAsObject[key])
            //             selectedExtraDataAsObject[key] = [];
            //         isLookup && extraAttrDef?.acceptMultipleValues
            //             ? selectedExtraDataAsObject[key].push(value)
            //             : (selectedExtraDataAsObject[key] = value);
            //     });
        
            //     this.extraAttributes.ADDITIONAL.extraAttributes.map((elem) => {
            //         let _selectedValues = selectedExtraDataAsObject[elem.attributeId];
            //         if (_selectedValues !== undefined)
            //             elem.selectedValues = _selectedValues;
            //         return elem;
            //     });
        
            //     this.extraAttributes.RECOMMENDED.extraAttributes.map((elem) => {
            //         let _selectedValue = selectedExtraDataAsObject[elem.attributeId];
            //         if (_selectedValue !== undefined)
            //             elem.selectedValues = _selectedValue;
            //         return elem;
            //     });
            //     console.log(  this.extraAttributes.RECOMMENDED.extraAttributes,'  this.extraAttributes.RECOMMENDED.extraAttributes')
            // }
          //   extraSelectedValuesExtraData() {
          //     const recentlyExtraAttributes: FilteredExtraAttribute<any>[] = [
          //         ...this.extraAttributes.ADDITIONAL.extraAttributes,
          //         ...this.extraAttributes.RECOMMENDED.extraAttributes,
          //     ];
          //     const previousExtraAttributes: AppEntityExtraDataDto[] =
          //         this.appItem.entityExtraData || [];
          //     this.appItem.entityExtraData = [];
          //     recentlyExtraAttributes.forEach((extraAttr) => {
          //         if (!extraAttr.selectedValues || extraAttr.isSelectedOnVariation)
          //             return;
          //         if (extraAttr.isLookup) {
          //             // is lookup
          //             if (extraAttr.acceptMultipleValues) {
          //                 // multi selection
          //                 extraAttr?.selectedValues?.forEach((attributeValueId) => {
          //                     const alreadySelected: AppEntityExtraDataDto =
          //                         previousExtraAttributes.filter((item) => {
          //                             return item.attributeValueId == attributeValueId;
          //                         })[0];
          //                     if (alreadySelected)
          //                         return this.appItem.entityExtraData.push(
          //                             alreadySelected
          //                         );
          //                     const entityExtraData: AppEntityExtraDataDto =
          //                         new AppEntityExtraDataDto();
          //                     entityExtraData.id = 0;
          //                     entityExtraData.attributeValueId = attributeValueId;
          //                     entityExtraData.attributeId = extraAttr.attributeId;
          //                     this.appItem.entityExtraData.push(entityExtraData);
          //                 });
          //             } else {
          //                 // single selection
          //                 const alreadySelected: AppEntityExtraDataDto =
          //                     previousExtraAttributes.filter((item) => {
          //                      return   item.attributeId == extraAttr.attributeId;
          //                     })[0];
          //                 if (alreadySelected) {
          //                     alreadySelected.attributeValueId =
          //                     parseInt(extraAttr?.selectedValues);
          //                     this.appItem.entityExtraData.push(alreadySelected);
          //                 } else {
          //                     const entityExtraData: AppEntityExtraDataDto =
          //                         new AppEntityExtraDataDto();
          //                     entityExtraData.id = 0;
          //                     entityExtraData.attributeValueId =
          //                         parseInt(extraAttr?.selectedValues);
          //                     entityExtraData.attributeId = extraAttr.attributeId;
          //                     this.appItem.entityExtraData.push(entityExtraData);
          //                 }
          //             }
          //         } else {
          //             // any other not lookup data
          //             const alreadySelected: AppEntityExtraDataDto =
          //                 previousExtraAttributes.filter((item) => {
          //                    return item.attributeId == extraAttr?.attributeId;
          //                 })[0];
          //             if (alreadySelected) {
          //                 alreadySelected.attributeValue = extraAttr?.selectedValues;
          //                 this.appItem.entityExtraData.push(alreadySelected);
          //             } else {
          //                 const entityExtraData: AppEntityExtraDataDto =
          //                     new AppEntityExtraDataDto();
          //                 entityExtraData.id = 0;
          //                 entityExtraData.attributeValue = extraAttr?.selectedValues;
          //                 entityExtraData.attributeId = extraAttr.attributeId;
          //                 this.appItem.entityExtraData.push(entityExtraData);
          //             }
          //         }
          //     });
          // }   
    
    
          onExtraAttributesChanged(dataFromChild: any[]) {
            if (!this.appTransactionsForViewDto) {
              this.appTransactionsForViewDto = new GetAppTransactionsForViewDto();
            }
          
            if (!this.appTransactionsForViewDto.entityExtraData) {
              this.appTransactionsForViewDto.entityExtraData = [];
            }
          
            const existingData = this.appTransactionsForViewDto.entityExtraData;
          
            // Step 1: Map incoming data cleanly
            const incomingData: AppEntityExtraDataDto[] = dataFromChild.flatMap(attr => {
              if (attr.isLookup && attr.acceptMultipleValues) {
                return (attr.value || []).map(v => {
                  const d = new AppEntityExtraDataDto();
                  d.attributeId = attr.attributeId;
                  d.attributeValueId = v;
                  return d;
                });
              } else {
                const dto = new AppEntityExtraDataDto();
                dto.attributeId = attr.attributeId;
                if (attr.isLookup) {
                  dto.attributeValueId = attr.value;
                } else {
                  dto.attributeValue = attr.value;
                }
                return dto;
              }
            });
          
            // Step 2: Filter out invalid values (null / undefined / empty strings)
            const cleanIncomingData = incomingData.filter(
              d => (d.attributeValueId != null) || 
                   (d.attributeValue != null && d.attributeValue !== '')
            );
            
          
            // Step 3: Remove old entries for incoming attributeIds
            const incomingAttributeIds = new Set(cleanIncomingData.map(d => d.attributeId));
            const filteredExistingData = existingData.filter(
              d => !incomingAttributeIds.has(d.attributeId)
            );
          
            // Step 4: Merge clean incoming data
            const finalData = [...filteredExistingData, ...cleanIncomingData];
          
            this.appTransactionsForViewDto.entityExtraData = finalData;
          
            console.log(finalData, '✅ Cleaned and Merged Extra Attributes');
          }
          
          
          onExtraAttributeCleared(attributeId: number) {
            const data = this.appTransactionsForViewDto?.entityExtraData;
            if (data && data.length > 0) {
              let index = -1;
              while ((index = data.findIndex(x => x.attributeId === attributeId)) !== -1) {
                data.splice(index, 1);
              }
            
            }
          }
          
          
          
          saveExtra(){
            this.showMainSpinner()
            this._AppTransactionServiceProxy.createOrEditTransaction(this.appTransactionsForViewDto)
            .pipe(finalize(() => {
    
         this.hideMainSpinner()
          //  this.show(this.orderId, this.showCarousel, this.validateOrder, this._shoppingCartMode.view);
          //  this.getShoppingCartData()
    
    
          }
            ))
            .subscribe((res) => {
    
              if (res) {
    
                  this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto));
               this.refreshShoppingCart.emit(true)
                  if (!this.showSaveBtn)
                    this.ontabChange.emit(this.activeTab);
                  else
                    this.showSaveBtn = false;
        
                }
              // this.getShoppingCartData()
    
              // this.hideMainSpinner();
    
    
          
              
            });
          }
          
  }





