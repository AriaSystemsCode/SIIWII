import { Component, HostListener, Injector, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CreateOrEditFieldManagerComponent } from '../create-or-edit-field-manager/create-or-edit-field-manager.component';
import { ViewFieldManagerComponent } from '../view-field-manager/view-field-manager.component';
import { ExistingFieldsModalComponent } from '../existing-fields-modal/existing-fields-modal.component';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FieldManagerService } from '../../field-manager.service';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AppFieldListDto, FieldManagerPermissionDto, ObjectTypeTreeNodeDto } from '@shared/service-proxies/service-proxies';
import { LazyLoadEvent } from 'primeng/api';

type GroupedField = Omit<AppFieldListDto, 'init' | 'toJSON'> & { groupValue: string };
type FieldGroup = { value: string, label: string, fields: GroupedField[] };

@Component({
    selector: 'app-browse-field-manager',
    templateUrl: './browse-field-manager.component.html',
    styleUrls: ['./browse-field-manager.component.scss']
})
export class BrowseFieldManagerComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditFieldManagerModal', { static: true }) createOrEditFieldManagerModal!: CreateOrEditFieldManagerComponent;
    @ViewChild('viewFieldManagerModal', { static: true }) viewFieldManagerModal!: ViewFieldManagerComponent;
    @ViewChild('existingFieldsModal', { static: true }) existingFieldsModal!: ExistingFieldsModalComponent;
    fields: AppFieldListDto[] = [];
    totalRecords = 0;
    first = 0;
    rows = 10;
    private readonly groupedFieldsMaxResultCount = 1000000000;
    loading = false;
    sorting = '';
    filterText = '';
    extraDataFilter: 'all' | 'only' | 'without' = 'all';
    groupBy: 'none' | keyof Pick<AppFieldListDto, 'fieldTypeName' | 'creatorUserId' | 'fieldLevelName'> = 'none';
    expandedGroups: { [groupValue: string]: boolean } = {};
    activeActionFieldId: number | null = null;
    activeActionField: AppFieldListDto | null = null;
    actionMenuPosition = { top: 0, left: 0 };
    activePanel: 'all' | 'entity' = 'all';
    entityTree: ObjectTypeTreeNodeDto[] = [];
    entitySearchText = '';
    expandedEntityIds: string[] = [];
    private collapsedEntityIds: string[] = [];
    selectedEntityId: number | null = null;
    selectedEntityKey: string | null = null;
    selectedNode: ObjectTypeTreeNodeDto | null = null;
    permissions: FieldManagerPermissionDto = new FieldManagerPermissionDto({
        canViewPage: false,
        canCreateField: false,
        canEditField: false,
        canDeleteField: false,
        canDuplicateField: false,
        canRestoreRevision: false,
        canAddExistingField: false,
        isHost: false,
        isTenant: false
    });
    private fieldsRequest = 0;
    selectedEntityPath: ObjectTypeTreeNodeDto[] = [];

    readonly groupOptions = [
        //  { label: 'No group', value: 'none' },
        { label: 'No Group', value: 'none' },
        { label: 'Field Type', value: 'fieldTypeName' },
        { label: 'Created User', value: 'creatorUserId' },
        { label: 'Field Level', value: 'fieldLevelName' }
    ];

    constructor(
        injector: Injector,
        private fieldManagerService: FieldManagerService,
        private router: Router
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.showMainSpinner();
        forkJoin({
            permissions: this.fieldManagerService.getPagePermissions().pipe(catchError(() => {
                this.notify.error('Could not load field manager permissions.');
                return of(this.permissions);
            })),
            tree: this.fieldManagerService.getEntityTree().pipe(catchError(() => {
                this.notify.error('Could not load the field manager tree.');
                return of([] as ObjectTypeTreeNodeDto[]);
            }))
        }).pipe(finalize(() => this.hideMainSpinner())).subscribe(result => {
            this.permissions = result.permissions;
            this.entityTree = result.tree;
            this.loadFields();
        });
    }

    get displayedFields(): AppFieldListDto[] {
        return this.fields;
    }

    tablesDisplay(tables: string[] | undefined): string {
        const fullValue = (tables || []).join(', ');
        return fullValue.length > 30 ? `${fullValue.slice(0, 30)}...` : fullValue;
    }

    get filteredFields(): AppFieldListDto[] {
        const filter = this.filterText.trim().toLowerCase();
        return this.displayedFields.filter(field => {
            if (this.extraDataFilter === 'only' && !field.isExtraField) {
                return false;
            }

            if (this.extraDataFilter === 'without' && field.isExtraField) {
                return false;
            }

            if (!filter) {
                return true;
            }

            return (field.fieldName || '').toLowerCase().includes(filter) ||
                (field.fieldCode || '').toLowerCase().includes(filter) ||
                (field.fieldTypeName || '').toLowerCase().includes(filter) ||
                (field.tables || []).join(', ').toLowerCase().includes(filter) ||
                (field.statusName || '').toLowerCase().includes(filter) ||
                (field.fieldLevelName || '').toLowerCase().includes(filter) ||
                (field.trackingNo || '').toLowerCase().includes(filter);
        });
    }

    selectPanel(panel: 'all' | 'entity'): void {
        this.activePanel = panel;
        this.first = 0;
        this.selectedEntityId = null;
        this.selectedEntityKey = null;
        this.selectedNode = null;
        this.selectedEntityPath = [];
        this.expandedEntityIds = [];
        this.collapsedEntityIds = [];
        this.closeActions();
        this.loadFields();
    }

    toggleEntity(node: ObjectTypeTreeNodeDto, event: MouseEvent): void {
        event.stopPropagation();
        this.first = 0;
        const nodeKey = node.key || '';
        this.selectedEntityPath = this.findEntityPath(nodeKey, this.entityTree);
        this.selectedEntityId = node.sycObjectId;
        this.selectedEntityKey = nodeKey;
        this.selectedNode = node;
        if (node.children && node.children.length) {
            if (this.isEntityExpanded(node)) {
                this.expandedEntityIds = this.expandedEntityIds.filter(id => id !== nodeKey);
                if (this.entitySearchText.trim() && this.collapsedEntityIds.indexOf(nodeKey) === -1) {
                    this.collapsedEntityIds = [...this.collapsedEntityIds, nodeKey];
                }
            } else {
                this.expandedEntityIds = [...this.expandedEntityIds, nodeKey];
                this.collapsedEntityIds = this.collapsedEntityIds.filter(id => id !== nodeKey);
            }
        }
        this.loadFields();
    }

    isEntityExpanded(node: ObjectTypeTreeNodeDto): boolean {
        const nodeKey = node.key || '';
        if (this.entitySearchText.trim() && this.collapsedEntityIds.indexOf(nodeKey) !== -1) {
            return false;
        }

        return this.expandedEntityIds.indexOf(nodeKey) !== -1 ||
            (!!this.entitySearchText.trim() && this.getEntityChildren(node).length > 0);
    }

    onEntitySearchChange(): void {
        this.collapsedEntityIds = [];
    }

    get visibleEntityTree(): ObjectTypeTreeNodeDto[] {
        return this.filterEntityNodes(this.entityTree, this.entitySearchText.trim().toLowerCase());
    }

    getEntityChildren(node: ObjectTypeTreeNodeDto): ObjectTypeTreeNodeDto[] {
        const search = this.entitySearchText.trim().toLowerCase();
        if (!search || (node.name || '').toLowerCase().includes(search)) {
            return node.children || [];
        }

        return this.filterEntityNodes(node.children || [], search);
    }

    private filterEntityNodes(nodes: ObjectTypeTreeNodeDto[], search: string): ObjectTypeTreeNodeDto[] {
        if (!search) {
            return nodes;
        }

        return nodes.reduce((matches, node) => {
            if ((node.name || '').toLowerCase().includes(search)) {
                matches.push(node);
                return matches;
            }

            const children = this.filterEntityNodes(node.children || [], search);
            if (children.length) {
                matches.push(new ObjectTypeTreeNodeDto({ ...node, children }));
            }
            return matches;
        }, [] as ObjectTypeTreeNodeDto[]);
    }

    get breadcrumbPath(): ObjectTypeTreeNodeDto[] {
        if (this.activePanel === 'all') {
            return [new ObjectTypeTreeNodeDto({ id: 0, parentId: undefined, key: 'AllFields', parentKey: undefined,
                code: 'ALL', name: 'AllFields', nodeType: 'Entity', sycObjectId: 0, children: undefined })];
        }

        return this.selectedEntityPath;
    }

    private findEntityPath(key: string, nodes: ObjectTypeTreeNodeDto[], parents: ObjectTypeTreeNodeDto[] = []): ObjectTypeTreeNodeDto[] {
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

    get groupedFields(): GroupedField[] {
        const fields = this.filteredFields.map(field => ({
            ...field,
            groupValue: this.getGroupValue(field)
        }));

        if (this.groupBy === 'none') {
            return fields;
        }

        return fields.sort((first, second) => first.groupValue.localeCompare(second.groupValue));
    }

    get groupedFieldGroups(): FieldGroup[] {
        const groups = new Map<string, GroupedField[]>();
        this.groupedFields.forEach(field => {
            groups.set(field.groupValue, [...(groups.get(field.groupValue) || []), field]);
        });
        return Array.from(groups.entries()).map(([value, fields]) => ({
            value,
            label: this.getGroupDisplayValue(fields[0]),
            fields
        }));
    }

    get groupLabel(): string {
        const option = this.groupOptions.find(group => group.value === this.groupBy);
        return option ? option.label : 'No group';
    }

    onGroupByChange(groupBy: BrowseFieldManagerComponent['groupBy']): void {
        this.groupBy = groupBy;
        this.expandedGroups = {};
        this.first = 0;
        this.loadFields();
    }

    onSearchChange(): void {
        this.first = 0;
        this.loadFields();
    }

    onExtraDataFilterChange(): void {
        this.first = 0;
        this.loadFields();
    }

    loadFieldsPage(event: LazyLoadEvent): void {
        if (this.groupBy !== 'none') return;
        this.first = event.first || 0;
        this.rows = event.rows || this.rows;
        this.sorting = event.sortField
            ? `${event.sortField} ${event.sortOrder === -1 ? 'DESC' : 'ASC'}`
            : '';
        this.loadFields();
    }

    isGroupExpanded(groupValue: string): boolean {
        if (this.groupBy === 'none') return true;
        return this.expandedGroups[groupValue] === true;
    }

    toggleGroup(groupValue: string, event: MouseEvent): void {
        event.stopPropagation();
        this.expandedGroups[groupValue] = !this.isGroupExpanded(groupValue);
    }

    private getGroupValue(field: AppFieldListDto): string {
        if (this.groupBy === 'none') {
            return '';
        }

        return String(field[this.groupBy] ?? '');
    }

    getGroupDisplayValue(field: GroupedField): string {
        if (this.groupBy === 'creatorUserId') {
            return field.creatorUserName || '-';
        }

        return field.groupValue || '-';
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
        this.loadFields();
        if (count) {
            this.notify.success(this.l('FieldsAddedSuccessfully'));
        }
    }

    toggleActions(field: AppFieldListDto, event: MouseEvent): void {
        event.stopPropagation();
        if (this.activeActionFieldId === field.id) {
            this.closeActions();
            return;
        }

        const trigger = event.currentTarget as HTMLElement;
        const triggerBounds = trigger.getBoundingClientRect();
        const scrollBody = trigger.closest('.p-datatable-scrollable-body');
        const scrollBounds = scrollBody && scrollBody.getBoundingClientRect();
        const menuWidth = 160;
        const actionCount = 1 + Number(!!field.canEdit && this.permissions.canEditField)
            + Number(this.permissions.canDuplicateField) + Number(!!field.canHide && this.permissions.canEditField)
            + Number(!!field.canDelete);
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
        this.activeActionField = field;
        this.activeActionFieldId = field.id;
    }

    /* closeToolbarDropdown(event: KeyboardEvent): void {
        this.toolbarDropdownOpen = false;
        (event.target as HTMLElement).blur();
    }
 */
    CreateNewRevision(field: AppFieldListDto): void {
        this.closeActions();
        this.createOrEditFieldManagerModal.show(field.id);
    }

    duplicate(field: AppFieldListDto): void {
        this.closeActions();
        this.fieldManagerService.duplicateField(field.id).subscribe({
            next: () => {
                this.loadFields();
                this.notify.success('Field duplicated.');
            },
            error: () => this.notify.error('Could not duplicate the field.')
        });
    }

    hide(field: AppFieldListDto): void {
        this.closeActions();
        this.askToConfirm('Hide this field for your tenant?', this.l('Confirm')).subscribe(confirmed => {
            if (!confirmed) return;
            this.fieldManagerService.hideField(field.id).subscribe({
                next: () => {
                    this.loadFields();
                    this.notify.success('Field hidden.');
                },
                error: () => this.notify.error('Could not hide the field.')
            });
        });
    }

    view(field: AppFieldListDto): void {
        this.closeActions();
        this.viewFieldManagerModal.show(field);
    }

    delete(field: AppFieldListDto): void {
        this.closeActions();
        var isConfirmed: Observable<boolean>;
        isConfirmed = this.askToConfirm(
            this.l("AreYouSureYouWantToDeleteThisField?"), 
            this.l("Confirm")
        );

        isConfirmed.subscribe((res) => {
            if (res) {
                this.fieldManagerService.deleteServerField(field.id).subscribe({
                    next: () => {
                        this.loadFields();
                        this.notify.success(this.l('SuccessfullyDeleted'));
                    },
                    error: () => this.notify.error('Could not delete the field.')
                });

            }
        });
    }

    onCreateOrEditDone(): void {
        this.loadFields();
        const fieldId = this.viewFieldManagerModal.item?.id;
        if (this.viewFieldManagerModal.active && fieldId) {
            this.viewFieldManagerModal.show({ id: fieldId });
        }
    }

    onRevisionSaved(): void {
        this.loadFields();
    }

    onViewClosed(): void {
        this.loadFields();
    }

    @HostListener('document:click')
    closeActions(): void {
        this.activeActionFieldId = null;
        this.activeActionField = null;
    }

    private loadFields(): void {
        const request = ++this.fieldsRequest;
        this.loading = true;
        this.showMainSpinner();
        const node = this.activePanel === 'entity' ? this.selectedNode : null;
        const isStandard = this.extraDataFilter === 'all'
            ? undefined
            : this.extraDataFilter === 'without';

        if (this.groupBy === 'none') {
            this.fetchFields(node, this.first, this.rows, isStandard, request);
            return;
        }

        this.fields = [];
        this.fetchFields(node, 0, this.groupedFieldsMaxResultCount, isStandard, request);
    }

    private fetchFields(
        node: ObjectTypeTreeNodeDto | null,
        skipCount: number,
        maxResultCount: number,
        isStandard: boolean | undefined,
        request: number
    ): void {
        this.fieldManagerService.getFieldsPageForNode(
            node,
            skipCount,
            maxResultCount,
            this.filterText.trim() || undefined,
            isStandard,
            this.sorting
        ).pipe(finalize(() => {
            if (request === this.fieldsRequest) {
                this.loading = false;
                this.hideMainSpinner();
            }
        })).subscribe({
            next: result => {
                if (request !== this.fieldsRequest) return;
                this.fields = (result.items || []).filter(field => !field.isHidden);
                this.totalRecords = result.totalCount;
            },
            error: () => { if (request === this.fieldsRequest) this.notify.error('Could not load fields.'); }
        });
    }
}
