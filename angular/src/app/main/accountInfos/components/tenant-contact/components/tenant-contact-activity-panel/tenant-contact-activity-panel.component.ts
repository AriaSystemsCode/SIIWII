import { Component, Input } from '@angular/core';

type ActivityTab = 'audit' | 'message' | 'relations';

@Component({
  selector: 'app-tenant-contact-activity-panel',
  templateUrl: './tenant-contact-activity-panel.component.html',
  styleUrls: ['./tenant-contact-activity-panel.component.scss']
})
export class TenantContactActivityPanelComponent {
  @Input() accountId?: number;
  @Input() accountName?: string;

  activeTab: ActivityTab = 'audit';

  setTab(tab: ActivityTab): void {
    this.activeTab = tab;
  }
}