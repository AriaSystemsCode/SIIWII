import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { SelectItem } from 'primeng/api';
export enum DropdownSelection {
    Single = 1,
    Multi = 2
}
export class PaginationSettings {
    list: SelectItem[]
    totalCount: number
    maxResultCount: number = 10
    skipCount: number = 0
    constructor(data?: IPaginationSettings) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property)) {
                    (<any>this)[property] = (<any>data)[property];
                }
            }
        }
    }
}
export interface IPaginationSettings {
    list: SelectItem[]
    listTotalCount: number
    listMaxResultCount: number
    listSkipCount: number
}
@Component({
    selector: 'app-dropdown-with-pagination',
    templateUrl: './dropdown-with-pagination.component.html',
    styleUrls: ['./dropdown-with-pagination.component.scss']
})
export class DropdownWithPaginationComponent extends AppComponentBase implements OnChanges {
    DropdownSelection = DropdownSelection
    @Input() title : string
    @Input() selectionType : DropdownSelection
    @Input() paginationSettings : PaginationSettings
    @Output() selectionChanged : EventEmitter<number | number[]> = new EventEmitter<number | number[]>()
    @Output() loadMoreData : EventEmitter<any> = new EventEmitter<any>()
    selectedValue :number | number[]
    active:boolean = false
    constructor(private injector:Injector) {
        super(injector)
    }
    ngOnChanges(changes: SimpleChanges): void {
        if(this.selectionType && this.paginationSettings && this.title) {
            this.active = true
        }
    }

    onDropDownChange($event: {
        value: number,
        originalEvent: MouseEvent
    }){
        if($event.value == -1) {
            this.selectedValue = undefined
            return this.loadMoreData.emit()
        }
        this.selectionChanged.emit($event.value)
    }

    onMultiSelectChange($event: {
        itemValue: number,
        value: number[],
        originalEvent: MouseEvent,
    },){
        if($event.itemValue == -1) {
            this.selectedValue = (this.selectedValue as number []).filter(item=>item > 0)
            return this.loadMoreData.emit()
        }
        this.selectionChanged.emit($event.value)
    }
}
