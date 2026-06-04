import { IAjaxResponse, TokenService } from 'abp-ng2-module';
import { Component, Injector, OnInit, QueryList, ViewChildren } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { SettingScopes, SendTestEmailInput, TenantSettingsEditDto, TenantSettingsServiceProxy, SycEntityObjectTypesServiceProxy, GetAllEntityObjectTypeOutput, LookupLabelDto, AppEntityExtraDataDto, AppEntitiesServiceProxy, SystemTablesServiceProxy, GetAppEntityForEditOutput, AppEntityDto } from '@shared/service-proxies/service-proxies';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { finalize } from 'rxjs/operators';
import { ExtraAttributeDataService } from '@app/main/app-items/app-item-shared/services/extra-attribute-data.service';
import { FilteredExtraAttribute } from '@app/main/app-items/app-item-shared/models/filtered-extra-attribute';
import { SelectItem } from "primeng/api";
import { CreateEditAppItemExtraAttribute } from '@app/main/app-items/app-item-shared/models/create-edit-app-item-extra-attribute';
import { EExtraAttributeUsage } from '@app/main/app-items/appItems/models/extra-attribute-usage.enum';
import { forkJoin, Observable } from 'rxjs';
import { dynamicInputs } from '@shared/components/dynamicInputs/dynamicInputs.component';
@Component({
  templateUrl: './portal-tenant-settings.component.html',
  styleUrls: ['./settings.component.scss',
  ],
  animations: [appModuleAnimation()],
  providers: [SystemTablesServiceProxy]
})
export class PortalTenantSettingsComponent extends AppComponentBase implements OnInit {

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
  data: any
  allAttributes = []; // flat list from API
  groupedByUsage = {}; // { RECOMMENDED: [], ADDITIONAL: [] }
  usageList: string[] = []; // for sidebar
  selectedUsage: string;


  selectedTransactionTypeData: GetAllEntityObjectTypeOutput =
    new GetAllEntityObjectTypeOutput();
  selectedTransTypeData: any
  extraAttributes: any;

  activeAccordionIndexes: number[] = [0]; // open first tab by default
  dynamicInputsForViewDto: GetAppEntityForEditOutput;
  hasUnsavedChanges = false;
  entityObjectTypeTenantId: number=771;
  tenantEntityId: number;


@ViewChildren('appdynamicInputs')
dynamicInputsComponents!: QueryList<dynamicInputs>;

  constructor(
    injector: Injector,
    private _tenantSettingsService: TenantSettingsServiceProxy,
    private _sycEntityObjectTypesServiceProxy: SycEntityObjectTypesServiceProxy,
    private _extraAttributeDataService: ExtraAttributeDataService,
    private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
    private _systemTablesServiceProxy: SystemTablesServiceProxy,
    private _tokenService: TokenService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.stopFormListening=true;
    this.getSettingData()
    this.getAppItemTypeExtraAttributesById()
  }

  getSettingData() {
    this._appEntitiesServiceProxy.getCurrentTenantEntityId().pipe(finalize(() => {
      this._appEntitiesServiceProxy.getAppEntityForEdit(this.tenantEntityId,true).subscribe(result => {
        this.dynamicInputsForViewDto = result;
      });

    })).subscribe(result => {
      this.tenantEntityId = result;
    });
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



  saveAll(): void {
    let success = false;

          const extraDataList = this.dynamicInputsForViewDto?.entityExtraData || [];


    let appEntityDto : AppEntityDto =new AppEntityDto();
     appEntityDto = Object.assign(
          new AppEntityDto(),
           this.dynamicInputsForViewDto.appEntity
        );
    appEntityDto.entityExtraData =  this.dynamicInputsForViewDto?.entityExtraData || [];
    /*appEntityDto.id= this.tenantEntityId;
    appEntityDto.entityObjectTypeId=this.entityObjectTypeTenantId;
    appEntityDto.objectId= 2;
    appEntityDto.tenantId=this.appSession.tenantId;
    appEntityDto.code= this.dynamicInputsForViewDto.appEntity.code;
    appEntityDto.name=this.dynamicInputsForViewDto.appEntity.name;*/

    appEntityDto.extraDataFileTypeIndex = appEntityDto.entityExtraData
            .map((item, index) =>
                typeof item.attributeValue === 'string' && item.attributeValue.includes('|') ? index : -1
            )
            .filter(index => index !== -1);
     
            this.dynamicInputsComponents.first.saveAll(appEntityDto);

    if (abp.clock.provider.supportsMultipleTimezone &&
      this.usingDefaultTimeZone &&
      this.initialTimeZone !== this.settings.general.timezone) {
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
    this._systemTablesServiceProxy.getEntityObjectTypeTenantId().pipe(finalize(() => {
      this._sycEntityObjectTypesServiceProxy.getAllWithExtraAttributes(this.entityObjectTypeTenantId)
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

            this.loadTenantSettings();

            setTimeout(() => this.scrollToUsage(this.selectedUsage), 200);
          }
        });
    })).subscribe((res) => {
      this.entityObjectTypeTenantId = res ? res : 771;
    });
  }


  loadTenantSettings() {
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
        let isExist = result.items.filter((item) => { return item.value == extraAttr.attributeId });
        if ((isExist!.length == 0 || isExist == undefined) && extraAttr?.selectedValues?.length > 0) {

          const tempAtt = new LookupLabelDto({
            code: extraAttr.code,
            label: extraAttr.selectedValues,
            stockAvailability: undefined,
            value: extraAttr.selectedValues,
            isHostRecord: false,
            hexaCode: undefined,
            image: undefined,
            status: undefined,
            entityObjectStatusId: undefined

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

    
  onExtraAttributesChanged(dataFromChild: any[]) {
    this.formTouched = true;
    if (!this.dynamicInputsForViewDto) {
      this.dynamicInputsForViewDto = new GetAppEntityForEditOutput();
    }

    if (!this.dynamicInputsForViewDto.entityExtraData) {
      this.dynamicInputsForViewDto.entityExtraData = [];
    }

    const existingData = this.dynamicInputsForViewDto.entityExtraData;

    // Step 1: Map incoming data cleanly
    const incomingData: AppEntityExtraDataDto[] = dataFromChild.flatMap(attr => {
      if (attr.isLookup && attr.acceptMultipleValues) {
        return (attr.value || []).map(v => {
          const d = new AppEntityExtraDataDto();
          d.attributeId = attr.attributeId;
          d.entityObjectTypeId = this.entityObjectTypeTenantId;
          d.entityid = this.tenantEntityId;
          d.attributeValueId = v;
          return d;
        });
      } else {
        const dto = new AppEntityExtraDataDto();
        dto.attributeId = attr.attributeId;
        dto.entityObjectTypeId = this.entityObjectTypeTenantId;
        dto.entityid = this.tenantEntityId;
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
    console.log(finalData, 'finalData')

    this.dynamicInputsForViewDto.entityExtraData = finalData;
  }

  onExtraAttributeCleared(attributeId: number) {
    const data = this.dynamicInputsForViewDto?.entityExtraData;
    if (data && data.length > 0) {
      let index = -1;
      while ((index = data.findIndex(x => x.attributeId === attributeId)) !== -1) {
        data.splice(index, 1);
      }

    }
  }

  
 onActiveIndexChange(usage){
        this.selectedUsage = usage; 
}

}
