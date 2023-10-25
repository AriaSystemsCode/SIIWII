import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'textSubstring'
})
export class TextSubstringPipe implements PipeTransform {

  transform(value: string, limit): string {

    let transformedString
    if( typeof value  === 'string' && !isNaN(limit) ) {
        transformedString =  value.substr(0,limit)
        if( limit < value.length ) transformedString += '...'
    } else {
        transformedString = value
    }
    return transformedString
  }

}
