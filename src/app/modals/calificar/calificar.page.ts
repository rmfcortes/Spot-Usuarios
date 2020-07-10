import { Component, OnInit, Input } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { CalificarService } from 'src/app/services/calificar.service';

import { Pedido, DetallesCalificacionRepartidor, DetallesCalificacionNegocio, Calificacion } from 'src/app/interfaces/pedido';

@Component({
  selector: 'app-calificar',
  templateUrl: './calificar.page.html',
  styleUrls: ['./calificar.page.scss'],
})
export class CalificarPage implements OnInit {

  @Input() pedido: Pedido


  negocio: DetallesCalificacionNegocio = {
    puntos: 5,
    comentarios: '',
    idNegocio: ''
  }

  repartidor: DetallesCalificacionRepartidor = {
    puntos: 5,
    comentarios: '',
    idRepartidor: '',
    externo: false
  }

  back: Subscription

  constructor(
    private platform: Platform,
    private modalCtrl: ModalController,
    private calificarService: CalificarService,
  ) { }

  ngOnInit() {
    this.back = this.platform.backButton.subscribeWithPriority(9999, () => this.regresar())
  }

  calificar() {
    this.repartidor.externo = this.pedido.repartidor.externo
    this.repartidor.idRepartidor = this.pedido.repartidor.id
    this.negocio.idNegocio = this.pedido.negocio.idNegocio
    const calificacion: Calificacion = {
      negocio: this.negocio,
      repartidor: this.repartidor,
      creado: this.pedido.createdAt,
      region: this.pedido.region
    }
    this.negocio.idPedido = this.pedido.id
    this.repartidor.idPedido = this.pedido.id
    this.negocio.fecha = this.pedido.createdAt
    this.repartidor.fecha = this.pedido.createdAt
    this.calificarService.calificar(this.pedido.id, calificacion)
    this.pedido.calificacion = calificacion
    this.modalCtrl.dismiss()
  }


  regresar() {
    this.back.unsubscribe()
    this.modalCtrl.dismiss()
  }

  
  
}
