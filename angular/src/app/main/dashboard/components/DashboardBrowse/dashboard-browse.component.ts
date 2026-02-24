import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@node_modules/@angular/router';
import { AppPostsServiceProxy, GetMessagesForViewDto } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-dashboard-browse.component',
    templateUrl: './dashboard-browse.component.html',
    styleUrls: ['./dashboard-browse.component.scss']
})
export class DashboardBrowseComponent  {
    @ViewChild('sharePanel') sharePanel;

    defaultAvatar = 'assets/common/images/default-profile-picture.png';
    shareUsers: any[] = [];
  
    dashboards: any[] = [
      {
        id: 1,
        name: 'Sales Performance Dashboard',
        dateViewed: new Date('2025-01-10'),
        dateUpdated: new Date('2025-01-24'),
        owner: { id: 101, displayName: 'Menna', avatarUrl: null },
        sharedWith: [
          { id: 1, displayName: 'Amr', avatarUrl: null },
          { id: 2, displayName: 'Mary', avatarUrl: null },
          { id: 3, displayName: 'Ali', avatarUrl: null },
          { id: 4, displayName: 'Sarah', avatarUrl: null },
        ],
      },
      {
        id: 2,
        name: 'Marketplace KPIs',
        dateViewed: null,
        dateUpdated: new Date('2025-01-13'),
        owner: { id: 102, displayName: 'SIMMI', avatarUrl: null },
        sharedWith: [{ id: 5, displayName: 'Anue Miami', avatarUrl: null }],
      },
    ];
  
    constructor(private router: Router) {}
  
    openDashboard(row: any) {
      this.router.navigate(['/app/main/dashboard/view', row.id]);
    }
  
    createNew() {

      this.router.navigate(['/app/main/dashboard/create']);
    }
  
    showShare(event: MouseEvent, row: any) {
      this.shareUsers = row?.sharedWith ?? [];
      this.sharePanel.show(event);
    }
  
    hideShare() {
      this.sharePanel.hide();
    }
  
    onAvatarErr(evt: Event) {
      (evt.target as HTMLImageElement).src = this.defaultAvatar;
    }


    onGlobalSearch(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        // this.loadDashboards(value); // call API with search param
      }
  
    
}
