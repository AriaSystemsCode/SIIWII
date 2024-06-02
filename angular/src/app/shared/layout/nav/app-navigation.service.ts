import { PermissionCheckerService } from 'abp-ng2-module';
import { AppSessionService } from '@shared/common/session/app-session.service';

import { Injectable } from '@angular/core';
import { AppMenu } from './app-menu';
import { AppMenuItem } from './app-menu-item';

@Injectable()
export class AppNavigationService {
    isHost = !this._appSessionService.tenantId
    constructor(
        private _permissionCheckerService: PermissionCheckerService,
        private _appSessionService: AppSessionService
    ) {

    }

    getMenu(): AppMenu {
        let menu: AppMenu =
            new AppMenu('MainMenu', 'MainMenu', [

                new AppMenuItem('Dashboard', 'Pages.Administration.Host.Dashboard', 'flaticon-line-graph', '/app/admin/hostDashboard'),
                // new AppMenuItem('Dashboard', 'Pages.Tenant.Dashboard', 'flaticon-line-graph', '/app/main/dashboard'),

               new AppMenuItem('My Transactions', 'Pages.AppSiiwiiTransactions', 'flaticon-more', '/app/admin/appTransactions/MyTransactions'),
              //  new AppMenuItem('My Transactions', '', 'flaticon-more', '/app/admin/appTransactions/MyTransactions'),

                new AppMenuItem('MyAccounts', 'Pages.Accounts', 'flaticon-more', '/app/main/accounts'),

               // new AppMenuItem("Messages", 'Pages.AppMessage', "flaticon-app", "/app/main/Messages"),

                // new AppMenuItem("DevExpress", null,"flaticon-app","",[],[
                //     new AppMenuItem("Designer", null,"flaticon-app","/app/main/dev-express-demo/designer"),
                //     new AppMenuItem("Viewer", null,"flaticon-app","/app/main/dev-express-demo/viewer"),
                // ])
            ])
        if (this.isHost) {
            menu.items.push(
                new AppMenuItem('System Objects', '', 'flaticon-interface-8', '', [], [
                    new AppMenuItem('Object Types', 'Pages.SysObjectTypes', 'flaticon-more', '/app/main/systemObjects/sysObjectTypes'),
                    new AppMenuItem('Objects', 'Pages.SydObjects', 'flaticon-more', '/app/main/systemObjects/sydObjects'),
                    new AppMenuItem('Entity Object Types', 'Pages.SycEntityObjectTypes', 'flaticon-more', '/app/main/systemObjects/sycEntityObjectTypes'),
                    new AppMenuItem('Entity Categories', 'Pages.SycEntityObjectCategories', 'flaticon-more', '/app/main/systemObjects/sycEntityObjectCategories'),
                    new AppMenuItem('Entity Statuses', 'Pages.SycEntityObjectStatuses', 'flaticon-more', '/app/main/systemObjects/sycEntityObjectStatuses'),
                    new AppMenuItem('Entity Classifications', 'Pages.SycEntityObjectClassifications', 'flaticon-more', '/app/main/systemObjects/sycEntityObjectClassifications'),
                    new AppMenuItem('Attachment Categories', 'Pages.SycAttachmentCategories', 'flaticon-more', '/app/main/systemObjects/sycAttachmentCategories'),
                    new AppMenuItem('SycAttachmentTypes', 'Pages.SycAttachmentTypes', 'flaticon-more', '/app/main/systemObjects/sycAttachmentTypes'),
                    new AppMenuItem('SuiIcons', 'Pages.SuiIcons', 'flaticon-more', '/app/main/systemObjects/suiIcons'),
                ]),
            )
        }
        menu.items.push(

            new AppMenuItem('Tenants', 'Pages.Tenants', 'flaticon-list-3', '/app/admin/tenants'),
            new AppMenuItem('Editions', 'Pages.Editions', 'flaticon-app', '/app/admin/editions'),


            new AppMenuItem('MyProducts', 'Pages.AppItems', 'flaticon-more', '/app/main/products'),

            new AppMenuItem('ProductsList', 'Pages.AppItemsLists', 'flaticon-more', '/app/main/productslists'),
            new AppMenuItem('Linesheet', 'Pages.AppItems', 'flaticon-more', '/app/main/linesheet/print'),
            // new AppMenuItem('Product Selector Test Page', 'Pages.AppItems', 'flaticon-more', '/app/demo/AppItemsMultiSelection'),
            // new AppMenuItem('DemoUiComponents', 'Pages.DemoUiComponents', 'flaticon-shapes', '/app/admin/demo-ui-components')
        )
        let adminMenu = new AppMenuItem('Administration', '', 'flaticon-interface-8', '', [], [])
        let AppSubscriptionPlanHeaders=   new AppMenuItem('Subscriptions Plan', 'Pages.AppSubscriptionPlanHeaders', 'flaticon-more', '/app/main/appSubScriptionPlan/appSubscriptionPlanHeaders')
        let AppSubscriptionPlanDetail=  new AppMenuItem('Subscription Plan Details', 'Pages.Administration.AppSubscriptionPlanDetails', 'flaticon-more', '/app/admin/appSubScriptionPlan/appSubscriptionPlanDetails')
        let AppTenantSubscriptionPlan = new AppMenuItem('Tenant Subscription Plans', 'Pages.Administration.AppTenantSubscriptionPlans', 'flaticon-more', '/app/admin/appSubScriptionPlan/appTenantSubscriptionPlans')
        let AppTenantActivityLog = new AppMenuItem('Tenant Activities Log', '', 'flaticon-more', '/app/admin/appSubScriptionPlan/appTenantActivitiesLog')

            if (!this.isHost) {
            adminMenu.items.push(
                new AppMenuItem('AccountProfile', 'Pages.Accounts', 'flaticon-more', '/app/main/account')
            )
        }
        adminMenu.items.push(
                // new AppMenuItem('Merge/Convert Accounts', '', 'flaticon-interface-8', '/app/main/accounts/accounts/merge-convert-accounts-tool'),
                
                    AppSubscriptionPlanHeaders,
                    AppSubscriptionPlanDetail,
                    AppTenantSubscriptionPlan,
                    AppTenantActivityLog,
                new AppMenuItem('BillingLog', '', 'flaticon-interface-8', '', [], [
                new AppMenuItem('AppTenantPlans', 'Pages.Administration.AppTenantPlans', 'flaticon-more', '/app/admin/appTenantPlans/appTenantPlans'),
                new AppMenuItem('AppTransactions', 'Pages.Administration.AppTransactions', 'flaticon-more', '/app/admin/appTransactions/appTransactions'),
                new AppMenuItem('SycPlanServices', 'Pages.Administration.SycPlanServices', 'flaticon-more', '/app/admin/sycPlanServices/sycPlanServices'),
                new AppMenuItem('SycPlans', 'Pages.Administration.SycPlans', 'flaticon-more', '/app/admin/sycPlans/sycPlans'),
                new AppMenuItem('SycServices', 'Pages.Administration.SycServices', 'flaticon-more', '/app/admin/sycServices/sycServices'),
                new AppMenuItem('SycApplications', 'Pages.Administration.SycApplications', 'flaticon-more', '/app/admin/sycApplications/sycApplications'),
            ]),
            new AppMenuItem('Lookups', 'Pages.AppEntities', 'flaticon-more', '/app/main/lookups'),
            new AppMenuItem('OrganizationUnits', 'Pages.Administration.OrganizationUnits', 'flaticon-map', '/app/admin/organization-units'),
            new AppMenuItem('Roles', 'Pages.Administration.Roles', 'flaticon-suitcase', '/app/admin/roles'),
            new AppMenuItem('Users', 'Pages.Administration.Users', 'flaticon-users', '/app/admin/users'),

            
            //new AppMenuItem('AppTenantSubscriptionPlans', 'Pages.Administration.AppTenantSubscriptionPlans', 'flaticon-more', '/app/admin/appSubScriptionPlan/appTenantSubscriptionPlans'),
            
            
            new AppMenuItem('AppFeatures', 'Pages.Administration.AppFeatures', 'flaticon-more', '/app/admin/appSubScriptionPlan/appFeatures'),
            
            new AppMenuItem('Maintainances', 'Pages.Administration.Maintainances', 'flaticon-more', '/app/admin/maintainances/maintainances'),
            
            new AppMenuItem('SycIdentifierDefinitions', 'Pages.Administration.SycIdentifierDefinitions', 'flaticon-more', '/app/admin/sycIdentifierDefinitions/sycIdentifierDefinitions'),
            
            new AppMenuItem('SycSegmentIdentifierDefinitions', 'Pages.Administration.SycSegmentIdentifierDefinitions', 'flaticon-more', '/app/admin/sycSegmentIdentifierDefinitions/sycSegmentIdentifierDefinitions'),
            
            new AppMenuItem('SycCounters', 'Pages.Administration.SycCounters', 'flaticon-more', '/app/admin/sycCounters/sycCounters'),
            
            new AppMenuItem('Advertise', 'Pages.Administration.AppAdvertisements', 'flaticon-more', '/app/admin/appAdvertisements/appAdvertisements'),

            new AppMenuItem('TicketNotes', 'Pages.Administration.TicketNotes', 'flaticon-more', '/app/admin/autoTaskTicketNotes/ticketNotes'),

            new AppMenuItem('Tickets', 'Pages.Administration.Tickets', 'flaticon-more', '/app/admin/autoTaskTickets/tickets'),


            new AppMenuItem('Languages', 'Pages.Administration.Languages', 'flaticon-tabs', '/app/admin/languages', ['/app/admin/languages/{name}/texts']),
            new AppMenuItem('AuditLogs', 'Pages.Administration.AuditLogs', 'flaticon-folder-1', '/app/admin/auditLogs'),
            new AppMenuItem('Maintenance', 'Pages.Administration.Host.Maintenance', 'flaticon-lock', '/app/admin/maintenance'),
            new AppMenuItem('Subscription', 'Pages.Administration.Tenant.SubscriptionManagement', 'flaticon-refresh', '/app/admin/subscription-management'),
            new AppMenuItem('VisualSettings', 'Pages.Administration.UiCustomization', 'flaticon-medical', '/app/admin/ui-customization'),
            new AppMenuItem('Settings', 'Pages.Administration.Host.Settings', 'flaticon-settings', '/app/admin/hostSettings'),
            new AppMenuItem('Settings', 'Pages.Administration.Tenant.Settings', 'flaticon-settings', '/app/admin/tenantSettings'),
            new AppMenuItem('WebhookSubscriptions', 'Pages.Administration.WebhookSubscription', 'flaticon2-world', '/app/admin/webhook-subscriptions'),
            // new AppMenuItem('DynamicParameters', '', 'flaticon-interface-8', '', [], [
            //     new AppMenuItem('Definitions', 'Pages.Administration.DynamicParameters', '', '/app/admin/dynamic-parameter'),
            //     new AppMenuItem('EntityDynamicParameters', 'Pages.Administration.EntityDynamicParameters', '', '/app/admin/entity-dynamic-parameter'),
            // ])
        )
        menu.items.push(adminMenu)

        return menu
    }

    checkChildMenuItemPermission(menuItem): boolean {

        for (let i = 0; i < menuItem.items.length; i++) {
            let subMenuItem = menuItem.items[i];

            if (subMenuItem.permissionName === '' || subMenuItem.permissionName === null) {
                if (subMenuItem.route) {
                    return true;
                }
            } else if (this._permissionCheckerService.isGranted(subMenuItem.permissionName)) {
                return true;
            }

            if (subMenuItem.items && subMenuItem.items.length) {
                let isAnyChildItemActive = this.checkChildMenuItemPermission(subMenuItem);
                if (isAnyChildItemActive) {
                    return true;
                }
            }
        }
        return false;
    }

    showMenuItem(menuItem: AppMenuItem): boolean {
        if (menuItem.permissionName === 'Pages.Administration.Tenant.SubscriptionManagement' && this._appSessionService.tenant && !this._appSessionService.tenant.edition) {
            return false;
        }

        let hideMenuItem = false;

        if (menuItem.requiresAuthentication && !this._appSessionService.user) {
            hideMenuItem = true;
        }

        if (menuItem.permissionName && !this._permissionCheckerService.isGranted(menuItem.permissionName)) {
            hideMenuItem = true;
        }

        if (this._appSessionService.tenant || !abp.multiTenancy.ignoreFeatureCheckForHostUsers) {
            if (menuItem.hasFeatureDependency() && !menuItem.featureDependencySatisfied()) {
                hideMenuItem = true;
            }
        }

        if (!hideMenuItem && menuItem.items && menuItem.items.length) {
            return this.checkChildMenuItemPermission(menuItem);
        }

        return !hideMenuItem;
    }

    /**
     * Returns all menu items recursively
     */
    getAllMenuItems(): AppMenuItem[] {
        let menu = this.getMenu();
        let allMenuItems: AppMenuItem[] = [];
        menu.items.forEach(menuItem => {
            allMenuItems = allMenuItems.concat(this.getAllMenuItemsRecursive(menuItem));
        });

        return allMenuItems;
    }

    private getAllMenuItemsRecursive(menuItem: AppMenuItem): AppMenuItem[] {
        if (!menuItem.items) {
            return [menuItem];
        }

        let menuItems = [menuItem];
        menuItem.items.forEach(subMenu => {
            menuItems = menuItems.concat(this.getAllMenuItemsRecursive(subMenu));
        });

        return menuItems;
    }
}
