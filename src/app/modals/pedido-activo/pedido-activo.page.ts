import { Component, OnInit, Input } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { CalificarPage } from '../calificar/calificar.page';

import { Pedido } from 'src/app/interfaces/pedido';

import { enterAnimation } from 'src/app/animations/enter';
import { leaveAnimation } from 'src/app/animations/leave';


@Component({
  selector: 'app-pedido-activo',
  templateUrl: './pedido-activo.page.html',
  styleUrls: ['./pedido-activo.page.scss'],
})
export class PedidoActivoPage implements OnInit {

  @Input() pedido: Pedido;

  back: Subscription;

  constructor(
    private platform: Platform,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
    // this.back = this.platform.backButton.subscribeWithPriority(9999, () => {
    //   this.regresar();
    // });
  }

  async verCalificar() {
    const modal = await this.modalCtrl.create({
     cssClass: 'my-custom-modal-css',
     enterAnimation,
     leaveAnimation,
     component: CalificarPage,
     componentProps: { pedido: this.pedido }
    });
    return await modal.present();
  }

  regresar() {
    if (this.back) {this.back.unsubscribe()}
    this.modalCtrl.dismiss();
  }

}
