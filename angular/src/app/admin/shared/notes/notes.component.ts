import { Component,Input,Injector,OnInit } from '@angular/core';
import { AppEntitiesServiceProxy } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent  extends AppComponentBase  implements OnInit{
disabledModeOn:boolean=false;
savedNoteData:string='';
modDate:string='';
emptyText:string='emptyText';
saving:boolean = false
@Input() entityId: number;

constructor(
  injector: Injector,
  private _appEntitiesServiceProxy: AppEntitiesServiceProxy){
    super(injector);

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
getCurentDayFormeted(){
  let currentFormatedDate='';
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const currentdate = new Date(); 
  const amPm = currentdate.getHours() >= 12 ? 'PM' : 'AM';
  const hours = (currentdate.getHours() % 12) || 12;

  currentFormatedDate=months[currentdate.getMonth()]+' '+currentdate.getDay()+' '+currentdate.getFullYear()+' , '+
  + hours + ":" +currentdate.getMinutes()+' '+amPm +'\r\n';
  return currentFormatedDate;
}
addCurrentDate(){
if(!this.savedNoteData){
  this.savedNoteData=this.getCurentDayFormeted();
}
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
  this.saving = true;
  const lines = noteVal.split('\n');//gives all lines
  let noteValue;
  if(!isNaN(Date.parse(lines[0]))){
    lines[0]=lines[0]?this.getCurentDayFormeted():'';
     noteValue=lines.join("");

  }else{
     noteValue=noteVal;

  }
  const subs = this._appEntitiesServiceProxy
      .updateAppEntityNotes(this.entityId,noteValue)
      .pipe(
        finalize( ()=> this.saving = false )
       )
      .subscribe((res) => {
           this.disabledModeOn=true;
           this.savedNoteData=noteValue;
      });

}

}
