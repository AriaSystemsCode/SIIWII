import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SycAttachmentTypesComponent } from './systemObjects/sycAttachmentTypes/sycAttachmentTypes.component';
import { DashboardComponent } from "./dashboard/dashboard.component";

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: "",
                // component: MainComponent,

                children: [
                    { path: 'systemObjects/sycAttachmentTypes', component: SycAttachmentTypesComponent, data: { permission: 'Pages.SycAttachmentTypes' }  },
                    //Iteration13
                    {
                        path: "Home",
                        loadChildren: () =>
                            import("./home/home.module").then(
                                (m) => m.HomeModule
                            )
                    },
                    //Iteration13
                    {
                        path: "products",
                        loadChildren: () =>
                            import(
                                "./app-items/appItems/app-items.module"
                            ).then((m) => m.AppItemsModule),
                        data: { preload: true },
                    },
                    {
                        path: "productslists",
                        loadChildren: () =>
                            import(
                                "./app-items/app-items-list/app-items-list.module"
                            ).then((m) => m.AppItemsListModule),
                        data: { preload: true },
                    },
                    {
                        path: "systemObjects",
                        loadChildren: () =>
                            import("./systemObjects/systemObjects.module").then(
                                (m) => m.SystemObjectsModule
                            ),
                        data: { preload: true },
                    },
                    {
                        path: "account",
                        loadChildren: () =>
                            import("./accountInfos/accountInfos.module").then(
                                (m) => m.AccountInfosModule
                            ),
                        data: { preload: true },
                    },
                    {
                        path: "accounts",
                        loadChildren: () =>
                            import("./accounts/accounts/account.module").then(
                                (m) => m.AccountModule
                            ),
                        data: { preload: true },
                    },
                    {
                        path: "lookups",
                        loadChildren: () =>
                            import("./appEntities/appEntities.module").then(
                                (m) => m.AppEntitiesModule
                            ),
                        data: { preload: true },
                    },
                    {
                        path: "Messages",
                        loadChildren: () =>
                            import("./Messages/messages.module").then(
                                (m) => m.MessagesModule
                            ),
                        data: { 
                            preload: true,
                            permission: "Pages.AppMessage",
                        },
                    },
                    {
                        path: "marketplace",
                        children: [
                            {
                                path: "",
                                loadChildren: () =>
                                    import(
                                        "./SycLandingPageSettings/SycLandingPageSettings.module"
                                    ).then(
                                        (m) => m.SycLandingPageSettingsModule
                                    ),
                                data: {
                                    preload: true,
                                    permission: "Pages.Marketplace",
                                },
                            },
                            {
                                path: "accounts",
                                loadChildren: () =>
                                    import(
                                        "./marketplace/marketplace-accounts/marketplace-accounts.module"
                                    ).then((m) => m.MarketplaceAccountsModule),
                                data: {
                                    preload: true,
                                    permission: "Pages.Marketplace.Accounts",
                                },
                            },
                            {
                                path: "contacts",
                                loadChildren: () =>
                                    import(
                                        "./marketplace/marketplace-contacts/marketplace-contacts.module"
                                    ).then((m) => m.MarketplaceContactsModule),
                                data: {
                                    preload: true,
                                    permission: "Pages.Marketplace.Contacts",
                                },
                            },
                            {
                                path: "products",
                                loadChildren: () =>
                                    import(
                                        "./marketplace/marketplace-products/marketplace-products.module"
                                    ).then((m) => m.MarketplaceProductsModule),
                                data: {
                                    preload: true,
                                    permission: "Pages.Marketplace.Products",
                                },
                            },
                            {
                                path: "events",
                                loadChildren: () =>
                                    import(
                                        "./marketplace/marketplace-events/marketplace-events.module"
                                    ).then((m) => m.MarketplaceEventsModule),
                                data: {
                                    preload: true,
                                    permission: "Pages.Marketplace.Events",
                                },
                            },
                        ],
                        data: {
                            permission: "Pages.Marketplace",
                        },
                    },

                    
                    // { path: 'systemObjects/sycAttachmentCategories', component: SycAttachmentCategoriesComponent, data: { permission: 'Pages.SycAttachmentCategories' }  },
                    // { path: 'myaccount', component: AccountInfoComponent, data: { permission: 'Pages.AccountInfo' }  },
                    // { path: 'accounts', component: AccountsComponent, data: { permission: 'Pages.AccountInfo' }  },
                    // { path: 'accounts/viewProfile/:id', component: ViewProfileComponent, data: { permission: 'Pages.AccountInfo' }  },
                    // { path: 'systemObjects/suiIcons', component: SuiIconsComponent, data: { permission: 'Pages.SuiIcons' }  },
                    // { path: 'lookups', component: AppEntitiesComponent, data: { permission: 'Pages.AppEntities' } },
                    // { path: 'systemObjects/sycEntityObjectClassifications', component: SycEntityObjectClassificationsComponent, data: { permission: 'Pages.SycEntityObjectClassifications' }  },
                    // { path: 'systemObjects/sycEntityObjectStatuses', component: SycEntityObjectStatusesComponent, data: { permission: 'Pages.SycEntityObjectStatuses' }  },
                    // { path: 'systemObjects/sycEntityObjectCategories', component: SycEntityObjectCategoriesComponent, data: { permission: 'Pages.SycEntityObjectCategories' }  },
                    // { path: 'systemObjects/sycEntityObjectTypes', component: SycEntityObjectTypesComponent, data: { permission: 'Pages.SycEntityObjectTypes' }  },
                    // { path: 'systemObjects/sydObjects', component: SydObjectsComponent, data: { permission: 'Pages.SydObjects' }  },
                    // { path: 'systemObjects/sysObjectTypes', component: SysObjectTypesComponent, data: { permission: 'Pages.SysObjectTypes' }  },
                    {
                        path: "dashboard",
                        component: DashboardComponent,
                        data: { permission: "Pages.Tenant.Dashboard" },
                    },
                    //Esraa [Start]
                    // { path: 'Messages', component: MessagesComponent },
                    //Esraa [End]
                    { path: "", redirectTo: "dashboard", pathMatch: "full" },
                    {
                        path: "dev-express-demo",
                        loadChildren: () =>
                            import(
                                "./dev-express-demo/dev-express-demo.module"
                            ).then((m) => m.DevExpressDemoModule),
                        data: { preload: true },
                    },
                    {
                        path: 'linesheet',
                        loadChildren: () => import('./app-items/appitems-catalogue-report/appitems-catalogue-report.module').then(m => m.AppitemsCatalogueReportModule),
                        data: { preload: true }
                    },
                    { path: "**", redirectTo: "dashboard" },
                ],
            },
        ]),
    ],
    exports: [RouterModule],
})
export class MainRoutingModule {}
