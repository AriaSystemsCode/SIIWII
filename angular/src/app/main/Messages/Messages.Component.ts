//Esraa-Task1 [Start]
import {
    Component,
    Injector,
    ViewEncapsulation,
    AfterViewChecked,
    ElementRef,
    ViewChild,
    HostListener,
    OnInit,
} from "@angular/core";

import { appModuleAnimation } from "@shared/animations/routerTransition";
import { AppComponentBase } from "@shared/common/app-component-base";
import { FileDownloadService } from "@shared/download/fileDownload.service";

import { SendMessageModalComponent } from "./SendMessage-Modal.Component";
import {
    SycEntityObjectClassificationsServiceProxy,
    MessageServiceProxy,
    MessagesDto,
    GetMessagesForViewDto,
    TreeNodeOfGetSycEntityObjectClassificationForViewDto,
    AppPostsServiceProxy,
} from "@shared/service-proxies/service-proxies";
import { AppConsts } from "@shared/AppConsts";
import { DomSanitizer } from "@angular/platform-browser";
import { MessageReadService } from "@shared/utils/message-read.service";
import { finalize } from "rxjs/operators";

@Component({
    templateUrl: "./Messages.component.html",
    styleUrls: ["./Messages.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()],
})
export class MessagesComponent extends AppComponentBase implements OnInit {
    scrolltop: number = null;
    @ViewChild("container", { static: true }) container;
    @ViewChild("messageEl") containerdetails: ElementRef;

    @ViewChild("SendMessageModal", { static: true })
    longmsgId: any = false;
    sendMessageModal: SendMessageModalComponent;
    displayDeleteMessage: boolean = false;
    messageTypeIndex: number = 0;
    messageType: string = "";
    lablesList: TreeNodeOfGetSycEntityObjectClassificationForViewDto[] = null;
    filter: string = "";
    messages: MessagesDto[] = [];
    messagesDetails: GetMessagesForViewDto[] = null;
    selectedMessage: number = 0;
    filterText: string = "";
    bodyFilter: string = "";
    subjectFilter: string = "";
    skipCount: number = 0;
    maxResultCount: number = 5;
    totalCount: number = 0;
    messagesDetailSender: string = "";
    noOfItemsToShowInitially: number = 5;
    itemsToLoad: number = 5;
    itemsToShow;
    totalUnread: number;
    isFullListDisplayed: boolean = false;
    messageId: any;
    entityAttachments = [];
    RecipientsName = [];
    highlightFirstMsg: boolean;
    displayMessageDetails: boolean = false;
    primaryCount: number = 0;
    updatesCount: number = 0;
    constructor(
        injector: Injector,
        private _downloadService: FileDownloadService,
        private _MessageServiceProxy: MessageServiceProxy,
        private _sycEntityObjectClassificationsServiceProxy: SycEntityObjectClassificationsServiceProxy,
        private _postService: AppPostsServiceProxy,
        private messageReadService: MessageReadService,
        private sanitized: DomSanitizer
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.messages = [];
        this.highlightFirstMsg = true;
        this.displayMessageDetails = false;
        this.selectMessagetype(1, this.l("Inbox"));
        this._sycEntityObjectClassificationsServiceProxy
            .getAllChildsForLables()
            .subscribe((result) => {
                this.lablesList = result;
            });
        // this.scrollToBottom();
    }
    /*  ngAfterViewChecked() {
        this.scrollToBottom();
    }
    scrollToBottom(): void {
        try {
            this.containerdetails.nativeElement.scrollTop =
                this.containerdetails.nativeElement.scrollHeight;
        } catch (err) {}
    } */

    selectMessagetype(messagetypeIndex: number, messagetype: string): void {
        this.filterText = "";
        this.messageTypeIndex = messagetypeIndex;
        this.messageType = messagetype;
        this.messages = [];
        this.skipCount = 0;
        this.maxResultCount = 5;
        this.noOfItemsToShowInitially = 5;
        this.messagesDetails = null;
        this.selectedMessage = 0;
        this.getMesssage();
    }

    getMesssage(search?: boolean): void {
        this._MessageServiceProxy
            .getAll(
                this.filterText,
                this.bodyFilter,
                this.subjectFilter,
                this.messageTypeIndex,
                0,
                undefined,
                undefined,
                "",
                this.skipCount,
                this.maxResultCount
            )
            .subscribe((result) => {
                if (search == true) {
                    this.messages = [];
                    this.messagesDetails = null;
                    for (var i = 0; i < result.items.length; i++) {
                        const message = result.items[i].messages;
                        this.messages.push(message);
                        this._postService
                            .getProfilePictureAllByID(
                                message.profilePictureId
                            )
                            .subscribe((result) => {
                                if (result && result.profilePicture) {
                                    message.profilePictureUrl =
                                        "data:image/jpeg;base64," +
                                        result.profilePicture;
                                }
                            });
                        /*   if(this.messageTypeIndex==2)
                        {
                            this._MessageServiceProxy
                                .getUsersNamesByID(result.items[i].messages.to.toString())
                                .subscribe((result2) => {
                                    result.items[i].messages.recipientsName=result2.toString()
                                   // this.RecipientsName.push(result2.toString());
                                });
                        }
 */
                    }
                    this.itemsToShow = this.messages;
                } else {
                    for (var i = 0; i < result.items.length; i++) {
                        const message = result.items[i].messages;

                        this.messages.push(message);
                        this._postService
                            .getProfilePictureAllByID(
                                message.profilePictureId
                            )
                            .subscribe((result) => {
                                if (result && result.profilePicture) {
                                    message.profilePictureUrl =
                                        "data:image/jpeg;base64," +
                                        result.profilePicture;
                                }
                            });
                        /*  if(this.messageTypeIndex==2)
                        {
                            this._MessageServiceProxy
                                .getUsersNamesByID(result.items[i].messages.to.toString())
                                .subscribe((result2) => {
                                    result.items[i].messages.recipientsName=result2.toString()
                                    // this.RecipientsName.push(result2.toString());
                                });
                        } */
                    }


                    this.totalCount = result.totalCount;
                    this.totalUnread = result.totalUnread;
                    //I37-get primary & Updates Count
                    this.primaryCount = 0;
                    this.updatesCount = 0;

                    this.itemsToShow = this.messages.slice(
                        0,
                        this.noOfItemsToShowInitially
                    );
                    this.isFullListDisplayed = false;
                }

                if ((window.innerWidth > 767) && (this.messages.length > 0))
                    this.selectMessage(this.messages[0]);
            });
    }
    showSideBar: boolean = false;
    showHideSideBarTitle: string = !this.showSideBar ? "Show details" : "Hide details";
    onShowSideBar(showSideBar:boolean) {
        this.showSideBar = showSideBar;
        this.showHideSideBarTitle = !this.showSideBar ? "Show details" : "Hide details";
    }

    getPrimaryMessage() {
        //I37-get primary 
        this.getMesssage();
    }

    getUpdatesMessage() {
        //I37-get Updates 
        this.getMesssage();
    }

    onScroll(): void {
        if (this.noOfItemsToShowInitially < this.totalCount) {
            this.maxResultCount = this.itemsToLoad;
            this.skipCount = this.noOfItemsToShowInitially;
            this.noOfItemsToShowInitially += this.itemsToLoad;
            this.getMesssage();
            this.itemsToShow = this.messages;
        } else {
            this.isFullListDisplayed = true;
        }
    }

    clickEventLongMsg(event) {
        this.longmsgId = event;
    }

    selectMessage(message: MessagesDto): void {
        this.showMainSpinner();
        this.highlightFirstMsg = false;
        this.selectedMessage = message.id;

        this._MessageServiceProxy
            .getMessagesForView(message.id)
            .pipe(finalize(() => { this.displayMessageDetails = true; this.hideMainSpinner(); }))
            .subscribe((result) => {
                this.messagesDetails = result;
                for (var i = 0; i < result.length; i++) {

                    const message = result[i].messages
                    this._postService
                        .getProfilePictureAllByID(
                            message.profilePictureId
                        )
                        .subscribe((result) => {
                            if (result && result.profilePicture) {

                                message.profilePictureUrl =
                                    "data:image/jpeg;base64," +
                                    result.profilePicture;
                            }
                        });
                }
                this.entityAttachments =
                    this.messagesDetails[0].messages.entityAttachments;
                if (message.entityObjectStatusCode == "UNREAD") {
                    this._MessageServiceProxy.read(message.id).subscribe(() => {
                        this.totalUnread = this.totalUnread - 1;
                        this.readMessage(true);
                    });
                    //xxx
                    message.entityObjectStatusCode = "READ";
                    //xxx
                }
            });
    }

    messageDetailsGoback() {
        this.displayMessageDetails = false;
    }

    readMessage(target) {

        this.messageReadService.userClicked(target);
    }

    getImage(img) {
        let attach = AppConsts.attachmentBaseUrl;
        return `${attach}/${img}`;
    }

    onEmitButtonSaveYes(event) {
        if (event.value == "yes" && event.type == "deleteMessage") {
            //xxxx
            if (this.messageTypeIndex == 5)
                this.HardDeleteMessage(this.messageId);
            //xxx
            else this.deleteMessage(this.messageId);

            this.displayDeleteMessage = false;
        } else {
            this.displayDeleteMessage = false;
        }
    }

    onClickDeleteMsg(message: MessagesDto): void {
        this.displayDeleteMessage = true;
        this.messageId = message.id;
    }

    deleteMessage(id) {
        this._MessageServiceProxy.delete(id).subscribe((result) => {
            this.notify.info(this.l("MessageAddedToTrash"));
            this.selectMessagetype(this.messageTypeIndex, this.messageType);
        });
        // this._MessageServiceProxy
        //     .delete(id)
        //     .subscribe((result) => {
        //         //this.Messages = [];
        //         //this.MessagesDetails=null;
        //         this.notify.info(this.l('MessageAddedToTrash'));
        //         //this.GetMesssage();
        //         this.Select(this.MessageTypeIndex, this.MessageType);
        //     });
    }
    //xxxx
    HardDeleteMessage(id) {
        this._MessageServiceProxy.hardDelete(id).subscribe((result) => {
            this.notify.info(this.l("MessageDeleted"));
            this.selectMessagetype(this.messageTypeIndex, this.messageType);
        });
    }
    //xxxx
    downloadFile(url, name) {
        let attach = AppConsts.attachmentBaseUrl;
        let fullURL = `${attach}/${url}`;
        this._downloadService.download(fullURL, name);
    }

    favoriteMessage(message) {
        this._MessageServiceProxy.favorite(message.id).subscribe((result) => {
            //xxx
            // if (this.messageTypeIndex == 3)
            if (message.isFavorite) {
                //xxx
                message.isFavorite = false;
                this.notify.info(this.l("MessageUnfavorite"));
                //xxx
                if (this.messageTypeIndex == 3)
                    this.selectMessagetype(
                        this.messageTypeIndex,
                        this.messageType
                    );
                //xxx
            } else {
                message.isFavorite = true;
                this.notify.info(this.l("MessageAddedToFavorite"));
            }
        });
    }

    archiveMessage(message) {
        this._MessageServiceProxy.archive(message.id).subscribe((result) => {
            if (this.messageTypeIndex == 4) {
                this.notify.info(this.l("MessageUnarchive"));
            } else {
                this.notify.info(this.l("MessageAddedToArchived"));
            }
            //this.GetMesssage();
            //xx
            this.selectMessagetype(this.messageTypeIndex, this.messageType);
            //xx
        });
    }

    isActive(message: MessagesDto, index: number): boolean {
        if (this.highlightFirstMsg && index == 0) return true;
        else return this.selectedMessage === message.id;
    }
}
