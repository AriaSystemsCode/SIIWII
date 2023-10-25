import { IMatrixGridComponentInputs } from './IMatrixGridComponentInputs';
import { MatrixGridRows } from "./MatrixGridRows";
import { MatrixGridColumns } from "./MatrixGridColumns";


export class MatrixGridComponentInputs implements IMatrixGridComponentInputs {
  cols: MatrixGridColumns;
  rows: MatrixGridRows[];
  rowHover?: boolean = false;
  colHover?: boolean = false;
  reorderableColumns?: boolean = false;
  reorderableRows?: boolean = false;
  canAddCols?: boolean = false;
  canAddRows?: boolean = false;
  constructor(data?: IMatrixGridComponentInputs) {
    if (data) {
      for (var property in data) {
        if (data.hasOwnProperty(property))
          (<any>this)[property] = (<any>data)[property];
      }
    }
  }
}
