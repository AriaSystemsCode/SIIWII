import { AfterViewInit,  ChangeDetectorRef, Component, EventEmitter, HostListener, Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewContainerRef
} from '@angular/core';

import {  SycAttachmentCategoryDto} from '@shared/service-proxies/service-proxies';
import { EntityBasicInfoField, EntityMode, GenericEntityEditor, GenericEntityNode} from '../models/generic-entity.model';

@Component({
  selector: 'app-generic-entity-shell',
  templateUrl: './generic-entity-shell.component.html',
  styleUrls: ['./generic-entity-shell.component.scss']
})
export class GenericEntityShellComponent
  implements
  OnInit,
  OnChanges,
  AfterViewInit {

  @ViewChild('entityComponentHost', { read: ViewContainerRef, static: true }) entityComponentHost!: ViewContainerRef;

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
  @Input()  imagesPath = 'account.imagesUrls';
  @Input()  attachmentsPath =  'account.entityAttachments';

  @Input()  logoAttachmentCategory: SycAttachmentCategoryDto;
  @Input() bannerAttachmentCategory: SycAttachmentCategoryDto;
  @Input() imageAttachmentCategory: SycAttachmentCategoryDto;

  @Input()  saving = false;
  @Input()  uploading = false;
  @Input() loading = false;
  @Input() showMedia = true;
  @Input()  fieldPermissions: Record<string, boolean> = {};
  @Input()  sectionPermissions:  Record<string, boolean> = {};
  @Input()  dynamicInputsEditable = false;

  @Input()
  leftPanelSections: Array<{
    key: string;
    title: string;
    type?: 'tree' | 'list';
    canAdd?: boolean;
    items: GenericEntityNode[];
  }> = [];


  @Input()  initialNode:  GenericEntityNode | null = null;
  @Output()  entityChange =  new EventEmitter<any>();
  @Output() logoChange =   new EventEmitter<any>();
  @Output()  backgroundChange =  new EventEmitter<any>();
  @Output()  imageChange =   new EventEmitter<any>();
  @Output()  attachmentRemove =   new EventEmitter<any>();
  @Output()  edit =   new EventEmitter<void>();
  @Output()  save =  new EventEmitter<void>();
  @Output()  cancel =   new EventEmitter<void>();
  @Output()  close =   new EventEmitter<void>();
  @Output() minimize =  new EventEmitter<void>();
  @Output()  maximize =    new EventEmitter<void>();
  @Output()  entityItemSelect =  new EventEmitter<GenericEntityNode>();
  @Output()  entityItemAdd =  new EventEmitter<string>();

  @Output() dynamicEntitySaved = new EventEmitter<{
      node: GenericEntityNode;
      result?: any;
      entity?: any;
    }>();

  leftPanelCollapsed = false;
  rightPanelCollapsed = false;
  dynamicEntityActive = false;

  currentNode:  GenericEntityNode | null = null;
  currentEditor:  GenericEntityEditor | null = null;
  currentMode: EntityMode = 'view';

  private viewInitialized = false;

  private selectingNode = false;
  private selectedNodeKey = '';


  showBasicInfo = true;


  isCompactScreen = false;

mobileSection:
  'main' |
  'right' |
  'notes' = 'main';

readonly compactBreakpoint = 1024;

  constructor(private cdr: ChangeDetectorRef) {
  }


  ngOnInit(): void {
    this.currentMode =this.mode;
      this.checkResponsiveLayout();
    this.setDefaultRightPanelState();
  }

  ngAfterViewInit(): void {
    // this.viewInitialized = true;

    // if (this.initialNode) {
    //   Promise.resolve().then(() => {
    //     this.selectEntityNode(this.initialNode);
    //   });
    // }
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes.mode && !this.dynamicEntityActive) {
      this.currentMode = changes.mode.currentValue;
      this.setDefaultRightPanelState();
    }

    if (
      changes.initialNode &&
      !changes.initialNode.firstChange &&
      changes.initialNode.currentValue &&
      this.viewInitialized
    ) {
      Promise.resolve().then(() => {
        this.selectEntityNode(
          changes.initialNode.currentValue
        );
      });
    }
  }



selectEntityNode(
  node: GenericEntityNode
): void {

  const entityType =
    String(
      node.entityType ?? ''
    ).toUpperCase();

  const nodeKey =
    `${entityType}-${node.id}`;


  if (
    this.selectingNode ||
    (
      this.dynamicEntityActive &&
      this.selectedNodeKey === nodeKey
    )
  ) {

    if (this.isCompactScreen) {
      this.leftPanelCollapsed = true;
      this.mobileSection = 'main';
    }

    return;
  }


  /*
   * Root Account
   */
  if (entityType === 'ACCOUNT') {

    this.showRootEntity();

    this.entityItemSelect.emit(node);

    if (this.isCompactScreen) {
      this.leftPanelCollapsed = true;
      this.mobileSection = 'main';
    }

    return;
  }


  if (!node.component) {
    return;
  }


  this.selectingNode = true;

  try {

    this.currentNode = node;

    this.currentMode =
      node?.context?.create === true
        ? 'create'
        : 'view';

    this.dynamicEntityActive = true;

    this.selectedNodeKey = nodeKey;


    /*
     * Desktop only
     */
    if (!this.isCompactScreen) {

      this.rightPanelCollapsed =
        this.currentMode === 'create' 
    }


    /*
     * Tablet/mobile
     */
    if (this.isCompactScreen) {
      this.leftPanelCollapsed = true;
      this.mobileSection = 'main';
    }


    this.renderSelectedEntity();
    this.entityItemSelect.emit(node);

  } finally {

    this.selectingNode = false;
  }
}

  showRootEntity(): void {
    this.dynamicEntityActive = false;
    this.currentNode = null;
    this.currentEditor = null;
    this.currentMode = this.mode;
    this.selectedNodeKey = '';
    this.setDefaultRightPanelState();
  }

  onEntityItemAdd(sectionKey: string): void {
    this.entityItemAdd.emit(sectionKey);
  }

private renderSelectedEntity(): void {

  const node = this.currentNode;

  if (
    !node?.component ||
    !this.entityComponentHost
  ) {
    return;
  }

  this.entityComponentHost.clear();

  const componentRef =
    this.entityComponentHost.createComponent(
      node.component
    );

  const editor =
    componentRef.instance as GenericEntityEditor;

  this.currentEditor = editor;

  const editorAny =
    editor as any;

  editorAny.logoAttachmentCategory =
    this.logoAttachmentCategory;

  editorAny.bannerAttachmentCategory =
    this.bannerAttachmentCategory;

  editorAny.imageAttachmentCategory =
    this.imageAttachmentCategory;

  editor.node = node;
  editor.mode = this.currentMode;
  editor.entityData = node.data ?? null;

  // ==============================
  // IMPORTANT: listen for SAVE
  // ==============================
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
      entity:
        result?.contact ??
        result?.entity ??
        editor.entity
    });

    this.cdr.detectChanges();
  });


  // ==============================
  // IMPORTANT: listen for CANCEL
  // ==============================
  editor.cancelled?.subscribe(() => {

    this.currentMode = 'view';
    editor.mode = 'view';

    this.rightPanelCollapsed = false;

    this.cdr.detectChanges();
  });


  editor.loadEntity?.();

  this.currentMode =
    editor.mode ??
    this.currentMode;

  componentRef
    .changeDetectorRef
    .detectChanges();
}

  editCurrentEntity(): void {
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

  saveCurrentEntity(): void {
    if (!this.dynamicEntityActive) {
      this.save.emit();
      return;
    }

    this.currentEditor?.saveEntity?.();
  }

  cancelCurrentEntity(): void {
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

  onCurrentEntityChange(
    changedData: any
  ): void {

    if (!this.dynamicEntityActive) {
      this.entityChange.emit(
        changedData
      );

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



  get displayedEntity(): any {
    if (this.dynamicEntityActive && this.currentEditor) {
      return this.currentEditor.entity;
    }
    return this.entity;
  }

  get displayedEntityData(): any {
    if (this.dynamicEntityActive &&  this.currentEditor) {
      return this.currentEditor.entityData;
    }
    return this.entityData;
  }

  get displayedMode(): EntityMode {
    return this.dynamicEntityActive
      ? this.currentMode
      : this.mode;
  }

  get displayedBasicInfoFields(): EntityBasicInfoField[] {

    if (
      this.dynamicEntityActive && this.currentEditor
    ) {
      return (  this.currentEditor.basicInfoFields ??  []
      );
    }

    return this.basicInfoFields;
  }
  get displayedShowMedia(): boolean {
    if (
      this.dynamicEntityActive &&
      this.currentEditor
    ) {
      return (
        this.currentEditor.showMedia ??
        false
      );
    }

    return this.showMedia;
  }

  get displayedSaving(): boolean {
    return this.dynamicEntityActive  ? !!this.currentEditor?.saving  : this.saving;
  }

  get displayedLoading(): boolean {
    return this.dynamicEntityActive   ? !!this.currentEditor?.loading  : this.loading;
  }

  get currentTitle(): string {
    if (
      !this.dynamicEntityActive ||
      !this.currentNode
    ) {
      return this.title;
    }

    const modeLabel = this.currentMode === 'create'  ? 'Create'   : this.currentMode === 'edit'   ? 'Edit'   : 'View';

    return `${modeLabel} ${this.currentEditor?.entity?.name ??   this.currentNode.label ??    ''  }`;
  }

  get currentBreadcrumbItems():any[] {

    if (!this.dynamicEntityActive || !this.currentNode) {
      return this.breadcrumbItems;
    }

    return [...(this.breadcrumbItems ?? []),
      {
        label:
          this.currentEditor?.entity?.name ??
          this.currentNode.label
      }
    ];
  }

  private setDefaultRightPanelState(): void {
    const activeMode =  this.dynamicEntityActive  ? this.currentMode : this.mode;
    this.rightPanelCollapsed =  activeMode === 'create' || activeMode === 'edit';
  }

  toggleRightPanel(): void {
    this.rightPanelCollapsed = !this.rightPanelCollapsed;
  }



  onRootLogoChange(event: any): void {

    if (this.dynamicEntityActive) {
      this.currentEditor?.onLogoChange?.(event);
      return;
    }

    this.logoChange.emit(event);
  }

  onRootBackgroundChange(event: any): void {
    if (this.dynamicEntityActive) {
      this.currentEditor?.onBackgroundChange?.(event);
      return;
    }

    this.backgroundChange.emit(event);
  }

  onRootImageChange(event: any): void {
    if (!this.dynamicEntityActive) {
      this.imageChange.emit(event);
    }
  }

  onRootAttachmentRemove(event: any): void {
    if (!this.dynamicEntityActive) {
      this.attachmentRemove.emit(event);
    }
  }

  get displayedShowAdditionalImages():boolean {

    if ( this.dynamicEntityActive && this.currentEditor ) {
      return ( this.currentEditor.showAdditionalImages ?? true);
    }
    return true;
  }


  openLeftPanel(): void {
  this.leftPanelCollapsed = false;
}

closeLeftPanel(): void {
  this.leftPanelCollapsed = true;
}

toggleLeftPanel(): void {
  this.leftPanelCollapsed =
    !this.leftPanelCollapsed;
}

showMobileMain(): void {
  this.mobileSection = 'main';
}

showMobileRightPanel(): void {
  this.mobileSection = 'right';
}

showMobileNotes(): void {
  this.mobileSection = 'notes';
}

@HostListener('window:resize')
onWindowResize(): void {
  this.checkResponsiveLayout();
}

private checkResponsiveLayout(): void {

  const wasCompact =
    this.isCompactScreen;

  this.isCompactScreen =
    window.innerWidth <=
    this.compactBreakpoint;

  /*
   * Enter tablet/mobile
   */
  if (
    this.isCompactScreen &&
    !wasCompact
  ) {

    this.leftPanelCollapsed = true;

    this.mobileSection = 'main';

    return;
  }

  if (this.isCompactScreen) {
    return;
  }

  /*
   * Return to desktop
   */
  if (
    !this.isCompactScreen &&
    wasCompact
  ) {

    this.leftPanelCollapsed = false;

    this.mobileSection = 'main';

    this.setDefaultRightPanelState();
  }
}
}