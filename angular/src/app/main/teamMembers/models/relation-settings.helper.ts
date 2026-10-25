import { AppEntityExtraDataDto, CreateOrEditAccountInfoDto } from '@shared/service-proxies/service-proxies';

export const RELATION_DEFINITION_CODE = 'B00P';
export const RELATION_ENTITY_TYPE = 'MARKETPLACECONTACTRELATIONSHIP';
export const RELATION_ATTR = { JOB_TITLE: 706, JOIN_DATE: 707, BRANCH: 718 } as const;
export const RELATION_ATTRIBUTE_IDS: number[] = [
  RELATION_ATTR.JOB_TITLE,
  RELATION_ATTR.JOIN_DATE,
  RELATION_ATTR.BRANCH
];

/** Picks job title / join date / branch from the B00P definition, in a fixed order. */
export function extractRelationAttributes(result: any[]): { entityObjectTypeId: number; attributes: any[] } {
  const definition = result?.find(x => x.code === RELATION_DEFINITION_CODE);

  const attributes = (definition?.extraAttributes?.extraAttributes || [])
    .filter(a => RELATION_ATTRIBUTE_IDS.includes(Number(a.attributeId)))
    .sort((a, b) =>
      RELATION_ATTRIBUTE_IDS.indexOf(Number(a.attributeId)) -
      RELATION_ATTRIBUTE_IDS.indexOf(Number(b.attributeId)))
    .map(a => ({
      ...a,
      paginationSetting: { skipCount: 0, maxResultCount: 10, totalCount: 0, list: [] }
    }));

  return { entityObjectTypeId: definition?.id, attributes };
}

/** Builds the two objects <app-dynamicInputs> needs (a separate copy, so edits never touch the view data). */
export function buildRelationInputs(attributes: any[], getValue: (attributeId: number) => any) {
  const cloned = attributes.map(a => ({
    ...a,
    paginationSetting: { ...a.paginationSetting, list: [...(a.paginationSetting?.list || [])] }
  }));

  return {
    relationInputsDto: {
      extraDataAttributes: cloned.map(a => {
        const id = Number(a.attributeId);
        const value = getValue(id);
        return {
          extraAttributeId: id,
          selectedValues: value !== '' && value != null ? [{ value }] : []
        };
      })
    },
    relationAttributeObject: {
      value: { filteredExtraAttributes: cloned, extraAttributes: cloned }
    }
  };
}

export function collectRelationChanges(store: Map<number, any>, changes: any[]): void {
  for (const change of changes || []) {
    const attributeId = Number(change.attributeId);
    if (RELATION_ATTRIBUTE_IDS.includes(attributeId)) {
      store.set(attributeId, { ...change, attributeId });
    }
  }
}

export function clearRelationChange(store: Map<number, any>, attributeId: number): void {
  const id = Number(attributeId);
  if (RELATION_ATTRIBUTE_IDS.includes(id)) {
    store.set(id, { attributeId: id, value: '' });
  }
}

/** Merges the changed relation attributes into the DTO and applies the branch -> parentId contract. */
export function applyRelationChanges(
  dto: CreateOrEditAccountInfoDto,
  changes: Map<number, any>,
  entityObjectTypeId: number
): void {
  const list = Array.from(changes.values());
  const changedIds = new Set(list.map(c => Number(c.attributeId)));

  dto.entityExtraData = [
    ...(dto.entityExtraData || []).filter(i => !changedIds.has(Number(i.attributeId))),
    ...list.map(c => {
      const d = new AppEntityExtraDataDto();
      d.attributeId = Number(c.attributeId);
      d.entityObjectTypeId = entityObjectTypeId;
      d.attributeValue = c.value == null ? '' : String(c.value);
      return d;
    })
  ];

  const branch = changes.get(RELATION_ATTR.BRANCH);
  if (branch) {
    dto.parentId = branch.value === '' || branch.value == null ? (null as any) : Number(branch.value);
  }
}