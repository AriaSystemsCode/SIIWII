import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FieldManagerService } from '../../field-manager.service';
import Swal from 'sweetalert2';
import { of } from 'rxjs';
import { AppFieldDto, CreateOrEditFieldInput, FieldLookupDto } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-create-or-edit-field-manager',
    templateUrl: './create-or-edit-field-manager.component.html',
    styleUrls: ['./create-or-edit-field-manager.component.scss']
})
export class CreateOrEditFieldManagerComponent extends AppComponentBase implements OnInit {
    @ViewChild('fieldManagerModal', { static: true }) modal!: ModalDirective;
    @Output() saved = new EventEmitter<void>();
    @Output() closed = new EventEmitter<void>();
    item: AppFieldDto = this.createEmptyItem();
    isEdit = false;
    active = false;
    activeTab: 'field-info' = 'field-info';
    dropdownOptions: { option: string, value: string }[] = [];
    isHost :boolean=false;
    fieldTypes: FieldLookupDto[] = [];
    widgetTypes: FieldLookupDto[] = [];
    selectedObjectTypeId: number | null = null;
    entityParentId: number | null = null;
    private codePreviewRequest = 0;
    private previewTimer: ReturnType<typeof setTimeout> | null = null;
    private initialFormState = '';
    private extraAttributes: { [key: string]: any } = {};

    constructor(
        injector: Injector,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private fieldManagerService: FieldManagerService
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.fieldManagerService.getFieldMetadata().subscribe({
            next: metadata => {
                this.fieldTypes = metadata.fieldTypes || [];
                this.widgetTypes = metadata.widgetTypes || [];
            },
            error: () => this.notify.error('Could not load field types.')
        });
        const id = Number(this.activatedRoute.snapshot.paramMap.get('id'));
        this.isHost = !this.appSession.tenantId;
        if (!id) {
            return;
        }
        this.loadField(id);
    }

    show(id?: number, fromExisting = false, _tableName?: string, entityId?: number | null,
        objectTypeId?: number | null, entityParentId?: number | null): void {
        this.activeTab = 'field-info';
        this.isEdit = !!id;
        this.selectedObjectTypeId = objectTypeId || null;
        this.entityParentId = entityParentId || null;
        if (id) {
            this.loadField(id);
        } else {
            this.extraAttributes = {};
            this.item = this.createEmptyItem();
            this.dropdownOptions = [];
            if (!this.isHost) {
                this.item.fieldLevelCode = 'Tenant';
            }
            if (entityId !== undefined && entityId !== null) {
                this.item.sycObjectId = entityId;
            }
            if (fromExisting) {
                this.item.fieldStatusCode = 'Proposed';
            }
            this.generateCode();
        }
        this.active = true;
        this.initialFormState = this.getFormState();
        this.modal.show();
    }

    selectTab(tab: 'field-info', event: Event): void {
        event.preventDefault();
        this.activeTab = tab;
    }

    save(): void {
        this.dropdownOptions = this.dropdownOptions
            .filter(option => option.option.trim().length > 0 || option.value.trim().length > 0)
            .map(option => ({
                option: option.option.trim(),
                value: option.value.trim()
            }));
        const fieldType = this.selectedFieldType;
        if (!fieldType || !this.item.fieldName.trim()) {
            this.notify.error('Select a field type and enter a field name.');
            return;
        }
        if (!this.item.sycObjectId) {
            this.notify.error('Select an entity or data object for the field.');
            return;
        }
        const fieldName = this.item.fieldName.trim();
        const input = new CreateOrEditFieldInput();
        Object.assign(input, {
            id: this.isEdit ? this.item.id : undefined,
            sycObjectId: this.item.sycObjectId,
            entitySycObjectId: this.entityParentId ?? undefined,
            selectedObjectTypeId: this.isEdit ? undefined : this.selectedObjectTypeId ?? undefined,
            fieldTypeId: fieldType.id!,
            widgetTypeId: this.item.widgetTypeId ?? undefined,
            fieldLevelId: this.item.fieldLevelId,
            fieldStatusId: this.item.fieldStatusId,
            fieldName,
            description: this.item.description,
            fieldLevelCode: this.item.fieldLevelCode,
            fieldStatusCode: this.item.fieldStatusCode,
            trackingNo: this.item.trackingNo,
            isExtraField: this.item.isExtraField,
            allowNull: this.item.allowNull,
            length: (this.item.length || 0) > 0 ? this.item.length : undefined,
            decimals: this.item.decimals,
            defaultValue: this.item.defaultValue,
            dateFormat: this.item.dateFormat,
            timeFormat: this.item.timeFormat,
            allowMultiSelect: this.item.allowMultiSelect,
            required: this.item.required,
            visible: this.item.visible,
            editable: this.item.editable,
            extraAttributes: JSON.stringify({ ...this.extraAttributes, dropdownOptions: this.dropdownOptions })
        });
        const codeSource = this.isEdit
            ? of(this.item.fieldCode || '')
            : this.fieldManagerService.previewFieldCode(fieldType.id!, fieldName, input.fieldLevelCode || '');
        codeSource
            .subscribe({
                next: code => {
                    input.fieldCode = code;
                    this.fieldManagerService.createField(input).subscribe({
                    next: () => {
                        this.notify.success(this.l('SavedSuccessfully') ?? 'Saved successfully');
                        this.saved.emit();
                        this.initialFormState = this.getFormState();
                        this.close();
                    },
                    error: () => this.notify.error('Could not save the field.')
                    });
                },
                error: () => this.notify.error('Could not generate the field code.')
            });
    }

    backToList(): void {
        this.router.navigate(['/app/main/fieldManager']);
    }

    close(): void {
        if (this.getFormState() === this.initialFormState) {
            this.active = false;
            this.modal.hide();
            this.closed.emit();
            return;
        }

          Swal.fire({
                            title: "",
                            text:  "Do you want to cancel and lose all your progress?",
                            icon: "info",
                            confirmButtonText:
                                "Ok",
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            backdrop: true,
                            customClass: {
                                popup: "popup-class",
                                icon: "icon-class",
                                content: "content-class",
                                actions: "actions-class",
                                confirmButton: "confirm-button-class2",
                            },
                    }).then((result) => {
                        if (result.isConfirmed) {
                            this.active = false;
                            this.modal.hide();
                            this.closed.emit();
                        }
                    });
                        
        
    }

    private getFormState(): string {
        return JSON.stringify({
            item: this.item,
            dropdownOptions: this.dropdownOptions
        });
    }

    addOption(): void {
        this.dropdownOptions.push({ option: '', value: '' });
    }

    removeOption(index: number): void {
        this.dropdownOptions.splice(index, 1);
    }

    generateCode(): void {
        if (this.isEdit) {
            return;
        }
        const fieldType = this.selectedFieldType;
        const request = ++this.codePreviewRequest;
        if (!fieldType || !this.item.fieldName.trim()) {
            this.item.fieldCode = '';
            return;
        }
        if (this.previewTimer) clearTimeout(this.previewTimer);
        const name = this.item.fieldName.trim();
        const level = this.item.fieldLevelCode || '';
        this.previewTimer = setTimeout(() => {
            this.fieldManagerService.previewFieldCode(fieldType.id!, name, level)
                .subscribe({ next: code => { if (request === this.codePreviewRequest) this.item.fieldCode = code; } });
        }, 250);
    }

    get selectedFieldType(): FieldLookupDto | undefined {
        return this.fieldTypes.find(type => type.id === this.item.fieldTypeId);
    }

    get selectedFieldTypeName(): string {
        return (this.selectedFieldType?.name || '').replace('--', ' - ');
    }

    get availableWidgets(): FieldLookupDto[] {
        const typeCode = this.selectedFieldType?.code;
        if (!typeCode) {
            return [];
        }

        return this.widgetTypes.filter(widget => (widget.code || '').startsWith(typeCode + '-'));
    }

    onFieldTypeChanged(typeId: number | undefined): void {
        this.item.fieldTypeId = typeId || 0;
        if (!this.availableWidgets.some(widget => widget.id === this.item.widgetTypeId)) {
            this.item.widgetTypeId = undefined;
        }
        this.generateCode();
    }

    private loadField(id: number): void {
        this.fieldManagerService.getFieldForEdit(id).subscribe({
            next: field => {
                this.item = field;
                this.extraAttributes = {};
                try { this.extraAttributes = JSON.parse(field.extraAttributes || '{}'); } catch (_) { this.extraAttributes = {}; }
                if (!this.extraAttributes || typeof this.extraAttributes !== 'object' || Array.isArray(this.extraAttributes)) {
                    this.extraAttributes = {};
                }
                this.entityParentId = field.entitySycObjectId ?? null;
                const fieldOptions = this.extraAttributes.dropdownOptions;
                this.dropdownOptions = Array.isArray(fieldOptions)
                    ? fieldOptions as { option: string; value: string }[]
                    : [];
                if (!this.fieldTypes.length) this.fieldManagerService.getFieldMetadata().subscribe({
                    next: metadata => {
                        this.fieldTypes = metadata.fieldTypes || [];
                        this.widgetTypes = metadata.widgetTypes || [];
                    }
                });
                this.isEdit = true;
                this.initialFormState = this.getFormState();
            },
            error: () => this.notify.error('Could not load the field.')
        });
    }

    private createEmptyItem(): AppFieldDto {
        return Object.assign(new AppFieldDto(), {
            fieldName: '',
            fieldCode: '',
            description: '',
            sycObjectId: 0,
            fieldTypeId: 0,
            fieldLevelCode: 'Application',
            fieldStatusCode: 'Proposed',
            trackingNo: '',
            isExtraField: false,
            allowNull: false,
            length: 0,
            decimals: 0,
            defaultValue: '',
            dateFormat: 'mm/dd/yyyy',
            timeFormat: '',
            allowMultiSelect: false,
            required: false,
            visible: true,
            editable: true,
            extraAttributes: '{}'
        });
    }
}
