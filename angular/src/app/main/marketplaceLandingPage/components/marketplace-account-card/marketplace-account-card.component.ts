import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountDto, AccountsServiceProxy, AppEntitiesServiceProxy, GetAccountForViewDto } from '@shared/service-proxies/service-proxies';
import {  finalize } from 'rxjs';

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
            private _accountsServiceProxy: AccountsServiceProxy,
            private _appEntitiesServiceProxy:AppEntitiesServiceProxy,

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


createRelation(option: { connectLabel: string; connectionEntityId: number; defaultVisibility: string }) {
  if (!option?.connectionEntityId) return;

  this.showMainSpinner();

  this._accountsServiceProxy
    .applyRelationOnProfile(
      this.account?.account?.id,
      undefined,
      (option.defaultVisibility || '').toLowerCase() === 'public',
      option.connectionEntityId
    )
    .pipe(finalize(() => this.hideMainSpinner()))
    .subscribe((result: any) => {

      const raw = (typeof result === 'string' ? result : result?.result) || '';
      const parsed = this.parseRelationResult(raw);

      this.account.availableConnections = [];
      this.account.avaliableConnectionName = '';
      this.account.connectionName = parsed.connectionName;  
      this.account.disConnectLabel = parsed.disconnectLabel;    
    });
}

disconnect(): void {
  const id = this.account?.account?.id;
  if (!id) return;

  this.showMainSpinner();

  this._accountsServiceProxy
    .disconnect(id)
    .pipe(finalize(() => this.hideMainSpinner()))
    .subscribe((res: any[]) => {
      this.notify.success(this.l('SuccessfullyDisconnected'));


      const options = Array.isArray(res) ? res : [];

      this.account.connectionName = '';
      this.account.disConnectLabel = '';

      this.account.availableConnections = options;
      this.account.avaliableConnectionName = options?.[0]?.connectLabel || '';
    });
}


private parseRelationResult(raw: string): { connectionName: string; disconnectLabel: string } {
  const text = (raw || '').trim();

  const idx = text.indexOf('-');
  const connectionName = idx > -1 ? text.slice(0, idx).trim() : text;
  const disconnectLabel = idx > -1 ? text.slice(idx + 1).trim() : 'MPActionDisconnect';

  return { connectionName, disconnectLabel };
}


getFormattedConnectionName(type: 'connectionName' | 'avaliableConnectionName' | 'disConnectLabel'): string | null {
  const raw =
    type === 'connectionName'
      ? this.account?.connectionName
      : type === 'avaliableConnectionName'
      ? this.account?.avaliableConnectionName
      : this.account?.disConnectLabel;

  const val = (raw || '').trim();
  if (!val) return null;

 
  if (val.startsWith('MPAction')) {
    const label = val.replace('MPAction', '');
    return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
  }

  return val;
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