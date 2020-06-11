import { ModalController, Platform } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { PedidoActivoPage } from 'src/app/modals/pedido-activo/pedido-activo.page';

import { HistorialService } from 'src/app/services/historial.service';

import { Pedido } from 'src/app/interfaces/pedido';

import { enterAnimation } from 'src/app/animations/enter';
import { leaveAnimation } from 'src/app/animations/leave';


@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {

  batch = 5;
  lastKey = '';
  noMore = false;

  historial: Pedido[] = [];

  historialReady = false;

  back: Subscription;

  constructor(
    private router: Router,
    private platform: Platform,
    private modalCtrl: ModalController,
    private historialService: HistorialService,
  ) { }

  ngOnInit() {
    this.getPedidos();
  }

  ionViewWillEnter() {
    this.back = this.platform.backButton.subscribeWithPriority(9999, () => {
      this.router.navigate(['/home']);
    });
  }

  ionViewWillLeave() {
    if (this.back) {this.back.unsubscribe()}
  }

  getPedidos(event?) {
    this.historialService.getHistorial(this.batch + 1, this.lastKey).then(historial => {
      this.cargaHistorial(historial, event);
    });
  }

  cargaHistorial(historial, event) {
    if (historial.length === this.batch + 1) {
      this.lastKey = historial[0].id;
      historial.shift();
    } else {
      this.noMore = true;
    }
    this.historial = this.historial.concat(historial.reverse());
    if (event) {
      event.target.complete();
    }
    this.historialReady = true;
  }

  async loadData(event) {
    if (this.noMore) {
      event.target.disabled = true;
      event.target.complete();
      return;
    }
    this.getPedidos(event);
    // App logic to determine if all data is loaded
    // and disable the infinite scroll
    if (this.noMore) {
      event.target.disabled = true;
    }
  }

  async verPedido(pedido: Pedido) {
    const modal = await this.modalCtrl.create({
      component: PedidoActivoPage,
      enterAnimation,
      leaveAnimation,
      componentProps: {pedido}
    });

    return await modal.present();
  }

}
