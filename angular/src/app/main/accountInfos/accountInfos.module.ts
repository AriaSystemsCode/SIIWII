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
import { BranchDetailsDynamicModalComponent } from './components/branch-details-dynamic-modal/branch-details-dynamic-modal.component';
import { AccountInfoComponent } from './components/accountInfo/accountInfo.component';
import { AccountModule } from '@account/account.module';
import { BranchesComponent } from './components/branches/branches.component';
import { CreateEditExternalAccountComponent } from './components/create-edit-external-account/create-edit-external-account.component';
import { CreateEditManualAccountComponent } from './components/create-edit-manual-account/create-edit-manual-account.component';
import { CreateOrEditBranchModalComponent } from './components/create-or-edit-branch-modal/create-or-edit-branch-modal.component';
import { CreateOrEditpaymentMethodComponent } from './components/create-or-edit-payment-method/create-or-edit-payment-method.component';
import { PaymentMethodsListComponent } from './components/payment-methods-list/payment-methods-list.component';
import { ViewOthersProfileComponent } from './components/view-others-profile/view-others-profile.component';
import { ViewProfileComponent } from './components/view-profile/view-profile.component';
import { MembersListSharedModule } from '../members-list/members-list-shared.module';
import { MyMembersModule } from '../teamMembers/my-members.module';
import { PublishService } from '../app-items/app-item-shared/services/publish.service';
import { AddOnsComponent } from './components/accountBilling/components/add-ons/add-ons.component';
import { ActivityLogComponent } from './components/accountBilling/components/activity-log/activity-log.component';
import { TenantInvoicesComponent } from './components/accountBilling/components/tenant-invoices/tenant-invoices.component';
import { PlansComponent } from './components/accountBilling/components/plans/plans.component';
import { MainModule } from '../main.module';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TabViewModule } from 'primeng/tabview';
import { MarketplaceAccountProfileComponent } from './components/marketplace-account-profile-view/marketplace-account-profile/marketplace-account-profile.component';
import { OverviewTabComponent } from './components/marketplace-account-profile-view/overview-tab/overview-tab.component';
import { PostsModule } from '../posts/posts.module';
import { InteractionsModule } from '../interactions/interactions.module';
import { EventsBrowseModule } from '../AppEventsBrowse/events-browse.module';
import { AccountSharedModule } from '../accounts/account-shared/account-shared.module';
import { ConnectionsTabComponent } from './components/marketplace-account-profile-view/connections-tab/connections-tab.component';
import { EventsTabComponent } from './components/marketplace-account-profile-view/events-tab/events-tab.component';
import { PostsTabComponent } from './components/marketplace-account-profile-view/posts-tab/posts-tab.component';
import { ConnectionsCardComponent } from './components/connections-card/connections-card.component';
import { MarketplaceProductsModule } from '../marketplace/marketplace-products/marketplace-products.module';
import { MediaTabComponent } from './components/marketplace-account-profile-view/Media-tab/media-tab.component';
import { AccountBillingComponent } from './components/accountBilling/accountBilling/accountbilling.component';
import { OverALLRatingReviewsModule } from '../overallRating-reviews/overallRating-reviews.module';
import { InputSwitchModule } from 'primeng/inputswitch';
import { RelationshipSettingsComponent } from './components/relationship-settings/relationship-settings.component';
import { SharedDynamicInputsModule } from '@shared/shared-module';
import { AccordionModule } from "primeng/accordion";
import { TenantContactModule } from './components/tenant-contact/tenant-contact.module';

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
        PlansComponent,
        MarketplaceAccountProfileComponent,
        OverviewTabComponent,EventsTabComponent,ConnectionsTabComponent, PostsTabComponent, ConnectionsCardComponent,
        MediaTabComponent,
        RelationshipSettingsComponent,
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
        MyMembersModule,MainModule,
        ConfirmDialogModule,
        DialogModule,
        TabViewModule,
        PostsModule,
        InteractionsModule,EventsBrowseModule,AccountSharedModule,
        MarketplaceProductsModule,
        OverALLRatingReviewsModule,InputSwitchModule,
        SharedDynamicInputsModule,
        AccordionModule,
        TenantContactModule
        
        
    ],
    providers: [
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale },PublishService
    ],
    exports:[
        ConnectionsCardComponent
    ]
})
export class AccountInfosModule { }
