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
          { name: 'date',     label: 'Date',     type: 'date',   role: 'datetime'  },
          { name: 'status',     label: 'Status',     type: 'string', role: 'dimension' },
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
  runQuery(cfg: ChartConfig): QueryResult {
    const labels = cfg.dimension ? ['A','B','C','D','E'] : ['Total'];
    const base = cfg.measure === 'amount'  ? 120
               : cfg.measure === 'number of rows' ? 300
               : cfg.measure === 'quantity'? 40  : 80;
    // pretend filters alter numbers slightly
    const wiggle = (cfg.filters?.length || 0) * 6;
    const data = labels.map((_, i) => base + i * 12 - wiggle);

    return {
      labels,
      datasets: [{ label: `${cfg.entity}.${cfg.measure}`, data }]
    };
  }
}
