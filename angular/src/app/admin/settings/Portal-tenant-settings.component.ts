// import { IAjaxResponse, TokenService } from 'abp-ng2-module';
// import { Component, Injector, OnInit, QueryList, ViewChildren } from '@angular/core';
// import { AppConsts } from '@shared/AppConsts';
// import { appModuleAnimation } from '@shared/animations/routerTransition';
// import { AppComponentBase } from '@shared/common/app-component-base';
// import { SettingScopes, SendTestEmailInput, TenantSettingsEditDto, TenantSettingsServiceProxy, SycEntityObjectTypesServiceProxy, GetAllEntityObjectTypeOutput, LookupLabelDto, AppEntityExtraDataDto, AppEntitiesServiceProxy, SystemTablesServiceProxy, GetAppEntityForEditOutput, AppEntityDto } from '@shared/service-proxies/service-proxies';
// import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
// import { finalize } from 'rxjs/operators';
// import { ExtraAttributeDataService } from '@app/main/app-items/app-item-shared/services/extra-attribute-data.service';
// import { FilteredExtraAttribute } from '@app/main/app-items/app-item-shared/models/filtered-extra-attribute';
// import { SelectItem } from "primeng/api";
// import { CreateEditAppItemExtraAttribute } from '@app/main/app-items/app-item-shared/models/create-edit-app-item-extra-attribute';
// import { EExtraAttributeUsage } from '@app/main/app-items/appItems/models/extra-attribute-usage.enum';
// import { forkJoin, Observable } from 'rxjs';
// import { dynamicInputs } from '@shared/components/dynamicInputs/dynamicInputs.component';
// @Component({
//   templateUrl: './portal-tenant-settings.component.html',
//   styleUrls: ['./settings.component.scss',
//   ],
//   animations: [appModuleAnimation()],
//   providers: [SystemTablesServiceProxy]
// })
// export class PortalTenantSettingsComponent extends AppComponentBase implements OnInit {

//   usingDefaultTimeZone = false;
//   initialTimeZone: string = null;
//   testEmailAddress: string = undefined;
//   setRandomPassword: boolean;

//   isMultiTenancyEnabled: boolean = this.multiTenancy.isEnabled;
//   showTimezoneSelection: boolean = abp.clock.provider.supportsMultipleTimezone;
//   activeTabIndex: number = (abp.clock.provider.supportsMultipleTimezone) ? 0 : 1;
//   loading = false;
//   settings: TenantSettingsEditDto = undefined;

//   logoUploader: FileUploader;
//   customCssUploader: FileUploader;

//   remoteServiceBaseUrl = AppConsts.remoteServiceBaseUrl;

//   defaultTimezoneScope: SettingScopes = SettingScopes.Tenant;
//   data: any
//   allAttributes = []; // flat list from API
//   groupedByUsage = {}; // { RECOMMENDED: [], ADDITIONAL: [] }
//   usageList: string[] = []; // for sidebar
//   selectedUsage: string;


//   selectedTransactionTypeData: GetAllEntityObjectTypeOutput =
//     new GetAllEntityObjectTypeOutput();
//   selectedTransTypeData: any
//   extraAttributes: any;

//   activeAccordionIndexes: number[] = [0]; // open first tab by default
//   dynamicInputsForViewDto: GetAppEntityForEditOutput;
//   hasUnsavedChanges = false;
//   entityObjectTypeTenantId: number=771;
//   tenantEntityId: number;


// @ViewChildren('appdynamicInputs')
// dynamicInputsComponents!: QueryList<dynamicInputs>;

    
//     currentLang: string = 'en';
//     isArabic: boolean = false;
//   constructor(
//     injector: Injector,
//     private _tenantSettingsService: TenantSettingsServiceProxy,
//     private _sycEntityObjectTypesServiceProxy: SycEntityObjectTypesServiceProxy,
//     private _extraAttributeDataService: ExtraAttributeDataService,
//     private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
//     private _systemTablesServiceProxy: SystemTablesServiceProxy,
//     private _tokenService: TokenService
//   ) {
//     super(injector);
//   }

//   ngOnInit(): void {
//        this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
//         this.currentLang == 'ar' || this.currentLang == 'ar-EG'  ? this.isArabic = true : this.isArabic = false
//     this.stopFormListening=true;
//     this.getSettingData()
//     this.getAppItemTypeExtraAttributesById()
//   }

//   getSettingData() {
//     this._appEntitiesServiceProxy.getCurrentTenantEntityId().pipe(finalize(() => {
//       this._appEntitiesServiceProxy.getAppEntityForEdit(this.tenantEntityId,true).subscribe(result => {
//         this.dynamicInputsForViewDto = result;
//       });

//     })).subscribe(result => {
//       this.tenantEntityId = result;
//     });
//   }

//   initUploaders(): void {
//     this.logoUploader = this.createUploader(
//       '/TenantCustomization/UploadLogo',
//       result => {
//         this.appSession.tenant.logoFileType = result.fileType;
//         this.appSession.tenant.logoId = result.id;
//       }
//     );

//     this.customCssUploader = this.createUploader(
//       '/TenantCustomization/UploadCustomCss',
//       result => {
//         this.appSession.tenant.customCssId = result.id;

//         let oldTenantCustomCss = document.getElementById('TenantCustomCss');
//         if (oldTenantCustomCss) {
//           oldTenantCustomCss.remove();
//         }

//         let tenantCustomCss = document.createElement('link');
//         tenantCustomCss.setAttribute('id', 'TenantCustomCss');
//         tenantCustomCss.setAttribute('rel', 'stylesheet');
//         tenantCustomCss.setAttribute('href', AppConsts.remoteServiceBaseUrl + '/TenantCustomization/GetCustomCss?tenantId=' + this.appSession.tenant.id);
//         document.head.appendChild(tenantCustomCss);
//       }
//     );
//   }



//   createUploader(url: string, success?: (result: any) => void): FileUploader {
//     const uploader = new FileUploader({ url: AppConsts.remoteServiceBaseUrl + url });

//     uploader.onAfterAddingFile = (file) => {
//       file.withCredentials = false;
//     };

//     uploader.onSuccessItem = (item, response, status) => {
//       const ajaxResponse = <IAjaxResponse>JSON.parse(response);
//       if (ajaxResponse?.success) {
//         this.notify.info(this.l('SavedSuccessfully'));
//         if (success) {
//           success(ajaxResponse.result);
//         }
//       } else {
//         this.message.error(ajaxResponse.error.message);
//       }
//     };

//     const uploaderOptions: Partial<FileUploaderOptions> = {};
//     uploaderOptions.authToken = 'Bearer ' + this._tokenService.getToken();
//     uploaderOptions.removeAfterUpload = true;
//     uploader.setOptions(uploaderOptions as FileUploaderOptions);
//     return uploader;
//   }

//   clearLogo(): void {
//     this._tenantSettingsService.clearLogo().subscribe(() => {
//       this.appSession.tenant.logoFileType = null;
//       this.appSession.tenant.logoId = null;
//       this.notify.info(this.l('ClearedSuccessfully'));
//     });
//   }

//   clearCustomCss(): void {
//     this._tenantSettingsService.clearCustomCss().subscribe(() => {
//       this.appSession.tenant.customCssId = null;

//       let oldTenantCustomCss = document.getElementById('TenantCustomCss');
//       if (oldTenantCustomCss) {
//         oldTenantCustomCss.remove();
//       }

//       this.notify.info(this.l('ClearedSuccessfully'));
//     });
//   }




//   groupAttributesByUsage(attrs: any[]): any {
//     return attrs.reduce((acc, attr) => {
//       const usage = attr.usage || 'UNSPECIFIED';
//       if (!acc[usage]) acc[usage] = [];
//       acc[usage].push(attr);
//       return acc;
//     }, {});
//   }

//   selectUsage(usage: string): void {
//     this.selectedUsage = usage;
//   }



//   saveAll(): void {
//     let success = false;

//           const extraDataList = this.dynamicInputsForViewDto?.entityExtraData || [];


//     let appEntityDto : AppEntityDto =new AppEntityDto();
//      appEntityDto = Object.assign(
//           new AppEntityDto(),
//            this.dynamicInputsForViewDto.appEntity
//         );
//     appEntityDto.entityExtraData =  this.dynamicInputsForViewDto?.entityExtraData || [];
//     /*appEntityDto.id= this.tenantEntityId;
//     appEntityDto.entityObjectTypeId=this.entityObjectTypeTenantId;
//     appEntityDto.objectId= 2;
//     appEntityDto.tenantId=this.appSession.tenantId;
//     appEntityDto.code= this.dynamicInputsForViewDto.appEntity.code;
//     appEntityDto.name=this.dynamicInputsForViewDto.appEntity.name;*/

//     appEntityDto.extraDataFileTypeIndex = appEntityDto.entityExtraData
//             .map((item, index) =>
//                 typeof item.attributeValue === 'string' && item.attributeValue.includes('|') ? index : -1
//             )
//             .filter(index => index !== -1);
     
//             this.dynamicInputsComponents.first.saveAll(appEntityDto);

//     if (abp.clock.provider.supportsMultipleTimezone &&
//       this.usingDefaultTimeZone &&
//       this.initialTimeZone !== this.settings.general.timezone) {
//       this.message.info(this.l('TimeZoneSettingChangedRefreshPageNotification')).then(() => {
//         window.location.reload();
//       });
//     }
//   }


//   defineExtraAttributes() {
//     this.extraAttributes = {};

//     const allAttributes = this.selectedTransTypeData?.extraAttributes?.extraAttributes ?? [];

//     allAttributes.forEach(attr => {
//       const usageKey = attr.usage?.replace(/\s+/g, '_').toUpperCase() || 'DEFAULT';

//       if (!this.extraAttributes[usageKey]) {
//         this.extraAttributes[usageKey] = new CreateEditAppItemExtraAttribute({
//           header: this.l(attr.usage),
//           title: this.l(attr.usage),
//           usageEnum: usageKey as unknown as EExtraAttributeUsage,
//           orderOfDisplay: 1,
//           filteredExtraAttributes: [],
//           extraAttributes: []
//         });
//       }

//       // ✅ Add this if missing
//       if (!attr.paginationSetting) {
//         attr.paginationSetting = {
//           skipCount: 0,
//           maxResultCount: 10,
//           totalCount: 0,
//           list: []
//         };
//       }



//       this.extraAttributes[usageKey].filteredExtraAttributes.push(attr);
//     });

//   }

//   getAppItemTypeExtraAttributesById() {
//     this._systemTablesServiceProxy.getEntityObjectTypeTenantId().pipe(finalize(() => {
//       this._sycEntityObjectTypesServiceProxy.getAllWithExtraAttributes(this.entityObjectTypeTenantId)
//         .subscribe((res) => {
//           if (res?.length > 0) {
//             this.allAttributes = res[0]?.extraAttributes.extraAttributes;

//             // Group attributes by `usage`
//             this.groupedByUsage = this.groupAttributesByUsage(this.allAttributes);
//             this.usageList = Object.keys(this.groupedByUsage);
//             this.selectedUsage = this.usageList[0];

//             // ✅ Initialize extraAttributes before using it
//             this.selectedTransTypeData = res[0]; // ensure defineExtraAttributes uses correct data
//             this.defineExtraAttributes();

//             this.loadTenantSettings();

//             setTimeout(() => this.scrollToUsage(this.selectedUsage), 200);
//           }
//         });
//     })).subscribe((res) => {
//       this.entityObjectTypeTenantId = res ? res : 771;
//     });
//   }


//   loadTenantSettings() {
//     if (!this.extraAttributes || typeof this.extraAttributes !== 'object') {
//       return;
//     }

//     Object.keys(this.extraAttributes).forEach(key => {
//       const group = this.extraAttributes[key];
//       group.filteredExtraAttributes.forEach(extraAttr => {
//         if (extraAttr.isLookup) {
//           this.loadExtraDataLookupList(extraAttr);
//         }
//       });
//     });
//   }

//   loadExtraDataLookupList(extraAttr: FilteredExtraAttribute) {
//     this._extraAttributeDataService
//       .getExtraAttributeLookupDataWithPaging(
//         extraAttr.entityObjectTypeCode,
//         extraAttr.paginationSetting.skipCount,
//         extraAttr.paginationSetting.maxResultCount
//       )
//       .subscribe((result) => {
//         extraAttr.paginationSetting.totalCount = result.totalCount;
//         if (extraAttr.paginationSetting.skipCount == 0)
//           extraAttr.paginationSetting.list = [];
//         else
//           extraAttr.paginationSetting.list.splice(
//             extraAttr.paginationSetting.list.length - 1,
//             1
//           );
//         let isExist = result.items.filter((item) => { return item.value == extraAttr.attributeId });
//         if ((isExist!.length == 0 || isExist == undefined) && extraAttr?.selectedValues?.length > 0) {

//           const tempAtt = new LookupLabelDto({
//             code: extraAttr.code,
//             label: extraAttr.selectedValues,
//             stockAvailability: undefined,
//             value: extraAttr.selectedValues,
//             isHostRecord: false,
//             hexaCode: undefined,
//             image: undefined,
//             status: undefined,
//             entityObjectStatusId: undefined

//           })
//           result.items.push(tempAtt)
//         }

//         extraAttr.paginationSetting.list.push(...result.items);
//         if (
//           extraAttr.paginationSetting.list.length <
//           extraAttr.paginationSetting.totalCount
//         ) {
//           const showMoreSelectItem: SelectItem = {
//             value: -1,
//             label: this.l("showMore"),
//             icon: "fas  fa-reply",
//             styleClass: "showMore",
//             disabled: false,
//           };
//           extraAttr.paginationSetting.list.push(showMoreSelectItem);
//         }
//         extraAttr.paginationSetting.skipCount +=
//           extraAttr.paginationSetting.maxResultCount;
//       });
//   }

//   scrollToUsage(usage: string): void {
//     this.selectedUsage = usage;

//     const index = this.usageList.indexOf(usage);
//     if (index !== -1) {
//       // Expand only the clicked tab
//       this.activeAccordionIndexes = [index];

//       // Scroll to the section
//       setTimeout(() => {
//         const element = document.getElementById('usage_' + usage);
//         if (element) {
//           element.scrollIntoView({ behavior: 'smooth', block: 'start' });
//         }
//       }, 100);
//     }
//   }

    
//   onExtraAttributesChanged(dataFromChild: any[]) {
//     this.formTouched = true;
//     if (!this.dynamicInputsForViewDto) {
//       this.dynamicInputsForViewDto = new GetAppEntityForEditOutput();
//     }

//     if (!this.dynamicInputsForViewDto.entityExtraData) {
//       this.dynamicInputsForViewDto.entityExtraData = [];
//     }

//     const existingData = this.dynamicInputsForViewDto.entityExtraData;

//     // Step 1: Map incoming data cleanly
//     const incomingData: AppEntityExtraDataDto[] = dataFromChild.flatMap(attr => {
//       if (attr.isLookup && attr.acceptMultipleValues) {
//         return (attr.value || []).map(v => {
//           const d = new AppEntityExtraDataDto();
//           d.attributeId = attr.attributeId;
//           d.entityObjectTypeId = this.entityObjectTypeTenantId;
//           d.entityid = this.tenantEntityId;
//           d.attributeValueId = v;
//           return d;
//         });
//       } else {
//         const dto = new AppEntityExtraDataDto();
//         dto.attributeId = attr.attributeId;
//         dto.entityObjectTypeId = this.entityObjectTypeTenantId;
//         dto.entityid = this.tenantEntityId;
//         if (attr.isLookup) {
//           dto.attributeValueId = attr.value;
//         } else {
//           dto.attributeValue = attr.value;
//         }
//         return dto;
//       }
//     });

//     // ✅ Step 2: No filter — keep all values
//     const cleanIncomingData = incomingData;

//     // Step 3: Remove old entries for incoming attributeIds
//     const incomingAttributeIds = new Set(cleanIncomingData.map(d => d.attributeId));
//     const filteredExistingData = existingData.filter(
//       d => !incomingAttributeIds.has(d.attributeId)
//     );

//     // Step 4: Merge clean incoming data
//     const finalData = [...filteredExistingData, ...cleanIncomingData];
//     console.log(finalData, 'finalData')

//     this.dynamicInputsForViewDto.entityExtraData = finalData;
//   }

//   onExtraAttributeCleared(attributeId: number) {
//     const data = this.dynamicInputsForViewDto?.entityExtraData;
//     if (data && data.length > 0) {
//       let index = -1;
//       while ((index = data.findIndex(x => x.attributeId === attributeId)) !== -1) {
//         data.splice(index, 1);
//       }

//     }
//   }

  
//  onActiveIndexChange(usage){
//         this.selectedUsage = usage; 
// }

// }




































import {
    ChangeDetectorRef,
    Component,
    QueryList,
    ViewChildren
} from '@angular/core';

import {
    DisplayOption,
    PivotChartService,
    PivotViewComponent
} from '@syncfusion/ej2-angular-pivotview';

import {
    GridsterConfig,
    GridsterItem
} from 'angular-gridster2';


interface DashboardPivotWidget {

    id: number;

    name: string;

    widgetType: 'PivotChart';

    gridInformation: GridsterItem;

    pivot: {
        rows: any[];
        columns: any[];
        values: any[];
        filters: any[];
        filterSettings?: any[];
        sortSettings?: any[];
    };

    chart: {
        type: string;
        title: string;
        enableMultipleAxis?: boolean;
    };

    // POC ONLY.
    // Later this can come from:
    // sourceSpreadsheetId / API.
    data: any[];

    // Prepared Syncfusion objects
    dataSourceSettings?: any;
    chartSettings?: any;
}


interface DashboardPage {

    id: number;

    name: string;

    widgets: DashboardPivotWidget[];
}


@Component({
    selector: 'app-portal-tenant-settings',

    templateUrl:
        './portal-tenant-settings.component.html',

    styleUrls: [
        './settings.component.scss'
    ],

    providers: [
        PivotChartService
    ]
})
export class PortalTenantSettingsComponent {


    // =====================================================
    // SYNCFUSION PIVOT REFERENCES
    // =====================================================

    @ViewChildren(PivotViewComponent)
    pivotCharts:
        QueryList<PivotViewComponent>;


    // =====================================================
    // PIVOT DISPLAY
    // =====================================================

    pivotChartOnlyDisplay = {

        view: 'Chart',

        primary: 'Chart'

    } as DisplayOption;


    // =====================================================
    // STATIC TRANSACTION DATA
    // POC ONLY
    // =====================================================

    private staticTransactionData = [

        {
            TransactionNumber: '1',
            TransactionType: 'PurchaseOrder',
            Seller: 'SXA 2',
            Buyer: 'FRAME 2',
            Status: 'OPEN',
            Amount: 18420,
            Quantity: 2460
        },

        {
            TransactionNumber: '2',
            TransactionType: 'Sales Order',
            Seller: 'FRAME 2',
            Buyer: 'SXA 2',
            Status: 'OPEN',
            Amount: 120520,
            Quantity: 2625
        },

        {
            TransactionNumber: '3',
            TransactionType: 'Sales Order',
            Seller: 'FRAME 2',
            Buyer: 'SXA 2',
            Status: 'OPEN',
            Amount: 18,
            Quantity: 2
        },

        {
            TransactionNumber: '4',
            TransactionType: 'Sales Order',
            Seller: 'FRAME 2',
            Buyer: 'ABC',
            Status: 'COMPLETE',
            Amount: 2500,
            Quantity: 10
        },

        {
            TransactionNumber: '5',
            TransactionType: 'Sales Order',
            Seller: 'FRAME 2',
            Buyer: 'ABC',
            Status: 'OPEN',
            Amount: 4200,
            Quantity: 25
        },

        {
            TransactionNumber: '6',
            TransactionType: 'PurchaseOrder',
            Seller: 'SXA 2',
            Buyer: 'FRAME 2',
            Status: 'OPEN',
            Amount: 3900,
            Quantity: 30
        },

        {
            TransactionNumber: '7',
            TransactionType: 'Sales Order',
            Seller: 'SXA 2',
            Buyer: 'FRAME 2',
            Status: 'OPEN',
            Amount: 6000,
            Quantity: 40
        },

        {
            TransactionNumber: '8',
            TransactionType: 'PurchaseOrder',
            Seller: 'ABN Inc',
            Buyer: 'SXA 2',
            Status: 'COMPLETE',
            Amount: 347,
            Quantity: 5
        },

        {
            TransactionNumber: '9',
            TransactionType: 'Sales Order',
            Seller: 'SXA 2',
            Buyer: 'FRAME 2',
            Status: 'OPEN',
            Amount: 7200,
            Quantity: 50
        },

        {
            TransactionNumber: '10',
            TransactionType: 'PurchaseOrder',
            Seller: 'Anue Miami',
            Buyer: 'SXA 2',
            Status: 'OPEN',
            Amount: 1800,
            Quantity: 12
        }

    ];


    // =====================================================
    // DASHBOARD
    // =====================================================

    userDashboard: {
        pages: DashboardPage[];
    };


    selectedPageId:
        number;


    options:
        GridsterConfig[] = [];


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    constructor(
        private cdr:
            ChangeDetectorRef
    ) {

        this.createStaticDashboard();

    }


    // =====================================================
    // CREATE STATIC DASHBOARD
    // =====================================================

    private createStaticDashboard(): void {


        const page1: DashboardPage = {

            id: 1,

            name: 'Analytics',

            widgets: [

                // ==========================================
                // CHART 1
                // Sales / Purchase Orders by Seller
                // ==========================================

                {
                    id: 101,

                    name:
                        'Orders by Seller',

                    widgetType:
                        'PivotChart',

                    gridInformation: {

                        x: 0,

                        y: 0,

                        cols: 6,

                        rows: 4,

                        minItemCols: 3,

                        minItemRows: 3

                    } as GridsterItem,


                    pivot: {

                        rows: [
                            {
                                name:
                                    'Seller',

                                caption:
                                    'Seller'
                            }
                        ],

                        columns: [
                            {
                                name:
                                    'TransactionType',

                                caption:
                                    'Transaction Type'
                            }
                        ],

                        values: [
                            {
                                name:
                                    'TransactionNumber',

                                caption:
                                    'Transaction Count',

                                type:
                                    'Count'
                            }
                        ],

                        filters: [],

                        filterSettings: [],

                        sortSettings: []

                    },


                    chart: {

                        type:
                            'Column',

                        title:
                            'Sales and Purchase Orders by Seller',

                        enableMultipleAxis:
                            false

                    },


                    data:
                        this.staticTransactionData

                },


                // ==========================================
                // CHART 2
                // Transactions by Buyer
                // ==========================================

                {
                    id: 102,

                    name:
                        'Transactions by Buyer',

                    widgetType:
                        'PivotChart',

                    gridInformation: {

                        x: 6,

                        y: 0,

                        cols: 6,

                        rows: 4,

                        minItemCols: 3,

                        minItemRows: 3

                    } as GridsterItem,


                    pivot: {

                        rows: [
                            {
                                name:
                                    'Buyer',

                                caption:
                                    'Buyer'
                            }
                        ],

                        columns: [],

                        values: [
                            {
                                name:
                                    'TransactionNumber',

                                caption:
                                    'Transaction Count',

                                type:
                                    'Count'
                            }
                        ],

                        filters: [],

                        filterSettings: [],

                        sortSettings: []

                    },


                    chart: {

                        type:
                            'Bar',

                        title:
                            'Transactions by Buyer',

                        enableMultipleAxis:
                            false

                    },


                    data:
                        this.staticTransactionData

                },


                // ==========================================
                // CHART 3
                // Sales vs Purchase Orders
                // ==========================================

                {
                    id: 103,

                    name:
                        'Order Type Distribution',

                    widgetType:
                        'PivotChart',

                    gridInformation: {

                        x: 0,

                        y: 4,

                        cols: 5,

                        rows: 4,

                        minItemCols: 3,

                        minItemRows: 3

                    } as GridsterItem,


                    pivot: {

                        rows: [
                            {
                                name:
                                    'TransactionType',

                                caption:
                                    'Transaction Type'
                            }
                        ],

                        columns: [],

                        values: [
                            {
                                name:
                                    'TransactionNumber',

                                caption:
                                    'Transaction Count',

                                type:
                                    'Count'
                            }
                        ],

                        filters: [],

                        filterSettings: [],

                        sortSettings: []

                    },


                    chart: {

                        type:
                            'Pie',

                        title:
                            'Sales vs Purchase Orders',

                        enableMultipleAxis:
                            false

                    },


                    data:
                        this.staticTransactionData

                }

            ]

        };


        this.userDashboard = {

            pages: [
                page1
            ]

        };


        this.selectedPageId =
            page1.id;


        // Build Syncfusion objects
        this.prepareDashboardWidgets();


        // Gridster configuration
        this.options = [

            this.createGridsterOptions()

        ];

    }


    // =====================================================
    // PREPARE ALL PIVOT WIDGETS
    // =====================================================

    private prepareDashboardWidgets(): void {

        this.userDashboard
            ?.pages
            ?.forEach(page => {

                page.widgets
                    ?.forEach(widget => {

                        this.preparePivotWidget(
                            widget
                        );

                    });

            });

    }


    // =====================================================
    // PREPARE SINGLE PIVOT
    // =====================================================

    private preparePivotWidget(
        widget:
            DashboardPivotWidget
    ): void {


        widget.dataSourceSettings = {

            dataSource:
                widget.data,

            rows:
                this.cleanPivotFields(
                    widget.pivot.rows,
                    false
                ),

            columns:
                this.cleanPivotFields(
                    widget.pivot.columns,
                    false
                ),

            values:
                this.cleanPivotFields(
                    widget.pivot.values,
                    true
                ),

            filters:
                this.cleanPivotFields(
                    widget.pivot.filters,
                    false
                ),

            filterSettings:
                widget.pivot
                    .filterSettings ??
                [],

            sortSettings:
                widget.pivot
                    .sortSettings ??
                [],

            enableSorting:
                true,

            allowLabelFilter:
                true,

            allowValueFilter:
                true

        };


        widget.chartSettings = {

            chartSeries: {

                type:
                    widget.chart
                        ?.type ??
                    'Column'

            },

            title:
                widget.chart
                    ?.title ??
                widget.name,

            enableMultipleAxis:
                widget.chart
                    ?.enableMultipleAxis ??
                false,

            // Important for Gridster:
            // Column/Bar charts need a resolved initial chart height.
            height:
                '300px'

        };

        console.log(
            'Prepared pivot widget:',
            widget.id,
            widget.chart?.type,
            widget.dataSourceSettings,
            widget.chartSettings
        );

    }


    // =====================================================
    // REMOVE INVALID ROW / COLUMN AGGREGATION
    // =====================================================

    private cleanPivotFields(
        fields: any[],
        includeAggregation: boolean
    ): any[] {


        if (!fields?.length) {
            return [];
        }


        return fields.map(
            field => {


                const result:
                    any = {

                    name:
                        field.name,

                    caption:
                        field.caption ??
                        field.name

                };


                // Only VALUES should use Count/Sum/etc.
                if (
                    includeAggregation &&
                    field.type
                ) {

                    result.type =
                        field.type;

                }


                return result;

            }
        );

    }


    // =====================================================
    // GRIDSTER OPTIONS
    // =====================================================

    private createGridsterOptions():
        GridsterConfig {


        return {

            gridType:
                'fit',

            compactType:
                'none',

            margin:
                12,

            outerMargin:
                true,


            // 12-column dashboard
            minCols:
                12,

            maxCols:
                12,

            minRows:
                8,

            maxRows:
                100,


            // ==========================================
            // DRAG
            // ==========================================

            draggable: {

                enabled:
                    true,

                ignoreContent:
                    false,

                dragHandleClass:
                    'dashboard-widget-drag-handle'

            },


            // ==========================================
            // RESIZE
            // ==========================================

            resizable: {

                enabled:
                    true

            },


            // ==========================================
            // CALLBACKS
            // ==========================================

            itemInitCallback:
                (
                    item:
                        GridsterItem,

                    itemComponent:
                        any
                ) => {

                    setTimeout(() => {

                        this.refreshDashboardPivotCharts();

                    }, 200);

                },


            itemResizeCallback:
                (
                    item:
                        GridsterItem,

                    itemComponent:
                        any
                ) => {

                    this.onGridsterResize(
                        item
                    );

                },


            itemChangeCallback:
                (
                    item:
                        GridsterItem,

                    itemComponent:
                        any
                ) => {

                    console.log(
                        'Widget position/size:',
                        item
                    );

                }

        };

    }


    // =====================================================
    // GRIDSTER RESIZE
    // =====================================================

    private onGridsterResize(
        item: GridsterItem
    ): void {


        console.log(
            'Widget resized:',
            item
        );


        this.refreshDashboardPivotCharts();

    }


    // =====================================================
    // REFRESH SYNCFUSION CHARTS
    // =====================================================

    refreshDashboardPivotCharts(): void {


        setTimeout(() => {


            if (!this.pivotCharts) {
                return;
            }


            this.pivotCharts
                .forEach(
                    (pivot: any) => {


                        try {

                            // Re-bind after Gridster resolves the widget size.
                            if (
                                typeof pivot.dataBind ===
                                'function'
                            ) {

                                pivot.dataBind();

                            }


                            // Prefer refreshing only the rendered chart.
                            if (
                                pivot.chart &&
                                typeof pivot.chart.refresh ===
                                    'function'
                            ) {

                                pivot.chart.refresh();

                            } else if (
                                typeof pivot.refresh ===
                                    'function'
                            ) {

                                pivot.refresh();

                            }

                        } catch (
                            error
                        ) {

                            console.error(
                                'Dashboard Pivot refresh error:',
                                error
                            );

                        }

                    }
                );


            window.dispatchEvent(
                new Event('resize')
            );


        }, 150);

    }


    // =====================================================
    // CHART CREATED
    // =====================================================

    onPivotChartCreated(
        widgetId: number
    ): void {


        console.log(
            'Pivot chart created:',
            widgetId
        );


        setTimeout(() => {

            this.refreshDashboardPivotCharts();

        }, 200);

    }


    // =====================================================
    // TABS
    // =====================================================

    selectPageTab(
        pageId: number
    ): void {


        this.selectedPageId =
            pageId;


        setTimeout(() => {

            this.refreshDashboardPivotCharts();

        }, 100);

    }


    // =====================================================
    // USED BY EXISTING HTML
    // =====================================================

    moreThanOnePage(): boolean {

        return (
            this.userDashboard
                ?.pages
                ?.length ??
            0
        ) > 1;

    }


    // =====================================================
    // OPTIONAL REMOVE
    // =====================================================

    removeWidget(
        page:
            DashboardPage,

        widget:
            DashboardPivotWidget
    ): void {


        page.widgets =
            page.widgets.filter(
                item =>
                    item.id !==
                    widget.id
            );


        this.cdr.detectChanges();

    }

}