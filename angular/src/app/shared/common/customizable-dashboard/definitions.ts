export class WidgetViewDefinition {
    id: string;
    component: any;
    defaultWidth: number;
    defaultHeight: number;

    constructor(id: string, component: any,  defaultWidth: number = 6, defaultHeight: number = 10) {
        this.id = id;
        this.component = component;
        this.defaultWidth = defaultWidth;
        this.defaultHeight = defaultHeight;
    }
}

export class WidgetFilterViewDefinition {
    id: string;
    component: any;
    constructor(id: string, component: any) {
        this.id = id;
        this.component = component;
    }
}




// widget-catalog.ts
export interface WidgetCard {
    id: string;                // must match WidgetOutput.id
    label: string;
    description: string;
    icon: string;              // fa / pi class or your preview image key
    kind: 'line'|'bar'|'pie'|'doughnut'|'polarArea'|'battery'|'kpi'|'table'|'other';
  }
  
  export const WIDGET_CATALOG: Record<string, WidgetCard> = {
    'line-chart': {
      id: 'line-chart',
      label: 'Line Chart',
      description: 'Custom line chart with any data',
      icon: 'fa fa-line-chart',
      kind: 'line'
    },
    'bar-chart': {
      id: 'bar-chart',
      label: 'Bar Chart',
      description: 'Custom bar chart with any data',
      icon: 'fa fa-bar-chart',
      kind: 'bar'
    },
    'pie-chart': {
      id: 'pie-chart',
      label: 'Pie Chart',
      description: 'Custom pie or donut chart with any data',
      icon: 'fa fa-pie-chart',
      kind: 'pie'
    },
    'battery-chart': {
      id: 'battery-chart',
      label: 'Battery Chart',
      description: 'Custom battery chart with any data',
      icon: 'fa fa-bolt',
      kind: 'battery'
    },
    'kpi-calculation': {
      id: 'kpi-calculation',
      label: 'Calculation',
      description: 'Calculate sums, averages, and KPIs',
      icon: 'fa fa-percent',
      kind: 'kpi'
    },
    'portfolio-table': {
      id: 'portfolio-table',
      label: 'Portfolio',
      description: 'Categorize and track progress of Lists & Folders',
      icon: 'fa fa-table',
      kind: 'table'
    }
  };
  


  export type ChartKind =
  | 'line' | 'bar' | 'pie' | 'doughnut' | 'polarArea'
  | 'battery' | 'kpi' | 'table' | 'other' 


export interface WidgetCard {
  id: string;
  label: string;
  description: string;
  icon: string;
  kind: ChartKind;
}


export const DEFAULT_CHART_CARDS: WidgetCard[] = [
  { id: 'Custom_LineChart',      label: 'Line Chart',      description: 'Custom line chart with any data',  icon: 'fa-line-chart',  kind: 'line' },
  { id: 'Custom_BarChart',       label: 'Bar Chart',       description: 'Custom bar chart with any data',   icon: 'fa-bar-chart',   kind: 'bar' },
  { id: 'Custom_PieChart',       label: 'Pie Chart',       description: 'Custom pie or donut',              icon: 'fa-pie-chart',   kind: 'pie' },
  { id: 'Custom_DoughnutChart',  label: 'Donut Chart',     description: 'Ring-style donut chart',           icon: 'fa-pie-chart',   kind: 'doughnut' },
  { id: 'Custom_PolarAreaChart', label: 'Polar Area',      description: 'Polar area radial chart',          icon: 'fa-compass',     kind: 'polarArea' },
//   { id: 'Custom_RadarChart',     label: 'Radar Chart',     description: 'Compare categories in a radar',    icon: 'fa-superpowers', kind: 'radar' },
//   { id: 'Custom_ScatterChart',   label: 'Scatter',         description: 'XY scatter / trend',               icon: 'fa-braille',     kind: 'scatter' },
  { id: 'Custom_KPI',            label: 'Calculation',     description: 'Totals / averages KPI card',       icon: 'fa-percent',     kind: 'kpi' },
];
