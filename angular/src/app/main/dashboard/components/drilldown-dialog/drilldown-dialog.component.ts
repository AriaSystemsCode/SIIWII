import { Component, EventEmitter, Input, OnChanges, Output, ViewEncapsulation } from '@angular/core';

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

    ngOnChanges(): void {
        this.columns = this.records?.length
            ? Object.keys(this.records[0]).filter(field => field.toLowerCase() !== 'id')
            : [];
    }

    close(): void {
        this.visible = false;
        this.visibleChange.emit(false);
    }
}