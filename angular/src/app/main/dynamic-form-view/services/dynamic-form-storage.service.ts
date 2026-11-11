import { Injectable } from '@angular/core';

export interface DynamicFormField {
    instanceId: string;
    fieldId: number;
    name: string;
    dataType: string;
    componentType: string;
    columnId: string;
    order: number;
}

export interface DynamicFormColumn {
    id: string;
    title: string;
}

export interface DynamicFormScreen {
    id: string;
    name: string;
    selectedTable: string;
    fields: DynamicFormField[];
    columns?: DynamicFormColumn[];
}

const STORAGE_KEY = 'dynamicFormView.screens.v1';

/** POC persistence in LocalStorage; replace the two methods to move to an API. */
@Injectable()
export class DynamicFormStorageService {

    load(): DynamicFormScreen[] {
        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    save(screens: DynamicFormScreen[]): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(screens));
    }
}
