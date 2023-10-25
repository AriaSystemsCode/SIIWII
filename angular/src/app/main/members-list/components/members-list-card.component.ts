import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GetMemberForViewDto } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-members-list-card',
  templateUrl: './members-list-card.component.html',
  styleUrls: ['./members-list-card.component.scss']
})
export class MembersListCardComponent extends AppComponentBase {
    attachmentBaseUrl :string = AppConsts.attachmentBaseUrl
    @Input('member') member : GetMemberForViewDto
    @Input('singleItemPerRowMode') singleItemPerRowMode : boolean
    @Input('isHost') isHost : boolean
    @Input('showActiveStatus') showActiveStatus : boolean
    @Output() viewMe : EventEmitter<boolean> = new EventEmitter<boolean>()
    constructor(
        injector:Injector,
    ){
        super(injector);
    }

    viewProfile(): void {
        if( isNaN(this.member?.id) ) return
        this.viewMe.emit()
    }

    clickCardHandler(){
        this.viewProfile()
    }
}
