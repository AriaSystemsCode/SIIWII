import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FieldManagerItem } from '../../field-manager.model';
import { FieldManagerService } from '../../field-manager.service';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-view-field-manager',
    templateUrl: './view-field-manager.component.html',
    styleUrls: ['./view-field-manager.component.scss']
})
export class ViewFieldManagerComponent extends AppComponentBase implements OnInit {
    @ViewChild('fieldManagerViewModal', { static: true }) modal!: ModalDirective;
    @Output() createNewRevisionRequested = new EventEmitter<number>();
    item: FieldManagerItem = {
        id: 0,
        code: '',
        name: '',
        description: '',
        type: '',
        createdUser: '',
        entityId: 0,
        tables: '',
        status: '',
        revision: 0,
        fieldLevel: '',
        trackingNumber: '',
        allowNull: false,
        length: 0,
        allowMultiSelect: false,
        decimals: 0,
        dateFormat: 'mm/dd/yyyy',
        defaultValue: '',
        visible: false,
        editable: false,
        dropdownOptions: [],
        extraData: false,
        required: false,
        active: false,
        canSync: false
    };
    hasItem = false;
    active = false;

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
        const item = this.fieldManagerService.getById(id);
        if (item) {
            this.item = item;
            this.hasItem = true;
        }
    }

    show(item: FieldManagerItem): void {
        this.item = { ...item };
        this.hasItem = true;
        this.active = true;
        this.modal.show();
    }

    sync(): void {
        if (!this.item.canSync) {
            return;
        }

        this.notify.info(this.l('FieldManager') + ' ' + this.l('Synchronized'));
    }

    backToList(): void {
        this.router.navigate(['/app/main/fieldManager']);
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }

    createNewRevision(): void {
        if (!this.hasItem) {
            return;
        }

        this.createNewRevisionRequested.emit(this.item.id);
    }
}
