

export const DASHBOARD_SHEET = 'Dashboard';
export const TRANSACTIONS_SHEET = 'Transactions';
export const SAVED_SPREADSHEETS_KEY = 'savedSpreadsheets';

/** Safe trimmed string. */
export const text = (value: any): string => String(value ?? '').trim();

/** Lower-case, whitespace-free key used to compare field names. */
export const normalizeKey = (value: any): string =>
    String(value ?? '').replace(/\s/g, '').toLowerCase();

/** Deep clone of JSON-compatible data. */
export const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

/** Let the browser paint / Syncfusion finish its internal work. */
export const yieldToBrowser = (): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, 0));

/** 1-based column number -> Excel column name (1 = A, 27 = AA). */
export function toColumnName(columnNumber: number): string {
    let n = Math.max(1, Number(columnNumber) || 1);
    let result = '';

    while (n > 0) {
        result = String.fromCharCode(65 + ((n - 1) % 26)) + result;
        n = Math.floor((n - 1) / 26);
    }

    return result;
}

/**
 * Returns the sheet(s) explicitly referenced by a chart range.
 * Reads the FULL text before "!" so names with spaces work:
 *   "Transactions (2)!A1:A12 H1:H12" -> ["Transactions (2)"]
 */
export function getChartReferencedSheetNames(range: string): string[] {
    const value = text(range);
    const bangIndex = value.indexOf('!');

    if (bangIndex < 0) {
        return [];
    }

    let name = value.substring(0, bangIndex).trim();

    if (name.startsWith("'") && name.endsWith("'")) {
        name = name.substring(1, name.length - 1);
    }

    name = name.replace(/''/g, "'").trim();

    return name ? [name] : [];
}

export function readPixelValue(value: string, fallback: number): number {
    const parsed = Number.parseFloat(String(value ?? '').replace('px', ''));
    return Number.isFinite(parsed) ? parsed : Number(fallback ?? 0);
}



/** A parsed range such as 'Transactions'!A1:A40 */
export interface ParsedRange {
    sheetName: string;
    startColumn: string;
    endColumn: string;
    startColumnIndex: number;
    endColumnIndex: number;
    startRow: number;
    endRow: number;
}


