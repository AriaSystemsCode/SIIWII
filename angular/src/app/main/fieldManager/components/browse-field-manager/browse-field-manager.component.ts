import { Component, HostListener, Injector, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CreateOrEditFieldManagerComponent } from '../create-or-edit-field-manager/create-or-edit-field-manager.component';
import { ViewFieldManagerComponent } from '../view-field-manager/view-field-manager.component';
import { ExistingFieldsModalComponent } from '../existing-fields-modal/existing-fields-modal.component';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FieldManagerEntityNode, FieldManagerItem } from '../../field-manager.model';
import { FieldManagerService } from '../../field-manager.service';
import { Observable } from '@node_modules/rxjs/dist/types';

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
    expandedEntityIds: number[] = [];
    selectedEntityId: number | null = null;
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
        this.loadItems();
        this.entityTree = this.fieldManagerService.getEntityTree();
    }

    get displayedItems(): FieldManagerItem[] {
        debugger
        if (this.activePanel === 'entity' && this.selectedEntityId !== null)
            return this.items.filter(item => item.entityId === this.selectedEntityId && item.extraData === true);

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
        this.selectedEntityPath = [];
        this.expandedEntityIds = [];
        this.closeActions();
    }

    toggleEntity(node: FieldManagerEntityNode, event: MouseEvent): void {
        event.stopPropagation();
        this.selectedEntityPath = this.findEntityPath(node.id, this.entityTree);
        if (node.children && node.children.length) {
            this.selectedEntityId = null;
            this.expandedEntityIds = this.expandedEntityIds.indexOf(node.id) !== -1
                ? this.expandedEntityIds.filter(id => id !== node.id)
                : [...this.expandedEntityIds, node.id];
            return;
        }

        this.selectedEntityId = node.id;
    }

    isEntityExpanded(node: FieldManagerEntityNode): boolean {
        return this.expandedEntityIds.indexOf(node.id) !== -1;
    }

    get breadcrumbPath(): FieldManagerEntityNode[] {
        if (this.activePanel === 'all') {
            return [{ id: 0, name: 'AllFields' }];
        }

        return this.selectedEntityPath;
    }

    private findEntityPath(id: number, nodes: FieldManagerEntityNode[], parents: FieldManagerEntityNode[] = []): FieldManagerEntityNode[] {
        for (const node of nodes) {
            const path = [...parents, node];
            if (node.id === id) {
                return path;
            }

            if (node.children) {
                const childPath = this.findEntityPath(id, node.children, path);
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
        this.createOrEditFieldManagerModal.show(undefined, false, selectedTable, this.selectedEntityId);
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
        const menuHeight = 96;
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
    createNewRevision(item: FieldManagerItem): void {
        this.closeActions();
        this.createOrEditFieldManagerModal.show(item.id);
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
                this.fieldManagerService.delete(item.id);
                this.loadItems();
                this.notify.success(this.l('SuccessfullyDeleted'));

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
        this.items = this.fieldManagerService.getAll();
    }
}
