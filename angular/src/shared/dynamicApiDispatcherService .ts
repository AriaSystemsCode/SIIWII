import { Injectable } from "@angular/core";
import { AccountsServiceProxy } from "./service-proxies/service-proxies";

@Injectable({ providedIn: 'root' })
export class DynamicApiDispatcherService {

  constructor(
    //i49-new bind MarketplaceAccountsService
    private accountsServiceProxy: AccountsServiceProxy,
  ) {}

  dispatch(serviceName: string, methodName: string, ...args: any[]) {

    const selectedService = (this as any)[this.normalize(serviceName)];

    if (!selectedService) {
      throw new Error(`Service '${serviceName}' not found`);
    }

    const selectedMethod = selectedService[methodName];

    if (typeof selectedMethod !== "function") {
      throw new Error(`Method '${methodName}' not found in service '${serviceName}'`);
    }

    return selectedMethod.apply(selectedService, args);
  }

  private normalize(name: string) {
    return name.charAt(0).toLowerCase() + name.slice(1);
  }
}
