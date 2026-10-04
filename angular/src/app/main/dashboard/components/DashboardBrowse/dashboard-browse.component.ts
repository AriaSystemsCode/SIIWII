import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { SavedSpreadsheet } from '../../models/dashboard.model';
import { AppDashboardServiceProxy, GetDashboardForViewDto, UserInformationDto } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';
import { AppConsts } from '@shared/AppConsts';
@Component({
    selector: 'app-dashboard-browse.component',
    templateUrl: './dashboard-browse.component.html',
    styleUrls: ['./dashboard-browse.component.scss']
})
export class DashboardBrowseComponent
    extends AppComponentBase
    implements OnInit {

    @ViewChild('sharePanel') sharePanel: any;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('dataTable', { static: true }) dataTable: Table;

    defaultAvatar = 'assets/common/images/default-profile-picture.png';

    shareUsers: UserInformationDto[] = [];
    dashboards: GetDashboardForViewDto[] = [];
    primengTableHelper = new PrimengTableHelper();

    filterText = '';
    sorting = '';
    skipCount = 0;
    maxResultCount = 10;

    editingDashboardId: number | null = null;
    editingDashboardName = '';

    creatingNewDashboard = false;
    newDashboardName = '';
    dashboardFilterOptions = [
        {
            label: 'AllDashboards',
            value: 0
        },
        {
            label: 'MyDashboards',
            value: 1
        },
        {
            label: 'SharedWithMe',
            value: 2
        }
    ];

    selectedDashboardFilter = this.dashboardFilterOptions[0];

    profilePicture: string = '';

    profilePictureMap: {
        [key: string]: string
    } = {};


    attachmentBaseUrl: string = AppConsts.attachmentBaseUrl
    isSmallScreen = false;

    constructor(
        injector: Injector,
        private router: Router,
        public appDashboardsAppService: AppDashboardServiceProxy,

    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.maxResultCount = this.primengTableHelper.defaultRecordsCountPerPage || 10;
        this.getDashboards();
        this.checkScreenSize();
        window.addEventListener('resize', this.checkScreenSize.bind(this));

    }
    checkScreenSize(): void {
        this.isSmallScreen = window.innerWidth <= 1023;
    }

    selectFilter(option: any): void {
        this.selectedDashboardFilter = option;
        this.getDashboards();
    }


    onGlobalSearch(event: Event): void {
        this.filterText = (event.target as HTMLInputElement).value?.trim() || '';
        this.skipCount = 0;
        this.reloadFromFirstPage();
    }

    openDashboard(row: any): void {
        // this.appDashboardsAppService.updateViewDate(row.id).subscribe(result => { });
        this.router.navigate(['/app/main/dashboards/dashboard-details', row.id]);
    }


    openSpreadsheet(row: any): void {
        this.router.navigate(
            [
                '/app/main/dashboards/dashboard-edit', row.id
            ],
          
        );
    }
    createNew(): void {
        this.cancelRename();
        this.creatingNewDashboard = true;
        this.newDashboardName = '';
    }

    cancelCreate(): void {
        this.creatingNewDashboard = false;
        this.newDashboardName = '';
    }

    saveNewDashboard(): void {
        const name = this.newDashboardName?.trim();
        const newDashboard: any = {
            title: name,
        }
        this.showMainSpinner()
        this.appDashboardsAppService
            .createOrEdit(newDashboard).pipe(
                finalize(() => {
                    this.hideMainSpinner()
                    this.reloadFromFirstPage();

                })
            )
            .subscribe(result => {
                this.cancelCreate();

            });

    }

    // =========================================================
    // Rename Dashboard
    // =========================================================

    startRename(row: any): void {
        this.cancelCreate();
        this.editingDashboardId = row.id;
        this.editingDashboardName = row.title || '';
    }

    cancelRename(): void {
        this.editingDashboardId = null;
        this.editingDashboardName = '';
    }

    saveRename(row: any): void {
        const name = this.editingDashboardName?.trim();
        if (name === row.title) {
            this.cancelRename();
            this.notify.warn(this.l('Already Same Name.'));
            return;
        }

        const editDashboard: any = {
            id: row.id,
            title: name,
        }
        this.appDashboardsAppService.createOrEdit(editDashboard)
            .subscribe(() => {
                row.title = name;
                this.cancelRename();
                this.notify.success(this.l('Dashboard Renamed Successfuly')
                );

            });

    }


    openSharing(row: any): void {

    }

    showShare(event: MouseEvent, row: any): void {
        this.shareUsers = row?.sharedWithUsers ?? [];
        this.sharePanel.show(event);
    }

    hideShare(): void {
        if (this.sharePanel) {
            this.sharePanel.hide();
        }
    }

    deleteDashboard(row: any): void {
        this.message.confirm(
            this.l(''),
            this.l('Are you sure you want to delete ', row.title),
            (
                confirmed: boolean
            ) => {

                if (!confirmed) {
                    return;
                }
                this.appDashboardsAppService.deleteDashboard(row.id)
                    .subscribe(() => {
                        this.notify.success(
                            this.l('SuccessfullyDeleted')
                        );

                        this.reloadFromFirstPage();

                    });

            }
        );
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
        this.maxResultCount = event?.rows ?? this.primengTableHelper.defaultRecordsCountPerPage ?? 10;
        this.getDashboards();
    }

    getDashboards(): void {
        const validMaxResultCount = this.maxResultCount && this.maxResultCount > 0 ? this.maxResultCount : this.primengTableHelper.defaultRecordsCountPerPage || 10;
        this.showMainSpinner();
        const subs = this.appDashboardsAppService
            .getAll(
                this.filterText || null,
                this.selectedDashboardFilter.value,
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
                next: result => {
                    this.dashboards = result?.items || [];
                    this.primengTableHelper.records = result?.items || [];
                    this.primengTableHelper.totalRecordsCount = result?.totalCount || 0;
                    this.dashboards.forEach(
                        row => {
                            this.loadProfilePicture(row?.creatorUserProfilePictureId);
                            row?.appEntitySharings
                                ?.forEach(
                                    u => {
                                        this.loadProfilePicture(u?.userProfilePictureId);
                                    }
                                );
                        }
                    );
                }
            });

        this.subscriptions.push(subs);

    }

    onDashboardCreated(
        res: any
    ): void {

        this.skipCount = 0;

        if (this.paginator) {

            const currentPage =
                this.paginator.getPage
                    ? this.paginator.getPage()
                    : 0;

            if (currentPage !== 0) {

                this.paginator
                    .changePage(0);

            } else {

                this.getDashboards();
            }

            return;
        }

        this.getDashboards();
    }

    // =========================================================
    // Profile Pictures
    // =========================================================

    loadProfilePicture(
        id?: string | null
    ): void {

        /*
        if (
            !id ||
            this.profilePictureMap[id]
        ) {
            return;
        }

        const subs =
            this._postService
                .getProfilePictureAllByID(id)
                .subscribe(data => {

                    if (
                        data?.profilePicture
                    ) {

                        this.profilePictureMap[id] =
                            'data:image/jpeg;base64,' +
                            data.profilePicture;

                    } else {

                        this.profilePictureMap[id] =
                            this.defaultAvatar;
                    }
                });

        this.subscriptions.push(subs);
        */
    }

    getProfilePicture(
        id?: string | null
    ): string {

        if (!id) {
            return this.defaultAvatar;
        }

        return (
            this.profilePictureMap[id] ||
            this.defaultAvatar
        );
    }

    onAvatarErr(evt: Event): void {

        (evt.target as HTMLImageElement).src = this.defaultAvatar;
    }

    getSharedUsers(row: any): any[] {
        return (
            row?.appEntitySharings ??
            []
        );
    }

    getSharedUsersCount(row: any): number {
        return (
            row?.appEntitySharings?.length ?? 0
        );
    }

}