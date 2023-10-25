import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, ElementRef} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { MaintainancesServiceProxy, CreateOrEditMaintainanceDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';




@Component({
    selector: 'createOrEditMaintainanceModal',
    templateUrl: './create-or-edit-maintainance-modal.component.html'
})
export class CreateOrEditMaintainanceModalComponent extends AppComponentBase implements OnInit{
   
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    maintainance: CreateOrEditMaintainanceDto = new CreateOrEditMaintainanceDto();




    constructor(
        injector: Injector,
        private _maintainancesServiceProxy: MaintainancesServiceProxy
    ) {
        super(injector);
    }
    
    show(maintainanceId?: number): void {
    

        if (!maintainanceId) {
            this.maintainance = new CreateOrEditMaintainanceDto();
            this.maintainance.id = maintainanceId;
            this.maintainance.from = moment().startOf('day');
            this.maintainance.to = moment().startOf('day');


            this.active = true;
            this.modal.show();
        } else {
            this._maintainancesServiceProxy.getMaintainanceForEdit(maintainanceId).subscribe(result => {
                this.maintainance = result.maintainance;



                this.active = true;
                this.modal.show();
            });
        }
        
        
    }

    dateChanged(eventDate: string): moment.Moment | null {
        return !!eventDate ? moment(eventDate) : null;
}

    save(): void {
            this.saving = true;
            
			
			
            this._maintainancesServiceProxy.createOrEdit(this.maintainance)
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
    
     ngOnInit(): void {
        
     }    
}
