import { Component, OnInit, Input } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { SocialSharing } from '@ionic-native/social-sharing/ngx';

import { NegocioServiciosService } from 'src/app/services/negocio-servicios.service';
import { DisparadoresService } from 'src/app/services/disparadores.service';

import { Producto } from 'src/app/interfaces/producto';

@Component({
  selector: 'app-servicio',
  templateUrl: './servicio.page.html',
  styleUrls: ['./servicio.page.scss'],
})
export class ServicioPage implements OnInit {

  @Input() fromServPage: boolean
  @Input() servicio: Producto
  @Input() categoria: string
  @Input() idNegocio: string
  @Input() whats: string

  back: Subscription

  constructor(
    private platform: Platform,
    private modalCtrl: ModalController,
    private socialSharing: SocialSharing,
    private servicioService: NegocioServiciosService,
    private alertService: DisparadoresService,
  ) { }

  ngOnInit() {
    this.back = this.platform.backButton.subscribeWithPriority(9999, () => {
      this.regresar()
    })
    if (!this.whats) this.getWhats()
  }

  async getWhats() {
    this.whats = await this.servicioService.getWhats(this.categoria, this.idNegocio)
  }
  
  async contactViaWhatsApp() {
    const tel = '+52' + this.whats
    this.socialSharing.shareViaWhatsAppToReceiver(
      tel,
      'Hola, vi tu negocio en Plaza, quiero agendar una cita'
    ).catch(err => {
      this.alertService.presentAlert('Error', err)
    })
  }

  verMas() {
    if (this.back) this.back.unsubscribe()
    this.modalCtrl.dismiss('ver_mas')
  }

  regresar() {
    if (this.back) this.back.unsubscribe()
    this.modalCtrl.dismiss()
  }

}
