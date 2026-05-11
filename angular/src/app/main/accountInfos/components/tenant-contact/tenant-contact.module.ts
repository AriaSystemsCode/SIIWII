import { CommonModule } from "@angular/common";
import { DialogModule } from "primeng/dialog";
import { NgModule } from "@angular/core";
import { DropdownModule } from "primeng/dropdown";
import { AppCommonModule } from "@app/shared/common/app-common.module";
import { TableModule } from 'primeng/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { TabMenuModule } from 'primeng/tabmenu';
import { MultiSelectModule } from 'primeng/multiselect';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { NgImageSliderModule } from 'ng-image-slider';
import { TreeviewModule } from 'ngx-treeview';
import { TreeModule } from 'primeng/tree';
import { TabViewModule } from 'primeng/tabview';
import { InputSwitchModule } from "primeng/inputswitch";
import { TenantContactComponent } from "./pages/tenant-contact/tenant-contact.component";
import { TenantContactModalComponent } from "./components/tenant-contact-modal/tenant-contact-modal.component";
import { TenantContactCreateEditComponent } from "./components/tenant-contact-create-edit/tenant-contact-create-edit.component";
import { TenantContactViewComponent } from "./components/tenant-contact-view/tenant-contact-view.component";
import { TenantContactSidebarComponent } from './components/tenant-contact-sidebar/tenant-contact-sidebar.component';
import { TenantContactActivityPanelComponent } from './components/tenant-contact-activity-panel/tenant-contact-activity-panel.component';
import { TenantContactAuditTrailComponent } from './components/tenant-contact-activity-panel/tenant-contact-audit-trail/tenant-contact-audit-trail.component';
import { TenantContactMessagesComponent } from './components/tenant-contact-activity-panel/tenant-contact-messages/tenant-contact-messages.component';
import { NotesModule } from "@app/admin/shared/notes/notes.module";

@NgModule({
  declarations: [
    TenantContactComponent,
    TenantContactModalComponent,
    TenantContactCreateEditComponent,
    TenantContactViewComponent,
    TenantContactSidebarComponent,
    TenantContactActivityPanelComponent,
    TenantContactAuditTrailComponent,
    TenantContactMessagesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    AppCommonModule,
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
        ReactiveFormsModule,
        TooltipModule,
        UtilsModule,
        CountoModule,
        NgImageSliderModule,
        BsDropdownModule.forRoot(),
        SelectAddressModule,
        TabViewModule,
        InputSwitchModule,
        NotesModule
        
        
    // any needed PrimeNG/shared modules
  ],
  exports: [
      TenantContactModalComponent,
    TenantContactCreateEditComponent,
    TenantContactViewComponent,
    TenantContactComponent,
        TenantContactActivityPanelComponent,
    TenantContactAuditTrailComponent,
    TenantContactMessagesComponent
  ]
})
export class TenantContactModule {}