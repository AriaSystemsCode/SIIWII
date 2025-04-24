import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { DropdownModule } from 'primeng/dropdown';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { FormsModule } from '@angular/forms';

import { SelectBranchModule } from '@app/select-branch/select-branch.module';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CalendarModule } from 'primeng/calendar';
import { TransactioRoutingModule } from './transaction-routing.module';
import { CreateOrEditAppTransactionModalComponent } from './appTransactions/create-or-edit-appTransaction-modal/create-or-edit-appTransaction-modal.component';
import { ViewAppTransactionModalComponent } from './appTransactions/view-appTransaction-modal/view-appTransaction-modal.component';




import { FileUploadModule as PrimeNgFileUploadModule } from 'primeng/fileupload';
import { ReactiveFormsModule } from "@angular/forms";

import { FileUploadModule } from "ng2-file-upload";
import { ModalModule } from "ngx-bootstrap/modal";
import { PopoverModule } from "ngx-bootstrap/popover";
import { TabsModule } from "ngx-bootstrap/tabs";
import { TooltipModule } from "ngx-bootstrap/tooltip";

import { AutoCompleteModule } from "primeng/autocomplete";
import { EditorModule } from "primeng/editor";
import { InputMaskModule } from "primeng/inputmask";
import { PaginatorModule } from "primeng/paginator";
import { TableModule } from "primeng/table";
import { TreeModule } from "primeng/tree";
import { DragDropModule } from "primeng/dragdrop";
import { ContextMenuModule } from "primeng/contextmenu";




import { NgxChartsModule } from "@swimlane/ngx-charts";
import { CountoModule } from "angular2-counto";
import { TextMaskModule } from "angular2-text-mask";
import { ImageCropperModule } from "ngx-image-cropper";

// Metronic
import {
    PerfectScrollbarModule,
} from "ngx-perfect-scrollbar";
import { AppBsModalModule } from "@shared/common/appBsModal/app-bs-modal.module";
import { CdkStepperModule } from "@angular/cdk/stepper";
import { MenuModule } from "primeng/menu";
import { DialogModule } from "primeng/dialog";
import { CheckboxModule } from "primeng/checkbox";


@NgModule({
    declarations: [
        CreateOrEditAppTransactionModalComponent ,
        ViewAppTransactionModalComponent 
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
    ],
    exports: [
        CreateOrEditAppTransactionModalComponent ,
        ViewAppTransactionModalComponent 
    ]
})
export class TransactionModule { }
