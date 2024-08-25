import { CommonModule, DatePipe } from "@angular/common";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HttpClientJsonpModule } from "@angular/common/http";
import { ChatSignalrService } from "@app/shared/layout/chat/chat-signalr.service";
import { LinkAccountModalComponent } from "@app/shared/layout/link-account-modal.component";
import { LinkedAccountsModalComponent } from "@app/shared/layout/linked-accounts-modal.component";
import { UserDelegationsModalComponent } from "@app/shared/layout/user-delegations-modal.component";
import { CreateNewUserDelegationModalComponent } from "@app/shared/layout/create-new-user-delegation-modal.component";
import { LoginAttemptsModalComponent } from "@app/shared/layout/login-attempts-modal.component";
import { ChangePasswordModalComponent } from "@app/shared/layout/profile/change-password-modal.component";
import { ChangeProfilePictureModalComponent } from "@app/shared/layout/profile/change-profile-picture-modal.component";
import { MySettingsModalComponent } from "@app/shared/layout/profile/my-settings-modal.component";
import { SmsVerificationModalComponent } from "@app/shared/layout/profile/sms-verification-modal.component";
import { ServiceProxyModule } from "@shared/service-proxies/service-proxy.module";
import { UtilsModule } from "@shared/utils/utils.module";
import { FileUploadModule } from "ng2-file-upload";
import { ModalModule } from "ngx-bootstrap/modal";
import { TabsModule } from "ngx-bootstrap/tabs";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { PopoverModule } from "ngx-bootstrap/popover";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { FileUploadModule as PrimeNgFileUploadModule } from "primeng/fileupload";
import { PaginatorModule } from "primeng/paginator";
import { ProgressBarModule } from "primeng/progressbar";
import { TableModule } from "primeng/table";
import { ImpersonationService } from "./admin/users/impersonation.service";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { DefaultLayoutComponent } from "./shared/layout/themes/default/default-layout.component";
import { Theme2LayoutComponent } from "./shared/layout/themes/theme2/theme2-layout.component";
import { Theme3LayoutComponent } from "./shared/layout/themes/theme3/theme3-layout.component";
import { Theme4LayoutComponent } from "./shared/layout/themes/theme4/theme4-layout.component";
import { Theme5LayoutComponent } from "./shared/layout/themes/theme5/theme5-layout.component";
import { Theme6LayoutComponent } from "./shared/layout/themes/theme6/theme6-layout.component";
import { Theme9LayoutComponent } from "./shared/layout/themes/theme9/theme9-layout.component";
import { Theme7LayoutComponent } from "./shared/layout/themes/theme7/theme7-layout.component";
import { Theme8LayoutComponent } from "./shared/layout/themes/theme8/theme8-layout.component";
import { Theme10LayoutComponent } from "./shared/layout/themes/theme10/theme10-layout.component";
import { Theme11LayoutComponent } from "./shared/layout/themes/theme11/theme11-layout.component";
import { Theme12LayoutComponent } from "./shared/layout/themes/theme12/theme12-layout.component";
import { AppCommonModule } from "./shared/common/app-common.module";
import { ChatBarComponent } from "./shared/layout/chat/chat-bar.component";
import { ThemeSelectionPanelComponent } from "./shared/layout/theme-selection/theme-selection-panel.component";
import { ChatFriendListItemComponent } from "./shared/layout/chat/chat-friend-list-item.component";
import { ChatMessageComponent } from "./shared/layout/chat/chat-message.component";
import { FooterComponent } from "./shared/layout/footer.component";
import { StackedFooterComponent } from "./shared/layout/stacked-footer.component";
import { LinkedAccountService } from "./shared/layout/linked-account.service";
import { SideBarMenuComponent } from "./shared/layout/nav/side-bar-menu.component";
import { TopBarMenuComponent } from "./shared/layout/nav/top-bar-menu.component";
import { TopBarComponent } from "./shared/layout/topbar.component";
import { DefaultBrandComponent } from "./shared/layout/themes/default/default-brand.component";
import { Theme2BrandComponent } from "./shared/layout/themes/theme2/theme2-brand.component";
import { Theme3BrandComponent } from "./shared/layout/themes/theme3/theme3-brand.component";
import { Theme4BrandComponent } from "./shared/layout/themes/theme4/theme4-brand.component";
import { Theme5BrandComponent } from "./shared/layout/themes/theme5/theme5-brand.component";
import { Theme6BrandComponent } from "./shared/layout/themes/theme6/theme6-brand.component";
import { Theme7BrandComponent } from "./shared/layout/themes/theme7/theme7-brand.component";
import { Theme8BrandComponent } from "./shared/layout/themes/theme8/theme8-brand.component";
import { Theme9BrandComponent } from "./shared/layout/themes/theme9/theme9-brand.component";
import { Theme10BrandComponent } from "./shared/layout/themes/theme10/theme10-brand.component";
import { Theme11BrandComponent } from "./shared/layout/themes/theme11/theme11-brand.component";
import { Theme12BrandComponent } from "./shared/layout/themes/theme12/theme12-brand.component";
import { UserNotificationHelper } from "./shared/layout/notifications/UserNotificationHelper";
import { HeaderNotificationsComponent } from "./shared/layout/notifications/header-notifications.component";
import { NotificationSettingsModalComponent } from "./shared/layout/notifications/notification-settings-modal.component";
import { NotificationsComponent } from "./shared/layout/notifications/notifications.component";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { TextMaskModule } from "angular2-text-mask";
import { ImageCropperModule } from "ngx-image-cropper";
import { ActiveDelegatedUsersComboComponent } from "./shared/layout/active-delegated-users-combo.component";
import { FileDownloadService } from "@shared/download/fileDownload.service";
import { MenuModule } from "primeng/menu"; // add this import
import { DialogModule } from "primeng/dialog";
import { ChipModule } from 'primeng/chip';

// Metronic
import {
    PerfectScrollbarModule,
    PERFECT_SCROLLBAR_CONFIG,
    PerfectScrollbarConfigInterface,
} from "ngx-perfect-scrollbar";
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    // suppressScrollX: true
};
import { CoreModule } from "@metronic/app/core/core.module";
import { SessionTimeoutModalComponent } from "./shared/common/session-timeout/session-timeout-modal-component";
import { SessionTimeoutComponent } from "./shared/common/session-timeout/session-timeout.component";
import { AutoCompleteModule } from "primeng/autocomplete";
import { MenuSearchBarComponent } from "./shared/layout/nav/menu-search-bar/menu-search-bar.component";
import { NgxSpinnerModule } from "ngx-spinner";
import { ScrollTopComponent } from "./shared/layout/scroll-top.component";
import { AppBsModalModule } from "@shared/common/appBsModal/app-bs-modal.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { CdkStepperModule } from "@angular/cdk/stepper";
import { ToastModule } from "primeng/toast";
import { DropdownModule } from "primeng/dropdown";
import { CheckboxModule } from 'primeng/checkbox';
import { AppTransactionServiceProxy } from "@shared/service-proxies/service-proxies";
import { NgSelectModule } from '@ng-select/ng-select';
import { PostsModule } from './main/posts/posts.module';
import { eventsModule } from './main/AppEvent/events.module';
import { CreateTransactionModal } from "./admin/appTransactions/appTransactions/createTransactionModal.component";
import { AppTransactionsBrowseComponent } from "./admin/appTransactions/appTransactions/appTransBrowse.component";
import { ShoppingCartViewComponentComponent } from "./admin/app-shoppingCart/Components/shopping-cart-view-component/shopping-cart-view-component.component";
import { AccordionModule } from "primeng/accordion";
import { TreeTableModule } from 'primeng/treetable';
import { SalesOrderComponent } from "./admin/app-shoppingCart/Components/sales-order/sales-order.component";
import {OrderPreviewComponent} from "./admin/app-shoppingCart/Components/order-preview/order-preview.component";
import { ContactComponent } from "./admin/app-shoppingCart/Components/contact/contact.component";
import { TreeSelectModule } from "primeng/treeselect";
import { CalendarModule } from 'primeng/calendar';
import { AddressComponent } from "./admin/app-shoppingCart/Components/address/address.component";
import { CreateOrEditBuyerSellerContactInfoComponent } from "./admin/app-shoppingCart/Components/buyer-seller-contact-info/create-or-edit-buyer-seller-contact-info.component";
import { ViewBuyerSellerContactInfoComponent } from "./admin/app-shoppingCart/Components/buyer-seller-contact-info/view-buyer-seller-contact-info.component";
import { NotesComponent } from "./admin/shared/notes/notes.component";
import { InteractionsModule } from "./main/interactions/interactions.module";
import { ViewSalesRepInfoComponent } from "./admin/app-shoppingCart/Components/salesRep-info/view-sales-rep-info.component";
import { CreateOrEditSalesRepInfoComponent } from "./admin/app-shoppingCart/Components/salesRep-info/create-or-edit-sales-rep-info.component";
import { ViewShippingInformationComponent } from "./admin/app-shoppingCart/shipping-info/view-shipping-information/view-shipping-information.component";
import { CreateOrAddShippingInformationComponent } from "./admin/app-shoppingCart/shipping-info/create-or-add-shipping-information/create-or-add-shipping-information.component";
import { CreateOrEditBillingInfoComponent } from "./admin/app-shoppingCart/Components/billing-info/create-or-edit-billing-info/create-or-edit-billing-info.component";
import { ViewBillingInfoComponent } from "./admin/app-shoppingCart/Components/billing-info/view-billing-info/view-billing-info.component";
import { DevExpressDemoModule } from "./main/dev-express-demo/dev-express-demo.module";
import { ShareTransactionTabComponent } from "./admin/app-shoppingCart/Components/share-transaction-tab/share-transaction-tab.component";
import { TabViewModule } from 'primeng/tabview';
@NgModule({
    declarations: [
        AppComponent,
        DefaultLayoutComponent,
        Theme2LayoutComponent,
        Theme3LayoutComponent,
        Theme4LayoutComponent,
        Theme5LayoutComponent,
        Theme6LayoutComponent,
        Theme7LayoutComponent,
        Theme8LayoutComponent,
        Theme9LayoutComponent,
        Theme10LayoutComponent,
        Theme11LayoutComponent,
        Theme12LayoutComponent,
        HeaderNotificationsComponent,
        SideBarMenuComponent,
        TopBarMenuComponent,
        FooterComponent,
        ScrollTopComponent,
        StackedFooterComponent,
        LoginAttemptsModalComponent,
        LinkedAccountsModalComponent,
        UserDelegationsModalComponent,
        CreateNewUserDelegationModalComponent,
        LinkAccountModalComponent,
        ChangePasswordModalComponent,
        ChangeProfilePictureModalComponent,
        MySettingsModalComponent,
        SmsVerificationModalComponent,
        NotificationsComponent,
        ChatBarComponent,
        ThemeSelectionPanelComponent,
        ChatFriendListItemComponent,
        NotificationSettingsModalComponent,
        ChatMessageComponent,
        TopBarComponent,
        DefaultBrandComponent,
        Theme2BrandComponent,
        Theme3BrandComponent,
        Theme4BrandComponent,
        Theme5BrandComponent,
        Theme6BrandComponent,
        Theme7BrandComponent,
        Theme8BrandComponent,
        Theme9BrandComponent,
        Theme10BrandComponent,
        Theme11BrandComponent,
        Theme12BrandComponent,
        SessionTimeoutModalComponent,
        SessionTimeoutComponent,
        MenuSearchBarComponent,
        ActiveDelegatedUsersComboComponent,
        CreateTransactionModal,
        AppTransactionsBrowseComponent,
        ShoppingCartViewComponentComponent,
        SalesOrderComponent,
        OrderPreviewComponent,
        CreateOrEditBuyerSellerContactInfoComponent,
        ViewBuyerSellerContactInfoComponent,
        ContactComponent,
        AddressComponent,
        NotesComponent,
        CreateOrEditSalesRepInfoComponent,
        ViewSalesRepInfoComponent,
        ViewShippingInformationComponent,
        CreateOrAddShippingInformationComponent,
        CreateOrEditBillingInfoComponent,
        ViewBillingInfoComponent,
        ShareTransactionTabComponent
    ],
    imports: [
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        HttpClientJsonpModule,
        ModalModule.forRoot(),
        TooltipModule.forRoot(),
        TabsModule.forRoot(),
        BsDropdownModule.forRoot(),
        PopoverModule.forRoot(),
        BsDatepickerModule.forRoot(),
        FileUploadModule,
        AppRoutingModule,
        UtilsModule,
        AppCommonModule.forRoot(),
        ServiceProxyModule,
        TableModule,
        PaginatorModule,
        PrimeNgFileUploadModule,
        ProgressBarModule,
        PerfectScrollbarModule,
        CoreModule,
        NgxChartsModule,
        TextMaskModule,
        ImageCropperModule,
        AutoCompleteModule,
        NgxSpinnerModule,
        AppBsModalModule,
        CdkStepperModule,
        ToastModule, PostsModule, eventsModule,InteractionsModule,
        MenuModule,
        DialogModule,
        DropdownModule,
        ReactiveFormsModule,
        CheckboxModule,
        NgSelectModule,
        AccordionModule,
        TreeTableModule,
        TreeSelectModule,
        CalendarModule, TooltipModule,DevExpressDemoModule,
        ChipModule,
        TabViewModule
    ],
    providers: [
        ImpersonationService,
        LinkedAccountService,
        FileDownloadService,
        UserNotificationHelper,
        ChatSignalrService,
        {
            provide: PERFECT_SCROLLBAR_CONFIG,
            useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
        },
        DatePipe,
        AppTransactionServiceProxy
    ],
})
export class AppModule {}
