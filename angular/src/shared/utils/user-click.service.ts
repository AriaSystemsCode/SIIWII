import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class UserClickService {
    private clickSubject: Subject<string> = new Subject<string>();
    clickSubject$: Observable<string> = this.clickSubject.asObservable();
    constructor() {}
    userClicked(target:string) {
        this.clickSubject.next(target);
    }
}
