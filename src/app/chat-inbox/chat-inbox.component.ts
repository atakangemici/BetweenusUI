import { Component, OnInit } from '@angular/core';
import { io } from 'socket.io-client';

const SOCKET_ENDPOINT = 'localhost:3000';


@Component({
  selector: 'app-chat-inbox',
  templateUrl: './chat-inbox.component.html',
  styleUrls: ['./chat-inbox.component.css']
})
export class ChatInboxComponent implements OnInit {
  socket;
  message: string;
  new_message: string;
  user_send: string;
  messageArray = Array<object>();

  constructor() {

    let arr = [];

  }

  ngOnInit() {
    this.setupSocketConnection();
  }

  SendMessage() {
    this.socket.emit('message', this.message);
    this.new_message = this.message;

    let messageObj = {};
    messageObj["message"] = this.message;
    messageObj["user"] = "me"

    this.messageArray.push(messageObj);

    this.message = '';

    this.user_send = "me";
  }

  setupSocketConnection() {
    this.socket = io(SOCKET_ENDPOINT);
    this.socket.on('message-broadcast', (data: string) => {
      if (data) {

        let messageObj = {};
        messageObj["message"] = data;
        messageObj["user"] = "you"

        this.messageArray.push(messageObj);
        this.new_message = data;
      }
    });
  }

}
