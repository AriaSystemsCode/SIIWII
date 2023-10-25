import { MatrixGridSelectItem } from './MatrixGridSelectItem';

export class MatrixGridRows {
  rowHeader: MatrixGridSelectItem;
  rowValues: MatrixGridSelectItem[];
  canotBeRemoved?:boolean = false
  canotBeRemovedMsg?:string
  disabled?:boolean
  constructor(data?: IMatrixGridRows) {
    if (data) {
      for (var property in data) {
        if (data.hasOwnProperty(property))
          (<any>this)[property] = (<any>data)[property];
      }
    }
  }
}

export interface IMatrixGridRows {
  rowHeader: MatrixGridSelectItem
  rowValues: MatrixGridSelectItem[];
  canotBeRemoved?:boolean
  canotBeRemovedMsg?:string
  disabled?:boolean
}