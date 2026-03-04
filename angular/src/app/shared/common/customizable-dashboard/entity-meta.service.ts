// entity-meta.service.ts
import { Injectable } from '@angular/core';
import { ChartConfig, EntityField, EntityName, FilterDef, QueryResult } from './widget-types';

@Injectable({ providedIn: 'root' })
export class EntityMetaService {
  getEntities(): EntityName[] { return ['transactions','items','accounts']; }

  getFields(entity: EntityName): EntityField[] {
    switch (entity) {
      case 'transactions':
        return [
          { name: 'amount',   label: 'Amount',   type: 'number', role: 'measure'   },
          { name: 'quantity', label: 'Quantity', type: 'number', role: 'measure'   },
          // { name: 'date',     label: 'Date',     type: 'date',   role: 'datetime'  },
          { name: 'createdAt', label: 'Created date', type: 'date', role: 'datetime' },
          { name: 'completedAt', label: 'Completed date', type: 'date', role: 'datetime' },
          { name: 'status',     label: 'Status',     type: 'string', role: 'dimension' },
          { name: 'seller',     label: 'Seller',     type: 'string', role: 'dimension' },
        ];
      case 'items':
        return [
          { name: 'quantity', label: 'Quantity', type: 'number', role: 'measure'   },
          { name: 'category', label: 'Category', type: 'string', role: 'dimension' },
        ];
      case 'accounts':
        return [
          { name: 'number of rows',  label: 'number of rows',  type: 'number', role: 'measure'   },
          { name: 'Type',     label: 'Type',  type: 'string', role: 'dimension' },
        ];
    }
  }

  getFilters(entity: EntityName): FilterDef[] {
    const fields = this.getFields(entity);
    return fields.map(f => ({
      field: f.name,
      label: f.label,
      operators: f.type === 'number'
        ? ['eq','ne','gt','gte','lt','lte','between']
        : f.type === 'date'
        ? ['between','gte','lte','eq']
        : ['eq','ne','contains','notContains','in']
    }));
  }

  // 👇 mock a query using the config (swap for your real backend later)
  // runQuery(cfg: any): any {
  //   // CALCULATION
  //   if (cfg.chartType === 'calculation' && cfg.calculation) {
  //     const { agg, field } = cfg.calculation;
  
  //     // mock result
  //     const base = field === 'amount' ? 1200 : field === 'quantity' ? 220 : 50;
  //     const wiggle = (cfg.filters?.length || 0) * 7;
  
  //     const value =
  //       agg === 'count' ? 42 - wiggle :
  //       agg === 'sum'   ? base * 3 - wiggle :
  //       agg === 'avg'   ? base - wiggle :
  //       agg === 'min'   ? Math.max(1, base - 40 - wiggle) :
  //       agg === 'max'   ? base + 90 - wiggle :
  //       base;
  
  //     return { value };
  //   }
  
  //   // EXISTING CHART LOGIC
  //   const labels = cfg.dimension ? ['A','B','C','D','E'] : ['Total'];
  //   const base = cfg.measure === 'amount' ? 120
  //     : cfg.measure === 'number of rows' ? 300
  //     : cfg.measure === 'quantity' ? 40 : 80;
  
  //   const wiggle = (cfg.filters?.length || 0) * 6;
  //   const data = labels.map((_: any, i: number) => base + i * 12 - wiggle);
  
  //   return {
  //     labels,
  //     datasets: [{ label: `${cfg.entity}.${cfg.measure}`, data }]
  //   };
  // }
  runQuery(cfg: ChartConfig): any {
    // CALC
    if (cfg.chartType === 'calculation') {
      return { value: 123 }; // mock
    }
  
    // BAR
    if (cfg.chartType === 'bar') {
      const labels = ['A','B','C'];
      return {
        labels,
        datasets: [{ label: 'Count', data: [2, 3, 1] }]
      };
    }
  
    // LINE
    if (cfg.chartType === 'line') {
      const labels = ['W1','W2','W3','W4'];
      return {
        labels,
        datasets: [
          { label: 'Open', data: [3,2,4,1] },
          { label: 'Closed', data: [1,3,2,4] }
        ]
      };
    }
  
    // PIE/DOUGHNUT/DEFAULT
    const labels = cfg.dimension ? ['A','B','C'] : ['Total'];
    return {
      labels,
      datasets: [{ label: `${cfg.entity}.${cfg.measure}`, data: [12, 19, 3] }]
    };
  }
}
