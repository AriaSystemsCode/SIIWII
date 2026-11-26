import { Injector, Component, OnInit, Inject } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { ThemesLayoutBaseComponent } from '@app/shared/layout/themes/themes-layout-base.component';
import { UrlHelper } from '@shared/helpers/UrlHelper';
import { DOCUMENT } from '@angular/common';
import { OffcanvasOptions } from '@metronic/app/core/_base/layout/directives/offcanvas.directive';
import { AppConsts } from '@shared/AppConsts';
import { AccountsServiceProxy} from '@shared/service-proxies/service-proxies';
import {  NavigationEnd,Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppNavigationService } from '../../nav/app-navigation.service';
import { AppMenu } from '../../nav/app-menu';
import { OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AccountRefreshService } from '@shared/utils/account-refresh.service';



@Component({
    selector: 'default-layout',
    templateUrl: './default-layout.component.html',
    styleUrls:['./default-layout.component.scss'],
    animations: [appModuleAnimation()],
})
export class DefaultLayoutComponent extends ThemesLayoutBaseComponent implements OnInit {
    defaultLogo = AppConsts.appBaseUrl + '/assets/common/images/default-profile-picture.png';
    displayMarketPlace : boolean
    menuCanvasOptions: OffcanvasOptions = {
        baseClass: 'kt-aside',
        overlay: true,
        closeBy: 'kt_aside_close_btn',
        toggleBy: {
            target: 'kt_aside_mobile_toggler',
            state: 'kt-header-mobile__toolbar-toggler--active'
        }
    };

    remoteServiceBaseUrl: string = AppConsts.remoteServiceBaseUrl;
    attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;
    accountSummary:any;
    openSideBar:boolean;
    isMinimized = true;
    menu: AppMenu = null;

    currentRouteUrl = '';
    openSub = false
    openAdSub= false
    tenantLogo:any;
    currentLang:string
    isArabic:boolean 

  
    isAuthenticated = this.appSession?.user
    hideTopbar: boolean = false;

    

    constructor(
        injector: Injector,
        @Inject(DOCUMENT) private document: Document,
        private _accountsServiceProxy: AccountsServiceProxy,
        private _router:Router,
        private _appNavigationService: AppNavigationService,
private accountRefreshService: AccountRefreshService


    ) {
        super(injector);
        this.subscribeToMarketPlace()
    }

    ngOnInit() {
        
this.accountRefreshService.accountUpdated$
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {

        if (data?.name) {

            this.accountSummary = {
                ...(this.accountSummary || {}),
                name: data.name
            };
        }

        // Do not immediately request GetAccountSummary here:
        // it could return an older name and overwrite the new one.
    });

        this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
        this.currentLang == 'ar' || this.currentLang == 'ar-EG'  ? this.isArabic = true : this.isArabic = false
        this.installationMode = UrlHelper.isInstallUrl(location.href);
        this.getSidebarInfo();
        this.menu = this._appNavigationService.getMenu();

        this.currentRouteUrl = this._router.url.split(/[?#]/)[0];
        this.updateTopbarVisibility(this.currentRouteUrl);
      
    
        this._router.events
          .pipe(filter(event => event instanceof NavigationEnd))
          .subscribe(() => {
            this.currentRouteUrl = this._router.url.split(/[?#]/)[0];
            this.updateTopbarVisibility(this.currentRouteUrl);
         
          });
      }
      
    
      toggleSidebar() {
        this.isMinimized = !this.isMinimized;
      }
      showMenuItem(menuItem): boolean {


        return this._appNavigationService.showMenuItem(menuItem);
    }
    // getSidebarInfo(){
   
    //     this._accountsServiceProxy.getAccountSummary().subscribe(result =>{
    //         this.accountSummary = result;

    //         if(result.logoUrl!=undefined)
    //             this.tenantLogo=`${this.attachmentBaseUrl}/${this.accountSummary.logoUrl}`

    //     })
    // }
 
    
getSidebarInfo(): void {
    this._accountsServiceProxy
        .getAccountSummary()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
            next: result => {
                this.accountSummary = result;

                this.tenantLogo = result?.logoUrl
                    ? `${this.attachmentBaseUrl}/${result.logoUrl}`
                    : this.defaultLogo;
            },
            error: error => {
                console.error(
                    'Failed to refresh account summary',
                    error
                );
            }
        });
}

    onupdateAccountSummary($event){
        this.accountSummary=$event;
    }
    onLogoImageError($event){
        $event.target.src = this.defaultLogo
    }
    handleFailedImage($event){
        $event.target.src= this.defaultLogo
    }
    
    marketPlaceUrl : string = "marketplace"
    subscribeToMarketPlace(){
        const url = this._router.url
        this.checkIsCurrentUrlMarketPlace(url)
        const routerNavigationHandler : Subscription = this.__router.events
        .pipe(
            filter(event=>event instanceof NavigationEnd)
        )
        .subscribe(
            (event) => {
                const url = this.__router.routerState.snapshot.url
                this.checkIsCurrentUrlMarketPlace(url)
            }
        )
    }
    checkIsCurrentUrlMarketPlace(url:string){
        this.displayMarketPlace = url.includes(this.marketPlaceUrl)
    }
    onOpenSideBar($event:boolean){
        this.openSideBar=$event
    }

    private readonly ACCOUNT_ROUTES = [
        'login',
        'register',
        'register-tenant',
        'register-tenant-result',
        'forgot-password',
        'reset-password',
        'email-activation',
        'confirm-email',
        'send-code',
        'verify-code',
        'buy',
        'extend',
        'upgrade',
        'select-edition',
        'paypal-purchase',
        'stripe-purchase',
        'stripe-payment-result',
        'stripe-cancel-payment',
        'payment-completed',
        'session-locked',
      ];
      
      private updateTopbarVisibility(path: string): void {
        const cleanPath = path.split(/[?#]/)[0]; // remove query + hash
      
        this.hideTopbar = this.ACCOUNT_ROUTES.some(route =>
          cleanPath === `/app/account/${route}` ||
          cleanPath === `/app/main/account/${route}`
        );
      }


ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
}

      
      
}
