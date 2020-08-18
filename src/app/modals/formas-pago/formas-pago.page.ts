import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { TarjetaPage } from 'src/app/modals/tarjeta/tarjeta.page';

import { DisparadoresService } from 'src/app/services/disparadores.service';
import { PagosService } from 'src/app/services/pagos.service';

import { FormaPago } from 'src/app/interfaces/forma-pago.interface';
import { FormaPagoPermitida } from 'src/app/interfaces/pedido';

import { enterAnimationDerecha } from 'src/app/animations/enterDerecha';
import { leaveAnimationDerecha } from 'src/app/animations/leaveDerecha';

@Component({
  selector: 'app-formas-pago',
  templateUrl: './formas-pago.page.html',
  styleUrls: ['./formas-pago.page.scss'],
})
export class FormasPagoPage implements OnInit {

  @Input() formas_pago_aceptadas: FormaPagoPermitida
  @Input() infopagos: FormaPagoPermitida

  err: string
  tarjetas: FormaPago[] = [ ]
  script: HTMLScriptElement

  constructor(
    private modalCtrl: ModalController,
    private alertService: DisparadoresService,
    private pagoService: PagosService,
  ) { }

  ngOnInit() {
    this.getTarjetas()
  }

  getTarjetas() {
    this.pagoService.getTarjetas()
    .then(tarjetas => this.tarjetas = tarjetas)
    .catch(err => this.err = err)
  }

  async nuevaTarjeta() {
    const modal = await this.modalCtrl.create({
      component: TarjetaPage,
      enterAnimation: enterAnimationDerecha,
      leaveAnimation: leaveAnimationDerecha,
      componentProps: {script: this.script}
    })

    modal.onWillDismiss().then(resp => {
      if (resp.data) this.tarjetas.push(resp.data)
    })

    return await modal.present()
  }

  async selFormaPago(forma, tipo, id) {
    const pago: FormaPago = {
      forma,
      tipo,
      id
    }
    try {
      await this.pagoService.guardarFormaPago(pago)
      this.modalCtrl.dismiss(pago)
    } catch (error) {
      this.alertService.presentAlert(
        'Algo salió mal',
        'Tuvimos problemas para asignar tu forma de pago, por favor intenta de nuevo')
    }
  }

  regresar() {
    this.modalCtrl.dismiss()
  }

}
