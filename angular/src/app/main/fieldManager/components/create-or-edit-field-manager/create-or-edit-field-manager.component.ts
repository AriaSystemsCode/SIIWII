import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FieldManagerService } from '../../field-manager.service';
import { ExtraAttributeDataService } from '@app/main/app-items/app-item-shared/services/extra-attribute-data.service';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { AppFieldDto, CreateOrEditFieldInput, ExtraAttribute, ExtraAttributesSource, FieldCreateOrEditMetadataDto, FieldLookupDto, SycEntityObjectTypesServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-create-or-edit-field-manager',
    templateUrl: './create-or-edit-field-manager.component.html',
    styleUrls: ['./create-or-edit-field-manager.component.scss'],
    providers: [ExtraAttributeDataService]
})
export class CreateOrEditFieldManagerComponent extends AppComponentBase implements OnInit {
    @ViewChild('fieldManagerModal', { static: true }) modal!: ModalDirective;
    @Output() saved = new EventEmitter<AppFieldDto>();
    @Output() closed = new EventEmitter<void>();
    item: AppFieldDto = this.createEmptyItem();
    isEdit = false;
    active = false;
    activeTab: 'field-info' = 'field-info';
    dropdownOptions: { option: string, value: string }[] = [];
    isHost :boolean=false;
    fieldTypes: FieldLookupDto[] = [];
    widgetTypes: FieldLookupDto[] = [];
    fieldLevels: FieldLookupDto[] = [];
    fieldStatuses: FieldLookupDto[] = [];
    fieldTypeSettings: ExtraAttribute[] = [];
    dynamicInputsForViewDto: any;
    dynamicSettingsObject: any = { value: { extraAttributes: [], filteredExtraAttributes: [], header: 'AdvancedInformation' } };
    selectedObjectTypeId: number | null = null;
    entityParentId: number | null = null;
    private codePreviewRequest = 0;
    private previewTimer: ReturnType<typeof setTimeout> | null = null;
    private initialFormState = '';
    private extraAttributes: { [key: string]: any } = {};
    private expectedCurrentRevisionNo?: string;
    private isRevisionEdit = false;
    private fieldSettingsRequest = 0;

    constructor(
        injector: Injector,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private fieldManagerService: FieldManagerService,
        private sycEntityObjectTypesService: SycEntityObjectTypesServiceProxy,
        private extraAttributeDataService: ExtraAttributeDataService
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.isHost = !this.appSession.tenantId;
        this.fieldManagerService.getFieldMetadata().subscribe({
            next: metadata => {
                this.setFieldMetadata(metadata);
            },
            error: () => this.notify.error('Could not load field metadata.')
        });
        const id = Number(this.activatedRoute.snapshot.paramMap.get('id'));
        if (!id) {
            return;
        }
        this.loadField(id);
    }

    show(id?: number, fromExisting = false, _tableName?: string, entityId?: number | null,
        objectTypeId?: number | null, entityParentId?: number | null): void {
        this.activeTab = 'field-info';
        this.expectedCurrentRevisionNo = undefined;
        this.isRevisionEdit = false;
        this.isEdit = !!id;
        this.selectedObjectTypeId = objectTypeId || null;
        this.entityParentId = entityParentId || null;
        if (id) {
            this.item = this.createEmptyItem();
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
            this.setCreateDefaults();
            this.generateCode();
        }
        this.active = true;
        this.initialFormState = this.getFormState();
        this.modal.show();
    }

    showRevision(field: AppFieldDto, expectedCurrentRevisionNo?: string): void {
        this.activeTab = 'field-info';
        this.isEdit = true;
        this.isRevisionEdit = true;
        this.expectedCurrentRevisionNo = expectedCurrentRevisionNo;
        this.item = this.fieldManagerService.mapDto(field, AppFieldDto);
        this.selectedObjectTypeId = field.selectedObjectTypeId ?? null;
        this.entityParentId = field.entitySycObjectId ?? null;
        this.extraAttributes = {};
        try { this.extraAttributes = JSON.parse(field.extraAttributes || '{}'); } catch (_) { this.extraAttributes = {}; }
        if (!this.extraAttributes || typeof this.extraAttributes !== 'object' || Array.isArray(this.extraAttributes)) {
            this.extraAttributes = {};
        }
        const fieldOptions = this.extraAttributes.dropdownOptions;
        this.dropdownOptions = Array.isArray(fieldOptions)
            ? fieldOptions as { option: string; value: string }[]
            : [];
        this.fieldManagerService.syncFieldLookupIds(this.item, this.fieldLevels, this.fieldStatuses);
        if (this.item.fieldTypeId) this.loadFieldTypeSettings(this.item.fieldTypeId);
        this.active = true;
        this.initialFormState = this.getFormState();
        this.modal.show();
    }

    selectTab(tab: 'field-info', event: Event): void {
        event.preventDefault();
        this.activeTab = tab;
    }

    save(): void {
        debugger
         //i51_BE-FE- Extra Data  saving ???
         //i51 Whem chips !!
        //i51-BE-Define the expected behavior when two users attempt to create a new revision at the same time. If one user saves a revision number that has already been used by another user, the system should notify the second user and ask whether they want to continue with a different revision number or cancel the operation.
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
        const fieldName = this.item.fieldName.trim();
        const input = new CreateOrEditFieldInput();
        Object.assign(input, {
            id: this.isEdit ? this.item.id : undefined,
            expectedCurrentRevisionNo: this.isEdit
                ? this.expectedCurrentRevisionNo ?? this.item.currentRevisionNo
                : undefined,
            sycObjectId: this.item.sycObjectId,
            entitySycObjectId: this.entityParentId ?? undefined,
            selectedObjectTypeId: this.isRevisionEdit
                ? this.item.selectedObjectTypeId
                : this.isEdit ? undefined : this.selectedObjectTypeId ?? undefined,
            fieldTypeId: fieldType.id!,
            widgetTypeId: this.item.widgetTypeId ?? undefined,
            fieldLevelId: this.fieldManagerService.getFieldLevelId(this.fieldLevels, this.item.fieldLevelCode, this.item.fieldLevelId),
            fieldStatusId: this.fieldManagerService.getFieldStatusId(this.fieldStatuses, this.item.fieldStatusCode, this.item.fieldStatusId),
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
            extraAttributes: JSON.stringify({ ...this.extraAttributes, dropdownOptions: this.dropdownOptions }),
            settingValues: this.item.settingValues
        });

        input.fieldCode = this.item.fieldCode;
        this.fieldManagerService.createField(input).subscribe({
            next: savedField => {
                const revision = this.isEdit ? savedField.currentRevisionNo : undefined;
                this.notify.success(revision
                    ? `Revision #${revision} saved successfully.`
                    : (this.l('SavedSuccessfully') ?? 'Saved successfully'));
                this.item = savedField;
                this.saved.emit(savedField);
                this.initialFormState = this.getFormState();
                this.close();
            },
            error: () => this.notify.error('Could not save the field.')
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
        if (this.isEdit)
            return;

        const request = ++this.codePreviewRequest;
        if (this.previewTimer) clearTimeout(this.previewTimer);
        const name = this.item?.fieldName?.trim() || '';
        const level = this.item?.fieldLevelCode || '';
        const fieldTypeId = this.selectedFieldType?.id;
        if (!level || fieldTypeId == null) {
            return;
        }

        this.previewTimer = setTimeout(() => {
            this.fieldManagerService.previewFieldCode(fieldTypeId)
                .subscribe({ next: sequence => {
                    if (request !== this.codePreviewRequest) return;
                    const typeCode = this.selectedFieldType?.code || '';
                    this.item.fieldCode = `${typeCode.substring(0, 2)}${level.substring(0, 1)}${name.substring(0, 4)}${sequence}`;
                } });
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
        const typeChanged = this.item.fieldTypeId !== typeId;
        this.item.fieldTypeId = typeId || 0;
        if (typeChanged) this.item.settingValues = [];
        if (!this.availableWidgets.some(widget => widget.id === this.item.widgetTypeId)) {
            this.item.widgetTypeId = undefined;
        }
        if (this.item.fieldTypeId) this.loadFieldTypeSettings(this.item.fieldTypeId);
        else {
            ++this.fieldSettingsRequest;
            this.fieldTypeSettings = [];
            this.setDynamicFieldSettings([]);
        }
        this.generateCode();
    }

    onDynamicSettingsChanged(values: any[]): void {
        const incomingValues = values || [];
        const incomingAttributeIds = new Set(incomingValues.map(value => value.attributeId));
        const existingValues = (this.item.settingValues || []).filter(value =>
            !incomingAttributeIds.has(value.settingFieldId)
        );
        const updatedValues = this.fieldManagerService.mapExtraAttributeValuesToSettings(
            incomingValues,
            this.fieldTypeSettings,
            this.dynamicSettingsObject.value.filteredExtraAttributes
        );

        this.item.settingValues = [...existingValues, ...updatedValues];
    }

    get availableFieldLevels(): FieldLookupDto[] {
        return this.fieldManagerService.getAvailableFieldLevels(
            this.fieldLevels, this.isHost, this.isEdit, this.item.fieldLevelCode
        );
    }

    private setFieldMetadata(metadata: FieldCreateOrEditMetadataDto): void {
        this.fieldTypes = metadata.fieldTypes || [];
        this.widgetTypes = metadata.widgetTypes || [];
        this.fieldLevels = metadata.fieldLevels || [];
        this.fieldStatuses = metadata.fieldStatuses || [];

        this.fieldManagerService.syncFieldLookupIds(this.item, this.fieldLevels, this.fieldStatuses);
        if (this.active && !this.isEdit) {
            this.setCreateDefaults();
            this.initialFormState = this.getFormState();
            this.generateCode();
        } else if (this.item.fieldTypeId) {
            this.loadFieldTypeSettings(this.item.fieldTypeId);
        }
    }

    private setCreateDefaults(): void {
        const firstFieldType = this.fieldTypes[0];
        const firstFieldLevel = this.availableFieldLevels[0];
        const firstFieldStatus = this.fieldStatuses[0];

        if (firstFieldType && this.item.fieldTypeId !== firstFieldType.id) {
            this.item.settingValues = [];
            this.item.fieldTypeId = firstFieldType.id || 0;
        }
        if (firstFieldLevel) this.fieldManagerService.setFieldLevel(this.item, firstFieldLevel.code || '', this.fieldLevels);
        if (firstFieldStatus) this.fieldManagerService.setFieldStatus(this.item, firstFieldStatus.code || '', this.fieldStatuses);
        if (this.item.fieldTypeId) this.loadFieldTypeSettings(this.item.fieldTypeId);
    }

    private loadFieldTypeSettings(fieldTypeId: number): void {
        const request = ++this.fieldSettingsRequest;
        this.sycEntityObjectTypesService.getAllWithExtraAttributes(fieldTypeId, ExtraAttributesSource.AppFields).subscribe({
            next: objectTypes => {
                if (request !== this.fieldSettingsRequest) return;
                this.fieldTypeSettings = objectTypes?.[0]?.extraAttributes?.extraAttributes || [];
                this.setDynamicFieldSettings(this.fieldTypeSettings);
                this.loadFieldTypeSettingLookups(this.fieldTypeSettings, request);
            },
            error: () => {
                if (request === this.fieldSettingsRequest) {
                    this.fieldTypeSettings = [];
                    this.setDynamicFieldSettings([]);
                }
            }
        });
    }

    private setDynamicFieldSettings(settings: ExtraAttribute[]): void {
        const savedValues = this.item.settingValues || [];
        const attributes = settings.map(setting => {
            const saved = savedValues.filter(value => value.settingFieldId === setting.attributeId);
            const dataType = (setting.dataType || '').toLowerCase();
            const savedSelections = saved.map(value => value.appFieldsOptionId ?? value.value ?? value.valueText ?? value.valueNumber ??
                value.valueBoolean?.toString() ?? (value.valueDateTime ? value.valueDateTime.toDate() : undefined))
                .map(value => {
                    if (value == null) return value;
                    if ((dataType.includes('date') || dataType.includes('time')) && (moment as any)(value).isValid()) {
                        return (moment as any)(value).toDate();
                    }
                    return value;
                })
                .filter(value => value !== undefined && value !== null);
            const isChips = dataType === 'chips';
            const defaultSelections = isChips && typeof setting.defaultValue === 'string'
                ? setting.defaultValue.split('|').map(value => value.trim()).filter(Boolean)
                : setting.defaultValue;
            const selectedValues = setting.acceptMultipleValues || isChips
                ? (savedSelections.length ? savedSelections : [])
                : (savedSelections[0] ?? defaultSelections);

            return {
                ...setting,
                id: setting.attributeId,
                selectedValues: selectedValues ?? (setting.acceptMultipleValues || isChips ? [] : ''),
                paginationSetting: {
                    skipCount: 0,
                    maxResultCount: 10,
                    totalCount: 0,
                    list: []
                }
            };
        });

        this.dynamicSettingsObject = {
            value: {
                extraAttributes: attributes,
                filteredExtraAttributes: attributes,
                header: 'AdvancedInformation'
            }
        };
    }

    private loadFieldTypeSettingLookups(settings: ExtraAttribute[], request: number): void {
        settings.filter(setting => setting.isLookup && setting.entityObjectTypeCode).forEach(setting => {
            const entityObjectTypeCode = setting.entityObjectTypeCode;
            if (!entityObjectTypeCode) return;
            const attribute = this.dynamicSettingsObject.value.filteredExtraAttributes
                .find((item: any) => item.attributeId === setting.attributeId);
            this.extraAttributeDataService.getExtraAttributeLookupDataWithPaging(
                entityObjectTypeCode,
                0,
                10
            ).subscribe(result => {
                if (request !== this.fieldSettingsRequest || !attribute) return;
                attribute.paginationSetting.totalCount = result.totalCount;
                attribute.paginationSetting.list = result.items || [];
                if (attribute.paginationSetting.list.length < result.totalCount) {
                    attribute.paginationSetting.list.push({ value: -1, label: this.l('showMore') });
                }
                attribute.paginationSetting.skipCount = 10;
            });
        });
    }

    private loadField(id: number): void {
        this.fieldManagerService.getFieldForEdit(id).subscribe({
            next: field => {
                this.item = field;
                this.fieldManagerService.syncFieldLookupIds(this.item, this.fieldLevels, this.fieldStatuses);
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
                if (this.item.fieldTypeId) this.loadFieldTypeSettings(this.item.fieldTypeId);
                if (!this.fieldTypes.length) this.fieldManagerService.getFieldMetadata().subscribe({
                    next: metadata => {
                        this.setFieldMetadata(metadata);
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
