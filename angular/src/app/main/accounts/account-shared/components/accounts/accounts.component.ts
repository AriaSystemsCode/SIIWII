import {
    Component,
    Injector,
    ViewChild,
    OnInit,
    Input,
    OnChanges,
    SimpleChanges,
} from "@angular/core";
import {
    AccountsServiceProxy,
    MarketplaceAccountsServiceProxy,
    AccountDto,
    GetAccountForViewDto,
    TreeNodeOfGetSycEntityObjectCategoryForViewDto,
    TreeNodeOfGetSycEntityObjectClassificationForViewDto,
    EmailingTemplateServiceProxy,
    AppTransactionServiceProxy,
    CreateMarketplaceAccountServiceProxy,

} from "@shared/service-proxies/service-proxies";
import { AbpSessionService } from "abp-ng2-module";
import { AppComponentBase } from "@shared/common/app-component-base";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { Table } from "primeng/table";
import { Paginator } from "primeng/paginator";
import { LazyLoadEvent, SelectItem } from "primeng/api";
import * as _ from "lodash";
import { SendMailModalComponent } from "@app/shared/common/Mail/sendMail-modal.component";
import { debounceTime, finalize } from "rxjs/operators";
import { MainImportComponent } from "../../../../../../shared/components/import-steps/components/mainImport.component";
import { AccountMainFilterEnum } from "../../models/accounts-main-filter.enum";
import { AbstractControl, FormBuilder, FormGroup } from "@angular/forms";
import { AppConsts } from "@shared/AppConsts";
import { forkJoin, Observable } from "rxjs";
import { ImportTypes } from "@shared/components/import-steps/models/ImportTypes";
import { AccountsImport } from "@shared/components/import-steps/services/accountsImport.service";
import { ImportStepInfo } from "@shared/components/import-steps/models/ImportStepInfo";
import { MainImportService } from "@shared/components/import-steps/services/mainImport.service";
import {
    ActivatedRoute,
    Router
} from '@angular/router';
import { AccountsBrowseState } from "../../models/imageobject";
@Component({
    selector: "app-accounts",
    providers: [MarketplaceAccountsServiceProxy],
    templateUrl: "./accounts.component.html",
    styleUrls: ["./accounts.component.scss"],
    animations: [appModuleAnimation()],
})
export class AccountsComponent
    extends AppComponentBase
    implements OnInit, OnChanges {

    @Input() defaultMainFilter: AccountMainFilterEnum;
    @Input() showMainFiltersOptions;
    @Input() showAddButton;
    @Input() pageMainFilters: SelectItem[] = [];
    @Input() fromMarketplace;
    @Input() accountType: string;

    @ViewChild("sendMailModal", { static: true }) sendMailModal: SendMailModalComponent;
    @ViewChild("dataTable", { static: true }) dataTable: Table;
    @ViewChild("paginator", { static: true }) paginator: Paginator;
    @ViewChild("ImportAccountsModal", { static: true })

    ImportAccountsModal: MainImportComponent;
    mailHeader: string;
    mailsubject: string;
    mailbody: string;
    filterForm: FormGroup;
    isHost: boolean;
    cardsViewMode: boolean = false;

    showConfirm: boolean = false;
    selectedItemId: number;
    selectedIndex: number;

    _entityTypeFullName = "onetouch.AppItems.AppItem";
    entityHistoryEnabled = false;

    accounts: GetAccountForViewDto[] = [];
    sortingOptions: SelectItem[];
    filterVisible = false; // To toggle the filter visibility
    filterVisiblelg = false; // To toggle the filter visibility
    active: boolean = false;
    loading: boolean = false;
    currentLang: string
    isArabic: boolean
    isAuthenticated: boolean = false;
    loginTenaneSsin:string

   
    constructor(
        injector: Injector,
        private _accountsServiceProxy: AccountsServiceProxy,
        private _marketplaceAccountsServiceProxy: MarketplaceAccountsServiceProxy,
        private _importService: MainImportService,
        private _abpSessionService: AbpSessionService,
        private _formBuilder: FormBuilder,
        private _emailingTemplateAppService: EmailingTemplateServiceProxy,
        private AppTransactionServiceProxy:AppTransactionServiceProxy,
         private CreateMarketplaceAccountServiceProxy: CreateMarketplaceAccountServiceProxy,
             private router: Router,
    private route: ActivatedRoute
        // MarketplaceAccountsModule  
    ) {
        super(injector);
        this.overridePrimeTableSetting();
    }
ngOnInit(): void {

    this.isAuthenticated =
        !!this.appSession?.user;

    this.isHost =
        !this._abpSessionService.tenantId;

    this.currentLang =
        abp.utils.getCookieValue(
            'Abp.Localization.CultureName'
        );

    this.isArabic =
        this.currentLang === 'ar' ||
        this.currentLang === 'ar-EG';

    this.defineSortingOptions();

    this.initFilterForm();

    // Subscribe once
    this.applyFiltersOnChange();

    /**
     * Always read localStorage.
     *
     * Important:
     * pagination must be restored even
     * when URL contains filters.
     */
    const savedState =
        this.restoreBrowseState();

    /**
     * URL filters override saved filter values,
     * but must NOT reset pagination.
     */
    const hasUrlFilters =
        Object.keys(
            this.route.snapshot.queryParams
        ).length > 0;

    if (hasUrlFilters) {
        this.loadFiltersFromUrl();
    }

    const rows =
        savedState?.rows ||
        this.primengTableHelper
            .defaultRecordsCountPerPage;

    const first =
        savedState?.first ?? 0;

    this.paginatorFirst =
        first;

    if (this.paginator) {
        this.paginator.rows =
            rows;

        this.paginator.first =
            first;
    }

    /**
     * One API call only.
     */
    this.getAccounts({
        first,
        rows
    });

    this.getLoginAccountDataForView();
}
 ngOnChanges(changes: SimpleChanges) {

    if (changes?.defaultMainFilter?.firstChange) {

        this.initFilterForm();

        this.setMainPageFilter(
            this.defaultMainFilter
        );
    }
}

private loadFiltersFromUrl(): void {

    const params =
        this.route.snapshot.queryParamMap;

    const accountType =
        params.get('accountType');

    const city =
        params.get('city');

    const postalCode =
        params.get('postalCode');

    const state =
        params.get('state');

    const search =
        params.get('search');

    const countries =
        this.parseNumberArray(
            params.get('countries')
        );

    const currencies =
        this.parseNumberArray(
            params.get('currencies')
        );

    const statuses =
        this.parseNumberArray(
            params.get('statuses')
        );

    const languages =
        this.parseNumberArray(
            params.get('languages')
        );

    const categories =
        this.parseNumberArray(
            params.get('categories')
        );

    const classifications =
        this.parseNumberArray(
            params.get('classifications')
        );

    this.filterForm.patchValue(
        {
            search:
                search || null,

            accountTypes:
                accountType
                    ? Number(accountType)
                    : null,

            city:
                city || null,

            postalCode:
                postalCode || null,

            state:
                state || null,

            countries,
            currencies,
            statuses,
            languages,
            categories,
            classifications
        },
        {
            // IMPORTANT
            emitEvent: false
        }
    );
}

private parseNumberArray(
    value: string | null
): number[] {

    if (!value) {
        return [];
    }

    return value
        .split(',')
        .map(x => Number(x))
        .filter(x => !isNaN(x));
}

    get mainFilterCtrl(): AbstractControl {
        return this.filterForm?.get("mainFilterType");
    }
    get sortingCtrl(): AbstractControl {
        return this.filterForm?.get("sorting");
    }


    toggleFilter(): void {
        this.filterVisible = !this.filterVisible;
        this.filterVisiblelg = !this.filterVisiblelg

         this.saveBrowseState();
    }
    setMainPageFilter(filter: AccountMainFilterEnum) {
        const selectedfilter = this.pageMainFilters.filter(
            (item) => filter == item.value
        )[0];
        if (!selectedfilter) return;
        this.mainFilterCtrl.setValue(selectedfilter);
    }
    overridePrimeTableSetting(countPerPage: number = 32) {
        this.primengTableHelper.defaultRecordsCountPerPage = countPerPage;
        this.primengTableHelper.predefinedRecordsCountPerPage = [
            countPerPage,
            countPerPage * 2,
            countPerPage * 3,
        ];
    }
    // applyFiltersOnChange() {
    //     this.filterForm.valueChanges
    //         .pipe(debounceTime(1500))
    //         .subscribe((status) => {
    //             if (status) {
    //                 this.getAccounts({
    //                     rows: this.primengTableHelper
    //                         .defaultRecordsCountPerPage,
    //                 });
    //             }
    //         });
    // }
applyFiltersOnChange(): void {

    this.filterForm.valueChanges
        .pipe(
            debounceTime(500)
        )
        .subscribe(filters => {

            if (
                this.restoringBrowseState
            ) {
                return;
            }

            this.updateFiltersInUrl(
                filters
            );

            // Filters changed =>
            // reset pagination to first page
            this.saveBrowseState(
                0,
                this.primengTableHelper
                    .defaultRecordsCountPerPage
            );

            this.getAccounts({
                first: 0,
                rows:
                    this.primengTableHelper
                        .defaultRecordsCountPerPage
            });

        });
}

private updateFiltersInUrl(
    filters: any
): void {

    const queryParams: any = {

        search:
            filters.search || null,

        accountType:
            filters.accountTypes ?? null,

        city:
            filters.city || null,

        postalCode:
            filters.postalCode || null,

        state:
            filters.state || null,

        countries:
            this.serializeFilterArray(
                filters.countries
            ),

        currencies:
            this.serializeFilterArray(
                filters.currencies
            ),

        statuses:
            this.serializeFilterArray(
                filters.statuses
            ),

        languages:
            this.serializeFilterArray(
                filters.languages
            ),

        categories:
            this.serializeTreeFilter(
                filters.categories,
                'category'
            ),

        classifications:
            this.serializeTreeFilter(
                filters.classifications,
                'classification'
            )
    };

    this.router.navigate([], {
        relativeTo: this.route,
        queryParams,
        queryParamsHandling: 'merge',
        replaceUrl: true
    });
}


private serializeFilterArray(
    value: any[]
): string | null {

    if (
        !Array.isArray(value) ||
        value.length === 0
    ) {
        return null;
    }

    return value
        .map(x => {
            if (
                typeof x === 'number' ||
                typeof x === 'string'
            ) {
                return x;
            }

            return (
                x?.value ??
                x?.id
            );
        })
        .filter(
            x =>
                x !== null &&
                x !== undefined
        )
        .join(',');
}
private serializeTreeFilter(
    value: any[],
    type: 'category' | 'classification'
): string | null {

    if (
        !Array.isArray(value) ||
        value.length === 0
    ) {
        return null;
    }

    const ids =
        value
            .map(item => {

                // Already restored as ID
                if (
                    typeof item === 'number' ||
                    typeof item === 'string'
                ) {
                    return item;
                }

                if (type === 'category') {
                    return item?.data
                        ?.sycEntityObjectCategory
                        ?.id;
                }

                return item?.data
                    ?.sycEntityObjectClassification
                    ?.id;
            })
            .filter(
                id =>
                    id !== null &&
                    id !== undefined
            );

    return ids.length
        ? ids.join(',')
        : null;
}
    saveUserPreferenceForListView() {
        const key = "account-list-view-mode";
        const value = String(Number(this.cardsViewMode));
        localStorage.setItem(key, value);
    }
    getUserPreferenceForListView() {
        const key = "account-list-view-mode";
        const value = localStorage.getItem(key);
        if (value) this.cardsViewMode = Boolean(Number(value));
    }
    triggerListView() {
        this.cardsViewMode = !this.cardsViewMode;
        this.saveUserPreferenceForListView();
            this.saveBrowseState();
    }

    defineSortingOptions() {
        this.sortingOptions = [
            { label: this.l("Name"), value: "name" },
            { label: this.l("AccountType"), value: "accountTypeId" },
        ];
    }

    accountTypeChanges() {
        this.getAccounts();
    }
    // resetList() {
    //     this.filterForm.reset();
    //     this.setMainPageFilter(this.defaultMainFilter);
    // }

    resetList(): void {

    localStorage.removeItem(
        this.accountBrowseStateKey
    );

    this.filterForm.reset(
        {
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
        },
        {
            emitEvent: false
        }
    );

    this.setMainPageFilter(
        this.defaultMainFilter
    );

    if (this.paginator) {
        this.paginator.changePage(0);
    }

    this.getAccounts({
        first: 0,
        rows:
            this.primengTableHelper
                .defaultRecordsCountPerPage
    });
}

getAccounts(
        event?: LazyLoadEvent
    ): void {

    

        const rows =
            event?.rows ||
            this.paginator?.rows ||
            this.primengTableHelper
                .defaultRecordsCountPerPage ||
            32;

        const maxResultCount =
            rows > 0
                ? rows
                : 32;

        const first =
            event?.first ?? 0;

        const skipCount =
            first >= 0
                ? first
                : 0;

        if (this.paginator) {

            this.paginator.rows =
                maxResultCount;

            if (
                event?.first !==
                undefined
            ) {

                const page =
                    Math.floor(
                        skipCount /
                        maxResultCount
                    );

                if (
                    this.paginator
                        .getPage() !==
                    page
                ) {
                
                }
            }
        }



        const formValue =
            this.filterForm
                ?.getRawValue() ??
            {};

   
        const filters: any = {
            ...formValue
        };

        filters.classifications =
            this.extractClassificationIds(
                formValue.classifications
            );

        filters.categories =
            this.extractCategoryIds(
                formValue.categories
            );

        filters.countries =
            this.extractSimpleIds(
                formValue.countries
            );

        filters.currencies =
            this.extractSimpleIds(
                formValue.currencies
            );

        filters.statuses =
            this.extractSimpleIds(
                formValue.statuses
            );

        filters.languages =
            this.extractSimpleIds(
                formValue.languages
            );

        const accountTypesFilter =
            filters.accountTypes !==
                null &&
            filters.accountTypes !==
                undefined &&
            filters.accountTypes !==
                ''
                ? [
                    Number(
                        filters.accountTypes
                    )
                ]
                : undefined;

  

      


        /**
         * -----------------------------------------------------
         * Loading
         * -----------------------------------------------------
         */

        this.primengTableHelper
            .showLoadingIndicator();

        this.showMainSpinner();

        this.loading = true;

        let apiCall: any;

     

        if (
            !this.fromMarketplace
        ) {

            apiCall =
                this._accountsServiceProxy
                    .getAll(

                        filters.search ||
                            undefined,

                        filters
                            ?.mainFilterType
                            ?.value ||
                            undefined,

                        undefined,

                        undefined,

                        filters.city ||
                            undefined,

                        filters.state ||
                            undefined,

                        filters.postalCode ||
                            undefined,

                        filters.ssin ||
                            undefined,

                        filters.accountTypeId ||
                            undefined,

                        filters.accountType ||
                            undefined,

                        accountTypesFilter,

                        filters.statuses
                            ?.length
                            ? filters.statuses
                            : undefined,

                        filters.languages
                            ?.length
                            ? filters.languages
                            : undefined,

                        filters.countries
                            ?.length
                            ? filters.countries
                            : undefined,

                        filters.classifications
                            ?.length
                            ? filters.classifications
                            : undefined,

                        filters.categories
                            ?.length
                            ? filters.categories
                            : undefined,

                        filters.currencies
                            ?.length
                            ? filters.currencies
                            : undefined,

                        undefined,

                        filters
                            ?.sorting
                            ?.value ||
                            undefined,

                        skipCount,

                        maxResultCount
                    );
        }

        /**
         * -----------------------------------------------------
         * Marketplace Accounts
         * -----------------------------------------------------
         */

        else {

            apiCall =
                this
                    ._marketplaceAccountsServiceProxy
                    .getAll(

                        filters.search ||
                            undefined,

                        undefined,

                        undefined,

                        undefined,

                        filters.city ||
                            undefined,

                        filters.state ||
                            undefined,

                        filters.postalCode ||
                            undefined,

                        filters.ssin ||
                            undefined,

                        filters.accountTypeId ||
                            undefined,

                        filters.accountType ||
                            undefined,

                        accountTypesFilter,

                        filters.statuses
                            ?.length
                            ? filters.statuses
                            : undefined,

                        filters.languages
                            ?.length
                            ? filters.languages
                            : undefined,

                        filters.countries
                            ?.length
                            ? filters.countries
                            : undefined,

                        filters.classifications
                            ?.length
                            ? filters.classifications
                            : undefined,

                        filters.categories
                            ?.length
                            ? filters.categories
                            : undefined,

                        filters.currencies
                            ?.length
                            ? filters.currencies
                            : undefined,

                        undefined,

                        filters
                            ?.sorting
                            ?.value ||
                            undefined,

                        skipCount,

                        maxResultCount
                    );
        }

        apiCall
            .pipe(
                finalize(
                    () => {

                        this
                            .primengTableHelper
                            .hideLoadingIndicator();

                        this.loading =
                            false;

                        this.hideMainSpinner();

                        if (
                            !this.active
                        ) {
                            this.active =
                                true;
                        }
                    }
                )
            )
            .subscribe(
                result => {

                    this.accounts =
                        result?.items ??
                        [];

                    this
                        .primengTableHelper
                        .totalRecordsCount =
                        result?.totalCount ??
                        0;

                    this
                        .primengTableHelper
                        .records =
                        this.accounts;
                }
            );
    }

    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }

    askToConfirmDelete($event, account: AccountDto, index: number): void {

        var isConfirmed: Observable<boolean>;
        isConfirmed = this.askToConfirm("AreYouSureYouWantToDeleteThisAccount?", "AreYouSure");

        isConfirmed.subscribe((res) => {

            if (res) {
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
 private extractSimpleIds(
        values: any
    ): any[] {

        if (
            !Array.isArray(values)
        ) {
            return [];
        }

        return values
            .map(
                item => {

                    if (
                        typeof item ===
                            'number' ||
                        typeof item ===
                            'string'
                    ) {
                        return item;
                    }

                    return (
                        item?.value ??
                        item?.id
                    );
                }
            )
            .filter(
                value =>
                    value !== null &&
                    value !== undefined
            );
    }

    private extractClassificationIds(
        values: any
    ): number[] {

        if (
            !Array.isArray(values)
        ) {
            return [];
        }

        return values
            .map(
                item => {

                    if (
                        typeof item ===
                        'number'
                    ) {
                        return item;
                    }

                    return item?.data
                        ?.sycEntityObjectClassification
                        ?.id;
                }
            )
            .filter(
                id =>
                    id !== null &&
                    id !== undefined
            );
    }

    private extractCategoryIds(
        values: any
    ): number[] {

        if (
            !Array.isArray(values)
        ) {
            return [];
        }

        return values
            .map(
                item => {

                    if (
                        typeof item ===
                        'number'
                    ) {
                        return item;
                    }

                    return item?.data
                        ?.sycEntityObjectCategory
                        ?.id;
                }
            )
            .filter(
                id =>
                    id !== null &&
                    id !== undefined
            );
    }

    showImportAccounts() {
        let importService = AccountsServiceProxy;
        let serviceUtilites = AccountsImport;
        let importStepsInfo: ImportStepInfo[];
        importStepsInfo = this._importService.getOriginalImportSteps();

        this.ImportAccountsModal.show(ImportTypes.Accounts, importService, serviceUtilites, ['LOGO', "BANNER", "IMAGE"], true, importStepsInfo);
    }

    connect(account: AccountDto): void {
        this.showMainSpinner();
        this._accountsServiceProxy
            .connectContactsProfiles(account.id, null, null)
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
                // event.account.availableConnections = res || [];
                // event.account.status = event.account.connectionsInfo.length > 0;
                // event.account.connectionName = '';
                // event.account.avaliableConnectionName = res?.length ? res[0].connectLabel : '';
            });

        
    // this.CreateMarketplaceAccountServiceProxy
    //   .createOrEditMarketplaceContactRelationship(this.loginTenaneSsin, event.account.account.ssin, true, event.relation.visibility == 'Public' ?true:false , null, event.relation.relationEntityId)
    //   .pipe(
    //     finalize(() => {
    //       this.hideMainSpinner();
    //     })
    //   )
    //   .subscribe(() => {
    //         this.notify.success(this.l("SuccessfullyDisconnected"));

    //             event.account.connectionsInfo = (event.account.connectionsInfo || []).filter(
    //                 x => x.relationEntityId !== event.relation.relationEntityId
    //             );
    //             // event.account.availableConnections.push(res[0])
    //             // event.account.availableConnections = res || [];
    //             // event.account.status = event.account.connectionsInfo.length > 0;
    //             // event.account.connectionName = '';
    //             // event.account.avaliableConnectionName = res?.length ? res[0].connectLabel : '';
    //   });
    }

    initFilterForm() {
        if (this.filterForm) return;
        this.filterForm = this._formBuilder.group({
            search: [],
            mainFilterType: [],
            city: [],
            postalCode: [],
            state: [],
            sorting: [],
            accountTypes: [],
            languages: [],
            countries: [],
            classifications: [],
            categories: [],
            currencies: [],
            statuses: [],
        });
    }

    showSendMail() {

        this.mailHeader = "InvitePartner";
        var emailParameters: string[] = [];

        var tenancyName;
        if (this.appSession?.tenancyName)
            tenancyName = this.appSession?.tenancyName;
        else tenancyName = "Host";
        emailParameters.push(tenancyName);

        emailParameters.push(AppConsts.appBaseUrl);

        var tenantId;
        if (this.appSession?.tenantId)
            tenantId = this.appSession?.tenantId?.toString();
        else tenantId = null;

        emailParameters.push(tenantId);
        this._emailingTemplateAppService
            .getEmailTemplate(
                "InvitePartner",
                emailParameters,
                abp.localization.currentLanguage.name
            )
            .subscribe((result) => {

                this.mailsubject = result.messageSubject;
                this.mailbody = result.messageBody;
                this.sendMailModal.show(
                    this.mailHeader,
                    this.mailsubject,
                    this.mailbody
                );
            });
    }
    onFinishImport($event) {
        if ($event)
            this.reloadPage();
    }


isCreatingRelation = false;

createRelation(account) {
  if (this.isCreatingRelation) {
    return;
  }

  if (!account?.account?.account?.id || !account?.relation?.connectionEntityId) {
    return;
  }

  this.isCreatingRelation = true;
  this.showMainSpinner();

  forkJoin({
    recipientRoles: this.AppTransactionServiceProxy.getAccountMarketplaceRoles(
      account.account.account.ssin
    ),
    loggedTenantRoles: this.AppTransactionServiceProxy.getAccountMarketplaceRoles(
      this.loginTenaneSsin
    )
  }).subscribe({
    next: ({ recipientRoles, loggedTenantRoles }: any) => {
      const recipientHasRoles = this.hasMarketplaceRoles(recipientRoles);
      const loggedTenantHasRoles = this.hasMarketplaceRoles(loggedTenantRoles);

      if (!recipientHasRoles || !loggedTenantHasRoles) {
        this.message.info(
           this.l('Cannot connect, you need to update the marketplace role of your account / the recipient account marketplace role in order to build relationship together')  ,

          ''
        );

      this.isCreatingRelation = false;
    account.done?.();
    this.hideMainSpinner();
    return;
      }

      this.applyRelation(account);
    },
   error: () => {
    this.isCreatingRelation = false;
    account.done?.();
    this.hideMainSpinner();
}
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
    .pipe(
      finalize(() => {
        this.isCreatingRelation = false;
        account.done?.();
        this.hideMainSpinner();
      })
    )
    .subscribe((result: any) => {
      const i = this.accounts.findIndex(
        x => x.account.id === account.account.account.id
      );

      if (i < 0) return;

      const currentAccount = this.accounts[i];

      currentAccount.availableConnections =
        (currentAccount.availableConnections || []).filter(
          x => x.connectionEntityId !== account.relation.connectionEntityId
        );

      currentAccount.connectionsInfo = currentAccount.connectionsInfo || [];

      if (Array.isArray(result) && result.length > 0) {
        currentAccount.connectionsInfo.push(result[0]);
      }

      currentAccount.avaliableConnectionName =
        currentAccount.availableConnections?.length > 0
          ? currentAccount.availableConnections[0].connectLabel
          : '';

      this.accounts = [...this.accounts];
    });
}
private hasMarketplaceRoles(response: any): boolean {
  const roles = response?.result ?? response;

  return Array.isArray(roles) && roles.length > 0;
}




    getLoginAccountDataForView() {
        let id = this.appSession.user.accountId
        if (!id) return

      this._accountsServiceProxy.getAccountForView(id, 5).pipe(
  
    ).subscribe((res) => {
      this.loginTenaneSsin = res?.account?.ssin
    })

    }


    //////////////////// save filters

   private saveBrowseState(
    first?: number,
    rows?: number
): void {

    if (
        !this.filterForm ||
        this.restoringBrowseState
    ) {
        return;
    }

    const formValue =
        this.filterForm.getRawValue();

    const safeRows =
        rows ??
        this.paginator?.rows ??
        this.primengTableHelper
            .defaultRecordsCountPerPage;

    const safeFirst =
        first ??
        this.paginator?.first ??
        0;

    const page =
        safeRows > 0
            ? Math.floor(
                safeFirst / safeRows
            )
            : 0;

    const state: AccountsBrowseState = {

        filters: {
            search:
                formValue.search ?? null,

            mainFilterType:
                formValue.mainFilterType ?? null,

            city:
                formValue.city ?? null,

            postalCode:
                formValue.postalCode ?? null,

            state:
                formValue.state ?? null,

            sorting:
                formValue.sorting ?? null,

            accountTypes:
                formValue.accountTypes ?? null,

            languages:
                this.extractSimpleIds(
                    formValue.languages
                ),

            countries:
                this.extractSimpleIds(
                    formValue.countries
                ),

            classifications:
                this.extractClassificationIds(
                    formValue.classifications
                ),

            categories:
                this.extractCategoryIds(
                    formValue.categories
                ),

            currencies:
                this.extractSimpleIds(
                    formValue.currencies
                ),

            statuses:
                this.extractSimpleIds(
                    formValue.statuses
                )
        },

        first: safeFirst,
        page,
        rows: safeRows,

        cardsViewMode:
            this.cardsViewMode,

        filterVisiblelg:
            this.filterVisiblelg
    };

    localStorage.setItem(
        this.accountBrowseStateKey,
        JSON.stringify(state)
    );
}

private restoreBrowseState():
    AccountsBrowseState | null {

    const saved =
        localStorage.getItem(
            this.accountBrowseStateKey
        );

    if (!saved) {
        return null;
    }

    try {

        const state:
            AccountsBrowseState =
            JSON.parse(saved);

        this.restoringBrowseState =
            true;

        this.filterForm.patchValue(
            {
                search:
                    state.filters
                        ?.search ?? null,

                mainFilterType:
                    state.filters
                        ?.mainFilterType ?? null,

                city:
                    state.filters
                        ?.city ?? null,

                postalCode:
                    state.filters
                        ?.postalCode ?? null,

                state:
                    state.filters
                        ?.state ?? null,

                sorting:
                    state.filters
                        ?.sorting ?? null,

                accountTypes:
                    state.filters
                        ?.accountTypes ?? null,

                languages:
                    state.filters
                        ?.languages ?? [],

                countries:
                    state.filters
                        ?.countries ?? [],

                classifications:
                    state.filters
                        ?.classifications ?? [],

                categories:
                    state.filters
                        ?.categories ?? [],

                currencies:
                    state.filters
                        ?.currencies ?? [],

                statuses:
                    state.filters
                        ?.statuses ?? []
            },
            {
                emitEvent: false
            }
        );

        this.cardsViewMode =
            state.cardsViewMode ??
            this.cardsViewMode;

        this.filterVisiblelg =
            state.filterVisiblelg ??
            this.filterVisiblelg;

        this.paginatorFirst =
            state.first ?? 0;

        return state;

    } catch {

        localStorage.removeItem(
            this.accountBrowseStateKey
        );

        return null;

    } finally {

        this.restoringBrowseState =
            false;
    }
}

onAccountsPageChange(
    event: any
): void {

    const first =
        event?.first ?? 0;

    const rows =
        event?.rows ??
        this.primengTableHelper
            .defaultRecordsCountPerPage;

    this.paginatorFirst = first;

    this.saveBrowseState(
        first,
        rows
    );

    this.getAccounts({
        first,
        rows
    });
}

private get accountBrowseStateKey(): string {
    return this.fromMarketplace
        ? 'marketplaceAccountsBrowseState'
        : 'accountsBrowseState';
}

private restoringBrowseState = false;
paginatorFirst = 0;



}



