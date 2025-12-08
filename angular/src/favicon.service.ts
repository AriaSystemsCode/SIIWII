import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class FaviconService {
  private renderer: Renderer2;

  constructor(
    rendererFactory: RendererFactory2,
    private title: Title,
    private meta: Meta
  ) {
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
      this.renderer.setAttribute(linkEl, 'rel', 'icon');
      this.renderer.appendChild(head, linkEl);
    }

    this.renderer.setAttribute(linkEl, 'type', type);
    this.renderer.setAttribute(linkEl, 'href', url);
  }

  setSeoText(titleText: string, description: string): void {
    this.title.setTitle(titleText);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: titleText });
    this.meta.updateTag({ property: 'og:description', content: description });
  }
}
