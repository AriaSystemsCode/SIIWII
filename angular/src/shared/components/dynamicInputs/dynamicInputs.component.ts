
import { Component, EventEmitter, Injector, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { ImageUploadComponentOutput } from '@app/shared/common/image-upload/image-upload.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppAdvertisementsServiceProxy, AppEntitiesServiceProxy, AppEntityDto, ExtraAttribute, GetAppAdvertisementForViewDto, SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';
import { FileUploaderCustom } from '../import-steps/models/FileUploaderCustom.model';
import { FileUploader, FileUploaderOptions } from '@node_modules/ng2-file-upload';
import { AppConsts } from '@shared/AppConsts';
import { IAjaxResponse, TokenService } from '@node_modules/abp-ng2-module';
import { DynamicApiDispatcherService } from '@shared/dynamicApiDispatcherService ';
import Swal from 'sweetalert2';
import { finalize, map  } from 'rxjs/operators';
import { forkJoin ,of} from 'rxjs';




@Component({
  selector: 'app-dynamicInputs',
  templateUrl: './dynamicInputs.component.html',
  styleUrls: ['./dynamicInputs.component.scss'],
  animations: [appModuleAnimation()]
})
export class dynamicInputs extends AppComponentBase implements OnInit, OnChanges {
  @Input("extraAttributeObject") extraAttributeObject;
  @Input("entityType") entityType;
  @Input("entityObjectTypeId") entityObjectTypeId;
  @Output() extraDataChanged = new EventEmitter<any[]>();
  @Output() extraDataCleared = new EventEmitter<number>(); // send attributeId
  selectedExtraData: any[] = [];
  @Input() appTransactionsForViewDto: any;
  @Input() fromSetting: boolean = false;
  @Input() dynamicInputsForViewDto: any;
  originalValuesMap = new Map<number, any>();


  sycAttachmentCategoryImage: SycAttachmentCategoryDto;
  @Input() defaultBooleanValue: boolean | string = 'true'; // parent can override
  warningMsg: string = "";
  isInitializing = true;

  @Input()
canChange = true;
  public constructor(
    private _tokenService: TokenService,
    private dynamicApi: DynamicApiDispatcherService,
    private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
    injector: Injector
  ) {
    super(injector);
  }

  openCalendar(calendar: any) {
    calendar.overlayVisible = true;
  }
  ngOnChanges() {
        this.initializeStaticOptions();
    this.fillSelectedValuesFromDto();
        this.onAnyInputChange();

  }

 onAnyInputChange() {
  //if (this.isInitializing) return;
  //this.formTouched = true;

  const updatedDataMap = new Map<number, any>();

  // Preserve existing values
  for (const item of this.selectedExtraData) {
    updatedDataMap.set(item.attributeId, item);
  }

  if (this.extraAttributeObject?.value?.filteredExtraAttributes) {
    for (const attr of this.extraAttributeObject.value.filteredExtraAttributes) {

      if (attr.dataType === 'pills') 
        attr.themes = this.getThemes(attr);
      
      if (attr.isSelectedOnVariation || attr.isVariation) {
        continue;
      }

    let formattedValue =
  attr.selectedValues == null ||
  attr.selectedValues === '' ||
  (Array.isArray(attr.selectedValues) && attr.selectedValues.length === 0)
    ? attr.defaultValue
    : attr.selectedValues;

attr.selectedValues = formattedValue;

  
        // ✅ Handle Datetime
      if (attr.dataType === 'Datetime') {
        const dateValue = new Date(formattedValue);

        if (!formattedValue || formattedValue === 'Invalid Date' || isNaN(dateValue.getTime())) {
          formattedValue = '';
        } else {
          formattedValue = dateValue.toISOString();
          if (formattedValue === '1970-01-01T00:00:00.000Z') {
            const originalValue = this.originalValuesMap.get(attr.attributeId);
            formattedValue = originalValue || '';
          }
        }
      }

        // ✅ Handle String input
      if (attr.dataType === 'string' && !attr.isLookup) {
        if (!formattedValue || formattedValue === null || formattedValue === undefined || formattedValue.toString().trim() === '') {
          formattedValue = '';
        }
      }

    // ✅ Handle Numeric / Boolean / Color
      if (['Numeric', 'boolean', 'Boolean', 'bit', 'color'].includes(attr.dataType)) {
        if (formattedValue === null || formattedValue === undefined || formattedValue === '') {
          formattedValue = '';
        }
      }

      
      const originalValue = this.originalValuesMap.get(attr.attributeId);
      const isSame = JSON.stringify(originalValue) === JSON.stringify(formattedValue);

      let finalValue;

      if (attr.acceptMultipleValues && Array.isArray(formattedValue)) {
        finalValue = formattedValue.length ? formattedValue : [];
      } else if (!attr.acceptMultipleValues && (formattedValue === undefined || formattedValue === null || formattedValue === '')) {
        finalValue = '';
      } else if (!isSame) {
        finalValue = formattedValue;
      } else {
        finalValue = formattedValue || '';
      }
if (
  attr.acceptMultipleValues &&
  Array.isArray(formattedValue)
) {
  finalValue =
    formattedValue.length
      ? formattedValue
      : [];
}
      const updatedValue = {
        attributeId: attr.attributeId,
        value: finalValue,
        isLookup: attr.isLookup === true,
        acceptMultipleValues: attr.acceptMultipleValues === true
      };

      updatedDataMap.set(attr.attributeId, updatedValue);

    this.selectedExtraData = Array.from(updatedDataMap.values());
    this.extraDataChanged.emit(this.selectedExtraData);

  
    }
  }
}

onDropdownChange(extraAttr: any) {

  this.onAnyInputChange(); // update normal data

  const updatedDataMap = new Map<number, any>();

  const finalValue = extraAttr.selectedValues;

  this.handleRelatedWhen(extraAttr, finalValue, updatedDataMap);
}


handleRelatedWhen(attr: any, finalValue: any, updatedDataMap: Map<number, any>) {

  if (!attr.relatedWhen?.relation?.length) return;

  const calls = attr.relatedWhen.relation.map(relation => {

    const targetAttr = this.extraAttributeObject.value.extraAttributes
      .find(x => x.name === relation.targetName || x.code === relation.targetName);

    if (!targetAttr) return null;

    if (isNaN(Number(finalValue))) {
      return of({
        targetAttr,
        relation,
        newValue: 0
      });
    }

    return this._appEntitiesServiceProxy.getAppEntityForEdit(Number(finalValue),true)
      .pipe(
        map((result: any) => {
          const newValue = result.extraDataAttributes
            .find(x => x.extraAttrName === relation.targetName)
            ?.selectedValues?.[0]?.value || 0;

          return { targetAttr, relation, newValue };
        })
      );

  }).filter(x => x !== null);

  if (calls.length) {
    forkJoin(calls).subscribe((results: any[]) => {

      results.forEach(res => {

        res.targetAttr[res.relation.targetField] = res.newValue;
            res.targetAttr.selectedValues = res.newValue;


         updatedDataMap.set(res.targetAttr.attributeId, {
      attributeId: res.targetAttr.attributeId,
      value: res.newValue,
      isLookup: res.targetAttr.isLookup === true,
      acceptMultipleValues: res.targetAttr.acceptMultipleValues === true
    });


      });

      this.selectedExtraData = Array.from(updatedDataMap.values());
      this.extraDataChanged.emit(this.selectedExtraData);

    });
  }
}


  reset(extraAttr: any) {
    if (extraAttr.acceptMultipleValues) {
      extraAttr.selectedValues = [];
    } else {
      extraAttr.selectedValues = '';
    }

    this.onAnyInputChange();
  }



  themes = [];
  selectedTheme: any;

  // set thems  ?
  getThemes(extraAttr: any) {
    return this.themes =
      [
        { name: 'Default', image: 'assets/themes/default.png' },
        { name: 'Theme 2', image: 'assets/themes/theme2.png' },
        { name: 'Theme 3', image: 'assets/themes/theme3.png' },
        { name: 'Theme 4', image: 'assets/themes/theme4.png' },
        { name: 'Theme 5', image: 'assets/themes/theme5.png' },
      ];
  }

  selectTheme(theme: any) {
    this.selectedTheme = theme;
  }



  // fillSelectedValuesFromDto() {
  //   if (!this.extraAttributeObject?.value?.extraAttributes || !this.dynamicInputsForViewDto?.extraDataAttributes) {
  //     return;
  //   }

  //   const dtoData = this.dynamicInputsForViewDto.extraDataAttributes;

  //   const allAttributes = [
  //     ...(this.extraAttributeObject.value.extraAttributes || []),
  //     ...(this.extraAttributeObject.value.filteredExtraAttributes || [])
  //   ];

  //   for (const attr of allAttributes) {

  //     const matchedDto = dtoData.find(d => d.extraAttributeId === attr.attributeId);

  //     if (matchedDto && matchedDto.selectedValues?.length) {
  //       const dtoValue = matchedDto.selectedValues[matchedDto.selectedValues.length - 1].value;

  //       if (attr.isLookup) {
  //         const matchedOption = attr.paginationSetting?.list?.find(opt => {
  //           return opt.label === dtoValue || opt.value === dtoValue;
  //         });

  //         if (matchedOption) {
  //           attr.selectedValues = matchedOption.value;
  //         } else {
  //           const manualOption = {
  //             value: dtoValue,
  //             label: dtoValue,
  //             code: null,
  //             isHostRecord: false,
  //             stockAvailability: null,
  //             image: null,
  //             hexaCode: null
  //           };
  //           attr.paginationSetting.list.push(manualOption);
  //           attr.selectedValues = manualOption.value;
  //         }
  //       } else if (attr.dataType === 'Datetime' && typeof dtoValue === 'string') {
  //         attr.selectedValues = new Date(dtoValue);
  //       } else {
  //         attr.selectedValues = dtoValue;
  //       }
  //       this.originalValuesMap.set(attr.attributeId, attr.selectedValues);
  //     }
  //     //     else {
  //     //         if ((attr.dataType === 'boolean' || attr.dataType === 'bit') && (attr.selectedValues == null || attr.selectedValues === '')) {
  //     //   attr.selectedValues = this.defaultBooleanValue;
  //     // }
  //     //     }
  //   }

  // }
fillSelectedValuesFromDto(): void {
  if (
    !this.extraAttributeObject?.value?.extraAttributes ||
    !this.dynamicInputsForViewDto?.extraDataAttributes
  ) {
    return;
  }

  const dtoData =
    this.dynamicInputsForViewDto.extraDataAttributes;

  const allAttributes = [
    ...(
      this.extraAttributeObject.value
        .extraAttributes ?? []
    ),
    ...(
      this.extraAttributeObject.value
        .filteredExtraAttributes ?? []
    )
  ];

  const uniqueAttributes = Array.from(
    new Map(
      allAttributes.map(attribute => [
        attribute.attributeId,
        attribute
      ])
    ).values()
  );

  for (const attr of uniqueAttributes) {
    const matchedDto = dtoData.find(
      dto =>
        dto.extraAttributeId ===
        attr.attributeId
    );

    if (!matchedDto?.selectedValues?.length) {
      if (
        attr.dataType?.toUpperCase() ===
        'MULTISELECTDROPDOWNLIST'
      ) {
        attr.selectedValues = [];
      }

      continue;
    }

    const values =
      matchedDto.selectedValues
        .map(item => item.value)
        .filter(value =>
          value !== null &&
          value !== undefined &&
          value !== ''
        );

    if (
      attr.dataType?.toUpperCase() ===
        'MULTISELECTDROPDOWNLIST' ||
      attr.acceptMultipleValues
    ) {
      attr.selectedValues = values;
    } else {
      const dtoValue =
        values[values.length - 1];

      // if (
      //   attr.isLookup
      // ) {
      //   const matchedOption =
      //     attr.paginationSetting?.list?.find(
      //       option =>
      //         option.label === dtoValue ||
      //         option.value === dtoValue
      //     );

      //   if (matchedOption) {
      //     attr.selectedValues =
      //       matchedOption.value;
      //   }
      // }
      if (attr.isLookup) {

  const options =
    attr.paginationSetting?.list ?? [];

  const matchedOption =
    options.find(
      option => {

        return (
          String(option?.value) ===
            String(dtoValue) ||

          String(option?.label) ===
            String(dtoValue)
        );
      }
    );


  if (matchedOption) {

    /*
     * Important:
     * Use the actual option value,
     * preserving its original type.
     *
     * Example:
     * API = "534386"
     * option.value = 534386
     *
     * selectedValues becomes 534386
     * not "534386".
     */
    attr.selectedValues =
      matchedOption.value;

  } else {

    /*
     * Lookup options may still be loading.
     *
     * Payment Terms / Ship Via return
     * numeric IDs as strings from
     * extraDataAttributes.
     */
    const numericValue =
      Number(dtoValue);

    attr.selectedValues =
      dtoValue !== '' &&
      !Number.isNaN(numericValue)
        ? numericValue
        : dtoValue;
  }
}
       else if (
        attr.dataType?.toLowerCase() ===
          'datetime' ||
        attr.dataType?.toLowerCase() ===
          'date'
      ) {
        attr.selectedValues =
          dtoValue
            ? new Date(dtoValue)
            : null;
      } else {
        attr.selectedValues = dtoValue;
      }
    }

    this.originalValuesMap.set(
      attr.attributeId,
      attr.selectedValues
    );
  }
}

  clearExtraAttr(attr: any) {
    if (attr.acceptMultipleValues) {
      attr.selectedValues = [];
    } else {
      attr.selectedValues = null;
    }

    //  Also clear original source value 
    const matchedAttr = this.extraAttributeObject?.value?.extraAttributes?.find(
      a => a.attributeId === attr.attributeId
    );
    if (matchedAttr) {
      matchedAttr.selectedValues = attr.selectedValues;
    }

    //  Update selectedExtraData to keep the attributeId, but empty value
    const existingIndex = this.selectedExtraData.findIndex(
      x => x.attributeId === attr.attributeId
    );

    if (existingIndex !== -1) {
      this.selectedExtraData[existingIndex].value = attr.acceptMultipleValues ? [] : '';
    } else {
      // If not found, push a new clean entry
      this.selectedExtraData.push({
        attributeId: attr.attributeId,
        value: attr.acceptMultipleValues ? [] : '',
        isLookup: attr.isLookup,
        acceptMultipleValues: attr.acceptMultipleValues
      });
    }

    this.extraDataChanged.emit(this.selectedExtraData);
  }

  onImageSelected(event: ImageUploadComponentOutput, attr: any) {
    attr.selectedValues = event.image;
    this.onAnyInputChange(); // emit change
  }

  onImageRemoved(attr: any) {
    attr.selectedValues = '';
    this.onAnyInputChange(); // emit change
  }


  ngOnInit(): void {
        this.initializeStaticOptions();
    this.fillSelectedValuesFromDto();
    this.onAnyInputChange();
  }

  isArray(val: any): boolean {
    return Array.isArray(val);
  }
  onCheckboxChange(checked: boolean, value: any, extraAttr: any): void {
    if (!Array.isArray(extraAttr.selectedValues)) {
      extraAttr.selectedValues = [];
    }
    if (checked) {
      if (!extraAttr.selectedValues.includes(value)) {
        extraAttr.selectedValues.push(value);
      }
    } else {
      extraAttr.selectedValues = extraAttr.selectedValues.filter(val => val !== value);
    }
    this.onAnyInputChange(); // emit changes
  }

  onFileSelected(event: any, extraAttr: any) {
    const file = event.target.files[0];
    if (file) {
      /* if (file.size > 30 * 1024) {
        alert('File must be less than 30 KB.');
        return;
      } */
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        //alert('Only JPG, PNG, or GIF files are allowed.');
        Swal.fire(
          " ",
          "File format is not supported , Only JPG, PNG, or GIF files are allowed.",
          "error"
        );
        return;
      }
      const dotIndex = file.name.lastIndexOf('.');
      const baseName = file.name.substring(0, dotIndex);
      const extension = file.name.substring(dotIndex);
      const guid = this.guid();

      const newFileName = `${baseName}${extension}|${guid}${extension}`;
      const newFile = new File([file], newFileName, { type: file.type });
      extraAttr.selectedValues = newFile;
      extraAttr.showUploadBtn = true;
      this.onAnyInputChange();
    }
  }

  attachmentsUploader: FileUploader;
  onUploadFile(file) {
    this.attachmentsUploader = this.createUploader(
      '/Attachment/UploadFiles',
      result => {
      }
    );

    const blob = new Blob([file], { type: file.type });
    const originalName = file.name.split('|')[0];
    const guid = file.name.split('|')[1].split('.')[0]
    const newFile = new File([blob], originalName, { type: file.type });

    this.attachmentsUploader.addToQueue([newFile]);

    this.attachmentsUploader.onErrorItem = (item, response, status) => {
      this.notify.error(this.l("UploadFailed"));
    };
    this.attachmentsUploader.onBuildItemForm = (fileItem: any, form: any) => {
      form.append("guid", guid);
    };

    this.attachmentsUploader.uploadAll()
  }

  createUploader(url: string, success?: (result: any) => void): FileUploader {
    const uploader = new FileUploader({ url: AppConsts.remoteServiceBaseUrl + url });

    uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };

    uploader.onSuccessItem = (item, response, status) => {
      const ajaxResponse = <IAjaxResponse>JSON.parse(response);
      if (ajaxResponse?.success) {
        this.notify.info(this.l('UploadSuccessfully'));
        if (success) {
          success(ajaxResponse.result);
        }
      } else {
        this.message.error(ajaxResponse.error.message);
      }
    };

    const uploaderOptions: Partial<FileUploaderOptions> = {};
    uploaderOptions.authToken = 'Bearer ' + this._tokenService.getToken();
    uploaderOptions.removeAfterUpload = true;
    uploader.setOptions(uploaderOptions as FileUploaderOptions);
    return uploader;
  }
  getSafeString = (str: string) => str.replace(/\s+/g, '_');
  extraAttrOptions = new Map<string, { items: any[], totalCount: number, isLoading: boolean }>();

  getDropdownOptions(extraAttr: any) {
    if (extraAttr?.validEntries && !extraAttr?.dataSource) {
    return extraAttr.validEntries.split('|').map(v => ({
      label: v.trim(),
      value: v.trim()
    }));

  }
  
  return this.extraAttrOptions.get(extraAttr.id)?.items || [];
  }
  
  onDropdownClick(extraAttr: any) {
    if (extraAttr?.validEntries && !extraAttr?.dataSource) 
    return;

  const data = this.extraAttrOptions.get(extraAttr.id);

  if (!data || data.items.length === 0) 
    this.loadNextItems(extraAttr);

  }

  onLoadMoreClick(event: Event, extraAttr: any) {
    event.stopPropagation();
    this.loadNextItems(extraAttr);
  }
  loadNextItems(extraAttr: any) {
    let data = this.extraAttrOptions.get(extraAttr.id);
    if (!data) {
      data = { items: [], totalCount: 0, isLoading: false };
      this.extraAttrOptions.set(extraAttr.id, data);
    }

    if (data.isLoading) return;

    const skipCount = data.items.length;
    const maxResultCount = 10;

    data.isLoading = true;

    this.callDynamicAPI(extraAttr, skipCount, maxResultCount);
  }

 callDynamicAPI(extraAttr: any, skipCount: number = 0, maxResultCount: number = 10) {
  if (extraAttr?.validEntries && extraAttr.validEntries.includes('|')) {
    const items = extraAttr.validEntries.split('|').map(val => ({
      label: val.trim(),
      value: val.trim()
    }));

    this.extraAttrOptions.set(extraAttr.id, {
      items: items,
      totalCount: items.length,
      isLoading: false
    });
    return;
  }

  if (extraAttr?.dataSource) {
    const serviceName = extraAttr.dataSource.service + "ServiceProxy";
    const apiMethod = extraAttr.dataSource.api;
    const resultField = extraAttr.dataSource.parameter;

    this.dynamicApi.dispatch(serviceName, apiMethod, {
      skipCount: skipCount,
      maxResultCount: maxResultCount
    }).subscribe(result => {
      const dropdownItems = result.items.map(item => ({
        label: this.getByPath(item, resultField.trim()),
        value: item.account.id
      }));

      const existing = this.extraAttrOptions.get(extraAttr.id)?.items || [];
      const combinedItems = skipCount > 0 ? [...existing, ...dropdownItems] : dropdownItems;

      this.extraAttrOptions.set(extraAttr.id, {
        items: combinedItems,
        totalCount: result.totalCount,
        isLoading: false
      });
    });
  }
}


  getByPath(obj: any, path: string) {
    return path.split('.').reduce((o, p) => o?.[p], obj);
  }

  getExtraAttr(attributeId: number, nameIncludes: string) {
    return this.extraAttributeObject.value.extraAttributes
      .find(x => x?.attributeId === attributeId || x?.name?.includes(nameIncludes));
  }



  saveAll(appEntityDto: AppEntityDto): void {
    this.showMainSpinner();
    this._appEntitiesServiceProxy.saveEntity(appEntityDto)
      .pipe(
        finalize(() => {
          this.hideMainSpinner();
        })
      )
      .subscribe({
        next: () => {
          this.formTouched = false;
          this.notify.success(this.l('Saved Successfully'));
        },
        error: () => {
          this.notify.error(this.l('Save Failed'));
        }
      });

    
  }

  isVisible(extraAttr: any): boolean {

  if (!extraAttr.visibleWhen) return true;

  const parentAttr = this.extraAttributeObject.value.extraAttributes
    .find(x => x.attributeId == extraAttr.visibleWhen.extraAttributeId);

  if (!parentAttr) return false;

  return parentAttr.selectedValues?.toString().toLowerCase() ===
         extraAttr.visibleWhen.value?.toString().toLowerCase();
}
getMultiSelectOptions(
  extraAttr: any
): Array<{ label: string; value: string }> {

  if (!extraAttr?.validEntries) {
    return [];
  }

  return extraAttr.validEntries
    .split('|')
    .map((value: string) => value.trim())
    .filter((value: string) => !!value)
    .map((value: string) => ({
      label: value,
      value
    }));
}
private initializeStaticOptions(): void {

    const attributes =
        this.extraAttributeObject?.value
            ?.filteredExtraAttributes ?? [];

    attributes.forEach((attr: any) => {

        const dataType =
            String(attr.dataType || '')
                .toUpperCase();

        /*
         * Static dropdown / multiselect
         */
        if (
            (
                dataType === 'DROPDOWNLIST' ||
                dataType === 'MULTISELECTDROPDOWNLIST'
            ) &&
            attr.validEntries
        ) {

            attr.paginationSetting ??= {
                skipCount: 0,
                maxResultCount: 100,
                totalCount: 0,
                list: []
            };

            const options =
                attr.validEntries
                    .split('|')
                    .map((value: string) =>
                        value.trim()
                    )
                    .filter(Boolean)
                    .map((value: string) => ({
                        label: value,
                        value: value
                    }));

            attr.paginationSetting.list =
                options;

            attr.paginationSetting.totalCount =
                options.length;
        }
    });
}
}
