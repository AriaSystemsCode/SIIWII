import { Component, ViewChild, Injector, Output, EventEmitter} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SycApplicationsServiceProxy, CreateOrEditSycApplicationDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';


@Component({
    selector: 'createOrEditSycApplicationModal',
    templateUrl: './create-or-edit-sycApplication-modal.component.html'
})
export class CreateOrEditSycApplicationModalComponent extends AppComponentBase {
   
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    sycApplication: CreateOrEditSycApplicationDto = new CreateOrEditSycApplicationDto();



    constructor(
        injector: Injector,
        private _sycApplicationsServiceProxy: SycApplicationsServiceProxy
    ) {
        super(injector);
    }
    
    show(sycApplicationId?: number): void {
    

        if (!sycApplicationId) {
            this.sycApplication = new CreateOrEditSycApplicationDto();
            this.sycApplication.id = sycApplicationId;

            this.active = true;
            this.modal.show();
        } else {
            this._sycApplicationsServiceProxy.getSycApplicationForEdit(sycApplicationId).subscribe(result => {
                this.sycApplication = result.sycApplication;


                this.active = true;
                this.modal.show();
            });
        }
        
    }

    save(): void {
            this.saving = true;

			
			
            this._sycApplicationsServiceProxy.createOrEdit(this.sycApplication)
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
