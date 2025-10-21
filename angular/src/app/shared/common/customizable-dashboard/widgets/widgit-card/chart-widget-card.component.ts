import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-chart-widget-card',
  templateUrl: './chart-widget-card.component.html'
})
export class ChartWidgetCardComponent implements OnInit {
  @Input() chartType: any;

  /** Optional: allow parent to inject data/options for preview or live widgets */
  @Input() externalData?: any;       // Chart.js ChartData
  @Input() externalOptions?: any;    // Chart.js ChartOptions

  data: any;
  options: any;

  ngOnInit(): void {
    // SAMPLE DATA — replace with your data hook later
    const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const dataset = [12, 19, 3, 5, 2, 3, 9];

    this.data = {
      labels,
      datasets: [
        { label: 'Sample', data: dataset, fill: false }
      ]
    };

    this.options = { responsive: true, maintainAspectRatio: false };
  }
}
