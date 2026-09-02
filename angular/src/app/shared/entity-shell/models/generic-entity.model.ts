import {
  EventEmitter,
  Type
} from '@angular/core';

/* =========================================================
 * LEFT PANEL
 * ========================================================= */

export interface EntityLeftPanelSection {
  key: string;
  title: string;

  type?: 'tree' | 'list';

  canAdd?: boolean;

  items: EntityLeftPanelItem[];
}

export interface EntityLeftPanelItem {
  id: number | string;
  label: string;

  icon?: string;
  imageUrl?: string;

  expanded?: boolean;

  data?: any;
  context?: any;

  children?: EntityLeftPanelItem[];
}

/* =========================================================
 * ENTITY MODES
 * ========================================================= */

export type EntityMode =
  | 'create'
  | 'edit'
  | 'view';

export type GenericEntityMode =
  | 'create'
  | 'edit'
  | 'view';

/* =========================================================
 * BASIC INFO FIELDS
 * ========================================================= */

export interface EntityBasicInfoField {
  key: string;
  label: string;

  type:
  | 'text'
  | 'dropdown';

  valuePath: string;

  options?: any[];

  optionLabel?: string;
  optionValue?: string;

  readonly?: boolean;

  /*
   * Optional mode-specific editing rules.
   */
  editableInCreate?: boolean;
  editableInEdit?: boolean;

  /*
   * Optional mode-specific visibility rules.
   */
  hiddenInCreate?: boolean;
  hiddenInEdit?: boolean;
  hiddenInView?: boolean;
}

/* =========================================================
 * IMAGE / ATTACHMENT TYPES
 * ========================================================= */

export type EntityAttachmentType =
  | 'LOGO'
  | 'BANNER'
  | 'IMAGE';

export interface ImageUploadComponentOutput {
  image: string | null;
  file: File;
}

export interface EntityImageUploadEvent {
  file: File;

  previewUrl: string | null;

  attachmentType:
  EntityAttachmentType;

  index?: number;

  existingAttachment?: any;
}

export interface EntityImageRemoveEvent {
  attachmentType:
  EntityAttachmentType;

  index?: number;

  attachment?: any;
}

export interface EntityImageSlot {
  previewUrl: string | null;

  file: File | null;

  attachment: any;
}

export interface PendingUpload {
  file: File;

  categoryId: number;

  attachmentType:
  EntityAttachmentType;

  index?: number;
}

/* =========================================================
 * SELECTED ENTITY
 * ========================================================= */

export type GenericSelectedEntityType =
  | 'account'
  | 'branch'
  | 'address'
  | 'contact';

export interface GenericSelectedEntity {
  type: GenericSelectedEntityType;

  id: number | string;

  parentId?: number | string;

  data?: any;

  context?: any;
}

/* =========================================================
 * GENERIC ENTITY TREE NODE
 * ========================================================= */

export interface GenericEntityNode {
  id: number | string;
  label: string;
  entityType: string;

  icon?: string;

  imageUrl?: string;

  parentId?: number | string;

  expanded?: boolean;

  data?: any;

  context?: any;

  component?: Type<any>;

  children?: GenericEntityNode[];
}

/* =========================================================
 * GENERIC ENTITY EDITOR CONTRACT
 * ========================================================= */

export interface GenericEntityEditor {
  /*
   * Selected node from the left panel.
   */
  showAdditionalImages?: boolean;

  node: GenericEntityNode;
  mode: EntityMode;

  entity: any;
  entityData: any;

  basicInfoFields:  EntityBasicInfoField[];

  showMedia: boolean;

  loading: boolean;
  saving: boolean;
  entityChange:
  EventEmitter<any>;


  saved:
  EventEmitter<any>;


  cancelled:
  EventEmitter<void>;

  loadEntity(): void;

  /*
   * Enter edit mode and create a backup.
   */
  editEntity(): void;

  /*
   * Save using the entity-specific API.
   */
  saveEntity(): void;

  /*
   * Restore the backup and return to view mode.
   */
  cancelEntity(): void;



  onLogoChange?(
    event: any
  ): void;

  onBackgroundChange?(
    event: any
  ): void;

  onAttachmentRemove?(
    event: any
  ): void;
}

/* =========================================================
 * OPTIONAL SHELL EVENT TYPES
 * ========================================================= */

export interface GenericEntitySavedEvent {
  node: GenericEntityNode;

  result?: any;

  entity?: any;
}

export interface GenericEntityChangedEvent {
  node: GenericEntityNode;

  entityData: any;
}



export interface BranchAddressSection {
  code:
  | 'BILLING'
  | 'SHIPPING'
  | 'DISTRIBUTION'
  | 'MAILING';

  label: string;

  selectedAddress: any | null;

  selectorOpen: boolean;
  showNewAddressForm: boolean;
  searchText: string;

  newAddress: any;
}