import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-views-stats',
    templateUrl: './views-stats.component.html',
    styleUrls: ['./views-stats.component.scss']
})
export class ViewsStatsComponent {
    @Input() viewsCount : number
    constructor() { }

}
