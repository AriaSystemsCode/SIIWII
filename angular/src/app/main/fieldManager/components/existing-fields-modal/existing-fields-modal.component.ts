import { Component, EventEmitter, Injector, Input, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FieldManagerItem } from '../../field-manager.model';
import { FieldManagerService } from '../../field-manager.service';

@Component({
    selector: 'app-existing-fields-modal',
    templateUrl: './existing-fields-modal.component.html',
    styleUrls: ['./existing-fields-modal.component.scss']
})
export class ExistingFieldsModalComponent extends AppComponentBase {
    @ViewChild('existingFieldsModal', { static: true }) modal!: ModalDirective;
    @Input() items: FieldManagerItem[] = [];
    @Input() entityId: number | null = null;
    @Input() tableName = '';
    @Output() added = new EventEmitter<number>();

    search = '';
    selectedFieldIds: number[] = [];

    constructor(
        injector: Injector,
        private fieldManagerService: FieldManagerService
    ) {
        super(injector);
    }

    get availableFields(): FieldManagerItem[] {
        const search = this.search.trim().toLowerCase();
        const currentTableCodes = new Set(this.items
            .filter(item => item.entityId === this.entityId)
            .map(item => item.code));

        return this.items.filter(item => {
            if (item.entityId === this.entityId || currentTableCodes.has(item.code)) {
                return false;
            }

            if (!search) {
                return true;
            }

            return item.name.toLowerCase().includes(search) ||
                item.code.toLowerCase().includes(search) ||
                item.type.toLowerCase().includes(search) ||
                item.tables.toLowerCase().includes(search);
        });
    }

    show(): void {
        this.search = '';
        this.selectedFieldIds = [];
        this.modal.show();
    }

    close(): void {
        if (!this.selectedFieldIds.length) {
            this.hideAndReset();
            return;
        }

        this.askToConfirm('CancelAndLoseAllProgress', 'AreYouSure').subscribe((confirmed) => {
            if (confirmed) {
                this.hideAndReset();
            }
        });
    }

    toggleField(fieldId: number): void {
        this.selectedFieldIds = this.selectedFieldIds.indexOf(fieldId) === -1
            ? [...this.selectedFieldIds, fieldId]
            : this.selectedFieldIds.filter(id => id !== fieldId);
    }

    isSelected(fieldId: number): boolean {
        return this.selectedFieldIds.indexOf(fieldId) !== -1;
    }

    addSelected(): void {
        if (this.entityId === null) {
            return;
        }

        const selectedFields = this.items.filter(item => this.isSelected(item.id));
        selectedFields.forEach(item => this.fieldManagerService.addExisting(item, this.entityId!, this.tableName));
        this.added.emit(selectedFields.length);
        this.hideAndReset();
    }

    private hideAndReset(): void {
        this.modal.hide();
        this.selectedFieldIds = [];
    }
}
