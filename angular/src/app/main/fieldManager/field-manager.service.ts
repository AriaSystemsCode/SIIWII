import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
    AppFieldDto,
    AppFieldListDto,
    AppFieldManagerServiceProxy,
    AssignExistingFieldInput,
    FieldCreateOrEditMetadataDto,
    FieldManagerPermissionDto,
    CreateOrEditFieldInput,
    EntityDtoOfInt64,
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

    getFieldForEdit(id: number): Observable<AppFieldDto> {
        return this.appFieldManagerProxy.getFieldForEdit(id).pipe(map(response => {
            if (!response.field) throw new Error('Field details were not returned.');
            return response.field;
        }));
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
