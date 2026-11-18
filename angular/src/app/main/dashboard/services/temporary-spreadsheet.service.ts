
import { Injectable } from '@angular/core';

export interface TemporarySpreadsheetPayload {
    title: string;
    sheetName: string;
    returnUrl: string;
    records: Record<string, any>[];
}

@Injectable({ providedIn: 'root' })
export class TemporarySpreadsheetService {
    private payload: TemporarySpreadsheetPayload | null = null;

    set(payload: TemporarySpreadsheetPayload): void {
        this.payload = payload;
    }

    get(): TemporarySpreadsheetPayload | null {
        return this.payload;
    }

    clear(): void {
        this.payload = null;
    }
}
