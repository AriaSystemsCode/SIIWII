import { Component, Injector, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DashboardCustomizationConst } from '@app/shared/common/customizable-dashboard/DashboardCustomizationConsts';
import { Router } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';
import Swal from 'sweetalert2';
@Component({
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class DashboardComponent extends AppComponentBase {
    dashboardName = DashboardCustomizationConst.dashboardNames.defaultTenantDashboard;
    defaultLogo = AppConsts.appBaseUrl + '/assets/common/images/logo.png';
    constructor(
        injector: Injector,
        private router: Router,
    ) {
        super(injector);
        // workaround to prevent tenant from seeing the dashboard

        this.redirectTo();
    }

    async redirectTo() {
        if (this.appSession.tenantId && !this.appSession.user.accountId)
            await this.askForCompleteProfile();
        if (this.appSession.tenantId && this.appSession.user.accountId)
            this.router.navigate(['/app/main/Home'])
    }

    async askForCompleteProfile() {
       /*  Swal.fire({
            title: "",
            text: "Please Complete Your Profile Information",
            showCancelButton: true,
            cancelButtonText: "Later",
            icon: "warning",
            confirmButtonText: "Proceed",
            allowOutsideClick: false,
            allowEscapeKey: false,
            backdrop: true,
            customClass: {
                confirmButton: "swal-btn swal-confirm",
                cancelButton: "swal-btn",
                title: "swal-title",
            }, */
            Swal.fire({
                title: "",
                text: "Please Complete Your Profile Information",
                icon: "warning",
                showCancelButton: true,
                cancelButtonText: "Later",
                confirmButtonText: "Proceed",
                allowOutsideClick: false,
                customClass: {
                    popup: 'popup-class',
                    icon: 'icon-class',
                    content: 'content-class',
                    actions: 'actions-class',
                    confirmButton: 'confirm-button-class2'
                }
        }).then((result) => {
            if (result.isConfirmed)
            this.router.navigate(['/app/main/account'])
        else
            this.router.navigate(['/app/main/Home'])
        });
    }
}
