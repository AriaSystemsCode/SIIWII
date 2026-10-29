import { ChangeDetectorRef, Component, EventEmitter, Injector, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import * as moment from 'moment';

import { SpreadsheetComponent as SyncfusionSpreadsheetComponent, SheetModel } from '@syncfusion/ej2-angular-spreadsheet';

import {
    CalculatedFieldService,
    DisplayOption,
    FieldListService,
    GroupingBarService,
    IDataSet,
    PivotChartService,
    PivotFieldListComponent,
    ToolbarService
} from '@syncfusion/ej2-angular-pivotview';

import { AppDashboardServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

import {
    ChartAggregation,
    DashboardWidgetMetadata,
    SavedSheetAnalysis,
    SpreadsheetDataBatch,
    SpreadsheetDataSource,
    SpreadsheetSheetDataSource
} from '../../models/dashboard.model';

import {
    DASHBOARD_SHEET,
    ParsedRange,
    clone,
    getChartReferencedSheetNames,
    readPixelValue,
    text,
    toColumnName,
    yieldToBrowser
} from '../../models/spreadsheet.model';

import { DrilldownService } from '../../services/drilldown.service';
import { SpreadsheetPayload, SpreadsheetRefreshService } from '../../services/spreadsheet-refresh.service';
import {
    buildFieldMapping,
    buildPivotSettings,
    getSheetCharts,
    getValueIgnoreCase,
    getWorkbookRoot,
    matchPivotChart,
    parseRange,
    pivotValuesToMatrix,
    quoteSheetName,
    removeSheetFromRange
} from '../../models/spreadsheet.utils';

import { HttpClient } from '@angular/common/http';
import { L10n, setCulture } from '@syncfusion/ej2-base';
import { AppConsts } from '@shared/AppConsts';

@Component({
    selector: 'app-create-or-edit-spreadsheet',
    templateUrl: './create-or-edit-spreadsheet.component.html',
    styleUrls: ['./create-or-edit-spreadsheet.component.scss'],
    providers: [FieldListService, GroupingBarService, PivotChartService, ToolbarService, CalculatedFieldService]
})
export class CreateOrEditSpreadsheetComponent extends AppComponentBase implements OnInit, OnDestroy {

    @ViewChild('spreadsheet') spreadsheet?: SyncfusionSpreadsheetComponent;
    @ViewChild('pivotView') pivotView: any;
    @ViewChild('pivotFieldList') pivotFieldList?: PivotFieldListComponent;


    dashboardId: number | null = null;
    dashboardTtle = '';
    isDirty = false;
    private ignoreSpreadsheetChanges = true;

    // ---- Spreadsheet ----
    sheets: SheetModel[] = [];
    readonly scrollSettings: any = { enableVirtualization: true, isFinite: false };
    readonly showAggregate = false;
    private readonly saveOptions: any = { ignoreImage: false, ignoreNote: false };
    spreadsheetUpdatedDate: string | null = null;

    // ---- Loading bar ----
    isLoading = false;
    loadingProgress = 0;
    loadingMessage = '';
    isRefreshing = false;

    // ---- Metadata saved with the workbook ----
    sheetSources: SpreadsheetSheetDataSource[] = [];
    analyses: SavedSheetAnalysis[] = [];
    widgets: DashboardWidgetMetadata[] = [];
    private sheetRecordIds: Record<string, any[]> = {};

    private sheetWatcher: any = null;
    private dashboardPromise: Promise<any> | null = null;

    // ---- "Add data" panel ----
    showDataPanel = false;
    editingSheetName: string | null = null;
    dataPanelTargetSheetName = '';
    dataPanelTargetHasData = false;
    private newDataSheetName: string | null = null;
    private newDataSheetLoadedRows = 0;
    private newDataSheetFields: string[] = [];
    private dataBatchQueue: Promise<void> = Promise.resolve();
    private dataBatchFailed = false;

    // ---- Pivot ----
    showPivot = false;
    pivotSheet: string | null = null;   // name of the Pivot tab
    sourceSheet: string | null = null;  // name of the data tab the Pivot reads
    private isCreatingPivot = false;
    private isSyncingPivotDashboard = false;
    private pivotSyncTimer: any = null;

    pivotToolbar: any[] = ['Chart'];
    pivotDisplay = { view: 'Both', primary: 'Table' } as DisplayOption;
    pivotChart: any = {
        chartSeries: { type: 'Column' },
        height: '280',
        title: 'Pivot Chart',
        enableMultipleAxis: false
    };
    pivotSettings: any = {
        dataSource: [],
        rows: [],
        columns: [],
        values: [],
        filters: [],
        enableSorting: true,
        allowLabelFilter: true,
        allowValueFilter: true
    };
    pivotChartTypes = ['Column', 'Bar', 'Area', 'Pie', 'Doughnut', 'Line', 'Scatter'].map(t => ({ label: t, value: t }));
    selectedPivotChartType = 'Column';

    // ---- Chart panel ----
    showChartPanel = false;
    selectedChart: any = null;
    chartSheet: string | null = null;
    chartRange = '';
    categoryRange = '';
    seriesRanges: Array<{ range: string }> = [];
    isApplyingChart = false;
    chartAggregation: ChartAggregation = 'None';
    chartAggregationOptions = [
    { label: this.l('NoAggregation'), value: 'None' },
    { label: this.l('Sum'), value: 'Sum' },
    { label: this.l('Count'), value: 'Count' },
    { label: this.l('Average'), value: 'Average' },
    { label: this.l('Minimum'), value: 'Min' },
    { label: this.l('Maximum'), value: 'Max' }
];

    // ---- Drilldown (Ctrl + click on a chart point) ----
    drilldownVisible = false;
    drilldownTitle = '';
    drilldownRecords: any[] = [];

    // ---- Ribbon ----
    private listRibbonObserver: MutationObserver | null = null;
    private lastListRibbonLabel = '';

    spreadsheetSaveUrl = AppConsts.attachmentBaseUrl + '/api/Spreadsheet/Save';

    lastRefreshDate: string | null = null;
    refreshedBy: string | null = null;

    syncfusionLocale = 'en';
syncfusionRtl = false;
syncfusionLocaleReady = false;

isArLang:boolean=false
currentLang:string=''

spreadsheetNotFound = false;
spreadsheetLoading = false;


    constructor(
        injector: Injector,
        private route: ActivatedRoute,
        private dashboardService: AppDashboardServiceProxy,
        private refreshService: SpreadsheetRefreshService,
        private drilldown: DrilldownService,
            private http: HttpClient,
        private cdr: ChangeDetectorRef
    ) {
        super(injector);

                  this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
        this.currentLang == 'ar' || this.currentLang == 'ar-EG'  ? this.isArLang = true : this.isArLang = false
    }

    // =====================================================
    // SMALL HELPERS
    // =====================================================

    /** Untyped access to Syncfusion APIs missing from the typings. */

    

private async initializeSyncfusionLocale(): Promise<void> {
    this.syncfusionLocaleReady = false;

    const language =
        abp.utils.getCookieValue('Abp.Localization.CultureName') ||
        abp.localization.currentLanguage?.name ||
        'en';

    const isArabic = language.toLowerCase().startsWith('ar');

    this.isArLang = isArabic;
    this.syncfusionRtl = isArabic;

    if (isArabic) {
        try {
            const translations = await firstValueFrom(
                this.http.get<any>('assets/syncfusion/ar.json')
            );

            L10n.load(
                translations.ar
                    ? translations
                    : { ar: translations }
            );

            setCulture('ar');
            this.syncfusionLocale = 'ar';

            console.log('[Syncfusion] Arabic localization loaded');
        } catch (error) {
            console.error(
                '[Syncfusion] Arabic localization failed:',
                error
            );

            this.syncfusionLocale = 'en';
            setCulture('en');
        }
    } else {
        setCulture('en');
        this.syncfusionLocale = 'en';
    }

    this.pivotChartTypes = [
        'Column',
        'Bar',
        'Area',
        'Pie',
        'Doughnut',
        'Line',
        'Scatter'
    ].map(type => ({
        label: this.l(type),
        value: type
    }));

    this.syncfusionLocaleReady = true;
    this.cdr.detectChanges();
}


    private get grid(): any {
        return this.spreadsheet as any;
    }

    private get allSheets(): any[] {
        return this.grid?.sheets ?? [];
    }

    private get activeSheet(): any {
        return this.grid?.getActiveSheet?.();
    }

    private get activeSheetName(): string {
        return text(this.activeSheet?.name);
    }

    get activeSheetSource(): SpreadsheetSheetDataSource | null {
        return this.sheetSources.find(i => i.sheetName === this.activeSheetName) ?? null;
    }

    get editingSheetSource(): SpreadsheetSheetDataSource | null {
        return this.editingSheetName
            ? this.sheetSources.find(s => s.sheetName === this.editingSheetName) ?? null
            : null;
    }

    private findSheet(name: string): any {
        return this.allSheets.find((s: any) => s?.name === name);
    }

    private isDashboard(sheet: any): boolean {
        return text(sheet?.name).trim().toLowerCase() === DASHBOARD_SHEET.toLowerCase();
    }

    private sheetHasExistingData(sheetName: string): boolean {
        const sheet = this.findSheet(sheetName);

        if (!sheet) {
            return false;
        }

        const hasCellData = (sheet.rows ?? []).some((row: any) =>
            (row?.cells ?? []).some(
                (cell: any) =>
                    (cell?.value !== null && cell?.value !== undefined && cell?.value !== '') || !!cell?.formula
            )
        );

        return hasCellData || this.sheetSources.some(source => source.sheetName === sheetName);
    }

    private setDefaultColumnWidth(sheetName: string, width = 140): void {
        const sheet = this.findSheet(sheetName);

        if (!sheet) {
            return;
        }

        const count = Math.max(20, sheet.colCount ?? 20);
        sheet.columns = sheet.columns ?? [];

        for (let i = 0; i < count; i++) {
            sheet.columns[i] = { ...(sheet.columns[i] ?? {}), width };
        }

        this.grid.setColWidth?.(width, 0, count - 1, this.allSheets.indexOf(sheet));
        this.resizeLater(50);
    }

    private resizeLater(delay = 0): void {
        setTimeout(() => {
            try {
                this.spreadsheet?.resize();
            } catch (error) {
                console.error('Spreadsheet resize failed:', error);
            }
        }, delay);
    }

    private setCell(address: string, value: any): void {
        this.grid.updateCell({ value }, address);
    }

    /** Syncfusion finishes sheet/chart work on the next browser turns. */
    private async settle(): Promise<void> {
        await yieldToBrowser();
        await yieldToBrowser();
    }

    /** Lets Angular + Syncfusion + the browser paint before the next batch. */
    private async paint(): Promise<void> {
        this.cdr.detectChanges();
        await new Promise<void>(resolve => setTimeout(resolve, 0));
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    }

    private showLoading(message: string): void {
        this.isLoading = true;
        this.loadingProgress = 0;
        this.loadingMessage = message;
    }

    private hideLoading(): void {
        this.isLoading = false;
        this.loadingProgress = 0;
        this.loadingMessage = '';
    }

    private setProgress(done: number, total: number): void {
        if (total > 0) {
            this.loadingProgress = Math.min(100, Math.round((Math.min(done, total) / total) * 100));
        }
    }

    markDirty(): void {
        this.isDirty = true;
        this.cdr.detectChanges();
    }

    private getUniqueSheetName(baseName: string): string {
        const names = new Set(this.allSheets.map((s: any) => text(s?.name)));
        let name = baseName;
        let i = 2;

        while (names.has(name)) {
            name = `${baseName} (${i++})`;
        }

        return name;
    }

    // =====================================================
    // LIFECYCLE / LOAD
    // =====================================================

    // ngOnInit(): void {
    //     this.route.paramMap.subscribe(params => {
    //         const id = params.get('id');
    //         this.dashboardId = id ? Number(id) : null;
    //     });
    // }
    ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        this.dashboardId = id ? Number(id) : null;
    });

    void this.initializeSyncfusionLocale();
}

    ngOnDestroy(): void {
        this.stopSheetWatcher();
        this.stopListRibbonObserver();
        clearTimeout(this.pivotSyncTimer);
    }

    onCreated(): void {
        if (!this.spreadsheet) {
            return;
        }

        this.addRibbonButtons();
        this.startListRibbonObserver();
        this.loadDashboard();
    }

private loadDashboard(): void {
    if (!this.dashboardId || !this.spreadsheet) {
        return;
    }

    this.ignoreSpreadsheetChanges = true;
    this.spreadsheetNotFound = false;
    this.spreadsheetLoading = true;

    this.dashboardService.getDashboardForView(this.dashboardId).subscribe({
        next: async (result: any) => {
            try {
                const dashboard = result?.dashboard ?? result;

                // Dashboard not found
                if (!dashboard || Number(dashboard.id) === 0) {
                    this.spreadsheetNotFound = true;
                    this.dashboardTtle = '';
                    this.isDirty = false;
                    return;
                }

                this.dashboardTtle = dashboard?.title ?? '';

                if (dashboard?.spreadsheet) {
                    await this.openWorkbook(dashboard.spreadsheet);
                } else {
                    // Existing dashboard without a spreadsheet
                    await this.createEmptyWorkbook();
                }

            } catch (error) {
                console.error(
                    '[Spreadsheet] Failed to initialize dashboard spreadsheet:',
                    error
                );

                this.notify.error(this.l('UnableToLoadSpreadsheet'));

            } finally {
                this.spreadsheetLoading = false;
                this.isDirty = false;
                this.ignoreSpreadsheetChanges = false;

                if (!this.spreadsheetNotFound) {
                    this.syncSheetIdentity();
                    this.syncSheetToUi();
                    this.startSheetWatcher();

                    setTimeout(() => {
                        this.syncSheetToUi();
                        this.cdr.detectChanges();
                    }, 200);
                }

                this.cdr.detectChanges();
            }
        },

        error: (error: any) => {
            console.error(
                '[Spreadsheet] Failed to load dashboard:',
                error
            );

            this.spreadsheetNotFound = error?.status === 404;
            this.spreadsheetLoading = false;
            this.ignoreSpreadsheetChanges = false;

            if (!this.spreadsheetNotFound) {
                this.notify.error(this.l('UnableToLoadDashboard'));
            }

            this.cdr.detectChanges();
        }
    });
}

    /** Loads a saved spreadsheet ({ workbookJson, sheetDataSources, ... }). Also used after Refresh. */
    private async openWorkbook(saved: any): Promise<void> {
        const data = typeof saved === 'string' ? JSON.parse(saved) : saved;

        this.sheetSources = this.cloneSheetSources(data?.sheetDataSources ?? []);
        this.sheetRecordIds = {};
        this.sheetSources.forEach(item => (this.sheetRecordIds[item.sheetName] = [...(item.sheetRecordIds ?? [])]));

        this.analyses = clone(data?.sheetAnalyses ?? []);
        this.widgets = clone(data?.dashboardWidgets ?? []);
        this.spreadsheetUpdatedDate = data?.updatedDate ?? null;
        this.lastRefreshDate = data?.lastRefreshDate ?? null;
        this.refreshedBy = data?.refreshedBy ?? null;

        const workbook = this.cleanWorkbookJson(data?.workbookJson ?? data);

        this.grid.openFromJson({ file: workbook?.jsonObject ?? workbook }, this.saveOptions);

        await new Promise(resolve => setTimeout(resolve, 500));

        await this.ensureDashboard();
        await this.moveDashboardFirst();

        this.syncSheetIdentity();
        this.syncSheetToUi();

        setTimeout(() => this.updateListRibbonButton(), 0);
        this.spreadsheet?.resize();
    }

    /** New dashboard spreadsheet: starts with the Dashboard sheet only. */
    private async createEmptyWorkbook(): Promise<void> {
        this.sheetSources = [];
        this.analyses = [];
        this.widgets = [];

        // Create Dashboard FIRST so Syncfusion is never left with zero sheets.
        await this.ensureDashboard();
        await this.moveDashboardFirst();

        for (let i = this.allSheets.length - 1; i >= 0; i--) {
            const sheet = this.allSheets[i];

            if (text(sheet?.name) && !this.isDashboard(sheet)) {
                try {
                    this.grid.deleteSheet(i);
                } catch (error) {
                    console.warn('[Spreadsheet] Unable to remove initial sheet:', sheet?.name, error);
                }
            }
        }

        await yieldToBrowser();
        await this.moveDashboardFirst();
        await this.activateSheet(DASHBOARD_SHEET);

        this.syncSheetIdentity();
        this.updateListRibbonButton();
        this.resizeLater(100);
    }

    // =====================================================
    // CHART PANEL + DRILLDOWN
    // =====================================================

    onSheetClick(event: MouseEvent): void {
        const target = event.target as HTMLElement | null;
        const overlay = target?.closest('.e-datavisualization-chart') as HTMLElement | null;

        if (!overlay || !this.spreadsheet) {
            return;
        }

        // Ctrl / Cmd + click on a chart point = drilldown. A normal click opens the chart panel.
        if ((event.ctrlKey || event.metaKey) && this.openDrilldown(event)) {
            return;
        }

        const innerChart = overlay.querySelector('.e-control') as HTMLElement | null;
        const chart = this.findChart(text(innerChart?.id), text(overlay.id));

        if (!chart) {
            this.notify.warn('Unable to find the selected chart in the workbook.');
            return;
        }

        const ownerSheet = this.allSheets.find(sheet =>
            getSheetCharts(sheet).some((c: any) => c === chart || text(c?.id) === text(chart?.id))
        );

        this.selectedChart = chart;
        this.chartSheet = text(ownerSheet?.name) || this.activeSheetName;
        this.chartAggregation = (chart.aggregation as ChartAggregation) || 'None';
        this.chartRange = text(chart.originalRange ?? chart.range);

        if (chart.categoryRange && Array.isArray(chart.seriesRanges) && chart.seriesRanges.length) {
            this.categoryRange = text(chart.categoryRange);
            this.seriesRanges = chart.seriesRanges
                .map((range: any) => ({ range: text(typeof range === 'string' ? range : range?.range) }))
                .filter((item: any) => !!item.range);
        } else {
            // Newly inserted chart: derive ranges from the original selected range.
            this.splitRangeToSeries();
        }

        this.showDataPanel = false;
        this.showChartPanel = true;
        this.cdr.detectChanges();
        this.resizeLater(100);
    }

    private openDrilldown(event: MouseEvent): boolean {
        const result = this.drilldown.fromClick(event, {
            container: this.grid.element,
            sheets: this.allSheets,
            analyses: this.analyses,
            sheetName: this.activeSheetName
        });

        if (!result) {
            return false;
        }

        if (!result.records.length) {
            this.notify.warn('No matching source records could be resolved.');
            return true;
        }

        this.drilldownTitle = result.title;
        this.drilldownRecords = result.records;
        this.drilldownVisible = true;
        this.cdr.detectChanges();

        return true;
    }

    closeChartPanel(): void {
        this.showChartPanel = false;
        this.selectedChart = null;
        this.chartSheet = null;
        this.chartRange = '';
        this.categoryRange = '';
        this.seriesRanges = [];
        this.isApplyingChart = false;
        this.cdr.detectChanges();
        this.resizeLater();
    }

    addSeries(): void {
        this.seriesRanges = [...this.seriesRanges, { range: '' }];
    }

    removeSeries(index: number): void {
        this.seriesRanges = this.seriesRanges.filter((_s, i) => i !== index);
    }

    /** Applies independent category + series ranges (they do not need to be adjacent). */
    async applyChart(): Promise<void> {
        if (!this.selectedChart || !this.chartSheet) {
            return;
        }

        const categoryText = text(this.categoryRange);
        const seriesTexts = this.seriesRanges.map(s => text(s.range)).filter(Boolean);

        const checked = this.refreshService.checkChartRanges(categoryText, seriesTexts, name => !!this.findSheet(name));

        if (typeof checked === 'string') {
            this.notify.warn(checked);
            return;
        }

        const ownerSheet = this.chartSheet;
        this.isApplyingChart = true;

        try {
            const helperRange = await this.buildHelperRange(
                ownerSheet,
                text(this.selectedChart.id),
                checked.category,
                checked.series,
                this.chartAggregation
            );

            await this.replaceChart(ownerSheet, {
                range: helperRange,
                originalRange: text(this.chartRange),
                categoryRange: categoryText,
                seriesRanges: [...seriesTexts],
                aggregation: this.chartAggregation
            });

            // Show the user's ranges, not the hidden helper range.
            this.categoryRange = categoryText;
            this.seriesRanges = seriesTexts.map(range => ({ range }));

            this.notify.success(this.l('ChartDataUpdated'));
        } catch (error) {
            console.error('[Chart Panel] unable to update chart data:', error);
            this.notify.error(this.l('UnableToUpdateChartData'));
        } finally {
            this.isApplyingChart = false;
            this.cdr.detectChanges();
        }
    }

    /**
     * Copies category + series columns (aggregated if requested) into a far-right helper
     * block of the chart's sheet so Syncfusion can chart non-adjacent ranges.
     * The table itself is built by the shared refresh service.
     */
    private async buildHelperRange(
        ownerSheetName: string,
        chartId: string,
        category: ParsedRange,
        series: ParsedRange[],
        aggregation: ChartAggregation
    ): Promise<string> {
        const ownerSheet = this.findSheet(ownerSheetName);

        if (!ownerSheet) {
            throw new Error(`Chart owner sheet "${ownerSheetName}" not found.`);
        }

        const table = this.refreshService.buildChartTable(name => this.findSheet(name), category, series, aggregation);
        const rows = [table.headers, ...table.rows];

        const startColumn = 200 + this.helperSlot(chartId) * 30;
        const first = toColumnName(startColumn);
        const last = toColumnName(startColumn + table.headers.length - 1);
        const lastUsedRow = Number(ownerSheet.usedRange?.rowIndex ?? 0) + 1;

        await this.activateSheet(ownerSheetName);
        this.grid.clear({ type: 'Clear Contents', range: `${first}1:${last}${Math.max(rows.length, lastUsedRow)}` });

        rows.forEach((row, r) =>
            row.forEach((value, c) => this.setCell(`${toColumnName(startColumn + c)}${r + 1}`, value ?? ''))
        );

        await this.settle();

        return `${quoteSheetName(ownerSheetName)}!${first}1:${last}${rows.length}`;
    }

    /** Same chart id always gets the same helper block (0-19). */
    private helperSlot(chartId: string): number {
        const value = text(chartId) || 'chart';
        let hash = 0;

        for (let i = 0; i < value.length; i++) {
            hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
        }

        return Math.abs(hash) % 20;
    }

    /** Deletes the selected chart and inserts it again with changed properties. */
    private async replaceChart(ownerSheetName: string, changes: any): Promise<void> {
        const oldChart = this.selectedChart;
        const chartId = text(oldChart?.id);

        if (!oldChart || !chartId) {
            throw new Error('No chart selected.');
        }

        if (!this.findSheet(ownerSheetName)) {
            throw new Error(`Sheet "${ownerSheetName}" not found.`);
        }

        if (typeof this.grid.deleteChart !== 'function' || typeof this.grid.insertChart !== 'function') {
            throw new Error('Syncfusion chart delete/insert APIs are unavailable.');
        }

        const model = this.findChart(chartId);

        if (!model) {
            throw new Error(`Chart "${chartId}" is not registered in the workbook. Recreate it from the Insert ribbon.`);
        }

        // Keep the original look and position.
        const replacement: any = {
            type: model.type || 'Column',
            theme: model.theme || 'Material',
            range: changes.range,
            isSeriesInRows: model.isSeriesInRows ?? false,
            top: model.top ?? 20,
            left: model.left ?? 20,
            width: model.width ?? 480,
            height: model.height ?? 290
        };

        if (model.title) {
            replacement.title = model.title;
        }

        await this.activateSheet(ownerSheetName);
        await this.settle();

        this.grid.deleteChart(chartId);
        await this.settle();

        const stillExists = this.allSheets.some(sheet =>
            getSheetCharts(sheet).some((c: any) => text(c?.id) === chartId)
        );

        if (stillExists) {
            throw new Error(`Syncfusion did not remove chart "${chartId}". Replacement skipped to avoid duplicates.`);
        }

        this.grid.insertChart([replacement]);
        await this.settle();

        const newChart = getSheetCharts(this.findSheet(ownerSheetName)).find(
            (c: any) => text(c?.range) === text(changes.range)
        );

        if (!newChart) {
            throw new Error('Replacement chart was not found after insertion.');
        }

        // Custom settings are saved with the chart model and used by Refresh.
        Object.assign(newChart, {
            originalRange: changes.originalRange,
            categoryRange: changes.categoryRange,
            seriesRanges: changes.seriesRanges,
            aggregation: changes.aggregation
        });

        this.selectedChart = newChart;
        this.chartSheet = ownerSheetName;

        this.markDirty();
        this.resizeLater(100);
    }

    /** First column of chartRange = category, every other column = one series. */
    private splitRangeToSeries(): void {
        const parsed = parseRange(this.chartRange);

        this.categoryRange = '';
        this.seriesRanges = [];

        if (!parsed) {
            return;
        }

        const sheet = quoteSheetName(parsed.sheetName);
        const first = parsed.startColumn;

        this.categoryRange = `${sheet}!${first}${parsed.startRow}:${first}${parsed.endRow}`;

        for (let i = parsed.startColumnIndex + 1; i <= parsed.endColumnIndex; i++) {
            const column = toColumnName(i + 1);
            this.seriesRanges.push({ range: `${sheet}!${column}${parsed.startRow}:${column}${parsed.endRow}` });
        }
    }

    private findChart(...ids: string[]): any | null {
        const wanted = ids.map(id => text(id)).filter(Boolean);
        const charts: any[] = [
            ...(this.grid?.chartColl ?? []),
            ...this.allSheets.flatMap(sheet => getSheetCharts(sheet))
        ];

        return charts.find(chart => wanted.includes(text(chart?.id))) ?? null;
    }

    // =====================================================
    // RIBBON
    // =====================================================

    /** Adds "Pivot Table" (Insert tab) and "New Data Source / List Properties" (Data tab). */
    private addRibbonButtons(): void {
        if (typeof this.grid.addToolbarItems !== 'function') {
            console.warn('[Spreadsheet] addToolbarItems() is not available in this Syncfusion build.');
            return;
        }

        try {
            this.grid.addToolbarItems(
                'Insert',
                [{
                    id: 'spreadsheet_pivot',
                    type: 'Button',
                    text: this.l('PivotTable'),
                    tooltipText: this.l('CreatePivotTable'),
                    prefixIcon: 'e-icons e-table',
                    click: () => this.openPivotFromRibbon()
                }],
                0
            );

            this.grid.addToolbarItems(
                'Data',
                [{
                    id: 'spreadsheet_data_source',
                    type: 'Button',
                    text: this.l('NewDataSource'),
                    tooltipText: this.l('ManageDataSource'),
                    prefixIcon: 'e-icons e-list-unordered',
                    click: () => this.onListRibbonClick()
                }],
                0
            );
        } catch (error) {
            console.warn('[Spreadsheet] Unable to add ribbon buttons:', error);
        }
    }

    onSpreadsheetRibbonSelect(): void {
        setTimeout(() => this.updateListRibbonButton(), 0);
    }

    private get listRibbonButton(): HTMLElement | null {
        return (this.grid?.element as HTMLElement)?.querySelector('#spreadsheet_data_source') ?? null;
    }

    private updateListRibbonButton(): void {
        if (!this.spreadsheet) {
            return;
        }

        const sheetName = this.activeSheetName.trim().toLowerCase();
        const hasSource = this.sheetSources.some(item => String(item.sheetName ?? '').trim().toLowerCase() === sheetName);
      const label = hasSource ? this.l('ListProperties') : this.l('NewDataSource');

        this.lastListRibbonLabel = label;

        const button = this.listRibbonButton;

        if (!button) {
            return;
        }

        const textElement = button.querySelector('.e-tbar-btn-text, .e-btn-text') as HTMLElement | null;

        if (textElement && textElement.textContent !== label) {
            textElement.textContent = label;
        }

        ['title', 'aria-label'].forEach(attr => {
            if (button.getAttribute(attr) !== label) {
                button.setAttribute(attr, label);
            }
        });
    }

    private startListRibbonObserver(): void {
        this.stopListRibbonObserver();

        const root = this.grid?.element as HTMLElement;

        if (!root) {
            return;
        }

        // Syncfusion re-renders the ribbon text: restore our label when that happens.
        this.listRibbonObserver = new MutationObserver(() => {
            const textElement = this.listRibbonButton?.querySelector('.e-tbar-btn-text, .e-btn-text');

            if (textElement && textElement.textContent !== this.lastListRibbonLabel) {
                this.updateListRibbonButton();
            }
        });

        this.listRibbonObserver.observe(root, { childList: true, subtree: true });
        this.updateListRibbonButton();
    }

    private stopListRibbonObserver(): void {
        this.listRibbonObserver?.disconnect();
        this.listRibbonObserver = null;
    }

    onListRibbonClick(): void {
        if (!this.spreadsheet) {
            return;
        }

        if (this.activeSheetSource) {
            this.editActiveSheetFilters();
        } else {
            this.openDataPanel();
        }
    }

    /** Second supported path for the ribbon buttons. */
    onRibbonClick(args: any): void {
        const id = text(
            args?.item?.id ?? args?.item?.properties?.id ?? args?.originalEvent?.target?.id ?? args?.target?.id
        ).toLowerCase();

        if (id.includes('spreadsheet_pivot')) {
            this.openPivotFromRibbon();
        }
    }

    /** Opens the saved Pivot of this sheet, or creates a new one. */
    private openPivotFromRibbon(): void {
        void this.openPivot(this.findAnalysis(this.activeSheetName) ?? undefined);
    }

    // =====================================================
    // ADD / EDIT DATA PANEL
    // =====================================================


    openDataPanel(): void {
        const activeSheet = this.activeSheet;
        if (!activeSheet) {
            this.notify.warn('No active worksheet found.');
            return;
        }
        this.editingSheetName = null;
        this.dataPanelTargetSheetName = activeSheet.name;
        this.dataPanelTargetHasData = this.sheetHasExistingData(this.dataPanelTargetSheetName);
        this.closeChartPanel();
        this.showDataPanel = true;
        this.cdr.detectChanges();
        this.resizeLater();
    }


    editActiveSheetFilters(): void {
        const sheetSource = this.activeSheetSource;

        if (!sheetSource) {
            this.notify.warn('This sheet has no linked data source.');
            return;
        }

        this.editingSheetName = sheetSource.sheetName;
        this.dataPanelTargetSheetName = sheetSource.sheetName;
        this.dataPanelTargetHasData = this.sheetHasExistingData(sheetSource.sheetName);

        this.closeChartPanel();
        this.showDataPanel = true;

        this.cdr.detectChanges();
        this.resizeLater();
    }

    closeDataPanel(): void {
        this.showDataPanel = false;
        this.editingSheetName = null;
        this.cdr.detectChanges();
        this.resizeLater();
    }

    closeResponsivePanel(): void {
        if (this.showDataPanel) {
            this.closeDataPanel();
        }

        if (this.showChartPanel) {
            this.closeChartPanel();
        }
    }

    /**
     * Loads API records into the Spreadsheet in batches.
     * Id is kept in sheetRecordIds only - it is NOT written into the worksheet.
     */

    onDataBatchLoaded(batch: SpreadsheetDataBatch): void {
        // Angular EventEmitter does not await async event handlers.
        // Serialize all batches so the first one finishes creating the sheet.
        this.dataBatchQueue = this.dataBatchQueue.then(async () => {
            if (batch.isFirstBatch) {
                this.dataBatchFailed = false;
            }
            if (this.dataBatchFailed) {
                return;
            }
            await this.processDataBatch(batch);
        }).catch(error => {
            if (!this.dataBatchFailed) {
                this.dataBatchFailed = true;
                console.error('[Spreadsheet] Batch loading failed:', error);
                this.onDataLoadingFailed(error);
            }
        });
    }

    private async processDataBatch(batch: SpreadsheetDataBatch): Promise<void> {

        if (!this.spreadsheet) {
            throw new Error("Spreadsheet is not initialized.");
        }

        try {

            // ============================================
            // 1. FIRST BATCH: PREPARE DESTINATION SHEET
            // ============================================

            if (batch.isFirstBatch) {

                this.newDataSheetName = null;
                this.newDataSheetFields = [];
                this.newDataSheetLoadedRows = 0;

                const destination = batch as SpreadsheetDataBatch & {
                    insertAsNewSheet?: boolean;
                    targetSheetName?: string;
                };

                if (destination.insertAsNewSheet === true) {

                    // Create a new worksheet
                    await this.createDataSheet(batch);

                } else {

                    // Insert into current sheet or edit existing sheet
                    const targetSheetName = (
                        destination.targetSheetName ||
                        this.dataPanelTargetSheetName ||
                        this.editingSheetName ||
                        ''
                    ).trim();

                    if (!targetSheetName) {
                        throw new Error(
                            'No destination worksheet was selected.'
                        );
                    }

                    const targetSheet = this.findSheet(targetSheetName);

                    if (!targetSheet) {
                        throw new Error(
                            `Destination worksheet "${targetSheetName}" was not found.`
                        );
                    }

                    // Set the destination explicitly
                    this.newDataSheetName = targetSheetName;

                    // Clear previous cell contents
                    await this.clearSheetForEdit(targetSheetName);
                }

                // Ensure the destination is available
                if (!this.newDataSheetName) {
                    throw new Error(
                        'Unable to initialize destination worksheet.'
                    );
                }

                // Reset record IDs for the new data
                this.sheetRecordIds[this.newDataSheetName] = [];
            }

            // ============================================
            // 2. GET DESTINATION SHEET
            // ============================================

            const sheetName = this.newDataSheetName;

            if (!sheetName) {
                throw new Error(
                    'No destination worksheet is available.'
                );
            }

            const sheet = this.findSheet(sheetName);

            if (!sheet) {
                throw new Error(
                    `Worksheet "${sheetName}" was not found.`
                );
            }

            await this.activateSheet(sheetName);

            const rows: any[] = batch.rows ?? [];

            // ============================================
            // 3. CREATE HEADERS (WITHOUT ID)
            // ============================================

            if (!this.newDataSheetFields.length && rows.length > 0) {

                this.newDataSheetFields = Object.keys(rows[0])
                    .filter(field =>
                        field.trim().toLowerCase() !== 'id'
                    );

                this.newDataSheetFields.forEach((field, index) => {

                    const columnName = toColumnName(index + 1);

                    this.setCell(
                        `${columnName}1`,
                        field
                    );

                });
            }

            // ============================================
            // 4. PREPARE ROWS AND RECORD IDS
            // ============================================

            // Upsert by backend Id: duplicates update the same row instead of failing.
            const recordIds = [...(this.sheetRecordIds[sheetName] ?? [])];
            const rowById = new Map<string, number>();
            recordIds.forEach((id, index) => {
                rowById.set(String(id).trim(), index + 2); // Excel row 1 is headers
            });

            // Deduplicate the incoming batch; last occurrence wins.
            const uniqueRecords = new Map<string, any>();
            rows.forEach((record, index) => {
                const id = getValueIgnoreCase(record, 'Id');
                if (id === undefined || id === null || String(id).trim() === '') {
                    throw new Error(`Backend record at batch index ${index} has no Id.`);
                }
                uniqueRecords.set(String(id).trim(), record);
            });

            uniqueRecords.forEach((record, idKey) => {
                let excelRow = rowById.get(idKey);
                if (excelRow === undefined) {
                    recordIds.push(getValueIgnoreCase(record, 'Id'));
                    excelRow = recordIds.length + 1;
                    rowById.set(idKey, excelRow);
                }

                this.newDataSheetFields.forEach((field, col) => {
                    const columnName = toColumnName(col + 1);
                    const value = getValueIgnoreCase(record, field) ?? '';
                    this.setCell(`${columnName}${excelRow}`, value);
                });
            });

            this.sheetRecordIds[sheetName] = recordIds;
            this.newDataSheetLoadedRows = recordIds.length;

            this.setProgress(
                batch.loaded,
                batch.total
            );

            await this.settle();

            // ============================================
            // 7. FINISH OR CONTINUE LOADING
            // ============================================

            if (batch.isLastBatch) {

                await this.finishDataLoading(batch);

            } else {

                await this.paint();
            }

        } catch (error) {
            throw error;
        }
    }



    /** Edit mode: reuse the existing sheet and wipe its old data. */
    private async clearSheetForEdit(sheetName: string): Promise<void> {
        const sheet = this.findSheet(sheetName);

        if (!sheet) {
            throw new Error(`Sheet "${sheetName}" not found.`);
        }

        this.newDataSheetName = sheetName;

        await this.activateSheet(sheetName);

        const lastRow = Number(sheet.usedRange?.rowIndex ?? 0);
        const lastCol = Number(sheet.usedRange?.colIndex ?? 0);

        this.grid.clear({ type: 'Clear Contents', range: `A1:${toColumnName(lastCol + 1)}${lastRow + 1}` });

        await this.settle();
    }

    private getBatchTable(batch: SpreadsheetDataBatch): string {
        const tableName = (batch as any).table || (batch as any).entity;

        if (!tableName) {
            throw new Error('Table name is missing.');
        }

        return tableName;
    }

    /** Creates the EMPTY sheet that will receive the batches. */
    private async createDataSheet(batch: SpreadsheetDataBatch): Promise<void> {
        const tableName = this.getBatchTable(batch);

        this.showLoading(`Loading ${tableName}...`);

        const name = this.getUniqueSheetName(tableName);

        this.newDataSheetName = name;
        this.newDataSheetLoadedRows = 0;

        this.grid.insertSheet([{ name, rows: [] }], this.allSheets.length);

        if (!(await this.waitForSheet(name))) {
            throw new Error(`Unable to create sheet "${name}".`);
        }

        this.setDefaultColumnWidth(name, 140);

        await this.activateSheet(name);
        await this.paint();
    }

    private async finishDataLoading(batch: SpreadsheetDataBatch): Promise<void> {
        const sheetName = this.newDataSheetName;

        if (!sheetName) {
            return;
        }

        const sheet = this.findSheet(sheetName);

        if (!sheet) {
            throw new Error(`Sheet "${sheetName}" was not found.`);
        }

        const tableName = this.getBatchTable(batch);
        const conditions = (batch as any).conditions ?? [];
        const matchMode: 'all' | 'any' = (batch as any).matchMode === 'any' ? 'any' : 'all';
        const ids = this.sheetRecordIds[sheetName] ?? [];

        await this.activateSheet(sheetName);
        await this.settle();

        if (
            ids.length !== this.newDataSheetLoadedRows ||
            ids.some(id => id === undefined || id === null || String(id).trim() === '')
        ) {
            throw new Error(`Invalid record IDs for "${sheetName}".`);
        }

        this.upsertSheetSource({
            sheetId: sheet.id,
            sheetName,
            sheetRecordIds: [...ids],
            source: {
                type: tableName,
                sourceKey: tableName,
                mode: matchMode,
                columns: [...this.newDataSheetFields],
                filters: {
                    conditions,
                    matchMode,
                    filterTree: (batch as any).filterTree ?? null
                }
            }
        });

        this.loadingProgress = 100;
        this.loadingMessage = `Loaded ${batch.loaded.toLocaleString()} records`;

        this.syncSheetIdentity();
        this.syncSheetToUi();
        this.markDirty();

        this.notify.success(`${batch.loaded.toLocaleString()} records added to ${sheetName}.`);

        this.showDataPanel = false;

        await this.paint();

        this.resetDataLoad();
        this.resizeLater();

        setTimeout(() => {
            this.hideLoading();
            this.cdr.detectChanges();
        }, 250);
    }

    onDataLoadingFailed(error: any): void {
        console.error('[Spreadsheet] data loading failed:', error);
        this.hideLoading();
        this.resetDataLoad();
        this.notify.error(this.l('UnableToLoadSpreadsheetData'));
        this.cdr.detectChanges();
    }

    private resetDataLoad(): void {
        this.newDataSheetName = null;
        this.newDataSheetLoadedRows = 0;
        this.newDataSheetFields = [];
    }

    // =====================================================
    // PIVOT: OPEN / CLOSE / BIND
    // =====================================================

    async openPivot(savedAnalysis?: SavedSheetAnalysis): Promise<void> {
        if (!this.spreadsheet || this.isCreatingPivot) {
            return;
        }

        this.isCreatingPivot = true;

        try {
            if (!this.activeSheetName) {
                this.notify.warn('No active spreadsheet found.');
                return;
            }

            // 1. Which sheet is the source and which is the pivot sheet?
            const target = this.resolvePivotTarget(this.activeSheetName, savedAnalysis);

            if (!target) {
                return;
            }

            const { sourceSheetName, pivotSheetName } = target;

            // 2. Read source data BEFORE creating the pivot tab.
            const records = this.readPivotRecords(sourceSheetName);

            if (!records) {
                this.notify.warn('The source sheet has no data.');
                return;
            }

            // 3. New pivot: create its tab. Saved pivot: its tab must exist.
            let analysis: any = savedAnalysis;

            if (!analysis) {
                analysis = await this.createPivotAnalysis(sourceSheetName, pivotSheetName);
            } else if (!this.findSheet(pivotSheetName)) {
                this.notify.warn(`Pivot sheet "${pivotSheetName}" was not found.`);
                return;
            }

            // 4. Settings + chart + active tab.
            const chartType = analysis?.chart?.type ?? 'Column';

            this.pivotSettings = buildPivotSettings(analysis?.pivot, records, buildFieldMapping(records));
            this.pivotChart = {
                ...this.pivotChart,
                chartSeries: { ...(this.pivotChart?.chartSeries ?? {}), type: chartType },
                title: analysis?.chart?.title ?? 'Pivot Chart',
                enableMultipleAxis: analysis?.chart?.enableMultipleAxis ?? false
            };
            this.selectedPivotChartType = chartType;

            this.pivotSheet = pivotSheetName;
            this.sourceSheet = sourceSheetName;

            await this.activateSheet(pivotSheetName);

            // 5. Close other panels and (re)create the pivot view.
            this.showDataPanel = false;

            if (this.showChartPanel) {
                this.closeChartPanel();
            }

            this.showPivot = false;
            this.cdr.detectChanges();
            await yieldToBrowser();

            this.showPivot = true;
            this.cdr.detectChanges();
            await this.settle();

            // 6. Force Syncfusion to bind.
            this.bindPivotView(records);
        } catch (error) {
            console.error('[Pivot] Failed:', error);
            this.notify.error('Failed to create Pivot Table.');
        } finally {
            this.isCreatingPivot = false;
        }
    }

    async closePivot(): Promise<void> {
        const sourceSheetName = this.sourceSheet;

        // Keep the latest Pivot configuration in memory before destroying the view.
        this.updateAnalysis();

        this.showPivot = false;
        this.cdr.detectChanges();

        if (sourceSheetName && this.findSheet(sourceSheetName)) {
            await this.activateSheet(sourceSheetName);
        }

        this.pivotSheet = null;
        this.sourceSheet = null;
        this.resizeLater();
    }

    private resolvePivotTarget(
        activeName: string,
        saved?: SavedSheetAnalysis
    ): { sourceSheetName: string; pivotSheetName: string } | null {
        if (saved) {
            const analysis: any = saved;
            let sourceSheetName = text(analysis.sourceSheetName);

            if (!sourceSheetName && analysis.sourceSheetId != null) {
                sourceSheetName = text(this.allSheets.find((s: any) => s?.id === analysis.sourceSheetId)?.name);
            }

            if (!sourceSheetName) {
                this.notify.warn('Pivot source sheet was not found.');
                return null;
            }

            return { sourceSheetName, pivotSheetName: text(analysis.sheetName) };
        }

        if (activeName === DASHBOARD_SHEET || activeName.startsWith('Pivot - ')) {
            this.notify.warn('Create the Pivot Table from a data sheet.');
            return null;
        }

        return {
            sourceSheetName: activeName,
            pivotSheetName: this.getUniqueSheetName(`Pivot - ${activeName}`)
        };
    }

    /** Source sheet rows -> Pivot records (shared with Refresh). */
    private readPivotRecords(sourceSheetName: string): IDataSet[] | null {
        const sheet = this.findSheet(sourceSheetName);
        const meta = this.sheetSources.find(s => s.sheetName === sourceSheetName);

        if (!sheet || !meta) {
            throw new Error(`Pivot source "${sourceSheetName}" was not found.`);
        }

        return this.refreshService.readPivotRecords(sheet, meta);
    }

    /** Creates an empty pivot definition + its sheet tab. */
    private async createPivotAnalysis(sourceSheetName: string, pivotSheetName: string): Promise<any> {
        const analysis: any = {
            id: Date.now(),
            sheetName: pivotSheetName,
            sourceSheetName,
            sourceSheetId: this.getSheetIdentity(sourceSheetName).sheetId,
            pivot: { rows: [], columns: [], values: [], filters: [], filterSettings: [], sortSettings: [] },
            chart: { type: 'Column', title: `${sourceSheetName} Pivot Chart`, enableMultipleAxis: false }
        };

        this.analyses.push(analysis as SavedSheetAnalysis);

        this.grid.insertSheet([{ name: pivotSheetName, rowCount: 100, colCount: 20 }], this.allSheets.length);

        if (!(await this.waitForSheet(pivotSheetName))) {
            throw new Error(`Unable to create ${pivotSheetName}.`);
        }

        return analysis;
    }

    /** Pushes records + settings into the PivotView and the fixed field list. */
    private bindPivotView(records: IDataSet[]): void {
        if (!this.pivotView) {
            return;
        }

        const settings = { ...this.pivotSettings, dataSource: [...records] };

        this.pivotView.dataSourceSettings = settings;
        this.pivotView.showFieldList = false;
        this.pivotView.showGroupingBar = true;
        this.pivotView.showToolbar = false;
        this.pivotView.displayOption = { view: 'Both', primary: 'Table' } as DisplayOption;
        this.pivotView.chartSettings = { ...this.pivotChart };
        this.pivotView.dataBind?.();

        if (this.pivotFieldList) {
            this.pivotFieldList.dataSourceSettings = { ...settings } as any;
            this.pivotFieldList.dataBind?.();
            this.pivotFieldList.update?.(this.pivotView);
        }

        this.pivotView.refresh?.();
    }

    changePivotChartType(type: string): void {
        if (!type || !this.pivotView) {
            return;
        }

        this.selectedPivotChartType = type;
        this.setPivotChartType(type);

        this.pivotView.chartSettings = { ...this.pivotChart };
        this.pivotView.dataBind?.();

        this.markDirty();
        this.schedulePivotDashboardSync();
    }

    /** Stores the chart type in the chart settings and in the saved analysis. */
    private setPivotChartType(type: string, defaultTitle?: string): void {
        this.pivotChart = {
            ...this.pivotChart,
            chartSeries: { ...(this.pivotChart?.chartSeries ?? {}), type }
        };

        const analysis: any = this.getCurrentAnalysis();

        if (analysis) {
            analysis.chart = {
                ...analysis.chart,
                type,
                ...(defaultTitle ? { title: analysis.chart?.title ?? defaultTitle } : {})
            };
        }
    }

    /** Opens/closes the pivot view when the user switches sheet tabs. */
    private async syncPivotForActiveSheet(): Promise<void> {
        if (this.isCreatingPivot || this.isSyncingPivotDashboard || this.isRefreshing || !this.activeSheetName) {
            return;
        }

        const name = this.activeSheetName;
        const analysis = this.findAnalysis(name);

        if (!analysis) {
            if (this.showPivot) {
                this.updateAnalysis();
                this.showPivot = false;
                this.pivotSheet = null;
                this.sourceSheet = null;
                this.cdr.detectChanges();
            }

            return;
        }

        if (this.showPivot && this.pivotSheet === name) {
            return;
        }

        await this.openPivot(analysis);
    }

    onFieldListReady(): void {
        if (this.pivotFieldList && this.pivotView) {
            this.pivotFieldList.updateView(this.pivotView);
        }
    }

    onPivotReady(): void {
        if (this.pivotFieldList && this.pivotView) {
            this.pivotFieldList.update(this.pivotView);
        }

        if (this.isCreatingPivot) {
            return;
        }

        this.updateAnalysis();
        this.markDirty();
        this.schedulePivotDashboardSync();
    }

    private getPivotResultMatrix(): any[][] {
        const pivot: any = this.pivotView;
        return pivotValuesToMatrix(pivot?.pivotValues ?? pivot?.engineModule?.pivotValues ?? []);
    }

    /** User changed the chart type inside the Pivot: keep metadata + Dashboard chart in sync. */
    onPivotChartChanged(args: any): void {
        const type = text(
            args?.series?.[0]?.type ??
            this.pivotView?.chart?.series?.[0]?.type ??
            this.pivotView?.chartSettings?.chartSeries?.type
        );

        if (!type) {
            return;
        }

        const analysis: any = this.getCurrentAnalysis();

        this.setPivotChartType(type, `${analysis?.sourceSheetName} Pivot Chart`);

        if (this.isCreatingPivot) {
            return;
        }

        this.markDirty();
        this.schedulePivotDashboardSync();
    }

    // =====================================================
    // PIVOT ANALYSIS (saved with the workbook)
    // =====================================================

    private findAnalysis(sheetName: string): SavedSheetAnalysis | null {
        const name = text(sheetName);
        return name ? this.analyses.find(a => text(a.sheetName) === name) ?? null : null;
    }

    /** The opened Pivot's analysis, otherwise the active sheet's. */
    private getCurrentAnalysis(): SavedSheetAnalysis | null {
        return this.findAnalysis(text(this.pivotSheet)) ?? this.findAnalysis(this.activeSheetName);
    }

    /** Copies the live PivotView state into the analysis. Does NOT save the spreadsheet. */
    private updateAnalysis(): void {
        const analysis: any = this.pivotView ? this.getCurrentAnalysis() : null;

        if (!analysis) {
            return;
        }

        const sourceName = text(this.sourceSheet || analysis.sourceSheetName);

        if (!text(analysis.sheetName) || !sourceName) {
            return;
        }

        const settings = this.pivotView.dataSourceSettings;
        const source = this.getSheetIdentity(sourceName);

        analysis.sourceSheetName = source.sheetName;
        analysis.sourceSheetId = source.sheetId;
        analysis.pivot = {
            rows: this.serializeFields(settings?.rows),
            columns: this.serializeFields(settings?.columns),
            values: this.serializeFields(settings?.values),
            filters: this.serializeFields(settings?.filters),
            filterSettings: this.serializeFilters(settings?.filterSettings),
            sortSettings: (settings?.sortSettings ?? []).map((s: any) => ({ name: s.name, order: s.order }))
        };
        analysis.chart = {
            ...analysis.chart,
            type: this.getPivotChartType(),
            title: analysis.chart?.title ?? `${source.sheetName} Pivot Chart`,
            enableMultipleAxis:
                this.pivotView?.chartSettings?.enableMultipleAxis ?? analysis.chart?.enableMultipleAxis ?? false
        };
    }

    private getPivotChartType(): string {
        return text(
            this.pivotView?.chart?.series?.[0]?.type ??
            this.pivotView?.chartSettings?.chartSeries?.type ??
            this.pivotChart?.chartSeries?.type ??
            'Column'
        );
    }

    private serializeFields(fields: any[]): any[] {
        return (fields ?? []).map(f => ({
            name: f.name,
            caption: f.caption ?? f.name,
            type: f.type,
            axis: f.axis,
            baseField: f.baseField,
            baseItem: f.baseItem,
            showNoDataItems: f.showNoDataItems ?? false
        }));
    }

    private serializeFilters(filters: any[]): any[] {
        return (filters ?? []).map(f => ({
            name: f.name,
            type: f.type,
            condition: f.condition,
            value1: f.value1,
            value2: f.value2,
            measure: f.measure,
            levelCount: f.levelCount,
            items: Array.isArray(f.items) ? [...f.items] : []
        }));
    }

    // =====================================================
    // PIVOT -> DASHBOARD
    // =====================================================

    /** True when this Pivot already has a chart on the Dashboard. */
    get isPivotOnDashboard(): boolean {
        const analysis = this.getCurrentAnalysis();
        return !!(analysis && (analysis.dashboardWidgetId || analysis.dashboardChartId || analysis.dashboardDataRange));
    }

    async copyPivotToDashboard(): Promise<void> {
        if (!this.pivotView || !this.spreadsheet) {
            this.notify.warn('Pivot analysis or Spreadsheet is not ready.');
            return;
        }

        const pivotName = text(this.pivotSheet);
        const analysis = this.findAnalysis(pivotName);

        if (!pivotName || !analysis) {
            this.notify.warn('Pivot analysis is not available.');
            return;
        }

        if (!text(this.sourceSheet || (analysis as any).sourceSheetName)) {
            this.notify.warn('Pivot source sheet is not available.');
            return;
        }

        try {
            this.updateAnalysis();

            // const matrix = this.getPivotResultMatrix();
            const matrix = this.refreshService.removeGrandTotalFromChart(
                this.getPivotResultMatrix()
            );
            const maxColumns = matrix.reduce((max, row) => Math.max(max, row?.length ?? 0), 0);

            if (matrix.length < 2 || maxColumns < 2) {
                this.notify.warn('Pivot result needs at least two columns/rows for a chart.');
                return;
            }

            const updated = await this.publishPivotChart(analysis, matrix);

            await this.activateSheet(DASHBOARD_SHEET);
            this.resizeLater(100);

            this.notify.success(
                updated
                    ? 'Pivot chart updated on Dashboard. Click Save to persist changes.'
                    : 'Pivot chart added to Dashboard. Click Save to persist changes.'
            );
        } catch (error) {
            console.error('Copy Pivot chart to Dashboard failed:', error);
            this.notify.error('Unable to copy Pivot chart to Dashboard.');
        }
    }

    private schedulePivotDashboardSync(): void {
        if (!this.isPivotOnDashboard) {
            return;
        }

        clearTimeout(this.pivotSyncTimer);
        this.pivotSyncTimer = setTimeout(() => void this.syncPivotToDashboard(), 250);
    }

    /** Silently refreshes the Pivot's Dashboard chart, then returns to the previous tab. */
    private async syncPivotToDashboard(): Promise<void> {
        const analysis = this.getCurrentAnalysis();

        if (!analysis || !this.pivotView || !this.isPivotOnDashboard || this.isSyncingPivotDashboard) {
            return;
        }

        const previousSheet = this.activeSheetName;

        this.isSyncingPivotDashboard = true;

        try {
            this.updateAnalysis();

            // const matrix = this.getPivotResultMatrix();
            const matrix = this.refreshService.removeGrandTotalFromChart(
                this.getPivotResultMatrix()
            );

            if (!matrix.length || !matrix[0]?.length) {
                return;
            }

            await this.publishPivotChart(analysis, matrix);

            if (previousSheet && this.findSheet(previousSheet)) {
                await this.activateSheet(previousSheet);
            }

            this.resizeLater(100);
        } finally {
            this.isSyncingPivotDashboard = false;
        }
    }

    /**
     * Writes the pivot result to the Dashboard, inserts/replaces its chart and
     * registers the widget. Returns true when an existing chart was updated.
     */
    private async publishPivotChart(analysis: SavedSheetAnalysis, matrix: any[][]): Promise<boolean> {
        const pivotName = text(analysis.sheetName);
        const dashboardRange = await this.writePivotData(pivotName, matrix);

        const result = await this.upsertPivotChart(analysis, {
            range: dashboardRange,
            type: this.toSheetChartType(this.getPivotChartType()),
            theme: 'Material',
            title: `${pivotName} Chart`,
            height: 320,
            width: 520,
            top: 30,
            left: 30,
            isSeriesInRows: false
        });

        this.registerWidget(pivotName, dashboardRange, result.chart);

        return result.updated;
    }

    /**
     * Writes the pivot result into a reserved block of the Dashboard sheet and
     * returns a LOCAL range (e.g. AZ1:BH20). Each Pivot gets its own block.
     */
    private async writePivotData(pivotName: string, matrix: any[][]): Promise<string> {
        const dashboard = await this.ensureDashboard();

        if (!dashboard) {
            throw new Error('Dashboard sheet could not be created.');
        }

        await this.activateSheet(DASHBOARD_SHEET);

        const index = Math.max(0, this.analyses.findIndex(a => text(a?.sheetName) === text(pivotName)));
        const startColumnNumber = 52 + index * 20; // AZ, BT, ...
        const maxColumns = matrix.reduce((max, row) => Math.max(max, row?.length ?? 0), 0);
        const startColumn = toColumnName(startColumnNumber);
        const endColumn = toColumnName(startColumnNumber + Math.max(maxColumns, 1) - 1);

        // Clear only this Pivot's block before rewriting it.
        const clearLastRow = Math.max(matrix.length + 20, Number(dashboard?.usedRange?.rowIndex ?? 0) + 1);

        try {
            this.grid.clear({ type: 'Clear Contents', range: `${startColumn}1:${endColumn}${clearLastRow}` });
        } catch (error) {
            console.warn('[Pivot Dashboard] unable to clear old helper cells', error);
        }

        matrix.forEach((row, r) =>
            (row ?? []).forEach((value, c) => this.setCell(`${toColumnName(startColumnNumber + c)}${r + 1}`, value))
        );

        await this.settle();

        if (!(await this.waitForSheet(DASHBOARD_SHEET))?.rows?.length) {
            throw new Error('Dashboard Pivot source cells were not created.');
        }

        return `${startColumn}1:${endColumn}${matrix.length}`;
    }

    private async upsertPivotChart(
        analysis: SavedSheetAnalysis,
        chart: any
    ): Promise<{ chart: any; updated: boolean }> {
        await this.ensureDashboard();
        await this.activateSheet(DASHBOARD_SHEET);

        const existing = matchPivotChart(analysis, getSheetCharts(this.findSheet(DASHBOARD_SHEET)), chart.range);

        if (!existing) {
            return { chart: await this.insertDashboardChart(chart), updated: false };
        }

        const chartId = text(existing.id);

        // Cannot identify the old chart safely: never create a duplicate.
        // The data block is already refreshed, so the old chart still shows it.
        if (!chartId || typeof this.grid.deleteChart !== 'function') {
            return { chart: existing, updated: true };
        }

        // Delete ONLY this Pivot's chart, and keep the user's Dashboard layout.
        this.grid.deleteChart(chartId);
        await this.settle();

        const nextChart = {
            ...chart,
            top: existing.top ?? chart.top,
            left: existing.left ?? chart.left,
            width: existing.width ?? chart.width,
            height: existing.height ?? chart.height
        };

        return { chart: await this.insertDashboardChart(nextChart), updated: true };
    }

    private async insertDashboardChart(chart: any): Promise<any> {
        if (!this.spreadsheet) {
            throw new Error('Spreadsheet is not ready.');
        }

        if (!(await this.ensureDashboard())) {
            throw new Error('Dashboard sheet could not be created.');
        }

        // EJ2 20.4.x: a null top-level sheet crashes chart drag/resize later.
        this.repairSheets();
        await yieldToBrowser();

        if (!(await this.waitForSheet(DASHBOARD_SHEET))) {
            throw new Error('Dashboard sheet is not available after sheet repair.');
        }

        const range = text(chart?.range);

        if (!range) {
            throw new Error('Chart source range is empty.');
        }

        // Validate referenced sheets BEFORE the chart range is processed.
        for (const name of getChartReferencedSheetNames(range)) {
            const sheet = await this.waitForSheet(name);

            if (!sheet) {
                throw new Error(`Chart source sheet "${name}" is not available.`);
            }

            if (!Array.isArray(sheet.rows) || !sheet.rows.length) {
                throw new Error(`Chart source sheet "${name}" does not contain rows yet.`);
            }
        }

        await this.activateSheet(DASHBOARD_SHEET);
        await this.settle(); // chart creation is overlay-based

        if (this.activeSheetName !== DASHBOARD_SHEET) {
            throw new Error('Dashboard sheet is not active.');
        }

        if (typeof this.grid.insertChart !== 'function') {
            throw new Error('insertChart is not available in this Syncfusion Spreadsheet build.');
        }

        const model: any = {
            type: chart.type || 'Column',
            theme: chart.theme || 'Material',
            isSeriesInRows: chart.isSeriesInRows ?? false,
            range,
            height: chart.height || 290,
            width: chart.width || 480,
            top: chart.top ?? 20,
            left: chart.left ?? 20
        };

        if (chart.title) {
            model.title = chart.title;
        }

        this.grid.insertChart([model]);
        await this.settle();

        // A Dashboard chart with this range (the one with this title wins).
        const matches = getSheetCharts(this.findSheet(DASHBOARD_SHEET)).filter(c => text(c?.range) === range);
        const inserted =
            matches.find(c => model.title && text(c?.title) === text(model.title)) ??
            matches[matches.length - 1] ??
            model;

        this.resizeLater(100);

        return inserted;
    }

    private toSheetChartType(type: string): string {
        const map: Record<string, string> = { Spline: 'Line', SplineArea: 'Area' };
        const known = [
            'Column', 'Bar', 'Line', 'Area', 'Pie', 'Doughnut', 'Scatter',
            'StackingColumn', 'StackingBar', 'StackingArea'
        ];

        return map[type] ?? (known.includes(type) ? type : 'Column');
    }

    // =====================================================
    // SHEET HELPERS (repair / ensure / wait / activate)
    // =====================================================

    /** Removes null/empty entries from the live sheet list (they crash chart handlers). */
    private repairSheets(): void {
        if (!this.spreadsheet) {
            return;
        }

        const current: any[] = Array.isArray(this.grid.sheets) ? this.grid.sheets : [];
        const valid = current.filter(s => !!s && typeof s === 'object' && Object.keys(s).length > 0);

        if (valid.length === current.length) {
            return;
        }

        const activeName = this.activeSheetName;

        this.grid.sheets = valid;

        let next = activeName
            ? valid.findIndex(s => text(s?.name) === activeName)
            : Number(this.grid.activeSheetIndex ?? 0);

        if (next < 0 || next >= valid.length) {
            next = 0;
        }

        this.grid.activeSheetIndex = next;
    }

    /** Returns the ONE Dashboard sheet, creating it when missing. */
    private async ensureDashboard(): Promise<any> {
        if (!this.spreadsheet) {
            return null;
        }

        this.repairSheets();

        // Case-insensitive, so a casing mismatch never creates "Dashboard (2)".
        const existing = this.allSheets.find(s => this.isDashboard(s));

        if (existing) {
            return existing;
        }

        // Parallel chart operations share ONE creation promise.
        if (!this.dashboardPromise) {
            this.dashboardPromise = this.createDashboardSheet();
        }

        try {
            return await this.dashboardPromise;
        } finally {
            this.dashboardPromise = null;
        }
    }

    private async createDashboardSheet(): Promise<any> {
        const model = [{ name: DASHBOARD_SHEET, rows: [], columns: [] }];

        try {
            this.grid.insertSheet(model, 0);
        } catch {
            this.grid.insertSheet(model);
        }

        await this.settle();
        this.repairSheets();

        return this.waitForSheet(DASHBOARD_SHEET);
    }

    /** Dashboard is always the first (left-most) tab. */
    private async moveDashboardFirst(): Promise<void> {
        const index = this.allSheets.findIndex(s => this.isDashboard(s));

        if (index <= 0 || typeof this.grid.moveSheet !== 'function') {
            return;
        }

        this.grid.moveSheet(0, [index]);
        await yieldToBrowser();
    }

    private async waitForSheet(sheetName: string, attempts = 30): Promise<any> {
        if (!this.spreadsheet) {
            return null;
        }

        for (let i = 0; i < attempts; i++) {
            const sheet = this.findSheet(sheetName);

            if (sheet) {
                return sheet;
            }

            await yieldToBrowser();
        }

        return null;
    }

    private async activateSheet(sheetName: string): Promise<void> {
        if (!this.spreadsheet) {
            throw new Error('Spreadsheet is not ready.');
        }

        this.repairSheets();

        const index = this.allSheets.findIndex((s: any) => s?.name === sheetName);

        if (index < 0) {
            throw new Error(`Spreadsheet sheet "${sheetName}" was not found.`);
        }

        this.grid.activeSheetIndex = index;
        await this.settle();
    }

    private getSheetIdentity(sheetName: string): { sheetId?: number; sheetName: string } {
        const sheet = this.allSheets.find((s: any) => text(s?.name) === text(sheetName));

        const metadata =
            this.sheetSources.find(
                i => i.sheetId != null && sheet?.id != null && Number(i.sheetId) === Number(sheet.id)
            ) ?? this.sheetSources.find(i => text(i?.sheetName) === text(sheetName));

        return {
            sheetId: metadata?.sheetId ?? sheet?.id,
            sheetName: text(sheet?.name ?? sheetName)
        };
    }

    // =====================================================
    // DASHBOARD WIDGET METADATA
    // =====================================================

    /** Creates/updates the widget record of a Pivot chart that was copied to the Dashboard. */
    private registerWidget(pivotName: string, dashboardRange: string, chart: any): void {
        const analysis: any = this.findAnalysis(pivotName);
        const sourceName = text(analysis?.sourceSheetName);

        if (!analysis || !sourceName) {
            console.warn('[Dashboard] Pivot analysis or source sheet missing:', pivotName);
            return;
        }

        if (analysis.id == null) {
            analysis.id = Date.now();
        }

        // The widget source is the REAL data sheet, not the Pivot tab.
        const source = this.getSheetIdentity(sourceName);
        const chartId = text(chart?.id) || undefined;
        const range = removeSheetFromRange(dashboardRange);

        const existing = this.widgets.find(
            w =>
                w.sourceType === 'PIVOT' &&
                (w.analysisId === analysis.id ||
                    (analysis.dashboardWidgetId != null && w.id === analysis.dashboardWidgetId))
        );

        const widgetId = existing?.id ?? analysis.dashboardWidgetId ?? Date.now();

        const widget: DashboardWidgetMetadata = {
            id: widgetId,
            dashboardSheetName: DASHBOARD_SHEET,
            chartId,
            chartTitle: text(chart?.title ?? analysis.chart?.title ?? `${pivotName} Chart`),
            chartType: String(chart?.type ?? this.toSheetChartType(analysis.chart?.type)),
            sourceType: 'PIVOT',
            sourceSheetId: source.sheetId,
            sourceSheetName: source.sheetName,
            analysisId: analysis.id,
            dashboardDataRange: range
        };

        const index = this.widgets.findIndex(w => w.id === widgetId);

        if (index >= 0) {
            this.widgets[index] = widget;
        } else {
            this.widgets.push(widget);
        }

        this.linkAnalysisToWidget(analysis, widgetId, chartId, range, source);
    }

    private linkAnalysisToWidget(
        analysis: any,
        widgetId: any,
        chartId: string | undefined,
        range: string,
        source: { sheetId?: number; sheetName: string }
    ): void {
        Object.assign(analysis, {
            dashboardWidgetId: widgetId,
            dashboardChartId: chartId,
            dashboardDataRange: range,
            sourceSheetId: source.sheetId,
            sourceSheetName: source.sheetName
        });
    }

    /** Rebuilds widget records from the charts that are really on the saved Dashboard. */
    private rebuildWidgets(workbookJson: any): void {
        const sheets: any[] = getWorkbookRoot(workbookJson)?.sheets ?? [];
        const dashboard = sheets.find(s => text(s?.name) === DASHBOARD_SHEET);

        if (!dashboard) {
            this.widgets = [];
            return;
        }

        const charts = getSheetCharts(dashboard);
        const matched = new Set<any>();

        const pivotWidgets = this.rebuildPivotWidgets(charts, matched);
        const directWidgets = this.rebuildDirectWidgets(charts, matched, pivotWidgets.length);

        this.widgets = [...pivotWidgets, ...directWidgets];
    }

    /**
     * PIVOT widgets come from the analyses (source sheet -> pivot -> Dashboard chart),
     * because a pivot chart points to a LOCAL Dashboard range.
     */
    private rebuildPivotWidgets(charts: any[], matched: Set<any>): DashboardWidgetMetadata[] {
        const widgets: DashboardWidgetMetadata[] = [];

        for (const analysis of this.analyses as any[]) {
            const pivotName = text(analysis.sheetName);
            const sourceName = text(analysis.sourceSheetName);

            if (!analysis.chart || !pivotName || !sourceName) {
                continue;
            }

            if (analysis.id == null) {
                analysis.id = Date.now() + widgets.length;
            }

            const chart = matchPivotChart(analysis, charts.filter(c => !matched.has(c)));

            // Analysis exists but its chart is not on the Dashboard: no stale widget.
            if (!chart) {
                continue;
            }

            matched.add(chart);

            const source = this.getSheetIdentity(sourceName);
            const chartId = text(chart.id) || text(analysis.dashboardChartId) || undefined;
            const range = removeSheetFromRange(chart.range) || text(analysis.dashboardDataRange);
            const widgetId = analysis.dashboardWidgetId ?? Date.now() + widgets.length;

            widgets.push({
                id: widgetId,
                dashboardSheetName: DASHBOARD_SHEET,
                chartId,
                chartTitle: text(chart.title) || text(analysis.chart?.title),
                chartType: String(chart.type ?? this.toSheetChartType(analysis.chart?.type)),
                sourceType: 'PIVOT',
                sourceSheetId: source.sheetId,
                sourceSheetName: source.sheetName,
                analysisId: analysis.id,
                dashboardDataRange: range
            });

            // Backfill so the next save has stable, explicit links.
            this.linkAnalysisToWidget(analysis, widgetId, chartId, range, source);
        }

        return widgets;
    }

    /** DIRECT widgets: remaining Dashboard charts that read another sheet's range. */
    private rebuildDirectWidgets(charts: any[], matched: Set<any>, pivotCount: number): DashboardWidgetMetadata[] {
        const widgets: DashboardWidgetMetadata[] = [];

        for (const chart of charts) {
            if (matched.has(chart)) {
                continue;
            }

            const chartId = text(chart?.id) || undefined;
            const chartRange = text(chart?.range);
            const sourceName = getChartReferencedSheetNames(chartRange).find(name => name !== DASHBOARD_SHEET);

            // A Dashboard-local range with no matching analysis is not DIRECT.
            if (!sourceName) {
                continue;
            }

            const source = this.getSheetIdentity(sourceName);

            const previous = this.widgets.find(
                w =>
                    w.sourceType === 'DIRECT' &&
                    ((chartId && w.chartId === chartId) ||
                        (w.sourceSheetName === source.sheetName && w.sourceRange === chartRange))
            );

            widgets.push({
                id: previous?.id ?? Date.now() + pivotCount + widgets.length,
                dashboardSheetName: DASHBOARD_SHEET,
                chartId,
                chartTitle: String(chart?.title ?? ''),
                chartType: String(chart?.type ?? 'Column'),
                sourceType: 'DIRECT',
                sourceSheetId: source.sheetId,
                sourceSheetName: source.sheetName,
                sourceRange: chartRange
            });
        }

        return widgets;
    }

    // =====================================================
    // PER-SHEET SOURCE METADATA
    // =====================================================

    private cloneSource(source: SpreadsheetDataSource): SpreadsheetDataSource {
        return {
            ...source,
            selectedIds: source.selectedIds ? [...source.selectedIds] : undefined,
            columns: source.columns ? [...source.columns] : undefined,
            filters: { ...(source.filters ?? {}) }
        };
    }

    private cloneSheetSources(items: SpreadsheetSheetDataSource[]): SpreadsheetSheetDataSource[] {
        return (items ?? []).map(item => ({
            sheetId: item.sheetId,
            sheetName: item.sheetName,
            sheetRecordIds: [...(item.sheetRecordIds ?? [])],
            source: this.cloneSource(item.source)
        }));
    }

    private upsertSheetSource(metadata: SpreadsheetSheetDataSource): void {
        const name = text(metadata.sheetName);

        if (!name || name === DASHBOARD_SHEET) {
            return;
        }

        const index = this.sheetSources.findIndex(item => text(item.sheetName) === name);
        const previous = index >= 0 ? this.sheetSources[index] : null;

        const clean: SpreadsheetSheetDataSource = {
            sheetId: metadata.sheetId,
            sheetName: name,
            sheetRecordIds: [...(metadata.sheetRecordIds ?? previous?.sheetRecordIds ?? [])],
            source: this.cloneSource(metadata.source)
        };

        if (index >= 0) {
            this.sheetSources[index] = clean;
        } else {
            this.sheetSources.push(clean);
        }

        this.sheetRecordIds[name] = [...clean.sheetRecordIds];
    }

    /** Syncs ids/names before save (also handles renamed/deleted tabs). */
    private syncSheetIdentity(): void {
        const existingSheets = this.allSheets.filter((sheet: any) => !!text(sheet?.name));
        const existingNames = new Set(existingSheets.map((sheet: any) => text(sheet.name)));

        this.sheetSources = this.sheetSources.flatMap(item => {
            const sheet =
                existingSheets.find((x: any) => text(x?.name) === text(item.sheetName)) ??
                (item.sheetId != null ? existingSheets.find((x: any) => x?.id === item.sheetId) : null);

            return sheet
                ? [{
                    sheetId: sheet.id,
                    sheetName: text(sheet.name),
                    sheetRecordIds: [...(item.sheetRecordIds ?? [])],
                    source: this.cloneSource(item.source)
                }]
                : [];
        });

        this.analyses = this.analyses.filter(
            a => existingNames.has(text(a.sheetName)) && existingNames.has(text((a as any).sourceSheetName))
        );

        this.widgets = this.widgets.filter(w => !w.sourceSheetName || existingNames.has(text(w.sourceSheetName)));
    }

    // ---- Active-tab watcher ----

    private startSheetWatcher(): void {
        this.stopSheetWatcher();

        if (!this.spreadsheet) {
            return;
        }

        let previousSheetName = '';
        let previousHasSource: boolean | null = null;

        const checkActiveSheet = () => {
            if (!this.spreadsheet || this.isSyncingPivotDashboard) {
                return;
            }

            const sheetName = this.activeSheetName;
            const hasSource = !!this.activeSheetSource;

            if (sheetName !== previousSheetName || hasSource !== previousHasSource) {
                previousSheetName = sheetName;
                previousHasSource = hasSource;

                this.syncSheetToUi();
                void this.syncPivotForActiveSheet();
            }

            // Also synchronize on initial load and after ribbon rendering.
            this.updateListRibbonButton();
        };

        checkActiveSheet();

        this.sheetWatcher = setInterval(checkActiveSheet, 100);
    }

    private stopSheetWatcher(): void {
        if (this.sheetWatcher) {
            clearInterval(this.sheetWatcher);
            this.sheetWatcher = null;
        }
    }

    private syncSheetToUi(): void {
        this.updateListRibbonButton();
        this.cdr.detectChanges();
    }

    onSpreadsheetActionComplete(args: any): void {
        if (this.ignoreSpreadsheetChanges) {
            return;
        }

        const action = text(args?.action ?? args?.requestType ?? args?.eventArgs?.requestType).toLowerCase();

        if (['select', 'selection', 'cellselect', 'gotocell'].includes(action)) {
            return;
        }

        this.markDirty();

        if (['sheet', 'rename', 'insert', 'delete'].some(keyword => action.includes(keyword))) {
            setTimeout(() => {
                this.syncSheetIdentity();
                this.syncSheetToUi();
            }, 0);
        }
    }

    // =====================================================
    // SAVE
    // =====================================================

    /** Current workbook + metadata in the saved format (shared by Save and Refresh). */
    private async buildSavedState(): Promise<SpreadsheetPayload> {
        this.updateAnalysis();
        this.syncSheetIdentity();

        const rawWorkbook = await this.grid.saveAsJson(this.saveOptions);

        return {
            workbookJson: this.reconcileDashboardCharts(rawWorkbook),
            sheetDataSources: this.cloneSheetSources(this.sheetSources),
            sheetAnalyses: clone(this.analyses),
            dashboardWidgets: clone(this.widgets),
            updatedDate: this.spreadsheetUpdatedDate,
            lastRefreshDate: this.lastRefreshDate,
            refreshedBy: this.refreshedBy
        };
    }

    async saveSpreadsheet(): Promise<void> {
        if (!this.spreadsheet) {
            this.notify.warn('Spreadsheet is not ready.');
            return;
        }

        const dashboardId = this.dashboardId;

        if (!dashboardId) {
            this.notify.error('Dashboard id is missing.');
            return;
        }

        this.showLoading('Saving Spreadsheet...');

        try {
            const state = await this.buildSavedState();

            this.rebuildWidgets(state.workbookJson);
            state.dashboardWidgets = clone(this.widgets);
            state.updatedDate = moment().format('YYYY-MM-DDTHH:mm:ss.SSS') + '0000';
            this.updateRefreshInfo(state);
// state.updatedDate = state.lastRefreshDate;

            await firstValueFrom(
                this.dashboardService.saveSpreadSheetJson(dashboardId, {
                    ...state,
                    recordCount: this.countRecords(state.workbookJson)
                } as any)
            );

            this.isDirty = false;
            this.notify.success('Spreadsheet saved successfully.');
        } catch (error) {
            console.error('[Spreadsheet] SaveSpreadSheetJson failed:', error);
            this.notify.error('Failed to save Spreadsheet.');
        } finally {
            this.hideLoading();
            this.cdr.detectChanges();
        }
    }

    private countRecords(workbook: any): number {
        const sheets: any[] = getWorkbookRoot(workbook)?.sheets ?? [];
        const sourceSheetNames = new Set(this.sheetSources.map(source => text(source.sheetName)));

        return sheets
            .filter(sheet => sourceSheetNames.has(text(sheet?.name)))
            .reduce((total, sheet) => total + Math.max((sheet?.rows?.length ?? 0) - 1, 0), 0);
    }

    /** Removes null/invalid entries from saved JSON so Syncfusion can reopen it safely. */
    private cleanWorkbookJson(workbookJson: any): any {
        if (!workbookJson) {
            return workbookJson;
        }

        const cleanJson = clone(workbookJson);
        const workbook = getWorkbookRoot(cleanJson);

        if (!workbook) {
            return cleanJson;
        }

        const dropInvalid = (items: any) =>
            Array.isArray(items) ? items.filter(x => x && typeof x === 'object') : items;

        // Top-level sheets must NEVER contain null/undefined.
        workbook.sheets = (Array.isArray(workbook.sheets) ? workbook.sheets : [])
            .filter((s: any) => s && typeof s === 'object' && Object.keys(s).length > 0)
            .map((sheet: any) => {
                // Sparse positions become {} (not removed) because indexes matter.
                if (Array.isArray(sheet.columns)) {
                    sheet.columns = sheet.columns.map((c: any) => c ?? {});
                }

                if (Array.isArray(sheet.rows)) {
                    sheet.rows = sheet.rows.map((row: any) => {
                        if (!row) {
                            return {};
                        }

                        if (Array.isArray(row.cells)) {
                            row.cells = row.cells.map((cell: any) => cell ?? {});
                        }

                        return row;
                    });
                }

                sheet.ranges = dropInvalid(sheet.ranges);
                sheet.charts = dropInvalid(sheet.charts);
                sheet.images = dropInvalid(sheet.images);

                return sheet;
            });

        if (!workbook.sheets.length) {
            workbook.sheets = [{ name: 'Sheet1', rows: [], columns: [] }];
        }

        const activeIndex = Number(workbook.activeSheetIndex ?? 0);

        workbook.activeSheetIndex =
            Number.isFinite(activeIndex) && activeIndex >= 0 && activeIndex < workbook.sheets.length
                ? activeIndex
                : 0;

        return cleanJson;
    }

    /**
     * A manual Ctrl+X / Ctrl+V chart move is reconciled only while Dashboard is
     * active, so charts on data sheets are never moved accidentally.
     * Only the chart OWNER changes; the source range is preserved.
     */
    private reconcileDashboardCharts(workbookJson: any): any {
        if (!this.spreadsheet || !workbookJson || this.activeSheetName !== DASHBOARD_SHEET) {
            return workbookJson;
        }

        const cleaned = clone(workbookJson);
        const workbook = getWorkbookRoot(cleaned);
        const dashboard = (workbook?.sheets ?? []).find((s: any) => text(s?.name) === DASHBOARD_SHEET);

        if (!dashboard) {
            return cleaned;
        }

        const forEachCell = (callback: (cell: any) => void) =>
            workbook.sheets.forEach((sheet: any) =>
                (sheet?.rows ?? []).forEach((row: any) => (row?.cells ?? []).forEach(callback))
            );

        const chartById = new Map<string, any>();

        forEachCell(cell => {
            (Array.isArray(cell?.chart) ? cell.chart : []).forEach((chart: any) => {
                const id = text(chart?.id);

                if (id && !chartById.has(id)) {
                    chartById.set(id, clone(chart));
                }
            });
        });

        // Charts that are really visible on screen, with their current position/size.
        const spreadsheetElement: HTMLElement | null = (this.grid.element as HTMLElement) ?? null;
        const movedCharts: any[] = [];

        chartById.forEach((chart, chartId) => {
            const element = document.getElementById(chartId) as HTMLElement | null;

            // Must exist and belong to THIS spreadsheet instance.
            if (!element || (spreadsheetElement && !spreadsheetElement.contains(element))) {
                return;
            }

            const style = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            const visible =
                style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;

            if (!visible) {
                return;
            }

            movedCharts.push({
                ...clone(chart),
                top: readPixelValue(element.style.top, chart.top ?? 20),
                left: readPixelValue(element.style.left, chart.left ?? 20),
                width: Math.round(rect.width || chart.width || 480),
                height: Math.round(rect.height || chart.height || 290)
            });
        });

        if (!movedCharts.length) {
            return cleaned;
        }

        // Remove ALL stale/duplicate copies from every saved sheet.
        const movedIds = new Set(movedCharts.map(c => text(c?.id)).filter(Boolean));

        forEachCell(cell => {
            if (!Array.isArray(cell?.chart)) {
                return;
            }

            cell.chart = cell.chart.filter((c: any) => !movedIds.has(text(c?.id)));

            if (!cell.chart.length) {
                delete cell.chart;
            }
        });

        // Store the charts in a real Dashboard cell so save/reopen owns them.
        dashboard.rows = Array.isArray(dashboard.rows) ? dashboard.rows : [];
        dashboard.rows[0] = dashboard.rows[0] ?? {};
        dashboard.rows[0].cells = Array.isArray(dashboard.rows[0].cells) ? dashboard.rows[0].cells : [];
        dashboard.rows[0].cells[0] = dashboard.rows[0].cells[0] ?? {};

        const dashboardCharts: any[] = Array.isArray(dashboard.rows[0].cells[0].chart)
            ? dashboard.rows[0].cells[0].chart
            : [];

        const existingIds = new Set(dashboardCharts.map(c => text(c?.id)).filter(Boolean));

        movedCharts.forEach(chart => {
            const id = text(chart?.id);

            if (!id || !existingIds.has(id)) {
                dashboardCharts.push(chart);

                if (id) {
                    existingIds.add(id);
                }
            }
        });

        dashboard.rows[0].cells[0].chart = dashboardCharts;
        dashboard.usedRange = dashboard.usedRange ?? {};
        dashboard.usedRange.rowIndex = Math.max(Number(dashboard.usedRange.rowIndex ?? 0), 0);
        dashboard.usedRange.colIndex = Math.max(Number(dashboard.usedRange.colIndex ?? 0), 0);

        return cleaned;
    }

    private updateRefreshInfo(state: SpreadsheetPayload): void {
    const user = this.appSession.user;
    const tenant = this.appSession.tenant;

    const fullName = [
        user?.name,
        user?.surname
    ].filter(Boolean).join(' ');

    const now =
        moment().format('YYYY-MM-DDTHH:mm:ss.SSS') + '0000';

    state.lastRefreshDate = now;
    state.refreshedBy =
        `${fullName}`;
}
    async refreshSpreadsheet(): Promise<void> {
        if (this.isRefreshing || !this.spreadsheet || !this.dashboardId) {
            return;
        }

        this.isRefreshing = true;
        this.showLoading('Refreshing Spreadsheet...');

        const activeSheetBefore = this.activeSheetName;
        const pivotBefore = this.showPivot ? text(this.pivotSheet) : '';

        try {
            this.closeChartPanel();
            this.closeDataPanel();

            if (this.showPivot) {
                await this.closePivot();
            }

            const current = await this.buildSavedState();

            const refreshed = await this.refreshService.refresh(current, {
                tenantId: this.appSession.tenantId,
                highlight: true,
                onProgress: (message, done, total) => {
                    this.loadingMessage = message;
                    this.setProgress(done, total);
                }
            });

            // Save only after all source sheets and charts are refreshed.
            this.loadingMessage = 'Saving refreshed Spreadsheet...';

           this.updateRefreshInfo(refreshed);
refreshed.updatedDate = refreshed.lastRefreshDate;

            await firstValueFrom(
                this.dashboardService.saveSpreadSheetJson(this.dashboardId, {
                    ...refreshed,
                    recordCount: this.countRecords(refreshed.workbookJson)
                } as any)
            );

            // Reopen the exact workbook that was saved.
            this.ignoreSpreadsheetChanges = true;
            await this.openWorkbook(refreshed);

            if (
                activeSheetBefore &&
                this.findSheet(activeSheetBefore) &&
                this.activeSheetName !== activeSheetBefore
            ) {
                await this.activateSheet(activeSheetBefore);
            }

            const pivotAnalysis = pivotBefore
                ? this.findAnalysis(pivotBefore)
                : null;

            if (pivotAnalysis) {
                await this.openPivot(pivotAnalysis);
            }

            this.isDirty = false;
            this.notify.success(
                'Spreadsheet refreshed and saved successfully.'
            );

        } catch (error) {
            console.error('[Spreadsheet] Refresh or save failed:', error);
            this.notify.error(
                'Unable to complete Spreadsheet refresh and save.'
            );
        } finally {
            this.ignoreSpreadsheetChanges = false;
            this.isRefreshing = false;
            this.hideLoading();
            this.cdr.detectChanges();
            this.resizeLater(100);
        }
    }

    async onDataSourceCleared(sheetName: string): Promise<void> {

        if (!this.spreadsheet || !sheetName) {
            return;
        }

        const sheet = this.findSheet(sheetName);

        if (!sheet) {
            this.notify.warn('Worksheet not found.');
            return;
        }

        const hasSource = this.sheetSources.some(
            source => source.sheetName === sheetName
        );

        if (!hasSource) {
            this.notify.warn('No linked data source found.');
            return;
        }

        try {

            await this.clearSheetForEdit(sheetName);
            this.sheetSources = this.sheetSources.filter(
                source => source.sheetName !== sheetName
            );
            delete this.sheetRecordIds[sheetName];
            this.newDataSheetName = null;
            this.newDataSheetFields = [];
            this.newDataSheetLoadedRows = 0;
            this.closeDataPanel();
            this.updateListRibbonButton();
            this.markDirty();
            this.notify.success(
                'Data source removed and worksheet cleared. Click Save to persist.'
            );

        } catch (error) {

            console.error(
                '[Spreadsheet] Failed to clear data source:',
                error
            );

            this.notify.error(
                'Unable to clear worksheet data.'
            );
        }
    }

}