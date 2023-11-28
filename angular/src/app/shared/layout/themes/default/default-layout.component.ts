import { Injector, Component, OnInit, Inject } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { ThemesLayoutBaseComponent } from '@app/shared/layout/themes/themes-layout-base.component';
import { UrlHelper } from '@shared/helpers/UrlHelper';
import { DOCUMENT } from '@angular/common';
import { OffcanvasOptions } from '@metronic/app/core/_base/layout/directives/offcanvas.directive';
import { AppConsts } from '@shared/AppConsts';
import { AccountsServiceProxy} from '@shared/service-proxies/service-proxies';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'default-layout',
    templateUrl: './default-layout.component.html',
    styleUrls:['./default-layout.component.scss'],
    animations: [appModuleAnimation()],
})
export class DefaultLayoutComponent extends ThemesLayoutBaseComponent implements OnInit {
    defaultLogo = AppConsts.appBaseUrl + '/assets/common/images/app-logo-on-dark.svg';
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
    constructor(
        injector: Injector,
        @Inject(DOCUMENT) private document: Document,
        private _accountsServiceProxy: AccountsServiceProxy,
        private _router:Router,
    ) {
        super(injector);
        this.subscribeToMarketPlace()
    }

    ngOnInit() {
        this.installationMode = UrlHelper.isInstallUrl(location.href);
        this.getSidebarInfo();
    }
    getSidebarInfo(){
        this._accountsServiceProxy.getAccountSummary().subscribe(result =>{
            this.accountSummary = result;
        })
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
}
