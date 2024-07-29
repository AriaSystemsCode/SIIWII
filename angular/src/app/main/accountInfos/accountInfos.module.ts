import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { PaginatorModule } from 'primeng/paginator';
import { EditorModule } from 'primeng/editor';
import { InputMaskModule } from 'primeng/inputmask'; import { FileUploadModule } from 'primeng/fileupload';
import { TreeTableModule } from 'primeng/treetable';
import { SelectAddressModule } from '@app/selectAddress/selectAddress.module';
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
import { AccountInfosRoutingModule } from './accountInfos-routing.module';
import { BranchDetailsDynamicModalComponent } from './components/branch-details-dynamic-modal.component';
import { AccountInfoComponent } from './components/accountInfo.component';
import { AccountModule } from '@account/account.module';
import { BranchesComponent } from './components/branches.component';
import { CreateEditExternalAccountComponent } from './components/create-edit-external-account.component';
import { CreateEditManualAccountComponent } from './components/create-edit-manual-account.component';
import { CreateOrEditBranchModalComponent } from './components/create-or-edit-branch-modal.component';
import { CreateOrEditpaymentMethodComponent } from './components/create-or-edit-payment-method.component';
import { PaymentMethodsListComponent } from './components/payment-methods-list.component';
import { ViewOthersProfileComponent } from './components/view-others-profile.component';
import { ViewProfileComponent } from './components/view-profile.component';
import { MembersListSharedModule } from '../members-list/members-list-shared.module';
import { MyMembersModule } from '../teamMembers/my-members.module';
import { AccountBillingComponent } from './components/accountBilling/AccountBilling/accountbilling.component';
import { AddOnsComponent } from './components/accountBilling/components/add-ons/add-ons.component';
import { ActivityLogComponent } from './components/accountBilling/components/activity-log/activity-log.component';
import { TenantInvoicesComponent } from './components/accountBilling/components/tenant-invoices/tenant-invoices.component';
import { PlansComponent } from './components/accountBilling/components/plans/plans.component';
import { MainModule } from '../main.module';


@NgModule({
    declarations: [
        AccountInfoComponent,
        CreateOrEditBranchModalComponent,
        PaymentMethodsListComponent,
        CreateOrEditpaymentMethodComponent,
        CreateEditExternalAccountComponent,
        CreateEditManualAccountComponent,
        BranchesComponent,
        BranchDetailsDynamicModalComponent,
        ViewOthersProfileComponent,
        ViewProfileComponent,
        AccountBillingComponent,
        AddOnsComponent,
        ActivityLogComponent,
        TenantInvoicesComponent,
        PlansComponent
    ],
    imports: [
        CommonModule,
        AccountInfosRoutingModule,
        TreeModule,
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
        InputMaskModule,
        TableModule,
        TreeTableModule,
        TabMenuModule,
        Ng2TelInputModule,
        FormsModule,
        ReactiveFormsModule,
        TooltipModule,
        AppCommonModule,
        UtilsModule,
        CountoModule,
        NgxChartsModule,
        NgImageSliderModule,
        BsDatepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        PopoverModule.forRoot(),
        SelectAddressModule,
        MembersListSharedModule,
        AccountModule,
        MyMembersModule,MainModule
    ],
    providers: [
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale }
    ]
})
export class AccountInfosModule { }
