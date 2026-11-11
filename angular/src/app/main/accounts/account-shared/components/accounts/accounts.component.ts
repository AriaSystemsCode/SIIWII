import { Component, Injector, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AbpSessionService } from 'abp-ng2-module';
import { SelectItem } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { forkJoin } from 'rxjs';
import { debounceTime, finalize } from 'rxjs/operators';

import {
  AccountDto,
  AccountsServiceProxy,
  AppTransactionServiceProxy,
  EmailingTemplateServiceProxy,
  GetAccountForViewDto,
  MarketplaceAccountsServiceProxy
} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppConsts } from '@shared/AppConsts';
import { SendMailModalComponent } from '@app/shared/common/Mail/sendMail-modal.component';
import { ImportTypes } from '@shared/components/import-steps/models/ImportTypes';
import { AccountsImport } from '@shared/components/import-steps/services/accountsImport.service';
import { MainImportService } from '@shared/components/import-steps/services/mainImport.service';
import { MainImportComponent } from '../../../../../../shared/components/import-steps/components/mainImport.component';
import { AccountMainFilterEnum } from '../../models/accounts-main-filter.enum';
import { AccountsBrowseState } from '../../models/imageobject';
import { AccountEntityComponent } from '../account-entity/account-entity.component';

type TreeFilterKey = 'sycEntityObjectCategory' | 'sycEntityObjectClassification';

const LIST_VIEW_KEY = 'account-list-view-mode';
const DEFAULT_PAGE_SIZE = 32;

const EMPTY_FILTERS = {
  search: null,
  mainFilterType: null,
  city: null,
  postalCode: null,
  state: null,
  sorting: null,
  accountTypes: null,
  languages: [],
  countries: [],
  classifications: [],
  categories: [],
  currencies: [],
  statuses: []
};

@Component({
  selector: 'app-accounts',
  providers: [MarketplaceAccountsServiceProxy],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.scss'],
  animations: [appModuleAnimation()]
})
export class AccountsComponent extends AppComponentBase implements OnInit, OnChanges {

  // ---------- Inputs ----------
  @Input() defaultMainFilter: AccountMainFilterEnum;
  @Input() showMainFiltersOptions;
  @Input() showAddButton;
  @Input() pageMainFilters: SelectItem[] = [];
  @Input() fromMarketplace;
  @Input() accountType: string;

  // ---------- View children ----------
  @ViewChild('sendMailModal', { static: true }) sendMailModal: SendMailModalComponent;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  @ViewChild('ImportAccountsModal', { static: true }) ImportAccountsModal: MainImportComponent;
  @ViewChild('accountEntity') accountEntity: AccountEntityComponent;

  // ---------- State ----------
  filterForm: FormGroup;
  accounts: GetAccountForViewDto[] = [];
  sortingOptions: SelectItem[];

  isHost: boolean;
  isArabic: boolean;
  isAuthenticated = false;
  loginTenaneSsin: string;

  cardsViewMode = false;
  filterVisible = false;     // mobile filter panel
  filterVisiblelg = false;   // desktop filter panel
  active = false;
  loading = false;
  paginatorFirst = 0;
  isCreatingRelation = false;

  private restoringBrowseState = false;

  constructor(
    injector: Injector,
    private _accountsServiceProxy: AccountsServiceProxy,
    private _marketplaceAccountsServiceProxy: MarketplaceAccountsServiceProxy,
    private _importService: MainImportService,
    private _abpSessionService: AbpSessionService,
    private _formBuilder: FormBuilder,
    private _emailingTemplateAppService: EmailingTemplateServiceProxy,
    private _appTransactionServiceProxy: AppTransactionServiceProxy,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super(injector);
    this.overridePrimeTableSetting();
  }

  // ================= Lifecycle =================

  ngOnInit(): void {
    const lang = abp.utils.getCookieValue('Abp.Localization.CultureName');

    this.isAuthenticated = !!this.appSession?.user;
    this.isHost = !this._abpSessionService.tenantId;
    this.isArabic = lang === 'ar' || lang === 'ar-EG';

    this.defineSortingOptions();
    this.initFilterForm();
    this.applyFiltersOnChange();

    // Always restore saved paging. URL filters then override the saved filters,
    // but must not reset the page.
    const savedState = this.restoreBrowseState();

    if (Object.keys(this.route.snapshot.queryParams).length > 0) {
      this.loadFiltersFromUrl();
    }

    const rows = savedState?.rows || this.primengTableHelper.defaultRecordsCountPerPage;
    const first = savedState?.first ?? 0;

    this.paginatorFirst = first;
    if (this.paginator) {
      this.paginator.rows = rows;
      this.paginator.first = first;
    }

    this.getAccounts({ first, rows });
    this.getLoginAccountDataForView();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.defaultMainFilter?.firstChange) {
      this.initFilterForm();
      this.setMainPageFilter(this.defaultMainFilter);
    }
  }

  // ================= Form =================

  get mainFilterCtrl(): AbstractControl {
    return this.filterForm?.get('mainFilterType');
  }

  get sortingCtrl(): AbstractControl {
    return this.filterForm?.get('sorting');
  }

  initFilterForm(): void {
    if (this.filterForm) {
      return;
    }
    this.filterForm = this._formBuilder.group(
      Object.keys(EMPTY_FILTERS).reduce((controls, key) => ({ ...controls, [key]: [] }), {})
    );
  }

  setMainPageFilter(filter: AccountMainFilterEnum): void {
    const selected = this.pageMainFilters.find(item => item.value === filter);
    if (selected) {
      this.mainFilterCtrl.setValue(selected);
    }
  }

  defineSortingOptions(): void {
    this.sortingOptions = [
      { label: this.l('Name'), value: 'name' },
      { label: this.l('AccountType'), value: 'accountTypeId' }
    ];
  }

  overridePrimeTableSetting(countPerPage: number = DEFAULT_PAGE_SIZE): void {
    this.primengTableHelper.defaultRecordsCountPerPage = countPerPage;
    this.primengTableHelper.predefinedRecordsCountPerPage = [
      countPerPage,
      countPerPage * 2,
      countPerPage * 3
    ];
  }

  private applyFiltersOnChange(): void {
    this.filterForm.valueChanges
      .pipe(debounceTime(500))
      .subscribe(filters => {
        if (this.restoringBrowseState) {
          return;
        }

        this.updateFiltersInUrl(filters);

        // Filters changed: go back to the first page.
        const rows = this.primengTableHelper.defaultRecordsCountPerPage;
        this.saveBrowseState(0, rows);
        this.getAccounts({ first: 0, rows });
      });
  }

  resetList(): void {
    localStorage.removeItem(this.browseStateKey);
    this.filterForm.reset(EMPTY_FILTERS, { emitEvent: false });
    this.setMainPageFilter(this.defaultMainFilter);

    this.paginator?.changePage(0);
    this.getAccounts({ first: 0, rows: this.primengTableHelper.defaultRecordsCountPerPage });
  }

  // ================= Toolbar =================

  toggleFilter(): void {
    this.filterVisible = !this.filterVisible;
    this.filterVisiblelg = !this.filterVisiblelg;
    this.saveBrowseState();
  }

  triggerListView(): void {
    this.cardsViewMode = !this.cardsViewMode;
    this.saveListViewPreference();
    this.saveBrowseState();
  }

  saveListViewPreference(): void {
    localStorage.setItem(LIST_VIEW_KEY, String(Number(this.cardsViewMode)));
  }

  getUserPreferenceForListView(): void {
    const value = localStorage.getItem(LIST_VIEW_KEY);
    if (value) {
      this.cardsViewMode = Boolean(Number(value));
    }
  }

  openCreateManualAccount(): void {
    this.accountEntity.createManual();
  }

  // ================= Load accounts =================

  getAccounts(event?: { first?: number; rows?: number }): void {
    const maxResultCount =
      event?.rows ||
      this.paginator?.rows ||
      this.primengTableHelper.defaultRecordsCountPerPage ||
      DEFAULT_PAGE_SIZE;
    const skipCount = Math.max(event?.first ?? 0, 0);

    if (this.paginator) {
      this.paginator.rows = maxResultCount;
    }

    const filters = this.normalizedFilters();
    const orUndefined = (list: any[]) => (list?.length ? list : undefined);
    const hasAccountType = filters.accountTypes !== null && filters.accountTypes !== undefined && filters.accountTypes !== '';

    // Both services share the same getAll signature. Only the main filter differs.
    const service: any = this.fromMarketplace
      ? this._marketplaceAccountsServiceProxy
      : this._accountsServiceProxy;

    this.primengTableHelper.showLoadingIndicator();
    this.showMainSpinner();
    this.loading = true;

    service
      .getAll(
        filters.search || undefined,
        this.fromMarketplace ? undefined : filters.mainFilterType?.value || undefined,
        undefined,
        undefined,
        filters.city || undefined,
        filters.state || undefined,
        filters.postalCode || undefined,
        undefined,                                   // ssin
        undefined,                                   // accountTypeId
        undefined,                                   // accountType
        hasAccountType ? [Number(filters.accountTypes)] : undefined,
        orUndefined(filters.statuses),
        orUndefined(filters.languages),
        orUndefined(filters.countries),
        orUndefined(filters.classifications),
        orUndefined(filters.categories),
        orUndefined(filters.currencies),
        undefined,
        filters.sorting?.value || undefined,
        skipCount,
        maxResultCount
      )
      .pipe(finalize(() => {
        this.primengTableHelper.hideLoadingIndicator();
        this.loading = false;
        this.hideMainSpinner();
        this.active = true;
      }))
      .subscribe((result: any) => {
        this.accounts = result?.items ?? [];
        this.primengTableHelper.totalRecordsCount = result?.totalCount ?? 0;
        this.primengTableHelper.records = this.accounts;
      });
  }

  onAccountsPageChange(event: any): void {
    const first = event?.first ?? 0;
    const rows = event?.rows ?? this.primengTableHelper.defaultRecordsCountPerPage;

    this.paginatorFirst = first;
    this.saveBrowseState(first, rows);
    this.getAccounts({ first, rows });
  }

  reloadPage(): void {
    this.paginator.changePage(this.paginator.getPage());
  }

  onFinishImport(event): void {
    if (event) {
      this.reloadPage();
    }
  }

  // ================= Filter values =================

  /** Form value where object filters (dropdown items, tree nodes) are replaced by their ids. */
  private normalizedFilters(): any {
    const value = this.filterForm?.getRawValue() ?? {};
    return {
      ...value,
      languages: this.idsOf(value.languages),
      countries: this.idsOf(value.countries),
      currencies: this.idsOf(value.currencies),
      statuses: this.idsOf(value.statuses),
      categories: this.idsOf(value.categories, 'sycEntityObjectCategory'),
      classifications: this.idsOf(value.classifications, 'sycEntityObjectClassification')
    };
  }

  /** Items can already be ids, dropdown items ({ value } / { id }) or tree nodes ({ data[treeKey].id }). */
  private idsOf(values: any, treeKey?: TreeFilterKey): any[] {
    if (!Array.isArray(values)) {
      return [];
    }

    return values
      .map(item => {
        if (typeof item === 'number' || typeof item === 'string') {
          return item;
        }
        return treeKey ? item?.data?.[treeKey]?.id : item?.value ?? item?.id;
      })
      .filter(id => id !== null && id !== undefined);
  }

  private joinIds(ids: any[]): string | null {
    return ids.length ? ids.join(',') : null;
  }

  private parseNumberArray(value: string | null): number[] {
    return value
      ? value.split(',').map(Number).filter(id => !isNaN(id))
      : [];
  }

  // ================= URL filters =================

  private loadFiltersFromUrl(): void {
    const params = this.route.snapshot.queryParamMap;
    const accountType = params.get('accountType');

    this.filterForm.patchValue(
      {
        search: params.get('search') || null,
        accountTypes: accountType ? Number(accountType) : null,
        city: params.get('city') || null,
        postalCode: params.get('postalCode') || null,
        state: params.get('state') || null,
        countries: this.parseNumberArray(params.get('countries')),
        currencies: this.parseNumberArray(params.get('currencies')),
        statuses: this.parseNumberArray(params.get('statuses')),
        languages: this.parseNumberArray(params.get('languages')),
        categories: this.parseNumberArray(params.get('categories')),
        classifications: this.parseNumberArray(params.get('classifications'))
      },
      { emitEvent: false }
    );
  }

  private updateFiltersInUrl(filters: any): void {
    const queryParams = {
      search: filters.search || null,
      accountType: filters.accountTypes ?? null,
      city: filters.city || null,
      postalCode: filters.postalCode || null,
      state: filters.state || null,
      countries: this.joinIds(this.idsOf(filters.countries)),
      currencies: this.joinIds(this.idsOf(filters.currencies)),
      statuses: this.joinIds(this.idsOf(filters.statuses)),
      languages: this.joinIds(this.idsOf(filters.languages)),
      categories: this.joinIds(this.idsOf(filters.categories, 'sycEntityObjectCategory')),
      classifications: this.joinIds(this.idsOf(filters.classifications, 'sycEntityObjectClassification'))
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  // ================= Saved browse state (localStorage) =================

  private get browseStateKey(): string {
    return this.fromMarketplace ? 'marketplaceAccountsBrowseState' : 'accountsBrowseState';
  }

  private saveBrowseState(first?: number, rows?: number): void {
    if (!this.filterForm || this.restoringBrowseState) {
      return;
    }

    const safeRows = rows ?? this.paginator?.rows ?? this.primengTableHelper.defaultRecordsCountPerPage;
    const safeFirst = first ?? this.paginator?.first ?? 0;

    const state: AccountsBrowseState = {
      filters: this.normalizedFilters(),
      first: safeFirst,
      page: safeRows > 0 ? Math.floor(safeFirst / safeRows) : 0,
      rows: safeRows,
      cardsViewMode: this.cardsViewMode,
      filterVisiblelg: this.filterVisiblelg
    };

    localStorage.setItem(this.browseStateKey, JSON.stringify(state));
  }

  private restoreBrowseState(): AccountsBrowseState | null {
    const saved = localStorage.getItem(this.browseStateKey);
    if (!saved) {
      return null;
    }

    try {
      const state: AccountsBrowseState = JSON.parse(saved);
      this.restoringBrowseState = true;

      this.filterForm.patchValue({ ...EMPTY_FILTERS, ...state.filters }, { emitEvent: false });

      this.cardsViewMode = state.cardsViewMode ?? this.cardsViewMode;
      this.filterVisiblelg = state.filterVisiblelg ?? this.filterVisiblelg;
      this.paginatorFirst = state.first ?? 0;

      return state;
    } catch {
      localStorage.removeItem(this.browseStateKey);
      return null;
    } finally {
      this.restoringBrowseState = false;
    }
  }

  // ================= Card actions =================

  askToConfirmDelete($event, account: AccountDto, index: number): void {
    this.askToConfirm('AreYouSureYouWantToDeleteThisAccount?', 'AreYouSure')
      .subscribe(confirmed => {
        if (!confirmed) {
          return;
        }

        this.showMainSpinner();
        this._accountsServiceProxy.delete(account.id)
          .pipe(finalize(() => this.hideMainSpinner()))
          .subscribe(() => {
            this.primengTableHelper.records.splice(index, 1);
            this.notify.success(this.l('SuccessfullyDeleted'));
          });
      });
  }

  disconnect(event): void {
    this.showMainSpinner();

    this._accountsServiceProxy
      .disconnect(event.account.account.id, event.relation.relationEntityId)
      .pipe(finalize(() => this.hideMainSpinner()))
      .subscribe(res => {
        this.notify.success(this.l('SuccessfullyDisconnected'));

        event.account.connectionsInfo = (event.account.connectionsInfo || []).filter(
          x => x.relationEntityId !== event.relation.relationEntityId
        );
        event.account.availableConnections.push(res[0]);
      });
  }

  createRelation(account): void {
    if (this.isCreatingRelation) {
      return;
    }
    if (!account?.account?.account?.id || !account?.relation?.connectionEntityId) {
      return;
    }

    this.isCreatingRelation = true;
    this.showMainSpinner();

    forkJoin({
      recipientRoles: this._appTransactionServiceProxy.getAccountMarketplaceRoles(account.account.account.ssin),
      loggedTenantRoles: this._appTransactionServiceProxy.getAccountMarketplaceRoles(this.loginTenaneSsin)
    }).subscribe({
      next: ({ recipientRoles, loggedTenantRoles }: any) => {
        if (!this.hasMarketplaceRoles(recipientRoles) || !this.hasMarketplaceRoles(loggedTenantRoles)) {
          this.message.info(
            this.l('Cannot connect, you need to update the marketplace role of your account / the recipient account marketplace role in order to build relationship together'),
            ''
          );
          this.finishRelation(account);
          return;
        }

        this.applyRelation(account);
      },
      error: () => this.finishRelation(account)
    });
  }

  private applyRelation(account): void {
    this._accountsServiceProxy
      .applyRelationOnProfile(
        account.account.account.id,
        undefined,
        account.relation.defaultVisibility === 'Public',
        account.relation.connectionEntityId
      )
      .pipe(finalize(() => this.finishRelation(account)))
      .subscribe((result: any) => {
        const current = this.accounts.find(x => x.account.id === account.account.account.id);
        if (!current) {
          return;
        }

        current.availableConnections = (current.availableConnections || []).filter(
          x => x.connectionEntityId !== account.relation.connectionEntityId
        );

        current.connectionsInfo = current.connectionsInfo || [];
        if (Array.isArray(result) && result.length > 0) {
          current.connectionsInfo.push(result[0]);
        }

        current.avaliableConnectionName = current.availableConnections.length
          ? current.availableConnections[0].connectLabel
          : '';

        this.accounts = [...this.accounts];
      });
  }

  private finishRelation(account): void {
    this.isCreatingRelation = false;
    account.done?.();
    this.hideMainSpinner();
  }

  private hasMarketplaceRoles(response: any): boolean {
    const roles = response?.result ?? response;
    return Array.isArray(roles) && roles.length > 0;
  }

  // ================= Invite / import =================

  showSendMail(): void {
    const header = 'InvitePartner';
    const tenancyName = this.appSession?.tenancyName || 'Host';
    const tenantId = this.appSession?.tenantId ? this.appSession.tenantId.toString() : null;

    this._emailingTemplateAppService
      .getEmailTemplate(header, [tenancyName, AppConsts.appBaseUrl, tenantId], abp.localization.currentLanguage.name)
      .subscribe(result => {
        this.sendMailModal.show(header, result.messageSubject, result.messageBody);
      });
  }

  showImportAccounts(): void {
    this.ImportAccountsModal.show(
      ImportTypes.Accounts,
      AccountsServiceProxy,
      AccountsImport,
      ['LOGO', 'BANNER', 'IMAGE'],
      true,
      this._importService.getOriginalImportSteps()
    );
  }

  // ================= Logged-in account =================

  private getLoginAccountDataForView(): void {
    const id = this.appSession.user?.accountId;
    if (!id) {
      return;
    }

    this._accountsServiceProxy.getAccountForView(id, 5)
      .subscribe(res => (this.loginTenaneSsin = res?.account?.ssin));
  }
}