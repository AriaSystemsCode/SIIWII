import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { DropdownModule } from 'primeng/dropdown';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SelectBranchModule } from '@app/select-branch/select-branch.module';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CalendarModule } from 'primeng/calendar';
import { TransactioRoutingModule } from './transaction-routing.module';
import { TabViewModule } from 'primeng/tabview';
import { FileUploadModule as PrimeNgFileUploadModule } from 'primeng/fileupload';
import { ReactiveFormsModule } from "@angular/forms";
import { FileUploadModule } from "ng2-file-upload";
import { ModalModule } from "ngx-bootstrap/modal";
import { PopoverModule } from "ngx-bootstrap/popover";
import { TabsModule } from "ngx-bootstrap/tabs";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { AccordionModule } from "primeng/accordion";
import { TreeTableModule } from 'primeng/treetable';
import { TreeSelectModule } from "primeng/treeselect";
import { AutoCompleteModule } from "primeng/autocomplete";
import { EditorModule } from "primeng/editor";
import { InputMaskModule } from "primeng/inputmask";
import { PaginatorModule } from "primeng/paginator";
import { TableModule } from "primeng/table";
import { TreeModule } from "primeng/tree";
import { DragDropModule } from "primeng/dragdrop";
import { ContextMenuModule } from "primeng/contextmenu";
import { ChipModule } from 'primeng/chip';
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { CountoModule } from "angular2-counto";
import { TextMaskModule } from "angular2-text-mask";
import { ImageCropperModule } from "ngx-image-cropper";
import {
    PerfectScrollbarModule,
} from "ngx-perfect-scrollbar";
import { AppBsModalModule } from "@shared/common/appBsModal/app-bs-modal.module";
import { CdkStepperModule } from "@angular/cdk/stepper";
import { MenuModule } from "primeng/menu";
import { DialogModule } from "primeng/dialog";
import { CheckboxModule } from "primeng/checkbox";
import { AppTransactionsBrowseComponent } from './appTransactions/appTransBrowse/appTransBrowse.component';
import { AddressComponent } from './app-TransactionTabsInfo/Components/address/address.component';
import { ContactComponent } from './app-TransactionTabsInfo/Components/contact/contact.component';
import { OrderPreviewComponent } from './app-TransactionTabsInfo/Components/order-preview/order-preview.component';
import { OrderInformationComponent } from './app-TransactionTabsInfo/Components/order-information/order-information.component';
import { TransactionInformationComponent } from './app-TransactionTabsInfo/Components/transaction-information-component/transaction-information.component';
import { ViewExtraDataComponent } from './app-TransactionTabsInfo/Components/extra-data/view-extra-data/view-extra-data.component';
import { CreateOrEditExtraDataComponent } from './app-TransactionTabsInfo/Components/extra-data/create-or-edit-extra-data/create-or-edit-extra-data.component';
import { ShareTransactionTabComponent } from './app-TransactionTabsInfo/Components/share-transaction-tab/share-transaction-tab.component';
import { ViewShippingInformationComponent } from './app-TransactionTabsInfo/Components/shipping-info/view-shipping-information/view-shipping-information.component';
import { CreateOrAddShippingInformationComponent } from './app-TransactionTabsInfo/Components/shipping-info/create-or-add-shipping-information/create-or-add-shipping-information.component';
import { CreateOrEditBillingInfoComponent } from './app-TransactionTabsInfo/Components/billing-info/create-or-edit-billing-info/create-or-edit-billing-info.component';
import { ViewBillingInfoComponent } from './app-TransactionTabsInfo/Components/billing-info/view-billing-info/view-billing-info.component';
import { SharedDynamicInputsModule } from '@shared/shared-module';
import { DevExpressDemoModule } from '../dev-express-demo/dev-express-demo.module';
import { InteractionsModule } from '../interactions/interactions.module';
import { CreateTransactionModal } from './appTransactions/createTransactionModal/createTransactionModal.component';
import { NotesModule } from '@app/admin/shared/notes/notes.module';
import { CreateOrEditBuyerSellerContactInfoComponent } from './app-TransactionTabsInfo/Components/buyer-seller-contact-info/create-or-edit-buyer-seller-contact-info/create-or-edit-buyer-seller-contact-info.component';
import { ViewBuyerSellerContactInfoComponent } from './app-TransactionTabsInfo/Components/buyer-seller-contact-info/view-buyer-seller-contact-info/view-buyer-seller-contact-info.component';
import { CreateOrEditSalesRepInfoComponent } from './app-TransactionTabsInfo/Components/salesRep-info/create-or-edit-salesRep-info/create-or-edit-sales-rep-info.component';
import { ViewSalesRepInfoComponent } from './app-TransactionTabsInfo/Components/salesRep-info/view-salesRep-info/view-sales-rep-info.component';
import { SpreadsheetAllModule } from '@syncfusion/ej2-angular-spreadsheet';


@NgModule({
    declarations: [
        AppTransactionsBrowseComponent,
        TransactionInformationComponent,
        OrderInformationComponent,
        OrderPreviewComponent,
        CreateOrEditBuyerSellerContactInfoComponent,
        ViewBuyerSellerContactInfoComponent,
        ContactComponent,
        AddressComponent,
        CreateOrEditSalesRepInfoComponent,
        ViewSalesRepInfoComponent,
        ViewShippingInformationComponent,
        CreateOrAddShippingInformationComponent,
        CreateOrEditBillingInfoComponent,
        ViewBillingInfoComponent,
        ShareTransactionTabComponent,
        CreateOrEditExtraDataComponent,
        ViewExtraDataComponent,
        CreateTransactionModal
    ],
    imports: [
        CommonModule,
        InputSwitchModule,
        BsDropdownModule,
        DropdownModule,
        Ng2TelInputModule,
        AppCommonModule,
        UtilsModule,
        FormsModule,
        BsDatepickerModule.forRoot(),
        SelectBranchModule,
        CalendarModule,
        TransactioRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        FileUploadModule,
        ModalModule.forRoot(),
        TabsModule.forRoot(),
        TooltipModule.forRoot(),
        PopoverModule.forRoot(),
        BsDropdownModule.forRoot(),
        BsDatepickerModule.forRoot(),
        UtilsModule,
        AppCommonModule,
        TableModule,
        TreeModule,
        DragDropModule,
        ContextMenuModule,
        PaginatorModule,
        PrimeNgFileUploadModule,
        AutoCompleteModule,
        EditorModule,
        InputMaskModule,
        NgxChartsModule,
        CountoModule,
        TextMaskModule,
        ImageCropperModule,
        PerfectScrollbarModule,
        DropdownModule,
        AppBsModalModule,
        CdkStepperModule,
        MenuModule,
        DialogModule,
        DropdownModule,
        ReactiveFormsModule,
        CheckboxModule,
        NgSelectModule,
        AccordionModule,
        TreeTableModule,
        TreeSelectModule,
        CalendarModule, TooltipModule, DevExpressDemoModule,
        ChipModule,
        TabViewModule,
        SharedDynamicInputsModule,
        InteractionsModule,
        NotesModule,
        SpreadsheetAllModule

    ],
    exports: [
        CreateTransactionModal,
        TransactionInformationComponent
    ]
})
export class TransactionModule { }
