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
    image: string;              // fa / pi class or your preview image key
    kind:   | 'line' | 'bar' | 'pie' | 'doughnut' | 'polarArea'
  | 'battery' | 'kpi' | 'table' | 'other'  | 'radar' | 'scatter'
  }
  
  export const WIDGET_CATALOG: Record<string, WidgetCard> = {
    'line-chart': {
      id: 'line-chart',
      label: 'Line Chart',
      description: 'Custom line chart with any data',
      icon: 'fa fa-line-chart',
      image:'assets/charts/line-chart.png',
      kind: 'line'
    },
    'bar-chart': {
      id: 'bar-chart',
      label: 'Bar Chart',
      description: 'Custom bar chart with any data',
      icon: 'fa fa-bar-chart',
      image:'assets/charts/bar-chart.png',
      kind: 'bar'
    },
    'pie-chart': {
      id: 'pie-chart',
      label: 'Pie Chart',
      description: 'Custom pie or donut chart with any data',
      icon: 'fa fa-pie-chart',
      image:'assets/charts/pie-chart.png',

      kind: 'pie'
    },
    'battery-chart': {
      id: 'battery-chart',
      label: 'Battery Chart',
      description: 'Custom battery chart with any data',
      icon: 'fa fa-bolt',
      image:'',
      kind: 'battery'
    },
    'kpi-calculation': {
      id: 'kpi-calculation',
      label: 'Calculation',
      description: 'Calculate sums, averages, and KPIs',
      icon: 'fa fa-percent',
      image:'assets/charts/line-chart.png',
      kind: 'kpi'
    },
    'portfolio-table': {
      id: 'portfolio-table',
      label: 'Portfolio',
      description: 'Categorize and track progress of Lists & Folders',
      icon: 'fa fa-table',
      image:'assets/charts/line-chart.png',
      kind: 'table'
    }
  };
  


  export type ChartKind =
  | 'line' | 'bar' | 'pie' | 'doughnut' | 'polarArea'
  | 'battery' | 'kpi' | 'table' | 'other'  | 'radar' | 'scatter'


export interface WidgetCard {
  id: string;
  label: string;
  description: string;
  icon: string;
  kind: 'line'|'bar'|'pie'|'doughnut'|'polarArea'|'battery'|'kpi'|'table'|'other'| 'radar'|'scatter';
}


export const DEFAULT_CHART_CARDS: WidgetCard[] = [
  {
    id: 'Custom_LineChart', label: 'Line Chart', description: 'Custom line chart with any data', icon: 'fa-line-chart', kind: 'line',
    image: 'assets/charts/line-chart.png'
  },
  {
    id: 'Custom_BarChart', label: 'Bar Chart', description: 'Custom bar chart with any data', icon: 'fa-bar-chart', kind: 'bar',
    image: 'assets/charts/bar-chart.png'
  },
  {
    id: 'Custom_PieChart', label: 'Pie Chart', description: 'Custom pie or donut', icon: 'fa-pie-chart', kind: 'pie',
    image: 'assets/charts/pie-chart.png'
  },
  {
    id: 'Custom_DoughnutChart', label: 'Donut Chart', description: 'Ring-style donut chart', icon: 'fa-pie-chart', kind: 'doughnut',
    image: 'assets/charts/donught-chart.png'
  },
  {
    id: 'Custom_PolarAreaChart', label: 'Polar Area', description: 'Polar area radial chart', icon: 'fa-compass', kind: 'polarArea',
    image: 'assets/charts/polar-chart.png'
  },
  {
    id: 'Custom_RadarChart', label: 'Radar Chart', description: 'Compare categories in a radar', icon: 'fa-superpowers', kind: 'radar',
    image: 'assets/charts/radar-chart.png'
  },
  // {
  //   id: 'Custom_ScatterChart', label: 'Scatter', description: 'XY scatter / trend', icon: 'fa-braille', kind: 'scatter',
  //   image:'assets/charts/line-chart.png'
  // },
  // { id: 'Custom_KPI',            label: 'Calculation',     description: 'Totals / averages KPI card',       icon: 'fa-percent',     kind: 'kpi' },
];
