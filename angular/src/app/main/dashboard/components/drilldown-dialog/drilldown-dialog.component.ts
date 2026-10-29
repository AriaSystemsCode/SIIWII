import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-drilldown-dialog',
    templateUrl: './drilldown-dialog.component.html',
    styleUrls: ['./drilldown-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DrilldownDialogComponent implements OnChanges {
    @Input() visible = false;
    @Input() title = '';
    @Input() records: any[] = [];

    @Output() visibleChange = new EventEmitter<boolean>();

    columns: string[] = [];

    first = 0;
    sortField: string | undefined = undefined;
    sortOrder = 1;



    ngOnChanges(changes: SimpleChanges): void {
        if (
            changes['records'] ||
            (changes['visible'] && this.visible)
        ) {
            this.first = 0;
            this.sortField = undefined;
            this.sortOrder = 1;
        }

        this.columns = this.records?.length
            ? Object.keys(this.records[0])
                .filter(field => field.toLowerCase() !== 'id')
            : [];
    }

    onTableSort(event: { field?: string; order?: number }): void {
        this.sortField = event.field;
        this.sortOrder = event.order ?? 1;
    }

    close(): void {
        this.visible = false;
        this.visibleChange.emit(false);
    }
}