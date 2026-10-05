import { Component, HostListener, Injector, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CreateOrEditFieldManagerComponent } from '../create-or-edit-field-manager/create-or-edit-field-manager.component';
import { ViewFieldManagerComponent } from '../view-field-manager/view-field-manager.component';
import { ExistingFieldsModalComponent } from '../existing-fields-modal/existing-fields-modal.component';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FieldManagerEntityNode, FieldManagerItem } from '../../field-manager.model';
import { FieldManagerPermissions, FieldManagerService } from '../../field-manager.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-browse-field-manager',
    templateUrl: './browse-field-manager.component.html',
    styleUrls: ['./browse-field-manager.component.scss']
})
export class BrowseFieldManagerComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditFieldManagerModal', { static: true }) createOrEditFieldManagerModal!: CreateOrEditFieldManagerComponent;
    @ViewChild('viewFieldManagerModal', { static: true }) viewFieldManagerModal!: ViewFieldManagerComponent;
    @ViewChild('existingFieldsModal', { static: true }) existingFieldsModal!: ExistingFieldsModalComponent;
    items: FieldManagerItem[] = [];
    filterText = '';
    extraDataFilter: 'all' | 'only' | 'without' = 'all';
    groupBy = 'none';
    expandedGroups: { [groupValue: string]: boolean } = {};
    activeActionId: number | null = null;
    activeActionItem: FieldManagerItem | null = null;
    actionMenuPosition = { top: 0, left: 0 };
    activePanel: 'all' | 'entity' = 'all';
    entityTree: FieldManagerEntityNode[] = [];
    expandedEntityIds: string[] = [];
    selectedEntityId: number | null = null;
    selectedEntityKey: string | null = null;
    selectedNode: FieldManagerEntityNode | null = null;
    permissions: FieldManagerPermissions = {
        canViewPage: false,
        canCreateField: false,
        canEditField: false,
        canDeleteField: false,
        canDuplicateField: false,
        canAddExistingField: false
    };
    private fieldsRequest = 0;
    selectedEntityPath: FieldManagerEntityNode[] = [];

    readonly groupOptions = [
        //  { label: 'No group', value: 'none' },
        { label: 'No Group', value: 'none' },
        { label: 'Field Type', value: 'type' },
        { label: 'Created User', value: 'createdUser' },
        { label: 'Field Level', value: 'fieldLevel' }
    ];

    constructor(
        injector: Injector,
        private fieldManagerService: FieldManagerService,
        private router: Router
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.fieldManagerService.getPagePermissions().subscribe({
            next: permissions => this.permissions = permissions,
            error: () => this.notify.error('Could not load field manager permissions.')
        });
        this.loadItems();
        this.fieldManagerService.getEntityTree().subscribe({
            next: tree => this.entityTree = tree,
            error: () => this.notify.error('Could not load the field manager tree.')
        });
    }

    get displayedItems(): FieldManagerItem[] {
        return this.items;
    }

    get filteredItems(): FieldManagerItem[] {
        const filter = this.filterText.trim().toLowerCase();
        return this.displayedItems.filter(item => {
            if (this.extraDataFilter === 'only' && !item.extraData) {
                return false;
            }

            if (this.extraDataFilter === 'without' && item.extraData) {
                return false;
            }

            if (!filter) {
                return true;
            }

            return item.name.toLowerCase().includes(filter) ||
                item.code.toLowerCase().includes(filter) ||
                item.type.toLowerCase().includes(filter) ||
                item.tables.toLowerCase().includes(filter) ||
                item.status.toLowerCase().includes(filter) ||
                item.fieldLevel.toLowerCase().includes(filter) ||
                item.trackingNumber.toLowerCase().includes(filter);
        });
    }

    selectPanel(panel: 'all' | 'entity'): void {
        this.activePanel = panel;
        this.selectedEntityId = null;
        this.selectedEntityKey = null;
        this.selectedNode = null;
        this.selectedEntityPath = [];
        this.expandedEntityIds = [];
        this.closeActions();
        this.loadItems();
    }

    toggleEntity(node: FieldManagerEntityNode, event: MouseEvent): void {
        event.stopPropagation();
        this.selectedEntityPath = this.findEntityPath(node.key, this.entityTree);
        this.selectedEntityId = node.sycObjectId;
        this.selectedEntityKey = node.key;
        this.selectedNode = node;
        if (node.children && node.children.length) {
            this.expandedEntityIds = this.expandedEntityIds.indexOf(node.key) !== -1
                ? this.expandedEntityIds.filter(id => id !== node.key)
                : [...this.expandedEntityIds, node.key];
        }
        this.loadItems();
    }

    isEntityExpanded(node: FieldManagerEntityNode): boolean {
        return this.expandedEntityIds.indexOf(node.key) !== -1;
    }

    get breadcrumbPath(): FieldManagerEntityNode[] {
        if (this.activePanel === 'all') {
            return [{ id: 0, key: 'AllFields', code: 'ALL', name: 'AllFields', nodeType: 'Entity', sycObjectId: 0 }];
        }

        return this.selectedEntityPath;
    }

    private findEntityPath(key: string, nodes: FieldManagerEntityNode[], parents: FieldManagerEntityNode[] = []): FieldManagerEntityNode[] {
        for (const node of nodes) {
            const path = [...parents, node];
            if (node.key === key) {
                return path;
            }

            if (node.children) {
                const childPath = this.findEntityPath(key, node.children, path);
                if (childPath.length) {
                    return childPath;
                }
            }
        }

        return [];
    }

    get groupedItems(): Array<FieldManagerItem & { groupValue: string }> {
        const items = this.filteredItems.map(item => ({
            ...item,
            groupValue: this.getGroupValue(item)
        }));

        if (this.groupBy === 'none') {
            return items;
        }

        return items.sort((first, second) => first.groupValue.localeCompare(second.groupValue));
    }

    get groupLabel(): string {
        const option = this.groupOptions.find(group => group.value === this.groupBy);
        return option ? option.label : 'No group';
    }

    isGroupExpanded(groupValue: string): boolean {
        return this.expandedGroups[groupValue] !== false;
    }

    toggleGroup(groupValue: string, event: MouseEvent): void {
        event.stopPropagation();
        this.expandedGroups[groupValue] = !this.isGroupExpanded(groupValue);
    }

    private getGroupValue(item: FieldManagerItem): string {
        switch (this.groupBy) {
            case 'type':
                return item.type || '';
            case 'createdUser':
                return item.createdUser || '';
            case 'fieldLevel':
                return item.fieldLevel || '';
            default:
                return '';
        }
    }

    create(): void {
        const selectedTable = this.selectedEntityPath.length
            ? this.selectedEntityPath[this.selectedEntityPath.length - 1].name
            : undefined;
        const rootEntity = this.selectedEntityPath.find(node => node.nodeType === 'Entity');
        this.createOrEditFieldManagerModal.show(undefined, false, selectedTable, this.selectedEntityId,
            this.selectedNode?.nodeType === 'ObjectType' ? this.selectedNode.id : null,
            rootEntity?.sycObjectId || null);
    }

    addFromExisting(): void {
        this.existingFieldsModal.show();
    }

    onExistingFieldsAdded(count: number): void {
        this.loadItems();
        if (count) {
            this.notify.success(this.l('FieldsAddedSuccessfully'));
        }
    }

    toggleActions(item: FieldManagerItem, event: MouseEvent): void {
        event.stopPropagation();
        if (this.activeActionId === item.id) {
            this.closeActions();
            return;
        }

        const trigger = event.currentTarget as HTMLElement;
        const triggerBounds = trigger.getBoundingClientRect();
        const scrollBody = trigger.closest('.p-datatable-scrollable-body');
        const scrollBounds = scrollBody && scrollBody.getBoundingClientRect();
        const menuWidth = 160;
        const actionCount = 1 + Number(!!item.canEdit && this.permissions.canEditField)
            + Number(this.permissions.canDuplicateField) + Number(!!item.canHide && this.permissions.canEditField)
            + Number(!!item.canDelete);
        const menuHeight = actionCount * 34 + 12;
        const availableBelow = Math.min(
            window.innerHeight,
            scrollBounds ? scrollBounds.bottom : window.innerHeight
        ) - triggerBounds.bottom;
        const openAbove = availableBelow < menuHeight + 8;
        const top = openAbove
            ? triggerBounds.top - menuHeight - 4
            : triggerBounds.bottom + 4;

        this.actionMenuPosition = {
            top: Math.max(8, Math.min(top, window.innerHeight - menuHeight - 8)),
            left: Math.max(8, Math.min(triggerBounds.right - menuWidth, window.innerWidth - menuWidth - 8))
        };
        this.activeActionItem = item;
        this.activeActionId = item.id;
    }

    /* closeToolbarDropdown(event: KeyboardEvent): void {
        this.toolbarDropdownOpen = false;
        (event.target as HTMLElement).blur();
    }
 */
    edit(item: FieldManagerItem): void {
        this.closeActions();
        this.createOrEditFieldManagerModal.show(item.id);
    }

    duplicate(item: FieldManagerItem): void {
        this.closeActions();
        this.fieldManagerService.duplicateField(item.id).subscribe({
            next: () => {
                this.loadItems();
                this.notify.success('Field duplicated.');
            },
            error: () => this.notify.error('Could not duplicate the field.')
        });
    }

    hide(item: FieldManagerItem): void {
        this.closeActions();
        this.askToConfirm('Hide this field for your tenant?', this.l('Confirm')).subscribe(confirmed => {
            if (!confirmed) return;
            this.fieldManagerService.hideField(item.id).subscribe({
                next: () => {
                    this.loadItems();
                    this.notify.success('Field hidden.');
                },
                error: () => this.notify.error('Could not hide the field.')
            });
        });
    }

    view(item: FieldManagerItem): void {
        this.closeActions();
        this.viewFieldManagerModal.show(item);
    }

    delete(item: FieldManagerItem): void {
        this.closeActions();
        var isConfirmed: Observable<boolean>;
        isConfirmed = this.askToConfirm(
            this.l("AreYouSureYouWantToDeleteThisField?"), 
            this.l("Confirm")
        );

        isConfirmed.subscribe((res) => {
            if (res) {
                //i51- call delete
                this.fieldManagerService.deleteServerField(item.id).subscribe({
                    next: () => {
                        this.loadItems();
                        this.notify.success(this.l('SuccessfullyDeleted'));
                    },
                    error: () => this.notify.error('Could not delete the field.')
                });

            }
        });
    }

    onCreateOrEditDone(): void {
        this.loadItems();
    }

    onCreateOrEditClosed(): void {
        // The view modal manages its own revision workflow.
    }

    @HostListener('document:click')
    closeActions(): void {
        this.activeActionId = null;
        this.activeActionItem = null;
    }

    private loadItems(): void {
        const request = ++this.fieldsRequest;
        this.items = [];
        this.fieldManagerService.getFieldsForNode(this.activePanel === 'entity' ? this.selectedNode : null)
            .subscribe({
                next: items => { if (request === this.fieldsRequest) this.items = items; },
                error: () => { if (request === this.fieldsRequest) this.notify.error('Could not load fields.'); }
            });
    }
}
