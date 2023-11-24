import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountRoutingModule } from './account-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { SelectAddressModule } from '@app/selectAddress/selectAddress.module';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { PaginatorModule } from 'primeng/paginator';
import { EditorModule } from 'primeng/editor';
import { InputMaskModule } from 'primeng/inputmask'; import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';

import { UtilsModule } from '@shared/utils/utils.module';
import { CountoModule } from 'angular2-counto';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BsDatepickerConfig, BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';
import { TabMenuModule } from 'primeng/tabmenu';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { NgImageSliderModule } from 'ng-image-slider';
import { TreeviewModule } from 'ngx-treeview';
import { TreeModule } from 'primeng/tree';
import { CheckboxModule } from 'primeng';
import { ImageCropperModule } from 'ngx-image-cropper';
import { BulkImportModule } from '../../../../shared/components/import-steps/bulk-import.module';
import { MyAccountsComponent } from './components/my-accounts.component';
import { AccountSharedModule } from '../account-shared/account-shared.module';
import { MergeConvertAccountsToolComponent } from './merge-convert-accounts-tool/merge-convert-accounts-tool.component';
import { RegisterTenantComponent } from './merge-convert-accounts-tool/register-tenant.component';
import { onetouchCommonModule } from '@shared/common/common.module';
import { NgxCaptchaModule } from 'ngx-captcha';
import { OAuthModule } from 'angular-oauth2-oidc';
import { PasswordModule } from 'primeng/password';
import { AppBsModalModule } from '@shared/common/appBsModal/app-bs-modal.module';

NgxBootstrapDatePickerConfigService.registerNgxBootstrapDatePickerLocales();
@NgModule({
    declarations: [
        MyAccountsComponent,
        MergeConvertAccountsToolComponent,
        RegisterTenantComponent
    ],
    imports: [
        ImageCropperModule,
        CommonModule,
        AccountRoutingModule,
        AppCommonModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule.forRoot(),
        TabsModule.forRoot(),
        TooltipModule.forRoot(),
        TreeviewModule.forRoot(),
        FileUploadModule,
        AutoCompleteModule,
        PaginatorModule,
        EditorModule,
        MultiSelectModule,
        DropdownModule,
        InputMaskModule, TableModule, TreeTableModule, TabMenuModule,
        Ng2TelInputModule,
        ModalModule,
        TabsModule,
        TooltipModule,
        UtilsModule,
        CountoModule,
        NgxChartsModule,
        NgImageSliderModule,
        BsDatepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        PopoverModule.forRoot(),
        SelectAddressModule,
        TreeModule,
        CheckboxModule,
        BulkImportModule,
        AccountSharedModule,
        onetouchCommonModule,
        NgxCaptchaModule ,
        PasswordModule ,
        AppBsModalModule ,
        OAuthModule.forRoot(),
    ],
    providers: [
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale }
    ],
})
export class AccountModule { }
