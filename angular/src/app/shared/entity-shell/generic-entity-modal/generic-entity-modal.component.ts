import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-generic-entity-modal',
  templateUrl: './generic-entity-modal.component.html',
  styleUrls: ['./generic-entity-modal.component.scss']
})
export class GenericEntityModalComponent {
  @Input() visible = false;
  @Input() maximized = false;
  @Input() width = '90vw';
  @Input() height = '90vh';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<void>();
  @Output() minimize = new EventEmitter<void>();
  @Output() maximize = new EventEmitter<boolean>();

  onDialogHide(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.close.emit();
  }

  onClose(): void {
    this.onDialogHide();
  }

  onMinimize(): void {
    this.minimize.emit();
  }

  toggleMaximize(): void {
    this.maximized = !this.maximized;
    this.maximize.emit(this.maximized);
  }
}