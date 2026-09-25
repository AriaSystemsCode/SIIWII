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
}


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


    readonly dashboardSheetName =
        'Dashboard';


    /*
     * IMPORTANT:
     *
     * These are the sheet objects read directly from:
     *
     * savedSpreadsheet
     *      .workbookJson
     *      .jsonObject
     *      .Workbook
     *      .sheets
     *
     * We don't recreate the Dashboard sheet.
     */
    dashboardSheets: any[] = [];


    /*
     * Index of Dashboard inside dashboardSheets.
     *
     * We do NOT reorder sheets.
     */
    dashboardActiveSheetIndex = 0;


    // =====================================================
    // STATE
    // =====================================================

    loading = false;

    refreshing = false;

    dashboardWorkbookReady = false;

    dashboardLoadError = '';


    // =====================================================
    // IDS
    // =====================================================

    /*
     * POC:
     *
     * Later this should come from your actual
     * Dashboard -> Spreadsheet relation.
     */
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


        try {

            // ---------------------------------------------
            // Get saved Spreadsheet
            // ---------------------------------------------

            const saved =
                this.getSavedSpreadsheetForDashboard();


            console.log(
                '[Dashboard] Saved spreadsheet:',
                saved
            );


            if (!saved) {

                throw new Error(
                    'The Spreadsheet used by this dashboard was not found.'
                );

            }


            if (!saved.workbookJson) {

                throw new Error(
                    'The saved Spreadsheet does not contain workbook data.'
                );

            }


            // ---------------------------------------------
            // Get workbook directly
            // ---------------------------------------------

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


            // ---------------------------------------------
            // Find Dashboard
            // ---------------------------------------------

            const dashboardIndex =
                workbook.sheets.findIndex(

                    (sheet: any) =>

                        String(
                            sheet?.name ?? ''
                        )
                            .trim()
                            .toLowerCase() ===

                        this.dashboardSheetName
                            .toLowerCase()

                );


            console.log(
                '[Dashboard] Dashboard index:',
                dashboardIndex
            );


            if (dashboardIndex < 0) {

                throw new Error(
                    'Dashboard sheet was not found in this Spreadsheet.'
                );

            }


            // ---------------------------------------------
            // IMPORTANT
            //
            // Take the sheets directly.
            //
            // NO openFromJson()
            // NO chart recreation
            // NO sheet recreation
            // NO Dashboard modifications
            // ---------------------------------------------

            this.dashboardSheets =
                workbook.sheets;


            /*
             * Keep original order.
             *
             * Dashboard might be:
             *
             * 0 Transactions
             * 1 Transactions (2)
             * 2 Transactions (3)
             * 3 Dashboard
             *
             * Therefore active index = 3.
             */
            this.dashboardActiveSheetIndex =
                dashboardIndex;


            // ---------------------------------------------
            // Metadata
            // ---------------------------------------------

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


            // ---------------------------------------------
            // Render
            // ---------------------------------------------

            this.loading =
                false;


            this.dashboardWorkbookReady =
                true;


            this.cdr.detectChanges();


            console.log(
                '[Dashboard] Ready',
                {
                    spreadsheetId:
                        this.sourceSpreadsheetId,

                    dashboardIndex:
                        this.dashboardActiveSheetIndex,

                    sheets:
                        this.dashboardSheets
                            .map(
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


            this.cdr.detectChanges();

        }

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


        /*
         * Destroy current Spreadsheet instance first.
         *
         * After dashboardWorkbookReady becomes true again,
         * Angular creates a fresh Spreadsheet using the
         * latest saved sheet objects.
         */
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
    // SAVED SPREADSHEET
    // =====================================================

    private getSavedSpreadsheetForDashboard():
        SavedSpreadsheet | null {


        const savedSpreadsheets =
            this.getSavedSpreadsheets();


        if (
            !savedSpreadsheets.length
        ) {

            return null;

        }


        // ---------------------------------------------
        // Try matching dashboard/Spreadsheet ID
        // ---------------------------------------------

        const byId =
            savedSpreadsheets.find(

                (
                    item:
                        SavedSpreadsheet
                ) =>

                    Number(
                        item.id
                    ) ===

                    Number(
                        this.dashboardId
                    )

            );


        if (
            byId &&
            this.hasDashboardSheet(
                byId.workbookJson
            )
        ) {

            return byId;

        }


        // ---------------------------------------------
        // POC fallback
        //
        // First saved Spreadsheet that contains
        // a Dashboard tab.
        // ---------------------------------------------

        return (

            savedSpreadsheets.find(

                (
                    item:
                        SavedSpreadsheet
                ) =>

                    this.hasDashboardSheet(
                        item.workbookJson
                    )

            ) ??

            null

        );

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
    // HAS DASHBOARD
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


        return workbook.sheets.some(

            (sheet: any) =>

                String(
                    sheet?.name ?? ''
                )
                    .trim()
                    .toLowerCase() ===

                this.dashboardSheetName
                    .toLowerCase()

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