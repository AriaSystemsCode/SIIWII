import { ChangeDetectorRef, Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountDto, AccountsServiceProxy, AppEntitiesServiceProxy, AppTransactionServiceProxy, GetAccountForViewDto } from '@shared/service-proxies/service-proxies';
import {  finalize } from 'rxjs';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-marketplace-account-card',
  templateUrl: './marketplace-account-card.component.html',
  styleUrls: ['./marketplace-account-card.component.scss'],
})
export class MarketplaceAccountCardComponent extends AppComponentBase {
  @Input() account!: GetAccountForViewDto;
  @Input() compact = false;             // for carousel small cards if needed
  @Input() showConnectButton = true;
  @Input() loginTenaneSsin;

 
  @Output() _createRelation: EventEmitter<any> = new EventEmitter<any>()

  attachmentBaseUrl = AppConsts.attachmentBaseUrl;

  currentLang: string
  isArabic: boolean
  isAuthenticated: boolean = false;

    isSmallScreen = false;

      showRelationsDialog = false;
selectedAccountForRelations: any = null;
    constructor(
        injector:Injector,
        private router:Router,
            private _accountsServiceProxy: AccountsServiceProxy,
            private cdr: ChangeDetectorRef,
            private AppTransactionServiceProxy:AppTransactionServiceProxy
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


createRelation(option: {
  connectLabel?: string;
  connectionName?: string;
  connectionEntityId: number;
  defaultVisibility?: string;
}) {
  if (!option?.connectionEntityId || !this.account?.account?.id) return;

  this.showMainSpinner();

  forkJoin({
    recipientRoles: this.AppTransactionServiceProxy.getAccountMarketplaceRoles(
      this.account?.account?.ssin
    ),
    loggedTenantRoles: this.AppTransactionServiceProxy.getAccountMarketplaceRoles(
      this.loginTenaneSsin
    )
  })
    .pipe(finalize(() => this.hideMainSpinner()))
    .subscribe(({ recipientRoles, loggedTenantRoles }: any) => {
      const recipientHasRoles = this.hasMarketplaceRoles(recipientRoles);
      const loggedTenantHasRoles = this.hasMarketplaceRoles(loggedTenantRoles);

      if (!recipientHasRoles || !loggedTenantHasRoles) {
        this.message.info(
          'Cannot connect, you need to update the marketplace role of your account / the recipient account marketplace role in order to build relationship together',
          ''
        );
        return;
      }

      this.applyRelation(option);
    });
}
private hasMarketplaceRoles(response: any): boolean {
  const roles = response?.result ?? response;
  return Array.isArray(roles) && roles.length > 0;
}
private applyRelation(option: any): void {
  this.showMainSpinner();

  this._accountsServiceProxy
    .applyRelationOnProfile(
      this.account.account.id,
      undefined,
      (option.defaultVisibility || '').toLowerCase() === 'public',
      option.connectionEntityId
    )
    .pipe(finalize(() => this.hideMainSpinner()))
    .subscribe((result: any) => {
      const returnedRelation = Array.isArray(result) ? result[0] : result;

      const updatedAvailableConnections = (this.account.availableConnections || []).filter(
        x => x.connectionEntityId !== option.connectionEntityId
      );

      const updatedConnectionsInfo = returnedRelation
        ? [...(this.account.connectionsInfo || []), returnedRelation]
        : [...(this.account.connectionsInfo || [])];

      const updatedAccount = Object.assign(new GetAccountForViewDto(), this.account);

      updatedAccount.availableConnections = updatedAvailableConnections;
      updatedAccount.connectionsInfo = updatedConnectionsInfo;
      updatedAccount.avaliableConnectionName =
        updatedAvailableConnections?.length > 0
          ? (updatedAvailableConnections[0].connectLabel ||
             updatedAvailableConnections[0].connectionName ||
             '')
          : '';

      updatedAccount.connectionCount =
        (this.account.connectionCount || 0) + (returnedRelation ? 1 : 0);

      this.account = updatedAccount;
      this.cdr.detectChanges();
    });
}
disconnect(relation: any): void {
  const id = this.account?.account?.id;
  if (!id || !relation) return;

  this.showMainSpinner();

  this._accountsServiceProxy
    .disconnect(id, relation?.relationEntityId)
    .pipe(finalize(() => this.hideMainSpinner()))
    .subscribe((res: any) => {
      this.notify.success(this.l('SuccessfullyDisconnected'));

      const returnedAvailableRelation = Array.isArray(res) ? res[0] : res;

      const updatedConnectionsInfo = (this.account.connectionsInfo || []).filter(
        x => x.relationEntityId !== relation.relationEntityId
      );

      const currentAvailableConnections = this.account.availableConnections || [];
      const exists = returnedAvailableRelation
        ? currentAvailableConnections.some(
            x => x.connectionEntityId === returnedAvailableRelation.connectionEntityId
          )
        : false;

      const updatedAvailableConnections =
        returnedAvailableRelation && !exists
          ? [...currentAvailableConnections, returnedAvailableRelation]
          : [...currentAvailableConnections];

      const updatedAccount = Object.assign(new GetAccountForViewDto(), this.account);
      updatedAccount.connectionsInfo = updatedConnectionsInfo;
      updatedAccount.availableConnections = updatedAvailableConnections;
      updatedAccount.avaliableConnectionName =
        updatedAvailableConnections?.length > 0
          ? (updatedAvailableConnections[0].connectLabel ||
             updatedAvailableConnections[0].connectionName ||
             '')
          : '';
      updatedAccount.connectionCount = Math.max((this.account.connectionCount || 0) - 1, 0);

      this.account = updatedAccount;

      if (this.selectedAccountForRelations?.account?.id === this.account?.account?.id) {
        this.selectedAccountForRelations = Object.assign(
          new GetAccountForViewDto(),
          this.account
        );
      }

      if (!updatedConnectionsInfo.length) {
        this.showRelationsDialog = false;
      }

      this.cdr.detectChanges();
    });
}

// private parseRelationResult(raw: string): { connectionName: string; disconnectLabel: string } {
//   const text = (raw || '').trim();

//   const idx = text.indexOf('-');
//   const connectionName = idx > -1 ? text.slice(0, idx).trim() : text;
//   const disconnectLabel = idx > -1 ? text.slice(idx + 1).trim() : 'MPActionDisconnect';

//   return { connectionName, disconnectLabel };
// }


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

removeRelationFromDialog(account: any, relation: any, index: number): void {
  // this.disconnect();

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
