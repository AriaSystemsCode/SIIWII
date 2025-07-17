import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
  PasswordComplexitySetting,
  RegisterTenantOutput,
  SubscriptionStartType,
  TenantRegistrationServiceProxy
} from '@shared/service-proxies/service-proxies';
import { RegisterTenantModel } from '@account/register/register-tenant.model';
import { Patterns } from '@shared/utils/patterns/pattern';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AppConsts } from '@shared/AppConsts';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-register-tenant',
  templateUrl: './register-tenant.component.html',
  styleUrls: ['./register-tenant.component.scss']
})
export class RegisterTenantComponent extends AppComponentBase implements OnInit {
  @ViewChild('registerTenantModal', { static: true }) modal: ModalDirective;
  @Output() register = new EventEmitter<number>();

  model: RegisterTenantModel = new RegisterTenantModel();
  passwordComplexitySetting: PasswordComplexitySetting = new PasswordComplexitySetting();
  recaptchaSiteKey = AppConsts.recaptchaSiteKey;

  accountTypes: SelectItem[] = [];
  accountType: string;
  accountTypeLabel = '';

  registerTenantId = 0;
  domainPattern = Patterns.domainName;
  saving = false;

  constructor(
    injector: Injector,
    private _tenantRegistrationService: TenantRegistrationServiceProxy
  ) {
    super(injector);
  }

  ngOnInit(): void {}

  show(): void {
    this.showMainSpinner();
    this.model = new RegisterTenantModel();

    this._tenantRegistrationService.getEditionsForSelect()
      .pipe(finalize(() => this.hideMainSpinner()))
      .subscribe(result => {
        const editions = result?.editionsWithFeatures ?? [];

        if (editions.length) {
          const standardEdition = editions.find(x => x.edition.name.toUpperCase() === 'STANDARD');
          if (standardEdition) {
            this.model.editionId = standardEdition.edition.id;
            this.model.edition = standardEdition.edition;
            this.model.subscriptionStartType = SubscriptionStartType.Free;
          }

          this.accountTypes = editions.map(item => ({
            label: item.edition.displayName,
            value: item.edition.id
          }));
        }

        this.modal.show();
      });
  }

  hide(): void {
    this.register.emit(this.registerTenantId);
    this.modal.hide();
  }

  save(): void {
    this.saving = true;
    this.model.editionId = Number(this.accountType);
    this.model.accountType = this.accountType;

    this._tenantRegistrationService.registerTenant(this.model)
      .pipe(finalize(() => this.saving = false))
      .subscribe((result: RegisterTenantOutput) => {
        this.registerTenantId = result.tenantId;
        this.notify.success(this.l('SuccessfullyRegistered'));
        this.hide();
      });
  }

  changeAccountType(event: any): void {
    const selected = this.accountTypes.find(x => x.value === event.value);
    this.accountTypeLabel = selected ? selected.label.toUpperCase() : '';
  }
}
