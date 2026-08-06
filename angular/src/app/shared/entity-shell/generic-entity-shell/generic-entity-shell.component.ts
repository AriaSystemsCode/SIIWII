// import {
//   Component,
//   EventEmitter,
//   Input,
//   OnChanges,
//   OnInit,
//   Output,
//   SimpleChanges
// } from '@angular/core';

// import {
//   SycAttachmentCategoryDto
// } from '@shared/service-proxies/service-proxies';
// import { GenericSelectedEntity } from '../models/generic-entity.model';
// import { TreeNode } from 'primeng/api';

// type EntityMode =
//   'create' |
//   'edit' |
//   'view';

// @Component({
//   selector: 'app-generic-entity-shell',
//   templateUrl:
//     './generic-entity-shell.component.html',
//   styleUrls: [
//     './generic-entity-shell.component.scss'
//   ]
// })
// export class GenericEntityShellComponent
//   implements OnInit, OnChanges {

//   @Input() entity: any = {};
//   @Input() entityData: any;

//   @Input() entityType = '';
//   @Input() title = '';

//   @Input()
//   breadcrumbItems: any[] = [];

//   @Input()
//   mode: EntityMode = 'view';

//   @Input()
//   entityTypes: any[] = [];

//   @Input()
//   statuses: any[] = [];

//   @Input()
//   basicInfoFields: any[] = [];

//   @Input()
//   logoPath =
//     'account.logoUrl';

//   @Input()
//   coverPath =
//     'account.coverUrl';

//   @Input()
//   imagesPath =
//     'account.imagesUrls';

//   @Input()
//   attachmentsPath =
//     'account.entityAttachments';

//   @Input() saving = false;
//   @Input() uploading = false;

//   /*
//    * Optional permission configuration
//    * passed from AccountCard/AccountsComponent.
//    */
//   @Input()
//   fieldPermissions:
//     Record<string, boolean> = {};

//   @Input()
//   sectionPermissions:
//     Record<string, boolean> = {};

//   @Input()
//   dynamicInputsEditable = false;

//   @Input()
//   logoAttachmentCategory:
//     SycAttachmentCategoryDto;

//   @Input()
//   bannerAttachmentCategory:
//     SycAttachmentCategoryDto;

//   @Input()
//   imageAttachmentCategory:
//     SycAttachmentCategoryDto;

//   @Output()
//   entityChange =
//     new EventEmitter<any>();

//   @Output()
//   logoChange =
//     new EventEmitter<any>();

//   @Output()
//   backgroundChange =
//     new EventEmitter<any>();

//   @Output()
//   imageChange =
//     new EventEmitter<any>();

//   @Output()
//   attachmentRemove =
//     new EventEmitter<any>();

//   @Output()
//   save =
//     new EventEmitter<void>();

//   @Output()
//   cancel =
//     new EventEmitter<void>();

//   @Output()
//   close =
//     new EventEmitter<void>();

//   @Output()
//   minimize =
//     new EventEmitter<void>();

//   @Output()
//   maximize =
//     new EventEmitter<void>();

//   @Output()
//   edit =
//     new EventEmitter<void>();


//     @Output()
// entityItemSelect =
//   new EventEmitter<GenericSelectedEntity>();

// @Output()
// entityItemAdd =
//   new EventEmitter<string>();

//   leftPanelCollapsed = false;
//   rightPanelCollapsed = false;

//   // leftPanelSections = [
//   //   {
//   //     key: 'branches',
//   //     title: 'Branches',
//   //     canAdd: true,
//   //     items: [
//   //       {
//   //         id: 1,
//   //         label: 'Main Branch',
//   //         icon: 'fa fa-building',
//   //         children: [
//   //           {
//   //             id: 10,
//   //             label: 'Sarah Johnson',
//   //             icon: 'fa fa-user',
//   //             type: 'contact'
//   //           },
//   //           {
//   //             id: 11,
//   //             label: 'Mark Green',
//   //             icon: 'fa fa-user',
//   //             type: 'contact'
//   //           }
//   //         ]
//   //       }
//   //     ]
//   //   }
//   // ];
// @Input()
// leftPanelSections: any[] = [];
//   ngOnInit(): void {
//     this.setDefaultRightPanelState();
//   }

//   ngOnChanges(
//     changes: SimpleChanges
//   ): void {

//     if (
//       changes.mode &&
//       changes.mode.currentValue !==
//         changes.mode.previousValue
//     ) {
//       this.setDefaultRightPanelState();
//     }
//   }

//   private setDefaultRightPanelState():
//     void {

//     /*
//      * Create/Edit:
//      * collapsed by default.
//      *
//      * View:
//      * expanded by default.
//      */
//     this.rightPanelCollapsed =
//       this.mode === 'create' ||
//       this.mode === 'edit';
//   }

//   toggleRightPanel(): void {
//     this.rightPanelCollapsed =
//       !this.rightPanelCollapsed;
//   }


//   mapToTreeNode(item: any): TreeNode {
//   return {
//     label: item.label,
//     key: `${item.type}-${item.id}`,
//     data: item,
//     icon: item.icon,
//     expanded: item.expanded ?? false,
//     children:
//       item.children?.map(child =>
//         this.mapToTreeNode(child)
//       ) ?? []
//   };
// }
// }









import {
  AfterViewInit,
  Component,
  ComponentRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewContainerRef
} from '@angular/core';

import {
  Subscription
} from 'rxjs';

import {
  SycAttachmentCategoryDto
} from '@shared/service-proxies/service-proxies';

import {
  EntityBasicInfoField,
  EntityMode,
  GenericEntityEditor,
  GenericEntityNode
} from '../models/generic-entity.model';

@Component({
  selector: 'app-generic-entity-shell',
  templateUrl: './generic-entity-shell.component.html',
  styleUrls: ['./generic-entity-shell.component.scss']
})
export class GenericEntityShellComponent
  implements
    OnInit,
    OnChanges,
    AfterViewInit,
    OnDestroy {

  /* =======================================================
   * DYNAMIC COMPONENT HOST
   * ======================================================= */

@ViewChild('entityComponentHost',{read: ViewContainerRef,static: true})entityComponentHost!: ViewContainerRef;

  /* =======================================================
   * ORIGINAL / ROOT ENTITY INPUTS
   * ======================================================= */

  @Input()
  entity: any = {};

  @Input()
  entityData: any;

  @Input()
  entityType = '';

  @Input()
  title = '';

  @Input()
  breadcrumbItems: any[] = [];

  @Input()
  mode: EntityMode = 'view';

  @Input()
  entityTypes: any[] = [];

  @Input()
  statuses: any[] = [];

  @Input()
  basicInfoFields:
    EntityBasicInfoField[] = [];

  /* =======================================================
   * IMAGE PATHS
   * ======================================================= */

  @Input()
  logoPath =
    'account.logoUrl';

  @Input()
  coverPath =
    'account.coverUrl';

  @Input()
  imagesPath =
    'account.imagesUrls';

  @Input()
  attachmentsPath =
    'account.entityAttachments';

  /* =======================================================
   * IMAGE CATEGORIES
   * ======================================================= */

  @Input()
  logoAttachmentCategory:
    SycAttachmentCategoryDto;

  @Input()
  bannerAttachmentCategory:
    SycAttachmentCategoryDto;

  @Input()
  imageAttachmentCategory:
    SycAttachmentCategoryDto;

  /* =======================================================
   * STATE INPUTS
   * ======================================================= */

  @Input()
  saving = false;

  @Input()
  uploading = false;

  @Input()
  loading = false;

  @Input()
  showMedia = true;

  /* =======================================================
   * PERMISSIONS
   * ======================================================= */

  @Input()
  fieldPermissions:
    Record<string, boolean> = {};

  @Input()
  sectionPermissions:
    Record<string, boolean> = {};

  @Input()
  dynamicInputsEditable = false;

  /* =======================================================
   * LEFT PANEL INPUTS
   * ======================================================= */

  @Input()
  leftPanelSections: Array<{
    key: string;
    title: string;
    type?: 'tree' | 'list';
    canAdd?: boolean;
    items: GenericEntityNode[];
  }> = [];

  /*
   * Optional initial selected node.
   *
   * If not supplied, the projected/root account content
   * remains visible.
   */
  @Input()
  initialNode:
    GenericEntityNode | null = null;

  /* =======================================================
   * ROOT ENTITY OUTPUTS
   * ======================================================= */

  @Output()
  entityChange =
    new EventEmitter<any>();

  @Output()
  logoChange =
    new EventEmitter<any>();

  @Output()
  backgroundChange =
    new EventEmitter<any>();

  @Output()
  imageChange =
    new EventEmitter<any>();

  @Output()
  attachmentRemove =
    new EventEmitter<any>();

  @Output()
  edit =
    new EventEmitter<void>();

  @Output()
  save =
    new EventEmitter<void>();

  @Output()
  cancel =
    new EventEmitter<void>();

  @Output()
  close =
    new EventEmitter<void>();

  @Output()
  minimize =
    new EventEmitter<void>();

  @Output()
  maximize =
    new EventEmitter<void>();

  /* =======================================================
   * LEFT PANEL OUTPUTS
   * ======================================================= */

  @Output()
  entityItemSelect =
    new EventEmitter<GenericEntityNode>();

  @Output()
  entityItemAdd =
    new EventEmitter<string>();

  /*
   * Emitted when a dynamically loaded entity saves.
   */
  @Output()
  dynamicEntitySaved =
    new EventEmitter<{
      node: GenericEntityNode;
      result?: any;
      entity?: any;
    }>();

  /* =======================================================
   * SHELL UI STATE
   * ======================================================= */

  leftPanelCollapsed = false;

  rightPanelCollapsed = false;

  /*
   * False means the original projected account content
   * is displayed.
   *
   * True means a dynamic branch/address/contact editor
   * is displayed.
   */
  dynamicEntityActive = false;

  /* =======================================================
   * CURRENT DYNAMIC ENTITY STATE
   * ======================================================= */

  currentNode:
    GenericEntityNode | null = null;

  currentEditor:
    GenericEntityEditor | null = null;

  currentComponentRef:
    ComponentRef<any> | null = null;

  currentMode:
    EntityMode = 'view';

  private editorSubscriptions:
    Subscription[] = [];

  private viewInitialized = false;

  private selectingNode = false;
private selectedNodeKey = '';

  /* =======================================================
   * LIFECYCLE
   * ======================================================= */

  ngOnInit(): void {
    this.currentMode =
      this.mode;

    this.setDefaultRightPanelState();
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;

    if (this.initialNode) {
      Promise.resolve().then(() => {
        this.selectEntityNode(
          this.initialNode
        );
      });
    }
  }

  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      changes.mode &&
      !this.dynamicEntityActive
    ) {
      this.currentMode =
        changes.mode.currentValue;

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

  ngOnDestroy(): void {
    this.destroyCurrentEditor();
  }

  /* =======================================================
   * LEFT PANEL SELECTION
   * ======================================================= */

selectEntityNode(
  node: GenericEntityNode
): void {
  if (!node) {
    return;
  }

  const entityType =
    String(node.entityType ?? '')
      .toUpperCase();

  const nodeKey =
    `${entityType}-${node.id}`;

  /*
   * Prevent duplicate selection events for
   * the currently opened entity.
   */
  if (
    this.selectingNode ||
    (
      this.dynamicEntityActive &&
      this.selectedNodeKey === nodeKey
    )
  ) {
    return;
  }

  if (entityType === 'ACCOUNT') {
    this.showRootEntity();
    this.entityItemSelect.emit(node);
    return;
  }

  if (!node.component) {
    console.warn(
      'No component configured for node:',
      node
    );

    return;
  }

  this.selectingNode = true;

  try {
    this.destroyCurrentEditor();

    this.currentNode = node;
    this.currentMode = 'view';
    this.dynamicEntityActive = true;
    this.selectedNodeKey = nodeKey;

    this.rightPanelCollapsed = false;

    this.renderSelectedEntity();

    this.entityItemSelect.emit(node);
  } finally {
    this.selectingNode = false;
  }
}
showRootEntity(): void {
  this.destroyCurrentEditor();

  this.dynamicEntityActive = false;
  this.currentNode = null;
  this.currentEditor = null;
  this.currentMode = this.mode;
  this.selectedNodeKey = '';

  this.setDefaultRightPanelState();
}

  onEntityItemAdd(
    sectionKey: string
  ): void {
    this.entityItemAdd.emit(
      sectionKey
    );
  }

  /* =======================================================
   * DYNAMIC COMPONENT CREATION
   * ======================================================= */

private renderSelectedEntity(): void {
  const node =
    this.currentNode;

  const component =
    node?.component;

  if (
    !node ||
    !component ||
    !this.entityComponentHost
  ) {
    return;
  }

  this.entityComponentHost.clear();

  const componentRef =
    this.entityComponentHost
      .createComponent(component);

  this.currentComponentRef =
    componentRef;

  const editor =
    componentRef.instance as
      GenericEntityEditor;

  this.currentEditor =
    editor;

  editor.node =
    node;

  editor.mode =
    this.currentMode;

  editor.entityData =
    node.data ?? {
      branch: null
    };

  editor.entity =
    this.resolveEntityFromData(
      editor.entityData
    );

  this.bindDynamicEditorOutputs();

  /*
   * API subscription runs inside Angular zone,
   * so Angular updates automatically.
   */
  editor.loadEntity?.();
}

private bindDynamicEditorOutputs(): void {
  const editor =
    this.currentEditor;

  if (!editor) {
    return;
  }

  if (editor.saved) {
    this.editorSubscriptions.push(
      editor.saved.subscribe(
        result => {
          this.currentMode =
            'view';

          editor.mode =
            'view';

          if (this.currentNode) {
            this.currentNode.data = {
              branch:
                editor.entity
            };

            if (editor.entity?.name) {
              this.currentNode.label =
                editor.entity.name;
            }
          }

          this.dynamicEntitySaved.emit({
            node:
              this.currentNode,
            result,
            entity:
              editor.entity
          });
        }
      )
    );
  }

  if (editor.cancelled) {
    this.editorSubscriptions.push(
      editor.cancelled.subscribe(
        () => {
          this.currentMode =
            'view';

          editor.mode =
            'view';

          this.rightPanelCollapsed =
            false;
        }
      )
    );
  }
}

private destroyCurrentEditor(): void {
  this.editorSubscriptions
    .forEach(subscription => {
      subscription.unsubscribe();
    });

  this.editorSubscriptions = [];

  if (this.entityComponentHost) {
    this.entityComponentHost.clear();
  }

  this.currentComponentRef =
    null;

  this.currentEditor =
    null;
}

  /* =======================================================
   * GENERIC EDIT / SAVE / CANCEL
   * ======================================================= */

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
    /*
     * Root account uses AccountCardComponent saveAccount().
     */
    if (!this.dynamicEntityActive) {
      this.save.emit();
      return;
    }

    this.currentEditor
      ?.saveEntity?.();
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

    this.currentEditor.entityData =
      changedData;

    this.currentEditor.entity =
      this.resolveEntityFromData(
        changedData
      );

    if (this.currentNode) {
      this.currentNode.data =
        changedData;
    }
  }

  private resolveEntityFromData(
    data: any
  ): any {

    if (!data) {
      return data;
    }

    const entityType =
      String(
        this.currentNode
          ?.entityType ?? ''
      ).toUpperCase();

    switch (entityType) {
      case 'ACCOUNT':
        return data.account ??
          data;

      case 'BRANCH':
        return data.branch ??
          data;

      case 'ADDRESS':
        return data.address ??
          data;

      case 'CONTACT':
        return data.contact ??
          data;

      default:
        return data;
    }
  }

  /* =======================================================
   * CURRENT ENTITY VALUES
   * ======================================================= */

  get displayedEntity(): any {
  if (
    this.dynamicEntityActive &&
    this.currentEditor
  ) {
    return this.currentEditor.entity;
  }

  return this.entity;
}
 get displayedEntityData(): any {
  if (
    this.dynamicEntityActive &&
    this.currentEditor
  ) {
    return this.currentEditor.entityData;
  }

  return this.entityData;
}

  get displayedMode(): EntityMode {
  return this.dynamicEntityActive
    ? this.currentMode
    : this.mode;
}

 get displayedBasicInfoFields():
  EntityBasicInfoField[] {

  if (
    this.dynamicEntityActive &&
    this.currentEditor
  ) {
    return (
      this.currentEditor.basicInfoFields ??
      []
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
  return this.dynamicEntityActive
    ? !!this.currentEditor?.saving
    : this.saving;
}

  get displayedLoading(): boolean {
  return this.dynamicEntityActive
    ? !!this.currentEditor?.loading
    : this.loading;
}

get currentTitle(): string {
  if (
    !this.dynamicEntityActive ||
    !this.currentNode
  ) {
    return this.title;
  }

  const modeLabel =
    this.currentMode === 'create'
      ? 'Create'
      : this.currentMode === 'edit'
        ? 'Edit'
        : 'View';

  return `${modeLabel} ${
    this.currentEditor?.entity?.name ??
    this.currentNode.label ??
    ''
  }`;
}

  get currentBreadcrumbItems():
  any[] {

  if (
    !this.dynamicEntityActive ||
    !this.currentNode
  ) {
    return this.breadcrumbItems;
  }

  return [
    ...(this.breadcrumbItems ?? []),
    {
      label:
        this.currentEditor?.entity?.name ??
        this.currentNode.label
    }
  ];
}

  /* =======================================================
   * PANELS
   * ======================================================= */

  private setDefaultRightPanelState():
    void {

    const activeMode =
      this.dynamicEntityActive
        ? this.currentMode
        : this.mode;

    this.rightPanelCollapsed =
      activeMode === 'create' ||
      activeMode === 'edit';
  }

  toggleRightPanel(): void {
    this.rightPanelCollapsed =
      !this.rightPanelCollapsed;
  }

  get displayedNamePath(): string {
  const entityType =
    String(
      this.currentNode?.entityType ?? ''
    ).toUpperCase();

  if (
    this.dynamicEntityActive &&
    entityType === 'BRANCH'
  ) {
    return 'branch.name';
  }

  return 'account.name';
}

get displayedAccountTypePath(): string {
  const entityType =
    String(
      this.currentNode?.entityType ?? ''
    ).toUpperCase();

  if (
    this.dynamicEntityActive &&
    entityType === 'BRANCH'
  ) {
    return '';
  }

  return 'account.accountTypeId';
}

get displayedRequireAccountType(): boolean {
  const entityType =
    String(
      this.currentNode?.entityType ?? ''
    ).toUpperCase();

  return !(
    this.dynamicEntityActive &&
    entityType === 'BRANCH'
  );
}

onRootLogoChange(event: any): void {
  if (!this.dynamicEntityActive) {
    this.logoChange.emit(event);
  }
}

onRootBackgroundChange(event: any): void {
  if (!this.dynamicEntityActive) {
    this.backgroundChange.emit(event);
  }
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
}