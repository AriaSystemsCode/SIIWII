import { ParsedRange, text, toColumnName } from '../models/spreadsheet.model';

// =====================================================
// RANGES
// =====================================================

export function columnIndex(columnName: string): number {
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

/** "'My Sheet'!A1:B10" -> ParsedRange (null when invalid). */
export function parseRange(range: string): ParsedRange | null {
    const value = text(range).trim();
    const bang = value.lastIndexOf('!');

    if (bang < 1) {
        return null;
    }

    let sheetName = value.substring(0, bang).trim();
    const address = value.substring(bang + 1).replace(/\$/g, '').trim();

    if (sheetName.startsWith("'") && sheetName.endsWith("'")) {
        sheetName = sheetName.slice(1, -1).replace(/''/g, "'");
    }

    const match = address.match(/^([A-Za-z]+)(\d+):([A-Za-z]+)(\d+)$/);

    if (!match) {
        return null;
    }

    const startColumn = match[1].toUpperCase();
    const endColumn = match[3].toUpperCase();
    const startRow = Number(match[2]);
    const endRow = Number(match[4]);
    const startColumnIndex = columnIndex(startColumn);
    const endColumnIndex = columnIndex(endColumn);

    if (startColumnIndex < 0 || endColumnIndex < startColumnIndex || startRow < 1 || endRow < startRow) {
        return null;
    }

    return { sheetName, startColumn, endColumn, startColumnIndex, endColumnIndex, startRow, endRow };
}

export function quoteSheetName(sheetName: string): string {
    const name = text(sheetName);
    return /[\s()'!]/.test(name) ? `'${name.replace(/'/g, "''")}'` : name;
}

/** "Dashboard!AZ1:BA15" -> "AZ1:BA15" */
export function removeSheetFromRange(range: string): string {
    const value = text(range);
    return value.substring(value.lastIndexOf('!') + 1);
}

// =====================================================
// WORKBOOK JSON
// =====================================================

/** Accepts { jsonObject: { Workbook } }, { Workbook } and returns the Workbook object. */
export function getWorkbookRoot(json: any): any {
    return json?.jsonObject?.Workbook ?? json?.Workbook ?? null;
}

export function getCellValue(sheet: any, row: number, col: number): any {
    return sheet?.rows?.[row]?.cells?.[col]?.value;
}

export function getValueIgnoreCase(record: any, field: string): any {
    if (!record || !field) {
        return undefined;
    }

    if (Object.prototype.hasOwnProperty.call(record, field)) {
        return record[field];
    }

    const key = Object.keys(record).find(x => x.toLowerCase() === field.toLowerCase());
    return key ? record[key] : undefined;
}

/** All chart models stored in a sheet (live model or saved JSON). */
export function getSheetCharts(sheet: any): any[] {
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

function withoutIndex(item: any): any {
    const copy = { ...(item ?? {}) };
    delete copy.index;
    return copy;
}

/**
 * Saved JSON is sparse ({ index: 5, cells: [{ index: 3 }] }).
 * This turns a sheet into plain dense arrays so rows[r].cells[c] always works.
 */
export function normalizeSheet(sheet: any): void {
    const rows: any[] = [];
    let r = 0;

    for (const row of sheet.rows ?? []) {
        if (row?.index != null) {
            r = row.index;
        }

        const cells: any[] = [];
        let c = 0;

        for (const cell of row?.cells ?? []) {
            if (cell?.index != null) {
                c = cell.index;
            }
            cells[c++] = withoutIndex(cell);
        }

        rows[r++] = { ...withoutIndex(row), cells };
    }

    for (let i = 0; i < rows.length; i++) {
        if (!rows[i]) {
            rows[i] = { cells: [] };
        }

        for (let j = 0; j < rows[i].cells.length; j++) {
            if (!rows[i].cells[j]) {
                rows[i].cells[j] = {};
            }
        }
    }

    sheet.rows = rows;
}

/** Opposite of normalizeSheet: drops empty cells/rows and restores sparse indexes. */
export function compactSheet(sheet: any): void {
    const rows: any[] = [];
    let previousRow = -1;
    let lastRow = 0;
    let lastCol = 0;

    (sheet.rows ?? []).forEach((row: any, r: number) => {
        const cells: any[] = [];
        let previousCol = -1;

        (row?.cells ?? []).forEach((cell: any, c: number) => {
            if (!cell || !Object.keys(cell).length) {
                return;
            }

            cells.push(c === previousCol + 1 ? cell : { ...cell, index: c });
            previousCol = c;
            lastRow = Math.max(lastRow, r);
            lastCol = Math.max(lastCol, c);
        });

        const { cells: _cells, ...rowProps } = row ?? ({} as any);

        if (!cells.length && !Object.keys(rowProps).length) {
            return;
        }

        rows.push({ ...rowProps, ...(r === previousRow + 1 ? {} : { index: r }), cells });
        previousRow = r;
    });

    sheet.rows = rows;
    sheet.usedRange = { rowIndex: lastRow, colIndex: lastCol };
    sheet.rowCount = Math.max(Number(sheet.rowCount ?? 100), lastRow + 1);
    sheet.colCount = Math.max(Number(sheet.colCount ?? 100), lastCol + 1);
}

/** Writes a value into a NORMALIZED sheet. */
export function setCell(sheet: any, row: number, col: number, value: any, style?: any): void {
    while (sheet.rows.length <= row) {
        sheet.rows.push({ cells: [] });
    }

    const cells = sheet.rows[row].cells ?? (sheet.rows[row].cells = []);

    while (cells.length <= col) {
        cells.push({});
    }

    cells[col].value = value;

    if (style) {
        cells[col].style = { ...(cells[col].style ?? {}), ...style };
    }
}

/** Empties a rectangular block of a NORMALIZED sheet. */
export function clearBlock(sheet: any, startCol: number, width: number, rowCount: number): void {
    for (let r = 0; r < Math.min(rowCount, sheet.rows.length); r++) {
        const cells = sheet.rows[r].cells ?? [];

        for (let c = startCol; c < Math.min(startCol + width, cells.length); c++) {
            cells[c] = {};
        }
    }
}

// =====================================================
// PIVOT
// =====================================================

export function normalizeValue(value: any): any {
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

export function buildFieldMapping(records: any[]): any[] {
    if (!records?.length) {
        return [];
    }

    return Object.keys(records[0]).map(name => {
        const values = records.map(r => r[name]).filter(v => v !== '' && v !== null && v !== undefined);
        const isNumeric = values.length > 0 && values.every(v => typeof v === 'number');

        return { name, caption: name, dataType: isNumeric ? 'number' : 'string' };
    });
}


export function buildPivotSettings(
    saved: any,
    records: any[],
    fieldMapping: any[]
): any {
    const copy = (items: any) =>
        JSON.parse(JSON.stringify(items ?? []));

    return {
        dataSource: records ?? [],
        rows: copy(saved?.rows),
        columns: copy(saved?.columns),
        values: copy(saved?.values),
        filters: copy(saved?.filters),

        filterSettings: copy(saved?.filterSettings),
        sortSettings: copy(saved?.sortSettings),
        formatSettings: copy(saved?.formatSettings),
        calculatedFieldSettings: copy(saved?.calculatedFieldSettings),

        valueSortSettings: {
            headerDelimiter:
                saved?.valueSortSettings?.headerDelimiter ?? '.',
            headerText:
                saved?.valueSortSettings?.headerText ?? '',
            sortOrder:
                saved?.valueSortSettings?.sortOrder ?? 'None'
        },

        fieldMapping: fieldMapping ?? [],

        enableSorting: true,
        enableValueSorting: false,
        allowLabelFilter: true,
        allowValueFilter: true,

        expandAll: false,
        showGrandTotals: true,
        showRowGrandTotals: true,
        showColumnGrandTotals: true
    };
}


/** PivotView / PivotEngine `pivotValues` -> plain rows of values. */
export function pivotValuesToMatrix(values: any[][]): any[][] {
    return (values ?? [])
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

/** Finds a Pivot's chart: by chart id, then by range, then by title. */
export function matchPivotChart(analysis: any, charts: any[], fallbackRange = ''): any | null {
    const expectedId = text(analysis.dashboardChartId);
    const expectedRange = removeSheetFromRange(analysis.dashboardDataRange || fallbackRange);
    const titles = [
        text(analysis.chart?.title),
        `${text(analysis.sheetName)} Chart`,
        `${text(analysis.sourceSheetName)} Pivot Chart`
    ].filter(Boolean);

    return (
        (expectedId && charts.find(c => text(c?.id) === expectedId)) ||
        (expectedRange && charts.find(c => removeSheetFromRange(c?.range) === expectedRange)) ||
        charts.find(c => titles.includes(text(c?.title))) ||
        null
    );
}

export { toColumnName };