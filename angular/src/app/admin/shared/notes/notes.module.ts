import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesComponent } from './notes.component';
import { AppCommonModule } from '@app/shared/common/app-common.module'; 
import { UtilsModule } from '@shared/utils/utils.module';

@NgModule({
  declarations: [NotesComponent],
  exports: [NotesComponent],
  imports: [
    CommonModule,
    FormsModule,
    AppCommonModule, 
    UtilsModule
  ]
})
export class NotesModule {}
