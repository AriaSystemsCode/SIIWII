import { Component, Injector } from "@angular/core";
import { Router } from "@angular/router";
import { accountModuleAnimation } from "@shared/animations/routerTransition";
import { AppComponentBase } from "@shared/common/app-component-base";
import { AppUrlService } from "@shared/common/nav/app-url.service";
import {
    AccountServiceProxy,
    IsTenantAvailableInput,
    IsTenantAvailableOutput,
    SendUserResetPasswordCodeInput,
    TenantAvailabilityState,
} from "@shared/service-proxies/service-proxies";
import { finalize } from "rxjs/operators";

@Component({
    templateUrl: "./forgot-password.component.html",
    animations: [accountModuleAnimation()],
    styleUrls: ['./forgot-password.component.scss'],

})
export class ForgotPasswordComponent extends AppComponentBase {
    model: SendUserResetPasswordCodeInput =
        new SendUserResetPasswordCodeInput();

    saving = false;

    constructor(
        injector: Injector,
        private _accountService: AccountServiceProxy,
        private _appUrlService: AppUrlService,
        private _router: Router
    ) {
        super(injector);
    }

    save(): void {

        if (!this.model?.userName) {
            abp.multiTenancy.setTenantIdCookie(undefined);
            return;
        }

        let input = new IsTenantAvailableInput();
        const myArray = this.model?.userName.split("@");
        if(myArray.length > 1 && myArray[1] !="")
         input.tenancyName = myArray[1];

         else
         input.tenancyName = this.model?.userName;

        this._accountService
            .isTenantAvailable(input)
            .subscribe((result: IsTenantAvailableOutput) => {
                switch (result.state) {
                    case TenantAvailabilityState.InActive:
                        this.message.warn(
                            this.l("TenantIsNotActive", this.model?.userName)
                        );
                       return;

                    case TenantAvailabilityState.NotFound: //NotFound
                        this.message.warn(
                            this.l(
                                "ThereIsNoTenantDefinedWithName{0}",
                                this.model?.userName
                            )
                        );
                        return;

                        case TenantAvailabilityState.Available:
                            abp.multiTenancy.setTenantIdCookie(result.tenantId);
                }

                this.saving = true;
                this._accountService
                    .sendPasswordResetCode(this.model)
                    .pipe(
                        finalize(() => {
                            this.saving = false;
                        })
                    )
                    .subscribe(() => {
                        this.message
                            .success(
                                this.l("PasswordResetMailSentMessage"),
                                this.l("MailSent")
                            )
                            .then(() => {
                                this._router.navigate(["account/login"]);
                            });
                    });
            });
    }
}
