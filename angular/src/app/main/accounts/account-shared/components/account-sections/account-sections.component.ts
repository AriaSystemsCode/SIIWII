import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-account-sections',
  templateUrl: './account-sections.component.html',
  styleUrls: ['./account-sections.component.scss']
})
export class AccountSectionsComponent implements OnChanges {
  @Input() accountId: number;
  @Input() entityData: any;
  @Input() mode: 'create' | 'edit' | 'view' = 'view';

  account: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.entityData && this.entityData?.account) {
      this.account = this.entityData.account;
      return;
    }

    if (changes.accountId && this.accountId && !this.account) {
      this.loadAccount();
    }
  }

  loadAccount(): void {
    this.account = {
      id: this.accountId,
      name: '',
      eMailAddress: '',
      currencyCode: '',
      phone1Number: ''
    };
  }
}