import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class MessageReadService {
    private readMessageSubject: Subject<boolean> = new Subject<boolean>();
    readMessageSubject$: Observable<boolean> = this.readMessageSubject.asObservable();
    constructor() {}
    userClicked(target:boolean) {
        this.readMessageSubject.next(target);
    }
}
