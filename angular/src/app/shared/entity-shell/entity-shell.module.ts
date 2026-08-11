
import { FileUploadModule as PrimeNgFileUploadModule } from 'primeng/fileupload';
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppCommonModule } from "@app/shared/common/app-common.module";

import { UtilsModule } from "@shared/utils/utils.module";
import { FileUploadModule } from "ng2-file-upload";
import { ModalModule } from "ngx-bootstrap/modal";
import { PopoverModule } from "ngx-bootstrap/popover";
import { TabsModule } from "ngx-bootstrap/tabs";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import {
    BsDatepickerConfig,
    BsDaterangepickerConfig,
    BsLocaleService,
} from "ngx-bootstrap/datepicker";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { AutoCompleteModule } from "primeng/autocomplete";
import { EditorModule } from "primeng/editor";
import { InputMaskModule } from "primeng/inputmask";
import { PaginatorModule } from "primeng/paginator";
import { TableModule } from "primeng/table";
import { TreeModule } from "primeng/tree";
import { DragDropModule } from "primeng/dragdrop";
import { TreeDragDropService } from "primeng/api";
import { ContextMenuModule } from "primeng/contextmenu";

import { NgxChartsModule } from "@swimlane/ngx-charts";
import { CountoModule } from "angular2-counto";
import { TextMaskModule } from "angular2-text-mask";
import { ImageCropperModule } from "ngx-image-cropper";
import { NgxBootstrapDatePickerConfigService } from "assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service";
import { DropdownModule } from "primeng/dropdown";

// Metronic
import {
    PerfectScrollbarModule,
} from "ngx-perfect-scrollbar";
import { AppBsModalModule } from "@shared/common/appBsModal/app-bs-modal.module";
import { CdkStepperModule } from "@angular/cdk/stepper";
import { MenuModule } from "primeng/menu";
import { DialogModule } from "primeng/dialog";
import { CheckboxModule } from "primeng/checkbox";
import { SharedDynamicInputsModule } from '@shared/shared-module';
import { AccordionModule } from "primeng/accordion";
import { EntityRightPanelComponent } from './entity-right-panel/entity-right-panel.component';
import { EntityBasicInfoComponent } from './entity-basic-info/entity-basic-info.component';
import { GenericEntityShellComponent } from './generic-entity-shell/generic-entity-shell.component';
import { EntityLeftSidePanelComponent } from './entity-left-side-panel/entity-left-side-panel.component';
import { EntityBreadcrumbComponent } from './entity-breadcrumb/entity-breadcrumb.component';
import { GenericEntityModalComponent } from './generic-entity-modal/generic-entity-modal.component';
import { EntityHeaderComponent } from './entity-header/entity-header.component';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CalendarModule } from 'primeng/calendar';
import { ChipModule } from 'primeng/chip';
import { NgSelectModule } from '@ng-select/ng-select';
import { TreeTableModule } from 'primeng/treetable';
import { TreeSelectModule } from 'primeng/treeselect';
import { DevExpressDemoModule } from '@app/main/dev-express-demo/dev-express-demo.module';
import { TabViewModule } from 'primeng/tabview';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { AuditTrailComponent } from './entity-right-panel/audit-trail/audit-trail.component';
import { RelatedEntitiesComponent } from './entity-right-panel/related-entities/related-entities.component';
import { EntityMessagesComponent } from './entity-right-panel/entity-messages/entity-messages.component';
import { InteractionsModule } from '@app/main/interactions/interactions.module';
import { TransactionModule } from '@app/main/transactions/transaction.module';



@NgModule({
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
               CalendarModule,
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
               TransactionModule

    ],
    declarations: [
        GenericEntityShellComponent,
        EntityBreadcrumbComponent,
        EntityBasicInfoComponent,
        EntityLeftSidePanelComponent,
        EntityRightPanelComponent,
        GenericEntityModalComponent,
        EntityHeaderComponent,
        AuditTrailComponent,
        RelatedEntitiesComponent,
        EntityMessagesComponent,

    ],
    exports: [
                GenericEntityShellComponent,
        EntityBreadcrumbComponent,
        EntityBasicInfoComponent,
        EntityLeftSidePanelComponent,
        EntityRightPanelComponent,
        GenericEntityModalComponent,
        EntityHeaderComponent,
          AuditTrailComponent,
        RelatedEntitiesComponent,
        EntityMessagesComponent,


    ],
    providers: [
  
    ],
})
export class EntityShellModule {}
