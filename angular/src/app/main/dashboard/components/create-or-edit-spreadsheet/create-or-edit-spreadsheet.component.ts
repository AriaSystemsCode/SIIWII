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

import { AppDashboardServiceProxy, AppTransactionServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

import {
    DashboardWidgetMetadata,
    SavedSheetAnalysis,
    SpreadsheetDataSource,
    SpreadsheetEntityDefinition,
    SpreadsheetFilters,
    SpreadsheetSheetDataSource
} from '../../models/dashboard.model';

import {
    DASHBOARD_SHEET,
    TRANSACTIONS_SHEET,
    clone,
    getChartReferencedSheetNames,
    normalizeKey,
    readPixelValue,
    text,
    toColumnName,
    yieldToBrowser
} from '../../models/spreadsheet.model';

/** A parsed range such as 'Transactions'!A1:A40 */
interface ParsedRange {
    sheetName: string;
    startColumn: string;
    endColumn: string;
    startColumnIndex: number;
    endColumnIndex: number;
    startRow: number;
    endRow: number;
}

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

    // =====================================================
    // STATE
    // =====================================================

    dashboardId: number | null = null;
    // spreadsheetId: number | null = null;

    // ---- Spreadsheet ----
    spreadsheetRows: any[] = [];
    sheets: SheetModel[] = [];
    isOpeningSavedSpreadsheet = false;
    isRefreshing = false;


    readonly scrollSettings: any = { enableVirtualization: true, isFinite: false };
    readonly showAggregate = false;

    /** Keep small while testing. Increase after verification. */
    private readonly batchSize = 10;
    private readonly saveOptions: any = { ignoreImage: true, ignoreNote: true };

    // ---- Loading bar ----
    isLoading = false;
    loadingProgress = 0;
    loadingMessage = '';

    // ---- "Add data" panel ----
    showDataPanel = false;
    addDataStep: 1 | 2 = 1;
    selectedEntityKey: string | null = null;
    selectedEntity: SpreadsheetEntityDefinition | null = null;
    selectedColumns: string[] = [];
    filters: Record<string, any> = {};
    isAddingData = false;

    readonly entities: SpreadsheetEntityDefinition[] = [
        {
            sourceKey: 'TRANSACTIONS',
            displayName: 'Transactions',
            icon: 'fa fa-exchange-alt',
            columns: [
                { key: 'TransactionNumber', label: 'Transaction Number', type: 'string', defaultSelected: true },
                { key: 'TransactionType', label: 'Transaction Type', type: 'string', defaultSelected: true },
                { key: 'Seller', label: 'Seller', type: 'string', defaultSelected: true },
                { key: 'Buyer', label: 'Buyer', type: 'string', defaultSelected: true },
                { key: 'Status', label: 'Status', type: 'string', defaultSelected: true },
                { key: 'CreatedDate', label: 'Created Date', type: 'date', defaultSelected: true },
                { key: 'CompleteDate', label: 'Complete Date', type: 'date' },
                { key: 'Reference', label: 'Reference', type: 'string' },
                { key: 'Creator', label: 'Creator', type: 'string' },
                { key: 'Currency', label: 'Currency', type: 'string' },
                { key: 'Quantity', label: 'Quantity', type: 'number', defaultSelected: true },
                { key: 'Amount', label: 'Amount', type: 'number', defaultSelected: true }
            ],
            filters: [
                { key: 'search', label: 'Search', type: 'string' },
                { key: 'codeFilter', label: 'Transaction Number', type: 'string' },
                { key: 'sellerNameFilter', label: 'Seller', type: 'string' },
                { key: 'buyerNameFilter', label: 'Buyer', type: 'string' },
                { key: 'statusFilter', label: 'Status', type: 'statusLookup' },
                { key: 'minCreateDateFilter', label: 'Created From', type: 'date' },
                { key: 'maxCreateDateFilter', label: 'Created To', type: 'date' },
                { key: 'referenceNumberFilter', label: 'Reference', type: 'string' }
            ]
        },
        {
            sourceKey: 'ITEMS',
            displayName: 'Items',
            icon: 'fa fa-box',
            columns: [
                { key: 'Code', label: 'Code', type: 'string', defaultSelected: true },
                { key: 'Name', label: 'Name', type: 'string', defaultSelected: true },
                { key: 'Brand', label: 'Brand', type: 'string', defaultSelected: true },
                { key: 'AvailableQuantity', label: 'Available Quantity', type: 'number', defaultSelected: true },
                { key: 'Price', label: 'Price', type: 'number', defaultSelected: true }
            ],
            filters: [
                { key: 'search', label: 'Search', type: 'string' },
                { key: 'brandId', label: 'Brand', type: 'number' },
                { key: 'onlyAvailableStock', label: 'Available Stock Only', type: 'boolean' }
            ]
        }
    ];

    // ---- Pivot ----
    showPivot = false;
    pivotData: IDataSet[] = [];
    currentPivotSheetName: string | null = null;
    pivotSourceSheetName: string | null = null;
    private isCreatingPivot = false;

    pivotDisplayOption = { view: 'Both', primary: 'Table' } as DisplayOption;
    pivotToolbar: any[] = ['Grid', 'Chart'];
    pivotChartSettings: any = {
        chartSeries: { type: 'Column' },
        height: '280',
        title: 'Pivot Chart',
        enableMultipleAxis: false
    };
    pivotDataSourceSettings: any = {
        dataSource: [],
        rows: [],
        columns: [],
        values: [],
        filters: [],
        enableSorting: true,
        allowLabelFilter: true,
        allowValueFilter: true
    };

    // ---- Per-sheet metadata ----
    currentSpreadsheetSource: SpreadsheetDataSource | null = null;
    currentSpreadsheetFilters: any = null;
    sheetDataSources: SpreadsheetSheetDataSource[] = [];
    sheetAnalyses: SavedSheetAnalysis[] = [];
    dashboardWidgets: DashboardWidgetMetadata[] = [];

    private sheetWatcher: any = null;
    private lastActiveSheetIndex = -1;
    private dashboardSheetPromise: Promise<any> | null = null;

    // ---- Chart panel ----
    showChartPanel = false;
    selectedChart: any = null;
    selectedChartSheetName: string | null = null;
    chartRange = '';
    chartCategoryRange = '';
    chartSeriesRanges: Array<{ range: string }> = [];
    applyingChartRange = false;

    constructor(
        injector: Injector,
        private route: ActivatedRoute,
        private _appTransactionServiceProxy: AppTransactionServiceProxy,
         public appDashboardsAppService: AppDashboardServiceProxy,
        private cdr: ChangeDetectorRef
    ) {
        super(injector);
    }

    // =====================================================
    // SMALL SHORTCUTS
    // =====================================================

    /** Untyped access to Syncfusion APIs missing from the typings. */
    private get grid(): any {
        return this.spreadsheet as any;
    }

    private get allSheets(): any[] {
        return this.grid?.sheets ?? [];
    }

    private findSheet(name: string): any {
        return this.allSheets.find((s: any) => s?.name === name);
    }

    private resizeLater(): void {
        setTimeout(() => this.spreadsheet?.resize(), 0);
    }

    private refreshLayout(): void {
        setTimeout(() => {
            try {
                this.spreadsheet?.resize();
            } catch (error) {
                console.error('Spreadsheet resize failed:', error);
            }
        }, 100);
    }

    /** StatusId = 0 means "no status filter" on this screen. */
    private cleanStatus(value: any): number | undefined {
        return value == null || Number(value) === 0 ? undefined : Number(value);
    }

    // private readPositiveNumber(value: any): number | null {
    //     const n = Number(value);
    //     return Number.isFinite(n) && n > 0 ? n : null;
    // }

    private quoteSheetName(sheetName: string): string {
        const name = text(sheetName);
        return /[\s()'!]/.test(name) ? `'${name.replace(/'/g, "''")}'` : name;
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

    // =====================================================
    // LIFECYCLE
    // =====================================================

    ngOnInit(): void {

         this.route.paramMap.subscribe(params => {
          const idParam = params.get('id');        
       
 this.dashboardId = idParam ? Number(idParam) : null;
       
        });


    
    }

    ngOnDestroy(): void {
        this.stopSheetWatcher();
    }

  onCreated(): void {
    if (!this.spreadsheet) {
        return;
    }

    const grid = this.grid;

    if ('showSheetTabs' in grid) {
        grid.showSheetTabs = true;
    }

    this.addRibbonButtons();

    if ('showAggregate' in grid) {
        grid.showAggregate = false;
    }

    if ('scrollSettings' in grid) {
        grid.scrollSettings = {
            ...(grid.scrollSettings ?? {}),
            enableVirtualization: true,
            isFinite: false
        };
    }

    this.startSheetWatcher();

    void this.loadDashboardSpreadsheet();
}


private loadDashboardSpreadsheet(): void {
    if (!this.dashboardId || !this.spreadsheet) {
        return;
    }

    this.isOpeningSavedSpreadsheet = true;

    this.appDashboardsAppService
        .getDashboardForView(this.dashboardId)
        .subscribe({
            next: async (result: any) => {
                try {
                    const dashboard = result?.dashboard ?? result;
                    const savedSpreadsheet = dashboard?.spreadsheet;

                    if (savedSpreadsheet) {
                        await this.openDashboardSpreadsheet(savedSpreadsheet);
                    } else {
                        await this.createEmptyDashboardSpreadsheet();
                    }
                } catch (error) {
                    console.error(
                        '[Spreadsheet] Failed to initialize dashboard spreadsheet:',
                        error
                    );

                    this.notify.error('Unable to open Spreadsheet.');
                } finally {
                    this.isOpeningSavedSpreadsheet = false;
                    this.cdr.detectChanges();
                }
            },

            error: (error: any) => {
                console.error(
                    '[Spreadsheet] Failed to load dashboard:',
                    error
                );

                this.isOpeningSavedSpreadsheet = false;
                this.notify.error('Unable to load Dashboard.');
            }
        });
}

private async openDashboardSpreadsheet(saved: any): Promise<void> {
    if (!this.spreadsheet) {
        return;
    }

    let savedValue: any = saved;

    if (typeof savedValue === 'string') {
        savedValue = JSON.parse(savedValue);
    }

    this.sheetDataSources = savedValue?.sheetDataSources?.length
        ? this.cloneSheetSources(savedValue.sheetDataSources)
        : [];
    this.sheetAnalyses = clone(savedValue?.sheetAnalyses ?? []);
    this.dashboardWidgets = clone(savedValue?.dashboardWidgets ?? []);

    const initialSource =
        this.getSourceByName(TRANSACTIONS_SHEET) ??
        this.sheetDataSources[0]?.source ??
        null;

    this.currentSpreadsheetSource = initialSource
        ? this.cloneSource(initialSource)
        : null;

    this.currentSpreadsheetFilters = {
        ...(initialSource?.filters ?? {})
    };

    const cleanWorkbook = this.cleanWorkbookJson(
        savedValue?.workbookJson ?? savedValue
    );

    const jsonObject =
        cleanWorkbook?.jsonObject ??
        cleanWorkbook;

    this.grid.openFromJson(
        { file: jsonObject },
        this.saveOptions
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    await this.ensureDashboardSheet();
    await this.moveDashboardToFirst();

    this.syncSheetIdentity();
    this.syncActiveSheetToUi();
    this.spreadsheet.resize();
}

private async createEmptyDashboardSpreadsheet(): Promise<void> {
    if (!this.spreadsheet) {
        return;
    }

    this.sheetDataSources = [];
    this.sheetAnalyses = [];
    this.dashboardWidgets = [];
    this.currentSpreadsheetSource = null;
    this.currentSpreadsheetFilters = null;

    // Create/reuse Dashboard FIRST so Syncfusion is never left with zero sheets.
    await this.ensureDashboardSheet();
    await this.moveDashboardToFirst();

    // New dashboard spreadsheet starts with Dashboard only.
    for (let i = this.allSheets.length - 1; i >= 0; i--) {
        const name = text(this.allSheets[i]?.name);

        if (name && name.toLowerCase() !== DASHBOARD_SHEET.toLowerCase()) {
            try {
                this.grid.deleteSheet(i);
            } catch (error) {
                console.warn('[Spreadsheet] Unable to remove initial sheet:', name, error);
            }
        }
    }

    await yieldToBrowser();
    await this.moveDashboardToFirst();
    await this.activateSheet(DASHBOARD_SHEET);

    this.syncSheetIdentity();
    this.refreshLayout();
}

private async moveDashboardToFirst(): Promise<void> {
    if (!this.spreadsheet) {
        return;
    }

    const dashboardIndex = this.allSheets.findIndex(
        (sheet: any) =>
            text(sheet?.name).trim().toLowerCase() ===
            DASHBOARD_SHEET.toLowerCase()
    );

    if (dashboardIndex <= 0) {
        return;
    }

    if (typeof this.grid.moveSheet === 'function') {
        this.grid.moveSheet(0, [dashboardIndex]);
        await yieldToBrowser();
    }
}


    close(): void {
        this.stopSheetWatcher();
        this.showDataPanel = false;
        this.closeChartPanel();
    }

    onActiveSheetChanged(): void {
        setTimeout(() => {
            this.syncActiveSheetToUi();
            void this.syncPivotForActiveSheet();
        }, 0);
    }

    /** Syncfusion recommendation for large Save-As. Needs (beforeSave)="onBeforeSave($event)". */
    onBeforeSave(args: any): void {
        if (args) {
            args.isFullPost = false;
        }
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
        this.selectedChartSheetName = text(this.grid.getActiveSheet?.()?.name) || null;
        this.chartRange = text(chart.siiwiiOriginalRange ?? chart.range);

        // Restore the independent category/series ranges set by this panel.
        if (chart.siiwiiCategoryRange && Array.isArray(chart.siiwiiSeriesRanges)) {
            this.chartCategoryRange = text(chart.siiwiiCategoryRange);
            this.chartSeriesRanges = chart.siiwiiSeriesRanges
                .map((range: any) => ({ range: text(range) }))
                .filter((item: any) => !!item.range);
        } else {
            this.loadSeriesFromRange();
        }

        this.showDataPanel = false;
        this.showChartPanel = true;
    }

    closeChartPanel(): void {
        this.showChartPanel = false;
        this.selectedChart = null;
        this.selectedChartSheetName = null;
        this.chartRange = '';
        this.chartCategoryRange = '';
        this.chartSeriesRanges = [];
        this.applyingChartRange = false;
        this.cdr.detectChanges();
        this.resizeLater();
    }

    addChartSeries(): void {
        this.chartSeriesRanges = [...this.chartSeriesRanges, { range: '' }];
    }

    removeChartSeries(index: number): void {
        this.chartSeriesRanges = this.chartSeriesRanges.filter((_series, i) => i !== index);
    }

    /** Applies independent category + series ranges (they do not need to be adjacent). */
    async applyChartSeries(): Promise<void> {
        if (!this.selectedChart || !this.selectedChartSheetName) {
            return;
        }

        const categoryRange = text(this.chartCategoryRange);
        const seriesRanges = this.chartSeriesRanges.map(s => text(s.range)).filter(Boolean);

        if (!categoryRange) {
            this.notify.warn('Choose a Category / X Axis range.');
            return;
        }

        if (!seriesRanges.length) {
            this.notify.warn('Choose at least one data series.');
            return;
        }

        const category = this.parseRange(categoryRange);
        const series = seriesRanges.map(range => this.parseRange(range));

        if (!category || series.some(item => !item)) {
            this.notify.warn('One or more chart ranges are invalid.');
            return;
        }

        const validSeries = series.filter((item): item is ParsedRange => !!item);
        const allRanges = [category, ...validSeries];

        if (allRanges.some(r => r.startColumnIndex !== r.endColumnIndex)) {
            this.notify.warn('Category and each data series must contain one column only.');
            return;
        }

        const rowCount = category.endRow - category.startRow + 1;

        if (allRanges.some(r => r.endRow - r.startRow + 1 !== rowCount)) {
            this.notify.warn('Category and all data series must contain the same number of rows.');
            return;
        }

        for (const item of allRanges) {
            if (!this.findSheet(item.sheetName)) {
                this.notify.warn(`Sheet "${item.sheetName}" was not found.`);
                return;
            }
        }

        const ownerSheet = this.selectedChartSheetName;
        const chartId = text(this.selectedChart.id);

        await this.updateChart(async () => {
            const helperRange = await this.buildHelperRange(ownerSheet, chartId, category, validSeries);

            await this.replaceChart(ownerSheet, {
                range: helperRange,
                // Keep the user's real configuration so the panel can restore it.
                siiwiiOriginalRange: text(this.chartRange),
                siiwiiCategoryRange: categoryRange,
                siiwiiSeriesRanges: [...seriesRanges]
            });

            // Show the user's ranges, not the hidden helper range.
            this.chartCategoryRange = categoryRange;
            this.chartSeriesRanges = seriesRanges.map(range => ({ range }));
        });
    }

    /** Shared wrapper: busy flag, error handling, success message. */
    private async updateChart(work: () => Promise<void>): Promise<void> {
        this.applyingChartRange = true;

        try {
            await work();
            this.notify.success('Chart data updated.');
        } catch (error) {
            console.error('[Chart Panel] unable to update chart data:', error);
            this.notify.error('Unable to update chart data.');
        } finally {
            this.applyingChartRange = false;
            this.cdr.detectChanges();
        }
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
        await yieldToBrowser();
        await yieldToBrowser();

        this.selectedChart = this.findChart(chartId) ?? updatedChart;

        if (chartId && typeof this.grid.selectChart === 'function') {
            this.grid.selectChart(chartId);
        }

        this.refreshLayout();
    }

    private loadSeriesFromRange(): void {
        const parsed = this.parseRange(this.chartRange);

        if (!parsed) {
            this.chartCategoryRange = '';
            this.chartSeriesRanges = [];
            return;
        }

        const sheet = this.quoteSheetName(parsed.sheetName);
        const first = parsed.startColumn;

        this.chartCategoryRange = `${sheet}!${first}${parsed.startRow}:${first}${parsed.endRow}`;

        const series: Array<{ range: string }> = [];

        for (let i = parsed.startColumnIndex + 1; i <= parsed.endColumnIndex; i++) {
            const column = toColumnName(i + 1);
            series.push({ range: `${sheet}!${column}${parsed.startRow}:${column}${parsed.endRow}` });
        }

        this.chartSeriesRanges = series;
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
        const startColumnNumber = 200 + this.getHelperSlot(chartId) * 30; // 1-based

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

        await yieldToBrowser();
        await yieldToBrowser();

        const startColumn = toColumnName(startColumnNumber);
        const endColumn = toColumnName(startColumnNumber + sources.length - 1);

        return `${this.quoteSheetName(ownerSheetName)}!${startColumn}1:${endColumn}${rowCount}`;
    }

    /** Same chart id always gets the same helper block (0-19). */
    private getHelperSlot(chartId: string): number {
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
        const startColumnIndex = this.columnNameToIndex(startColumn);
        const endColumnIndex = this.columnNameToIndex(endColumn);

        if (startColumnIndex < 0 || endColumnIndex < startColumnIndex || startRow < 1 || endRow < startRow) {
            return null;
        }

        return { sheetName, startColumn, endColumn, startColumnIndex, endColumnIndex, startRow, endRow };
    }

    /** "A" -> 0, "B" -> 1, "AA" -> 26. Returns -1 if invalid. */
    private columnNameToIndex(columnName: string): number {
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

        const activeSheet = this.grid.getActiveSheet?.();

        for (const row of activeSheet?.rows ?? []) {
            for (const cell of row?.cells ?? []) {
                for (const chart of cell?.chart ?? []) {
                    if (!wanted.length || wanted.includes(text(chart?.id))) {
                        return chart;
                    }
                }
            }
        }

        return null;
    }

    // =====================================================
    // RIBBON
    // =====================================================

    /** Adds "Siiwii List" and "Pivot Table" buttons to the Insert ribbon tab. */
    private addRibbonButtons(): void {
        if (!this.spreadsheet) {
            return;
        }

        if (typeof this.grid.addToolbarItems !== 'function') {
            console.warn('[Spreadsheet] addToolbarItems() is not available in this Syncfusion build.');
            return;
        }

        try {
            this.grid.addToolbarItems(
                'Insert',
                [
                    {
                        id: 'siiwii_spreadsheet_data_source',
                        type: 'Button',
                        text: 'Siiwii List',
                        tooltipText: 'Insert Siiwii data source',
                        prefixIcon: 'e-icons e-database',
                        click: () => this.openDataPanel()
                    },
                    {
                        id: 'siiwii_spreadsheet_pivot',
                        type: 'Button',
                        text: 'Pivot Table',
                        tooltipText: 'Create or view Pivot Table for the active sheet',
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
            args?.item?.id ??
            args?.item?.properties?.id ??
            args?.originalEvent?.target?.id ??
            args?.target?.id
        ).toLowerCase();

        const label = text(
            args?.item?.text ??
            args?.item?.properties?.text ??
            args?.originalEvent?.target?.textContent ??
            args?.target?.textContent
        ).toLowerCase();

        if (id.includes('siiwii_spreadsheet_data_source') || label.includes('siiwii list')) {
            this.openDataPanel();
        } else if (id.includes('siiwii_spreadsheet_pivot') || label.includes('pivot table')) {
            this.openPivotFromRibbon();
        }
    }

    private openPivotFromRibbon(): void {
        if (this.hasSavedPivotForActiveSheet) {
            void this.viewSavedPivot();
        } else {
            void this.openPivot();
        }
    }

    // =====================================================
    // ADD DATA PANEL: ENTITY -> COLUMNS -> FILTERS -> NEW SHEET
    // =====================================================

    openDataPanel(): void {
        this.closeChartPanel();
        this.resetSelection();
        this.showDataPanel = true;
        this.cdr.detectChanges();
        this.resizeLater();
    }

    closeDataPanel(): void {
        this.showDataPanel = false;
        this.cdr.detectChanges();
        this.resizeLater();
    }

    onEntityDropdownChange(sourceKey: string | null): void {
        if (sourceKey) {
            this.selectEntity(sourceKey);
        } else {
            this.resetSelection();
        }
    }

    selectEntity(sourceKey: string): void {
        const entity = this.entities.find(x => x.sourceKey === sourceKey);

        if (!entity) {
            console.warn('[Spreadsheet] Unknown Siiwii entity:', sourceKey);
            return;
        }

        this.selectedEntityKey = sourceKey;
        this.selectedEntity = entity;
        this.selectedColumns = entity.columns.filter(x => x.defaultSelected).map(x => x.key);
        this.filters = {};
        this.addDataStep = 2;
        this.cdr.detectChanges();
    }

    backToEntityList(): void {
        this.resetSelection();
        this.cdr.detectChanges();
    }

    private resetSelection(): void {
        this.addDataStep = 1;
        this.selectedEntityKey = null;
        this.selectedEntity = null;
        this.selectedColumns = [];
        this.filters = {};
    }

    isColumnSelected(key: string): boolean {
        return this.selectedColumns.includes(key);
    }

    onColumnToggle(key: string, event: any): void {
        this.toggleColumn(key, !!event?.target?.checked);
    }

    toggleColumn(key: string, checked: boolean): void {
        if (checked) {
            if (!this.selectedColumns.includes(key)) {
                this.selectedColumns = [...this.selectedColumns, key];
            }
            return;
        }

        this.selectedColumns = this.selectedColumns.filter(x => x !== key);
    }

    selectAllColumns(): void {
        this.selectedColumns = this.selectedEntity?.columns.map(x => x.key) ?? [];
    }

    clearColumns(): void {
        this.selectedColumns = [];
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

    /** Converts API records into rows that only contain the selected columns. */
    private buildRows(records: any[]): any[] {
        const selected = new Set(this.selectedColumns);
        const columns = (this.selectedEntity?.columns ?? []).filter(c => selected.has(c.key));

        return records.map(record => {
            const transaction: any = this.mapTransactionToRow(record);
            const row: any = {};

            columns.forEach(column => {
                row[column.label] = transaction[column.key];
            });

            return row;
        });
    }

 async addDataAsNewSheet(): Promise<void> {
    const entity = this.selectedEntity;

    if (!this.spreadsheet || !entity) {
        return;
    }

    if (!this.selectedColumns.length) {
        this.notify.warn('Please select at least one column.');
        return;
    }

    const filters: SpreadsheetFilters = {
        ...(this.filters as SpreadsheetFilters),
        statusFilter: this.cleanStatus(this.filters.statusFilter)
    };

    const sheetName = this.getUniqueSheetName(entity.displayName);

    const columns = entity.columns.filter(column =>
        this.selectedColumns.includes(column.key)
    );

 this.isAddingData = true;

this.isLoading = true;
this.loadingProgress = 0;
this.loadingMessage = 'Loading records...';

this.cdr.detectChanges();

    let skip = 0;
    let loaded = 0;
    let total = 0;
    let sheetCreated = false;

    try {

        while (true) {

            // =====================================================
            // 1. LOAD NEXT 10
            // =====================================================

            const result: any = await firstValueFrom(
                this.getTransactions(
                    filters,
                    skip,
                    this.batchSize
                )
            );

            const items: any[] = result?.items ?? [];

            total = Number(
                result?.totalCount ?? total ?? 0
            );

            if (!items.length) {
                break;
            }

            const rows = this.buildRows(items);

            // =====================================================
            // 2. FIRST 10
            // =====================================================

            if (!sheetCreated) {

                this.grid.insertSheet(
                    [{
                        name: sheetName,
                        ranges: [{
                            dataSource: rows,
                            startCell: 'A1',
                            showFieldAsHeader: true
                        }]
                    }],
                    this.allSheets.length
                );

                const createdSheet =
                    await this.waitForSheet(sheetName);

                if (!createdSheet) {
                    throw new Error(
                        `Unable to create sheet "${sheetName}".`
                    );
                }

                await this.activateSheet(sheetName);

                sheetCreated = true;

                loaded += items.length;

                this.loadingProgress =
                    total > 0
                        ? Math.round((loaded / total) * 100)
                        : 0;

                this.loadingMessage =
                    `Loaded ${loaded.toLocaleString()} of ` +
                    `${total.toLocaleString()} records`;

                this.cdr.detectChanges();

                // IMPORTANT:
                // allow Syncfusion + browser to finish displaying
                // the first 10 before requesting the next page.
                await this.paintSpreadsheet();

            } else {

                // =================================================
                // 3. NEXT 10
                // =================================================

                // Make sure Transactions/data sheet is STILL active.
                const activeSheet =
                    this.grid.getActiveSheet?.();

                if (activeSheet?.name !== sheetName) {
                    await this.activateSheet(sheetName);
                }

                /*
                 * loaded = 10
                 *
                 * Header = row 1
                 * first batch = rows 2-11
                 * second batch starts row 12
                 */
                const startRow = loaded + 2;

                for (
                    let rowIndex = 0;
                    rowIndex < rows.length;
                    rowIndex++
                ) {

                    const row = rows[rowIndex];

                    const spreadsheetRow =
                        startRow + rowIndex;

                    for (
                        let colIndex = 0;
                        colIndex < columns.length;
                        colIndex++
                    ) {

                        const column =
                            columns[colIndex];

                        const columnName =
                            toColumnName(colIndex + 1);

                        /*
                         * IMPORTANT
                         *
                         * Do NOT use:
                         *
                         * 'Transactions'!A12
                         *
                         * The correct sheet is already active.
                         */
                        const address =
                            `${columnName}${spreadsheetRow}`;

                        this.grid.updateCell(
                            {
                                value: row[column.label]
                            },
                            address
                        );
                    }
                }

                loaded += items.length;

                this.loadingProgress =
                    total > 0
                        ? Math.round((loaded / total) * 100)
                        : 0;

                this.loadingMessage =
                    `Loaded ${loaded.toLocaleString()} of ` +
                    `${total.toLocaleString()} records`;

                this.cdr.detectChanges();

                // Let this batch actually become visible.
                await this.paintSpreadsheet();
            }

            // =====================================================
            // 4. ONLY AFTER PAINT → LOAD NEXT 10
            // =====================================================

            skip += this.batchSize;

            if (
                items.length < this.batchSize ||
                (total > 0 && loaded >= total)
            ) {
                break;
            }
        }

        // =========================================================
        // NO DATA
        // =========================================================

        if (!sheetCreated) {
            this.notify.info(
                'No records found for the selected filters.'
            );

            return;
        }

        // =========================================================
        // SAVE SOURCE METADATA
        // =========================================================

        const sheetIndex =
            this.allSheets.findIndex(
                (sheet: any) =>
                    sheet?.name === sheetName
            );

        if (sheetIndex < 0) {
            throw new Error(
                `Sheet "${sheetName}" was not found.`
            );
        }

        this.upsertSheetSource({
            sheetId:
                this.allSheets[sheetIndex]?.id,

            sheetName,

            source: {
                type: entity.displayName,
                sourceKey: entity.sourceKey,
                mode: 'AllRecords',
                columns: [...this.selectedColumns],
                filters: { ...filters }
            }
        });

        this.currentSpreadsheetSource = {
            type: entity.displayName,
            sourceKey: entity.sourceKey,
            mode: 'AllRecords',
            columns: [...this.selectedColumns],
            filters: { ...filters }
        };

        this.currentSpreadsheetFilters = {
            ...filters
        };

        this.showDataPanel = false;

        this.syncActiveSheetToUi();

        this.loadingProgress = 100;

        this.loadingMessage =
            `${loaded.toLocaleString()} records loaded.`;

        this.cdr.detectChanges();

        this.notify.success(
            `${loaded.toLocaleString()} records added to ${sheetName}.`
        );

    } catch (error) {

        console.error(
            '[Spreadsheet Add Data] failed:',
            error
        );

        this.notify.error(
            'Unable to add the data source to the Spreadsheet.'
        );

    } finally {

        this.isAddingData = false;

        this.hideLoading();

        this.cdr.detectChanges();
    }
}


private async paintSpreadsheet(): Promise<void> {

    // Let Angular apply the current state.
    this.cdr.detectChanges();

    // Let Syncfusion finish its current DOM work.
    await new Promise<void>(resolve => {
        setTimeout(() => resolve(), 0);
    });

    // Frame 1: DOM changes are committed.
    await new Promise<void>(resolve => {
        requestAnimationFrame(() => resolve());
    });

    // Frame 2: browser paints the Spreadsheet.
    await new Promise<void>(resolve => {
        requestAnimationFrame(() => resolve());
    });
}

    // =====================================================
    // PIVOT: OPEN / CLOSE / BUILD DATA
    // =====================================================

    async openPivot(savedAnalysis?: SavedSheetAnalysis): Promise<void> {
        if (!this.spreadsheet || this.isCreatingPivot) {
            return;
        }

        this.isCreatingPivot = true;

        try {
            const activeSheet: any = this.spreadsheet.getActiveSheet();

            if (!activeSheet?.name) {
                this.notify.warn('No active spreadsheet found.');
                return;
            }

            // 1. Which sheet is the source and which is the pivot sheet?
            const target = this.resolvePivotTarget(text(activeSheet.name), savedAnalysis);

            if (!target) {
                return;
            }

            const { sourceSheetName, pivotSheetName } = target;

            // 2. Read source data BEFORE creating the pivot tab.
            const records = await this.readPivotRecords(sourceSheetName);

            if (!records) {
                return;
            }

            this.pivotData = records;
            const fieldMapping = this.buildFieldMapping(records);

            // 3. Create the pivot tab (new pivot) or verify it exists (saved pivot).
            let analysis: any = savedAnalysis;

            if (!analysis) {
                analysis = await this.createPivotAnalysis(sourceSheetName, pivotSheetName);
            } else if (!this.findSheet(pivotSheetName)) {
                console.error('[Pivot] Saved Pivot sheet was not found:', pivotSheetName);
                this.notify.warn(`Pivot sheet "${pivotSheetName}" was not found.`);
                return;
            }

            // 4. Settings, current pivot, active tab.
            this.pivotDataSourceSettings = this.buildPivotSettings(analysis?.pivot, records, fieldMapping);
            this.currentPivotSheetName = pivotSheetName;
            this.pivotSourceSheetName = sourceSheetName;

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
            await yieldToBrowser();
            await yieldToBrowser();

            // 6. Force Syncfusion to bind.
            this.bindPivotView(records);

            console.log('[Pivot] READY', {
                sourceSheetName,
                pivotSheetName,
                records: records.length,
                fields: Object.keys(records[0] ?? {}),
                pivotView: !!this.pivotView
            });
        } catch (error) {
            console.error('[Pivot] Failed:', error);
            this.notify.error('Failed to create Pivot Table.');
        } finally {
            this.isCreatingPivot = false;
        }
    }

    async closePivot(): Promise<void> {
        const sourceSheetName = this.pivotSourceSheetName;

        // Keep latest Pivot configuration in memory before destroying the view.
        this.updatePivotAnalysis();

        this.showPivot = false;
        this.cdr.detectChanges();

        if (sourceSheetName && this.findSheet(sourceSheetName)) {
            await this.activateSheet(sourceSheetName);
        }

        this.currentPivotSheetName = null;
        this.pivotSourceSheetName = null;
        this.resizeLater();
    }

    /** Returns { sourceSheetName, pivotSheetName } or null (after warning the user). */
    private resolvePivotTarget(
        activeSheetName: string,
        saved?: SavedSheetAnalysis
    ): { sourceSheetName: string; pivotSheetName: string } | null {
        if (saved) {
            const analysis: any = saved;
            let sourceSheetName = text(analysis.sourceSheetName);

            if (!sourceSheetName && analysis.sourceSheetId != null) {
                sourceSheetName = text(
                    this.allSheets.find((sheet: any) => sheet?.id === analysis.sourceSheetId)?.name
                );
            }

            if (!sourceSheetName) {
                console.error('[Pivot] Source sheet missing.', analysis);
                this.notify.warn('Pivot source sheet was not found.');
                return null;
            }

            return { sourceSheetName, pivotSheetName: text(analysis.sheetName) };
        }

        if (activeSheetName === DASHBOARD_SHEET || activeSheetName.startsWith('Pivot - ')) {
            this.notify.warn('Create the Pivot Table from a data sheet.');
            return null;
        }

        return {
            sourceSheetName: activeSheetName,
            pivotSheetName: this.getUniqueSheetName(`Pivot - ${activeSheetName}`)
        };
    }

    /** Reads the whole source sheet and converts it into pivot records. */
    private async readPivotRecords(sourceSheetName: string): Promise<IDataSet[] | null> {
        const sourceSheet = this.findSheet(sourceSheetName);

        if (!sourceSheet) {
            this.notify.warn(`Source sheet "${sourceSheetName}" was not found.`);
            return null;
        }

        const lastRowIndex = sourceSheet.usedRange?.rowIndex ?? 0;
        const lastColIndex = sourceSheet.usedRange?.colIndex ?? 0;

        console.log('[Pivot] source sheet:', sourceSheetName);
        console.log('[Pivot] used range:', sourceSheet.usedRange);

        if (lastRowIndex < 1 || lastColIndex < 0) {
            this.notify.warn('The source sheet does not contain records.');
            return null;
        }

        const range =
            `${this.quoteSheetName(sourceSheetName)}!A1:` +
            `${toColumnName(lastColIndex + 1)}${lastRowIndex + 1}`;

        console.log('[Pivot] reading:', range);

        const data = await this.spreadsheet!.getData(range);
        const records = this.sheetDataToRecords(data, lastRowIndex, lastColIndex) as IDataSet[];

        console.log('[Pivot] records:', records);

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
            pivot: {
                rows: [],
                columns: [],
                values: [],
                filters: [],
                filterSettings: [],
                sortSettings: []
            },
            chart: {
                type: 'Column',
                title: `${sourceSheetName} Pivot Chart`,
                enableMultipleAxis: false
            }
        };

        this.sheetAnalyses.push(analysis as SavedSheetAnalysis);

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

        const settings = { ...this.pivotDataSourceSettings, dataSource: [...records] };

        this.pivotView.dataSourceSettings = settings;

        // Excel-like controls: the field list is a separate fixed component.
        this.pivotView.showFieldList = false;
        this.pivotView.showGroupingBar = true;
        this.pivotView.showToolbar = true;
        this.pivotView.toolbar = this.pivotToolbar as any;
        this.pivotView.displayOption = { view: 'Both', primary: 'Table' } as DisplayOption;
        this.pivotView.chartSettings = this.pivotChartSettings;
        this.pivotView.dataBind?.();

        if (this.pivotFieldList) {
            this.pivotFieldList.dataSourceSettings = { ...settings } as any;
            this.pivotFieldList.dataBind?.();
            this.pivotFieldList.update?.(this.pivotView);
        }

        this.pivotView.refresh?.();

        console.log('[Pivot] bound records:', records.length);
        console.log('[Pivot] available fields:', Object.keys(records[0] ?? {}));
    }

    /** Opens/closes the pivot view when the user switches sheet tabs. */
    private async syncPivotForActiveSheet(): Promise<void> {
        if (this.isCreatingPivot) {
            return;
        }

        const activeSheetName = text(this.spreadsheet?.getActiveSheet()?.name);

        if (!activeSheetName) {
            return;
        }

        const analysis = this.sheetAnalyses.find(item => text(item?.sheetName) === activeSheetName);

        if (!analysis) {
            if (this.showPivot) {
                // User switched away from a Pivot tab: keep the latest Pivot state in memory.
                this.updatePivotAnalysis();
                this.showPivot = false;
                this.currentPivotSheetName = null;
                this.pivotSourceSheetName = null;
                this.cdr.detectChanges();
            }
            return;
        }

        if (this.showPivot && this.currentPivotSheetName === activeSheetName) {
            return;
        }

        await this.openPivot(analysis);
    }

    /** First row = headers, remaining non-empty rows = records. */
    private sheetDataToRecords(data: any, lastRowIndex: number, lastColIndex: number): any[] {
        const readCell = (address: string) => (data.get ? data.get(address) : data[address]);
        const rows: any[][] = [];

        for (let r = 0; r <= lastRowIndex; r++) {
            const row: any[] = [];

            for (let c = 0; c <= lastColIndex; c++) {
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
                headers.forEach((header, i) => {
                    record[header] = this.normalizeValue(row[i], header);
                });
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

    onPivotViewReady(): void {
        if (this.pivotFieldList && this.pivotView) {
            this.pivotFieldList.update(this.pivotView);
        }

        this.forceTransactionCount();
    }

    /** Makes sure TransactionNumber is always counted (not summed). */
    private forceTransactionCount(): void {
        const settings = this.pivotView?.dataSourceSettings;

        if (!settings?.values?.length) {
            return;
        }

        let changed = false;

        settings.values.forEach((field: any) => {
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

        this.pivotView.dataSourceSettings = this.pivotDataSourceSettings;
        this.pivotView.dataBind?.();

        if (this.pivotFieldList) {
            this.pivotFieldList.dataSourceSettings = this.pivotDataSourceSettings as any;
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
    // SAVED PIVOT (per sheet)
    // =====================================================

    get hasSavedPivotForActiveSheet(): boolean {
        try {
            return !!this.findActiveAnalysis();
        } catch {
            return false;
        }
    }

    private findActiveAnalysis(): SavedSheetAnalysis | null {
        const name = this.spreadsheet?.getActiveSheet()?.name;
        return name ? this.sheetAnalyses.find(item => item.sheetName === name) ?? null : null;
    }

    async viewSavedPivot(): Promise<void> {
        const analysis = this.findActiveAnalysis();

        if (!analysis) {
            this.notify.info('This sheet does not have a saved Pivot Table.');
            return;
        }

        await this.openPivot(analysis);
    }

    /** Copies the live PivotView state into sheetAnalyses. It does NOT save the spreadsheet. */
    private updatePivotAnalysis(): void {
        if (!this.pivotView) {
            return;
        }

        const analysis = this.getCurrentPivotAnalysis();

        if (!analysis) {
            return;
        }

        const pivotSheetName = text(analysis.sheetName);
        const sourceSheetName = text(this.pivotSourceSheetName || analysis.sourceSheetName);

        if (!pivotSheetName || !sourceSheetName) {
            return;
        }

        const settings = this.pivotView.dataSourceSettings;
        const source = this.getSheetIdentity(sourceSheetName);

        analysis.sheetName = pivotSheetName;
        analysis.sourceSheetName = source.sheetName;
        analysis.sourceSheetId = source.sheetId;
        analysis.pivot = {
            rows: this.serializeFields(settings?.rows),
            columns: this.serializeFields(settings?.columns),
            values: this.serializeFields(settings?.values),
            filters: this.serializeFields(settings?.filters),
            filterSettings: this.serializeFilters(settings?.filterSettings),
            sortSettings: this.serializeSortSettings(settings?.sortSettings)
        };

        analysis.chart = {
            ...analysis.chart,
            type: this.pivotView?.chartSettings?.chartSeries?.type
                ?? this.pivotChartSettings?.chartSeries?.type
                ?? analysis.chart?.type
                ?? 'Column',
            title: analysis.chart?.title ?? `${source.sheetName} Pivot Chart`,
            enableMultipleAxis: this.pivotView?.chartSettings?.enableMultipleAxis
                ?? analysis.chart?.enableMultipleAxis
                ?? false
        };
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

    private serializeSortSettings(settings: any[]): any[] {
        return (settings ?? []).map(s => ({ name: s.name, order: s.order }));
    }

    // =====================================================
    // PIVOT -> DASHBOARD
    // =====================================================

    async copyPivotToDashboard(): Promise<void> {
        if (!this.pivotView || !this.spreadsheet) {
            this.notify.warn('Pivot analysis or Spreadsheet is not ready.');
            return;
        }

        const pivotSheetName = text(this.currentPivotSheetName);

        if (!pivotSheetName) {
            this.notify.warn('Pivot sheet is not available.');
            return;
        }

        const analysis = this.sheetAnalyses.find(
            item => text(item.sheetName) === pivotSheetName
        );

        if (!analysis) {
            this.notify.warn('Pivot analysis is not available.');
            return;
        }

        const sourceSheetName = text(this.pivotSourceSheetName || analysis.sourceSheetName);

        if (!sourceSheetName) {
            this.notify.warn('Pivot source sheet is not available.');
            return;
        }

        try {
            // Keep the latest Pivot configuration in memory.
            this.updatePivotAnalysis();

            const matrix = this.getPivotResultMatrix();

            if (!matrix.length || !matrix[0]?.length) {
                this.notify.warn('Pivot result does not contain chartable data.');
                return;
            }

            const maxColumns = matrix.reduce(
                (max, row) => Math.max(max, row?.length ?? 0),
                0
            );

            if (matrix.length < 2 || maxColumns < 2) {
                this.notify.warn('Pivot result needs at least two columns/rows for a chart.');
                return;
            }

            // Reuse the ONE Dashboard sheet and the same reserved helper range.
            const dashboardRange = await this.writePivotResultToDashboard(
                pivotSheetName,
                matrix
            );

            const pivotSeriesType =
                this.pivotView?.chartSettings?.chartSeries?.type ??
                this.pivotChartSettings?.chartSeries?.type ??
                analysis.chart?.type ??
                'Column';

            // First copy => insert. Next copies of the SAME Pivot => update/replace
            // only that Pivot chart. Direct Dashboard charts are never touched.
            const result = await this.upsertPivotChartOnDashboard(
                analysis,
                {
                    range: dashboardRange,
                    type: this.mapPivotChartType(pivotSeriesType),
                    theme: 'Material',
                    title: `${pivotSheetName} Chart`,
                    height: 320,
                    width: 520,
                    top: 30,
                    left: 30,
                    isSeriesInRows: false
                }
            );

            this.registerPivotWidget(
                pivotSheetName,
                dashboardRange,
                result.chart
            );

            await this.activateSheet(DASHBOARD_SHEET);
            this.refreshLayout();

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
     * Writes the pivot result into a reserved block of the Dashboard sheet
     * and returns a LOCAL range (e.g. AZ1:BH20). Each saved pivot gets its own block.
     */
    private async writePivotResultToDashboard(sourceSheetName: string, matrix: any[][]): Promise<string> {
        if (!this.spreadsheet) {
            throw new Error('Spreadsheet is not ready.');
        }

        const dashboard = await this.ensureDashboardSheet();

        if (!dashboard) {
            throw new Error('Dashboard sheet could not be created.');
        }

        await this.activateSheet(DASHBOARD_SHEET);

        const analysisIndex = Math.max(
            0,
            this.sheetAnalyses.findIndex(item => text(item?.sheetName) === text(sourceSheetName))
        );

        const startColumnNumber = 52 + analysisIndex * 20; // AZ, BT, ...
        const maxColumns = matrix.reduce((max, row) => Math.max(max, row?.length ?? 0), 0);
        const startColumn = toColumnName(startColumnNumber);
        const endColumn = toColumnName(startColumnNumber + Math.max(maxColumns, 1) - 1);

        // Clear only this pivot's reserved block before rewriting it.
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

        await yieldToBrowser();
        await yieldToBrowser();

        const ready = await this.waitForSheet(DASHBOARD_SHEET);

        if (!ready?.rows?.length) {
            throw new Error('Dashboard Pivot source cells were not created.');
        }

        return `${startColumn}1:${endColumn}${matrix.length}`;
    }

    private async upsertPivotChartOnDashboard(
        analysis: SavedSheetAnalysis,
        chart: any
    ): Promise<{ chart: any; updated: boolean }> {
        await this.ensureDashboardSheet();
        await this.activateSheet(DASHBOARD_SHEET);

        const existing = this.findExistingPivotDashboardChart(analysis, chart.range);

        if (!existing) {
            return {
                chart: await this.insertChartOnDashboard(chart),
                updated: false
            };
        }

        // Preserve the user's Dashboard layout when refreshing the Pivot chart.
        const nextChart = {
            ...chart,
            top: existing.top ?? chart.top,
            left: existing.left ?? chart.left,
            width: existing.width ?? chart.width,
            height: existing.height ?? chart.height
        };

        const chartId = text(existing.id);

        if (!chartId || typeof this.grid.deleteChart !== 'function') {
            // Do not create a duplicate if we cannot safely identify the old chart.
            // The helper data has already been refreshed, so the existing chart
            // continues to point at the same Dashboard range.
            return { chart: existing, updated: true };
        }

        // Delete ONLY this Pivot's chart. Never clear/delete other Dashboard charts.
        this.grid.deleteChart(chartId);
        await yieldToBrowser();
        await yieldToBrowser();

        return {
            chart: await this.insertChartOnDashboard(nextChart),
            updated: true
        };
    }

    private findExistingPivotDashboardChart(
        analysis: SavedSheetAnalysis,
        dashboardRange: string
    ): any | null {
        const dashboard = this.findSheet(DASHBOARD_SHEET);

        if (!dashboard) {
            return null;
        }

        const charts = this.getChartsFromSavedSheet(dashboard);
        const expectedId = text(analysis.dashboardChartId);
        const expectedRange = this.removeSheetFromRange(
            text(analysis.dashboardDataRange || dashboardRange)
        );
        const pivotTitle = `${text(analysis.sheetName)} Chart`;

        // 1. Stable saved chart id.
        if (expectedId) {
            const byId = charts.find(chart => text(chart?.id) === expectedId);
            if (byId) {
                return byId;
            }
        }

        // 2. Stable reserved Dashboard helper range.
        if (expectedRange) {
            const byRange = charts.find(
                chart => this.removeSheetFromRange(text(chart?.range)) === expectedRange
            );
            if (byRange) {
                return byRange;
            }
        }

        // 3. Title fallback for old saved workbooks.
        return charts.find(chart => text(chart?.title) === pivotTitle) ?? null;
    }

    private async insertChartOnDashboard(chart: any): Promise<any> {
        if (!this.spreadsheet) {
            throw new Error('Spreadsheet is not ready.');
        }

        if (!(await this.ensureDashboardSheet())) {
            throw new Error('Dashboard sheet could not be created.');
        }

        // Critical for EJ2 20.4.x chart drag/resize: a null top-level sheet
        // crashes Overlay.overlayMouseUpHandler later.
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
            const sourceSheet = await this.waitForSheet(name);

            if (!sourceSheet) {
                throw new Error(`Chart source sheet "${name}" is not available.`);
            }

            if (!Array.isArray(sourceSheet.rows) || !sourceSheet.rows.length) {
                throw new Error(`Chart source sheet "${name}" does not contain rows yet.`);
            }
        }

        await this.activateSheet(DASHBOARD_SHEET);

        // Extra paint turns: chart creation is overlay-based.
        await yieldToBrowser();
        await yieldToBrowser();

        if (this.grid.getActiveSheet?.()?.name !== DASHBOARD_SHEET) {
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

        await yieldToBrowser();
        await yieldToBrowser();

        const insertedChart = this.findDashboardChart(range, model.title) ?? model;

        this.refreshLayout();

        return insertedChart;
    }

    private findDashboardChart(range: string, title?: string): any | null {
        const dashboard = this.allSheets.find((s: any) => text(s?.name) === DASHBOARD_SHEET);

        if (!dashboard) {
            return null;
        }

        let rangeMatch: any | null = null;

        for (const row of dashboard.rows ?? []) {
            for (const cell of row?.cells ?? []) {
                for (const chart of cell?.chart ?? []) {
                    if (text(chart?.range) !== text(range)) {
                        continue;
                    }

                    if (title && text(chart?.title) === text(title)) {
                        return chart;
                    }

                    rangeMatch = chart;
                }
            }
        }

        return rangeMatch;
    }

    private mapPivotChartType(type: string): string {
        const map: Record<string, string> = {
            Column: 'Column',
            Bar: 'Bar',
            Line: 'Line',
            Area: 'Area',
            Pie: 'Pie',
            Doughnut: 'Doughnut',
            Scatter: 'Scatter',
            Spline: 'Line',
            SplineArea: 'Area',
            StackingColumn: 'StackingColumn',
            StackingBar: 'StackingBar',
            StackingArea: 'StackingArea'
        };

        return map[type] ?? 'Column';
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

        const activeName = this.grid.getActiveSheet?.()?.name;

        console.warn('[Spreadsheet] repairing invalid live sheet entries', {
            before: current.length,
            after: valid.length
        });

        this.grid.sheets = valid;

        let nextIndex = activeName
            ? valid.findIndex(s => text(s?.name) === text(activeName))
            : Number(this.grid.activeSheetIndex ?? 0);

        if (nextIndex < 0 || nextIndex >= valid.length) {
            nextIndex = 0;
        }

        this.grid.activeSheetIndex = nextIndex;
    }

    private async ensureDashboardSheet(): Promise<any> {
        if (!this.spreadsheet) {
            return null;
        }

        this.repairSheets();

        // Reuse an existing Dashboard. Compare case-insensitively so we never
        // create Dashboard (2) because of a naming/casing mismatch.
        const existing = this.allSheets.find(
            (sheet: any) => text(sheet?.name).trim().toLowerCase() === DASHBOARD_SHEET.toLowerCase()
        );

        if (existing) {
            return existing;
        }

        // Multiple async chart operations can ask for Dashboard at the same time.
        // Share one creation promise so only ONE Dashboard is inserted.
        if (this.dashboardSheetPromise) {
            return this.dashboardSheetPromise;
        }

        this.dashboardSheetPromise = (async () => {
            // Check again inside the lock.
            const secondCheck = this.allSheets.find(
                (sheet: any) => text(sheet?.name).trim().toLowerCase() === DASHBOARD_SHEET.toLowerCase()
            );

            if (secondCheck) {
                return secondCheck;
            }

            const model = [{ name: DASHBOARD_SHEET, rows: [], columns: [] }];

            try {
                this.grid.insertSheet(model, 0);
            } catch {
                // Older Syncfusion patches may ignore the index overload.
                this.grid.insertSheet(model);
            }

            await yieldToBrowser();
            await yieldToBrowser();
            this.repairSheets();

            return await this.waitForSheet(DASHBOARD_SHEET);
        })();

        try {
            return await this.dashboardSheetPromise;
        } finally {
            this.dashboardSheetPromise = null;
        }

        
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

        await yieldToBrowser();
        await yieldToBrowser();

        return index;
    }

    // =====================================================
    // DASHBOARD WIDGET METADATA
    // =====================================================

    get dashboardChartCount(): number {
        if (!this.spreadsheet) {
            return 0;
        }

        return this.getWidgetsForSheet(this.grid.getActiveSheet?.()).length;
    }

    private getWidgetsForSheet(sheet: any): DashboardWidgetMetadata[] {
        if (!sheet) {
            return [];
        }

        return this.dashboardWidgets.filter(
            w =>
                (w.sourceSheetId != null && sheet.id != null && Number(w.sourceSheetId) === Number(sheet.id)) ||
                String(w.sourceSheetName ?? '') === String(sheet.name ?? '')
        );
    }

    private getSheetIdentity(sheetName: string): { sheetId?: number; sheetName: string } {
        const sheet = this.allSheets.find((s: any) => text(s?.name) === text(sheetName));

        const metadata =
            this.sheetDataSources.find(
                item => item.sheetId != null && sheet?.id != null && Number(item.sheetId) === Number(sheet.id)
            ) ?? this.sheetDataSources.find(item => text(item?.sheetName) === text(sheetName));

        return {
            sheetId: metadata?.sheetId ?? sheet?.id,
            sheetName: text(sheet?.name ?? sheetName)
        };
    }

    private registerPivotWidget(
        pivotSheetName: string,
        dashboardRange: string,
        insertedChart: any
    ): void {
        const analysis = this.sheetAnalyses.find(
            item => text(item?.sheetName) === text(pivotSheetName)
        );

        if (!analysis) {
            console.warn('[Dashboard] Pivot analysis not found:', pivotSheetName);
            return;
        }

        if (analysis.id == null) {
            analysis.id = Date.now();
        }

        // The widget source is the REAL data sheet, not the Pivot tab.
        const sourceSheetName = text(analysis.sourceSheetName);

        if (!sourceSheetName) {
            console.warn('[Dashboard] Pivot source sheet missing:', analysis);
            return;
        }

        const source = this.getSheetIdentity(sourceSheetName);
        const chartId = text(insertedChart?.id) || undefined;

        const existing = this.dashboardWidgets.find(
            w =>
                w.sourceType === 'PIVOT' &&
                (
                    (analysis.id != null && w.analysisId === analysis.id) ||
                    (analysis.dashboardWidgetId != null && w.id === analysis.dashboardWidgetId)
                )
        );

        const widgetId = existing?.id ?? analysis.dashboardWidgetId ?? Date.now();

        const widget: DashboardWidgetMetadata = {
            id: widgetId,
            dashboardSheetName: DASHBOARD_SHEET,
            chartId,
            chartTitle: text(
                insertedChart?.title ??
                analysis.chart?.title ??
                `${pivotSheetName} Chart`
            ),
            chartType: String(
                insertedChart?.type ??
                this.mapPivotChartType(analysis.chart?.type)
            ),
            sourceType: 'PIVOT',
            sourceSheetId: source.sheetId,
            sourceSheetName: source.sheetName,
            analysisId: analysis.id,
            dashboardDataRange: this.removeSheetFromRange(dashboardRange)
        };

        const index = this.dashboardWidgets.findIndex(
            item => item.id === widgetId
        );

        if (index >= 0) {
            this.dashboardWidgets[index] = widget;
        } else {
            this.dashboardWidgets.push(widget);
        }

        analysis.dashboardWidgetId = widgetId;
        analysis.dashboardChartId = chartId;
        analysis.dashboardDataRange = this.removeSheetFromRange(dashboardRange);
        analysis.sourceSheetId = source.sheetId;
        analysis.sourceSheetName = source.sheetName;
    }

    private getWorkbook(workbookJson: any): any {
        return workbookJson?.jsonObject?.Workbook ?? workbookJson?.Workbook ?? workbookJson;
    }

    private getChartsFromSavedSheet(sheet: any): any[] {
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

    private rebuildWidgetMetadata(workbookJson: any): void {
        const workbook = this.getWorkbook(workbookJson);
        const sheets: any[] = Array.isArray(workbook?.sheets) ? workbook.sheets : [];
        const dashboard = sheets.find(s => text(s?.name) === DASHBOARD_SHEET);

        if (!dashboard) {
            this.dashboardWidgets = [];
            return;
        }

        const charts = this.getChartsFromSavedSheet(dashboard);
        const matchedPivotCharts = new Set<any>();

        const pivotWidgets = this.rebuildPivotWidgets(charts, matchedPivotCharts);
        const directWidgets = this.rebuildDirectWidgets(charts, matchedPivotCharts, pivotWidgets.length);

        this.dashboardWidgets = [...pivotWidgets, ...directWidgets];
    }

    /**
     * PIVOT widgets are rebuilt from sheetAnalyses (source sheet -> pivot
     * definition -> Dashboard chart), because a pivot chart points to a LOCAL
     * Dashboard range, so its source can't be derived from chart.range alone.
     */
 private rebuildPivotWidgets(
    charts: any[],
    matched: Set<any>
): DashboardWidgetMetadata[] {

    const widgets: DashboardWidgetMetadata[] = [];

    for (const analysis of this.sheetAnalyses ?? []) {

        const pivotSheetName =
            text(analysis.sheetName);

        const sourceSheetName =
            text(analysis.sourceSheetName);

        if (
            !analysis.chart ||
            !pivotSheetName ||
            !sourceSheetName
        ) {
            continue;
        }

        if (analysis.id == null) {
            analysis.id =
                Date.now() + widgets.length;
        }

        const source =
            this.getSheetIdentity(
                sourceSheetName
            );

        const expectedChartId =
            text(analysis.dashboardChartId);

        const expectedRange =
            text(analysis.dashboardDataRange);

        const expectedDashboardRange =
            expectedRange
                ? `${DASHBOARD_SHEET}!${expectedRange}`
                : '';

        const candidates =
            charts.filter(
                chart => !matched.has(chart)
            );

        // 1. Try chart ID
        let nativeChart =
            expectedChartId
                ? candidates.find(
                    chart =>
                        text(chart?.id) ===
                        expectedChartId
                )
                : null;

        // 2. Try Dashboard range.
        // Syncfusion returns "Dashboard!AZ1:BA15"
        // while we store "AZ1:BA15".
        if (!nativeChart && expectedRange) {

            nativeChart =
                candidates.find(chart => {

                    const chartRange =
                        text(chart?.range);

                    return (
                        chartRange === expectedRange ||
                        chartRange === expectedDashboardRange ||
                        this.removeSheetFromRange(
                            chartRange
                        ) === expectedRange
                    );
                });
        }

        // 3. Title is only fallback.
        if (!nativeChart) {

            const possibleTitles = [
                text(analysis.chart?.title),
                `${pivotSheetName} Chart`,
                `${sourceSheetName} Pivot Chart`
            ].filter(Boolean);

            nativeChart =
                candidates.find(
                    chart =>
                        possibleTitles.includes(
                            text(chart?.title)
                        )
                );
        }

        if (!nativeChart) {

            console.warn(
                '[Dashboard] Pivot chart not found',
                {
                    pivotSheetName,
                    sourceSheetName,
                    expectedChartId,
                    expectedRange,
                    expectedDashboardRange,
                    dashboardCharts:
                        candidates.map(chart => ({
                            id: chart?.id,
                            range: chart?.range,
                            title: chart?.title
                        }))
                }
            );

            continue;
        }

        matched.add(nativeChart);

        const chartId =
            text(nativeChart?.id) ||
            expectedChartId ||
            undefined;

        const dashboardDataRange =
            this.removeSheetFromRange(
                text(nativeChart?.range)
            ) ||
            expectedRange;

        const widgetId =
            analysis.dashboardWidgetId ??
            Date.now() + widgets.length;

        const widget: DashboardWidgetMetadata = {

            id: widgetId,

            dashboardSheetName:
                DASHBOARD_SHEET,

            chartId,

            chartTitle:
                text(nativeChart?.title) ||
                text(analysis.chart?.title),

            chartType:
                String(
                    nativeChart?.type ??
                    this.mapPivotChartType(
                        analysis.chart?.type
                    )
                ),

            sourceType: 'PIVOT',

            sourceSheetId:
                source.sheetId,

            sourceSheetName:
                source.sheetName,

            analysisId:
                analysis.id,

            dashboardDataRange
        };

        widgets.push(widget);

        analysis.dashboardWidgetId =
            widget.id;

        analysis.dashboardChartId =
            chartId;

        analysis.dashboardDataRange =
            dashboardDataRange;

        analysis.sourceSheetId =
            source.sheetId;

        analysis.sourceSheetName =
            source.sheetName;
    }

    return widgets;
}


private getCurrentPivotAnalysis():
    SavedSheetAnalysis | null {

    // First use currently opened Pivot.
    if (this.currentPivotSheetName) {

        const current =
            this.sheetAnalyses.find(
                analysis =>
                    text(analysis.sheetName) ===
                    text(this.currentPivotSheetName)
            );

        if (current) {
            return current;
        }
    }

    // Otherwise check active sheet.
    const activeSheetName =
        text(
            this.grid
                ?.getActiveSheet?.()
                ?.name
        );

    if (activeSheetName) {

        const active =
            this.sheetAnalyses.find(
                analysis =>
                    text(analysis.sheetName) ===
                    activeSheetName
            );

        if (active) {
            return active;
        }
    }

    return null;
}

private removeSheetFromRange(
    range: string
): string {

    const value = text(range);

    if (!value) {
        return '';
    }

    const separatorIndex =
        value.lastIndexOf('!');

    return separatorIndex >= 0
        ? value.substring(separatorIndex + 1)
        : value;
}
    /** DIRECT widgets: remaining Dashboard charts bound to another sheet's range. */
    private rebuildDirectWidgets(
        charts: any[],
        matchedPivotCharts: Set<any>,
        pivotCount: number
    ): DashboardWidgetMetadata[] {
        const widgets: DashboardWidgetMetadata[] = [];

        for (const chart of charts) {
            if (matchedPivotCharts.has(chart)) {
                continue;
            }

            const chartId = text(chart?.id) || undefined;
            const chartRange = text(chart?.range);

            const sourceSheetName = getChartReferencedSheetNames(chartRange).find(
                name => name !== DASHBOARD_SHEET
            );

            // A Dashboard-local range with no matching analysis is not DIRECT.
            if (!sourceSheetName) {
                continue;
            }

            const source = this.getSheetIdentity(sourceSheetName);

            const previous = this.dashboardWidgets.find(
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

    private getSourceByName(sheetName: string): SpreadsheetDataSource | null {
        const item = this.sheetDataSources.find(x => x.sheetName === sheetName);
        return item ? this.cloneSource(item.source) : null;
    }

    private getActiveSheetSource(): SpreadsheetDataSource | null {
        if (!this.spreadsheet) {
            return this.currentSpreadsheetSource ? this.cloneSource(this.currentSpreadsheetSource) : null;
        }

        const activeSheet: any = this.spreadsheet.getActiveSheet();

        if (!activeSheet) {
            return null;
        }

        const byId = activeSheet.id != null
            ? this.sheetDataSources.find(item => item.sheetId === activeSheet.id)
            : undefined;
        const byName = this.sheetDataSources.find(item => item.sheetName === activeSheet.name);
        const source = byId?.source ?? byName?.source;

        if (!source && activeSheet.name === TRANSACTIONS_SHEET) {
            return this.currentSpreadsheetSource ? this.cloneSource(this.currentSpreadsheetSource) : null;
        }

        return source ? this.cloneSource(source) : null;
    }

    registerActiveSheetSource(source: SpreadsheetDataSource): void {
        const sheet: any = this.spreadsheet?.getActiveSheet();

        if (!sheet?.name) {
            return;
        }

        const metadata: SpreadsheetSheetDataSource = {
            sheetId: sheet.id,
            sheetName: sheet.name,
            source: this.cloneSource(source)
        };

        const index = this.sheetDataSources.findIndex(
            item => (sheet.id != null && item.sheetId === sheet.id) || item.sheetName === sheet.name
        );

        if (index >= 0) {
            this.sheetDataSources[index] = metadata;
        } else {
            this.sheetDataSources.push(metadata);
        }

        this.currentSpreadsheetSource = this.cloneSource(source);
        this.currentSpreadsheetFilters = { ...(source.filters ?? {}) };
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

        const index = this.sheetDataSources.findIndex(item => text(item.sheetName) === name);

        if (index >= 0) {
            this.sheetDataSources[index] = clean;
        } else {
            this.sheetDataSources.push(clean);
        }
    }

    /** Syncs ids/names before save (also handles renamed tabs). */
    private syncSheetIdentity(): void {
        if (!this.allSheets.length) {
            return;
        }

        this.sheetDataSources.forEach(item => {
            // Name first: ids are unreliable after openFromJson()/dynamic inserts.
            const sheet =
                this.allSheets.find((x: any) => text(x?.name) === text(item.sheetName)) ??
                (item.sheetId != null ? this.allSheets.find((x: any) => x?.id === item.sheetId) : null);

            if (sheet) {
                item.sheetId = sheet.id;
                item.sheetName = sheet.name;
            }
        });

        // The initial Transactions sheet exists before Syncfusion gives it an id.
        if (this.currentSpreadsheetSource && !this.sheetDataSources.length) {
            const sheet = this.findSheet(TRANSACTIONS_SHEET);

            if (sheet) {
                this.sheetDataSources.push({
                    sheetId: sheet.id,
                    sheetName: sheet.name,
                    source: this.cloneSource(this.currentSpreadsheetSource)
                });
            }
        }
    }

    // ---- Active-tab watcher ----

    private startSheetWatcher(): void {
        this.stopSheetWatcher();

        if (!this.spreadsheet) {
            return;
        }

        this.lastActiveSheetIndex = Number(this.grid.activeSheetIndex ?? 0);

        this.sheetWatcher = setInterval(() => {
            if (!this.spreadsheet) {
                return;
            }

            const index = Number(this.grid.activeSheetIndex ?? 0);

            // Dashboard is fixed as the first/left-most tab. If Syncfusion allows
            // a drag/reorder, move it back immediately.
            const dashboardIndex = this.allSheets.findIndex(
                (sheet: any) => text(sheet?.name).trim().toLowerCase() === DASHBOARD_SHEET.toLowerCase()
            );

            if (dashboardIndex > 0) {
                void this.moveDashboardToFirst();
            }

            if (index === this.lastActiveSheetIndex) {
                return;
            }

            this.lastActiveSheetIndex = index;
            this.syncActiveSheetToUi();
            void this.syncPivotForActiveSheet();
        }, 100);
    }

    private stopSheetWatcher(): void {
        if (!this.sheetWatcher) {
            return;
        }

        clearInterval(this.sheetWatcher);
        this.sheetWatcher = null;
    }

    private syncActiveSheetToUi(): void {
        const activeSheet: any = this.spreadsheet?.getActiveSheet();

        if (!activeSheet?.name) {
            return;
        }

        // Match by sheet NAME (ids are unreliable after openFromJson()).
        const metadata = this.sheetDataSources.find(item => text(item.sheetName) === text(activeSheet.name));

        // Always replace the previous tab's UI state.
        this.currentSpreadsheetSource = metadata?.source ? this.cloneSource(metadata.source) : null;
        this.currentSpreadsheetFilters = { ...(metadata?.source?.filters ?? {}) };

        this.cdr.detectChanges();
    }

    // ---- Applied filters (header badges) ----

    getAppliedFilters(): { label: string; value: string }[] {
        const filters = this.currentSpreadsheetFilters;

        if (!filters) {
            return [];
        }

        const asIs = (v: any) => String(v);
        const asDate = (v: any) => this.formatFilterDate(v);

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

    private formatFilterDate(value: any): string {
        if (!value) {
            return '';
        }

        const date = new Date(value);
        return isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
    }

    // =====================================================
    // SAVE / OPEN
    // =====================================================

    private prepareWorkbookForSave(workbook: any): any {
        const prepared = this.reconcileDashboardCharts(workbook);
        this.rebuildWidgetMetadata(prepared);
        return prepared;
    }

saveSpreadsheet(): void {
    if (!this.spreadsheet) {
        this.notify.warn('Spreadsheet is not ready.');
        return;
    }

    if (!this.dashboardId) {
        this.notify.error('Dashboard id is missing.');
        return;
    }

    if (this.pivotView && this.currentPivotSheetName) {
        this.updatePivotAnalysis();
    }

    this.syncSheetIdentity();

    const sheetDataSources =
        this.cloneSheetSources(this.sheetDataSources);

    this.showLoading('Saving Spreadsheet...');

    this.grid
        .saveAsJson(this.saveOptions)
        .then((rawWorkbook: any) => {

            const workbook =
                this.prepareWorkbookForSave(rawWorkbook);

            const spreadsheet = {
                workbookJson: workbook,

                sheetDataSources,

                sheetAnalyses:
                    clone(this.sheetAnalyses),

                dashboardWidgets:
                    clone(this.dashboardWidgets),

                updatedDate:
                    new Date().toISOString(),

                recordCount:
                    this.getRecordCount(workbook)
            };

            // IMPORTANT:
            // generated proxy already JSON.stringify(body)
            return firstValueFrom(
                this.appDashboardsAppService.saveSpreadSheetJson(
                    this.dashboardId,
                    spreadsheet
                )
            );
        })
        .then(() => {
            this.notify.success(
                'Spreadsheet saved successfully.'
            );
        })
        .catch((error: any) => {
            console.error(
                '[Spreadsheet] SaveSpreadSheetJson failed:',
                error
            );

            this.notify.error(
                'Failed to save Spreadsheet.'
            );
        })
        .finally(() => {
            this.hideLoading();
            this.cdr.detectChanges();
        });
}

    private getRecordCount(workbook: any): number {
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
        if (!this.spreadsheet || !workbookJson) {
            return workbookJson;
        }

        if (text(this.grid.getActiveSheet?.()?.name) !== DASHBOARD_SHEET) {
            return workbookJson;
        }

        const cleaned = clone(workbookJson);
        const workbook = cleaned?.jsonObject?.Workbook ?? cleaned?.Workbook;

        if (!workbook || !Array.isArray(workbook.sheets)) {
            return cleaned;
        }

        const dashboard = workbook.sheets.find((s: any) => text(s?.name) === DASHBOARD_SHEET);

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
            if (!Array.isArray(cell?.chart)) {
                return;
            }

            cell.chart.forEach((chart: any) => {
                const id = text(chart?.id);

                if (id && !chartById.has(id)) {
                    chartById.set(id, clone(chart));
                }
            });
        });

        if (!chartById.size) {
            return cleaned;
        }

        // Find charts that are really visible on screen, with their current position/size.
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

        // Store charts in a real Dashboard cell so save/reopen owns them.
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

    // =====================================================
    // TRANSACTIONS: MAPPING + PAGED LOADING
    // =====================================================

    private mapTransactionToRow(record: any): any {
        return {
            TransactionNumber: record.code ?? '',
            TransactionType:
                record.entityObjectTypeCode === 'SALESORDER' ? this.l('SalesOrder') : this.l('PurchaseOrder'),
            Seller: record.sellerCompanyName ?? '',
            Buyer: record.buyerCompanyName ?? '',
            Status: record.entityObjectStatusCode ?? '',
            CreatedDate: this.formatDate(record.creationTime),
            CompleteDate: this.formatDate(record.completeDate),
            Reference: record.reference ?? '',
            Creator: record.creatorTenantName ?? '',
            Currency: record.currencyCode ?? '',
            Quantity: Number(record.totalQuantity ?? 0),
            Amount: Number(record.totalAmount ?? 0)
        };
    }

    private formatDate(value: any): string {
        if (!value) {
            return '';
        }

        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
    }

    private getDataPage(
        source: SpreadsheetDataSource,
        filters: SpreadsheetFilters | Record<string, any>,
        skipCount: number,
        maxResultCount: number
    ): any {
        const sourceKey = source.sourceKey ?? source.type;

        switch (sourceKey) {
            case 'TRANSACTIONS':
            case 'Transactions':
                return this.getTransactions(filters as SpreadsheetFilters, skipCount, maxResultCount);

            default:
                throw new Error(`Unsupported Spreadsheet source: ${sourceKey}`);
        }
    }

    private getTransactions(filters: SpreadsheetFilters, skipCount = 0, maxResultCount = this.batchSize) {
        return this._appTransactionServiceProxy.getAll(
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

            filters.statusFilter == null ? undefined : filters.statusFilter,

            false,
            undefined,
            undefined,

            filters.referenceNumberFilter,

            text(filters.sorting) || undefined, // stable sorting for paged loads

            skipCount,
            maxResultCount
        );
    }

    // =====================================================
    // REFRESH DATA
    // =====================================================

    async refreshData(): Promise<void> {
        if (this.isRefreshing || !this.spreadsheet) {
            return;
        }

        const activeSheet = this.spreadsheet.getActiveSheet();
        const activeSheetName = activeSheet?.name;
        const affectedWidgets = this.getWidgetsForSheet(activeSheet);

        if (!activeSheetName) {
            this.notify.warn('Active Spreadsheet tab is not available.');
            return;
        }

        // Refresh ONLY from the source/filter belonging to the active tab.
        const source = this.getActiveSheetSource();

        if (!source) {
            this.notify.warn('Spreadsheet source is not available.');
            return;
        }

        // StatusId = 0 must not be sent: the backend treats it as a real id.
        const refreshFilters: SpreadsheetFilters = {
            ...(source.filters ?? {}),
            statusFilter: this.cleanStatus(source.filters?.statusFilter)
        };

        const selectedIds =
            source.mode === 'SelectedRecords' && source.selectedIds?.length
                ? new Set(source.selectedIds.map(id => Number(id)))
                : null;

        this.isRefreshing = true;
        this.showLoading('Loading latest transactions...');

        let skipCount = 0;
        let displayedCount = 0;
        let sourceCount = 0;
        let sheetCleared = false;

        try {
            while (true) {
                const result: any = await firstValueFrom(
                    this.getDataPage(source, refreshFilters, skipCount, this.batchSize)
                );

                const items: any[] = result?.items ?? [];

                // Clear old rows only after the first API call succeeds, so an
                // HTTP error never wipes the user's existing sheet.
                if (!sheetCleared) {
                    this.clearOldRows(activeSheetName);
                    sheetCleared = true;
                    await yieldToBrowser();
                }

                if (!items.length) {
                    break;
                }

                sourceCount += items.length;

                // SelectedRecords: the API still pages the whole query, so filter
                // each batch but keep paging by the ORIGINAL page size.
                const batchItems = selectedIds ? items.filter(r => selectedIds.has(Number(r?.id))) : items;

                if (batchItems.length) {
                    this.appendRefreshBatch(
                        activeSheetName,
                        batchItems.map(r => this.mapTransactionToRow(r)),
                        displayedCount
                    );

                    displayedCount += batchItems.length;
                }

                this.setProgress(sourceCount, Number(result?.totalCount ?? 0));
                this.loadingMessage = `Loading latest transactions... ${displayedCount.toLocaleString()} displayed`;

                await yieldToBrowser();

                skipCount += this.batchSize;

                // Short page = final page.
                if (items.length < this.batchSize) {
                    break;
                }
            }

            // Rebuild the pivot only ONCE, after all batches are displayed.
            await yieldToBrowser();
            await this.refreshPivotAfterDataRefresh();

            if (affectedWidgets.length) {
                this.refreshLayout();
            }

            this.notify.success(
                `Spreadsheet refreshed successfully. ${displayedCount.toLocaleString()} records loaded.`
            );
        } catch (error) {
            console.error('Spreadsheet refresh failed:', error);
            this.notify.error('Unable to refresh spreadsheet data.');
        } finally {
            this.isRefreshing = false;
            this.hideLoading();
        }
    }

    /** Clears old data rows (keeps the header) once before the progressive refresh. */
    private clearOldRows(sheetName: string): void {
        const sheet = this.findSheet(sheetName);

        if (!sheet) {
            return;
        }

        const headers = this.getSheetHeaders(sheet);
        const oldLastRowIndex = sheet?.usedRange?.rowIndex ?? 0;

        if (!headers.length || oldLastRowIndex < 1) {
            return;
        }

        this.spreadsheet!.clear({
            range: `${sheetName}!A2:${toColumnName(headers.length)}${oldLastRowIndex + 1}`,
            type: 'Clear Contents'
        } as any);
    }

    /** Appends ONE API batch. displayStartIndex is zero-based for DATA rows. */
    private appendRefreshBatch(sheetName: string, rows: any[], displayStartIndex: number): void {
        if (!this.spreadsheet || !rows?.length) {
            return;
        }

        const sheetIndex = this.allSheets.findIndex((s: any) => s?.name === sheetName);

        if (sheetIndex < 0) {
            return;
        }

        const headers = this.getSheetHeaders(this.allSheets[sheetIndex]);

        if (!headers.length) {
            return;
        }

        // Headers may be row keys ("TransactionNumber") or the labels written by
        // the Add-data panel ("Transaction Number"); support both.
        const labelToKey = new Map<string, string>(
            (this.entities[0]?.columns ?? []).map(c => [c.label, c.key] as [string, string])
        );

        const projectedRows = rows.map(row => {
            const projected: any = {};

            headers.forEach(header => {
                projected[header] = (row as any)[labelToKey.get(header) ?? header] ?? '';
            });

            return projected;
        });

        // Row 1 = header, first data batch starts at row 2.
        this.spreadsheet.updateRange(
            { dataSource: projectedRows, startCell: `A${displayStartIndex + 2}`, showFieldAsHeader: false } as any,
            sheetIndex
        );
    }

    /**
     * Reads real header cells (not usedRange.colIndex), because a chart far to
     * the right can widen usedRange and create fake pivot fields.
     */
    private getSheetHeaders(sheet: any): string[] {
        const headerCells = sheet?.rows?.[0]?.cells ?? [];
        const headers: string[] = [];

        for (const cell of headerCells) {
            const value = text(cell?.value);

            if (!value) {
                // Stop at the first empty header AFTER the data headers.
                if (headers.length > 0) {
                    break;
                }

                continue;
            }

            headers.push(value);
        }

        return headers;
    }

    /** Re-reads the pivot source sheet; keeps rows/columns/values/filters/chart. */
    private async refreshPivotAfterDataRefresh(): Promise<void> {
        if (!this.pivotView || !this.currentPivotSheetName) {
            return;
        }

        const sourceSheetName = this.pivotSourceSheetName;

        if (!sourceSheetName) {
            return;
        }

        const sheet = this.findSheet(sourceSheetName);

        if (!sheet) {
            return;
        }

        const lastRowIndex = sheet.usedRange?.rowIndex ?? 0;
        const headers = this.getSheetHeaders(sheet);

        if (lastRowIndex < 1 || !headers.length) {
            this.pivotData = [];
            this.pivotDataSourceSettings = { ...this.pivotDataSourceSettings, dataSource: [] };
            this.refreshPivot();
            return;
        }

        const lastColumnIndex = headers.length - 1;
        const range = `${sheet.name}!A1:${toColumnName(lastColumnIndex + 1)}${lastRowIndex + 1}`;

        try {
            const data = await this.spreadsheet!.getData(range);
            const refreshed = this.sheetDataToRecords(data, lastRowIndex, lastColumnIndex) as IDataSet[];

            this.pivotData = refreshed;

            // Replace ONLY the source data + dynamic field mapping.
            this.pivotDataSourceSettings = {
                ...this.pivotDataSourceSettings,
                dataSource: refreshed,
                fieldMapping: this.buildFieldMapping(refreshed)
            };

            this.pivotView.dataSourceSettings = this.pivotDataSourceSettings;
            this.pivotView.chartSettings = this.pivotChartSettings;
            this.pivotView.dataBind?.();
            this.pivotView.refresh?.();
        } catch (error) {
            console.error('Unable to refresh Pivot after Spreadsheet refresh:', error);
        }
    }
}