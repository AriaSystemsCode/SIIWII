import {
    Component,
    Injector,
    ViewChild,
    AfterViewInit,
    Input,
    Output,
    EventEmitter,
    OnInit,
    ElementRef,
} from "@angular/core";
import {
    CreateOrEditAccountInfoDto,
    AccountInfoAppEntityLookupTableDto,
    AppEntitiesServiceProxy,
    LookupLabelDto,
    AppEntityClassificationDto,
    AppEntityCategoryDto,
    SycAttachmentCategoriesServiceProxy,
    SycAttachmentCategorySycAttachmentCategoryLookupTableDto,
    GetSycAttachmentCategoryForViewDto,
    AppEntityAttachmentDto,
    BranchDto,
    TreeNodeOfBranchForViewDto,
    AppContactAddressDto,
    MesasgeObjectType,
} from "@shared/service-proxies/service-proxies";

import { appModuleAnimation } from "@shared/animations/routerTransition";
import { AppComponentBase } from "@shared/common/app-component-base";
import {
    SycEntityObjectClassificationsServiceProxy,
    MessageServiceProxy,
    MessagesDto,
    GetMessagesForViewDto,
    CreateMessageInput,
    NameValueOfString,
    GetUsersForMessageDto,
} from "@shared/service-proxies/service-proxies";
import { FileUploader, FileUploaderOptions, FileItem } from "ng2-file-upload";
import { IAjaxResponse, TokenService } from "abp-ng2-module";

import { Table } from "primeng/table";
import { Paginator } from "primeng/paginator";
import { LazyLoadEvent } from "primeng/api";
import { forEach, isNull, isEmpty } from "lodash";
import { timeStamp } from "console";
import { ModalDirective } from "ngx-bootstrap/modal";
import { SelectItem } from "primeng/api";
import { finalize } from "rxjs/operators";
import { DemoUiEditorComponent } from "@app/admin/demo-ui-components/demo-ui-editor.component";
import { empty } from "rxjs";
import { AppConsts } from "@shared/AppConsts";
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
    @ViewChild("SendMessageModal", { static: false })
    SendMessageModal: ModalDirective;
    @ViewChild("demoUiEditor", { static: true })
    demoUiEditor: DemoUiEditorComponent;
    public uploader: FileUploader;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    @Input() modalView:boolean;
    @Input() parentId:any;
    @Input() entityId:any;
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

    constructor(
        injector: Injector,
        private _tokenService: TokenService,
        private _MessageServiceProxy: MessageServiceProxy,
        private _appEntitiesServiceProxy: AppEntitiesServiceProxy

    ) {
        super(injector);
    }

    ngOnInit(): void {
      //  this.initUploaders();
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
                            "--------- Replay message ---------" + "<br>";
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
                            /*  moment(
                                result[i].messages.sendDate,
                                "YYYY-MM-DD HH:mm"
                            ).toString() + */
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
                        if (!isEmpty(result[i].messages.cc)) {
                            // this._MessageServiceProxy
                            //     .getUsersNamesByID(result[i].messages.cc)
                            //     .subscribe((result2) => {
                            //         this.htmlEditorInput =
                            //             this.htmlEditorInput +
                            //             "Cc: " +
                            //             result2 +
                            //             "<br>";
                            //     });
                        }
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
    // addUserId(expression:string, userId:string){
    //     expression= ',' + expression;
    //     expression= expression + ',';

    //     userId= ',' + userId;
    //     userId= userId + ',';

    //     expression.replace(oldId,newId)

    //     return expression;
    // }

   /*  initUploaders(): void {
        this.uploader = this.createUploader(
            "/Attachment/UploadFiles",
            (result) => {
                // this.appSession.tenant.logoFileType = result.fileType;
                // this.appSession.tenant.logoId = result.id;
            }
        );
    } */
  /*   createUploader(url: string, success?: (result: any) => void): FileUploader {
        const uploader = new FileUploader({
            url: AppConsts.remoteServiceBaseUrl + url,
        });

        uploader.onAfterAddingFile = (file) => {
            file.withCredentials = false;
        };

        uploader.onSuccessItem = (item, response, status) => {
            const ajaxResponse = <IAjaxResponse>JSON.parse(response);
            if (ajaxResponse.success) {
                this.notify.info(this.l("UploadSuccessfully"));
                if (success) {
                    success(ajaxResponse.result);
                }
            } else {
                this.message.error(ajaxResponse.error.message);
            }
        };

        const uploaderOptions: Partial<FileUploaderOptions> = {};
        uploaderOptions.authToken = "Bearer " + this._tokenService.getToken();
        uploaderOptions.removeAfterUpload = true;
        uploader.setOptions(uploaderOptions as FileUploaderOptions);
        return uploader;
    } */

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
    // guid(): string {
    //     function s4() {
    //         return Math.floor((1 + Math.random()) * 0x10000)
    //             .toString(16)
    //             .substring(1);
    //     }
    //     return (
    //         s4() +
    //         s4() +
    //         "-" +
    //         s4() +
    //         "-" +
    //         s4() +
    //         "-" +
    //         s4() +
    //         "-" +
    //         s4() +
    //         s4() +
    //         s4()
    //     );
    // }
    // handleInputChangeAttachment(e) {
    //     if (e.target.files.length === 0) return;
    //     var file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    //     this.attachments.push(e.target.files[0]);
    //     this.uploader.addToQueue(e.target.files);

    //     let guid = this.guid();
    //     this.uploader.onBuildItemForm = (fileItem: any, form: any) => {
    //         form.append("guid", guid);
    //     };

    //     this.uploader.uploadAll();

    //     var pattern = /image-*/;
    //     var reader = new FileReader();
    //     // if (!file.type.match(pattern)) {
    //     //   alert('invalid format');
    //     //   return;
    //     // }
    //     reader.onload = this._handleReaderLoadedAttachment.bind(this);
    //     reader.readAsDataURL(file);
    //     let att: AppEntityAttachmentDto = new AppEntityAttachmentDto();
    //     att.fileName = e.target.files[0].name;
    //     att.attachmentCategoryId = 4;
    //     att.guid = guid;
    //     if (
    //         this.messages.entityAttachments == null ||
    //         this.messages.entityAttachments == undefined
    //     ) {
    //         this.messages.entityAttachments = [];
    //     }
    //     this.messages.entityAttachments.push(att);
    // }
    handleInputChangeAttachment(e) {
        if (e.target.files.length === 0) return;
        for (let i = 0; i < e.target.files.length; i++) {
        var file = e.dataTransfer ? e.dataTransfer.files[i] : e.target.files[i];
        this.attachments.push(e.target.files[i]);  
    }
}



    _handleReaderLoadedAttachment(e) {
        let reader = e.target;
        // this.imageFeaturedImageSrc = reader.result;
        // this.featuredImageControl.setValue(this.imageFeaturedImageSrc)
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
        //this.Messages.entityAttachments=[];
        // this.Messages.entityAttachments=this.attachments
        this.saving = true;

        this._MessageServiceProxy
            .createMessage(this.messages)
            .pipe(finalize(() => {this.saving = false ; this.hideMainSpinner();}))
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
            });
    }
        // get Users related to entity
        filterUsersFilterByEntity(event): void {
            this._appEntitiesServiceProxy.
            getContactsToMention(this.entityId,event.query)
                .subscribe((Users) => {
                    this.filteredUsers = [];
                    for (var i = 0; i < Users.length; i++) {
                        //xxx
                        if (
                            Users[i]?.users?.value.toString() !=
                            this.appSession.userId.toString()
                        ) {
                            //xxx
                            //I2-9 -  receipt name, last name @ tenant name
                            Users[i].users={name:Users[i].userName,value:Users[i].userId.toString()}

                            //  Users[i].users.name += "@" + Users[i].tenantName;
                            this.filteredUsers.push(Users[i].users);
                        }
                    }
                });
        }
}
