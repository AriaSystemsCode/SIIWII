import { Component, ElementRef, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@node_modules/@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';


@Component({
    selector: 'app-dashboard-browse.component',
    templateUrl: './dashboard-browse.component.html',
    styleUrls: ['./dashboard-browse.component.scss']
})
export class DashboardBrowseComponent  extends AppComponentBase {
    @ViewChild('sharePanel') sharePanel;

    defaultAvatar = 'assets/common/images/default-profile-picture.png';
    shareUsers: any[] = [];
    primengTableHelper = new PrimengTableHelper();
    @ViewChild('paginator', { static: true }) paginator: Paginator;
@ViewChild('dataTable', { static: true }) dataTable: Table;
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
  
    constructor( injector: Injector, private router: Router) {
      super(injector);
    }
  
    openDashboard(row: any) {
      this.router.navigate(['/app/main/dashboards/dashboard-details', row.id]);
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

      getDashboards(event?: LazyLoadEvent) {

        if (this.primengTableHelper.shouldResetPaging(event)) {
          this.paginator.changePage(0);
          return;
        }
      
        this.primengTableHelper.showLoadingIndicator();
      
        const skipCount = this.primengTableHelper.getSkipCount(this.paginator, event);
        const maxResultCount = this.primengTableHelper.getMaxResultCount(this.paginator, event);
      
        // Temporary local pagination (replace with API later)
        const allDashboards = this.dashboards;
        const paged = allDashboards.slice(skipCount, skipCount + maxResultCount);
      
        this.primengTableHelper.records = paged;
        this.primengTableHelper.totalRecordsCount = allDashboards.length;
      
        this.primengTableHelper.hideLoadingIndicator();
      }
  
    
}
