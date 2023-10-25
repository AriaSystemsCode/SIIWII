import { registerLocaleData } from '@angular/common';
import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AccountDto, AccountsServiceProxy, ComboboxItemDto, CreateAccountsInputDto, LookupAccountOrTenantDto, NameValueOfString, SelectItemDto, SourceAccountEnum, SubscriptionStartType, TargetAccountEnum, TenantRegistrationServiceProxy } from '@shared/service-proxies/service-proxies';
import { SelectItem } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { RegisterTenantComponent } from './register-tenant.component';

@Component({
  selector: 'app-merge-convert-accounts-tool',
  templateUrl: './merge-convert-accounts-tool.component.html',
  styleUrls: ['./merge-convert-accounts-tool.component.scss']
})
export class MergeConvertAccountsToolComponent extends AppComponentBase implements OnInit {

  constructor(injector: Injector,
    private _AccountsServiceProxy: AccountsServiceProxy
  ) {
    super(injector);
  }

  createAccountsInputDto: CreateAccountsInputDto = new CreateAccountsInputDto();
  sourceAccountEnum = SourceAccountEnum;
  sourceAccountTypes: SelectItem[];
  targetAccountEnum = TargetAccountEnum;
  destinationAccountTypes: SelectItem[];
  newDestinantionAccount;
  disableNewDestinantionAccount: boolean = false;
  sourceTenant: SelectItem = null;
  destinationAccount: SelectItem;
  sourceAccount: SelectItem;
  sourceAccountProfileInfo: AccountDto = new AccountDto();
  destinationAccountInfo: AccountDto = new AccountDto();
  disableSourceTenant: boolean;
  disableSourceAccount: boolean;
  disableDestinationAccount: boolean;
  filteredSourceTenant: NameValueOfString[] = [];
  filteredSourceAccount: NameValueOfString[] = [];
  filteredDestinationAccount: NameValueOfString[] = [];
  disableMergeBtn: boolean = false;
  @ViewChild("registerTenantModal", { static: true })
  registerTenantModal: RegisterTenantComponent;
  showCloseButton:boolean = false

  ngOnInit(): void {
    if (!this.appSession.tenant) {
      this.sourceAccountTypes = this.convertEnumToSelectItems(SourceAccountEnum);
      this.destinationAccountTypes = [{ label: TargetAccountEnum.External.toString(), value: TargetAccountEnum[TargetAccountEnum.External] }, { label: TargetAccountEnum.NewTenant.toString(), value: TargetAccountEnum[TargetAccountEnum.NewTenant] }];
    }

    else {
      var _sourceAccountType: SelectItem = { label: SourceAccountEnum[SourceAccountEnum.Manual], value: SourceAccountEnum.Manual };
      this.sourceAccountTypes = this.convertEnumToSelectItems(_sourceAccountType);
      this.destinationAccountTypes = [{ label: TargetAccountEnum.External.toString(), value: TargetAccountEnum[TargetAccountEnum.External] }, { label: TargetAccountEnum.Manual.toString(), value: TargetAccountEnum[TargetAccountEnum.Manual] }];
    }

    this.sourceAccountTypes = this.sourceAccountTypes.slice(0, this.sourceAccountTypes.length / 2);
    this.disableSourceTenant = true;
    this.disableSourceAccount = true;
    this.disableDestinationAccount = true;
  }

  onChangeSourceAccountType($event) {
    if ($event == "Manual") {
      this.disableSourceTenant = false;
      if (this.appSession.tenant) {
        if (this.createAccountsInputDto?.targetAccountType?.toString() == this.targetAccountEnum[this.targetAccountEnum.Manual]) {
          this.newDestinantionAccount = false;
          this.onchangeNewDestinantionAccount(this.newDestinantionAccount);
          this.disableNewDestinantionAccount = true;
        }
        else
          this.disableNewDestinantionAccount = false;

        this.disableSourceAccount = false;
        var _sourceTenant: SelectItem = { label: this.appSession.tenantId.toString(), value: this.appSession.tenantId };
        this.onChangeSourceTenant(_sourceTenant);
      }
      else
        this.disableSourceAccount = true;
    }
    else {
      this.disableSourceTenant = true;
      this.disableSourceAccount = false;
      var _sourceTenant: SelectItem = { label: "", value: 0 };
      this.onChangeSourceTenant(_sourceTenant);
    }
    this.resetSourceData();
  }

  filterSourceTenant(event): void {
    this._AccountsServiceProxy.getTenantsWithManualAccounts(event.query, undefined, undefined, undefined)
      .subscribe((tenants) => {
        this.filteredSourceTenant = [];
        for (var i = 0; i < tenants.items.length; i++) {
          this.filteredSourceTenant.push(new NameValueOfString(
            { name: tenants?.items[i]?.displayName, value: tenants?.items[i]?.id?.toString() }
          )
          );
        }
      });
  }

  onChangeSourceTenant($event: SelectItem) {
    this.sourceTenant = $event;
    this.disableSourceAccount = false;
    this.createAccountsInputDto.sourceAccountId = 0;
    this.sourceAccountProfileInfo = new AccountDto();

  }

  resetSourceData() {
    this.resetSourceAccountData(true);
    this.sourceTenant = null;
  }

  resetSourceAccountData(disableSourceAccount: boolean = false) {
    if (disableSourceAccount) {
      if (!this.appSession.tenant && this.createAccountsInputDto.sourceAccountType.toString() == this.sourceAccountEnum[this.sourceAccountEnum.Manual])
        this.disableSourceAccount = true;
    }
    this.createAccountsInputDto.sourceAccountId = 0;
    this.sourceAccount = null;
    this.sourceAccountProfileInfo = new AccountDto();
  }

  filterSourceAccount(event): void {
    var _sourceTenant: SelectItem;
    if (this.appSession.tenant)
      _sourceTenant = { label: this.appSession.tenantId.toString(), value: this.appSession.tenantId };

    else
      _sourceTenant = this.sourceTenant;
    this._AccountsServiceProxy.getAccountByType(this.createAccountsInputDto.sourceAccountType, _sourceTenant?.value, event.query, undefined, undefined, undefined)
      .subscribe((account) => {
        this.filteredSourceAccount = [];
        for (var i = 0; i < account.items.length; i++) {
          this.filteredSourceAccount.push(new NameValueOfString(
            { name: account?.items[i]?.displayName, value: account?.items[i]?.id?.toString() }
          ));
        }
      });
  }


  onChangeSourceAccount($event) {
    this._AccountsServiceProxy.getAccountForView(this.sourceAccount?.value, 0).subscribe((result) => {
      if (result.account) {
        this.sourceAccountProfileInfo = result.account;
      }
      else {
        this.sourceAccountProfileInfo = new AccountDto();
      }
    });
  }

  filterDestinationAccount(event): void {
    var _sourceTenant: SelectItem
    if ((this.createAccountsInputDto.targetAccountType.toString() == this.targetAccountEnum[this.targetAccountEnum.Manual]) && (this.appSession?.tenantId))
      _sourceTenant = { label: this.appSession.tenantId.toString(), value: this.appSession.tenantId };
    else
      _sourceTenant = { label: "", value: 0 };

    var _sourceaccountEnum: SourceAccountEnum;

    switch (this.createAccountsInputDto.targetAccountType.toString()) {
      case this.targetAccountEnum[this.targetAccountEnum.Manual].toString():
        _sourceaccountEnum = this.sourceAccountEnum.Manual;
        break;
      case this.targetAccountEnum[TargetAccountEnum.External].toString():
        _sourceaccountEnum = this.sourceAccountEnum.External;
        break;

      case this.targetAccountEnum[TargetAccountEnum.NewTenant].toString():
        _sourceaccountEnum = null;
        break;
      default:
        break;
    }

    this._AccountsServiceProxy.getAccountByType(_sourceaccountEnum, _sourceTenant?.value, event.query, undefined, undefined, undefined)
      .subscribe((account) => {
        this.filteredDestinationAccount = [];
        for (var i = 0; i < account.items.length; i++) {
          this.filteredDestinationAccount.push(new NameValueOfString(
            { name: account?.items[i]?.displayName, value: account?.items[i]?.id?.toString() }
          ));
        }
      });
  }

  onChangeDestinationAccountType($event) {
    if (this.appSession.tenant && $event == "Manual" && this.createAccountsInputDto?.sourceAccountType?.toString() == this.sourceAccountEnum[this.sourceAccountEnum.Manual]) {
      this.newDestinantionAccount = false;
      this.onchangeNewDestinantionAccount(this.newDestinantionAccount);
      this.disableNewDestinantionAccount = true;
     this.createAccountsInputDto.targetTenantId=this.appSession.tenantId;
    }
    else
      this.disableNewDestinantionAccount = false;

    if ($event == "Manual" || $event == "External") {
      if (!this.newDestinantionAccount)
        this.disableDestinationAccount = false;
      else
        this.disableDestinationAccount = true;
    }
    else
      this.disableDestinationAccount = true;


    this.resetDestinationData();
  }

  onChangeDestinationAccount($event, afterMerge: boolean = false) {
    this._AccountsServiceProxy.getAccountForView(this.destinationAccount?.value, 0).subscribe((result) => {
      if (result.account) {
        this.destinationAccountInfo = result.account;
        if (afterMerge) {
          this.disableDestinationAccount = false;
          this.destinationAccount = new NameValueOfString({ name: this.destinationAccountInfo.name, value: this.destinationAccountInfo.id.toString() });
        }
      }
      else {
        this.destinationAccountInfo = new AccountDto();
      }
    });
  }

  onchangeNewDestinantionAccount($event) {
    if (!$event && (this.createAccountsInputDto.targetAccountType.toString() == this.targetAccountEnum[this.targetAccountEnum.Manual] || this.createAccountsInputDto.targetAccountType.toString() == this.targetAccountEnum[this.targetAccountEnum.External]))
      this.disableDestinationAccount = false;
    else {
      this.disableDestinationAccount = true;
      this.destinationAccount = null;
      this.destinationAccountInfo = new AccountDto();
    }
  }

  resetDestinationData() {
    this.destinationAccount = null;
    this.destinationAccountInfo = new AccountDto();
  }

  onMerge_Convert() {
    if (this.createAccountsInputDto.targetAccountType.toString() == this.targetAccountEnum[this.targetAccountEnum.NewTenant].toString())
      this.registerTenantModal.show();

    else
      this.merge_Convert();
  }
  merge_Convert() {
    this.disableMergeBtn = true;
    this.showMainSpinner();
    this.createAccountsInputDto.sourceTenantId = this.sourceTenant?.value;
    this.createAccountsInputDto.sourceAccountId = this.sourceAccount?.value;
    this.createAccountsInputDto.targetAccountId = this.destinationAccount?.value;

    this._AccountsServiceProxy.createOrUpdateAccountFromSourceAccount(this.createAccountsInputDto)
      .pipe(finalize(() => { this.hideMainSpinner(); this.disableMergeBtn = false; }))
      .subscribe((result) => {
        this.notify.info(this.l("MergeSuccessful"));
        this.destinationAccount = new NameValueOfString({ name: "", value: result.toString() });
        this.newDestinantionAccount = false;
        this.onChangeDestinationAccount(this.destinationAccount, true);
        this.disableMergeBtn = false;
        this.showCloseButton = true;
      });
  }

  onRegister($event: number) {
    if ($event > 0) {
      this.createAccountsInputDto.targetTenantId = $event;
      this.merge_Convert();
    }
  }
}
