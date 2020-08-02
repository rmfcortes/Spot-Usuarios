import { Component, OnInit, ViewChild, NgZone, Input } from '@angular/core';
import { ModalController, IonContent, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { ChatService } from 'src/app/services/chat.service';
import { UidService } from 'src/app/services/uid.service';

import { Mensaje, UnreadMsg } from 'src/app/interfaces/chat.interface';
import { PedidoService } from 'src/app/services/pedido.service';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  @ViewChild(IonContent, {static: true}) content: IonContent
  @Input() idRepartidor
  @Input() idPedido
  @Input() nombre
  @Input() foto

  messages: Mensaje[] = []

  newMsg = ''
  status = ''

  stateSub: Subscription
  notiSub: Subscription
  back: Subscription

  constructor(
    private ngZone: NgZone,
    private platform: Platform,
    private modalController: ModalController,
    private pedidoService: PedidoService,
    private chatService: ChatService,
    private uidService: UidService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.chatService.setSeen(this.idPedido)
    this.listenMsg()
    this.listenState()
    this.listenEntregado()
    this.listenNotification()
    this.back = this.platform.backButton.subscribeWithPriority(9999, () => {
      this.regresar()
    })
  }

  listenEntregado() {
    this.pedidoService.listenEntregado(this.idPedido).query.ref.off('child_removed')
    this.pedidoService.listenEntregado(this.idPedido).query.ref.on('child_removed', snapshot => {
      this.ngZone.run(() => this.regresar())
    })
  }

  sendMessage() {
    const newMsg: Mensaje = {
      isMe: true,
      createdAt: new Date().getTime(),
      idPedido: this.idPedido, // if soporte === uidCliente
      msg: this.newMsg,
      idRepartidor: this.idRepartidor, // if soporte === 'soporte'
      nombre: this.uidService.getNombre(),
      foto: this.uidService.getFoto()
    }
    this.chatService.publicarMsg(newMsg, this.idPedido)
    this.newMsg = ''
  }

  listenNotification() {
    if (this.notiSub) this.notiSub.unsubscribe()
    this.notiSub = this.chatService.listenMsgPedido(this.idPedido).subscribe((mensaje: UnreadMsg) => {
      this.ngZone.run(() => {
        if (mensaje && mensaje.cantidad > 0) {
          this.chatService.setSeen(this.idPedido)
        }
      })
    })
  }

  listenMsg() {
    this.chatService.listenTodosMsg(this.idPedido).query.ref.off('child_added')
    this.chatService.listenTodosMsg(this.idPedido).query.ref.on('child_added', snapshot => {
      this.ngZone.run(() => {
        this.messages.push(snapshot.val())
        setTimeout(() => {
          this.content.scrollToBottom(0)
        })
      })
    })
  }

  listenState() {
    if (this.stateSub) this.stateSub.unsubscribe()
    this.stateSub = this.chatService.listenStatus(this.idPedido).subscribe((estado: any) => {
      this.ngZone.run(() => this.status = estado || null)
    })
  }

  regresar() {
    this.pedidoService.listenEntregado(this.idPedido).query.ref.off('child_removed')
    this.chatService.listenTodosMsg(this.idPedido).query.ref.off('child_added')
    if (this.stateSub) this.stateSub.unsubscribe()
    if (this.notiSub) this.notiSub.unsubscribe()
    if (this.back) this.back.unsubscribe()
    this.modalController.dismiss()
  }

}
