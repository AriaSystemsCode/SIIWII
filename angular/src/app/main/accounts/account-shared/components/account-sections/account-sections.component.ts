import {
  Component,
  Injector,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';

import { AppComponentBase } from '@shared/common/app-component-base';
import {
  AccountsServiceProxy,
  AppEntitiesServiceProxy,
  CurrencyInfoDto,
  LookupLabelDto
} from '@shared/service-proxies/service-proxies';

type EntityMode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-account-sections',
  templateUrl: './account-sections.component.html',
  styleUrls: ['./account-sections.component.scss']
})
export class AccountSectionsComponent
  extends AppComponentBase
  implements OnInit, OnChanges {

  @Input() accountId: number;
  @Input() entityData: any;
  @Input() mode: EntityMode = 'view';

  account: any = {};
  mainBranch: any = {};

  allLanguages: LookupLabelDto[] = [];
  allCurrencies: CurrencyInfoDto[] = [];
  allPhoneTypes: LookupLabelDto[] = [];

  private loadedAccountId: number | null = null;

  constructor(
    injector: Injector,
    private _accountsServiceProxy: AccountsServiceProxy,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy,
  ) {
    super(injector);
  }

  ngOnInit(): void {
  this.loadLookups();

  if (this.accountId) {
    this.getAccountDataForView();
  } else if (this.entityData?.account) {
    this.setAccountData(this.entityData);
  }
}
 ngOnChanges(changes: SimpleChanges): void {
  if (
    changes.accountId &&
    this.accountId &&
    changes.accountId.currentValue !== changes.accountId.previousValue
  ) {
    this.getAccountDataForView();
    return;
  }

  if (changes.entityData?.currentValue?.account && !this.accountId) {
    this.setAccountData(changes.entityData.currentValue);
  }
}

  private setAccountData(data: any): void {
    this.entityData = data;

    this.account = data?.account ?? {};

    this.mainBranch =
      this.account?.branches?.[0]?.data?.branch ??
      this.createEmptyMainBranch();

    this.loadedAccountId = this.account?.id ?? this.accountId ?? null;
  }

  private createEmptyMainBranch(): any {
    return {
      tradeName: '',

      languageId: null,
      languageName: '',

      currencyId: null,
      currencyName: '',

      phone1TypeId: null,
      phone1TypeName: '',
      phone1Number: '',
      phone1Ext: '',

      phone2TypeId: null,
      phone2TypeName: '',
      phone2Number: '',
      phone2Ext: '',

      phone3TypeId: null,
      phone3TypeName: '',
      phone3Number: '',
      phone3Ext: ''
    };
  }

  getAccountDataForView(): void {
    if (!this.accountId) {
      return;
    }
    this.showMainSpinner()


    this._accountsServiceProxy
      .getAccountForView(this.accountId, 5)
      .subscribe({
        next: result => {
          this.setAccountData(result);
          this.hideMainSpinner()
        },
        error: error => {
          this.loadedAccountId = null;
          console.error('Failed to load account data:', error);
        }
      });
  }

  private loadLookups(): void {
    this.getLanguages();
    this.getCurrencies();
    this.getPhoneTypes();
  }

    getPhoneTypes() {
        this._AppEntitiesServiceProxy.getAllPhoneTypeForTableDropdown().subscribe(result => {
            this.allPhoneTypes = result;


        });
    }

    getLanguages() {
        this._AppEntitiesServiceProxy.getAllLanguageForTableDropdown().subscribe(result => {
            this.allLanguages = result;
        });
    }

    getCurrencies() {
        this._AppEntitiesServiceProxy.getAllCurrencyForTableDropdown().subscribe(result => {
            this.allCurrencies = result;
        });
    }


  get isViewMode(): boolean {
    return this.mode === 'view';
  }

  get rolesEntityObjectTypeId(): number | null {
    const roleExtraData = this.entityData?.entityExtraData?.find(
      item => item.attributeCode === 'MARKETPLACE-ROLE'
    );

    return roleExtraData?.entityObjectTypeId ?? null;
  }
}