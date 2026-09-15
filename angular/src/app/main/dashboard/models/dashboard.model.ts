import {
   
    GridsterItem
} from 'angular-gridster2';

export interface DashboardPivotWidget {

    id: number;

    name: string;

    widgetType: 'PivotChart';

    gridInformation: GridsterItem;

    pivot: {
        rows: any[];
        columns: any[];
        values: any[];
        filters: any[];
        filterSettings?: any[];
        sortSettings?: any[];
    };

    chart: {
        type: string;
        title: string;
        enableMultipleAxis?: boolean;
    };

    // Saved Spreadsheet used as this widget's source.
    // POC: read it from localStorage.
    // Production: BE will return the latest source records.
    sourceSpreadsheetId?: number;
    sourceSheetName?: string;

    data: any[];

    // Prepared Syncfusion objects
    dataSourceSettings?: any;
    chartSettings?: any;

    loaded?: boolean;
    loading?: boolean;
    refreshing?: boolean;
    lastRefreshedAt?: string;
    loadError?: string;
}


export interface DashboardPage {

    id: number;

    name: string;

    widgets: DashboardPivotWidget[];
}
