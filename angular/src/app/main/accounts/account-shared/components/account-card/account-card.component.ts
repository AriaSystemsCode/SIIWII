import { Component, EventEmitter, Injector, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import {  AccountsServiceProxy, GetAccountForViewDto } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-account-card',
  templateUrl: './account-card.component.html',
  styleUrls: ['./account-card.component.scss']
})
export class AccountCardComponent extends AppComponentBase implements OnChanges {
    @Input('account') account : GetAccountForViewDto
    @Input('singleItemPerRowMode') singleItemPerRowMode : boolean
    @Input('isHost') isHost : boolean
    @Output() deleteMe : EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output() disconnectMe : EventEmitter<GetAccountForViewDto> = new EventEmitter<GetAccountForViewDto>()
    @Input() fromMarketplace;
    @Output() _createRelation : EventEmitter<GetAccountForViewDto> = new EventEmitter<GetAccountForViewDto>()

    isRecordOwner : boolean
    attachmentBaseUrl :string = AppConsts.attachmentBaseUrl
    
    constructor(
        injector:Injector,
        private router:Router,
        private _accountsServiceProxy: AccountsServiceProxy,
    ){
        super(injector);
    }
    ngOnChanges(changes: SimpleChanges): void {
        this.isRecordOwner = this.account.account.partnerId == this.appSession.user.accountId
    }
    
    get id () : number { return this.account.account.id }
    get isManual () : boolean { return this.account.account.isManual }
    deleteAccount(){
        this.deleteMe.emit()
    }



    edit(): void {
        if(!this.id) return
        let editPrefix = this.isHost ? "external" : "manual"
        this.router.navigate([`/app/main/account/edit-${editPrefix}/${this.id}`])
    }
    viewProfile(): void {
        if(!this.fromMarketplace) {
            if(!this.id) return
            this.router.navigate([`/app/main/account/view/${this.id}`], {
                queryParams: { fromMarketplace: this.fromMarketplace }
              });
        } else {
            if(!this.id) return
            this.router.navigate([`/app/main/account/view-marketplace-acc/${this.id}`], {
                state: {
                    accountType: this.account.account.accountType,
                     ssin:this.account.account.ssin
                   }});
        }
   
    }
    clickCardHandler(){
        if (this.isManual) {
            this.edit()
        } else {
            this.viewProfile()
        }
    }

    createRelation(){
      this._createRelation.emit(this.account);
    }
    getFormattedConnectionName(connection: string): string | null {
        let raw: string | undefined;
      
        if (connection === 'connectionName') {
          raw = this.account?.connectionName?.trim();
        } else if (connection === 'avaliableConnectionName') {
          raw = this.account?.avaliableConnectionName?.trim();
        }else{
          raw = this.account?.disConnectLabel?.trim();
        }
      
        if (!raw) return null;
      
        // If it's 'Follow', return as-is
        if (raw === 'Follow') return 'Follow';
      
        // Format only if starts with 'MPAction'
        if (raw.startsWith('MPAction')) {
          const label = raw.replace('MPAction', '');
          return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
        }
      
        // For anything else, return null (or raw if you prefer)
        return null;
      }
      removeRelation(account){
     

        this.disconnectMe.emit(account);
   
      }

}
