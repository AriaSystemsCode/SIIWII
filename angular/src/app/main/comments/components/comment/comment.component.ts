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

    setupContent() {
      // merge
        const bodyFormat = this.comment?.messages?.body || '';
        if (bodyFormat.length > this.charLimit) {
          this.isLongContent = true;
          this.displayedContent = this.getTruncatedContent(bodyFormat);
        } else {
          this.isLongContent = false;
          this.displayedContent = bodyFormat;
        }
      }
      
      toggleExpand() {
        const bodyFormat = this.comment?.messages?.body || '';
        this.isExpanded = !this.isExpanded;
        this.displayedContent = this.isExpanded
          ? bodyFormat
          : this.getTruncatedContent(bodyFormat);
      }
      
      getTruncatedContent(content: string): string {
        return content.substring(0, this.charLimit) + '...';
      }
      


      getFormattedContent(): string {
        if (!this.comment?.messages?.bodyFormat) {
          return '';
        }
    
        const content = this.comment.messages.bodyFormat;
    
        // If already expanded, return full content
        if (this.isExpanded) {
          return content;
        }
    
        // Truncate content while preserving HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
    
        let text = tempDiv.innerText || tempDiv.textContent || '';
    
        if (text.length > this.charLimit) {
          return text.substring(0, this.charLimit) + '...';
        }
    
        return text;
      }
    
}
