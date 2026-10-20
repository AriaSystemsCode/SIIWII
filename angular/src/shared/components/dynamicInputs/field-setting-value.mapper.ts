import * as moment from 'moment';
import {
    AppEntityExtraDataDto,
    ExtraAttribute,
    FieldSettingValueDto
} from '@shared/service-proxies/service-proxies';

export interface DynamicFieldSettingSelection {
    attributeId: number;
    value: unknown;
    isLookup?: boolean;
    acceptMultipleValues?: boolean;
}

function serializeValue(value: unknown): string | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    if (value instanceof Date) return isNaN(value.getTime()) ? undefined : value.toISOString();
    if (moment.isMoment(value)) return value.isValid() ? value.toISOString() : undefined;
    if (typeof value === 'number' && !Number.isFinite(value)) return undefined;
    return String(value);
}

function lookupId(value: string | undefined): number | undefined {
    if (!value || !/^\d+$/.test(value)) return undefined;
    const id = Number(value);
    return Number.isSafeInteger(id) ? id : undefined;
}

function selectedValue(value: AppEntityExtraDataDto, definition?: ExtraAttribute): unknown {
    const text = value.attributeValue ??
        (value.attributeValueId === undefined ? undefined : String(value.attributeValueId));
    if (text === undefined) return undefined;
    if (definition?.isLookup) return value.attributeValueId ?? lookupId(text) ?? text;

    const type = (definition?.dataType || '').toLowerCase();
    if (type.includes('date') || type.includes('time')) {
        const date = new Date(text);
        return isNaN(date.getTime()) ? text : date;
    }
    if (type.includes('numeric') || type.includes('number') || type.includes('decimal') || type === 'int') {
        const number = Number(text);
        return Number.isFinite(number) ? number : text;
    }
    return text;
}

/** Field Manager values to the extra-data shape used by dynamic inputs. */
export function fieldSettingValuesToAppEntityExtraData(
    values: FieldSettingValueDto[], definitions: ExtraAttribute[] = [], entityId = 0
): AppEntityExtraDataDto[] {
    return (values || []).map(value => {
        const definition = definitions.find(item => item.attributeId === value.settingFieldId);
        const extra = new AppEntityExtraDataDto();
        extra.id = 0;
        extra.entityId = entityId;
        extra.attributeId = value.settingFieldId;
        extra.attributeCode = value.settingFieldCode ?? definition?.code;
        extra.attributeValue = value.value;
        extra.attributeValueId = definition?.isLookup ? lookupId(value.value) : undefined;
        return extra;
    });
}

/** Extra-data rows to the value-only Field Manager save contract. */
export function appEntityExtraDataToFieldSettingValues(
    values: AppEntityExtraDataDto[], definitions: ExtraAttribute[] = []
): FieldSettingValueDto[] {
    return (values || []).map(value => {
        const definition = definitions.find(item => item.attributeId === value.attributeId);
        const setting = new FieldSettingValueDto();
        setting.settingFieldId = value.attributeId;
        setting.settingFieldCode = value.attributeCode ?? definition?.code;
        setting.settingFieldName = definition?.name;
        setting.value = value.attributeValue ??
            (value.attributeValueId === undefined ? undefined : String(value.attributeValueId));
        return setting;
    });
}

/** Adapt the dynamic component's change event before converting to field settings. */
export function dynamicSelectionsToAppEntityExtraData(
    selections: DynamicFieldSettingSelection[], definitions: ExtraAttribute[] = [], entityId = 0
): AppEntityExtraDataDto[] {
    return (selections || []).reduce((rows, selection) => {
        const definition = definitions.find(item => item.attributeId === selection.attributeId);
        const values = selection.acceptMultipleValues
            ? (Array.isArray(selection.value) ? selection.value : [])
            : [selection.value];
        for (const selected of values) {
            const text = serializeValue(selected);
            if (text === undefined) continue;
            const extra = new AppEntityExtraDataDto();
            extra.id = 0;
            extra.entityId = entityId;
            extra.attributeId = selection.attributeId;
            extra.attributeCode = definition?.code;
            extra.attributeValue = text;
            extra.attributeValueId = selection.isLookup ? lookupId(text) : undefined;
            rows.push(extra);
        }
        return rows;
    }, [] as AppEntityExtraDataDto[]);
}

/** Convert mapped extra-data values to the control value expected by dynamic inputs. */
export function appEntityExtraDataToSelectedValues(
    values: AppEntityExtraDataDto[], definition: ExtraAttribute
): unknown {
    const selections = (values || [])
        .filter(value => value.attributeId === definition.attributeId)
        .map(value => selectedValue(value, definition))
        .filter(value => value !== undefined);
    return definition.acceptMultipleValues
        ? selections
        : (selections[0] ?? definition.defaultValue);
}
