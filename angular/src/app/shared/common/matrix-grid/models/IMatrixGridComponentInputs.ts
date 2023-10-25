import { MatrixGridRows } from "./MatrixGridRows";
import { MatrixGridColumns } from "./MatrixGridColumns";

export interface IMatrixGridComponentInputs {
  cols: MatrixGridColumns;
  rows: MatrixGridRows[];
  rowHover?: boolean;
  colHover?: boolean;
  reorderableColumns?: boolean;
  reorderableRows?: boolean;
  canAddCols?: boolean;
  canAddRows?: boolean;
}
