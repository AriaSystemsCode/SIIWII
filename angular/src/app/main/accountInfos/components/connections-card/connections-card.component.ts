import { Component, Input, Output, EventEmitter, Injector, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountsServiceProxy, GetAccountForViewDto } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-connections-card',
    templateUrl: './connections-card.component.html',
    styleUrls: ['../../../accounts/account-shared/components/account-card/account-card.component.scss', './connections-card.component.scss']
})
export class ConnectionsCardComponent extends AppComponentBase {

    @Input('account') account: GetAccountForViewDto
    @Input('singleItemPerRowMode') singleItemPerRowMode: boolean
    @Input('isHost') isHost: boolean
    @Input('fromOverview') fromOverview: boolean = false

    @Output() deleteMe: EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output() connectMe: EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output() disconnectMe: EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output() _createRelation: EventEmitter<any> = new EventEmitter<any>()

    isRecordOwner: boolean
    attachmentBaseUrl: string = AppConsts.attachmentBaseUrl


    constructor(
        injector: Injector,
        private router: Router,
          private _accountsServiceProxy: AccountsServiceProxy,
    ) {
        super(injector);
    }
    ngOnChanges(changes: SimpleChanges): void {
        this.isRecordOwner = this.account.account.partnerId == this.appSession.user.accountId
        this.singleItemPerRowMode = false;

    }

    get id(): number { return this.account.account.id }
    get isManual(): boolean { return this.account.account.isManual }
    deleteAccount() {
        this.deleteMe.emit()
    }


    disconnect(account): void {
        this.disconnectMe.emit(account)
    }

    edit(): void {
        if (!this.id) return
        let editPrefix = this.isHost ? "external" : "manual"
        this.router.navigate([`/app/main/account/edit-${editPrefix}/${this.id}`])
    }
    viewProfile(): void {
        if (!this.id) return
        this.router.navigate([`/app/main/account/view-marketplace-acc/${this.id}`], {
            state: {
                accountType: this.account.account.accountType,
                ssin: this.account.account.ssin
            }
        });
    }
    clickCardHandler() {
        if (this.isManual) {
            this.edit()
        } else {
            this.viewProfile()
        }
    }

    createRelation(relation) {
        this._createRelation.emit({account:this.account,relation:relation});
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
        if (raw === 'Connect') return 'Connect';
        if (raw === 'Join') return 'Join';
        if (raw === 'Employ') return 'Employ';
      
        // Format only if starts with 'MPAction'
        if (raw.startsWith('MPAction')) {
          const label = raw.replace('MPAction', '');
          return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
        }
      
        // For anything else, return null (or raw if you prefer)
        return null;
      }


      private readonly ICONS: Record<string, string> = {
        FOLLOW: 'assets/accounts/FOLLOW.png',
        CONNECT: 'assets/accounts/CONNECT.png',
        EMPLOY: 'assets/accounts/CONNECT.png',
        EMPLOYEE: 'assets/accounts/EMPLOYEE.png',
        JOIN: 'assets/accounts/JOIN.png',
      };
      getConnectionIcon(label?: string): string {
        const t = (label || '').toUpperCase();
        for (const key of Object.keys(this.ICONS)) {
          if (t.includes(key)) return this.ICONS[key];
        }
        return 'assets/accounts/CONNECT.png'; // fallback
      }

}

