import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewContainerRef
} from '@angular/core';

import { SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';
import {
  EntityBasicInfoField,
  EntityMode,
  GenericEntityEditor,
  GenericEntityNode
} from '../models/generic-entity.model';

type MobileSection = 'main' | 'right' | 'notes';

interface LeftPanelSection {
  key: string;
  title: string;
  type?: 'tree' | 'list';
  canAdd?: boolean;
  items: GenericEntityNode[];
}

@Component({
  selector: 'app-generic-entity-shell',
  templateUrl: './generic-entity-shell.component.html',
  styleUrls: ['./generic-entity-shell.component.scss']
})
export class GenericEntityShellComponent implements OnInit, OnChanges {

  @ViewChild('entityComponentHost', { read: ViewContainerRef, static: true })
  entityComponentHost!: ViewContainerRef;

  // ---------- Inputs ----------
  @Input() entity: any = {};
  @Input() entityData: any;
  @Input() entityType = '';
  @Input() title = '';
  @Input() breadcrumbItems: any[] = [];
  @Input() mode: EntityMode = 'view';
  @Input() entityTypes: any[] = [];
  @Input() statuses: any[] = [];
  @Input() basicInfoFields: EntityBasicInfoField[] = [];

  @Input() logoPath = 'account.logoUrl';
  @Input() coverPath = 'account.coverUrl';
  @Input() imagesPath = 'account.imagesUrls';
  @Input() attachmentsPath = 'account.entityAttachments';

  @Input() logoAttachmentCategory: SycAttachmentCategoryDto;
  @Input() bannerAttachmentCategory: SycAttachmentCategoryDto;
  @Input() imageAttachmentCategory: SycAttachmentCategoryDto;

  @Input() saving = false;
  @Input() canDetele = false;
  @Input() uploading = false;
  @Input() loading = false;
  @Input() showMedia = true;
  @Input() fieldPermissions: Record<string, boolean> = {};
  @Input() sectionPermissions: Record<string, boolean> = {};
  @Input() dynamicInputsEditable = false;
  @Input() initialNode: GenericEntityNode | null = null;
  @Input() leftPanelSections: LeftPanelSection[] = [];

  // ---------- Outputs ----------
  @Output() entityChange = new EventEmitter<any>();
  @Output() logoChange = new EventEmitter<any>();
  @Output() backgroundChange = new EventEmitter<any>();
  @Output() imageChange = new EventEmitter<any>();
  @Output() attachmentRemove = new EventEmitter<any>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @Output() minimize = new EventEmitter<void>();
  @Output() maximize = new EventEmitter<void>();
  @Output() entityItemSelect = new EventEmitter<GenericEntityNode>();
  @Output() entityItemAdd = new EventEmitter<string>();
  @Output() breadcrumbBrowse = new EventEmitter<void>();
  @Output() dynamicEntitySaved = new EventEmitter<{
    node: GenericEntityNode;
    result?: any;
    entity?: any;
  }>();

  // ---------- State ----------
  leftPanelCollapsed = false;
  rightPanelCollapsed = false;
  dynamicEntityActive = false;
  isCompactScreen = false;
  mobileSection: MobileSection = 'main';

  currentNode: GenericEntityNode | null = null;
  currentEditor: GenericEntityEditor | null = null;
  currentMode: EntityMode = 'view';

  private entityBreadcrumbPath: any[] = [];
  private selectingNode = false;
  private selectedNodeKey = '';
  private readonly compactBreakpoint = 1024;

  constructor(private cdr: ChangeDetectorRef) {}

  // ================= Lifecycle =================

  ngOnInit(): void {
    this.currentMode = this.mode;
    this.updateScreenSize();
    this.resetRightPanel();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.mode && !this.dynamicEntityActive) {
      this.currentMode = changes.mode.currentValue;
      this.resetRightPanel();
    }
  }

  // ================= Node selection =================

  selectNode(node: GenericEntityNode): void {
    const type = String(node.entityType ?? '').toUpperCase();
    const nodeKey = `${type}-${node.id}`;

    if (this.selectingNode || (this.dynamicEntityActive && this.selectedNodeKey === nodeKey)) {
      return;
    }

    this.entityBreadcrumbPath = this.findBreadcrumbPath(node);

    if (type === 'ACCOUNT') {
      this.showRoot();
      this.entityItemSelect.emit(node);
      return;
    }

    if (!node.component) {
      return;
    }

    this.selectingNode = true;
    try {
      this.currentNode = node;
      this.currentMode = node.context?.create === true ? 'create' : 'view';
      this.dynamicEntityActive = true;
      this.selectedNodeKey = nodeKey;

      this.renderEditor();
      this.entityItemSelect.emit(node);
    } finally {
      this.selectingNode = false;
    }
  }

  showRoot(): void {
    this.entityComponentHost?.clear();

    this.entityBreadcrumbPath = [];
    this.dynamicEntityActive = false;
    this.currentNode = null;
    this.currentEditor = null;
    this.currentMode = this.mode;
    this.selectedNodeKey = '';
    this.mobileSection = 'main';

    this.resetRightPanel();
    this.cdr.detectChanges();
  }

  onAdd(sectionKey: string): void {
    this.entityItemAdd.emit(sectionKey);
  }

  private renderEditor(): void {
    const node = this.currentNode;
    if (!node?.component || !this.entityComponentHost) {
      return;
    }

    this.entityComponentHost.clear();
    const componentRef = this.entityComponentHost.createComponent(node.component);
    const editor = componentRef.instance as GenericEntityEditor;
    this.currentEditor = editor;

    Object.assign(editor, {
      logoAttachmentCategory: this.logoAttachmentCategory,
      bannerAttachmentCategory: this.bannerAttachmentCategory,
      imageAttachmentCategory: this.imageAttachmentCategory
    });

    editor.node = node;
    editor.mode = this.currentMode;
    editor.entityData = node.data ?? null;

    editor.saved?.subscribe(result => {
      this.currentMode = 'view';
      editor.mode = 'view';

      if (this.currentNode?.context) {
        this.currentNode.context.create = false;
      }
      if (result?.entity) {
        this.currentNode.data = result.entity;
      }
      if (result?.contact) {
        this.currentNode.data = result.contact;
      }

      this.rightPanelCollapsed = false;

      this.dynamicEntitySaved.emit({
        node: this.currentNode,
        result,
        entity: result?.contact ?? result?.entity ?? editor.entity
      });

      this.cdr.detectChanges();
    });

    editor.cancelled?.subscribe(() => {
      this.currentMode = 'view';
      editor.mode = 'view';
      this.rightPanelCollapsed = false;
      this.cdr.detectChanges();
    });

    editor.loadEntity?.();
    this.currentMode = editor.mode ?? this.currentMode;
    componentRef.changeDetectorRef.detectChanges();
  }

  // ================= Basic-info actions =================
  // When a dynamic editor is active the action goes to it,
  // otherwise it is emitted to the parent.

  onEdit(): void {
    if (!this.dynamicEntityActive) {
      this.edit.emit();
      return;
    }
    if (!this.currentEditor) {
      return;
    }
    this.currentMode = 'edit';
    this.currentEditor.mode = 'edit';
    this.rightPanelCollapsed = true;
    this.currentEditor.editEntity?.();
  }

  onDelete(): void {
    if (!this.dynamicEntityActive) {
      this.delete.emit();
    }
  }

  onSave(): void {
    if (!this.dynamicEntityActive) {
      this.save.emit();
      return;
    }
    this.currentEditor?.saveEntity?.();
  }

  onCancel(): void {
    if (!this.dynamicEntityActive) {
      this.cancel.emit();
      return;
    }
    if (!this.currentEditor) {
      return;
    }
    this.currentEditor.cancelEntity?.();
    this.currentMode = 'view';
    this.currentEditor.mode = 'view';
    this.rightPanelCollapsed = false;
  }

  onEntityChange(changedData: any): void {
    if (!this.dynamicEntityActive) {
      this.entityChange.emit(changedData);
      return;
    }
    if (!this.currentEditor) {
      return;
    }
    this.currentEditor.entityData = changedData;
    if (this.currentNode) {
      this.currentNode.data = changedData;
    }
  }

  onLogoChange(event: any): void {
    if (this.dynamicEntityActive) {
      this.currentEditor?.onLogoChange?.(event);
    } else {
      this.logoChange.emit(event);
    }
  }

  onBackgroundChange(event: any): void {
    if (this.dynamicEntityActive) {
      this.currentEditor?.onBackgroundChange?.(event);
    } else {
      this.backgroundChange.emit(event);
    }
  }

  onImageChange(event: any): void {
    if (!this.dynamicEntityActive) {
      this.imageChange.emit(event);
    }
  }

  onAttachmentRemove(event: any): void {
    if (!this.dynamicEntityActive) {
      this.attachmentRemove.emit(event);
    }
  }

  // ================= Displayed values =================
  // Value comes from the dynamic editor when active, otherwise from inputs.

  private get editorActive(): boolean {
    return this.dynamicEntityActive && !!this.currentEditor;
  }

  get displayedEntity(): any {
    return this.editorActive ? this.currentEditor.entity : this.entity;
  }

  get displayedEntityId(): any {
    return this.displayedEntity?.entityId ?? this.displayedEntity?.id;
  }

  get displayedEntityData(): any {
    return this.editorActive ? this.currentEditor.entityData : this.entityData;
  }

  get displayedMode(): EntityMode {
    return this.dynamicEntityActive ? this.currentMode : this.mode;
  }

  get displayedBasicInfoFields(): EntityBasicInfoField[] {
    return this.editorActive
      ? this.currentEditor.basicInfoFields ?? []
      : this.basicInfoFields;
  }

  get displayedShowMedia(): boolean {
    return this.editorActive
      ? this.currentEditor.showMedia ?? false
      : this.showMedia;
  }

  get displayedShowAdditionalImages(): boolean {
    return this.editorActive
      ? this.currentEditor.showAdditionalImages ?? true
      : true;
  }

  get displayedSaving(): boolean {
    return this.dynamicEntityActive ? !!this.currentEditor?.saving : this.saving;
  }

  get displayedLoading(): boolean {
    return this.dynamicEntityActive ? !!this.currentEditor?.loading : this.loading;
  }

  get currentTitle(): string {
    if (!this.dynamicEntityActive || !this.currentNode) {
      return this.title;
    }
    const modeLabel =
      this.currentMode === 'create' ? 'Create' :
      this.currentMode === 'edit' ? 'Edit' : 'View';
    const name = this.currentEditor?.entity?.name ?? this.currentNode.label ?? '';
    return `${modeLabel} ${name}`;
  }

  get currentBreadcrumbItems(): any[] {
    const dynamicItems = this.entityBreadcrumbPath.filter(dynamicItem =>
      !this.breadcrumbItems.some(baseItem =>
        baseItem.entityType &&
        dynamicItem.entityType &&
        this.isSameEntity(
          baseItem.entityType, baseItem.entityId,
          dynamicItem.entityType, dynamicItem.entityId
        )
      )
    );

    const items = [...this.breadcrumbItems, ...dynamicItems];
    return items.map((item, index) => ({ ...item, active: index === items.length - 1 }));
  }

  /** Mobile left drawer is open (used for backdrop + open class). */
  get isMobileLeftOpen(): boolean {
    return this.isCompactScreen && !this.leftPanelCollapsed;
  }

  // ================= Panels / responsive =================

  openLeftPanel(): void { this.leftPanelCollapsed = false; }
  closeLeftPanel(): void { this.leftPanelCollapsed = true; }
  toggleLeftPanel(): void { this.leftPanelCollapsed = !this.leftPanelCollapsed; }
  toggleRightPanel(): void { this.rightPanelCollapsed = !this.rightPanelCollapsed; }

  showMain(): void { this.mobileSection = 'main'; }
  showRelated(): void { this.mobileSection = 'right'; }
  showNotes(): void { this.mobileSection = 'notes'; }

  private resetRightPanel(): void {
    const mode = this.dynamicEntityActive ? this.currentMode : this.mode;
    this.rightPanelCollapsed = mode === 'create' || mode === 'edit';
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateScreenSize();
  }

  private updateScreenSize(): void {
    const wasCompact = this.isCompactScreen;
    this.isCompactScreen = window.innerWidth <= this.compactBreakpoint;

    if (this.isCompactScreen === wasCompact) {
      return;
    }

    this.mobileSection = 'main';

    if (this.isCompactScreen) {
      this.leftPanelCollapsed = true;
    } else {
      this.leftPanelCollapsed = false;
      this.resetRightPanel();
    }
  }

  // ================= Breadcrumb =================

  onBreadcrumbClick(item: any): void {
    if (!item || item.active) {
      return;
    }

    if (item.isBrowsePage) {
      this.breadcrumbBrowse.emit();
      return;
    }

    if (String(item.entityType || '').toUpperCase() === 'ACCOUNT') {
      this.showRoot();
      return;
    }

    const node = this.findNode(item.entityType, item.entityId);
    if (!node) {
      console.warn('Breadcrumb entity not found:', item);
      return;
    }

    this.selectNode(node);
  }

  private get allRootNodes(): GenericEntityNode[] {
    return this.leftPanelSections.reduce(
      (all, section) => [...all, ...(section.items || [])],
      [] as GenericEntityNode[]
    );
  }

  private isSameEntity(typeA: any, idA: any, typeB: any, idB: any): boolean {
    return (
      String(typeA || '').toUpperCase() === String(typeB || '').toUpperCase() &&
      String(idA) === String(idB)
    );
  }

  private findNode(
    entityType: string,
    entityId: number | string,
    nodes: GenericEntityNode[] = this.allRootNodes
  ): GenericEntityNode | null {
    for (const node of nodes) {
      if (this.isSameEntity(node.entityType, node.id, entityType, entityId)) {
        return node;
      }
      const found = this.findNode(entityType, entityId, node.children || []);
      if (found) {
        return found;
      }
    }
    return null;
  }

  private findBreadcrumbPath(
    target: GenericEntityNode,
    nodes: GenericEntityNode[] = this.allRootNodes
  ): any[] {
    for (const node of nodes) {
      const item = {
        label: node.label,
        entityType: node.entityType,
        entityId: node.id,
        node
      };

      if (this.isSameEntity(node.entityType, node.id, target.entityType, target.id)) {
        return [item];
      }

      const childPath = this.findBreadcrumbPath(target, node.children || []);
      if (childPath.length) {
        return [item, ...childPath];
      }
    }
    return [];
  }
}