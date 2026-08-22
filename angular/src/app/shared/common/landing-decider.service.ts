// landing-decider.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AppEntitiesServiceProxy } from '@shared/service-proxies/service-proxies';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LandingDeciderService {
  private decided = false;

  constructor(
    private router: Router,
    private appEntities: AppEntitiesServiceProxy
  ) {}

  /** Decide initial route once (respects deep links) */
  async decideInitialRoute(): Promise<void> {
    if (this.decided) return;
    this.decided = true;

    // current url Angular sees (after bootstrap)
    const current = this.router.url || '/';


    const isJustRoot =
      current === '/' ||
      current === '/app' ||
      current === '/app/' ||
      current === '/app/main' ||
      current === '/app/main/';


    if (current.startsWith('/account')) return;

    if (!isJustRoot) return;

    // isAuthenticated from ABP
    const isAuthenticated = !!abp.session?.userId;

    let allowAnonymous = false;
    try {
      const res = await firstValueFrom(this.appEntities.getHostSettingValue(1213, null));
      allowAnonymous = (res === 'Enable');
    } catch {
      allowAnonymous = false; // fallback
    }

    let target = '/account/login';

    if (allowAnonymous) {
      target = '/app/main/marketplace';
    } else {
      target = isAuthenticated ? '/app/main/dashboard' : '/account/login';
    }

    if (current !== target) {
      await this.router.navigateByUrl(target, { replaceUrl: true });
    }
  }
}
