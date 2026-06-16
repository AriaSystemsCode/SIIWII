import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-account-sections',
  templateUrl: './account-sections.component.html',
  styleUrls: ['./account-sections.component.scss']
})
export class AccountSectionsComponent {
@Input() accountId: number;
@Input() mode: 'create' | 'edit' | 'view';
}
