import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppFieldHistoryDto } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-field-revision-history',
    templateUrl: './revision-history.component.html',
    styleUrls: ['./revision-history.component.scss']
})
export class RevisionHistoryComponent {
    @Input() revisions: AppFieldHistoryDto[] = [];
    @Output() revisionSelected = new EventEmitter<AppFieldHistoryDto>();

    selectRevision(revision: AppFieldHistoryDto): void {
        this.revisionSelected.emit(revision);
    }
}
