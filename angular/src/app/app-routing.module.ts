import { NgModule } from '@angular/core';
import { NavigationEnd, RouteConfigLoadEnd, RouteConfigLoadStart, Router, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { AppRouteGuard } from './shared/common/auth/auth-route-guard';
import { NotificationsComponent } from './shared/layout/notifications/notifications.component';
import { NgxSpinnerService } from 'ngx-spinner';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: 'app',
                component: AppComponent,
                canActivate: [AppRouteGuard],
                canActivateChild: [AppRouteGuard],
                children: [
                    {
                        path: '',
                        children: [
                            { path: 'notifications', component: NotificationsComponent },
                            { path: '', redirectTo: '/app/main/dashboard', pathMatch: 'full' }
                        ]
                    },
                    {
                        path: 'main',
                        loadChildren: () => import('app/main/main.module').then(m => m.MainModule), //Lazy load main module
                        data: { preload: true }
                    },

                    // {
                    //     path: 'systemObjects',
                    //     loadChildren: () => import('app/main/systemObjects/systemObjects.module').then(m => m.SystemObjectsModule),
                    //     data: { preload: true }
                    // },
                    // {
                    //     path: 'accounts',
                    //     loadChildren: () => import('app/main/accounts/generalAccount.module').then(m => m.GeneralAccountModule),
                    //     data: { preload: true }
                    // },
                    {
                        path: 'admin',
                        loadChildren: () => import('app/admin/admin.module').then(m => m.AdminModule), //Lazy load admin module
                        data: { preload: true },
                        canLoad: [AppRouteGuard]
                    },
                    {
                        path: 'demo',
                        loadChildren: () => import('app/demos/app-items-multi-selection-demo/app-items-multi-selection-demo.module').then(m => m.AppItemsMultiSelectionDemoModule), //Lazy load admin module
                        data: { preload: true },
                    },
                    {
                        path: '**', redirectTo: 'notifications'
                    }
                ]
            }
        ])
    ],
    exports: [RouterModule]
})

export class AppRoutingModule {
    constructor(
        private router: Router,
        private spinnerService: NgxSpinnerService
    ) {
        router.events.subscribe((event) => {

            if (event instanceof RouteConfigLoadStart) {
                spinnerService.show();
            }

            if (event instanceof RouteConfigLoadEnd) {
                spinnerService.hide();
            }

            if (event instanceof NavigationEnd) {
                document.querySelector('meta[property=og\\:url').setAttribute('content', window.location.href);
                document?.getElementById("kt_scrolltop")?.click();
            }
        });
    }
}
