import { Component,Input } from '@angular/core';
import { AppEntitiesServiceProxy } from '@shared/service-proxies/service-proxies';
@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent {
disabledModeOn:boolean=false;
savedNoteData:string='';
@Input() entityId: number;

constructor(private _appEntitiesServiceProxy: AppEntitiesServiceProxy){
}
ngOnInit(): void {
if(this.entityId!==0){
  this.getSavedNotes();
}else{
  this.disabledModeOn=false;
}  
}
changeDisabledMode(){
  this.disabledModeOn=!this.disabledModeOn;
}


getSavedNotes() {
  const subs = this._appEntitiesServiceProxy
      .getAppEntityNotes(this.entityId)
      .subscribe((res) => {
           if(res){
            this.disabledModeOn=true;
            this.savedNoteData=res;
          }
      });
}
saveNote(noteVal){
  const noteValue=noteVal;
  console.log(noteVal)
  const subs = this._appEntitiesServiceProxy
      .updateAppEntityNotes(this.entityId,noteValue)
      .subscribe((res) => {
           this.disabledModeOn=true;

      });

}

}
