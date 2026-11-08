import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { AppDashboardServiceProxy, GetDashboardForViewDto, UserInformationDto } from '@shared/service-proxies/service-proxies';
import { AppConsts } from '@shared/AppConsts';
import { DashboardSharedUser, DashboardShareMode } from '../../models/dashboard.model';
import { Subject, of } from 'rxjs';
import {
    catchError,
    debounceTime,
    distinctUntilChanged,
    finalize,
    map,
    switchMap
} from 'rxjs/operators';


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
    readonly minDashboardNameLength = 9;
    readonly maxDashboardNameLength = 50;
    newDashboardNameTouched = false;
    renameDashboardNameTouched = false;

    isDashboardNameValid(name: string): boolean {
        const length = (name || '').trim().length;
        return length >= this.minDashboardNameLength && length <= this.maxDashboardNameLength;
    }

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
    showShareModal = false;
    selectedDashboard: any = null;
    shareMode: DashboardShareMode = 'all';
    sharedUsers: DashboardSharedUser[] = [];


    newDashboardTitleUsed = false;
    renameDashboardTitleUsed = false;

    checkingNewDashboardTitle = false;
    checkingRenameDashboardTitle = false;

    savingNewDashboard = false;
    savingRename = false;

    private newTitleChanges = new Subject<string>();
    private renameTitleChanges = new Subject<string>();

    originalDashboardTitle = '';

    currentLang: string = ''
    isArabic: boolean = false

    constructor(
        injector: Injector,
        private router: Router,
        public appDashboardsAppService: AppDashboardServiceProxy,

    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
        this.currentLang == 'ar' || this.currentLang == 'ar-EG' ? this.isArabic = true : this.isArabic = false
        this.maxResultCount = this.primengTableHelper.defaultRecordsCountPerPage || 10;
          this.setDashboardTitleValidation();
        this.getDashboards();
        this.checkScreenSize();
        window.addEventListener('resize', this.checkScreenSize.bind(this));

    }

    private setDashboardTitleValidation(): void {

        this.subscriptions.push(
            this.newTitleChanges.pipe(
                debounceTime(400),
                distinctUntilChanged(),
                switchMap(title => {
                    if (!this.isDashboardNameValid(title)) {
                        return of({ title, used: false });
                    }

                    return this.appDashboardsAppService
                        .dashboardTitleUsedBefore(title)
                        .pipe(
                            // Do not allow saving when validation fails.
                            catchError(error => {
                                console.error('Create title validation failed:', error);
                                return of(true);
                            }),
                            map(used => ({ title, used }))
                        );
                })
            ).subscribe(({ title, used }) => {
                if (title !== this.newDashboardName.trim()) {
                    return;
                }

                this.newDashboardTitleUsed = used;
                this.checkingNewDashboardTitle = false;
            })
        );

        this.subscriptions.push(
            this.renameTitleChanges.pipe(
                debounceTime(400),
                distinctUntilChanged(),
                switchMap(title => {
                    if (
                        !this.isDashboardNameValid(title) ||
                        title === this.originalDashboardTitle.trim()
                    ) {
                        return of({ title, used: false });
                    }

                    return this.appDashboardsAppService
                        .dashboardTitleUsedBefore(title)
                        .pipe(
                            catchError(error => {
                                console.error('Rename title validation failed:', error);
                                return of(true);
                            }),
                            map(used => ({ title, used }))
                        );
                })
            ).subscribe(({ title, used }) => {
                if (title !== this.editingDashboardName.trim()) {
                    return;
                }

                this.renameDashboardTitleUsed = used;
                this.checkingRenameDashboardTitle = false;
            })
        );
    }

    onNewDashboardNameChange(value: string): void {
        this.newDashboardNameTouched = true;
        this.newDashboardTitleUsed = false;

        const title = (value || '').trim();

        this.checkingNewDashboardTitle = this.isDashboardNameValid(title);
        this.newTitleChanges.next(title);
    }

    onRenameDashboardNameChange(value: string): void {
        this.renameDashboardNameTouched = true;
        this.renameDashboardTitleUsed = false;

        const title = (value || '').trim();

        this.checkingRenameDashboardTitle =
            this.isDashboardNameValid(title) &&
            title !== this.originalDashboardTitle.trim();

        this.renameTitleChanges.next(title);
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
        this.appDashboardsAppService.updateViewDate(row.id).subscribe();
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
        this.newDashboardNameTouched = false;
    }

    cancelCreate(): void {
        this.creatingNewDashboard = false;
        this.newDashboardName = '';
        this.newDashboardNameTouched = false;

        this.newDashboardTitleUsed = false;
        this.checkingNewDashboardTitle = false;
    }


    saveNewDashboard(): void {
        const name = (this.newDashboardName || '').trim();

        if (!this.isDashboardNameValid(name)) {
            this.newDashboardNameTouched = true;
            this.notify.warn(this.l('DashboardNameLengthValidation'));
            return;
        }

        if (this.savingNewDashboard) {
            return;
        }

        this.savingNewDashboard = true;

        this.appDashboardsAppService
            .dashboardTitleUsedBefore(name)
            .subscribe({
                next: (used: boolean) => {
                    if (used) {
                        this.newDashboardTitleUsed = true;
                        this.checkingNewDashboardTitle = false;
                        this.savingNewDashboard = false;
                        return;
                    }

                    // Do not save if the user changed the title
                    // while the API request was running.
                    if (name !== this.newDashboardName.trim()) {
                        this.savingNewDashboard = false;
                        return;
                    }

                    this.showMainSpinner();

                    this.appDashboardsAppService
                        .createOrEdit({ title: name } as any)
                        .pipe(
                            finalize(() => {
                                this.savingNewDashboard = false;
                                this.hideMainSpinner();
                            })
                        )
                        .subscribe({
                            next: () => {
                                this.cancelCreate();
                                this.goToLastDashboardPage();
                            },
                            error: error => {
                                console.error('Create dashboard failed:', error);
                            }
                        });
                },
                error: error => {
                    console.error('Title validation failed:', error);
                    this.savingNewDashboard = false;
                    this.notify.error(this.l('DashboardTitleValidationFailed'));
                }
            });
    }

    goToLastDashboardPage(): void {

        const pageSize =
            this.maxResultCount > 0
                ? this.maxResultCount
                : this.primengTableHelper.defaultRecordsCountPerPage || 10;

        this.appDashboardsAppService
            .getAll(
                this.filterText || null,
                this.selectedDashboardFilter.value,
                this.sorting || null,
                0,
                1
            )
            .subscribe(result => {

                const totalRecords = result?.totalCount || 0;

                const lastPageIndex = Math.max(
                    0,
                    Math.ceil(totalRecords / pageSize) - 1
                );

                const lastPageFirst = lastPageIndex * pageSize;

                this.skipCount = lastPageFirst;
                this.maxResultCount = pageSize;

                if (this.paginator) {

                    this.paginator.changePage(lastPageIndex);

                } else {

                    this.getDashboards();

                }

            });
    }

    startRename(row: any): void {
        this.cancelCreate();
        this.editingDashboardId = row.id;
        this.editingDashboardName = row.title || '';
        this.originalDashboardTitle = row.title || '';

        this.renameDashboardNameTouched = false;
        this.renameDashboardTitleUsed = false;
        this.checkingRenameDashboardTitle = false;
    }

    cancelRename(): void {
        this.editingDashboardId = null;
        this.editingDashboardName = '';
        this.originalDashboardTitle = '';
        this.renameDashboardNameTouched = false;

        this.renameDashboardTitleUsed = false;
        this.checkingRenameDashboardTitle = false;
    }


    saveRename(row: any): void {
        const name = (this.editingDashboardName || '').trim();

        if (!this.isDashboardNameValid(name)) {
            this.renameDashboardNameTouched = true;
            this.notify.warn(this.l('DashboardNameLengthValidation'));
            return;
        }

        if (name === (row.title || '').trim()) {
            this.cancelRename();
            return;
        }

        if (this.savingRename) {
            return;
        }

        this.savingRename = true;

        this.appDashboardsAppService
            .dashboardTitleUsedBefore(name)
            .subscribe({
                next: (used: boolean) => {
                    if (used) {
                        this.renameDashboardTitleUsed = true;
                        this.checkingRenameDashboardTitle = false;
                        this.savingRename = false;
                        return;
                    }

                    if (
                        name !== this.editingDashboardName.trim() ||
                        this.editingDashboardId !== row.id
                    ) {
                        this.savingRename = false;
                        return;
                    }

                    const editDashboard: any = {
                        id: row.id,
                        title: name
                    };

                    this.appDashboardsAppService
                        .createOrEdit(editDashboard)
                        .pipe(
                            finalize(() => {
                                this.savingRename = false;
                            })
                        )
                        .subscribe({
                            next: () => {
                                row.title = name;
                                this.cancelRename();
                                this.notify.success(
                                    this.l('DashboardRenamedSuccessfully')
                                );
                            },
                            error: error => {
                                console.error('Rename dashboard failed:', error);
                            }
                        });
                },
                error: error => {
                    console.error('Title validation failed:', error);
                    this.savingRename = false;
                    this.notify.error(this.l('DashboardTitleValidationFailed'));
                }
            });
    }

    openShareDashboard(row: any): void {
        this.selectedDashboard = row;
        this.sharedUsers = row?.sharedWithUsers
        this.showShareModal = true;
    }
    onDashboardShareSaved(event: boolean) {
        if (event == true) {
            this.showShareModal = false;
            this.getDashboards();
        }

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
            this.l('DeleteDashboardConfirmation'),
            this.l('DeleteDashboard'),
            (confirmed: boolean) => {

                if (!confirmed) {
                    return;
                }

                this.appDashboardsAppService
                    .deleteDashboard(row.id)
                    .subscribe(() => {

                        this.notify.success(
                            this.l('SuccessfullyDeleted')
                        );

                        this.reloadFromFirstPage();
                    });
            },
            {
                confirmButtonText: this.l('Yes'),
                cancelButtonText: this.l('No')
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

                }
            });

        this.subscriptions.push(subs);

    }

    onDashboardCreated(res: any): void {
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

    // =========================================================
    // Profile Pictures
    // =========================================================

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