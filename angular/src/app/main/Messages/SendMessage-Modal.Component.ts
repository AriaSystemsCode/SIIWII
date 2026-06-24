import {
    Component,
    Injector,
    ViewChild,
    Input,
    Output,
    EventEmitter,
    OnInit,
    SimpleChanges,
    ChangeDetectorRef,
} from "@angular/core";
import {
    AppEntitiesServiceProxy,
    AppEntityAttachmentDto,
    MesasgeObjectType,
} from "@shared/service-proxies/service-proxies";

import { appModuleAnimation } from "@shared/animations/routerTransition";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    MessageServiceProxy,
    CreateMessageInput,
    NameValueOfString,
} from "@shared/service-proxies/service-proxies";
import { FileUploader} from "ng2-file-upload";
import {  isEmpty } from "lodash";
import { ModalDirective } from "ngx-bootstrap/modal";
import { finalize } from "rxjs/operators";
import { DemoUiEditorComponent } from "@app/admin/demo-ui-components/demo-ui-editor.component";
import * as moment from "moment";
import { FileUploaderCustom } from "@shared/components/import-steps/models/FileUploaderCustom.model";

@Component({
    selector: "SendMessageModal",
    templateUrl: "./SendMessage-Modal.Component.html",
    styleUrls: ["./SendMessage-Modal.Component.scss"],
    animations: [appModuleAnimation()],
})
export class SendMessageModalComponent
    extends AppComponentBase
    implements OnInit
{
    @ViewChild("SendMessageModal", { static: false })SendMessageModal: ModalDirective;
    @ViewChild("demoUiEditor", { static: true })demoUiEditor: DemoUiEditorComponent;
    public uploader: FileUploader;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    @Output() refresh: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Input() modalView:boolean;
    @Input() parentId:any;
    @Input() entityId:any;
    @Input() toName:string = '';
    active: boolean;
    displayCC: boolean = false;
    displayBCC: boolean = false;
    subject: string = "";
    messages: CreateMessageInput = new CreateMessageInput();
    saving: boolean = false;
    htmlEditorInput: string = "";
    filteredUsers: NameValueOfString[];
    toUsers: NameValueOfString[] = new Array<NameValueOfString>();
    ccUsers: NameValueOfString[] = new Array<NameValueOfString>();
    bccUsers: NameValueOfString[] = new Array<NameValueOfString>();
    attachments = [];
    data = [];
    replyMessageId: number = 0;
    threadId: number = 0;
    attachmentsUploader: FileUploaderCustom;

    
  currentLang:string
  isArabic:boolean

@Input() toUser: NameValueOfString;
    constructor(
        injector: Injector,
        private _MessageServiceProxy: MessageServiceProxy,
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy,
    private cdr: ChangeDetectorRef,
    ) {
        super(injector);
    }

    ngOnInit(): void {
       this.currentLang = abp.utils.getCookieValue('Abp.Localization.CultureName')
        this.currentLang == 'ar' || this.currentLang == 'ar-EG'  ? this.isArabic = true : this.isArabic = false
     
        this.filterUsersFilterByEntity('')
    }
    ngOnChanges(changes: SimpleChanges): void {
       if (changes['toUser']?.currentValue) {
    this.setToUser(changes['toUser'].currentValue);
  }
    }
  
    mesasgeObjectType: MesasgeObjectType = MesasgeObjectType.Message
    show(id?: number, threadId?: number, forward?: boolean,mesasgeObjectType?: MesasgeObjectType) {
        this.showMainSpinner();
        if(mesasgeObjectType) this.mesasgeObjectType = mesasgeObjectType
        this.htmlEditorInput = "";
        this.active = true;
        this.filteredUsers = [];
        this.displayBCC = false;
        this.displayCC = false;
        this.toUsers = new Array<NameValueOfString>();
        this.ccUsers = new Array<NameValueOfString>();
        this.bccUsers = new Array<NameValueOfString>();
        this.subject = "";
        this.attachments = [];
        this.replyMessageId;
        //Reply Case
        if (id && !forward) {
            this.htmlEditorInput = "<br><br>";
            this.replyMessageId = id;
            this.threadId = threadId;
            this._MessageServiceProxy
                .getMessagesForView(id)
                .subscribe((result) => {
                    if (!result[0].messages.subject.toString().includes("Re:"))
                        this.subject = "Re: " + result[0].messages.subject;
                    else this.subject = result[0].messages.subject;
                    for (let i = 0; i < result.length; i++) {
                        this.htmlEditorInput +=
                            "--------- Reply ---------" + "<br>";
                        this.htmlEditorInput +=
                            "From: " +
                            result[i].messages.senderName +
                            "<br>" +
                            "Date: " +
                            moment(result[i].messages.sendDate).format(
                                "ddd, MMM D, YYYY  HH:mm A"
                            ) +
                            "<br>" +
                            "Subject: " +
                            result[i].messages.subject +
                            "<br>" +
                            "To: " +
                            result[i].messages.toName +
                            "<br>";
                        if (!isEmpty(result[i].messages.cc)) {
                            this._MessageServiceProxy
                                .getUsersNamesByID(result[i].messages.cc)
                                .subscribe((result2) => {
                                    this.htmlEditorInput =
                                        this.htmlEditorInput +
                                        "Cc: " +
                                        result2 +
                                        "<br>";
                                });
                        }
                        this.htmlEditorInput =
                            this.htmlEditorInput +
                            "<br>" +
                            result[i].messages.bodyFormat.toString() +
                            "<br>" +
                            "<br>";
                    }

                    if (!isEmpty(result[0].messages.to)) {
                        this._MessageServiceProxy
                            .getMessageRecieversName(
                                this.replaceUserId(
                                    result[0].messages.to,
                                    this.appSession.userId.toString(),
                                    result[0].messages.senderId.toString()
                                )
                            )
                            .subscribe((result1) => {
                                this.toUsers = result1;
                            });
                    }

                    if (!isEmpty(result[0].messages.cc)) {
                        this.displayCC = true;
                        let CC = this.removeUserId(
                            result[0].messages.cc,
                            this.appSession.userId.toString()
                        );
                        if (!isEmpty(CC)) {
                            this._MessageServiceProxy
                                .getMessageRecieversName(CC)
                                .subscribe((result1) => {
                                    this.ccUsers = result1;
                                });
                        }
                    }

                    if (!isEmpty(result[0].messages.bcc)) {
                        this.displayBCC = true;
                        let BCC = this.removeUserId(
                            result[0].messages.bcc,
                            this.appSession.userId.toString()
                        );
                        if (!isEmpty(BCC)) {
                            this._MessageServiceProxy
                                .getMessageRecieversName(BCC)
                                .subscribe((result1) => {
                                    this.bccUsers = result1;
                                });
                        }
                    }
                });
        }

        //Forward Case
        else if (id && forward) {
            this.replyMessageId = id;
            this.htmlEditorInput = "<br><br>";
            let forwardMessages = id;
            this.threadId = threadId;
            this._MessageServiceProxy
                .getMessagesForView(id)
                .subscribe((result) => {
                    //xxx
                    if (!result[0].messages.subject.toString().includes("Fwd:"))
                        //xxx
                        this.subject = "Fwd: " + result[0].messages.subject;
                    else this.subject = result[0].messages.subject;
                    for (let i = 0; i < result.length; i++) {
                        this.htmlEditorInput +=
                            "--------- Forwarded message ---------" + "<br>";
                        this.htmlEditorInput +=
                            "From: " +
                            result[i].messages.senderName +
                            "<br>" +
                            "Date: " +
                            moment(result[i].messages.sendDate).format(
                                "ddd, MMM D, YYYY  HH:mm A"
                            ) +
                            // result[i].messages.sendDate.toDate().toDateString()+" at " + result[i].messages.sendDate.toDate().toLocaleTimeString()+
                            "<br>" +
                            "Subject: " +
                            result[i].messages.subject +
                            "<br>" +
                            "To: " +
                            result[i].messages.toName +
                            "<br>";
                    
                        this.htmlEditorInput =
                            this.htmlEditorInput +
                            "<br>" +
                            result[i].messages.bodyFormat.toString() +
                            "<br>" +
                            "<br>";
                    }
                });
        }
        // disable close on background click
        this.SendMessageModal.config = {
            backdrop: true,
            ignoreBackdropClick: true,
        };
        this.SendMessageModal.show();
        this.hideMainSpinner();
    }

    replaceUserId(expression: string, oldId: string, newId: string) {
        expression = "," + expression;
        expression = expression + ",";
        oldId = "," + oldId;
        oldId = oldId + ",";
        newId = "," + newId;
        newId = newId + ",";
        //xx
        // expression = expression.replace(oldId, newId);
        if (expression.toString().includes(oldId) || oldId==newId )
            expression = expression.replace(oldId, newId);
        else expression = expression + newId.substring(1);
        //xx

        expression = expression.substring(1);
        expression = expression.slice(0, -1);
        return expression;
    }

    removeUserId(expression: string, userId: string) {
        let newExpression: string = ",";
        expression.split(",").forEach((element) => {
            if (!(userId == element)) {
                newExpression = newExpression + element + ",";
            }
        });
        newExpression = newExpression.substring(1);
        // newExpression=newExpression.substring(newExpression.length-1)
        newExpression = newExpression.slice(0, -1);
        return newExpression;
    }
 
    close(): void {
        this.SendMessageModal.hide();
        this.active = false;
        this.displayBCC = false;
        this.displayCC = false;
        this.attachments = [];
    }

    showCC(): void {
        this.displayCC = true;
    }
    showBCC(): void {
        this.displayBCC = true;
    }

    // handleInputChangeAttachment(e) {
    //     if (e.target.files.length === 0) return;
    //     for (let i = 0; i < e.target.files.length; i++) {
    //     var file = e.dataTransfer ? e.dataTransfer.files[i] : e.target.files[i];
    //     this.attachments.push(e.target.files[i]);  
    // }
    handleInputChangeAttachment(event: any): void {
    const files: FileList = event?.target?.files;

    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
        this.attachments.push(file);
    });

    event.target.value = '';

}


    onUploadAttachmets(){
            var uploadUrl = "/Attachment/UploadFiles";
            this.attachmentsUploader = this.createCustomUploader(uploadUrl);
    
            this.attachmentsUploader.addToQueue(this.attachments);
            this.attachmentsUploader.onBuildItemForm = (
                fileItem: any,
                form: any
            ) => {
             
                for (let i = 0; i < this.attachments.length; i++) {
                    var guid = this.guid();
                    let att: AppEntityAttachmentDto = new AppEntityAttachmentDto();
                    att.fileName = this.attachments[i].name;
                    att.attachmentCategoryId = 4;
                    att.guid = guid;
                    if (
                        this.messages.entityAttachments == null ||
                        this.messages.entityAttachments == undefined
                    ) {
                        this.messages.entityAttachments = [];
                    }
                    this.messages.entityAttachments.push(att);

                    if (this.attachments.length > 1) form.append("guid" + i, guid);
                    else form.append("guid", guid);
                }
            };
    
            this.attachmentsUploader.onErrorItem = (item, response, status) => {
                this.notify.error(this.l("UploadFailed"));
            };

            this.attachmentsUploader.uploadAllFiles();
    }
  
    sendMessage(): void {
        this.showMainSpinner();
        if(this.attachments?.length>0)
          this.onUploadAttachmets();
        let ToList = "";
        let CCList = "";
        let BCCList = "";

        for (var i = 0; i < this.toUsers.length; i++) {
            if (i != this.toUsers.length - 1)
                ToList += this.toUsers[i].value + ",";
            else ToList += this.toUsers[i].value;
        }

        for (var i = 0; i < this.ccUsers.length; i++) {
            if (i != this.ccUsers.length - 1)
                CCList += this.ccUsers[i].value + ",";
            else CCList += this.ccUsers[i].value;
        }

        for (var i = 0; i < this.bccUsers.length; i++) {
            if (i != this.bccUsers.length - 1)
                BCCList += this.bccUsers[i].value + ",";
            else BCCList += this.bccUsers[i].value;
        }

        this.messages.to = ToList;
        this.messages.cc = CCList;
        this.messages.bcc = BCCList;
        this.messages.subject = this.subject;
        this.messages.bodyFormat = this.htmlEditorInput;
        this.messages.parentId = this.replyMessageId;
        this.messages.threadId = !this.modalView?this.entityId:this.threadId;
        this.messages.relatedEntityId =!this.modalView?this.entityId: undefined;
        this.messages.mesasgeObjectType = MesasgeObjectType.Message
        this.saving = true;
        this._MessageServiceProxy
            .createMessage(this.messages)
            .pipe(finalize(() => {this.saving = false ; this.hideMainSpinner();this.refresh.emit(true)}))
            .subscribe(() => {
                this.notify.info(this.l("SendSuccessfully"));
                if(this.SendMessageModal)this.SendMessageModal.hide();
                this.active = false;
                this.displayBCC = false;
                this.displayCC = false;
                this.messages.entityAttachments = [];
                this.modalSave.emit(this.messages);
                this.subject="";
                this.htmlEditorInput='';
                this.toUsers=[];
                this.ccUsers=[];
                this.bccUsers=[];
                this.messages=new CreateMessageInput();
                this.attachments=[];
            });
    }

    // get Users
    filterUsers(event): void {
        this._MessageServiceProxy
            .getAllUsers(event.query)
            .subscribe((Users) => {
                this.filteredUsers = [];
                for (var i = 0; i < Users.length; i++) {
                    //xxx
                    if (
                        Users[i].users.value.toString() !=
                        this.appSession.userId.toString()
                    ) {
                        //xxx
                        //I2-9 -  receipt name, last name @ tenant name
                        Users[i].users.name +=
                            "." +
                            Users[i].surname +
                            " @ " +
                            Users[i].tenantName;
                        //  Users[i].users.name += "@" + Users[i].tenantName;
                        this.filteredUsers.push(Users[i].users);
                    }
                }
                console.log(this.filteredUsers,'this.filteredUsers')
            });
    }
    
               // get Users related to entity
            //    filterUsersFilterByEntity(event): void {
            //     this._appEntitiesServiceProxy
            //         .getContactsToMention(this.entityId, event.query)
            //         .subscribe((users) => {
            //             this.filteredUsers = [];
            //             for (let i = 0; i < users.length; i++) {
            //                 if (users[i]?.users?.value.toString() !== this.appSession.userId.toString()) {
            //                     users[i].users = {
            //                         name: users[i].name + '@' + users[i].tenantName,
            //                         value: users[i].userId.toString()
            //                     };
            //                     this.filteredUsers.push(users[i].users);
            //                 }
            //             }
            
            //             // Normalize names in toNameArray to match filteredUsers
            //             const toNameArray: string[] = this.toName
            //                 .split(',')
            //                 .map((name) => name.trim().replace(/\./g, ' ')); // Replace dots with spaces
            
            //             // // Set default selected users
            //             if(this.parentId){
            //                 this.toUsers = this.filteredUsers.filter((user) =>
            //                     toNameArray.some((name) => user.name.startsWith(name)) // Match name before '@'

            //                 );


            //                 this._MessageServiceProxy
            //                 .getMessagesForView(this.parentId)
            //                 .subscribe((result) => {
                           
            //                     this.subject = result[0].messages.subject;
            //                 });
            //             }
                   
         
            //         });
            // }


filterUsersFilterByEntity(event: any): void {
  const query = typeof event === 'string' ? event : (event?.query || '');

  this._appEntitiesServiceProxy
    .getContactsToMention(this.entityId, query)
    .subscribe((users) => {
      this.filteredUsers = [];

      for (let i = 0; i < users.length; i++) {
        if (users[i]?.userId?.toString() !== this.appSession.userId.toString()) {
          const user = new NameValueOfString();
          user.name = users[i].name + '@' + users[i].tenantName;
          user.value = users[i].userId.toString();

          this.filteredUsers.push(user);
        }
      }

      if (this.parentId && this.toUser?.value) {
        const selectedSender = this.filteredUsers.find(
          x => x.value === this.toUser.value.toString()
        );

        this.toUsers = selectedSender
          ? [selectedSender]
          : [this.toUser];
      }

      if (this.parentId) {
        this._MessageServiceProxy
          .getMessagesForView(this.parentId)
          .subscribe((result) => {
            this.subject = result?.[0]?.messages?.subject || '';
          });
      }

      this.cdr.detectChanges();
    });
}
    setToUser(user: any): void {
  if (!user?.name || !user?.value) return;

  const selectedUser = new NameValueOfString();
  selectedUser.name = user.name;
  selectedUser.value = user.value.toString();

  this.toUsers = [selectedUser];

  const exists = this.filteredUsers?.some(
    x => x.value === selectedUser.value
  );

  if (!exists) {
    this.filteredUsers = [
      selectedUser,
      ...(this.filteredUsers || [])
    ];
  }

  this.cdr.detectChanges();
}
}
