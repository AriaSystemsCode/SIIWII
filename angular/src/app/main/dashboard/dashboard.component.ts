import { Component, Injector, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DashboardCustomizationConst } from '@app/shared/common/customizable-dashboard/DashboardCustomizationConsts';
import { Router } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';

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
        private router:Router) {
        super(injector);
        // workaround to prevent tenant from seeing the dashboard
       
        if(this.appSession.tenantId)   
        //this.router.navigate(['/app/main/account'])
        this.router.navigate(['/app/main/Home'])
    }
}
