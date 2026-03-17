import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { GetAppPostForViewDto } from '@shared/service-proxies/service-proxies';

@Component({
  selector: 'app-news-video-tile',
  templateUrl: './news-video-tile.component.html',
  styleUrls: ['./news-video-tile.component.scss'],
})
export class NewsVideoTileComponent {
  @Input() post: GetAppPostForViewDto;
  @Input() singleItemPerRowMode = false;

  @Output() open = new EventEmitter<GetAppPostForViewDto>();

  attachmentBaseUrl = AppConsts.remoteServiceBaseUrl ;

  get videoSrc(): string {
    const url = this.post?.attachmentsURLs?.[0];
    return url ? `${this.attachmentBaseUrl}/${url}` : '';
  }

  play(ev: any) {
    const v = ev.target as HTMLVideoElement;
    v.play().catch(() => {});
  }

  pause(ev: any) {
    const v = ev.target as HTMLVideoElement;
    v.pause();
    v.currentTime = 0;
  }
}