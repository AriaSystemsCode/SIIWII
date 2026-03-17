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
    @Input('cardsViewMode') cardsViewMode : boolean
    @Input('isHost') isHost : boolean
    @Input('FromLandingPage') FromLandingPage : boolean
    @Output() deleteMe : EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output() disconnectMe : EventEmitter<GetAccountForViewDto> = new EventEmitter<GetAccountForViewDto>()
    @Input() fromMarketplace;
    @Output() _createRelation : EventEmitter<any> = new EventEmitter<any>()


    isRecordOwner : boolean
    attachmentBaseUrl :string = AppConsts.attachmentBaseUrl
    currentLang: string
    isArabic: boolean
    isAuthenticated: boolean = false;

    isSmallScreen = false;

    constructor(
        injector:Injector,
        private router:Router,
        private _accountsServiceProxy: AccountsServiceProxy,
    ){
        super(injector);
    }

    ngOnInit(){
      this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
      this.currentLang == 'ar' || this.currentLang == 'ar-EG'  ? this.isArabic = true : this.isArabic = false
      this.isAuthenticated = !!this.appSession?.user;

        this.checkScreenSize();
  window.addEventListener('resize', this.checkScreenSize.bind(this));

    }
    checkScreenSize(): void {
  this.isSmallScreen = window.innerWidth <= 1023;
}
    ngOnChanges(changes: SimpleChanges): void {
        this.isRecordOwner = this.account.account.partnerId == this.appSession?.user?.accountId
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

    createRelation(relationType){
      this._createRelation.emit({account:this.account,relation:relationType});
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
      removeRelation(account){
     

        this.disconnectMe.emit(account);
   
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
      
      makeRelationPrivatePublic(account,status){
          this.showMainSpinner();
        
                this._accountsServiceProxy
                    .applyRelationOnProfile(account.account.id, undefined,status,undefined)
                    .pipe(
                        finalize(() => {
                            ;
                            this.hideMainSpinner();
                        })
                    )
                    .subscribe((result: string) => {

                      account.visibility == 'Public' ? account.visibility = 'Private' :  account.visibility   = 'Public'
                      account.visibility == 'Public' ? this.notify.success('Account is Shared') : this.notify.success('Account is Private')
                    });
      }


  getRemainingCategoriesList(categories: string[]): string {
  if (!categories || categories.length <= 3) {
    return '';
  }

  return categories
    .slice(3)
    .map(category => `• ${category}`)
    .join('\n');
}

getAccountTypeIcon(type: string): string {
  const accountType = (type || '').toLowerCase();

  if (accountType.includes('business')) {
    return 'fas fa-building';
  }

  if (accountType.includes('group')) {
    return 'fas fa-users';
  }

  if (accountType.includes('personal')) {
    return 'fas fa-user';
  }

  return 'fas fa-tag';
}
}
