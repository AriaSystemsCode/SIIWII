import { Component, HostListener, Injector, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CreateOrEditFieldManagerComponent } from '../create-or-edit-field-manager/create-or-edit-field-manager.component';
import { ViewFieldManagerComponent } from '../view-field-manager/view-field-manager.component';
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
    items: FieldManagerItem[] = [];
    filterText = '';
    onlyExtraData = false;
    groupBy = 'none';
    activeActionId: number | null = null;
    activePanel: 'all' | 'entity' = 'all';
    private returnToViewId: number | null = null;
    entityTree: FieldManagerEntityNode[] = [];
    expandedEntityIds: number[] = [];
    selectedEntityId: number | null = null;
    selectedEntityPath: FieldManagerEntityNode[] = [];

    readonly groupOptions = [
        //  { label: 'No group', value: 'none' },
        { label: 'Group', value: 'none' },
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
            if (this.onlyExtraData && !item.extraData) {
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
        this.activeActionId = null;
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
        this.createOrEditFieldManagerModal.show();
    }

    addFromExisting(): void {
        this.createOrEditFieldManagerModal.show(undefined, true);
    }

    toggleActions(item: FieldManagerItem, event: MouseEvent): void {
        event.stopPropagation();
        this.activeActionId = this.activeActionId === item.id ? null : item.id;
    }

    createNewRevision(item: FieldManagerItem): void {
        this.activeActionId = null;
        this.createOrEditFieldManagerModal.show(item.id);
    }

    view(item: FieldManagerItem): void {
        this.activeActionId = null;
        this.viewFieldManagerModal.show(item);
    }

    delete(item: FieldManagerItem): void {
        this.activeActionId = null;
        var isConfirmed: Observable<boolean>;
        isConfirmed = this.askToConfirm(
            "AreYouSureYouWantToDeleteThisField?",
            "Confirm"
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

    createNewRevisionFromView(id: number): void {
        this.activeActionId = null;
        this.returnToViewId = id;
        this.viewFieldManagerModal.close();
        this.createOrEditFieldManagerModal.show(id);
    }

    onCreateOrEditClosed(): void {
        if (this.returnToViewId === null) {
            return;
        }

        const id = this.returnToViewId;
        this.returnToViewId = null;
        const item = this.fieldManagerService.getById(id);
        if (item) {
            this.viewFieldManagerModal.show(item);
        }
    }

    @HostListener('document:click')
    closeActions(): void {
        this.activeActionId = null;
    }

    private loadItems(): void {
        this.items = this.fieldManagerService.getAll();
    }
}
