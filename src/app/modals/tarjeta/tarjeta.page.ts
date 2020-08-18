import { ModalController } from '@ionic/angular';
import { Component, OnInit, NgZone } from '@angular/core';

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
    private ngZone: NgZone,
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
  }

  listenCard() {
    this.card.on('ready', ev => {
      this.ngZone.run(() => this.cardReady = true)
    })
    this.card.on('change', event => {
      this.ngZone.run(() => {
        document.querySelector("#card-error").textContent = event.error ? event.error.message : ""
        this.cardInvalid = event.complete ? false : true
        if (event.error) this.cardInvalid = true
        if (event.complete) this.card.blur()
      })
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
    try {
      const secret = await this.pagoService.newCard()
      this.stripe.confirmCardPayment(secret, {
        payment_method: {
          card: this.card,
          billing_details: {
            name: this.nombre
          }
        },
        setup_future_usage: 'off_session'
      })
      .then(async (result) => {
        this.ngZone.run(async () => {
          if (result.error) {
            this.loading = false
            return this.commonService.presentAlert('Error', result.error.message)
          }
          await this.pagoService.saveCard(result.paymentIntent.payment_method)
          const nuevaCard = await this.pagoService.getLastCard(result.paymentIntent.payment_method)
          this.loading = false
          this.commonService.presentToast('Tarjeta agregada con éxito')
    
          this.modalCtrl.dismiss(nuevaCard)
        })
      })
      .catch(err => {
        this.loading = false
        this.commonService.presentAlert('', err)
      })
    } catch (error) {
      this.loading = false
      this.commonService.presentAlert('', error)
    }
    
  }

  async regresar() {
    this.modalCtrl.dismiss()
  }

}
