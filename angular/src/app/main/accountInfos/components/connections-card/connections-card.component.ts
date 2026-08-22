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
    @Output() disconnectMe: EventEmitter<{ account: GetAccountForViewDto; relation: any }>  = new EventEmitter();
    @Output() _createRelation: EventEmitter<any> = new EventEmitter<any>()

    isRecordOwner: boolean
    attachmentBaseUrl: string = AppConsts.attachmentBaseUrl

    currentLang:string
    isArabic:boolean 

    isAuthenticated: boolean = false;

  showRelationsDialog = false;
selectedAccountForRelations: any = null;
    constructor(
        injector: Injector,
        private router: Router,
    ) {
        super(injector);
    }
    ngOnChanges(changes: SimpleChanges): void {
      this.isAuthenticated = !!this.appSession?.user;

      this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
      this.currentLang == 'ar' || this.currentLang == 'ar-EG'  ? this.isArabic = true : this.isArabic = false
        this.isRecordOwner = this.account.account.partnerId == this.appSession.user.accountId
        this.singleItemPerRowMode = false;

    }

    get id(): number { return this.account.account.id }
    get isManual(): boolean { return this.account.account.isManual }
    deleteAccount() {
        this.deleteMe.emit()
    }


    // disconnect(account,relation): void {
    //  this.disconnectMe.emit({ account, relation });
    // }

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


getFormattedConnectionName(label: string): string {
  if (!label) return '';

  if (label === 'Follow' || label === 'Connect' || label === 'Join' || label === 'Employ') {
    return label;
  }

  if (label.startsWith('MPAction')) {
    const clean = label.replace('MPAction', '');
    return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  }

  return label;
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


  stopPropagation($event) {
    $event.stopPropagation() // stop click event bubbling
  }

  openRelationsDialog(account: any): void {
  this.selectedAccountForRelations = account;
  this.showRelationsDialog = true;
}

 disconnect(account, relation) {
  this.disconnectMe.emit({ account, relation });
}

removeRelationFromDialog(account: any, relation: any, index: number): void {
  this.disconnect(account, relation);

  // optional: close dialog if no relations left after UI update
  setTimeout(() => {
    if (!account?.connectionsInfo?.length) {
      this.showRelationsDialog = false;
    }
  });
}


      openedRelationMenuId: number | null = null;

toggleRelationMenu(event: MouseEvent, account: any): void {
  event.preventDefault();
  event.stopPropagation();

  const id = account?.account?.id;
  this.openedRelationMenuId = this.openedRelationMenuId === id ? null : id;
}

onRelationOptionClick(event: MouseEvent, option: any): void {
  event.preventDefault();
  event.stopPropagation();

  this.createRelation(option);
  this.openedRelationMenuId = null;
}

}

