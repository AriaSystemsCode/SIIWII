import { Component, Injector, OnInit, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as _ from 'lodash';
import * as moment from 'moment';
import { LoginService } from './login/login.service';
import { AppEntitiesServiceProxy } from '@shared/service-proxies/service-proxies';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    templateUrl: './account.component.html',
    styleUrls: [
        './account.component.scss'
    ],
    encapsulation: ViewEncapsulation.None
})
export class AccountComponent extends AppComponentBase implements OnInit {
    defaultLogo = AppConsts.appBaseUrl + '/assets/common/images/logo.png';
    private viewContainerRef: ViewContainerRef;

    currentYear: number = moment().year();
    remoteServiceBaseUrl: string = AppConsts.remoteServiceBaseUrl;
    tenantChangeDisabledRoutes: string[] = [
        'select-edition',
        'buy',
        'upgrade',
        'extend',
        'register-tenant',
        'stripe-purchase',
        'stripe-subscribe',
        'stripe-update-subscription',
        'paypal-purchase',
        'stripe-payment-result',
        'payment-completed',
        'stripe-cancel-payment',
        'session-locked'
    ];

    tenantLogo:any
    tenantName:string
    tenantWordLogo:any
    bgCol:string
    public constructor(
        injector: Injector,
        private _router: Router,
        private _loginService: LoginService,
        viewContainerRef: ViewContainerRef,
           private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
           private sanitizer: DomSanitizer
    ) {
        super(injector);

        // We need this small hack in order to catch application root view container ref for modals
        this.viewContainerRef = viewContainerRef;
    }

    showTenantChange(): boolean {
        if (!this._router.url) {
            return false;
        }

        if (_.filter(this.tenantChangeDisabledRoutes, route => this._router.url.indexOf('/account/' + route) >= 0).length) {
            return false;
        }

        return abp.multiTenancy.isEnabled && !this.supportsTenancyNameInUrl();
    }

    useFullWidthLayout(): boolean {
        return this._router.url.indexOf('/account/select-edition') >= 0;
    }

    ngOnInit(): void {
        this._loginService.init();
       // document.body.className = this._uiCustomizationService.getAccountModuleBodyClass();
       this.getTenantData()
    }

    goToHome(): void {
        (window as any).location.href = '/';
    }

    getBgUrl(): string {
        return 'url(./assets/metronic/themes/' + this.currentTheme.baseSettings.theme + '/images/bg/bg-4.jpg)';
    }

    private supportsTenancyNameInUrl() {
        return (AppConsts.appBaseUrlFormat && AppConsts.appBaseUrlFormat.indexOf(AppConsts.tenancyNamePlaceHolderInUrl) >= 0);
    }

    getTenantData() {
        this._appEntitiesServiceProxy.getHostSettingValue(1204,"file")
        .subscribe((result) => {
            const url = this.attachmentBaseUrl + '/' + result;
            this.tenantWordLogo = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        });
        this._appEntitiesServiceProxy.getHostSettingValue(1205,null)
        .subscribe((result) => {
           this.tenantName = result
        });
        this._appEntitiesServiceProxy.getHostSettingValue(1206,"file")
        .subscribe((result) => {
            const url = this.attachmentBaseUrl + '/' + result;
            this.tenantLogo = this.sanitizer.bypassSecurityTrustResourceUrl(url);

        });
        this._appEntitiesServiceProxy.getHostSettingValue(1208,null)
        .subscribe((result) => {
           this.bgCol = result 
    
        });
    }
}
