import { Component, ViewChild, Injector, Output, EventEmitter, OnInit} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SycCurrencyExchangeRatesServiceProxy, CreateOrEditSycCurrencyExchangeRatesDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import {Observable} from "@node_modules/rxjs";





@Component({
    templateUrl: './create-or-edit-sycCurrencyExchangeRates.component.html',
    animations: [appModuleAnimation()]
})
export class CreateOrEditSycCurrencyExchangeRatesComponent extends AppComponentBase implements OnInit {
    active = false;
    saving = false;
    
    sycCurrencyExchangeRates: CreateOrEditSycCurrencyExchangeRatesDto = new CreateOrEditSycCurrencyExchangeRatesDto();






    constructor(
        injector: Injector,
        private _activatedRoute: ActivatedRoute,        
        private _sycCurrencyExchangeRatesServiceProxy: SycCurrencyExchangeRatesServiceProxy,
        private _router: Router
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.show(this._activatedRoute.snapshot.queryParams['id']);
        
    }

    show(sycCurrencyExchangeRatesId?: number): void {

        if (!sycCurrencyExchangeRatesId) {
            this.sycCurrencyExchangeRates = new CreateOrEditSycCurrencyExchangeRatesDto();
            this.sycCurrencyExchangeRates.id = sycCurrencyExchangeRatesId;


            this.active = true;
        } else {
            this._sycCurrencyExchangeRatesServiceProxy.getSycCurrencyExchangeRatesForEdit(sycCurrencyExchangeRatesId).subscribe(result => {
                this.sycCurrencyExchangeRates = result.sycCurrencyExchangeRates;



                this.active = true;
            });
        }
        
         
    }
    
    save(): void {
        this.saving = true;
        
        this._sycCurrencyExchangeRatesServiceProxy.createOrEdit(this.sycCurrencyExchangeRates)
            .pipe(finalize(() => {
                this.saving = false;
            }))
            .subscribe(x => {
                 this.saving = false;               
                 this.notify.info(this.l('SavedSuccessfully'));
                 this._router.navigate( ['/app/admin/sycCurrencyExchangeRates/sycCurrencyExchangeRates']);
            })
    }
    
    saveAndNew(): void {
        this.saving = true;
        
        this._sycCurrencyExchangeRatesServiceProxy.createOrEdit(this.sycCurrencyExchangeRates)
            .pipe(finalize(() => {
                this.saving = false;
            }))
            .subscribe(x => {
                this.saving = false;               
                this.notify.info(this.l('SavedSuccessfully'));
                this.sycCurrencyExchangeRates = new CreateOrEditSycCurrencyExchangeRatesDto();
            });
    }













}
