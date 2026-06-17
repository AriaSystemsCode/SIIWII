import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-account-sections',
  templateUrl: './account-sections.component.html',
  styleUrls: ['./account-sections.component.scss']
})
export class AccountSectionsComponent implements OnChanges {
  @Input() accountId: number;
  @Input() mode: 'create' | 'edit' | 'view' = 'view';

  account: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.accountId && this.accountId) {
      this.loadAccount();
    }
  }

  loadAccount(): void {
    // TEMP example until API integration
    this.account = {
      id: this.accountId,
      name: 'Zara Clothing',
      email: 'zara@gmail.com',
      language: 'English',
      currency: 'USD',
      phone: '156889453'
    };
  }
}