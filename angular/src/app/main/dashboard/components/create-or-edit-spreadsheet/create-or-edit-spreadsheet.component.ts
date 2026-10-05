import {
    ChangeDetectorRef,
    Component,
    Injector,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import {
    SpreadsheetComponent as SyncfusionSpreadsheetComponent,
    SheetModel
} from '@syncfusion/ej2-angular-spreadsheet';

import {
    DisplayOption,
    FieldListService,
    GroupingBarService,
    PivotChartService,
    ToolbarService,
    PivotFieldListComponent,
    CalculatedFieldService,
    IDataSet
} from '@syncfusion/ej2-angular-pivotview';

import {
    AppDashboardServiceProxy,
} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

import {
    DashboardWidgetMetadata,
    SavedSheetAnalysis,
    SpreadsheetDataBatch,
    SpreadsheetDataSource,
    SpreadsheetSheetDataSource
} from '../../models/dashboard.model';

import {
    DASHBOARD_SHEET,
    ParsedRange,
    TRANSACTIONS_SHEET,
    clone,
    getChartReferencedSheetNames,
    normalizeKey,
    readPixelValue,
    text,
    toColumnName,
    yieldToBrowser
} from '../../models/spreadsheet.model';



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

    // Spreadsheet
    sheets: SheetModel[] = [];
    readonly scrollSettings: any = { enableVirtualization: true, isFinite: false };
    readonly showAggregate = false;

    private readonly saveOptions: any = { ignoreImage: false, ignoreNote: false };

    // Loading bar
    isLoading = false;
    loadingProgress = 0;
    loadingMessage = '';
    isRefreshing = false;

    // Metadata saved with the workbook
    sheetSources: SpreadsheetSheetDataSource[] = [];
    analyses: SavedSheetAnalysis[] = [];
    widgets: DashboardWidgetMetadata[] = [];

    // Metadata of the active tab (shown in the header)
    currentSource: SpreadsheetDataSource | null = null;
    currentFilters: any = null;

    private sheetWatcher: any = null;
    private lastSheetIndex = -1;
    private dashboardPromise: Promise<any> | null = null;

    // "Add data" panel
    showDataPanel = false;

    isAdding = false;

    showPivot = false;
    pivotSheet: string | null = null;      // name of the Pivot tab
    sourceSheet: string | null = null;     // name of the data tab the Pivot reads
    private isCreatingPivot = false;
    private chartSyncTimer: any = null;

    pivotDisplay = { view: 'Both', primary: 'Table' } as DisplayOption;
    pivotToolbar: any[] = ['Grid', 'Chart'];
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

    // Chart panel
    showChartPanel = false;
    selectedChart: any = null;
    chartSheet: string | null = null;
    chartRange = '';
    categoryRange = '';
    seriesRanges: Array<{ range: string }> = [];
    isApplyingChart = false;


    private newDataSheetName: string | null = null;
    private newDataSheetLoadedRows = 0;
    private pendingDataBatch: SpreadsheetDataBatch | null = null;

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



    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            this.dashboardId = id ? Number(id) : null;
        });
    }

    ngOnDestroy(): void {
        this.stopSheetWatcher();
    }

    onCreated(): void {
        if (!this.spreadsheet) {
            return;
        }

        this.addRibbonButtons();
        this.startSheetWatcher();
        this.loadDashboard();
    }


    private loadDashboard(): void {
        if (!this.dashboardId || !this.spreadsheet) {
            return;
        }

        this.dashboardService.getDashboardForView(this.dashboardId).subscribe({
            next: async (result: any) => {
                try {
                    const saved = (result?.dashboard ?? result)?.spreadsheet;

                    if (saved) {
                        await this.openWorkbook(saved);
                    } else {
                        await this.createEmptyWorkbook();
                    }
                } catch (error) {
                    console.error('[Spreadsheet] Failed to initialize dashboard spreadsheet:', error);
                    this.notify.error('Unable to open Spreadsheet.');
                } finally {
                    this.cdr.detectChanges();
                }
            },
            error: (error: any) => {
                console.error('[Spreadsheet] Failed to load dashboard:', error);
                this.notify.error('Unable to load Dashboard.');
            }
        });
    }

    private async openWorkbook(saved: any): Promise<void> {
        if (!this.spreadsheet) {
            return;
        }

        const data = typeof saved === 'string' ? JSON.parse(saved) : saved;

        this.sheetSources = this.cloneSheetSources(data?.sheetDataSources ?? []);
        this.analyses = clone(data?.sheetAnalyses ?? []);
        this.widgets = clone(data?.dashboardWidgets ?? []);

        const first =
            this.sheetSources.find(x => x.sheetName === TRANSACTIONS_SHEET)?.source ??
            this.sheetSources[0]?.source ??
            null;

        this.currentSource = first ? this.cloneSource(first) : null;
        this.currentFilters = { ...(first?.filters ?? {}) };

        const workbook = this.cleanWorkbookJson(data?.workbookJson ?? data);

        this.grid.openFromJson({ file: workbook?.jsonObject ?? workbook }, this.saveOptions);

        await new Promise(resolve => setTimeout(resolve, 500));

        await this.ensureDashboard();
        await this.moveDashboardFirst();

        this.syncSheetIdentity();
        this.syncSheetToUi();
        this.spreadsheet?.resize();
    }

    /** New dashboard spreadsheet: starts with the Dashboard sheet only. */
    private async createEmptyWorkbook(): Promise<void> {
        if (!this.spreadsheet) {
            return;
        }

        this.sheetSources = [];
        this.analyses = [];
        this.widgets = [];
        this.currentSource = null;
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
        this.resizeLater(100);
    }

    // =====================================================
    // CHART PANEL
    // =====================================================

    onSheetClick(event: MouseEvent): void {
        const target = event.target as HTMLElement | null;
        const overlay = target?.closest?.('.e-datavisualization-chart') as HTMLElement | null;

        if (!overlay) {
            return;
        }

        const innerChart = overlay.querySelector('.e-control') as HTMLElement | null;
        const chartId = text(innerChart?.id || overlay.id);
        const chart = this.findChart(chartId, overlay.id);

        if (!chart) {
            console.warn('[Chart Panel] selected chart model was not found.', { chartId, overlayId: overlay.id });
            return;
        }

        this.selectedChart = chart;
        this.chartSheet = this.activeSheetName || null;
        this.chartRange = text(chart.siiwiiOriginalRange ?? chart.range);

        // Restore the independent category/series ranges set by this panel.
        if (chart.siiwiiCategoryRange && Array.isArray(chart.siiwiiSeriesRanges)) {
            this.categoryRange = text(chart.siiwiiCategoryRange);
            this.seriesRanges = chart.siiwiiSeriesRanges
                .map((range: any) => ({ range: text(range) }))
                .filter((item: any) => !!item.range);
        } else {
            this.splitRangeToSeries();
        }

        this.showDataPanel = false;
        this.showChartPanel = true;
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
                // Keep the user's real configuration so the panel can restore it.
                siiwiiOriginalRange: text(this.chartRange),
                siiwiiCategoryRange: categoryText,
                siiwiiSeriesRanges: [...seriesTexts]
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
    private async replaceChart(ownerSheetName: string, changes: any): Promise<void> {
        const oldChart = { ...this.selectedChart };
        const chartId = text(oldChart.id);

        await this.activateSheet(ownerSheetName);

        if (chartId && typeof this.grid.deleteChart === 'function') {
            this.grid.deleteChart(chartId);
            await yieldToBrowser();
        }

        const updatedChart: any = { ...oldChart, ...changes };

        this.grid.insertChart([updatedChart]);
        await this.settle();

        this.selectedChart = this.findChart(chartId) ?? updatedChart;

        if (chartId && typeof this.grid.selectChart === 'function') {
            this.grid.selectChart(chartId);
        }

        this.resizeLater(100);
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
        const rowCount = category.endRow - category.startRow + 1;
        const startColumnNumber = 200 + this.helperSlot(chartId) * 30; // 1-based

        if (sources.length > 30) {
            throw new Error('A chart can use at most 29 data series in this editor.');
        }

        sources.forEach((source, offset) => {
            const helperColumn = toColumnName(startColumnNumber + offset);
            const sourceSheet = this.quoteSheetName(source.sheetName);

            for (let r = 0; r < rowCount; r++) {
                this.grid.updateCell(
                    { formula: `=${sourceSheet}!${source.startColumn}${source.startRow + r}` },
                    `${helperColumn}${r + 1}`
                );
            }
        });

        await this.settle();

        const startColumn = toColumnName(startColumnNumber);
        const endColumn = toColumnName(startColumnNumber + sources.length - 1);

        return `${this.quoteSheetName(ownerSheetName)}!${startColumn}1:${endColumn}${rowCount}`;
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
        const charts: any[] = this.grid?.chartColl ?? [];
        const direct = charts.find(chart => wanted.includes(text(chart?.id)));

        if (direct) {
            return direct;
        }

        return (
            this.getSheetCharts(this.activeSheet).find(
                chart => !wanted.length || wanted.includes(text(chart?.id))
            ) ?? null
        );
    }

    // =====================================================
    // RIBBON
    // =====================================================

    /** Adds " List" and "Pivot Table" buttons to the Insert ribbon tab. */
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
                        text: 'List',
                        tooltipText: 'Insert data source',
                        prefixIcon: 'e-icons e-list',
                        click: () => this.openDataPanel()
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

    /** Second supported path for the ribbon buttons. */
    onRibbonClick(args: any): void {
        const id = text(
            args?.item?.id ?? args?.item?.properties?.id ?? args?.originalEvent?.target?.id ?? args?.target?.id
        ).toLowerCase();

        const label = text(
            args?.item?.text ??
            args?.item?.properties?.text ??
            args?.originalEvent?.target?.textContent ??
            args?.target?.textContent
        ).toLowerCase();

        if (id.includes('spreadsheet_data_source') || label.includes('list')) {
            this.openDataPanel();
        } else if (id.includes('spreadsheet_pivot') || label.includes('pivot table')) {
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

        this.closeChartPanel();

        this.showDataPanel = true;

        this.cdr.detectChanges();

        this.resizeLater();
    }

    closeDataPanel(): void {

        this.showDataPanel = false;

        this.cdr.detectChanges();

        this.resizeLater();
    }

    async onDataBatchLoaded(
        batch: SpreadsheetDataBatch
    ): Promise<void> {

        if (!this.spreadsheet) {
            return;
        }

        try {

            this.pendingDataBatch = batch;


            // ==========================================
            // FIRST BATCH
            // ==========================================

            if (batch.isFirstBatch) {

                this.showLoading(
                    `Loading ${batch.entity.displayName}...`
                );

                this.newDataSheetName =
                    this.getUniqueSheetName(
                        batch.entity.displayName
                    );

                this.newDataSheetLoadedRows = 0;


                // Create EMPTY sheet
                this.grid.insertSheet(
                    [
                        {
                            name:
                                this.newDataSheetName
                        }
                    ],
                    this.allSheets.length
                );


                const ready =
                    await this.waitForSheet(
                        this.newDataSheetName
                    );


                if (!ready) {

                    throw new Error(
                        `Unable to create sheet "${this.newDataSheetName}".`
                    );
                }


                await this.activateSheet(
                    this.newDataSheetName
                );


                await this.paint();
            }


            if (!this.newDataSheetName) {
                return;
            }


            // ==========================================
            // SELECTED COLUMNS
            // ==========================================

            const columns =
                batch.entity.columns.filter(
                    column =>
                        batch.selectedColumns.includes(
                            column.key
                        )
                );


            await this.activateSheet(
                this.newDataSheetName
            );


            // ==========================================
            // HEADERS
            // ==========================================

            if (batch.isFirstBatch) {

                columns.forEach(
                    (column, columnIndex) => {

                        const address =
                            `${toColumnName(
                                columnIndex + 1
                            )}1`;


                        this.grid.updateCell(
                            {
                                value:
                                    column.label
                            },
                            address
                        );
                    }
                );
            }


            // ==========================================
            // CURRENT BATCH
            // ==========================================

            batch.rows.forEach(
                (row, rowIndex) => {

                    const spreadsheetRow =
                        this.newDataSheetLoadedRows +
                        rowIndex +
                        2;


                    columns.forEach(
                        (column, columnIndex) => {

                            const address =
                                `${toColumnName(
                                    columnIndex + 1
                                )}${spreadsheetRow}`;


                            this.grid.updateCell(
                                {
                                    value:
                                        row[
                                        column.label
                                        ]
                                },
                                address
                            );
                        }
                    );
                }
            );


            // Current batch is now written.
            this.newDataSheetLoadedRows +=
                batch.rows.length;


            // ==========================================
            // PROGRESS
            // ==========================================

            this.setProgress(
                batch.loaded,
                batch.total
            );


            this.loadingMessage =
                batch.total > 0
                    ? `Loaded ${batch.loaded.toLocaleString()} of ${batch.total.toLocaleString()} records`
                    : `Loaded ${batch.loaded.toLocaleString()} records`;


            // Make current records visible.
            await this.paint();


            // ==========================================
            // LAST BATCH
            // ==========================================

            if (batch.isLastBatch) {

                await this.finishDataLoading(
                    batch
                );
            }

        } catch (error) {

            this.onDataLoadingFailed(
                error
            );
        }
    }
    private async finishDataLoading(batch: SpreadsheetDataBatch): Promise<void> {
        const sheetName = this.newDataSheetName;
        if (!sheetName) {
            return;
        }

        const sheet = this.findSheet(sheetName);
        if (!sheet) {
            throw new Error(
                `Sheet "${sheetName}" was not found.`
            );
        }

        this.upsertSheetSource({
            sheetId: sheet.id,
            sheetName,
            source: {
                type: batch.entity.displayName,
                sourceKey: batch.entity.sourceKey,
                mode: 'AllRecords',
                columns: [...batch.selectedColumns],
                filters: { ...batch.filters }
            }
        });

        this.loadingProgress = 100;
        this.loadingMessage = `Loaded ${batch.loaded.toLocaleString()} records`;
        this.syncSheetIdentity();
        this.syncSheetToUi();
        this.notify.success(
            `${batch.loaded.toLocaleString()} records added to ${sheetName}.`
        );
        this.showDataPanel = false;
        await this.paint();
        // Clear AFTER Spreadsheet has finished.
        this.newDataSheetName = null;
        this.newDataSheetLoadedRows = 0;
        this.pendingDataBatch = null;
        this.resizeLater();
        setTimeout(
            () => {

                this.hideLoading();

                this.cdr.detectChanges();

            },
            250
        );
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


    onDataLoadingFailed(
        error: any
    ): void {

        console.error(
            '[Spreadsheet] data loading failed:',
            error
        );


        this.hideLoading();


        this.newDataSheetName = null;

        this.newDataSheetLoadedRows = 0;

        this.pendingDataBatch = null;


        this.notify.error(
            'Unable to load Spreadsheet data.'
        );


        this.cdr.detectChanges();
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

            // 4. Settings + current pivot + active tab.
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

    /** Reads the whole source sheet and converts it into pivot records. */
    private async readPivotRecords(sourceSheetName: string): Promise<IDataSet[] | null> {
        const sheet = this.findSheet(sourceSheetName);

        if (!sheet) {
            this.notify.warn(`Source sheet "${sourceSheetName}" was not found.`);
            return null;
        }

        const lastRow = sheet.usedRange?.rowIndex ?? 0;
        const lastCol = sheet.usedRange?.colIndex ?? 0;

        if (lastRow < 1 || lastCol < 0) {
            this.notify.warn('The source sheet does not contain records.');
            return null;
        }

        const range =
            `${this.quoteSheetName(sourceSheetName)}!A1:${toColumnName(lastCol + 1)}${lastRow + 1}`;

        const data = await this.spreadsheet!.getData(range);
        const records = this.sheetDataToRecords(data, lastRow, lastCol) as IDataSet[];

        if (!records.length) {
            this.notify.warn('No records were found in the source sheet.');
            return null;
        }

        return records;
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
            console.error('[Pivot] PivotView was not created.');
            return;
        }

        const settings = { ...this.pivotSettings, dataSource: [...records] };

        this.pivotView.dataSourceSettings = settings;
        this.pivotView.showFieldList = false; // field list is a separate fixed component
        this.pivotView.showGroupingBar = true;
        this.pivotView.showToolbar = true;
        this.pivotView.toolbar = this.pivotToolbar as any;
        this.pivotView.displayOption = { view: 'Both', primary: 'Table' } as DisplayOption;
        this.pivotView.chartSettings = this.pivotChart;
        this.pivotView.dataBind?.();

        if (this.pivotFieldList) {
            this.pivotFieldList.dataSourceSettings = { ...settings } as any;
            this.pivotFieldList.dataBind?.();
            this.pivotFieldList.update?.(this.pivotView);
        }

        this.pivotView.refresh?.();
    }

    /** Opens/closes the pivot view when the user switches sheet tabs. */
    private async syncPivotForActiveSheet(): Promise<void> {
        if (this.isCreatingPivot || !this.activeSheetName) {
            return;
        }

        const name = this.activeSheetName;
        const analysis = this.findAnalysis(name);

        if (!analysis) {
            if (this.showPivot) {
                // User left a Pivot tab: keep its latest state in memory.
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

        if (!rows.length) {
            return [];
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

        // Identifier fields must stay strings.
        if (normalizeKey(fieldName) === 'transactionnumber') {
            return String(value).trim();
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
                .map(r => r[fieldName])
                .filter(v => v !== '' && v !== null && v !== undefined);

            // TransactionNumber should COUNT, not SUM.
            const isTransactionNumber = normalizeKey(fieldName) === 'transactionnumber';
            const isNumeric =
                !isTransactionNumber && values.length > 0 && values.every(v => typeof v === 'number');

            return {
                name: fieldName,
                caption: fieldName,
                dataType: isNumeric ? 'number' : 'string',
                type: isTransactionNumber ? 'Count' : undefined
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

        this.forceTransactionCount();
    }

    /** Makes sure TransactionNumber is always counted (not summed). */
    private forceTransactionCount(): void {
        const settings = this.pivotView?.dataSourceSettings;
        let changed = false;

        (settings?.values ?? []).forEach((field: any) => {
            if (normalizeKey(field.name) === 'transactionnumber' && field.type !== 'Count') {
                field.type = 'Count';
                field.caption = 'Transaction Count';
                changed = true;
            }
        });

        if (changed) {
            this.pivotView.dataSourceSettings = settings;
        }
    }

    private refreshPivot(): void {
        if (!this.pivotView) {
            return;
        }

        this.pivotView.dataSourceSettings = this.pivotSettings;
        this.pivotView.dataBind?.();

        if (this.pivotFieldList) {
            this.pivotFieldList.dataSourceSettings = this.pivotSettings as any;
            this.pivotFieldList.dataBind?.();
            this.pivotFieldList.update?.(this.pivotView);
        }
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

    /** User changed the chart type in the Pivot: keep metadata + Dashboard chart in sync. */
    onPivotChartChanged(args: any): void {
        const type = text(
            args?.series?.[0]?.type ??
            this.pivotView?.chart?.series?.[0]?.type ??
            this.pivotView?.chartSettings?.chartSeries?.type
        );

        if (!type) {
            return;
        }

        this.pivotChart = {
            ...this.pivotChart,
            chartSeries: { ...(this.pivotChart?.chartSeries ?? {}), type }
        };

        const analysis: any = this.getCurrentAnalysis();

        if (analysis) {
            analysis.chart = {
                ...analysis.chart,
                type,
                title: analysis.chart?.title ?? `${analysis.sourceSheetName} Pivot Chart`
            };
        }

        // Debounce: Syncfusion may fire this several times while rebuilding the chart.
        clearTimeout(this.chartSyncTimer);
        this.chartSyncTimer = setTimeout(() => void this.syncChartTypeToDashboard(type), 100);
    }

    /** Replaces the Pivot's Dashboard chart when its type changed. */
    private async syncChartTypeToDashboard(pivotType: string): Promise<void> {
        const analysis: any = this.getCurrentAnalysis();

        if (!this.spreadsheet || !analysis || (!analysis.dashboardChartId && !analysis.dashboardDataRange)) {
            return;
        }

        const range = this.removeSheetFromRange(analysis.dashboardDataRange);
        const existing = range ? this.findPivotDashboardChart(analysis, range) : null;

        if (!existing) {
            return;
        }

        const newType = this.toSheetChartType(pivotType);
        const oldId = text(existing.id);

        if (text(existing.type) === newType || !oldId || typeof this.grid.deleteChart !== 'function') {
            return;
        }

        // Chart APIs work on the active sheet, so go to Dashboard and come back.
        const previousSheet = this.activeSheetName;

        await this.activateSheet(DASHBOARD_SHEET);

        this.grid.deleteChart(oldId);
        await this.settle();

        const inserted = await this.insertDashboardChart({
            range,
            type: newType,
            theme: existing.theme ?? 'Material',
            title: existing.title ?? `${analysis.sheetName} Chart`,
            height: existing.height ?? 320,
            width: existing.width ?? 520,
            top: existing.top ?? 30,
            left: existing.left ?? 30,
            isSeriesInRows: existing.isSeriesInRows ?? false
        });

        // Replacing the chart creates a new native chart id.
        const newId = text(inserted?.id);

        analysis.dashboardChartId = newId || analysis.dashboardChartId;

        const widget = this.widgets.find(
            w => w.sourceType === 'PIVOT' && (w.analysisId === analysis.id || w.id === analysis.dashboardWidgetId)
        );

        if (widget) {
            widget.chartId = newId || widget.chartId;
            widget.chartType = newType;
        }

        if (previousSheet && previousSheet !== DASHBOARD_SHEET) {
            await this.activateSheet(previousSheet);
        }

        this.resizeLater(100);
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

            // Data goes into a reserved block of the ONE Dashboard sheet.
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

            await this.activateSheet(DASHBOARD_SHEET);
            this.resizeLater(100);

            this.notify.success(
                result.updated
                    ? 'Pivot chart updated on Dashboard. Click Save to persist changes.'
                    : 'Pivot chart added to Dashboard. Click Save to persist changes.'
            );
        } catch (error) {
            console.error('Copy Pivot chart to Dashboard failed:', error);
            this.notify.error('Unable to copy Pivot chart to Dashboard.');
        }
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
        const map: Record<string, string> = {
            Spline: 'Line',
            SplineArea: 'Area'
        };

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

    private async activateSheet(sheetName: string): Promise<number> {
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

        return index;
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
        this.sheetSources.forEach(item => {
            // Name first: ids are unreliable after openFromJson()/dynamic inserts.
            const sheet =
                this.allSheets.find((x: any) => text(x?.name) === text(item.sheetName)) ??
                (item.sheetId != null ? this.allSheets.find((x: any) => x?.id === item.sheetId) : null);

            if (sheet) {
                item.sheetId = sheet.id;
                item.sheetName = sheet.name;
            }
        });
    }

    // ---- Active-tab watcher ----

    private startSheetWatcher(): void {
        this.stopSheetWatcher();

        if (!this.spreadsheet) {
            return;
        }

        this.lastSheetIndex = Number(this.grid.activeSheetIndex ?? 0);

        this.sheetWatcher = setInterval(() => {
            if (!this.spreadsheet) {
                return;
            }

            // Dashboard is fixed as the first tab: move it back if the user dragged it.
            void this.moveDashboardFirst();

            const index = Number(this.grid.activeSheetIndex ?? 0);

            if (index === this.lastSheetIndex) {
                return;
            }

            this.lastSheetIndex = index;
            this.syncSheetToUi();
            void this.syncPivotForActiveSheet();
        }, 100);
    }

    private stopSheetWatcher(): void {
        if (this.sheetWatcher) {
            clearInterval(this.sheetWatcher);
            this.sheetWatcher = null;
        }
    }

    /** Shows the source/filters of the active tab in the header. */
    private syncSheetToUi(): void {
        const name = this.activeSheetName;

        if (!name) {
            return;
        }

        // Match by NAME (ids are unreliable after openFromJson()).
        const source = this.sheetSources.find(i => text(i.sheetName) === name)?.source;

        // Always replace the previous tab's state.
        this.currentSource = source ? this.cloneSource(source) : null;
        this.currentFilters = { ...(source?.filters ?? {}) };

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
        const filters = this.currentFilters;

        if (!filters) {
            return [];
        }

        const asIs = (v: any) => String(v);
        const asDate = (v: any) => this.formatDate(v);

        const definitions: [string, string, (v: any) => string][] = [
            ['search', 'Search', asIs],
            ['sellerNameFilter', 'Seller', asIs],
            ['buyerNameFilter', 'Buyer', asIs],
            ['codeFilter', 'Transaction', asIs],
            ['referenceNumberFilter', 'Reference', asIs],
            ['minCreateDateFilter', 'Created From', asDate],
            ['maxCreateDateFilter', 'Created To', asDate],
            ['minCompleteDateFilter', 'Complete From', asDate],
            ['maxCompleteDateFilter', 'Complete To', asDate],
            ['sorting', 'Sorting', asIs]
        ];

        const result = definitions
            .filter(([key]) => !!filters[key])
            .map(([key, label, format]) => ({ label, value: format(filters[key]) }));

        // Status keeps its position after Reference and accepts 0.
        if (filters.statusFilter !== undefined && filters.statusFilter !== null) {
            result.splice(5, 0, { label: 'Status', value: String(filters.statusFilter) });
        }

        return result;
    }

    // =====================================================
    // SAVE
    // =====================================================

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

        this.grid
            .saveAsJson(this.saveOptions)
            .then((rawWorkbook: any) => {
                const workbook = this.reconcileDashboardCharts(rawWorkbook);
                this.rebuildWidgets(workbook);

                // Keys below are the saved format: do not rename them.
                const spreadsheet = {
                    workbookJson: workbook,
                    sheetDataSources,
                    sheetAnalyses: clone(this.analyses),
                    dashboardWidgets: clone(this.widgets),
                    updatedDate: new Date().toISOString(),
                    recordCount: this.countRecords(workbook)
                };

                // The generated proxy already does JSON.stringify(body).
                return firstValueFrom(this.dashboardService.saveSpreadSheetJson(dashboardId, spreadsheet));
            })
            .then(() => {
                this.notify.success('Spreadsheet saved successfully.');
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

    /** Rows of the Transactions sheet, minus the header. */
    private countRecords(workbook: any): number {
        const sheet = workbook?.jsonObject?.Workbook?.sheets?.find((s: any) => s.name === TRANSACTIONS_SHEET);
        return sheet?.rows?.length ? Math.max(sheet.rows.length - 1, 0) : 0;
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

}