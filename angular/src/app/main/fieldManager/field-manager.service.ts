import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
    AppFieldDto,
    AppFieldHistoryDto,
    AppFieldListDto,
    AppFieldManagerServiceProxy,
    FieldCreateOrEditMetadataDto,
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
        //i51_BE-FE-Get the data of Field Type dropdown inside create or edit modal 
        //i51_BE-FE-fieldtypes => []  => id ,code,name
        //i51_BE-FE-field level 
        //i51_BE-FE-field status  
        //i51_BE-FE-translation
        return this.appFieldManagerProxy.getFieldCreateOrEditMetadata();
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

    previewFieldCode(fieldTypeId: number, fieldName: string, fieldLevelCode: string): Observable<string> {
        return this.appFieldManagerProxy.previewFieldCode(
            new PreviewFieldCodeInput({ fieldTypeId, fieldName, fieldLevelCode })
        ).pipe(map(response => response.fieldCode || ''));
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
