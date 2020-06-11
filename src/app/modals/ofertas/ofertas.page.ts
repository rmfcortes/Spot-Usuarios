import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { OfertasService } from 'src/app/services/ofertas.service';

import { Oferta, InfoGral } from 'src/app/interfaces/negocio';

@Component({
  selector: 'app-ofertas',
  templateUrl: './ofertas.page.html',
  styleUrls: ['./ofertas.page.scss'],
})
export class OfertasPage implements OnInit {

  @Input() categoria;
  @Input() batch;

  lastKey = '';
  ofertas: Oferta[] = [];

  noMore = false;

  back: Subscription;

  constructor(
    private router: Router,
    private platform: Platform,
    private modalCtrl: ModalController,
    private ofertaService: OfertasService,
  ) { }

  ngOnInit() {
    this.getOfertas();
    this.back = this.platform.backButton.subscribeWithPriority(9999, () => {
      this.regresar();
    });
  }

  // Carga de ofertas

  getOfertas(event?) {
    this.ofertaService.getOfertasModal(this.categoria, this.batch + 1, this.lastKey)
      .then((ofertas: Oferta[]) => {
        this.cargaOfertas(ofertas, event);
      });
  }

  cargaOfertas(ofertas, event) {
    if (ofertas.length === this.batch + 1) {
      this.lastKey = ofertas[0].id;
      ofertas.shift();
    } else {
      this.noMore = true;
    }
    this.ofertas = this.ofertas.concat(ofertas.reverse());
    if (event) {
      event.target.complete();
    }
  }

  async loadData(event) {
    if (this.noMore) {
      event.target.disabled = true;
      event.target.complete();
      return;
    }
    this.getOfertas(event);
    // App logic to determine if all data is loaded
    // and disable the infinite scroll
    if (this.noMore) {
      event.target.disabled = true;
    }
  }

  // Acciones

  async verOferta(oferta: Oferta) {
    const infoNeg: InfoGral = await this.ofertaService.getStatus(oferta.idNegocio);
    this.router.navigate(['/negocio', infoNeg.categoria, oferta.idNegocio, infoNeg.abierto]);
    this.modalCtrl.dismiss();
  }

  regresar() {
    if (this.back) {this.back.unsubscribe()}
    this.modalCtrl.dismiss();
  }

}
