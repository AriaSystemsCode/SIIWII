import {
    Injector,
    Component,
    OnInit,
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
    ShoppingCartSummary,
    TransactionType,
    AppEntitiesServiceProxy,
    CurrencyInfoDto,
    LanguageServiceProxy,
    AccountsServiceProxy,
} from "@shared/service-proxies/service-proxies";

import { UrlHelper } from "@shared/helpers/UrlHelper";
import { Router } from "@angular/router";
import * as _ from "lodash";
import { UserClickService } from "@shared/utils/user-click.service";
import { MessageReadService } from "@shared/utils/message-read.service";
import { UpdateLogoService } from "@shared/utils/update-logo.service";
import * as signalR from "@microsoft/signalr";
import { MenuItem } from "primeng/api";
import { DatePipe } from "@angular/common";
import { TransactionInformationComponent } from "@app/main/transactions/app-TransactionTabsInfo/Components/transaction-information-component/transaction-information.component";
import Swal from "sweetalert2";


@Component({
    templateUrl: "./topbar.component.html",
    selector: "topbar",
    styleUrls: ["./topbar.component.scss"],
})
export class TopBarComponent extends ThemesLayoutBaseComponent implements OnInit {
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

       
    profilePicture = AppConsts.appBaseUrl + "/assets/common/images/default-profile-picture.png";
    defaultLogo = AppConsts.appBaseUrl + "/assets/common/images/app-logo-on-" + this.currentTheme?.baseSettings?.menu?.asideSkin + ".svg";
    recentlyLinkedUsers: LinkedUserDto[];
    unreadChatMessageCount = 0;
    unreadMessageCount = 0;
    chatConnected = false;
    installationMode = true;
    topbardropDown: TopbardropDown[] = [];
    display: boolean = false;
    items: MenuItem[];
    dt: string;
    roles: any[];
    orderNo: any;
    role: string;
    formType: string;

  
    modalheaderName: string;
    showSearch: boolean = false;
    shoppingCartSummary: ShoppingCartSummary;
    defaultSellerLogo: string = "";
    defaultBuyerLogo: string = "";
    _TransactionType = TransactionType;
    transactionType: string = "";
    @ViewChild("shoppingCartModal", { static: true }) shoppingCartModal: TransactionInformationComponent;
    currencySymbol: string = "";
    visible: boolean = false;
    displaneSel: boolean = false;
    displaneBuy: boolean = false;
    
   

    private profilePicSub: any;
    
   
    
   
    searchInput:string
    bgCol?: string;
    bgColLoaded = false;
    tenantLogo:string
    isAuthenticated: boolean = false;
    currentLang: string = 'en';
    isArabic: boolean = false;
    allowFeeds:string
    defaultHomeUrl = '/app/main/Home'; // fallback
   
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
        private datePipe: DatePipe,
        private _AppTransactionServiceProxy: AppTransactionServiceProxy,
        private _AppEntitiesServiceProxy: AppEntitiesServiceProxy   ,
        private _accountsServiceProxy: AccountsServiceProxy,
    ) {
        super(injector);
        this.showMainSpinner();
        this.tenantRoleService.loadRoles().then(() => {
            this.buildItems();
            this.hideMainSpinner();
        });

    }

    buildItems() {
        this.items = [
            {
                items: [
                    {
                        label: "Sales Order",
                        command: () => {
                            if (!this.tenantRoleService.canCreateSO()) {
                                this.showNoCreatePermissionAlert();
                                return;
                            }
                            this.roles = this.tenantRoleService.soRolesOptions;
                            this.getOderNumber("SO", "Sales Order");
                        },
                    },

                    {
                        label: "Purchase Order",
                        command: () => {
                            if (!this.tenantRoleService.canCreatePO()) {
                                this.showNoCreatePermissionAlert();
                                return;
                            }
                            this.roles = this.tenantRoleService.poRolesOptions;
                            this.getOderNumber("PO", "Purchase Order");

                        },
                    },
                ],
            },
        ];
    }

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
        this.isAuthenticated = !!this.appSession?.user;
       this.loadDefaultPage()
        this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
        this.currentLang == 'ar' || this.currentLang == 'ar-EG'  ? this.isArabic = true : this.isArabic = false
        this.defaultSellerLogo = '../../../assets/shoppingCart/Order-Details-Seller-logo.svg';
        this.defaultBuyerLogo = '../../../assets/shoppingCart/Order-Details-Byer-logo.svg';

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

        });

        this.installationMode = UrlHelper.isInstallUrl(location.href);
        this.isHost = !this._abpSessionService.tenantId;
        this.isMultiTenancyEnabled = this._abpMultiTenancyService.isEnabled;
        this.isImpersonatedLogin =
            this._abpSessionService.impersonatorUserId > 0;
            if(this.isAuthenticated != undefined) {
                this.setCurrentLoginInformations();
                this.getProfilePicture();
                this.getRecentlyLinkedUsers();
                this.appSession?.user?.memberId;
                this.appSession?.user?.id;
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
        this.shownLoginName = this.appSession?.getShownLoginName();
        this.tenancyName = this.appSession?.tenancyName;
        this.userName = this.appSession?.user?.userName;
        this.name = this.appSession?.user?.name;
        this.fullName =
            this.appSession?.user?.name + ' ' + this.appSession?.user?.surname;
       
    }
    closeModal(value: boolean) {
        this.display = false;
    }

    getShownUserName(linkedUser: LinkedUserDto): string {
        if (!this._abpMultiTenancyService.isEnabled) {
            return linkedUser?.username;
        }

        return (
            (linkedUser.tenantId ? linkedUser.tenancyName : ".") +
            "\\" +
            linkedUser?.username
        );
    }

    getProfilePicture(): void {
        if (this.profilePicSub) return;
      
        this.profilePicSub = this.updateLogoService.profilePictureUpdated$
          .subscribe((res) => {
            this.profilePicture = res || (AppConsts.appBaseUrl + "/assets/common/images/default-profile-picture.png");
          });
      }
      

    getRecentlyLinkedUsers(): void {
        this._userLinkServiceProxy
            .getRecentlyUsedLinkedUsers()
            .subscribe((result) => {
                this.recentlyLinkedUsers = result?.items;
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
            if (result) {
                this.unreadMessageCount = result;

            }
        });
    }


    onImageError(event: any, type: 'seller' | 'buyer') {
        event.target.src = type === 'seller' ? this.defaultSellerLogo : this.defaultBuyerLogo;
    }

    getShoppingCartInfo(openShoppingCart: boolean = false) {
        this._AppTransactionServiceProxy.getCurrentUserActiveTransaction()
            .subscribe((res: ShoppingCartSummary) => {
                this.shoppingCartSummary = res;
                if (this.shoppingCartSummary?.orderType == this._TransactionType?.SalesOrder)
                    this.transactionType = "SO";
                if (this.shoppingCartSummary?.orderType == this._TransactionType?.PurchaseOrder)
                    this.transactionType = "PO";


                if (this.shoppingCartSummary?.amount)
                    this.shoppingCartSummary?.amount % 1 == 0 ? this.shoppingCartSummary.amount = parseFloat(Math.round(this.shoppingCartSummary.amount * 100 / 100).toFixed(2)) : null;

                if (openShoppingCart)
                    this.shoppingCartModal.show(this.shoppingCartSummary?.shoppingCartId, false);

                //Currency
                this._AppEntitiesServiceProxy.getCurrencyInfo(res?.currencyCode)
                    .subscribe((res: CurrencyInfoDto) => {
                        this.currencySymbol = res?.symbol ? res?.symbol : res?.code;
                    });

            });

    }

    CreateBusiness_GroupAccount(accout_type: string, account_name: string): void {

        let type = accout_type;
        let accountname = account_name;
        let email = this.appSession.user.emailAddress;
        let url = this.appUrlService.appRootUrl;
        let tenantName = this.appSession.tenant.name;
        //let tenantName =this.appSession.tenancyName;
        let firstName = btoa(this.appSession.user.name);
        let lastName = btoa(this.appSession.user.surname);
        let relatedTenantId = this.appSession.tenantId;
        const htmlTitle: string = `<div class="font-weight-bold"><p class="text-left alarmInfo_title"> <img src="../../assets/img/input_icons/alarm.png" class="alarmInfo mr-2"/> A registration Email has been Sent to ` + email + ` </p> </div> `;
        const htmlContent: string = `<p class="pleaseClick" style="color: #9E9E9E;">*Please Click on the register link in the email in order to create the new  Business | group account. </p> `;
        var tenantId;
        if (this.appSession?.tenantId)
            tenantId = this.appSession?.tenantId?.toString();
        else tenantId = null;
        let link = url + "/account/select-edition?editionId=1&subscriptionStartType=1&accountTypeLabel=" + type + "&accountType=" + type + "&firstName=" + firstName + "&lastName=" + lastName + "&relatedTenantId=" + relatedTenantId;
        Swal.fire({
            title: htmlTitle,
            html: htmlContent,
            showCancelButton: false,
            //cancelButtonText: this.l("No"),
            confirmButtonText: "okay",
            allowOutsideClick: false,
            allowEscapeKey: false,
            backdrop: true,
            customClass: {
                popup: 'popup_container popup_container_CreateBusiness_GroupAccount',
                content: 'popup_content',
                actions: 'popup_actions',
                confirmButton: 'popp_confirm-button',

            },
        }).then((result) => {
            if (result.isConfirmed) {

                this._accountsServiceProxy.sendRegistrationEmail(email, tenantId, type, link, tenantName).subscribe(
                    response => {
                        console.log('Email sent successfully', response);
                    })
            }
        })
    }

    onSearch(ev?: Event): void {
        ev?.preventDefault(); //  stop native form submit
        const q = (this.searchInput ?? '').trim();
      
        this.router.navigate(
          ['/app/main/marketplace/products'],
          {
            queryParams: { q: q || null },      // null removes it when empty
            queryParamsHandling: 'merge',
            replaceUrl: false
          }
        );
      }
      
      getTenantData() {
        this._AppEntitiesServiceProxy.getHostSettingValue(1208, null)
        .subscribe((result) => {
          this.bgCol = result;
          this.bgColLoaded = true; 
        });
    
      this._AppEntitiesServiceProxy.getHostSettingValue(1204, "file")
        .subscribe((result) => {
          this.tenantLogo = result;
        });

            
      this._AppEntitiesServiceProxy.getHostSettingValue(1207, null)
      .subscribe((result) => {
        this.allowFeeds = result;
      });
    }

    loadDefaultPage(): void {
      
        this.getTenantData()
          if(!this.isAuthenticated){
                this.defaultHomeUrl = '/app/main/marketplace';
                return
        }
        this._AppEntitiesServiceProxy.getHostSettingValue(1203, null)
          .subscribe({
            next: (res2: string) => {
              if (res2 === 'Marketplace' && this.allowFeeds != 'Yes') {
                this.defaultHomeUrl = '/app/main/marketplace';
              } else {
                this.defaultHomeUrl = '/app/main/Home';
              }
            },
            error: err2 => {
              console.error('Failed to load host setting 1203', err2);
              this.defaultHomeUrl = '/app/main/Home'; // or dashboard if you want
            }
          });
      }
      onImgErr(evt: Event) {
        (evt.target as HTMLImageElement).src = '/assets/placeholders/_logo-placeholder.png';
      }
    ngOnDestroy(): void {
        if (this.profilePicSub) {
          this.profilePicSub.unsubscribe();
        }
      }
      
}


export interface TopbardropDown {
    title: string;
    icon: string;
    clickHandler: Object;
    displayCondition: boolean;
}
