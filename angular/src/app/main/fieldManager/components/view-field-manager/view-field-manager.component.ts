import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppFieldDto, CreateOrEditFieldInput, FieldLookupDto } from '@shared/service-proxies/service-proxies';
import { FieldManagerService } from '../../field-manager.service';

@Component({
    selector: 'app-view-field-manager',
    templateUrl: './view-field-manager.component.html',
    styleUrls: ['./view-field-manager.component.scss']
})
export class ViewFieldManagerComponent extends AppComponentBase implements OnInit {
    @ViewChild('fieldManagerViewModal', { static: true }) modal!: ModalDirective;
    @Output() revisionSaved = new EventEmitter<void>();
    item: AppFieldDto | null = null;
    revisions: AppFieldDto[] = [];
    selectedRevision: AppFieldDto | null = null;
    fieldTypes: FieldLookupDto[] = [];
    widgetTypes: FieldLookupDto[] = [];
    viewState: 'details' | 'history' | 'draft' = 'details';
    active = false;
    isViewingHistoryRevision = false;
    private currentItem: AppFieldDto | null = null;
    private detailsRequest = 0;

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
        return this.fieldTypes.find(type => type.id === id)?.name || '';
    }

    goToHistory(): void {
        // No revision-history endpoint is currently exposed; show the current BE revision only.
        this.revisions = this.item ? [this.item] : [];
        this.selectedRevision = this.item;
        this.viewState = 'history';
    }

    backToFieldDetails(): void {
        if (this.currentItem) this.item = this.copyItem(this.currentItem);
        this.selectedRevision = this.currentItem;
        this.viewState = 'details';
        this.isViewingHistoryRevision = false;
    }

    openRevision(revision: AppFieldDto): void {
        this.item = this.copyItem(revision);
        this.selectedRevision = revision;
        this.viewState = 'details';
        this.isViewingHistoryRevision = false;
    }

    backToHistory(): void {
        this.viewState = 'history';
    }

    createNewRevision(): void {
        if (!this.item) return;
        this.currentItem = this.copyItem(this.item);
        this.item = this.copyItem(this.item);
        this.viewState = 'draft';
    }

    restoreRevision(): void {
        // Restore requires a backend revision-restore endpoint, which is not available yet.
    }

    saveRevision(): void {
        if (!this.item || !this.item.fieldName.trim() || !this.item.id) return;

        const input = new CreateOrEditFieldInput({
            id: this.item.id,
            sycObjectId: this.item.sycObjectId,
            entitySycObjectId: this.item.entitySycObjectId,
            selectedObjectTypeId: this.item.selectedObjectTypeId,
            fieldTypeId: this.item.fieldTypeId,
            widgetTypeId: this.item.widgetTypeId,
            fieldLevelId: this.item.fieldLevelId,
            fieldStatusId: this.item.fieldStatusId,
            fieldCode: this.item.fieldCode,
            fieldName: this.item.fieldName,
            description: this.item.description,
            fieldLevelCode: this.item.fieldLevelCode,
            fieldStatusCode: this.item.fieldStatusCode,
            trackingNo: this.item.trackingNo,
            isExtraField: this.item.isExtraField,
            allowNull: this.item.allowNull,
            length: this.item.length,
            decimals: this.item.decimals,
            defaultValue: this.item.defaultValue,
            dateFormat: this.item.dateFormat,
            timeFormat: this.item.timeFormat,
            allowMultiSelect: this.item.allowMultiSelect,
            required: this.item.required,
            visible: this.item.visible,
            editable: this.item.editable,
            extraAttributes: this.item.extraAttributes
        });

        this.showMainSpinner();
        this.fieldManagerService.createField(input).pipe(finalize(() => this.hideMainSpinner())).subscribe({
            next: savedField => {
                this.item = savedField;
                this.currentItem = this.copyItem(savedField);
                this.selectedRevision = savedField;
                this.revisions = [savedField];
                this.viewState = 'details';
                this.isViewingHistoryRevision = false;
                this.revisionSaved.emit();
                this.notify.success('Revision saved successfully.');
            },
            error: () => this.notify.error('Could not save the field revision.')
        });
    }

    cancelDraft(): void {
        if (this.currentItem) this.item = this.copyItem(this.currentItem);
        this.viewState = 'details';
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
                this.revisions = [result.field];
                this.selectedRevision = result.field;
                this.fieldTypes = result.metadata.fieldTypes || [];
                this.widgetTypes = result.metadata.widgetTypes || [];
                this.viewState = 'details';
                this.isViewingHistoryRevision = false;
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

    close(): void {
        if (this.viewState === 'draft') {
            this.cancelDraft();
            return;
        }
        if (this.viewState === 'history') {
            this.backToFieldDetails();
            return;
        }
        ++this.detailsRequest;
        this.hideMainSpinner();
        this.active = false;
        this.item = null;
        this.modal.hide();
    }
}