import { Injectable } from "@angular/core";
import { waitForAsync } from "@angular/core/testing";
import { ProfileServiceProxy } from "@shared/service-proxies/service-proxies";

@Injectable({
    providedIn: "root",
})
export class PostListService {
    constructor(private _profileService: ProfileServiceProxy) {}

    onChangeBody(textToCheck: string): string {
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
