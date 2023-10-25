import { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Pipe({
    name: 'sanitizeurl'
  })
  export class SanitizeurlPipe implements PipeTransform {
  
    constructor(private domSanitizer: DomSanitizer) {}
  
    transform(value: any, args?: any): any {
      return this.domSanitizer.bypassSecurityTrustResourceUrl(value);
    }
  
  }