import { Component, OnInit, Input } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { SocialSharing } from '@ionic-native/social-sharing/ngx';

import { DisparadoresService } from 'src/app/services/disparadores.service';
import { Producto } from 'src/app/interfaces/producto';

@Component({
  selector: 'app-servicio',
  templateUrl: './servicio.page.html',
  styleUrls: ['./servicio.page.scss'],
})
export class ServicioPage implements OnInit {

  @Input() servicio: Producto;
  @Input() whats: String;

  back: Subscription;

  constructor(
    private platform: Platform,
    private modalCtrl: ModalController,
    private socialSharing: SocialSharing,
    private alertService: DisparadoresService,
  ) { }

  ngOnInit() {
    this.back = this.platform.backButton.subscribeWithPriority(9999, () => {
      this.regresar();
    });
  }

  async contactViaWhatsApp() {
    const tel = '+52' + this.whats;
    this.socialSharing.shareViaWhatsAppToReceiver(
      tel,
      'Hola, vi tu negocio en Spot, quiero agendar una cita'
    ).then(resp => {
      console.log('Success');
    }).catch(err => {
      this.alertService.presentAlert('Error', err);
    });
  }

  regresar() {
    if (this.back) {this.back.unsubscribe()}
    this.modalCtrl.dismiss();
  }

}
