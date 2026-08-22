import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, map } from 'rxjs';
import { AppTransactionServiceProxy } from '@shared/service-proxies/service-proxies';

@Injectable({
    providedIn: 'root'
})
export class TenantRoleService {

    private rolesSubject = new BehaviorSubject<string[]>([]);
    roles$ = this.rolesSubject.asObservable();

    constructor(private appTransaction: AppTransactionServiceProxy) {}

    // 1. load roles from backend
    loadRoles(): Promise<string[]> {
        return firstValueFrom(
            this.appTransaction.getLoggedInTenantRoles()
        ).then(res => {
            const roles = res || [];
            this.rolesSubject.next(roles);
            return roles;
        });
    }

    // 2. sync getter
    get currentRoles(): string[] {
        return this.rolesSubject.value || [];
    }

    // 3. flags (computed)
    get flags() {
        const roles = this.currentRoles.map(r => r.toLowerCase());

        return {
            isSeller: roles.includes('seller'),
            isSalesRep: roles.includes('sales rep'),
            isBuyer: roles.includes('buyer'),
            isBuyingOffice: roles.includes('buying office')
        };
    }

    // 4. SO options
    get soRolesOptions() {
        const f = this.flags;

        return [
            ...(f.isSeller ? [{ name: "I'm a Seller", code: 1 }] : []),
            ...(f.isSalesRep ? [{ name: "I'm an Independent Sales Rep.", code: 3 }] : [])
        ];
    }

    // 5. PO options
    get poRolesOptions() {
        const f = this.flags;

        return [
            ...(f.isBuyer ? [{ name: "I'm a Buyer", code: 2 }] : []),
            ...(f.isBuyingOffice ? [{ name: "I'm an Independent Buying Office.", code: 4 }] : [])
        ];
    }

    // 6. permissions
    canCreateSO(): boolean {
        const roles = this.currentRoles.map(r => r.toLowerCase());
        return roles.includes('seller') || roles.includes('sales rep');
    }

    canCreatePO(): boolean {
        const roles = this.currentRoles.map(r => r.toLowerCase());
        return roles.includes('buyer') || roles.includes('buying office');
    }

    // 7. helper
    hasAnyRole(...needed: string[]): boolean {
        const roles = this.currentRoles.map(r => r.toLowerCase());
        return needed.some(r => roles.includes(r.toLowerCase()));
    }
}
