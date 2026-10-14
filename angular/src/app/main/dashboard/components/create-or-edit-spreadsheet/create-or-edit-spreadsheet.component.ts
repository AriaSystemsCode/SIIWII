import { ChangeDetectorRef, Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

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


import * as moment from 'moment';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

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
    isDirty = false;
    private ignoreSpreadsheetChanges = true;

    // ---- Spreadsheet ----
    sheets: SheetModel[] = [];
    readonly scrollSettings: any = { enableVirtualization: true, isFinite: false };
    readonly showAggregate = false;
    private readonly saveOptions: any = { ignoreImage: false, ignoreNote: false };

    // ---- Loading bar ----
    isLoading = false;
    loadingProgress = 0;
    loadingMessage = '';
    isRefreshing = false;
    dashboardLastUpdatedDate: any = null;

    // ---- Metadata saved with the workbook ----
    sheetSources: SpreadsheetSheetDataSource[] = [];
    analyses: SavedSheetAnalysis[] = [];
    widgets: DashboardWidgetMetadata[] = [];

    /** Filters of the active tab (shown in the header). */
    currentFilters: any = null;

    private sheetWatcher: any = null;
    private lastSheetIndex = -1;
    private dashboardPromise: Promise<any> | null = null;

    // ---- "Add data" panel ----
    showDataPanel = false;
    private newDataSheetName: string | null = null;
    private newDataSheetLoadedRows = 0;

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
    pivotChartTypes = ['Column', 'Bar', 'Area', 'Pie', 'Doughnut', 'Line', 'Scatter'].map(t => ({
        label: t,
        value: t
    }));
    selectedPivotChartType = 'Column';

    // ---- Chart panel ----
    showChartPanel = false;
    selectedChart: any = null;
    chartSheet: string | null = null;
    chartRange = '';
    categoryRange = '';
    seriesRanges: Array<{ range: string }> = [];
    isApplyingChart = false;

    spreadsheetUpdatedDate: string | null = null;

    dashboardTtle: string = ''

    // @ViewChild('listMenu') listMenu!: Menu;

    // listMenuItems: MenuItem[] = [
    //     {
    //         label: 'New Data Source',
    //         icon: 'pi pi-plus',
    //         command: () => this.openDataPanel()
    //     },
    //     {
    //         label: 'See List Properties',
    //         icon: 'pi pi-pencil',
    //         command: () => this.editActiveSheetFilters()
    //     }
    // ];


    chartAggregation: ChartAggregation = 'None';

    chartAggregationOptions = [
        { label: 'No Aggregation', value: 'None' },
        { label: 'Sum', value: 'Sum' },
        { label: 'Count', value: 'Count' },
        { label: 'Average', value: 'Average' },
        { label: 'Minimum', value: 'Min' },
        { label: 'Maximum', value: 'Max' }
    ];


    private listRibbonObserver: MutationObserver | null = null;
    private lastListRibbonLabel = '';

    constructor(
        injector: Injector,
        private route: ActivatedRoute,
        private dashboardService: AppDashboardServiceProxy,
        private cdr: ChangeDetectorRef
    ) {
        super(injector);
    }

    // =====================================================
    // SMALL HELPERS
    // =====================================================

    /** Untyped access to Syncfusion APIs missing from the typings. */
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

    private findSheet(name: string): any {
        return this.allSheets.find((s: any) => s?.name === name);
    }

    private isDashboard(sheet: any): boolean {
        return text(sheet?.name).trim().toLowerCase() === DASHBOARD_SHEET.toLowerCase();
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


    private aggregateChartValues(
        values: number[],
        method: ChartAggregation,
        recordCount: number
    ): number {

        if (method === 'Count') {
            return recordCount;
        }

        if (!values.length) {
            return 0;
        }

        switch (method) {
            case 'Sum':
                return values.reduce((a, b) => a + b, 0);

            case 'Average':
                return values.reduce((a, b) => a + b, 0)
                    / values.length;

            case 'Min':
                return Math.min(...values);

            case 'Max':
                return Math.max(...values);

            default:
                return values[0];
        }
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

    private quoteSheetName(sheetName: string): string {
        const name = text(sheetName);
        return /[\s()'!]/.test(name) ? `'${name.replace(/'/g, "''")}'` : name;
    }

    /** "Dashboard!AZ1:BA15" -> "AZ1:BA15" */
    private removeSheetFromRange(range: string): string {
        const value = text(range);
        return value.substring(value.lastIndexOf('!') + 1);
    }

    private formatDate(value: any): string {
        if (!value) {
            return '';
        }

        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
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

    // =====================================================
    // LIFECYCLE / LOAD
    // =====================================================

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            this.dashboardId = id ? Number(id) : null;
        });
    }

    ngOnDestroy(): void {
        this.stopSheetWatcher();
        this.stopListRibbonObserver();
        clearTimeout(this.pivotSyncTimer);
    }
    onCreated(): void {
        if (!this.spreadsheet) return;

        this.addRibbonButtons();

        this.startListRibbonObserver();

        this.loadDashboard();
    }
    private loadDashboard(): void {
        if (!this.dashboardId || !this.spreadsheet) {
            return;
        }
        this.ignoreSpreadsheetChanges = true;
        this.dashboardService.getDashboardForView(this.dashboardId).subscribe({
            next: async (result: any) => {
                try {
                    const dashboard = result?.dashboard ?? result;

                    this.dashboardLastUpdatedDate =
                        dashboard?.lastModificationDate ?? null;
                    this.dashboardTtle =
                        dashboard?.title ?? null;
                    const saved = dashboard?.spreadsheet;

                    if (saved) {
                        await this.openWorkbook(saved);
                    } else {
                        await this.createEmptyWorkbook();
                    }
                } catch (error) {
                    console.error('[Spreadsheet] Failed to initialize dashboard spreadsheet:', error);
                    this.notify.error('Unable to open Spreadsheet.');
                } finally {
                    this.isDirty = false;
                    this.ignoreSpreadsheetChanges = false;

                    // Workbook and sheetSources are now restored.
                    this.syncSheetIdentity();
                    this.syncSheetToUi();

                    // Start watching only after loading.
                    this.startSheetWatcher();

                    // Force the initial ribbon state.
                    setTimeout(() => {
                        this.syncSheetToUi();
                        this.updateListRibbonButton();
                        this.cdr.detectChanges();
                    }, 200);
                }
            },
            error: (error: any) => {
                console.error('[Spreadsheet] Failed to load dashboard:', error);
                this.notify.error('Unable to load Dashboard.');
            }
        });
    }

    private async openWorkbook(saved: any): Promise<void> {
        const data = typeof saved === 'string'
            ? JSON.parse(saved)
            : saved;

        this.sheetSources = this.cloneSheetSources(
            data?.sheetDataSources ?? []
        );

        this.analyses = clone(data?.sheetAnalyses ?? []);
        this.widgets = clone(data?.dashboardWidgets ?? []);
        this.spreadsheetUpdatedDate = data?.updatedDate ?? null;
        this.currentFilters = null;

        const workbook = this.cleanWorkbookJson(
            data?.workbookJson ?? data
        );

        this.grid.openFromJson(
            { file: workbook?.jsonObject ?? workbook },
            this.saveOptions
        );

        await new Promise(resolve => setTimeout(resolve, 500));

        await this.ensureDashboard();
        await this.moveDashboardFirst();

        this.syncSheetIdentity();
        this.syncSheetToUi();

        // Detect the initially active sheet after loading.
        this.lastSheetIndex = Number(
            this.grid.activeSheetIndex ?? 0
        );

        setTimeout(() => {
            this.updateListRibbonButton();
        }, 0);

        this.spreadsheet?.resize();
    }

    /** New dashboard spreadsheet: starts with the Dashboard sheet only. */
    private async createEmptyWorkbook(): Promise<void> {
        this.sheetSources = [];
        this.analyses = [];
        this.widgets = [];
        this.currentFilters = null;

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
    // CHART PANEL
    // =====================================================

    onSheetClick(event: MouseEvent): void {
        const target = event.target as HTMLElement | null;

        if (!target || !this.spreadsheet) {
            return;
        }

        // 1. Detect whether the user clicked a chart.
        const overlay = target.closest(
            '.e-datavisualization-chart'
        ) as HTMLElement | null;

        if (!overlay) {
            return;
        }

        // 2. Get possible chart IDs from the rendered elements.
        const innerChart = overlay.querySelector(
            '.e-control'
        ) as HTMLElement | null;

        const chartId = text(innerChart?.id);
        const overlayId = text(overlay.id);

        // 3. Find the corresponding workbook chart model.
        const chart = this.findChart(chartId, overlayId);

        if (!chart) {
            console.warn(
                '[Chart Panel] Chart not found in workbook:',
                {
                    chartId,
                    overlayId,
                    activeSheet: this.activeSheetName,
                    availableCharts: this.allSheets.map(sheet => ({
                        sheetName: sheet.name,
                        charts: this.getSheetCharts(sheet).map(
                            (item: any) => ({
                                id: item.id,
                                range: item.range
                            })
                        )
                    }))
                }
            );

            this.notify.warn(
                'Unable to find the selected chart in the workbook.'
            );

            return;
        }

        // 4. Find the sheet that owns the chart.
        const ownerSheet = this.allSheets.find(sheet =>
            this.getSheetCharts(sheet).some(
                (item: any) =>
                    item === chart ||
                    text(item?.id) === text(chart?.id)
            )
        );

        const ownerSheetName =
            text(ownerSheet?.name) || this.activeSheetName;

        // 5. Store the actual chart model.
        this.selectedChart = chart;
        this.chartSheet = ownerSheetName;

        // 6. Restore saved aggregation.
        this.chartAggregation =
            (chart.aggregation as ChartAggregation) || 'None';

        // 7. Restore original chart data range.
        this.chartRange = text(
            chart.originalRange ?? chart.range
        );

        // 8. Restore category and data-series ranges.
        if (
            chart.categoryRange &&
            Array.isArray(chart.seriesRanges) &&
            chart.seriesRanges.length
        ) {
            this.categoryRange = text(chart.categoryRange);

            this.seriesRanges = chart.seriesRanges
                .map((range: any) => ({
                    range: text(
                        typeof range === 'string'
                            ? range
                            : range?.range
                    )
                }))
                .filter((item: any) => !!item.range);

        } else {
            // For newly inserted charts, derive the ranges
            // from the original selected chart range.
            this.splitRangeToSeries();
        }

        // 9. Show the chart configuration panel.
        this.showDataPanel = false;
        this.showChartPanel = true;

        this.cdr.detectChanges();
        this.resizeLater(100);

        console.log('[Chart Panel] Selected chart:', {
            domId: chartId,
            overlayId,
            modelId: chart.id,
            ownerSheet: ownerSheetName,
            range: chart.range,
            originalRange: this.chartRange,
            categoryRange: this.categoryRange,
            seriesRanges: this.seriesRanges,
            aggregation: this.chartAggregation
        });
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
        this.seriesRanges = this.seriesRanges.filter((_series, i) => i !== index);
    }

    /** Applies independent category + series ranges (they do not need to be adjacent). */
    async applyChart(): Promise<void> {
        if (!this.selectedChart || !this.chartSheet) {
            return;
        }

        const categoryText = text(this.categoryRange);
        const seriesTexts = this.seriesRanges.map(s => text(s.range)).filter(Boolean);
        const parsed = this.parseChartInputs(categoryText, seriesTexts);

        if (!parsed) {
            return;
        }

        const ownerSheet = this.chartSheet;
        const chartId = text(this.selectedChart.id);

        this.isApplyingChart = true;

        try {
            const helperRange = await this.buildHelperRange(ownerSheet, chartId, parsed.category, parsed.series);

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

            this.notify.success('Chart data updated.');
        } catch (error) {
            console.error('[Chart Panel] unable to update chart data:', error);
            this.notify.error('Unable to update chart data.');
        } finally {
            this.isApplyingChart = false;
            this.cdr.detectChanges();
        }
    }

    /** Validates the panel input. Warns the user and returns null when invalid. */
    private parseChartInputs(
        categoryText: string,
        seriesTexts: string[]
    ): { category: ParsedRange; series: ParsedRange[] } | null {
        const warn = (message: string): null => {
            this.notify.warn(message);
            return null;
        };

        if (!categoryText) {
            return warn('Choose a Category / X Axis range.');
        }

        if (!seriesTexts.length) {
            return warn('Choose at least one data series.');
        }

        const category = this.parseRange(categoryText);
        const series = seriesTexts.map(r => this.parseRange(r)).filter((r): r is ParsedRange => !!r);

        if (!category || series.length !== seriesTexts.length) {
            return warn('One or more chart ranges are invalid.');
        }

        const all = [category, ...series];

        if (all.some(r => r.startColumnIndex !== r.endColumnIndex)) {
            return warn('Category and each data series must contain one column only.');
        }

        const rowCount = category.endRow - category.startRow + 1;

        if (all.some(r => r.endRow - r.startRow + 1 !== rowCount)) {
            return warn('Category and all data series must contain the same number of rows.');
        }

        const missing = all.find(r => !this.findSheet(r.sheetName));

        if (missing) {
            return warn(`Sheet "${missing.sheetName}" was not found.`);
        }

        return { category, series };
    }

    /** Deletes the selected chart and inserts it again with changed properties. */
    private async replaceChart(
        ownerSheetName: string,
        changes: any
    ): Promise<void> {

        const oldChart = this.selectedChart;

        if (!oldChart) {
            throw new Error('No chart selected.');
        }

        const chartId = text(oldChart.id);

        if (!chartId) {
            throw new Error('Selected chart has no ID.');
        }

        const ownerSheet = this.findSheet(ownerSheetName);

        if (!ownerSheet) {
            throw new Error(`Sheet "${ownerSheetName}" not found.`);
        }

        if (
            typeof this.grid.deleteChart !== 'function' ||
            typeof this.grid.insertChart !== 'function'
        ) {
            throw new Error(
                'Syncfusion chart delete/insert APIs are unavailable.'
            );
        }

        // Search all workbook sheets, not only the active one.
        const workbookCharts = this.allSheets.reduce(
            (result: any[], sheet: any) => {
                return result.concat(this.getSheetCharts(sheet));
            },
            []
        );

        const allCharts = [
            ...workbookCharts,
            ...(this.grid.chartColl ?? [])
        ];

        const model = allCharts.find(
            (chart: any) =>
                chart === oldChart ||
                text(chart?.id) === chartId
        );

        if (!model) {
            console.error('[Chart Panel] Missing chart model', {
                selectedId: chartId,
                availableIds: allCharts.map(c => c?.id),
                selectedChart: oldChart
            });

            throw new Error(
                `Chart "${chartId}" is not registered in the workbook. ` +
                'Recreate this chart from the Insert ribbon.'
            );
        }

        // Preserve original chart appearance and location.
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

        if (!replacement.range) {
            throw new Error('New chart range is empty.');
        }

        await this.activateSheet(ownerSheetName);
        await this.settle();

        // Delete through the Spreadsheet API.
        this.grid.deleteChart(chartId);

        await this.settle();

        // Ensure the old model is gone before inserting.
        const stillExists = this.allSheets.some(sheet =>
            this.getSheetCharts(sheet).some(
                (chart: any) => text(chart?.id) === chartId
            )
        );

        if (stillExists) {
            throw new Error(
                `Syncfusion did not remove chart "${chartId}". ` +
                'A replacement was not inserted to avoid duplicates.'
            );
        }

        // Insert with the aggregated helper range.
        this.grid.insertChart([replacement]);

        await this.settle();

        // Find the new chart model.
        const updatedSheet = this.findSheet(ownerSheetName);

        const newChart = this.getSheetCharts(updatedSheet)
            .find((chart: any) =>
                text(chart?.range) === text(changes.range)
            );

        if (!newChart) {
            throw new Error(
                'Replacement chart was not found after insertion.'
            );
        }

        // Save custom panel settings on the new model.
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

        console.log('[Chart Panel] Chart replaced', {
            oldId: chartId,
            newId: newChart.id,
            range: newChart.range,
            aggregation: newChart.aggregation
        });
    }

    /** First column of chartRange = category, every other column = one series. */
    private splitRangeToSeries(): void {
        const parsed = this.parseRange(this.chartRange);

        if (!parsed) {
            this.categoryRange = '';
            this.seriesRanges = [];
            return;
        }

        const sheet = this.quoteSheetName(parsed.sheetName);
        const first = parsed.startColumn;

        this.categoryRange = `${sheet}!${first}${parsed.startRow}:${first}${parsed.endRow}`;
        this.seriesRanges = [];

        for (let i = parsed.startColumnIndex + 1; i <= parsed.endColumnIndex; i++) {
            const column = toColumnName(i + 1);
            this.seriesRanges.push({ range: `${sheet}!${column}${parsed.startRow}:${column}${parsed.endRow}` });
        }
    }

    /**
     * Copies category + series columns into a far-right helper block of the
     * chart's sheet (using formulas) so Syncfusion can chart non-adjacent ranges.
     */
    private async buildHelperRange(
        ownerSheetName: string,
        chartId: string,
        category: ParsedRange,
        series: ParsedRange[]
    ): Promise<string> {

        await this.activateSheet(ownerSheetName);

        const sources = [category, ...series];

        if (sources.length > 30) {
            throw new Error(
                'A chart can use at most 29 data series.'
            );
        }

        const startColumnNumber =
            200 + this.helperSlot(chartId) * 30;

        const readValue = (
            source: ParsedRange,
            rowIndex: number
        ): any => {

            const sheet = this.findSheet(source.sheetName);

            return sheet
                ?.rows?.[rowIndex - 1]
                ?.cells?.[source.startColumnIndex]
                ?.value ?? '';
        };

        const getHeader = (source: ParsedRange): string => {
            const header = readValue(source, 1);
            return String(header || source.startColumn);
        };

        const rowCount =
            category.endRow - category.startRow + 1;

        const groups = new Map<
            string,
            {
                label: string;
                values: number[][];
                counts: number[];
            }
        >();

        for (let r = 0; r < rowCount; r++) {

            const sourceRow = category.startRow + r;

            const label = String(
                readValue(category, sourceRow) ?? ''
            ).trim();

            if (!label) {
                continue;
            }

            const key = label;

            if (!groups.has(key)) {
                groups.set(key, {
                    label,
                    values: series.map(() => []),
                    counts: series.map(() => 0)
                });
            }

            const group = groups.get(key)!;

            series.forEach((source, index) => {

                const raw = readValue(source, sourceRow);

                // Count all matching records, including zero values.
                group.counts[index]++;

                if (
                    raw === null ||
                    raw === undefined ||
                    String(raw).trim() === ''
                ) {
                    return;
                }

                const numeric = Number(raw);

                if (Number.isFinite(numeric)) {
                    group.values[index].push(numeric);
                }
            });
        }

        const resultRows: any[][] = [];

        if (this.chartAggregation === 'None') {

            // Preserve one chart point per source record.
            for (let r = 0; r < rowCount; r++) {

                const sourceRow = category.startRow + r;

                resultRows.push([
                    readValue(category, sourceRow),
                    ...series.map(source =>
                        readValue(source, sourceRow)
                    )
                ]);
            }

        } else {

            groups.forEach(group => {

                resultRows.push([
                    group.label,
                    ...series.map((_source, index) =>
                        this.aggregateChartValues(
                            group.values[index],
                            this.chartAggregation,
                            group.counts[index]
                        )
                    )
                ]);
            });
        }

        const headers = [
            getHeader(category),
            ...series.map(source => {

                const header = getHeader(source);

                return this.chartAggregation === 'None'
                    ? header
                    : `${this.chartAggregation} of ${header}`;
            })
        ];

        // Clear old helper data to prevent stale chart points
        // when aggregation produces fewer rows.
        const helperStart =
            toColumnName(startColumnNumber);

        const helperEnd =
            toColumnName(
                startColumnNumber + sources.length - 1
            );

        const ownerSheet = this.findSheet(ownerSheetName);

        const previousLastRow = Math.max(
            resultRows.length + 1,
            Number(ownerSheet?.usedRange?.rowIndex ?? 0) + 1
        );

        this.grid.clear({
            type: 'Clear Contents',
            range:
                `${helperStart}1:` +
                `${helperEnd}${previousLastRow}`
        });

        // Write column headers.
        headers.forEach((header, index) => {

            const column =
                toColumnName(startColumnNumber + index);

            this.grid.updateCell(
                { value: header },
                `${column}1`
            );
        });

        // Write aggregated records.
        resultRows.forEach((row, rowIndex) => {

            row.forEach((value, columnIndex) => {

                const column =
                    toColumnName(
                        startColumnNumber + columnIndex
                    );

                this.grid.updateCell(
                    { value: value ?? '' },
                    `${column}${rowIndex + 2}`
                );
            });
        });

        await this.settle();

        return (
            `${this.quoteSheetName(ownerSheetName)}!` +
            `${helperStart}1:` +
            `${helperEnd}${resultRows.length + 1}`
        );
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

    private parseRange(range: string): ParsedRange | null {
        const value = text(range).trim();
        const bangIndex = value.lastIndexOf('!');

        if (bangIndex < 1) {
            return null;
        }

        let sheetName = value.substring(0, bangIndex).trim();
        const address = value.substring(bangIndex + 1).replace(/\$/g, '').trim();

        if (sheetName.startsWith("'") && sheetName.endsWith("'")) {
            sheetName = sheetName.substring(1, sheetName.length - 1).replace(/''/g, "'");
        }

        const match = address.match(/^([A-Za-z]+)(\d+):([A-Za-z]+)(\d+)$/);

        if (!match) {
            return null;
        }

        const startColumn = match[1].toUpperCase();
        const endColumn = match[3].toUpperCase();
        const startRow = Number(match[2]);
        const endRow = Number(match[4]);
        const startColumnIndex = this.columnIndex(startColumn);
        const endColumnIndex = this.columnIndex(endColumn);

        if (startColumnIndex < 0 || endColumnIndex < startColumnIndex || startRow < 1 || endRow < startRow) {
            return null;
        }

        return { sheetName, startColumn, endColumn, startColumnIndex, endColumnIndex, startRow, endRow };
    }

    /** "A" -> 0, "B" -> 1, "AA" -> 26. Returns -1 if invalid. */
    private columnIndex(columnName: string): number {
        const name = text(columnName).toUpperCase();

        if (!/^[A-Z]+$/.test(name)) {
            return -1;
        }

        let value = 0;

        for (const char of name) {
            value = value * 26 + (char.charCodeAt(0) - 64);
        }

        return value - 1;
    }

    private findChart(...ids: string[]): any | null {
        const wanted = ids.map(id => text(id)).filter(Boolean);

        const charts: any[] = [
            ...(this.grid?.chartColl ?? []),
            ...this.allSheets.flatMap(sheet =>
                this.getSheetCharts(sheet)
            )
        ];

        return charts.find(chart =>
            wanted.includes(text(chart?.id))
        ) ?? null;
    }

    // =====================================================
    // RIBBON
    // =====================================================

    /** Adds "List" and "Pivot Table" buttons to the Insert ribbon tab. */
    private addRibbonButtons(): void {
        if (typeof this.grid.addToolbarItems !== 'function') {
            console.warn('[Spreadsheet] addToolbarItems() is not available in this Syncfusion build.');
            return;
        }

        try {
            this.grid.addToolbarItems(
                'Insert',
                [
                    {
                        id: 'spreadsheet_data_source',
                        type: 'Button',
                        text: 'Insert New',
                        tooltipText: 'Manage Data Source',
                        prefixIcon: 'e-icons e-list-unordered',
                        click: () => this.onListRibbonClick()
                    },
                    {
                        id: 'spreadsheet_pivot',
                        type: 'Button',
                        text: 'Pivot Table',
                        tooltipText: 'Create Pivot Table for the active sheet',
                        prefixIcon: 'e-icons e-table',
                        click: () => this.openPivotFromRibbon()
                    }
                ],
                0
            );
        } catch (error) {
            console.error('[Spreadsheet] Unable to add Insert ribbon commands:', error);
        }
    }
    onSpreadsheetRibbonSelect(): void {
        setTimeout(() => {
            this.updateListRibbonButton();
        }, 0);
    }
    private updateListRibbonButton(): void {
        if (!this.spreadsheet) return;

        const sheetName = String(
            this.grid?.sheets?.[this.grid?.activeSheetIndex ?? 0]?.name ??
            this.activeSheetName ??
            ''
        ).trim().toLowerCase();

        const hasSource = this.sheetSources.some(item =>
            String(item.sheetName ?? '').trim().toLowerCase() === sheetName
        );

        const label = hasSource
            ? 'See List Properties'
            : 'Insert New';

        this.lastListRibbonLabel = label;

        const root = this.grid.element as HTMLElement;

        const button = root?.querySelector(
            '#spreadsheet_data_source'
        ) as HTMLElement | null;

        if (!button) return;

        const textElement = button.querySelector(
            '.e-tbar-btn-text, .e-btn-text'
        ) as HTMLElement | null;

        if (textElement && textElement.textContent !== label) {
            textElement.textContent = label;
        }

        if (button.getAttribute('title') !== label) {
            button.setAttribute('title', label);
        }

        if (button.getAttribute('aria-label') !== label) {
            button.setAttribute('aria-label', label);
        }
    }

    private startListRibbonObserver(): void {
        this.stopListRibbonObserver();

        const root = this.grid?.element as HTMLElement;

        if (!root) return;

        this.listRibbonObserver = new MutationObserver(() => {
            const button = root.querySelector(
                '#spreadsheet_data_source'
            ) as HTMLElement | null;

            if (!button) return;

            const textElement = button.querySelector(
                '.e-tbar-btn-text, .e-btn-text'
            ) as HTMLElement | null;

            if (
                textElement &&
                textElement.textContent !== this.lastListRibbonLabel
            ) {
                this.updateListRibbonButton();
            }
        });

        this.listRibbonObserver.observe(root, {
            childList: true,
            subtree: true
        });

        this.updateListRibbonButton();
    }

    private stopListRibbonObserver(): void {
        this.listRibbonObserver?.disconnect();
        this.listRibbonObserver = null;
    }
    onListRibbonClick(): void {
        if (!this.spreadsheet) return;

        if (this.activeSheetSource) {
            this.editActiveSheetFilters();
        } else {
            this.openDataPanel();
        }
    }
    /** Second supported path for the ribbon buttons. */
    onRibbonClick(args: any): void {
        const id = text(
            args?.item?.id ??
            args?.item?.properties?.id ??
            args?.originalEvent?.target?.id ??
            args?.target?.id
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
    // ADD DATA PANEL
    // =====================================================

    openDataPanel(): void {
        this.editingSheetName = null;
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

    /** Called once per batch: the first batch creates the sheet and headers, the last one finishes. */

    private newDataSheetFields: string[] = [];
    private newDataSheetRowCount = 0;




    async onDataBatchLoaded(
        batch: SpreadsheetDataBatch
    ): Promise<void> {

        if (!this.spreadsheet) {
            return;
        }

        try {

            // =====================================
            // 1. FIRST BATCH
            // =====================================

            if (batch.isFirstBatch) {

                this.newDataSheetFields = [];
                this.newDataSheetLoadedRows = 0;

                if (this.editingSheetName) {

                    // Edit existing sheet
                    this.newDataSheetName = this.editingSheetName;

                    const sheet = this.findSheet(
                        this.editingSheetName
                    );

                    if (!sheet) {
                        throw new Error(
                            `Sheet "${this.editingSheetName}" not found.`
                        );
                    }

                    await this.activateSheet(
                        this.editingSheetName
                    );

                    // Clear old data
                    const lastRow = Number(
                        sheet.usedRange?.rowIndex ?? 0
                    );

                    const lastCol = Number(
                        sheet.usedRange?.colIndex ?? 0
                    );

                    this.grid.clear({
                        type: 'Clear Contents',
                        range:
                            `A1:${toColumnName(lastCol + 1)}${lastRow + 1}`
                    });

                    await this.settle();

                } else {

                    // Create new data sheet
                    await this.createDataSheet(batch);
                }
            }

            const sheetName = this.newDataSheetName;

            if (!sheetName) {
                return;
            }

            await this.activateSheet(sheetName);

            const rows: any[] = batch.rows ?? [];

            // =====================================
            // 2. READ API COLUMNS
            // =====================================

            if (
                !this.newDataSheetFields.length &&
                rows.length
            ) {

                this.newDataSheetFields =
                    Object.keys(rows[0]);

                console.log(
                    '[Spreadsheet] Columns received:',
                    this.newDataSheetFields
                );

                this.newDataSheetFields.forEach(
                    (field, index) => {

                        this.grid.updateCell(
                            { value: field },
                            `${toColumnName(index + 1)}1`
                        );
                    }
                );
            }

            // =====================================
            // 3. INSERT RECORDS
            // =====================================

            const startRow =
                this.newDataSheetLoadedRows + 2;

            for (
                let index = 0;
                index < rows.length;
                index++
            ) {

                const record = rows[index];
                const excelRow = startRow + index;

                this.newDataSheetFields.forEach(
                    (field, colIndex) => {

                        const value =
                            this.getValueIgnoreCase(
                                record,
                                field
                            );

                        this.grid.updateCell(
                            {
                                value: value ?? ''
                            },
                            `${toColumnName(colIndex + 1)}${excelRow}`
                        );
                    }
                );
            }

            // =====================================
            // 4. UPDATE PROGRESS
            // =====================================

            this.newDataSheetLoadedRows += rows.length;

            this.setProgress(
                batch.loaded,
                batch.total
            );

            await this.settle();

            // =====================================
            // 5. FINISH LOADING
            // =====================================

            if (batch.isLastBatch) {

                // finishDataLoading saves source
                // metadata, including matchMode.
                await this.finishDataLoading(batch);

            } else {

                await this.paint();
            }

        } catch (error) {

            console.error(
                '[Spreadsheet] Batch loading failed:',
                error
            );

            this.onDataLoadingFailed(error);
        }
    }





    /** Creates the EMPTY sheet that will receive the batches. */
    private async createDataSheet(
        batch: SpreadsheetDataBatch
    ): Promise<void> {

        const tableName =
            (batch as any).table ||
            (batch as any).entity;

        if (!tableName) {
            throw new Error(
                'Table name is missing.'
            );
        }

        this.showLoading(
            `Loading ${tableName}...`
        );

        const name =
            this.getUniqueSheetName(
                tableName
            );

        this.newDataSheetName =
            name;

        this.newDataSheetLoadedRows =
            0;

        this.grid.insertSheet(
            [
                {
                    name
                }
            ],
            this.allSheets.length
        );

        if (
            !(await this.waitForSheet(name))
        ) {
            throw new Error(
                `Unable to create sheet "${name}".`
            );
        }

        await this.activateSheet(
            name
        );

        await this.paint();
    }




    private async finishDataLoading(
        batch: SpreadsheetDataBatch
    ): Promise<void> {

        const sheetName = this.newDataSheetName;

        if (!sheetName) return;

        const sheet = this.findSheet(sheetName);

        if (!sheet) {
            throw new Error(
                `Sheet "${sheetName}" was not found.`
            );
        }

        const tableName =
            (batch as any).table ||
            (batch as any).entity;

        if (!tableName) {
            throw new Error('Table name is missing.');
        }

        const fields = [...this.newDataSheetFields];

        const conditions =
            (batch as any).conditions ?? [];

        // Restore and save All / Any match mode
        const matchMode: 'all' | 'any' =
            (batch as any).matchMode === 'any'
                ? 'any'
                : 'all';

        await this.activateSheet(sheetName);
        await this.settle();

        if (
            this.newDataSheetLoadedRows > 0 &&
            !fields.some(
                f => f.toLowerCase() === 'id'
            )
        ) {
            console.warn(
                `[Spreadsheet] Backend data for "${sheetName}" ` +
                'does not contain Id. ID-based refresh will not work.'
            );
        }

        // =====================================
        // SAVE SOURCE METADATA
        // =====================================

        this.upsertSheetSource({
            sheetId: sheet.id,
            sheetName,
            source: {
                type: tableName,
                sourceKey: tableName,
                mode: matchMode,
                columns: fields,

                filters: {
                    conditions,
                    matchMode
                }
            }
        });

        // =====================================
        // COMPLETE LOADING
        // =====================================

        this.loadingProgress = 100;

        this.loadingMessage =
            `Loaded ${batch.loaded.toLocaleString()} records`;

        this.syncSheetIdentity();
        this.syncSheetToUi();

        this.markDirty();

        this.notify.success(
            `${batch.loaded.toLocaleString()} records added to ${sheetName}.`
        );

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
        this.notify.error('Unable to load Spreadsheet data.');
        this.cdr.detectChanges();
    }

    private resetDataLoad(): void {
        this.newDataSheetName = null;
        this.newDataSheetLoadedRows = 0;
        this.newDataSheetFields = [];
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
            const records = await this.readPivotRecords(sourceSheetName);

            if (!records) {
                return;
            }

            const fieldMapping = this.buildFieldMapping(records);

            // 3. New pivot: create its tab. Saved pivot: its tab must exist.
            let analysis: any = savedAnalysis;

            if (!analysis) {
                analysis = await this.createPivotAnalysis(sourceSheetName, pivotSheetName);
            } else if (!this.findSheet(pivotSheetName)) {
                console.error('[Pivot] Saved Pivot sheet was not found:', pivotSheetName);
                this.notify.warn(`Pivot sheet "${pivotSheetName}" was not found.`);
                return;
            }

            // 4. Settings + chart + active tab.
            this.pivotSettings = this.buildPivotSettings(analysis?.pivot, records, fieldMapping);
            this.pivotChart = {
                ...this.pivotChart,
                chartSeries: {
                    ...(this.pivotChart?.chartSeries ?? {}),
                    type: analysis?.chart?.type ?? 'Column'
                },
                title: analysis?.chart?.title ?? 'Pivot Chart',
                enableMultipleAxis: analysis?.chart?.enableMultipleAxis ?? false
            };
            this.selectedPivotChartType = analysis?.chart?.type ?? 'Column';

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

    /** Returns { sourceSheetName, pivotSheetName } or null (after warning the user). */
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
                console.error('[Pivot] Source sheet missing.', analysis);
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

    /** Reads source sheet data for Pivot, excluding the internal Id column. */

    private async readPivotRecords(
        sourceSheetName: string
    ): Promise<IDataSet[] | null> {
        const sheet = this.findSheet(sourceSheetName);

        if (!sheet) {
            this.notify.warn(
                `Source sheet "${sourceSheetName}" was not found.`
            );
            return null;
        }

        const lastRow = sheet.usedRange?.rowIndex ?? 0;
        const lastCol = sheet.usedRange?.colIndex ?? 0;

        if (lastRow < 1) {
            this.notify.warn('The source sheet does not contain records.');
            return null;
        }

        const range =
            `${this.quoteSheetName(sourceSheetName)}!A1:` +
            `${toColumnName(lastCol + 1)}${lastRow + 1}`;

        const data = await this.spreadsheet!.getData(range);

        const records = (
            this.sheetDataToRecords(data, lastRow, lastCol) as any[]
        ).map(record => {
            const result: any = {};

            Object.keys(record).forEach(key => {
                if (key.toLowerCase() !== 'id') {
                    result[key] = record[key];
                }
            });

            return result;
        });

        if (!records.length) {
            this.notify.warn('No records were found in the source sheet.');
            return null;
        }

        return records as IDataSet[];
    }


    /** Creates an empty pivot definition + its sheet tab. */
    private async createPivotAnalysis(sourceSheetName: string, pivotSheetName: string): Promise<any> {
        const analysis: any = {
            id: Date.now(),
            sheetName: pivotSheetName,
            sourceSheetName,
            sourceSheetId: this.getSheetIdentity(sourceSheetName).sheetId,
            pivot: { rows: [], columns: [], values: [], filters: [], filterSettings: [], sortSettings: [] },
            chart: {
                type: 'Column',
                title: `${sourceSheetName} Pivot Chart`,
                enableMultipleAxis: false
            }
        };

        this.analyses.push(analysis as SavedSheetAnalysis);

        this.grid.insertSheet([{ name: pivotSheetName, rowCount: 100, colCount: 20 }], this.allSheets.length);

        if (!(await this.waitForSheet(pivotSheetName))) {
            throw new Error(`Unable to create ${pivotSheetName}.`);
        }

        return analysis;
    }

    private buildPivotSettings(saved: any, records: IDataSet[], fieldMapping: any[]): any {
        const restore = (items: any) => clone(items ?? []);

        return {
            dataSource: records,
            rows: restore(saved?.rows),
            columns: restore(saved?.columns),
            values: restore(saved?.values),
            filters: restore(saved?.filters),
            filterSettings: restore(saved?.filterSettings),
            sortSettings: restore(saved?.sortSettings),
            fieldMapping,
            enableSorting: true,
            allowLabelFilter: true,
            allowValueFilter: true
        };
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
        if (this.isCreatingPivot || this.isSyncingPivotDashboard || !this.activeSheetName) {
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

    /** First row = headers, remaining non-empty rows = records. */
    private sheetDataToRecords(data: any, lastRow: number, lastCol: number): any[] {
        const readCell = (address: string) => (data.get ? data.get(address) : data[address]);
        const rows: any[][] = [];

        for (let r = 0; r <= lastRow; r++) {
            const row: any[] = [];

            for (let c = 0; c <= lastCol; c++) {
                row.push(readCell(`${toColumnName(c + 1)}${r + 1}`)?.value ?? '');
            }

            rows.push(row);
        }

        const headers = rows[0].map((header, i) => text(header) || `Column${i + 1}`);

        return rows
            .slice(1)
            .filter(row => row.some(v => v !== '' && v !== null && v !== undefined))
            .map(row => {
                const record: any = {};
                headers.forEach((header, i) => (record[header] = this.normalizeValue(row[i], header)));
                return record;
            });
    }

    private normalizeValue(value: any, fieldName?: string): any {
        if (value === null || value === undefined) {
            return '';
        }

        if (typeof value === 'boolean' || typeof value === 'number') {
            return value;
        }

        const str = text(value);

        if (!str) {
            return '';
        }

        const numeric = Number(str);

        return Number.isNaN(numeric) ? str : numeric;
    }

    private buildFieldMapping(records: any[]): any[] {
        if (!records?.length) {
            return [];
        }

        return Object.keys(records[0]).map(fieldName => {
            const values = records
                .map(record => record[fieldName])
                .filter(value =>
                    value !== '' &&
                    value !== null &&
                    value !== undefined
                );

            const isNumeric =
                values.length > 0 &&
                values.every(value => typeof value === 'number');

            return {
                name: fieldName,
                caption: fieldName,
                dataType: isNumeric ? 'number' : 'string'
            };
        });
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
        const values: any[][] = pivot?.pivotValues ?? pivot?.engineModule?.pivotValues ?? [];

        return values
            .map(row =>
                (row ?? []).map((cell: any) => {
                    if (cell == null) {
                        return '';
                    }

                    if (typeof cell !== 'object') {
                        return cell;
                    }

                    if (cell.value !== undefined && cell.value !== null && cell.value !== '') {
                        return cell.value;
                    }

                    return cell.formattedText ?? cell.actualText ?? '';
                })
            )
            .filter(row => row.some((v: any) => v !== '' && v != null));
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
            sortSettings: this.serializeSort(settings?.sortSettings)
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

    private serializeSort(settings: any[]): any[] {
        return (settings ?? []).map(s => ({ name: s.name, order: s.order }));
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

        if (!pivotName) {
            this.notify.warn('Pivot sheet is not available.');
            return;
        }

        const analysis = this.findAnalysis(pivotName);

        if (!analysis) {
            this.notify.warn('Pivot analysis is not available.');
            return;
        }

        if (!text(this.sourceSheet || analysis.sourceSheetName)) {
            this.notify.warn('Pivot source sheet is not available.');
            return;
        }

        try {
            this.updateAnalysis();

            const matrix = this.getPivotResultMatrix();

            if (!matrix.length || !matrix[0]?.length) {
                this.notify.warn('Pivot result does not contain chartable data.');
                return;
            }

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

            const matrix = this.getPivotResultMatrix();

            if (!matrix.length || !matrix[0]?.length) {
                return;
            }

            await this.publishPivotChart(analysis, matrix);

            if (previousSheet && this.findSheet(previousSheet)) {
                await this.activateSheet(previousSheet);
            }

            this.lastSheetIndex = Number(this.grid.activeSheetIndex ?? 0);
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

        // First copy inserts the chart. Next copies replace only THIS Pivot's chart.
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

        if (typeof this.grid.clear === 'function') {
            try {
                this.grid.clear({ type: 'Clear Contents', range: `${startColumn}1:${endColumn}${clearLastRow}` });
            } catch (error) {
                console.warn('[Pivot Dashboard] unable to clear old helper cells', error);
            }
        }

        matrix.forEach((row, r) =>
            (row ?? []).forEach((value, c) =>
                this.grid.updateCell({ value }, `${toColumnName(startColumnNumber + c)}${r + 1}`)
            )
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

        const existing = this.findPivotDashboardChart(analysis, chart.range);

        if (!existing) {
            return { chart: await this.insertDashboardChart(chart), updated: false };
        }

        const chartId = text(existing.id);

        // Cannot identify the old chart safely: never create a duplicate.
        // The helper data is already refreshed, so the old chart still shows it.
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

    /** Finds a Pivot's Dashboard chart: by chart id, then range, then title. */
    private matchPivotChart(analysis: SavedSheetAnalysis, charts: any[], fallbackRange = ''): any | null {
        const expectedId = text(analysis.dashboardChartId);
        const expectedRange = this.removeSheetFromRange(analysis.dashboardDataRange || fallbackRange);
        const titles = [
            text(analysis.chart?.title),
            `${text(analysis.sheetName)} Chart`,
            `${text(analysis.sourceSheetName)} Pivot Chart`
        ].filter(Boolean);

        return (
            (expectedId && charts.find(c => text(c?.id) === expectedId)) ||
            (expectedRange && charts.find(c => this.removeSheetFromRange(c?.range) === expectedRange)) ||
            charts.find(c => titles.includes(text(c?.title))) ||
            null
        );
    }

    private findPivotDashboardChart(analysis: SavedSheetAnalysis, dashboardRange: string): any | null {
        const charts = this.getSheetCharts(this.findSheet(DASHBOARD_SHEET));
        return this.matchPivotChart(analysis, charts, dashboardRange);
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

        const inserted = this.findDashboardChart(range, model.title) ?? model;

        this.resizeLater(100);

        return inserted;
    }

    /** A Dashboard chart with this range (the one with this title wins). */
    private findDashboardChart(range: string, title?: string): any | null {
        const matches = this.getSheetCharts(this.findSheet(DASHBOARD_SHEET)).filter(
            c => text(c?.range) === text(range)
        );

        return matches.find(c => title && text(c?.title) === text(title)) ?? matches[matches.length - 1] ?? null;
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

        console.warn('[Spreadsheet] repairing invalid live sheet entries', {
            before: current.length,
            after: valid.length
        });

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
            // Older Syncfusion patches ignore the index overload.
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

    // =====================================================
    // DASHBOARD WIDGET METADATA
    // =====================================================

    private getWidgetsForSheet(sheet: any): DashboardWidgetMetadata[] {
        if (!sheet) {
            return [];
        }

        return this.widgets.filter(
            w =>
                (w.sourceSheetId != null && sheet.id != null && Number(w.sourceSheetId) === Number(sheet.id)) ||
                String(w.sourceSheetName ?? '') === String(sheet.name ?? '')
        );
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

    /** All charts stored in a sheet model (live or saved). */
    private getSheetCharts(sheet: any): any[] {
        const charts: any[] = [];

        for (const row of sheet?.rows ?? []) {
            for (const cell of row?.cells ?? []) {
                if (Array.isArray(cell?.chart)) {
                    charts.push(...cell.chart);
                }
            }
        }

        if (Array.isArray(sheet?.charts)) {
            charts.push(...sheet.charts);
        }

        return charts;
    }

    /** Creates/updates the widget record of a Pivot chart that was copied to the Dashboard. */
    private registerWidget(pivotName: string, dashboardRange: string, chart: any): void {
        const analysis: any = this.findAnalysis(pivotName);

        if (!analysis) {
            console.warn('[Dashboard] Pivot analysis not found:', pivotName);
            return;
        }

        if (analysis.id == null) {
            analysis.id = Date.now();
        }

        // The widget source is the REAL data sheet, not the Pivot tab.
        const sourceName = text(analysis.sourceSheetName);

        if (!sourceName) {
            console.warn('[Dashboard] Pivot source sheet missing:', analysis);
            return;
        }

        const source = this.getSheetIdentity(sourceName);
        const chartId = text(chart?.id) || undefined;
        const range = this.removeSheetFromRange(dashboardRange);

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
        const workbook = workbookJson?.jsonObject?.Workbook ?? workbookJson?.Workbook ?? workbookJson;
        const sheets: any[] = Array.isArray(workbook?.sheets) ? workbook.sheets : [];
        const dashboard = sheets.find(s => text(s?.name) === DASHBOARD_SHEET);

        if (!dashboard) {
            this.widgets = [];
            return;
        }

        const charts = this.getSheetCharts(dashboard);
        const matched = new Set<any>();

        const pivotWidgets = this.rebuildPivotWidgets(charts, matched);
        const directWidgets = this.rebuildDirectWidgets(charts, matched, pivotWidgets.length);

        this.widgets = [...pivotWidgets, ...directWidgets];
    }

    /**
     * PIVOT widgets come from the analyses (source sheet -> pivot -> Dashboard chart),
     * because a pivot chart points to a LOCAL Dashboard range, so its source sheet
     * can't be derived from chart.range alone.
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

            const chart = this.matchPivotChart(analysis, charts.filter(c => !matched.has(c)));

            // Analysis exists but its chart is not on the Dashboard: no stale widget.
            if (!chart) {
                console.warn('[Dashboard] Pivot chart not found:', pivotName);
                continue;
            }

            matched.add(chart);

            const source = this.getSheetIdentity(sourceName);
            const chartId = text(chart.id) || text(analysis.dashboardChartId) || undefined;
            const range = this.removeSheetFromRange(chart.range) || text(analysis.dashboardDataRange);
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
            Object.assign(analysis, {
                dashboardWidgetId: widgetId,
                dashboardChartId: chartId,
                dashboardDataRange: range,
                sourceSheetId: source.sheetId,
                sourceSheetName: source.sheetName
            });
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
    // PER-SHEET SOURCE / FILTER METADATA
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
            source: this.cloneSource(item.source)
        }));
    }

    private upsertSheetSource(metadata: SpreadsheetSheetDataSource): void {
        const name = text(metadata.sheetName);

        if (!name || name === DASHBOARD_SHEET) {
            return;
        }

        // Name is the stable key: sheet ids can change after openFromJson()/insertSheet().
        const clean: SpreadsheetSheetDataSource = {
            sheetId: metadata.sheetId,
            sheetName: name,
            source: this.cloneSource(metadata.source)
        };

        const index = this.sheetSources.findIndex(i => text(i.sheetName) === name);

        if (index >= 0) {
            this.sheetSources[index] = clean;
        } else {
            this.sheetSources.push(clean);
        }
    }

    /** Syncs ids/names before save (also handles renamed tabs). */
    private syncSheetIdentity(): void {
        const existingSheets =
            this.allSheets.filter(
                (sheet: any) =>
                    !!text(sheet?.name)
            );

        const syncedSources: SpreadsheetSheetDataSource[] = [];

        this.sheetSources.forEach(item => {
            const sheet =
                existingSheets.find(
                    (x: any) =>
                        text(x?.name) ===
                        text(item.sheetName)
                ) ??
                (
                    item.sheetId != null
                        ? existingSheets.find(
                            (x: any) =>
                                x?.id === item.sheetId
                        )
                        : null
                );

            if (!sheet) {
                return;
            }

            syncedSources.push({
                sheetId: sheet.id,
                sheetName: text(sheet.name),
                source: this.cloneSource(
                    item.source
                )
            });
        });

        this.sheetSources = syncedSources;

        const existingNames =
            new Set(
                existingSheets.map(
                    (sheet: any) =>
                        text(sheet.name)
                )
            );

        this.analyses =
            this.analyses.filter(
                analysis =>
                    existingNames.has(
                        text(analysis.sheetName)
                    ) &&
                    existingNames.has(
                        text(
                            (analysis as any)
                                .sourceSheetName
                        )
                    )
            );

        this.widgets =
            this.widgets.filter(
                widget =>
                    !widget.sourceSheetName ||
                    existingNames.has(
                        text(
                            widget.sourceSheetName
                        )
                    )
            );
    }

    // ---- Active-tab watcher ----

    private startSheetWatcher(): void {
        this.stopSheetWatcher();

        if (!this.spreadsheet) return;

        let previousSheetName = '';
        let previousHasSource: boolean | null = null;

        const checkActiveSheet = () => {
            if (!this.spreadsheet || this.isSyncingPivotDashboard) {
                return;
            }

            const sheetName = this.activeSheetName;
            const hasSource = !!this.activeSheetSource;

            if (
                sheetName !== previousSheetName ||
                hasSource !== previousHasSource
            ) {
                previousSheetName = sheetName;
                previousHasSource = hasSource;

                this.lastSheetIndex = Number(
                    this.grid.activeSheetIndex ?? 0
                );

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

    /** Shows the filters of the active tab in the header. */
    private syncSheetToUi(): void {
        const name = this.activeSheetName;

        const sheetSource = this.sheetSources.find(
            item => item.sheetName === name
        );

        this.currentFilters = sheetSource
            ? { ...(sheetSource.source?.filters ?? {}) }
            : null;

        this.updateListRibbonButton();

        this.cdr.detectChanges();
    }

    // =====================================================
    // HEADER INFO (bound in the template)
    // =====================================================

    get chartCount(): number {
        return this.getWidgetsForSheet(this.activeSheet).length;
    }

    /** Data rows of the active sheet (usedRange is zero-based, row 0 = header). */
    get recordCount(): number {
        return Math.max(Number(this.activeSheet?.usedRange?.rowIndex ?? 0), 0);
    }

    get sourceName(): string {
        const name = this.activeSheetName;
        const source = name ? this.sheetSources.find(i => i.sheetName === name)?.source : null;

        return text(source?.sourceKey ?? source?.type);
    }

    /** Hidden on the Dashboard and on Pivot tabs. */
    get showInfoBar(): boolean {
        const name = this.activeSheetName;

        return !!name && name !== DASHBOARD_SHEET && !this.analyses.some(a => text(a.sheetName) === name);
    }

    get appliedFilters(): { label: string; value: string }[] {
        const conditions = this.currentFilters?.conditions;

        if (!Array.isArray(conditions)) {
            return [];
        }


        const operatorLabels: Record<string, string> = {
            eq: '=',
            neq: '≠',
            lt: '<',
            lte: '≤',
            gt: '>',
            gte: '≥'
        };

        return conditions
            .filter(condition => condition?.field && condition?.operator)
            .map(condition => ({
                label: `${condition.field} ${operatorLabels[condition.operator] || condition.operator}`,
                value: condition.value instanceof Date
                    ? this.formatDate(condition.value)
                    : String(condition.value ?? '')
            }));
    }

    editingSheetName: string | null = null;

    get activeSheetSource(): SpreadsheetSheetDataSource | null {
        const name = this.activeSheetName;

        return this.sheetSources.find(
            item => item.sheetName === name
        ) ?? null;
    }

    editActiveSheetFilters(): void {
        const sheetSource = this.activeSheetSource;

        if (!sheetSource) {
            this.notify.warn('This sheet has no linked data source.');
            return;
        }

        this.editingSheetName = sheetSource.sheetName;
        this.closeChartPanel();
        this.showDataPanel = true;
        this.cdr.detectChanges();
        this.resizeLater();
    }



    saveSpreadsheet(): void {
        if (!this.spreadsheet) {
            this.notify.warn('Spreadsheet is not ready.');
            return;
        }

        const dashboardId = this.dashboardId;

        if (!dashboardId) {
            this.notify.error('Dashboard id is missing.');
            return;
        }

        this.updateAnalysis();
        this.syncSheetIdentity();

        const sheetDataSources = this.cloneSheetSources(this.sheetSources);

        this.showLoading('Saving Spreadsheet...');

        let savedUpdatedDate: any;

        this.grid
            .saveAsJson(this.saveOptions)
            .then((rawWorkbook: any) => {
                const workbook = this.reconcileDashboardCharts(rawWorkbook);
                this.rebuildWidgets(workbook);

                savedUpdatedDate = moment().format('YYYY-MM-DDTHH:mm:ss.SSS') + '0000';

                const spreadsheet = {
                    workbookJson: workbook,
                    sheetDataSources,
                    sheetAnalyses: clone(this.analyses),
                    dashboardWidgets: clone(this.widgets),
                    updatedDate: savedUpdatedDate,
                    recordCount: this.countRecords(workbook)
                };

                return firstValueFrom(
                    this.dashboardService.saveSpreadSheetJson(dashboardId, spreadsheet)
                );
            })
            .then(() => {
                this.dashboardLastUpdatedDate = savedUpdatedDate;
                this.isDirty = false;
                this.notify.success('Spreadsheet saved successfully.');
                this.cdr.detectChanges();
            })
            .catch((error: any) => {
                console.error('[Spreadsheet] SaveSpreadSheetJson failed:', error);
                this.notify.error('Failed to save Spreadsheet.');
            })
            .finally(() => {
                this.hideLoading();
                this.cdr.detectChanges();
            });
    }
    private countRecords(workbook: any): number {
        const sheets =
            workbook?.jsonObject?.Workbook?.sheets ??
            workbook?.Workbook?.sheets ??
            [];

        const sourceSheetNames = new Set(
            this.sheetSources.map(source => text(source.sheetName))
        );

        return sheets
            .filter((sheet: any) =>
                sourceSheetNames.has(text(sheet?.name))
            )
            .reduce((total: number, sheet: any) => {
                const rowCount = sheet?.rows?.length ?? 0;

                return total + Math.max(rowCount - 1, 0);
            }, 0);
    }
    /** Removes null/invalid entries from saved JSON so Syncfusion can reopen it safely. */
    private cleanWorkbookJson(workbookJson: any): any {
        if (!workbookJson) {
            return workbookJson;
        }

        const cleanJson = clone(workbookJson);
        const workbook = cleanJson?.jsonObject?.Workbook ?? cleanJson?.Workbook;

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
        const workbook = cleaned?.jsonObject?.Workbook ?? cleaned?.Workbook;
        const dashboard = (workbook?.sheets ?? []).find((s: any) => text(s?.name) === DASHBOARD_SHEET);

        if (!dashboard) {
            return cleaned;
        }

        const forEachCell = (callback: (cell: any) => void) =>
            workbook.sheets.forEach((sheet: any) =>
                (sheet?.rows ?? []).forEach((row: any) => (row?.cells ?? []).forEach(callback))
            );

        // One canonical saved model per chart id.
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


    async refreshSpreadsheet(): Promise<void> {
        if (
            this.isRefreshing ||
            !this.spreadsheet ||
            !this.dashboardId
        ) {
            return;
        }

        this.isRefreshing = true;
        this.showLoading('Refreshing Spreadsheet...');

        const activeSheetBeforeRefresh = this.activeSheetName;

        try {
            // ============================================
            // 1. Get dashboard information
            // ============================================
            const result: any = await firstValueFrom(
                this.dashboardService.getDashboardForView(
                    this.dashboardId
                )
            );

            const dashboard = result?.dashboard ?? result;

            // ============================================
            // 2. Prepare incremental refresh date
            // ============================================
            const lastUpdatedDate = this.spreadsheetUpdatedDate
                ? moment.utc(this.spreadsheetUpdatedDate)
                : undefined;

            if (lastUpdatedDate) {
                lastUpdatedDate.toISOString = () =>
                    lastUpdatedDate.format('YYYY-MM-DDTHH:mm:ss');
            }

            // ============================================
            // 3. Get saved sheet data sources
            // ============================================
            const sources = this.cloneSheetSources(
                this.sheetSources
            );

            const validSources = sources.filter(sheetSource => {
                const sheetName = text(sheetSource.sheetName);
                const source = sheetSource.source;

                return (
                    !!sheetName &&
                    sheetName !== DASHBOARD_SHEET &&
                    !!source &&
                    !!text(source.sourceKey ?? source.type) &&
                    !!source.columns?.length
                );
            });

            let completed = 0;

            // ============================================
            // 4. Refresh source sheets from backend
            // ============================================
            for (const sheetSource of validSources) {
                const sheetName = text(sheetSource.sheetName);
                const source = sheetSource.source;

                const tableName = text(
                    source.sourceKey ?? source.type
                );

                const fields = source.columns ?? [];

                this.loadingMessage =
                    `Refreshing ${sheetName}...`;

                console.log('[Refresh] Updating source sheet:', {
                    sheetName,
                    tableName,
                    fields
                });

                await this.refreshSheetChanges(
                    sheetName,
                    tableName,
                    fields,
                    source.filters,
                    lastUpdatedDate
                );

                completed++;

                this.setProgress(
                    completed,
                    validSources.length
                );

                await this.paint();
            }

            // Make sure new records are written before
            // recalculating charts and pivots.
            await this.settle();

            // ============================================
            // 5. Refresh Dashboard direct charts
            // ============================================
            this.loadingMessage =
                'Recalculating Dashboard charts...';

            await this.refreshDashboardDirectCharts();

            await this.settle();

            // ============================================
            // 6. Refresh saved Pivot analyses
            // ============================================
            this.loadingMessage =
                'Recalculating Pivot charts...';

            await this.refreshPivotSheets();

            await this.settle();

            // ============================================
            // 7. Refresh direct charts with saved
            //    aggregation configuration
            // ============================================
            this.loadingMessage =
                'Updating Spreadsheet charts...';

            await this.refreshDirectCharts();

            await this.settle();

            // ============================================
            // 8. Restore original active sheet
            // ============================================
            if (
                activeSheetBeforeRefresh &&
                this.findSheet(activeSheetBeforeRefresh)
            ) {
                await this.activateSheet(
                    activeSheetBeforeRefresh
                );
            }

            // ============================================
            // 9. Update dashboard information
            // ============================================
            this.dashboardLastUpdatedDate =
                dashboard?.lastModificationDate ??
                this.dashboardLastUpdatedDate;

            this.syncSheetToUi();

            this.markDirty();

            // ============================================
            // 10. Final rendering
            // ============================================
            await this.paint();

            this.resizeLater(100);

            console.log(
                '[Refresh] Spreadsheet and chart data refreshed.'
            );

            this.notify.success(
                'Spreadsheet refreshed successfully.'
            );

        } catch (error) {
            console.error(
                '[Spreadsheet] Refresh failed:',
                error
            );

            this.notify.error(
                'Unable to refresh Spreadsheet.'
            );

        } finally {
            // Restore the active sheet even if a step fails.
            try {
                if (
                    activeSheetBeforeRefresh &&
                    this.findSheet(activeSheetBeforeRefresh) &&
                    this.activeSheetName !== activeSheetBeforeRefresh
                ) {
                    await this.activateSheet(
                        activeSheetBeforeRefresh
                    );
                }
            } catch (restoreError) {
                console.warn(
                    '[Refresh] Unable to restore active sheet:',
                    restoreError
                );
            }

            this.isRefreshing = false;
            this.hideLoading();
            this.cdr.detectChanges();
        }
    }


    private async refreshDirectCharts(): Promise<void> {
        const previousSheet = this.activeSheetName;

        try {
            for (const sheet of this.allSheets) {
                const sheetName = text(sheet?.name);

                if (!sheetName) {
                    continue;
                }

                const charts = this.getSheetCharts(sheet);

                for (const chart of charts) {
                    const categoryRange = text(chart?.categoryRange);

                    const seriesRanges: string[] =
                        (chart?.seriesRanges ?? [])
                            .map((item: any) =>
                                text(
                                    typeof item === 'string'
                                        ? item
                                        : item?.range
                                )
                            )
                            .filter(Boolean);

                    // Only charts with saved custom aggregation
                    // require rebuilding their helper ranges.
                    if (
                        !categoryRange ||
                        !seriesRanges.length
                    ) {
                        continue;
                    }

                    const parsed = this.parseChartInputs(
                        categoryRange,
                        seriesRanges
                    );

                    if (!parsed) {
                        console.warn(
                            '[Refresh] Invalid chart ranges:',
                            chart?.id
                        );
                        continue;
                    }

                    const chartId = text(chart?.id);

                    if (!chartId) {
                        console.warn(
                            '[Refresh] Chart has no ID:',
                            sheetName,
                            chart
                        );
                        continue;
                    }

                    const previousAggregation =
                        this.chartAggregation;

                    try {
                        this.chartAggregation =
                            (chart.aggregation as ChartAggregation)
                            || 'None';

                        const updatedRange =
                            await this.buildHelperRange(
                                sheetName,
                                chartId,
                                parsed.category,
                                parsed.series
                            );

                        // Do not delete/reinsert the chart.
                        // Preserve its position, size and ID.
                        const oldRange = text(chart.range);

                        if (oldRange !== updatedRange) {
                            console.warn(
                                '[Refresh] Chart helper range changed:',
                                {
                                    chartId,
                                    oldRange,
                                    updatedRange
                                }
                            );

                            // Updating chart.range alone may not
                            // update Syncfusion's rendered chart.
                            // A chart-binding update is required here.
                            continue;
                        }

                        console.log(
                            '[Refresh] Chart helper recalculated:',
                            chartId
                        );

                    } finally {
                        this.chartAggregation =
                            previousAggregation;
                    }
                }
            }

        } finally {
            if (
                previousSheet &&
                this.findSheet(previousSheet)
            ) {
                await this.activateSheet(previousSheet);
            }
        }
    }

    private async refreshDashboardDirectCharts(): Promise<void> {
        const previousSheet = this.activeSheetName;

        try {
            const directWidgets = this.widgets.filter(
                (widget: any) =>
                    String(widget.sourceType).toUpperCase() === 'DIRECT'
            );

            for (const widget of directWidgets) {
                const sourceName = text(widget.sourceSheetName);
                const sourceSheet = this.findSheet(sourceName);

                if (!sourceSheet) {
                    console.warn('[Chart Refresh] Source missing:', sourceName);
                    continue;
                }

                const chartRange = text(widget.sourceRange);
                const parsed = this.parseRange(chartRange);

                if (!parsed) {
                    console.warn('[Chart Refresh] Invalid range:', chartRange);
                    continue;
                }

                // This repair handles the saved Sum of TotalQuantity chart.
                // Do not infer aggregation for unrelated charts.
                const headers = sourceSheet.rows?.[0]?.cells ?? [];

                const findColumn = (field: string): number =>
                    headers.findIndex(
                        (cell: any) =>
                            String(cell?.value ?? '')
                                .trim()
                                .toLowerCase() === field.toLowerCase()
                    );

                const categoryColumn = findColumn('SellerCompanyName');
                const valueColumn = findColumn('TotalQuantity');

                if (categoryColumn < 0 || valueColumn < 0) {
                    console.warn(
                        '[Chart Refresh] Required fields missing:',
                        sourceName
                    );
                    continue;
                }

                // Confirm that the helper block is actually the expected
                // Sum of TotalQuantity chart before changing its values.
                const helperHeader = String(
                    sourceSheet.rows?.[parsed.startRow - 1]
                        ?.cells?.[parsed.startColumnIndex + 1]
                        ?.value ?? ''
                ).trim();

                if (helperHeader !== 'Sum of TotalQuantity') {
                    console.warn(
                        '[Chart Refresh] Skipping unsupported chart:',
                        chartRange,
                        helperHeader
                    );
                    continue;
                }

                // Recalculate using all current source records.
                const totals = new Map<string, number>();

                const rows = sourceSheet.rows ?? [];

                for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
                    const cells = rows[rowIndex]?.cells;

                    if (!cells) continue;

                    const category = String(
                        cells[categoryColumn]?.value ?? ''
                    ).trim();

                    if (!category) continue;

                    const rawValue = cells[valueColumn]?.value;
                    const quantity = Number(rawValue);

                    if (!Number.isFinite(quantity)) continue;

                    // Avoid treating a helper row as a source record.
                    const recordId = cells[findColumn('Id')]?.value;
                    if (recordId === undefined || recordId === null || recordId === '') {
                        continue;
                    }

                    totals.set(
                        category,
                        (totals.get(category) ?? 0) + quantity
                    );
                }

                await this.activateSheet(sourceName);

                // Update the existing chart's helper cells.
                // The saved chart currently has a fixed three-row range.
                const capacity = parsed.endRow - parsed.startRow;

                if (totals.size > capacity) {
                    console.warn(
                        '[Chart Refresh] More categories than chart capacity:',
                        {
                            range: chartRange,
                            categories: totals.size,
                            capacity
                        }
                    );

                    // Existing categories can still be updated, but
                    // new categories require expanding the chart range.
                }

                const helperCategoryCol = parsed.startColumnIndex;
                const helperValueCol = helperCategoryCol + 1;

                const updated: any[] = [];

                // Update existing categories in their current positions.
                // This preserves the chart's category ordering.
                for (
                    let rowIndex = parsed.startRow;
                    rowIndex <= parsed.endRow;
                    rowIndex++
                ) {
                    const category = String(
                        sourceSheet.rows?.[rowIndex - 1]
                            ?.cells?.[helperCategoryCol]?.value ?? ''
                    ).trim();

                    if (!category) continue;

                    const total = totals.get(category);

                    if (total === undefined) continue;

                    const address =
                        `${toColumnName(helperValueCol + 1)}${rowIndex}`;

                    this.grid.updateCell(
                        { value: total },
                        `${this.quoteSheetName(sourceName)}!${address}`
                    );

                    updated.push({ category, total });
                }

                await this.settle();

                console.log('[Chart Refresh] Helper values updated:', {
                    sourceSheet: sourceName,
                    chartRange,
                    updated
                });
            }
        } finally {
            if (previousSheet && this.findSheet(previousSheet)) {
                await this.activateSheet(previousSheet);
            }
        }
    }

    private async refreshSheetChanges(
        sheetName: string,
        tableName: string,
        fields: string[],
        filters: any,
        lastUpdatedDate: any
    ): Promise<void> {

        const sheet = this.findSheet(sheetName);

        if (!sheet) {
            return;
        }

        await this.activateSheet(sheetName);

        // ==========================================
        // 1. Ensure Id is always the first field
        // ==========================================

        const selectedFields: string[] = Array.from(
            new Set<string>(
                (fields ?? [])
                    .filter(
                        (field: string) =>
                            !!field &&
                            field.toLowerCase() !== 'id'
                    )
            )
        );

        const requestFields: string[] = [
            'Id',
            ...selectedFields
        ];

        // ==========================================
        // 2. Prepare pagination and filters
        // ==========================================

        const batchSize = 10;

        let skipCount = 0;
        let loaded = 0;
        let totalCount = 0;

        const conditions =
            filters?.conditions ?? [];

        // ==========================================
        // 3. Load changed records in batches
        // ==========================================

        while (true) {

            const result: any = await firstValueFrom(
                this.dashboardService.getAllTableData(
                    this.appSession.tenantId,
                    tableName,
                    requestFields, // Always includes Id
                    conditions,
                    lastUpdatedDate ?? undefined,
                    undefined,
                    'Id', // Stable pagination
                    skipCount,
                    batchSize
                )
            );

            const changes: any[] =
                result?.items ?? [];

            totalCount = Number(
                result?.totalCount ?? 0
            );

            if (!changes.length) {
                break;
            }

            // ==========================================
            // 4. Validate every record has an Id
            // ==========================================

            const validChanges = changes.map(
                (record: any, index: number) => {

                    const recordId =
                        this.getValueIgnoreCase(
                            record,
                            'Id'
                        );

                    if (
                        recordId === undefined ||
                        recordId === null ||
                        recordId === ''
                    ) {
                        console.error(
                            '[Spreadsheet Refresh] Missing Id:',
                            {
                                sheetName,
                                tableName,
                                batchIndex: index,
                                record
                            }
                        );

                        throw new Error(
                            `API change record ${skipCount + index + 1} ` +
                            `has no Id in ${tableName}.`
                        );
                    }

                    return {
                        ...record,
                        Id: recordId
                    };
                }
            );

            // ==========================================
            // 5. Update existing rows or append new rows
            // ==========================================

            await this.applySheetChanges(
                sheetName,
                requestFields,
                validChanges
            );

            loaded += validChanges.length;

            this.loadingMessage =
                `Refreshing ${sheetName}: ` +
                `${loaded.toLocaleString()} of ` +
                `${totalCount.toLocaleString()} changes`;

            this.setProgress(
                loaded,
                totalCount
            );

            await this.paint();

            // ==========================================
            // 6. Check if this was the last batch
            // ==========================================

            if (
                changes.length < batchSize ||
                loaded >= totalCount
            ) {
                break;
            }

            skipCount += changes.length;
        }


        await this.settle();

        console.log(
            '[Spreadsheet Refresh] Completed:',
            {
                sheetName,
                tableName,
                loaded,
                totalCount
            }
        );
    }

    private async applySheetChanges(
        sheetName: string,
        fields: string[],
        changes: any[]
    ): Promise<void> {

        const sheet = this.findSheet(sheetName);
        if (!sheet || !this.spreadsheet) return;

        await this.activateSheet(sheetName);

        // Read actual sheet headers. Do not assume Id is column A.
        const headerCells = sheet.rows?.[0]?.cells ?? [];
        const lastCol = Math.max(
            headerCells.length - 1,
            Number(sheet.usedRange?.colIndex ?? 0)
        );

        const currentFields: string[] = [];

        for (let col = 0; col <= lastCol; col++) {
            currentFields.push(
                String(headerCells[col]?.value ?? '').trim()
            );
        }

        const idColumnIndex = currentFields.findIndex(
            field => field.toLowerCase() === 'id'
        );

        if (idColumnIndex === -1) {
            throw new Error(
                `Id column not found in sheet "${sheetName}".`
            );
        }

        const normalizeId = (value: any): string =>
            String(value ?? '').trim();

        const normalizeValue = (value: any): string =>
            value == null ? '' : String(value);

        // Build an ID lookup without deleting existing rows.
        const idToRow = new Map<string, number>();
        const duplicateIds = new Set<string>();

        const lastRow = Number(sheet.usedRange?.rowIndex ?? 0);

        for (let rowIndex = 1; rowIndex <= lastRow; rowIndex++) {
            const id = normalizeId(
                sheet.rows?.[rowIndex]
                    ?.cells?.[idColumnIndex]?.value
            );

            if (!id) continue;

            if (idToRow.has(id)) {
                duplicateIds.add(id);
                continue;
            }

            idToRow.set(id, rowIndex);
        }

        if (duplicateIds.size > 0) {
            console.warn(
                `[Spreadsheet Refresh] ${duplicateIds.size} duplicate IDs already exist in "${sheetName}". No rows were deleted.`,
                [...duplicateIds]
            );
        }

        // Deduplicate incoming API changes.
        const incomingRecords = new Map<string, any>();

        for (const record of changes ?? []) {
            const id = normalizeId(
                this.getValueIgnoreCase(record, 'Id')
            );

            if (!id) {
                console.warn(
                    '[Spreadsheet Refresh] Skipping record without Id:',
                    record
                );
                continue;
            }

            incomingRecords.set(id, record);
        }

        let nextRowIndex = lastRow + 1;
        let addedCount = 0;
        let modifiedCount = 0;
        let skippedDeletedCount = 0;

        for (const [id, record] of incomingRecords) {

            // Do not physically delete rows during incremental refresh.
            // The API response shown does not contain deletion information.
            if (
                record?.isDeleted === true ||
                record?.IsDeleted === true
            ) {
                skippedDeletedCount++;
                continue;
            }

            const existingRowIndex = idToRow.get(id);

            if (existingRowIndex !== undefined) {

                // Update existing row.
                let hasChanges = false;

                for (
                    let colIndex = 0;
                    colIndex < currentFields.length;
                    colIndex++
                ) {
                    const field = currentFields[colIndex];

                    if (
                        !field ||
                        field.toLowerCase() === 'id'
                    ) {
                        continue;
                    }

                    const newValue = this.getValueIgnoreCase(
                        record,
                        field
                    );

                    // Do not clear columns absent from the API response.
                    if (newValue === undefined) continue;

                    const currentSheet = this.findSheet(sheetName);

                    const oldValue =
                        currentSheet?.rows?.[existingRowIndex]
                            ?.cells?.[colIndex]?.value;

                    if (
                        normalizeValue(oldValue) ===
                        normalizeValue(newValue)
                    ) {
                        continue;
                    }

                    const address =
                        `${toColumnName(colIndex + 1)}` +
                        `${existingRowIndex + 1}`;

                    this.grid.updateCell(
                        { value: newValue ?? '' },
                        address
                    );

                    this.highlightRefreshCell(
                        sheetName,
                        existingRowIndex,
                        colIndex,
                        this.editedCellColor
                    );

                    hasChanges = true;
                }

                if (hasChanges) {
                    modifiedCount++;
                }

            } else {

                // Append new row.
                const rowIndex = nextRowIndex++;

                for (
                    let colIndex = 0;
                    colIndex < currentFields.length;
                    colIndex++
                ) {
                    const field = currentFields[colIndex];
                    if (!field) continue;

                    const value = this.getValueIgnoreCase(
                        record,
                        field
                    );

                    // Do not invent values for fields absent from the API.
                    if (value === undefined) continue;

                    const address =
                        `${toColumnName(colIndex + 1)}` +
                        `${rowIndex + 1}`;

                    this.grid.updateCell(
                        { value: value ?? '' },
                        address
                    );

                    this.highlightRefreshCell(
                        sheetName,
                        rowIndex,
                        colIndex,
                        this.addedCellColor
                    );
                }

                idToRow.set(id, rowIndex);
                addedCount++;
            }
        }

        await this.settle();

        console.log('[Spreadsheet Refresh] Result:', {
            sheetName,
            added: addedCount,
            modified: modifiedCount,
            existingDuplicateIds: duplicateIds.size,
            skippedDeleted: skippedDeletedCount,
            totalIncoming: incomingRecords.size
        });

        if (addedCount > 0 || modifiedCount > 0) {
            this.markDirty();
        }
    }

    private getValueIgnoreCase(
        record: any,
        field: string
    ): any {

        if (!record || !field) {
            return undefined;
        }

        if (
            Object.prototype.hasOwnProperty.call(
                record,
                field
            )
        ) {
            return record[field];
        }

        const key =
            Object.keys(record).find(
                x =>
                    x.toLowerCase() ===
                    field.toLowerCase()
            );

        return key
            ? record[key]
            : undefined;
    }


    private async refreshPivotSheets(): Promise<void> {
        for (const analysis of this.analyses) {
            const sourceSheetName =
                text(
                    (analysis as any)
                        .sourceSheetName
                );

            if (!sourceSheetName) {
                continue;
            }

            const records =
                await this.readPivotRecords(
                    sourceSheetName
                );

            if (!records) {
                continue;
            }

            if (
                this.showPivot &&
                this.pivotSheet ===
                text(analysis.sheetName)
            ) {
                this.pivotSettings =
                    this.buildPivotSettings(
                        (analysis as any).pivot,
                        records,
                        this.buildFieldMapping(
                            records
                        )
                    );

                this.bindPivotView(
                    records
                );

                await this.settle();

                if (this.isPivotOnDashboard) {
                    await this.syncPivotToDashboard();
                }
            }
        }
    }

    onSpreadsheetActionComplete(args: any): void {
        if (this.ignoreSpreadsheetChanges) {
            return;
        }

        const action =
            text(
                args?.action ??
                args?.requestType ??
                args?.eventArgs?.requestType
            ).toLowerCase();

        if (
            action === 'select' ||
            action === 'selection' ||
            action === 'cellselect' ||
            action === 'gotocell'
        ) {
            return;
        }

        this.markDirty();

        if (
            action.includes('sheet') ||
            action.includes('rename') ||
            action.includes('insert') ||
            action.includes('delete')
        ) {
            setTimeout(() => {
                this.syncSheetIdentity();
                this.syncSheetToUi();
            }, 0);
        }
    }

    private refreshHighlightedCells: Array<{
        sheetName: string;
        address: string;
        originalStyle: any;
    }> = [];

    private readonly addedCellColor = '#DCFCE7';
    private readonly editedCellColor = '#FEF3C7';


    private highlightRefreshCell(
        sheetName: string,
        rowIndex: number,
        columnIndex: number,
        color: string
    ): void {

        const sheet = this.findSheet(sheetName);

        if (!sheet) {
            return;
        }

        const address =
            `${toColumnName(columnIndex + 1)}${rowIndex + 1}`;

        const originalStyle = {
            ...(sheet.rows?.[rowIndex]?.cells?.[columnIndex]?.style ?? {})
        };

        // Avoid saving the same cell twice
        const exists = this.refreshHighlightedCells.some(
            item =>
                item.sheetName === sheetName &&
                item.address === address
        );

        if (!exists) {
            this.refreshHighlightedCells.push({
                sheetName,
                address,
                originalStyle
            });
        }

        this.grid.cellFormat(
            { backgroundColor: color },
            `${this.quoteSheetName(sheetName)}!${address}`
        );
    }


    get editingSheetSource(): SpreadsheetSheetDataSource | null {
        if (!this.editingSheetName) {
            return null;
        }

        return this.sheetSources.find(
            source => source.sheetName === this.editingSheetName
        ) ?? null;
    }


    closeResponsivePanel(): void {
    if (this.showDataPanel) {
        this.closeDataPanel();
    }

    if (this.showChartPanel) {
        this.closeChartPanel();
    }
}
}