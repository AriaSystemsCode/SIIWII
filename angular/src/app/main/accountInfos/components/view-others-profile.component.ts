import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
  selector: 'app-view-others-profile',
  templateUrl: './view-others-profile.component.html',
})
export class ViewOthersProfileComponent extends AppComponentBase implements OnInit  {
    accountId : number
    constructor(
        injector:Injector,
        private activatedRoute:ActivatedRoute
        ) {
            super(injector);
    }

    ngOnInit() {
        this.activatedRoute.params.subscribe(params => {
            this.accountId = params['id']
        });
    }
}
