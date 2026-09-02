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
    CreateOrEditAccountInfoDto,
    AccountLevelEnum,
    SycAttachmentCategoryDto,
    AppEntityAttachmentDto,
    SycIdentifierDefinitionsServiceProxy,

} from "@shared/service-proxies/service-proxies";
import { AbpSessionService, IAjaxResponse, TokenService } from "abp-ng2-module";
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
import { forkJoin, Observable, of } from "rxjs";
import { ImportTypes } from "@shared/components/import-steps/models/ImportTypes";
import { AccountsImport } from "@shared/components/import-steps/services/accountsImport.service";
import { ImportStepInfo } from "@shared/components/import-steps/models/ImportStepInfo";
import { MainImportService } from "@shared/components/import-steps/services/mainImport.service";
import { FileUploader, FileUploaderOptions } from "@node_modules/ng2-file-upload";

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
    filterVisiblelg = true; // To toggle the filter visibility
    active: boolean = false;
    loading: boolean = false;
    currentLang: string
    isArabic: boolean
    isAuthenticated: boolean = false;
    loginTenaneSsin:string

    entityObjectType = 'BUSINESS';
    constructor(
        injector: Injector,
        private _accountsServiceProxy: AccountsServiceProxy,
        private _marketplaceAccountsServiceProxy: MarketplaceAccountsServiceProxy,
        private _importService: MainImportService,
        private _abpSessionService: AbpSessionService,
        private _formBuilder: FormBuilder,
        private _emailingTemplateAppService: EmailingTemplateServiceProxy,
        private AppTransactionServiceProxy:AppTransactionServiceProxy,
  
           private _tokenService:TokenService,
         private _sycIdentifierDefinitionsServiceProxy:
    SycIdentifierDefinitionsServiceProxy,
    ) {
        super(injector);
        this.overridePrimeTableSetting();
    }
    ngOnInit() {
        this.isAuthenticated = !!this.appSession?.user;
        this.isHost = !this._abpSessionService.tenantId;
        this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
        this.currentLang == 'ar' || this.currentLang == 'ar-EG' ? this.isArabic = true : this.isArabic = false
        this.defineSortingOptions();
        this.getUserPreferenceForListView();
        this.initFilterForm();
        this.getLoginAccountDataForView()


  this.loadAttachmentCategories();
    }
    ngOnChanges(changes: SimpleChanges) {
        if (changes?.defaultMainFilter?.firstChange) {
            this.initFilterForm();
            this.setMainPageFilter(this.defaultMainFilter);
            this.getAccounts({
                rows: this.primengTableHelper.defaultRecordsCountPerPage,
            });
        }

        this.applyFiltersOnChange();
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
    applyFiltersOnChange() {
        this.filterForm.valueChanges
            .pipe(debounceTime(1500))
            .subscribe((status) => {
                if (status) {
                    this.getAccounts({
                        rows: this.primengTableHelper
                            .defaultRecordsCountPerPage,
                    });
                }
            });
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
    resetList() {
        this.filterForm.reset();
        this.setMainPageFilter(this.defaultMainFilter);
    }

    getAccounts(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.totalRecords = 10;
            this.paginator.changePage(0);
            return;
        }

        const filters = this.filterForm.value;

        const classificationsFilters: TreeNodeOfGetSycEntityObjectClassificationForViewDto[] =
            filters.classifications;
        const categoriesFilters: TreeNodeOfGetSycEntityObjectCategoryForViewDto[] =
            filters.categories;

        if (Array.isArray(classificationsFilters)) {
            filters.classifications = [];
            classificationsFilters.forEach((item) => {
                const id = item.data.sycEntityObjectClassification.id;
                filters.classifications.push(id);
            });
        }

        if (Array.isArray(categoriesFilters)) {
            filters.categories = [];
            categoriesFilters.forEach((item) => {
                const id = item.data.sycEntityObjectCategory.id;
                filters.categories.push(id);
            });
        }

        const accountTypesFilter =
            filters.accountTypes === null || filters.accountTypes === undefined || filters.accountTypes === ''
                ? undefined
                : [filters.accountTypes];

        this.primengTableHelper.showLoadingIndicator();
        this.showMainSpinner();
        this.loading = true;

        let apiCall;

        if (!this.fromMarketplace) {
            apiCall = this._accountsServiceProxy.getAll(
                filters.search || undefined,
                filters?.mainFilterType?.value || undefined,
                undefined,
                undefined,
                filters.city || undefined,
                filters.state || undefined,
                filters.postalCode || undefined,
                filters?.ssin || undefined,
                filters?.accountTypeId || undefined,
                filters?.accountType || undefined,
                accountTypesFilter,
                filters.statuses || undefined,
                filters.languages || undefined,
                filters.countries || undefined,
                filters.classifications || undefined,
                filters.categories || undefined,
                filters.currencies || undefined,
                undefined,
                filters?.sorting?.value || undefined,
                this.primengTableHelper.getSkipCount(this.paginator, event),
                this.primengTableHelper.getMaxResultCount(this.paginator, event)
            );
        } else {
            apiCall = this._marketplaceAccountsServiceProxy.getAll(
                filters.search || undefined,
                undefined,
                undefined,
                undefined,
                filters.city || undefined,
                filters.state || undefined,
                filters.postalCode || undefined,
                filters?.ssin || undefined,
                filters?.accountTypeId || undefined,
                filters?.accountType || undefined,
                accountTypesFilter,
                filters.statuses || undefined,
                filters.languages || undefined,
                filters.countries || undefined,
                filters.classifications || undefined,
                filters.categories || undefined,
                filters.currencies || undefined,
                undefined,
                filters?.sorting?.value || undefined,
                this.primengTableHelper.getSkipCount(this.paginator, event),
                this.primengTableHelper.getMaxResultCount(this.paginator, event)
            );
        }

        apiCall.pipe(
            finalize(() => {
                this.primengTableHelper.hideLoadingIndicator();
                if (!this.active) this.active = true;
                this.loading = false;
                this.hideMainSpinner();
            })
        ).subscribe((result) => {
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
          'Cannot connect, you need to update the marketplace role of your account / the recipient account marketplace role in order to build relationship together',
          ''
        );

        this.isCreatingRelation = false;
        this.hideMainSpinner();
        return;
      }

      this.applyRelation(account);
    },
    error: () => {
      this.isCreatingRelation = false;
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


    showGenericEntityModal = false;

entityMode: 'create' | 'edit' | 'view' = 'create';

accountData: any = null;



accountTypes = [
  { label: 'Business', value: 19 },
  { label: 'Personal', value: 21 }
];

statuses = [
  { label: 'Active', value: true },
  { label: 'Inactive', value: false }
];
accountBasicInfoFields = [
  {
    key: 'status',
    label: 'Status',
    type: 'dropdown',
    valuePath: 'account.status',
    options: this.statuses,
    optionLabel: 'label',
    optionValue: 'value'
  },
  {
    key: 'accountType',
    label: 'Account Type',
    type: 'dropdown',
    valuePath: 'account.accountTypeId',
    options: this.accountTypes,
    optionLabel: 'label',
    optionValue: 'value'
  },
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    valuePath: 'account.name'
  },
  {
    key: 'code',
    label: 'Code',
    type: 'text',
    valuePath: 'account.code',
   
  },
  {
    key: 'ssin',
    label: 'SSIN',
    type: 'text',
    valuePath: 'account.ssin',
    readonly: true
  }
];



accountDto =
  new CreateOrEditAccountInfoDto();

saving = false;
uploadingImages = false;

private originalAccountDto: any = null;
accountId


private pendingLogoFile: File | null = null;
private pendingBackgroundFile: File | null = null;
private pendingImageFiles: File[] = [];

onLogoChange(event: any): void {
  const file: File = event?.file;

  if (!file) {
    return;
  }

  this.pendingLogoFile = file;
}

onBackgroundChange(event: any): void {
  const file: File = event?.file;

  if (!file) {
    return;
  }

  this.pendingBackgroundFile = file;
}


onImagesChange(event: any): void {
  const file: File =
    event?.file;

  const index: number =
    event?.index;

  if (!file) {
    return;
  }

  if (
    index === undefined ||
    index === null ||
    index < 0 ||
    index > 3
  ) {
    return;
  }

  this.pendingImageFiles[index] =
    file;

  this.pendingImageFiles = [
    ...this.pendingImageFiles
  ];
}


onAttachmentRemove(
  event: any
): void {

  const type =
    event?.attachmentType;

  const index =
    event?.index;

  const attachment =
    event?.attachment;

  if (type === 'LOGO') {
    this.pendingLogoFile = null;
  }

  if (type === 'BANNER') {
    this.pendingBackgroundFile = null;
  }

  if (
    type === 'IMAGE' &&
    index !== undefined &&
    index !== null
  ) {
    this.pendingImageFiles[index] =
      null;

    this.pendingImageFiles = [
      ...this.pendingImageFiles
    ];
  }

  if (!attachment) {
    return;
  }

  this.accountDto.entityAttachments =
    (
      this.accountDto
        .entityAttachments ??
      []
    ).filter(item => {

      if (
        attachment.id &&
        item.id === attachment.id
      ) {
        return false;
      }

      if (
        attachment.guid &&
        item.guid ===
          attachment.guid
      ) {
        return false;
      }

      if (
        attachment.fileName &&
        item.fileName ===
          attachment.fileName
      ) {
        return false;
      }

      return item !== attachment;
    });

  this.buildAccountData();
}

cancelAccount(): void {
  if (
    this.saving ||
    this.uploadingImages
  ) {
    return;
  }

  if (
    this.entityMode === 'create'
  ) {
    this.resetGenericAccountState();
    return;
  }

  if (
    this.originalAccountDto
  ) {
    this.accountDto =
      CreateOrEditAccountInfoDto.fromJS(
        this.cloneValue(
          this.originalAccountDto
        )
      );

    this.initializeDtoArrays();
    this.buildAccountData();
  }

  this.showGenericEntityModal = false;
}


private resetGenericAccountState(): void {
  this.showGenericEntityModal = false;

  this.accountId = null;
  this.accountData = null;

  this.accountDto =
    new CreateOrEditAccountInfoDto();

  this.originalAccountDto = null;

  this.pendingLogoFile = null;
  this.pendingBackgroundFile = null;
  this.pendingImageFiles = [];

  this.uploadingImages = false;
  this.saving = false;
}

closeGenericEntityModal(): void {
  if (
    this.saving ||
    this.uploadingImages
  ) {
    return;
  }

  this.resetGenericAccountState();
}
openCreateManualAccount(): void {
  this.loadAttachmentCategories();

  this.accountId = null;
  this.entityMode = 'create';

  this.accountDto =
    this.createEmptyAccountDto();

  this.buildAccountData();

  this.setManualAccCode();

  this.originalAccountDto =
    this.cloneValue(
      this.accountDto.toJSON()
    );

  this.clearPendingFiles();

  this.showGenericEntityModal =
    true;
}



openEditAccount(accountId: number): void {
  this.accountId = accountId;
  this.entityMode = 'edit';
  this.showGenericEntityModal = true;

  this.loadAccountForEdit(accountId);
}

private loadAccountForEdit(
  accountId: number
): void {
  this.showMainSpinner();

  this._accountsServiceProxy
    .getAccountForEdit(accountId)
    .pipe(
      finalize(() => {
        this.hideMainSpinner();
      })
    )
    .subscribe({
      next: result => {
        this.accountDto =
          CreateOrEditAccountInfoDto.fromJS(
            result.accountInfo
          );

        this.initializeDtoArrays();
        this.buildAccountData();

        this.originalAccountDto =
          this.cloneValue(
            this.accountDto.toJSON()
          );
      },
      error: error => {
        this.showGenericEntityModal = false;
      }
    });
}


private createEmptyAccountDto():
  CreateOrEditAccountInfoDto {

  const dto =
    new CreateOrEditAccountInfoDto();

  dto.id = undefined;
  dto.accountId = undefined;

  dto.name = '';
  dto.code = '';
  dto.tradeName = '';

  dto.website = '';
  dto.eMailAddress =
    this.appSession?.user?.emailAddress ??
    '';

  dto.accountTypeId = 19;
  dto.accountType = 'Business';

  dto.accountLevel =
    AccountLevelEnum.Manual;

  dto.status = true;

  dto.languageId = undefined;
  dto.currencyId = undefined;

  dto.phone1TypeId = undefined;
  dto.phone1Number = '';
  dto.phone1Ex = '';

  dto.phone2TypeId = undefined;
  dto.phone2Number = '';
  dto.phone2Ex = '';

  dto.phone3TypeId = undefined;
  dto.phone3Number = '';
  dto.phone3Ex = '';

  dto.entityAttachments = [];
  dto.entityCategories = [];
  dto.entityClassifications = [];
  dto.entityExtraData = [];

  dto.branches = [];
  dto.contactAddresses = [];
  dto.contactPaymentMethods = [];

  dto.returnId = true;
  dto.useDTOTenant = false;

  return dto;
}




private buildAccountData(): void {
  this.initializeDtoArrays();

  this.accountData = {
    account: this.accountDto,
    entityExtraData:
      this.accountDto.entityExtraData,
    connectionsInfo:
      this.accountData?.connectionsInfo ?? []
  };
}


private initializeDtoArrays(): void {
  this.accountDto.entityAttachments ??= [];
  this.accountDto.entityCategories ??= [];
  this.accountDto.entityClassifications ??= [];
  this.accountDto.entityExtraData ??= [];

  this.accountDto.branches ??= [];
  this.accountDto.contactAddresses ??= [];
  this.accountDto.contactPaymentMethods ??= [];
}



onAccountChanged(data: any): void {
  if (!data?.account) {
    return;
  }

  this.accountDto = data.account;

  this.accountDto.entityExtraData =
    data.entityExtraData ??
    this.accountDto.entityExtraData ??
    [];
}

saveAccount(): void {
  if (
    this.saving ||
    this.uploadingImages
  ) {
    return;
  }

  this.prepareDtoBeforeSave();

  if (!this.validateAccount()) {
    return;
  }

  this.saving = true;
  this.uploadingImages = true;

  this.uploadPendingAttachments()
    .pipe(
      finalize(() => {
        this.uploadingImages = false;
      })
    )
    .subscribe({
      next: attachments => {

        this.applyUploadedAttachments(
          attachments
        );

        this.saveAccountDto();
      },
      error: error => {

        this.saving = false;

        this.notify.error(
          this.l('UploadFailed')
        );
      }
    });
}


private saveAccountDto(): void {
    console.log(this.accountData,'daaataaa')
  this._accountsServiceProxy
    .createOrEditAccount(
      this.accountDto
    )
    .pipe(
      finalize(() => {
        this.saving = false;
      })
    )
    .subscribe({
      next: result => {
        this.notify.success(
          this.l('SavedSuccessfully')
        );

        const savedAccount =
          result?.accountInfo ??
          result?.account ??
          result;

        if (savedAccount) {
          this.accountDto =
            CreateOrEditAccountInfoDto
              .fromJS(savedAccount);

          this.initializeDtoArrays();
          this.buildAccountData();

          this.accountId =
            this.accountDto.id ??
            this.accountDto.accountId ??
            this.accountId;

          this.originalAccountDto =
            this.cloneValue(
              this.accountDto.toJSON()
            );
        }

        this.clearPendingFiles();

        this.showGenericEntityModal =
          false;

        this.reloadPage();
      },
   
    });
}


private setManualAccCode(): void {
  this.entityObjectType =
    'BUSINESS';

  if (this.accountDto.code) {
    return;
  }

  this._sycIdentifierDefinitionsServiceProxy
    .getNextEntityCode(
      this.entityObjectType,
      this.appSession.tenantId
    )
    .subscribe({
      next: code => {
        if (!code) {
          return;
        }

        this.accountDto.code =
          `M${code}`;
        this.accountData = {
          ...this.accountData,
          account: this.accountDto
        };
      },
    
    });
}

private uploadPendingAttachments():
  Observable<
    UploadedAttachmentResult[]
  > {

  const uploads:
    Observable<
      UploadedAttachmentResult
    >[] = [];

  if (
    this.pendingLogoFile &&
    this.logoAttachmentCategory?.id
  ) {
    uploads.push(
      this.uploadSingleAttachment(
        this.pendingLogoFile,
        this.logoAttachmentCategory.id,
        'LOGO'
      )
    );
  }

  if (
    this.pendingBackgroundFile &&
    this.bannerAttachmentCategory?.id
  ) {
    uploads.push(
      this.uploadSingleAttachment(
        this.pendingBackgroundFile,
        this.bannerAttachmentCategory.id,
        'BANNER'
      )
    );
  }

  this.pendingImageFiles
    .forEach((file, index) => {
      if (
        file &&
        this.imageAttachmentCategory?.id
      ) {
        uploads.push(
          this.uploadSingleAttachment(
            file,
            this.imageAttachmentCategory.id,
            'IMAGE',
            index
          )
        );
      }
    });

  if (!uploads.length) {
    return of([]);
  }

  return forkJoin(uploads);
}

private createGuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, character => {
      const random =
        Math.random() * 16 | 0;

      const value =
        character === 'x'
          ? random
          : (random & 0x3) | 0x8;

      return value.toString(16);
    });
}
private uploadSingleAttachment(
  file: File,
  attachmentCategoryId: number,
  attachmentType:
    'LOGO' |
    'BANNER' |
    'IMAGE',
  index?: number
): Observable<
  UploadedAttachmentResult
> {

  return new Observable(
    observer => {

      const guid =
        this.createGuid();

      const uploader =
        this.createAttachmentUploader();

      uploader.onBuildItemForm =
        (
          item,
          form: FormData
        ) => {
          form.append(
            'guid',
            guid
          );
        };

      uploader.onSuccessItem =
        (
          item,
          response
        ) => {
          try {
            const parsedResponse =
              JSON.parse(
                response
              ) as IAjaxResponse;

            if (
              !parsedResponse?.success
            ) {
              observer.error(
                parsedResponse?.error ??
                new Error(
                  'Upload failed'
                )
              );

              return;
            }

            const attachment =
              this.createAttachmentDto(
                file,
                guid,
                attachmentCategoryId,
                parsedResponse.result
              );

            observer.next({
              attachment,
              attachmentType,
              index
            });

            observer.complete();
          } catch (error) {
            observer.error(error);
          }
        };

      uploader.onErrorItem =
        (
          item,
          response,
          status
        ) => {
          observer.error({
            response,
            status
          });
        };

      uploader.addToQueue([
        file
      ]);

      uploader.uploadAll();
    }
  );
}

private createAttachmentUploader():
  FileUploader {

  const uploader =
    new FileUploader({
      url:
        AppConsts
          .remoteServiceBaseUrl +
        '/Attachment/UploadFiles'
    });

  uploader.onAfterAddingFile =
    fileItem => {
      fileItem.withCredentials =
        false;
    };

  const options:
    Partial<
      FileUploaderOptions
    > = {

    authToken:
      'Bearer ' +
      this._tokenService
        .getToken(),

    removeAfterUpload: true
  };

  uploader.setOptions(
    options as
      FileUploaderOptions
  );

  return uploader;
}

private createAttachmentDto(
  file: File,
  guid: string,
  attachmentCategoryId: number,
  uploadResult: any
): AppEntityAttachmentDto {

  const attachment =
    new AppEntityAttachmentDto();

  const result =
    uploadResult ?? {};

  attachment.init({
    id: undefined,

    guid:
      result.guid ??
      guid,

    fileName:
      result.fileName ??
      file.name,

    url:
      result.url ??
      result.fileName ??
      file.name,

    attachmentCategoryId,

    index: undefined
  });

  return attachment;
}
private applyUploadedAttachments(
  uploaded:
    UploadedAttachmentResult[]
): void {

  this.accountDto
    .entityAttachments ??= [];

  uploaded.forEach(result => {

    const categoryId =
      result.attachment
        .attachmentCategoryId;
    if (
      result.attachmentType ===
        'LOGO' ||
      result.attachmentType ===
        'BANNER'
    ) {
      this.accountDto
        .entityAttachments =
        this.accountDto
          .entityAttachments
          .filter(item =>
            Number(
              item
                .attachmentCategoryId
            ) !==
            Number(categoryId)
          );
    }


    if (
      result.attachmentType ===
        'IMAGE' &&
      result.index !== undefined
    ) {
      const existingImages =
        this.accountDto
          .entityAttachments
          .filter(item =>
            Number(
              item
                .attachmentCategoryId
            ) ===
            Number(
              this.imageAttachmentCategory
                ?.id
            )
          );

      const existingAtIndex =
        existingImages[
          result.index
        ];

      if (existingAtIndex) {
        this.accountDto
          .entityAttachments =
          this.accountDto
            .entityAttachments
            .filter(item =>
              item !==
              existingAtIndex
            );
      }
    }

    this.accountDto
      .entityAttachments
      .push(result.attachment);
  });

  this.accountData.account =
    this.accountDto;
}

private clearPendingFiles():
  void {

  this.pendingLogoFile = null;

  this.pendingBackgroundFile =
    null;

  this.pendingImageFiles = [
    null,
    null,
    null,
    null
  ];
}
private prepareDtoBeforeSave(): void {
  this.initializeDtoArrays();

  if (this.accountData?.account) {
    this.accountDto =
      this.accountData.account;
  }

  this.accountDto.entityExtraData =
    this.accountData?.entityExtraData ??
    this.accountDto.entityExtraData ??
    [];

  this.accountDto.entityExtraData =
    this.accountDto.entityExtraData.map(
      item => {

        if (
          Array.isArray(
            item.attributeValue
          )
        ) {
          item.attributeValue =
            item.attributeValue.join('-');
        }


        if (
          item.entityid === null ||
          item.entityid === undefined
        ) {
          item.entityid =
            this.accountDto.id ?? 0;
        }

        return item;
      }
    );

  if (
    this.entityMode === 'edit' &&
    this.accountId
  ) {
    this.accountDto.id =
      this.accountDto.id ??
      this.accountId;
  }

  if (
    this.entityMode === 'create'
  ) {
    this.accountDto.id =
      undefined;

    this.accountDto.accountId =
      undefined;
  }

  this.accountDto.returnId = true;

  this.accountData.account =
    this.accountDto;

  this.accountData.entityExtraData =
    this.accountDto.entityExtraData;
}

private validateAccount(): boolean {
  if (
    !this.accountDto.name?.trim()
  ) {
    this.notify.warn(
      this.l('NameIsRequired')
    );

    return false;
  }

  if (
    !this.accountDto.accountTypeId
  ) {
    this.notify.warn(
      this.l('AccountTypeIsRequired')
    );

    return false;
  }

  return true;
}

private cloneValue(value: any): any {
  return JSON.parse(
    JSON.stringify(value)
  );
}
logoAttachmentCategory:
  SycAttachmentCategoryDto;

bannerAttachmentCategory:
  SycAttachmentCategoryDto;

imageAttachmentCategory:
  SycAttachmentCategoryDto;

loadingAttachmentCategories = false;

private loadAttachmentCategories(): void {
  if (this.loadingAttachmentCategories) {
    return;
  }

  if (
    this.logoAttachmentCategory &&
    this.bannerAttachmentCategory &&
    this.imageAttachmentCategory
  ) {
    return;
  }

  this.loadingAttachmentCategories = true;

  this.getSycAttachmentCategoriesByCodes([
    'LOGO',
    'BANNER',
    'IMAGE'
  ])
    .pipe(
      finalize(() => {
        this.loadingAttachmentCategories = false;
      })
    )
    .subscribe({
      next: result => {
        const categories =
          result ?? [];

        this.logoAttachmentCategory =
          categories.find(
            item => item.code === 'LOGO'
          );

        this.bannerAttachmentCategory =
          categories.find(
            item => item.code === 'BANNER'
          );

        this.imageAttachmentCategory =
          categories.find(
            item => item.code === 'IMAGE'
          );

      },
    
    });
}


}


interface UploadedAttachmentResult {
  attachment:
    AppEntityAttachmentDto;

  attachmentType:
    'LOGO' |
    'BANNER' |
    'IMAGE';

  index?: number;
}