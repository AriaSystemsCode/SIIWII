    /////i51-Instead of BE Integration
export interface FieldManagerDropdownOption {
    option: string;
    value: string;
}

export interface FieldManagerEntityNode {
    id: number;
    name: string;
    children?: FieldManagerEntityNode[];
}

export interface FieldManagerItem {
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
    fieldLevel: string;
    trackingNumber: string;
    allowNull: boolean;
    length: number;
    allowMultiSelect: boolean;
    decimals: number;
    dateFormat: string;
    defaultValue: string;
    visible: boolean;
    editable: boolean;
    dropdownOptions: FieldManagerDropdownOption[];
    extraData: boolean;
    required: boolean;
    active: boolean;
    canSync: boolean;
}
