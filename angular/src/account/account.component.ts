import { Component, Injector, OnInit, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as _ from 'lodash';
import * as moment from 'moment';
import { LoginService } from './login/login.service';
import { AppEntitiesServiceProxy } from '@shared/service-proxies/service-proxies';

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

    tenantLogo:string
    tenantText:string
    tenantWordLogo:string
    public constructor(
        injector: Injector,
        private _router: Router,
        private _loginService: LoginService,
        viewContainerRef: ViewContainerRef,
           private _appEntitiesServiceProxy: AppEntitiesServiceProxy
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
        this._appEntitiesServiceProxy.getHostSettingValue(1204)
        .subscribe((result) => {
            const str = result
            const after = str.split("|")[1];
            const before = str.split("|")[0];


           this.tenantWordLogo = after
           console.log(after,'logo')
      
        });
        this._appEntitiesServiceProxy.getHostSettingValue(1205)
        .subscribe((result) => {
           this.tenantText = result
        });
        this._appEntitiesServiceProxy.getHostSettingValue(1206)
        .subscribe((result) => {
            const str = result
            const after = str.split("|")[1];
           this.tenantLogo = after
        });
    }
}
