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
  userArray = Array<string>();
  messagePassword: string;
  hashPassword: string;
  userName: string;
  userNameView: string;
  randomPass: string;
  userNameCheck: boolean;

  constructor() { }

  ngOnInit() {
    this.SetupSocketConnection();
  }

  EncryptText(plaintext, shiftAmount) {
    var ciphertext = "";
    for (var i = 0; i < plaintext.length; i++) {
      var plainCharacter = plaintext.charCodeAt(i);
      if (plainCharacter >= 97 && plainCharacter <= 122) {
        ciphertext += String.fromCharCode((plainCharacter - 97 + shiftAmount) % 26 + 97);
      } else if (plainCharacter >= 65 && plainCharacter <= 90) {
        ciphertext += String.fromCharCode((plainCharacter - 65 + shiftAmount) % 26 + 65);
      } else {
        ciphertext += String.fromCharCode(plainCharacter);
      }
    }
    return ciphertext;
  }

  DecryptText(ciphertext, shiftAmount) {
    var plaintext = "";
    for (var i = 0; i < ciphertext.length; i++) {
      var cipherCharacter = ciphertext.charCodeAt(i);
      if (cipherCharacter >= 97 && cipherCharacter <= 122) {
        plaintext += String.fromCharCode((cipherCharacter - 97 - shiftAmount + 26) % 26 + 97);
      } else if (cipherCharacter >= 65 && cipherCharacter <= 90) {
        plaintext += String.fromCharCode((cipherCharacter - 65 - shiftAmount + 26) % 26 + 65);
      } else {
        plaintext += String.fromCharCode(cipherCharacter);
      }
    }
    return plaintext;
  }


  JoinChat(userName) {

    this.userArray.forEach(name => {
      if (name == userName)
        this.userNameCheck = true;
    });

    if (!this.userNameCheck)
      this.userArray.push(userName);

    this.hashPassword = [...this.messagePassword].reverse().join("");
    this.userNameView = this.userName;

    let data = {};
    data["password"] = this.hashPassword;
    data["users"] = this.EncryptText(this.userName, 18);

    this.socket.emit('message', data);
  }

  GeneratePassword() {
    this.randomPass = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  SendMessage() {
    if (this.send_message) {
      this.new_message = this.send_message;
      let dateTime = new Date()
      let minuteAndHour = dateTime.getHours() + ':' + dateTime.getMinutes()
      this.hashPassword = [...this.messagePassword].reverse().join("");

      let data = {};
      data["password"] = this.hashPassword;
      data["users"] = this.EncryptText(this.userName, 18);
      data["time"] = minuteAndHour;
      data["message"] = this.EncryptText(this.send_message, 18);

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
      var decryptPass = [...this.messagePassword].reverse().join("");

      if (data["password"] == decryptPass) {

        if (data["message"] != null) {
          let messageObj = {};
          messageObj["message"] = this.DecryptText(data["message"], 18);
          messageObj["minuteAndHour"] = data["time"];
          messageObj["user"] = "you";
          messageObj["fromUser"] = this.DecryptText(data["users"], 18);
          this.messageArray.push(messageObj);

          var userCheck;
          this.userArray.forEach(name => {
            if (name == messageObj["fromUser"].toString())
              userCheck = true;
          });

          if (!userCheck)
            this.userArray.push(messageObj["fromUser"].toString());

        }

      }
    });
  }
}
