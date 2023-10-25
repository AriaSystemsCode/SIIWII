import { Directive, ElementRef, HostListener, Input, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[appClickOutside]'
})
export class ClickOutSideDirective {

  constructor(private _elementRef: ElementRef) { }
  @Input('appClickOutside') appClickOutside : boolean;
  @Input('anotherElemSkip') anotherElemRef : ElementRef;
  @Input('autoHide') autoHide : boolean = true

  @Output('clickOutside') clickOutside: EventEmitter<any> = new EventEmitter();

  @HostListener('document:click', ['$event']) onMouseEnter($event) {
    const targetElement = $event.target
    const clickedInside = this._elementRef.nativeElement.contains(targetElement);
    const anotherElemClickedInside = this.anotherElemRef === targetElement
    if ( clickedInside || anotherElemClickedInside ) {
        $event.stopPropagation()
        return this._elementRef.nativeElement.style.display = 'flex'
    }
    if ( this.autoHide ){
        this._elementRef.nativeElement.style.display = 'none'
    }
    this.clickOutside.emit(null);
  }


}
