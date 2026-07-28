import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class DynamicApiDispatcherService {

 constructor(

) {}

 
dispatch(serviceName: string, methodName: string, values: any = {}) {

  let selectedService = (this as any)[serviceName];

  if (!selectedService) {
    selectedService = (this as any)[serviceName.charAt(0).toLowerCase() + serviceName.slice(1)];
  }

  if (!selectedService) {
    throw new Error(`Service '${serviceName}' not found`);
  }

  const selectedMethod = selectedService[methodName];

  if (typeof selectedMethod !== "function") {
    throw new Error(`Method '${methodName}' not found in service '${serviceName}'`);
  }

  const paramNames = this.getParameterNames(selectedMethod);

  const args = new Array(paramNames.length).fill(undefined);

  paramNames.forEach((p, i) => {
    if (values.hasOwnProperty(p)) {
      args[i] = values[p];
    }
  });

  return selectedMethod.apply(selectedService, args);
}



  getParameterNames(func: Function): string[] {
    const fnStr = func.toString().replace(/\/\/.*$|\/\*[\s\S]*?\*\//mg, ''); // remove comments
    const result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
    return result === null ? [] : result;
  }
  private normalize(name: string) {
    return name.charAt(0).toLowerCase() + name.slice(1);
  }
}
