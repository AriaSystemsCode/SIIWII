import { Injector, Component,OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DOCUMENT } from '@angular/common';
import { AccountsServiceProxy} from '@shared/service-proxies/service-proxies';
import { UpdateLogoService } from '@shared/utils/update-logo.service';

@Component({
    templateUrl: './default-brand.component.html',
    styleUrls:['./default-brand.component.scss'],
    selector: 'default-brand',
    encapsulation: ViewEncapsulation.None
})
export class DefaultBrandComponent extends AppComponentBase implements OnInit {

    defaultLogo = AppConsts.appBaseUrl + '/assets/common/images/logo.svg';
    // defaultLogo = AppConsts.appBaseUrl + '/assets/common/images/app-logo-on-' + this.currentTheme.baseSettings.menu.asideSkin + '.svg';
    // remoteServiceBaseUrl: string = AppConsts.remoteServiceBaseUrl;
    remoteServiceBaseUrl: string = AppConsts.attachmentBaseUrl;
    attachmentBaseUrl: string = AppConsts.attachmentBaseUrl;

    accountSummary:any;
    tenantLogo:any;
    loading:boolean = false
    constructor(
        injector: Injector,
        @Inject(DOCUMENT) private document: Document,
        private _accountsServiceProxy: AccountsServiceProxy,
        private logoUpdateService : UpdateLogoService
    ) {
        super(injector);
    }

    toggleLeftAside(): void {
        this.document.body.classList.toggle('kt-aside--minimize');
        this.document.body.classList.toggle('kt-aside--minimize-hover');
        this.triggerAsideToggleClickEvent();
    }

    triggerAsideToggleClickEvent(): void {
        abp.event.trigger('app.kt_aside_toggler.onClick');
    }
    ngOnInit() {
        this.getSidebarInfo();
        this.logoUpdateService.logoUpdated$.subscribe((res)=>{
            if(res){
                this.getSidebarInfo()
            }
        })

    }
    getSidebarInfo(){
        this.loading = true
        this._accountsServiceProxy.getAccountSummary().subscribe(result =>{
            this.accountSummary = result;
            if(result.logoUrl!=undefined)
                this.tenantLogo=`${this.attachmentBaseUrl}/${this.accountSummary.logoUrl}`
                this.loading = false
        })
    }
    onLogoImageError($event){
        $event.target.src = this.defaultLogo
    }
    handleFailedImage($event){
        $event.target.src= this.defaultLogo
    }
}
