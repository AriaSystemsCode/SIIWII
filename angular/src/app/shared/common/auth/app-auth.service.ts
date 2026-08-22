import { Injectable } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { XmlHttpRequestHelper } from '@shared/helpers/XmlHttpRequestHelper';
import { AppEntitiesServiceProxy } from '@shared/service-proxies/service-proxies';

@Injectable({ providedIn: 'root' })
export class AppAuthService {
  constructor(private _appEntitiesServiceProxy: AppEntitiesServiceProxy) {}

  getSetting(): Promise<string> {
    return new Promise((resolve) => {
      this._appEntitiesServiceProxy.getHostSettingValue(1213, null).subscribe({
        next: (res) => {
          const allowAnonymous = res === 'Enable';
          resolve(allowAnonymous ? '/app/main/marketplace' : '/account/login');
        },
        error: () => resolve('/account/login')
      });
    });
  }

  async logoutUsingSetting(reload: boolean = true): Promise<void> {
    const returnUrl = await this.getSetting();
    this.logout(reload, returnUrl);
  }

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

        try {
          abp.utils.setCookieValue(
            AppConsts.authorization.encrptedAuthTokenName,
            '',
            new Date(0),
            abp.appPath
          );
        } catch {}

        if (reload !== false) {
          const target = (returnUrl || '/account/login').trim();
          location.replace(target);
        }
      }
    );
  }
}
