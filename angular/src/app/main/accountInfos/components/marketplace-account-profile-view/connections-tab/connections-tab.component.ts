import { Component, Injector, Input, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountDto, AccountsServiceProxy, AppEntitiesServiceProxy, AppTransactionServiceProxy, GetAccountForViewDto, LookupLabelDto, MarketplaceAccountsServiceProxy } from '@shared/service-proxies/service-proxies';
import { AbpSessionService } from 'abp-ng2-module';
import { LazyLoadEvent, SelectItem } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import {  finalize, Observable } from 'rxjs';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-connections-tab',
  templateUrl: './connections-tab.component.html',
  styleUrls: ['../../../../accounts/account-shared/components/accounts/accounts.component.scss','./connections-tab.component.scss'],
  providers:[MarketplaceAccountsServiceProxy]
})
export class ConnectionsTabComponent extends AppComponentBase {
  @Input() accountDataForView :AccountDto;
  @Input() marketPlaceData :AccountDto;
  @Input() fromOverview:boolean = false;
  @Input() isActive: boolean = true;
  @Input() loginTenaneSsin;

  @ViewChild("paginator", { static: true }) paginator: Paginator;

  singleItemPerRowMode: boolean = false;
  accounts: GetAccountForViewDto[] = [];
  sortingOptions: SelectItem[];
  active: boolean = false;
  loading: boolean = false;
  connectionTypeId: number = 0;
  accountsTypes:LookupLabelDto[]=[];
  filterForm: FormGroup;

  isHost: boolean;
  showData:boolean =true;

  private connectionsLoaded = false;
  isAuthenticate= this.appSession?.user
  

  constructor(
    injector: Injector,
    private _abpSessionService: AbpSessionService,
    private _accountsServiceProxy: AccountsServiceProxy,
    private _appEntitiesServiceProxy:AppEntitiesServiceProxy,
    private _formBuilder: FormBuilder,      private AppTransactionServiceProxy:AppTransactionServiceProxy) {
    super(injector);

  }

  ngOnInit() {
    this.isHost = !this._abpSessionService.tenantId;
    this.singleItemPerRowMode = false;
    this.defineSortingOptions();
    this.initFilterForm();
    this.overridePrimeTableSetting();
  }
  

ngOnChanges(changes: SimpleChanges) {
  const accountChange = changes['accountDataForView'];

  if (accountChange &&
      accountChange.currentValue?.ssin !== accountChange.previousValue?.ssin) {
    this.connectionsLoaded = false;
  }

  if (
    (accountChange || changes['isActive']) &&
    this.accountDataForView &&
    this.isActive &&
    !this.connectionsLoaded
  ) {
    if(this.isAuthenticate){
    this.GetSettingValue();

    }
  }
}


  get sortingCtrl(): AbstractControl {
    return this.filterForm?.get("sorting");
  }

  getAllAccountTypesForTableDropdownWithPaging(){
  this._appEntitiesServiceProxy.getAllAccountTypesForTableDropdownWithPaging(
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    0,
    5,
    false
)
.subscribe(result => {
this.accountsTypes=result.items;
});
}

  GetSettingValue(){
    this._accountsServiceProxy.getSettingValue(
      "", this.accountDataForView?.ssin
    ).pipe(
      finalize(() => {
        this.hideMainSpinner();
      }))
      .subscribe((result) => {
        this.showData = result;

        if (this.showData) {
          this.getConnections({
            rows: this.primengTableHelper.defaultRecordsCountPerPage,
          });
    
          this.getAllAccountTypesForTableDropdownWithPaging();
        }
        else{
          this.accounts = [];

        }
          this.connectionsLoaded = true;
      });

  }

  initFilterForm() {
    if (this.filterForm) return;
    this.filterForm = this._formBuilder.group({
      sorting: []
    });
  }

  overridePrimeTableSetting(countPerPage: number =  30) {
    this.fromOverview ? countPerPage = 4 : countPerPage
    this.primengTableHelper.defaultRecordsCountPerPage = countPerPage;
    this.primengTableHelper.predefinedRecordsCountPerPage = [
      countPerPage,
      countPerPage * 2,
      countPerPage * 3,
    ];
  }

  defineSortingOptions() {
    this.sortingOptions = [
      { label: this.l("Name"), value: "name" },
      { label: this.l("AccountType"), value: "accountType" },
    ];
  }

  getConnections(event?: LazyLoadEvent) {
    this.loading = true
    // this.showMainSpinner();
    if (this.primengTableHelper.shouldResetPaging(event)) {
      this.paginator.totalRecords = 10;
      this.paginator.changePage(0);
      return;
    }
    const filters = this.filterForm?.value;

   
     this._accountsServiceProxy.getAllMyConnections(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        this.accountDataForView?.ssin,
        this.connectionTypeId > 0 ? this.connectionTypeId : undefined,
       undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        filters?.sorting?.value || undefined,
        this.primengTableHelper.getSkipCount(this.paginator, event),
        this.primengTableHelper.getMaxResultCount(this.paginator, event)
      ).pipe(
      finalize(() => {
        // this.primengTableHelper.hideLoadingIndicator();
        if (!this.active) this.active = true;
        this.loading = false;
        this.hideMainSpinner();
      }))
    .subscribe((result) => {
      this.accounts = result.items;
      this.primengTableHelper.totalRecordsCount = result.totalCount;
      this.primengTableHelper.records = result.items;
    });
  }

  reloadPage(): void {
    this.paginator.changePage(this.paginator.getPage());
  }


  
  askToConfirmDelete($event, account: AccountDto, index: number): void {

    var isConfirmed: Observable<boolean>;
    isConfirmed   = this.askToConfirm("AreYouSureYouWantToDeleteThisAccount?","AreYouSure");

   isConfirmed.subscribe((res)=>{

      if(res){
      this.showMainSpinner();
                  this._accountsServiceProxy
                      .delete(account.id)
                      .pipe(
                          finalize(() => {
                              this.hideMainSpinner();
                          })
                      )
                      .subscribe(() => {
                          this.primengTableHelper.records.splice(index, 1);
                          this.notify.success(this.l("SuccessfullyDeleted"));
                      });
                  }
  });
}


createRelation(account) {
  if (!account?.account?.account?.id || !account?.relation?.connectionEntityId) {
    return;
  }

  this.showMainSpinner();

  forkJoin({
    recipientRoles: this.AppTransactionServiceProxy.getAccountMarketplaceRoles(
      account.account.account.ssin
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
              this.l('Cannot connect, you need to update the marketplace role of your account / the recipient account marketplace role in order to build relationship together')  ,
          ''
        );
        return;
      }

      this.applyRelation(account);
    });
}

private hasMarketplaceRoles(response: any): boolean {
  const roles = response?.result ?? response;
  return Array.isArray(roles) && roles.length > 0;
}

private applyRelation(account): void {
  this.showMainSpinner();

  this._accountsServiceProxy
    .applyRelationOnProfile(
      account.account.account.id,
      undefined,
      account.relation.defaultVisibility === 'Public',
      account.relation.connectionEntityId
    )
    .pipe(finalize(() => this.hideMainSpinner()))
    .subscribe((result: any) => {
      const raw = typeof result === 'string' ? result : result?.result ?? '';
      const { connectionName, disConnectLabel } = this.splitLabels(raw);

      const i = this.accounts.findIndex(x => x.account.id === account.account.account.id);
      if (i < 0) return;

      const currentAccount = this.accounts[i];

      currentAccount.availableConnections = (currentAccount.availableConnections || []).filter(
        x => x.connectionEntityId !== account.relation.connectionEntityId
      );

      currentAccount.connectionName = this.l(connectionName);
      currentAccount.disConnectLabel = this.l(disConnectLabel);

      currentAccount.avaliableConnectionName =
        currentAccount.availableConnections?.length > 0
          ? currentAccount.availableConnections[0].connectLabel
          : '';

      currentAccount.connectionsInfo = currentAccount.connectionsInfo || [];

      if (Array.isArray(result) && result.length > 0) {
        currentAccount.connectionsInfo.push(result[0]);
      }

      this.accounts = [...this.accounts];
    });
}

    private splitLabels(raw: string) {
      // split at the first '-' that precedes the second "MPAction..."
      const m = /^(.*?)-(MPAction.+)$/.exec(raw || '');
      return m
        ? { connectionName: m[1], disConnectLabel: m[2] }
        : { connectionName: raw || '', disConnectLabel: '' };
    }


    disconnect(event): void {
   

    this.showMainSpinner();
    this._accountsServiceProxy
        .disconnect(event.account.account.id, event.relation.relationEntityId)
        .pipe(
            finalize(() => {
                this.hideMainSpinner();
            })
        )
        .subscribe((res) => {
      
       this.notify.success(this.l("SuccessfullyDisconnected"));

            event.account.connectionsInfo = (event.account.connectionsInfo || []).filter(
                x => x.relationEntityId !== event.relation.relationEntityId
            );
            event.account.availableConnections.push(res[0])
            // event.account.connectionsInfo = (event.account.connectionsInfo || []).filter(
            //     x => x.relationEntityId !== event.relation.relationEntityId
            // );
            // event.account.availableConnections = res || [];
            // event.account.status = event.account.connectionsInfo.length > 0;
            // event.account.connectionName = '';
            // event.account.avaliableConnectionName = res?.length ? res[0].connectLabel : '';
        });
}

  setConnectionType(code: number): void {
    this.connectionTypeId = code;
    this.getConnections();
  }

  get noDataMessage(): string {
    return `There is no Connections to show  “${
      this.accountDataForView?.name || ''
    }’s connections list is private.“`;
  }

}
