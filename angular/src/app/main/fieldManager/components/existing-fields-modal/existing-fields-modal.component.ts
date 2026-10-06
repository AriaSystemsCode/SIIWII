import { Component, EventEmitter, Injector, Input, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppFieldListDto } from '@shared/service-proxies/service-proxies';
import { FieldManagerService } from '../../field-manager.service';
import { forkJoin } from 'rxjs';

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
    allFields: AppFieldListDto[] = [];

    constructor(
        injector: Injector,
        private fieldManagerService: FieldManagerService
    ) {
        super(injector);
    }

    get availableFields(): AppFieldListDto[] {
        const search = this.search.trim().toLowerCase();
        const currentTableCodes = new Set(this.items.map(item => item.fieldCode));

        return this.allFields.filter(item => {
            if (currentTableCodes.has(item.fieldCode)) {
                return false;
            }

            if (!search) {
                return true;
            }

                return (item.fieldName || '').toLowerCase().includes(search) ||
                (item.fieldCode || '').toLowerCase().includes(search) ||
                (item.fieldTypeName || '').toLowerCase().includes(search) ||
                (item.tables || []).join(', ').toLowerCase().includes(search);
        });
    }

    show(): void {
        this.search = '';
        this.selectedFieldIds = [];
        this.fieldManagerService.getFieldsForNode(null).subscribe({
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

        const selectedFields = this.allFields.filter(item => this.isSelected(item.id));
        if (!selectedFields.length) return;
        forkJoin(selectedFields.map(item => this.fieldManagerService.assignExistingField(
            item.id, this.entityId!, this.objectTypeId
        ))).subscribe({
            next: () => {
                this.added.emit(selectedFields.length);
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
