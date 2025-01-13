import { Component, Input, Output , EventEmitter, Injector, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GetAccountForViewDto } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-connections-card',
  templateUrl: './connections-card.component.html',
  styleUrls: ['../../../accounts/account-shared/components/account-card.component.scss', './connections-card.component.scss']
})
export class ConnectionsCardComponent extends AppComponentBase {

  attachmentBaseUrl :string = AppConsts.attachmentBaseUrl
    @Input('account') account : GetAccountForViewDto
    @Input('singleItemPerRowMode') singleItemPerRowMode : boolean
    @Input('isHost') isHost : boolean
    @Output() deleteMe : EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output() connectMe : EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output() disconnectMe : EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output() _createRelation : EventEmitter<GetAccountForViewDto> = new EventEmitter<GetAccountForViewDto>()

    
    constructor(
        injector:Injector,
        private router:Router
    ){
        super(injector);
    }
    ngOnChanges(changes: SimpleChanges): void {
        this.isRecordOwner = this.account.account.partnerId == this.appSession.user.accountId
            this.singleItemPerRowMode  =  false ;
    }
    isRecordOwner : boolean
    get id () : number { return this.account.account.id }
    get isManual () : boolean { return this.account.account.isManual }
    deleteAccount(){
        this.deleteMe.emit()
    }
    connect(): void {
        this.connectMe.emit()
    }

    disconnect(): void {
        this.disconnectMe.emit()
    }

    edit(): void {
        if(!this.id) return
        let editPrefix = this.isHost ? "external" : "manual"
        this.router.navigate([`/app/main/account/edit-${editPrefix}/${this.id}`])
    }
    viewProfile(): void {
            if(!this.id) return
 this.router.navigate([`/app/main/account/view-marketplace-acc/${this.id}`], {
                  queryParams: {
                    accountType: this.account.account.accountType
                  }});
    }
    clickCardHandler(){
        // view profile

        // edit manual or external
        if (this.isManual) {
            this.edit()
        } else {
            this.viewProfile()
        }
    }

    createRelation(){
      this._createRelation.emit(this.account);
    }

}

