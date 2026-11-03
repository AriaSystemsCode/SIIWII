
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import {
    AccountsServiceProxy,
    AppItemsServiceProxy,
    MarketplaceAccountsServiceProxy,
    SycEntityObjectStatusesServiceProxy,
    SycEntityObjectTypesServiceProxy
} from './service-proxies/service-proxies';

import { AppConsts } from '@shared/AppConsts';

@Injectable()
export class DynamicApiDispatcherService {

    constructor(
        private accountsServiceProxy: AccountsServiceProxy,
        private appItemsServiceProxy: AppItemsServiceProxy,
        private marketplaceAccountsServiceProxy: MarketplaceAccountsServiceProxy,
        private sycEntityObjectStatusesService: SycEntityObjectStatusesServiceProxy,
        private sycEntityObjectTypesService: SycEntityObjectTypesServiceProxy,
        private http: HttpClient
    ) {}

    dispatch(
        serviceName: string,
        methodName: string,
        values: Record<string, any> = {}
    ): any {

        const service = (serviceName || '').trim();
        const method = (methodName || '').trim();


        if (
            ['Accounts', 'AccountsServiceProxy'].includes(service) &&
            method.toLowerCase() === 'getaccountbranches'
        ) {
            return this.http.get<any>(
                `${AppConsts.remoteServiceBaseUrl}/api/services/app/Accounts/GetAccountBranches`
            ).pipe(
                map(response => response?.result ?? response)
            );
        }


        const normalizedServiceName =
            service.endsWith('ServiceProxy')
                ? service
                : `${service}ServiceProxy`;


        const serviceMap: Record<string, any> = {

            AccountsServiceProxy:
                this.accountsServiceProxy,

            AppItemsServiceProxy:
                this.appItemsServiceProxy,

            MarketplaceAccountsServiceProxy:
                this.marketplaceAccountsServiceProxy,

            // Entity Object Statuses
            SycEntityObjectStatusesServiceProxy:
                this.sycEntityObjectStatusesService,

            SycEntityObjectStatusesAppServiceServiceProxy:
                this.sycEntityObjectStatusesService,

            // Entity Object Types
            SycEntityObjectTypesServiceProxy:
                this.sycEntityObjectTypesService,

            SycEntityObjectTypesAppServiceServiceProxy:
                this.sycEntityObjectTypesService
        };



        const selectedService =
            serviceMap[normalizedServiceName];

        if (!selectedService) {
            throw new Error(
                `Service '${normalizedServiceName}' not found`
            );
        }


        const normalizedMethodName =
            method.charAt(0).toLowerCase() +
            method.slice(1);

        const selectedMethod =
            selectedService[method] ??
            selectedService[normalizedMethodName];

        if (typeof selectedMethod !== 'function') {
            throw new Error(
                `Method '${method}' not found in '${normalizedServiceName}'. ` +
                `Tried '${normalizedMethodName}' too.`
            );
        }


        const apiValues: Record<string, any> = {
            ...(values || {})
        };

        if (
            normalizedMethodName.toLowerCase() ===
            'getallsycentitystatusfortabledropdown' &&
            selectedService === this.sycEntityObjectStatusesService
        ) {
            apiValues.objectCode = 'TRANSACTION';
        }

      if (
    selectedService === this.sycEntityObjectTypesService &&
    normalizedMethodName.toLowerCase() === 'getall'
) {
    apiValues.sydObjectNameFilter = 'TRANSACTION';

    // Do not send a string to the numeric ID filter
    delete apiValues.sydObjectIdFilter;
  
}

        const paramNames =
            this.getParameterNames(selectedMethod);

        const args = paramNames.map(param => {

            const matchingKey = Object.keys(apiValues).find(
                key =>
                    key.toLowerCase() === param.toLowerCase()
            );

            return matchingKey !== undefined
                ? apiValues[matchingKey]
                : undefined;
        });

        // ==========================================
        // 8. Execute API
        // ==========================================

        return selectedMethod.apply(
            selectedService,
            args
        );
    }

    // ==========================================
    // Extract method parameter names
    // ==========================================

    private getParameterNames(func: Function): string[] {

        const fnStr = func
            .toString()
            .replace(
                /\/\*[\s\S]*?\*\/|\/\/.*$/gm,
                ''
            );

        const match = fnStr.match(/\(([^)]*)\)/);

        if (!match) {
            return [];
        }

        return match[1]
            .split(',')
            .map(param =>
                param.trim().split('=')[0].trim()
            )
            .filter(Boolean);
    }
}
