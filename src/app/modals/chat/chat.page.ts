import { Component, OnInit, ViewChild, NgZone, Input } from '@angular/core';
import { ModalController, IonContent, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { ChatService } from 'src/app/services/chat.service';
import { UidService } from 'src/app/services/uid.service';

import { Mensaje, UnreadMsg } from 'src/app/interfaces/chat.interface';


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
    private chatService: ChatService,
    private uidService: UidService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.chatService.setSeen(this.idPedido)
    this.listenMsg()
    this.listenNotification()
    this.listenState()
    this.back = this.platform.backButton.subscribeWithPriority(9999, () => {
      this.regresar()
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
    this.notiSub = this.chatService.listenMsgPedido(this.idPedido).subscribe((mensaje: UnreadMsg) => {
      if (mensaje && mensaje.cantidad > 0) {
        this.chatService.setSeen(this.idPedido);
      }
    });
  }

  listenMsg() {
    this.chatService.listenTodosMsg(this.idPedido).query.ref.on('child_added', snapshot => {
      this.ngZone.run(() => {
        this.messages.push(snapshot.val());
        setTimeout(() => {
          this.content.scrollToBottom(0);
        });
      });
    });
  }

  listenState() {
    this.stateSub = this.chatService.listenStatus(this.idPedido).subscribe((estado: any) => {
      this.status = estado || null;
    })
  }

  regresar() {
    this.chatService.listenTodosMsg(this.idPedido).query.ref.off('child_added');
    if (this.notiSub) { this.notiSub.unsubscribe(); }
    if (this.stateSub) { this.stateSub.unsubscribe(); }
    if (this.back) { this.back.unsubscribe(); }
    this.modalController.dismiss();
  }

}
