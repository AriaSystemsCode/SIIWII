import { Component, Injector, OnInit, Input } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';

@Component({
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    selector: 'footer-bar'
})
export class FooterComponent extends AppComponentBase implements OnInit {
    releaseDate: string;
    @Input() useBottomDiv = true;
    webAppGuiVersion: string;

    constructor(
        injector: Injector
    ) {
        super(injector);
    }

    ngOnInit(): void {
        // this.releaseDate = this.appSession.application.releaseDate.format('YYYYMMDD');
        this.webAppGuiVersion = AppConsts.WebAppGuiVersion;
    }
}
