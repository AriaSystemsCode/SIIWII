import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { Router } from '@node_modules/@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import {
  CreateDashboardModalComponent,
  CreatedDashboardResult
} from '../create-dashboard-modal/create-dashboard-modal.component';
import {
  AppDashboardsServiceProxy,
  GetDashboardForViewDto
} from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';
import { AppConsts } from '@shared/AppConsts';

@Component({
  selector: 'app-dashboard-browse.component',
  templateUrl: './dashboard-browse.component.html',
  styleUrls: ['./dashboard-browse.component.scss']
})
export class DashboardBrowseComponent extends AppComponentBase implements OnInit {
  @ViewChild('sharePanel') sharePanel: any;
  @ViewChild('paginator', { static: true }) paginator: Paginator;
  @ViewChild('dataTable', { static: true }) dataTable: Table;
  @ViewChild('createDashboardModal') createDashboardModal!: CreateDashboardModalComponent;

  defaultAvatar = 'assets/common/images/default-profile-picture.png';
  shareUsers: any[] = [];
  dashboards: GetDashboardForViewDto[] = [];
  primengTableHelper = new PrimengTableHelper();

  filterText = '';
  sorting = '';
  skipCount = 0;
  maxResultCount = 10;



  dashboardFilterOptions = [
  { label: 'My Dashboards', value: 'my' },
  { label: 'Private', value: 'private' },
  { label: 'Shared', value: 'shared' }
];

selectedDashboardFilter = this.dashboardFilterOptions[0]; // default

  constructor(
    injector: Injector,
    private router: Router,
    public appDashboardsAppService: AppDashboardsServiceProxy
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.maxResultCount = this.primengTableHelper.defaultRecordsCountPerPage || 10;
    this.getDashboards();
  }


selectFilter(option: any) {
  this.selectedDashboardFilter = option;

  this.onDashboardFilterChange(option.value);
}

onDashboardFilterChange(value: string): void {
  // reset paging
  this.skipCount = 0;

  switch (value) {
    case 'my':
    
      break;

    case 'private':
    
      break;

    case 'shared':
   
      break;
  }

  this.reloadFromFirstPage();
}


  openDashboard(row: any): void {
    if (!row?.id) {
      return;
    }

    this.router.navigate(['/app/main/dashboards/dashboard-details', row.id]);
  }

  createNew(): void {
    this.createDashboardModal.show();
  }

  showShare(event: MouseEvent, row: any): void {
    this.shareUsers = row?.appEntitySharings ?? [];
    this.sharePanel.show(event);
  }

  hideShare(): void {
    this.sharePanel.hide();
  }

  onAvatarErr(evt: Event): void {
    (evt.target as HTMLImageElement).src = this.defaultAvatar;
  }

  onGlobalSearch(event: Event): void {
    this.filterText = (event.target as HTMLInputElement).value?.trim() || '';
    this.skipCount = 0;
    this.reloadFromFirstPage();
  }

  reloadFromFirstPage(): void {
    if (this.paginator) {
      const currentPage = this.paginator.getPage ? this.paginator.getPage() : 0;

      if (currentPage !== 0) {
        this.paginator.changePage(0);
      } else {
        this.getDashboards();
      }
    } else {
      this.getDashboards();
    }
  }

  onPageChange(event: any): void {
    this.skipCount = event?.first ?? 0;
    this.maxResultCount =
      event?.rows ?? this.primengTableHelper.defaultRecordsCountPerPage ?? 10;

    this.getDashboards();
  }

  getDashboards(): void {
    const validMaxResultCount =
      this.maxResultCount && this.maxResultCount > 0
        ? this.maxResultCount
        : this.primengTableHelper.defaultRecordsCountPerPage || 10;

    this.showMainSpinner();

    const subs = this.appDashboardsAppService
      .getAll(
        this.filterText || null,
        this.sorting || null,
        this.skipCount || 0,
        validMaxResultCount
      )
      .pipe(
        finalize(() => {
          this.hideMainSpinner();
        })
      )
      .subscribe({
        next: (result) => {
          this.dashboards = result?.items || [];
          this.primengTableHelper.records = result?.items || [];
          this.primengTableHelper.totalRecordsCount = result?.totalCount || 0;
        },
        error: (err) => {
          console.error('Get dashboards error:', err);
        }
      });

    this.subscriptions.push(subs);
  }

  onDashboardCreated(res: CreatedDashboardResult): void {
    this.skipCount = 0;

    if (this.paginator) {
      const currentPage = this.paginator.getPage ? this.paginator.getPage() : 0;

      if (currentPage !== 0) {
        this.paginator.changePage(0);
      } else {
        this.getDashboards();
      }

      return;
    }

    this.getDashboards();
  }

  getUserImage(profilePictureId?: string | null): string {
    if (!profilePictureId) {
      return this.defaultAvatar;
    }

    /**
     * Replace this endpoint if your backend uses another URL.
     * Example only:
     */
    return (
      AppConsts.remoteServiceBaseUrl +
      '/Profile/GetProfilePictureById?id=' +
      encodeURIComponent(profilePictureId)
    );
  }

  getSharedUsers(row: any): any[] {
    return row?.appEntitySharings ?? [];
  }

  getSharedUsersCount(row: any): number {
    return row?.appEntitySharings?.length ?? 0;
  }
}