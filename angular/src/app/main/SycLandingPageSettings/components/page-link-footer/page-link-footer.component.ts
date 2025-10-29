import { Component, Input } from "@angular/core";



@Component({
    selector: "app-page-link-footer",
    templateUrl: "./page-link-footer.component.html",
    styleUrls: ["./page-link-footer.component.scss"],
})
export class PageLinkFooterComponent {
    @Input() data: any[] = [];
    @Input() sectionId:number;
  }