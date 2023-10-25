import { Component, ViewChild, Injector, Output, EventEmitter} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SycEntityObjectStatusesServiceProxy, CreateOrEditSycEntityObjectStatusDto ,SycEntityObjectStatusSydObjectLookupTableDto
					} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';

@Component({
    selector: 'createOrEditSycEntityObjectStatusModal',
    templateUrl: './create-or-edit-sycEntityObjectStatus-modal.component.html'
})
export class CreateOrEditSycEntityObjectStatusModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    sycEntityObjectStatus: CreateOrEditSycEntityObjectStatusDto = new CreateOrEditSycEntityObjectStatusDto();

    sydObjectName = '';

	allSydObjects: SycEntityObjectStatusSydObjectLookupTableDto[];
					
    constructor(
        injector: Injector,
        private _sycEntityObjectStatusesServiceProxy: SycEntityObjectStatusesServiceProxy
    ) {
        super(injector);
    }

    show(sycEntityObjectStatusId?: number): void {

        if (!sycEntityObjectStatusId) {
            this.sycEntityObjectStatus = new CreateOrEditSycEntityObjectStatusDto();
            this.sycEntityObjectStatus.id = sycEntityObjectStatusId;
            this.sydObjectName = '';

            this.active = true;
            this.modal.show();
        } else {
            this._sycEntityObjectStatusesServiceProxy.getSycEntityObjectStatusForEdit(sycEntityObjectStatusId).subscribe(result => {
                this.sycEntityObjectStatus = result.sycEntityObjectStatus;

                this.sydObjectName = result.sydObjectName;

                this.active = true;
                this.modal.show();
            });
        }
        this._sycEntityObjectStatusesServiceProxy.getAllSydObjectForTableDropdown().subscribe(result => {						
						this.allSydObjects = result;
					});
					
    }

    save(): void {
            this.saving = true;

			
            this._sycEntityObjectStatusesServiceProxy.createOrEdit(this.sycEntityObjectStatus)
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
