import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FieldManagerItem } from '../../field-manager.model';
import { FieldManagerService } from '../../field-manager.service';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-view-field-manager',
    templateUrl: './view-field-manager.component.html',
    styleUrls: ['./view-field-manager.component.scss']
})
export class ViewFieldManagerComponent extends AppComponentBase implements OnInit {
    @ViewChild('fieldManagerViewModal', { static: true }) modal!: ModalDirective;
    item: FieldManagerItem | null = null;
    active = false;
    private detailsRequest = 0;

    constructor(
        injector: Injector,
        private activatedRoute: ActivatedRoute,
        private fieldManagerService: FieldManagerService
    ) {
        super(injector);
    }

    ngOnInit(): void {
        const id = Number(this.activatedRoute.snapshot.paramMap.get('id'));
        if (id > 0) {
            this.loadDetails(this.fieldManagerService.getFieldDetailsById(id));
        }
    }

    show(item: FieldManagerItem): void {
        this.item = null;
        this.active = false;
        this.loadDetails(this.fieldManagerService.getFieldDetails(item));
    }

    private loadDetails(details: ReturnType<FieldManagerService['getFieldDetails']>): void {
        const request = ++this.detailsRequest;
        this.showMainSpinner();
        details.pipe(finalize(() => {
            if (request === this.detailsRequest) {
                this.hideMainSpinner();
            }
        })).subscribe({
            next: item => {
                if (request === this.detailsRequest) {
                    this.item = item;
                    this.active = true;
                    this.modal.show();
                }
            },
            error: () => {
                if (request === this.detailsRequest) {
                    this.notify.error('Could not load field details.');
                    this.close();
                }
            }
        });
    }

    close(): void {
        ++this.detailsRequest;
        this.hideMainSpinner();
        this.active = false;
        this.item = null;
        this.modal.hide();
    }
}
