import { Component, OnInit } from '@angular/core';
import { Client } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  private client: Client;

  constructor() { }

  ngOnInit(): void {
    this.client = new Client();
    //creamos la conexion
    this.client.webSocketFactory = ()=>{
      //El endpoint de spring /canal para enviar y recibir mensajes
      return new SockJS("http://localhost:8883/chat-websocket");
    }

    //OBtenemos el sttaus de la conexion
    this.client.onConnect = (frame) => {
      console.log("Conectados "+ this.client.connected+ ": "+frame);
    }
    //Metodo para conectarnos
    this.client.activate();

  }

}
