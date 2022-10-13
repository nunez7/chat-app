import { Component, OnInit } from '@angular/core';
import { Client } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { Mensaje } from './models/mensaje';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  private client: Client;
  conectado: boolean = false;
  mensaje: Mensaje = new Mensaje();
  mensajes: Mensaje[] = [];
  escribiendo: string;

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
      this.conectado = true;
      //Recibimos los mensajes
      this.client.subscribe('/chat/mensaje', e => {
        let mensaje: Mensaje = JSON.parse(e.body) as Mensaje;
        mensaje.fecha = new Date(mensaje.fecha);
        //asignamos el color al nuevo cliente
        if(!this.mensaje.color && mensaje.tipo == 'NUEVO_USUARIO' && this.mensaje.username== mensaje.username){
          this.mensaje.color = mensaje.color;
        }
        
        this.mensajes.push(mensaje);
      });
      
      //suscripcion para escribiendo
      this.client.subscribe('/chat/escribiendo', e => {
        this.escribiendo = e.body;
        //Despues de 3s se resetea escribiendo
        setTimeout(() => this.escribiendo = '', 3000)
      });
      this.client.publish({destination: '/app/mensaje', body: JSON.stringify(this.mensaje)});
    }

    this.mensaje.tipo = 'NUEVO_USUARIO';
    this.client.onDisconnect = (frame) =>{
      console.log('Desconectados: '+this.client.connected+ ": "+frame);
      this.conectado = false;
    }
  }

  conectar(): void{
    //Metodo para conectarnos
    //console.log('ACTIVA');
    this.client.activate();
  }

  desconectar(): void{
    this.client.deactivate();
  }

  enviarMensaje(): void{
    this.mensaje.tipo = 'MENSAJE';
    if(this.mensaje.texto!=='' || this.mensaje.texto!=null){
      this.client.publish({destination: '/app/mensaje', body: JSON.stringify(this.mensaje)});
      this.mensaje.texto = '';
    }
  }
  //Envia a /app/escribiendo el usuario
  escribiendoEvento(): void{
    this.client.publish({destination: '/app/escribiendo', body: this.mensaje.username});
  }

}
