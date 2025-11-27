import { Injectable } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { XmlHttpRequestHelper } from '@shared/helpers/XmlHttpRequestHelper';

@Injectable({ providedIn: 'root' })
export class AppAuthService {


  logout(reload?: boolean, returnUrl?: string): void {
    const tenantCookieName = abp.multiTenancy.tenantIdCookieName;
    const tenantId = abp.multiTenancy.getTenantIdCookie();

    const customHeaders: Record<string, string> = {
      [tenantCookieName]: tenantId != null ? String(tenantId) : '',
      Authorization: 'Bearer ' + (abp.auth.getToken() || '')
    };

    XmlHttpRequestHelper.ajax(
      'GET',
      AppConsts.remoteServiceBaseUrl + '/api/TokenAuth/LogOut',
      customHeaders,
      null,
      () => {
        try { abp.auth.clearToken(); } catch {}
        try { abp.auth.clearRefreshToken(); } catch {}
        try { localStorage.clear(); } catch {}
        try { sessionStorage.clear(); } catch {}

        // Explicitly expire the encrypted auth cookie (avoid leaving "undefined")
        try {
          abp.utils.setCookieValue(
            AppConsts.authorization.encrptedAuthTokenName,
            '',
            new Date(0), 
            abp.appPath
          );
        } catch {}

        // Handle redirect in a loop-safe way
        if (reload !== false) {
          const target = (returnUrl || '').trim(); 

          const here = location.pathname + location.search + location.hash;

          if (target) {
            // Only redirect if we're NOT already at the target
            if (here !== target && !here.startsWith(target + '?') && !here.startsWith(target + '#')) {
              location.replace(target);
            }
          } else {
 
            const defaultLogin = '/app/account/login'; 
            if (!here.startsWith(defaultLogin)) {
              location.replace(defaultLogin);
            }
          }
        }
      }
    );
  }
}
