import {
    Component,
    EventEmitter,
    Input,
    Output
} from '@angular/core';
import { DashboardSharedUser, DashboardShareMode, ShareAccess } from '../../models/dashboard.model';


@Component({
    selector: 'app-dashboard-share',
    templateUrl: './dashboard-share.component.html',
    styleUrls: ['./dashboard-share.component.scss']
})
export class DashboardShareComponent {

    @Input() visible = false;

    @Input() dashboardName = '';

    // Dashboard creator / owner
    @Input() ownerName = '';

    // Users explicitly shared with
    @Input() users: DashboardSharedUser[] = [];

    @Input() mode: DashboardShareMode = 'all';

    // Permission used when sharing with ALL users
    @Input() allUsersAccess: ShareAccess = 'View';

    @Output() visibleChange =
        new EventEmitter<boolean>();

    @Output() save = new EventEmitter<{
        mode: DashboardShareMode;
        allUsersAccess: ShareAccess;
        users: DashboardSharedUser[];
    }>();

    newUserName = '';

    closeDialog(): void {
        this.visible = false;
        this.visibleChange.emit(false);
    }

    selectAll(): void {
        this.mode = 'all';
    }

    selectSpecific(): void {
        this.mode = 'specific';
    }

    changeAllUsersAccess(
        access: ShareAccess
    ): void {
        this.allUsersAccess = access;
    }

    addUser(): void {

        const name =
            this.newUserName?.trim();

        if (!name) {
            return;
        }

        const exists =
            this.users.some(
                user =>
                    user.name
                        ?.trim()
                        ?.toLowerCase() ===
                    name.toLowerCase()
            );

        if (exists) {
            return;
        }

        this.users = [
            ...this.users,
            {
                name: name,
                access: 'View'
            }
        ];

        this.newUserName = '';
    }

    changeAccess(
        index: number,
        access: ShareAccess
    ): void {

        this.users = this.users.map(
            (user, i) =>
                i === index
                    ? {
                        ...user,
                        access: access
                    }
                    : user
        );
    }

    removeUser(index: number): void {

        this.users = this.users.filter(
            (_, i) => i !== index
        );
    }

    requestMakePrivate(): void {
        this.mode = 'confirm';
    }

    cancelMakePrivate(): void {

        this.mode =
            this.users.length
                ? 'specific'
                : 'all';
    }

    confirmMakePrivate(): void {

        this.users = [];

        this.mode = 'private';

        this.emitSave();
    }

    shareAgain(): void {
        this.mode = 'all';
    }

    done(): void {
        this.emitSave();
    }

    private emitSave(): void {

        this.save.emit({
            mode: this.mode,
            allUsersAccess: this.allUsersAccess,
            users: [...this.users]
        });

        this.closeDialog();
    }

    getOwnerInitials(): string {

        if (!this.ownerName) {
            return 'YO';
        }

        const parts =
            this.ownerName
                .trim()
                .split(/\s+/);

        if (parts.length === 1) {
            return parts[0]
                .substring(0, 2)
                .toUpperCase();
        }

        return (
            parts[0].charAt(0) +
            parts[parts.length - 1].charAt(0)
        ).toUpperCase();
    }

    getUserInitials(name: string): string {

        if (!name) {
            return '';
        }

        const parts =
            name
                .trim()
                .split(/\s+/);

        if (parts.length === 1) {
            return parts[0]
                .substring(0, 2)
                .toUpperCase();
        }

        return (
            parts[0].charAt(0) +
            parts[parts.length - 1].charAt(0)
        ).toUpperCase();
    }
}