import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppFieldHistoryDto } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-field-revision-history',
    templateUrl: './revision-history.component.html',
    styleUrls: ['./revision-history.component.scss']
})
export class RevisionHistoryComponent {
    @Input() revisions: AppFieldHistoryDto[] = [];
    @Input() currentRevisionNo?: string;
    @Output() revisionSelected = new EventEmitter<AppFieldHistoryDto>();

    isCurrent(revision: AppFieldHistoryDto): boolean {
        const normalize = (no?: string) => {
            const value = no?.trim();
            return value && /^\d+$/.test(value) ? String(Number(value)) : value?.toLowerCase();
        };
        const current = normalize(this.currentRevisionNo);
        return !!current && current === normalize(revision.revisionNo || revision.field?.currentRevisionNo);
    }

    selectRevision(revision: AppFieldHistoryDto): void {
        this.revisionSelected.emit(revision);
    }
}
