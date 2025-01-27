import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AppPostsServiceProxy, GetMessagesForViewDto } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-comment',
    templateUrl: './comment.component.html',
    styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnChanges {
    @Input() comment : GetMessagesForViewDto
    @Output("toName") toName: EventEmitter<string> = new EventEmitter<string>()
    @ViewChild('content', { static: false }) contentRef!: ElementRef; // Access the <p> element
    isExpanded: boolean = false;
    isLongContent: boolean = false;
    displayedContent: string = '';
    charLimit: number = 30; // Adjust the limit as needed
    constructor(private _postService:AppPostsServiceProxy) { }
    ngOnChanges(changes: SimpleChanges,): void {
        this.getProfilePictureById(this.comment.messages.profilePictureId);
        this.toName.emit(this.comment?.messages?.toName)

    }
    ngOnInit(): void {
        this.setupContent();
    }

    ngAfterViewInit() {
        // Check if the content height exceeds the collapsed height (e.g., 60px)
        // const element = this.contentRef.nativeElement;
        // this.isLongContent = element.scrollHeight > 60; // Adjust based on your CSS collapsed height
      }
    getProfilePictureById(id: string) {
        const subs = this._postService
            .getProfilePictureAllByID(id)
            .subscribe((data) => {
                if (data.profilePicture) {
                    this.comment.messages.profilePictureUrl = "data:image/jpeg;base64," + data.profilePicture;
                }
            });
    }
   

    // toggleExpand() {
    //   this.isExpanded = !this.isExpanded;
    // }
    setupContent() {
        const bodyFormat = this.comment?.messages?.bodyFormat || '';
        if (bodyFormat.length > this.charLimit) {
          this.isLongContent = true;
          this.displayedContent = this.getTruncatedContent(bodyFormat);
        } else {
          this.isLongContent = false;
          this.displayedContent = bodyFormat;
        }
      }
      
      toggleExpand() {
        const bodyFormat = this.comment?.messages?.bodyFormat || '';
        this.isExpanded = !this.isExpanded;
        this.displayedContent = this.isExpanded
          ? bodyFormat
          : this.getTruncatedContent(bodyFormat);
      }
      
      getTruncatedContent(content: string): string {
        return content.substring(0, this.charLimit) + '...';
      }
      
}
