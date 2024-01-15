import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppPostsServiceProxy, CreateMessageInput, GetMessagesForViewDto, MesasgeObjectType, MessageServiceProxy, ProfileServiceProxy } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-add-comment',
    templateUrl: './add-comment.component.html',
    styleUrls: ['./add-comment.component.scss']
})
export class AddCommentComponent extends AppComponentBase {
    @ViewChild('CommentTextArea',{static:false}) CommentTextArea :any
    comment:CreateMessageInput = new CreateMessageInput()
    @Output() saveDone : EventEmitter<GetMessagesForViewDto>  = new EventEmitter<GetMessagesForViewDto>();
    commentObject : CreateMessageInput
    active : boolean
    showContactSuggstions:boolean=false;
    @Input() cartStyle: boolean;
    suggListContLeft:any=0;
    suggListTop:any=0;
    constructor(
        private injector: Injector,
        private _messageServiceProxy: MessageServiceProxy,
        private _profileService : ProfileServiceProxy
    ) {
        super(injector)
    }
    profilePicture:string
    hasText:boolean = false
    saving:boolean = false
    maxAcceptedChars:number = 1300
    writtenChars:number = 0
    emptyText:string='emptyText';
    extendTextAreaHandler($event){
        var textarea = $event.target
        const text:string = textarea.value
        this.hasText = Boolean(text.trim())
        var heightLimit = 100; /* Maximum height: 200px */
        textarea.style.height = ""; /* Reset the height*/
        textarea.style.height = Math.min(textarea.scrollHeight, heightLimit) + "px";
        this.writtenChars = text.length
        if(this.writtenChars > this.maxAcceptedChars) {
            textarea.value = text.slice(0,this.maxAcceptedChars)
        }
    }
    focusCommentTextArea(){
        setTimeout(()=>this.CommentTextArea.nativeElement.focus(), 0);
    }
    mentionContact(event){
        debugger
        let enterdValue=String.fromCharCode(event.target.value.charCodeAt(event.target.selectionStart- 1));
        if(enterdValue=='@'){
            // Input String 
            let searchInputVal = event.target.value;
            // Getting last character using char at
            let lastCharachter = searchInputVal.charAt(searchInputVal.length - 1);
            this.suggListContLeft=(event.target.offsetLeft*1.5)+event.target.selectionStart;
            this.suggListTop=event.target.offsetTop+10;

            let previosCharachter:string;
            if(enterdValue==lastCharachter){
                previosCharachter= searchInputVal.charAt(searchInputVal.length - 1);
                if(previosCharachter==' '||previosCharachter==undefined||searchInputVal.length==1){
                  this.showContactSuggstions=true;
                }
            }else{
                let charachterIndex=searchInputVal.indexOf(enterdValue);
                previosCharachter= searchInputVal.charAt(searchInputVal.length - (searchInputVal.length-(charachterIndex-1)));
                if(previosCharachter==' '||previosCharachter==undefined){
                    this.showContactSuggstions=true;
                }
            }
        }
    }
    saveComment(){
        this.saving = true
        if(!this.comment.subject)this.comment.subject = `${MesasgeObjectType[MesasgeObjectType.Comment]} on ${this.comment.body.slice(0,10)}...`
        this.comment.bodyFormat = this.comment.body
        this._messageServiceProxy.createMessage(this.comment)
        .pipe(
            finalize( ()=> this.saving = false )
        )
        .subscribe((res)=>{
            this.reset()
            const comment = res[res.length-1]
            comment.messages.profilePictureUrl = this.profilePicture
            this.saveDone.emit(comment);
        })
    }
    show(comment:CreateMessageInput){
        this.active = true
        this.commentObject = comment
        this.comment.init(CreateMessageInput.fromJS(this.commentObject))
        this.getProfilePicture()
    }
    getProfilePicture(): void {
        this._profileService.getProfilePicture().subscribe(result => {
            if (result && result.profilePicture) {
                this.profilePicture = 'data:image/jpeg;base64,' + result.profilePicture;
            }
        });
    }
    reset(){
        this.hasText = false
        this.comment.init(CreateMessageInput.fromJS(this.commentObject))
    }
    hide(){
        this.active = false
    }
}
