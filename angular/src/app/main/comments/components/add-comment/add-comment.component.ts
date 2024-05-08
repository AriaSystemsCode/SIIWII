import { Component, EventEmitter, ElementRef, Injector,HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppPostsServiceProxy, CreateMessageInput, GetMessagesForViewDto, MesasgeObjectType,
     MessageServiceProxy, ProfileServiceProxy,AppEntitiesServiceProxy, MentionedUserInfo } from '@shared/service-proxies/service-proxies';
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
    @Input() relatedEntityId:any;
    suggListContLeft:any=0;
    suggListTop:any=0;
    mentionedUsers:Array<any>=[];

    constructor(
        private injector: Injector,
        private _messageServiceProxy: MessageServiceProxy,
        private _profileService : ProfileServiceProxy,
        private eRef: ElementRef,
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy
    ) {
        super(injector)
    }
    profilePicture:string
    hasText:boolean = false
    saving:boolean = false
    maxAcceptedChars:number = 1300
    writtenChars:number = 0
    emptyText:string='emptyText';
    mentionSuggList:any;
    extendTextAreaHandler($event){
      /*  var textarea = $event.target
        const text:string = textarea.value
        this.hasText = Boolean(text.trim())
        var heightLimit = 100; /* Maximum height: 200px */
        /*textarea.style.height = ""; /* Reset the height*/
       /* textarea.style.height = Math.min(textarea.scrollHeight, heightLimit) + "px";
        this.writtenChars = text.length
        if(this.writtenChars > this.maxAcceptedChars) {
            textarea.value = text.slice(0,this.maxAcceptedChars)
        }*/
    }
    focusCommentTextArea(){
        setTimeout(()=>this.CommentTextArea.nativeElement.focus(), 0);
    }

    @HostListener('document:click', ['$event'])
    clickout(event) {
      if(!event.target.className.includes("suggstions-contact-list")&&!event.target.className.includes("contact")&&!event.target.className.includes("contact-list-cont")) {
        this.showContactSuggstions=false;
      }
    }
    addContact(contact){
      let spanHtml = document.createElement('span');
      spanHtml.innerHTML=contact.name;
      spanHtml.className='selectedContact'; 
      spanHtml.setAttribute("contenteditable", "false");
      spanHtml.setAttribute("userId", contact.userId);
      spanHtml.setAttribute("tenantId", contact.tenantId);
      spanHtml.setAttribute("style", "color:rgb(248 128 17);padding: 6px 4px;border-radius: 2px;background-color: rgba(248 ,128, 17,0.15);cursor: pointer;font-weight:700;");

      let pattern;
      let inputValueWithoutMentions=this.CommentTextArea.nativeElement.innerHTML;
      if(this.CommentTextArea.nativeElement.childNodes.length>1){
        inputValueWithoutMentions='';
        this.CommentTextArea.nativeElement.childNodes.forEach(function(node){
          // Text nodes are nodeType: 3
          if(node.nodeType === 3 && node.nodeValue !== ""){
              inputValueWithoutMentions+=node.nodeValue.trim(); 
          }
        });    
      }
      if(this.CommentTextArea.nativeElement.innerText.length>1){
     pattern =String.fromCharCode(inputValueWithoutMentions.charCodeAt(window.getSelection().anchorOffset- 1));

      }else{
        pattern =String.fromCharCode(inputValueWithoutMentions.charCodeAt(0));

      }
      let sel, range;
      if (window.getSelection) {
        // IE9 and non-IE
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
          range = sel.getRangeAt(0);
          range.deleteContents();

          // Range.createContextualFragment() would be useful here but is
          // non-standard and not supported in all browsers (IE9, for one)
          const el = document.createElement("div");
          el.innerHTML = 'test';
          el.setAttribute('class','maiClass')
          let frag = document.createDocumentFragment(),
            node,
            lastNode;
          while ((node = el.firstChild)) {
            lastNode = frag.appendChild(node);
          }
          range.insertNode(frag);

          // Preserve the selection
          if (lastNode) {
            range = range.cloneRange();
            range.setStartAfter(lastNode);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }


      this.CommentTextArea.nativeElement.innerHTML = this.CommentTextArea.nativeElement.innerHTML.replace(/@/g, spanHtml.outerHTML);
     this.showContactSuggstions=false;

    }
    this.comment.body=this.CommentTextArea.nativeElement.innerHTML;

}

    mentionContact(event){
      this.comment.body=event.target.innerHTML;
        let inputValueWithoutMentions=event.target.innerHTML;
        if(event.target.childNodes.length>1){
            inputValueWithoutMentions='';
         event.target.childNodes.forEach(function(node){
            // Text nodes are nodeType: 3
            if(node.nodeType === 3 && node.nodeValue !== ""){
                inputValueWithoutMentions+=node.nodeValue; 
            }
          });    
        }

        let enterdValue=event.key=='@'?event.key:String.fromCharCode(inputValueWithoutMentions.charCodeAt(window.getSelection().anchorOffset- 1));
        if(enterdValue=='@'){
            // Getting last character using char at
            let lastCharachter = inputValueWithoutMentions.charAt(inputValueWithoutMentions.length - 1);
            this.suggListContLeft=(event.target.offsetLeft*1.5)//+event.target.selectionStart;
            if(this.comment.body.length>4)this.suggListContLeft=this.suggListContLeft+30;
            this.suggListTop=event.target.offsetTop+10;
            let charachterIndex=inputValueWithoutMentions.indexOf(enterdValue);

            let previosCharachter:string;
            if(enterdValue==lastCharachter){
                previosCharachter= inputValueWithoutMentions.charAt(charachterIndex-1);
                if(/\s/g.test(previosCharachter)||previosCharachter==undefined||inputValueWithoutMentions.length==1){
                  this.showContactSuggstions=true;
                }
            }else{

                previosCharachter= inputValueWithoutMentions.charAt(charachterIndex-1);
                if(/\s/g.test(previosCharachter)||previosCharachter==undefined){
                    this.showContactSuggstions=true;
                }
            }
            if(this.showContactSuggstions){
               this._appEntitiesServiceProxy.getContactsToMention(this.relatedEntityId,'')
               .subscribe((res) => {
                    if(res){
                     this.mentionSuggList=res;
                     this.mentionSuggList.forEach((contact)=>{
                      contact.userName=contact.userName.replace(/@/g, "-");
                     })
                   }
               });
            }
        }else{
          
            let lastCharachter = inputValueWithoutMentions.charAt(inputValueWithoutMentions.length - 1);
              if(lastCharachter=='@'||this.showContactSuggstions){
                if(!this.showContactSuggstions)this.showContactSuggstions=true
                 this._appEntitiesServiceProxy.getContactsToMention(this.relatedEntityId,enterdValue)
                 .subscribe((res) => {
                      if(res){
                       this.mentionSuggList=res;
                     }
                 });
              }
              if(this.showContactSuggstions&&event.keyCode!==8){
                this.suggListContLeft=this.suggListContLeft+5;
              }
              if(this.showContactSuggstions&&event.keyCode==8){
                this.suggListContLeft=this.suggListContLeft-5;

              }
        }
      if(this.comment.body.length==0){
        this.showContactSuggstions=false;
      }
    }
    saveComment(){
        this.saving = true
        if(!this.comment.subject)this.comment.subject = `${MesasgeObjectType[MesasgeObjectType.Comment]} on ${this.comment.body.slice(0,10)}...`
        this.mentionedUsers=[];
        let newMentiondUser:MentionedUserInfo= new MentionedUserInfo();
        this.CommentTextArea.nativeElement?.childNodes?.forEach((mentionContact)=>{
         if(mentionContact.localName=='span'){
        newMentiondUser.userId=parseInt(mentionContact.attributes.userid.value);
         newMentiondUser.tenantId=parseInt(mentionContact.attributes.tenantid.value);
         this.mentionedUsers.push(newMentiondUser)
         }

        })
        this.comment.mentionedUsers=this.mentionedUsers;
        this.comment.bodyFormat = this.comment.body
        this.comment.messageCategory="UPDATEMESSAGE" ;
        debugger
        if(!this.comment.relatedEntityId&&this.relatedEntityId)this.comment.relatedEntityId=this.relatedEntityId;
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
    show(comment:any){
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
