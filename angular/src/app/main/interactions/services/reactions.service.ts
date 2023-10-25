import { Injectable, Injector } from '@angular/core';
import { Reactions } from '@app/main/reactions/models/Reactions.enum';
import { AppComponentBase } from '@shared/common/app-component-base';

@Injectable()
export class ReactionsService extends AppComponentBase {
    defaultReactionType : Reactions = Reactions.Like
    constructor(private injector:Injector) {
        super(injector)
    }
}

