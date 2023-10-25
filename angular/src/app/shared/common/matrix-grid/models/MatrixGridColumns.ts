import { IMatrixGridColumns } from './IMatrixGridColumns';
import { MatrixGridSelectItem } from './MatrixGridSelectItem';


export class MatrixGridColumns implements IMatrixGridColumns {
  rowHeaderColumn: MatrixGridSelectItem;
  columns: MatrixGridSelectItem[];
  constructor(data?: IMatrixGridColumns) {
    if (data) {
      for (var property in data) {
        if (data.hasOwnProperty(property))
          (<any>this)[property] = (<any>data)[property];
      }
    }
  }
}
