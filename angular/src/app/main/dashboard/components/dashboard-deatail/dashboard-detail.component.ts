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
import { AppDashboardServiceProxy } from '@shared/service-proxies/service-proxies';

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

    @ViewChild('dashboardSpreadsheet') dashboardSpreadsheet?: SpreadsheetComponent;

    readonly dashboardSheetName = 'Dashboard';
    dashboardSheets: any[] = [];
    dashboardActiveSheetIndex = 0;


    loading = false;
    refreshing = false;
    dashboardWorkbookReady = false;
    dashboardLoadError = '';

    dashboardId = 1;


    sourceSpreadsheetId: number | null = null;

    dashboard: any


    actionsMenuItems: MenuItem[] = [];

    constructor(
        injector: Injector,
        private route: ActivatedRoute,
        private appDashboardService: AppDashboardServiceProxy,
        private cdr: ChangeDetectorRef

    ) {

        super(injector);

    }


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

            this.dashboardId = routeId;

        }

        this.buildActionsMenu();
        this.loadDashboard();

    }


    private loadDashboard(): void {
        if (!this.dashboardId) {
            return;
        }

        this.loading = true;
        this.dashboardWorkbookReady = false;
        this.dashboardLoadError = '';

        this.dashboardSheets = [];
        this.sourceSpreadsheetId = null;

        this.appDashboardService
            .getDashboardForView(this.dashboardId)
            .subscribe({
                next: (result: any) => {
                    try {
                         this.dashboard = result;

                        const saved = this.dashboard?.spreadsheet;

                        if (!saved) {
                            throw new Error(
                                'This Dashboard does not have a saved Spreadsheet.'
                            );
                        }

                        if (!saved.workbookJson) {
                            throw new Error(
                                'The saved Spreadsheet does not contain workbook data.'
                            );
                        }


                        // =============================================
                        // GET WORKBOOK
                        // =============================================

                        const workbook =
                            this.getWorkbook(
                                saved.workbookJson
                            );

                        if (
                            !workbook ||
                            !Array.isArray(workbook.sheets) ||
                            !workbook.sheets.length
                        ) {
                            throw new Error(
                                'The saved Spreadsheet does not contain any sheets.'
                            );
                        }

                        // =============================================
                        // FIND DASHBOARD
                        // =============================================

                        const dashboardIndex =
                            this.findDashboardSheetIndex(
                                workbook.sheets
                            );

                        if (dashboardIndex < 0) {
                            throw new Error(
                                `Sheet "${this.dashboardSheetName}" was not found.`
                            );
                        }

                        this.dashboardSheets =
                            workbook.sheets.map(
                                (sheet: any, index: number) => ({
                                    ...sheet,

                                    state:
                                        index === dashboardIndex
                                            ? 'Visible'
                                            : 'Hidden'
                                })
                            );

                        this.dashboardActiveSheetIndex =   dashboardIndex;

                        this.sourceSpreadsheetId = null;

                        this.loading = false;
                        this.dashboardWorkbookReady = true;

                        this.cdr.detectChanges();

                    } catch (error) {
                        console.error(
                            '[Dashboard] Load failed:',
                            error
                        );

                        this.dashboardLoadError =
                            error instanceof Error
                                ? error.message
                                : 'Unable to load the dashboard.';

                        this.dashboardWorkbookReady = false;
                        this.loading = false;

                        this.dashboardSheets = [];

                        this.cdr.detectChanges();
                    }
                },

                error: (error: any) => {
                    console.error(
                        '[Dashboard] Dashboard API failed:',
                        error
                    );

                    this.dashboardLoadError =
                        'Unable to load the dashboard.';

                    this.dashboardWorkbookReady = false;
                    this.loading = false;

                    this.dashboardSheets = [];


                    this.cdr.detectChanges();
                }
            });
    }

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
            return;
        }

        const dashboardIndex =
            this.findDashboardSheetIndex(
                sheets
            );

        if (dashboardIndex < 0) {
            this.dashboardLoadError =
                `Sheet "${this.dashboardSheetName}" was not found.`;

            this.cdr.detectChanges();

            return;
        }

        // =============================================
        // VIEW MODE:
        // Dashboard visible, everything else hidden
        // =============================================

        sheets.forEach(
            (sheet: any, index: number) => {
                sheet.state =
                    index === dashboardIndex
                        ? 'Visible'
                        : 'Hidden';
            }
        );

        this.dashboardActiveSheetIndex =
            dashboardIndex;

        this.dashboardSpreadsheet.activeSheetIndex =
            dashboardIndex;

        setTimeout(() => {
            if (!this.dashboardSpreadsheet) {
                return;
            }

            this.dashboardSpreadsheet.activeSheetIndex =
                dashboardIndex;

            this.dashboardSpreadsheet.refresh();
        }, 0);
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


    refreshDashboard(): void {


    }


    private getWorkbook(workbookJson: any): any {


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


    ngOnDestroy(): void {
        this.dashboardSheets = [];

    }
}