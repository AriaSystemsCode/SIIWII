import { ChangeDetectorRef, Component, Injector, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

import { AppComponentBase } from '@shared/common/app-component-base';
import { ExtraAttribute } from '@shared/service-proxies/service-proxies';
import { TableFieldsService, TableInfo } from './services/table-fields.service';
import {
    DynamicFormField,
    DynamicFormScreen,
    DynamicFormStorageService
} from './services/dynamic-form-storage.service';

type FieldKind = 'text' | 'number' | 'date' | 'boolean' | 'lookup';

interface FormColumn {
    id: string;
    title: string;
}

interface DragState {
    // Where the dragged field comes from
    source: 'available' | 'column';
    field: ExtraAttribute | DynamicFormField;
}

interface DropTarget {
    columnId: string;
    index: number;
}

// DynamicInputs understands these data types.
const KIND_TO_DYNAMIC_TYPE: Record<FieldKind, string> = {
    text: 'string',
    number: 'Numeric',
    date: 'Datetime',
    boolean: 'boolean',
    lookup: 'dropDownList'
};

const KIND_ICON: Record<FieldKind, string> = {
    text: 'pi-align-left',
    number: 'pi-hashtag',
    date: 'pi-calendar',
    boolean: 'pi-check-square',
    lookup: 'pi-list'
};

const KIND_LABEL: Record<FieldKind, string> = {
    text: 'String',
    number: 'Number',
    date: 'Date',
    boolean: 'Boolean',
    lookup: 'Lookup'
};

@Component({
    selector: 'app-dynamic-form-view',
    templateUrl: './dynamic-form-view.component.html',
    styleUrls: ['./dynamic-form-view.component.scss']
})
export class DynamicFormViewComponent extends AppComponentBase implements OnInit {

    // Starts with two columns; users can add more at runtime.
    columns: FormColumn[] = this.defaultColumns();

    screens: DynamicFormScreen[] = [];
    activeScreen: DynamicFormScreen | null = null;

    tables: TableInfo[] = [];
    tableColumns: ExtraAttribute[] = [];
    isLoadingTables = false;
    isLoadingColumns = false;

    columnLists: { [columnId: string]: DynamicFormField[] } = {};
    dragState: DragState | null = null;
    dropTarget: DropTarget | null = null;

    private inputCache = new Map<string, any>();

    constructor(
        injector: Injector,
        private tableFieldsService: TableFieldsService,
        private storage: DynamicFormStorageService,
        private cdr: ChangeDetectorRef
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.screens = this.storage.load();

        if (!this.screens.length) {
            this.screens = [this.createScreen('Screen 1'), this.createScreen('Screen 2')];
        }

        this.loadTables();
        void this.selectScreen(this.screens[0]);
    }

    // ---------------- Screens ----------------

    addScreen(): void {
        const screen = this.createScreen(`Screen ${this.screens.length + 1}`);
        this.screens = [...this.screens, screen];
        void this.selectScreen(screen);
    }

    async selectScreen(screen: DynamicFormScreen): Promise<void> {
        if (screen === this.activeScreen) {
            return;
        }

        this.activeScreen = screen;
        this.inputCache.clear();
        this.tableColumns = [];
        this.rebuildColumnLists();

        if (screen.selectedTable) {
            await this.loadTableFields(screen.selectedTable, screen);
        }
    }

    async deleteScreen(screen: DynamicFormScreen, event: Event): Promise<void> {
        event.stopPropagation();

        if (this.screens.length <= 1) {
            return;
        }

        const result = await Swal.fire({
            title: 'Delete screen',
            text: `Are you sure you want to delete "${screen.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) {
            return;
        }

        const index = this.screens.indexOf(screen);
        this.screens = this.screens.filter(s => s !== screen);

        // Remove it from storage too, without saving other unsaved edits.
        this.storage.save(this.storage.load().filter(s => s.id !== screen.id));

        if (screen === this.activeScreen) {
            this.activeScreen = null;
            void this.selectScreen(this.screens[Math.min(index, this.screens.length - 1)]);
        }
    }

    async reset(): Promise<void> {
        const screen = this.activeScreen;
        if (!screen) {
            return;
        }

        // Back to the last saved layout (empty if this screen was never saved).
        const saved = this.storage.load().find(s => s.id === screen.id);
        screen.selectedTable = saved?.selectedTable ?? '';
        screen.fields = saved ? JSON.parse(JSON.stringify(saved.fields)) : [];
        screen.columns = saved?.columns ? JSON.parse(JSON.stringify(saved.columns)) : this.defaultColumns();

        this.inputCache.clear();
        this.tableColumns = [];
        this.rebuildColumnLists();

        if (screen.selectedTable) {
            await this.loadTableFields(screen.selectedTable, screen);
        }
    }

    save(): void {
        this.syncActiveScreen();
        this.storage.save(this.screens);
        this.notify.success('Saved successfully');
    }

    private createScreen(name: string): DynamicFormScreen {
        return { id: this.uid(), name, selectedTable: '', fields: [], columns: this.defaultColumns() };
    }

    private defaultColumns(): FormColumn[] {
        return [
            { id: 'left', title: 'Left Column' },
            { id: 'right', title: 'Right Column' }
        ];
    }

    // ---------------- Columns ----------------

    addColumn(): void {
        this.columns = [...this.columns, { id: `col-${this.uid()}`, title: `Column ${this.columns.length + 1}` }];
        this.commitLists(this.cloneLists());
    }

    // Fields of a removed column go back to Available Fields.
    removeColumn(column: FormColumn): void {
        if (this.columns.length <= 2) {
            return;
        }

        const lists = this.cloneLists();
        delete lists[column.id];
        this.columns = this.columns.filter(c => c.id !== column.id);
        this.commitLists(lists);
    }

    // ---------------- Table selection ----------------

    private loadTables(): void {
        this.isLoadingTables = true;

        this.tableFieldsService.getTables().subscribe({
            next: tables => {
                this.tables = tables;
                this.isLoadingTables = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.isLoadingTables = false;
                this.notify.error('Failed to load tables');
                this.cdr.detectChanges();
            }
        });
    }

    async onTableChange(table: string | null): Promise<void> {
        const screen = this.activeScreen;
        if (!screen) {
            return;
        }

        screen.selectedTable = table || '';
        screen.fields = [];
        this.inputCache.clear();
        this.tableColumns = [];
        this.rebuildColumnLists();

        if (table) {
            await this.loadTableFields(table, screen);
        }
    }

    private async loadTableFields(table: string, screen: DynamicFormScreen): Promise<void> {
        this.isLoadingColumns = true;

        try {
            const fields = await firstValueFrom(this.tableFieldsService.getTableFields(table));

            // The user may have switched screens while loading.
            if (screen === this.activeScreen) {
                this.tableColumns = fields;
            }
        } catch {
            this.notify.error('Failed to load table fields');
            if (screen === this.activeScreen) {
                screen.selectedTable = '';
            }
        } finally {
            this.isLoadingColumns = false;
            this.cdr.detectChanges();
        }
    }

    // ---------------- Available fields ----------------

    get availableFields(): ExtraAttribute[] {
        debugger;
        const placed = new Set((this.activeScreen?.fields ?? []).map(f => f.fieldId));
        return this.tableColumns.filter(column => !placed.has(column.attributeId));
    }

    getKind(field: { dataType?: string; isLookup?: boolean; validEntries?: string }): FieldKind {
        const type = (field.dataType || '').toLowerCase();

        if (field.isLookup || type.includes('dropdown') || type.includes('lookup')) {
            return 'lookup';
        }
        if (/bool|bit|check/.test(type)) {
            return 'boolean';
        }
        if (/date|time/.test(type)) {
            return 'date';
        }
        if (/numeric|number|int|decimal|float|double|money/.test(type)) {
            return 'number';
        }
        return 'text';
    }

    iconFor(field: any): string {
        return `pi ${KIND_ICON[this.getKind(field)]} kind-${this.getKind(field)}`;
    }

    kindLabel(field: any): string {
        return KIND_LABEL[this.getKind(field)];
    }

    // ---------------- Drag and drop (PrimeNG pDraggable / pDroppable) ----------------

    onDragStart(source: 'available' | 'column', field: ExtraAttribute | DynamicFormField): void {
        this.dragState = { source, field };
    }

    onDragEnd(): void {
        this.dragState = null;
        this.dropTarget = null;
    }

    onDragEnterSlot(columnId: string, index: number): void {
        if (this.dragState) {
            this.dropTarget = { columnId, index };
        }
    }

    onDragEnterAvailable(): void {
        this.dropTarget = null;
    }

    isDropBefore(columnId: string, index: number): boolean {
        return this.dropTarget?.columnId === columnId && this.dropTarget.index === index;
    }

    // Dropping on a card inserts the dragged field before that card.
    onDropOnSlot(columnId: string, index: number): void {
        const drag = this.dragState;
        this.onDragEnd();

        if (!drag) {
            return;
        }

        const lists = this.cloneLists();
        let targetIndex = index;

        if (drag.source === 'column') {
            const moving = drag.field as DynamicFormField;
            const sourceList = lists[moving.columnId];
            const sourceIndex = sourceList.findIndex(f => f.instanceId === moving.instanceId);

            sourceList.splice(sourceIndex, 1);

            if (moving.columnId === columnId && sourceIndex < targetIndex) {
                targetIndex--;
            }

            moving.columnId = columnId;
            lists[columnId].splice(targetIndex, 0, moving);
        } else {
            const original = drag.field as ExtraAttribute;
            const kind = this.getKind(original);

            lists[columnId].splice(targetIndex, 0, {
                instanceId: this.uid(),
                fieldId: original.attributeId,
                name: original.name || original.code || `Field ${original.attributeId}`,
                dataType: original.dataType || 'string',
                componentType: kind,
                columnId,
                order: 0
            });
        }

        this.commitLists(lists);
    }

    // Dropping on the empty area under the cards appends to the end of the column.
    onDropOnColumnEnd(columnId: string): void {
        this.onDropOnSlot(columnId, this.columnLists[columnId].length);
    }

    // Dropping back on the Available Fields panel removes the field from the form.
    onDropOnAvailable(): void {
        const drag = this.dragState;
        this.onDragEnd();

        if (drag?.source === 'column') {
            this.removeField(drag.field as DynamicFormField);
        }
    }

    removeField(field: DynamicFormField): void {
        debugger;
        const lists = this.cloneLists();
        lists[field.columnId] = lists[field.columnId].filter(f => f.instanceId !== field.instanceId);
        this.inputCache.delete(field.instanceId);
        this.commitLists(lists);
    }

    // ---------------- DynamicInputs integration ----------------

    /** Builds (once per field instance) the object that <app-dynamicInputs> expects. */
    getInputObject(field: DynamicFormField): any {
        let cached = this.inputCache.get(field.instanceId);

        if (!cached) {
            const original = this.tableColumns.find(c => c.attributeId === field.fieldId);
            if (!original) {
                return null;
            }

            const attr: any = Object.assign({}, original, {
                dataType: KIND_TO_DYNAMIC_TYPE[field.componentType as FieldKind] ?? 'string',
                selectedValues: null
            });

            cached = { value: { filteredExtraAttributes: [attr] } };
            this.inputCache.set(field.instanceId, cached);
        }

        return cached;
    }

    trackByInstance(_: number, field: DynamicFormField): string {
        return field.instanceId;
    }

    trackByAttribute(_: number, field: ExtraAttribute): number {
        return field.attributeId;
    }

    // ---------------- Helpers ----------------

    private cloneLists(): { [columnId: string]: DynamicFormField[] } {
        debugger;
        const lists: { [columnId: string]: DynamicFormField[] } = {};
        this.columns.forEach(c => (lists[c.id] = [...(this.columnLists[c.id] ?? [])]));
        return lists;
    }

    private commitLists(lists: { [columnId: string]: DynamicFormField[] }): void {
        debugger;
        this.columns.forEach(c => lists[c.id].forEach((f, i) => (f.order = i)));
        this.columnLists = lists;
        this.syncActiveScreen();
    }

    private syncActiveScreen(): void {
        debugger;
        if (this.activeScreen) {
            this.activeScreen.columns = this.columns.map(c => ({ ...c }));
            this.activeScreen.fields = this.columns.reduce(
                (all, c) => all.concat(this.columnLists[c.id] ?? []),
                [] as DynamicFormField[]
            );
        }
    }

    private rebuildColumnLists(): void {
        debugger;

        const lists: { [columnId: string]: DynamicFormField[] } = {};

        const savedColumns = this.activeScreen?.columns;
        this.columns = savedColumns?.length ? savedColumns.map(c => ({ ...c })) : this.defaultColumns();

        this.columns.forEach(c => {
            lists[c.id] = (this.activeScreen?.fields ?? [])
                .filter(f => f.columnId === c.id)
                .sort((a, b) => a.order - b.order);
        });

        this.columnLists = lists;
    }

    private uid(): string {
        return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    }
}
