import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arrayToString'
})
export class ArrayToStringPipe implements PipeTransform {

  transform(value: string[], ...args: unknown[]): unknown {
    const isArray = Array.isArray(value)
    if(isArray) {
        return value.join(', ')
    } else {
        return null;
    }
  }

}
