import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';
import { UrlHelper } from '@shared/helpers/UrlHelper';
import {
  SubscriptionStartType,
  AppEntitiesServiceProxy
} from '@shared/service-proxies/service-proxies';
import { ChatSignalrService } from 'app/shared/layout/chat/chat-signalr.service';
import * as moment from 'moment';
import { AppComponentBase } from 'shared/common/app-component-base';
import { SignalRHelper } from 'shared/helpers/SignalRHelper';
import { LinkedAccountsModalComponent } from '@app/shared/layout/linked-accounts-modal.component';
import { UserDelegationsModalComponent } from '@app/shared/layout/user-delegations-modal.component';
import { LoginAttemptsModalComponent } from '@app/shared/layout/login-attempts-modal.component';
import { ChangePasswordModalComponent } from '@app/shared/layout/profile/change-password-modal.component';
import { ChangeProfilePictureModalComponent } from '@app/shared/layout/profile/change-profile-picture-modal.component';
import { MySettingsModalComponent } from '@app/shared/layout/profile/my-settings-modal.component';
import { NotificationSettingsModalComponent } from '@app/shared/layout/notifications/notification-settings-modal.component';
import { UserNotificationHelper } from '@app/shared/layout/notifications/UserNotificationHelper';
import { FaviconService } from 'favicon.service';

@Component({
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends AppComponentBase implements OnInit {

  subscriptionStartType = SubscriptionStartType;
  theme: string;
  installationMode = true;
  isAuthenticated = false;
  private landingDecided = false;

  @ViewChild('loginAttemptsModal', { static: true }) loginAttemptsModal: LoginAttemptsModalComponent;
  @ViewChild('linkedAccountsModal') linkedAccountsModal: LinkedAccountsModalComponent;
  @ViewChild('userDelegationsModal', { static: true }) userDelegationsModal: UserDelegationsModalComponent;
  @ViewChild('changePasswordModal', { static: true }) changePasswordModal: ChangePasswordModalComponent;
  @ViewChild('changeProfilePictureModal', { static: true }) changeProfilePictureModal: ChangeProfilePictureModalComponent;
  @ViewChild('mySettingsModal', { static: true }) mySettingsModal: MySettingsModalComponent;
  @ViewChild('notificationSettingsModal', { static: true }) notificationSettingsModal: NotificationSettingsModalComponent;
  @ViewChild('chatBarComponent') chatBarComponent;

  isQuickThemeSelectEnabled: boolean =
    this.setting.getBoolean('App.UserManagement.IsQuickThemeSelectEnabled');
  IsSessionTimeOutEnabled: boolean =
    this.setting.getBoolean('App.UserManagement.SessionTimeOut.IsEnabled') &&
    this.appSession.userId != null;

  constructor(
    injector: Injector,
    private _chatSignalrService: ChatSignalrService,
    private _userNotificationHelper: UserNotificationHelper,
    private _router: Router,
    private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
    public faviconService:FaviconService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.loadFavicon()
    this._userNotificationHelper.settingsModal = this.notificationSettingsModal;
    this.theme = abp.setting.get('App.UiManagement.Theme').toLocaleLowerCase();
    this.installationMode = UrlHelper.isInstallUrl(location.href);
    this.isAuthenticated = !!this.appSession?.userId;

    this.registerModalOpenEvents();

    if (this.appSession.application) {
      SignalRHelper.initSignalR(() => { this._chatSignalrService.init(); });
    }

    // Decide where to land (anonymous vs login)
    this.configureDefaultRedirect();
  }

  /** Decide default landing page based on host setting 1213 */
  private configureDefaultRedirect(): void {
    // avoid running multiple times
    if (this.landingDecided) {
      return;
    }

    // don't do this on install URL
    if (this.installationMode) {
      return;
    }

    const currentUrl = this._router.url;

    // If already on /account/... or deep-linked inside app, don't override
    if (currentUrl.startsWith('/account')) {
      return;
    }

    // example: user already on /app/main/marketplace/products => keep it
    if (!currentUrl || currentUrl === '/' || currentUrl === '/app' || currentUrl === '/app/') {
      // Only decide when we are basically at root of the shell
    } else {
      // deep link somewhere inside /app, don't force redirect
      return;
    }

    this.landingDecided = true;

    this._appEntitiesServiceProxy.getHostSettingValue(1213,null).subscribe({
      next: res => {
        const allowAnonymous = res == 'Enable' ? true :false
        // const allowAnonymous = true

        if (allowAnonymous) {
          //  if anonymous is allowed:
          // - unauthenticated users go to marketplace
        
          const target = '/app/main/marketplace';
          this._router.navigateByUrl(target);
        } else {
          //  if anonymous NOT allowed:
          // unauthenticated users go to login
          if (!this.isAuthenticated) {
            this._router.navigateByUrl('/account/login'); // NOTE: root-level "account"
          } else {
          
            this._router.navigateByUrl('/app/main/dashboard');
          }
        }
      },
      error: err => {
        console.error('Failed to load host setting 1213', err);
        // fallback: if something fails, at least send anonymous users to login
        if (!this.isAuthenticated) {
          this._router.navigateByUrl('/account/login');
        }
      }
    });
  }


  subscriptionStatusBarVisible(): boolean {
    return this.appSession.tenantId > 0 &&
      (this.appSession.tenant.isInTrialPeriod ||
        this.subscriptionIsExpiringSoon());
  }

  subscriptionIsExpiringSoon(): boolean {
    if (this.appSession.tenant.subscriptionEndDateUtc) {
      return (
        moment().utc().add(AppConsts.subscriptionExpireNootifyDayCount, 'days') >=
        moment(this.appSession.tenant.subscriptionEndDateUtc)
      );
    }
    return false;
  }

  registerModalOpenEvents(): void {
    abp.event.on('app.show.loginAttemptsModal', () => {
      this.loginAttemptsModal.show();
    });

    abp.event.on('app.show.linkedAccountsModal', () => {
      this.linkedAccountsModal.show();
    });

    abp.event.on('app.show.userDelegationsModal', () => {
      this.userDelegationsModal.show();
    });

    abp.event.on('app.show.changePasswordModal', () => {
      this.changePasswordModal.show();
    });

    abp.event.on('app.show.changeProfilePictureModal', () => {
      this.changeProfilePictureModal.show();
    });

    abp.event.on('app.show.mySettingsModal', () => {
      this.mySettingsModal.show();
    });
  }

  getRecentlyLinkedUsers(): void {
    abp.event.trigger('app.getRecentlyLinkedUsers');
  }

  onMySettingsModalSaved(): void {
    abp.event.trigger('app.onMySettingsModalSaved');
  }
  private loadFavicon(): void {
    this._appEntitiesServiceProxy.getHostSettingValue(1206, 'file')
      .subscribe({
        next: (url: string) => {
          if (!url) return;
          const fullUrl = this.attachmentBaseUrl + '/' + url;
  
          this.faviconService.setFaviconFromUrl(fullUrl);
        },

      });

        this._appEntitiesServiceProxy.getHostSettingValue(1205, null).subscribe(title => {
    const t = title;
    this.faviconService.setSeoText(t, 'The Global Apparel B2B Network');
  });
  }

  
  
}
