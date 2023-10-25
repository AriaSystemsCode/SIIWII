import { Component, ViewChild, Injector, Output, EventEmitter} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SycServicesServiceProxy, CreateOrEditSycServiceDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';


@Component({
    selector: 'createOrEditSycServiceModal',
    templateUrl: './create-or-edit-sycService-modal.component.html'
})
export class CreateOrEditSycServiceModalComponent extends AppComponentBase {
   
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    sycService: CreateOrEditSycServiceDto = new CreateOrEditSycServiceDto();



    constructor(
        injector: Injector,
        private _sycServicesServiceProxy: SycServicesServiceProxy
    ) {
        super(injector);
    }
    
    show(sycServiceId?: number): void {
    

        if (!sycServiceId) {
            this.sycService = new CreateOrEditSycServiceDto();
            this.sycService.id = sycServiceId;

            this.active = true;
            this.modal.show();
        } else {
            this._sycServicesServiceProxy.getSycServiceForEdit(sycServiceId).subscribe(result => {
                this.sycService = result.sycService;


                this.active = true;
                this.modal.show();
            });
        }
        
    }

    save(): void {
            this.saving = true;

			
			
            this._sycServicesServiceProxy.createOrEdit(this.sycService)
             .pipe(finalize(() => { this.saving = false;}))
             .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
             });
    }







    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
