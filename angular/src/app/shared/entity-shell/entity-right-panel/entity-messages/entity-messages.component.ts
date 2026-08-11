import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { CommentParentComponent } from '@app/main/interactions/components/comment-parent/comment-parent.component';

@Component({
  selector: 'app-entity-messages',
  templateUrl: './entity-messages.component.html',
  styleUrls: ['./entity-messages.component.scss']
})
export class EntityMessagesComponent
  implements AfterViewInit, OnChanges {

  @ViewChild('commentParentComponent')
  commentParentComponent:
    CommentParentComponent;


  @Input()
  entityId: number;


  @Input()
  creatorUserId: number;


  @Input()
  parentId?: number;


  activeMessageTab:
    'direct' |
    'threads' |
    'mentions' =
      'direct';


  private viewInitialized =
    false;


  ngAfterViewInit(): void {

    this.viewInitialized =
      true;

    this.loadCommentsList();
  }


  ngOnChanges(
    changes: SimpleChanges
  ): void {

    if (
      this.viewInitialized &&
      (
        changes.entityId ||
        changes.creatorUserId ||
        changes.parentId
      )
    ) {

      this.loadCommentsList();
    }
  }


 selectTab(
  tab:
    'direct' |
    'threads' |
    'mentions'
): void {

  if (
    this.activeMessageTab === tab
  ) {
    return;
  }

  this.activeMessageTab =
    tab;

  setTimeout(() => {

    this.loadCommentsList();

  });
}


  loadCommentsList(): void {

    if (!this.entityId) {
      return;
    }


    setTimeout(() => {

      this.commentParentComponent
        ?.show(
          this.creatorUserId,
          this.entityId,
          this.parentId
        );

    }, 100);
  }


  getCommentsRefreshed(
    event: boolean
  ): void {

    if (event) {
      this.loadCommentsList();
    }
  }

get currentMessageObjectType():
  'MESSAGE' |
  'THREAD' |
  'MENTION' {

  switch (
    this.activeMessageTab
  ) {

    case 'threads':
      return 'THREAD';

    case 'mentions':
      return 'MENTION';

    case 'direct':
    default:
      return 'MESSAGE';
  }
}
  onNewMessageAdded(): void {

    this.loadCommentsList();
  }
}