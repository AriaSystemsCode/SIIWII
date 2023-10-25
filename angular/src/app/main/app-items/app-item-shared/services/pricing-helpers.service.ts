import { Injectable, Injector } from '@angular/core';
import { MatrixGridColumns } from '@app/shared/common/matrix-grid/models/MatrixGridColumns';
import { MatrixGridRows } from '@app/shared/common/matrix-grid/models/MatrixGridRows';
import { MatrixGridSelectItem } from '@app/shared/common/matrix-grid/models/MatrixGridSelectItem';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppItemPriceInfo, CurrencyInfoDto, IAppItemPriceInfo } from '@shared/service-proxies/service-proxies';

@Injectable({
  providedIn: 'root' 
})
export class PricingHelpersService extends AppComponentBase {
  levels: string[] = ['A', 'B', 'C', 'D']
  defaultLevel:string = 'MSRP'
  constructor(private injector: Injector) {
    super(injector);
  }
  getDefaultCols(): MatrixGridColumns {
    const cols: MatrixGridColumns = new MatrixGridColumns({
      rowHeaderColumn:
        new MatrixGridSelectItem({
          label: this.l('Currency'),
          value: undefined
        }),
      columns: this.setColsValues() 
    });
    return cols
  }
  getRows(currency?:CurrencyInfoDto,currencyPrices?:AppItemPriceInfo[]): MatrixGridRows {
    const row: MatrixGridRows = new MatrixGridRows({
      rowHeader:
        new MatrixGridSelectItem({
          label: `${currency?.label} ${currency?.symbol || ''}`,
          value: currency?.value,
          code: currency?.code,
        }),
      rowValues: this.setRowValues(currencyPrices) 
    });
    return row
  }
  setRowValues(prices?:AppItemPriceInfo[]) : MatrixGridSelectItem[] {
    const rowValues : MatrixGridSelectItem[] = [
      new MatrixGridSelectItem({ 
        label: this.l(this.defaultLevel), 
        value: prices ? prices[this.getDefaultPricingIndex(prices)]?.price : 0 
      }),
    ]
    this.levels.forEach(level => {
      const col = new MatrixGridSelectItem({ 
        label : level,
        value: prices ? prices[this.getDefaultPricingIndex(prices)]?.price : 0 
      })
      rowValues.push(col)
    })
    
    return rowValues
  }
  setColsValues() : MatrixGridSelectItem[] {
    const colValues : MatrixGridSelectItem[] = [
      new MatrixGridSelectItem({ label: this.l(this.defaultLevel), value: this.l(this.defaultLevel) }),
    ]
    this.levels.forEach(level => {
      const col = new MatrixGridSelectItem({ label: this.l('PriceLevel{0}', level), value: level })
      colValues.push(col)
    })
    return colValues
  }
  getDefaultPricingInstance(){
    return new AppItemPriceInfo({ 
        code :this.defaultLevel, 
        currencyCode:this.tenantDefaultCurrency.code,
        currencyId:this.tenantDefaultCurrency.value,
        currencyName:this.tenantDefaultCurrency.label,
        price:0,
        currencySymbol:this.tenantDefaultCurrency.symbol
    } as IAppItemPriceInfo)
  }
  getPricingInstance(level:string,currency:CurrencyInfoDto){
    return new AppItemPriceInfo({ 
      code :level, 
      currencyCode:currency.code,
      currencyId:currency.value,
      currencyName:currency.label,
      price:0,
      currencySymbol:currency.symbol
    } as IAppItemPriceInfo) 
  }
  getPricingIndex(prices:AppItemPriceInfo[], level:string, currencyId?:number){
    return prices.findIndex(item=>item.code == level &&  (currencyId ? currencyId == item.currencyId : true) )
  }
  getDefaultPricingIndex(prices:AppItemPriceInfo[]){
    return this.getPricingIndex(prices, this.defaultLevel, this.tenantDefaultCurrency.value)
  }
}
