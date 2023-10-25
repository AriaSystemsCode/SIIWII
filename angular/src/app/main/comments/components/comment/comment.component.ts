import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AppPostsServiceProxy, GetMessagesForViewDto } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-comment',
    templateUrl: './comment.component.html',
    styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnChanges {
    @Input() comment : GetMessagesForViewDto
    constructor(private _postService:AppPostsServiceProxy) { }
    ngOnChanges(changes: SimpleChanges,): void {
        this.getProfilePictureById(this.comment.messages.profilePictureId);

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
}
