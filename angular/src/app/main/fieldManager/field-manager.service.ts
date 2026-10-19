import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
    AppFieldDto,
    AppFieldHistoryDto,
    AppFieldListDto,
    AppFieldManagerServiceProxy,
    FieldCreateOrEditMetadataDto,
    FieldLookupDto,
    FieldManagerPermissionDto,
    CreateOrEditFieldInput,
    EntityDtoOfInt64,
    LinkExistingFieldsInput,
    LinkExistingFieldsResultDto,
    ObjectTypeTreeNodeDto,
    PreviewFieldCodeInput
} from '@shared/service-proxies/service-proxies';

@Injectable()
export class FieldManagerService {
    private readonly pageSize = 1000;

    constructor(private appFieldManagerProxy: AppFieldManagerServiceProxy) { }

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
