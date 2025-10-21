// import { Component, Output, EventEmitter, Injector, ViewChild } from '@angular/core';
// import { AppComponentBase } from '@shared/common/app-component-base';
// import { WidgetOutput } from '@shared/service-proxies/service-proxies';
// import { ModalDirective } from 'ngx-bootstrap/modal';

// @Component({
//   selector: 'add-widget-modal',
//   templateUrl: './add-widget-modal.component.html',
//   styleUrls: ['./add-widget-modal.component.css']
// })
// export class AddWidgetModalComponent extends AppComponentBase {

//   @Output() onClose = new EventEmitter();
//   @ViewChild('addWidgetModal', { static: true }) modal: ModalDirective;

//   widgets: WidgetOutput[];
//   saving = false;
//   selectedWidgetId: string;

//   constructor(
//     injector: Injector) {
//     super(injector);
//   }

//   close(): void {
//     this.onClose.emit();
//     this.hide();
//   }

//   save(): void {
//     this.onClose.emit(this.selectedWidgetId);
//     this.hide();
//   }

//   show(widgets: WidgetOutput[]): void {
//     this.widgets = widgets;

//     if (this.widgets && this.widgets.length) {
//       this.selectedWidgetId = this.widgets[0].id;
//     } else {
//       this.selectedWidgetId = null;
//     }

//     this.modal.show();
//   }

//   hide(): void {
//     this.modal.hide();
//   }
// }
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { WidgetOutput } from '@shared/service-proxies/service-proxies';
import { WidgetCard } from '../definitions';

interface Card {
  id: string;
  label: string;
  description: string;
  icon: string;
  kind: string;
}

@Component({
  selector: 'add-widget-modal',
  templateUrl: './add-widget-modal.component.html',
  styleUrls: ['./add-widget-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddWidgetModalComponent {
  @ViewChild('picker', { static: true }) picker!: ModalDirective;
  @Output() onClose = new EventEmitter<string>();

  cards: Card[] = [];
  search = '';

  /** Parent calls: this.addWidgetModal.show(widgets) */
  // show(widgets: WidgetOutput[]): void {
  //   // 1) Defensive: ensure array
  //   const list = Array.isArray(widgets) ? widgets : [];
  //   // 2) Map to cards the template expects
  //   this.cards = list.map(w => ({
  //     id: w.id,
  //     label: w.name || 'Widget',
  //     description: w.description || 'Custom widget',
  //     kind: (w.name || '').toLowerCase(),
  //     icon: this.iconFor(w.name)
  //   }));
  //   this.search = '';

  //   // 3) Open modal
  //   this.picker.show();

  //   // 4) If OnPush, mark for check
  //   this.cdr.markForCheck();
  // }
// add-widget-modal.component.ts
show(cards: WidgetCard[]): void {
  this.cards = Array.isArray(cards) ? cards : [];
  this.search = '';
  this.picker.show();
  this.cdr.markForCheck();
}

  hide(): void {
    this.picker.hide();
  }

  pick(widgetId: string): void {
    this.onClose.emit(widgetId);
    this.hide();
  }

  filtered(): Card[] {
    const q = this.search?.trim().toLowerCase();
    if (!q) return this.cards;
    return this.cards.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.kind.includes(q)
    );
  }

  constructor(private cdr: ChangeDetectorRef) {}

  private iconFor(name?: string): string {
    const t = (name || '').toLowerCase();
    if (t.includes('line')) return 'fa-line-chart';
    if (t.includes('bar')) return 'fa-bar-chart';
    if (t.includes('pie') || t.includes('donut')) return 'fa-pie-chart';
    if (t.includes('table') || t.includes('list')) return 'fa-table';
    if (t.includes('kpi') || t.includes('total') || t.includes('calc')) return 'fa-percent';
    return 'fa-area-chart';
  }
}
