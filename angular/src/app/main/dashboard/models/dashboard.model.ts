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



export interface SpreadsheetEntityColumnDefinition {
    key: string;
    label: string;
    type: 'string' | 'number' | 'date' | 'boolean';
    defaultSelected?: boolean;
}

export interface SpreadsheetEntityFilterDefinition {
    key: string;
    label: string;
    type: 'string' | 'number' | 'date' | 'boolean' | 'statusLookup';
}

export interface SpreadsheetEntityDefinition {
    sourceKey: string;
    displayName: string;
    icon?: string;
    columns: SpreadsheetEntityColumnDefinition[];
    filters: SpreadsheetEntityFilterDefinition[];
}

export interface SpreadsheetFilters {
    search?: string;
    codeFilter?: string;
    mainFilterTypeId?: number;
    minCreateDateFilter?: any;
    maxCreateDateFilter?: any;
    minCompleteDateFilter?: any;
    maxCompleteDateFilter?: any;
    sellerNameFilter?: string;
    buyerNameFilter?: string;
    statusFilter?: number;
    referenceNumberFilter?: string;
    sorting?: string;
}

export interface SpreadsheetDataSource {
    type: string;
    sourceKey?: string;
    mode: 'SelectedRecords' | 'AllRecords';
    selectedIds?: number[];
    columns?: string[];
    filters?: SpreadsheetFilters | Record<string, any>;
}

export interface SpreadsheetSheetDataSource {
    sheetId?: number;
    sheetName: string;
    source: SpreadsheetDataSource;
}

export interface SavedSpreadsheet {
    id: number;
    name: string;
    createdDate: string;
    updatedDate?: string;
    recordCount: number;
    workbookJson: any;
    sheetDataSources?: SpreadsheetSheetDataSource[];
    sheetAnalyses?: SavedSheetAnalysis[];
    dashboardWidgets?: DashboardWidgetMetadata[];
}

export interface DashboardWidgetMetadata {
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

export interface SavedSheetAnalysis {
    id?: number;
    sheetName: string;
    sourceSheetId?: number;
    dashboardWidgetId?: number;
    dashboardChartId?: string;
    dashboardDataRange?: string;
sourceSheetName?: string;
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
}





export type ShareAccess = 'View' | 'Edit';

export interface DashboardSharedUser {
    id?: number;
    name: string;
    access: ShareAccess;
}

export type DashboardShareMode =
    'all' |
    'specific' |
    'confirm' |
    'private';