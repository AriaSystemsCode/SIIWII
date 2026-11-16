import { ChangeDetectorRef, Component, ElementRef, HostListener, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { SpreadsheetComponent } from '@syncfusion/ej2-angular-spreadsheet';
import jsPDF from 'jspdf';

import { AppComponentBase } from '@shared/common/app-component-base';
import { AppDashboardServiceProxy } from '@shared/service-proxies/service-proxies';

import { clone } from '../../models/spreadsheet.model';
import { DrilldownService } from '../../services/drilldown.service';
import { SpreadsheetPayload, SpreadsheetRefreshService } from '../../services/spreadsheet-refresh.service';
import { getWorkbookRoot } from '../../models/spreadsheet.utils';

import { firstValueFrom } from 'rxjs';
import * as moment from 'moment';

import {
    Chart,
    AccumulationChart
} from '@syncfusion/ej2-charts';
import { HttpClient } from '@angular/common/http';
import { L10n, setCulture } from '@syncfusion/ej2-base';
interface ChartExportItem {
    svg: SVGSVGElement;
    w: number;
    h: number;
    left: number;
    top: number;
}

@Component({
    selector: 'app-dashboard-detail',
    templateUrl: './dashboard-detail.component.html',
    styleUrls: ['./dashboard-detail.component.scss'],
    providers: [MessageService]
})
export class DashboardDetailComponent extends AppComponentBase implements OnInit, OnDestroy {

    @ViewChild('dashboardSpreadsheet') dashboardSpreadsheet?: SpreadsheetComponent;
    @ViewChild('dashboardExportArea') dashboardExportArea?: ElementRef<HTMLElement>;

    readonly dashboardSheetName = 'Dashboard';

    dashboardId = 1;
    dashboard: any;

    private saved: SpreadsheetPayload | null = null;

    // ---- State ----
    loading = false;
    refreshing = false;
    exportingPdf = false;
    dashboardWorkbookReady = false;
    dashboardLoadError = '';

    dashboardHasCharts = false;

    // ---- Visible spreadsheet ----
    dashboardSheets: any[] = [];
    dashboardActiveSheetIndex = 0;

    // ---- Mobile layout ----
    private readonly mobileBreakpoint = 768;
    private lastWidth = window.innerWidth;
    private resizeTimer?: any;
    private layoutTimers: any[] = [];

    // ---- Drilldown ----
    drilldownVisible = false;
    drilldownTitle = '';
    drilldownRecords: any[] = [];

    isArLang:boolean=false
currentLang:string=''

syncfusionLocale = 'en';
syncfusionRtl = false;
syncfusionLocaleReady = false;
dashboardNotFound = false;
    constructor(
        injector: Injector,
        private route: ActivatedRoute,
        private appDashboardService: AppDashboardServiceProxy,
        private refreshService: SpreadsheetRefreshService,
        private drilldown: DrilldownService,
            private http: HttpClient,
        private cdr: ChangeDetectorRef
    ) {
        super(injector);
    }

   async ngOnInit(): Promise<void> {
       this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
        this.currentLang == 'ar' || this.currentLang == 'ar-EG'  ? this.isArLang = true : this.isArLang = false
    const routeId = Number(
        this.route.snapshot.paramMap.get('id')
    );

    if (routeId > 0) {
        this.dashboardId = routeId;
    }

    await this.initializeSyncfusionLocale();

    this.loadDashboard();
}

    ngOnDestroy(): void {
        this.dashboardSheets = [];
        clearTimeout(this.resizeTimer);
        this.layoutTimers.forEach(t => clearTimeout(t));
    }

    private async initializeSyncfusionLocale(): Promise<void> {

    this.syncfusionLocaleReady = false;

    const language =
        abp.utils.getCookieValue('Abp.Localization.CultureName') ||
        abp.localization.currentLanguage?.name ||
        'en';

    const isArabic = language.toLowerCase().startsWith('ar');

    this.currentLang = language;
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

            console.log('[Dashboard] Syncfusion Arabic loaded');

        } catch (error) {

            console.error(
                '[Dashboard] Failed to load Arabic localization:',
                error
            );

            setCulture('en');

            this.syncfusionLocale = 'en';
            this.syncfusionRtl = false;
        }

    } else {

        setCulture('en');
        this.syncfusionLocale = 'en';

    }

    this.syncfusionLocaleReady = true;
    this.cdr.detectChanges();
}

   loadDashboard(): void {
    this.loading = true;
    this.showMainSpinner();

    this.dashboardNotFound = false;
    this.dashboardWorkbookReady = false;
    this.dashboardLoadError = '';
    this.dashboardSheets = [];
    this.dashboard = null;
    this.saved = null;

    this.appDashboardService
        .getDashboardForView(this.dashboardId)
        .subscribe({
            next: (result: any) => {
                try {
                    const dashboard = result?.dashboard ?? result;

                    // Dashboard does not exist
                    if (!dashboard || Number(dashboard.id) === 0) {
                        this.dashboardNotFound = true;
                        this.dashboardWorkbookReady = false;
                        this.dashboardSheets = [];
                        return;
                    }

                    // Valid dashboard
                    this.dashboard = dashboard;

                    this.saved = this.parseSaved(
                        this.dashboard?.spreadsheet
                    );

                    this.showWorkbook(this.saved);

                } catch (error) {
                    console.error(
                        '[Dashboard] Load failed:',
                        error
                    );

                    this.dashboardLoadError =
                        error instanceof Error
                            ? error.message
                            : this.l('UnableToLoadDashboard');

                    this.dashboardWorkbookReady = false;
                    this.dashboardSheets = [];

                } finally {
                    this.loading = false;
                    this.hideMainSpinner();
                    this.cdr.detectChanges();
                }
            },

            error: (error: any) => {
                console.error(
                    '[Dashboard] Dashboard API failed:',
                    error
                );

                if (error?.status === 404) {
                    this.dashboardNotFound = true;
                } else {
                    this.dashboardLoadError =
                        this.l('UnableToLoadDashboard');
                }

                this.dashboardWorkbookReady = false;
                this.loading = false;
                this.hideMainSpinner();
                this.cdr.detectChanges();
            }
        });
}

    private parseSaved(raw: any): SpreadsheetPayload {
        const saved = typeof raw === 'string' ? JSON.parse(raw) : raw;

        if (!saved?.workbookJson) {
            throw new Error('The saved Spreadsheet does not contain workbook data.');
        }

        return {
            workbookJson: saved.workbookJson,
            sheetDataSources: saved.sheetDataSources ?? [],
            sheetAnalyses: saved.sheetAnalyses ?? [],
            dashboardWidgets: saved.dashboardWidgets ?? [],
            updatedDate: saved.updatedDate ?? null,
            lastRefreshDate: saved.lastRefreshDate,
            refreshedBy: saved.refreshedBy
        };
    }

    /** Shows ONLY the Dashboard tab. */
    private showWorkbook(saved: SpreadsheetPayload): void {
        const sheets: any[] = getWorkbookRoot(saved.workbookJson)?.sheets;

        if (!Array.isArray(sheets) || !sheets.length) {
            throw new Error('The saved Spreadsheet does not contain any sheets.');
        }

        const index = this.findDashboardIndex(sheets);

        if (index < 0) {
            throw new Error(`Sheet "${this.dashboardSheetName}" was not found.`);
        }

        // Charts present => borderless dashboard look. No charts => normal cell borders.
        this.dashboardHasCharts = this.collectCharts(sheets[index]).length > 0;

        // Copy: Syncfusion mutates the models it receives.
        this.dashboardSheets = clone(sheets).map((sheet: any, i: number) => ({
            ...sheet,
            state: i === index ? 'Visible' : 'Hidden'
        }));

        this.dashboardActiveSheetIndex = index;
        this.dashboardWorkbookReady = true;
    }

    private findDashboardIndex(sheets: any[]): number {
        const wanted = this.dashboardSheetName.toLowerCase();
        return (sheets ?? []).findIndex(s => String(s?.name ?? '').trim().toLowerCase() === wanted);
    }

    onDashboardCreated(): void {
        const spreadsheet = this.dashboardSpreadsheet;
        const index = this.findDashboardIndex((spreadsheet?.sheets as any[]) ?? []);

        if (!spreadsheet) {
            return;
        }

        if (index < 0) {
            this.dashboardLoadError = `Sheet "${this.dashboardSheetName}" was not found.`;
            this.cdr.detectChanges();
            return;
        }

        (spreadsheet.sheets as any[]).forEach((sheet, i) => (sheet.state = i === index ? 'Visible' : 'Hidden'));
        spreadsheet.activeSheetIndex = index;

        setTimeout(() => {
            spreadsheet.activeSheetIndex = index;
            spreadsheet.refresh();
            this.scheduleMobileLayout();
        }, 0);
    }

    // =====================================================
    // MOBILE LAYOUT (one chart per row)
    // =====================================================

    private get isMobile(): boolean {
        return window.innerWidth <= this.mobileBreakpoint;
    }

    @HostListener('window:resize')
    onWindowResize(): void {
        // Mobile browsers fire resize when the address bar hides, so react only to width changes.
        if (window.innerWidth === this.lastWidth) {
            return;
        }

        this.lastWidth = window.innerWidth;

        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
            this.dashboardSpreadsheet?.refresh();   // restores the desktop positions
            this.scheduleMobileLayout();            // re-stacks them if now on mobile
        }, 300);
    }

    private scheduleMobileLayout(): void {
        this.layoutTimers.forEach(t => clearTimeout(t));

        // Charts render asynchronously, so apply a few times (the method is idempotent).
        this.layoutTimers = [400, 1000, 2000].map(delay =>
            setTimeout(() => this.applyMobileChartLayout(), delay)
        );
    }

    /** Mobile: stack every chart full-width, one per row. */
    private applyMobileChartLayout(): void {
        if (!this.isMobile || !this.dashboardHasCharts) {
            return;
        }

        const host = this.dashboardExportArea?.nativeElement;

        if (!host) {
            return;
        }

        const overlays = (Array.from(host.querySelectorAll('.e-ss-overlay')) as HTMLElement[])
            .filter(o => o.querySelector('.e-chart, .e-accumulationchart'));

        if (!overlays.length) {
            return;
        }

        // Remember the original desktop position so the order stays stable.
        overlays.forEach(o => {
            if (o.dataset.origTop === undefined) {
                o.dataset.origTop = String(parseFloat(o.style.top) || 0);
                o.dataset.origLeft = String(parseFloat(o.style.left) || 0);
            }
        });

        overlays.sort((a, b) =>
            (Number(a.dataset.origTop) - Number(b.dataset.origTop)) ||
            (Number(a.dataset.origLeft) - Number(b.dataset.origLeft))
        );

        const gap = 8;
        const content = host.querySelector('.e-sheet-content') as HTMLElement;
        const width = Math.floor((content?.clientWidth || host.clientWidth) - gap * 2);
        const height = 300;

        let top = gap;

        overlays.forEach(overlay => {
            overlay.style.left = `${gap}px`;
            overlay.style.top = `${top}px`;
            overlay.style.width = `${width}px`;
            overlay.style.height = `${height}px`;

            const chartEl: any = overlay.querySelector('.e-chart, .e-accumulationchart');
            const chart: any = chartEl?.ej2_instances?.[0];

            if (chart && (chart.width !== `${width - 2}px` || chart.height !== `${height - 2}px`)) {
                chart.width = `${width - 2}px`;
                chart.height = `${height - 2}px`;
                chart.refresh();
            }

            top += height + gap;
        });
    }

    // =====================================================
    // REFRESH (same pipeline as the editor)
    // =====================================================

    private updateRefreshInfo(state: SpreadsheetPayload): void {
        const user = this.appSession.user;


        const fullName = [
            user?.name,
            user?.surname
        ].filter(Boolean).join(' ');

        const now = moment.utc().format('YYYY-MM-DDTHH:mm:ss[Z]');

        state.lastRefreshDate = now;
        state.refreshedBy = `${fullName}`;
    }
    async refreshDashboard(): Promise<void> {
        if (this.refreshing || this.loading || !this.saved) {
            return;
        }

        this.refreshing = true;

        try {
            const refreshed = await this.refreshService.refresh(
                this.saved,
                {
                    tenantId: this.appSession.tenantId
                }
            );

            // Update the last successful refresh timestamp.
            this.updateRefreshInfo(refreshed);
            refreshed.updatedDate = refreshed.lastRefreshDate;

            // Count records from source metadata, not chart/helper rows.
            const recordCount = (refreshed.sheetDataSources ?? [])
                .reduce(
                    (total, source) =>
                        total + (source.sheetRecordIds?.length ?? 0),
                    0
                );

            // Persist the entire refreshed workbook.
            await firstValueFrom(
                this.appDashboardService.saveSpreadSheetJson(
                    this.dashboardId,
                    {
                        ...refreshed,
                        recordCount
                    } as any
                )
            );
            this.saved = refreshed;
            this.dashboard = {
                ...this.dashboard,
                spreadsheet: {
                    ...this.dashboard?.spreadsheet,
                    lastRefreshDate: refreshed.lastRefreshDate,
                    refreshedBy: refreshed.refreshedBy,
                    updatedDate: refreshed.updatedDate
                }
            };

            this.dashboardWorkbookReady = false;
            this.cdr.detectChanges();

            this.showWorkbook(this.saved);
            this.cdr.detectChanges();

            await new Promise<void>(
                resolve => setTimeout(resolve, 300)
            );

            this.dashboardSpreadsheet?.refresh();
            this.scheduleMobileLayout();

            this.notify.success(
                  this.l('DashboardRefreshedSuccessfully')
            );


        } catch (error) {
            console.error('[Dashboard] Refresh or save failed:', error);
          this.notify.error(
    this.l('DashboardRefreshFailed')
);
        } finally {
            this.refreshing = false;
            this.cdr.detectChanges();
        }
    }

    // =====================================================
    // DRILLDOWN
    // =====================================================


    onDashboardChartClick(event: MouseEvent): void {
        const result = this.drilldown.fromClick(event, {
            container: this.dashboardExportArea?.nativeElement,
            sheets: (this.dashboardSpreadsheet?.sheets as any[]) ?? [],
            analyses: this.saved?.sheetAnalyses ?? [],
            sheetName: this.dashboardSheetName
        });

        if (!result) {
            return;
        }

        if (!result.records.length) {
         this.notify.warn(
    this.l('NoMatchingSourceRecords')
);
            return;
        }

        this.drilldownTitle = result.title;
        this.drilldownRecords = result.records;
        this.drilldownVisible = true;

        this.cdr.detectChanges();
    }

    // =====================================================
    // PDF EXPORT
    //   - Dashboard has charts  => charts are exported (SVG -> PNG), fast
    //   - Dashboard has no charts => the cell data is exported as a table
    // =====================================================

    /** Collects every floating chart defined on a sheet. */
    private collectCharts(sheet: any): any[] {
        const charts: any[] = [];

        for (const row of sheet?.rows ?? []) {
            for (const cell of row?.cells ?? []) {
                if (Array.isArray(cell?.chart)) {
                    charts.push(...cell.chart);
                } else if (cell?.chart) {
                    charts.push(cell.chart);
                }
            }
        }

        return charts;
    }

    private get pdfFileName(): string {
        const name = String(this.dashboard?.title || 'Dashboard').replace(/[\\/:*?"<>|]/g, '_');
        return `${name}.pdf`;
    }


        async exportDashboardPdf(): Promise<void> {
        if (this.exportingPdf || !this.saved) {
            return;
        }

        this.exportingPdf = true;

        // stop the mobile layout from resizing/re-rendering charts while we capture them
        this.layoutTimers.forEach(t => clearTimeout(t));
        this.layoutTimers = [];
        clearTimeout(this.resizeTimer);

        this.cdr.detectChanges();

        // let the "Preparing PDF" overlay paint first
        await new Promise<void>(r => setTimeout(r, 50));

        try {
            const sheets: any[] = getWorkbookRoot(this.saved.workbookJson)?.sheets;
            const index = this.findDashboardIndex(sheets);

            if (index < 0) {
                throw new Error('Dashboard sheet not found.');
            }

            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const expectedCharts = this.collectCharts(sheets[index]).length;

            if (expectedCharts > 0) {
                await this.addChartsToPdf(pdf, expectedCharts);
            } else {
                this.addDataTableToPdf(pdf, sheets[index]);
            }

            pdf.save(this.pdfFileName);
        } catch (error) {
            console.error('Dashboard PDF export failed:', error);
            this.notify.error(
                this.l('DashboardPdfExportFailed')
            );
        } finally {
            this.exportingPdf = false;
            this.cdr.detectChanges();
        }
    }

    // ---------- charts ----------

    private svgToPng(svg: SVGSVGElement, width: number, height: number, scale = 2): Promise<string> {
        return new Promise((resolve, reject) => {
            const copy = svg.cloneNode(true) as SVGSVGElement;
            copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            copy.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
            copy.setAttribute('width', String(width));
            copy.setAttribute('height', String(height));

            if (!copy.getAttribute('viewBox')) {
                copy.setAttribute('viewBox', `0 0 ${width} ${height}`);
            }

            // make sure nothing is left invisible by an unfinished animation / hover state
            copy.querySelectorAll('[id$="_tooltip"], [id$="_Crosshair"], [id*="_Trackball"]').forEach(n => n.remove());

            const url = URL.createObjectURL(
                new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml;charset=utf-8' })
            );

            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(width * scale);
                canvas.height = Math.round(height * scale);

                const ctx = canvas.getContext('2d')!;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                URL.revokeObjectURL(url);
                resolve(canvas.toDataURL('image/png'));
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Chart image failed.'));
            };

            img.src = url;
        });
    }

    /** Reads every rendered chart currently in the dashboard (current on-screen position and size). */
    private collectChartItems(): ChartExportItem[] {
        const host = this.dashboardExportArea?.nativeElement;

        if (!host) {
            return [];
        }

        return (Array.from(host.querySelectorAll('.e-ss-overlay')) as HTMLElement[])
            .map((o): ChartExportItem | null => {
                const svg = o.querySelector('svg[id$="_svg"]') as SVGSVGElement | null;

                if (!svg || svg.childElementCount === 0) {
                    return null;
                }

                const box = svg.getBoundingClientRect();

                return {
                    svg,
                    w: Math.round(box.width),
                    h: Math.round(box.height),
                    left: parseFloat(o.style.left) || 0,
                    top: parseFloat(o.style.top) || 0
                };
            })
            .filter((x): x is ChartExportItem => !!x && x.w > 0 && x.h > 0)
            .sort((a, b) => (a.top - b.top) || (a.left - b.left));
    }

    /**
     * Waits until all charts exist and have stopped changing
     * (animations finished, no re-render in progress).
     */
    private async waitForChartsReady(expected: number, timeoutMs = 8000): Promise<ChartExportItem[]> {
        const started = Date.now();
        const serializer = new XMLSerializer();

        let lastSignature = '';
        let stableTicks = 0;

        while (Date.now() - started < timeoutMs) {
            const items = this.collectChartItems();

            const signature = items
                .map(i => `${i.w}x${i.h}@${i.left},${i.top}:${serializer.serializeToString(i.svg).length}`)
                .join('|');

            if (items.length >= expected && items.length > 0 && signature === lastSignature) {
                stableTicks++;

                if (stableTicks >= 2) {
                    return items;
                }
            } else {
                stableTicks = 0;
            }

            lastSignature = signature;
            await new Promise<void>(r => setTimeout(r, 250));
        }

        const items = this.collectChartItems();

        if (!items.length) {
            throw new Error('Charts are not rendered yet.');
        }

        return items;
    }

   private async addChartsToPdf(
    pdf: jsPDF,
    expectedCharts = 0
): Promise<void> {
    const host = this.dashboardExportArea?.nativeElement;

    if (!host || !this.saved) {
        throw new Error('Dashboard not ready.');
    }

    const sheets: any[] =
        getWorkbookRoot(this.saved.workbookJson)?.sheets ?? [];

    const index = this.findDashboardIndex(sheets);

    if (index < 0) {
        throw new Error('Dashboard sheet not found.');
    }

    const sheet = sheets[index];
    const items = await this.waitForChartsReady(expectedCharts);

    const margin = 8;
    const pageW = pdf.internal.pageSize.getWidth() - margin * 2;
    const pageH = pdf.internal.pageSize.getHeight() - margin * 2;

    const layoutW = Math.max(
        ...items.map(i => i.left + i.w)
    );

    const maxH = Math.max(...items.map(i => i.h));

    const k = Math.min(
        pageW / layoutW,
        0.35,
        pageH / maxH
    );

    let pageStartY = 0;

    // Draw the first page background.
    this.drawDashboardBackground(
        pdf, sheet, k, pageStartY,
        margin, pageW, pageH
    );

    for (const item of items) {
        const w = item.w * k;
        const h = item.h * k;
        const x = margin + item.left * k;

        let y = item.top * k - pageStartY;

        if (y + h > pageH) {
            pdf.addPage();

            pageStartY = item.top * k;
            y = 0;

            // Draw background on the new page.
            this.drawDashboardBackground(
                pdf, sheet, k, pageStartY,
                margin, pageW, pageH
            );
        }

        const png = await this.svgToPng(
            item.svg,
            item.w,
            item.h
        );

        pdf.addImage(
            png,
            'PNG',
            x,
            margin + y,
            w,
            h
        );
    }
}

    // ---------- data table (no charts) ----------

    private formatCellValue(cell: any): string {
        const value = cell?.value;

        if (value === undefined || value === null) {
            return '';
        }

        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
            const m = moment(value);
            return m.isValid() ? m.format('L') : value;
        }

        if (typeof value === 'number') {
            return String(Math.round(value * 100) / 100);
        }

        return String(value);
    }

    /** Builds a dense grid from the sparse saved rows/cells (skips hidden and empty rows/columns). */
    private buildSheetGrid(sheet: any): string[][] {
        const rows: string[][] = [];
        let r = 0;

        for (const row of sheet?.rows ?? []) {
            if (row?.index !== undefined) {
                r = row.index;
            }

            if (!row?.hidden) {
                const line: string[] = [];
                let c = 0;

                for (const cell of row?.cells ?? []) {
                    if (cell?.index !== undefined) {
                        c = cell.index;
                    }

                    if (!sheet?.columns?.[c]?.hidden) {
                        line[c] = this.formatCellValue(cell);
                    }

                    c++;
                }

                rows[r] = line;
            }

            r++;
        }

        const filled: string[][] = [];

        for (let i = 0; i < rows.length; i++) {
            if (rows[i]?.some(v => v !== undefined && v !== '')) {
                filled.push(rows[i]);
            }
        }

        // keep only columns that have at least one value
        const usedCols = new Set<number>();
        filled.forEach(line => line.forEach((v, c) => {
            if (v !== undefined && v !== '') {
                usedCols.add(c);
            }
        }));

        const cols = Array.from(usedCols).sort((a, b) => a - b);

        return filled.map(line => cols.map(c => line[c] ?? ''));
    }

    private addDataTableToPdf(pdf: jsPDF, sheet: any): void {
        const grid = this.buildSheetGrid(sheet);

        if (!grid.length || !grid[0].length) {
            throw new Error('The Dashboard tab has no data to export.');
        }

        const margin = 10;
        const pageW = pdf.internal.pageSize.getWidth() - margin * 2;
        const pageH = pdf.internal.pageSize.getHeight() - margin * 2;
        const fontSize = 8;
        const rowH = 6;
        const pad = 2;
        const maxColW = 70;
        const titleH = 10;

        pdf.setFontSize(fontSize);

        // column widths from the widest text (header is bold, so measure it bold)
        const colCount = grid[0].length;
        const widths: number[] = [];

        for (let c = 0; c < colCount; c++) {
            let w = 12;

            grid.forEach((line, r) => {
                pdf.setFont('helvetica', r === 0 ? 'bold' : 'normal');
                w = Math.max(w, pdf.getTextWidth(line[c] ?? '') + pad * 2);
            });

            widths.push(Math.min(w, maxColW));
        }

        // split columns into page-wide groups
        const groups: number[][] = [];
        let group: number[] = [];
        let used = 0;

        widths.forEach((w, c) => {
            if (group.length && used + w > pageW) {
                groups.push(group);
                group = [];
                used = 0;
            }
            group.push(c);
            used += w;
        });

        if (group.length) {
            groups.push(group);
        }

        const header = grid[0];
        const body = grid.slice(1);
        const rowsPerPage = Math.max(1, Math.floor((pageH - titleH - rowH) / rowH));

        const fit = (text: string, width: number): string => {
            const maxW = width - pad * 2;

            if (pdf.getTextWidth(text) <= maxW) {
                return text;
            }

            let t = text;

            while (t.length > 1 && pdf.getTextWidth(t + '...') > maxW) {
                t = t.slice(0, -1);
            }

            return t + '...';
        };

        let firstPage = true;

        groups.forEach(cols => {
            for (let start = 0; start < Math.max(body.length, 1); start += rowsPerPage) {
                if (!firstPage) {
                    pdf.addPage();
                }
                firstPage = false;

                let y = margin;

                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(12);
                pdf.text(String(this.dashboard?.title || 'Dashboard'), margin, y + 4);
                pdf.setFontSize(fontSize);
                y += titleH;

                const drawRow = (line: string[], isHeader: boolean) => {
                    let x = margin;

                    cols.forEach(c => {
                        const w = widths[c];

                        if (isHeader) {
                            pdf.setFillColor(243, 234, 246);
                            pdf.rect(x, y, w, rowH, 'FD');
                        } else {
                            pdf.rect(x, y, w, rowH, 'S');
                        }

                        pdf.setFont('helvetica', isHeader ? 'bold' : 'normal');
                        pdf.text(fit(line[c] ?? '', w), x + pad, y + rowH - 2);
                        x += w;
                    });

                    y += rowH;
                };

                pdf.setDrawColor(200, 200, 200);
                drawRow(header, true);
                body.slice(start, start + rowsPerPage).forEach(line => drawRow(line, false));
            }
        });
    }


    private drawDashboardBackground(
    pdf: jsPDF,
    sheet: any,
    scale: number,
    pageStartY: number,
    margin: number,
    pageW: number,
    pageH: number
): void {
    const rows = sheet?.rows ?? [];
    const columns = sheet?.columns ?? [];

    const defaultRowHeight = sheet?.standardHeight || 20;
    const defaultColWidth = sheet?.standardWidth || 64;

    const rowPositions: number[] = [];
    const colPositions: number[] = [];

    const getRowTop = (index: number): number => {
        for (let i = rowPositions.length; i <= index; i++) {
            rowPositions[i] = i === 0
                ? 0
                : rowPositions[i - 1] +
                  (rows[i - 1]?.height ?? defaultRowHeight);
        }
        return rowPositions[index];
    };

    const getColLeft = (index: number): number => {
        for (let i = colPositions.length; i <= index; i++) {
            colPositions[i] = i === 0
                ? 0
                : colPositions[i - 1] +
                  (columns[i - 1]?.width ?? defaultColWidth);
        }
        return colPositions[index];
    };

    let rowIndex = 0;

    for (const row of rows) {
        if (row?.index !== undefined) {
            rowIndex = row.index;
        }

        if (row?.hidden) {
            rowIndex++;
            continue;
        }

        let colIndex = 0;

        for (const cell of row?.cells ?? []) {
            if (cell?.index !== undefined) {
                colIndex = cell.index;
            }

            const color = cell?.style?.backgroundColor;

            if (!color || columns[colIndex]?.hidden) {
                colIndex++;
                continue;
            }

            const rgb = this.pdfColorToRgb(color);

            if (!rgb) {
                colIndex++;
                continue;
            }

            const cellX = getColLeft(colIndex) * scale;
            const cellY = getRowTop(rowIndex) * scale - pageStartY;

            const cellW =
                (columns[colIndex]?.width ?? defaultColWidth) * scale;

            const cellH =
                (row?.height ?? defaultRowHeight) * scale;

            // Clip the cell to the current PDF page.
            const left = Math.max(0, cellX);
            const top = Math.max(0, cellY);
            const right = Math.min(pageW, cellX + cellW);
            const bottom = Math.min(pageH, cellY + cellH);

            if (right > left && bottom > top) {
                pdf.setFillColor(rgb[0], rgb[1], rgb[2]);

                pdf.rect(
                    margin + left,
                    margin + top,
                    right - left,
                    bottom - top,
                    'F'
                );
            }

            colIndex++;
        }

        rowIndex++;
    }
}

private pdfColorToRgb(
    color: string
): [number, number, number] | null {
    const value = color.trim();

    const hex = value.match(
        /^#([0-9a-f]{3}|[0-9a-f]{6})$/i
    );

    if (hex) {
        let code = hex[1];

        if (code.length === 3) {
            code = code.split('').map(c => c + c).join('');
        }

        return [
            parseInt(code.substring(0, 2), 16),
            parseInt(code.substring(2, 4), 16),
            parseInt(code.substring(4, 6), 16)
        ];
    }

    const rgb = value.match(
        /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i
    );

    if (rgb) {
        return [
            Number(rgb[1]),
            Number(rgb[2]),
            Number(rgb[3])
        ];
    }

    return null;
}
}