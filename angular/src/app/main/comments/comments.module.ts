import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentsRoutingModule } from './comments-routing.module';
import { AddCommentComponent } from './components/add-comment/add-comment.component';
import { CommentComponent } from './components/comment/comment.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UtilsModule } from '@shared/utils/utils.module';

@NgModule({
    declarations: [
        AddCommentComponent,
        CommentComponent,
    ],
    imports: [
        CommonModule,
        CommentsRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        UtilsModule
    ],
    exports: [
        AddCommentComponent,
        CommentComponent,
    ]
})
export class CommentsModule { }
