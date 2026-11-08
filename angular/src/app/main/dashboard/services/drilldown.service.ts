import { Injectable } from '@angular/core';
import { Chart, AccumulationChart } from '@syncfusion/ej2-charts';

import { text } from '../models/spreadsheet.model';
import {getCellValue, getSheetCharts, parseRange,  removeSheetFromRange } from '../models/spreadsheet.utils';

export interface DrilldownContext {
    container: HTMLElement | null | undefined;
    sheets: any[];
    analyses: any[];
    sheetName: string;
}

export interface DrilldownResult {
    title: string;
    records: any[];
}

@Injectable({ providedIn: 'root' })
export class DrilldownService {

  
fromClick(event: MouseEvent, ctx: DrilldownContext): DrilldownResult | null {
    const target = event.target as Element | null;

    if (!target) {
        return null;
    }

    const pointElement = target.closest(
        '[id*="_Series_"][id*="_Point_"], ' +
        '[id*="_Series_"][id*="_DataLabel_"]'
    ) as Element | null;

    if (!pointElement) {
        return null;
    }

    const match = pointElement.id.match(
        /_Series_(\d+)_Point_(\d+)/i
    );

    const chartElement = pointElement.closest(
        '.e-chart, .e-accumulationchart'
    ) as HTMLElement | null;

    if (!chartElement) {
        return null;
    }

    const instances = (chartElement as any).ej2_instances ?? [];

    const instance = instances.find((item: any) =>
        item instanceof Chart ||
        item instanceof AccumulationChart ||
        (
            item.element &&
            (
                Array.isArray(item.visibleSeries) ||
                Array.isArray(item.series)
            )
        )
    );

    if (!instance) {
        console.warn('[Drilldown] Chart instance not found.');
        return null;
    }

    let point: any = null;

    if (match) {
        const seriesIndex = Number(match[1]);
        const pointIndex = Number(match[2]);

       const series =
    (instance as any).visibleSeries?.[seriesIndex];

point = series?.points?.[pointIndex];

        point = series?.points?.[pointIndex];
    }

    // Pie charts can use a single accumulation series.
    if (!point && instance instanceof AccumulationChart) {
        const pieMatch = pointElement.id.match(/_Point_(\d+)/i);
        const pointIndex = pieMatch ? Number(pieMatch[1]) : -1;

        if (pointIndex >= 0) {
          point =
    (instance as any).visibleSeries?.[0]?.points?.[pointIndex];
        }
    }

    if (!point) {
        console.warn('[Drilldown] Clicked chart point not found.', {
            elementId: pointElement.id
        });
        return null;
    }

    const chart = this.findChartModel(chartElement, ctx);

    if (!chart) {
        console.warn('[Drilldown] Saved chart model not found.', {
            chartElementId: chartElement.id
        });
        return null;
    }

    const category = point.x;

    return {
        title: `${category} - Details`,
        records: this.resolveRecords(chart, category, ctx)
    };
}


    // -----------------------------------------------------
    // Chart element -> chart model
    // -----------------------------------------------------

 
private findChartModel(
    chartElement: HTMLElement,
    ctx: DrilldownContext
): any | null {

    const overlay = chartElement.closest(
        '.e-datavisualization-chart'
    ) as HTMLElement | null;

    const ids = [
        chartElement.id,
        overlay?.id,
        overlay?.querySelector('.e-control')?.id
    ].map(id => text(id)).filter(Boolean);

    const all = ctx.sheets.flatMap(sheet => getSheetCharts(sheet));

    const byId = all.find(chart =>
        ids.includes(text(chart?.id))
    );

    if (byId) {
        return byId;
    }

    // Match rendered chart order against saved Dashboard chart order.
    const container = ctx.container;

    const sheet = ctx.sheets.find(
        s => text(s?.name) === ctx.sheetName
    );

    if (!container || !sheet || !overlay) {
        return null;
    }

    const rendered = Array.from(
        container.querySelectorAll('.e-datavisualization-chart')
    ) as HTMLElement[];

    const renderedCharts = rendered
        .filter(el =>
            !!el.querySelector(
                '.e-chart, .e-accumulationchart'
            )
        )
        .map(el => ({
            el,
            top: el.getBoundingClientRect().top,
            left: el.getBoundingClientRect().left
        }))
        .sort((a, b) =>
            (a.top - b.top) || (a.left - b.left)
        );

    const savedCharts = getSheetCharts(sheet)
        .map(chart => ({
            chart,
            top: Number(chart.top) || 0,
            left: Number(chart.left) || 0
        }))
        .sort((a, b) =>
            (a.top - b.top) || (a.left - b.left)
        );

    const index = renderedCharts.findIndex(
        item => item.el === overlay
    );

    return index >= 0
        ? savedCharts[index]?.chart ?? null
        : null;
}


    // -----------------------------------------------------
    // Chart model -> source records
    // -----------------------------------------------------

    private resolveRecords(chart: any, category: any, ctx: DrilldownContext): any[] {
        const range = removeSheetFromRange(chart.range).toLowerCase();

        const analysis = ctx.analyses.find(
            a =>
                (!!text(a.dashboardChartId) && text(a.dashboardChartId) === text(chart.id)) ||
                (!!text(a.dashboardDataRange) && text(a.dashboardDataRange).toLowerCase() === range)
        );

        return analysis ? this.pivotRecords(analysis, category, ctx) : this.directRecords(chart, category, ctx);
    }

    /** Pivot with exactly one row field (and no column fields). */
    private pivotRecords(analysis: any, category: any, ctx: DrilldownContext): any[] {
        const rows = analysis.pivot?.rows ?? [];
        const columns = analysis.pivot?.columns ?? [];

        if (rows.length !== 1 || columns.length) {
            console.warn('[Drilldown] Only Pivots with one row field and no columns are supported.');
            return [];
        }

        return this.filterRecords(this.sourceRecords(ctx, text(analysis.sourceSheetName)), rows[0].name, category);
    }

    /** Chart that reads a data sheet directly, or through an aggregation helper block. */

private directRecords(
    chart: any,
    category: any,
    ctx: DrilldownContext
): any[] {

    const categoryReference = parseRange(
        text(chart.categoryRange)
    );

    const originalReference = parseRange(
        text(chart.originalRange)
    );

    const reference =
        categoryReference ??
        originalReference ??
        parseRange(text(chart.range));

    if (!reference) {
        return [];
    }

    const sheetName = reference.sheetName;

    const sheet = ctx.sheets.find(
        s => text(s?.name).toLowerCase() === sheetName.toLowerCase()
    );

    if (!sheet) {
        return [];
    }

    const categoryColumn = categoryReference
        ? categoryReference.startColumnIndex
        : reference.startColumnIndex;

    const field = text(
        getCellValue(sheet, 0, categoryColumn)
    ).trim();

    // Limit source columns to the original dataset.
    // Do not limit source rows to originalRange, because refresh
    // may have added new records after the chart was created.
    const maxColumnIndex = originalReference
        ? originalReference.endColumnIndex
        : categoryColumn;

    const records = this.sourceRecords(
        ctx,
        sheetName,
        maxColumnIndex
    );

    if (!field) {
        console.warn('[Drilldown] Category field not found.');
        return [];
    }

    const matching = this.filterRecords(
        records,
        field,
        category
    );

    console.log('[Drilldown]', {
        category,
        field,
        totalSourceRecords: records.length,
        matchingRecords: matching.length
    });

    return matching;
}


    private filterRecords(records: any[], field: string, category: any): any[] {
        const wanted = String(category ?? '').trim();
        return records.filter(record => String(record[field] ?? '').trim() === wanted);
    }

    /** Row 1 = headers, every other non-empty row = one record. */
  
private sourceRecords(
    ctx: DrilldownContext,
    sheetName: string,
    maxColumnIndex?: number
): any[] {

    const sheet = ctx.sheets.find(
        s =>
            text(s?.name).toLowerCase() ===
            sheetName.toLowerCase()
    );

    if (!sheet) {
        return [];
    }

    const headerCells = sheet.rows?.[0]?.cells ?? [];

    const limit = maxColumnIndex !== undefined
        ? Math.min(maxColumnIndex, headerCells.length - 1)
        : headerCells.length - 1;

    const fields: Array<{
        name: string;
        index: number;
    }> = [];

    const seen = new Set<string>();

    for (let c = 0; c <= limit; c++) {

        const name = text(
            getCellValue(sheet, 0, c)
        ).trim();

        if (!name) {
            continue;
        }

        const key = name.toLowerCase();

        // Prevent helper columns from overwriting source fields.
        if (seen.has(key)) {
            continue;
        }

        seen.add(key);

        fields.push({
            name,
            index: c
        });
    }

    const records: any[] = [];

    for (let r = 1; r < (sheet.rows?.length ?? 0); r++) {

        const record: any = {};

        let hasData = false;

        for (const field of fields) {

            const value = getCellValue(
                sheet,
                r,
                field.index
            );

            record[field.name] = value ?? null;

            if (
                value !== null &&
                value !== undefined &&
                value !== ''
            ) {
                hasData = true;
            }
        }

        if (hasData) {
            records.push(record);
        }
    }

    return records;
}

fromPoint(
    chartElement: HTMLElement,
    category: any,
    ctx: DrilldownContext
): DrilldownResult | null {

    const chart = this.findChartModel(
        chartElement,
        ctx
    );

    if (!chart) {
        console.warn(
            '[Drilldown] Chart model not found.'
        );
        return null;
    }

    const records = this.resolveRecords(
        chart,
        category,
        ctx
    );

    return {
        title: `${category} - Details`,
        records
    };
}

}