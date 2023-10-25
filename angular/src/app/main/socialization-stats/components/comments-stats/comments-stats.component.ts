import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-comments-stats',
    templateUrl: './comments-stats.component.html',
    styleUrls: ['./comments-stats.component.scss']
})
export class CommentsStatsComponent  {
    @Input() commentsCount:number
    @Input() parentId:number
}
