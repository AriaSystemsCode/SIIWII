// widgets/widget-outlet/widget-outlet.component.ts
import { Component, Input, OnChanges, SimpleChanges, Type, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-widget-outlet',
  templateUrl: './widget-outlet.component.html',
  styleUrls: ['./widget-outlet.component.scss']
})
export class WidgetOutletComponent implements OnChanges {
  @ViewChild('vc', { read: ViewContainerRef, static: true }) vc!: ViewContainerRef;
  @Input() component!: Type<any>;
  @Input() inputs: Record<string, any> = {}; // e.g. { chartType: 'line' }

  ngOnChanges(_: SimpleChanges): void {
    if (!this.component) return;
    this.vc.clear();
    const ref = this.vc.createComponent(this.component);
    if (ref?.instance && this.inputs) {
      Object.entries(this.inputs).forEach(([k, v]) => (ref.instance as any)[k] = v);
    }
    ref.changeDetectorRef.detectChanges();
  }
}
