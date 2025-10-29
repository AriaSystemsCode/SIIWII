import { Component, Input } from "@angular/core";



@Component({
    selector: "app-social-media-footer",
    templateUrl: "./social-media-footer.component.html",
    styleUrls: ["./social-media-footer.component.scss"],
})
export class SocialMediaFooterComponent {
    links: any[] = [];
    @Input() sectionId:number;


    ngOnInit(){
        this.links = [
            { name: 'facebook',  url: 'https://www.facebook.com/siiwii.network/',  iconSrc: 'assets/landingPage/Footer_FB_Btn.svg' },
            { name: 'instagram', url: 'https://www.instagram.com/siiwii.network/', iconSrc: 'assets/landingPage/Footer_Instagram_Btn.svg' },
            { name: 'twitter',   url: 'https://twitter.com/siiwii_net',            iconSrc: 'assets/landingPage/Footer_Twitter_Btn.svg' },
            { name: 'linkedin',  url: 'https://www.linkedin.com/company/siiwii/',   iconSrc: 'assets/landingPage/Footer_Linkedin_Btn.svg' },
            { name: 'youtube',   url: 'https://www.youtube.com/channel/UCv_4Ao0myNHsjfxyg4lbLbg', iconSrc: 'assets/landingPage/Footer_Youtube_Btn.jpg' },
          ];
    }
  }
