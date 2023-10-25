import { Directive, Input, OnChanges, SimpleChange, ElementRef } from "@angular/core";

@Directive({
  selector: '[appFixPEditorAutoScroll]'
})
export class FixPEditorAutoScrollDirective implements OnChanges {
    @Input("appFixPEditorAutoScroll") content: string;

    ngOnChanges(changes: { [property: string]: SimpleChange }) {
        let change = changes["content"];
        let clientHeight = document.documentElement.clientHeight;

        // if (change.isFirstChange() || elemPosition > clientHeight)
        if (!isElementInViewport(this.element.nativeElement))
        {
            this.element.nativeElement.style.display = 'none';
            setTimeout(() => {
                this.element.nativeElement.style.display = '';
            });
        }
        function isElementInViewport (el):boolean {
            var rect = el.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }
    }

    constructor(private element: ElementRef) { }
}
