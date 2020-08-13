import { ModalController, Platform } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { DisparadoresService } from 'src/app/services/disparadores.service';
import { AnimationsService } from 'src/app/services/animations.service';
import { PagosService } from 'src/app/services/pagos.service';

import { environment } from 'src/environments/environment.prod'

declare var Stripe: any


@Component({
  selector: 'app-tarjeta',
  templateUrl: './tarjeta.page.html',
  styleUrls: ['./tarjeta.page.scss'],
})
export class TarjetaPage implements OnInit {

  tarjeta = {
    numero: null,
    expiracion: '',
    cvv: '',
    nombre: '',
  }

  nombre = ''
  cp = null

  titulo: string
  mensaje: string
  imagen: string
  cuadroAyuda: HTMLElement
  claseAyuda: HTMLElement

  imagenes =  {
    cvc: '../../../assets/img/cvc.jpg',
    fecha: '../../../assets/img/vencimiento.jpg'
  }

  loading = false

  back: Subscription

  secret: string
  stripe: any
  style = {
    base: {
      color: 'var(--ion-color-medium)',
      fontFamily: 'Nunito, sans-serif',
      fontSmoothing: "antialiased",
      fontWeight: '700',
      fontSize: "12px",
      '::placeholder': {
        color: "#989aa2",
      }
    },
    invalid: {
      fontFamily: 'Nunito, sans-serif',
      color: "#fa755a",
      iconColor: "#fa755a"
    }
  }

  card: any
  cardReady = false
  cardInvalid = true

  constructor(
    private platform: Platform,
    private modalCtrl: ModalController,
    private animationService: AnimationsService,
    private commonService: DisparadoresService,
    private pagoService: PagosService,
  ) { }

  ngOnInit() {
    this.stripe = Stripe(environment.stripe, {locale: 'es'})
    const elements = this.stripe.elements()
    this.card = elements.create('card', {style: this.style})
    this.card.mount('#card')
    this.listenCard()
    this.back = this.platform.backButton.subscribeWithPriority(9999, () => this.regresar())
    this.pagoService.newCard()
    .then(res => this.secret = res)
    .catch(err => console.log(err))
  }

  listenCard() {
    const that = this
    this.card.on('ready', ev => {
      this.cardReady = true
    })
    this.card.on('change', function(event) {
      document.querySelector("#card-error").textContent = event.error ? event.error.message : "";
      that.cardInvalid = event.complete ? false : true
      if (event.error) that.cardInvalid = true
      if (event.complete) that.card.blur()
    })
  }

  async ayuda(titulo: string, mensaje: string, imagen: string) {
    this.titulo = titulo
    this.mensaje = mensaje
    this.imagen = this.imagenes[imagen]
    if (!this.claseAyuda) this.claseAyuda = document.querySelector('.cuadro-ayuda') as HTMLElement
    this.claseAyuda.style.setProperty('visibility', 'visible')
    if (!this.cuadroAyuda) this.cuadroAyuda= document.getElementById('ayuda')
    this.animationService.animEntradaDebajo(this.cuadroAyuda)
  }

  quitaAyuda() {
    this.claseAyuda.style.setProperty('visibility', 'hidden')
    this.animationService.salidaDebajo(this.cuadroAyuda)
  }

  async agregarTarjeta() {
    this.loading = true
    const that = this
    this.stripe.confirmCardPayment(this.secret, {
      payment_method: {
        card: this.card,
        billing_details: {
          name: this.nombre
        }
      },
      setup_future_usage: 'off_session'
    })
    .then(async (result) => {
      if (result.error) return this.commonService.presentAlert('Error', result.error.message)
      await this.pagoService.saveCard(result.paymentIntent.payment_method)
      const nuevaCard = await this.pagoService.getLastCard(result.paymentIntent.payment_method)
      this.loading = false
      this.commonService.presentToast('Tarjeta agregada con éxito')
      if (this.back) this.back.unsubscribe()
      this.modalCtrl.dismiss(nuevaCard)
    })
    .catch(err => {
      this.loading = false
    })
  }

  tarjetaInvalida(msn: string) {
    this.loading = false
    this.commonService.presentAlert('Error', msn)
  }

  async regresar() {
    if (this.back) this.back.unsubscribe()
    this.modalCtrl.dismiss()
  }

}
