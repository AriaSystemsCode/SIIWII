import { Component, Injector,ElementRef, ViewChild, Renderer2, OnInit, ViewEncapsulation, NgZone } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { NotificationServiceProxy, UserNotification } from '@shared/service-proxies/service-proxies';
import { IFormattedUserNotification, UserNotificationHelper } from './UserNotificationHelper';
import * as _ from 'lodash';
import { UrlHelper } from '@shared/helpers/UrlHelper';

@Component({
    templateUrl: './header-notifications.component.html',
    selector: '[headerNotifications]',
    encapsulation: ViewEncapsulation.None,
    host: {
        "(document:click)": "onClick($event)",
      },
})
export class HeaderNotificationsComponent extends AppComponentBase implements OnInit {
    @ViewChild('tabsTrigger') tabsTrigger: ElementRef;

    notifications: IFormattedUserNotification[] = [];
    unreadNotificationCount = 0;
    dropdownMenudisplay:boolean=false;

    constructor(
        injector: Injector,
        private renderer: Renderer2,
        private _notificationService: NotificationServiceProxy,
        private _userNotificationHelper: UserNotificationHelper,
        public _zone: NgZone,
        private _eref: ElementRef
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.loadNotifications();
        this.registerToEvents();
    }

    loadNotifications(): void {
        if (UrlHelper.isInstallUrl(location.href)) {
            return;
        }

        this._notificationService.getUserNotifications(undefined, undefined, undefined, 3, 0).subscribe(result => {
            this.unreadNotificationCount = result.unreadCount;
            this.notifications = [];
            _.forEach(result.items, (item: UserNotification) => {
                this.notifications.push(this._userNotificationHelper.format(<any>item));
            });
        });
    }

    registerToEvents() {
        let self = this;

        function onNotificationReceived(userNotification) {
            self._userNotificationHelper.show(userNotification);
            self.loadNotifications();
        }

        abp.event.on('abp.notifications.received', userNotification => {
            self._zone.run(() => {
                onNotificationReceived(userNotification);
            });
        });

        function onNotificationsRefresh() {
            self.loadNotifications();
        }

        abp.event.on('app.notifications.refresh', () => {
            self._zone.run(() => {
                onNotificationsRefresh();
            });
        });

        function onNotificationsRead(userNotificationId) {
            for (let i = 0; i < self.notifications.length; i++) {
                if (self.notifications[i].userNotificationId === userNotificationId) {
                    self.notifications[i].state = 'READ';
                }
            }

            self.unreadNotificationCount -= 1;
        }

        abp.event.on('app.notifications.read', userNotificationId => {
            self._zone.run(() => {
                onNotificationsRead(userNotificationId);
            });
        });
    }

    setAllNotificationsAsRead(): void {
        this._userNotificationHelper.setAllAsRead();
    }

    openNotificationSettingsModal(): void {
        this._userNotificationHelper.openSettingsModal();
    }

    setNotificationAsRead(userNotification: IFormattedUserNotification): void {
        this._userNotificationHelper.setAsRead(userNotification.userNotificationId);
    }

    onClickTabs(){
        this.dropdownMenudisplay=!this.dropdownMenudisplay; }

    gotoUrl(url): void {
        if (url) {
            location.href = url;
        }
    }

    onClick(event) {
        if (!this._eref.nativeElement.contains(event.target))
        this.dropdownMenudisplay=false;
      }
}
