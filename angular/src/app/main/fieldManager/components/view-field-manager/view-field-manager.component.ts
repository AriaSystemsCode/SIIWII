import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';
import { FieldManagerItem } from '../../field-manager.model';
import { FieldManagerRevision, FieldManagerService } from '../../field-manager.service';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-view-field-manager',
    templateUrl: './view-field-manager.component.html',
    styleUrls: ['./view-field-manager.component.scss']
})
export class ViewFieldManagerComponent extends AppComponentBase implements OnInit {
    @ViewChild('fieldManagerViewModal', { static: true }) modal!: ModalDirective;
    @Output() revisionSaved = new EventEmitter<void>();
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
            revisionSequence: '00',
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
    revisions: FieldManagerRevision[] = [];
    selectedRevision: FieldManagerRevision | null = null;
    viewState: 'details' | 'history' | 'draft' = 'details';
    hasItem = false;
    active = false;
    isViewingHistoryRevision = false;
    private sourceItemId = 0;
    private currentItem: FieldManagerItem | null = null;

    constructor(
        injector: Injector,
        private activatedRoute: ActivatedRoute,
        private fieldManagerService: FieldManagerService
    ) {
        super(injector);
    }

    ngOnInit(): void {
        const id = Number(this.activatedRoute.snapshot.paramMap.get('id'));
        const item = this.fieldManagerService.getById(id);
        if (item) {
            this.setItem(item);
        }
    }

    show(item: FieldManagerItem): void {
        this.setItem(item);
        this.active = true;
        this.modal.show();
    }

    goToHistory(): void {
        this.revisions = this.fieldManagerService.getRevisionHistory(this.item);
        this.selectedRevision = null;
        this.viewState = 'history';
    }

    backToFieldDetails(): void {
        const current = this.currentItem || this.fieldManagerService.getById(this.sourceItemId);
        const currentRevision = this.revisions.find(revision => revision.status === 'Current') || null;
        if (current) {
            this.item = this.copyItem(current);
        } else if (currentRevision) {
            this.item = this.copyItem(currentRevision.item);
        }
        this.currentItem = this.copyItem(this.item);
        this.selectedRevision = currentRevision;
        this.viewState = 'details';
        this.isViewingHistoryRevision = false;
    }

    openRevision(revision: FieldManagerRevision): void {
        this.selectedRevision = revision;
        this.item = this.copyItem(revision.item);
        this.viewState = 'details';
        this.isViewingHistoryRevision = revision.status === 'Previous';
    }

    backToHistory(): void {
        this.viewState = 'history';
    }

    createNewRevision(): void {
        const source = this.copyItem(this.item);
        const latestRevision = this.revisions.reduce((latest, revision) => {
            return Math.max(latest, parseInt(revision.revisionSequence, 10) || 0);
        }, parseInt(source.revisionSequence, 10) || 0);
        const nextRevision = latestRevision + 1;
        source.revisionSequence = ('00' + nextRevision).slice(-2);
        source.revision = nextRevision;
        this.item = source;
        this.viewState = 'draft';
    }

    restoreRevision(): void {
        if (!this.selectedRevision || this.selectedRevision.status !== 'Previous') {
            return;
        }

        const restoredItem = this.copyItem(this.selectedRevision.item);
        this.askToConfirm(
            'A new revision will be created and overwrite current revision.',
            'Create New Revision',
            {
                confirmButtonText: this.l('Yes'),
                cancelButtonText: this.l('No')
            }
        ).subscribe(confirmed => {
            if (!confirmed) {
                return;
            }

            const latestRevision = this.revisions.reduce((latest, revision) => {
                return Math.max(latest, parseInt(revision.revisionSequence, 10) || 0);
            }, parseInt(restoredItem.revisionSequence, 10) || 0);
            const nextRevision = latestRevision + 1;
            restoredItem.revisionSequence = ('00' + nextRevision).slice(-2);
            restoredItem.revision = nextRevision;
            this.item = restoredItem;
            this.saveRevision();
        });
    }

    saveRevision(): void {
        if (!this.item.code.trim() || !this.item.name.trim()) {
            return;
        }

        const saved = this.fieldManagerService.saveRevision(this.sourceItemId, this.item, this.item.revisionSequence);
        this.revisions = this.fieldManagerService.getRevisionHistory(saved);
        this.selectedRevision = this.revisions.find(revision => revision.status === 'Current') || null;
        this.item = this.selectedRevision
            ? this.copyItem(this.selectedRevision.item)
            : this.copyItem(saved);
        this.currentItem = this.copyItem(this.item);
        this.viewState = 'details';
        this.isViewingHistoryRevision = false;
        this.revisionSaved.emit();
        this.notify.success('Revision saved successfully.');
    }

    cancelDraft(): void {
        if (this.selectedRevision) {
            this.item = this.copyItem(this.selectedRevision.item);
        }
        this.viewState = 'details';
    }

    get revisionLabel(): string {
        return ('00' + (this.item.revisionSequence || '00')).slice(-2);
    }

    private setItem(item: FieldManagerItem): void {
        this.sourceItemId = item.id;
        this.item = this.copyItem(item);
        this.currentItem = this.copyItem(item);
        this.revisions = this.fieldManagerService.getRevisionHistory(item);
        this.selectedRevision = this.revisions.find(revision => revision.status === 'Current') || null;
        this.viewState = 'details';
        this.isViewingHistoryRevision = false;
        this.hasItem = true;
    }

    private copyItem(item: FieldManagerItem): FieldManagerItem {
        return {
            ...item,
            dropdownOptions: (item.dropdownOptions || []).map(option => ({ ...option }))
        };
    }

    close(): void {
        if (this.viewState === 'draft') {
            this.cancelDraft();
            return;
        }

        if (this.viewState === 'history') {
            this.backToFieldDetails();
            return;
        }

        this.active = false;
        this.modal.hide();
    }
}
