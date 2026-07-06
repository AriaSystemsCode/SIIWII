
export interface EntityLeftPanelSection {
  key: string;
  title: string;
  type: 'tree' | 'list';
  canAdd?: boolean;
  items: EntityLeftPanelItem[];
}

export interface EntityLeftPanelItem {
  id: number | string;
  label: string;
  icon?: string;
  imageUrl?: string;
  expanded?: boolean;
  children?: EntityLeftPanelItem[];
}
export interface EntityBasicInfoField {
  key: string;
  label: string;
  type: 'text' | 'dropdown';
  valuePath: string;
  options?: any[];
  optionLabel?: string;
  optionValue?: string;
  readonly?: boolean;
}