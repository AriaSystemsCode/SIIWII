import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
    AppFieldDto,
    AppFieldListDto,
    AppFieldManagerServiceProxy,
    AssignExistingFieldInput,
    CreateOrEditFieldInput,
    EntityDtoOfInt64,
    ObjectTypeTreeNodeDto,
    PreviewFieldCodeInput
} from '@shared/service-proxies/service-proxies';
import { FieldManagerEntityNode, FieldManagerItem } from './field-manager.model';

export interface FieldManagerLookup {
    id: number;
    code: string;
    name: string;
}

export interface FieldManagerMetadata {
    fieldTypes: FieldManagerLookup[];
    widgetTypes: FieldManagerLookup[];
}

export interface FieldManagerPermissions {
    canViewPage: boolean;
    canCreateField: boolean;
    canEditField: boolean;
    canDeleteField: boolean;
    canDuplicateField: boolean;
    canAddExistingField: boolean;
}

@Injectable()
export class FieldManagerService {
    private readonly pageSize = 1000;

    constructor(private appFieldManagerProxy: AppFieldManagerServiceProxy) { }

    getEntityTree(): Observable<FieldManagerEntityNode[]> {
        const toNode = (node: ObjectTypeTreeNodeDto): FieldManagerEntityNode => ({
            id: node.id,
            key: node.key || '',
            name: node.name || '',
            code: node.code || '',
            nodeType: node.nodeType as FieldManagerEntityNode['nodeType'],
            sycObjectId: node.sycObjectId,
            children: (node.children || []).map(toNode)
        });
        return this.appFieldManagerProxy.getObjectTypeTree()
            .pipe(map(nodes => (nodes || []).map(toNode)));
    }

    getPagePermissions(): Observable<FieldManagerPermissions> {
        return this.appFieldManagerProxy.getPagePermissions();
    }

    getFieldsForNode(node: FieldManagerEntityNode | null): Observable<FieldManagerItem[]> {
        return this.getFieldPage(node, 0)
            .pipe(map(fields => fields.filter(field => !field.isHidden).map(field => this.toListItem(field))));
    }

    private getFieldPage(node: FieldManagerEntityNode | null, skipCount: number): Observable<AppFieldListDto[]> {
        const selectedObjectTypeId = node?.nodeType === 'ObjectType' ? node.id : undefined;
        const selectedObjectId = node && node.nodeType !== 'ObjectType' ? node.sycObjectId : undefined;
        return this.appFieldManagerProxy.getFields(
            selectedObjectId, selectedObjectTypeId, true,
            undefined, undefined, undefined, undefined, undefined, undefined, undefined,
            undefined, undefined, undefined, undefined, undefined, undefined,
            skipCount, this.pageSize
        ).pipe(switchMap(response => {
            const items = response.items || [];
            const nextSkipCount = skipCount + items.length;
            return items.length && nextSkipCount < response.totalCount
                ? this.getFieldPage(node, nextSkipCount).pipe(map(next => [...items, ...next]))
                : of(items);
        }));
    }

    private toListItem(field: AppFieldListDto): FieldManagerItem {
        const revisionSequence = field.revisionNo || '00';
        return {
            serverManaged: true,
            canEdit: field.canEdit,
            canDelete: field.canDelete,
            canHide: field.canHide,
            id: field.id,
            code: field.fieldCode || '',
            name: field.fieldName || '',
            description: field.description || '',
            type: (field.fieldTypeName || '').replace('--', ' - '),
            createdUser: field.creatorUserId == null ? '' : String(field.creatorUserId),
            entityId: field.sycObjectId,
            tables: (field.tables || []).join(', '),
            status: field.statusName || '',
            revision: Number(revisionSequence) || 0,
            revisionSequence,
            fieldLevel: field.fieldLevelName || '',
            trackingNumber: field.trackingNo || '',
            extraData: field.isExtraField,
            active: field.statusName === 'Active'
        };
    }

    getFieldMetadata(): Observable<FieldManagerMetadata> {
        return this.appFieldManagerProxy.getFieldCreateOrEditMetadata()
            .pipe(map(response => {
                const toLookup = (values: typeof response.fieldTypes): FieldManagerLookup[] =>
                    (values || []).filter(value => value.id != null).map(value => ({
                        id: value.id!,
                        code: value.code || '',
                        name: value.name || ''
                    }));
                return {
                    fieldTypes: toLookup(response.fieldTypes),
                    widgetTypes: toLookup(response.widgetTypes)
                };
            }));
    }

    getFieldForEdit(id: number): Observable<AppFieldDto> {
        return this.appFieldManagerProxy.getFieldForEdit(id).pipe(map(response => {
            if (!response.field) throw new Error('Field details were not returned.');
            return response.field;
        }));
    }

    getFieldDetails(item: FieldManagerItem): Observable<FieldManagerItem> {
        return forkJoin({ field: this.getFieldForEdit(item.id), metadata: this.getFieldMetadata() }).pipe(
            map(({ field, metadata }) => this.toDetailedItem(field, item, metadata))
        );
    }

    getFieldDetailsById(id: number): Observable<FieldManagerItem> {
        return forkJoin({ field: this.getFieldForEdit(id), metadata: this.getFieldMetadata() }).pipe(
            map(({ field, metadata }) => this.toDetailedItem(field, {
                id: field.id || id,
                code: field.fieldCode || '',
                name: field.fieldName || '',
                description: field.description || '',
                type: (metadata.fieldTypes.find(type => type.id === field.fieldTypeId)?.name || '').replace('--', ' - '),
                createdUser: field.creatorUserId == null ? '' : String(field.creatorUserId),
                entityId: field.sycObjectId,
                tables: '',
                status: field.fieldStatusCode || '',
                revision: Number(field.currentRevisionNo) || 0,
                revisionSequence: field.currentRevisionNo || '00',
                fieldLevel: field.fieldLevelCode || '',
                trackingNumber: field.trackingNo || '',
                extraData: field.isExtraField,
                active: field.fieldStatusCode === 'Active'
            }, metadata))
        );
    }

    private toDetailedItem(field: AppFieldDto, item: FieldManagerItem, metadata: FieldManagerMetadata): FieldManagerItem {
        let attributes: { dropdownOptions?: { option: string; value: string }[] } = {};
        try { attributes = JSON.parse(field.extraAttributes || '{}'); } catch (_) { attributes = {}; }
        if (!attributes || typeof attributes !== 'object') attributes = {};
        return {
                ...item,
                widgetTypeId: field.widgetTypeId,
                widgetName: metadata.widgetTypes.find(widget => widget.id === field.widgetTypeId)?.name || '',
                code: field.fieldCode || '',
                name: field.fieldName || '',
                description: field.description || '',
                entityId: field.sycObjectId,
                status: field.fieldStatusCode || '',
                revisionSequence: field.currentRevisionNo || '00',
                revision: Number(field.currentRevisionNo) || 0,
                fieldLevel: field.fieldLevelCode || '',
                trackingNumber: field.trackingNo || '',
                extraData: field.isExtraField,
                allowNull: field.allowNull,
                length: field.length,
                decimals: field.decimals,
                defaultValue: field.defaultValue,
                dateFormat: field.dateFormat,
                timeFormat: field.timeFormat,
                allowMultiSelect: field.allowMultiSelect,
                required: field.required,
                visible: field.visible,
                editable: field.editable,
                dropdownOptions: Array.isArray(attributes.dropdownOptions) ? attributes.dropdownOptions : [],
                active: field.fieldStatusCode === 'Active'
        };
    }

    previewFieldCode(fieldTypeId: number, fieldName: string, fieldLevelCode: string): Observable<string> {
        return this.appFieldManagerProxy.previewFieldCode(
            new PreviewFieldCodeInput({ fieldTypeId, fieldName, fieldLevelCode })
        ).pipe(map(response => response.fieldCode || ''));
    }

    createField(input: CreateOrEditFieldInput): Observable<AppFieldDto> {
        return this.appFieldManagerProxy.createOrEditField(input);
    }

    assignExistingField(appFieldId: number, sycObjectId: number, sycEntityObjectTypeId: number | null): Observable<any> {
        return this.appFieldManagerProxy.assignExistingField(new AssignExistingFieldInput({
            appFieldId, sycObjectId, sycEntityObjectTypeId: sycEntityObjectTypeId ?? undefined
        }));
    }

    deleteServerField(id: number): Observable<any> {
        return this.appFieldManagerProxy.deleteField(id);
    }

    duplicateField(id: number): Observable<AppFieldDto> {
        return this.appFieldManagerProxy.duplicateField(new EntityDtoOfInt64({ id }));
    }

    hideField(id: number): Observable<void> {
        return this.appFieldManagerProxy.hideField(new EntityDtoOfInt64({ id }));
    }
}
