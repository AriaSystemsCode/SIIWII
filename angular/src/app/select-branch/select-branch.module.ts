import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SelectBranchRoutingModule } from './select-branch-routing.module';
import { SelectBranchModalComponent } from './select-branch-modal/select-branch-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TreeModule } from 'primeng/tree';
import { BranchesComponent } from './branches/branches.component';
import { CreateOrEditBranchModalComponent } from './create-or-edit-branch-modal/create-or-edit-branch-modal.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { PaginatorModule } from 'primeng/paginator';
import { DropdownModule } from 'primeng/dropdown';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { InputMaskModule } from 'primeng/inputmask';
import { TreeTableModule } from 'primeng/treetable';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectAddressModule } from '@app/selectAddress/selectAddress.module';
import { TableModule } from 'primeng/table';
import { EditorModule } from 'primeng/editor';
import { FileUploadModule } from 'primeng/fileupload';
import { CountoModule } from 'angular2-counto';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BsDatepickerConfig, BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TabMenuModule } from 'primeng/tabmenu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TabViewModule } from 'primeng/tabview';
import { AccordionModule } from "primeng/accordion";
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';
import { PublishService } from '@app/main/app-items/app-item-shared/services/publish.service';
import { TreeviewModule } from 'ngx-treeview';
import { NgImageSliderModule } from 'ng-image-slider';
import { BranchDetailsDynamicModalComponent } from './branch-details-dynamic-modal/branch-details-dynamic-modal.component';
import { SidebarModule } from 'primeng/sidebar';

@NgModule({
  declarations: [SelectBranchModalComponent,BranchesComponent,CreateOrEditBranchModalComponent,BranchDetailsDynamicModalComponent],
  imports: [
    ModalModule.forRoot(),
    CommonModule,
    SelectBranchRoutingModule,
    CommonModule,
    TreeModule,
    AppCommonModule,
    UtilsModule,
    FormsModule,
    ReactiveFormsModule,

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
        CountoModule,
        NgxChartsModule,
        NgImageSliderModule,
        BsDatepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        PopoverModule.forRoot(),
        SelectAddressModule,

        // MembersListSharedModule,
        // AccountModule,
        // MyMembersModule,


        // MainModule,



        ConfirmDialogModule,
        DialogModule,
        TabViewModule,
        // PostsModule,
        // InteractionsModule,EventsBrowseModule,AccountSharedModule,
        // MarketplaceProductsModule,
        // OverALLRatingReviewsModule,InputSwitchModule,
        // SharedDynamicInputsModule,
        AccordionModule,
        SidebarModule
        
       
  ],
      providers: [
          { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
          { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
          { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale },PublishService
      ],
  exports : [SelectBranchModalComponent,BranchesComponent,CreateOrEditBranchModalComponent,BranchDetailsDynamicModalComponent]
})
export class SelectBranchModule { }
