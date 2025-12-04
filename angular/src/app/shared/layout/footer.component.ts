import { Component, Injector, OnInit, Input } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { AppEntitiesServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    selector: 'footer-bar'
})
export class FooterComponent extends AppComponentBase implements OnInit {
    releaseDate: string;
    @Input() useBottomDiv = true;
    webAppGuiVersion: string;

    tenantFooterText:string
    constructor(
        injector: Injector,
                private _AppEntitiesServiceProxy: AppEntitiesServiceProxy   ,
    ) {
        super(injector);
    }

    ngOnInit(): void {
        // this.releaseDate = this.appSession.application.releaseDate.format('YYYYMMDD');
        this.webAppGuiVersion = AppConsts.WebAppGuiVersion;
        this.getTenantData()
    }

    
  getTenantData() {


    this._AppEntitiesServiceProxy.getHostSettingValue(1209,null)
      .subscribe((result) => {
        this.tenantFooterText = result
      });


  }
}
