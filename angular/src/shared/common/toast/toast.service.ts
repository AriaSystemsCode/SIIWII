import { Injectable } from '@angular/core';
import { Message, MessageService } from 'primeng/api';
import { ToasterTypes } from './ToasterTypes';

@Injectable()
export class ToastService {
  defaultMessageOptions : any
  constructor(
    private messageService: MessageService,
  ) { 
    this.initDefaultOptions();
  }
 
  private open(options : Message) {
    let toast :Message = {...this.defaultMessageOptions,...options} 
    if(!toast.detail || !toast.severity) return
    this.messageService.add(toast);
  }

  success(message: string,options?:Message) {
    let toast : Message = {
      detail:message,
      severity : ToasterTypes.success,
      ...options
    }
    this.open(toast)
  }

  error(message: string,options?:Message) {
    let toast : Message = {
      detail:message,
      severity : ToasterTypes.error,
      ...options
    }
    this.open(toast)
  }

  info(message: string,options?:Message) {
    let toast : Message = {
      detail:message,
      severity : ToasterTypes.info,
      ...options
    }
    this.open(toast)
  }

  warn(message: string,options?:Message) {
    let toast : Message = {
      detail:message,
      severity : ToasterTypes.warn,
      ...options
    }
    this.open(toast)
  }

  initDefaultOptions (){
    this.defaultMessageOptions = {
      life:2000,
      closable : true,
    }
  }
}

