import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface AccountUpdatedEvent {
    name: string;
    firstName?: string;
    lastName?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AccountRefreshService {

    private accountUpdatedSubject =
        new Subject<AccountUpdatedEvent>();

    accountUpdated$ =
        this.accountUpdatedSubject.asObservable();

    notifyAccountUpdated(data: AccountUpdatedEvent): void {
        this.accountUpdatedSubject.next(data);
    }
}