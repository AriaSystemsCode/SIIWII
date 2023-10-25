// <!-- Iteration-8 -->
import { OnInit, ViewChild } from "@angular/core";
import { Injector } from "@angular/core";
import { Input } from "@angular/core";
import { Component } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { ModalDirective } from "ngx-bootstrap/modal";

@Component({
    selector: "GenericProgressModal",
    templateUrl: './GenericProgress.component.html',
    styleUrls: ['./GenericProgress.component.scss'], 
    
})
export class GenericProgressComponent extends AppComponentBase implements OnInit {
    @ViewChild('GenericProgress', { static: true }) modal: ModalDirective;
    @Input() progress: number;
    @Input() progressHeader: string;
    @Input() ProgressDetail: string;
    
    public constructor(
        injector: Injector) {
        super(injector);
    }

    ngOnInit()
    {

    }

    show()
    { 
       this.modal.show();
    }

    hide() {
        this.modal.hide();
    }

 
}
// <!-- Iteration-8 -->