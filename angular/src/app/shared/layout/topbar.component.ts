import {
    Injector,
    Component,
    OnInit,
    ViewEncapsulation,
    Output,
    EventEmitter,
    Input,
    ViewChild,
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
    AppTransactionServiceProxy,
    ICreateOrEditAppTransactionsDto,
    ShoppingCartSummary,
    TransactionType,
    AppEntitiesServiceProxy,
    CurrencyInfoDto,
} from "@shared/service-proxies/service-proxies";

import { UrlHelper } from "@shared/helpers/UrlHelper";
import { Router } from "@angular/router";
import * as _ from "lodash";
import { UserClickService } from "@shared/utils/user-click.service";
import { MessageReadService } from "@shared/utils/message-read.service";
import { UpdateLogoService } from "@shared/utils/update-logo.service";
import * as signalR from "@microsoft/signalr";
import { ClientAuthError } from "msal";
import { MenuItem } from "primeng/api";
import {
    FormBuilder,
    FormGroup,
    FormGroupName,
    Validators,
} from "@angular/forms";
import { DatePipe } from "@angular/common";
import { finalize } from "rxjs";
import { Dropdown } from "primeng/dropdown";
import { ShoppingCartViewComponentComponent } from "@app/admin/app-shoppingCart/Components/shopping-cart-view-component/shopping-cart-view-component.component";
import { ShoppingCartMode } from "@app/admin/app-shoppingCart/Components/shopping-cart-view-component/ShoppingCartMode";

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
    implements OnInit {
    attachmentBaseUrl = AppConsts.attachmentBaseUrl;
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
    display: boolean = false;
    items: MenuItem[];
    dt: string;
    roles: any[];
    public orderForm: FormGroup;
    submitted: boolean = false;
    salesOrderControls: ICreateOrEditAppTransactionsDto;
    selectedCar: number;
    buyerCompanies: any[];
    sellerCompanies: any[];
    buyerContacts: any[];
    sellerContacts: any[];
    searchTimeout: any;
    buyerComapnyId: number = 0;
    sellerCompanyId: number = 0;
    sellerContactId: number;
    buyerContactId: number;
    isCompantIdExist: boolean = false;
    isSellerCompanyIdExist: boolean = false;
    role: string;
    formType: string;
    isRoleExist: boolean = false;
    btnLoader: boolean = false;
    modalheaderName: string;
    showSearch:boolean =false;
    shoppingCartSummary: ShoppingCartSummary;
    defaultSellerLogo: string = "";
    defaultBuyerLogo: string = "";
    _TransactionType = TransactionType;
    transactionType: string = "";
    @ViewChild("shoppingCartModal", { static: true }) shoppingCartModal: ShoppingCartViewComponentComponent;
    currencySymbol: string = "";
    visible:boolean =false;
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
        private updateLogoService: UpdateLogoService,
        private fb: FormBuilder,
        private datePipe: DatePipe,
        private _AppTransactionServiceProxy: AppTransactionServiceProxy,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy   
    ) {
        super(injector);

        this.items = [
            {
                items: [
                    {
                        label: "Sales Order",
                        command: () => {
                            this.getOderNumber("SO", "Sales Order");
                            this.roles = [
                                { name: "I'm a Seller", code: 1 },
                                {
                                    name: "I'm an Independent Sales Rep.",
                                    code: 3,
                                },
                            ];
                        },
                    },
                    {
                        label: "Purchase Order",
                        command: () => {
                            this.getOderNumber("PO", "Purchase Order");
                            this.roles = [
                                { name: "I'm a Buyer", code: 2 },
                                {
                                    name: "I'm an Independent buying office.",
                                    code: 3,
                                },
                            ];
                        },
                    },
                ],
            },
        ];
    }

    orderNo: any;
    getOderNumber(tranType: string, tranName: string) {
        this._AppTransactionServiceProxy
            .getNextOrderNumber(tranType)
            .subscribe((res: any) => {
                console.log(">>", res);
                this.orderNo = res;
                this.display = true;
                this.formType = tranType;
                let str = new Date().setSeconds(0, 0);
                this.dt = this.datePipe.transform(
                    new Date(str).toISOString(),
                    "MMM d, y, h a"
                );
                this.modalheaderName = tranName;
            });
    }

    ngOnInit() {
        // this._AppTransactionServiceProxy
        // .getRelatedAccounts()
        // .subscribe((res: any) => {
        //     console.log(res);
        // });
        const subs = this.userClickService.clickSubject$.subscribe((res) => {
            if (res == "refreshShoppingInfoInTopbar") {
                this.getShoppingCartInfo();
            }
        });

        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(this.attachmentBaseUrl + "/signalr-build")
            .build();
        this.hubConnection
            .start()
            .then(() => console.log("Connection started"))
            .catch((err) =>
                console.log("Error while starting connection: " + err)
            );

        this.hubConnection.on("SendBuildMessage", (data) => {
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
        if(!this.isHost)
          this.getShoppingCartInfo();

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

    fullName: string = "";
    setCurrentLoginInformations(): void {
        this.shownLoginName = this.appSession.getShownLoginName();
        this.tenancyName = this.appSession.tenancyName;
        this.userName = this.appSession.user.userName;
        this.name = this.appSession.user.name;
        this.fullName =
            this.appSession.user.name +' '+ this.appSession.user.surname;
        console.log(">>", this.appSession.user);
    }
    closeModal(value: boolean) {
        this.display = false;
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
        this.updateLogoService.profilePictureUpdated$.subscribe((res) => {
            this.profilePicture = res;
        });
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

    updateBuildWithUserId(): void {
        this._maintainancesServiceProxy
            .updateOpenBuildWithUserId(this.appSession.user.id)
            .subscribe(() => {
                this.notify.success(this.l("SuccessfullySaved"));
            });
        this._belowBar = false;
        this._belowBarMessage = "";
    }
    getBelowBar(): void {
        this._maintainancesServiceProxy.getOpenBuild().subscribe((data) => {
            this.belowBar(data);
        });
    }

    belowBar(data: GetMaintainanceForViewDto): void {
        if (data?.maintainance?.id > 0) {
            this._belowBar = !data.maintainance.dismissIds?.includes(
                this.appSession.user.id.toString() + "|"
            );
            this._belowBarMessage = this.l(
                "MaintainanceAlarm",
                new Date(
                    data.maintainance.from.toString()
                ).toLocaleDateString() +
                " " +
                new Date(
                    data.maintainance.from.toString()
                ).toLocaleTimeString(),
                new Date(data.maintainance.to.toString()).toLocaleDateString() +
                " " +
                new Date(
                    data.maintainance.to.toString()
                ).toLocaleTimeString()
            );
        } else {
            this._belowBar = false;
            this._belowBarMessage = "";
        }
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
        this._MessageServiceProxy.getUnreadCounts(null).subscribe((result) => {
            this.unreadMessageCount = result;
        });
    }

    getShoppingCartInfo(openShoppingCart: boolean = false) {
        this._AppTransactionServiceProxy.getCurrentUserActiveTransaction()
            .subscribe((res: ShoppingCartSummary) => {
                this.shoppingCartSummary = res;
                if (this.shoppingCartSummary.orderType == this._TransactionType.SalesOrder)
                    this.transactionType = "SO";
                if (this.shoppingCartSummary.orderType == this._TransactionType.PurchaseOrder)
                    this.transactionType = "PO";

                if (!this.shoppingCartSummary.sellerLogo)
                    this.defaultSellerLogo = "../../../assets/shoppingCart/Order-Details-Seller-logo.svg";
                if (!this.shoppingCartSummary.buyerLogo)
                    this.defaultBuyerLogo = "../../../assets/shoppingCart/Order-Details-Byer-logo.svg";


                  if(this.shoppingCartSummary?.amount)
                  this.shoppingCartSummary?.amount % 1 ==0?this.shoppingCartSummary.amount=parseFloat(Math.round(this.shoppingCartSummary.amount * 100 / 100).toFixed(2)):null; 

                if (openShoppingCart)
                    this.shoppingCartModal.show(this.shoppingCartSummary?.shoppingCartId, false);

                     //Currency
            this._AppEntitiesServiceProxy.getCurrencyInfo(res.currencyCode)
            .subscribe((res: CurrencyInfoDto) => {
                this.currencySymbol = res.symbol ? res.symbol : res.code  ;
            });

            });
            
    }

}

export interface TopbardropDown {
    title: string;
    icon: string;
    clickHandler: Object;
    displayCondition: boolean;
}
