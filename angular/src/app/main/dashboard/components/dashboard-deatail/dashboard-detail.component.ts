import { Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem, MessageService, ConfirmationService } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AppComponentBase } from '@shared/common/app-component-base';
import { WidgetConfigModalComponent } from '@app/main/dashboard/components/widget-config-modal/widget-config-modal.component';
import {
  GridsterConfig,
  GridsterItem,
  GridsterItemComponentInterface,
  GridType,
  DisplayGrid,
} from 'angular-gridster2';
import { AddWidgetPickerComponent } from '../add-widget-picker/add-widget-picker.component';
/** ✅ Permission flags (bitwise) */
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
  providers: [MessageService, ConfirmationService],
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

  options: GridsterConfig;
  page = { widgets: [] as any[] };

  @ViewChild('widgetPicker') widgetPicker!: AddWidgetPickerComponent;
@ViewChild('widgetModal') widgetModal!: WidgetConfigModalComponent;

  constructor(
    injector: Injector,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmService: ConfirmationService,
  ) {
    super(injector);


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
    this.buildGridsterOptions();
    this.seedWidgets();
    this.buildActionsMenu();
    this.loadDashboard(this.dashboardId);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  // ---------------------------
  // ✅ Permissions
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

  // ---------------------------
  // ✅ Load / Mode
  // ---------------------------
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
    this.messageService.add({ severity: 'info', summary: 'Edit mode', detail: 'You are now editing the dashboard.' });
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


removeWidget(widgetId: number): void {
  if (this.mode !== 'edit' || !this.canEdit) return;

  this.dashboard.widgets = this.dashboard.widgets.filter(w => w.id !== widgetId);
  this.markDirty();
}

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
//  gridInfo: GridsterItem = {
//   cols: 6,
//   rows: 4,
//   x: 0,
//   y: 9999,

//   minItemCols: 3,  // min width (in grid columns)
//   minItemRows: 2,  // min height (in grid rows)
//   maxItemCols: 12,
//   maxItemRows: 10
// };

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
private logLayout(): void {
  console.log('DASHBOARD_LAYOUT', JSON.stringify(this.getLayoutForApi(), null, 2));
}
private toggleGridsterEditing(enabled: boolean): void {
  this.options.draggable.enabled = enabled;
  this.options.resizable.enabled = enabled;

  // IMPORTANT: tell gridster to re-render options
  this.options.api?.optionsChanged?.();
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
  this.widgetPicker.show();
}

onWidgetKindPicked(kind: any): void {
  // 1) open config modal after picking kind
 
  this.widgetModal.setKind(kind);
  this.widgetModal.show();
}

// onWidgetCreate(cfg: any): void {
//   const id = Date.now();

//   const gridInfo: GridsterItem = {
//     cols: 6,
//     rows: 4,
//     x: 0,
//     y: 9999,
//     minItemCols: 3,
//     minItemRows: 2
//   };

//   this.page.widgets = [
//     ...this.page.widgets,
//     {
//       id,
//       title: cfg.chartType === 'calculation' ? 'New KPI' : `New ${cfg.chartType} chart`,
//       kind: cfg.chartType,
//       config: cfg,
//       gridInformation: gridInfo,
//     }
//   ];

//   this.markDirty();
//   this.options.api?.optionsChanged?.();
//   setTimeout(() => this.triggerChartsResize(), 0);
// }


// demo seed


onWidgetCreate(cfg: any): void {
  const id = Date.now();

  const gridInfo: GridsterItem = {
    cols: 6,
    rows: 4,
    x: 0,
    y: 0,                 // ✅ start from top
    minItemCols: 3,
    minItemRows: 2
  };

  // ✅ pushItems must be false in options for this to not disturb others
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

  // ✅ place it in first empty position
  setTimeout(() => {
    this.options.api?.getNextPossiblePosition?.(gridInfo);
    this.options.api?.optionsChanged?.();
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

moreThanOnePage(): boolean {
  return false;
}

private buildGridsterOptions(): void {
  // this.options = {
  //   gridType: GridType.Fit,
  //   displayGrid: DisplayGrid.OnDragAndResize,
  //   pushItems: true,
  //   disableScrollHorizontal: true,
  //   disableScrollVertical: true,
  
  //   // ✅ root (NOT inside draggable)
  //   dragHandleClass: 'drag-handle',
  
  //   draggable: {
  //     enabled: false,
  //   },
  
  //   resizable: {
  //     enabled: false,
  //   },
  
  //   resizableHandles: {
  //     s: true, e: true, n: true, w: true,
  //     se: true, ne: true, sw: true, nw: true
  //   },
  
  //   minCols: 12,
  //   maxCols: 12,
  //   minRows: 6,
  //   margin: 12,
  //   outerMargin: true,
  
  //   itemResizeCallback: () => {
  //     this.triggerChartsResize();
  //     this.markDirty();
  //     this.logLayout();
  //   },
  //   itemChangeCallback: () => {
  //     this.triggerChartsResize();
  //     this.markDirty();
  //     this.logLayout();
  //   },
  // };


  this.options = {
    gridType: GridType.ScrollVertical,   // ✅ NOT Fit
    fixedRowHeight: 110,                 // ✅ pick your row height
    fixedColWidth: 90,                   // optional (or let it auto)
    minCols: 12,
    maxCols: 12,
    margin: 12,
    outerMargin: true,
  
    pushItems: false,                    // ✅ important (see fix 2)
    swap: false,                         // optional
  
    draggable: { enabled: false },
    resizable: { enabled: false },
  
    itemResizeCallback: () => this.triggerChartsResize(),
    itemChangeCallback: () => this.triggerChartsResize(),
  };

}
  
}