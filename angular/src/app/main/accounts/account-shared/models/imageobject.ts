export class ImageObject{
    image:string;
    thumbImage:string;
    title:string;
}





export interface AccountsBrowseState {
    filters: any;

    first: number;
    page: number;
    rows: number;

    cardsViewMode: boolean;
    filterVisiblelg: boolean;
}