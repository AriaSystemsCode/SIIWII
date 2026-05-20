import { Component, Injector, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CreateEditAppItemExtraAttribute } from '@app/main/app-items/app-item-shared/models/create-edit-app-item-extra-attribute';
import { FilteredExtraAttribute } from '@app/main/app-items/app-item-shared/models/filtered-extra-attribute';
import { ExtraAttributeDataService } from '@app/main/app-items/app-item-shared/services/extra-attribute-data.service';
import { EExtraAttributeUsage } from '@app/main/app-items/appItems/models/extra-attribute-usage.enum';
import { IAjaxResponse, TokenService } from '@node_modules/abp-ng2-module';
import { FileUploader, FileUploaderOptions } from '@node_modules/ng2-file-upload';
import { SelectItem } from '@node_modules/primeng/api';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ComboboxItemDto, CommonLookupServiceProxy, SettingScopes, HostSettingsEditDto, HostSettingsServiceProxy, SendTestEmailInput, GetAllEntityObjectTypeOutput, LookupLabelDto, AppEntityExtraDataDto, SycEntityObjectTypesServiceProxy, SystemTablesServiceProxy, AppEntitiesServiceProxy, GetAppEntityForEditOutput, AppEntityAttachmentDto, AttachmentsCategories, AppEntityDto } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';
import { dynamicInputs } from '@shared/components/dynamicInputs/dynamicInputs.component';

@Component({
    templateUrl: './portal-host-settings.component.html',
    styleUrls: ['./settings.component.scss',
    ],
    animations: [appModuleAnimation()],
    providers: [SycEntityObjectTypesServiceProxy, SystemTablesServiceProxy]
})
export class PortalHostSettingsComponent extends AppComponentBase implements OnInit {
    loading = false;
    hostSettings: HostSettingsEditDto;
    editions: ComboboxItemDto[] = undefined;
    testEmailAddress: string = undefined;
    showTimezoneSelection = abp.clock.provider.supportsMultipleTimezone;
    defaultTimezoneScope: SettingScopes = SettingScopes.Application;

    usingDefaultTimeZone = false;
    initialTimeZone: string = undefined;
    setRandomPassword: boolean;

    isMultiTenancyEnabled: boolean = this.multiTenancy.isEnabled;
    activeTabIndex: number = (abp.clock.provider.supportsMultipleTimezone) ? 0 : 1;
    settings: HostSettingsEditDto = undefined;

    logoUploader: FileUploader;
    customCssUploader: FileUploader;

    remoteServiceBaseUrl = AppConsts.remoteServiceBaseUrl;

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
    entityObjectTypeHostId: number = 764;
    hostEntityId: number;
    attachmentsUploader;
    attachmets = [];
    AttachmentInfoDto = [];
    @ViewChildren('appdynamicInputs')
    dynamicInputsComponents!: QueryList<dynamicInputs>;

    constructor(
        injector: Injector,
        private _hostSettingService: HostSettingsServiceProxy,
        private _commonLookupService: CommonLookupServiceProxy,
        private _sycEntityObjectTypesServiceProxy: SycEntityObjectTypesServiceProxy,
        private _extraAttributeDataService: ExtraAttributeDataService,
        private _systemTablesServiceProxy: SystemTablesServiceProxy,
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
        private _tokenService: TokenService
    ) {
        super(injector);
    }

    loadHostSettings(): void {
        const self = this;
        self._hostSettingService.getAllSettings()
            .subscribe(setting => {
                self.hostSettings = setting;
                self.initialTimeZone = setting.general.timezone;
                self.usingDefaultTimeZone = setting.general.timezoneForComparison === self.setting.get('Abp.Timing.TimeZone');
            });
    }

    loadEditions(): void {
        const self = this;
        self._commonLookupService.getEditionsForCombobox(false).subscribe((result) => {
            self.editions = result.items;

            const notAssignedEdition = new ComboboxItemDto();
            notAssignedEdition.value = null;
            notAssignedEdition.displayText = self.l('NotAssigned');

            self.editions.unshift(notAssignedEdition);
        });
    }

    init(): void {
        const self = this;
        self.testEmailAddress = self.appSession.user.emailAddress;
        self.showTimezoneSelection = abp.clock.provider.supportsMultipleTimezone;
        //  self.loadHostSettings();
        // self.loadEditions();
    }

    ngOnInit(): void {
        this.stopFormListening=true;
        const self = this;
        self.init();
        this.getSettingData()
        this.getAppItemTypeExtraAttributesById();
        // this.initUploaders();
    }

    async getSettingData() {
        this._appEntitiesServiceProxy.getCurrentHostEntityId().pipe(finalize(() => {
            this._appEntitiesServiceProxy.getAppEntityForEdit(this.hostEntityId,true).subscribe(result => {
                this.dynamicInputsForViewDto = result;
            });

        })).subscribe(result => {
            this.hostEntityId = result;
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

    sendTestEmail(): void {
        const self = this;
        const input = new SendTestEmailInput();
        input.emailAddress = self.testEmailAddress;
        self._hostSettingService.sendTestEmail(input).subscribe(result => {
            self.notify.info(self.l('TestEmailSentSuccessfully'));
        });
    }




    saveAll(): void {
        const self = this;
        let success = false;

      const extraDataList = this.dynamicInputsForViewDto?.entityExtraData || [];

        let appEntityDto: AppEntityDto = new AppEntityDto();
        appEntityDto.entityExtraData = this.dynamicInputsForViewDto?.entityExtraData || [];
        appEntityDto.id = this.hostEntityId;
        appEntityDto.entityObjectTypeId = this.entityObjectTypeHostId;
        appEntityDto.objectId = 2;
        appEntityDto.code = this.dynamicInputsForViewDto.appEntity.code;
        appEntityDto.name = this.dynamicInputsForViewDto.appEntity.name;

        appEntityDto.extraDataFileTypeIndex = appEntityDto.entityExtraData
            .map((item, index) =>
                typeof item.attributeValue === 'string' && item.attributeValue.includes('|') ? index : -1
            )
            .filter(index => index !== -1);

        this.dynamicInputsComponents.first.saveAll(appEntityDto);

        if (
            abp.clock.provider.supportsMultipleTimezone &&
            this.usingDefaultTimeZone &&
            this.initialTimeZone !== this.settings.general.timezone
        ) {
            this.message.info(this.l('TimeZoneSettingChangedRefreshPageNotification')).then(() => {
                window.location.reload();
            });

            if (self.hostSettings.tenantManagement.defaultEditionId.toString() === 'null') {
                self.hostSettings.tenantManagement.defaultEditionId = null;
            }

            self._hostSettingService.updateAllSettings(self.hostSettings).subscribe(result => {
                self.notify.info(self.l('SavedSuccessfully'));

                if (abp.clock.provider.supportsMultipleTimezone && self.usingDefaultTimeZone && self.initialTimeZone !== self.hostSettings.general.timezone) {
                    self.message.info(self.l('TimeZoneSettingChangedRefreshPageNotification')).then(() => {
                        window.location.reload();
                    });
                }
            });
        }
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
        this._systemTablesServiceProxy.getEntityObjectTypeHostId().pipe(finalize(() => {
            this._sycEntityObjectTypesServiceProxy.getAllWithExtraAttributes(this.entityObjectTypeHostId)
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
        })).subscribe((res) => {
            this.entityObjectTypeHostId = res ? res : 764;
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
       // this.formTouched = true;
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
                    d.entityObjectTypeId = this.entityObjectTypeHostId;
                    d.entityid = this.hostEntityId;
                    d.attributeValueId = v;
                    return d;
                });
            } else {
                const dto = new AppEntityExtraDataDto();
                dto.attributeId = attr.attributeId;
                dto.entityObjectTypeId = this.entityObjectTypeHostId;
                dto.entityid = this.hostEntityId;

                if (attr.isLookup) {
                    dto.attributeValueId = attr.value;
                } else {
                    if (attr.value && attr.value.type?.startsWith('image/'))
                        dto.attributeValue = attr.value.name;
                    else
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

    onActiveIndexChange(usage) {
        this.selectedUsage = usage;
    }

}
