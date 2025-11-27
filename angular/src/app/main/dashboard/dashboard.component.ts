import { Component, Injector, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DashboardCustomizationConst } from '@app/shared/common/customizable-dashboard/DashboardCustomizationConsts';
import { Router } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';
import Swal from 'sweetalert2';
import { AppEntitiesServiceProxy } from '@shared/service-proxies/service-proxies';
@Component({
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class DashboardComponent extends AppComponentBase {
    dashboardName = DashboardCustomizationConst.dashboardNames.defaultTenantDashboard;
    defaultLogo = AppConsts.appBaseUrl + '/assets/common/images/logo.png';
    defaultUrl:string
    constructor(
        injector: Injector,
        private router: Router,
            private _appEntitiesServiceProxy: AppEntitiesServiceProxy
    ) {
        super(injector);
        // workaround to prevent tenant from seeing the dashboard
        this.chooseDefaultPage()

        this.redirectTo();
    }

    async redirectTo() {
        console.log(this.defaultUrl,'defau')
       
      this.router.navigate(['/app/main/Home'])
    
        
        if (this.appSession.tenantId && !this.appSession.user.accountId)
            await this.askForCompleteProfile();
    }

    async askForCompleteProfile() {
  
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
        });
    }
    chooseDefaultPage(){

        this._appEntitiesServiceProxy.getHostSettingValue(1213,null).subscribe({
            next: res => {
                this.defaultUrl = '/app/main/Home';

                if (res) {

                    // const value = res;
                    if (res === 'Marketplace Landing page') {
                        this.defaultUrl = '/app/main/marketplace';
                    } else if (res === 'Feed (SIIWII homepage)') {
                        this.defaultUrl = '/app/main/Home';
                    }
                }
            },
       
          });
    
    }
}
