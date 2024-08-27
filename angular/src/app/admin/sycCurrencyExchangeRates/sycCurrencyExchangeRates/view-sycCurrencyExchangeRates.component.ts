import {AppConsts} from "@shared/AppConsts";
import { Component, ViewChild, Injector, Output, EventEmitter, OnInit } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SycCurrencyExchangeRatesServiceProxy, GetSycCurrencyExchangeRatesForViewDto, SycCurrencyExchangeRatesDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ActivatedRoute } from '@angular/router';
import { appModuleAnimation } from '@shared/animations/routerTransition';

@Component({
    templateUrl: './view-sycCurrencyExchangeRates.component.html',
    animations: [appModuleAnimation()]
})
export class ViewSycCurrencyExchangeRatesComponent extends AppComponentBase implements OnInit {

    active = false;
    saving = false;

    item: GetSycCurrencyExchangeRatesForViewDto;


    constructor(
        injector: Injector,
        private _activatedRoute: ActivatedRoute,
         private _sycCurrencyExchangeRatesServiceProxy: SycCurrencyExchangeRatesServiceProxy
    ) {
        super(injector);
        this.item = new GetSycCurrencyExchangeRatesForViewDto();
        this.item.sycCurrencyExchangeRates = new SycCurrencyExchangeRatesDto();        
    }

    ngOnInit(): void {
        this.show(this._activatedRoute.snapshot.queryParams['id']);
    }

    show(sycCurrencyExchangeRatesId: number): void {
      this._sycCurrencyExchangeRatesServiceProxy.getSycCurrencyExchangeRatesForView(sycCurrencyExchangeRatesId).subscribe(result => {      
                 this.item = result;
                this.active = true;
            });       
    }
    
    
}
