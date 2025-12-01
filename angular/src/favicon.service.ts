import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FaviconService {
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  setFaviconFromUrl(url: string, type: string = 'image/png'): void {
    if (!url) {
      return;
    }

    const head = document.querySelector('head') as HTMLHeadElement;
    let linkEl = document.querySelector('#appFavicon') as HTMLLinkElement;

    if (!linkEl) {
      linkEl = this.renderer.createElement('link');
      linkEl.id = 'appFavicon';
      linkEl.rel = 'icon';
      this.renderer.appendChild(head, linkEl);
    }

    linkEl.type = type;
    linkEl.href = url;
  }
}
