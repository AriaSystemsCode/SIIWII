import { IAjaxResponse, TokenService } from 'abp-ng2-module';
import { Component, Injector, OnInit } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { SettingScopes, SendTestEmailInput, TenantSettingsEditDto, TenantSettingsServiceProxy, SycEntityObjectTypesServiceProxy, GetAllEntityObjectTypeOutput, LookupLabelDto, AppEntityExtraDataDto, GetAppTransactionsForViewDto } from '@shared/service-proxies/service-proxies';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { finalize } from 'rxjs/operators';
import { ExtraAttributeDataService } from '@app/main/app-items/app-item-shared/services/extra-attribute-data.service';
import { FilteredExtraAttribute } from '@app/main/app-items/app-item-shared/models/filtered-extra-attribute';
import { SelectItem } from "primeng/api";
import { CreateEditAppItemExtraAttribute } from '@app/main/app-items/app-item-shared/models/create-edit-app-item-extra-attribute';
import { EExtraAttributeUsage } from '@app/main/app-items/appItems/models/extra-attribute-usage.enum';
import { Observable } from 'rxjs';
@Component({
    templateUrl: './tenant-settings.component.html',
    styleUrls: [     './tenant-settings.component.scss',
    ],
    animations: [appModuleAnimation()]
})
export class TenantSettingsComponent extends AppComponentBase implements OnInit {

    usingDefaultTimeZone = false;
    initialTimeZone: string = null;
    testEmailAddress: string = undefined;
    setRandomPassword: boolean;

    isMultiTenancyEnabled: boolean = this.multiTenancy.isEnabled;
    showTimezoneSelection: boolean = abp.clock.provider.supportsMultipleTimezone;
    activeTabIndex: number = (abp.clock.provider.supportsMultipleTimezone) ? 0 : 1;
    loading = false;
    settings: TenantSettingsEditDto = undefined;

    logoUploader: FileUploader;
    customCssUploader: FileUploader;

    remoteServiceBaseUrl = AppConsts.remoteServiceBaseUrl;

    defaultTimezoneScope: SettingScopes = SettingScopes.Tenant;
    data:any
    allAttributes = []; // flat list from API
    groupedByUsage = {}; // { RECOMMENDED: [], ADDITIONAL: [] }
    usageList: string[] = []; // for sidebar
    selectedUsage: string;


      selectedTransactionTypeData: GetAllEntityObjectTypeOutput =
        new GetAllEntityObjectTypeOutput();
        selectedTransTypeData:any
      extraAttributes: any;

      activeAccordionIndexes: number[] = [0]; // open first tab by default
      appTransactionsForViewDto:any
      hasUnsavedChanges = false;

    constructor(
        injector: Injector,
        private _tenantSettingsService: TenantSettingsServiceProxy,
          private _sycEntityObjectTypesServiceProxy: SycEntityObjectTypesServiceProxy,
            private _extraAttributeDataService: ExtraAttributeDataService,
          
        private _tokenService: TokenService
    ) {
        super(injector);
        //i49-F6 set dto same as  getAppTransactionsForView api 
//    this.appTransactionsForViewDto= {
//     "lastRecord": false,
//     "firstRecord": false,
//     "creatorUserId": 30671,
//     "orderConfirmationFile": "JVBERi0xLjQNCiWio4Whq54rz3Wf66ibiVua20G3Z+6W7mL3o+DQoNCnN0YXJ0eHJlZg0KNjg4NDgNCiUlRU9GDQo=",
//     "sharedWithUsers": null,
//     "isOwnedByMe": true,
//     "creatorTenantName": null,
//     "isOrderInformationValid": false,
//     "isBuyerContactInformationValid": true,
//     "isSellerContactInformationValid": true,
//     "isSalesRepInformationValid": true,
//     "isShippingInformationValid": false,
//     "isBillingInformationValid": false,
//     "entityCategoriesNames": {
//         "totalCount": 0,
//         "items": []
//     },
//     "entityClassificationsNames": {
//         "totalCount": 0,
//         "items": []
//     },
//     "showSync": false,
//     "lastModifiedDate": "2025-05-11T06:55:33",
//     "shipViaName": "DHL Express",
//     "paymentTermsName": null,
//     "creationDate": "2025-05-11T06:55:33.2538026",
//     "extraDataAttributes": [
//         {
//             "extraAttrUsage": "Order Approval",
//             "extraAttrName": "Approved",
//             "selectedValuesTotalCount": 0,
//             "extraAttrDataType": "boolean",
//             "extraAttributeId": 1111,
//             "selectedValues": [
//                 {
//                     "code": null,
//                     "value": "true",
//                     "totalCount": 0,
//                     "entityAttachments": null,
//                     "defaultEntityAttachment": null,
//                     "edRestAttributes": null,
//                     "colorImage": null,
//                     "colorHexaCode": null
//                 }
//             ]
//         },
//         {
//             "extraAttrUsage": "Order Approval",
//             "extraAttrName": "ApprovalNumber",
//             "selectedValuesTotalCount": 0,
//             "extraAttrDataType": "string",
//             "extraAttributeId": 1112,
//             "selectedValues": [
//                 {
//                     "code": null,
//                     "value": "",
//                     "totalCount": 0,
//                     "entityAttachments": null,
//                     "defaultEntityAttachment": null,
//                     "edRestAttributes": null,
//                     "colorImage": null,
//                     "colorHexaCode": null
//                 }
//             ]
//         },
//         {
//             "extraAttrUsage": "Order Approval",
//             "extraAttrName": "Approved Amount",
//             "selectedValuesTotalCount": 0,
//             "extraAttrDataType": "Numeric",
//             "extraAttributeId": 1113,
//             "selectedValues": [
//                 {
//                     "code": null,
//                     "value": "",
//                     "totalCount": 0,
//                     "entityAttachments": null,
//                     "defaultEntityAttachment": null,
//                     "edRestAttributes": null,
//                     "colorImage": null,
//                     "colorHexaCode": null
//                 }
//             ]
//         },
//         {
//             "extraAttrUsage": "Order Approval",
//             "extraAttrName": "Approved Date",
//             "selectedValuesTotalCount": 0,
//             "extraAttrDataType": "Datetime",
//             "extraAttributeId": 1114,
//             "selectedValues": [
//                 {
//                     "code": null,
//                     "value": "2025-05-14T07:00:00.000Z",
//                     "totalCount": 0,
//                     "entityAttachments": null,
//                     "defaultEntityAttachment": null,
//                     "edRestAttributes": null,
//                     "colorImage": null,
//                     "colorHexaCode": null
//                 }
//             ]
//         },
//         {
//             "extraAttrUsage": "Order Approval",
//             "extraAttrName": "Approval Reason",
//             "selectedValuesTotalCount": 0,
//             "extraAttrDataType": "string",
//             "extraAttributeId": 1115,
//             "selectedValues": [
//                 {
//                     "code": null,
//                     "value": "Correct Date",
//                     "totalCount": 0,
//                     "entityAttachments": null,
//                     "defaultEntityAttachment": null,
//                     "edRestAttributes": null,
//                     "colorImage": null,
//                     "colorHexaCode": null
//                 },
//                 {
//                     "code": null,
//                     "value": "Correct Date",
//                     "totalCount": 0,
//                     "entityAttachments": null,
//                     "defaultEntityAttachment": null,
//                     "edRestAttributes": null,
//                     "colorImage": null,
//                     "colorHexaCode": null
//                 },
//                 {
//                     "code": null,
//                     "value": "Correct Date",
//                     "totalCount": 0,
//                     "entityAttachments": null,
//                     "defaultEntityAttachment": null,
//                     "edRestAttributes": null,
//                     "colorImage": null,
//                     "colorHexaCode": null
//                 }
//             ]
//         }
//     ],
//     "enteredByUserRole": null,
//     "buyerCompanySSIN": "Business-000000000014-2DVF-M1",
//     "buyerCompanyName": "Ross Stores, Inc.",
//     "sellerId": null,
//     "sellerCompanyName": "DVF 2",
//     "buyerContactEMailAddress": "Emmy@ross.com",
//     "languageId": 43,
//     "languageCode": "eng",
//     "currencyId": 438,
//     "currencyCode": "USD",
//     "sellerContactEMailAddress": "mohamed.abdelmonem1985@gmail.com",
//     "buyerContactPhoneNumber": "1239874563",
//     "sellerContactPhoneNumber": "2024569645",
//     "buyerContactName": "Emmy  Watson",
//     "sellerContactName": "admin DVF 2",
//     "priceLevel": "A",
//     "buyerContactSSIN": null,
//     "buyerBranchSSIN": null,
//     "buyerBranchName": null,
//     "sellerBranchSSIN": null,
//     "sellerBranchName": null,
//     "sellerContactSSIN": null,
//     "transactionType": 0,
//     "entityStatusCode": "OPEN",
//     "completeDate": "2023-12-21T00:00:00",
//     "sellerCompanySSIN": "Business-000000000014",
//     "startDate": "2023-11-21T00:00:00",
//     "availableDate": "2023-12-21T00:00:00",
//     "shipViaId": 395259,
//     "shipViaCode": "DHL Express",
//     "paymentTermsId": null,
//     "paymentTermsCode": null,
//     "buyerDepartment": "Women",
//     "appTransactionsDetails": [],
//     "appTransactionContacts": [

//     ],
//     "buyerStore": null,
//     "totalQuantity": 800,
//     "totalAmount": 80000,
//     "lFromPlaceOrder": false,
//     "currencyExchangeRate": 1,
//     "reference": null,
//     "enteredDate": "0001-01-01T00:00:00",
//     "createManualAccount": false,
//     "createManualContact": false,
//     "tenantId": 2452,
//     "attachmentSourceTenantId": null,
//     "name": "Sales Order#6",
//     "code": "6",
//     "notes": null,
//     "isHostRecord": false,
//     "addFromAttachments": false,
//     "relatedEntityId": null,
//     "entityObjectTypeId": 723,
//     "entityObjectTypeCode": "SALESORDER",
//     "entityObjectStatusId": 27,
//     "objectId": 45,
//     "entityAddresses": [],
//     "entityCategories": [],
//     "entityClassifications": [],
//     "entityAttachments": [

//     ],
//     "entityExtraData": [
//         {
//             "entityId": 371022,
//             "entityObjectTypeId": null,
//             "entityObjectTypeCode": null,
//             "entityObjectTypeName": null,
//             "attributeValueId": null,
//             "attributeValue": "",
//             "attributeId": 660,
//             "attributeValueFkName": null,
//             "attributeValueFkCode": null,
//             "attributeCode": null,
//             "id": 1021852
//         },
//         {
//             "entityId": 371022,
//             "entityObjectTypeId": null,
//             "entityObjectTypeCode": null,
//             "entityObjectTypeName": null,
//             "attributeValueId": null,
//             "attributeValue": "",
//             "attributeId": 661,
//             "attributeValueFkName": null,
//             "attributeValueFkCode": null,
//             "attributeCode": null,
//             "id": 1021853
//         },
//         {
//             "entityId": 371022,
//             "entityObjectTypeId": null,
//             "entityObjectTypeCode": null,
//             "entityObjectTypeName": null,
//             "attributeValueId": null,
//             "attributeValue": "",
//             "attributeId": 662,
//             "attributeValueFkName": null,
//             "attributeValueFkCode": null,
//             "attributeCode": null,
//             "id": 1021854
//         },
//         {
//             "entityId": 371022,
//             "entityObjectTypeId": null,
//             "entityObjectTypeCode": null,
//             "entityObjectTypeName": null,
//             "attributeValueId": null,
//             "attributeValue": "2025-04-23T07:00:00.000Z",
//             "attributeId": 660,
//             "attributeValueFkName": null,
//             "attributeValueFkCode": null,
//             "attributeCode": null,
//             "id": 1021855
//         },
//         {
//             "entityId": 371022,
//             "entityObjectTypeId": null,
//             "entityObjectTypeCode": null,
//             "entityObjectTypeName": null,
//             "attributeValueId": null,
//             "attributeValue": "2025-04-24T07:00:00.000Z",
//             "attributeId": 661,
//             "attributeValueFkName": null,
//             "attributeValueFkCode": null,
//             "attributeCode": null,
//             "id": 1021856
//         },
//         {
//             "entityId": 371022,
//             "entityObjectTypeId": null,
//             "entityObjectTypeCode": null,
//             "entityObjectTypeName": null,
//             "attributeValueId": null,
//             "attributeValue": "",
//             "attributeId": 662,
//             "attributeValueFkName": null,
//             "attributeValueFkCode": null,
//             "attributeCode": null,
//             "id": 1021857
//         },
//         {
//             "entityId": 371022,
//             "entityObjectTypeId": null,
//             "entityObjectTypeCode": null,
//             "entityObjectTypeName": null,
//             "attributeValueId": null,
//             "attributeValue": "",
//             "attributeId": 660,
//             "attributeValueFkName": null,
//             "attributeValueFkCode": null,
//             "attributeCode": null,
//             "id": 1021868
//         },
//         {
//             "entityId": 371022,
//             "entityObjectTypeId": null,
//             "entityObjectTypeCode": null,
//             "entityObjectTypeName": null,
//             "attributeValueId": null,
//             "attributeValue": "",
//             "attributeId": 661,
//             "attributeValueFkName": null,
//             "attributeValueFkCode": null,
//             "attributeCode": null,
//             "id": 1021869
//         },
//         {
//             "entityId": 371022,
//             "entityObjectTypeId": null,
//             "entityObjectTypeCode": null,
//             "entityObjectTypeName": null,
//             "attributeValueId": null,
//             "attributeValue": "",
//             "attributeId": 662,
//             "attributeValueFkName": null,
//             "attributeValueFkCode": null,
//             "attributeCode": null,
//             "id": 1021870
//         },
//         {
//             "entityId": 371022,
//             "entityObjectTypeId": null,
//             "entityObjectTypeCode": null,
//             "entityObjectTypeName": null,
//             "attributeValueId": null,
//             "attributeValue": null,
//             "attributeId": 660,
//             "attributeValueFkName": null,
//             "attributeValueFkCode": null,
//             "attributeCode": null,
//             "id": 1021905
//         },
//         {
//             "entityId": 371022,
//             "entityObjectTypeId": null,
//             "entityObjectTypeCode": null,
//             "entityObjectTypeName": null,
//             "attributeValueId": null,
//             "attributeValue": null,
//             "attributeId": 661,
//             "attributeValueFkName": null,
//             "attributeValueFkCode": null,
//             "attributeCode": null,
//             "id": 1021906
//         },
//         {
//             "entityId": 371022,
//             "entityObjectTypeId": null,
//             "entityObjectTypeCode": null,
//             "entityObjectTypeName": null,
//             "attributeValueId": null,
//             "attributeValue": "",
//             "attributeId": 662,
//             "attributeValueFkName": null,
//             "attributeValueFkCode": null,
//             "attributeCode": null,
//             "id": 1021907
//         },
//         {
//             "entityId": 371022,
//             "entityObjectTypeId": null,
//             "entityObjectTypeCode": null,
//             "entityObjectTypeName": null,
//             "attributeValueId": null,
//             "attributeValue": null,
//             "attributeId": 108,
//             "attributeValueFkName": null,
//             "attributeValueFkCode": null,
//             "attributeCode": null,
//             "id": 1021908
//         },
//         {
//             "entityId": 371022,
//             "entityObjectTypeId": null,
//             "entityObjectTypeCode": null,
//             "entityObjectTypeName": null,
//             "attributeValueId": null,
//             "attributeValue": null,
//             "attributeId": 201,
//             "attributeValueFkName": null,
//             "attributeValueFkCode": null,
//             "attributeCode": null,
//             "id": 1021909
//         },
//         {
//             "entityId": 371022,
//             "entityObjectTypeId": null,
//             "entityObjectTypeCode": null,
//             "entityObjectTypeName": null,
//             "attributeValueId": null,
//             "attributeValue": null,
//             "attributeId": 202,
//             "attributeValueFkName": null,
//             "attributeValueFkCode": null,
//             "attributeCode": null,
//             "id": 1021910
//         },
//         {
//             "entityId": 371022,
//             "entityObjectTypeId": null,
//             "entityObjectTypeCode": null,
//             "entityObjectTypeName": null,
//             "attributeValueId": null,
//             "attributeValue": null,
//             "attributeId": 203,
//             "attributeValueFkName": null,
//             "attributeValueFkCode": null,
//             "attributeCode": null,
//             "id": 1021911
//         },
//         {
//             "entityId": 371022,
//             "entityObjectTypeId": null,
//             "entityObjectTypeCode": null,
//             "entityObjectTypeName": null,
//             "attributeValueId": null,
//             "attributeValue": null,
//             "attributeId": 204,
//             "attributeValueFkName": null,
//             "attributeValueFkCode": null,
//             "attributeCode": null,
//             "id": 1021912
//         },
//         {
//             "entityId": 371022,
//             "entityObjectTypeId": null,
//             "entityObjectTypeCode": null,
//             "entityObjectTypeName": null,
//             "attributeValueId": null,
//             "attributeValue": null,
//             "attributeId": 205,
//             "attributeValueFkName": null,
//             "attributeValueFkCode": null,
//             "attributeCode": null,
//             "id": 1021913
//         },
//         {
//             "entityId": 371022,
//             "entityObjectTypeId": null,
//             "entityObjectTypeCode": null,
//             "entityObjectTypeName": null,
//             "attributeValueId": null,
//             "attributeValue": null,
//             "attributeId": 206,
//             "attributeValueFkName": null,
//             "attributeValueFkCode": null,
//             "attributeCode": null,
//             "id": 1021914
//         },
//         {
//             "entityId": 371022,
//             "entityObjectTypeId": null,
//             "entityObjectTypeCode": null,
//             "entityObjectTypeName": null,
//             "attributeValueId": 459568,
//             "attributeValue": null,
//             "attributeId": 1115,
//             "attributeValueFkName": null,
//             "attributeValueFkCode": null,
//             "attributeCode": null,
//             "id": 1022564
//         },
//         {
//             "entityId": 371022,
//             "entityObjectTypeId": null,
//             "entityObjectTypeCode": null,
//             "entityObjectTypeName": null,
//             "attributeValueId": 459568,
//             "attributeValue": null,
//             "attributeId": 1115,
//             "attributeValueFkName": null,
//             "attributeValueFkCode": null,
//             "attributeCode": null,
//             "id": 1022573
//         },
//         {
//             "entityId": 371022,
//             "entityObjectTypeId": null,
//             "entityObjectTypeCode": null,
//             "entityObjectTypeName": null,
//             "attributeValueId": null,
//             "attributeValue": "true",
//             "attributeId": 1111,
//             "attributeValueFkName": null,
//             "attributeValueFkCode": null,
//             "attributeCode": null,
//             "id": 1023514
//         },
//         {
//             "entityId": 371022,
//             "entityObjectTypeId": null,
//             "entityObjectTypeCode": null,
//             "entityObjectTypeName": null,
//             "attributeValueId": null,
//             "attributeValue": "",
//             "attributeId": 1112,
//             "attributeValueFkName": null,
//             "attributeValueFkCode": null,
//             "attributeCode": null,
//             "id": 1023515
//         },
//         {
//             "entityId": 371022,
//             "entityObjectTypeId": null,
//             "entityObjectTypeCode": null,
//             "entityObjectTypeName": null,
//             "attributeValueId": null,
//             "attributeValue": "",
//             "attributeId": 1113,
//             "attributeValueFkName": null,
//             "attributeValueFkCode": null,
//             "attributeCode": null,
//             "id": 1023516
//         },
//         {
//             "entityId": 371022,
//             "entityObjectTypeId": null,
//             "entityObjectTypeCode": null,
//             "entityObjectTypeName": null,
//             "attributeValueId": null,
//             "attributeValue": "2025-05-14T07:00:00.000Z",
//             "attributeId": 1114,
//             "attributeValueFkName": null,
//             "attributeValueFkCode": null,
//             "attributeCode": null,
//             "id": 1023517
//         },
//         {
//             "entityId": 371022,
//             "entityObjectTypeId": null,
//             "entityObjectTypeCode": null,
//             "entityObjectTypeName": null,
//             "attributeValueId": 459568,
//             "attributeValue": null,
//             "attributeId": 1115,
//             "attributeValueFkName": null,
//             "attributeValueFkCode": null,
//             "attributeCode": null,
//             "id": 1023518
//         }
//     ],
//     "entitiesRelationships": [],
//     "relatedEntitiesRelationships": [],
//     "appEntityTypes": 0,
//     "ssin": "SO-00002452-000000000160",
//     "tenantOwner": 2452,
//     "timeStamp": "2025-05-11T13:55:33.5439387",
//     "isDefault": false,
//     "id": 371022
// }
this.formTouched = false;
    }

    ngOnInit(): void {
   this.getAppItemTypeExtraAttributesById()

   //i49-F6 upload files
   //this.initUploaders();
    }

    initUploaders(): void {
      this.logoUploader = this.createUploader(
          '/TenantCustomization/UploadLogo',
          result => {
              this.appSession.tenant.logoFileType = result.fileType;
              this.appSession.tenant.logoId = result.id;
          }
      );

      this.customCssUploader = this.createUploader(
          '/TenantCustomization/UploadCustomCss',
          result => {
              this.appSession.tenant.customCssId = result.id;

              let oldTenantCustomCss = document.getElementById('TenantCustomCss');
              if (oldTenantCustomCss) {
                  oldTenantCustomCss.remove();
              }

              let tenantCustomCss = document.createElement('link');
              tenantCustomCss.setAttribute('id', 'TenantCustomCss');
              tenantCustomCss.setAttribute('rel', 'stylesheet');
              tenantCustomCss.setAttribute('href', AppConsts.remoteServiceBaseUrl + '/TenantCustomization/GetCustomCss?tenantId=' + this.appSession.tenant.id);
              document.head.appendChild(tenantCustomCss);
          }
      );
  }



  createUploader(url: string, success?: (result: any) => void): FileUploader {
    const uploader = new FileUploader({ url: AppConsts.remoteServiceBaseUrl + url });

    uploader.onAfterAddingFile = (file) => {
        file.withCredentials = false;
    };

    uploader.onSuccessItem = (item, response, status) => {
        const ajaxResponse = <IAjaxResponse>JSON.parse(response);
        if (ajaxResponse?.success) {
            this.notify.info(this.l('SavedSuccessfully'));
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

clearLogo(): void {
  this._tenantSettingsService.clearLogo().subscribe(() => {
      this.appSession.tenant.logoFileType = null;
      this.appSession.tenant.logoId = null;
      this.notify.info(this.l('ClearedSuccessfully'));
  });
}

clearCustomCss(): void {
  this._tenantSettingsService.clearCustomCss().subscribe(() => {
      this.appSession.tenant.customCssId = null;

      let oldTenantCustomCss = document.getElementById('TenantCustomCss');
      if (oldTenantCustomCss) {
          oldTenantCustomCss.remove();
      }

      this.notify.info(this.l('ClearedSuccessfully'));
  });
}




  groupAttributesByUsage(attrs: any[]): any {
    return attrs.reduce((acc, attr) => {
      const usage = attr.usage || 'UNSPECIFIED';
      if (!acc[usage]) acc[usage] = [];
      acc[usage].push(attr);
      return acc;
    }, {});
  }

  selectUsage(usage: string): void {
    this.selectedUsage = usage;
  }
  

  

 

    // saveAll(): void {
    //     this._tenantSettingsService.updateAllSettings(this.settings).subscribe(() => {
    //         this.notify.info(this.l('SavedSuccessfully'));

    //         if (abp.clock.provider.supportsMultipleTimezone && this.usingDefaultTimeZone && this.initialTimeZone !== this.settings.general.timezone) {
    //             this.message.info(this.l('TimeZoneSettingChangedRefreshPageNotification')).then(() => {
    //                 window.location.reload();
    //             });
    //         }
    //     });
    // }
    // saveAll(): void {
    //   const extraData = this.appTransactionsForViewDto?.entityExtraData || [];
    
    //   this._tenantSettingsService.updateAllSettings(this.settings)
    //     .pipe(finalize(() => {
    //       // Reset form change tracking
    //       this.formTouched = false;
    //     }))
    //     .subscribe(() => {
    //       // Update entity extra data after settings saved
    //       if (extraData.length > 0) {
    //         // this._extraAttributeDataService.saveEntityExtraData(extraData).subscribe(() => {
    //         //   this.notify.success(this.l('SavedSuccessfully'));
    //         // });
    //       } else {
    //         this.notify.success(this.l('SavedSuccessfully'));
    //       }
    
    //       if (abp.clock.provider.supportsMultipleTimezone &&
    //           this.usingDefaultTimeZone &&
    //           this.initialTimeZone !== this.settings.general.timezone) {
    //         this.message.info(this.l('TimeZoneSettingChangedRefreshPageNotification')).then(() => {
    //           window.location.reload();
    //         });
    //       }
    //     });
    // }
    saveAll(): void {
      const extraData = this.appTransactionsForViewDto?.entityExtraData || [];  
      this.notify.success(this.l('SavedSuccessfully (Test Mode)'));
    
      // Simulate reset of unsaved changes tracking
      this.formTouched = false;
    
      if (
        abp.clock.provider.supportsMultipleTimezone &&
        this.usingDefaultTimeZone &&
        this.initialTimeZone !== this.settings.general.timezone
      ) {
        this.message.info(this.l('TimeZoneSettingChangedRefreshPageNotification')).then(() => {
          window.location.reload();
        });
      }
    }
    
defineExtraAttributes() {
  this.extraAttributes = {};

  const allAttributes = this.selectedTransTypeData?.extraAttributes?.extraAttributes ?? [];

  allAttributes.forEach(attr => {
    const usageKey = attr.usage?.replace(/\s+/g, '_').toUpperCase() || 'DEFAULT';

    if (!this.extraAttributes[usageKey]) {
      this.extraAttributes[usageKey] = new CreateEditAppItemExtraAttribute({
        header: this.l(attr.usage),
        title: this.l(attr.usage),
        usageEnum: usageKey as unknown as EExtraAttributeUsage,
        orderOfDisplay: 1,
        filteredExtraAttributes: [],
        extraAttributes: []
      });
    }

    // ✅ Add this if missing
    if (!attr.paginationSetting) {
      attr.paginationSetting = {
        skipCount: 0,
        maxResultCount: 10,
        totalCount: 0,
        list: []
      };
    }
 
      
      
    this.extraAttributes[usageKey].filteredExtraAttributes.push(attr);
  });

}

getAppItemTypeExtraAttributesById() {
  //i49-F6 send setting id & use usage
    this._sycEntityObjectTypesServiceProxy.getAllWithExtraAttributes(771)
      .subscribe((res) => {
        if (res?.length > 0) {
          this.allAttributes = res[0]?.extraAttributes.extraAttributes;
  
          // Group attributes by `usage`
          this.groupedByUsage = this.groupAttributesByUsage(this.allAttributes);
          this.usageList = Object.keys(this.groupedByUsage);
          this.selectedUsage = this.usageList[0];
  
          // ✅ Initialize extraAttributes before using it
          this.selectedTransTypeData = res[0]; // ensure defineExtraAttributes uses correct data
          this.defineExtraAttributes();
  
          this.loadRecommendedAndAdditionalExtraDataLookupLists();

          setTimeout(() => this.scrollToUsage(this.selectedUsage), 200);
        }
      });
  }
  


  loadRecommendedAndAdditionalExtraDataLookupLists() {
    if (!this.extraAttributes || typeof this.extraAttributes !== 'object') {
      return;
    }
  
    Object.keys(this.extraAttributes).forEach(key => {
      const group = this.extraAttributes[key];
      group.filteredExtraAttributes.forEach(extraAttr => {
        if (extraAttr.isLookup) {
          this.loadExtraDataLookupList(extraAttr);
        }
      });
    });
  }
  

  loadExtraDataLookupList(extraAttr: FilteredExtraAttribute) {
      this._extraAttributeDataService
          .getExtraAttributeLookupDataWithPaging(
            extraAttr.entityObjectTypeCode,
            extraAttr.paginationSetting.skipCount,
            extraAttr.paginationSetting.maxResultCount
          )
          .subscribe((result) => {
              extraAttr.paginationSetting.totalCount = result.totalCount;
              if (extraAttr.paginationSetting.skipCount == 0)
                  extraAttr.paginationSetting.list = [];
              else
                  extraAttr.paginationSetting.list.splice(
                      extraAttr.paginationSetting.list.length - 1,
                      1
                  );
                   let isExist=result.items.filter((item)=>{ return item.value==extraAttr.attributeId});
                  if((isExist!.length==0||isExist==undefined)  && extraAttr?.selectedValues?.length>0){

                      const tempAtt = new LookupLabelDto({
                          code:extraAttr.code,
                          label:extraAttr.selectedValues,
                          stockAvailability:undefined,
                          value:extraAttr.selectedValues,
                          isHostRecord:false,
                          hexaCode:undefined,
                          image:undefined,
                          status:undefined,
                          entityObjectStatusId:undefined

                      })
                      result.items.push(tempAtt)
                  }

              extraAttr.paginationSetting.list.push(...result.items);
              if (
                  extraAttr.paginationSetting.list.length <
                  extraAttr.paginationSetting.totalCount
              ) {
                  const showMoreSelectItem: SelectItem = {
                      value: -1,
                      label: this.l("showMore"),
                      icon: "fas  fa-reply",
                      styleClass: "showMore",
                      disabled: false,
                  };
                  extraAttr.paginationSetting.list.push(showMoreSelectItem);
              }
              extraAttr.paginationSetting.skipCount +=
                  extraAttr.paginationSetting.maxResultCount;
          });
  }

  scrollToUsage(usage: string): void {
    this.selectedUsage = usage;
  
    const index = this.usageList.indexOf(usage);
    if (index !== -1) {
      // Expand only the clicked tab
      this.activeAccordionIndexes = [index];
  
      // Scroll to the section
      setTimeout(() => {
        const element = document.getElementById('usage_' + usage);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }
  

  //i49-F6 save setting data
  onExtraAttributesChanged(dataFromChild: any[]) {
    this.formTouched = true;
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

    // ✅ Step 2: No filter — keep all values
    const cleanIncomingData = incomingData;

    // Step 3: Remove old entries for incoming attributeIds
    const incomingAttributeIds = new Set(cleanIncomingData.map(d => d.attributeId));
    const filteredExistingData = existingData.filter(
      d => !incomingAttributeIds.has(d.attributeId)
    );

    // Step 4: Merge clean incoming data
    const finalData = [...filteredExistingData, ...cleanIncomingData];
    console.log(finalData,'finalData')

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
  

    

  

}
