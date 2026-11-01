import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
    AppFieldDto,
    AppFieldHistoryDto,
    AppFieldListDto,
    AppFieldManagerServiceProxy,
    FieldCreateOrEditMetadataDto,
    ExtraAttribute,
    FieldLookupDto,
    FieldManagerPermissionDto,
    CreateOrEditFieldInput,
    FieldSettingValueDto,
    EntityDtoOfInt64,
    LinkExistingFieldsInput,
    LinkExistingFieldsResultDto,
    ObjectTypeTreeNodeDto,
    PreviewFieldCodeInput
} from '@shared/service-proxies/service-proxies';

type DtoConstructor<T extends object> = {
    new (...args: any[]): T;
    fromJS?: (data: any) => T;
};

@Injectable()
export class FieldManagerService {
    private readonly pageSize = 1000;

    constructor(private appFieldManagerProxy: AppFieldManagerServiceProxy) { }

    mapDto<TSource, TTarget extends object>(source: TSource, targetType: DtoConstructor<TTarget>): TTarget {
        if (source === null || source === undefined) {
            return new targetType();
        }

        const sourceData = source as any;
        const data = typeof sourceData.toJSON === 'function'
            ? sourceData.toJSON()
            : sourceData;

        return targetType.fromJS
            ? targetType.fromJS(data)
            : Object.assign(new targetType(), data);
    }

    mapExtraAttributeValuesToSettings(
        values: any[],
        definitions: ExtraAttribute[],
        attributes: any[]
    ): FieldSettingValueDto[] {
        return (values || []).reduce((mapped: FieldSettingValueDto[], entry: any) => {
            const definition = definitions.find(item => item.attributeId === entry.attributeId);
            const attribute = (attributes || []).find(item => item.attributeId === entry.attributeId);
            const dataType = (definition?.dataType || '').toLowerCase();
            const isMultiple = entry.acceptMultipleValues === true || dataType === 'chips';
            const selectedValues = isMultiple
                ? (Array.isArray(entry.value) ? entry.value : [])
                : [entry.value];

            selectedValues.forEach((selectedValue: any) => {
                if (selectedValue === undefined || selectedValue === null || selectedValue === '') return;

                const isOptionObject = typeof selectedValue === 'object' && selectedValue !== null &&
                    Object.prototype.hasOwnProperty.call(selectedValue, 'value');
                const selectedId = isOptionObject ? selectedValue.value : selectedValue;
                const selectedCode = isOptionObject ? selectedValue.code : undefined;
                const option = entry.isLookup
                    ? attribute?.paginationSetting?.list?.find((item: any) =>
                        String(item.value) === String(selectedId) || item.code === selectedCode
                    )
                    : undefined;
                const setting = new FieldSettingValueDto();
                setting.settingFieldId = entry.attributeId;
                setting.settingFieldCode = definition?.code;
                setting.settingFieldName = definition?.name;
                const mappedValue = option?.label != null
                    ? String(option.label)
                    : dataType.includes('date') || dataType.includes('time')
                        ? (selectedId instanceof Date ? selectedId.toISOString() : String(selectedId))
                        : String(selectedId);
                setting.value = mappedValue;

                if (option) {
                    setting.appFieldsOptionId = option.value;
                    setting.optionCode = option.code;
                    setting.optionName = option.label;
                }

                mapped.push(setting);
            });

            return mapped;
        }, []);
    }

    getEntityTree(): Observable<ObjectTypeTreeNodeDto[]> {
        return this.appFieldManagerProxy.getObjectTypeTree();
    }

    getPagePermissions(): Observable<FieldManagerPermissionDto> {
        return this.appFieldManagerProxy.getPagePermissions();
    }

    getFieldsForNode(node: ObjectTypeTreeNodeDto | null): Observable<AppFieldListDto[]> {
        return this.getFieldPage(node, 0)
            .pipe(map(fields => fields.filter(field => !field.isHidden)));
    }

    getUnlinkedFields(tableId: number, sycEntityObjectTypeId: number | null): Observable<AppFieldDto[]> {
        return this.getUnlinkedFieldPage(tableId, sycEntityObjectTypeId ?? undefined, 0);
    }

    private getUnlinkedFieldPage(
        tableId: number,
        sycEntityObjectTypeId: number | undefined,
        skipCount: number
    ): Observable<AppFieldDto[]> {
        return this.appFieldManagerProxy.getUnlinkedFields(
            tableId, sycEntityObjectTypeId, undefined, undefined, skipCount, this.pageSize
        ).pipe(switchMap(response => {
            const items = response.items || [];
            const nextSkipCount = skipCount + items.length;
            return items.length && nextSkipCount < response.totalCount
                ? this.getUnlinkedFieldPage(tableId, sycEntityObjectTypeId, nextSkipCount)
                    .pipe(map(next => [...items, ...next]))
                : of(items);
        }));
    }

    private getFieldPage(node: ObjectTypeTreeNodeDto | null, skipCount: number): Observable<AppFieldListDto[]> {
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

    getFieldMetadata(): Observable<FieldCreateOrEditMetadataDto> {
        return this.appFieldManagerProxy.getFieldCreateOrEditMetadata();
    }

    getAvailableFieldLevels(
        fieldLevels: FieldLookupDto[],
        isHost: boolean,
        isEdit: boolean,
        currentFieldLevelCode?: string
    ): FieldLookupDto[] {
        return fieldLevels.filter(level => isHost || level.code === 'Tenant' ||
            (isEdit && level.code === currentFieldLevelCode));
    }

    setFieldLevel(item: AppFieldDto, code: string, fieldLevels: FieldLookupDto[]): void {
        item.fieldLevelCode = code;
        item.fieldLevelId = fieldLevels.find(level => level.code === code)?.id;
    }

    setFieldStatus(item: AppFieldDto, code: string, fieldStatuses: FieldLookupDto[]): void {
        item.fieldStatusCode = code;
        item.fieldStatusId = fieldStatuses.find(status => status.code === code)?.id;
    }

    syncFieldLookupIds(item: AppFieldDto, fieldLevels: FieldLookupDto[], fieldStatuses: FieldLookupDto[]): void {
        const level = fieldLevels.find(option => option.id === item.fieldLevelId) ||
            fieldLevels.find(option => option.code === item.fieldLevelCode);
        const status = fieldStatuses.find(option => option.id === item.fieldStatusId) ||
            fieldStatuses.find(option => option.code === item.fieldStatusCode);

        if (level) {
            item.fieldLevelId = level.id;
            item.fieldLevelCode = level.code;
        }
        if (status) {
            item.fieldStatusId = status.id;
            item.fieldStatusCode = status.code;
        }
    }

    getFieldLevelId(fieldLevels: FieldLookupDto[], code?: string, fallbackId?: number): number | undefined {
        return fieldLevels.find(level => level.code === code)?.id ?? fallbackId;
    }

    getFieldStatusId(fieldStatuses: FieldLookupDto[], code?: string, fallbackId?: number): number | undefined {
        return fieldStatuses.find(status => status.code === code)?.id ?? fallbackId;
    }

    getFieldForEdit(id: number): Observable<AppFieldDto> {
        return this.appFieldManagerProxy.getFieldForEdit(id).pipe(map(response => {
            if (!response.field) throw new Error('Field details were not returned.');
            return response.field;
        }));
    }    

    getFieldHistory(appFieldId: number): Observable<AppFieldHistoryDto[]> {
        return this.appFieldManagerProxy.getFieldHistory(appFieldId);
    }

    previewFieldCode(fieldTypeId: number): Observable<string> {
        return this.appFieldManagerProxy.previewFieldCode(
            new PreviewFieldCodeInput({ fieldTypeId })
        ).pipe(map(response => response.sequence || ''));
    }

    createField(input: CreateOrEditFieldInput): Observable<AppFieldDto> {
        return this.appFieldManagerProxy.createOrEditField(input);
    }

    linkExistingFields(tableId: number, sycEntityObjectTypeId: number | null, appFieldIds: number[]): Observable<LinkExistingFieldsResultDto> {
        return this.appFieldManagerProxy.linkExistingFields(new LinkExistingFieldsInput({
            tableId,
            sycEntityObjectTypeId: sycEntityObjectTypeId ?? undefined,
            appFieldIds
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
