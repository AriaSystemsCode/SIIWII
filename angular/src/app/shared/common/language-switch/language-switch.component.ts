import { Component, Injector, OnInit } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    ChangeUserLanguageDto,
    ProfileServiceProxy,
} from "@shared/service-proxies/service-proxies";
import * as _ from "lodash";

@Component({
    selector: "language-switch",
    templateUrl: "./language-switch.component.html",
    styleUrls: ['./language-switch.component.scss']
})
export class LanguageSwitchComponent
    extends AppComponentBase
    implements OnInit
{
    currentLanguage: abp.localization.ILanguageInfo;
    languages: abp.localization.ILanguageInfo[] = [];

    constructor(
        injector: Injector,
        private _profileServiceProxy: ProfileServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.languages = _.filter(
            abp.localization.languages,
            (l) => (<any>l).isDisabled === false
        );
        this.currentLanguage = abp.localization.currentLanguage;
    }

    changeLanguage(language: abp.localization.ILanguageInfo) {
        const input = new ChangeUserLanguageDto();
        input.languageName = language.name;

        if (this.tokenService.getToken()) {
            this._profileServiceProxy.changeLanguage(input).subscribe(() => {
                this._changeLanguage(language.name);
            });
        } else this._changeLanguage(language.name);
    }
    _changeLanguage(languageName: string) {
        abp.utils.setCookieValue(
            "Abp.Localization.CultureName",
            languageName,
            new Date(new Date().getTime() + 5 * 365 * 86400000), // 5 year
            abp.appPath
        );

        location.reload();
    }
}
