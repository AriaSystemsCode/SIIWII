import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppAdvertisementsServiceProxy, GetAppAdvertisementForViewDto, SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-ads-sidebar',
    templateUrl: './ads-sidebar.component.html',
    styleUrls: ['./ads-sidebar.component.scss'],
    animations:[appModuleAnimation()]
})
export class AdsSidebarComponent extends AppComponentBase implements OnInit, OnDestroy {
    adsNoLimit:number = 2
    adsList : GetAppAdvertisementForViewDto[] = []
    interval : NodeJS.Timeout
    constructor(
        private injector: Injector,
        private _appAdvertisementsServiceProxy: AppAdvertisementsServiceProxy,
    ) {
        super(injector);
    }
    sycAttachmentCategoryPhoto : SycAttachmentCategoryDto
    ngOnInit(): void {
        const msToHrsFactor = 3.6e+6
        this.getCurrentAds()
        this.interval = setInterval( this.getCurrentAds.bind(this), 4 * msToHrsFactor )
        this.getSycAttachmentCategoriesByCodes(['PHOTO']).subscribe((result)=>{
            result.forEach(item=>{
                this.sycAttachmentCategoryPhoto = item
            })
        })
    }
    ngOnDestroy(): void {
        clearInterval(this.interval)
    }
    getCurrentAds(){
        this._appAdvertisementsServiceProxy.getCurrentPeriodAdvertisement(this.adsNoLimit,true,false)
        .subscribe(res=>{
            this.adsList = res
        })
    }
}
