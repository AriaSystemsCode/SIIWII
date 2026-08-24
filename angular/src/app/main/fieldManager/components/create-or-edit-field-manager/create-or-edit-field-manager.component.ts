import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FieldManagerItem } from '../../field-manager.model';
import { FieldManagerService } from '../../field-manager.service';

@Component({
    selector: 'app-create-or-edit-field-manager',
    templateUrl: './create-or-edit-field-manager.component.html',
    styleUrls: ['./create-or-edit-field-manager.component.scss']
})
export class CreateOrEditFieldManagerComponent extends AppComponentBase implements OnInit {
    @ViewChild('fieldManagerModal', { static: true }) modal!: ModalDirective;
    @Output() saved = new EventEmitter<void>();
    item: FieldManagerItem = this.createEmptyItem();
    isEdit = false;
    isRevision = false;
    active = false;
    dropdownOptions: { option: string, value: string }[] = [];

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

    show(id?: number, fromExisting = false): void {
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
            if (fromExisting) {
                this.item.status = 'Proposed';
            }
        }
        this.active = true;
        this.modal.show();
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
        this.close();
    }

    backToList(): void {
        this.router.navigate(['/app/main/fieldManager']);
    }

    close(): void {
        this.active = false;
        this.modal.hide();
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
            type: 'Text',
            createdUser: '',
            entityId: 2,
            tables: 'Purchase Order',
            status: 'Proposed',
            revision: 0,
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
            active: true
        };
    }
}
