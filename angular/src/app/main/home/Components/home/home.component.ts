import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { ViewEventComponent } from '@app/main/AppEvent/Components/view-event.component';
import { PostListComponent } from '@app/main/posts/Components/post-list.component';
import { ViewPostComponent } from '@app/main/posts/Components/view-post.component';
import { Router } from '@node_modules/@angular/router';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppEntitiesServiceProxy, AppEventDto, AppPostsServiceProxy, PostType } from '@shared/service-proxies/service-proxies';
import Swal from 'sweetalert2';
@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent extends AppComponentBase implements OnInit {
    @ViewChild("viewEventModal", { static: true })
    viewEventModal: ViewEventComponent;
    @ViewChild("apppostlistcomponent", { static: true })
    appPostListComponent: PostListComponent;
    // refrence to post popup in post componenet
    @ViewChild("viewPostModal", { static: true })
    viewPostModal: ViewPostComponent;
    currentLang: string;
    isArabic: boolean = false;

        defaultLogo = AppConsts.appBaseUrl + '/assets/common/images/logo.png';
        defaultUrl:string
    constructor(    injector: Injector,private _postService:AppPostsServiceProxy, private router: Router,
                    private _appEntitiesServiceProxy: AppEntitiesServiceProxy) {
           super(injector);
        // workaround to prevent tenant from seeing the dashboard
        this.redirectTo();    
     }

    ngOnInit(): void {
        this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName');
        this.isArabic = this.currentLang === 'ar' || this.currentLang === 'ar-EG';
    }

    onViewEventModal($event: number) {
        this.appPostListComponent.onshowViewEvent($event);
    }
    showPost(postid: number) {

        // reterive the post by postId
        this._postService
          .getAll("", "", "",undefined,undefined,undefined,  "", "", postid,  undefined,  undefined, "", 0, 1)
          .subscribe((res) => {
            if (res.items.length > 0) {
              if (res.items[0].type == PostType.TEXT)
              {
                if(this.GetLinkUrl(res.items[0].appPost.description))
                window.open(this.GetLinkUrl(res.items[0].appPost.description), "_blank"); 
                else
                this.viewPostModal.show(res.items[0]);
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


      async redirectTo() {
            console.log(this.defaultUrl,'defau')

            if (this.appSession.tenantId && !this.appSession.user.accountId)
                await this.askForCompleteProfile();
        }
    
        async askForCompleteProfile() {
      
                Swal.fire({
                    title: "",
                    text: "Please Complete Your Profile Information",
                    icon: "warning",
                    showCancelButton: true,
                    cancelButtonText: "Later",
                    confirmButtonText: "Proceed",
                    allowOutsideClick: false,
                    customClass: {
                        popup: 'popup-class',
                        icon: 'icon-class',
                        content: 'content-class',
                        actions: 'actions-class',
                        confirmButton: 'confirm-button-class2'
                    }
            }).then((result) => {
                if (result.isConfirmed)
                this.router.navigate(['/app/main/account'])
            });
        }
 
}
