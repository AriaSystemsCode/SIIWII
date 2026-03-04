import { Component, EventEmitter, Output, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';

export type LayoutPreset = 'blank' | '2x2' | '3x2';

export interface CreateDashboardPayload {
  name: string;
  description?: string | null;
  layoutPreset: LayoutPreset;
}

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
  saving = false;

  layoutPresets = [
    { label: 'Blank', value: 'blank' as LayoutPreset },
    { label: '2 x 2 grid', value: '2x2' as LayoutPreset },
    { label: '3 x 2 grid', value: '3x2' as LayoutPreset },
  ];

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
      description: [null, [Validators.maxLength(500)]],
      layoutPreset: ['blank' as LayoutPreset, Validators.required],
    });
  }

  show(): void {
    this.saving = false;
    this.form.reset(
      {
        name: '',
        description: null,
        layoutPreset: 'blank' as LayoutPreset,
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
    if (this.form.invalid || this.saving) return;

    const payload: CreateDashboardPayload = this.form.value;

    this.saving = true;
    this.cdr.markForCheck();

    // TODO: replace this with real backend call:
    // this.dashboardService.create(payload).subscribe(...)
    setTimeout(() => {
      const fakeId = Date.now(); // replace with returned id
      this.saving = false;

      this.created.emit({ id: fakeId, name: payload.name });
      this.dlg.hide();
      this.cdr.markForCheck();
    }, 500);
  }
}