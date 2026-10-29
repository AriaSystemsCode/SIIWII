import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import {
    AccountsServiceProxy,
    AppItemsServiceProxy,
    MarketplaceAccountsServiceProxy
} from './service-proxies/service-proxies';

import { AppConsts } from '@shared/AppConsts';

@Injectable()
export class DynamicApiDispatcherService {

    constructor(
        private accountsServiceProxy: AccountsServiceProxy,
        private appItemsServiceProxy: AppItemsServiceProxy,
        private marketplaceAccountsServiceProxy: MarketplaceAccountsServiceProxy,
        private http: HttpClient
    ) {}

    dispatch(
        serviceName: string,
        methodName: string,
        values: any = {}
    ): any {

        // Special handling for account branches
        if (
            serviceName === 'AccountsServiceProxy' &&
            methodName === 'getAccountBranches'
        ) {
            return this.http.get<any>(
                `${AppConsts.remoteServiceBaseUrl}/api/services/app/Accounts/GetAccountBranches`
            ).pipe(
                map(response => response?.result ?? response)
            );
        }

        const normalizedServiceName =
            serviceName.endsWith('ServiceProxy')
                ? serviceName
                : `${serviceName}ServiceProxy`;

        const serviceMap: Record<string, any> = {
            AccountsServiceProxy: this.accountsServiceProxy,
            AppItemsServiceProxy: this.appItemsServiceProxy,
            MarketplaceAccountsServiceProxy:
                this.marketplaceAccountsServiceProxy
        };

        const selectedService =
            serviceMap[normalizedServiceName];

        if (!selectedService) {
            throw new Error(
                `Service '${normalizedServiceName}' not found`
            );
        }

        const selectedMethod =
            selectedService[methodName];

        if (typeof selectedMethod !== 'function') {
            throw new Error(
                `Method '${methodName}' not found in '${normalizedServiceName}'`
            );
        }

        const paramNames =
            this.getParameterNames(selectedMethod);

        const args = paramNames.map(param =>
            Object.prototype.hasOwnProperty.call(values, param)
                ? values[param]
                : undefined
        );

        return selectedMethod.apply(
            selectedService,
            args
        );
    }

    private getParameterNames(func: Function): string[] {
        const fnStr = func
            .toString()
            .replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');

        const match = fnStr.match(/\(([^)]*)\)/);

        if (!match) {
            return [];
        }

        return match[1]
            .split(',')
            .map(param => param.trim().split('=')[0].trim())
            .filter(Boolean);
    }
}