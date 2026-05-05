import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tenant-contact-audit-trail',
  templateUrl: './tenant-contact-audit-trail.component.html',
  styleUrls: ['./tenant-contact-audit-trail.component.scss']
})
export class TenantContactAuditTrailComponent {
  @Input() accountId?: number;
  @Input() accountName?: string;

  items = [
    { text: 'Sam Wilson edit Zara Clothes', date: 'Mar 21 at 7:00 pm' },
    { text: 'Sam Wilson edit Zara Clothes', date: 'Mar 21 at 7:00 pm' },
    { text: 'Sam Wilson edit Zara Clothes', date: 'Mar 20 at 7:00 pm' }
  ];
}