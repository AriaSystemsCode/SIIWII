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

  /*
   * Examples:
   * ACCOUNT
   * BRANCH
   * ADDRESS
   * CONTACT
   */
  entityType: string;

  icon?: string;

  imageUrl?: string;

  parentId?: number | string;

  expanded?: boolean;

  /*
   * Initial entity information that may already
   * exist in the tree response.
   */
  data?: any;

  /*
   * Additional values needed by the entity editor.
   *
   * Example:
   * {
   *   accountId: 106428,
   *   tenantId: 2490
   * }
   */
  context?: any;

  /*
   * Component responsible for displaying and
   * managing this entity.
   *
   * Optional because section nodes may not have
   * an editor component.
   */
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
  node: GenericEntityNode;

  /*
   * Current component mode.
   */
  mode: EntityMode;

  /*
   * Main entity object.
   *
   * Examples:
   * Account DTO
   * Branch DTO
   * Address DTO
   */
  entity: any;

  /*
   * Wrapper used by the generic basic-info component.
   *
   * Examples:
   * {
   *   account: accountDto
   * }
   *
   * {
   *   branch: branchDto
   * }
   */
  entityData: any;

  /*
   * Fields displayed by app-entity-basic-info.
   */
  basicInfoFields:
    EntityBasicInfoField[];

  /*
   * Account can show logo, banner and images.
   * Branch/address can set this to false.
   */
  showMedia: boolean;

  loading: boolean;
  saving: boolean;

  /*
   * Emits when the entity object changes.
   */
  entityChange:
    EventEmitter<any>;

  /*
   * Emits after a successful save.
   */
  saved:
    EventEmitter<any>;

  /*
   * Emits after cancelling edit/create mode.
   */
  cancelled:
    EventEmitter<void>;

  /*
   * Load entity details using its own API.
   */
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