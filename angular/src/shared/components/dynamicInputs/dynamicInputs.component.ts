
import { Component, EventEmitter, Injector, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { ImageUploadComponentOutput } from '@app/shared/common/image-upload/image-upload.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppAdvertisementsServiceProxy, ExtraAttribute, GetAppAdvertisementForViewDto, SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';
import { FileUploaderCustom } from '../import-steps/models/FileUploaderCustom.model';
import { FileUploader, FileUploaderOptions } from '@node_modules/ng2-file-upload';
import { AppConsts } from '@shared/AppConsts';
import { IAjaxResponse, TokenService } from '@node_modules/abp-ng2-module';

@Component({
  selector: 'app-dynamicInputs',
  templateUrl: './dynamicInputs.component.html',
  styleUrls: ['./dynamicInputs.component.scss'],
  animations: [appModuleAnimation()]
})
export class dynamicInputs extends AppComponentBase implements OnInit, OnChanges  {
  @Input("extraAttributeObject") extraAttributeObject;
  @Input("entityType") entityType;
  @Input("entityObjectTypeId") entityObjectTypeId;
  @Output() extraDataChanged = new EventEmitter<any[]>();
  @Output() extraDataCleared = new EventEmitter<number>(); // send attributeId
  selectedExtraData: any[] = [];
  @Input() dynamicInputsForViewDto: any;
  originalValuesMap = new Map<number, any>();
  @Input() fromSetting:boolean =false;


  
      public constructor(
         private _tokenService: TokenService,
          injector: Injector
      ) {
          super(injector);
      }

  openCalendar(calendar: any) {
    calendar.overlayVisible = true;
  }
  ngOnChanges() {
      this.fillSelectedValuesFromDto();
      this.onAnyInputChange();
  }
  
  onAnyInputChange() {
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

        let formattedValue = attr.selectedValues;

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

        // ✅ Handle Numeric input
        if (attr.dataType === 'Numeric' || attr.dataType === 'boolean' || attr.dataType === 'Boolean'|| attr.dataType === 'bit' || attr.dataType === 'color') {
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
          finalValue = ''; // ✅ always send empty string
        } else if (!isSame) {
          finalValue = formattedValue;
        } else {
          finalValue = formattedValue || '';
        }

        const updatedValue = {
          attributeId: attr.attributeId,
          value: finalValue,
          isLookup: attr.isLookup === true,
          acceptMultipleValues: attr.acceptMultipleValues === true
        };

        updatedDataMap.set(attr.attributeId, updatedValue);
      }
    }

    this.selectedExtraData = Array.from(updatedDataMap.values());

    this.extraDataChanged.emit(this.selectedExtraData);
  }

  reset(extraAttr: any) {
    if (extraAttr.acceptMultipleValues) {
      extraAttr.selectedValues = [];
    } else {
      extraAttr.selectedValues = '';
    }
  
    this.onAnyInputChange();
  }
  
  

  themes =[] ; 
    selectedTheme: any ;

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
  


  fillSelectedValuesFromDto() {
    if (!this.extraAttributeObject?.value?.extraAttributes || !this.dynamicInputsForViewDto?.extraDataAttributes) {
      return;
    }

    const dtoData = this.dynamicInputsForViewDto.extraDataAttributes;

    const allAttributes = [
      ...(this.extraAttributeObject.value.extraAttributes || []),
      ...(this.extraAttributeObject.value.filteredExtraAttributes || [])
    ];

    for (const attr of allAttributes) {

      const matchedDto = dtoData.find(d => d.extraAttributeId === attr.attributeId);

      if (matchedDto && matchedDto.selectedValues?.length) {
        const dtoValue = matchedDto.selectedValues[matchedDto.selectedValues.length - 1].value;

        if (attr.isLookup) {
          const matchedOption = attr.paginationSetting?.list?.find(opt => {
            return opt.label === dtoValue || opt.value === dtoValue;
          });

          if (matchedOption) {
            attr.selectedValues = matchedOption.value;
          } else {
            const manualOption = {
              value: dtoValue,
              label: dtoValue,
              code: null,
              isHostRecord: false,
              stockAvailability: null,
              image: null,
              hexaCode: null
            };
            attr.paginationSetting.list.push(manualOption);
            attr.selectedValues = manualOption.value;
          }
        } else if (attr.dataType === 'Datetime' && typeof dtoValue === 'string') {
          attr.selectedValues = new Date(dtoValue);
        } else {
          attr.selectedValues = dtoValue;
        }
        this.originalValuesMap.set(attr.attributeId, attr.selectedValues);
      }
  //     else {
  //         if ((attr.dataType === 'boolean' || attr.dataType === 'bit') && (attr.selectedValues == null || attr.selectedValues === '')) {
  //   attr.selectedValues = this.defaultBooleanValue;
  // }
  //     }
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
    this.fillSelectedValuesFromDto();
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
        alert('Only JPG, PNG, or GIF files are allowed.');
        return;
      }
      const dotIndex = file.name.lastIndexOf('.');
      const baseName = file.name.substring(0, dotIndex); 
      const extension = file.name.substring(dotIndex);   
      const guid = this.guid();
  
      const newFileName = `${baseName}${extension}|${guid}${extension}`;
       const newFile = new File([file], newFileName , { type: file.type });
       extraAttr.selectedValues = newFile;    
       extraAttr.showUploadBtn =true;   
      this.onAnyInputChange();
    }
  }

  attachmentsUploader:FileUploader;
  onUploadFile(file){
        this.attachmentsUploader = this.createUploader(
          '/Attachment/UploadFiles',
          result => {
          }
      );

    const blob = new Blob([file], { type: file.type });
     const originalName = file.name.split('|')[0];
     const  guid = file.name.split('|')[1].split('.')[0]
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


      getDropdownOptions(extraAttr:ExtraAttribute){
        //i49-New get dropdown options
        //if(extraAttr.id == )
      }

}
