import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SendMailModalComponent } from '@app/shared/common/Mail/sendMail-modal.component';
import { MessagesComponent} from '../Messages/Messages.Component';
import { SendMessageModalComponent} from '../Messages/SendMessage-Modal.Component';
// import { MomentModule } from 'ngx-moment';
import {niceDateFormatPipe} from './date-pip/niceDateFormatPipe'

import { MessagesRoutingModule } from './messages-routing.module';
import { FormsModule,ReactiveFormsModule  } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { SelectAddressModule } from '@app/selectAddress/selectAddress.module';
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
NgxBootstrapDatePickerConfigService.registerNgxBootstrapDatePickerLocales();
@NgModule({
  declarations: [MessagesComponent,SendMessageModalComponent,niceDateFormatPipe],
  imports: [
    CommonModule,
    MessagesRoutingModule,
    AppCommonModule,
    FormsModule,
    // MomentModule.forRoot({
    //   relativeTimeThresholdOptions: {
    //     'm': 59
    //   }
    // }),
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
    SelectAddressModule
  ],
  exports:[MessagesComponent,SendMessageModalComponent,niceDateFormatPipe],
  providers: [
    { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
    { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
    { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale }
  ]
})
export class MessagesModule { }
