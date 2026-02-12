import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GetAccountForViewDto } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-marketplace-account-card',
  templateUrl: './marketplace-account-card.component.html',
  styleUrls: ['./marketplace-account-card.component.scss'],
})
export class MarketplaceAccountCardComponent extends AppComponentBase {
  @Input() account!: GetAccountForViewDto;
  @Input() compact = false;             // for carousel small cards if needed
  @Input() showConnectButton = true;
  @Output() connect = new EventEmitter<GetAccountForViewDto>();
  @Output() connectMe: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Output() disconnectMe: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Output() _createRelation: EventEmitter<any> = new EventEmitter<any>()

  attachmentBaseUrl = AppConsts.attachmentBaseUrl;

  currentLang: string
  isArabic: boolean
  isAuthenticated: boolean = false;


    constructor(
        injector:Injector,
        private router:Router,

    ){
        super(injector);
    }

  ngOnInit(){
    this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
    this.currentLang == 'ar' || this.currentLang == 'ar-EG'  ? this.isArabic = true : this.isArabic = false
    this.isAuthenticated = !!this.appSession?.user;
  }
  get logoUrl(): string {
    const url = this.account?.account?.logoUrl;
    return url ? `${this.attachmentBaseUrl}/${url}` : 'assets/placeholders/_logo-placeholder.png';
  }

  onImgErr(e: Event) {
    (e.target as HTMLImageElement).src = 'assets/placeholders/_logo-placeholder.png';
  }

  disconnect(account): void {
    this.disconnectMe.emit(account)
}
  onConnect() {
    this.connect.emit(this.account);
  }

  openDetails(): void {
    const id = this.account?.account?.id;
    // if (!this.id) return
    this.router.navigate([`/app/main/account/view-marketplace-acc/${id}`], {
        state: {
            accountType: this.account.account.accountType,
            ssin: this.account.account.ssin
        }
    });
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