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
    const head = document.head;
  
    head.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());
  
    const linkEl = this.renderer.createElement('link') as HTMLLinkElement;
    linkEl.id = 'appFavicon';
    this.renderer.setAttribute(linkEl, 'rel', 'icon');
    this.renderer.setAttribute(linkEl, 'type', type);
    this.renderer.setAttribute(linkEl, 'href', url);
  
    this.renderer.appendChild(head, linkEl);
  }
  
  setSeoText(titleText: string, description: string): void {
    this.title.setTitle(titleText);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: titleText });
    this.meta.updateTag({ property: 'og:description', content: description });
  }
}
