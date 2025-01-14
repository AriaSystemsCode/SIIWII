import { Component, Injector, Input, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountDto, AccountsServiceProxy, AppEntitiesServiceProxy, GetAccountForViewDto, LookupLabelDto, MarketplaceAccountsServiceProxy } from '@shared/service-proxies/service-proxies';
import { AbpSessionService } from 'abp-ng2-module';
import { LazyLoadEvent, SelectItem } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import {  finalize, Observable } from 'rxjs';

@Component({
  selector: 'app-connections-tab',
  templateUrl: './connections-tab.component.html',
  styleUrls: ['../../../accounts/account-shared/components/accounts.component.scss'],
  providers:[MarketplaceAccountsServiceProxy]
})
export class ConnectionsTabComponent extends AppComponentBase {
  @Input() accountDataForView :AccountDto;
  @Input() loginAccoutType:string;
  singleItemPerRowMode: boolean = false;
  accounts: GetAccountForViewDto[] = [];
  sortingOptions: SelectItem[];
  filterVisible = false; // To toggle the filter visibility
  active: boolean = false;
  loading: boolean = false;
  @ViewChild("paginator", { static: true }) paginator: Paginator;
  connectionTypeId: number = 0;
  accountsTypes:LookupLabelDto[]=[];
  filterForm: FormGroup;
  @Input() fromOverview:boolean = false;

  get sortingCtrl(): AbstractControl {
    return this.filterForm?.get("sorting");
  }
  constructor(
    injector: Injector,
    private _abpSessionService: AbpSessionService,
    private _accountsServiceProxy: AccountsServiceProxy,
    private _appEntitiesServiceProxy:AppEntitiesServiceProxy,
    private _formBuilder: FormBuilder) {
    super(injector);
  }

  isHost: boolean;
  showData:boolean =true;
  ngOnInit() {
    this.isHost = !this._abpSessionService.tenantId;
    this.singleItemPerRowMode = false;
    this.defineSortingOptions();
    this.initFilterForm();
    this.GetSettingValue();
    this.overridePrimeTableSetting();

  }
  

  ngOnChanges(changes: SimpleChanges) {}

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
    0,
    3,
    false
)
.subscribe(result => {
this.accountsTypes=result.items;
});
}

  GetSettingValue(){
    //I40-send SettingValueName 
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
        else
          this.accounts = [];
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
    this.showMainSpinner();
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
        filters?.sorting?.value || undefined,
        this.primengTableHelper.getSkipCount(this.paginator, event),
        this.primengTableHelper.getMaxResultCount(this.paginator, event)
      ).pipe(
      finalize(() => {
        this.primengTableHelper.hideLoadingIndicator();
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
connect(account: AccountDto): void {
  this.showMainSpinner();
  this._accountsServiceProxy
      .connect(account.id)
      .pipe(
          finalize(() => {
              this.hideMainSpinner();
          })
      )
      .subscribe(() => {
          this.notify.success(this.l("SuccessfullyConnected"));
          account.status = true;
      });
}

disconnect(account: AccountDto): void {
  this.showMainSpinner();
  this._accountsServiceProxy
      .disconnect(account.id)
      .pipe(
          finalize(() => {
              this.hideMainSpinner();
          })
      )
      .subscribe(() => {
          this.notify.success(this.l("SuccessfullyDisconnected"));
          account.status = false;
      });
}



  createRelation(account) {
    this._accountsServiceProxy
      .applyRelationOnProfile(undefined,account.account.ssin)
      .pipe(
        finalize(() => {
          ;
          this.hideMainSpinner();
        })
      )
      .subscribe((result: string) => {
        let accountIndx = this.accounts.findIndex(x => x.account.id == account.account.id);
        if (accountIndx >= 0) {
          this.accounts[accountIndx] = account;
          this.accounts[accountIndx].avaliableConnectionName = "";
          this.accounts[accountIndx].connectionName = this.l(result);
        }
      });
  }

  setConnectionType(code: number): void {
    this.connectionTypeId = code;
    this.getConnections();
  }

}
