import { Component, Injector, ElementRef, ViewChild, Renderer2, OnInit, ViewEncapsulation, NgZone } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import {  AppPostsServiceProxy, NotificationServiceProxy, UserNotification } from '@shared/service-proxies/service-proxies';
import { IFormattedUserNotification, UserNotificationHelper } from './UserNotificationHelper';
import * as _ from 'lodash';
import { UrlHelper } from '@shared/helpers/UrlHelper';
import Swal from 'sweetalert2';
import { ViewPostComponent } from '@app/main/posts/Components/view-post.component';
import { PostListComponent } from '@app/main/posts/Components/post-list.component';
import { ViewEventComponent } from '@app/main/AppEvent/Components/view-event.component';
import { CreateorEditPostComponent } from '@app/main/posts/Components/createor-edit-post.component';
import { ProgressComponent } from '@app/shared/common/progress/progress.component';
@Component({
    templateUrl: './header-notifications.component.html',
    selector: '[headerNotifications]',
    encapsulation: ViewEncapsulation.None,
    host: {
        "(document:click)": "onClick($event)",
    },
    providers : [PostListComponent] 
})
export class HeaderNotificationsComponent extends AppComponentBase implements OnInit {
    @ViewChild('tabsTrigger') tabsTrigger: ElementRef;
    @ViewChild('viewPostModal') viewPostModal: ViewPostComponent;
    @ViewChild("viewEventModal", { static: true }) viewEventModal: ViewEventComponent;
    @ViewChild("createOrEditModal", { static: true }) createOrEditModal: CreateorEditPostComponent;
    @ViewChild("ProgressModal", { static: true }) ProgressModal: ProgressComponent;

    notifications: IFormattedUserNotification[] = [];
    unreadNotificationCount = 0;
    dropdownMenudisplay: boolean = false;

    constructor(
        injector: Injector,
        private renderer: Renderer2,
        private _notificationService: NotificationServiceProxy,
        private _userNotificationHelper: UserNotificationHelper,
        public _zone: NgZone,
        private _eref: ElementRef,
        private _postService: AppPostsServiceProxy,
        private _postListComponent :PostListComponent

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

    onClickTabs() {
        this.dropdownMenudisplay = !this.dropdownMenudisplay;
    }

    showModal(notification) {
        switch (notification.entityTypeName) {
            case "onetouch.AppEvents.AppEvent": this.showEvent(notification);
                break;
            case "onetouch.AppPosts.AppPost": this.showPost(notification);
                break;
        }
    }
   
    showPost(notification) {
        this.showMainSpinner();
        this._postService
            .getAll("", "", "", undefined, undefined, undefined, "", "", notification.entityId, "", 0, 1)
            .subscribe((res) => {
                if (res.items.length > 0) {
                    this.hideMainSpinner();
                    this.viewPostModal.show(res.items[0]);
                }
            });
    }
    showEvent(notification) {
        this._postListComponent.viewEventModal=this.viewEventModal;
        this._postListComponent.onshowViewEvent(notification.entityId);
     }
     oncreatePostEvent($event: any,fromViewEvent:boolean) {
        this._postListComponent.createOrEditModal=this.createOrEditModal;
        this._postListComponent.ProgressModal=this.ProgressModal;
        this._postListComponent.oncreatePostEvent($event,fromViewEvent);
     }
   onCreateOrEditPost($event){
    this._postListComponent.onCreateOrEditPost($event);
   }
onTypeFile($event){
    this._postListComponent.onTypeFile($event);
}
showEventModal($event){
    this._postListComponent.showEventModal($event);
}

    openNotificationMessage(notification): void {

        let iconSrc = this.getNotification_item_icon(notification);
        let _showConfirmButton = false;
        let _confirmButton = "";
        if (notification.entityTypeName == "onetouch.AppPosts.AppPost" || notification.entityTypeName == "onetouch.AppEvents.AppEvent") {
            _showConfirmButton = true;
            _confirmButton = "Show";
        }

        Swal.fire({
            title: "",
            html: notification.data.message,
            iconHtml: "<img src='" + iconSrc + "'>",
            showCancelButton: false,
            showCloseButton: true,
            showConfirmButton: _showConfirmButton,
            confirmButtonText: _confirmButton,
            customClass: {
                popup: 'popup-class',
                icon: 'icon-class',
                content: 'content-class',
                actions: 'actions-class',
                confirmButton: 'confirm-button-class',
            },
        })
        .then((x) => {
            if(_showConfirmButton && x.isConfirmed)
                this.showModal(notification); 

        }
        );

        /*  switch (key) {
             case value:
                 
                 break;
         
         }
         if (url) {
             location.href = url;
         } */
    }

    onClick(event) {
        if (!this._eref.nativeElement.contains(event.target))
            this.dropdownMenudisplay = false;
    }

    getNotification_item_icon(notification): string {
        let notification_item_icon = "../../../assets/placeholders/Notifications_Icon awesome-info-circle.svg";
        switch (notification.entityTypeName) {
            case "onetouch.AppContacts.AppContact":
                notification_item_icon = "../../../assets/placeholders/Notification_DT_PopUp_CONNECT_ICON.svg";
                break;
            case "onetouch.AppEvents.AppEvent":
                notification_item_icon = "../../../assets/placeholders/Notification_DT_PopUp_EVENT_ICON.svg";
                break;
            case "onetouch.AppPosts.AppPost":
                notification_item_icon = "../../../assets/placeholders/Notification_DT_PopUp_pOST_ICON.svg";
                break;
        }
        return notification_item_icon;
    }
}
