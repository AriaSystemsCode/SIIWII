
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
