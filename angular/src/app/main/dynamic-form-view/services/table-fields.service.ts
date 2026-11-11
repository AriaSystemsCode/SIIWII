import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppDashboardServiceProxy, ExtraAttribute } from '@shared/service-proxies/service-proxies';

export interface TableInfo {
    tableName: string;
    objectCode: string;
    objectId: number;
}

/** Loads the tables list and a table's fields using the same proxy calls as the spreadsheet data panel. */
@Injectable()
export class TableFieldsService {
    constructor(private appDashboardService: AppDashboardServiceProxy) { }

    getTables(): Observable<TableInfo[]> {
        return this.appDashboardService.getTablesList()
            .pipe(map((result: any) => (Array.isArray(result) ? result : [])));
    }

    getTableFields(table: string): Observable<ExtraAttribute[]> {
        return this.appDashboardService.getTableFieldsList(table)
            .pipe(map(fields => fields ?? []));
    }
}
