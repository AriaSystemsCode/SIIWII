import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ViewEventComponent } from '@app/main/AppEvent/Components/view-event.component';
import { PageSettingDto } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs';
import { LandingPageBlocksService } from '../../services/landing-page-blocks.service';

@Component({
  selector: 'app-landing-page-four-blocks',
  templateUrl: './landing-page-four-blocks.component.html',
  styleUrls: ['./landing-page-four-blocks.component.scss'],
})
export class LandingPage4BlocksComponent implements OnInit {
  @Input() sectionId: number;
  @Input() title: string;
  @Input() titleAlignment = 'Left';
  @Input() blockTypeIsSingleOrMixed: string;
  @Input() loginTenaneSsin: string;

  @ViewChild('viewEventModal') viewEventModal: ViewEventComponent;

  readonly maxBlocks = 4;
  blocks: PageSettingDto[] = [];
  loading = false;

  constructor(private blocksService: LandingPageBlocksService) {}

  ngOnInit(): void {
    this.loadBlocks();
  }

  loadBlocks(): void {
    if (!this.sectionId) return;

    this.loading = true;

    this.blocksService
      .getSectionBlocks(this.sectionId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: blocks => (this.blocks = blocks.slice(0, this.maxBlocks)),
        error: () => (this.blocks = []),
      });
  }

  get textAlign(): string {
    switch (this.titleAlignment) {
      case 'Center': return 'center';
      case 'Right': return 'right';
      default: return 'left';
    }
  }

  openEventDetails(id: number): void {
    this.viewEventModal?.show(id, 0);
  }
}