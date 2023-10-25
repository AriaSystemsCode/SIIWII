import { IMatrixGridSelectItem } from './IMatrixGridSelectItem';

export class MatrixGridSelectItem implements IMatrixGridSelectItem {
  label: string;
  code?: string;
  value: any;
  required?: boolean;
  reorederable?: boolean 
  disabled?:boolean
  constructor(data?: IMatrixGridSelectItem) {
    if (data) {
      for (var property in data) {
        if (data.hasOwnProperty(property))
          (<any>this)[property] = (<any>data)[property];
      }
    }
  }
}
