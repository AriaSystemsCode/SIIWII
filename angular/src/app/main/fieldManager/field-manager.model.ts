    /////i51-Instead of BE Integration
export interface FieldManagerDropdownOption {
    option: string;
    value: string;
}

export interface FieldManagerEntityNode {
    id: number;
    key: string;
    name: string;
    code: string;
    nodeType: 'Entity' | 'DataObject' | 'ObjectType';
    sycObjectId: number;
    children?: FieldManagerEntityNode[];
}

export interface FieldManagerItem {
    serverManaged?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    canHide?: boolean;
    widgetTypeId?: number;
    widgetName?: string;
    id: number;
    code: string;
    name: string;
    description: string;
    type: string;
    createdUser: string;
    entityId: number;
    tables: string;
    status: string;
    revision: number;
    revisionSequence: string;
    fieldLevel: string;
    trackingNumber: string;
    allowNull?: boolean;
    length?: number;
    allowMultiSelect?: boolean;
    decimals?: number;
    dateFormat?: string;
    timeFormat?: string;
    defaultValue?: string;
    visible?: boolean;
    editable?: boolean;
    dropdownOptions?: FieldManagerDropdownOption[];
    extraData: boolean;
    required?: boolean;
    active: boolean;
}
