import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appPageWrapper]'
})
export class PageWrapperDirective {

    constructor(renderer: Renderer2, elemRef: ElementRef) {
        const wHeight = window.innerHeight;
        const scHeight = window.screen.height;
        let i = (wHeight > 0 ? wHeight : scHeight) - 1;
        i -= 90;
        if (i < 1) {
            i = 1;
        }
        if (i > 90) {
            renderer.setStyle(elemRef.nativeElement, 'min-height', i + 'px');
        }
    }

}
