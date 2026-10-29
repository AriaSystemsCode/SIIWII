import { Component, EventEmitter, Injector, Input, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppFieldDto, AppFieldListDto } from '@shared/service-proxies/service-proxies';
import { FieldManagerService } from '../../field-manager.service';

@Component({
    selector: 'app-existing-fields-modal',
    templateUrl: './existing-fields-modal.component.html',
    styleUrls: ['./existing-fields-modal.component.scss']
})
export class ExistingFieldsModalComponent extends AppComponentBase {
    @ViewChild('existingFieldsModal', { static: true }) modal!: ModalDirective;
    @Input() items: AppFieldListDto[] = [];
    @Input() entityId: number | null = null;
    @Input() tableName = '';
    @Input() objectTypeId: number | null = null;
    @Output() added = new EventEmitter<number>();

    search = '';
    selectedFieldIds: number[] = [];
    allFields: AppFieldDto[] = [];

    constructor(
        injector: Injector,
        private fieldManagerService: FieldManagerService
    ) {
        super(injector);
    }

    get availableFields(): AppFieldDto[] {
        const search = this.search.trim().toLowerCase();
        const currentTableCodes = new Set(this.items.map(item => item.fieldCode));

        return this.allFields.filter(item => {
            if (item.id === undefined) {
                return false;
            }

            if (currentTableCodes.has(item.fieldCode)) {
                return false;
            }

            if (!search) {
                return true;
            }

                return (item.fieldName || '').toLowerCase().includes(search) ||
                (item.fieldCode || '').toLowerCase().includes(search) ||
                String(item.fieldTypeId).includes(search);
        });
    }

    show(): void {
        this.search = '';
        this.selectedFieldIds = [];
        if (this.entityId === null) {
            this.notify.error('Select an entity or table first.');
            return;
        }

        this.fieldManagerService.getUnlinkedFields(this.entityId, this.objectTypeId).subscribe({
            next: fields => this.allFields = fields,
            error: () => this.notify.error('Could not load existing fields.')
        });
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

        const selectedFields = this.allFields.filter(item => item.id !== undefined && this.isSelected(item.id));
        if (!selectedFields.length) return;
        this.fieldManagerService.linkExistingFields(
            this.entityId,
            this.objectTypeId,
            selectedFields.map(item => item.id!)
        ).subscribe({
            next: result => {
                this.added.emit(result.linkedCount || 0);
                this.hideAndReset();
            },
            error: () => this.notify.error('Could not assign one or more fields.')
        });
    }

    private hideAndReset(): void {
        this.modal.hide();
        this.selectedFieldIds = [];
    }
}
