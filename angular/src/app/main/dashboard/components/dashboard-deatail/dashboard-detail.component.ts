import {
    ChangeDetectorRef,
    Component,
    Injector,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';

import {
    ActivatedRoute
} from '@angular/router';

import {
    MenuItem,
    MessageService
} from 'primeng/api';

import {
    AppComponentBase
} from '@shared/common/app-component-base';

import {
    SpreadsheetComponent
} from '@syncfusion/ej2-angular-spreadsheet';


// =====================================================
// INTERFACES
// =====================================================

interface UserRef {
    id: number;
    displayName: string;
    avatarUrl?: string | null;
    email?: string;
}


interface ShareEntry {
    user: UserRef;
    permissionFlags: number;
}


interface DashboardDto {
    id: number;
    title: string;
    owner: UserRef;
    updatedAt: Date;
    lastViewedAt?: Date | null;
    shares: ShareEntry[];
}


interface SavedSpreadsheet {
    id: number;
    name: string;

    createdDate?: string;
    updatedDate?: string;

    recordCount?: number;

    workbookJson: any;

    sheetDataSources?: any[];
    sheetAnalyses?: any[];

    // Saved by appTransBrowse.
    dashboardWidgets?: DashboardWidgetMetadata[];
}


interface DashboardWidgetMetadata {
    id: number;
    dashboardSheetName: string;

    chartId?: string;
    chartTitle?: string;
    chartType?: string;

    sourceType: 'DIRECT' | 'PIVOT';

    sourceSheetId?: number;
    sourceSheetName: string;

    sourceRange?: string;

    analysisId?: number;
    dashboardDataRange?: string;
}


interface DashboardWidgetPosition {
    left: number;
    top: number;
}


// =====================================================
// COMPONENT
// =====================================================

@Component({
    selector: 'app-dashboard-detail',

    templateUrl:
        './dashboard-detail.component.html',

    styleUrls: [
        './dashboard-detail.component.scss'
    ],

    providers: [
        MessageService
    ]
})
export class DashboardDetailComponent
    extends AppComponentBase
    implements OnInit, OnDestroy {


    // =====================================================
    // SPREADSHEET
    // =====================================================

    @ViewChild('dashboardSpreadsheet')
    dashboardSpreadsheet?: SpreadsheetComponent;


    /**
     * Sheet that should be displayed in Dashboard Details.
     */
    readonly dashboardSheetName =
        'Dashboard';


    /**
     * POC:
     *
     * For now Dashboard Details will load this specific
     * saved Spreadsheet.
     *
     * Transaction Spreadsheet 3
     */
    readonly pocSpreadsheetId =
        1789422155310;


    /**
     * IMPORTANT:
     *
     * We keep ALL workbook sheets here.
     *
     * We do NOT keep only Dashboard because:
     *
     * Dashboard charts/formulas may reference:
     *
     * Transactions
     * Transactions (2)
     * Pivot/helper sheets
     * etc.
     *
     * Only Dashboard becomes active/visible.
     */
    dashboardSheets: any[] = [];


    /**
     * Index of Dashboard inside the original workbook.
     */
    dashboardActiveSheetIndex = 0;


    // =====================================================
    // STATE
    // =====================================================

    loading = false;

    refreshing = false;

    dashboardWorkbookReady = false;

    dashboardLoadError = '';

    // Dashboard chart -> source-tab metadata saved by appTransBrowse.
    dashboardWidgets: DashboardWidgetMetadata[] = [];

    // Only one chart is refreshed at a time.
    refreshingWidgetId: number | null = null;

    // Latest saved Spreadsheet currently displayed.
    private loadedSpreadsheet: SavedSpreadsheet | null = null;


    // =====================================================
    // IDS
    // =====================================================

    dashboardId = 1;


    sourceSpreadsheetId:
        number | null = null;


    // =====================================================
    // UI
    // =====================================================

    defaultAvatar =
        'assets/common/images/default-profile-picture.png';


    dashboard: DashboardDto = {

        id: 1,

        title: 'Dashboard',

        owner: {
            id: 101,
            displayName: 'Menna',
            avatarUrl: null
        },

        updatedAt:
            new Date(),

        lastViewedAt:
            new Date(),

        shares: []
    };


    actionsMenuItems:
        MenuItem[] = [];


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    constructor(

        injector: Injector,

        private route:
            ActivatedRoute,

        private messageService:
            MessageService,

        private cdr:
            ChangeDetectorRef

    ) {

        super(injector);

    }


    // =====================================================
    // INIT
    // =====================================================

    ngOnInit(): void {

        const routeId =
            Number(
                this.route
                    .snapshot
                    .paramMap
                    .get('id')
            );


        if (
            Number.isFinite(routeId) &&
            routeId > 0
        ) {

            this.dashboardId =
                routeId;

        }


        this.buildActionsMenu();

        this.loadDashboard();

    }


    // =====================================================
    // DESTROY
    // =====================================================

    ngOnDestroy(): void {

        this.dashboardSheets = [];
        this.dashboardWidgets = [];
        this.loadedSpreadsheet = null;

    }


    // =====================================================
    // LOAD DASHBOARD
    // =====================================================

    private loadDashboard(): void {

        this.loading = true;

        this.dashboardWorkbookReady =
            false;

        this.dashboardLoadError =
            '';

        this.dashboardSheets =
            [];

        this.dashboardWidgets =
            [];

        this.loadedSpreadsheet =
            null;


        try {

            // =============================================
            // 1. GET SPECIFIC SAVED SPREADSHEET
            // =============================================

            const saved =
                this.getSavedSpreadsheetForDashboard();


            console.log(
                '[Dashboard] Saved spreadsheet:',
                saved
            );


            if (!saved) {

                throw new Error(
                    `Spreadsheet #${this.pocSpreadsheetId} was not found.`
                );

            }


            if (!saved.workbookJson) {

                throw new Error(
                    'The saved Spreadsheet does not contain workbook data.'
                );

            }


            // =============================================
            // 2. DASHBOARD WIDGET METADATA
            // =============================================

            this.loadedSpreadsheet =
                saved;

            this.dashboardWidgets =
                JSON.parse(
                    JSON.stringify(
                        saved.dashboardWidgets ?? []
                    )
                );

            console.log(
                '[Dashboard] Widget dependencies:',
                this.dashboardWidgets
            );


            // =============================================
            // 3. GET WORKBOOK
            // =============================================

            const workbook =
                this.getWorkbook(
                    saved.workbookJson
                );


            if (
                !workbook ||
                !Array.isArray(
                    workbook.sheets
                ) ||
                !workbook.sheets.length
            ) {

                throw new Error(
                    'The saved Spreadsheet does not contain any sheets.'
                );

            }


            console.log(
                '[Dashboard] Workbook sheets:',
                workbook.sheets.map(
                    (sheet: any) =>
                        sheet?.name
                )
            );


            // =============================================
            // 3. FIND DASHBOARD SHEET
            // =============================================

            const dashboardIndex =
                this.findDashboardSheetIndex(
                    workbook.sheets
                );


            console.log(
                '[Dashboard] Dashboard index:',
                dashboardIndex
            );


            if (dashboardIndex < 0) {

                throw new Error(
                    `Sheet "${this.dashboardSheetName}" was not found in Spreadsheet #${saved.id}.`
                );

            }


            // =============================================
            // 4. KEEP ALL SHEETS
            // =============================================
            //
            // DO NOT:
            //
            // this.dashboardSheets = [
            //     workbook.sheets[dashboardIndex]
            // ];
            //
            // Dashboard charts/formulas may depend on
            // other sheets.
            // =============================================

            this.dashboardSheets =
                workbook.sheets;


            // =============================================
            // 5. DASHBOARD IS ACTIVE SHEET
            // =============================================

            this.dashboardActiveSheetIndex =
                dashboardIndex;


            // =============================================
            // 6. METADATA
            // =============================================

            this.sourceSpreadsheetId =
                Number(
                    saved.id
                );


            this.dashboard.id =
                Number(
                    saved.id
                );


            this.dashboard.title =
                saved.name ||
                'Dashboard';


            this.dashboard.updatedAt =
                this.toDate(

                    saved.updatedDate ??

                    saved.createdDate

                );


            this.dashboard.lastViewedAt =
                new Date();


            // =============================================
            // 7. RENDER SPREADSHEET
            // =============================================

            this.loading =
                false;


            this.dashboardWorkbookReady =
                true;


            this.cdr.detectChanges();


            console.log(
                '[Dashboard] Workbook ready',
                {
                    spreadsheetId:
                        this.sourceSpreadsheetId,

                    dashboardIndex:
                        this.dashboardActiveSheetIndex,

                    dashboardName:
                        this.dashboardSheets[
                            this.dashboardActiveSheetIndex
                        ]?.name,

                    sheets:
                        this.dashboardSheets.map(
                            (sheet: any) =>
                                sheet?.name
                        )
                }
            );


        } catch (error) {

            console.error(
                '[Dashboard] Load failed:',
                error
            );


            this.dashboardLoadError =
                error instanceof Error
                    ? error.message
                    : 'Unable to load the dashboard.';


            this.dashboardWorkbookReady =
                false;


            this.loading =
                false;


            this.dashboardSheets =
                [];

            this.dashboardWidgets =
                [];

            this.loadedSpreadsheet =
                null;


            this.cdr.detectChanges();

        }

    }


    // =====================================================
    // SPREADSHEET CREATED
    // =====================================================

    /**
     * Angular has now created the actual Syncfusion
     * Spreadsheet instance.
     *
     * We search AGAIN inside the actual Spreadsheet
     * instance and force Dashboard to be active.
     *
     * This avoids depending only on the Angular
     * [activeSheetIndex] input timing.
     */
    onDashboardCreated(): void {

        if (!this.dashboardSpreadsheet) {

            return;

        }


        const sheets =
            this.dashboardSpreadsheet.sheets;


        if (
            !Array.isArray(sheets) ||
            !sheets.length
        ) {

            console.warn(
                '[Dashboard] Spreadsheet created without sheets.'
            );

            return;

        }


        console.log(
            '[Dashboard] Syncfusion sheets:',
            sheets.map(
                (sheet: any) =>
                    sheet?.name
            )
        );


        // =============================================
        // FIND DASHBOARD INSIDE ACTUAL COMPONENT
        // =============================================

        const dashboardIndex =
            this.findDashboardSheetIndex(
                sheets
            );


        console.log(
            '[Dashboard] Syncfusion Dashboard index:',
            dashboardIndex
        );


        if (dashboardIndex < 0) {

            this.dashboardLoadError =
                `Sheet "${this.dashboardSheetName}" was not found.`;

            this.cdr.detectChanges();

            return;

        }


        // =============================================
        // FORCE DASHBOARD ACTIVE
        // =============================================

        this.dashboardActiveSheetIndex =
            dashboardIndex;


        this.dashboardSpreadsheet
            .activeSheetIndex =
            dashboardIndex;


        /*
         * Refresh Spreadsheet UI after changing
         * active sheet.
         */
        setTimeout(
            () => {

                if (
                    !this.dashboardSpreadsheet
                ) {

                    return;

                }


                this.dashboardSpreadsheet
                    .activeSheetIndex =
                    dashboardIndex;


                this.dashboardSpreadsheet
                    .refresh();


                console.log(
                    '[Dashboard] Active sheet:',
                    this.dashboardSpreadsheet
                        .sheets[
                            this.dashboardSpreadsheet
                                .activeSheetIndex
                        ]?.name
                );

            },
            0
        );

    }


    // =====================================================
    // FIND DASHBOARD SHEET
    // =====================================================

    private findDashboardSheetIndex(
        sheets: any[]
    ): number {


        if (
            !Array.isArray(sheets)
        ) {

            return -1;

        }


        return sheets.findIndex(

            (sheet: any) =>

                String(
                    sheet?.name ?? ''
                )
                    .trim()
                    .toLowerCase() ===

                this.dashboardSheetName
                    .trim()
                    .toLowerCase()

        );

    }


    // =====================================================
    // REFRESH DASHBOARD
    // =====================================================

    refreshDashboard(): void {

        if (this.refreshing) {

            return;

        }


        this.refreshing =
            true;


        // Destroy current viewer.
        this.dashboardWorkbookReady =
            false;


        this.dashboardSheets =
            [];


        this.cdr.detectChanges();


        setTimeout(
            () => {

                try {

                    this.loadDashboard();


                    this.messageService.add({
                        severity:
                            'success',

                        summary:
                            'Refreshed',

                        detail:
                            'Dashboard reloaded from the latest saved Spreadsheet.'
                    });


                } finally {

                    this.refreshing =
                        false;

                    this.cdr.detectChanges();

                }

            },
            0
        );

    }


    // =====================================================
    // DASHBOARD WIDGET REFRESH
    // =====================================================

    trackDashboardWidget(
        _index: number,
        widget: DashboardWidgetMetadata
    ): number {

        return widget.id;

    }


    /**
     * Returns the native chart position inside the Dashboard sheet.
     * The button is placed at the chart's top-right corner.
     */
    widgetPosition(
        widget: DashboardWidgetMetadata
    ): DashboardWidgetPosition | null {

        const chart =
            this.findDashboardChart(
                widget
            );

        if (!chart) {
            return null;
        }

        const left =
            Number(
                chart.left ?? 0
            );

        const top =
            Number(
                chart.top ?? 0
            );

        const width =
            Number(
                chart.width ?? 480
            );

        return {
            left:
                Math.max(
                    4,
                    left + width - 36
                ),
            top:
                Math.max(
                    4,
                    top + 6
                )
        };

    }


    async refreshDashboardWidget(
        widget: DashboardWidgetMetadata,
        event?: Event
    ): Promise<void> {

        event?.preventDefault();
        event?.stopPropagation();

        if (
            this.refreshing ||
            this.refreshingWidgetId !== null
        ) {
            return;
        }

        if (!this.dashboardSpreadsheet) {

            this.messageService.add({
                severity: 'warn',
                summary: 'Dashboard',
                detail: 'Dashboard Spreadsheet is not ready.'
            });

            return;
        }

        this.refreshingWidgetId =
            widget.id;

        this.cdr.detectChanges();

        try {

            console.log(
                '[Dashboard Widget Refresh]',
                widget
            );

            if (
                widget.sourceType ===
                'DIRECT'
            ) {

                await this.refreshDirectDashboardWidget(
                    widget
                );

            } else {

                await this.refreshPivotDashboardWidget(
                    widget
                );

            }

            this.dashboardSpreadsheet.refresh();

            this.dashboard.updatedAt =
                new Date();

            this.messageService.add({
                severity: 'success',
                summary: 'Chart refreshed',
                detail:
                    `${widget.chartTitle || 'Chart'} refreshed from ` +
                    `${widget.sourceSheetName}.`
            });

        } catch (error) {

            console.error(
                '[Dashboard Widget Refresh] failed:',
                error
            );

            this.messageService.add({
                severity: 'error',
                summary: 'Refresh failed',
                detail:
                    error instanceof Error
                        ? error.message
                        : 'Unable to refresh this chart.'
            });

        } finally {

            this.refreshingWidgetId =
                null;

            this.cdr.detectChanges();

        }

    }


    /**
     * DIRECT chart:
     *
     * The native Dashboard chart already points to sourceRange.
     * We refresh/recalculate only the source sheet that owns that range.
     *
     * IMPORTANT:
     * This Dashboard component currently has no transaction API service.
     * Therefore this method updates the chart from the latest source values
     * already present in the loaded workbook. When the BE refresh service is
     * connected here, replace refreshSourceSheetFromBackend() only.
     */
    private async refreshDirectDashboardWidget(
        widget: DashboardWidgetMetadata
    ): Promise<void> {

        await this.refreshSourceSheetFromBackend(
            widget
        );

        this.recalculateSourceAndDashboard(
            widget
        );

    }


    /**
     * PIVOT chart:
     *
     * source tab -> saved analysis -> Dashboard helper range -> native chart.
     *
     * The dependency is explicit, so no other Dashboard chart is selected.
     */
    private async refreshPivotDashboardWidget(
        widget: DashboardWidgetMetadata
    ): Promise<void> {

        const analysis =
            this.loadedSpreadsheet
                ?.sheetAnalyses
                ?.find(
                    (item: any) =>
                        Number(
                            item?.id
                        ) ===
                        Number(
                            widget.analysisId
                        )
                );

        if (!analysis) {

            throw new Error(
                `Pivot analysis for "${widget.chartTitle || 'chart'}" was not found.`
            );

        }

        await this.refreshSourceSheetFromBackend(
            widget
        );

        /*
         * At this point the correct Pivot definition is known:
         *
         * analysis.pivot
         * widget.sourceSheetName
         * widget.dashboardDataRange
         *
         * Rebuilding Pivot helper values requires the same Pivot engine used
         * by appTransBrowse. We intentionally do NOT refresh every Pivot/chart.
         *
         * Until that shared Pivot refresh service is extracted, calculate()
         * keeps workbook formulas/native direct dependencies current while
         * preserving all unrelated widgets.
         */
        this.recalculateSourceAndDashboard(
            widget
        );

        console.log(
            '[Dashboard Widget Refresh] Pivot dependency:',
            {
                widgetId:
                    widget.id,
                analysisId:
                    widget.analysisId,
                sourceSheet:
                    widget.sourceSheetName,
                dashboardDataRange:
                    widget.dashboardDataRange,
                pivot:
                    analysis.pivot
            }
        );

    }


    /**
     * Single integration point for the real BE data refresh.
     *
     * Dashboard Details currently loads savedSpreadsheets from localStorage
     * and does not inject AppTransactionServiceProxy, so it cannot honestly
     * issue the same GetAll refresh as appTransBrowse yet.
     *
     * Keeping the method here prevents the UI from accidentally reloading all
     * tabs/charts. Connect this method to the same source-loader used by
     * appTransBrowse when that service is moved/shared.
     */
    private async refreshSourceSheetFromBackend(
        widget: DashboardWidgetMetadata
    ): Promise<void> {

        const source =
            this.loadedSpreadsheet
                ?.sheetDataSources
                ?.find(
                    (item: any) =>
                        (
                            widget.sourceSheetId != null &&
                            item?.sheetId != null &&
                            Number(
                                item.sheetId
                            ) ===
                            Number(
                                widget.sourceSheetId
                            )
                        ) ||
                        (
                            String(
                                item?.sheetName ?? ''
                            ) ===
                            String(
                                widget.sourceSheetName ?? ''
                            )
                        )
                );

        if (!source) {

            console.warn(
                '[Dashboard Widget Refresh] No sheetDataSource found:',
                widget
            );

            return;

        }

        console.log(
            '[Dashboard Widget Refresh] Source selected:',
            source
        );

        /*
         * TODO BE CONNECTION:
         *
         * Use:
         * source.source.sourceKey
         * source.source.mode
         * source.source.columns
         * source.source.filters
         *
         * to request ONLY widget.sourceSheetId.
         *
         * Do NOT call refreshDashboard().
         * Do NOT reload unrelated tabs.
         */

        await Promise.resolve();

    }


    private recalculateSourceAndDashboard(
        widget: DashboardWidgetMetadata
    ): void {

        const spreadsheet: any =
            this.dashboardSpreadsheet as any;

        if (!spreadsheet) {
            return;
        }

        /*
         * calculationMode in the saved workbook is Automatic.
         * If this Syncfusion build exposes calculate(), use it after replacing
         * the source cells. Otherwise dataBind/refresh keeps the native chart
         * view in sync with its current workbook data.
         */
        if (
            typeof spreadsheet.calculate ===
            'function'
        ) {

            spreadsheet.calculate();

        } else if (
            typeof spreadsheet.dataBind ===
            'function'
        ) {

            spreadsheet.dataBind();

        }

        console.log(
            '[Dashboard Widget Refresh] recalculated:',
            {
                widgetId:
                    widget.id,
                sourceSheet:
                    widget.sourceSheetName
            }
        );

    }


    // =====================================================
    // DASHBOARD NATIVE CHART LOOKUP
    // =====================================================

    private findDashboardChart(
        widget: DashboardWidgetMetadata
    ): any | null {

        const dashboard =
            this.getDashboardSheet();

        if (!dashboard) {
            return null;
        }

        let rangeMatch:
            any | null =
            null;

        for (
            const row of
            dashboard.rows ?? []
        ) {

            for (
                const cell of
                row?.cells ?? []
            ) {

                for (
                    const chart of
                    cell?.chart ?? []
                ) {

                    const chartId =
                        String(
                            chart?.id ?? ''
                        );

                    if (
                        widget.chartId &&
                        chartId ===
                            String(
                                widget.chartId
                            )
                    ) {

                        return chart;

                    }

                    const chartRange =
                        String(
                            chart?.range ?? ''
                        );

                    if (
                        widget.dashboardDataRange &&
                        chartRange ===
                            String(
                                widget.dashboardDataRange
                            )
                    ) {

                        rangeMatch =
                            chart;

                    }

                    if (
                        widget.sourceType ===
                            'DIRECT' &&
                        widget.sourceRange &&
                        chartRange ===
                            String(
                                widget.sourceRange
                            )
                    ) {

                        rangeMatch =
                            chart;

                    }

                }

            }

        }

        return rangeMatch;

    }


    private getDashboardSheet(): any | null {

        const sheets =
            this.dashboardSpreadsheet
                ?.sheets ??
            this.dashboardSheets;

        const index =
            this.findDashboardSheetIndex(
                sheets as any[]
            );

        return index >= 0
            ? (sheets as any[])[
                index
            ]
            : null;

    }


    // =====================================================
    // GET SPECIFIC SAVED SPREADSHEET
    // =====================================================

    /**
     * POC:
     *
     * Do NOT search for the first Spreadsheet containing
     * Dashboard.
     *
     * Load exactly:
     *
     * Transaction Spreadsheet 3
     * ID = 1789422155310
     *
     * Later replace this with the real:
     *
     * Dashboard -> Spreadsheet relation from BE.
     */
    private getSavedSpreadsheetForDashboard():
        SavedSpreadsheet | null {


        const savedSpreadsheets =
            this.getSavedSpreadsheets();


        if (
            !savedSpreadsheets.length
        ) {

            return null;

        }


        const spreadsheet =
            savedSpreadsheets.find(

                (
                    item:
                        SavedSpreadsheet
                ) =>

                    Number(
                        item.id
                    ) ===

                    Number(
                        this.pocSpreadsheetId
                    )

            );


        if (!spreadsheet) {

            console.error(
                '[Dashboard] Specific Spreadsheet not found:',
                this.pocSpreadsheetId
            );

            return null;

        }


        // =============================================
        // VERIFY DASHBOARD EXISTS
        // =============================================

        if (
            !this.hasDashboardSheet(
                spreadsheet.workbookJson
            )
        ) {

            console.error(
                '[Dashboard] Spreadsheet exists but Dashboard sheet is missing:',
                spreadsheet.id
            );

            return null;

        }


        return spreadsheet;

    }


    // =====================================================
    // LOCAL STORAGE
    // =====================================================

    private getSavedSpreadsheets():
        SavedSpreadsheet[] {


        try {

            const value =
                JSON.parse(

                    localStorage.getItem(
                        'savedSpreadsheets'
                    ) ||

                    '[]'

                );


            return Array.isArray(
                value
            )
                ? value
                : [];


        } catch (error) {

            console.error(
                '[Dashboard] Unable to parse savedSpreadsheets:',
                error
            );


            return [];

        }

    }


    // =====================================================
    // HAS DASHBOARD SHEET
    // =====================================================

    private hasDashboardSheet(
        workbookJson: any
    ): boolean {


        const workbook =
            this.getWorkbook(
                workbookJson
            );


        if (
            !workbook ||
            !Array.isArray(
                workbook.sheets
            )
        ) {

            return false;

        }


        return (
            this.findDashboardSheetIndex(
                workbook.sheets
            ) >= 0
        );

    }


    // =====================================================
    // GET WORKBOOK
    // =====================================================

    private getWorkbook(
        workbookJson: any
    ): any {


        return (

            workbookJson
                ?.jsonObject
                ?.Workbook

            ??

            workbookJson
                ?.Workbook

            ??

            null

        );

    }


    // =====================================================
    // MENU
    // =====================================================

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


    // =====================================================
    // AVATAR
    // =====================================================

    onAvatarErr(
        event: Event
    ): void {


        (
            event.target as
                HTMLImageElement
        ).src =
            this.defaultAvatar;

    }


    // =====================================================
    // DATE
    // =====================================================

    private toDate(
        value: any
    ): Date {


        if (!value) {

            return new Date();

        }


        const result =
            new Date(
                value
            );


        return Number.isNaN(
            result.getTime()
        )
            ? new Date()
            : result;

    }

}