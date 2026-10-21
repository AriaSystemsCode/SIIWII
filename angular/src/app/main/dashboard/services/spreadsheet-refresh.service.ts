import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import * as moment from 'moment';
import { IDataSet, PivotEngine } from '@syncfusion/ej2-pivotview';

import { AppDashboardServiceProxy } from '@shared/service-proxies/service-proxies';

import {
    ChartAggregation,
    DashboardWidgetMetadata,
    SavedSheetAnalysis,
    SpreadsheetSheetDataSource
} from '../models/dashboard.model';
import { DASHBOARD_SHEET, ParsedRange, clone, text, toColumnName } from '../models/spreadsheet.model';
import {
    buildFieldMapping,
    buildPivotSettings,
    clearBlock,
    compactSheet,
    getCellValue,
    getSheetCharts,
    getValueIgnoreCase,
    getWorkbookRoot,
    matchPivotChart,
    normalizeSheet,
    normalizeValue,
    parseRange,
    pivotValuesToMatrix,
    quoteSheetName,
    setCell
}  from '../models/spreadsheet.utils';


/** Exactly what is saved with a dashboard spreadsheet. */
export interface SpreadsheetPayload {
    workbookJson: any;
    sheetDataSources: SpreadsheetSheetDataSource[];
    sheetAnalyses: SavedSheetAnalysis[];
    dashboardWidgets: DashboardWidgetMetadata[];
    updatedDate?: string | null;
}

export interface RefreshOptions {
    tenantId: number | undefined;
    /** Colour new / changed cells (used by the editor). */
    highlight?: boolean;
    onProgress?: (message: string, done: number, total: number) => void;
}

const BATCH_SIZE = 500;
const ADDED_COLOR = '#DCFCE7';
const EDITED_COLOR = '#FEF3C7';

/** Normalizes a sheet the first time it is used, and compacts it again at the end. */
class SheetWorkspace {
    private touched = new Set<any>();

    constructor(readonly sheets: any[]) {}

    get(name: string): any {
        const sheet = this.sheets.find(s => text(s?.name) === name);

        if (sheet && !this.touched.has(sheet)) {
            normalizeSheet(sheet);
            this.touched.add(sheet);
        }

        return sheet;
    }

    dashboard(): any {
        const sheet = this.sheets.find(s => text(s?.name).trim().toLowerCase() === DASHBOARD_SHEET.toLowerCase());
        return sheet ? this.get(text(sheet.name)) : null;
    }

    compact(): void {
        this.touched.forEach(sheet => compactSheet(sheet));
    }
}

/**
 * ONE refresh pipeline for the editor and the dashboard view:
 *   1. pull changed records from the API into the data sheets (matched by Id)
 *   2. rebuild the helper blocks of aggregated charts
 *   3. rebuild the Dashboard blocks of Pivot charts
 * It works on the saved workbook JSON, so no live Syncfusion instance is needed.
 */
@Injectable({ providedIn: 'root' })
export class SpreadsheetRefreshService {
    constructor(private dashboardService: AppDashboardServiceProxy) {}

    async refresh(saved: SpreadsheetPayload, options: RefreshOptions): Promise<SpreadsheetPayload> {
        const state = clone(saved) as SpreadsheetPayload;

        state.sheetDataSources = state.sheetDataSources ?? [];
        state.sheetAnalyses = state.sheetAnalyses ?? [];
        state.dashboardWidgets = state.dashboardWidgets ?? [];

        const root = getWorkbookRoot(state.workbookJson);

        if (!Array.isArray(root?.sheets)) {
            throw new Error('The saved workbook has no sheets.');
        }

        root.sheets = root.sheets.filter((s: any) => s && typeof s === 'object' && Object.keys(s).length);

        const workspace = new SheetWorkspace(root.sheets);

        await this.refreshSourceSheets(state, workspace, options);

        options.onProgress?.('Recalculating charts...', 0, 0);
        this.refreshDirectCharts(state, workspace);
        this.refreshPivotCharts(state, workspace);

        workspace.compact();

        return state;
    }

    // =====================================================
    // 1. SOURCE SHEETS
    // =====================================================

    private async refreshSourceSheets(
        state: SpreadsheetPayload,
        workspace: SheetWorkspace,
        options: RefreshOptions
    ): Promise<void> {
        const since = this.toApiDate(state.updatedDate);

        const sources = state.sheetDataSources.filter(
            s =>
                !!text(s.sheetName) &&
                s.sheetName !== DASHBOARD_SHEET &&
                !!text(s.source?.sourceKey ?? s.source?.type) &&
                !!s.source?.columns?.length
        );

        let done = 0;

        for (const meta of sources) {
            options.onProgress?.(`Refreshing ${meta.sheetName}...`, done, sources.length);

            const sheet = workspace.get(meta.sheetName);

            if (sheet) {
                const fields = this.sourceFields(meta);
                const records = await this.fetchChanges(
                    options.tenantId,
                    text(meta.source.sourceKey ?? meta.source.type),
                    fields,
                   (meta.source.filters as any)?.conditions ?? [],
                    since
                );

                this.applyRecords(sheet, meta, fields, records, !!options.highlight);
            }

            options.onProgress?.(`Refreshed ${meta.sheetName}`, ++done, sources.length);
        }
    }

    /** The API wants a moment whose toISOString has no timezone suffix. */
    private toApiDate(updatedDate?: string | null): any {
        if (!updatedDate) {
            return undefined;
        }

        const date = moment.utc(updatedDate);
        date.toISOString = () => date.format('YYYY-MM-DDTHH:mm:ss');
        return date;
    }

    private sourceFields(meta: SpreadsheetSheetDataSource): string[] {
        const names = (meta.source?.columns ?? []).map(f => String(f).trim()).filter(f => !!f && f.toLowerCase() !== 'id');
        return Array.from(new Set(names));
    }

    private async fetchChanges(
        tenantId: number | undefined,
        tableName: string,
        fields: string[],
        conditions: any[],
        since: any
    ): Promise<any[]> {
        const records: any[] = [];
        let skip = 0;

        while (true) {
            const result: any = await firstValueFrom(
                this.dashboardService.getAllTableData(
                    tenantId,
                    tableName,
                    ['Id', ...fields],
                    conditions,
                    since,
                    undefined,
                    'Id',
                    skip,
                    BATCH_SIZE
                )
            );

            const items: any[] = result?.items ?? [];
            const total = Number(result?.totalCount ?? 0);

            records.push(...items);
            skip += items.length;

            if (!items.length || items.length < BATCH_SIZE || (total && skip >= total)) {
                break;
            }
        }

        return records;
    }

    /** Updates rows matched by Id, appends new ones, never deletes. */
    private applyRecords(
        sheet: any,
        meta: SpreadsheetSheetDataSource,
        fields: string[],
        records: any[],
        highlight: boolean
    ): void {
        if (!records.length) {
            return;
        }

        // Field -> column. Only the data area is searched, never the helper columns on the right.
        const header = sheet.rows[0]?.cells ?? [];
        const columnOf = new Map<string, number>();

        fields.forEach((_f, i) => {
            const name = text(header[i]?.value).trim().toLowerCase();

            if (name) {
                columnOf.set(name, i);
            }
        });

        for (const field of fields) {
            if (!columnOf.has(field.toLowerCase())) {
                throw new Error(`Missing source column "${field}" in "${meta.sheetName}".`);
            }
        }

        const ids: any[] = [...(meta.sheetRecordIds ?? [])];
        const rowOfId = new Map<string, number>();
        ids.forEach((id, i) => rowOfId.set(String(id).trim(), i + 1));

        // Same Id twice in the response: the last one wins.
        const latest = new Map<string, any>();

        for (const record of records) {
            const rawId = getValueIgnoreCase(record, 'Id');
            const id = String(rawId ?? '').trim();

            if (!id) {
                throw new Error(`Backend returned a record without Id for "${meta.sheetName}".`);
            }

            latest.set(id, record);
        }

        latest.forEach((record, id) => {
            if (record?.isDeleted === true || record?.IsDeleted === true) {
                return;
            }

            let row = rowOfId.get(id);
            const isNew = row === undefined;

            if (row === undefined) {
                row = ids.length + 1;
                ids.push(getValueIgnoreCase(record, 'Id'));
                rowOfId.set(id, row);
            }

            for (const field of fields) {
                const raw = getValueIgnoreCase(record, field);

                // Field not returned: keep the current value.
                if (raw === undefined && !isNew) {
                    continue;
                }

                const value = raw ?? '';
                const col = columnOf.get(field.toLowerCase())!;

                if (!isNew && String(getCellValue(sheet, row, col) ?? '') === String(value)) {
                    continue;
                }

                setCell(sheet, row, col, value, highlight ? { backgroundColor: isNew ? ADDED_COLOR : EDITED_COLOR } : undefined);
            }
        });

        meta.sheetRecordIds = ids;
    }

    // =====================================================
    // 2. DIRECT (AGGREGATED) CHARTS
    // =====================================================

    private refreshDirectCharts(state: SpreadsheetPayload, workspace: SheetWorkspace): void {
        const seen = new Set<any>();

        for (const sheet of workspace.sheets) {
            for (const chart of getSheetCharts(sheet)) {
                if (seen.has(chart) || !chart?.categoryRange || !chart?.seriesRanges?.length) {
                    continue;
                }

                seen.add(chart);
                this.refreshDirectChart(state, workspace, chart);
            }
        }
    }

    private refreshDirectChart(state: SpreadsheetPayload, workspace: SheetWorkspace, chart: any): void {
        const categoryText = this.expandRange(text(chart.categoryRange), state);
        const seriesTexts: string[] = chart.seriesRanges
            .map((item: any) => text(typeof item === 'string' ? item : item?.range))
            .filter(Boolean)
            .map((range: string) => this.expandRange(range, state));

        const checked = this.checkChartRanges(categoryText, seriesTexts, name => !!workspace.get(name));

        if (typeof checked === 'string') {
            console.warn('[Refresh] Chart skipped:', chart.id, checked);
            return;
        }

        const old = parseRange(text(chart.range));
        const helperSheet = old ? workspace.get(old.sheetName) : null;

        // The helper block must keep one column per category + series.
        if (!old || !helperSheet || old.endColumnIndex - old.startColumnIndex + 1 !== seriesTexts.length + 1) {
            console.warn('[Refresh] Chart helper range not usable:', chart.id, chart.range);
            return;
        }

        const table = this.buildChartTable(
            name => workspace.get(name),
            checked.category,
            checked.series,
            (chart.aggregation as ChartAggregation) || 'None'
        );

        const rows = [table.headers, ...table.rows];

        clearBlock(helperSheet, old.startColumnIndex, rows[0].length, Math.max(old.endRow, rows.length));
        this.writeRows(helperSheet, old.startColumnIndex, rows);

        const newRange =
            `${quoteSheetName(old.sheetName)}!${old.startColumn}1:${old.endColumn}${rows.length}`;

        chart.range = newRange;
        chart.categoryRange = categoryText;
        chart.seriesRanges = seriesTexts;

        state.dashboardWidgets
            .filter(w => w.sourceType === 'DIRECT' && !!chart.id && w.chartId === chart.id)
            .forEach(w => (w.sourceRange = newRange));
    }

    /** Source ranges grow with the number of loaded records (they never shrink). */
    private expandRange(rangeText: string, state: SpreadsheetPayload): string {
        const parsed = parseRange(rangeText);
        const meta = parsed ? state.sheetDataSources.find(s => s.sheetName === parsed.sheetName) : null;

        if (!parsed || !meta) {
            return rangeText;
        }

        const lastDataRow = (meta.sheetRecordIds?.length ?? 0) + 1;

        if (lastDataRow <= parsed.endRow) {
            return rangeText;
        }

        return `${quoteSheetName(parsed.sheetName)}!${parsed.startColumn}${parsed.startRow}:${parsed.endColumn}${lastDataRow}`;
    }

    /** Validates category + series ranges. Returns an error message when invalid. */
    checkChartRanges(
        categoryText: string,
        seriesTexts: string[],
        sheetExists: (name: string) => boolean
    ): { category: ParsedRange; series: ParsedRange[] } | string {
        if (!categoryText) {
            return 'Choose a Category / X Axis range.';
        }

        if (!seriesTexts.length) {
            return 'Choose at least one data series.';
        }

        if (seriesTexts.length > 29) {
            return 'A chart can use at most 29 data series.';
        }

        const category = parseRange(categoryText);
        const series = seriesTexts.map(r => parseRange(r)).filter((r): r is ParsedRange => !!r);

        if (!category || series.length !== seriesTexts.length) {
            return 'One or more chart ranges are invalid.';
        }

        const all = [category, ...series];

        if (all.some(r => r.startColumnIndex !== r.endColumnIndex)) {
            return 'Category and each data series must contain one column only.';
        }

        const rowCount = category.endRow - category.startRow + 1;

        if (all.some(r => r.endRow - r.startRow + 1 !== rowCount)) {
            return 'Category and all data series must contain the same number of rows.';
        }

        const missing = all.find(r => !sheetExists(r.sheetName));

        return missing ? `Sheet "${missing.sheetName}" was not found.` : { category, series };
    }

    /**
     * Builds the table a chart reads: header row + one row per record (None)
     * or one row per category (Sum / Count / Average / Min / Max).
     */
    buildChartTable(
        getSheet: (name: string) => any,
        category: ParsedRange,
        series: ParsedRange[],
        aggregation: ChartAggregation
    ): { headers: string[]; rows: any[][] } {
        const read = (source: ParsedRange, excelRow: number) =>
            getCellValue(getSheet(source.sheetName), excelRow - 1, source.startColumnIndex);

        const header = (source: ParsedRange) => String(read(source, 1) || source.startColumn);

        const headers = [
            header(category),
            ...series.map(s => (aggregation === 'None' ? header(s) : `${aggregation} of ${header(s)}`))
        ];

        // A range that starts at row 1 includes the header row: it is not data.
        const skip = category.startRow === 1 ? 1 : 0;
        const rowCount = category.endRow - category.startRow + 1;

        if (aggregation === 'None') {
            const rows: any[][] = [];

            for (let i = skip; i < rowCount; i++) {
                rows.push([
                    read(category, category.startRow + i) ?? '',
                    ...series.map(s => read(s, s.startRow + i) ?? '')
                ]);
            }

            return { headers, rows };
        }

        const groups = new Map<string, { values: number[][]; counts: number[] }>();

        for (let i = skip; i < rowCount; i++) {
            const label = String(read(category, category.startRow + i) ?? '').trim();

            if (!label) {
                continue;
            }

            if (!groups.has(label)) {
                groups.set(label, { values: series.map(() => []), counts: series.map(() => 0) });
            }

            const group = groups.get(label)!;

            series.forEach((source, index) => {
                const raw = read(source, source.startRow + i);

                if (raw === null || raw === undefined || String(raw).trim() === '') {
                    return;
                }

                group.counts[index]++;

                const numeric = Number(raw);

                if (Number.isFinite(numeric)) {
                    group.values[index].push(numeric);
                }
            });
        }

        const rows: any[][] = [];

        groups.forEach((group, label) => {
            rows.push([
                label,
                ...series.map((_s, index) => this.aggregate(group.values[index], aggregation, group.counts[index]))
            ]);
        });

        return { headers, rows };
    }

    private aggregate(values: number[], method: ChartAggregation, count: number): number {
        if (method === 'Count') {
            return count;
        }

        if (!values.length) {
            return 0;
        }

        switch (method) {
            case 'Sum':
                return values.reduce((a, b) => a + b, 0);
            case 'Average':
                return values.reduce((a, b) => a + b, 0) / values.length;
            case 'Min':
                return Math.min(...values);
            case 'Max':
                return Math.max(...values);
            default:
                return values[0];
        }
    }

    private writeRows(sheet: any, startCol: number, rows: any[][]): void {
        rows.forEach((row, r) => row.forEach((value, c) => setCell(sheet, r, startCol + c, value ?? '')));
    }

    // =====================================================
    // 3. PIVOT CHARTS ON THE DASHBOARD
    // =====================================================

  
private refreshPivotCharts(
    state: SpreadsheetPayload,
    workspace: SheetWorkspace
): void {

    const dashboard = workspace.dashboard();

    if (!dashboard) {
        return;
    }

    const charts = getSheetCharts(dashboard);

    for (const analysis of state.sheetAnalyses as any[]) {

        if (!analysis.dashboardDataRange) {
            continue;
        }

        const old = parseRange(
            `${DASHBOARD_SHEET}!${analysis.dashboardDataRange}`
        );

        const sourceName = text(analysis.sourceSheetName);

        const meta = state.sheetDataSources.find(
            s => s.sheetName === sourceName
        );

        const sourceSheet = workspace.get(sourceName);

        if (!old || !meta || !sourceSheet) {
            continue;
        }

        const records = this.readPivotRecords(sourceSheet, meta);

        if (!records?.length) {
            continue;
        }

        const matrix = this.buildPivotMatrix(
            analysis.pivot,
            records
        );

        if (!matrix?.length) {
            continue;
        }

        const width = Math.max(
            ...matrix.map(row => row.length)
        );

        if (width < 2) {
            console.warn(
                '[Pivot Refresh] No numeric value column generated:',
                analysis,
                matrix
            );
            continue;
        }

        const oldWidth =
            old.endColumnIndex - old.startColumnIndex + 1;

        clearBlock(
            dashboard,
            old.startColumnIndex,
            Math.max(width, oldWidth),
            Math.max(old.endRow, matrix.length)
        );

        this.writeRows(
            dashboard,
            old.startColumnIndex,
            matrix
        );

        const lastColumn =
            toColumnName(old.startColumnIndex + width - 1);

        const newRange =
            `${old.startColumn}1:${lastColumn}${matrix.length}`;

        const chart = matchPivotChart(
            analysis,
            charts,
            analysis.dashboardDataRange
        );

        if (chart) {
            chart.range =
                `${DASHBOARD_SHEET}!${newRange}`;
        } else {
            console.warn(
                '[Pivot Refresh] Chart not found for analysis:',
                analysis
            );
        }

        analysis.dashboardDataRange = newRange;

        state.dashboardWidgets
            .filter(
                widget =>
                    widget.sourceType === 'PIVOT' &&
                    widget.analysisId === analysis.id
            )
            .forEach(widget => {
                widget.dashboardDataRange = newRange;
            });

        console.log('[Pivot Refresh] Updated:', {
            pivot: analysis.pivotSheetName,
            range: newRange,
            matrix,
            chartFound: !!chart
        });
    }
}


    /** Runs the saved Pivot definition headless (no PivotView needed). */

buildPivotMatrix(pivot: any, records: IDataSet[]): any[][] {
    if (!records?.length) {
        return [];
    }

    const settings = buildPivotSettings(
        pivot,
        records,
        buildFieldMapping(records)
    );

    const engine: any = new PivotEngine();

    const customProperties: any = {
        mode: 'Local',
        savedFieldList: undefined,
        pageSettings: undefined,
        enableValueSorting: false,
        isDrillThrough: false,
        localeObj: {
            getConstant: (key: string) => key
        }
    };

    try {
        engine.renderEngine(settings, customProperties);

        return pivotValuesToMatrix(
            engine.pivotValues ?? []
        );
    } catch (error) {
        console.error(
            '[SpreadsheetRefreshService] Pivot engine failed:',
            {
                pivot,
                recordCount: records.length,
                settings,
                error
            }
        );

        throw error;
    }
}


    /** Source sheet rows -> records for a Pivot (the internal Id column is excluded). */
    readPivotRecords(sheet: any, meta: SpreadsheetSheetDataSource): IDataSet[] | null {
        const fields = this.sourceFields(meta);
        const recordIds = meta.sheetRecordIds ?? [];

        if (!sheet || !fields.length || !recordIds.length) {
            return null;
        }

        const columnOf = new Map<string, number>();

        (sheet.rows?.[0]?.cells ?? []).forEach((cell: any, index: number) => {
            const name = text(cell?.value).trim().toLowerCase();

            if (name) {
                columnOf.set(name, index);
            }
        });

        for (const field of fields) {
            if (!columnOf.has(field.toLowerCase())) {
                throw new Error(`Pivot source column "${field}" was not found.`);
            }
        }

        const records: IDataSet[] = [];

        for (let i = 0; i < recordIds.length; i++) {
            const record: any = {};

            for (const field of fields) {
                record[field] = normalizeValue(getCellValue(sheet, i + 1, columnOf.get(field.toLowerCase())!));
            }

            records.push(record);
        }

        return records;
    }
}