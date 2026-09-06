import { Component } from '@angular/core';

export interface AuditTrailItem {
  id: number;
  userName: string;
  action: string;
  entityName: string;
  date: Date;
}

@Component({
  selector: 'app-audit-trail',
  templateUrl: './audit-trail.component.html',
  styleUrls: ['./audit-trail.component.scss']
})
export class AuditTrailComponent {

  loading = false;

  hasMore = true;

  items: AuditTrailItem[] = [
    {
      id: 1,
      userName: 'lucia',
      action: 'edit',
      entityName: 'Zara Clothes',
      date: new Date(2026, 2, 21, 19, 0)
    },
    {
      id: 2,
      userName: 'lucia',
      action: 'edit',
      entityName: 'Zara Clothes',
      date: new Date(2026, 2, 21, 19, 0)
    },
    {
      id: 3,
      userName: 'lucia',
      action: 'edit',
      entityName: 'Zara Clothes',
      date: new Date(2026, 2, 21, 19, 0)
    },
    {
      id: 4,
      userName: 'lucia',
      action: 'edit',
      entityName: 'Zara Clothes',
      date: new Date(2026, 2, 21, 19, 0)
    },
    {
      id: 5,
      userName: 'lucia',
      action: 'edit',
      entityName: 'Zara Clothes',
      date: new Date(2026, 2, 20, 19, 0)
    }
  ];

  onShowMore(): void {
    console.log('Show more clicked');

    this.items = [
      ...this.items,

      {
        id: 6,
        userName: 'John Smith',
        action: 'created',
        entityName: 'Zara Clothes',
        date: new Date(2026, 2, 20, 16, 30)
      },

      {
        id: 7,
        userName: 'Menna Ramadan',
        action: 'updated',
        entityName: 'Zara Clothes',
        date: new Date(2026, 2, 19, 14, 15)
      }
    ];

    // Test hiding Show more after loading more records
    this.hasMore = false;
  }

  trackById(
    index: number,
    item: AuditTrailItem
  ): number {
    return item.id;
  }
}