import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    Injector,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';

import {ActivatedRoute} from '@angular/router';
import {MenuItem, MessageService } from 'primeng/api';
import {AppComponentBase} from '@shared/common/app-component-base';
import {SpreadsheetComponent} from '@syncfusion/ej2-angular-spreadsheet';
import { AppDashboardServiceProxy } from '@shared/service-proxies/service-proxies';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-dashboard-detail',
    templateUrl:'./dashboard-detail.component.html',
    styleUrls: ['./dashboard-detail.component.scss'],
    providers: [MessageService]
})
export class DashboardDetailComponent
    extends AppComponentBase
    implements OnInit, OnDestroy {

    @ViewChild('dashboardSpreadsheet') dashboardSpreadsheet?: SpreadsheetComponent;
    @ViewChild('dashboardExportArea')dashboardExportArea?: ElementRef<HTMLElement>;

exportingPdf = false;

    readonly dashboardSheetName = 'Dashboard';
    dashboardSheets: any[] = [];
    dashboardActiveSheetIndex = 0;


    loading = false;
    refreshing = false;
    dashboardWorkbookReady = false;
    dashboardLoadError = '';

    dashboardId = 1;
    sourceSpreadsheetId: number | null = null;
    dashboard: any
    actionsMenuItems: MenuItem[] = [];

    private savedSheetSources: any[] = [];
private savedAnalyses: any[] = [];
private savedWidgets: any[] = [];

private readonly refreshBatchSize = 500;

    constructor(
        injector: Injector,
        private route: ActivatedRoute,
        private appDashboardService: AppDashboardServiceProxy,
        private cdr: ChangeDetectorRef

    ) {
        super(injector);
    }


    ngOnInit(): void {
        const routeId =Number(this.route.snapshot.paramMap.get('id'));
        if (Number.isFinite(routeId) && routeId > 0) {
            this.dashboardId = routeId;
        }
        this.buildActionsMenu();
        this.loadDashboard();
    }


     loadDashboard(): void {
        if (!this.dashboardId) {
            return;
        }

        this.loading = true;
        this.dashboardWorkbookReady = false;
        this.dashboardLoadError = '';

        this.dashboardSheets = [];
        this.sourceSpreadsheetId = null;

        this.appDashboardService
            .getDashboardForView(this.dashboardId)
            .subscribe({
                next: (result: any) => {
                    try {
                         this.dashboard = result;

                        const saved = this.dashboard?.spreadsheet;

                           if (!saved) {
                            throw new Error(
                                ''
                            );
                        }

                        if (!saved.workbookJson) {
                            throw new Error(
                                'The saved Spreadsheet does not contain workbook data.'
                            );
                        }


                        // =============================================
                        // GET WORKBOOK
                        // =============================================

                        const workbook =
                            this.getWorkbook(
                                saved.workbookJson
                            );

                        if (
                            !workbook ||
                            !Array.isArray(workbook.sheets) ||
                            !workbook.sheets.length
                        ) {
                            throw new Error(
                                'The saved Spreadsheet does not contain any sheets.'
                            );
                        }

                        // =============================================
                        // FIND DASHBOARD
                        // =============================================

                        const dashboardIndex =
                            this.findDashboardSheetIndex(
                                workbook.sheets
                            );

                        if (dashboardIndex < 0) {
                            throw new Error(
                                `Sheet "${this.dashboardSheetName}" was not found.`
                            );
                        }

                        this.dashboardSheets =
                            workbook.sheets.map(
                                (sheet: any, index: number) => ({
                                    ...sheet,

                                    state:
                                        index === dashboardIndex
                                            ? 'Visible'
                                            : 'Hidden'
                                })
                            );

                        this.dashboardActiveSheetIndex =   dashboardIndex;

                        this.sourceSpreadsheetId = null;

                        this.loading = false;
                        this.dashboardWorkbookReady = true;

                        this.cdr.detectChanges();

                    } catch (error) {
                        console.error(
                            '[Dashboard] Load failed:',
                            error
                        );

                        this.dashboardLoadError =
                            error instanceof Error
                                ? error.message
                                : 'Unable to load the dashboard.';

                        this.dashboardWorkbookReady = false;
                        this.loading = false;

                        this.dashboardSheets = [];

                        this.cdr.detectChanges();
                    }
                },

                error: (error: any) => {
                    console.error(
                        '[Dashboard] Dashboard API failed:',
                        error
                    );

                    this.dashboardLoadError =
                        'Unable to load the dashboard.';

                    this.dashboardWorkbookReady = false;
                    this.loading = false;

                    this.dashboardSheets = [];


                    this.cdr.detectChanges();
                }
            });
    }

    onDashboardCreated(): void {
        if (!this.dashboardSpreadsheet) {
            return;
        }
        const sheets =  this.dashboardSpreadsheet.sheets;
        if (!Array.isArray(sheets) || !sheets.length) {
            return;
        }
        const dashboardIndex = this.findDashboardSheetIndex(sheets);
        if (dashboardIndex < 0) {
            this.dashboardLoadError =
                `Sheet "${this.dashboardSheetName}" was not found.`;
            this.cdr.detectChanges();
            return;
        }

        // =============================================
        // VIEW MODE:
        // Dashboard visible, everything else hidden
        // =============================================

        sheets.forEach(
            (sheet: any, index: number) => {
                sheet.state =
                    index === dashboardIndex
                        ? 'Visible'
                        : 'Hidden';
            }
        );

        this.dashboardActiveSheetIndex =  dashboardIndex;

        this.dashboardSpreadsheet.activeSheetIndex =   dashboardIndex;

        setTimeout(() => {
            if (!this.dashboardSpreadsheet) {
                return;
            }

            this.dashboardSpreadsheet.activeSheetIndex =   dashboardIndex;

            this.dashboardSpreadsheet.refresh();
        }, 0);
    }

    private findDashboardSheetIndex(sheets: any[]): number {
        if (!Array.isArray(sheets)) {
            return -1;
        }
        return sheets.findIndex(
            (sheet: any) =>
                String(sheet?.name ?? '').trim().toLowerCase() ===
                this.dashboardSheetName.trim().toLowerCase()
        );

    }

    private async fetchSourceRecords(
    source: any
): Promise<{
    fields: string[];
    records: any[];
}> {

    const tableName =
        source?.sourceKey ?? source?.type;

    if (!tableName) {
        throw new Error('Source table is missing.');
    }

    const fields: string[] = Array.from(
        new Set<string>([
            'Id',
            ...(source?.columns ?? [])
        ])
    );

    const conditions =
        source?.filters?.conditions ?? [];

    const records: any[] = [];

    let skipCount = 0;

    while (true) {

        const result: any = await firstValueFrom(
            this.appDashboardService.getAllTableData(
                this.appSession.tenantId,
                tableName,
                fields,
                conditions,
                undefined,
                undefined,
                'Id',
                skipCount,
                this.refreshBatchSize
            )
        );

        const batch: any[] =
            result?.items ?? [];

        records.push(...batch);

        skipCount += batch.length;

        if (
            batch.length === 0 ||
            batch.length < this.refreshBatchSize ||
            (
                result?.totalCount != null &&
                skipCount >= Number(result.totalCount)
            )
        ) {
            break;
        }
    }

    return {
        fields,
        records
    };
}

private replaceSourceSheetData(
    sheet: any,
    fields: string[],
    records: any[]
): void {

    // Preserve the original columns where possible.
    const existingHeaders: string[] =
        (sheet.rows?.[0]?.cells ?? [])
            .map((cell: any) =>
                String(cell?.value ?? '').trim()
            )
            .filter(Boolean);

    const columns = existingHeaders.length
        ? existingHeaders
        : fields;

    // Keep chart/helper cells outside the source data area.
    const oldRows = sheet.rows ?? [];
    const oldDataColumnCount = columns.length;

    const newRows: any[] = [
        {
            cells: columns.map(field => ({
                value: field
            }))
        }
    ];

    for (const record of records) {

        newRows.push({
            cells: columns.map(field => {

                const key = Object.keys(record).find(
                    name =>
                        name.toLowerCase() ===
                        field.toLowerCase()
                );

                return {
                    value: key
                        ? record[key] ?? ''
                        : ''
                };
            })
        });
    }

    // Preserve cells beyond the data columns,
    // including existing chart helper ranges.
    const maxRows = Math.max(
        oldRows.length,
        newRows.length
    );

    const mergedRows: any[] = [];

    for (let r = 0; r < maxRows; r++) {

        const oldCells =
            oldRows[r]?.cells ?? [];

        const newCells =
            newRows[r]?.cells ?? [];

        const cells = [...oldCells];

        for (let c = 0; c < oldDataColumnCount; c++) {
            cells[c] = newCells[c] ?? {};
        }

        mergedRows.push({
            ...(oldRows[r] ?? {}),
            cells
        });
    }

    sheet.rows = mergedRows;
}

async refreshDashboard(): Promise<void> {

    if (
        this.refreshing ||
        this.loading ||
        !this.dashboardId
    ) {
        return;
    }

    this.refreshing = true;

    try {

        // 1. Reload saved dashboard.
        const result: any = await firstValueFrom(
            this.appDashboardService.getDashboardForView(
                this.dashboardId
            )
        );

        const dashboard =
            result?.dashboard ?? result;

        const saved =
            typeof dashboard?.spreadsheet === 'string'
                ? JSON.parse(dashboard.spreadsheet)
                : dashboard?.spreadsheet;

        if (!saved?.workbookJson) {
            throw new Error('Dashboard workbook not found.');
        }

        // 2. Restore saved metadata.
        this.savedSheetSources =
            structuredClone(saved.sheetDataSources ?? []);

        this.savedAnalyses =
            structuredClone(saved.sheetAnalyses ?? []);

        this.savedWidgets =
            structuredClone(saved.dashboardWidgets ?? []);

        // 3. Restore workbook.
        const workbook = this.getWorkbook(
            saved.workbookJson
        );

        if (!Array.isArray(workbook?.sheets)) {
            throw new Error('Invalid workbook.');
        }

        // Work on a copy, never mutate the saved object.
        const sheets = structuredClone(workbook.sheets);

        // 4. Fetch updated source records.
        for (const sheetSource of this.savedSheetSources) {

            const sheetName =
                sheetSource?.sheetName;

            const source =
                sheetSource?.source;

            if (!sheetName || !source) {
                continue;
            }

            const sheet = sheets.find(
                (item: any) =>
                    item.name === sheetName
            );

            if (!sheet) {
                console.warn(
                    '[Dashboard Refresh] Missing source sheet:',
                    sheetName
                );
                continue;
            }

            const { fields, records } =
                await this.fetchSourceRecords(source);

            this.replaceSourceSheetData(
                sheet,
                fields,
                records
            );

            console.log(
                `[Dashboard Refresh] ${sheetName}: ${records.length} records`
            );
        }

        // 5. Rebuild derived chart data.
        //
        // This step must run before displaying the
        // refreshed workbook.
        //
        // Recalculate:
        // - Direct chart aggregation helper ranges
        // - Pivot chart result matrices
        // - Dashboard widget source ranges
        //
        // See section 6 below.

        // 6. Find dashboard sheet.
        const dashboardIndex =
            this.findDashboardSheetIndex(sheets);

        if (dashboardIndex < 0) {
            throw new Error('Dashboard sheet not found.');
        }

        // 7. Keep only Dashboard visible.
        const displaySheets = sheets.map(
            (sheet: any, index: number) => ({
                ...sheet,
                state:
                    index === dashboardIndex
                        ? 'Visible'
                        : 'Hidden'
            })
        );

        // 8. Recreate viewer with refreshed data.
        this.dashboardWorkbookReady = false;
        this.cdr.detectChanges();

        this.dashboard = dashboard;
        this.dashboardSheets = displaySheets;
        this.dashboardActiveSheetIndex =
            dashboardIndex;

        this.dashboardLoadError = '';
        this.dashboardWorkbookReady = true;

        this.cdr.detectChanges();

        await new Promise<void>(
            resolve => setTimeout(resolve, 300)
        );

        this.dashboardSpreadsheet?.refresh();

        this.notify.success(
            'Dashboard data refreshed successfully.'
        );

    } catch (error) {

        console.error(
            '[Dashboard] Data refresh failed:',
            error
        );

        this.notify.error(
            'Unable to refresh dashboard data.'
        );

    } finally {

        this.refreshing = false;
        this.cdr.detectChanges();
    }
}
    private getWorkbook(workbookJson: any): any {
        return (workbookJson?.jsonObject?.Workbook ?? workbookJson?.Workbook ?? null);
    }

    private buildActionsMenu(): void {

        this.actionsMenuItems = [

            {
                label:
                    'Refresh',

                icon:
                    'pi pi-refresh',

                command:
                    () =>
                        this.refreshDashboard()
            }

        ];

    }


    exportDashboardPdf(){

    }
    ngOnDestroy(): void {
        this.dashboardSheets = [];

    }
}