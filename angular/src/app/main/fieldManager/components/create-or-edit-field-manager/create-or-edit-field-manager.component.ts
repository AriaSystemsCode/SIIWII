import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FieldManagerItem } from '../../field-manager.model';
import { FieldManagerLookup, FieldManagerService } from '../../field-manager.service';
import Swal from 'sweetalert2';
import { of } from 'rxjs';
import { AppFieldDto, CreateOrEditFieldInput } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-create-or-edit-field-manager',
    templateUrl: './create-or-edit-field-manager.component.html',
    styleUrls: ['./create-or-edit-field-manager.component.scss']
})
export class CreateOrEditFieldManagerComponent extends AppComponentBase implements OnInit {
    @ViewChild('fieldManagerModal', { static: true }) modal!: ModalDirective;
    @Output() saved = new EventEmitter<void>();
    @Output() closed = new EventEmitter<void>();
    item: FieldManagerItem = this.createEmptyItem();
    isEdit = false;
    active = false;
    activeTab: 'field-info' = 'field-info';
    dropdownOptions: { option: string, value: string }[] = [];
    isHost :boolean=false;
    fieldTypes: FieldManagerLookup[] = [];
    widgetTypes: FieldManagerLookup[] = [];
    selectedObjectTypeId: number | null = null;
    entityParentId: number | null = null;
    private codePreviewRequest = 0;
    private previewTimer: ReturnType<typeof setTimeout> | null = null;
    private initialFormState = '';
    private loadedField: AppFieldDto | null = null;
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
                this.fieldTypes = metadata.fieldTypes;
                this.widgetTypes = metadata.widgetTypes;
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

    show(id?: number, fromExisting = false, tableName?: string, entityId?: number | null,
        objectTypeId?: number | null, entityParentId?: number | null): void {
        this.activeTab = 'field-info';
        this.isEdit = !!id;
        this.selectedObjectTypeId = objectTypeId || null;
        this.entityParentId = entityParentId || null;
        if (id) {
            this.loadField(id);
        } else {
            this.loadedField = null;
            this.extraAttributes = {};
            this.item = this.createEmptyItem();
            this.dropdownOptions = [];
            if (!this.isHost) {
                this.item.fieldLevel = 'Tenant';
            }
            if (tableName) {
                this.item.tables = tableName;
            }
            if (entityId !== undefined && entityId !== null) {
                this.item.entityId = entityId;
            }
            if (fromExisting) {
                this.item.status = 'Proposed';
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
        this.item.dropdownOptions = this.dropdownOptions
            .filter(option => option.option.trim().length > 0 || option.value.trim().length > 0)
            .map(option => ({
                option: option.option.trim(),
                value: option.value.trim()
            }));
        const fieldType = this.selectedFieldType;
        if (!fieldType || !this.item.name.trim()) {
            this.notify.error('Select a field type and enter a field name.');
            return;
        }
        if (!this.item.entityId) {
            this.notify.error('Select an entity or data object for the field.');
            return;
        }
        const input = new CreateOrEditFieldInput();
        Object.assign(input, {
            id: this.isEdit ? this.item.id : undefined,
            sycObjectId: this.item.entityId,
            entitySycObjectId: this.entityParentId ?? undefined,
            selectedObjectTypeId: this.isEdit ? undefined : this.selectedObjectTypeId ?? undefined,
            fieldTypeId: fieldType.id,
            widgetTypeId: this.item.widgetTypeId ?? undefined,
            fieldLevelId: this.loadedField?.fieldLevelId,
            fieldStatusId: this.loadedField?.fieldStatusId,
            fieldName: this.item.name.trim(),
            description: this.item.description,
            fieldLevelCode: this.item.fieldLevel,
            fieldStatusCode: this.item.status,
            trackingNo: this.item.trackingNumber,
            isExtraField: this.item.extraData,
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
            extraAttributes: JSON.stringify({ ...this.extraAttributes, dropdownOptions: this.item.dropdownOptions })
        });
        const codeSource = this.isEdit
            ? of(this.item.code)
            : this.fieldManagerService.previewFieldCode(fieldType.id, input.fieldName, input.fieldLevelCode);
        codeSource
            .subscribe({
                next: code => {
                    input.fieldCode = code;
                    this.fieldManagerService.createField(input).subscribe({
                    next: () => {
                        this.notify.success(this.l('SavedSuccessfully'));
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
        if (!fieldType || !this.item.name.trim()) {
            this.item.code = '';
            return;
        }
        if (this.previewTimer) clearTimeout(this.previewTimer);
        const name = this.item.name.trim();
        const level = this.item.fieldLevel;
        this.previewTimer = setTimeout(() => {
            this.fieldManagerService.previewFieldCode(fieldType.id, name, level)
                .subscribe({ next: code => { if (request === this.codePreviewRequest) this.item.code = code; } });
        }, 250);
    }

    get selectedFieldType(): FieldManagerLookup | undefined {
        return this.fieldTypes.find(type => type.name.replace('--', ' - ') === this.item.type);
    }

    get availableWidgets(): FieldManagerLookup[] {
        const typeCode = this.selectedFieldType?.code;
        return typeCode ? this.widgetTypes.filter(widget => widget.code.startsWith(typeCode + '-')) : [];
    }

    onFieldTypeChanged(typeName: string): void {
        this.item.type = typeName;
        if (!this.availableWidgets.some(widget => widget.id === this.item.widgetTypeId)) {
            this.item.widgetTypeId = undefined;
        }
        this.generateCode();
    }

    private loadField(id: number): void {
        this.fieldManagerService.getFieldForEdit(id).subscribe({
            next: field => {
                this.loadedField = field;
                this.extraAttributes = {};
                try { this.extraAttributes = JSON.parse(field.extraAttributes || '{}'); } catch (_) { this.extraAttributes = {}; }
                if (!this.extraAttributes || typeof this.extraAttributes !== 'object' || Array.isArray(this.extraAttributes)) {
                    this.extraAttributes = {};
                }
                this.item = {
                    ...this.createEmptyItem(),
                    id: field.id,
                    code: field.fieldCode,
                    name: field.fieldName,
                    description: field.description || '',
                    entityId: field.sycObjectId,
                    status: field.fieldStatusCode,
                    fieldLevel: field.fieldLevelCode,
                    trackingNumber: field.trackingNo || '',
                    extraData: field.isExtraField,
                    widgetTypeId: field.widgetTypeId,
                    allowNull: field.allowNull,
                    length: field.length || 0,
                    decimals: field.decimals || 0,
                    defaultValue: field.defaultValue || '',
                    dateFormat: field.dateFormat || '',
                    timeFormat: field.timeFormat || '',
                    allowMultiSelect: field.allowMultiSelect,
                    required: field.required,
                    visible: field.visible,
                    editable: field.editable,
                    dropdownOptions: Array.isArray(this.extraAttributes.dropdownOptions) ? this.extraAttributes.dropdownOptions : []
                };
                this.entityParentId = field.entitySycObjectId || null;
                this.dropdownOptions = [...(this.item.dropdownOptions || [])];
                const setType = () => {
                    const type = this.fieldTypes.find(type => type.id === field.fieldTypeId);
                    if (type) this.item.type = type.name.replace('--', ' - ');
                };
                if (this.fieldTypes.length) setType();
                else this.fieldManagerService.getFieldMetadata().subscribe({
                    next: metadata => {
                        this.fieldTypes = metadata.fieldTypes;
                        this.widgetTypes = metadata.widgetTypes;
                        setType();
                    }
                });
                this.isEdit = true;
                this.initialFormState = this.getFormState();
            },
            error: () => this.notify.error('Could not load the field.')
        });
    }

    private createEmptyItem(): FieldManagerItem {
        return {
            id: 0,
            code: '',
            name: '',
            description: '',
            type: '',
            createdUser: '',
            entityId: 0,
            tables: '',
            status: 'Proposed',
            revision: 0,
            revisionSequence: '00',
            fieldLevel: 'Application',
            trackingNumber: '',
            allowNull: false,
            length: 0,
            allowMultiSelect: false,
            decimals: 0,
            dateFormat: 'mm/dd/yyyy',
            defaultValue: '',
            visible: true,
            editable: true,
            dropdownOptions: [],
            extraData: false,
            required: false,
            active: true
        };
    }
}
