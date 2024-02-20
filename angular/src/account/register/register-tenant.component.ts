import { AfterViewInit, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';
import { accountModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    EditionSelectDto,
    PasswordComplexitySetting,
    ProfileServiceProxy,
    RegisterTenantOutput,
    TenantRegistrationServiceProxy,
    PaymentPeriodType,
    SubscriptionPaymentGatewayType,
    SubscriptionStartType,
    EditionPaymentType,} from '@shared/service-proxies/service-proxies';
import { RegisterTenantModel } from './register-tenant.model';
import { TenantRegistrationHelperService } from './tenant-registration-helper.service';
import { finalize, catchError } from 'rxjs/operators';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { Patterns } from '../../shared/utils/patterns/pattern';
import { SelectItem } from 'primeng/api';

@Component({
    templateUrl: './register-tenant.component.html',
    styleUrls: ['./register-tenant.component.scss'],
    animations: [accountModuleAnimation()]
})
export class RegisterTenantComponent extends AppComponentBase implements OnInit, AfterViewInit {
    model: RegisterTenantModel = new RegisterTenantModel();
    passwordComplexitySetting: PasswordComplexitySetting = new PasswordComplexitySetting();
    subscriptionStartType = SubscriptionStartType;
    editionPaymentType: EditionPaymentType;
    paymentPeriodType = PaymentPeriodType;
    selectedPaymentPeriodType: PaymentPeriodType = PaymentPeriodType.Monthly;
    subscriptionPaymentGateway = SubscriptionPaymentGatewayType;
    paymentId = '';
    recaptchaSiteKey: string = AppConsts.recaptchaSiteKey;

    saving = false;
    domainPattern = Patterns.domainName
    accountType;
   accountTypeLabel:string="";
 //  accountTypes:SelectItem[] = [];

    constructor(
        injector: Injector,
        private _tenantRegistrationService: TenantRegistrationServiceProxy,
        private _router: Router,
        private _profileService: ProfileServiceProxy,
        private _tenantRegistrationHelper: TenantRegistrationHelperService,
        private _activatedRoute: ActivatedRoute,
        private _reCaptchaV3Service: ReCaptchaV3Service
    ) {
        super(injector);
    }

    ngOnInit() {
        this.model.inviterTenantId = this._activatedRoute.snapshot.queryParams['tenantid'];
        if (!this.model.inviterTenantId  || this.model.inviterTenantId.toString().toUpperCase()=="NULL") {
            this.model.inviterTenantId = 0;
            abp.multiTenancy.setTenantIdCookie(undefined);
        }

        else
            abp.multiTenancy.setTenantIdCookie(this.model.inviterTenantId);

        this.model.editionId = this._activatedRoute.snapshot.queryParams['editionId'];
        this.editionPaymentType = this._activatedRoute.snapshot.queryParams['editionPaymentType'];

        if (this.model.editionId) {
            this.model.subscriptionStartType = this._activatedRoute.snapshot.queryParams['subscriptionStartType'];
        }

        //Prevent to create tenant in a tenant context
        /*  if (this.appSession.tenant != null) {
             this._router.navigate(['account/login']);
             return;
         } */

        this._profileService.getPasswordComplexitySetting().subscribe(result => {
            this.passwordComplexitySetting = result.setting;
        });

        this.accountType=this._activatedRoute.snapshot.queryParams['accountType'];
        this.accountTypeLabel=this._activatedRoute.snapshot.queryParams['accountTypeLabel'];
    }

    ngAfterViewInit() {
        if (this.model.editionId) {
            this._tenantRegistrationService.getEdition(this.model.editionId)
                .subscribe((result: EditionSelectDto) => {
                    this.model.edition = result;
                });
        }

   //  this.getAccountTypes();
    }

    // getAccountTypes(){

    //     this._tenantRegistrationService.getEditionsForSelect()
    // .subscribe((result) => {
    //     for (let i = 0; i < result.editionsWithFeatures.length; i++) {
    //         const accountTypeLabel = result.editionsWithFeatures[i].edition.displayName;
    //         const accountTypeValue = result.editionsWithFeatures[i].edition.id;
    //         this.accountTypes.push({ label :accountTypeLabel ,value:accountTypeValue});
    // }
    // }); 
    // } 
    get useCaptcha(): boolean {
        return this.setting.getBoolean('App.TenantManagement.UseCaptchaOnRegistration');
    }

    save(): void {

        let recaptchaCallback = (token: string) => {
            this.saving = true;
            this.model.captchaResponse = token;
       this.model.editionId =Number(this.accountType);
       this.model.accountTypeId=this.accountType;
       this.model.accountType = this.accountTypeLabel;


         
            this._tenantRegistrationService.registerTenant(this.model)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe((result: RegisterTenantOutput) => {
                    this.notify.success(this.l('SuccessfullyRegistered'));
                    this._tenantRegistrationHelper.registrationResult = result;
                    if (this.model?.subscriptionStartType && parseInt(this.model.subscriptionStartType.toString()) === SubscriptionStartType.Paid) {
                        this._router.navigate(['account/buy'],
                            {
                                queryParams: {
                                    tenantId: result.tenantId,
                                    editionId: this.model.editionId,
                                    subscriptionStartType: this.model.subscriptionStartType,
                                    editionPaymentType: this.editionPaymentType
                                }
                            });
                    } else {
                        this._router.navigate(['account/register-tenant-result']);
                    }
                });
        };

        if (this.useCaptcha) {
            this._reCaptchaV3Service.execute(this.recaptchaSiteKey, 'register_tenant', (token) => {
                recaptchaCallback(token);
            });
        } else {
            recaptchaCallback(null);
        }
    }

    // changeAccountType($event){
    //     debugger ;
    //      let indx= this.accountTypes.findIndex(x=>x.value == $event.value );

    //      if(indx>=0)
    //      this.accountTypeLabel= this.accountTypes[indx].label.toString().toUpperCase();
    //      else
    //      this.accountTypeLabel='';

    // }
}
