import { Component, OnInit, ViewChild } from '@angular/core';
import { ViewEventComponent } from '@app/main/AppEvent/Components/view-event.component';
import { PostListComponent } from '@app/main/posts/Components/post-list.component';
import { ViewPostComponent } from '@app/main/posts/Components/view-post.component';
import { AppEventDto, AppPostsServiceProxy, PostType } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    @ViewChild("viewEventModal", { static: true })
    viewEventModal: ViewEventComponent;
    @ViewChild("apppostlistcomponent", { static: true })
    appPostListComponent: PostListComponent;
    // refrence to post popup in post componenet
    @ViewChild("viewPostModal", { static: true })
    viewPostModal: ViewPostComponent;
    constructor(private _postService:AppPostsServiceProxy) { }

    ngOnInit(): void {
    }

    onViewEventModal($event: number) {
        this.appPostListComponent.onshowViewEvent($event);
    }
    showPost(postid: number) {

        // reterive the post by postId
        this._postService
          .getAll("", "", "", "", "", "", postid, "", 0, 1)
          .subscribe((res) => {
            if (res.items.length > 0) {
              if (res.items[0].type == PostType.TEXT)
              {
                window.open(this.GetLinkUrl(res.items[0].appPost.description), "_blank");
              }
              else
              {
              this.viewPostModal.show(res.items[0]);
              }
            }
          });
      }
      GetLinkUrl(textToCheck: string): string {
        let linkUrl = null;
        let hasLink = false;

        if (textToCheck) {
            /* var expression =
                /(https?:\/\/)?[\w\-~]+(\.[\w\-~]+)+(\/[\w\-~@:%]*)*(#[\w\-]*)?(\?[^\s]*)?/gi; */
            var expression =
                /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
            var regex = new RegExp(expression);
            var match;
            var splitText = [];
            var startIndex = 0;
            // while ((match = regex.exec(textToCheck)) != null) {
            //     splitText.push({
            //         text: textToCheck.substr(
            //             startIndex,
            //             match.index - startIndex
            //         ),
            //         type: "text",
            //     });

            //     var cleanedLink = textToCheck.substr(
            //         match.index,
            //         match[0].length
            //     );
            //     splitText.push({ text: cleanedLink, type: "link" });

            //     startIndex = match.index + match[0].length;
            // }
            // if (startIndex < textToCheck.length)
            //     splitText.push({
            //         text: textToCheck.substr(startIndex),
            //         type: "text",
            //     });
            // var indx = splitText.findIndex((x) => x.type == "link");

            // if (indx >= 0) {
            //     var video_id = splitText[indx].text.includes("v=")
            //         ? splitText[indx].text.split("v=")[1].split("&")[0]
            //         : null;
            //     linkUrl = video_id
            //         ? "//www.youtube.com/embed/" + video_id
            //         : splitText[indx].text;
            //     hasLink = true;
            // }
            const matchedUrls  = textToCheck.match(regex);
            if(matchedUrls !=null && matchedUrls?.length > 0)  linkUrl = matchedUrls[matchedUrls.length-1]
        }

        return linkUrl;
    }

}
