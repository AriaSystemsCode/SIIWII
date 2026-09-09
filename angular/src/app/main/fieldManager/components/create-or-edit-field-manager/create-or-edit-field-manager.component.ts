import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FieldManagerItem } from '../../field-manager.model';
import { FieldManagerService } from '../../field-manager.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-create-or-edit-field-manager',
    templateUrl: './create-or-edit-field-manager.component.html',
    styleUrls: ['./create-or-edit-field-manager.component.scss']
})
export class CreateOrEditFieldManagerComponent extends AppComponentBase implements OnInit {
    @ViewChild('fieldManagerModal', { static: true }) modal!: ModalDirective;
    @Output() saved = new EventEmitter<void>();
    @Output() closed = new EventEmitter<void>();
    item: FieldManagerItem = this.createEmptyItem();
    isEdit = false;
    isRevision = false;
    active = false;
    activeTab: 'field-info' | 'field-history-log' = 'field-info';
    dropdownOptions: { option: string, value: string }[] = [];
    isHost :boolean=false;
    private initialFormState = '';

    constructor(
        injector: Injector,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private fieldManagerService: FieldManagerService
    ) {
        super(injector);
    }

    ngOnInit(): void {
        const id = Number(this.activatedRoute.snapshot.paramMap.get('id'));
        this.isHost = !this.appSession.tenantId;
        if (!id) {
            return;
        }

        const item = this.fieldManagerService.getById(id);
        if (item) {
            this.item = { ...item };
            this.isEdit = true;
            this.isRevision = true;
        }
    }

    show(id?: number, fromExisting = false, tableName?: string, entityId?: number | null): void {
        this.activeTab = 'field-info';
        this.isEdit = !!id;
        this.isRevision = !!id;
        if (id) {
            const item = this.fieldManagerService.getById(id);
            if (item) {
                this.item = { ...item };
                this.dropdownOptions = (item.dropdownOptions || []).map(option => ({ ...option }));
            }
        } else {
            this.item = this.createEmptyItem();
            this.dropdownOptions = [];
            if (tableName) {
                this.item.tables = tableName;
            }
            if (entityId !== undefined && entityId !== null) {
                this.item.entityId = entityId;
            }
            if (fromExisting) {
                this.item.status = 'Proposed';
            }
        }
        this.active = true;
        this.initialFormState = this.getFormState();
        this.modal.show();
    }

    selectTab(tab: 'field-info' | 'field-history-log', event: Event): void {
        event.preventDefault();
        this.activeTab = tab;
    }

    save(): void {
        this.item.dropdownOptions = this.dropdownOptions
            .filter(option => option.option.trim().length > 0 || option.value.trim().length > 0)
            .map(option => ({
                option: option.option.trim(),
                value: option.value.trim()
            }));
        this.fieldManagerService.save(this.item);
        this.notify.success(this.l('SavedSuccessfully'));
        this.saved.emit();
        this.initialFormState = this.getFormState();
        this.close();
    }

    backToList(): void {
        this.router.navigate(['/app/main/fieldManager']);
    }

    close(): void {
        if (this.getFormState() === this.initialFormState) {
            this.active = false;
            this.modal.hide();
            this.closed.emit();
            return;
        }

          Swal.fire({
                            title: "",
                            text:  "Do you want to cancel and lose all your progress?",
                            icon: "info",
                            confirmButtonText:
                                "Ok",
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            backdrop: true,
                            customClass: {
                                popup: "popup-class",
                                icon: "icon-class",
                                content: "content-class",
                                actions: "actions-class",
                                confirmButton: "confirm-button-class2",
                            },
                    }).then((result) => {
                        if (result.isConfirmed) {
                            this.active = false;
                            this.modal.hide();
                            this.closed.emit();
                        }
                    });
                        
        
    }

    private getFormState(): string {
        return JSON.stringify({
            item: this.item,
            dropdownOptions: this.dropdownOptions
        });
    }

    addOption(): void {
        this.dropdownOptions.push({ option: '', value: '' });
    }

    removeOption(index: number): void {
        this.dropdownOptions.splice(index, 1);
    }

    private createEmptyItem(): FieldManagerItem {
        return {
            id: 0,
            code: '',
            name: '',
            description: '',
            type: '',
            createdUser: '',
            entityId: 2,
            tables: '',
            status: 'Proposed',
            revision: 0,
            revisionSequence: '00',
            fieldLevel: 'Application',
            trackingNumber: '',
            allowNull: true,
            length: 0,
            allowMultiSelect: false,
            decimals: 0,
            dateFormat: 'mm/dd/yyyy',
            defaultValue: '',
            visible: true,
            editable: true,
            dropdownOptions: [],
            extraData: false,
            required: false,
            active: true,
            canSync: true
        };
    }
}
