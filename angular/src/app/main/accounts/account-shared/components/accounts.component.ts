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
    AccountDto,
    GetAccountForViewDto,
    TreeNodeOfGetSycEntityObjectCategoryForViewDto,
    TreeNodeOfGetSycEntityObjectClassificationForViewDto,
    EmailingTemplateServiceProxy
} from "@shared/service-proxies/service-proxies";
import { AbpSessionService } from "abp-ng2-module";
import { AppComponentBase } from "@shared/common/app-component-base";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { Table } from "primeng/table";
import { Paginator } from "primeng/paginator";
import { LazyLoadEvent, SelectItem } from "primeng/public_api";
import * as _ from "lodash";
import { SendMailModalComponent } from "@app/shared/common/Mail/sendMail-modal.component";
import { debounceTime, finalize } from "rxjs/operators";
import { MainImportComponent } from "../../../../../shared/components/import-steps/components/mainImport.component";
import { AccountMainFilterEnum } from "../models/accounts-main-filter.enum";
import { AbstractControl, FormBuilder, FormGroup } from "@angular/forms";
import { AppConsts } from "@shared/AppConsts";
import { Observable, observable } from "rxjs";
import { ImportTypes } from "@shared/components/import-steps/models/ImportTypes";
import { AccountsImport } from "@shared/components/import-steps/services/accountsImport.service";
import { ImportStepInfo } from "@shared/components/import-steps/models/ImportStepInfo";
import { MainImportService } from "@shared/components/import-steps/services/mainImport.service";

@Component({
    selector: "app-accounts",
    templateUrl: "./accounts.component.html",
    styleUrls: ["./accounts.component.scss"],
    animations: [appModuleAnimation()],
})
export class AccountsComponent
    extends AppComponentBase
    implements OnInit, OnChanges
{
    singleItemPerRowMode: boolean = false;

    showConfirm: boolean = false;
    selectedItemId: number;
    selectedIndex: number;

    _entityTypeFullName = "onetouch.AppItems.AppItem";
    entityHistoryEnabled = false;

    accounts: GetAccountForViewDto[] = [];
    sortingOptions: SelectItem[];

    active: boolean = false;
    loading: boolean = false;
    @Input() defaultMainFilter: AccountMainFilterEnum;
    @Input() showMainFiltersOptions;
    @Input() showAddButton;

    @Input() pageMainFilters: SelectItem[] = [];

    @ViewChild("sendMailModal", { static: true })
    sendMailModal: SendMailModalComponent;

    @ViewChild("dataTable", { static: true }) dataTable: Table;
    @ViewChild("paginator", { static: true }) paginator: Paginator;

    @ViewChild("ImportAccountsModal", { static: true })
    ImportAccountsModal: MainImportComponent;
    mailHeader: string;
    mailsubject: string;
    mailbody: string;
    filterForm: FormGroup;
    get mainFilterCtrl(): AbstractControl {
        return this.filterForm?.get("mainFilterType");
    }
    get sortingCtrl(): AbstractControl {
        return this.filterForm?.get("sorting");
    }

    constructor(
        injector: Injector,
        private _accountsServiceProxy: AccountsServiceProxy,
        private _importService: MainImportService,
        private _abpSessionService: AbpSessionService,
        private _formBuilder: FormBuilder,
        private _emailingTemplateAppService: EmailingTemplateServiceProxy
    ) {
        super(injector);
        this.overridePrimeTableSetting();
    }
    isHost: boolean;
    ngOnInit() {
        this.isHost = !this._abpSessionService.tenantId;
        this.defineSortingOptions();
        this.getUserPreferenceForListView();
        this.initFilterForm();
    }
    ngOnChanges(changes: SimpleChanges) {
        if (changes.defaultMainFilter.firstChange) {
            this.initFilterForm();
            this.setMainPageFilter(this.defaultMainFilter);
            this.getAccounts({
                rows: this.primengTableHelper.defaultRecordsCountPerPage,
            });
            this.applyFiltersOnChange();
        }
    }
    setMainPageFilter(filter: AccountMainFilterEnum) {
        const selectedfilter = this.pageMainFilters.filter(
            (item) => filter == item.value
        )[0];
        if (!selectedfilter) return;
        this.mainFilterCtrl.setValue(selectedfilter);
    }
    overridePrimeTableSetting(countPerPage: number = 30) {
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
        const value = String(Number(this.singleItemPerRowMode));
        localStorage.setItem(key, value);
    }
    getUserPreferenceForListView() {
        const key = "account-list-view-mode";
        const value = localStorage.getItem(key);
        if (value) this.singleItemPerRowMode = Boolean(Number(value));
    }
    triggerListView() {
        this.singleItemPerRowMode = !this.singleItemPerRowMode;
        this.saveUserPreferenceForListView();
    }

    defineSortingOptions() {
        this.sortingOptions = [
            { label: this.l("Name"), value: "name" },
            { label: this.l("AccountType"), value: "accountType" },
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

        this.primengTableHelper.showLoadingIndicator();
        this.showMainSpinner();
        this.loading = true;
        this._accountsServiceProxy
            .getAll(
                filters.search || undefined,
                filters?.mainFilterType?.value || undefined,
                undefined,
                undefined,
                filters.city || undefined,
                filters.state || undefined,
                filters.postalCode || undefined,
                filters.accountTypes || undefined,
                filters.statuses || undefined,
                filters.languages || undefined,
                filters.countries || undefined,
                filters.classifications || undefined,
                filters.categories || undefined,
                filters.currencies || undefined,
                filters?.sorting?.value || undefined,
                this.primengTableHelper.getSkipCount(this.paginator, event),
                this.primengTableHelper.getMaxResultCount(this.paginator, event)
            )
            .pipe(
                finalize(() => {
                    this.primengTableHelper.hideLoadingIndicator();
                    if (!this.active) this.active = true;
                    this.loading = false;
                    this.hideMainSpinner();
                })
            )
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


    exportToExcel(): void {
        // this._accountsServiceProxy.getAccountsToExcel(
        // this.filterText,
        //     this.appEntityNameFilter,
        // )
        // .subscribe(result => {
        //     this._fileDownloadService.downloadTempFile(result);
        //  });
    }

    showImportAccounts() {
        let importService=AccountsServiceProxy;
        let serviceUtilites=AccountsImport;
        let importStepsInfo:ImportStepInfo[];
        importStepsInfo= this._importService.getOriginalImportSteps();
       
        this.ImportAccountsModal.show(ImportTypes.Accounts,importService,serviceUtilites,['LOGO',"BANNER","IMAGE"],true,importStepsInfo);
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
}
