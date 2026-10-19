import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppFieldDto, AppFieldHistoryDto, FieldLookupDto } from '@shared/service-proxies/service-proxies';
import { FieldManagerService } from '../../field-manager.service';
import { CreateOrEditFieldManagerComponent } from '../create-or-edit-field-manager/create-or-edit-field-manager.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-view-field-manager',
    templateUrl: './view-field-manager.component.html',
    styleUrls: ['./view-field-manager.component.scss']
})
export class ViewFieldManagerComponent extends AppComponentBase implements OnInit {
    @ViewChild('fieldManagerViewModal', { static: true }) modal!: ModalDirective;
    @ViewChild('revisionEditor', { static: true }) revisionEditor!: CreateOrEditFieldManagerComponent;
    @Output() revisionSaved = new EventEmitter<void>();
    item: AppFieldDto | null = null;
    revisions: AppFieldHistoryDto[] = [];
    selectedRevision: AppFieldDto | null = null;
    fieldTypes: FieldLookupDto[] = [];
    viewState: 'details' | 'history' = 'details';
    active = false;
    isViewingHistoryRevision = false;
    canRestoreRevision = false;
    private currentItem: AppFieldDto | null = null;
    private detailsRequest = 0;
    private historyRequest = 0;
    private isRevisionSaved = false;
    private savedRevisionFieldId: number | null = null;

    constructor(
        injector: Injector,
        private activatedRoute: ActivatedRoute,
        private fieldManagerService: FieldManagerService
    ) {
        super(injector);
    }

    get revisionLabel(): string {
        return this.item?.currentRevisionNo || '00';
    }

    ngOnInit(): void {
        const id = Number(this.activatedRoute.snapshot.paramMap.get('id'));
        if (id > 0) this.loadDetails(id);
    }

    show(item: { id: number }): void {
        this.loadDetails(item.id);
    }

    fieldTypeName(id: number): string {
        const fieldType = this.fieldTypes.find(type => type.id === id);
        return fieldType?.name || fieldType?.code || '';
    }

    goToHistory(): void {
        if (!this.item || this.item.id === undefined) return;

        const request = ++this.historyRequest;
        this.selectedRevision = this.item;
        this.viewState = 'history';
        this.revisions = [];
        this.showMainSpinner();
        this.fieldManagerService.getFieldHistory(this.item.id).pipe(finalize(() => {
            if (request === this.historyRequest) this.hideMainSpinner();
        })).subscribe({
            next: revisions => {
                if (request === this.historyRequest) this.revisions = revisions || [];
            },
            error: () => {
                if (request === this.historyRequest) this.notify.error('Could not load field revision history.');
            }
        });
    }

    backToFieldDetails(): void {
        ++this.historyRequest;
        this.hideMainSpinner();
        if (this.currentItem) this.item = this.copyItem(this.currentItem);
        this.selectedRevision = this.currentItem;
        this.viewState = 'details';
        this.isViewingHistoryRevision = false;
        this.canRestoreRevision = false;
    }

    openRevision(revision: AppFieldHistoryDto): void {
        if (!revision.field) return;
        this.item = this.copyItem(revision.field);
        this.selectedRevision = revision.field;
        this.viewState = 'details';
        this.isViewingHistoryRevision = true;
        const revisionNo = this.normalizeRevisionNo(revision.revisionNo || revision.field.currentRevisionNo);
        const currentRevisionNo = this.normalizeRevisionNo(this.currentItem?.currentRevisionNo);
        this.canRestoreRevision = !!revisionNo && !!currentRevisionNo && revisionNo !== currentRevisionNo;
    }

    backToHistory(): void {
        this.viewState = 'history';
    }

    createNewRevision(): void {
        if (!this.item) return;
        this.requestRevision(this.item);
    }

  // ...existing code...
    restoreRevision(): void {
        if (!this.item) return;

        const itemToRestore = this.copyItem(this.item);
        Swal.fire({
            title: '',
            text: 'A new revision will be created and will become current revision.',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then(result => {
            if (result.isConfirmed) {
                this.requestRevision(itemToRestore);
            }
        });
    }

    private requestRevision(field: AppFieldDto): void {
        if (!this.currentItem) return;
        this.isRevisionSaved = false;
        this.savedRevisionFieldId = null;
        this.modal.hide();
        this.revisionEditor.showRevision(this.copyItem(field), this.currentItem.currentRevisionNo);
    }

    onRevisionEditorSaved(field: AppFieldDto): void {
        this.isRevisionSaved = true;
        this.savedRevisionFieldId = field.id ?? null;
    }

    onRevisionEditorClosed(): void {
        if (this.isRevisionSaved && this.savedRevisionFieldId) {
            this.revisionSaved.emit();
            this.loadDetails(this.savedRevisionFieldId);
            return;
        }

        this.modal.show();
    }

    private loadDetails(id: number): void {
        const request = ++this.detailsRequest;
        this.showMainSpinner();
        forkJoin({
            field: this.fieldManagerService.getFieldForEdit(id),
            metadata: this.fieldManagerService.getFieldMetadata()
        }).pipe(finalize(() => {
            if (request === this.detailsRequest) this.hideMainSpinner();
        })).subscribe({
            next: result => {
                if (request !== this.detailsRequest) return;
                this.item = result.field;
                this.currentItem = this.copyItem(result.field);
                this.revisions = [];
                this.selectedRevision = result.field;
                this.fieldTypes = result.metadata.fieldTypes || [];
                this.viewState = 'details';
                this.isViewingHistoryRevision = false;
                this.canRestoreRevision = false;
                this.active = true;
                this.modal.show();
            },
            error: () => {
                if (request === this.detailsRequest) {
                    this.notify.error('Could not load field details.');
                    this.close();
                }
            }
        });
    }

    private copyItem(item: AppFieldDto): AppFieldDto {
        return AppFieldDto.fromJS(item.toJSON());
    }

    private normalizeRevisionNo(revisionNo?: string): string | null {
        const normalized = revisionNo?.trim();
        if (!normalized) return null;
        return /^\d+$/.test(normalized) ? String(Number(normalized)) : normalized.toLowerCase();
    }

    close(): void {
        if (this.viewState === 'history') {
            this.backToFieldDetails();
            return;
        }
        ++this.detailsRequest;
        ++this.historyRequest;
        this.hideMainSpinner();
        this.active = false;
        this.item = null;
        this.modal.hide();
    }
}
