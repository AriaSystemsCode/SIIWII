import { Component, EventEmitter, Output } from '@angular/core';

export type DashboardWidgetKind = 'calculation' | 'bar' | 'line' | 'doughnut' | 'pie';

interface WidgetKindCard {
  kind: DashboardWidgetKind;
  title: string;
  desc: string;
  img: string; // assets path
}

@Component({
  selector: 'app-add-widget-picker',
  templateUrl: './add-widget-picker.component.html',
  styleUrls: ['./add-widget-picker.component.scss'],
})
export class AddWidgetPickerComponent {
  @Output() selectKind = new EventEmitter<DashboardWidgetKind>();
  @Output() closed = new EventEmitter<void>();

  visible = false;

  cards: WidgetKindCard[] = [
    { kind: 'calculation', title: 'Calculation', desc: 'Single KPI value', img: 'assets/charts/calculation.png' },
    { kind: 'bar',         title: 'Bar Chart',   desc: 'Compare categories', img: 'assets/charts/bar-chart.png' },
    { kind: 'line',        title: 'Line Chart',  desc: 'Trends over time', img: 'assets/charts/line-chart.png' },
    { kind: 'doughnut',    title: 'Doughnut',    desc: 'Share of total', img: 'assets/charts/donught-chart.png' },
    { kind: 'pie',         title: 'Pie Chart',   desc: 'Distribution', img: 'assets/charts/pie-chart.png' },
  ];

  show(): void { this.visible = true; }
  hide(): void { this.visible = false; this.closed.emit(); }

  pick(kind: DashboardWidgetKind): void {
    this.visible = false;
    this.selectKind.emit(kind);
  }

  onImgErr(e: Event) {
    (e.target as HTMLImageElement).src = 'assets/common/images/placeholder.png';
  }
}