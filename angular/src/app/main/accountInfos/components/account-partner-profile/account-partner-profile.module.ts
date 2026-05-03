import { CommonModule } from "@angular/common";
import { AccountPartnerCreateEditComponent } from "./components/account-partner-create-edit/account-partner-create-edit.component";
import { AccountPartnerProfileModalComponent } from "./components/account-partner-profile-modal/account-partner-profile-modal.component";
import { AccountPartnerViewComponent } from "./components/account-partner-view/account-partner-view.component";
import { DialogModule } from "primeng/dialog";
import { NgModule } from "@angular/core";
import { AccountPartnerProfileComponent } from "./pages/account-partner-profile/account-partner-profile.component";
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

@NgModule({
  declarations: [
    AccountPartnerProfileComponent,
    AccountPartnerProfileModalComponent,
    AccountPartnerCreateEditComponent,
    AccountPartnerViewComponent
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
        InputSwitchModule
        
    // any needed PrimeNG/shared modules
  ],
  exports: [
        AccountPartnerProfileModalComponent,
    AccountPartnerCreateEditComponent,
    AccountPartnerViewComponent
  ]
})
export class AccountPartnerProfileModule {}