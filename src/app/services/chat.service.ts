import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

import { Mensaje } from '../interfaces/chat.interface';
import { UidService } from './uid.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }


  listenMsg() {
    const idCliente = this.uidService.getUid();
    return this.db.list(`usuarios/${idCliente}/chat/unread`).valueChanges();
  }

  listenMsgPedido(idPedido: string) {
    const idCliente = this.uidService.getUid();
    return this.db.object(`usuarios/${idCliente}/chat/unread/${idPedido}`).valueChanges();
  }

  setSeen(idPedido: string) {
    const idCliente = this.uidService.getUid()
    this.db.object(`usuarios/${idCliente}/chat/unread/${idPedido}`).remove()
  }

  publicarMsg(msg: Mensaje, idPedido: string) {
    const idCliente = this.uidService.getUid();
    this.db.list(`usuarios/${idCliente}/chat/status/${idPedido}`).remove();
    this.db.list(`usuarios/${idCliente}/chat/todos/${idPedido}`).push(msg);
  }

  listenTodosMsg(idPedido: string) {
    const idCliente = this.uidService.getUid();
    return this.db.list(`usuarios/${idCliente}/chat/todos/${idPedido}`);
  }

  listenStatus(idPedido: string) {
    const idCliente = this.uidService.getUid()
    return this.db.object(`usuarios/${idCliente}/chat/status/${idPedido}`).valueChanges()
  }

}
