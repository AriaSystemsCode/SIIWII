import { Component, Injector, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppAdvertisementsServiceProxy, GetAppAdvertisementForViewDto, SycAttachmentCategoryDto } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-dynamicInputs',
    templateUrl: './dynamicInputs.component.html',
    styleUrls: ['./dynamicInputs.component.scss'],
    animations:[appModuleAnimation()]
})
export class dynamicInputs implements OnInit,OnChanges {
   @Input("extraAttributeObject") extraAttributeObject;
   @Input("entityType") entityType;
   @Input("entityObjectTypeId") entityObjectTypeId;
   
   
    ngOnInit(): void {
    }

    ngOnChanges(){

    }
    
}
