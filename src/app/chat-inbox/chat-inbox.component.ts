import { Component, OnInit } from '@angular/core';
import { io } from 'socket.io-client';

// const SOCKET_ENDPOINT = 'https://aramizda-app-backend.herokuapp.com';
const SOCKET_ENDPOINT = 'http://localhost:3000';

@Component({
  selector: 'app-chat-inbox',
  templateUrl: './chat-inbox.component.html',
  styleUrls: ['./chat-inbox.component.css']
})
export class ChatInboxComponent implements OnInit {
  socket;
  send_message: string;
  new_message: string;
  user_send: string;
  messageArray = Array<object>();
  userArray = Array<object>();
  messagePassword: string;
  userName: string;
  randomPass : string;

  constructor() {}

  ngOnInit() {
    this.SetupSocketConnection();
  }

  JoinChat(userName){
    this.userArray.push(userName);
    let data = {};      
    data["password"] =this.messagePassword;
    data["users"] =this.userName;

    this.socket.emit('message', data);
  }

  GeneratePassword(){
    this.randomPass = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  SendMessage() {
    if (this.send_message) {
      this.new_message = this.send_message;
      let dateTime = new Date()
      let minuteAndHour = dateTime.getHours() + ':' + dateTime.getMinutes()

      let data = {};      
      data["password"] =this.messagePassword;
      data["users"] =this.userName;
      data["time"] =minuteAndHour;
      data["message"] =this.send_message;

      this.socket.emit('message', data);

      let messageObj = {};
      messageObj["message"] = this.send_message;
      messageObj["minuteAndHour"] = minuteAndHour;
      messageObj["user"] = "me";

      this.messageArray.push(messageObj);
      this.send_message = '';
    }
  }

  SetupSocketConnection() {
    this.socket = io(SOCKET_ENDPOINT);
    this.socket.on('message-broadcast', (data: object) => {

        console.log(data);
        if (data["password"] == this.messagePassword) {

          if(data["message"] !=null){
            let messageObj = {};
            messageObj["message"] = data["message"];
            messageObj["minuteAndHour"] = data["time"];
            messageObj["user"] = "you";
            messageObj["fromUser"] = data["users"];
            this.messageArray.push(messageObj);
          }
         
          this.userArray.push(data["users"]);
        }
    });
  }
}
