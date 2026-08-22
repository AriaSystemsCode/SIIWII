

import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AppComponentBase } from "@shared/common/app-component-base";
import { AppEntityExtraDataDto, AppTransactionServiceProxy, GetAppTransactionsForViewDto, } from "@shared/service-proxies/service-proxies";
import { EExtraAttributeUsage } from '@app/main/app-items/appItems/models/extra-attribute-usage.enum';
import { CreateEditAppItemExtraAttribute } from '@app/main/app-items/app-item-shared/models/create-edit-app-item-extra-attribute';
import { finalize } from "rxjs";
import { TransactionCartoccordionTabs } from '../../../../enums/TransactionCartoccordionTabs';


@Component({
  selector: 'create-or-edit-extra-data',
  templateUrl: './create-or-edit-extra-data.component.html',
  styleUrls: ['./create-or-edit-extra-data.component.scss']
})
export class CreateOrEditExtraDataComponent extends AppComponentBase implements OnInit, OnChanges {


  @Input("activeTab") activeTab: number;
  @Input("currentTab") currentTab: number;
  @Input("appTransactionsForViewDto") appTransactionsForViewDto: GetAppTransactionsForViewDto;
  @Input('extraAttributeObject') extraAttributeObject
  @Input("createOrEditExtraData") createOrEditExtraData: boolean = true;
  @Input("showSaveBtn") showSaveBtn: boolean = false;
  @Input("canChange") canChange: boolean = true;
  @Input() extraAttributesMeta: any[] = [];
  @Input() entityExtraData: AppEntityExtraDataDto[] = [];


  @Output("refreshShoppingCart") refreshShoppingCart: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Output("ontabChange") ontabChange: EventEmitter<TransactionCartoccordionTabs> = new EventEmitter<TransactionCartoccordionTabs>()

  oldappTransactionsForViewDto;
  cancelBtn: boolean = false;
  saveBtn: boolean = false;
  extraDataForm: { [key: string]: any } = {};
  originalData: any = {};
  extraAttributes: {
    [key in EExtraAttributeUsage]: CreateEditAppItemExtraAttribute;
  };


  constructor(
    injector: Injector,
    private _AppTransactionServiceProxy: AppTransactionServiceProxy,
  ) {


    super(injector);


  }

  ngOnInit(): void {
    if (this.appTransactionsForViewDto) {
      this.oldappTransactionsForViewDto = JSON.parse(JSON.stringify(this.appTransactionsForViewDto)); 

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


  onUpdateAppTransactionsForViewDto($event) {
    this.appTransactionsForViewDto = $event;
  }

  cancel() {
    this.appTransactionsForViewDto = JSON.parse(JSON.stringify(this.oldappTransactionsForViewDto));
    this.onUpdateAppTransactionsForViewDto(this.appTransactionsForViewDto);
    this.createOrEditExtraData = false;
    this.showSaveBtn = false;
  }
  save() {
    this.createOrEditExtraData = false;
    this.saveExtra()
  }
  onshowSaveBtn($event) {
    this.createOrEditExtraData = true;
    this.showSaveBtn = $event;
  }



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

    //  Step 2: No filter — keep all values
    const cleanIncomingData = incomingData;

    // Step 3: Remove old entries for incoming attributeIds
    const incomingAttributeIds = new Set(cleanIncomingData.map(d => d.attributeId));
    const filteredExistingData = existingData.filter(
      d => !incomingAttributeIds.has(d.attributeId)
    );

    // Step 4: Merge clean incoming data
    const finalData = [...filteredExistingData, ...cleanIncomingData];

    this.appTransactionsForViewDto.entityExtraData = finalData;

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



  saveExtra() {
    this.showMainSpinner()
    this._AppTransactionServiceProxy.createOrEditTransaction(this.appTransactionsForViewDto)
      .pipe(finalize(() => {
        this.hideMainSpinner()
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
      });
  }




}





