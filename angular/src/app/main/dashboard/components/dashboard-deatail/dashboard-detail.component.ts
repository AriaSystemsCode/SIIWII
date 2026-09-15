import { ChangeDetectorRef, Component, Injector, NgZone, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem, MessageService, ConfirmationService } from 'primeng/api';

import { Subscription } from 'rxjs';
import { AppComponentBase } from '@shared/common/app-component-base';

import {
  GridsterConfig,
  GridsterItem,
  GridType,

} from 'angular-gridster2';
import { DashboardPage, DashboardPivotWidget } from '../../models/dashboard.model';

import {
    DisplayOption,
   PivotChartService,
    PivotViewComponent
} from '@syncfusion/ej2-angular-pivotview';


import {
    AppTransactionServiceProxy
} from '@shared/service-proxies/service-proxies';


export enum DashboardPermissionFlags {
  None = 0,
  View = 1 << 0,     // 1
  Edit = 1 << 1,     // 2
  FullEdit = 1 << 2, // 4
}

type DashboardMode = 'view' | 'edit';

interface UserRef {
  id: number;
  displayName: string;
  avatarUrl?: string | null;
  email?: string;
}

interface ShareEntry {
  user: UserRef;
  permissionFlags: DashboardPermissionFlags; // View/Edit/FullEdit
}

interface DashboardWidget {
  id: number;
  title: string;
  // layout info (use later with gridster)
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

interface DashboardDto {
  id: number;
  title: string;
  owner: UserRef;
  updatedAt: Date;
  lastViewedAt?: Date | null;
  permissionFlags: DashboardPermissionFlags;
  isOwner: boolean;
  shares: ShareEntry[];
  widgets: DashboardWidget[];
}

@Component({
  selector: 'app-dashboard-detail',
  templateUrl: './dashboard-detail.component.html',
  styleUrls: ['./dashboard-detail.component.scss'],
  providers: [MessageService, ConfirmationService , PivotChartService],
})
export class DashboardDetailComponent extends AppComponentBase implements OnInit, OnDestroy {
  private subs: Subscription[] = [];

  // --- state ---
  mode: DashboardMode = 'view';
  loading = false;
  refreshing = false;

  dashboardId = 1; // from route param later

  defaultAvatar = 'assets/common/images/default-profile-picture.png';

  dashboard: DashboardDto = {
    id: 1,
    title: 'Sales Performance Dashboard',
    owner: { id: 101, displayName: 'Menna', avatarUrl: null },
    updatedAt: new Date('2026-02-18'),
    lastViewedAt: new Date('2026-02-20'),
    permissionFlags: DashboardPermissionFlags.View | DashboardPermissionFlags.Edit, // example
    isOwner: true,
    shares: [
      { user: { id: 1, displayName: 'Amr', avatarUrl: null, email: 'amr@test.com' }, permissionFlags: DashboardPermissionFlags.View },
      { user: { id: 2, displayName: 'Mary', avatarUrl: null, email: 'mary@test.com' }, permissionFlags: DashboardPermissionFlags.Edit },
      { user: { id: 3, displayName: 'Ali', avatarUrl: null, email: 'ali@test.com' }, permissionFlags: DashboardPermissionFlags.FullEdit },
    ],
    widgets: [
      { id: 11, title: 'Revenue (KPI)' },
      { id: 12, title: 'Orders (Line Chart)' },
      { id: 13, title: 'Top Products (Bar)' },
      { id: 14, title: 'Regions (Pie)' },
    ],
  };

  // --- dialogs ---

  shareDialogVisible = false;
  exportEmailDialogVisible = false;

  // --- forms ---
  shareForm: FormGroup;
  exportEmailForm: FormGroup;

  // --- menus ---
  actionsMenuItems: MenuItem[] = [];

  // --- “undo/redo” simple placeholders for edit mode ---
  canUndo = false;
  canRedo = false;
  hasUnsavedChanges = false;

  // example: recipients search / selection
  selectedRecipients: UserRef[] = [];


  page = { widgets: [] as any[] };

    @ViewChildren(PivotViewComponent)
    pivotCharts:
        QueryList<PivotViewComponent>;


    pivotChartOnlyDisplay = {

        view: 'Chart',

        primary: 'Chart'

    } as DisplayOption;



    userDashboard: {
        pages: DashboardPage[];
    };


    selectedPageId:
        number;


    options:
        GridsterConfig[] = [];


    // POC limit until BE supports a dedicated dashboard refresh endpoint.
    private dashboardRefreshMaxResultCount = 10000;

  constructor(
    injector: Injector,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmService: ConfirmationService,
    private cdr:
            ChangeDetectorRef,
                private _appTransactionServiceProxy:
                        AppTransactionServiceProxy
  
  ) {
    super(injector);
        this.loadDashboardWidgetsFromLocalStorage();


    this.shareForm = this.fb.group({
      // used for "add user" row (you can replace with your app user picker)
      addUserName: [''],
      addUserPermission: [DashboardPermissionFlags.View, Validators.required],
    });

    this.exportEmailForm = this.fb.group({
      subject: ['Dashboard Export PDF', [Validators.required, Validators.maxLength(200)]],
      message: ['Please find the exported dashboard PDF attached.', [Validators.maxLength(2000)]],
      sendImmediately: [true],
    });
  }

  ngOnInit(): void {
    // The dashboard pages/widgets and Gridster options are already built
    // from dashboardPivotWidgets in loadDashboardWidgetsFromLocalStorage().
    // Do not seed the old dashboard widgets here because that belongs to the
    // previous dashboard implementation.
    this.buildActionsMenu();
    this.loadDashboard(this.dashboardId);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  // ---------------------------
  //  Permissions
  // ---------------------------
  hasPermission(flag: DashboardPermissionFlags): boolean {
    return (this.dashboard.permissionFlags & flag) === flag;
  }

  get canView(): boolean {
    return this.hasPermission(DashboardPermissionFlags.View);
  }

  get canEdit(): boolean {
    return this.dashboard.isOwner || this.hasPermission(DashboardPermissionFlags.Edit) || this.hasPermission(DashboardPermissionFlags.FullEdit);
  }

  get canFullEdit(): boolean {
    return this.dashboard.isOwner || this.hasPermission(DashboardPermissionFlags.FullEdit);
  }

  get canRename(): boolean {
    // requirement: owner can rename always, or Edit/FullEdit
    return this.dashboard.isOwner || this.canEdit;
  }

  get canShare(): boolean {
    // requirement: FullEdit can share
    return this.canFullEdit;
  }

  get canDelete(): boolean {
    // requirement: FullEdit can delete
    return this.canFullEdit;
  }


  loadDashboard(id: number): void {
    this.loading = true;

    // TODO: call backend
    // this.dashboardService.get(id)...
    setTimeout(() => {
      this.loading = false;

      // always default to view mode
      this.mode = 'view';

      // update menu (permissions might differ)
      this.buildActionsMenu();
    }, 300);
  }

  enterEditMode(): void {
    if (!this.canEdit) return;
  
    this.mode = 'edit';
    this.toggleGridsterEditing(true);  
    // this.messageService.add({ severity: 'info', summary: 'Edit mode', detail: 'You are now editing the dashboard.' });
  }
  

  cancelEditMode(): void {
    if (!this.hasUnsavedChanges) {
      this.mode = 'view';
      return;
    }

    this.confirmService.confirm({
      message: 'Discard unsaved changes?',
      header: 'Discard changes',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.hasUnsavedChanges = false;
        this.canUndo = false;
        this.canRedo = false;
        this.mode = 'view';
      },
    });
    this.toggleGridsterEditing(false); 
    this.mode = 'view';
  }

  saveDashboard(): void {
    if (!this.canEdit) return;

    this.loading = true;

    // TODO: call backend save (layout/widgets/config)
    setTimeout(() => {
      this.loading = false;
      this.hasUnsavedChanges = false;
      this.canUndo = false;
      this.canRedo = false;

      this.dashboard.updatedAt = new Date();
      this.toggleGridsterEditing(false); 
      this.mode = 'view';

      this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Dashboard saved successfully.' });
    }, 600);
  }

  markDirty(): void {
    if (!this.canEdit) return;
    this.hasUnsavedChanges = true;
    this.canUndo = true;
  }

  undo(): void {
    if (!this.canUndo) return;
    // TODO: implement history stack
    this.canRedo = true;
    this.messageService.add({ severity: 'info', summary: 'Undo', detail: 'Last action undone.' });
  }

  redo(): void {
    if (!this.canRedo) return;
    // TODO: implement history stack
    this.messageService.add({ severity: 'info', summary: 'Redo', detail: 'Last action redone.' });
  }

  // ---------------------------
  //  Refresh All
  // ---------------------------
  refreshAll(): void {
    if (!this.canView) return;

    this.refreshing = true;

    // TODO: call backend to refresh widget data or re-query data sources
    setTimeout(() => {
      this.refreshing = false;
      this.messageService.add({ severity: 'success', summary: 'Refreshed', detail: 'All widgets refreshed.' });
    }, 700);
  }

  // ---------------------------

  permissionOptions = [
    { label: 'View', value: DashboardPermissionFlags.View },
    { label: 'Edit', value: DashboardPermissionFlags.Edit },
    { label: 'Full Edit', value: DashboardPermissionFlags.FullEdit },
  ];


  // ---------------------------
  //  Export PDF + Email PDF
  // ---------------------------
  exportPdf(): void {
    if (!this.canView) return;

    this.loading = true;

    // TODO: backend: generate PDF snapshot that matches on-screen layout
    // then download file
    setTimeout(() => {
      this.loading = false;
      this.messageService.add({ severity: 'success', summary: 'Exported', detail: 'PDF exported successfully (stub).' });
    }, 900);
  }

  openEmailExportDialog(): void {
    if (!this.canView) return;
    this.selectedRecipients = [];
    this.exportEmailDialogVisible = true;
  }



  // ---------------------------
  //  Delete (FullEdit)
  // ---------------------------
  deleteDashboard(): void {
    if (!this.canDelete) return;

    this.confirmService.confirm({
      message: 'Delete this dashboard permanently?',
      header: 'Delete dashboard',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // TODO: backend delete + navigate back
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Dashboard deleted (stub).' });
      },
    });
  }

  // ---------------------------
  // Menu
  // ---------------------------
  buildActionsMenu(): void {
    this.actionsMenuItems = [
    
      {
        label: 'Share',
        icon: 'pi pi-share-alt',
        // command: () => this.openShareDialog(),
        visible: this.canShare,
      },
      { separator: true },
      {
        label: 'Export PDF',
        icon: 'pi pi-file-pdf',
        command: () => this.exportPdf(),
        visible: this.canView,
      },
      {
        label: 'Export PDF to email',
        icon: 'pi pi-envelope',
        command: () => this.openEmailExportDialog(),
        visible: this.canView,
      },
      { separator: true },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.deleteDashboard(),
        visible: this.canDelete,
      },
    ];
  }

  // ---------------------------
  // UI helpers
  // ---------------------------
  onAvatarErr(evt: Event): void {
    (evt.target as HTMLImageElement).src = this.defaultAvatar;
  }

  permissionLabel(flag: DashboardPermissionFlags): string {
    if (flag === DashboardPermissionFlags.FullEdit) return 'Full Edit';
    if (flag === DashboardPermissionFlags.Edit) return 'Edit';
    return 'View';
  }


// template compatibility (mode buttons)
enterEdit(): void {
  this.enterEditMode();
}

exitEdit(): void {
  this.cancelEditMode();
}

saveLayout(): void {
  this.saveDashboard();
}


pendingWidgetKind: any = 'line';


// removeWidget(widgetId: number): void {
//   if (this.mode !== 'edit' || !this.canEdit) return;

//   this.dashboard.widgets = this.dashboard.widgets.filter(w => w.id !== widgetId);
//   this.markDirty();
// }

private triggerChartsResize(): void {
  requestAnimationFrame(() => {
    window.dispatchEvent(new Event('resize'));
  });

  
}

private getLayoutForApi() {
  return this.page.widgets.map(w => ({
    id: w.id,
    title: w.title,
    kind: w.kind,
    config: w.config,
    grid: {
      x: w.gridInformation.x,
      y: w.gridInformation.y,
      cols: w.gridInformation.cols,
      rows: w.gridInformation.rows
    }
  }));
}


gridInfo: GridsterItem = {
  cols: 6,
  rows: 4,
  x: 0,
  y: 9999,
  minItemCols: 4,
  minItemRows: 3,
  maxItemCols: 12,
  maxItemRows: 10
};

private toggleGridsterEditing(enabled: boolean): void {
  // `options` is one GridsterConfig per dashboard page.
  // Update every page instead of treating the array as one config object.
  (this.options ?? []).forEach((option: GridsterConfig) => {
    option.draggable = option.draggable ?? {};
    option.resizable = option.resizable ?? {};

    option.draggable.enabled = enabled;
    option.resizable.enabled = enabled;

    option.api?.optionsChanged?.();
  });
}

// -------------------------
// Widgets CRUD
// -------------------------
removeItem(gridInfo: GridsterItem): void {
  // if (!this.editModeEnabled) return;
  this.page.widgets = this.page.widgets.filter(w => w.gridInformation !== gridInfo);
}

openWidgetPicker(): void {
  // if (!this.canEdit || this.mode !== 'edit') return;
  // this.widgetPicker.show();
}

onWidgetKindPicked(kind: any): void {
  // 1) open config modal after picking kind
 
  // this.widgetModal.setKind(kind);
  // this.widgetModal.show();
}


onWidgetCreate(cfg: any): void {
  const id = Date.now();

  const gridInfo: GridsterItem = {
    cols: 6,
    rows: 4,
    x: 0,
    y: 0,                
    minItemCols: 3,
    minItemRows: 2
  };


  this.page.widgets = [
    ...this.page.widgets,
    {
      id,
      title: cfg.chartType === 'calculation' ? 'New KPI' : `New ${cfg.chartType} chart`,
      kind: cfg.chartType,
      config: cfg,
      gridInformation: gridInfo,
    }
  ];

  // Place it in the first empty position of the active page.
  setTimeout(() => {
    const option = this.getActiveGridsterOptions();

    option?.api?.getNextPossiblePosition?.(gridInfo);
    option?.api?.optionsChanged?.();

    this.triggerChartsResize();
  }, 0);

  this.markDirty();
}

private seedWidgets(): void {
  this.page.widgets = [
    {
      id: 1,
      title: 'Orders',
      kind: 'line',
      config: null,
      component: null,
      gridInformation: { cols: 6, rows: 3, x: 0, y: 0 },
    },
    {
      id: 2,
      title: 'Top Products',
      kind: 'bar',
      config: null,
      component: null,
      gridInformation: { cols: 6, rows: 3, x: 6, y: 0 },
    },
  ];
}



private buildGridsterOptions(): void {
  // `options` is an array because the template uses options[i]
  // for each dashboard page/tab.
  const pageCount = Math.max(
    this.userDashboard?.pages?.length ?? 0,
    1
  );

  this.options = Array.from(
    { length: pageCount },
    () => this.createGridsterOptions()
  );
}

private getActiveGridsterOptions(): GridsterConfig | undefined {
  if (!this.options?.length) {
    return undefined;
  }

  const pageIndex =
    this.userDashboard?.pages?.findIndex(
      page => page.id === this.selectedPageId
    ) ?? -1;

  return this.options[pageIndex >= 0 ? pageIndex : 0];
}


refreshWidget(widget: any) {

  this.triggerChartsResize();
}

duplicateWidget(widget: any) {
 
}
openMenuId: string | null = null;

toggleMenu(widgetId: string, event: MouseEvent) {
  event.stopPropagation();

  if (this.openMenuId === widgetId) {
    this.openMenuId = null;
  } else {
    this.openMenuId = widgetId;
  }
}










    private loadDashboardWidgetsFromLocalStorage(): void {

        let savedWidgets: any[] = [];

        try {

            savedWidgets =
                JSON.parse(
                    localStorage.getItem(
                        'dashboardPivotWidgets'
                    ) || '[]'
                );

        } catch (error) {

            console.error(
                'Unable to parse dashboardPivotWidgets:',
                error
            );

            savedWidgets = [];
        }


        console.log(
            'Saved dashboard widgets:',
            savedWidgets
        );


        const page1: DashboardPage = {

            id: 1,

            name: 'Analytics',

            widgets:
                savedWidgets.map(
                    (savedWidget: any, index: number) =>
                        this.mapSavedWidgetToDashboardWidget(
                            savedWidget,
                            index
                        )
                )
        };


        this.userDashboard = {

            pages: [
                page1
            ]
        };


        this.selectedPageId =
            page1.id;


        this.prepareDashboardWidgets();


        this.options = [

            this.createGridsterOptions()

        ];


        // Load the first dashboard page immediately.
        // Each widget will then read its source Spreadsheet
        // from localStorage by sourceSpreadsheetId.
        this.loadPageWidgets(
            page1
        );
    }


    // =====================================================
    // MAP SAVED WIDGET -> DASHBOARD WIDGET
    // =====================================================

    private mapSavedWidgetToDashboardWidget(
        savedWidget: any,
        index: number
    ): DashboardPivotWidget {

        return {

            id:
                Number(
                    savedWidget?.id
                ),

            name:
                savedWidget?.name ??
                'Pivot Chart',

            widgetType:
                'PivotChart',

            sourceSpreadsheetId:
                savedWidget
                    ?.sourceSpreadsheetId != null
                    ? Number(
                        savedWidget.sourceSpreadsheetId
                    )
                    : undefined,

            sourceSheetName:
                savedWidget?.sourceSheetName ??
                this.getSourceSheetName(
                    savedWidget
                ),

            gridInformation:
                savedWidget?.gridInformation ??
                this.getDefaultWidgetPosition(
                    index
                ),

            pivot: {

                rows:
                    this.cloneArray(
                        savedWidget
                            ?.pivot
                            ?.rows
                    ),

                columns:
                    this.cloneArray(
                        savedWidget
                            ?.pivot
                            ?.columns
                    ),

                values:
                    this.cloneArray(
                        savedWidget
                            ?.pivot
                            ?.values
                    ),

                filters:
                    this.cloneArray(
                        savedWidget
                            ?.pivot
                            ?.filters
                    ),

                filterSettings:
                    this.cloneArray(
                        savedWidget
                            ?.pivot
                            ?.filterSettings
                    ),

                sortSettings:
                    this.cloneArray(
                        savedWidget
                            ?.pivot
                            ?.sortSettings
                    )
            },

            chart: {

                type:
                    savedWidget
                        ?.chart
                        ?.type ??
                    'Column',

                title:
                    savedWidget
                        ?.chart
                        ?.title ??
                    savedWidget?.name ??
                    'Pivot Chart',

                enableMultipleAxis:
                    savedWidget
                        ?.chart
                        ?.enableMultipleAxis ??
                    false
            },

            data: [],

            loaded: false,

            loading: false,

            refreshing: false,

            loadError: ''
        };
    }


    private cloneArray(
        value: any
    ): any[] {

        if (!Array.isArray(value)) {
            return [];
        }

        return JSON.parse(
            JSON.stringify(value)
        );
    }


    // =====================================================
    // SOURCE SHEET NAME
    // =====================================================

    private getSourceSheetName(
        savedWidget: any
    ): string {

        // Save sourceSheetName directly in future widget JSON.
        // For the current POC, dataSourceType is the source sheet name.
        return (
            savedWidget?.sourceSheetName ??
            savedWidget?.dataSourceType ??
            'Transactions'
        );
    }


    // =====================================================
    // DEFAULT GRIDSTER POSITION
    // =====================================================

    private getDefaultWidgetPosition(
        index: number
    ): GridsterItem {

        const column =
            index % 2;

        const row =
            Math.floor(
                index / 2
            );


        return {

            x:
                column * 6,

            y:
                row * 4,

            cols: 6,

            rows: 4,

            minItemCols: 3,

            minItemRows: 3

        } as GridsterItem;
    }


    // =====================================================
    // PREPARE ALL PIVOT WIDGETS
    // =====================================================

private prepareDashboardWidgets(): void {

    this.userDashboard?.pages?.forEach(page => {

        page.widgets?.forEach(widget => {

            widget.loaded = false;
            widget.loading = false;

        });

    });
}


    // =====================================================
    // PREPARE SINGLE PIVOT
    // =====================================================

private preparePivotWidget(
    widget: DashboardPivotWidget
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
            widget.pivot.filterSettings ?? [],

        sortSettings:
            widget.pivot.sortSettings ?? [],

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
            widget.chart?.type ??
            'Column'
    },

    title:
        widget.chart?.title ??
        widget.name,

    enableMultipleAxis:
        widget.chart
            ?.enableMultipleAxis ??
        false
};
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

    const widget =
        this.findWidgetByGridItem(item);

    if (!widget) {
        return;
    }

    setTimeout(() => {

        const pivot =
            this.findPivotComponent(
                widget.id
            );

        if (!pivot) {
            return;
        }

        const pivotAny =
            pivot as any;

        // Recalculate PivotView dimensions
        if (
            typeof pivotAny.dataBind ===
            'function'
        ) {
            pivotAny.dataBind();
        }

        // Recalculate internal chart dimensions
        if (pivotAny.chart) {

            pivotAny.chart.width =
                '100%';

            pivotAny.chart.height =
                '100%';

            if (
                typeof pivotAny.chart.refresh ===
                'function'
            ) {
                pivotAny.chart.refresh();
            }
        }

    }, 50);
}

private findWidgetByGridItem(
    item: GridsterItem
): DashboardPivotWidget | undefined {

    for (
        const page of
        this.userDashboard?.pages ?? []
    ) {

        const widget =
            page.widgets?.find(
                w =>
                    w.gridInformation ===
                    item
            );

        if (widget) {
            return widget;
        }
    }

    return undefined;
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

        const widget =
            this.findDashboardWidget(
                widgetId
            );

        if (!widget) {

            console.warn(
                'Widget not found:',
                widgetId
            );

            return;
        }


        const pivot =
            this.findPivotComponent(
                widgetId
            );


        if (!pivot) {

            console.warn(
                'Pivot component not found:',
                widgetId
            );

            return;
        }


        // PivotView internally creates the
        // actual EJ2 Chart instance here.
        const chart =
            (pivot as any).chart;


        if (!chart) {

            console.warn(
                'Chart instance not ready:',
                widgetId
            );

            return;
        }


        console.log(
            'Attaching chart click:',
            widgetId,
            chart
        );


        // IMPORTANT:
        // Attach directly to EJ2 Chart,
        // NOT chartSettings.
        chart.pointClick =
            (args: any) => {

                this.onDashboardChartPointClick(
                    widget,
                    args
                );
            };


        if (
            typeof chart.dataBind ===
            'function'
        ) {
            chart.dataBind();
        }


        this.refreshDashboardPivotCharts();

    }, 300);
}

private findDashboardWidget(
    widgetId: number
): DashboardPivotWidget | null {

    for (
        const page of
        this.userDashboard?.pages ?? []
    ) {

        const widget =
            page.widgets?.find(
                item =>
                    item.id === widgetId
            );

        if (widget) {
            return widget;
        }
    }

    return null;
}
private findPivotComponent(
    widgetId: number
): PivotViewComponent | null {

    if (!this.pivotCharts) {
        return null;
    }

    const expectedId =
        `pivotDashboardChart_${widgetId}`;

    const pivot =
        this.pivotCharts
            .find(
                (item: any) =>
                    item?.element?.id ===
                    expectedId
            );

    return pivot ?? null;
}


    // =====================================================
    // TABS
    // =====================================================

  selectPageTab(pageId: number): void {

    this.selectedPageId = pageId;

    const page =
        this.userDashboard?.pages?.find(
            x => x.id === pageId
        );

    if (!page) {
        return;
    }

    this.loadPageWidgets(page);
}

private loadPageWidgets(
    page: DashboardPage
): void {

    page.widgets.forEach(widget => {

        if (widget.loaded) {
            return;
        }

        this.loadWidget(widget);

    });
}

private loadWidget(
    widget: DashboardPivotWidget
): void {

    widget.loading = true;
    widget.loadError = '';
    widget.refreshing = false;

    const records =
        this.getWidgetSpreadsheetData(
            widget
        );

    console.log(
        'Dashboard widget source:',
        {
            widgetId: widget.id,
            sourceSpreadsheetId:
                widget.sourceSpreadsheetId,
            sourceSheetName:
                widget.sourceSheetName,
            records: records
        }
    );

    if (!records.length) {

        widget.data = [];
        widget.loaded = false;
        widget.loading = false;
        widget.loadError =
            'Spreadsheet data not found. ' +
            `Spreadsheet ID: ${widget.sourceSpreadsheetId}`;

        return;
    }

    widget.data = records;

    this.preparePivotWidget(
        widget
    );

    widget.loaded = true;
    widget.loading = false;
    widget.loadError = '';
    widget.lastRefreshedAt =
        new Date().toISOString();

    setTimeout(() => {

        this.refreshDashboardPivotCharts();

    }, 200);
}


    // =====================================================
    // SAVED SPREADSHEET DATA - POC
    // =====================================================

    private getSavedSpreadsheet(
        spreadsheetId?: number
    ): any | null {

        if (spreadsheetId == null) {

            console.warn(
                'Widget has no sourceSpreadsheetId'
            );

            return null;
        }

        const requiredId = Number(spreadsheetId);

        console.log(
            'Searching Spreadsheet:',
            requiredId
        );

        // ==========================================
        // 1. savedSpreadsheets ARRAY
        // ==========================================

        try {

            const raw =
                localStorage.getItem(
                    'savedSpreadsheets'
                );

            console.log(
                'savedSpreadsheets raw:',
                raw
            );

            if (raw) {

                const savedSpreadsheets =
                    JSON.parse(raw);

                if (
                    Array.isArray(
                        savedSpreadsheets
                    )
                ) {

                    const found =
                        savedSpreadsheets.find(
                            (item: any) =>
                                Number(item?.id) ===
                                requiredId
                        );

                    if (found) {

                        console.log(
                            'Spreadsheet found in savedSpreadsheets:',
                            found
                        );

                        return found;
                    }
                }
            }

        } catch (error) {

            console.error(
                'Error reading savedSpreadsheets:',
                error
            );
        }

        // ==========================================
        // 2. SEARCH INDIVIDUAL LOCAL STORAGE ITEMS
        // ==========================================

        for (
            let i = 0;
            i < localStorage.length;
            i++
        ) {

            const key =
                localStorage.key(i);

            if (!key) {
                continue;
            }

            try {

                const rawValue =
                    localStorage.getItem(
                        key
                    );

                if (!rawValue) {
                    continue;
                }

                const parsed =
                    JSON.parse(
                        rawValue
                    );

                // Direct object
                if (
                    parsed &&
                    !Array.isArray(parsed) &&
                    Number(parsed?.id) ===
                        requiredId
                ) {

                    console.log(
                        'Spreadsheet found in localStorage key:',
                        key,
                        parsed
                    );

                    return parsed;
                }

                // Array
                if (
                    Array.isArray(parsed)
                ) {

                    const found =
                        parsed.find(
                            (item: any) =>
                                Number(item?.id) ===
                                requiredId
                        );

                    if (found) {

                        console.log(
                            'Spreadsheet found inside key:',
                            key,
                            found
                        );

                        return found;
                    }
                }

            } catch {
                // Ignore normal string localStorage values.
            }
        }

        console.warn(
            'Spreadsheet NOT found:',
            requiredId
        );

        return null;
    }


    private getWidgetSpreadsheetData(
        widget: DashboardPivotWidget
    ): any[] {

        const spreadsheet =
            this.getSavedSpreadsheet(
                widget.sourceSpreadsheetId
            );

        if (!spreadsheet) {
            return [];
        }

        const sheetName =
            widget.sourceSheetName ??
            'Transactions';

        /*
         * IMPORTANT:
         * Dashboard load should show the latest SAVED Spreadsheet state.
         * Therefore read the saved Workbook first. If the user edited a
         * cell and clicked Save, the chart reflects that edit when the
         * Dashboard is opened again.
         */
        const workbookRows =
            this.getSpreadsheetSheetData(
                spreadsheet,
                sheetName
            );

        if (workbookRows.length) {
            return workbookRows;
        }

        // Fallback for Spreadsheet saves that also persist raw source rows.
        if (
            Array.isArray(
                spreadsheet.sourceRows
            ) &&
            spreadsheet.sourceRows.length
        ) {
            return spreadsheet.sourceRows.map(
                (row: any) => ({ ...row })
            );
        }

        if (
            Array.isArray(
                spreadsheet.spreadsheetRows
            ) &&
            spreadsheet.spreadsheetRows.length
        ) {
            return spreadsheet.spreadsheetRows.map(
                (row: any) => ({ ...row })
            );
        }

        return [];
    }


    private getSpreadsheetSheetData(
        spreadsheet: any,
        sheetName: string
    ): any[] {

        const workbook =
            spreadsheet
                ?.workbookJson
                ?.jsonObject
                ?.Workbook ??
            spreadsheet
                ?.workbookJson
                ?.Workbook;


        if (!workbook?.sheets?.length) {

            console.warn(
                'Workbook sheets not found.'
            );

            return [];
        }


        const sheet =
            workbook.sheets.find(
                (item: any) =>
                    item?.name ===
                    sheetName
            ) ??
            workbook.sheets[0];


        if (!sheet) {

            console.warn(
                'Spreadsheet source sheet not found:',
                sheetName
            );

            return [];
        }


        const rows =
            sheet.rows ?? [];


        if (!rows.length) {
            return [];
        }


        const lastColumnIndex =
            sheet.usedRange?.colIndex ??
            Math.max(
                (rows[0]?.cells?.length ?? 1) - 1,
                0
            );


        const headers: string[] = [];


        for (
            let columnIndex = 0;
            columnIndex <= lastColumnIndex;
            columnIndex++
        ) {

            const cell =
                rows[0]
                    ?.cells
                    ?.[columnIndex];

            const value =
                cell?.value ??
                cell?.formattedText ??
                '';

            headers[columnIndex] =
                String(value).trim();
        }


        const lastRowIndex =
            Math.min(
                sheet.usedRange?.rowIndex ??
                    rows.length - 1,
                rows.length - 1
            );


        const result: any[] = [];


        for (
            let rowIndex = 1;
            rowIndex <= lastRowIndex;
            rowIndex++
        ) {

            const spreadsheetRow =
                rows[rowIndex];


            if (!spreadsheetRow) {
                continue;
            }


            const record: any = {};
            let hasData = false;


            for (
                let columnIndex = 0;
                columnIndex <= lastColumnIndex;
                columnIndex++
            ) {

                const header =
                    headers[columnIndex];


                if (!header) {
                    continue;
                }


                const cell =
                    spreadsheetRow
                        ?.cells
                        ?.[columnIndex];


                const value =
                    cell?.value ??
                    cell?.formattedText ??
                    '';


                record[header] =
                    value;


                if (
                    value !== '' &&
                    value !== null &&
                    value !== undefined
                ) {
                    hasData = true;
                }
            }


            if (hasData) {
                result.push(record);
            }
        }


        console.log(
            'Dashboard Spreadsheet headers:',
            headers
        );

        console.log(
            'Dashboard Spreadsheet records:',
            result
        );


        return result;
    }


    // =====================================================
    // REFRESH ONE DASHBOARD CHART
    // =====================================================

    refreshDashboardWidget(
        widget: DashboardPivotWidget
    ): void {

        if (
            !widget ||
            widget.refreshing
        ) {
            return;
        }

        const spreadsheet =
            this.getSavedSpreadsheet(
                widget.sourceSpreadsheetId
            );

        if (!spreadsheet) {
            widget.loadError =
                'Source Spreadsheet was not found.';
            return;
        }

        const source =
            spreadsheet?.dataSource;

        if (!source) {
            widget.loadError =
                'Spreadsheet source configuration was not found.';
            return;
        }

        widget.refreshing = true;
        widget.loadError = '';

        console.log(
            'Refreshing Dashboard widget from backend source:',
            {
                widgetId: widget.id,
                spreadsheetId:
                    widget.sourceSpreadsheetId,
                source: source
            }
        );

        this.getTransactionsForDashboardRefresh(
            source.filters ?? {}
        )
            .subscribe({

                next: (result: any) => {

                    let transactions =
                        result?.items ?? [];

                    /*
                     * SelectedRecords:
                     * current GetAll has no IDs parameter, so POC loads
                     * the saved source set and keeps only original IDs.
                     * Replace this with a BE IDs parameter later.
                     */
                    if (
                        source.mode ===
                            'SelectedRecords' &&
                        source.selectedIds?.length
                    ) {

                        const selectedIds =
                            new Set(
                                source.selectedIds.map(
                                    (id: any) =>
                                        Number(id)
                                )
                            );

                        transactions =
                            transactions.filter(
                                (record: any) =>
                                    selectedIds.has(
                                        Number(
                                            record?.id
                                        )
                                    )
                            );
                    }

                    const latestRows =
                        transactions.map(
                            (record: any) =>
                                this.mapTransactionToDashboardRow(
                                    record
                                )
                        );

                    if (!latestRows.length) {

                        widget.loadError =
                            'No transactions were returned by the source refresh.';

                        widget.refreshing = false;
                        return;
                    }

                    /*
                     * Refresh means "latest business data".
                     * Persist it back into the saved Spreadsheet source sheet
                     * so the next Dashboard/Spreadsheet open sees the refreshed
                     * snapshot too.
                     */
                    this.persistRefreshedSpreadsheetData(
                        spreadsheet,
                        latestRows,
                        widget.sourceSheetName ??
                            'Transactions'
                    );

                    widget.data =
                        latestRows;

                    this.preparePivotWidget(
                        widget
                    );

                    const pivot =
                        this.findPivotComponent(
                            widget.id
                        );

                    if (pivot) {

                        const pivotAny =
                            pivot as any;

                        pivotAny.dataSourceSettings =
                            widget.dataSourceSettings;

                        pivotAny.chartSettings =
                            widget.chartSettings;

                        if (
                            typeof pivotAny.dataBind ===
                            'function'
                        ) {
                            pivotAny.dataBind();
                        }

                        if (
                            typeof pivotAny.refresh ===
                            'function'
                        ) {
                            pivotAny.refresh();
                        }
                    }

                    widget.lastRefreshedAt =
                        new Date().toISOString();

                    widget.loadError = '';

                    setTimeout(() => {

                        this.refreshSingleDashboardChart(
                            widget
                        );

                        widget.refreshing = false;

                    }, 150);
                },

                error: (error: any) => {

                    console.error(
                        'Dashboard widget source refresh failed:',
                        widget.id,
                        error
                    );

                    widget.loadError =
                        'Unable to refresh chart source data.';

                    widget.refreshing = false;
                }
            });
    }


    // =====================================================
    // GET LATEST TRANSACTIONS USING SAVED SPREADSHEET SOURCE
    // =====================================================

    private getTransactionsForDashboardRefresh(
        filters: any
    ) {

        return this._appTransactionServiceProxy
            .getAll(
                false,
                0,
                undefined,

                filters.search,
                filters.codeFilter,
                undefined,

                filters.mainFilterTypeId,

                filters.minCreateDateFilter,
                filters.maxCreateDateFilter,

                filters.minCompleteDateFilter,
                filters.maxCompleteDateFilter,

                filters.sellerNameFilter,
                undefined,

                filters.buyerNameFilter,
                undefined,

                filters.statusFilter == null
                    ? undefined
                    : filters.statusFilter,

                false,
                undefined,
                undefined,

                filters.referenceNumberFilter,

                filters.sorting,

                0,

                this.dashboardRefreshMaxResultCount
            );
    }


    // =====================================================
    // MAP BE TRANSACTION -> SPREADSHEET/PIVOT ROW
    // =====================================================

    private mapTransactionToDashboardRow(
        record: any
    ): any {

        return {
            TransactionNumber:
                record?.code ?? '',

            TransactionType:
                record?.entityObjectTypeCode ===
                'SALESORDER'
                    ? 'Sales Order'
                    : record?.entityObjectTypeCode ===
                        'PURCHASEORDER'
                        ? 'Purchase Order'
                        : record?.entityObjectTypeCode ?? '',

            Seller:
                record?.sellerCompanyName ?? '',

            Buyer:
                record?.buyerCompanyName ?? '',

            Status:
                record?.entityObjectStatusCode ?? '',

            CreatedDate:
                this.formatDashboardDate(
                    record?.creationTime
                ),

            CompleteDate:
                this.formatDashboardDate(
                    record?.completeDate
                ),

            Reference:
                record?.reference ?? '',

            Creator:
                record?.creatorTenantName ?? '',

            Currency:
                record?.currencyCode ?? '',

            Quantity:
                Number(
                    record?.totalQuantity ?? 0
                ),

            Amount:
                Number(
                    record?.totalAmount ?? 0
                )
        };
    }


    private formatDashboardDate(
        value: any
    ): string {

        if (!value) {
            return '';
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return String(value);
        }

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, '0');

        const day =
            String(
                date.getDate()
            ).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }


    // =====================================================
    // PERSIST REFRESHED SOURCE SNAPSHOT
    // =====================================================

    private persistRefreshedSpreadsheetData(
        spreadsheet: any,
        rows: any[],
        sheetName: string
    ): void {

        try {

            const savedSpreadsheets: any[] =
                JSON.parse(
                    localStorage.getItem(
                        'savedSpreadsheets'
                    ) || '[]'
                );

            const index =
                savedSpreadsheets.findIndex(
                    item =>
                        Number(item?.id) ===
                        Number(spreadsheet?.id)
                );

            if (index < 0) {
                return;
            }

            const saved =
                savedSpreadsheets[index];

            saved.sourceRows =
                rows.map(
                    row => ({ ...row })
                );

            saved.recordCount =
                rows.length;

            saved.updatedDate =
                new Date().toISOString();

            /*
             * Keep the persisted Workbook in sync too.
             * This is what the original Spreadsheet screen reopens later.
             * We update only columns that exist in the refreshed BE row, so
             * extra user columns/formulas/styles are preserved.
             */
            this.updateSavedWorkbookSheetRows(
                saved,
                rows,
                sheetName
            );

            /*
             * Save the latest sheet snapshot as well.
             * Dashboard load can use the workbook first, while other screens
             * that still read spreadsheetRows / analysisRows also get the
             * same refreshed values.
             */
            const latestSavedSheetRows =
                this.getSpreadsheetSheetData(
                    saved,
                    sheetName
                );

            saved.spreadsheetRows =
                latestSavedSheetRows.length
                    ? latestSavedSheetRows.map(
                        (row: any) => ({ ...row })
                    )
                    : rows.map(
                        (row: any) => ({ ...row })
                    );

            saved.analysisRows =
                saved.spreadsheetRows.map(
                    (row: any) => ({ ...row })
                );

            localStorage.setItem(
                'savedSpreadsheets',
                JSON.stringify(
                    savedSpreadsheets
                )
            );

            console.log(
                'Saved Spreadsheet refreshed from backend:',
                saved
            );

        } catch (error) {

            console.error(
                'Unable to persist refreshed Spreadsheet data:',
                error
            );
        }
    }


    // =====================================================
    // UPDATE SAVED WORKBOOK RAW SOURCE CELLS
    // =====================================================

    private updateSavedWorkbookSheetRows(
        spreadsheet: any,
        rows: any[],
        sheetName: string
    ): void {

        const workbook =
            spreadsheet
                ?.workbookJson
                ?.jsonObject
                ?.Workbook ??
            spreadsheet
                ?.workbookJson
                ?.Workbook;

        if (!workbook?.sheets?.length) {
            return;
        }

        const sheet =
            workbook.sheets.find(
                (item: any) =>
                    item?.name ===
                    sheetName
            ) ??
            workbook.sheets[0];

        if (!sheet) {
            return;
        }

        if (!Array.isArray(sheet.rows)) {
            sheet.rows = [];
        }

        if (!sheet.rows[0]) {
            sheet.rows[0] = {
                cells: []
            };
        }

        if (!Array.isArray(
            sheet.rows[0].cells
        )) {
            sheet.rows[0].cells = [];
        }

        const headers: string[] = [];

        const lastColumnIndex =
            sheet.usedRange?.colIndex ??
            Math.max(
                sheet.rows[0].cells.length - 1,
                0
            );

        for (
            let columnIndex = 0;
            columnIndex <= lastColumnIndex;
            columnIndex++
        ) {

            const header =
                sheet.rows[0]
                    ?.cells
                    ?.[columnIndex]
                    ?.value;

            headers[columnIndex] =
                header == null
                    ? ''
                    : String(header).trim();
        }

        const oldLastRowIndex =
            sheet.usedRange?.rowIndex ??
            Math.max(
                sheet.rows.length - 1,
                0
            );

        rows.forEach(
            (record: any, rowOffset: number) => {

                const rowIndex =
                    rowOffset + 1;

                if (!sheet.rows[rowIndex]) {
                    sheet.rows[rowIndex] = {
                        cells: []
                    };
                }

                if (!Array.isArray(
                    sheet.rows[rowIndex].cells
                )) {
                    sheet.rows[rowIndex].cells = [];
                }

                headers.forEach(
                    (
                        header: string,
                        columnIndex: number
                    ) => {

                        if (!header) {
                            return;
                        }

                        if (
                            !Object.prototype
                                .hasOwnProperty.call(
                                    record,
                                    header
                                )
                        ) {
                            return;
                        }

                        const existingCell =
                            sheet.rows[rowIndex]
                                .cells[columnIndex] ?? {};

                        sheet.rows[rowIndex]
                            .cells[columnIndex] = {
                                ...existingCell,
                                value:
                                    record[header]
                            };
                    }
                );
            }
        );

        // Clear old raw values when refreshed result becomes smaller.
        for (
            let rowIndex =
                rows.length + 1;
            rowIndex <= oldLastRowIndex;
            rowIndex++
        ) {

            const row =
                sheet.rows[rowIndex];

            if (!row?.cells) {
                continue;
            }

            headers.forEach(
                (
                    header: string,
                    columnIndex: number
                ) => {

                    if (!header) {
                        return;
                    }

                    const existingCell =
                        row.cells[columnIndex];

                    if (!existingCell) {
                        return;
                    }

                    const cleanCell = {
                        ...existingCell
                    };

                    delete cleanCell.value;
                    delete cleanCell.formula;

                    row.cells[columnIndex] =
                        cleanCell;
                }
            );
        }

        sheet.usedRange = {
            ...(sheet.usedRange ?? {}),
            rowIndex:
                rows.length,
            colIndex:
                lastColumnIndex
        };
    }


    private refreshSingleDashboardChart(
        widget: DashboardPivotWidget
    ): void {

        const pivot =
            this.findPivotComponent(
                widget.id
            );


        if (!pivot) {
            return;
        }


        try {

            const pivotAny =
                pivot as any;


            if (
                typeof pivotAny.dataBind ===
                'function'
            ) {
                pivotAny.dataBind();
            }


            if (
                pivotAny.chart &&
                typeof pivotAny.chart.refresh ===
                    'function'
            ) {

                pivotAny.chart.refresh();

            } else if (
                typeof pivotAny.refresh ===
                    'function'
            ) {

                pivotAny.refresh();
            }


            // Re-attach chart point click after refresh.
            const chart =
                pivotAny.chart;


            if (chart) {

                chart.pointClick =
                    (args: any) => {

                        this.onDashboardChartPointClick(
                            widget,
                            args
                        );
                    };


                if (
                    typeof chart.dataBind ===
                    'function'
                ) {
                    chart.dataBind();
                }
            }

        } catch (error) {

            console.error(
                'Unable to refresh Dashboard chart:',
                widget.id,
                error
            );
        }
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



    showChartDetailsDialog = false;

selectedChartTitle = '';

selectedChartDetails: any[] = [];



onDashboardChartPointClick(
    widget: DashboardPivotWidget,
    args: any
): void {

    console.log(
        'Chart point clicked:',
        args
    );

    console.log(
        'Clicked widget:',
        widget
    );

    const point =
        args?.point;

    const series =
        args?.series;

    if (!point) {
        return;
    }


    // Usually category shown on X axis:
    // Seller / Buyer / TransactionType etc.
    const category =
        point.x;


    // Usually chart series:
    // PurchaseOrder / Sales Order etc.
    const seriesName =
        series?.name ??
        point?.series?.name;


    console.log(
        'Category:',
        category
    );

    console.log(
        'Series:',
        seriesName
    );


    this.openWidgetDrillDown(
        widget,
        category,
        seriesName
    );
}


private openWidgetDrillDown(
    widget: DashboardPivotWidget,
    category: any,
    seriesName?: string
): void {

    let records =
        [...(widget.data ?? [])];


    // =====================================
    // ROW FIELD
    // Example:
    // Seller
    // Buyer
    // TransactionType
    // =====================================

    const rowField =
        widget.pivot
            ?.rows?.[0]
            ?.name;


    if (
        rowField &&
        category !== undefined &&
        category !== null
    ) {

        records =
            records.filter(record =>

                String(
                    record[rowField] ?? ''
                ).trim() ===

                String(
                    category ?? ''
                ).trim()
            );
    }


    // =====================================
    // COLUMN FIELD
    // Example:
    // TransactionType
    //
    // Column chart:
    // Seller = FRAME 2
    // Series = Sales Order
    // =====================================

    const columnField =
        widget.pivot
            ?.columns?.[0]
            ?.name;


    if (
        columnField &&
        seriesName
    ) {

        records =
            records.filter(record =>

                String(
                    record[columnField] ?? ''
                ).trim() ===

                String(
                    seriesName ?? ''
                ).trim()
            );
    }


    // =====================================
    // APPLY SAVED PIVOT FILTERS ALSO
    // =====================================

    records =
        this.applyWidgetFilterSettings(
            records,
            widget.pivot
                ?.filterSettings ?? []
        );


    this.selectedChartDetails =
        records;


    this.selectedChartTitle =
        this.buildDrillDownTitle(
            widget,
            category,
            seriesName
        );


    console.log(
        'Drill-down records:',
        records
    );


    this.showChartDetailsDialog =
        true;
}


private applyWidgetFilterSettings(
    records: any[],
    filterSettings: any[]
): any[] {

    let result =
        [...records];


    (filterSettings ?? [])
        .forEach(filter => {

            if (
                !filter?.name ||
                !filter?.items?.length
            ) {
                return;
            }


            const values =
                filter.items.map(
                    item =>
                        String(item)
                            .trim()
                );


            if (
                filter.type ===
                'Include'
            ) {

                result =
                    result.filter(record =>

                        values.includes(
                            String(
                                record[
                                    filter.name
                                ] ?? ''
                            ).trim()
                        )
                    );
            }


            if (
                filter.type ===
                'Exclude'
            ) {

                result =
                    result.filter(record =>

                        !values.includes(
                            String(
                                record[
                                    filter.name
                                ] ?? ''
                            ).trim()
                        )
                    );
            }

        });


    return result;
}


private buildDrillDownTitle(
    widget: DashboardPivotWidget,
    category: any,
    seriesName?: string
): string {

    const parts: string[] = [];

    if (category) {
        parts.push(
            String(category)
        );
    }

    if (seriesName) {
        parts.push(
            String(seriesName)
        );
    }

    return parts.length
        ? `${widget.name} - ${parts.join(' / ')}`
        : widget.name;
}






}