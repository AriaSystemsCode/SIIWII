import { RegisterTenantModel } from '@account/register/register-tenant.model';
import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import {   PasswordComplexitySetting, RegisterTenantOutput, SubscriptionStartType, TenantRegistrationServiceProxy } from '@shared/service-proxies/service-proxies';
import { Patterns } from '@shared/utils/patterns/pattern';
import { ModalDirective } from "ngx-bootstrap/modal";
import { finalize } from 'rxjs/operators';
import { AppConsts } from '@shared/AppConsts';
import { accountModuleAnimation } from '@shared/animations/routerTransition';
import { SelectItem } from 'primeng/api';


@Component({
  selector: 'app-register-tenant',
  templateUrl: './register-tenant.component.html',
  styleUrls: ['./register-tenant.component.scss']
})
export class RegisterTenantComponent extends AppComponentBase implements OnInit {

  constructor(injector: Injector,
    private _tenantRegistrationService: TenantRegistrationServiceProxy
  ) {
    super(injector);
  }

  @ViewChild("registerTenantModal", { static: true }) modal: ModalDirective;
  registerTenantId: number = 0;
  model: RegisterTenantModel = new RegisterTenantModel();
  domainPattern = Patterns.domainName;
  passwordComplexitySetting: PasswordComplexitySetting = new PasswordComplexitySetting();
  saving: boolean = false;
  recaptchaSiteKey: string = AppConsts.recaptchaSiteKey;
  @Output() register = new EventEmitter<number>();

  accountType;
  accountTypes:SelectItem[] = [];

  accountTypeLabel:string="";
  ngOnInit(): void {
  }


  show() {
    this.showMainSpinner();
    this.model = new RegisterTenantModel();
    this._tenantRegistrationService.getEditionsForSelect()
      .pipe(finalize(() => { this.hideMainSpinner(); }))
      .subscribe((result) => {
        if (result?.editionsWithFeatures?.length > 0) {
          var editionIndex = result.editionsWithFeatures.findIndex(x => x.edition.name.toUpperCase() == "STANDARD");
          if (editionIndex >= 0) {
            this.model.editionId = result.editionsWithFeatures[editionIndex]?.edition.id;
            this.model.edition = result.editionsWithFeatures[editionIndex]?.edition;
            this.model.subscriptionStartType = SubscriptionStartType.Free;
          }
        }
     this.getAccountTypes();
        this.modal.show();
      });
  }

   getAccountTypes(){
      /*this.accountTypes.push({ label :'Personal' ,value: 'Personal'});
    this.accountTypes.push({ label :'Business' ,value: 'Business'});
    this.accountTypes.push({ label :'Group' ,value: 'Group'}); */
   
    this._tenantRegistrationService.getEditionsForSelect()
    .subscribe((result) => {
        for (let i = 0; i < result.editionsWithFeatures.length; i++) {
            const accountTypeLabel = result.editionsWithFeatures[i].edition.displayName;
            const accountTypeValue = result.editionsWithFeatures[i].edition.id;
            this.accountTypes.push({ label :accountTypeLabel ,value:accountTypeValue});
    }
    }); 
} 

  hide() {
    this.register.emit(this.registerTenantId);
    this.modal.hide();
  }

  save() {
    this.saving = true;
    this.model.editionId =Number(this.accountType);
       this.model.accountType =this.accountType;
    this._tenantRegistrationService.registerTenant(this.model)
      .pipe(finalize(() => { this.saving = false; }))
      .subscribe((result: RegisterTenantOutput) => {
        this.registerTenantId = result.tenantId;
        this.notify.success(this.l('SuccessfullyRegistered'));
        this.hide();
      });
  }

  changeAccountType($event){
    debugger ;
     let indx= this.accountTypes.findIndex(x=>x.value == $event.value );

     if(indx>0)
     this.accountTypeLabel= this.accountTypes[indx].label.toString().toUpperCase();
     else
     this.accountTypeLabel='';

}

}