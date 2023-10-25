import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectAddressModalComponent } from '../selectAddress/selectAddress/selectAddress-modal.component';
import { CreateOrEditAddressModalComponent } from '../selectAddress/create-or-edit-Address-modal/create-or-edit-Address-modal.component';
import { AppCommonModule } from '@app/shared/common/app-common.module';
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

@NgModule({
    imports: [
        CommonModule,
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
    ],
    declarations: [
        SelectAddressModalComponent,
        CreateOrEditAddressModalComponent
    ],
    exports: [
        SelectAddressModalComponent,
        CreateOrEditAddressModalComponent
    ],
    providers: []
})
export class SelectAddressModule {
    static forRoot(): ModuleWithProviders<SelectAddressModule> {
        return {
            ngModule: SelectAddressModule,
            providers: [

            ]
        };
    }
}
