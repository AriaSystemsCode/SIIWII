import {
    Injector,
    Component,
    OnInit,
    ViewEncapsulation,
    Output,
    EventEmitter,
    Input,
} from "@angular/core";
import { AbpMultiTenancyService, AbpSessionService } from "abp-ng2-module";
import { ImpersonationService } from "@app/admin/users/impersonation.service";
import { AppAuthService } from "@app/shared/common/auth/app-auth.service";
import { LinkedAccountService } from "@app/shared/layout/linked-account.service";
import { AppConsts } from "@shared/AppConsts";
import { ThemesLayoutBaseComponent } from "@app/shared/layout/themes/themes-layout-base.component";
import {
    LinkedUserDto,
    MessageServiceProxy,
    ProfileServiceProxy,
    UserLinkServiceProxy,
    GetMaintainanceForViewDto,
    MaintainancesServiceProxy,
} from "@shared/service-proxies/service-proxies";

import { UrlHelper } from "@shared/helpers/UrlHelper";
import { Router } from "@angular/router";
import * as _ from "lodash";
import { UserClickService } from "@shared/utils/user-click.service";
import { MessageReadService } from "@shared/utils/message-read.service";
import { UpdateLogoService } from "@shared/utils/update-logo.service";
import * as signalR from "@microsoft/signalr"
import { ClientAuthError } from "msal";

export enum MarketPlace {
    Accounts,
    Products,
    Persons,
}


@Component({
    templateUrl: "./topbar.component.html",
    selector: "topbar",
    styleUrls: ["./topbar.component.scss"],
    styles: [
        `
            ._divider span {
                width: 1px;
                height: 15px;
                background-color: #c8c8c8;
            }
            .kt-header__topbar-item {
                border-bottom: 2px solid transparent;
                cursor: pointer;
                transition: all 0.3s ease-in-out;
            }
            .kt-header__topbar-item.header-link-active,
            .kt-header__topbar-item:hover {
                color: #2061eb !important;
                transition: all 0.3s ease-in-out;
            }
            .kt-header__topbar-item i {
                font-size: 15px !important;
            }
            img.header-profile-picture {
                max-width: 30px;
                max-height: 30px;
                border-radius: 50%;
            }
            .kt-header__topbar .kt-header__topbar-item .kt-header__topbar-icon {
                width: 22px;
                height: 22px;
            }
        `,
    ],
})
export class TopBarComponent
    extends ThemesLayoutBaseComponent
    implements OnInit
{   
    attachmentBaseUrl=AppConsts.attachmentBaseUrl;
     hubConnection: signalR.HubConnection;
    _belowBar = false;
    _belowBarMessage = "";

    @Input() displayMarketPlace: boolean = false;
    isHost = false; 
    isImpersonatedLogin = false;
    isMultiTenancyEnabled = false;
    shownLoginName = "";
    tenancyName = "";
    userName = "";
    name = "";
    defaultProfilePicture =
        AppConsts.appBaseUrl +
        "/assets/common/images/default-profile-picture.png";
    profilePicture = this.defaultProfilePicture;
    defaultLogo =
        AppConsts.appBaseUrl +
        "/assets/common/images/app-logo-on-" +
        this.currentTheme?.baseSettings?.menu?.asideSkin +
        ".svg";
    recentlyLinkedUsers: LinkedUserDto[];
    unreadChatMessageCount = 0;
    unreadMessageCount = 0;
    remoteServiceBaseUrl: string = AppConsts.remoteServiceBaseUrl;
    chatConnected = false;
    isQuickThemeSelectEnabled: boolean = this.setting.getBoolean(
        "App.UserManagement.IsQuickThemeSelectEnabled"
    );
    installationMode = true;
    topbardropDown: TopbardropDown[] = [];
    constructor(
        injector: Injector,
        private _abpSessionService: AbpSessionService,
        private _abpMultiTenancyService: AbpMultiTenancyService,
        private _profileServiceProxy: ProfileServiceProxy,
        private _userLinkServiceProxy: UserLinkServiceProxy,
        private _maintainancesServiceProxy: MaintainancesServiceProxy,
        private _authService: AppAuthService,
        private _impersonationService: ImpersonationService,
        private _linkedAccountService: LinkedAccountService,
        private router: Router,
        private userClickService: UserClickService,
        private messageReadService: MessageReadService,
        private _MessageServiceProxy: MessageServiceProxy,
        private updateLogoService:UpdateLogoService
    ) {
        super(injector);
    }

    ngOnInit() {

        this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(this.attachmentBaseUrl+'/signalr-build')
        .build();
        this.hubConnection
        .start()
        .then(() => console.log('Connection started'))
        .catch(err => console.log('Error while starting connection: ' + err))

        this.hubConnection.on('SendBuildMessage', (data) => {
            this.belowBar(data);
            console.log(data);
          });


        this.installationMode = UrlHelper.isInstallUrl(location.href);
        this.isHost = !this._abpSessionService.tenantId;
        this.isMultiTenancyEnabled = this._abpMultiTenancyService.isEnabled;
        this.isImpersonatedLogin =
            this._abpSessionService.impersonatorUserId > 0;
        this.setCurrentLoginInformations();
        this.getProfilePicture();
        this.getRecentlyLinkedUsers();
        this.appSession.user.memberId;
        this.appSession.user.id;
        this.registerToEvents();
        this.getUnreadMessageCount();

        this.messageReadService.readMessageSubject$.subscribe((res) => {
            if (res) {

                this.getUnreadMessageCount();
            }
        });
        this.getBelowBar();
    }

    registerToEvents() {
        abp.event.on("profilePictureChanged", () => {
            this.getProfilePicture();
        });

        abp.event.on("app.chat.unreadMessageCountChanged", (messageCount) => {
            this.unreadChatMessageCount = messageCount;
        });

        abp.event.on("app.chat.connected", () => {
            this.chatConnected = true;
        });

        abp.event.on("app.getRecentlyLinkedUsers", () => {
            this.getRecentlyLinkedUsers();
        });

        abp.event.on("app.onMySettingsModalSaved", () => {
            this.onMySettingsModalSaved();
        });
    }

    setCurrentLoginInformations(): void {
        this.shownLoginName = this.appSession.getShownLoginName();
        this.tenancyName = this.appSession.tenancyName;
        this.userName = this.appSession.user.userName;
        this.name = this.appSession.user.name;
    }

    getShownUserName(linkedUser: LinkedUserDto): string {
        if (!this._abpMultiTenancyService.isEnabled) {
            return linkedUser.username;
        }

        return (
            (linkedUser.tenantId ? linkedUser.tenancyName : ".") +
            "\\" +
            linkedUser.username
        );
    }

    getProfilePicture(): void {
        this.updateLogoService.profilePictureUpdated$.subscribe(res=>{
            this.profilePicture = res
        })
        // this._profileServiceProxy.getProfilePicture().subscribe((result) => {
        //     if (result && result.profilePicture) {
        //         this.profilePicture =
        //             "data:image/jpeg;base64," + result.profilePicture;
        //     }
        // });
    }

    getRecentlyLinkedUsers(): void {
        this._userLinkServiceProxy
            .getRecentlyUsedLinkedUsers()
            .subscribe((result) => {
                this.recentlyLinkedUsers = result.items;
            });
    }

    showLoginAttempts(): void {
        abp.event.trigger("app.show.loginAttemptsModal");
    }

    showLinkedAccounts(): void {
        abp.event.trigger("app.show.linkedAccountsModal");
    }

    showUserDelegations(): void {
        abp.event.trigger("app.show.userDelegationsModal");
    }

    changePassword(): void {
        abp.event.trigger("app.show.changePasswordModal");
    }

    changeProfilePicture(): void {
        abp.event.trigger("app.show.changeProfilePictureModal");
    }

    changeMySettings(): void {
        // abp.event.trigger('app.show.mySettingsModal');
        this.router.navigate(["/app/main/account"], {
            queryParams: { Tab: "viewProfile" },
        });
    }

    logout(): void {
        this._authService.logout();
    }

    onMySettingsModalSaved(): void {
        this.shownLoginName = this.appSession.getShownLoginName();
    }

    backToMyAccount(): void {
        this._impersonationService.backToImpersonator();
    }

    switchToLinkedUser(linkedUser: LinkedUserDto): void {
        this._linkedAccountService.switchToAccount(
            linkedUser.id,
            linkedUser.tenantId
        );
    }

    downloadCollectedData(): void {
        this._profileServiceProxy.prepareCollectedData().subscribe(() => {
            this.message.success(this.l("GdprDataPrepareStartedNotification"));
        });
    }

    updateBuildWithUserId():void{
        this._maintainancesServiceProxy.updateOpenBuildWithUserId(this.appSession.user.id)
        .subscribe(() => {
            this.notify.success(this.l('SuccessfullySaved'));
           
            });
            this._belowBar = false;
            this._belowBarMessage = "";
        
    }
    getBelowBar():void{
        this._maintainancesServiceProxy.getOpenBuild().subscribe( 
            (data)=> { this.belowBar(data);}
        )
    }

    belowBar(data: GetMaintainanceForViewDto): void {
        if (data?.maintainance?.id> 0)
        { this._belowBar = !data.maintainance.dismissIds?.includes(this.appSession.user.id.toString()+'|') ;
          this._belowBarMessage = this.l("MaintainanceAlarm",new Date(data.maintainance.from.toString()).toLocaleDateString()+' '+new Date(data.maintainance.from.toString()).toLocaleTimeString(), new Date(data.maintainance.to.toString()).toLocaleDateString()+' '+new Date(data.maintainance.to.toString()).toLocaleTimeString());
        }
        else
        { this._belowBar = false; this._belowBarMessage="";}
        
    }
    defineDropDown() {
        this.topbardropDown = [
            {
                title: this.l("ManageLinkedAccounts"),
                icon: "",
                clickHandler: this.changeMySettings.bind(this),
                displayCondition: true,
            },
            {
                title: this.l("ManageLinkedAccounts"),
                icon: "",
                clickHandler: this.changeMySettings.bind(this),
                displayCondition: true,
            },
            {
                title: this.l("ManageLinkedAccounts"),
                icon: "",
                clickHandler: this.changeMySettings.bind(this),
                displayCondition: true,
            },
            {
                title: this.l("ManageLinkedAccounts"),
                icon: "",
                clickHandler: this.changeMySettings.bind(this),
                displayCondition: true,
            },
            {
                title: this.l("ManageLinkedAccounts"),
                icon: "",
                clickHandler: this.changeMySettings.bind(this),
                displayCondition: true,
            },
            {
                title: this.l("ManageLinkedAccounts"),
                icon: "",
                clickHandler: this.changeMySettings.bind(this),
                displayCondition: true,
            },
        ];
    }
    userClick(target) {
        this.userClickService.userClicked(target);
    }
    getUnreadMessageCount() {
        this._MessageServiceProxy.getUnreadCounts().subscribe((result) => {
            this.unreadMessageCount = result;
        });
    }
}

export interface TopbardropDown {
    title: string;
    icon: string;
    clickHandler: Object;
    displayCondition: boolean;
}
