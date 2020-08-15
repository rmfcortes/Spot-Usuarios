import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, NgZone } from '@angular/core';
import { Platform, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { CallNumber } from '@ionic-native/call-number/ngx';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapOptions,
  Marker,
  MarkerIcon,
  ILatLng
} from '@ionic-native/google-maps';

import { DisparadoresService } from 'src/app/services/disparadores.service';
import { PedidoService } from 'src/app/services/pedido.service';
import { ChatService } from 'src/app/services/chat.service';

import { PedidoActivoPage } from 'src/app/modals/pedido-activo/pedido-activo.page';
import { CalificarPage } from 'src/app/modals/calificar/calificar.page';
import { PermisosPage } from 'src/app/modals/permisos/permisos.page';
import { ChatPage } from 'src/app/modals/chat/chat.page';

import { Ubicacion } from 'src/app/interfaces/region.interface';
import { Pedido, Repartidor } from 'src/app/interfaces/pedido';
import { UnreadMsg } from 'src/app/interfaces/chat.interface';

import { enterAnimation } from 'src/app/animations/enter';
import { leaveAnimation } from 'src/app/animations/leave';

@Component({
  selector: 'app-avances',
  templateUrl: './avances.page.html',
  styleUrls: ['./avances.page.scss'],
})
export class AvancesPage implements OnInit {


  icon = '../../../assets/img/iconos/pin.png';
  tienda = '../../../assets/img/iconos/tienda.png';
  repartidor = '../../../assets/img/iconos/repartidor.png';

  map: GoogleMap
  markers: ILatLng[] = []
  repartidorMarker: Marker
  repartidorIcon: MarkerIcon

  clienteLatLng: ILatLng
  negocioLatLng: ILatLng

  pedido: Pedido
  msgSub: Subscription
  pedidoSub: Subscription
  entregadoSub: Subscription
  ubicacionSub: Subscription
  canceladoSub: Subscription
  repartidorSub: Subscription
  tipoEntregaSub: Subscription

  telReady = true
  tel: string

  newMsg = false
  hasPermission = true

  entregaAprox = null

  infoReady = false

  back: Subscription


  constructor(
    private router: Router,
    private ngZone: NgZone,
    private platform: Platform,
    private callNumber: CallNumber,
    private modalCtrl: ModalController,
    private activatedRoute: ActivatedRoute,
    private alertService: DisparadoresService,
    private pedidoService: PedidoService,
    private chatService: ChatService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.back = this.platform.backButton.subscribeWithPriority(9999, () => this.regresar())
    const id = this.activatedRoute.snapshot.paramMap.get('id')
    this.getPedido(id)
  }

  ionViewDidEnter() {
    this.getTelefono()
    this.getToken()
  }

  loadMap() {
    if(this.map) this.map.clear()

    let mapOptions: GoogleMapOptions = {
      camera: {
        target: {
          lat: 20.627006,
          lng: -103.416554
        },
         zoom: 17,
       },
       gestures: {
         zoom: true,
         rotate: true
       },
    }

    const cliente: MarkerIcon = {
      url: './assets/img/iconos/pin.png',
      size: {
        width: 30,
        height: 40
      }
    }

    const negocio: MarkerIcon = {
      url: './assets/img/iconos/tienda.png',
      size: {
        width: 40,
        height: 40
      }
    }

    this.map = GoogleMaps.create('map_canvas', mapOptions)
    const styles = {
      default: null,
      hide: [
        {
          featureType: 'poi.business',
          stylers: [{visibility: 'off'}]
        },
        {
          featureType: 'transit',
          elementType: 'labels.icon',
          stylers: [{visibility: 'off'}]
        }
      ]
    };
    this.map.setOptions({styles: styles['hide']})

    this.map.addMarkerSync({
      icon: cliente,
      animation: 'DROP',
      position: {
        lat: this.pedido.cliente.direccion.lat,
        lng: this.pedido.cliente.direccion.lng
      }
    })

    this.map.addMarkerSync({
      icon: negocio,
      animation: 'DROP',
      position: {
        lat: this.pedido.negocio.direccion.lat,
        lng: this.pedido.negocio.direccion.lng
      }
    })

    this.clienteLatLng = {
      lat: this.pedido.cliente.direccion.lat,
      lng: this.pedido.cliente.direccion.lng
    }
    this.negocioLatLng = {
      lat: this.pedido.negocio.direccion.lat,
      lng: this.pedido.negocio.direccion.lng
    }

    this.markers = [this.clienteLatLng, this.negocioLatLng]

    this.map.moveCamera({
      target: this.markers,
      padding: 100
    })

  }

  mapReady(map) {
    this.map = map
  }

  getPedido(id) {
    this.pedidoService.getPedido(id).then((pedido: Pedido) => {
      this.pedido = pedido
      // this.loadMap()
      if (!this.pedido.aceptado) {
        this.trackCancelado()
        this.pedidoSub = this.pedidoService.trackAcept(id).subscribe((resp: number) => {
          this.ngZone.run(() => {
            if (resp) {
              this.pedidoSub.unsubscribe()
              this.pedido.aceptado = resp
              this.listenRepartidor(id)
              this.trackAvances()
            } else  this.infoReady = true
          })
        })
      } else {
        this.trackAvances()
        this.listenRepartidor(id)
      }
    })
    .catch(() => {
      this.alertService.presentAlert('', 'Este pedido ha sido entregado o cancelado, por favor revisa en tu historial')
      .then(() => this.router.navigate(['/home'], { replaceUrl: true }))
    })
  }

  listenRepartidor(id) {
    if (!this.pedido.repartidor) {
      if (this.repartidorSub) this.repartidorSub.unsubscribe()
      this.repartidorSub = this.pedidoService.trackRepartidor(id).subscribe((resp: Repartidor) => {
        this.ngZone.run(() => {
          if (resp) {
            this.repartidorSub.unsubscribe()
            this.pedido.repartidor = resp
            this.infoReady = true
            this.isMapReady()
          } else {
            this.infoReady = true
          }
        })
      })
    } else {
      this.infoReady = true
      this.isMapReady()
    }
    if (this.pedido.entrega === 'indefinido') this.trackTipoEntrega()
    if (this.pedido.entrega === 'planeado') this.infoReady = true
  }

  async getTelefono() {
    this.tel = await this.pedidoService.getTelefono()
    if (!this.tel) setTimeout(() => this.telReady = false, 2000)
    else this.telReady = true
  }

  getToken() {
    this.pedidoService.getToken().then(resp => resp ? this.hasPermission = true : this.hasPermission = false)
  }

  // Listener

  trackTipoEntrega() {
    if (this.tipoEntregaSub) this.tipoEntregaSub.unsubscribe()
    this.tipoEntregaSub = this.pedidoService.trackTipoEntrega(this.pedido.id).subscribe((tipo: string) => {
      this.ngZone.run(() => {
        if (tipo === 'inmediato' || tipo === 'planeado') {
          this.pedido.entrega = tipo
          this.listenRepartidor(this.pedido.id)
        }
      })
    })
  }

  trackAvances() {
    this.pedido.avances = []
    this.pedidoService.trackAvances(this.pedido.id).query.ref.off('child_added')
    this.pedidoService.trackAvances(this.pedido.id).query.ref.on('child_added', snapshot => {
      this.ngZone.run(() => this.pedido.avances.push(snapshot.val()))
    })
  }

  isMapReady() {
    if (this.map) this.trackRepartidor()
    else setTimeout(() => this.isMapReady(), 300)
  }

  trackRepartidor() {
    if (!this.repartidorIcon) {
      this.repartidorIcon = {
        url: './assets/img/iconos/repartidor.png',
        size: {
          width: 40,
          height: 60
        }
      }
    }
    this.trackEntregado()
    this.listenNewMsg()
    if (this.repartidorSub) this.repartidorSub.unsubscribe()
    this.repartidorSub = this.pedidoService.trackUbicacion(this.pedido.repartidor.id).subscribe((ubicacion: Ubicacion) => {
      this.ngZone.run(() => {
        if (ubicacion) {
          this.pedido.repartidor.lng = ubicacion.lng
          this.pedido.repartidor.lat = ubicacion.lat
          // const position: ILatLng = {
          //   lat: ubicacion.lat,
          //   lng: ubicacion.lng
          // }
          // if (!this.repartidorMarker) {
          //   this.repartidorMarker = this.map.addMarkerSync({
          //     icon: this.repartidorIcon,
          //     animation: 'DROP',
          //     position
          //   })
          // } else {
          //   this.repartidorMarker.setPosition(position)
          // }
          // const markers: ILatLng[] = [position, this.clienteLatLng, this.negocioLatLng]
          // this.map.moveCamera({
          //   target: markers,
          //   padding: 100
          // })
        }
      })
    })
  }

  trackCancelado() {
    if (this.canceladoSub) this.canceladoSub.unsubscribe()
    this.canceladoSub = this.pedidoService.trackCancelado(this.pedido.id).subscribe((cancelado: number) => {
      this.ngZone.run(async () => {
        if (cancelado && cancelado > 0) {
          this.pedido.razon_cancelacion = await this.pedidoService.getRazonCancelacion(this.pedido.id)
          if (this.msgSub) this.msgSub.unsubscribe()
          if (this.pedidoSub) this.pedidoSub.unsubscribe()
          if (this.ubicacionSub) this.ubicacionSub.unsubscribe()
          if (this.entregadoSub) this.entregadoSub.unsubscribe()
          if (this.repartidorSub) this.repartidorSub.unsubscribe()
          this.pedido.cancelado_by_negocio = cancelado
        }
      })
    })
  }

  trackEntregado() {
    if (this.entregadoSub) this.entregadoSub.unsubscribe()
    this.entregadoSub = this.pedidoService.trackEntregado(this.pedido.id).subscribe(resp => {
      this.ngZone.run(() => {
        if (resp) {
          if (this.msgSub) this.msgSub.unsubscribe()
          if (this.pedidoSub) this.pedidoSub.unsubscribe()
          if (this.ubicacionSub) this.ubicacionSub.unsubscribe()
          if (this.entregadoSub) this.entregadoSub.unsubscribe()
          if (this.repartidorSub) this.repartidorSub.unsubscribe()
          this.verCalificar()
        }
      })
    })
  }

  listenNewMsg() {
    if (this.msgSub) this.msgSub.unsubscribe()
    this.msgSub = this.chatService.listenMsgPedido(this.pedido.id).subscribe((unRead: UnreadMsg) => {
      this.ngZone.run(() => {
        if (unRead && unRead.cantidad > 0) {
          this.newMsg = true
          this.alertService.presentToast('Nuevo mensaje de ' + this.pedido.repartidor.nombre)
        } else {
          this.newMsg = false
        }
      })
    })
  }

    // Acciones

  async verPedido() {
    if (this.back) this.back.unsubscribe()
    const modal = await this.modalCtrl.create({
      component: PedidoActivoPage,
      enterAnimation,
      leaveAnimation,
      componentProps: {pedido: this.pedido}
    })

    modal.onDidDismiss().then(() => {
      setTimeout(() => {
        this.back = this.platform.backButton.subscribeWithPriority(9999, () => this.regresar())
      }, 100)
    })

    return await modal.present()
  }

  async verCalificar() {
    if (this.back) this.back.unsubscribe()
    const modal = await this.modalCtrl.create({
      cssClass: 'my-custom-modal-css',
      enterAnimation,
      leaveAnimation,
      component: CalificarPage,
      componentProps: { pedido: this.pedido }
    })

    modal.onWillDismiss().then(() => this.regresar())
    return await modal.present()
  }

  guardaTel(event?) {
    if (event) event.target.blur()
    if (!this.tel) return
    this.tel = this.tel.replace(/ /g, "")
    if (this.tel.length === 10) {
      this.pedidoService.guardarTelefono(this.tel)
      this.alertService.presentToast('Teléfono guardado. ¡Muchas gracias!')
      this.telReady = true
    } else {
      this.alertService.presentAlert('Número incorrecto', 'El teléfono debe ser de 10 dígitos, por favor intenta de nuevo')
      return
    }
  }

  llamar(numero) {
    this.callNumber.callNumber(numero, true)
    .then(res => console.log('Launched dialer!', res))
    .catch(err => console.error(err))
  }

  async muestraChat() {
    if (this.back) this.back.unsubscribe()
    if (this.msgSub) this.msgSub.unsubscribe()
    const modal = await this.modalCtrl.create({
      component: ChatPage,
      enterAnimation,
      leaveAnimation,
      componentProps: {
        idRepartidor: this.pedido.repartidor.id,
        idPedido: this.pedido.id,
        nombre: this.pedido.repartidor.nombre,
        foto: this.pedido.repartidor.foto
      }
    })

    modal.onDidDismiss().then(() => {
      this.listenNewMsg()
      this.back = this.platform.backButton.subscribeWithPriority(9999, () => this.regresar())
    })

    return await modal.present()
  }

  async muestraPermisos() {
    if (this.back) this.back.unsubscribe()
    const modal = await this.modalCtrl.create({
      component: PermisosPage,
    })
    modal.onWillDismiss().then(resp => {
      if (resp) {
        this.hasPermission = true
        this.alertService.presentToast('Notificaciones activadas')
      } else {
        this.hasPermission = false
      }
    })

    modal.onDidDismiss().then(() => {
      setTimeout(() => {
        this.back = this.platform.backButton.subscribeWithPriority(9999, () => this.regresar())
      }, 100)
    })

    return await modal.present()
  }

    // Salida
  async regresar() {
    if (this.pedido.cancelado_by_negocio) this.pedidoService.removePedidoCancelado(this.pedido)
    // if (this.map) this.map.remove()
    if (this.back) this.back.unsubscribe()
    if (this.msgSub) this.msgSub.unsubscribe()
    if (this.pedidoSub) this.pedidoSub.unsubscribe()
    if (this.canceladoSub) this.canceladoSub.unsubscribe()
    if (this.ubicacionSub) this.ubicacionSub.unsubscribe()
    if (this.entregadoSub) this.entregadoSub.unsubscribe()
    if (this.repartidorSub) this.repartidorSub.unsubscribe()
    this.pedidoService.trackAvances(this.pedido.id).query.ref.off('child_added')
    this.router.navigate(['/home'], { replaceUrl: true })
  }

  ionViewWillLeave() {
    if (this.back) this.back.unsubscribe()
  }

}
