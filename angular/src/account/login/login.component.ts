import { AbpSessionService } from "abp-ng2-module";
import { Component, Injector, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { accountModuleAnimation } from "@shared/animations/routerTransition";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    AccountServiceProxy,
    IsTenantAvailableInput,
    IsTenantAvailableOutput,
    SessionServiceProxy,
    TenantAvailabilityState,
    TenantServiceProxy,
    UpdateUserSignInTokenOutput,
} from "@shared/service-proxies/service-proxies";
import { UrlHelper } from "shared/helpers/UrlHelper";
import { ExternalLoginProvider, LoginService } from "./login.service";
import { ReCaptchaV3Service } from "ngx-captcha";
import { AppConsts } from "@shared/AppConsts";

@Component({
    templateUrl: "./login.component.html",
    animations: [accountModuleAnimation()],
    styleUrls: ["./login.component.scss"],
})
export class LoginComponent extends AppComponentBase implements OnInit {
    submitting = false;
    isMultiTenancyEnabled: boolean = this.multiTenancy.isEnabled;
    recaptchaSiteKey: string = AppConsts.recaptchaSiteKey;
    oldUserName:string;
    constructor(
        injector: Injector,
        public loginService: LoginService,
        private _router: Router,
        private _sessionService: AbpSessionService,
        private _sessionAppService: SessionServiceProxy,
        private _reCaptchaV3Service: ReCaptchaV3Service,
        private _tenantAppService: TenantServiceProxy,
        private _accountService: AccountServiceProxy
    ) {
        super(injector);
    }

    get multiTenancySideIsTeanant(): boolean {
        return this._sessionService.tenantId > 0;
    }

    get isTenantSelfRegistrationAllowed(): boolean {
        return this.setting.getBoolean(
            "App.TenantManagement.AllowSelfRegistration"
        );
    }

    get isSelfRegistrationAllowed(): boolean {
        if (!this._sessionService.tenantId) {
            return false;
        }

        return this.setting.getBoolean(
            "App.UserManagement.AllowSelfRegistration"
        );
    }

    ngOnInit(): void {

        if (
            this._sessionService.userId > 0 &&
            UrlHelper.getReturnUrl() &&
            UrlHelper.getSingleSignIn()
        ) {
            this._sessionAppService
                .updateUserSignInToken()
                .subscribe((result: UpdateUserSignInTokenOutput) => {

                    const initialReturnUrl = UrlHelper.getReturnUrl();
                    const returnUrl =
                        initialReturnUrl +
                        (initialReturnUrl.indexOf("?") >= 0 ? "&" : "?") +
                        "accessToken=" +
                        result.signInToken +
                        "&userId=" +
                        result.encodedUserId +
                        "&tenantId=" +
                        result.encodedTenantId;

                    location.href = returnUrl;
                });
        }

        let state = UrlHelper.getQueryParametersUsingHash().state;
        if (state && state.indexOf("openIdConnect") >= 0) {
            this.loginService.openIdConnectLoginCallback({});
        }
    }

    login(): void {

        let recaptchaCallback = (token: string) => {
            this.showMainSpinner();

            this.submitting = true;
            this.loginService.authenticate(
                () => {
                    this.submitting = false;
                    this.hideMainSpinner();
                },
                null,
                token
            );
        };

        if (this.useCaptcha) {
            this._reCaptchaV3Service.execute(
                this.recaptchaSiteKey,
                "login",
                (token) => {
                    recaptchaCallback(token);
                }
            );
        } else {
            recaptchaCallback(null);
        }
    }

    externalLogin(provider: ExternalLoginProvider) {
        this.loginService.externalAuthenticate(provider);
    }

    get useCaptcha(): boolean {
        return this.setting.getBoolean("App.UserManagement.UseCaptchaOnLogin");
    }

    getTenantIdbyUserName() {

        var username =
            this.loginService.authenticateModel.userNameOrEmailAddress;
        if (username && username!=this.oldUserName) {
            this._tenantAppService
                .getTenantIdByUserName(username)
                .subscribe((result) => {

                    this.changeTenant(result?.tenancyName);
                });
        }
        this.oldUserName=username;
    }

    changeTenant(tenancyName){


        if (!tenancyName) {
            abp.multiTenancy.setTenantIdCookie(undefined);
            return;
        }

        let input = new IsTenantAvailableInput();
        input.tenancyName = tenancyName;

        this._accountService.isTenantAvailable(input)
            .subscribe((result: IsTenantAvailableOutput) => {
                switch (result.state) {
                    case TenantAvailabilityState.Available:
                        abp.multiTenancy.setTenantIdCookie(result.tenantId);
                        return;
                    case TenantAvailabilityState.InActive:
                        this.message.warn(this.l('TenantIsNotActive', tenancyName));
                        break;
                    case TenantAvailabilityState.NotFound: //NotFound
                        this.message.warn(this.l('ThereIsNoTenantDefinedWithName{0}', tenancyName));
                }
            });
    }
}
