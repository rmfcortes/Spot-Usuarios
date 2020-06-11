import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { Tarjeta } from 'src/app/interfaces/tarjeta.interface';

import { DisparadoresService } from 'src/app/services/disparadores.service';
import { AnimationsService } from 'src/app/services/animations.service';
import { PagosService } from 'src/app/services/pagos.service';
import { UidService } from 'src/app/services/uid.service';
import { FormaPago } from 'src/app/interfaces/forma-pago.interface';

declare var Conekta: any;

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

  titulo: string;
  mensaje: string;
  imagen: string
  cuadroAyuda: any;
  claseAyuda: any;

  imagenes =  {
    cvc: '../../../assets/img/cvc.jpg',
    fecha: '../../../assets/img/vencimiento.jpg'
  }

  loading = false;

  constructor(
    private modalCtrl: ModalController,
    private animationService: AnimationsService,
    private commonService: DisparadoresService,
    private pagoService: PagosService,
    private uidService: UidService,
  ) { }

  ngOnInit() {
    Conekta.setPublicKey('key_D9tzmzTnFqz2xbkTdeqQ9ZA'); //key_D9tzmzTnFqz2xbkTdeqQ9ZA
    Conekta.setLanguage('es');
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

  borraNum() {
    if (this.tarjeta.numero.length === 5 ||
        this.tarjeta.numero.length === 10 ||
        this.tarjeta.numero.length === 15) this.tarjeta.numero = this.tarjeta.numero.substring(0, this.tarjeta.numero.length - 1)
  }

  numeroCambio() {
    if (this.tarjeta.numero.length === 4 ||
        this.tarjeta.numero.length === 9 || 
        this.tarjeta.numero.length === 14) this.tarjeta.numero = this.tarjeta.numero + ' '
  }

  borraVigencia() {
    if (this.tarjeta.expiracion.length === 3) this.tarjeta.expiracion = this.tarjeta.expiracion.substring(0, this.tarjeta.expiracion.length - 1)
  }

  vigenciaCambio() {
    if (this.tarjeta.expiracion.length === 2) this.tarjeta.expiracion = this.tarjeta.expiracion + '/'
  }

  moveFocus(nextElement) {
    nextElement.setFocus();
  }

  spaceKey(text: string) {
    this.tarjeta[text] = this.tarjeta[text].trim() 
    return
  }

  agregarTarjeta() {
    this.loading = true;
    const vencimiento = this.tarjeta.expiracion.split('/');
    const newCard: Tarjeta = {
      number: this.tarjeta.numero,
      name: this.tarjeta.nombre,
      exp_year: '20' + vencimiento[1],
      exp_month: vencimiento[0],
      cvc: this.tarjeta.cvv,
      tipo: ''
    }
    if (!Conekta.card.validateNumber(newCard.number)) return this.tarjetaInvalida('Número de tarjeta inválido.');
    if (!Conekta.card.validateExpirationDate(newCard.exp_month, newCard.exp_year)) return this.tarjetaInvalida('Fecha de vencimiento inválida');
    if (!Conekta.card.validateCVC(newCard.cvc)) return this.tarjetaInvalida('Código de seguridad inválido');
    newCard.tipo = Conekta.card.getBrand(newCard.number);
    Conekta.card.validateNumber(newCard.number);
    Conekta.Token.create({card: newCard}, (response: any) => {
      if (response.id && response.object === 'token') {
        const data: FormaPago = {
          tipo: newCard.tipo,
          forma: newCard.number.slice(newCard.number.length - 4),
        }
        const cliente = {
          idCliente: '',
          token: response.id,
          name: newCard.name
        }
        this.pagoService.newCard(cliente)
        .then(() => this.pagoService.saveCard(data))
        .then(() => {
          this.loading = false
          this.modalCtrl.dismiss(data)
        })
        .catch(err => {
          this.loading = false
          this.commonService.presentAlert('Error', err)
        })
      } else {
        this.tarjetaInvalida('Algo salió mal, por favor intenta de nuevo')
      }
    }, err => {
      this.tarjetaInvalida(err.message_to_purchaser)
    })
  }

  tarjetaInvalida(msn: string) {
    this.loading = false
    this.commonService.presentAlert('Error', msn);
  }

  regresar() {
    this.modalCtrl.dismiss();
  }

}
