import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MessagesComponent} from '../Messages/Messages.Component'

const routes: Routes = [
  {
    path: '',
    component: MessagesComponent,
    children: [
      { path: '', component: MessagesComponent },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessagesRoutingModule { }
