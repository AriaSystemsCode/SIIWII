import { Injectable } from '@angular/core';
import { ProfileServiceProxy } from '@shared/service-proxies/service-proxies';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UpdateLogoService {
  private logoUpdated: Subject<boolean> = new Subject<boolean>()
  private profilePictureUpdated: BehaviorSubject<string> = new BehaviorSubject<string>('')

  logoUpdated$: Observable<boolean> = this.logoUpdated.asObservable()
  profilePictureUpdated$: Observable<string> = this.profilePictureUpdated.asObservable()
  profilePicture: string

  constructor(
    private _profileServiceProxy: ProfileServiceProxy
  ) {
    this.updateProfilePicture()
  }

  updateLogo() {
    this.logoUpdated.next(true)
  }

  updateProfilePicture() {
    this._profileServiceProxy.getProfilePicture().subscribe((result) => {
      if (result && result.profilePicture) {
        this.profilePicture =
          "data:image/jpeg;base64," + result.profilePicture;
        this.profilePictureUpdated.next(this.profilePicture)
      }
    });
  }


}
