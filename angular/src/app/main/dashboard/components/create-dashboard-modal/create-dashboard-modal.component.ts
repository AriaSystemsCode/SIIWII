import {
  Component,
  EventEmitter,
  Output,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  AppDashboardsServiceProxy,
  CreateOrEditDashboardInfoDto
} from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

export interface CreatedDashboardResult {
  id: number;
  name: string;
}

@Component({
  selector: 'app-create-dashboard-modal',
  templateUrl: './create-dashboard-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateDashboardModalComponent {
  @ViewChild('dlg', { static: true }) dlg!: ModalDirective;

  @Output() created = new EventEmitter<CreatedDashboardResult>();

  form: FormGroup;
 

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    public appDashboardsAppService: AppDashboardsServiceProxy
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(120)]],
  
    });
  }

  show(): void {

    this.form.reset(
      {
        name: '',
      
      },
      { emitEvent: false }
    );

    this.dlg.show();
    this.cdr.markForCheck();
  }

  hide(): void {
    this.dlg.hide();
  }

  submit(): void {
    const payload = new CreateOrEditDashboardInfoDto();
    payload.id = 0; // create new
    payload.name = this.form.get('name')?.value?.trim();
    payload.isTemplate = false;

    this.appDashboardsAppService
      .createOrEditDashboard(payload)
      .pipe(
        finalize(() => {
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (result) => {
          this.created.emit({
            id: result?.dashboard?.id || result?.id || 0,
            name: result?.dashboard?.name || payload.name || ''
          });

          this.hide();
        },
        error: (error) => {}
      });
  }
}