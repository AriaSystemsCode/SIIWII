import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppFieldDto, AppFieldHistoryDto, CreateOrEditFieldInput, ExtraAttributesSource, FieldLookupDto, FieldSettingValueDto, SycEntityObjectTypesServiceProxy } from '@shared/service-proxies/service-proxies';
import { FieldManagerService, FIELD_USAGE_TITLES } from '../../field-manager.service';
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
    canCreateRevision = false;
    canSync = false;
    currentItem: AppFieldDto | null = null;
    private detailsRequest = 0;
    private historyRequest = 0;
    private isRevisionSaved = false;
    private savedRevisionFieldId: number | null = null;
    private usageBySettingId = new Map<number, string>();
    private groupsSource: FieldSettingValueDto[] | undefined;
    private groupsCache: { usage: string, settings: FieldSettingValueDto[] }[] = [];
    private usageRequest = 0;

    constructor(
        injector: Injector,
        private activatedRoute: ActivatedRoute,
        private fieldManagerService: FieldManagerService,
        private sycEntityObjectTypesService: SycEntityObjectTypesServiceProxy
    ) {
        super(injector);
    }

    // Cached so ngFor keeps stable references between change detection cycles.
    get settingGroups(): { usage: string, settings: FieldSettingValueDto[] }[] {
        const values = this.item?.settingValues;
        if (values !== this.groupsSource) {
            this.groupsSource = values;
            this.groupsCache = this.buildSettingGroups(values || []);
        }
        return this.groupsCache;
    }

    usageTitle(usage: string): string {
        if (FIELD_USAGE_TITLES[usage]) return FIELD_USAGE_TITLES[usage];
        const key = (usage || '').split('.').pop() || '';
        const localized = this.l(key);
        return localized && localized !== key ? localized : key.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    private buildSettingGroups(values: FieldSettingValueDto[]): { usage: string, settings: FieldSettingValueDto[] }[] {
        const groups = new Map<string, FieldSettingValueDto[]>();
        values.forEach(value => {
            const usage = this.usageBySettingId.get(value.settingFieldId) || 'UNSPECIFIED';
            groups.set(usage, [...(groups.get(usage) || []), value]);
        });
        return Array.from(groups.entries()).map(([usage, settings]) => ({ usage, settings }));
    }

    private loadSettingUsages(fieldTypeId: number): void {
        const request = ++this.usageRequest;
        this.sycEntityObjectTypesService.getAllWithExtraAttributes(fieldTypeId, ExtraAttributesSource.AppFields).subscribe({
            next: objectTypes => {
                if (request !== this.usageRequest) return;
                this.usageBySettingId = new Map(
                    (objectTypes?.[0]?.extraAttributes?.extraAttributes || [])
                        .map(attr => [attr.attributeId, (attr as any).usage || 'UNSPECIFIED'] as [number, string])
                );
                this.groupsSource = undefined;
            }
        });
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
        this.canRestoreRevision = this.canCreateRevision && !!revisionNo && !!currentRevisionNo && revisionNo !== currentRevisionNo;
    }

    backToHistory(): void {
        this.viewState = 'history';
    }

    syncField(): void {
        const field = this.currentItem;
        if (!field?.id || !this.canSync) return;

        Swal.fire({
            title: '',
            text: 'Update dictionary with the latest revision',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then(result => {
            if (!result.isConfirmed) return;
            this.showMainSpinner();
            this.fieldManagerService.syncFieldSnapshots(field.id!)
                .pipe(finalize(() => this.hideMainSpinner()))
                .subscribe({
                    next: response => {
                        if (response?.success === false) {
                            this.notify.error(response.message || 'Could not sync the field.');
                            return;
                        }
                        this.notify.success(response?.message || 'Field synced successfully.');
                        this.revisionSaved.emit();
                        this.loadDetails(field.id!);
                    },
                    error: () => this.notify.error('Could not sync the field.')
                });
        });
    }

    createNewRevision(): void {
        if (!this.item || !this.canCreateRevision) return;
        this.requestRevision(this.item);
    }

  // ...existing code...
    restoreRevision(): void {
        if (!this.item || !this.currentItem || !this.canRestoreRevision) return;

        const revision = this.item;
        Swal.fire({
            title: '',
            text: 'A new revision of this field will be created based on revision #' + (this.item?.currentRevisionNo || ''),
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then(result => {
            if (!result.isConfirmed) return;
            this.requestRevision(revision, true);
            this.revisionEditor.save();
        });
    }

    private requestRevision(field: AppFieldDto, hideEditor = false): void {
        if (!this.currentItem) return;
        this.isRevisionSaved = false;
        this.savedRevisionFieldId = null;
        if (!hideEditor) this.modal.hide();
        this.revisionEditor.showRevision(this.copyItem(field), this.currentItem.currentRevisionNo, !hideEditor);
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
            field: this.fieldManagerService.getFieldForEditWithPermissions(id),
            metadata: this.fieldManagerService.getFieldMetadata()
        }).pipe(finalize(() => {
            if (request === this.detailsRequest) this.hideMainSpinner();
        })).subscribe({
            next: result => {
                if (request !== this.detailsRequest) return;
                this.item = result.field.field;
                this.canCreateRevision = result.field.permissions?.canCreateRevision === true;
                this.canSync = result.field.permissions?.canSync === true;
                this.currentItem = this.copyItem(result.field.field);
                this.revisions = [];
                this.selectedRevision = result.field.field;
                this.fieldTypes = result.metadata.fieldTypes || [];
                if (this.item.fieldTypeId) this.loadSettingUsages(this.item.fieldTypeId);
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
        return this.fieldManagerService.mapDto(item, AppFieldDto);
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
        this.canCreateRevision = false;
        this.canSync = false;
        this.canRestoreRevision = false;
        this.item = null;
        this.modal.hide();
    }
}
