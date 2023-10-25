import { Component, ViewChild, Injector, Output, EventEmitter} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SuiIconsServiceProxy, CreateOrEditSuiIconDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';

@Component({
    selector: 'createOrEditSuiIconModal',
    templateUrl: './create-or-edit-suiIcon-modal.component.html'
})
export class CreateOrEditSuiIconModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    suiIcon: CreateOrEditSuiIconDto = new CreateOrEditSuiIconDto();



    constructor(
        injector: Injector,
        private _suiIconsServiceProxy: SuiIconsServiceProxy
    ) {
        super(injector);
    }

    show(suiIconId?: number): void {

        if (!suiIconId) {
            this.suiIcon = new CreateOrEditSuiIconDto();
            this.suiIcon.id = suiIconId;

            this.active = true;
            this.modal.show();
        } else {
            this._suiIconsServiceProxy.getSuiIconForEdit(suiIconId).subscribe(result => {
                this.suiIcon = result.suiIcon;


                this.active = true;
                this.modal.show();
            });
        }
        
    }

    save(): void {
            this.saving = true;

			
            this._suiIconsServiceProxy.createOrEdit(this.suiIcon)
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
