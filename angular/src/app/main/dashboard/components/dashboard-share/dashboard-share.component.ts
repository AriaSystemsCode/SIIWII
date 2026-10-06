import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Injector,
    Input,
    OnChanges,
    Output,
    SimpleChanges
} from '@angular/core';

import {
    DashboardShareMode,
    ShareAccess
} from '../../models/dashboard.model';

import {
    AppDashboardServiceProxy,
    SharingUserInfo,
    ShareDashboardInfo,
    ShareWithUser
} from '@shared/service-proxies/service-proxies';

import {
    AppComponentBase
} from '@shared/common/app-component-base';

import { finalize } from 'rxjs/operators';


@Component({
    selector: 'app-dashboard-share',
    templateUrl: './dashboard-share.component.html',
    styleUrls: ['./dashboard-share.component.scss']
})
export class DashboardShareComponent
    extends AppComponentBase
    implements OnChanges {

    @Input() visible = false;
    @Input() dashboardName = '';
    @Input() dashboardId: number | null = null;

    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() saved = new EventEmitter<boolean>();

    originalTenantUsers: SharingUserInfo[] = [];

    tenantUsers: SharingUserInfo[] = [];
    sharedUsers: SharingUserInfo[] = [];
    selectedSearchUser: SharingUserInfo | null = null;

    mode: DashboardShareMode = 'private';
    private modeBeforeConfirm: DashboardShareMode = 'specific';
    allUsersAccess: ShareAccess = 'View';
    isSaving = false;


    readonly permissionOptions: {
        label: string;
        value: ShareAccess;
    }[] = [
            {
                label: 'View',
                value: 'View'
            },
            {
                label: 'Edit',
                value: 'Edit'
            }
        ];


    constructor(
        injector: Injector,
        private dashboardService: AppDashboardServiceProxy,
        private cdr: ChangeDetectorRef
    ) {
        super(injector);
    }


    ngOnChanges(changes: SimpleChanges): void {
        if (changes.visible && this.visible && this.dashboardId) {
            this.getTenantAllUser();
        }
    }

    getTenantAllUser(): void {
        if (!this.dashboardId) {
            return;
        }
        this.showMainSpinner();
        this.dashboardService.getTenantAllUser(this.dashboardId)
            .pipe(
                finalize(() => {
                    this.hideMainSpinner();
                    this.cdr.detectChanges();
                })
            )
            .subscribe({
                next: result => {
                    this.originalTenantUsers = this.cloneUsers(result ?? []);
                    this.tenantUsers = this.cloneUsers(this.originalTenantUsers);
                    this.selectedSearchUser = null;
                    this.initializeMode();
                    this.refreshSharedUsers();
                    this.cdr.detectChanges();
                },

            });
    }

    private cloneUsers(users: SharingUserInfo[]): SharingUserInfo[] {
        return users.map(user => ({ ...user } as SharingUserInfo)
        );
    }

    private initializeMode(): void {
        const nonOwners = this.tenantUsers.filter(user => !user.isOwner);
        const sharedNonOwners = nonOwners.filter(user => user.canView || user.canEdit);
        if (sharedNonOwners.length === 0) {
            this.mode = 'private';
            this.allUsersAccess = 'View';

            return;
        }
        if (
            nonOwners.length > 0 &&
            sharedNonOwners.length ===
            nonOwners.length
        ) {

            this.mode = 'all';
            this.allUsersAccess =
                sharedNonOwners.every(
                    user =>
                        user.canEdit
                )
                    ? 'Edit'
                    : 'View';


            return;
        }

        this.mode = 'specific';
    }

    private refreshSharedUsers(): void {

        this.sharedUsers =
            this.tenantUsers
                .filter(
                    user =>
                        user.isOwner ||
                        user.canView ||
                        user.canEdit
                )
                .sort(
                    (a, b) => {
                        if (
                            a.isOwner &&
                            !b.isOwner
                        ) {
                            return -1;
                        }


                        if (
                            !a.isOwner &&
                            b.isOwner
                        ) {
                            return 1;
                        }


                        return (
                            a.userName || ''
                        ).localeCompare(
                            b.userName || ''
                        );
                    }
                );
    }

    get availableUsers(): SharingUserInfo[] {
        const sharedIds = new Set(this.sharedUsers.map(user => user.userId));
        return this.tenantUsers.filter(
            user =>
                !user.isOwner &&
                !sharedIds.has(
                    user.userId
                )
        );
    }

    onSearchUserSelected(
        selectedUser:
            SharingUserInfo
    ): void {

        if (!selectedUser) {
            return;
        }


        const user =
            this.tenantUsers.find(
                item =>
                    item.userId ===
                    selectedUser.userId
            );


        if (!user) {
            return;
        }

        user.canView = true;
        user.canEdit = false;
        this.refreshSharedUsers();
        this.selectedSearchUser = null;
        this.mode = 'specific';
    }


    getUserAccess(user: SharingUserInfo): ShareAccess {
        return user.canEdit ? 'Edit' : 'View';
    }

    changeAccess(
        user: SharingUserInfo,
        access: ShareAccess
    ): void {

        if (user.isOwner) {
            return;
        }

        const workingUser =
            this.tenantUsers.find(
                item => item.userId === user.userId
            );

        if (!workingUser) {
            return;
        }

        if (access === 'Edit') {
            workingUser.canEdit = true;
            workingUser.canView = true;
        } else {
            workingUser.canEdit = false;
            workingUser.canView = true;
        }

        this.refreshSharedUsers();
    }

    removeUser(user: SharingUserInfo): void {
        if (user.isOwner) {
            return;
        }
        const workingUser =
            this.tenantUsers.find(
                item =>
                    item.userId ===
                    user.userId
            );


        if (!workingUser) {
            return;
        }
        workingUser.canView = false;
        workingUser.canEdit = false;
        this.refreshSharedUsers();
    }

    selectAll(): void {
        this.mode = 'all';

    }

    changeAllUsersAccess(access: ShareAccess): void {
        this.allUsersAccess = access;
    }

    selectSpecific(): void {
        this.mode = 'specific';
    }

    requestMakePrivate(): void {
        this.modeBeforeConfirm = this.mode;
        this.mode = 'confirm';
    }

    cancelMakePrivate(): void {
        this.mode = this.modeBeforeConfirm;
    }

    confirmMakePrivate(): void {

        this.showMainSpinner();
        this.dashboardService.makeDashboardPrivate(this.dashboardId)
            .pipe(
                finalize(() => {
                    this.mode = 'private';
                    this.hideMainSpinner();
                    this.saved.emit(true)
                    this.cdr.detectChanges();
                })
            )
            .subscribe({
                next: result => { },
            });
    }


    shareAgain(): void {
        this.mode = 'specific';
    }

    // get sharedUsersCount():
    //     number {

    //     return this.sharedUsers.filter(
    //         user =>
    //             !user.isOwner &&
    //             (
    //                 user.canView ||
    //                 user.canEdit
    //             )
    //     ).length;
    // }

    // get shareStatusText(): string {
    //     if (this.mode === 'private') {
    //         return 'Shared with no one';
    //     }
    //     if (this.mode === 'all') {
    //         return 'Shared with everyone';
    //     }
    //     if (this.mode === 'confirm') {
    //         return this.getStatusFromUsers();
    //     }
    //     const count = this.sharedUsersCount;
    //     return count === 1 ? 'Shared with 1 user' : `Shared with ${count} users`;
    // }



    private getStatusFromUsers():
        string {

        const tenantCount =
            this.tenantUsers.filter(
                user =>
                    !user.isOwner
            ).length;


        const sharedCount =
            this.sharedUsersCount;


        if (
            sharedCount === 0
        ) {

            return 'Shared with no one';
        }


        if (
            tenantCount > 0 &&
            tenantCount ===
            sharedCount
        ) {

            return 'Shared with everyone';
        }


        return sharedCount === 1
            ? 'Shared with 1 user'
            : `Shared with ${sharedCount} users`;
    }


    get shareStatusText(): string {
    const nonOwners =
        this.originalTenantUsers.filter(
            user => !user.isOwner
        );

    const sharedNonOwners =
        nonOwners.filter(
            user =>
                user.canView ||
                user.canEdit
        );

    if (sharedNonOwners.length === 0) {
        return 'Shared with no one';
    }

    if (
        nonOwners.length > 0 &&
        sharedNonOwners.length === nonOwners.length
    ) {
        return 'Shared with everyone';
    }

    return sharedNonOwners.length === 1
        ? 'Shared with 1 user'
        : `Shared with ${sharedNonOwners.length} users`;
}

get sharedUsersCount(): number {
    return this.originalTenantUsers.filter(
        user =>
            !user.isOwner &&
            (
                user.canView ||
                user.canEdit
            )
    ).length;
}

    done(): void {
        if (!this.dashboardId || this.isSaving) {
            return;
        }

        const body = this.buildShareDashboardBody();

        this.isSaving = true;
        this.showMainSpinner();

        this.dashboardService
            .shareDashboard(body)
            .pipe(
                finalize(() => {
                    this.isSaving = false;
                    this.hideMainSpinner();
                    this.cdr.detectChanges();
                })
            )
            .subscribe({
                next: () => {
                    this.notify.success(
                        this.l('SuccessfullySaved')
                    );

                    this.saved.emit(true);
                    this.closeAfterSave();
                },
                error: error => {
                    console.error(
                        'Unable to share dashboard',
                        error
                    );
                }
            });
    }

    // private buildShareDashboardBody(): ShareDashboardInfo {
    //     const body = new ShareDashboardInfo();

    //     body.dashboardId = Number(this.dashboardId);
    //     body.sharingLevel = this.getSharingLevel();
    //     body.canEdit =
    //         this.mode === 'all' &&
    //         this.allUsersAccess === 'Edit';

    //     if (this.mode === 'all') {
    //         body.usersList = this.buildAllUsersList();
    //     } else if (this.mode === 'specific') {
    //         body.usersList = this.buildSpecificUsersList();
    //     } else {
    //         body.usersList = [];
    //     }

    //     return body;
    // }

    private buildShareDashboardBody(): ShareDashboardInfo {
    const body = new ShareDashboardInfo();

    body.dashboardId = Number(this.dashboardId);
    body.sharingLevel = this.getSharingLevel();
    body.canEdit =
        this.mode === 'all' &&
        this.allUsersAccess === 'Edit';

    if (this.mode === 'specific') {
        body.usersList = this.buildSpecificUsersList();
    } else {
        body.usersList = [];
    }

    return body;
}
    private buildAllUsersList(): ShareWithUser[] {
        return this.tenantUsers
            .filter(user => !user.isOwner)
            .map(user => {
                const item = new ShareWithUser();

                item.userId = user.userId;
                item.canEdit =
                    this.allUsersAccess === 'Edit';

                return item;
            });
    }

    private getSharingLevel(): number {
        switch (this.mode) {
            case 'all':
                return 1;
            case 'specific':
                return 2;
            case 'private':
                return 4
            default:
                return 0;
        }
    }

    private buildSpecificUsersList(): ShareWithUser[] {
        return this.tenantUsers
            .filter(
                user =>
                    !user.isOwner &&
                    (user.canView || user.canEdit)
            )
            .map(user => {
                const item = new ShareWithUser();

                item.userId = user.userId;
                item.canEdit = !!user.canEdit;

                return item;
            });
    }

    closeDialog(): void {
        this.tenantUsers = this.cloneUsers(this.originalTenantUsers);
        this.refreshSharedUsers();
        this.selectedSearchUser = null;
        this.visible = false;
        this.visibleChange.emit(false);
    }

    private closeAfterSave(): void {
        this.visible = false;
        this.visibleChange.emit(false);
    }

    getUserInitials(
        name: string
    ): string {

        if (!name) {
            return '';
        }


        const parts =
            name
                .trim()
                .split(/\s+/);


        if (
            parts.length === 1
        ) {

            return parts[0]
                .substring(
                    0,
                    2
                )
                .toUpperCase();
        }


        return (
            parts[0].charAt(0) +
            parts[
                parts.length - 1
            ].charAt(0)
        ).toUpperCase();
    }
}